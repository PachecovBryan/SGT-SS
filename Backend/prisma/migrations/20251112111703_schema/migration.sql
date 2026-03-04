-- CreateTable
CREATE TABLE "Carrera" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Carrera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estatus" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Estatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personal_Academico" (
    "id" SERIAL NOT NULL,
    "nombre_completo" TEXT NOT NULL,
    "nombramiento" TEXT,

    CONSTRAINT "Personal_Academico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cargos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Cargos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alumnos" (
    "no_cuenta" TEXT NOT NULL,
    "nombre_completo" TEXT NOT NULL,
    "folio_tesis" TEXT NOT NULL,
    "tema_tesis" TEXT NOT NULL,
    "fecha_aceptacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "carrera_id" INTEGER NOT NULL,
    "estatus_id" INTEGER NOT NULL,

    CONSTRAINT "Alumnos_pkey" PRIMARY KEY ("no_cuenta")
);

-- CreateTable
CREATE TABLE "Comite_Tesista" (
    "id" SERIAL NOT NULL,
    "alumno_no_cuenta" TEXT NOT NULL,
    "personal_id" INTEGER NOT NULL,
    "cargo_id" INTEGER NOT NULL,

    CONSTRAINT "Comite_Tesista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roles" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuarios" (
    "no_empleado" TEXT NOT NULL,
    "nombre_completo" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol_id" INTEGER NOT NULL,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("no_empleado")
);

-- CreateIndex
CREATE UNIQUE INDEX "Carrera_nombre_key" ON "Carrera"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Estatus_nombre_key" ON "Estatus"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Cargos_nombre_key" ON "Cargos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Alumnos_folio_tesis_key" ON "Alumnos"("folio_tesis");

-- CreateIndex
CREATE UNIQUE INDEX "Roles_nombre_key" ON "Roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_correo_key" ON "Usuarios"("correo");

-- AddForeignKey
ALTER TABLE "Alumnos" ADD CONSTRAINT "Alumnos_carrera_id_fkey" FOREIGN KEY ("carrera_id") REFERENCES "Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alumnos" ADD CONSTRAINT "Alumnos_estatus_id_fkey" FOREIGN KEY ("estatus_id") REFERENCES "Estatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comite_Tesista" ADD CONSTRAINT "Comite_Tesista_alumno_no_cuenta_fkey" FOREIGN KEY ("alumno_no_cuenta") REFERENCES "Alumnos"("no_cuenta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comite_Tesista" ADD CONSTRAINT "Comite_Tesista_personal_id_fkey" FOREIGN KEY ("personal_id") REFERENCES "Personal_Academico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comite_Tesista" ADD CONSTRAINT "Comite_Tesista_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "Cargos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
