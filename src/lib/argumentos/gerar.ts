// Gera argumentos de venda a partir dos POIs -- implementa o principio
// norteador do PRD (secao 28): nao e lista de dados, e argumento pronto
// (ex: "a 6 min a pe da praia -- otimo pra quem busca lazer"). Usa Sonnet
// (nao Haiku) porque e tarefa mais "criativa" -- extracao factual usa
// Haiku (ver src/lib/extracao/imovel.ts), aqui o custo maior se justifica.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { CategoriaPoi } from "@/lib/pois/overpass";

export interface PoiComDistancia {
  categoria: CategoriaPoi;
  nome: string;
  latitude: number;
  longitude: number;
  distanciaMetros: number;
  tempoAPeMinutos: number;
  tempoDeCarroMinutos: number;
}

const ArgumentoSchema = z.object({
  categoria: z.string(),
  argumento: z
    .string()
    .describe("Frase curta e vendavel, pronta pra usar no dossie"),
});

const ArgumentosGeradosSchema = z.object({
  argumentos: z.array(ArgumentoSchema),
});

export type ArgumentoDeVenda = z.infer<typeof ArgumentoSchema>;

export class ErroGeracaoDeArgumentos extends Error {}

const FERRAMENTA_ARGUMENTOS: Anthropic.Tool = {
  name: "registrar_argumentos_de_venda",
  description: "Registra os argumentos de venda gerados a partir dos POIs.",
  input_schema: {
    type: "object",
    properties: {
      argumentos: {
        type: "array",
        items: {
          type: "object",
          properties: {
            categoria: { type: "string" },
            argumento: { type: "string" },
          },
          required: ["categoria", "argumento"],
        },
      },
    },
    required: ["argumentos"],
  },
};

export async function gerarArgumentosDeVenda(
  pois: PoiComDistancia[],
): Promise<ArgumentoDeVenda[]> {
  if (pois.length === 0) return [];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ErroGeracaoDeArgumentos("ANTHROPIC_API_KEY nao configurado.");
  }

  const client = new Anthropic({ apiKey });

  const listaPois = pois
    .map(
      (p) =>
        `- ${p.categoria}: ${p.nome} (${p.tempoAPeMinutos} min a pé / ${p.tempoDeCarroMinutos} min de carro, ${p.distanciaMetros}m)`,
    )
    .join("\n");

  const resposta = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    tools: [FERRAMENTA_ARGUMENTOS],
    tool_choice: { type: "tool", name: FERRAMENTA_ARGUMENTOS.name },
    messages: [
      {
        role: "user",
        content: `Você é um corretor de imóveis experiente. Abaixo está a lista de pontos de interesse próximos a um imóvel, com distância e tempo estimado. Para CADA item da lista, escreva um argumento de venda curto (uma frase, no máximo ~20 palavras), natural e persuasivo -- não uma lista de dados. Foque no benefício pra quem mora ali, não só no fato. Use acentuação e ortografia corretas do português do Brasil. Exemplo de tom: "a 6 min a pé da praia -- ótimo pra quem busca lazer no fim do dia".\n\nPontos de interesse:\n${listaPois}`,
      },
    ],
  });

  const blocoFerramenta = resposta.content.find(
    (bloco) => bloco.type === "tool_use",
  );

  if (!blocoFerramenta || blocoFerramenta.type !== "tool_use") {
    throw new ErroGeracaoDeArgumentos("Claude nao retornou argumentos.");
  }

  const resultado = ArgumentosGeradosSchema.safeParse(blocoFerramenta.input);

  if (!resultado.success) {
    throw new ErroGeracaoDeArgumentos(
      `Argumentos gerados nao batem com o schema esperado: ${resultado.error.message}`,
    );
  }

  return resultado.data.argumentos;
}
