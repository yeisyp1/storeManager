-- AlterTable
ALTER TABLE "DetalleVenta" ADD COLUMN     "precioUnitario" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Producto" ALTER COLUMN "precioUnitario" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "refreshToken" TEXT;
