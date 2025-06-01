let activeFlight = null;
let extraCrewCount = 0;

// Muestra una notificación en pantalla y consola
function showNotification(message, duration = 3000) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, duration);
    }
    console.log('Notification:', message);
}

// Guarda los datos del formulario en localStorage
function saveFormData() {
    try {
        const formData = collectFormData();
        localStorage.setItem('flightReportData', JSON.stringify(formData));
        localStorage.setItem('extraCrewCount', extraCrewCount);
        console.log('Form data saved:', formData);
    } catch (error) {
        console.error('Error saving form:', error);
        showNotification('Error saving form data');
    }
}

// Carga los datos guardados desde localStorage
function loadFormData() {
    try {
        const savedData = localStorage.getItem('flightReportData');
        const savedExtraCrew = localStorage.getItem('extraCrewCount');
        if (savedData) {
            const data = JSON.parse(savedData);
            document.getElementById('date').value = data.date || '';
            document.getElementById('acReg').value = data.acReg || '';
            document.querySelectorAll('#flightsTableBody tr').forEach((row, i) => {
                if (data.flights[i]) {
                    row.querySelector('.route').value = data.flights[i].route || '';
                    row.querySelector('.flightNumber').value = data.flights[i].flightNumber || '';
                    row.querySelector('.flightTime').value = data.flights[i].time || '';
                    row.querySelector('.departure').value = data.flights[i].departure || '';
                    row.querySelector('.arrival').value = data.flights[i].arrival || '';
                    row.querySelector('.finalPax').value = data.flights[i].finalPax || '';
                    row.querySelector('.fwd').value = data.flights[i].fwd || '';
                    row.querySelector('.aft').value = data.flights[i].aft || '';
                    row.querySelector('.wheelchair').value = data.flights[i].wheelchair || '';
                }
            });
            document.getElementById('captain').value = data.captain || '';
            document.getElementById('firstOfficer').value = data.firstOfficer || '';
            data.crew.forEach((crew, i) => {
                if (i < 4) {
                    document.getElementById(`crewcode${i + 1}`).value = crew.code || '';
                    document.querySelector(`#crewTable tbody tr:nth-child(${i + 1}) .crewName`).value = crew.name || '';
                } else {
                    const extraRow = document.getElementById(`extraCrew${i - 3}`);
                    if (extraRow) {
                        extraRow.style.display = 'table-row';
                        extraRow.querySelector('.crewcode').value = crew.code || '';
                        extraRow.querySelector('.crewName').value = crew.name || '';
                    }
                }
            });
            document.getElementById('description').value = data.description || '';
            document.querySelectorAll('#productTable tbody tr').forEach((row, i) => {
                if (data.products[i]) {
                    row.querySelector('.open').value = data.products[i].open || '';
                    row.querySelector('.close').value = data.products[i].close || '';
                }
            });
            document.getElementById('yellowSeal').value = data.seals.yellow || '';
            document.getElementById('greenSeal').value = data.seals.green || '';
            document.getElementById('metalSeal').value = data.seals.metal || '';
            document.getElementById('kettles').value = data.equipment.kettles || '';
            document.getElementById('cupholder').value = data.equipment.cupholder || '';
            document.getElementById('babyWarmer').value = data.equipment.babyWarmer || '';
            document.getElementById('coolerBag').value = data.equipment.coolerBag || '';
            document.querySelectorAll('#dutyFreeTable tbody tr').forEach((row, i) => {
                if (data.dutyFreeProducts[i]) {
                    row.querySelector('.open').value = data.dutyFreeProducts[i].open || '';
                    row.querySelector('.close').value = data.dutyFreeProducts[i].close || '';
                }
            });
            document.getElementById('dutyFreeMetalSeal').value = data.dutyFreeSeal || '';
            document.getElementById('salesCrew1').value = data.salesForm.crew1 || '';
            document.getElementById('salesCrew2').value = data.salesForm.crew2 || '';
            document.getElementById('salesCrew3').value = data.salesForm.crew3 || '';
            document.getElementById('salesCrew4').value = data.salesForm.crew4 || '';
            document.getElementById('totalSales').value = data.salesForm.total || '';
            document.getElementById('totalPax').value = data.totalPax || '';
            document.getElementById('average').value = data.salesForm.average || '';
            if (savedExtraCrew) {
                extraCrewCount = parseInt(savedExtraCrew) || 0;
                for (let i = 1; i <= extraCrewCount; i++) {
                    const extraRow = document.getElementById(`extraCrew${i}`);
                    if (extraRow) extraRow.style.display = 'table-row';
                }
                if (extraCrewCount >= 2) {
                    document.querySelector('.add-crew-button').style.display = 'none';
                }
            }
            console.log('Form data loaded:', data);
        }
    } catch (error) {
        console.error('Error loading form:', error);
        showNotification('Error loading saved data');
    }
}

