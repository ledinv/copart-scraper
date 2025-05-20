// copartBuscar.js
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true }); // Headless para producción
  const page = await browser.newPage();

  console.log('🟡 Entrando a Copart...');
  await page.goto('https://www.copart.com/vehicleFinder', { waitUntil: 'domcontentloaded' });

  // Espera a que se abra el dropdown de marcas
  await page.waitForSelector('div#pn_id_15'); // "Make"
  await page.click('div#pn_id_15'); // Abre el dropdown

  // Espera a que cargue el contenedor de marcas
  await page.waitForSelector('ul.p-dropdown-items');

  const marcas = await page.$$eval('ul.p-dropdown-items li', items =>
    items.map(i => i.textContent.trim()).filter(marca => marca && marca !== 'All Makes')
  );

  console.log(`✅ Se extrajeron ${marcas.length} marcas`);

  const modelosPorMarca = {};

  for (const marca of marcas) {
    // Volver a cargar la página por cada iteración
    await page.goto('https://www.copart.com/vehicleFinder', { waitUntil: 'domcontentloaded' });

    // Abrir dropdown de marcas
    await page.waitForSelector('div#pn_id_15');
    await page.click('div#pn_id_15');
    await page.waitForSelector('ul.p-dropdown-items');

    // Elegir marca
    await page.$$eval('ul.p-dropdown-items li', (items, marcaSeleccionada) => {
      const item = items.find(i => i.textContent.trim() === marcaSeleccionada);
      if (item) item.click();
    }, marca);

    // Esperar que cargue el dropdown de modelos
    await page.waitForTimeout(2000); // puede ajustarse si falla por tiempo

    const modelos = await page.$$eval('ul.p-dropdown-items', lists => {
      const lista = lists[1]; // el segundo dropdown es para modelos
      return Array.from(lista.querySelectorAll('li')).map(li => li.textContent.trim()).filter(m => m !== 'All Models');
    });

    modelosPorMarca[marca] = modelos;
    console.log(`➡️ ${marca}: ${modelos.length} modelos`);
  }

  // Guardar ambos JSON
  fs.writeFileSync('marcas-copart.json', JSON.stringify(marcas, null, 2));
  fs.writeFileSync('modelos-copart.json', JSON.stringify(modelosPorMarca, null, 2));

  await browser.close();
  console.log('✅ Extracción completada y guardada en JSON.');
})();
