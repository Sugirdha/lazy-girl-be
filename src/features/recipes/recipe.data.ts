import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { Recipe } from './recipe.types';

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

export async function getAllRecipes(): Promise<Recipe[]> {
    const recipes = await prisma.recipe.findMany({
        include: recipeInclude,
        orderBy: {
            id: 'asc',
        },
    });

    return recipes.map(mapRecipe);
}

export async function getRecipeById(id: number): Promise<Recipe | undefined> {
    const recipe = await prisma.recipe.findUnique({
        where: { id },
        include: recipeInclude,
    });

    return recipe ? mapRecipe(recipe) : undefined;
}

export async function addRecipe(input: Omit<Recipe, 'id'>): Promise<Recipe> {
    const recipe = await prisma.recipe.create({
        data: {
            name: input.name,
            effortLevel: input.effortLevel,
            ingredients: {
                create: input.ingredients.map((name) => ({ 
                    ingredient: {
                        connectOrCreate: {
                            where: { name },
                            create: { name },
                        },
                    }
                 })),
            },
        },
        include: recipeInclude,
    });

    return mapRecipe(recipe);
}