// Limpia el formulario y localStorage
function clearFormData() {
    try {
        document.getElementById('inflightForm').reset();
        document.querySelectorAll('.difference-cell').forEach(cell => {
            cell.textContent = '';
        });
        document.querySelectorAll('.extra-crew').forEach(row => {
            row.querySelectorAll('input').forEach(input => input.value = '');
            row.style.display = 'none';
        });
        extraCrewCount = 0;
        document.querySelector('.add-crew-button').style.display = 'inline-block';
        localStorage.clear();
        updateSalesLabels();
        calculateTotalSales();
        calculateTotalPax();
        showNotification('Form cleared');
        console.log('Form cleared');
    } catch (error) {
        console.error('Error clearing form:', error);
        showNotification('Error clearing form');
    }
}

// Alterna la vista de un vuelo específico
function toggleFlightView(flightNumber) {
    try {
        const flightRows = document.querySelectorAll('#flightsTableBody tr');
        const flightInfoHeader = document.querySelector('.flight-info-header');
        const stockSection = document.getElementById('stockSection');
        const dutyFreeSection = document.getElementById('dutyFreeSection');
        const salesSection = document.getElementById('salesSection');
        const crewSection = document.getElementById('crewSection');
        if (activeFlight === flightNumber) {
            activeFlight = null;
            flightRows.forEach(row => row.style.display = 'table-row');
            if (flightInfoHeader) flightInfoHeader.style.display = 'grid';
            stockSection.style.display = 'block';
            dutyFreeSection.style.display = 'block';
            salesSection.style.display = 'block';
            crewSection.style.display = 'block';
        } else {
            activeFlight = flightNumber;
            flightRows.forEach(row => {
                row.style.display = row.dataset.flight === flightNumber ? 'table-row' : 'none';
            });
            if (flightInfoHeader) flightInfoHeader.style.display = 'none';
            stockSection.style.display = 'none';
            dutyFreeSection.style.display = 'none';
            salesSection.style.display = 'none';
            crewSection.style.display = 'block';
        }
        saveFormData();
        console.log('Flight view toggled:', activeFlight);
    } catch (error) {
        console.error('Error toggling flight:', error);
        showNotification('Error toggling flight view');
    }
}

// Añade una fila de tripulación extra
function addExtraCrew() {
    try {
        if (extraCrewCount >= 2) {
            showNotification('Maximum extra crew reached');
            console.log('Max extra crew reached');
            return;
        }
        extraCrewCount++;
        console.log('Adding extra crew:', extraCrewCount);
        const extraRow = document.getElementById(`extraCrew${extraCrewCount}`);
        if (extraRow) {
            extraRow.style.display = 'table-row';
            showNotification(`Added extra crew ${extraCrewCount}`);
            if (extraCrewCount === 2) {
                document.querySelector('.add-crew-button').style.display = 'none';
            }
            saveFormData();
            console.log('Extra crew added:', extraCrewCount);
        } else {
            extraCrewCount--;
            console.error('Extra crew row not found:', `extraCrew${extraCrewCount + 1}`);
            showNotification('Error adding crew: Row not found');
        }
    } catch (error) {
        console.error('Error adding extra crew:', error);
        showNotification('Error adding extra crew');
    }
}

