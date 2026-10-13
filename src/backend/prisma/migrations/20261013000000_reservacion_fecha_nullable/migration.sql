-- La fecha se define cuando el cliente y el estudio coordinan la sesión.
ALTER TABLE "Reservacion" ALTER COLUMN "fecha" DROP NOT NULL;
