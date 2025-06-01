// script.js
const airports = [
  { code: "TIA", name: "Tirana Airport" },
  { code: "FMM", name: "Algovia Airport Memmingen" },
  { code: "BER", name: "Berlin Brandenburg Airport" },
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

  // Form submission handler
  const form = document.querySelector('#flight-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = Object.fromEntries(new FormData(form));
      console.log('Form data:', formData); // Debug
      const { departure = '', destination = '' } = formData; // Safe destructuring
      if (!departure || !destination) {
        console.error('Missing departure or destination');
        return;
      }

      // Generate PDF
      try {
        const { jsPDF } = window; // Assuming jsPDF is loaded globally
        const doc = new jsPDF();
        doc.text(`Flight from ${departure} to ${destination}`, 10, 10);
        doc.save('flight-details.pdf');
      } catch (error) {
        console.error('PDF generation failed:', error);
      }
    });
  } else {
    console.error('Form not found');
  }
});
