import { Router } from 'express';
import {
  addRecipe,
  deleteRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
} from './recipe.data';
import type { CreateRecipeInput } from './recipe.types';

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
  const body = req.body as Partial<CreateRecipeInput>;

  const ingredientsText =
    typeof body.ingredientsText === 'string'
      ? body.ingredientsText
      : Array.isArray((req.body as any).ingredients)
        ? (req.body as any).ingredients.join('\n')
        : '';

  if (!body.name || !ingredientsText || !body.effortLevel) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!['low', 'medium', 'high'].includes(body.effortLevel)) {
    return res.status(400).json({ error: 'Invalid effort level' });
  }

const input: CreateRecipeInput = {
  name: body.name,
  effortLevel: body.effortLevel,
  ingredientsText,
  ...(body.description !== undefined ? { description: body.description } : {}),
  ...(body.servings !== undefined ? { servings: body.servings } : {}),
  ...(body.instructionsText !== undefined ? { instructionsText: body.instructionsText } : {}),
  ...(body.prepTime !== undefined ? { prepTime: body.prepTime } : {}),
  ...(body.cookTime !== undefined ? { cookTime: body.cookTime } : {}),
  ...(body.dietCategoryId !== undefined ? { dietCategoryId: body.dietCategoryId } : {}),
};

  try {
    const created = await addRecipe(userId, input);
    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

recipesRouter.patch('/:id', async (req, res) => {
  if (!req.currentUser) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  const userId = req.currentUser.id;
  const recipeId = Number(req.params.id);
  const body = req.body as Partial<CreateRecipeInput>;

  if (Number.isNaN(recipeId)) {
    return res.status(400).json({ error: 'Invalid recipe id' });
  }

  if (body.effortLevel && !['low', 'medium', 'high'].includes(body.effortLevel)) {
    return res.status(400).json({ error: 'Invalid effort level' });
  }

  try {
    const existingRecipe = await getRecipeById(userId, recipeId);

    if (!existingRecipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const updatedRecipe = {
      ...existingRecipe,
      name: body.name ?? existingRecipe.name,
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
});

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
