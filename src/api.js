import fetch from 'node-fetch'; // Asegúrate de instalar 'node-fetch' con npm
import dotenv from 'dotenv';

dotenv.config();
const USERIOL = process.env.USER;
const PASSIOL = process.env.PASS;

// CANTIDADES
// const cantAL30 = 0;
// const cantAL30D = 1000;
// const cantTX26 = 41783.69;
// const cantTX28 = 6713.40;
// const cantTZX26 = 64137.83;
// const cantDICP = 184.85;
// const cantTLC10 = 0;
// const cantTLC1D = 0;
// const cantYCA60 = 0;
// const cantYCA6P = 0;
// const cantNDT25 = 150;
// const cantNDT5D = 0;
// const cantBBD = 2032;
// const cantPAMP = 465;
// const cantTGS = 500;
// const cantTESL = 57;




async function obtenerToken() {
    const BASE_URL = "https://api.invertironline.com";
    try {
        const response = await fetch(BASE_URL + "/token", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `username=${encodeURIComponent(USERIOL)}&password=${encodeURIComponent(PASSIOL)}&grant_type=password`
        });
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        throw new Error('Error al obtener el token');
    }
}


async function obtenerDatosHistoricos() {
    const token = await obtenerToken();
    const mercado = "BCBA";
    const simbolo = "GGAL";
    const fechaDesde = "2018-06-05";
    const fechaHasta = "2019-02-25";
    const ajustada = "sinAjustar";
    const path = `/api/v2/${mercado}/Titulos/${simbolo}/Cotizacion/seriehistorica/${fechaDesde}/${fechaHasta}/${ajustada}`;
    const apiURL = "https://api.invertironline.com" + path;

    const response = await fetch(apiURL, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });
    const data = await response.json();
    console.log(data);
}

async function obtenerDetalleTitulo(mercado, simbolo) {
    const token = await obtenerToken();
    const apiURL = `https://api.invertironline.com/api/v2/${mercado}/Titulos/${simbolo}`;

    try {
        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error('Error en la solicitud a la API');
        }

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error al obtener detalles del título:', error);
        throw error;
    }
}

async function obtenerCotizacionesInstrumentos(instrumento, pais) {
    const token = await obtenerToken(); // Asegúrate de tener la función obtenerToken disponible
    const apiURL = `https://api.invertironline.com/api/v2/Cotizaciones/${instrumento}/${pais}/Todos`;

    try {
        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error('Error en la solicitud a la API');
        }

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error al obtener cotizaciones de instrumentos:', error);
        throw error;
    }
}

async function obtenerCotizacionTitulo(mercado, simbolo) {
    const token = await obtenerToken(); 
    const apiURL = `https://api.invertironline.com/api/v2/${mercado}/Titulos/${simbolo}/Cotizacion`;

    try {
        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error('Error en la solicitud a la API');
        }

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error al obtener la cotización del título:', error);
        throw error;
    }
}

async function obtenerCotizacionTituloReducida(mercado, simbolo) {
    const token = await obtenerToken(); 
    const apiURL = `https://api.invertironline.com/api/v2/${mercado}/Titulos/${simbolo}/Cotizacion`;

    try {
        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error('Error en la solicitud a la API');
        }

        const data = await response.json();
        const primeraPunta = data.puntas[0] || {}; // Obtener el primer objeto o un objeto vacío si no existe
        const datosReducidos = {

            ultimoPrecio: data.ultimoPrecio,
            variacion: data.variacion,
            // apertura: data.apertura,
            maximo: data.maximo,
            minimo: data.minimo,
            montoOperado: data.montoOperado,
            fechaHora: data.fechaHora,
            puntas: {
                cantidadCompra: primeraPunta.cantidadCompra,
                precioCompra: primeraPunta.precioCompra,
                cantidadVenta: primeraPunta.cantidadVenta,
                precioVenta: primeraPunta.precioVenta,
            },

        };
        return datosReducidos;
    } catch (error) {
        console.error('Error al obtener la cotización del título:', error);
        throw error;
    }
}

// Ejemplo de uso:
// obtenerCotizacionTituloReducida('BCBA', 'AL30D').then(data => console.log(data));
// obtenerCotizacionTituloReducida('BCBA', 'AL30').then(data => console.log(data));

// Ejemplo de uso:
// obtenerCotizacionTitulo('BCBA', 'AL30D').then(data => console.log(data));


// Ejemplo de uso:
// obtenerCotizacionesInstrumentos('cedears', 'argentina').then(data => console.log(data));
//alternativas : (opciones, cedears, acciones, aDRs, titulosPublicos, cauciones, cHPD, futuros, obligacionesNegociables, letras)

// Ejemplo de uso:
// obtenerDetalleTitulo('BCBA', 'GGAL').then(data => console.log(data));

// // Ejemplo de uso
// obtenerDatosHistoricos();

export { obtenerToken, obtenerCotizacionTituloReducida };



