/*
  Warnings:

  - The primary key for the `RecipeIngredient` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `RecipeIngredient` table. All the data in the column will be lost.
  - Added the required column `ingredientId` to the `RecipeIngredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RecipeIngredient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecipeIngredient"
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ingredientId" INTEGER,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "quantity" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "RecipeIngredient" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_name_key" ON "Ingredient"("name");

-- Insert distinct ingredient names from RecipeIngredient into Ingredient
INSERT INTO "Ingredient" ("name", "createdAt", "updatedAt")
SELECT DISTINCT "name", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "RecipeIngredient";

-- Link RecipeIngredient rows to Ingredient rows
UPDATE "RecipeIngredient" ri
SET "ingredientId" = i."id"
FROM "Ingredient" i
WHERE ri."name" = i."name";

-- Make ingredientId NOT NULL after backfilling data
ALTER TABLE "RecipeIngredient" 
  ALTER COLUMN "ingredientId" SET NOT NULL;

-- Drop primary key constraint on RecipeIngredient
ALTER TABLE "RecipeIngredient"
  DROP CONSTRAINT "RecipeIngredient_pkey";

-- Drop columns id and name from RecipeIngredient
ALTER TABLE "RecipeIngredient" 
  DROP COLUMN "id",
  DROP COLUMN "name";

-- Add new primary key constraint on (recipeId, ingredientId)
ALTER TABLE "RecipeIngredient"
  ADD CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("recipeId", "ingredientId");

-- AddForeignKey constraint from RecipeIngredient.ingredientId to Ingredient.id
ALTER TABLE "RecipeIngredient"
  ADD CONSTRAINT "RecipeIngredient_ingredientId_fkey" 
  FOREIGN KEY ("ingredientId")
  REFERENCES "Ingredient"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
