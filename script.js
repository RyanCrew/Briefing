const airports = [
    { code: "TIA", name: "Tirana Airport" },
    { code: "FMM", name: "Algovia Airport Memmingen" },
    { code: "BER", name: "Berlin Brandenburg Airport" },
    { code: "ALC", name: "Alicante-Elche Airport" },
    { code: "MAD", name: "Madrid-Barajas Airport" },
    { code: "STN", name: "London Stansted Airport" },
    // Add more airports as needed
];

function populateAirports() {
    try {
        const selects = document.querySelectorAll('.airport-select');
        if (selects.length === 0) {
            console.warn('No elements with class "airport-select" found.');
            return;
        }
        selects.forEach(select => {
            // Clear existing options to prevent duplicates
            select.innerHTML = '<option value="">Select Airport</option>';
            airports.forEach(airport => {
                const option = document.createElement('option');
                option.value = airport.code;
                option.textContent = `${airport.name} (${airport.code})`;
                select.appendChild(option);
            });
        });
    } catch (err) {
        console.error('Error populating airports:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    populateAirports();
});const airports = [
    { code: "TIA", name: "Tirana Airport" },
    { code: "FMM", name: "Algovia Airport Memmingen" },
    { code: "BER", name: "Berlin Brandenburg Airport" },
    { code: "ALC", name: "Alicante-Elche Airport" },
    { code: "MAD", name: "Madrid-Barajas Airport" },
    { code: "STN", name: "London Stansted Airport" },
    // Add more airports as needed
];

function populateAirports() {
    try {
        const selects = document.querySelectorAll('.airport-select');
        if (selects.length === 0) {
            console.warn('No elements with class "airport-select" found.');
            return;
        }
        selects.forEach(select => {
            // Clear existing options to prevent duplicates
            select.innerHTML = '<option value="">Select Airport</option>';
            airports.forEach(airport => {
                const option = document.createElement('option');
                option.value = airport.code;
                option.textContent = `${airport.name} (${airport.code})`;
                select.appendChild(option);
            });
        });
    } catch (err) {
        console.error('Error populating airports:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    populateAirports();
});
