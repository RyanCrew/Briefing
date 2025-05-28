const airports = [
    { code: "TIA", name: "Tirana Airport" },
    { code: "FMM", name: "Algovia Airport Memmingen" },
    { code: "BER", name: "Berlin Brandenburg Airport" },
    // Añade todos los aeropuertos aquí (similar a la lista completa)
];

function populateAirports() {
    const selects = document.querySelectorAll('.airport-select');
    selects.forEach(select => {
        airports.forEach(airport => {
            const option = document.createElement('option');
            option.value = airport.code;
            option.textContent = `${airport.name} (${airport.code})`;
            select.appendChild(option);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    populateAirports();
});
