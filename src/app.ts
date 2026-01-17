import express from 'express';
import cors from 'cors';
import { recipesRouter } from './features/recipes/recipe.routes';
import { plannerRouter } from './features/planner/planner.routes';
import { authMiddleware } from './middleware/authMiddleware';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:4321',
      'https://lazy-girl-be.vercel.app',
    ],
    credentials: true,
  }));
  app.use(express.json());

  // Apply authentication middleware
  app.use(authMiddleware);

  // Health route
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Feature routes
  app.use('/recipes', recipesRouter);
  app.use('/planner', plannerRouter);

  app.use(errorHandler);


  return app;
}
