const { chromium } = require('playwright');
const fs = require('fs');

async function buscarBidCars(marca, modelo, anoInicio, anoFin) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Navegar a la página principal
  await page.goto('https://bid.cars/en', { waitUntil: 'networkidle' });

  // Si redirige automáticamente, volver
  if (page.url().includes('/search')) {
    console.log('⚠ Redirigido, reintentando...');
    await page.goto('https://bid.cars/en', { waitUntil: 'networkidle' });
  }

  // Interacción con el select de marca
  await page.waitForSelector('#select2-make-container', { timeout: 15000 });
  await page.click('#select2-make-container');
  await page.waitForSelector('.select2-search__field', { timeout: 5000 });
  await page.fill('.select2-search__field', marca);
  await page.keyboard.press('Enter');

  // Interacción con el select de modelo
  await page.waitForSelector('#select2-model-container', { timeout: 10000 });
  await page.click('#select2-model-container');
  await page.waitForSelector('.select2-search__field', { timeout: 5000 });
  await page.fill('.select2-search__field', modelo);
  await page.keyboard.press('Enter');

  // Interacción con año desde
  await page.click('#select2-from-container');
  await page.waitForSelector('.select2-search__field', { timeout: 5000 });
  await page.fill('.select2-search__field', anoInicio.toString());
  await page.keyboard.press('Enter');

  // Interacción con año hasta
  await page.click('#select2-to-container');
  await page.waitForSelector('.select2-search__field', { timeout: 5000 });
  await page.fill('.select2-search__field', anoFin.toString());
  await page.keyboard.press('Enter');

  // Desactivar IAAI
  const iaai = await page.$('input[name="iaai"]');
  if (iaai && await iaai.isChecked()) {
    await iaai.click();
  }

  // Hacer clic en botón de búsqueda
  await page.click('button#show-btn');
  await page.waitForTimeout(5000); // Esperar resultados

  // Extraer resultados visibles
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
  fs.writeFileSync('busqueda-actual.json', JSON.stringify(resultados, null, 2));
  console.log(`✔ Se guardaron ${resultados.length} resultados disponibles en busqueda-actual.json`);
}

// Ejecución de prueba
buscarBidCars('Toyota', '4Runner', 2003, 2005);
