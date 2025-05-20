const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function buscarBidCars(marca, modelo, anoInicio, anoFin) {
  const url = `https://bid.cars/en/search/results?search-type=filters&status=All&type=Automobile&make=${marca}&model=${modelo}&year-from=${anoInicio}&year-to=${anoFin}&auction-type=Copart`;

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'DNT': '1',
        'Referer': 'https://bid.cars/en/',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000 // 10 segundos por si la carga tarda
    });

    const $ = cheerio.load(html);
    const resultados = [];

    $('.vehicle-item').each((i, el) => {
      const estado = $(el).find('.lot-status').text().trim();
      if (
        estado.toLowerCase().includes('sold') ||
        estado.toLowerCase().includes('not sold') ||
        estado.toLowerCase().includes('future') ||
        estado.toLowerCase().includes('closed')
      ) {
        return; // ignorar vehículos vendidos o inactivos
      }

      const titulo = $(el).find('.vehicle-title').text().trim();
      const vin = $(el).find('.vin-text').text().trim();
      const precio = $(el).find('.current-bid .bid-value').text().trim() || 'N/A';
      const ubicacion = $(el).find('.location').text().trim();
      const enlace = 'https://bid.cars' + $(el).find('.vehicle-title a').attr('href');
      const imagen = $(el).find('.vehicle-image img').attr('data-src') || '';

      resultados.push({
        titulo,
        vin,
        precio,
        ubicacion,
        estado,
        enlace,
        imagen
      });
    });

    fs.writeFileSync('busqueda-actual.json', JSON.stringify(resultados, null, 2));
    console.log(`✔ Se guardaron ${resultados.length} vehículos disponibles en busqueda-actual.json`);
  } catch (error) {
    console.error('❌ Error durante la búsqueda en BidCars:', error.message);
  }
}

// Prueba fija: Toyota 4Runner 2003–2005
buscarBidCars('Toyota', '4runner', 2003, 2005);
