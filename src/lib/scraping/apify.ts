// Scraping via Apify (Website Content Crawler) -- plano A.
// Roda fora da infra do app (evita problema de headless browser em
// serverless/Vercel). Plano B (sem Apify) fica em scripts/scrape-playwright.ts,
// pra rodar localmente.

import { ApifyClient } from "apify-client";

export class ErroScrapingApify extends Error {}

export interface ConteudoPaginaRaspada {
  url: string;
  html: string;
}

export async function rasparAnuncioViaApify(
  url: string,
): Promise<ConteudoPaginaRaspada> {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    throw new ErroScrapingApify(
      "APIFY_TOKEN nao configurado. Use scripts/scrape-playwright.ts como alternativa local.",
    );
  }

  const client = new ApifyClient({ token });

  const run = await client.actor("apify/website-content-crawler").call({
    startUrls: [{ url }],
    maxCrawlPages: 1,
    maxCrawlDepth: 0,
    crawlerType: "playwright:adaptive",
    // O transformer padrao (readability) descarta endereco/fotos/area em
    // sites client-rendered -- validado contra mybroker.com.br (HTML util
    // caiu de dezenas de milhares de chars pra 606). "None" + selector
    // inexistente preserva o HTML renderizado intacto; a limpeza real
    // (script/style/nav/etc) fica por conta de limpar-html.ts.
    htmlTransformer: "none",
    removeElementsCssSelector: "nearby_nao_remover_nada",
    saveHtmlAsFile: true,
  });

  const { items } = await client
    .dataset<{ url: string; htmlUrl?: string }>(run.defaultDatasetId)
    .listItems();

  const [item] = items;
  if (!item?.htmlUrl) {
    throw new ErroScrapingApify(`Apify nao retornou HTML para a URL: ${url}`);
  }

  const respostaHtml = await fetch(item.htmlUrl);
  if (!respostaHtml.ok) {
    throw new ErroScrapingApify(
      `Falha ao baixar HTML armazenado pelo Apify (${respostaHtml.status}) para: ${url}`,
    );
  }

  return { url: item.url ?? url, html: await respostaHtml.text() };
}
