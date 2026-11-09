BEGIN;

CREATE TABLE "Campania" (
  "id" SERIAL NOT NULL,
  "titulo" VARCHAR(140) NOT NULL,
  "descripcion" TEXT NOT NULL,
  "imagenUrl" TEXT NOT NULL,
  "publicId" TEXT,
  "inicio" TIMESTAMPTZ(3) NOT NULL,
  "fin" TIMESTAMPTZ(3) NOT NULL,
  "habilitada" BOOLEAN NOT NULL DEFAULT false,
  "paqueteId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Campania_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Campania_paqueteId_fkey" FOREIGN KEY ("paqueteId") REFERENCES "Paquete"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Campania_habilitada_inicio_fin_idx" ON "Campania"("habilitada", "inicio", "fin");
CREATE INDEX "Campania_paqueteId_idx" ON "Campania"("paqueteId");

COMMIT;
