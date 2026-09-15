// Orquestra o motor de dados: URL do anuncio -> scraping (Apify) ->
// limpeza do HTML -> extracao estruturada (Claude) -> geocoding (Nominatim)
// -> registro no banco. Scraping via Playwright local (plano B) fica fora
// deste pipeline -- ver scripts/scrape-playwright.ts.

import { prisma } from "@/lib/prisma";
import { rasparAnuncioViaApify } from "@/lib/scraping/apify";
import { limparHtml } from "@/lib/scraping/limpar-html";
import { extrairDadosImovel } from "@/lib/extracao/imovel";
import { geocodificarEndereco } from "@/lib/geocoding/nominatim";
import type { Imovel } from "@/generated/prisma/client";

export async function importarImovelPorUrl(url: string): Promise<Imovel> {
  const { html } = await rasparAnuncioViaApify(url);
  const { texto, fotos } = limparHtml(html, url);
  const dadosExtraidos = await extrairDadosImovel(texto);
  const geocoding = await geocodificarEndereco(dadosExtraidos.endereco);

  return prisma.imovel.create({
    data: {
      urlOrigem: url,
      endereco: geocoding.enderecoNormalizado,
      latitude: geocoding.latitude,
      longitude: geocoding.longitude,
      preco: dadosExtraidos.preco,
      areaTotal: dadosExtraidos.areaTotal,
      areaPrivativa: dadosExtraidos.areaPrivativa,
      quartos: dadosExtraidos.quartos,
      suites: dadosExtraidos.suites,
      vagas: dadosExtraidos.vagas,
      condominio: dadosExtraidos.condominio,
      iptu: dadosExtraidos.iptu,
      dadosExtraidos: { ...dadosExtraidos, fotos },
    },
  });
}
