-- Adds an optional, unique link from a gallery section to a service.
-- Existing galleries remain unlinked; no names or photos are reassigned.
ALTER TABLE "Galeria" ADD COLUMN "servicioId" INTEGER;

CREATE UNIQUE INDEX "Galeria_servicioId_key" ON "Galeria"("servicioId");

ALTER TABLE "Galeria"
ADD CONSTRAINT "Galeria_servicioId_fkey"
FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
