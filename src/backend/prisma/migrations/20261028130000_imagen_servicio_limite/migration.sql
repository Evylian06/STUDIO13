ALTER TABLE "Imagen" ADD COLUMN "servicioId" INTEGER;

-- Link only GENERAL images whose existing section matches exactly one service name.
-- Unmatched and ambiguous records remain untouched with servicioId = NULL.
WITH "CoincidenciasServicio" AS (
    SELECT
        i."id" AS "imagenId",
        MIN(s."id") AS "servicioId",
        COUNT(s."id") AS "cantidad"
    FROM "Imagen" i
    INNER JOIN "Servicio" s
        ON LOWER(BTRIM(i."seccion")) = LOWER(BTRIM(s."nombre"))
    WHERE i."tipo" = 'GENERAL'
    GROUP BY i."id"
)
UPDATE "Imagen" i
SET "servicioId" = c."servicioId"
FROM "CoincidenciasServicio" c
WHERE i."id" = c."imagenId"
  AND c."cantidad" = 1;

CREATE INDEX "Imagen_tipo_servicioId_idx" ON "Imagen"("tipo", "servicioId");

ALTER TABLE "Imagen"
ADD CONSTRAINT "Imagen_servicioId_fkey"
FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
