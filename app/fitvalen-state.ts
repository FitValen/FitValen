export type FitValenRole = "admin" | "member";

export type FitValenState = {
  version: 1;
  profile: {
    displayName: string;
    username: string;
    role: FitValenRole;
  };
  hydration: {
    waterMl: number;
    dailyGoalMl: number;
  };
  workout: {
    completedSets: boolean[];
    weightsKg: number[];
    repetitions: number[];
  };
  routines: Array<{ id: string; name: string; focus: string; day: string; exercises: number }>;
  mealPlans: Array<{ id: string; name: string; goal: string; calories: number; meals: number }>;
  scheduled: Array<{ id: string; title: string; kind: "workout" | "meal"; day: string; time: string }>;
  activity: Array<{
    id: string;
    type: "water" | "workout" | "weight" | "meal";
    message: string;
    createdAt: string;
  }>;
  updatedAt: string;
};

export function createDefaultState(
  displayName: string,
  role: FitValenRole,
): FitValenState {
  const firstName = displayName.trim().split(/\s+/)[0] || "Usuario";
  const username = firstName.toLocaleLowerCase("es-ES").replace(/[^a-z0-9]/g, "");

  return {
    version: 1,
    profile: {
      displayName,
      username: username || "usuario",
      role,
    },
    hydration: {
      waterMl: 1600,
      dailyGoalMl: 2500,
    },
    workout: {
      completedSets: [false, false, false, false],
      weightsKg: [70, 70, 70, 70],
      repetitions: [8, 8, 8, 8],
    },
    routines: [],
    mealPlans: [],
    scheduled: [],
    activity: [],
    updatedAt: new Date().toISOString(),
  };
}
