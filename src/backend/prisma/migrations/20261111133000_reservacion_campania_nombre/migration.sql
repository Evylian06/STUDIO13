ALTER TABLE "Reservacion"
ADD COLUMN "campaniaNombre" VARCHAR(140);

UPDATE "Reservacion" AS reserva
SET "campaniaNombre" = campania."titulo"
FROM "Campania" AS campania
WHERE reserva."campaniaId" = campania."id"
  AND reserva."campaniaNombre" IS NULL;
