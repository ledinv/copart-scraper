const { chromium } = require('playwright');

(async () => {
  console.log("🟡 Entrando a Copart...");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://www.copart.com/vehicleFinder');

    // Esperar que el campo de año desde esté disponible y hacer clic
    await page.waitForSelector('label:has-text("Year")');
    
    // Click en el dropdown de "Year from"
    const yearFromDropdown = await page.locator('label:has-text("Year")').locator('xpath=..').locator('button');
    await yearFromDropdown.click();
    await page.locator('ul[role="listbox"] >> text=2015').click();

    // Click en el dropdown de "Year to"
    const yearToLabel = await page.locator('label:has-text("To")');
    const yearToDropdown = yearToLabel.locator('xpath=..').locator('button');
    await yearToDropdown.click();
    await page.locator('ul[role="listbox"] >> text=2026').click();

    // Seleccionar marca
    const makeDropdown = await page.getByLabel('Make');
    await makeDropdown.click();
    await page.getByRole('option', { name: 'Acura' }).click();

    // Esperar un momento para cargar modelos
    await page.waitForTimeout(1500);

    // Seleccionar modelo
    const modelDropdown = await page.getByLabel('Model');
    await modelDropdown.click();
    await page.getByRole('option', { name: 'TL' }).click();

    // Esperar botón de búsqueda
    await page.getByRole('button', { name: 'Search' }).click();

    // Esperar los resultados
    await page.waitForSelector('div.search-result');

    console.log("✅ Resultados cargados correctamente.");

    // Puedes capturar y guardar los resultados si lo deseas
    const titles = await page.$$eval('.search-result .lot-desc', elements =>
      elements.map(e => e.textContent.trim())
    );

    console.log("Vehículos encontrados:", titles.length);
    console.log(titles.slice(0, 5)); // Solo muestra los primeros 5

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await browser.close();
  }
})();
