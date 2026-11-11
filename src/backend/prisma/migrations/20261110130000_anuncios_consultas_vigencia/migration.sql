ALTER TABLE "Imagen"
ADD COLUMN "formularioEspecial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "visibleHasta" TIMESTAMPTZ(3);

CREATE TABLE "ConsultaAnuncio" (
    "id" SERIAL NOT NULL,
    "anuncioId" INTEGER NOT NULL,
    "nombre" VARCHAR(140) NOT NULL,
    "whatsapp" VARCHAR(40) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsultaAnuncio_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ConsultaAnuncio_anuncioId_createdAt_idx" ON "ConsultaAnuncio"("anuncioId", "createdAt");
ALTER TABLE "ConsultaAnuncio" ADD CONSTRAINT "ConsultaAnuncio_anuncioId_fkey"
FOREIGN KEY ("anuncioId") REFERENCES "Imagen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
