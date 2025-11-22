import { Router } from "express";
import { addRecipe, getAllRecipes, getRecipeById } from "./recipe.data";
import { Recipe } from "./recipe.types";


type CreateRecipeBody = {
  name: string;
  ingredients: string[];
  effortLevel: Recipe['effortLevel'];
};

export const recipesRouter = Router();

recipesRouter.get('/', (_req, res) => {
    const data = getAllRecipes();
    res.json(data);
});

recipesRouter.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    const recipe = getRecipeById(id);

    if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
    }
    
    return res.json(recipe);
});

recipesRouter.post('/', (req, res) => {
    const body: CreateRecipeBody = req.body;

    if (!body.name || !body.ingredients || !body.effortLevel) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['low', 'medium', 'high'].includes(body.effortLevel)) {
        return res.status(400).json({ error: 'Invalid effort level' });
    }

    const newRecipe: Omit<Recipe, 'id'> = {
        name: body.name,
        ingredients: body.ingredients,
        effortLevel: body.effortLevel,
    };

    const created = addRecipe(newRecipe);

    return res.status(201).json(created);
});