// Elimina una fila de tripulación extra
function removeExtraCrew(index) {
    try {
        const extraRow = document.getElementById(`extraCrew${index}`);
        if (extraRow) {
            extraRow.style.display = 'none';
            extraRow.querySelectorAll('input').forEach(input => input.value = '');
            extraCrewCount--;
            document.querySelector('.add-crew-button').style.display = 'inline-block';
            saveFormData();
            showNotification(`Removed extra crew ${index}`);
            console.log('Extra crew removed:', index);
        }
    } catch (error) {
        console.error('Error removing extra crew:', error);
        showNotification('Error removing extra crew');
    }
}

// Calcula la diferencia entre inventario inicial y final
function calculateDifference() {
    try {
        ['productTable', 'dutyFreeTable'].forEach(tableId => {
            const table = document.getElementById(tableId);
            if (table) {
                table.querySelectorAll('tbody tr').forEach(row => {
                    const openInput = row.querySelector('.open');
                    const closeInput = row.querySelector('.close');
                    const soldCell = row.querySelector('.difference-cell');
                    if (openInput && closeInput && soldCell) {
                        const open = parseInt(openInput.value) || 0;
                        const close = parseInt(closeInput.value) || 0;
                        soldCell.textContent = open - close;
                        openInput.addEventListener('input', () => {
                            soldCell.textContent = (parseInt(openInput.value) || 0) - (parseInt(closeInput.value) || 0);
                            saveFormData();
                        });
                        closeInput.addEventListener('input', () => {
                            soldCell.textContent = (parseInt(openInput.value) || 0) - (parseInt(closeInput.value) || 0);
                            saveFormData();
                        });
                    }
                });
            }
        });
        console.log('Inventory differences calculated');
    } catch (error) {
        console.error('Error calculating differences:', error);
        showNotification('Error updating inventory');
    }
}

// Actualiza las etiquetas de ventas según los códigos de tripulación
function updateSalesLabels() {
    try {
        for (let i = 1; i <= 4; i++) {
            const crewCode = document.getElementById(`crewcode${i}`);
            const salesLabel = document.getElementById(`salesLabel${i}`);
            if (crewCode && salesLabel) {
                const code = crewCode.value.trim() || `Crew ${i}`;
                salesLabel.textContent = `${code} Sales`;
                crewCode.addEventListener('input', () => {
                    const newCode = crewCode.value.trim() || `Crew ${i}`;
                    salesLabel.textContent = `${newCode} Sales`;
                    console.log(`Updated sales label ${i}: ${newCode}`);
                    saveFormData();
                });
            }
        }
        console.log('Updated sales labels');
    } catch (error) {
        console.error('Error updating sales labels:', error);
        showNotification('Error updating sales labels');
    }
}

// Calcula el total de ventas
function calculateTotalSales() {
    try {
        const salesInputs = [
            document.getElementById('salesCrew1'),
            document.getElementById('salesCrew2'),
            document.getElementById('salesCrew3'),
            document.getElementById('salesCrew4')
        ];
        const totalSalesInput = document.getElementById('totalSales');
        const totalPaxInput = document.getElementById('totalPax');
        const averageInput = document.getElementById('average');
        if (totalSalesInput && totalPaxInput && averageInput) {
            const total = salesInputs.reduce((sum, input) => {
                const value = parseFloat(input.value) || 0;
                console.log(`Sales input ${input.id}: ${value}`);
                return sum + value;
            }, 0);
            totalSalesInput.value = total.toFixed(2);
            const totalPax = parseInt(totalPaxInput.value) || 0;
            averageInput.value = totalPax > 0 ? (total / totalPax).toFixed(2) : '0.00';
            salesInputs.forEach(input => {
                input.addEventListener('input', () => {
                    const newTotal = salesInputs.reduce((sum, inp) => sum + (parseFloat(inp.value) || 0), 0);
                    totalSalesInput.value = newTotal.toFixed(2);
                    const newTotalPax = parseInt(totalPaxInput.value) || 0;
                    averageInput.value = newTotalPax > 0 ? (newTotal / newTotalPax).toFixed(2) : '0.00';
                    console.log(`New total sales: ${newTotal}, Pax: ${newTotalPax}, Average: ${averageInput.value}`);
                    saveFormData();
                });
            });
            console.log('Calculated total sales:', total);
        }
    } catch (error) {
        console.error('Error calculating total sales:', error);
        showNotification('Error calculating total sales');
    }
}

