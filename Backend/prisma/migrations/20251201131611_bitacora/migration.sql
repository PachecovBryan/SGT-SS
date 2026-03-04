-- CreateTable
CREATE TABLE "Bitacora" (
    "id" SERIAL NOT NULL,
    "accion" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "detalle" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bitacora_pkey" PRIMARY KEY ("id")
);
