import express from 'express';
import cors from 'cors';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health route
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // TODO: mount feature routers here later
  // app.use('/recipes', recipesRouter);
  // app.use('/planner', plannerRouter);

  return app;
}
