// Extracao de dados estruturados do imovel a partir do texto bruto da
// pagina do anuncio, via Claude. Evita parser fragil por portal -- ver
// mimesis-brain/nearby/docs/decisoes.md.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const DadosImovelExtraidosSchema = z.object({
  endereco: z
    .string()
    .describe("Endereco completo do imovel, o mais especifico possivel"),
  preco: z.number().nullable().describe("Preco de venda ou aluguel, em reais"),
  area: z.number().nullable().describe("Area em metros quadrados"),
  quartos: z.number().int().nullable(),
  vagas: z.number().int().nullable().describe("Vagas de garagem"),
  fotos: z.array(z.string().url()).describe("URLs das fotos do imovel"),
});

export type DadosImovelExtraidos = z.infer<typeof DadosImovelExtraidosSchema>;

export class ErroExtracaoImovel extends Error {}

const FERRAMENTA_EXTRACAO: Anthropic.Tool = {
  name: "registrar_dados_imovel",
  description:
    "Registra os dados estruturados extraidos do anuncio de imovel.",
  input_schema: {
    type: "object",
    properties: {
      endereco: { type: "string" },
      preco: { type: ["number", "null"] },
      area: { type: ["number", "null"] },
      quartos: { type: ["integer", "null"] },
      vagas: { type: ["integer", "null"] },
      fotos: { type: "array", items: { type: "string" } },
    },
    required: ["endereco", "preco", "area", "quartos", "vagas", "fotos"],
  },
};

export async function extrairDadosImovel(
  textoBruto: string,
): Promise<DadosImovelExtraidos> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ErroExtracaoImovel("ANTHROPIC_API_KEY nao configurado.");
  }

  const client = new Anthropic({ apiKey });

  const resposta = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    tools: [FERRAMENTA_EXTRACAO],
    tool_choice: { type: "tool", name: FERRAMENTA_EXTRACAO.name },
    messages: [
      {
        role: "user",
        content: `Extraia os dados estruturados do imovel a partir do texto abaixo, extraido de uma pagina de anuncio imobiliario. Se um campo nao estiver presente no texto, use null (ou array vazio para fotos). Nao invente dados.\n\n---\n${textoBruto.slice(0, 40_000)}`,
      },
    ],
  });

  const blocoFerramenta = resposta.content.find(
    (bloco) => bloco.type === "tool_use",
  );

  if (!blocoFerramenta || blocoFerramenta.type !== "tool_use") {
    throw new ErroExtracaoImovel("Claude nao retornou dados estruturados.");
  }

  const resultado = DadosImovelExtraidosSchema.safeParse(
    blocoFerramenta.input,
  );

  if (!resultado.success) {
    throw new ErroExtracaoImovel(
      `Dados extraidos nao batem com o schema esperado: ${resultado.error.message}`,
    );
  }

  return resultado.data;
}
