CREATE TYPE "CategoriaServicioReservacion" AS ENUM ('SESION', 'ALQUILER', 'TARIFA', 'MEMBRESIAS');

ALTER TABLE "Reservacion"
ADD COLUMN "categoriaServicio" "CategoriaServicioReservacion" NOT NULL DEFAULT 'SESION';

-- Backfill categories from existing package and membership names where possible.
UPDATE "Reservacion" AS reservacion
SET "categoriaServicio" = 'MEMBRESIAS'
WHERE EXISTS (
  SELECT 1
  FROM "PlanMembresia" AS plan
  WHERE lower(trim(plan."nombre")) = lower(trim(reservacion."tipoSesion"))
);

UPDATE "Reservacion" AS reservacion
SET "categoriaServicio" = paquete."seccion"::text::"CategoriaServicioReservacion"
FROM (
  SELECT lower(trim("nombre")) AS nombre_normalizado, min("seccion"::text) AS seccion
  FROM "Paquete"
  GROUP BY lower(trim("nombre"))
  HAVING count(DISTINCT "seccion") = 1
) AS paquete
WHERE lower(trim(reservacion."tipoSesion")) = paquete.nombre_normalizado
  AND reservacion."categoriaServicio" <> 'MEMBRESIAS';

-- Preserve the legacy rental options that were previously submitted by label.
UPDATE "Reservacion"
SET "categoriaServicio" = 'ALQUILER'
WHERE lower(trim("tipoSesion")) IN ('alquiler por hora', 'alquiler medio día', 'alquiler día completo');

CREATE INDEX "Reservacion_categoriaServicio_idx" ON "Reservacion"("categoriaServicio");
