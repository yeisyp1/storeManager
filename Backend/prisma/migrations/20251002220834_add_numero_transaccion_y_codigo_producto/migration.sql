/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[numeroTransaccion]` on the table `Venta` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "codigo" TEXT;

-- AlterTable
ALTER TABLE "Venta" ADD COLUMN     "numeroTransaccion" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigo_key" ON "Producto"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Venta_numeroTransaccion_key" ON "Venta"("numeroTransaccion");
