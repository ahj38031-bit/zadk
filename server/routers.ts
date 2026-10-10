import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { clearTodayMeals, createFrequentMeal, createMeal, deleteFrequentMeal, deleteMeal, getDashboard, getFrequentMeal, recordWeightLog, updateProfile } from "./db";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";
import { calculateNutritionGoals } from "./nutrition";
import { lookupOpenFoodFacts } from "./open-food-facts";
import { ENV } from "./_core/env";

const imageMime = z.enum(["image/jpeg", "image/png", "image/webp"]);
const frequentItemSchema = z.object({ name: z.string().min(1).max(180), portion: z.string().max(180), grams: z.number().int().nonnegative(), calories: z.number().int().nonnegative(), protein: z.number().int().nonnegative(), carbs: z.number().int().nonnegative(), fat: z.number().int().nonnegative(), fiber: z.number().int().nonnegative().optional().default(0), sugar: z.number().int().nonnegative().optional().default(0), sodium: z.number().int().nonnegative().optional().default(0), confidence: z.number().int().min(0).max(100) });

const analysisSchema = {
  type: "object",
  properties: {
    mealName: { type: "string", description: "Short name of the meal in Arabic" },
    mealType: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] },
    calories: { type: "integer", minimum: 0 },
    protein: { type: "integer", minimum: 0 },
    carbs: { type: "integer", minimum: 0 },
    fat: { type: "integer", minimum: 0 },
    fiber: { type: "integer", minimum: 0 },
    sugar: { type: "integer", minimum: 0 },
    sodium: { type: "integer", minimum: 0 },
    confidence: { type: "integer", minimum: 0, maximum: 100 },
    summary: { type: "string", description: "One concise explanation in Arabic" },
    items: { type: "array", items: { type: "string" }, description: "Short list of detected foods" },
    ingredients: {
      type: "array",
      description: "Every visually identifiable ingredient with portion and nutrition estimate",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          portion: { type: "string", description: "Human-readable estimated portion" },
          grams: { type: "integer", minimum: 0 },
          calories: { type: "integer", minimum: 0 },
          protein: { type: "integer", minimum: 0 },
          carbs: { type: "integer", minimum: 0 },
          fat: { type: "integer", minimum: 0 },
          fiber: { type: "integer", minimum: 0 },
          sugar: { type: "integer", minimum: 0 },
          sodium: { type: "integer", minimum: 0 },
          confidence: { type: "integer", minimum: 0, maximum: 100 },
        },
        required: ["name", "portion", "grams", "calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium", "confidence"],
        additionalProperties: false,
      },
    },
    assumptions: { type: "array", items: { type: "string" }, description: "Important assumptions or ambiguities" },
  },
  required: ["mealName", "mealType", "calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium", "confidence", "summary", "items", "ingredients", "assumptions"],
  additionalProperties: false,
} as const;

function getTextContent(content: unknown) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((part) => typeof part === "string" ? part : (part as { text?: string }).text ?? "").join("\n");
  return "";
}