// Calcula el total de pasajeros
function calculateTotalPax() {
    try {
        const paxInputs = document.querySelectorAll('.finalPax');
        const totalPaxInput = document.getElementById('totalPax');
        const averageInput = document.getElementById('average');
        const totalSalesInput = document.getElementById('totalSales');
        if (totalPaxInput && averageInput && totalSalesInput) {
            const totalPax = Array.from(paxInputs).reduce((sum, input) => {
                const value = parseInt(input.value) || 0;
                console.log(`Pax input ${input.id || input.className}: ${value}`);
                return sum + value;
            }, 0);
            totalPaxInput.value = totalPax;
            const totalSales = parseFloat(totalSalesInput.value) || 0;
            averageInput.value = totalPax > 0 ? (totalSales / totalPax).toFixed(2) : '0.00';
            paxInputs.forEach(input => {
                input.addEventListener('input', () => {
                    const newTotalPax = Array.from(paxInputs).reduce((sum, inp) => sum + (parseInt(inp.value) || 0), 0);
                    totalPaxInput.value = newTotalPax;
                    const newTotalSales = parseFloat(totalSalesInput.value) || 0;
                    averageInput.value = newTotalPax > 0 ? (newTotalSales / newTotalPax).toFixed(2) : '0.00';
                    console.log(`New total pax: ${newTotalPax}, Sales: ${newTotalSales}, Average: ${averageInput.value}`);
                    saveFormData();
                });
            });
            console.log('Calculated total pax:', totalPax);
        }
    } catch (error) {
        console.error('Error calculating total pax:', error);
        showNotification('Error calculating total pax');
    }
}

