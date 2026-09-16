import { NextResponse } from "next/server";
import { z } from "zod";
import { importarImovelPorUrl } from "@/lib/pipeline/importar-imovel";
import { autorizarFerramentaInterna } from "@/lib/auth/ferramenta-interna";

const CorpoRequisicaoSchema = z.object({
  url: z.string().url(),
});

export async function POST(requisicao: Request) {
  const erroDeAutorizacao = autorizarFerramentaInterna(requisicao);
  if (erroDeAutorizacao) return erroDeAutorizacao;

  const corpo = await requisicao.json().catch(() => null);
  const resultado = CorpoRequisicaoSchema.safeParse(corpo);

  if (!resultado.success) {
    return NextResponse.json(
      { erro: "URL invalida." },
      { status: 400 },
    );
  }

  try {
    const imovel = await importarImovelPorUrl(resultado.data.url);
    return NextResponse.json({ imovel }, { status: 201 });
  } catch (erro) {
    console.error("Falha ao importar imovel:", erro);
    return NextResponse.json(
      { erro: "Nao foi possivel processar esse anuncio." },
      { status: 500 },
    );
  }
}
