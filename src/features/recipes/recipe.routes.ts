import { Router } from 'express';
import { addRecipe, getAllRecipes, getRecipeById } from './recipe.data';
import { Recipe } from './recipe.types';


type CreateRecipeBody = {
  name: string;
  ingredients: string[];
  effortLevel: Recipe['effortLevel'];
};

export const recipesRouter = Router();

recipesRouter.get('/', async (_req, res) => {
    try {
        const data = await getAllRecipes();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

recipesRouter.get('/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid recipe id' });
    }

    try {
        const recipe = await getRecipeById(id);

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        
        return res.json(recipe);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

recipesRouter.post('/', async (req, res) => {
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

    try {
        const created = await addRecipe(newRecipe);
        return res.status(201).json(created);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
