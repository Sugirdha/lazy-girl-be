-- DropForeignKey
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_dietCategoryId_fkey";

-- AlterTable
ALTER TABLE "Recipe" ALTER COLUMN "dietCategoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_dietCategoryId_fkey" FOREIGN KEY ("dietCategoryId") REFERENCES "DietCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
