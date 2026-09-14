import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { importarImovelPorUrl } from "@/lib/pipeline/importar-imovel";

function senhasIguais(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

const CorpoRequisicaoSchema = z.object({
  url: z.string().url(),
});

export async function POST(requisicao: Request) {
  const segredoConfigurado = process.env.FERRAMENTA_INTERNA_SENHA;
  if (!segredoConfigurado) {
    console.error("FERRAMENTA_INTERNA_SENHA nao configurado.");
    return NextResponse.json({ erro: "Ferramenta indisponivel." }, { status: 500 });
  }
  const senhaRecebida = requisicao.headers.get("x-ferramenta-interna-senha");
  if (!senhaRecebida || !senhasIguais(senhaRecebida, segredoConfigurado)) {
    return NextResponse.json({ erro: "Nao autorizado." }, { status: 401 });
  }

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
