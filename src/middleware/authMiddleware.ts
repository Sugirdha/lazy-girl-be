// TODO: Replace this with real authentication.
// For now, this middleware fakes a logged-in user so that
// routes can rely on req.currentUser and Prisma userId.
 
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const email =
    (req.header('x-user-email') as string | undefined) ??
    'dev@lazy-girl.local';

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { displayName: 'LazyGirl User', email, weekStartDay: 'sun' },
  });

  req.currentUser = { id: user.id, email: user.email };
  next();
}