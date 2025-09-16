/*
  Warnings:

  - A unique constraint covering the columns `[branchId,ingredientId]` on the table `InventoryItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `branchId` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."InventoryItem" ADD COLUMN     "branchId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_branchId_ingredientId_key" ON "public"."InventoryItem"("branchId", "ingredientId");

-- AddForeignKey
ALTER TABLE "public"."InventoryItem" ADD CONSTRAINT "InventoryItem_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
