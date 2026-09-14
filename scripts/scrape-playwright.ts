// Plano B de scraping (sem Apify): roda localmente, nao no Vercel.
// Motivo: Playwright + Chromium nao roda bem em serverless sem pacote
// extra de binario (@sparticuz/chromium) -- ver plano-tecnico-mvp.md secao 2.
// Uso: npx tsx scripts/scrape-playwright.ts <url>

import { chromium } from "playwright";

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
    const textoBruto = await pagina.evaluate(() => document.body.innerText);

    console.log(`--- Texto extraido de ${url} (${textoBruto.length} chars) ---`);
    console.log(textoBruto.slice(0, 3000));
    console.log("--- (truncado se maior que 3000 chars) ---");
  } finally {
    await browser.close();
  }
}

main().catch((erro) => {
  console.error("Falha no scraping via Playwright:", erro);
  process.exit(1);
});
