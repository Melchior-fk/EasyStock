/*
  Warnings:

  - You are about to drop the column `description` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Product` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "public"."Category" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "description",
DROP COLUMN "unit",
ALTER COLUMN "price" SET DATA TYPE INTEGER;
