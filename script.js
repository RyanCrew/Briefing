// script.js

// Simulación de datos seleccionados
const flightData = {
    flightNumber: "FR123",
    flightDate: "2025-05-29T09:00:00",
    status: "On Time",
};

// Función para actualizar los datos en el DOM
function updateFlightInfo(data) {
    const flightTime = new Date(data.flightDate);
    const reportTime = new Date(flightTime.getTime() - 45 * 60000); // Restar 45 minutos

    document.getElementById("flight-time").textContent = formatDateTime(flightTime);
    document.getElementById("report-time").textContent = formatDateTime(reportTime);
    document.getElementById("flight-status").textContent = data.status;
}

// Formatea fecha y hora
function formatDateTime(date) {
    return date.toLocaleDateString("en-GB") + ", " + date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// Actualizar la información al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    updateFlightInfo(flightData);
});
