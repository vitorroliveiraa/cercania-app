-- Separa "area" em area_total/area_privativa e adiciona suites,
-- condominio, iptu -- ver prisma/schema.prisma pra justificativa.

ALTER TABLE "imoveis" ADD COLUMN "area_total" DOUBLE PRECISION;
ALTER TABLE "imoveis" ADD COLUMN "area_privativa" DOUBLE PRECISION;
ALTER TABLE "imoveis" ADD COLUMN "suites" INTEGER;
ALTER TABLE "imoveis" ADD COLUMN "condominio" DOUBLE PRECISION;
ALTER TABLE "imoveis" ADD COLUMN "iptu" DOUBLE PRECISION;

-- Backfill: os registros existentes so tinham "area" unica (sem distincao
-- total/privativa) -- copia pro dois campos novos como melhor aproximacao.
UPDATE "imoveis" SET "area_total" = "area", "area_privativa" = "area" WHERE "area" IS NOT NULL;

ALTER TABLE "imoveis" DROP COLUMN "area";
