ALTER TABLE "Reservacion"
ADD COLUMN "campaniaId" INTEGER;

CREATE INDEX "Reservacion_campaniaId_idx" ON "Reservacion"("campaniaId");

ALTER TABLE "Reservacion"
ADD CONSTRAINT "Reservacion_campaniaId_fkey"
FOREIGN KEY ("campaniaId") REFERENCES "Campania"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
