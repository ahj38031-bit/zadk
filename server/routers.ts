import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { clearTodayMeals, createMeal, deleteMeal, getDashboard, updateProfile } from "./db";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

const imageMime = z.enum(["image/jpeg", "image/png", "image/webp"]);

const analysisSchema = {
  type: "object",
  properties: {
    mealName: { type: "string", description: "Short name of the meal in Arabic" },
    mealType: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] },
    calories: { type: "integer", minimum: 0 },
    protein: { type: "integer", minimum: 0 },
    carbs: { type: "integer", minimum: 0 },
    fat: { type: "integer", minimum: 0 },
    confidence: { type: "integer", minimum: 0, maximum: 100 },
    summary: { type: "string", description: "One concise explanation in Arabic" },
    items: { type: "array", items: { type: "string" } },
  },
  required: ["mealName", "mealType", "calories", "protein", "carbs", "fat", "confidence", "summary", "items"],
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
    saveProfile: protectedProcedure.input(z.object({
      calorieGoal: z.number().int().min(800).max(10000),
      proteinGoal: z.number().int().min(10).max(500),
      carbsGoal: z.number().int().min(10).max(1000),
      fatGoal: z.number().int().min(5).max(300),
      age: z.number().int().min(10).max(110).nullable().optional(),
      heightCm: z.number().int().min(80).max(250).nullable().optional(),
      weightKg: z.number().int().min(20).max(400).nullable().optional(),
      activityLevel: z.enum(["sedentary", "light", "moderate", "high"]),
    })).mutation(({ ctx, input }) => updateProfile(ctx.user.id, input)),
    deleteMeal: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteMeal(ctx.user.id, input.id)),
    clearToday: protectedProcedure.mutation(({ ctx }) => clearTodayMeals(ctx.user.id)),
    analyzeMeal: protectedProcedure.input(z.object({
      description: z.string().trim().max(2000).optional(),
      imageData: z.string().max(8_000_000).optional(),
      imageMimeType: imageMime.optional(),
    }).refine((value) => Boolean(value.description || value.imageData), { message: "أضف وصفاً أو صورة للوجبة" })).mutation(async ({ ctx, input }) => {
      let imageUrl: string | undefined;
      let imageKey: string | undefined;
      let imagePart: { type: "image_url"; image_url: { url: string; detail: "auto" } } | undefined;

      if (input.imageData) {
        const decoded = decodeImageData(input.imageData);
        imagePart = { type: "image_url", image_url: { url: input.imageData, detail: "auto" } };
        try {
          const stored = await storagePut(`${ctx.user.id}-meals/meal.${decoded.mime.split("/")[1]}`, decoded.buffer, decoded.mime);
          imageKey = stored.key;
          imageUrl = stored.url;
        } catch (error) {
          console.warn("[Meal] Image storage skipped:", error);
        }
      }

      const prompt = [
        "حلّل الوجبة التالية كمساعد تغذية دقيق. أعد JSON فقط مطابقاً للمخطط.",
        "استخدم تقديرات معقولة للحصة الظاهرة أو الموصوفة، وكن واضحاً أن القيم تقديرية.",
        "اللغة العربية في mealName وsummary وitems. لا تقدم نصائح طبية أو تشخيصاً.",
        input.description ? `وصف المستخدم: ${input.description}` : "حلّل الصورة المرفقة.",
      ].join("\n");
      const content = imagePart ? [{ type: "text" as const, text: prompt }, imagePart] : prompt;
      let response;
      try {
        response = await invokeLLM({
          model: "gemini-3-flash-preview",
          messages: [
            { role: "system", content: "أنت خبير تغذية تطبق تقديرات غذائية عملية. أعد JSON صالحاً فقط." },
            { role: "user", content },
          ],
          maxTokens: 1200,
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
        confidence: number;
        summary: string;
        items: string[];
      };
      let parsed: MealAnalysis;
      try {
        parsed = z.object({
          mealName: z.string(), mealType: z.enum(["breakfast", "lunch", "dinner", "snack"] as const), calories: z.number().int().nonnegative(), protein: z.number().int().nonnegative(), carbs: z.number().int().nonnegative(), fat: z.number().int().nonnegative(), confidence: z.number().int().min(0).max(100), summary: z.string(), items: z.array(z.string()),
        }).parse(JSON.parse(raw));
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "وصلت نتيجة غير مكتملة من محلل الوجبات." });
      }

      const meal = await createMeal({ userId: ctx.user.id, mealName: parsed.mealName.slice(0, 180), description: input.description ?? null, mealType: parsed.mealType, calories: parsed.calories, protein: parsed.protein, carbs: parsed.carbs, fat: parsed.fat, confidence: parsed.confidence, aiSummary: JSON.stringify({ summary: parsed.summary, items: parsed.items }), imageKey, imageUrl });
      return { meal, analysis: parsed };
    }),
  }),
});

export type AppRouter = typeof appRouter;