// Genera el PDF con los datos del formulario
function generatePDF(formData) {
    try {
        if (!window.jspdf) throw new Error('jsPDF library not loaded');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Flight Report', 10, 10);
        doc.setFontSize(12);
        doc.text(`Date: ${formData.date || 'N/A'}`, 10, 20);
        doc.text(`Aircraft: ${formData.acReg || 'N/A'}`, 100, 20);

        // Flight Information
        doc.text('Flight Information', 10, 30);
        doc.autoTable({
            head: [['#', 'Route', 'Flight No.', 'Time', 'Dep.', 'Arr.', 'Pax', 'FWD', 'AFT', 'W/C']],
            body: formData.flights.map((flight, index) => [
                index + 1,
                flight.route || '',
                flight.flightNumber || '',
                flight.time || '',
                flight.departure || '',
                flight.arrival || '',
                flight.finalPax || '0',
                flight.fwd || '0',
                flight.aft || '0',
                flight.wheelchair || ''
            ]),
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 10 },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 25 },
                2: { cellWidth: 25 },
                3: { cellWidth: 20 },
                4: { cellWidth: 20 },
                5: { cellWidth: 20 },
                6: { cellWidth: 15 },
                7: { cellWidth: 15 },
                8: { cellWidth: 15 },
                9: { cellWidth: 20 }
            }
        });

        // Crew Information
        let y = doc.lastAutoTable.finalY + 10;
        doc.text('Crew Information', 10, y);
        doc.text(`Captain: ${formData.captain || 'N/A'}`, 10, y + 5);
        doc.text(`First Officer: ${formData.firstOfficer || 'N/A'}`, 100, y + 5);
        doc.autoTable({
            head: [['Crew', 'Name', 'Code']],
            body: formData.crew.map((crew, index) => [
                index < 4 ? `No. ${index + 1}` : `Extra ${index - 3}`,
                crew.name || '',
                crew.code || ''
            ]),
            startY: y + 10,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 10 }
        });

        // Description
        y = doc.lastAutoTable.finalY + 10;
        doc.text('Description', 10, y);
        doc.text(formData.description || 'N/A', 10, y + 5);

        // Product Inventory
        y += 15;
        doc.text('Product Inventory', 10, y);
        doc.autoTable({
            head: [['Product', 'Initial', 'Final', 'Sold']],
            body: formData.products.map(item => [
                item.name || '',
                item.open || '0',
                item.close || '0',
                item.sold || '0'
            ]),
            startY: y + 5,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 10 }
        });

        // Seals and Equipment
        y = doc.lastAutoTable.finalY + 10;
        doc.text(`Seals - Yellow: ${formData.seals.yellow || 'N/A'}, Green: ${formData.seals.green || 'N/A'}, Metal: ${formData.seals.metal || 'N/A'}`, 10, y);
        doc.autoTable({
            head: [['Equipment', 'Quantity']],
            body: [
                ['Kettles', formData.equipment.kettles || '0'],
                ['Cupholder', formData.equipment.cupholder || '0'],
                ['Baby Warmer', formData.equipment.babyWarmer || '0'],
                ['Cooler Bag', formData.equipment.coolerBag || '0']
            ],
            startY: y + 5,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 10 }
        });

        // Duty-Free Inventory
        y = doc.lastAutoTable.finalY + 10;
        doc.text('Duty-Free Inventory', 10, y);
        doc.autoTable({
            head: [['Item', 'Initial', 'Final', 'Sold']],
            body: formData.dutyFreeProducts.map(item => [
                item.name || '',
                item.open || '0',
                item.close || '0',
                item.sold || '0'
            ]),
            startY: y + 5,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 10 }
        });

        // Duty-Free Seal
        y = doc.lastAutoTable.finalY + 10;
        doc.text(`Duty-Free Seal: ${formData.dutyFreeSeal || 'N/A'}`, 10, y);

        // Sales and Totals
        y += 10;
        doc.text('Sales and Totals', 10, y);
        doc.autoTable({
            head: [['Crew', 'Sales (€)']],
            body: [
                [formData.crew[0]?.code || 'Crew 1', formData.salesForm.crew1 || '0.00'],
                [formData.crew[1]?.code || 'Crew 2', formData.salesForm.crew2 || '0.00'],
                [formData.crew[2]?.code || 'Crew 3', formData.salesForm.crew3 || '0.00'],
                [formData.crew[3]?.code || 'Crew 4', formData.salesForm.crew4 || '0.00']
            ],
            startY: y + 5,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 10 }
        });

        y = doc.lastAutoTable.finalY + 5;
        doc.text(`Total Sales: ${formData.salesForm.total || '0.00'} €`, 10, y);
        doc.text(`Total Pax: ${formData.totalPax || '0'}`, 100, y);
        doc.text(`Average: ${formData.salesForm.average || '0.00'} €`, 150, y);

        return doc;
    } catch (error) {
        console.error('Error generating PDF:', error);
        showNotification('Error generating PDF');
        throw error;
    }
}

