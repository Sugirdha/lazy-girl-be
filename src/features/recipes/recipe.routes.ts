import { Router } from 'express';
import { addRecipe, deleteRecipe, getAllRecipes, getRecipeById, updateRecipe } from './recipe.data';
import { Recipe } from './recipe.types';


type CreateRecipeBody = {
  name: string;
  ingredients: string[];
  effortLevel: Recipe['effortLevel'];
};

export const recipesRouter = Router();

recipesRouter.get('/', async (req, res) => {
    if (!req.currentUser) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    const userId = req.currentUser.id;

    try {
        const data = await getAllRecipes(userId);
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

recipesRouter.get('/:id', async (req, res) => {
    if (!req.currentUser) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    const userId = req.currentUser.id;
    const recipeId = Number(req.params.id);

    if (Number.isNaN(recipeId)) {
        return res.status(400).json({ error: 'Invalid recipe id' });
    }

    try {
        const recipe = await getRecipeById(userId, recipeId);

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
    if (!req.currentUser) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    const userId = req.currentUser.id;
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
        const created = await addRecipe(userId, newRecipe);
        return res.status(201).json(created);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

recipesRouter.patch('/:id', async(req, res) => {
    if (!req.currentUser) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    const userId = req.currentUser.id;
    const recipeId = Number(req.params.id);
    const body: Partial<CreateRecipeBody> = req.body;
    
    if (Number.isNaN(recipeId)) {
        return res.status(400).json({ error: 'Invalid recipe id' });
    }

    try {
        const existingRecipe = await getRecipeById(userId, recipeId);

        if (!existingRecipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        const updatedRecipe: Recipe = {
            ...existingRecipe,
            name: body.name ?? existingRecipe.name,
            ingredients: body.ingredients ?? existingRecipe.ingredients,
            effortLevel: body.effortLevel ?? existingRecipe.effortLevel,
        };

        const success = await updateRecipe(userId, recipeId, updatedRecipe);

        if (!success) {
            return res.status(500).json({ error: 'Failed to update recipe' });
        }

        return res.json(updatedRecipe);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
})

recipesRouter.delete('/:id', async (req, res) => {
    if (!req.currentUser) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    const userId = req.currentUser.id;
    const recipeId = Number(req.params.id);

    if (Number.isNaN(recipeId)) {
        return res.status(400).json({ error: 'Invalid recipe id' });
    }

    try {
        const deleted = await deleteRecipe(userId, recipeId);

        if (!deleted) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        return res.status(204).send();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});