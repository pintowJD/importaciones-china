const apiKey = "b342d657686dd8adcfbb5367"; 
const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/CNY`;

// Variable para activar o desactivar el uso de localStorage
const usarLocalStorage = true; 

let tasasCambio = null;
let ultimaActualizacion = null;
const tiempoCache = 24 * 60 * 60 * 1000; // 6 horas en milisegundos

// Función para obtener las tasas de cambio
async function obtenerTasas() {
    let ahora = new Date().getTime();

    if (usarLocalStorage) {
        let datosGuardados = localStorage.getItem("tasasCambio");
        let ultimaGuardada = localStorage.getItem("ultimaActualizacion");

        if (datosGuardados && ultimaGuardada && (ahora - ultimaGuardada) < tiempoCache) {
            console.log("✅ Usando tasas desde localStorage.");
            tasasCambio = JSON.parse(datosGuardados);
            ultimaActualizacion = parseInt(ultimaGuardada);
            actualizarContador();
            return tasasCambio;
        }
    }

    console.log("⚠️ Haciendo una nueva petición a la API...");
    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.result === "success") {
            tasasCambio = data.conversion_rates;
            ultimaActualizacion = ahora;

            if (usarLocalStorage) {
                localStorage.setItem("tasasCambio", JSON.stringify(tasasCambio));
                localStorage.setItem("ultimaActualizacion", ultimaActualizacion);
                console.log("✅ Tasas guardadas en localStorage.");
            }

            actualizarContador();
            return tasasCambio;
        } else {
            console.error("❌ Error al obtener tasas de cambio.");
            return null;
        }
    } catch (error) {
        console.error("❌ Error en la conexión con la API.");
        return null;
    }
}

// Función para convertir CNY a COP y USD
async function convertir() {
    let cantidad = document.getElementById("yuanInput").value;
    if (!cantidad || cantidad <= 0) {
        alert("Ingresa una cantidad válida en CNY.");
        return;
    }

    let tasas = await obtenerTasas();
    if (!tasas) return;

    let valorEnCOP = (cantidad * tasas.COP).toFixed(2);
    let valorEnUSD = (cantidad * tasas.USD).toFixed(2);

    document.getElementById("resultado").innerHTML = `
        🐉 <strong>${cantidad} CNY</strong> equivale a:<br>
        💰 <strong>${valorEnCOP} COP</strong><br>
        💵 <strong>${valorEnUSD} USD</strong>
    `;
}

// 🆕 Función para actualizar el contador de tiempo restante
function actualizarContador() {
    function calcularTiempoRestante() {
        let ahora = new Date().getTime();
        let tiempoRestante = tiempoCache - (ahora - ultimaActualizacion);

        if (tiempoRestante <= 0) {
            document.getElementById("contador").innerText = "🔄 Se necesita una nueva actualización.";
            return;
        }

        let horas = Math.floor(tiempoRestante / (60 * 60 * 1000)); // Convertir a horas
        let minutos = Math.floor((tiempoRestante % (60 * 60 * 1000)) / 60000); // Obtener los minutos restantes

        document.getElementById("contador").innerText = `⏳ Próxima actualización de divisas en: ${horas}h ${minutos}m`;
    }

    calcularTiempoRestante();
    setInterval(calcularTiempoRestante, 1000); // Actualizar cada segundo
}

// Cargar tasas al inicio
obtenerTasas();
