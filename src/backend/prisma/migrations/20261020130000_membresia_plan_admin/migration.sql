CREATE TYPE "PeriodoPlanMembresia" AS ENUM ('MENSUAL', 'TRIMESTRAL', 'ANUAL');

ALTER TABLE "PlanMembresia"
ADD COLUMN "periodo" "PeriodoPlanMembresia" NOT NULL DEFAULT 'MENSUAL',
ADD COLUMN "limiteSesiones" INTEGER,
ADD COLUMN "imagenUrl" TEXT,
ADD COLUMN "publicId" TEXT,
ADD COLUMN "archivado" BOOLEAN NOT NULL DEFAULT false;

UPDATE "PlanMembresia"
SET "periodo" = CASE
  WHEN "duracionDias" >= 350 THEN 'ANUAL'::"PeriodoPlanMembresia"
  WHEN "duracionDias" >= 80 THEN 'TRIMESTRAL'::"PeriodoPlanMembresia"
  ELSE 'MENSUAL'::"PeriodoPlanMembresia"
END;

CREATE TABLE "PlanMembresiaBeneficio" (
  "id" SERIAL NOT NULL,
  "nombre" TEXT NOT NULL,
  "orden" INTEGER NOT NULL DEFAULT 0,
  "planId" INTEGER NOT NULL,
  CONSTRAINT "PlanMembresiaBeneficio_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlanMembresiaBeneficio_planId_idx" ON "PlanMembresiaBeneficio"("planId");

ALTER TABLE "PlanMembresiaBeneficio"
ADD CONSTRAINT "PlanMembresiaBeneficio_planId_fkey"
FOREIGN KEY ("planId") REFERENCES "PlanMembresia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "PlanMembresiaBeneficio" ("nombre", "orden", "planId")
SELECT trim(item), ordinal - 1, plan."id"
FROM "PlanMembresia" AS plan
CROSS JOIN LATERAL unnest(string_to_array(coalesce(plan."beneficios", ''), E'\n')) WITH ORDINALITY AS item(item, ordinal)
WHERE trim(item) <> '';
