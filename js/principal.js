const apiKey = "b342d657686dd8adcfbb5367"; 
const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/CNY`;

// Variable para activar o desactivar el uso de localStorage
const usarLocalStorage = true; 

let tasasCambio = null;
let ultimaActualizacion = null;

// Función para obtener las tasas de cambio
async function obtenerTasas() {
    let ahora = new Date();
    let ultimaFechaStr = localStorage.getItem("ultimaFecha");
    let ultimaFecha = ultimaFechaStr ? new Date(ultimaFechaStr) : null;

    let actualizar = false;

    if (!ultimaFecha) {
        actualizar = true; // Primera ejecución sin datos previos
    } else {
        let ahoraHoras = ahora.getHours();
        
        // Si ya pasó la medianoche y el día cambió
        if (ahoraHoras >= 0 && ahora.toDateString() !== ultimaFecha.toDateString()) {
            actualizar = true;
        }
    }

    if (!actualizar && usarLocalStorage) {
        console.log("✅ Usando tasas desde localStorage.");
        tasasCambio = JSON.parse(localStorage.getItem("tasasCambio"));
        ultimaActualizacion = new Date(localStorage.getItem("ultimaFecha"));
        actualizarContador();
        return tasasCambio;
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
                localStorage.setItem("ultimaFecha", ahora.toISOString());
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
        let ahora = new Date();
        let proximaActualizacion = new Date(ahora);
        proximaActualizacion.setHours(24, 0, 0, 0); // Establecer a medianoche del siguiente día

        let tiempoRestante = proximaActualizacion - ahora;

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
