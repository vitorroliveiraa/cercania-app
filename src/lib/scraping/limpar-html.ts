// Limpeza do HTML antes de mandar pro Claude -- motivo: custo. HTML bruto
// de pagina de anuncio costuma ter 50k-100k tokens, quase tudo lixo
// (scripts, CSS, nav, footer, trackers). O conteudo util real (endereco,
// preco, area, descricao) e uma fracao pequena disso. Reduzindo aqui, o
// gasto por extracao cai bem antes de chegar na API paga.
//
// Fotos sao coletadas aqui tambem (nao pelo Claude): URL de imagem e dado
// estrutural (atributo src), nao texto -- extrair via DOM e determinístico
// e gratis, pedir pro LLM e caro e sujeito a erro.

import * as cheerio from "cheerio";

const TAGS_DE_RUIDO = [
  "script",
  "style",
  "noscript",
  "nav",
  "header",
  "footer",
  "aside",
  "iframe",
  "svg",
  "form",
];

const ATRIBUTOS_PARA_REMOVER_PREFIXO = ["on", "data-"];
const MAX_FOTOS = 20;

// Paginas de anuncio costumam ter um mapa embutido (Leaflet/Google Maps) --
// os tiles do mapa entram como <img> mas nao sao foto do imovel.
const HOSTS_DE_TILE_DE_MAPA = [
  "tile.openstreetmap.org",
  "tiles.mapbox.com",
  "api.mapbox.com",
  "maps.googleapis.com",
  "maps.gstatic.com",
];

function ehTileDeMapa(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return HOSTS_DE_TILE_DE_MAPA.some((sufixo) => host.endsWith(sufixo));
  } catch {
    return false;
  }
}

export interface HtmlLimpo {
  texto: string;
  fotos: string[];
}

export function limparHtml(htmlBruto: string, urlBase: string): HtmlLimpo {
  const $ = cheerio.load(htmlBruto);

  const containerPrincipal = $("main, article").first();
  const raiz = containerPrincipal.length > 0 ? containerPrincipal : $("body");

  const fotos = new Set<string>();
  raiz.find("img").each((_, img) => {
    const src =
      $(img).attr("src") ?? $(img).attr("data-src") ?? $(img).attr("data-lazy-src");
    if (!src) return;
    try {
      const urlAbsoluta = new URL(src, urlBase).toString();
      if (!ehTileDeMapa(urlAbsoluta)) {
        fotos.add(urlAbsoluta);
      }
    } catch {
      // URL invalida/relativa sem base util -- ignora.
    }
  });

  $("*")
    .contents()
    .each((_, no) => {
      if (no.type === "comment") {
        $(no).remove();
      }
    });

  $(TAGS_DE_RUIDO.join(",")).remove();

  $("*").each((_, elemento) => {
    if (elemento.type !== "tag") return;
    const atributos = Object.keys(elemento.attribs ?? {});
    for (const nome of atributos) {
      const deveRemover = ATRIBUTOS_PARA_REMOVER_PREFIXO.some((prefixo) =>
        nome.toLowerCase().startsWith(prefixo),
      );
      if (deveRemover) {
        $(elemento).removeAttr(nome);
      }
    }
  });

  const texto = raiz
    .text()
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean)
    .join("\n");

  return { texto, fotos: [...fotos].slice(0, MAX_FOTOS) };
}
