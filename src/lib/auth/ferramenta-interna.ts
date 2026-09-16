// Autorizacao compartilhada das rotas da ferramenta interna (uso do
// Vitor/Wagner, nao de cliente final) -- senha simples via header,
// comparacao em tempo constante. Ver plano-tecnico-mvp.md secao 3.

import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

function senhasIguais(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

export function autorizarFerramentaInterna(
  requisicao: Request,
): NextResponse | null {
  const segredoConfigurado = process.env.FERRAMENTA_INTERNA_SENHA;
  if (!segredoConfigurado) {
    console.error("FERRAMENTA_INTERNA_SENHA nao configurado.");
    return NextResponse.json({ erro: "Ferramenta indisponivel." }, { status: 500 });
  }

  const senhaRecebida = requisicao.headers.get("x-ferramenta-interna-senha");
  if (!senhaRecebida || !senhasIguais(senhaRecebida, segredoConfigurado)) {
    return NextResponse.json({ erro: "Nao autorizado." }, { status: 401 });
  }

  return null;
}
