/*
  Warnings:

  - A unique constraint covering the columns `[userId,startDate]` on the table `PlannerWeek` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `PlannerWeek` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Recipe` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PlannerWeek_startDate_key";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "weekStartDay" "WeekDay" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create default user
INSERT INTO "User" ("id", "displayName", "email", "weekStartDay", "createdAt") 
VALUES (1, 'Default User', 'dev@lazy-girl.local', 'mon', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AlterTable temporarily to allow nulls
ALTER TABLE "PlannerWeek" ADD COLUMN     "userId" INTEGER;

-- AlterTable temporarily to allow nulls
ALTER TABLE "Recipe" ADD COLUMN     "userId" INTEGER;

-- Backfill existing records with default user
UPDATE "PlannerWeek" SET "userId" = 1 WHERE "userId" IS NULL;
UPDATE "Recipe" SET "userId" = 1 WHERE "userId" IS NULL;

-- AlterTable to set NOT NULL constraint
ALTER TABLE "PlannerWeek" ALTER COLUMN     "userId" SET NOT NULL;
ALTER TABLE "Recipe" ALTER COLUMN     "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PlannerWeek_userId_startDate_key" ON "PlannerWeek"("userId", "startDate");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannerWeek" ADD CONSTRAINT "PlannerWeek_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
