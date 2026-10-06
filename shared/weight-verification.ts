export type WeightVerificationStatus = "excellent" | "close" | "off";

export type WeightVerification = {
  ingredientGrams: number;
  targetGrams: number;
  differenceGrams: number;
  matchPercent: number;
  status: WeightVerificationStatus;
};

export function calculateWeightVerification(
  ingredients: Array<{ grams: number }>,
  targetGrams: number,
): WeightVerification | undefined {
  if (!Number.isFinite(targetGrams) || targetGrams <= 0) return undefined;
  const ingredientGrams = Math.max(0, Math.round(ingredients.reduce((sum, ingredient) => sum + Math.max(0, ingredient.grams), 0)));
  const differenceGrams = ingredientGrams - Math.round(targetGrams);
  const deviation = Math.abs(differenceGrams) / targetGrams;
  const matchPercent = Math.max(0, Math.min(100, Math.round((1 - deviation) * 100)));
  const status: WeightVerificationStatus = deviation <= 0.1 ? "excellent" : deviation <= 0.2 ? "close" : "off";
  return { ingredientGrams, targetGrams: Math.round(targetGrams), differenceGrams, matchPercent, status };
}
