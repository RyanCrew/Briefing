```javascript
let activeFlight = null;
let extraCrewCount = 0;

function showNotification(message, duration = 3000) {
    console.log('Notification:', message);
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, duration);
    } else {
        console.error('Notification element not found');
    }
}

function collectFormData() {
    try {
        const crewData = [];
        for (let i = 1; i <= 4; i++) {
            const crewCode = document.getElementById(`crewcode${i}`);
            const crewName = document.querySelector(`#crewTable tbody tr:nth-child(${i}) .crewName`);
            crewData.push({
                code: crewCode ? crewCode.value || '' : '',
                name: crewName ? crewName.value || '' : '',
            });
        }
        for (let i = 1; i <= 2; i++) {
            const extraCrewRow = document.getElementById(`extraCrew${i}`);
            if (extraCrewRow && extraCrewRow.style.display === 'table-row') {
                crewData.push({
                    code: extraCrewRow.querySelector('.crewcode').value || '',
                    name: extraCrewRow.querySelector('.crewName').value || '',
                });
            }
        }
        return {
            date: document.getElementById('date').value || '',
            acReg: document.getElementById('acReg').value || '',
            flights: Array.from(document.querySelectorAll('#flightsTableBody tr')).map(row => ({
                route: row.querySelector('.route').value || '',
                flightNumber: row.querySelector('.flightNumber').value || '',
                time: row.querySelector('.flightTime').value || '',
                departure: row.querySelector('.departure').value || '',
                arrival: row.querySelector('.arrival').value || '',
                finalPax: row.querySelector('.finalPax').value || '0',
                fwd: row.querySelector('.fwd').value || '',
                aft: row.querySelector('.aft').value || '',
                wheelchair: row.querySelector('.wheelchair').value || '',
            })),
            captain: document.getElementById('captain').value || '',
            firstOfficer: document.getElementById('firstOfficer').value || '',
            crew: crewData,
            description: document.getElementById('description').value || '',
            products: Array.from(document.querySelectorAll('#productTable tbody tr')).map(row => ({
                name: row.cells[0].textContent || '',
                open: row.querySelector('.open').value || '',
                close: row.querySelector('.close').value || '',
                sold: row.querySelector('.difference-cell').textContent || '',
            })),
            seals: {
                yellow: document.getElementById('yellowSeal').value || '',
                green: document.getElementById('greenSeal').value || '',
                metal: document.getElementById('metalSeal').value || '',
            },
            equipment: {
                kettles: document.getElementById('kettles').value || '',
                cupholder: document.getElementById('cupholder').value || '',
                babyWarmer: document.getElementById('babyWarmer').value || '',
                coolerBag: document.getElementById('coolerBag').value || '',
            },
            dutyFreeProducts: Array.from(document.querySelectorAll('#dutyFreeTable tbody tr')).map(row => ({
                name: row.cells[0].textContent || '',
                open: row.querySelector('.open').value || '',
                close: row.querySelector('.close').value || '',
                sold: row.querySelector('.difference-cell').textContent || '',
            })),
            dutyFreeSeal: document.getElementById('dutyFreeMetalSeal')?.value || '',
            salesForm: {
                crew1: document.getElementById('salesCrew1').value || '',
                crew2: document.getElementById('salesCrew2').value || '',
                crew3: document.getElementById('salesCrew3').value || '',
                crew4: document.getElementById('salesCrew4').value || '',
                total: document.getElementById('totalSales').value || '',
                average: document.getElementById('average').value || '',
            },
            totalPax: document.getElementById('totalPax').value || '0',
        };
    } catch (error) {
        console.error('Error collecting form data:', error);
        showNotification('Error collecting form data');
        throw error;
    }
}

