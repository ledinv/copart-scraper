// buscarCopart.js usando Playwright (simulando navegador real)
const { chromium } = require('playwright');
const fs = require('fs');

async function buscarBidCars(marca, modelo, anoInicio, anoFin) {
  const url = `https://bid.cars/en/search/results?search-type=filters&status=All&type=Automobile&make=${marca}&model=${modelo}&year-from=${anoInicio}&year-to=${anoFin}&auction-type=Copart`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // espera para que cargue todo

    const resultados = await page.evaluate(() => {
      const vehiculos = [];
      const elementos = document.querySelectorAll('.vehicle-item');

      elementos.forEach(el => {
        const estado = el.querySelector('.lot-status')?.innerText.trim().toLowerCase();
        if (estado?.includes('sold') || estado?.includes('not sold') || estado?.includes('closed') || estado?.includes('future')) return;

        const titulo = el.querySelector('.vehicle-title')?.innerText.trim();
        const vin = el.querySelector('.vin-text')?.innerText.trim();
        const precio = el.querySelector('.current-bid .bid-value')?.innerText.trim() || 'N/A';
        const ubicacion = el.querySelector('.location')?.innerText.trim();
        const enlace = 'https://bid.cars' + (el.querySelector('.vehicle-title a')?.getAttribute('href') || '');
        const imagen = el.querySelector('.vehicle-image img')?.getAttribute('data-src') || '';

        vehiculos.push({ titulo, vin, precio, ubicacion, estado, enlace, imagen });
      });

      return vehiculos;
    });

    fs.writeFileSync('busqueda-actual.json', JSON.stringify(resultados, null, 2));
    console.log(`✔ Se guardaron ${resultados.length} resultados disponibles en busqueda-actual.json`);
  } catch (error) {
    console.error('❌ Error durante la búsqueda en BidCars:', error.message);
  } finally {
    await browser.close();
  }
}

// Prueba fija: Toyota 4Runner 2003–2005
buscarBidCars('Toyota', '4runner', 2003, 2005);
