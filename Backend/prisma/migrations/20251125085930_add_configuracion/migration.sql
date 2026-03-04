-- CreateTable
CREATE TABLE "Configuracion" (
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("clave")
);
