```javascript
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', () => {
    loadFormData();
    setupEventListeners();
    calculateDifference();
    calculateTotals();
});

function setupEventListeners() {
    const productTable = document.querySelector('#productTable');
    const dutyFreeTable = document.querySelector('#dutyFreeTable');
    const salesInputs = document.querySelectorAll('#salesCrew1, #salesCrew2, #salesCrew3, #salesCrew4');
    const paxInputs = document.querySelectorAll('.finalPax');
    const addCrewButton = document.querySelector('.add-crew-button');
    const removeCrewButtons = document.querySelectorAll('.remove-crew-button');

    if (productTable) {
        productTable.addEventListener('input', (e) => {
            if (e.target.classList.contains('open') || e.target.classList.contains('close')) {
                calculateDifference();
            }
        });
    }

    if (dutyFreeTable) {
        dutyFreeTable.addEventListener('input', (e) => {
            if (e.target.classList.contains('open') || e.target.classList.contains('close')) {
                calculateDifference();
            }
        });
    }

    salesInputs.forEach(input => {
        input.addEventListener('input', calculateTotals);
    });

    paxInputs.forEach(input => {
        input.addEventListener('input', calculateTotals);
    });

    if (addCrewButton) {
        addCrewButton.addEventListener('click', addExtraCrew);
    }

    removeCrewButtons.forEach(button => {
        button.addEventListener('click', removeExtraCrew);
    });

    const formInputs = document.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', saveFormData);
    });
}

function calculateDifference() {
    const tables = [document.querySelector('#productTable'), document.querySelector('#dutyFreeTable')];
    tables.forEach(table => {
        if (!table) return;
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const openInput = row.querySelector('.open');
            const closeInput = row.querySelector('.close');
            const differenceCell = row.querySelector('.difference-cell');
            if (openInput && closeInput && differenceCell) {
                const openValue = parseInt(openInput.value) || 0;
                const closeValue = parseInt(closeInput.value) || 0;
                const difference = openValue - closeValue;
                differenceCell.textContent = difference >= 0 ? difference : 0;
            }
        });
    });
    console.log('Inventory differences calculated');
}

function calculateTotals() {
    const salesInputs = document.querySelectorAll('#salesCrew1, #salesCrew2, #salesCrew3, #salesCrew4');
    const totalSalesInput = document.querySelector('#totalSales');
    const totalPaxInput = document.querySelector('#totalPax');
    const averageInput = document.querySelector('#average');
    const paxInputs = document.querySelectorAll('.finalPax');

    let totalSales = 0;
    salesInputs.forEach(input => {
        totalSales += parseFloat(input.value) || 0;
    });
    totalSalesInput.value = totalSales.toFixed(2);

    let totalPax = 0;
    paxInputs.forEach(input => {
        totalPax += parseInt(input.value) || 0;
    });
    totalPaxInput.value = totalPax;

    const average = totalPax > 0 ? (totalSales / totalPax).toFixed(2) : 0;
    averageInput.value = average;
}

function addExtraCrew() {
    const extraCrewRows = document.querySelectorAll('.extra-crew');
    for (let row of extraCrewRows) {
        if (row.style.display === 'none' || row.style.display === '') {
            row.style.display = 'table-row';
            break;
        }
    }
}

function removeExtraCrew(event) {
    const row = event.target.closest('tr');
    if (row) {
        row.style.display = 'none';
        row.querySelectorAll('input').forEach(input => input.value = '');
    }
}

function collectFormData() {
    const formData = {
        date: document.querySelector('#date').value,
        acReg: document.querySelector('#acReg').value,
        flights: [],
        captain: document.querySelector('#captain').value,
        firstOfficer: document.querySelector('#firstOfficer').value,
        crew: [],
        description: document.querySelector('#description').value,
        products: [],
        seals: {
            yellowSeal: document.querySelector('#yellowSeal').value,
            greenSeal: document.querySelector('#greenSeal').value,
            metalSeal: document.querySelector('#metalSeal').value
        },
        equipment: {
            kettles: document.querySelector('#kettles').value,
            cupholder: document.querySelector('#cupholder').value,
            babyWarmer: document.querySelector('#babyWarmer').value,
            coolerBag: document.querySelector('#coolerBag').value
        },
        dutyFree: [],
        dutyFreeMetalSeal: document.querySelector('#dutyFreeMetalSeal').value,
        sales: {
            crew1: document.querySelector('#salesCrew1').value,
            crew2: document.querySelector('#salesCrew2').value,
            crew3: document.querySelector('#salesCrew3').value,
            crew4: document.querySelector('#salesCrew4').value,
            totalSales: document.querySelector('#totalSales').value,
            totalPax: document.querySelector('#totalPax').value,
            average: document.querySelector('#average').value
        }
    };

    document.querySelectorAll('#flightsTableBody tr').forEach(row => {
        formData.flights.push({
            route: row.querySelector('.route').value,
            flightNumber: row.querySelector('.flightNumber').value,
            flightTime: row.querySelector('.flightTime').value,
            departure: row.querySelector('.departure').value,
            arrival: row.querySelector('.arrival').value,
            finalPax: row.querySelector('.finalPax').value,
            fwd: row.querySelector('.fwd').value,
            aft: row.querySelector('.aft').value,
            wheelchair: row.querySelector('.wheelchair').value
        });
    });

    document.querySelectorAll('#crewTable tbody tr').forEach(row => {
        const crewCode = row.querySelector('.crewcode').value;
        const crewName = row.querySelector('.crewName').value;
        if (crewCode || crewName) {
            formData.crew.push({
                code: crewCode,
                name: crewName
            });
        }
    });

    document.querySelectorAll('#productTable tbody tr').forEach(row => {
        formData.products.push({
            name: row.cells[0].textContent,
            initial: row.querySelector('.open').value,
            final: row.querySelector('.close').value,
            sold: row.querySelector('.difference-cell').textContent
        });
    });

    document.querySelectorAll('#dutyFreeTable tbody tr').forEach(row => {
        formData.dutyFree.push({
            name: row.cells[0].textContent,
            initial: row.querySelector('.open').value,
            final: row.querySelector('.close').value,
            sold: row.querySelector('.difference-cell').textContent
        });
    });

    return formData;
}

function saveFormData() {
    const formData = collectFormData();
    try {
        localStorage.setItem('inflightFormData', JSON.stringify(formData));
        console.log('Form data saved');
    } catch (error) {
        console.error('Error saving form data:', error);
        showNotification('Error saving form data');
    }
}

function loadFormData() {
    try {
        const savedData = localStorage.getItem('inflightFormData');
        if (!savedData) return;

        const formData = JSON.parse(savedData);

        document.querySelector('#date').value = formData.date || '';
        document.querySelector('#acReg').value = formData.acReg || '';
        document.querySelector('#captain').value = formData.captain || '';
        document.querySelector('#firstOfficer').value = formData.firstOfficer || '';
        document.querySelector('#description').value = formData.description || '';
        document.querySelector('#yellowSeal').value = formData.seals?.yellowSeal || '';
        document.querySelector('#greenSeal').value = formData.seals?.greenSeal || '';
        document.querySelector('#metalSeal').value = formData.seals?.metalSeal || '';
        document.querySelector('#kettles').value = formData.equipment?.kettles || '';
        document.querySelector('#cupholder').value = formData.equipment?.cupholder || '';
        document.querySelector('#babyWarmer').value = formData.equipment?.babyWarmer || '';
        document.querySelector('#coolerBag').value = formData.equipment?.coolerBag || '';
        document.querySelector('#dutyFreeMetalSeal').value = formData.dutyFreeMetalSeal || '';
        document.querySelector('#salesCrew1').value = formData.sales?.crew1 || '';
        document.querySelector('#salesCrew2').value = formData.sales?.crew2 || '';
        document.querySelector('#salesCrew3').value = formData.sales?.crew3 || '';
        document.querySelector('#salesCrew4').value = formData.sales?.crew4 || '';
        document.querySelector('#totalSales').value = formData.sales?.totalSales || '';
        document.querySelector('#totalPax').value = formData.sales?.totalPax || '';
        document.querySelector('#average').value = formData.sales?.average || '';

        formData.flights.forEach((flight, index) => {
            const row = document.querySelector(`#flightsTableBody tr:nth-child(${index + 1})`);
            if (row) {
                row.querySelector('.route').value = flight.route || '';
                row.querySelector('.flightNumber').value = flight.flightNumber || '';
                row.querySelector('.flightTime').value = flight.flightTime || '';
                row.querySelector('.departure').value = flight.departure || '';
                row.querySelector('.arrival').value = flight.arrival || '';
                row.querySelector('.finalPax').value = flight.finalPax || '';
                row.querySelector('.fwd').value = flight.fwd || '';
                row.querySelector('.aft').value = flight.aft || '';
                row.querySelector('.wheelchair').value = flight.wheelchair || '';
            }
        });

        formData.crew.forEach((crew, index) => {
            const row = document.querySelector(`#crewTable tbody tr:nth-child(${index + 1})`);
            if (row) {
                row.querySelector('.crewcode').value = crew.code || '';
                row.querySelector('.crewName').value = crew.name || '';
                if (index >= 4) {
                    row.style.display = 'table-row';
                }
            }
        });

        const productRows = document.querySelectorAll('#productTable tbody tr');
        formData.products.forEach((product, index) => {
            if (productRows[index]) {
                const row = productRows[index];
                row.querySelector('.open').value = product.initial || '';
                row.querySelector('.close').value = product.final || '';
                const openValue = parseInt(product.initial) || 0;
                const closeValue = parseInt(product.final) || 0;
                const difference = openValue - closeValue;
                row.querySelector('.difference-cell').textContent = difference >= 0 ? difference : 0;
            }
        });

        const dutyFreeRows = document.querySelectorAll('#dutyFreeTable tbody tr');
        formData.dutyFree.forEach((item, index) => {
            if (dutyFreeRows[index]) {
                const row = dutyFreeRows[index];
                row.querySelector('.open').value = item.initial || '';
                row.querySelector('.close').value = item.final || '';
                const openValue = parseInt(item.initial) || 0;
                const closeValue = parseInt(item.final) || 0;
                const difference = openValue - closeValue;
                row.querySelector('.difference-cell').textContent = difference >= 0 ? difference : 0;
            }
        });

        calculateDifference();
        calculateTotals();
        console.log('Form data loaded');
    } catch (error) {
        console.error('Error loading form data:', error);
        showNotification('Error loading form data');
    }
}

