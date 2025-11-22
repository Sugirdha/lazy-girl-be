import express from 'express';
import cors from 'cors';
import { recipesRouter } from './features/recipes/recipe.routes';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health route
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Feature routes
  app.use('/recipes', recipesRouter);

  // TODO: mount feature routers here later
  // app.use('/planner', plannerRouter);

  return app;
}
