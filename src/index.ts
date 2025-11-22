import { createApp } from './app';
import { PORT } from './config';

const app = createApp();
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Lazy Girl backend running on http://localhost:${PORT}`);
});
