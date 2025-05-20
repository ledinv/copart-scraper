// copartBuscar.js usando Axios (sin Playwright)
const axios = require('axios');
const fs = require('fs');

async function buscarCopart(marca, modelo, anoInicio, anoFin) {
  const url = 'https://www.copart.com/public/lots/search';

  const params = {
    query: `${marca} ${modelo}`,
    page: 1,
    size: 100,
    // Si querés filtrar por año, tendríamos que revisar cómo se pasa en la API (puedo ayudarte a afinar esto después)
  };

  try {
    const response = await axios.post(url, params, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resultados = response.data.data.results.map(lote => ({
      lote: lote.lotNumberStr,
      ubicacion: `${lote.itemLocation.city}, ${lote.itemLocation.state}`,
      fecha: lote.auctionDate,
      currentBid: lote.currentBid,
      estatus: lote.lotCurrentStatus,
    }));

    fs.writeFileSync('busqueda-actual.json', JSON.stringify(resultados, null, 2));
    console.log('✔ Resultados guardados en busqueda-actual.json');
  } catch (error) {
    console.error('❌ Error buscando en Copart:', error.message);
  }
}

// Llamada de prueba
buscarCopart('Toyota', 'Corolla', 2015, 2020);
