import express from "express";
import { obtenerToken } from "./api.js"
import handlebars from "express-handlebars";
import { obtenerCotizacionTituloReducida } from "./api.js";
import { __dirname } from "./utils.js";
import { formatVariacion } from './public/js/handlebarsHelpers.js'
import { engine } from "express-handlebars";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/token", async (req, res) => {
  try {
    const token = await obtenerToken();
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el token" });
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.engine("handlebars", handlebars.engine()); 
app.set("views", __dirname + "/views"); 
app.set("view engine", "handlebars");

app.get("/cotizacion/:mercado/:simbolo", async (req, res) => {
    try {
      const { mercado, simbolo } = req.params;
      const datosReducidos = await obtenerCotizacionTituloReducida(mercado, simbolo);
      res.render("cotizacion", { datos: datosReducidos });
    } catch (error) {
      res.status(500).send("Error al obtener la cotización");
    }
  });

  app.get("/cotizaciones/:mercado/:simbolos", async (req, res) => {
    try {
        const { mercado, simbolos } = req.params;
        const listaSimbolos = simbolos.split(",");

        //Cantidad invertida
        const cantidades = {
            AL30: 1349.01,
            AL30D: 0,
            AL35: 232.73,
            AL35D: 0,
            TX26: 9605.72,
            TX28: 33633.10,
            TZX26: 100000.00,
            DICP: 0,
            TLC1O: 0,
            TLC1D: 0,
            YCA6O: 0,
            YCA6P: 0,
            NDT25: 0,
            NDT5D: 0,
            BBD: 700,
            PAMP: 465,
            TGSU2: 375,
            TSLA: 57,
        };

        const totalNoInvertido = -445.79 // No invertido


        // Obtener cotizaciones y calcular totales
        const promesasCotizaciones = listaSimbolos.map(async simbolo => {
            const cotizacion = await obtenerCotizacionTituloReducida(mercado, simbolo);
            const cantidad = cantidades[simbolo];
            const total = cotizacion.ultimoPrecio * cantidad;
            return { ...cotizacion, simbolo, cantidad, total }; 
        });

        const cotizaciones = await Promise.all(promesasCotizaciones);

        // Debes mover estas líneas después de obtener las cotizaciones
        const precioAL30 = cotizaciones.find(cot => cot.simbolo === "AL30").ultimoPrecio;
        const precioAL30D = cotizaciones.find(cot => cot.simbolo === "AL30D").ultimoPrecio;

        // Asegurarse de que no dividimos por cero
        const resultadoDivision = precioAL30D !== 0 ? precioAL30 / precioAL30D : 0;

        const granTotal = cotizaciones.reduce((acum, { total }) => acum + Number(total), 0);
        const factorAjuste = (1 - 0.001 * 1.21);
        const granTotalAjustado = granTotal * factorAjuste;
        
    
                // Calcular resultados de divisiones
                const resultadosDivision = [];
                for (let i = 0; i < listaSimbolos.length - 1; i += 2) {
                    const cotizacion1 = cotizaciones[i];
                    const cotizacion2 = cotizaciones[i + 1];
                    const resultado = (cotizacion1.ultimoPrecio / cotizacion2.ultimoPrecio).toFixed(2);
                    resultadosDivision.push({ simbolo1: listaSimbolos[i], simbolo2: listaSimbolos[i + 1], resultado });
                }
        
                let comparaciones = [];
                for (let i = 0; i < resultadosDivision.length; i++) {
                    for (let j = i + 1; j < resultadosDivision.length; j++) {
                        let comparacion = (parseFloat(resultadosDivision[i].resultado) / parseFloat(resultadosDivision[j].resultado) - 1) * 100;
                        comparaciones.push({
                            comparacion: comparacion.toFixed(2),
                            simbolos: [resultadosDivision[i].simbolo1 + '/' + resultadosDivision[i].simbolo2, resultadosDivision[j].simbolo1 + '/' + resultadosDivision[j].simbolo2]
                        });
                    }
                }
                // Ordenar comparaciones de mayor a menor
                comparaciones.sort((a, b) => parseFloat(b.comparacion) - parseFloat(a.comparacion));


                let granTotalDolares = resultadoDivision !== 0 ? granTotalAjustado / resultadoDivision : 0;
                const totalAhorros = granTotalDolares + totalNoInvertido;
                const totalAhorrosPesos = totalAhorros * (precioAL30 / precioAL30D);

        
                res.render("cotizaciones", { cotizaciones, resultados: resultadosDivision, comparaciones, granTotal: granTotalDolares, totalNoInvertido, totalAhorros, totalAhorrosPesos  })

    } catch (error) {
        res.status(500).send("Error al obtener los datos: " + error.message);
    }
});


  app.engine("handlebars", engine({
    defaultLayout: 'main',
    helpers: {
        formatVariacion: (value) => {
            let clase;
            if (value > 0) {
                clase = "variacion-positiva";
            } else if (value < 0) {
                clase = "variacion-negativa";
            } else {
                clase = "variacion-cero";
            }
            return `<span class="${clase}">${value.toFixed(2)}%</span>`;
        },
        formatHora: (fechaHora) => {
            const fecha = new Date(fechaHora);
            return fecha.toTimeString().split(' ')[0];
        },
        formatNumero: (numero) => {
            return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numero);
        },
        formatNumeroSinDecimales: (numero) => {
            return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(numero);
        },
        formatComparacion: (value) => {
            let numero = typeof value === 'number' ? value : parseFloat(value);
            let clase;
            if (numero > 0) {
                clase = "variacion-positiva";
            } else if (numero < 0) {
                clase = "variacion-negativa";
            } else {
                clase = "variacion-cero";
            }
            return `<span class="${clase}">${numero.toFixed(2)}%</span>`;
        }
    }
}));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});