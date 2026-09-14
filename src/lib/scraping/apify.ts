// Scraping via Apify (Website Content Crawler) -- plano A.
// Roda fora da infra do app (evita problema de headless browser em
// serverless/Vercel). Plano B (sem Apify) fica em scripts/scrape-playwright.ts,
// pra rodar localmente.

import { ApifyClient } from "apify-client";

export class ErroScrapingApify extends Error {}

export interface ConteudoPaginaRaspada {
  url: string;
  textoBruto: string;
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
  });

  const { items } = await client
    .dataset<{ url: string; text?: string }>(run.defaultDatasetId)
    .listItems();

  const [item] = items;
  if (!item?.text) {
    throw new ErroScrapingApify(
      `Apify nao retornou texto para a URL: ${url}`,
    );
  }

  return { url: item.url ?? url, textoBruto: item.text };
}