function saveFormData() {
    try {
        const formData = collectFormData();
        localStorage.setItem('flightReportData', JSON.stringify(formData));
        localStorage.setItem('extraCrewCount', extraCrewCount);
        console.log('Form data saved');
    } catch (error) {
        console.error('Error saving form:', error);
        showNotification('Error saving form data');
    }
}

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
            console.log('Form data loaded');
        }
    } catch (error) {
        console.error('Error loading form:', error);
        showNotification('Error loading saved data');
    }
}

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
            flightInfoHeader.style.display = 'grid';
            stockSection.style.display = 'block';
            dutyFreeSection.style.display = 'block';
            salesSection.style.display = 'block';
            crewSection.style.display = 'block';
        } else {
            activeFlight = flightNumber;
            flightRows.forEach(row => {
                row.style.display = row.dataset.flight === flightNumber ? 'table-row' : 'none';
            });
            flightInfoHeader.style.display = 'none';
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

function addExtraCrew() {
    try {
        if (extraCrewCount >= 2) {
            showNotification('Maximum extra crew reached');
            return;
        }
        extraCrewCount++;
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
            showNotification('Error adding crew');
        }
    } catch (error) {
        console.error('Error adding extra crew:', error);
        showNotification('Error adding extra crew');
    }
}

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
                        const openValue = parseInt(openInput.value) || 0;
                        const closeValue = parseInt(closeInput.value) || 0;
                        soldCell.textContent = openValue - closeValue || 0;
                        openInput.addEventListener('input', () => {
                            soldCell.textContent = (parseInt(openInput.value) || 0) - (parseInt(closeInput.value) || 0) || 0;
                            saveFormData();
                        });
                        closeInput.addEventListener('input', () => {
                            soldCell.textContent = (parseInt(openInput.value) || 0) - (parseInt(closeInput.value) || 0) || 0;
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

function updateSalesLabels() {
    try {
        for (let i = 1; i <= 4; i++) {
            const crewCode = document.getElementById(`crewcode${i}`);
            const salesLabel = document.getElementById(`salesLabel${i}`);
            if (crewCode && salesLabel) {
                const code = crewCode.value.trim() || `Crew ${i}`;
                salesLabel.textContent = `${code} Sales`;
                crewCode.addEventListener('input', () => {
                    salesLabel.textContent = `${crewCode.value.trim() || `Crew ${i}`} Sales`;
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

function calculateTotalSales() {
    try {
        const salesInputs = [
            document.getElementById('salesCrew1'),
            document.getElementById('salesCrew2'),
            document.getElementById('salesCrew3'),
            document.getElementById('salesCrew4'),
        ];
        const totalSalesInput = document.getElementById('totalSales');
        const totalPaxInput = document.getElementById('totalPax');
        const averageInput = document.getElementById('average');
        if (totalSalesInput && totalPaxInput && averageInput) {
            const total = salesInputs.reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
            totalSalesInput.value = total.toFixed(2);
            const totalPax = parseInt(totalPaxInput.value) || 0;
            averageInput.value = totalPax > 0 ? (total / totalPax).toFixed(2) : '0.00';
            salesInputs.forEach(input => {
                input.addEventListener('input', () => {
                    const newTotal = salesInputs.reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
                    totalSalesInput.value = newTotal.toFixed(2);
                    const newTotalPax = parseInt(totalPaxInput.value) || 0;
                    averageInput.value = newTotalPax > 0 ? (newTotal / newTotalPax).toFixed(2) : '0.00';
                    saveFormData();
                });
            });
            console.log('Calculated total sales:', total);
        } else {
            showNotification('Error: Missing sales elements');
        }
    } catch (error) {
        console.error('Error calculating total sales:', error);
        showNotification('Error calculating total sales');
    }
}

function calculateTotalPax() {
    try {
        const paxInputs = document.querySelectorAll('.finalPax');
        const totalPaxInput = document.getElementById('totalPax');
        const averageInput = document.getElementById('average');
        const totalSalesInput = document.getElementById('totalSales');
        if (totalPaxInput && averageInput && totalSalesInput) {
            const totalPax = Array.from(paxInputs).reduce((sum, input) => sum + (parseInt(input.value) || 0), 0);
            totalPaxInput.value = totalPax;
            const totalSales = parseFloat(totalSalesInput.value) || 0;
            averageInput.value = totalPax > 0 ? (totalSales / totalPax).toFixed(2) : '0.00';
            paxInputs.forEach(input => {
                input.addEventListener('input', () => {
                    const newTotalPax = Array.from(paxInputs).reduce((sum, input) => sum + (parseInt(input.value) || 0), 0);
                    totalPaxInput.value = newTotalPax;
                    const newTotalSales = parseFloat(totalSalesInput.value) || 0;
                    averageInput.value = newTotalPax > 0 ? (newTotalSales / newTotalPax).toFixed(2) : '0.00';
                    saveFormData();
                });
            });
            console.log('Calculated total Pax:', totalPax);
        } else {
            showNotification('Error: Missing pax element');
        }
    } catch (error) {
        console.error('Error calculating total pax:', error);
        showNotification('Error calculating total pax');
    }
}

function generatePDF(formData) {
    try {
        if (!window.jspdf) {
            throw new Error('jsPDF library not loaded');
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Flight Report', 10, 10);
        doc.setFontSize(12);
        doc.text(`Date: ${formData.date || 'N/A'}`, 10, 20);
        doc.text(`Aircraft: ${formData.acReg || ''}`, 100, 20);

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
                flight.fwd || '',
                flight.aft || '',
                flight.wheelchair || '',
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
                9: { cellWidth: 20 },
            },
        });

        let y = doc.lastAutoTable.finalY + 10;
        doc.text('Crew Information', 10, y);
        doc.text(`Captain: ${formData.captain || ''}`, 10, y + 5);
        doc.text(`First Officer: ${formData.firstOfficer || ''}`, 100, y + 5);
        doc.autoTable({
            head: [['Crew', 'Name', 'Code']],
            body: formData.crew.map((crew, index) => [
                index < 4 ? `No. ${index + 1}` : `Extra ${index - 3 + 1}`,
                crew.name || '',
                crew.code || '',
            ]),
            startY: y + 10,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 10 },
        });

        y = doc.lastAutoTable.finalY + 10;
        doc.text('Description', 10, y);
        doc.text(formData.description || 'N/A', 10, y + 5);

        y += 15;
        doc.text('Product Inventory', 10, y);
        doc.autoTable({
            head: [['Product', 'Initial', 'Final', 'Sold']],
            body: formData.products.map(item => [
                item.name || '',
                item.open || '',
                item.close || '',
                item.sold || '',
            ]),
            startY: y + 5,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 10 },
        });

        y = doc.lastAutoTable.finalY + 10;
        doc.text(`Seals - Yellow: ${formData.seals.yellow || ''}, Green: ${formData.seals.green || ''}, Metal: ${formData.seals.metal || ''}`, 10, y);
        doc.autoTable({
            head: [['Equipment', 'Quantity']],
            body: [
                ['Kettles', formData.equipment.kettles || ''],
                ['Cupholder', formData.equipment.cupholder || ''],
                ['Baby Warmer', formData.equipment.babyWarmer || ''],
                ['Cooler Bag', formData.equipment.coolerBag || ''],
            ],
            startY: y + 5,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 10 },
        });

        y = doc.lastAutoTable.finalY + 10;
        doc.text('Duty-Free Inventory', 10, y);
        doc.autoTable({
            head: [['Item', 'Initial', 'Final', 'Sold']],
            body: formData.dutyFreeProducts.map(item => [
                item.name || '',
                item.open || '',
                item.close || '',
                item.sold || '',
            ]),
            startY: y + 5,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 10 },
        });

        y = doc.lastAutoTable.finalY + 10;
        doc.text(`Duty-Free Seal: ${formData.dutyFreeSeal || ''}`, 10, y);

        y += 10;
        doc.text('Sales and Totals', 10, y);
        doc.autoTable({
            head: [['Crew', 'Sales (€)']],
            body: [
                [`${document.getElementById('crewcode1').value || 'Crew 1'}`, formData.salesForm.crew1 || '0'],
                [`${document.getElementById('crewcode2').value || 'Crew 2'}`, formData.salesForm.crew2 || '0'],
                [`${document.getElementById('crewcode3').value || 'Crew 3'}`, formData.salesForm.crew3 || '0'],
                [`${document.getElementById('crewcode4').value || 'Crew 4'}`, formData.salesForm.crew4 || '0'],
            ],
            startY: y + 5,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 10 },
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

function handleFormSubmission() {
    try {
        console.log('Submitting form');
        const formData = collectFormData();
        const pdfDoc = generatePDF(formData);
        const pdfBlob = pdfDoc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = pdfUrl;
        downloadLink.download = `Flight_Report_${formData.date || 'Untitled'}.pdf`;
        document.body.appendChild(downloadLink);
        setTimeout(() => {
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(pdfUrl);
            showNotification('Report generated successfully');
            console.log('PDF downloaded');
        }, 100);
    } catch (error) {
        console.error('Error submitting form:', error);
        showNotification('Error: ' + error.message);
    }
}

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
```
