// Extracao de dados estruturados do imovel a partir do texto ja limpo da
// pagina do anuncio (ver src/lib/scraping/limpar-html.ts), via Claude.
// Evita parser fragil por portal -- ver mimesis-brain/cercania/docs/decisoes.md.
//
// Fotos NAO sao extraidas aqui: URLs sao dado estrutural (atributo src),
// nao conteudo semantico -- pedir pro LLM adivinhar URL de imagem em meio
// a texto e caro e propenso a erro (um digito errado na query string ja
// quebra a foto). Extraidas deterministicamente via cheerio em limparHtml
// e mescladas pelo chamador (src/lib/pipeline/importar-imovel.ts).
//
// Campos comuns entre portais BR (area total/privativa, suites, condominio,
// IPTU) sao tipados. Tudo mais que aparecer so em alguns sites (andar,
// aceita pet, ano de construcao etc) vai em `caracteristicasAdicionais` --
// guardado pra alimentar analise preditiva futura, sem exigir mudanca de
// schema a cada portal novo com estrutura diferente.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const ValorCaracteristicaSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
]);

export const DadosImovelExtraidosSchema = z.object({
  endereco: z
    .string()
    .describe("Endereco completo do imovel, o mais especifico possivel"),
  preco: z.number().nullable().describe("Preco de venda ou aluguel, em reais"),
  areaTotal: z
    .number()
    .nullable()
    .describe("Area total do imovel em metros quadrados (m2)"),
  areaPrivativa: z
    .number()
    .nullable()
    .describe(
      "Area privativa/util do imovel em metros quadrados (m2) -- se o site so informar uma area (sem distinguir total de privativa), repita o mesmo valor nos dois campos",
    ),
  quartos: z.number().int().nullable(),
  suites: z.number().int().nullable(),
  vagas: z.number().int().nullable().describe("Vagas de garagem"),
  condominio: z
    .number()
    .nullable()
    .describe("Valor mensal do condominio, em reais"),
  iptu: z
    .number()
    .nullable()
    .describe("Valor do IPTU como informado na pagina, em reais"),
  caracteristicasAdicionais: z
    .record(z.string(), ValorCaracteristicaSchema)
    .describe(
      "Outras caracteristicas do imovel encontradas no texto que nao se encaixam nos campos acima (ex: andar, ano de construcao, aceita pet, mobiliado, posicao solar). Chave curta em snake_case, valor direto. Objeto vazio se nao houver nenhuma.",
    ),
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
      areaTotal: { type: ["number", "null"] },
      areaPrivativa: { type: ["number", "null"] },
      quartos: { type: ["integer", "null"] },
      suites: { type: ["integer", "null"] },
      vagas: { type: ["integer", "null"] },
      condominio: { type: ["number", "null"] },
      iptu: { type: ["number", "null"] },
      caracteristicasAdicionais: {
        type: "object",
        additionalProperties: { type: ["string", "number", "boolean"] },
      },
    },
    required: [
      "endereco",
      "preco",
      "areaTotal",
      "areaPrivativa",
      "quartos",
      "suites",
      "vagas",
      "condominio",
      "iptu",
      "caracteristicasAdicionais",
    ],
  },
};

export async function extrairDadosImovel(
  textoLimpo: string,
): Promise<DadosImovelExtraidos> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ErroExtracaoImovel("ANTHROPIC_API_KEY nao configurado.");
  }

  const client = new Anthropic({ apiKey });

  const resposta = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    tools: [FERRAMENTA_EXTRACAO],
    tool_choice: { type: "tool", name: FERRAMENTA_EXTRACAO.name },
    messages: [
      {
        role: "user",
        content: `Extraia os dados estruturados do imovel a partir do texto abaixo, extraido de uma pagina de anuncio imobiliario. Se um campo nao estiver presente no texto, use null (ou objeto vazio para caracteristicasAdicionais). Nao invente dados. Coloque em caracteristicasAdicionais qualquer caracteristica relevante do imovel que nao se encaixe nos outros campos.\n\n---\n${textoLimpo.slice(0, 40_000)}`,
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
