ALTER TABLE "Reservacion"
ADD COLUMN "paqueteId" INTEGER;

CREATE INDEX "Reservacion_paqueteId_idx" ON "Reservacion"("paqueteId");

ALTER TABLE "Reservacion"
ADD CONSTRAINT "Reservacion_paqueteId_fkey"
FOREIGN KEY ("paqueteId") REFERENCES "Paquete"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
