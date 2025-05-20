const { chromium } = require('playwright');
const fs = require('fs');

async function buscarBidCars(marca, modelo, anoInicio, anoFin) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Entrar a la página y evitar redirección prematura
  await page.goto('https://bid.cars/en', { waitUntil: 'domcontentloaded' });

  // Si fue redirigido directamente a /search, volver a intentar
  if (page.url().includes('/search')) {
    console.log('⚠ Redirigido automáticamente a resultados, reintentando...');
    await page.goto('https://bid.cars/en', { waitUntil: 'domcontentloaded' });
  }

  // Esperar selectores visibles
  await page.waitForSelector('#select2-make-container', { state: 'visible', timeout: 15000 });

  // Marca
  await page.click('#select2-make-container');
  await page.fill('.select2-search__field', marca);
  await page.keyboard.press('Enter');

  // Modelo
  await page.click('#select2-model-container');
  await page.fill('.select2-search__field', modelo);
  await page.keyboard.press('Enter');

  // Año desde
  await page.click('#select2-from-container');
  await page.fill('.select2-search__field', anoInicio.toString());
  await page.keyboard.press('Enter');

  // Año hasta
  await page.click('#select2-to-container');
  await page.fill('.select2-search__field', anoFin.toString());
  await page.keyboard.press('Enter');

  // Desactivar IAAI
  const iaai = await page.$('input[name="iaai"]');
  if (iaai && await iaai.isChecked()) {
    await iaai.click();
  }

  // Hacer búsqueda
  await page.click('#show-btn');
  await page.waitForTimeout(5000); // esperar que cargue

  // Extraer resultados
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

// Prueba directa
buscarBidCars('Toyota', '4Runner', 2003, 2005);
