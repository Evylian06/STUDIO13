CREATE TYPE "TipoImagen" AS ENUM ('GENERAL', 'PUBLICIDAD');

ALTER TABLE "Imagen"
ADD COLUMN "textoBoton" TEXT,
ADD COLUMN "enlace" TEXT,
ADD COLUMN "tipo" "TipoImagen" NOT NULL DEFAULT 'GENERAL';

CREATE INDEX "Imagen_tipo_activo_idx" ON "Imagen"("tipo", "activo");
