// Valida o conteudo de Dossie.dadosJson antes de renderizar -- e um campo
// Json no Postgres (sem tipo garantido em runtime), gerado por
// src/lib/pipeline/gerar-dossie.ts.

import { z } from "zod";

export const CategoriaPoiSchema = z.enum([
  "praia",
  "mercado",
  "escola",
  "hospital",
  "farmacia",
  "restaurante",
]);

export const PoiComDistanciaSchema = z.object({
  categoria: CategoriaPoiSchema,
  nome: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  distanciaMetros: z.number(),
  tempoAPeMinutos: z.number(),
  tempoDeCarroMinutos: z.number(),
});

export const ArgumentoDeVendaSchema = z.object({
  categoria: z.string(),
  argumento: z.string(),
});

export const DadosDossieSchema = z.object({
  pois: z.array(PoiComDistanciaSchema),
  argumentos: z.array(ArgumentoDeVendaSchema),
});

export type DadosDossie = z.infer<typeof DadosDossieSchema>;

export const DadosExtraidosImovelSchema = z.object({
  fotos: z.array(z.string()).default([]),
});
