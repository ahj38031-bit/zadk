import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
  const now = new Date();
  const user: AuthenticatedUser = {
    id: 42,
    openId: "nutrition-test-user",
    email: "nutrition@example.com",
    name: "Nutrition Test",
    loginMethod: "test",
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("nutrition input validation", () => {
  it("requires a meal description or image", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.nutrition.analyzeMeal({})).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects unrealistic calorie goals before touching the database", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.nutrition.saveProfile({
      calorieGoal: 200,
      proteinGoal: 98,
      carbsGoal: 293,
      fatGoal: 64,
      activityLevel: "moderate",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
