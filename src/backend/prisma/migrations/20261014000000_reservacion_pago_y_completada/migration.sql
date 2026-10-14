ALTER TYPE "EstadoReservacion" ADD VALUE 'COMPLETADA';

CREATE TYPE "EstadoPagoReservacion" AS ENUM ('PENDIENTE', 'PAGADO');

ALTER TABLE "Reservacion"
ADD COLUMN "estadoPago" "EstadoPagoReservacion" NOT NULL DEFAULT 'PENDIENTE';
