const { chromium } = require('playwright');
const fs = require('fs');

async function buscarBidCars(marca, modelo, anoInicio, anoFin) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Ir a la página principal con control de redirección
  await page.goto('https://bid.cars/en', { waitUntil: 'domcontentloaded' });
  if (page.url().includes('/search')) {
    console.log('⚠ Redirigido automáticamente a resultados, reintentando...');
    await page.goto('https://bid.cars/en', { waitUntil: 'domcontentloaded' });
  }

  // Esperar a que los elementos de búsqueda estén visibles
  await page.waitForSelector('#select2-make-container', { state: 'visible', timeout: 10000 });
  await page.waitForSelector('#select2-model-container', { state: 'visible', timeout: 10000 });
  await page.waitForSelector('#select2-from-container', { state: 'visible', timeout: 10000 });
  await page.waitForSelector('#select2-to-container', { state: 'visible', timeout: 10000 });

  // Seleccionar la marca
  await page.click('#select2-make-container');
  await page.fill('.select2-search__field', marca);
  await page.keyboard.press('Enter');

  // Seleccionar modelo
  await page.click('#select2-model-container');
  await page.fill('.select2-search__field', modelo);
  await page.keyboard.press('Enter');

  // Seleccionar año desde
  await page.click('#select2-from-container');
  await page.keyboard.type(anoInicio.toString());
  await page.keyboard.press('Enter');

  // Seleccionar año hasta
  await page.click('#select2-to-container');
  await page.keyboard.type(anoFin.toString());
  await page.keyboard.press('Enter');

  // Desactivar IAAI (activar solo Copart)
  const iaaiCheckbox = await page.$('input[name="iaai"]');
  const isChecked = await iaaiCheckbox?.isChecked();
  if (isChecked) {
    await iaaiCheckbox.click();
  }

  // Ejecutar la búsqueda
  await page.click('button:has-text("Show")');
  await page.waitForTimeout(5000); // Esperar que carguen los resultados

  // Extraer los resultados
  const resultados = await page.evaluate(() => {
    const cards = document.querySelectorAll('.vehicle-item');
    const data = [];
    cards.forEach(card => {
      const titulo = card.querySelector('.vehicle-title')?.innerText?.trim();
      const vin = card.querySelector('.vin-text')?.innerText?.trim();
      const precio = card.querySelector('.bid-value')?.innerText?.trim() || 'N/A';
      const ubicacion = card.querySelector('.location')?.innerText?.trim();
      const estado = card.querySelector('.lot-status')?.innerText?.trim();
      const enlace = card.querySelector('.vehicle-title a')?.href;
      const imagen = card.querySelector('.vehicle-image img')?.getAttribute('data-src');

      if (titulo && estado && !['Sold', 'Not Sold', 'Closed', 'Future'].includes(estado)) {
        data.push({ titulo, vin, precio, ubicacion, estado, enlace, imagen });
      }
    });
    return data;
  });

  await browser.close();

  // Guardar en JSON
  fs.writeFileSync('busqueda-actual.json', JSON.stringify(resultados, null, 2));
  console.log(`✔ Se guardaron ${resultados.length} resultados disponibles en busqueda-actual.json`);
}

// Ejemplo de ejecución
buscarBidCars('Toyota', '4Runner', 2003, 2005);
