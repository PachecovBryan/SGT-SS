/*
  Warnings:

  - A unique constraint covering the columns `[alumno_no_cuenta,personal_no_emp]` on the table `Comite_Tesista` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Comite_Tesista_alumno_no_cuenta_cargo_id_key";

-- AlterTable
ALTER TABLE "Alumnos" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Bitacora" ADD COLUMN     "entidad" TEXT,
ADD COLUMN     "ref_id" TEXT;

-- AlterTable
ALTER TABLE "Personal_Academico" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Usuarios" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "Comite_Tesista_alumno_no_cuenta_personal_no_emp_key" ON "Comite_Tesista"("alumno_no_cuenta", "personal_no_emp");
