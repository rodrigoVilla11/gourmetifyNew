/*
  Warnings:

  - You are about to drop the column `orderRef` on the `ProductConsumption` table. All the data in the column will be lost.
  - You are about to drop the column `orderRef` on the `SalesCost` table. All the data in the column will be lost.
  - Added the required column `orderItemId` to the `ProductConsumption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderItemId` to the `SalesCost` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ProductConsumption" DROP CONSTRAINT "ProductConsumption_orderRef_fkey";

-- DropForeignKey
ALTER TABLE "public"."SalesCost" DROP CONSTRAINT "SalesCost_orderRef_fkey";

-- AlterTable
ALTER TABLE "public"."Orders" ALTER COLUMN "status" SET DEFAULT 'OPEN',
ALTER COLUMN "paymentStatus" SET DEFAULT 'UNPAID',
ALTER COLUMN "subtotal" SET DEFAULT 0,
ALTER COLUMN "discountTotal" SET DEFAULT 0,
ALTER COLUMN "total" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."ProductConsumption" DROP COLUMN "orderRef",
ADD COLUMN     "orderItemId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."SalesCost" DROP COLUMN "orderRef",
ADD COLUMN     "orderItemId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "discount" DECIMAL(14,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderPayment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Orders_channel_createdAt_idx" ON "public"."Orders"("channel", "createdAt");

-- CreateIndex
CREATE INDEX "ProductConsumption_orderItemId_idx" ON "public"."ProductConsumption"("orderItemId");

-- CreateIndex
CREATE INDEX "ProductConsumption_productId_idx" ON "public"."ProductConsumption"("productId");

-- CreateIndex
CREATE INDEX "ProductConsumption_ingredientId_idx" ON "public"."ProductConsumption"("ingredientId");

-- CreateIndex
CREATE INDEX "SalesCost_orderItemId_idx" ON "public"."SalesCost"("orderItemId");

-- CreateIndex
CREATE INDEX "SalesCost_productId_idx" ON "public"."SalesCost"("productId");

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderPayment" ADD CONSTRAINT "OrderPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderPayment" ADD CONSTRAINT "OrderPayment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductConsumption" ADD CONSTRAINT "ProductConsumption_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "public"."OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesCost" ADD CONSTRAINT "SalesCost_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "public"."OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
