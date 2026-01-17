import {
  PrismaClient,
  type MeasurementUnit,
  type EffortLevel,
  type WeekDay,
  type DaySlot,
} from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_EMAIL = "dev@lazy-girl.local";
const DEMO_NAME = "LazyGirl Demo User";

type SeedIngredientLine = {
  name: string;
  quantity?: number | null;
  unit?: MeasurementUnit | null;
  notes?: string | null;
};

type SeedRecipe = {
  name: string;
  effortLevel: EffortLevel;
  description?: string | null;
  servings?: number | null;
  prepTime?: number | null;
  cookTime?: number | null;
  instructions?: string[];
  dietCategoryName?: string | null;
  ingredients: SeedIngredientLine[];
};

const WEEK_START_ISO = "2026-01-12T00:00:00.000Z"; // demo week

const recipes: SeedRecipe[] = [
  {
    name: "Ten Minute Chicken Rice",
    effortLevel: "low",
    description: "Quick and minimal-effort chicken rice.",
    servings: 1,
    prepTime: 5,
    cookTime: 10,
    instructions: ["Cook rice", "Pan-fry chicken", "Mix with soy sauce"],
    dietCategoryName: "Balanced",
    ingredients: [
      { name: "rice", quantity: 1, unit: "cup" },
      { name: "chicken breast", quantity: 100, unit: "g" },
      { name: "soy sauce", quantity: 1, unit: "tsp" },
    ],
  },
  {
    name: "Spaghetti Bolognese",
    effortLevel: "medium",
    description: "Simple comfort meal.",
    servings: 2,
    prepTime: 10,
    cookTime: 20,
    instructions: ["Boil spaghetti", "Simmer sauce", "Combine and serve"],
    dietCategoryName: "Balanced",
    ingredients: [
      { name: "spaghetti", quantity: 200, unit: "g" },
      { name: "tomato sauce", quantity: 1, unit: "cup" },
      { name: "minced beef", quantity: 200, unit: "g" },
      { name: "salt to taste", unit: "to_taste" },
    ],
  },
  {
    name: "Lazy Snack Plate",
    effortLevel: "low",
    description: "No-cook snack plate.",
    servings: 1,
    prepTime: 2,
    cookTime: null,
    instructions: ["Assemble on a plate and eat."],
    dietCategoryName: "High Protein",
    ingredients: [
      { name: "greek yoghurt", quantity: 1, unit: "cup" },
      { name: "banana", quantity: 1, unit: "piece" },
      { name: "cocoa powder", quantity: 1, unit: "tsp", notes: "optional" },
    ],
  },
];

async function upsertDietCategory(name: string) {
  return prisma.dietCategory.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

async function ensureRecipe(userId: number, recipe: SeedRecipe) {
  // No unique constraint on (userId, name), so we guard with findFirst
  const existing = await prisma.recipe.findFirst({
    where: { userId, name: recipe.name },
    select: { id: true },
  });

  if (existing) return existing.id;

  const dietCategoryId =
    recipe.dietCategoryName
      ? (await upsertDietCategory(recipe.dietCategoryName)).id
      : null;

  const created = await prisma.recipe.create({
    data: {
      userId,
      name: recipe.name,
      description: recipe.description ?? null,
      servings: recipe.servings ?? null,
      effortLevel: recipe.effortLevel,
      instructions: recipe.instructions ?? [],
      prepTime: recipe.prepTime ?? null,
      cookTime: recipe.cookTime ?? null,
      ...(dietCategoryId != null ? { dietCategoryId } : {}),
      ingredients: {
        create: recipe.ingredients.map((line) => ({
          quantity: line.quantity ?? null,
          unit: line.unit ?? null,
          notes: line.notes ?? null,
          ingredient: {
            connectOrCreate: {
              where: { name: line.name.trim().toLowerCase() },
              create: { name: line.name.trim().toLowerCase() },
            },
          },
        })),
      },
    },
    select: { id: true },
  });

  return created.id;
}

async function ensurePlannerWeek(userId: number, startDateIso: string) {
  const startDate = new Date(startDateIso);

  const week = await prisma.plannerWeek.upsert({
    where: {
      userId_startDate: { userId, startDate },
    },
    update: {},
    create: { userId, startDate },
    select: { id: true },
  });

  // Create full grid entries if missing
  const days: WeekDay[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const slots: DaySlot[] = ["breakfast", "lunch", "snack", "dinner"];

  await prisma.plannerEntry.createMany({
    data: days.flatMap((day) =>
      slots.map((slot) => ({
        weekId: week.id,
        day,
        slot,
      }))
    ),
    skipDuplicates: true,
  });

  return week.id;
}

async function assignSlot(weekId: number, day: WeekDay, slot: DaySlot, recipeId: number) {
  await prisma.plannerEntry.update({
    where: { weekId_day_slot: { weekId, day, slot } },
    data: { recipeId },
  });
}

async function main() {
  // 1) User (matches your auth middleware default email)
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { displayName: DEMO_NAME },
    create: { displayName: DEMO_NAME, email: DEMO_EMAIL, weekStartDay: "sun" },
    select: { id: true },
  });

  // 2) Diet categories (optional but nice)
  await Promise.all([upsertDietCategory("Balanced"), upsertDietCategory("High Protein")]);

  // 3) Recipes
  const recipeIdsByName = new Map<string, number>();
  for (const r of recipes) {
    const id = await ensureRecipe(user.id, r);
    recipeIdsByName.set(r.name, id);
  }

  // 4) Planner week + a few assignments
  const weekId = await ensurePlannerWeek(user.id, WEEK_START_ISO);

  // Pick recipes by name (safe even if IDs change)
  const chickenRiceId = recipeIdsByName.get("Ten Minute Chicken Rice");
  const spaghettiId = recipeIdsByName.get("Spaghetti Bolognese");
  const snackId = recipeIdsByName.get("Lazy Snack Plate");

  if (chickenRiceId) await assignSlot(weekId, "mon", "lunch", chickenRiceId);
  if (spaghettiId) await assignSlot(weekId, "wed", "dinner", spaghettiId);
  if (snackId) await assignSlot(weekId, "fri", "snack", snackId);

  // Done
  console.log("✅ Seed complete");
  console.log(`User: ${DEMO_EMAIL}`);
  console.log(`Planner week startDate: ${WEEK_START_ISO}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