// Recolecta todos los datos del formulario
function collectFormData() {
    try {
        const crewData = [];
        for (let i = 1; i <= 4; i++) {
            const crewCode = document.getElementById(`crewcode${i}`);
            const crewName = document.querySelector(`#crewTable tbody tr:nth-child(${i}) .crewName`);
            crewData.push({
                code: crewCode ? crewCode.value || '' : '',
                name: crewName ? crewName.value || '' : ''
            });
        }
        for (let i = 1; i <= 2; i++) {
            const extraCrewRow = document.getElementById(`extraCrew${i}`);
            if (extraCrewRow && extraCrewRow.style.display === 'table-row') {
                crewData.push({
                    code: extraCrewRow.querySelector('.crewcode').value || '',
                    name: extraCrewRow.querySelector('.crewName').value || ''
                });
            }
        }
        const formData = {
            date: document.getElementById('date').value || '',
            acReg: document.getElementById('acReg').value || '',
            flights: Array.from(document.querySelectorAll('#flightsTableBody tr')).map(row => ({
                route: row.querySelector('.route').value || '',
                flightNumber: row.querySelector('.flightNumber').value || '',
                time: row.querySelector('.flightTime').value || '',
                departure: row.querySelector('.departure').value || '',
                arrival: row.querySelector('.arrival').value || '',
                finalPax: row.querySelector('.finalPax').value || '0',
                fwd: row.querySelector('.fwd').value || '0',
                aft: row.querySelector('.aft').value || '0',
                wheelchair: row.querySelector('.wheelchair').value || ''
            })),
            captain: document.getElementById('captain').value || '',
            firstOfficer: document.getElementById('firstOfficer').value || '',
            crew: crewData,
            description: document.getElementById('description').value || '',
            products: Array.from(document.querySelectorAll('#productTable tbody tr')).map(row => ({
                name: row.cells[0].textContent || '',
                open: row.querySelector('.open').value || '0',
                close: row.querySelector('.close').value || '0',
                sold: row.querySelector('.difference-cell').textContent || '0'
            })),
            seals: {
                yellow: document.getElementById('yellowSeal').value || '',
                green: document.getElementById('greenSeal').value || '',
                metal: document.getElementById('metalSeal').value || ''
            },
            equipment: {
                kettles: document.getElementById('kettles').value || '0',
                cupholder: document.getElementById('cupholder').value || '0',
                babyWarmer: document.getElementById('babyWarmer').value || '0',
                coolerBag: document.getElementById('coolerBag').value || '0'
            },
            dutyFreeProducts: Array.from(document.querySelectorAll('#dutyFreeTable tbody tr')).map(row => ({
                name: row.cells[0].textContent || '',
                open: row.querySelector('.open').value || '0',
                close: row.querySelector('.close').value || '0',
                sold: row.querySelector('.difference-cell').textContent || '0'
            })),
            dutyFreeSeal: document.getElementById('dutyFreeMetalSeal').value || '',
            salesForm: {
                crew1: parseFloat(document.getElementById('salesCrew1').value) || 0.00,
                crew2: parseFloat(document.getElementById('salesCrew2').value) || 0.00,
                crew3: parseFloat(document.getElementById('salesCrew3').value) || 0.00,
                crew4: parseFloat(document.getElementById('salesCrew4').value) || 0.00,
                total: parseFloat(document.getElementById('totalSales').value) || 0.00,
                average: parseFloat(document.getElementById('average').value) || 0.00
            },
            totalPax: parseInt(document.getElementById('totalPax').value) || 0
        };
        console.log('Collected form data:', formData);
        return formData;
    } catch (error) {
        console.error('Error collecting form data:', error);
        showNotification('Error collecting form data');
        throw error;
    }
}

// Maneja el envío del formulario y genera el PDF
function handleFormSubmission() {
    try {
        console.log('Form submitted');
        const formData = collectFormData();
        const pdfDoc = generatePDF(formData);
        const pdfBlob = pdfDoc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = pdfUrl;
        downloadLink.download = `FlightReport_${formData.date || 'Untitled'}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(pdfUrl);
        showNotification('Report generated successfully');
        console.log('PDF downloaded');
    } catch (error) {
        console.error('Error submitting form:', error);
        showNotification('Error generating PDF');
    }
}

// Inicializa el formulario
function initializeForm() {
    try {
        loadFormData();
        calculateDifference();
        updateSalesLabels();
        calculateTotalSales();
        calculateTotalPax();
        document.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', saveFormData);
        });
        console.log('Form initialized');
    } catch (error) {
        console.error('Error initializing form:', error);
        showNotification('Error initializing form');
    }
}

document.addEventListener('DOMContentLoaded', initializeForm);
