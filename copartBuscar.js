const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🟡 Entrando a Copart...');
  await page.goto('https://www.copart.com/vehicleFinder', { waitUntil: 'domcontentloaded' });

  // Esperar a que el filtro de año esté visible
  await page.waitForSelector('label:has-text("Year")', { timeout: 30000 });

  // Seleccionar Año Desde (ej. 2015)
  await page.locator('label:has-text("Year")').locator('..').locator('span:has-text("2015")').click();
  await page.waitForTimeout(500); // espera breve para abrir dropdown
  await page.locator('li:has-text("2015")').click();

  // Seleccionar Año Hasta (ej. 2023)
  await page.locator('label:has-text("To")').locator('..').locator('span:has-text("2026")').click();
  await page.waitForTimeout(500);
  await page.locator('li:has-text("2023")').click();

  // Esperar que Make esté listo
  await page.locator('label:has-text("Make")').locator('..').locator('span:has-text("All Makes")').click();
  await page.waitForTimeout(500);
  await page.locator('li:has-text("Toyota")').click(); // cambia por otra marca si deseas

  // Esperar que Model esté listo
  await page.locator('label:has-text("Model")').locator('..').locator('span:has-text("All Models")').click();
  await page.waitForTimeout(500);
  await page.locator('li:has-text("Corolla")').click(); // cambia por otro modelo si deseas

  // Hacer clic en el botón Search
  await page.locator('button.btn-green:has-text("Search")').click();
  console.log('✅ Búsqueda enviada');

  await page.waitForLoadState('networkidle'); // esperar que cargue resultados
  await page.screenshot({ path: 'resultados.png' });

  await browser.close();
})();
