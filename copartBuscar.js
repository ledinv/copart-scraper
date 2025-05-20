// copartBuscar.js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.copart.com/vehicleFinder', { waitUntil: 'networkidle' });

  console.log('🟢 Página cargada...');

  // Esperar un poco para que todo se estabilice
  await page.waitForTimeout(3000);

  // Click en "All Makes"
  await page.locator('text=All Makes').click();
  await page.waitForSelector('ul.p-dropdown-items', { timeout: 10000 });
  await page.locator('text=TOYOTA').click(); // ejemplo: marca Toyota

  await page.waitForTimeout(2000);

  // Click en "All Models"
  await page.locator('text=All Models').click();
  await page.waitForSelector('ul.p-dropdown-items', { timeout: 10000 });
  await page.locator('text=COROLLA').click(); // ejemplo: modelo Corolla

  await page.waitForTimeout(2000);

  // Click en "Year From"
  await page.locator('text=Year From').click();
  await page.waitForSelector('ul.p-dropdown-items', { timeout: 10000 });
  await page.locator('text=2015').click(); // ejemplo año desde

  await page.waitForTimeout(1000);

  // Click en "Year To"
  await page.locator('text=Year To').click();
  await page.waitForSelector('ul.p-dropdown-items', { timeout: 10000 });
  await page.locator('text=2019').click(); // ejemplo año hasta

  await page.waitForTimeout(1000);

  // Click en botón de búsqueda
  await page.locator('button:has-text("Search")').click();

  console.log('🔍 Búsqueda enviada...');

  // Esperar que carguen los resultados (esto podría afinarse mejor)
  await page.waitForTimeout(7000);

  // Aquí puedes extraer información de los resultados
  const resultados = await page.$$eval('.result-item', items => items.map(i => i.textContent.trim()));
  console.log(`🔧 Resultados encontrados: ${resultados.length}`);

  await browser.close();
})();
