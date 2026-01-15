import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import type { CreateRecipeInput, Recipe } from './recipe.types';
import { parseIngredientsBlock } from './ingredientParser';

const recipeInclude = {
  ingredients: {
    include: {
      ingredient: true,
    },
    orderBy: {
      ingredientId: 'asc' as const,
    },
  },
};

type RecipeWithIngredients = Prisma.RecipeGetPayload<{
  include: typeof recipeInclude;
}>;

const mapRecipe = (recipe: RecipeWithIngredients): Recipe => ({
  id: recipe.id,
  name: recipe.name,
  ingredients: recipe.ingredients.map((ri) => ri.ingredient.name),
  effortLevel: recipe.effortLevel,
});

export async function getAllRecipes(userId: number): Promise<Recipe[]> {
  const recipes = await prisma.recipe.findMany({
    include: recipeInclude,
    orderBy: {
      id: 'asc',
    },
    where: { userId },
  });

  return recipes.map(mapRecipe);
}

export async function getRecipeById(
  userId: number,
  recipeId: number
): Promise<Recipe | undefined> {
  const recipe = await prisma.recipe.findUnique({
    where: {
      id: recipeId,
      userId,
    },
    include: recipeInclude,
  });

  return recipe ? mapRecipe(recipe) : undefined;
}

export async function addRecipe(userId: number, input: CreateRecipeInput): Promise<Recipe> {
  console.log('Adding recipe with input:', input);
  const parsed = parseIngredientsBlock(input.ingredientsText);

  const ingredientCreates = parsed.lines
    .filter((line) => line.rawText.trim().length > 0)
    .map((line) => {
      const canonicalName = line.ingredientName?.trim() || line.rawText.trim();

      return {
        quantity: line.quantity ?? null,
        unit: line.unit ?? null,
        notes: line.notes ?? null,
        ingredient: {
          connectOrCreate: {
            where: { name: canonicalName },
            create: { name: canonicalName },
          },
        },
      };
    });

  const instructionsArray =
    input.instructionsText
      ?.split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0) ?? [];

  const recipe = await prisma.recipe.create({
    data: {
      user: { connect: { id: userId } },

      name: input.name,
      description: input.description ?? null,
      servings: input.servings ?? null,
      effortLevel: input.effortLevel,
      prepTime: input.prepTime ?? null,
      cookTime: input.cookTime ?? null,
      ...(input.dietCategoryId != null
        ? { dietCategory: { connect: { id: input.dietCategoryId } } }
        : {}),
      instructions: instructionsArray,

      ingredients: {
        create: ingredientCreates,
      },
    },
    include: recipeInclude,
  });

  return mapRecipe(recipe);
}

export async function updateRecipe(userId: number, recipeId: number, input: Recipe): Promise<boolean> {
  const result = await prisma.recipe.update({
    where: { id: recipeId, userId },
    data: {
      name: input.name,
      effortLevel: input.effortLevel,
      ingredients: {
        deleteMany: {},
        create: input.ingredients.map((name: string) => ({
          ingredient: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
  });

  return result.id === recipeId;
}

export async function deleteRecipe(userId: number, recipeId: number): Promise<boolean> {
  const result = await prisma.recipe.deleteMany({
    where: { id: recipeId, userId },
  });

  return result.count > 0;
}
