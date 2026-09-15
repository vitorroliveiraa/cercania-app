// Plano B de scraping (sem Apify): roda localmente, nao no Vercel.
// Motivo: Playwright + Chromium nao roda bem em serverless sem pacote
// extra de binario (@sparticuz/chromium) -- ver plano-tecnico-mvp.md secao 2.
// Uso: npx tsx scripts/scrape-playwright.ts <url>

import { chromium } from "playwright";
import { limparHtml } from "@/lib/scraping/limpar-html";

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("Uso: npx tsx scripts/scrape-playwright.ts <url>");
    process.exit(1);
  }

  const browser = await chromium.launch();
  try {
    const pagina = await browser.newPage();
    await pagina.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    const html = await pagina.content();

    const { texto, fotos } = limparHtml(html, url);

    console.log(`--- HTML bruto: ${html.length} chars | texto limpo: ${texto.length} chars (${Math.round((1 - texto.length / html.length) * 100)}% reduzido) ---`);
    console.log(`--- ${fotos.length} foto(s) encontrada(s) ---`);
    console.log(fotos.slice(0, 5).join("\n"));
    console.log("--- Texto limpo (preview) ---");
    console.log(texto.slice(0, 3000));
  } finally {
    await browser.close();
  }
}

main().catch((erro) => {
  console.error("Falha no scraping via Playwright:", erro);
  process.exit(1);
});
