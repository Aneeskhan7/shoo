-- CreateEnum
CREATE TYPE "ConditionCategory" AS ENUM ('OUTSOLE', 'HEEL_WEAR', 'TOE_BOX', 'CREASES', 'SCRATCHES', 'STAINS', 'LABELS', 'DEFECTS');

-- CreateEnum
CREATE TYPE "ConditionStatus" AS ENUM ('NONE', 'MINIMAL', 'LIGHT', 'MODERATE', 'HEAVY', 'PRESENT');

-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "conditionCategory" "ConditionCategory";

-- CreateTable
CREATE TABLE "product_condition_items" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "category" "ConditionCategory" NOT NULL,
    "status" "ConditionStatus" NOT NULL DEFAULT 'NONE',
    "note" TEXT,

    CONSTRAINT "product_condition_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_condition_items_productId_category_key" ON "product_condition_items"("productId", "category");

-- AddForeignKey
ALTER TABLE "product_condition_items" ADD CONSTRAINT "product_condition_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
