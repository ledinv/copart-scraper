const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const marca = 'Toyota';
  const modelo = 'Corolla';
  const anioDesde = 2012;
  const anioHasta = 2024;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('🟡 Entrando a Copart...');
  await page.goto('https://www.copart.com/vehicleFinder', { waitUntil: 'networkidle' });

  // Rellenar filtros
  await page.click('text=Make');
  await page.locator('li', { hasText: marca }).click();

  await page.click('text=Model');
  await page.locator('li', { hasText: modelo }).click();

  await page.selectOption('select[formcontrolname="yearFrom"]', String(anioDesde));
  await page.selectOption('select[formcontrolname="yearTo"]', String(anioHasta));

  // Buscar
  await page.click('button:has-text("Search")');
  await page.waitForTimeout(3000);

  console.log('🔍 Cargando resultados...');
  const items = await page.locator('.search-result-content').elementHandles();
  if (items.length === 0) {
    console.log('❌ No se encontraron vehículos.');
    await browser.close();
    return;
  }

  // Extraer primer resultado válido (fecha dentro de 48 horas)
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const fechaTexto = await item.$eval('.sale-date', el => el.textContent.trim());
    const fechaSubasta = new Date(fechaTexto);
    const ahora = new Date();
    const diferenciaHoras = (fechaSubasta - ahora) / (1000 * 60 * 60);

    if (diferenciaHoras > 48 || diferenciaHoras < 0) continue;

    const vin = await item.$eval('.lot-vin span', el => el.textContent.trim());
    const motor = await item.$eval('.lot-engine span', el => el.textContent.trim());
    const ubicacion = await item.$eval('.lot-location span', el => el.textContent.trim());
    const bidText = await item.$eval('.current-bid span', el => el.textContent.trim());
    const currentBid = parseFloat(bidText.replace(/[^\d.]/g, '')) || 0;

    const img = await item.$eval('img', img => img.src);
    const link = await item.$eval('a.lot-link', a => 'https://www.copart.com' + a.getAttribute('href'));

    // Interpretar estado y ciudad
    const [estadoSigla, ...ciudadArr] = ubicacion.split(' - ');
    const ciudad = ciudadArr.join(' ').trim();
    const estado = estadoSigla.trim();

    const primerDigitoVIN = vin.charAt(0);
    const tieneCafta = ['1', '4', '5'].includes(primerDigitoVIN);

    const tipoMotor = motor.toLowerCase().includes('1.5') ? '1.5 INFERIOR' : '1.5 SUPERIOR';

    const resultado = {
      marca,
      modelo,
      vin,
      motor,
      tipoMotor,
      currentBidUSD: currentBid,
      url: link,
      imagen: img,
      estado,
      ciudad,
      tieneCafta
    };

    fs.writeFileSync('busqueda-actual.json', JSON.stringify(resultado, null, 2));
    console.log('✅ Vehículo guardado en busqueda-actual.json');
    break;
  }

  await browser.close();
})();
