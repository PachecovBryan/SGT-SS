/*
  Warnings:

  - You are about to drop the column `carrera_id` on the `Alumnos` table. All the data in the column will be lost.
  - The primary key for the `Carrera` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Carrera` table. All the data in the column will be lost.
  - You are about to drop the column `personal_id` on the `Comite_Tesista` table. All the data in the column will be lost.
  - The primary key for the `Personal_Academico` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Personal_Academico` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[alumno_no_cuenta,cargo_id]` on the table `Comite_Tesista` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `carrera_clave` to the `Alumnos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clave` to the `Carrera` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personal_no_emp` to the `Comite_Tesista` table without a default value. This is not possible if the table is not empty.
  - Added the required column `no_empleado` to the `Personal_Academico` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Alumnos" DROP CONSTRAINT "Alumnos_carrera_id_fkey";

-- DropForeignKey
ALTER TABLE "Comite_Tesista" DROP CONSTRAINT "Comite_Tesista_alumno_no_cuenta_fkey";

-- DropForeignKey
ALTER TABLE "Comite_Tesista" DROP CONSTRAINT "Comite_Tesista_personal_id_fkey";

-- AlterTable
ALTER TABLE "Alumnos" DROP COLUMN "carrera_id",
ADD COLUMN     "carrera_clave" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Carrera" DROP CONSTRAINT "Carrera_pkey",
DROP COLUMN "id",
ADD COLUMN     "clave" TEXT NOT NULL,
ADD CONSTRAINT "Carrera_pkey" PRIMARY KEY ("clave");

-- AlterTable
ALTER TABLE "Comite_Tesista" DROP COLUMN "personal_id",
ADD COLUMN     "personal_no_emp" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Personal_Academico" DROP CONSTRAINT "Personal_Academico_pkey",
DROP COLUMN "id",
ADD COLUMN     "no_empleado" TEXT NOT NULL,
ADD CONSTRAINT "Personal_Academico_pkey" PRIMARY KEY ("no_empleado");

-- CreateIndex
CREATE UNIQUE INDEX "Comite_Tesista_alumno_no_cuenta_cargo_id_key" ON "Comite_Tesista"("alumno_no_cuenta", "cargo_id");

-- AddForeignKey
ALTER TABLE "Alumnos" ADD CONSTRAINT "Alumnos_carrera_clave_fkey" FOREIGN KEY ("carrera_clave") REFERENCES "Carrera"("clave") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comite_Tesista" ADD CONSTRAINT "Comite_Tesista_alumno_no_cuenta_fkey" FOREIGN KEY ("alumno_no_cuenta") REFERENCES "Alumnos"("no_cuenta") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comite_Tesista" ADD CONSTRAINT "Comite_Tesista_personal_no_emp_fkey" FOREIGN KEY ("personal_no_emp") REFERENCES "Personal_Academico"("no_empleado") ON DELETE RESTRICT ON UPDATE CASCADE;
