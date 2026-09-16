import { NextResponse } from "next/server";
import { gerarDossie, ErroGeracaoDossie } from "@/lib/pipeline/gerar-dossie";
import { autorizarFerramentaInterna } from "@/lib/auth/ferramenta-interna";

export async function POST(
  requisicao: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const erroDeAutorizacao = autorizarFerramentaInterna(requisicao);
  if (erroDeAutorizacao) return erroDeAutorizacao;

  const { id } = await params;

  try {
    const dossie = await gerarDossie(id);
    return NextResponse.json({ dossie }, { status: 201 });
  } catch (erro) {
    if (erro instanceof ErroGeracaoDossie) {
      return NextResponse.json({ erro: erro.message }, { status: 404 });
    }
    console.error("Falha ao gerar dossie:", erro);
    return NextResponse.json(
      { erro: "Nao foi possivel gerar o dossie." },
      { status: 500 },
    );
  }
}
