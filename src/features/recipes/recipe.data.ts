import { Recipe } from "./recipe.types";

const recipes: Recipe[] = [
    {
        id: 1,
        name: "Spaghetti Bolognese",
        ingredients: ["spaghetti", "ground beef", "tomato sauce", "onion", "garlic"],
        effortLevel: "medium",
    },
    {
        id: 2,
        name: "Caesar Salad",
        ingredients: ["romaine lettuce", "croutons", "parmesan cheese", "Caesar dressing"],
        effortLevel: "low",
    },
    {
        id: 3,
        name: "Beef Wellington",
        ingredients: ["beef tenderloin", "mushrooms", "prosciutto", "puff pastry", "egg wash"],
        effortLevel: "high",
    },
];

export function getAllRecipes(): Recipe[] {
    return recipes;
}

export function getRecipeById(id: number): Recipe | undefined {
    return recipes.find(r => r.id === id);
}

export function addRecipe(input: Omit<Recipe, 'id'>): Recipe {
    const newRecipe: Recipe = {id: recipes.length + 1, ...input};
    recipes.push(newRecipe);

    return newRecipe;
}