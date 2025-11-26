import type { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      // TODO: This will be filled by real auth later.
      currentUser?: Pick<User, 'id' | 'email'>;
    }
  }
}

export {};