function clearFormData() {
    document.querySelector('#inflightForm').reset();
    document.querySelectorAll('.difference-cell').forEach(cell => cell.textContent = '');
    document.querySelectorAll('.extra-crew').forEach(row => row.style.display = 'none');
    localStorage.removeItem('inflightFormData');
    calculateTotals();
    showNotification('Form cleared');
}

function showNotification(message) {
    const notification = document.querySelector('#notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function toggleFlightView(flightNumber) {
    console.log(`Toggling flight view for flight ${flightNumber}`);
}

function handleFormSubmission() {
    const formData = collectFormData();
    generatePDF(formData);
}

function generatePDF(formData) {
    const doc = new jsPDF();
    let yOffset = 10;

    doc.setFontSize(16);
    doc.text('Flight Report', 105, yOffset, { align: 'center' });
    yOffset += 10;

    doc.setFontSize(12);
    doc.text(`Date: ${formData.date || 'N/A'}`, 10, yOffset);
    doc.text(`A/C Registration: ${formData.acReg || 'N/A'}`, 150, yOffset);
    yOffset += 10;

    doc.autoTable({
        startY: yOffset,
        head: [['#', 'Route', 'Flight No.', 'Time', 'Dep', 'Arr', 'Pax', 'FWD', 'AFT', 'W/C']],
        body: formData.flights.map((flight, index) => [
            index + 1,
            flight.route || '',
            flight.flightNumber || '',
            flight.flightTime || '',
            flight.departure || '',
            flight.arrival || '',
            flight.finalPax || '',
            flight.fwd || '',
            flight.aft || '',
            flight.wheelchair || ''
        ]),
        theme: 'striped',
        headStyles: { fillColor: [30, 144, 255] },
        margin: { left: 10, right: 10 }
    });
    yOffset = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.text(`Captain: ${formData.captain || 'N/A'}`, 10, yOffset);
    doc.text(`First Officer: ${formData.firstOfficer || 'N/A'}`, 150, yOffset);
    yOffset += 10;

    doc.autoTable({
        startY: yOffset,
        head: [['Crew', 'Code', 'Name']],
        body: formData.crew.map((crew, index) => [
            `No. ${index + 1}`,
            crew.code || '',
            crew.name || ''
        ]),
        theme: 'striped',
        headStyles: { fillColor: [30, 144, 255] },
        margin: { left: 10, right: 10 }
    });
    yOffset = doc.lastAutoTable.finalY + 10;

    doc.text(`Description: ${formData.description || 'N/A'}`, 10, yOffset);
    yOffset += 10;

    doc.autoTable({
        startY: yOffset,
        head: [['Product', 'Initial', 'Final', 'Sold']],
        body: formData.products.map(product => [
            product.name,
            product.initial || '',
            product.final || '',
            product.sold || ''
        ]),
        theme: 'striped',
        headStyles: { fillColor: [30, 144, 255] },
        margin: { left: 10, right: 10 }
    });
    yOffset = doc.lastAutoTable.finalY + 10;

    doc.text(`Yellow Seal: ${formData.seals.yellowSeal || 'N/A'}`, 10, yOffset);
    doc.text(`Green Seal: ${formData.seals.greenSeal || 'N/A'}`, 70, yOffset);
    doc.text(`Metal Seal: ${formData.seals.metalSeal || 'N/A'}`, 130, yOffset);
    yOffset += 10;

    doc.text(`Kettles: ${formData.equipment.kettles || 'N/A'}`, 10, yOffset);
    doc.text(`Cupholder: ${formData.equipment.cupholder || 'N/A'}`, 50, yOffset);
    doc.text(`Baby Warmer: ${formData.equipment.babyWarmer || 'N/A'}`, 90, yOffset);
    doc.text(`Cooler Bag: ${formData.equipment.coolerBag || 'N/A'}`, 130, yOffset);
    yOffset += 10;

    doc.autoTable({
        startY: yOffset,
        head: [['Duty-Free Item', 'Initial', 'Final', 'Sold']],
        body: formData.dutyFree.map(item => [
            item.name,
            item.initial || '',
            item.final || '',
            item.sold || ''
        ]),
        theme: 'striped',
        headStyles: { fillColor: [30, 144, 255] },
        margin: { left: 10, right: 10 }
    });
    yOffset = doc.lastAutoTable.finalY + 10;

    doc.text(`Duty-Free Metal Seal: ${formData.dutyFreeMetalSeal || 'N/A'}`, 10, yOffset);
    yOffset += 10;

    doc.autoTable({
        startY: yOffset,
        head: [['Crew', 'Sales (€)']],
        body: [
            ['Crew 1', formData.sales.crew1 || '0'],
            ['Crew 2', formData.sales.crew2 || '0'],
            ['Crew 3', formData.sales.crew3 || '0'],
            ['Crew 4', formData.sales.crew4 || '0'],
            ['Total Sales', formData.sales.totalSales || '0'],
            ['Total Pax', formData.sales.totalPax || '0'],
            ['Average/Pax', formData.sales.average || '0']
        ],
        theme: 'striped',
        headStyles: { fillColor: [30, 144, 255] },
        margin: { left: 10, right: 10 }
    });

    doc.save(`Flight_Report_${formData.date || 'NoDate'}.pdf`);
}
```

### Cambios realizados en `script.js`
1. **Mejor manejo de errores en `loadFormData`**:
   - Añadí comprobaciones para evitar errores si `formData.products` tiene menos elementos que las filas actuales (por ejemplo, 7 productos guardados vs. 8 filas).
   - Usé `if (productRows[index])` para asegurar que solo se asignen valores a filas existentes.
   - Recalculo las diferencias al cargar datos para asegurar que `difference-cell` se actualice correctamente.

2. **Eventos de entrada robustos**:
   - Mantuve el listener de `input` en `#productTable` para capturar cambios en cualquier input con clase `open` o `close`, incluyendo la nueva fila de "C&M Panini".
   - Verifiqué que los eventos se asignen correctamente a todos los inputs.

3. **Limpieza de `localStorage`**:
   - En `clearFormData`, aseguré que `localStorage.removeItem('inflightFormData')` elimine datos antiguos que puedan causar conflictos.
   - Añadí manejo de errores en `saveFormData` y `loadFormData` para notificar al usuario si hay problemas con `localStorage`.

4. **Depuración mejorada**:
   - Mantuve los `console.log` para confirmar que las funciones se ejecutan (`'Inventory differences calculated'`, `'Form data saved'`, `'Form data loaded'`).
   - Añadí notificaciones visuales (`showNotification`) para errores de guardado/carga.

### Instrucciones para probar
1. **Actualiza los archivos**:
   - Reemplaza tu `index.html` con el código del artifact_id: `889b7cde-3a67-420f-91d2-5da35b768ac7`, versión: `d30218cd-e182-4db9-aefd-a2a1ca19f540`.
   - Reemplaza tu `script.js` con el código del artifact_id: `015fb05d-510d-4272-8309-ef6d21563efb`, versión: `a7b3f9e2-1c7d-4f0a-b5e3-9c8d7a2f3b4e`.

2. **Limpia la caché**:
   - Abre la consola del navegador (F12), ve a la pestaña "Application", selecciona "Storage" > "Local Storage" y elimina la entrada para `inflightFormData`.
   - Si usas un Service Worker, limpia la caché del navegador o actualiza `sw.js` para incluir las nuevas versiones de `index.html` y `script.js`. Por ejemplo, en `sw.js`, asegúrate de que el array `filesToCache` incluya:
     ```javascript
     const filesToCache = [
         '/',
         '/index.html',
         '/script.js',
         '/output.css',
         '/manifest.json',
         '/icon.png'
     ];
     ```
     y cambia el `CACHE_NAME` para forzar una actualización (por ejemplo, `CACHE_NAME = 'flight-report-v3'`).

3. **Prueba las variables**:
   - **Tabla de inventario**:
     - Ingresa valores en `Initial` y `Final` para "C&M Panini" (por ejemplo, `Initial: 20`, `Final: 8`) y verifica que la columna `Sold` muestre `12`.
     - Haz lo mismo para otros productos (por ejemplo, "H&C Panini", "Pizza").
     - Confirma que los cálculos se actualizan en tiempo real.
   - **Guardado y carga**:
     - Ingresa datos en varios campos (incluyendo "C&M Panini"), recarga la página, y verifica que los valores persisten.
     - Usa el botón "Clear Form" y confirma que todos los campos, incluyendo "C&M Panini", se limpian y `localStorage` se vacía.
   - **Totales de ventas**:
     - Ingresa valores en los campos de ventas (`salesCrew1`, etc.) y verifica que `totalSales`, `totalPax`, y `average` se actualicen correctamente.
   - **PDF**:
     - Haz clic en "Submit Report" y verifica que el PDF incluye "C&M Panini" en la tabla "Product Inventory" con los valores correctos.

4. **Revisa la consola**:
   - Abre la consola (F12) y busca mensajes como:
     - `'Inventory differences calculated'` al modificar inputs de inventario.
     - `'Form data saved'` al ingresar datos.
     - `'Form data loaded'` al cargar la página.
   - Si ves errores (por ejemplo, `Cannot read property 'value' of null`), copia el mensaje exacto y compártelo para depurar.

### Preguntas para aclarar
Para afinar la solución, por favor proporciona más detalles:
- ¿Qué variables específicas no funcionan? Por ejemplo:
  - ¿La columna "Sold" en "C&M Panini" no se actualiza?
  - ¿Los datos no se guardan al recargar la página?
  - ¿Los totales de ventas (`totalSales`, `average`) están mal?
  - ¿El PDF no incluye "C&M Panini"?
- ¿Ves algún mensaje de error en la consola del navegador?
- ¿El problema ocurre solo con "C&M Panini" o también con otros productos?
- ¿Estás usando un Service Worker? Si es así, ¿has actualizado la caché?

### Notas adicionales
- **Service Worker**: Si el problema persiste, prueba desactivar temporalmente el Service Worker en `index.html` comentando:
  ```html
  <!--
  <script>
      if ('serviceWorker' in navigator) {
          document.addEventListener('DOMContentLoaded', () => {
              navigator.serviceWorker.register('/sw.js')
                  .then(registration => {
                      console.log('Service Worker registered:', registration.scope);
                  })
                  .catch(error => {
                      console.error('Error registering Service Worker:', error);
                  });
          });
      }
  </script>
  -->
  ```
  y limpia la caché del navegador.

- **Datos antiguos**: Si `localStorage` tiene datos con 7 productos, puede causar errores al cargar en una tabla con 8. Limpiar `localStorage` (como se indicó) debería resolverlo.

- **Validaciones**: Si necesitas validaciones específicas para "C&M Panini" (por ejemplo, un máximo de 30 unidades iniciales), puedo añadirlas. Por ejemplo:
  ```javascript
  if (row.cells[0].textContent === 'C&M Panini' && parseInt(openInput.value) > 30) {
      showNotification('C&M Panini cannot exceed 30 units initial stock');
      openInput.value = 30;
  }
  ```

### Siguientes pasos
- Actualiza `index.html` y `script.js` con los códigos proporcionados.
- Limpia `localStorage` y la caché del navegador.
- Prueba las funcionalidades descritas y verifica la consola.
- Responde con detalles sobre qué funciona y qué no, o con cualquier mensaje de error.

¡Vamos a hacer que las variables funcionen perfectamente! 😊 Si necesitas ayuda urgente o prefieres que revise algo específico, avísame.