function decodeImageData(imageData: string) {
  const match = imageData.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "صيغة الصورة غير مدعومة" });
  return { mime: match[1], buffer: Buffer.from(match[2], "base64") };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  nutrition: router({
    dashboard: protectedProcedure.query(({ ctx }) => getDashboard(ctx.user.id)),
    calculateGoals: protectedProcedure.input(z.object({
      age: z.number().int().min(10).max(110),
      heightCm: z.number().int().min(80).max(250),
      weightKg: z.number().int().min(20).max(400),
      activityLevel: z.enum(["sedentary", "light", "moderate", "high"]),
      goal: z.enum(["lose", "maintain", "gain"]),
    })).query(({ input }) => calculateNutritionGoals(input)),
    suggestCalorieAdjustment: protectedProcedure.input(z.object({
      currentCalories: z.number().int().min(1200).max(10000),
      progressPercent: z.number().int().min(0).max(100),
      daysRemaining: z.number().int().min(-3650).max(3650).nullable(),
      goal: z.enum(["lose", "maintain", "gain"]),
      adjustmentDirection: z.enum(["lower", "higher"]),
      currentWeightKg: z.number().int().min(20).max(400),
      targetWeightKg: z.number().int().min(20).max(400),
      language: z.enum(["ar", "en", "tr"]).default("ar"),
    })).mutation(async ({ input }) => {
      const isBehind = input.daysRemaining != null && input.daysRemaining <= 30 && input.progressPercent < (input.daysRemaining <= 7 ? 80 : 50);
      if (!isBehind) throw new TRPCError({ code: "BAD_REQUEST", message: "لا حاجة لتعديل السعرات حالياً." });

      const languageName = input.language === "en" ? "English" : input.language === "tr" ? "Turkish" : "Arabic";
      const directionText = input.adjustmentDirection === "lower" ? "خفض السعرات" : "رفع السعرات";
      const suggestionSchema = {
        type: "object",
        properties: {
          suggestedCalories: { type: "integer", minimum: 1200, maximum: 10000 },
          reason: { type: "string", description: "Short, practical explanation in the requested language" },
          focus: { type: "string", description: "One small habit to pair with the adjustment in the requested language" },
        },
        required: ["suggestedCalories", "reason", "focus"],
        additionalProperties: false,
      };
      let response;
      try {
        response = await invokeLLM({
          messages: [
            { role: "system", content: `أنت مساعد تغذية حذر. أعد JSON فقط باللغة ${languageName}. لا تقدم تشخيصاً أو نصيحة طبية. اقترح تعديلاً صغيراً لا يتجاوز 10% من السعرات الحالية، ولا تنزل أبداً عن 1200 سعرة. اجعل السبب عملياً ومشجعاً.` },
            { role: "user", content: `المستخدم أبطأ من جدوله الزمني. السعرات الحالية: ${input.currentCalories}. التقدم: ${input.progressPercent}%. الأيام المتبقية: ${input.daysRemaining}. الهدف: ${input.goal}. الوزن الحالي: ${input.currentWeightKg} كغ، المستهدف: ${input.targetWeightKg} كغ. المطلوب: ${directionText}. اقترح سعراً يومياً جديداً ضمن تعديل صغير، واذكر سبباً وعادة واحدة مساعدة.` },
          ],
          model: ENV.llmModel,
          thinking: { budget_tokens: 512 },
          maxTokens: 500,
          responseFormat: { type: "json_schema", json_schema: { name: "calorie_adjustment", strict: true, schema: suggestionSchema } },
        });
      } catch (error) {
        console.error("[Nutrition] Calorie suggestion failed:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر إنشاء الاقتراح الآن. حاول مرة أخرى." });
      }

      try {
        const parsed = z.object({ suggestedCalories: z.number().int().min(1200).max(10000), reason: z.string().min(1).max(500), focus: z.string().min(1).max(300) }).parse(JSON.parse(getTextContent(response.choices?.[0]?.message?.content)));
        const maxDelta = Math.max(50, Math.round(input.currentCalories * 0.1));
        const lowerBound = input.adjustmentDirection === "lower" ? Math.max(1200, input.currentCalories - maxDelta) : input.currentCalories;
        const upperBound = input.adjustmentDirection === "higher" ? input.currentCalories + maxDelta : input.currentCalories;
        const suggestedCalories = Math.min(upperBound, Math.max(lowerBound, parsed.suggestedCalories));
        return { suggestedCalories, change: suggestedCalories - input.currentCalories, reason: parsed.reason, focus: parsed.focus, safetyNote: input.language === "en" ? "Review this suggestion before applying it." : input.language === "tr" ? "Uygulamadan önce bu öneriyi gözden geçirin." : "راجع الاقتراح قبل تطبيقه." };
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "وصل اقتراح غير مكتمل من المساعد الذكي." });
      }
    }),
    saveProfile: protectedProcedure.input(z.object({
      calorieGoal: z.number().int().min(800).max(10000),
      proteinGoal: z.number().int().min(10).max(500),
      carbsGoal: z.number().int().min(10).max(1000),
      fatGoal: z.number().int().min(5).max(300),
      age: z.number().int().min(10).max(110).nullable().optional(),
      heightCm: z.number().int().min(80).max(250).nullable().optional(),
      weightKg: z.number().int().min(20).max(400).nullable().optional(),
      targetWeightKg: z.number().int().min(20).max(400).nullable().optional(),
      targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
      activityLevel: z.enum(["sedentary", "light", "moderate", "high"]),
      goal: z.enum(["lose", "maintain", "gain"]).default("maintain"),
      useAiCalorieAdjustment: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      const goals = input.age && input.heightCm && input.weightKg
        ? calculateNutritionGoals({ age: input.age, heightCm: input.heightCm, weightKg: input.weightKg, activityLevel: input.activityLevel, goal: input.goal })
        : null;
      const { bmr: _bmr, activityMultiplier: _activityMultiplier, ...calculatedGoals } = goals ?? {};
      const { useAiCalorieAdjustment, ...profileInput } = input;
      const updated = await updateProfile(ctx.user.id, { ...profileInput, ...(goals && !useAiCalorieAdjustment ? calculatedGoals : {}) });
      if (input.weightKg != null) await recordWeightLog(ctx.user.id, input.weightKg);
      return updated;
    }),
    saveHistoryPreferences: protectedProcedure.input(z.object({
      historyMealTypeFilter: z.enum(["all", "breakfast", "lunch", "dinner", "snack"]),
      historyCalorieFilter: z.enum(["all", "under400", "400to700", "over700"]),
      historySortOrder: z.enum(["latest", "caloriesDesc"]),
    })).mutation(({ ctx, input }) => updateProfile(ctx.user.id, input)),
    createFrequentMeal: protectedProcedure.input(z.object({
      name: z.string().trim().min(1).max(180),
      itemsSnapshot: z.string().max(20_000),
      mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
      calories: z.number().int().nonnegative().max(20_000),
      protein: z.number().int().nonnegative().max(2_000),
      carbs: z.number().int().nonnegative().max(2_000),
      fat: z.number().int().nonnegative().max(2_000),
      fiber: z.number().int().nonnegative().max(2_000).default(0),
      sugar: z.number().int().nonnegative().max(2_000).default(0),
      sodium: z.number().int().nonnegative().max(100_000).default(0),
    })).mutation(async ({ ctx, input }) => {
      try {
        const items = z.array(frequentItemSchema).max(100).parse(JSON.parse(input.itemsSnapshot));
        return createFrequentMeal({ ...input, userId: ctx.user.id, itemsSnapshot: JSON.stringify(items) });
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "بيانات الوجبة المتكررة غير صالحة." });
      }
    }),
    deleteFrequentMeal: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteFrequentMeal(ctx.user.id, input.id)),
    logFrequentMeal: protectedProcedure.input(z.object({ id: z.number().int().positive(), mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]) })).mutation(async ({ ctx, input }) => {
      const frequentMeal = await getFrequentMeal(ctx.user.id, input.id);
      if (!frequentMeal) throw new TRPCError({ code: "NOT_FOUND", message: "الوجبة المتكررة غير موجودة." });
      let items: unknown;
      try { items = z.array(frequentItemSchema).max(100).parse(JSON.parse(frequentMeal.itemsSnapshot)); } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر قراءة مكونات الوجبة المتكررة." }); }
      return createMeal({ userId: ctx.user.id, mealName: frequentMeal.name, description: "وجبة متكررة", mealType: input.mealType, calories: frequentMeal.calories, protein: frequentMeal.protein, carbs: frequentMeal.carbs, fat: frequentMeal.fat, fiber: frequentMeal.fiber, sugar: frequentMeal.sugar, sodium: frequentMeal.sodium, confidence: 85, aiSummary: JSON.stringify({ source: "frequent", items }) });
    }),
    lookupBarcode: protectedProcedure.input(z.object({ barcode: z.string().min(8).max(32) })).query(({ input }) => lookupOpenFoodFacts(input.barcode)),
    saveBarcodeMeal: protectedProcedure.input(z.object({
      name: z.string().trim().min(1).max(180),
      brand: z.string().trim().max(180).nullable().optional(),
      mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
      barcode: z.string().regex(/^\d{8,14}$/),
      servingGrams: z.number().int().min(1).max(5000),
      calories: z.number().int().nonnegative().max(20_000),
      protein: z.number().nonnegative().max(2_000),
      carbs: z.number().nonnegative().max(2_000),
      fat: z.number().nonnegative().max(2_000),
      fiber: z.number().nonnegative().max(2_000),
      sugar: z.number().nonnegative().max(2_000),
      sodium: z.number().int().nonnegative().max(100_000),
    })).mutation(({ ctx, input }) => createMeal({
      userId: ctx.user.id,
      mealName: input.name,
      description: input.brand ? `${input.brand} · باركود ${input.barcode}` : `باركود ${input.barcode}`,
      mealType: input.mealType,
      calories: input.calories,
      protein: Math.round(input.protein),
      carbs: Math.round(input.carbs),
      fat: Math.round(input.fat),
      fiber: Math.round(input.fiber),
      sugar: Math.round(input.sugar),
      sodium: input.sodium,
      confidence: 100,
      aiSummary: JSON.stringify({ source: "open-food-facts", barcode: input.barcode, servingGrams: input.servingGrams, brand: input.brand ?? null }),
    })),
    deleteMeal: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteMeal(ctx.user.id, input.id)),
    clearToday: protectedProcedure.mutation(({ ctx }) => clearTodayMeals(ctx.user.id)),
    analyzeMeal: protectedProcedure.input(z.object({
      description: z.string().trim().max(500).optional(),
      imageData: z.string().max(8_000_000).optional(),
      imageMimeType: imageMime.optional(),
      plateSize: z.enum(["small", "medium", "large"]).default("medium"),
    }).refine((value) => Boolean(value.description || value.imageData), { message: "أضف وصفاً أو صورة للوجبة" })).mutation(async ({ ctx, input }) => {
      let imageUrl: string | undefined;
      let imageKey: string | undefined;
      let imagePart: { type: "image_url"; image_url: { url: string; detail: "high" } } | undefined;

      if (input.imageData) {
        const decoded = decodeImageData(input.imageData);
        imagePart = { type: "image_url", image_url: { url: input.imageData, detail: "high" } };
        try {
          const stored = await storagePut(`${ctx.user.id}-meals/meal.${decoded.mime.split("/")[1]}`, decoded.buffer, decoded.mime);
          imageKey = stored.key;
          imageUrl = stored.url;
        } catch (error) {
          console.warn("[Meal] Image storage skipped:", error);
        }
      }

      const prompt = [
        "حلّل هذه الوجبة كخبير رؤية غذائية. أعد JSON فقط مطابقاً للمخطط، ولا تكتب Markdown.",
        "الهدف هو أفضل تقدير عملي للسعرات والماكروز، وليس مجرد تسمية الطبق.",
        "افحص الصورة منهجياً: حدّد كل عنصر ظاهر، طريقة الطهي، الصلصات والزيوت والإضافات المحتملة، ثم قدّر حجم الحصة باستخدام حجم الطبق والأدوات والمقارنة البصرية.",
        `اختيار المستخدم لحجم الطبق هو: ${input.plateSize === "small" ? "صغير" : input.plateSize === "large" ? "كبير" : "متوسط"}. استخدمه كقرينة إضافية للحصة، ولا تتجاهله عند تقدير الغرامات والسعرات.`,
      "قسّم الوجبة إلى ingredients منفصلة. لكل عنصر اذكر اسماً عربياً، حصة بشرية مفهومة، غرامات تقريبية، سعرات وبروتين وكربوهيدرات ودهون وثقة مستقلة.",
        "أعد أيضاً الألياف والسكريات والصوديوم بالجرام/الميليجرام للوجبة ولكل مكوّن، واجعلها أرقاماً صحيحة غير سالبة.",
        "اجعل مجموع العناصر قريباً جداً من إجمالي الوجبة. تحقق أن السعرات منطقية مع الماكروز (4*البروتين + 4*الكربوهيدرات + 9*الدهون)، مع السماح باختلاف بسيط بسبب الألياف والماء.",
        "إذا لم تستطع تمييز عنصر، لا تخترع اسماً؛ استخدم وصفاً عاماً مثل مكوّن غير واضح، وخفّض confidence وأضف السبب في assumptions.",
        "إذا كانت كمية الزيت أو الصلصة غير ظاهرة، قدّرها بحذر وأذكرها في assumptions. لا تفترض أن الطبق منزوع الزيت.",
        "استخدم نطاقاً محافظاً للحصة الظاهرة، وعبّر عن عدم اليقين في confidence وassumptions. لا تقدم نصائح طبية أو تشخيصاً.",
        "اللغة العربية في mealName وsummary وitems وingredients.name وingredients.portion وassumptions.",
        input.description ? `ملاحظة المستخدم هي مصدر مهم للمعلومات غير المرئية: استخدمها لتصحيح أو استكمال الصورة، خصوصاً نوع الزيت والصلصات وطريقة الطهي وحجم الحصة، ولا تتجاهلها. ملاحظة المستخدم: ${input.description}` : "لا توجد ملاحظة نصية؛ اعتمد على الصورة واذكر الافتراضات.",
      ].join("\n");
      const content = imagePart ? [{ type: "text" as const, text: prompt }, imagePart] : prompt;
      let response;
      try {
        response = await invokeLLM({
          messages: [
            { role: "system", content: "أنت خبير تغذية تطبق تقديرات غذائية عملية. أعد JSON صالحاً فقط." },
            { role: "user", content },
          ],
          model: ENV.llmModel,
          thinking: { budget_tokens: 1024 },
          maxTokens: 1800,
          responseFormat: { type: "json_schema", json_schema: { name: "meal_analysis", strict: true, schema: analysisSchema } },
        });
      } catch (error) {
        console.error("[Meal] LLM analysis failed:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر تحليل الوجبة الآن. حاول مرة أخرى." });
      }

      const raw = getTextContent(response.choices?.[0]?.message?.content);
      type MealAnalysis = {
        mealName: string;
        mealType: "breakfast" | "lunch" | "dinner" | "snack";
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
        sugar: number;
        sodium: number;
        confidence: number;
        summary: string;
        items: string[];
        ingredients: Array<{ name: string; portion: string; grams: number; calories: number; protein: number; carbs: number; fat: number; fiber: number; sugar: number; sodium: number; confidence: number }>;
        assumptions: string[];
      };
      let parsed: MealAnalysis;
      try {
        parsed = z.object({
          mealName: z.string(), mealType: z.enum(["breakfast", "lunch", "dinner", "snack"] as const), calories: z.number().int().nonnegative(), protein: z.number().int().nonnegative(), carbs: z.number().int().nonnegative(), fat: z.number().int().nonnegative(), fiber: z.number().int().nonnegative(), sugar: z.number().int().nonnegative(), sodium: z.number().int().nonnegative(), confidence: z.number().int().min(0).max(100), summary: z.string(), items: z.array(z.string()), ingredients: z.array(z.object({ name: z.string(), portion: z.string(), grams: z.number().int().nonnegative(), calories: z.number().int().nonnegative(), protein: z.number().int().nonnegative(), carbs: z.number().int().nonnegative(), fat: z.number().int().nonnegative(), fiber: z.number().int().nonnegative(), sugar: z.number().int().nonnegative(), sodium: z.number().int().nonnegative(), confidence: z.number().int().min(0).max(100) })), assumptions: z.array(z.string()),
        }).parse(JSON.parse(raw));
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "وصلت نتيجة غير مكتملة من محلل الوجبات." });
      }

      const ingredientCalories = parsed.ingredients.reduce((sum, ingredient) => sum + ingredient.calories, 0);
      const calorieMismatch = parsed.calories > 0 ? Math.abs(ingredientCalories - parsed.calories) / parsed.calories : 0;
      const adjustedConfidence = calorieMismatch > 0.35 ? Math.max(25, parsed.confidence - 15) : parsed.confidence;
      const meal = await createMeal({ userId: ctx.user.id, mealName: parsed.mealName.slice(0, 180), description: input.description ?? null, mealType: parsed.mealType, calories: parsed.calories, protein: parsed.protein, carbs: parsed.carbs, fat: parsed.fat, fiber: parsed.fiber, sugar: parsed.sugar, sodium: parsed.sodium, confidence: adjustedConfidence, aiSummary: JSON.stringify({ summary: parsed.summary, items: parsed.items, ingredients: parsed.ingredients, assumptions: parsed.assumptions, calorieMismatch }), imageKey, imageUrl });
      return { meal, analysis: { ...parsed, confidence: adjustedConfidence, calorieMismatch } };
    }),
  }),
});

export type AppRouter = typeof appRouter;
