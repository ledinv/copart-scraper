// copartBuscar.js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true }); // 🔁 AQUÍ EL CAMBIO
  const page = await browser.newPage();

  await page.goto('https://www.copart.com/vehicleFinder', { waitUntil: 'networkidle' });

  console.log('🟢 Página cargada...');

  await page.waitForTimeout(3000);

  await page.locator('text=All Makes').click();
  await page.waitForSelector('ul.p-dropdown-items', { timeout: 10000 });
  await page.locator('text=TOYOTA').click();

  await page.waitForTimeout(2000);

  await page.locator('text=All Models').click();
  await page.waitForSelector('ul.p-dropdown-items', { timeout: 10000 });
  await page.locator('text=COROLLA').click();

  await page.waitForTimeout(2000);

  await page.locator('text=Year From').click();
  await page.waitForSelector('ul.p-dropdown-items', { timeout: 10000 });
  await page.locator('text=2015').click();

  await page.waitForTimeout(1000);

  await page.locator('text=Year To').click();
  await page.waitForSelector('ul.p-dropdown-items', { timeout: 10000 });
  await page.locator('text=2019').click();

  await page.waitForTimeout(1000);

  await page.locator('button:has-text("Search")').click();

  console.log('🔍 Búsqueda enviada...');

  await page.waitForTimeout(7000);

  const resultados = await page.$$eval('.result-item', items => items.map(i => i.textContent.trim()));
  console.log(`🔧 Resultados encontrados: ${resultados.length}`);

  await browser.close();
})();
