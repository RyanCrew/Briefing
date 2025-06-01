const airports = [
    { code: "TIA", name: "Tirana Airport" },
    { code: "FMM", name: "Algovia Airport Memmingen" },
    { code: "BER", name: "Berlin Brandenburg Airport" },
    { code: "ALC", name: "Alicante-Elche Airport" },
    { code: "MAD", name: "Madrid-Barajas Airport" },
    { code: "STN", name: "London Stansted Airport" },
];

let activeFlight = null;
let extraCrewCount = 0;
let activeStockTab = 'product';

function populateAirports() {
    try {
        const selects = document.querySelectorAll('.airport-select');
        if (selects.length === 0) {
            console.warn('No elements with class "airport-select" found.');
            return;
        }
        selects.forEach(select => {
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

function showNotification(message, duration = 5000) {
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

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function saveFormData() {
    try {
        const formData = collectFormData();
        localStorage.setItem('flightReportData', JSON.stringify(formData));
        localStorage.setItem('extraCrewCount', extraCrewCount);
    } catch (err) {
        console.error('Error saving form data:', err);
    }
}

function loadFormData() {
    try {
        const savedData = localStorage.getItem('flightReportData');
        const savedExtraCrewCount = localStorage.getItem('extraCrewCount');
        if (savedData) {
            const data = JSON.parse(savedData);
            document.getElementById('date').value = data.date || '';
            document.getElementById('acReg').value = data.acReg || '';
            const flightRows = document.querySelectorAll('#flightsTableBody tr');
            data.flights.forEach((flight, index) => {
                if (flightRows[index]) {
                    flightRows[index].querySelector('.route').value = flight.route || '';
                    flightRows[index].querySelector('.flightNumber').value = flight.flightNumber || '';
                    flightRows[index].querySelector('.departure').value = flight.departure || '';
                    flightRows[index].querySelector('.arrival').value = flight.arrival || '';
                    flightRows[index].querySelector('.flightTime').value = flight.time || '';
                    flightRows[index].querySelector('.finalPax').value = flight.finalPax || '';
                    flightRows[index].querySelector('.fwd').value = flight.fwd || '';
                    flightRows[index].querySelector('.aft').value = flight.aft || '';
                    flightRows[index].querySelector('.wheelchair').value = flight.wheelchair || '';
                }
            });

            document.getElementById('captain').value = data.captain || '';
            document.getElementById('firstOfficer').value = data.firstOfficer || '';
            data.crew.forEach((crew, index) => {
                if (index < 4) {
                    document.getElementById(`crewcode${index + 1}`).value = crew.crewcode || '';
                    document.querySelector(`#crewTable tbody tr:nth-child(${index + 1}) .crewName`).value = crew.name || '';
                } else {
                    const extraIndex = index - 3;
                    const extraRow = document.getElementById(`extraCrew${extraIndex}`);
                    if (extraRow) {
                        extraRow.style.display = 'table-row';
                        extraRow.querySelector('.crewcode').value = crew.crewcode || '';
                        extraRow.querySelector('.crewName').value = crew.name || '';
                    }
                }
            });
            document.getElementById('description').value = data.description || '';

            const productRows = document.querySelectorAll('#productTable tbody tr');
            data.products.items.forEach((item, index) => {
                if (productRows[index]) {
                    productRows[index].querySelector('.open').value = item.open || '';
                    productRows[index].querySelector('.close').value = item.close || '';
                }
            });
            document.getElementById('yellowSeal').value = data.products.seals.yellow || '';
            document.getElementById('greenSeal').value = data.products.seals.green || '';
            document.getElementById('metalSeal').value = data.products.seals.metal || '';
            document.getElementById('kettles').value = data.products.equipment.kettles || '';
            document.getElementById('cupholder').value = data.products.equipment.cupholder || '';
            document.getElementById('babyWarmer').value = data.products.equipment.babyWarmer || '';
            document.getElementById('coolerBag').value = data.products.equipment.coolerBag || '';

            const dutyFreeRows = document.querySelectorAll('#dutyFreeTable tbody tr');
            data.dutyFreeProducts.items.forEach((item, index) => {
                if (dutyFreeRows[index]) {
                    dutyFreeRows[index].querySelector('.open').value = item.open || '';
                    dutyFreeRows[index].querySelector('.close').value = item.close || '';
                }
            });
            document.getElementById('dutyFreeMetalSeal').value = data.dutyFreeProducts.seal || '';

            document.getElementById('salesCrew1').value = data.sales.salesCrew1 || '';
            document.getElementById('salesCrew2').value = data.sales.salesCrew2 || '';
            document.getElementById('salesCrew3').value = data.sales.salesCrew3 || '';
            document.getElementById('salesCrew4').value = data.sales.salesCrew4 || '';
            document.getElementById('totalSales').value = data.sales.totalSales || '';
            document.getElementById('totalPax').value = data.totalPax || '';
            document.getElementById('overallAverage').value = data.sales.overallAverage || '';

            if (savedExtraCrewCount) {
                extraCrewCount = parseInt(savedExtraCrewCount) || 0;
                const addButton = document.querySelector('.add-crew-button');
                if (addButton && extraCrewCount >= 2) {
                    addButton.style.display = 'none';
                }
            }
        }
    } catch (err) {
        showNotification('Error loading form data: ' + err.message);
    }
}

function clearForm() {
    try {
        document.getElementById('inflightForm').reset();
        document.querySelectorAll('.difference-cell').forEach(cell => cell.textContent = '');
        document.querySelectorAll('.extra-crew').forEach(row => {
            row.style.display = 'none';
            row.querySelectorAll('input').forEach(input => input.value = '');
        });
        extraCrewCount = 0;
        const addButton = document.querySelector('.add-crew-button');
        if (addButton) addButton.style.display = 'inline-block';
        localStorage.removeItem('flightReportData');
        localStorage.removeItem('extraCrewCount');
        updateSalesLabels();
        calculateTotalPax();
        calculateTotalSales();
    } catch (err) {
        showNotification('Error clearing form: ' + err.message);
    }
}

function toggleFlightView(flightNumber) {
    try {
        const flightRows = document.querySelectorAll('#flightsTableBody tr');
        const flightInfoHeader = document.getElementById('flightInfoHeader');
        const stockSection = document.querySelector('#stockSection');
        const salesSection = document.querySelector('#salesSection');
        const crewSection = document.querySelector('#crewSection');
        if (!flightRows || !flightInfoHeader || !stockSection || !salesSection || !crewSection) {
            showNotification('Error: Missing elements required to toggle flights.');
            return;
        }
        if (activeFlight === flightNumber) {
            activeFlight = null;
            flightRows.forEach(row => (row.style.display = ''));
            flightInfoHeader.style.display = 'grid';
            stockSection.style.display = '';
            salesSection.style.display = '';
            crewSection.style.display = '';
        } else {
            activeFlight = flightNumber;
            flightRows.forEach(row => {
                row.style.display = row.getAttribute('data-flight') === flightNumber ? '' : 'none';
            });
            flightInfoHeader.style.display = 'none';
            stockSection.style.display = 'none';
            salesSection.style.display = 'none';
            crewSection.style.display = '';
        }
        saveFormData();
    } catch (err) {
        showNotification('Error toggling flight view: ' + err.message);
    }
}

function addExtraCrew() {
    try {
        if (extraCrewCount >= 2) {
            showNotification('Maximum of 2 extra crew members reached.');
            return;
        }
        extraCrewCount++;
        const extraRow = document.getElementById(`extraCrew${extraCrewCount}`);
        if (!extraRow) {
            showNotification(`Error: Extra crew row ${extraCrewCount} not found.`);
            extraCrewCount--;
            return;
        }
        extraRow.style.display = 'table-row';
        showNotification(`Extra crew member ${extraCrewCount} added.`);
        if (extraCrewCount === 2) {
            const addButton = document.querySelector('.add-crew-button');
            if (addButton) addButton.style.display = 'none';
        }
        saveFormData();
    } catch (err) {
        showNotification('Error adding extra crew: ' + err.message);
    }
}

function removeExtraCrew(index) {
    try {
        const extraRow = document.getElementById(`extraCrew${index}`);
        if (!extraRow) {
            showNotification(`Error: Extra crew row ${index} not found.`);
            return;
        }
        extraRow.style.display = 'none';
        extraRow.querySelectorAll('input').forEach(input => (input.value = ''));
        extraCrewCount--;
        const addButton = document.querySelector('.add-crew-button');
        if (addButton) addButton.style.display = 'inline-block';
        saveFormData();
    } catch (err) {
        showNotification('Error removing extra crew: ' + err.message);
    }
}

function toggleStockView(type) {
    try {
        const productTable = document.getElementById('productStockTable');
        const dutyFreeTable = document.getElementById('dutyFreeStockTable');
        const productTab = document.getElementById('productStockTab');
        const dutyFreeTab = document.getElementById('dutyFreeStockTab');
        if (!productTable || !dutyFreeTable || !productTab || !dutyFreeTab) {
            showNotification('Error: Missing inventory table or tab elements.');
            return;
        }
        productTable.style.display = type === 'product' ? 'block' : 'none';
        dutyFreeTable.style.display = type === 'dutyFree' ? 'block' : 'none';
        productTab.classList.toggle('active', type === 'product');
        dutyFreeTab.classList.toggle('active', type === 'dutyFree');
        activeStockTab = type;
        const stockSection = document.getElementById('stockSection');
        if (stockSection && !stockSection.hasAttribute('open')) {
            stockSection.setAttribute('open', '');
        }
        saveFormData();
    } catch (err) {
        showNotification('Error toggling inventory view: ' + err.message);
    }
}

function calculateDifference(tableId) {
    try {
        const table = document.getElementById(tableId);
        if (!table) {
            showNotification(`Error: Table with ID '${tableId}' not found.`);
            return;
        }
        const rows = table.getElementsByTagName('tr');
        for (const row of rows) {
            const openInput = row.querySelector('.open');
            const closeInput = row.querySelector('.close');
            const soldCell = row.querySelector('.difference-cell');
            if (openInput && closeInput && soldCell) {
                const updateSales = () => {
                    const openVal = parseInt(openInput.value) || 0;
                    const closeVal = parseInt(closeInput.value) || 0;
                    soldCell.textContent = `${openVal - closeVal}`;
                    saveFormData();
                };
                openInput.addEventListener('input', updateSales);
                closeInput.addEventListener('input', updateSales);
                updateSales();
            }
        }
    } catch (err) {
        showNotification('Error calculating differences: ' + err.message);
    }
}

function updateSalesLabels() {
    try {
        const crewInputs = [
            document.getElementById('crewcode1'),
            document.getElementById('crewcode2'),
            document.getElementById('crewcode3'),
            document.getElementById('crewcode4'),
        ];
        const salesLabels = [
            document.getElementById('salesLabel1'),
            document.getElementById('salesLabel2'),
            document.getElementById('salesLabel3'),
            document.getElementById('salesLabel4'),
        ];
        crewInputs.forEach((input, idx) => {
            if (input && salesLabels[idx]) {
                const updateLabel = () => {
                    const code = input.value.trim() || `Crew ${idx + 1}`;
                    salesLabels[idx].textContent = `Sales ${code}`;
                    saveFormData();
                };
                input.addEventListener('input', updateLabel);
                updateLabel();
            }
        });
    } catch (err) {
        showNotification('Error updating sales labels: ' + err.message);
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
        const totalSales = document.getElementById('totalSales');
        const totalPax = document.getElementById('totalPax');
        const overallAverage = document.getElementById('overallAverage');
        if (!totalSales || !totalPax || !overallAverage) {
            return;
        }
        const updateTotal = () => {
            const total = salesInputs.reduce((sum, input) => {
                const value = parseFloat(input.value) || 0;
                return sum + value;
            }, 0);
            totalSales.value = total.toFixed(2);
            const paxCount = parseInt(totalPax.value) || 1;
            overallAverage.value = (total / paxCount).toFixed(2);
            saveFormData();
        };
        salesInputs.forEach(input => {
            if (input) input.addEventListener('input', updateTotal);
        });
        updateTotal();
    } catch (err) {
        showNotification('Error calculating total sales: ' + err.message);
    }
}

function calculateTotalPax() {
    try {
        const paxInputs = document.querySelectorAll('.finalPax');
        const totalPax = document.getElementById('totalPax');
        if (!totalPax) return;
        const updateTotal = () => {
            const total = Array.from(paxInputs).reduce((sum, input) => {
                const value = parseInt(input.value) || 0;
                return sum + value;
            }, 0);
            totalPax.value = total;
            calculateTotalSales();
            saveFormData();
        };
        paxInputs.forEach(input => {
            input.addEventListener('input', updateTotal);
        });
        updateTotal();
    } catch (err) {
        showNotification('Error calculating total passengers: ' + err.message);
    }
}

function generatePDF(formData) {
    try {
        if (!window.jspdf) {
            throw new Error('jsPDF library is not loaded');
        }
        const jsPDF = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        doc.setFontSize(16);
        doc.text('Flight Report', 10, 10);
        doc.setFontSize(12);
        doc.text(`Date: ${formData.date || 'N/A'}`, 10, 20);
        doc.text(`A/C Registration: ${formData.acReg || 'N/A'}`, 100, 20);

        doc.text('Flight Information', 10, 30);
        const flightHeaders = ['#', 'Route', 'Flight No.', 'Departure', 'Arrival', 'Time', 'Pax', 'FWD', 'AFT', 'W/C'];
        const flightData = formData.flights.map((f, i) => [
            i + 1,
            f.route || 'N/A',
            f.flightNumber || 'N/A',
            f.departure || 'N/A',
            f.arrival || 'N/A',
            f.time || 'N/A',
            f.finalPax || '0',
            f.fwd || '0',
            f.aft || '0',
            f.wheelchair || 'N/A',
        ]);
        doc.autoTable({
            head: [flightHeaders],
            body: flightData,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 9 },
            margin: { left: 10, right: 10 },
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
        doc.text(`Captain: ${formData.captain || 'N/A'}`, 10, y + 5);
        doc.text(`First Officer: ${formData.firstOfficer || 'N/A'}`, 100, y + 5);
        const crewHeaders = ['Crew', 'Code', 'Name'];
        const crewData = formData.crew.map((c, i) => [
            c.crewcode ? `Crew ${i + 1}` : `Extra ${i - 3}`,
            c.crewcode || 'N/A',
            c.name || 'N/A',
        ]);
        doc.autoTable({
            head: [crewHeaders],
            body: crewData,
            startY: y + 10,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 9 },
            margin: { left: 10, right: 10 },
        });

        y = doc.lastAutoTable.finalY + 10;
        doc.text('Description', 10, y);
        doc.text(formData.description || 'N/A', 10, y + 5, { maxWidth: 180 });

        y += 15;
        doc.text('Product Inventory', 10, y);
        const productHeaders = ['Product', 'Initial', 'Final', 'Sold'];
        const productData = formData.products.items.map(p => [
            p.product || 'N/A',
            p.open || '0',
            p.close || '0',
            p.sold || '0',
        ]);
        doc.autoTable({
            head: [productHeaders],
            body: productData,
            startY: y + 5,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 9 },
            margin: { left: 10, right: 10 },
        });

        y = doc.lastAutoTable.finalY + 5;
        doc.text(`Yellow Seal: ${formData.products.seals.yellow || 'N/A'}`, 10, y);
        doc.text(`Green Seal: ${formData.products.seals.green || 'N/A'}`, 70, y);
        doc.text(`Metal Seal: ${formData.products.seals.metal || 'N/A'}`, 130, y);
        y += 10;
        doc.text('Equipment', 10, y);
        const equipmentHeaders = ['Item', 'Quantity'];
        const equipmentData = [
            ['Kettles', formData.products.equipment.kettles || '0'],
            ['Cupholder', formData.products.equipment.cupholder || '0'],
            ['Baby Warmer', formData.products.equipment.babyWarmer || '0'],
            ['Cooler Bag', formData.products.equipment.coolerBag || '0'],
        ];
        doc.autoTable({
            head: [equipmentHeaders],
            body: equipmentData,
            startY: y + 5,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 9 },
            margin: { left: 10, right: 10 },
        });

        y = doc.lastAutoTable.finalY + 10;
        doc.text('Duty-Free Inventory', 10, y);
        const dutyFreeData = formData.dutyFreeProducts.items.map(row => [
            row.product || 'N/A',
            row.open || '0',
            row.close || '0',
            row.sold || '0',
        ]);
        doc.autoTable({
            head: [['Product', 'Initial', 'Final', 'Sold']],
            body: dutyFreeData,
            startY: y + 5,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 9 },
            margin: { left: 10, right: 10 },
        });

        y = doc.lastAutoTable.finalY + 5;
        doc.text(`Metal Seal: ${formData.dutyFreeProducts.seal || 'N/A'}`, 10, y);

        y += 10;
        doc.text('Sales and Totals', 10, y);
        const salesData = [
            [`Crew 1 (${document.getElementById('crewcode1').value || 'N/A'})`, formData.sales.salesCrew1 || '0.00'],
            [`Crew 2 (${document.getElementById('crewcode2').value || 'N/A'})`, formData.sales.salesCrew2 || '0.00'],
            [`Crew 3 (${document.getElementById('crewcode3').value || 'N/A'})`, formData.sales.salesCrew3 || '0.00'],
            [`Crew 4 (${document.getElementById('crewcode4').value || 'N/A'})`, formData.sales.salesCrew4 || '0.00'],
        ];
        doc.autoTable({
            head: [['Crew', 'Sales (€)']],
            body: salesData,
            startY: y + 5,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 9 },
            margin: { left: 10, right: 10 },
        });

        y = doc.lastAutoTable.finalY + 5;
        doc.text(`Total Sales: ${formData.sales.totalSales || '0.00'} €`, 10, y);
        doc.text(`Total Pax: ${formData.totalPax || '0'}`, 70, y);
        doc.text(`Average/Pax: ${formData.sales.overallAverage || '0.00'} €`, 130, y);

        return doc;
    } catch (err) {
        showNotification('Error generating PDF: ' + err.message);
        throw err;
    }
}

function collectFormData() {
    try {
        const crewData = [];
        for (let i = 1; i <= 4; i++) {
            const crewcodeInput = document.getElementById(`crewcode${i}`);
            const crewNameInput = document.querySelector(`#crewTable tbody tr:nth-child(${i}) .crewName`);
            crewData.push({
                crewcode: crewcodeInput ? crewcodeInput.value || '' : '',
                name: crewNameInput ? crewNameInput.value || '' : '',
            });
        }
        for (let i = 1; i <= 2; i++) {
            const extraRow = document.getElementById(`extraCrew${i}`);
            if (extraRow && extraRow.style.display !== 'none') {
                const crewcodeInput = extraRow.querySelector('.crewcode');
                const crewNameInput = extraRow.querySelector('.crewName');
                if (crewcodeInput && crewNameInput) {
                    crewData.push({
                        crewcode: crewcodeInput.value || '',
                        name: crewNameInput.value || '',
                    });
                }
            }
        }

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return {
            date: document.getElementById('date').value || '',
            acReg: document.getElementById('acReg').value || '',
            flights: Array.from(document.querySelectorAll('#flightsTableBody tr')).map(row => {
                const time = row.querySelector('.flightTime').value || '';
                return {
                    route: row.querySelector('.route').value || '',
                    flightNumber: row.querySelector('.flightNumber').value || '',
                    departure: row.querySelector('.departure').value || '',
                    arrival: row.querySelector('.arrival').value || '',
                    time: timeRegex.test(time) ? time : '',
                    finalPax: row.querySelector('.finalPax').value || '',
                    fwd: row.querySelector('.fwd').value || '',
                    aft: row.querySelector('.aft').value || '',
                    wheelchair: row.querySelector('.wheelchair').value || '',
                };
            }),
            captain: document.getElementById('captain').value || '',
            firstOfficer: document.getElementById('firstOfficer').value || '',
            crew: crewData,
            description: document.getElementById('description').value || '',
            products: {
                items: Array.from(document.querySelectorAll('#productTable tbody tr')).map(row => ({
                    product: row.cells[0].textContent || '',
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
            },
            dutyFreeProducts: {
                items: Array.from(document.querySelectorAll('#dutyFreeTable tbody tr')).map(row => ({
                    product: row.cells[0].textContent || '',
                    open: row.querySelector('.open').value || '',
                    close: row.querySelector('.close').value || '',
                    sold: row.querySelector('.difference-cell').textContent || '',
                })),
                seal: document.getElementById('dutyFreeMetalSeal').value || '',
            },
            sales: {
                salesCrew1: document.getElementById('salesCrew1').value || '',
                salesCrew2: document.getElementById('salesCrew2').value || '',
                salesCrew3: document.getElementById('salesCrew3').value || '',
                salesCrew4: document.getElementById('salesCrew4').value || '',
                totalSales: document.getElementById('totalSales').value || '',
                overallAverage: document.getElementById('overallAverage').value || '',
            },
            totalPax: document.getElementById('totalPax').value || '',
        };
    } catch (err) {
        showNotification('Error collecting form data: ' + err.message);
        throw err;
    }
}

function handleFormSubmission() {
    try {
        const formData = collectFormData();
        let errors = [];
        if (!formData.date) errors.push('Date is required.');
        if (!formData.acReg) errors.push('A/C Registration is required.');
        if (!formData.captain) errors.push('Captain name is required.');
        if (!formData.flights.some(flight => flight.route && flight.flightNumber)) {
            errors.push('At least one flight must have a route and flight number.');
        }
        if (!formData.crew.some(crew => crew.crewcode && crew.name)) {
            errors.push('At least one crew member must have a code and name.');
        }
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!formData.flights.every(flight => !flight.time || timeRegex.test(flight.time))) {
            errors.push('Flight time must be in HH:MM format.');
        }
        if (errors.length > 0) {
            showNotification(errors.join(' '));
            document.querySelectorAll('input:invalid, select:invalid').forEach(input => {
                input.classList.add('border-red-500');
            });
            return;
        }

        document.querySelectorAll('input, select').forEach(input => {
            input.classList.remove('border-red-500');
        });

        const dateStr = formData.date.replaceAll('-', '') || '20250101';
        const pdfFilename = `flight_report_${dateStr}.pdf`;

        const doc = generatePDF(formData);
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = pdfFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pdfUrl);

        showNotification(`Report saved as ${pdfFilename}`);
        clearForm();
    } catch (err) {
        showNotification('Error processing form: ' + err.message);
    }
}

function setupKeyboardNavigation() {
    try {
        const inputs = document.querySelectorAll('input:not([readonly]), select, textarea, button:not(.remove-crew-button)');
        inputs.forEach((input, index) => {
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.keyCode === 13) {
                    event.preventDefault();
                    const nextIndex = index + 1;
                    if (nextIndex < inputs.length) {
                        inputs[nextIndex].focus();
                    }
                }
            });
        });
    } catch (err) {
        console.error('Error setting up keyboard navigation:', err);
    }
}

function initializeForm() {
    try {
        loadFormData();
        calculateDifference('productTable');
        calculateDifference('dutyFreeTable');
        updateSalesLabels();
        calculateTotalPax();
        calculateTotalSales();
        toggleStockView('product');
        setupKeyboardNavigation();

        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', debounce(saveFormData, 300));
            input.addEventListener('input', () => input.classList.remove('border-red-500'));
        });
    } catch (err) {
        showNotification('Error initializing form: ' + err.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    populateAirports();
    initializeForm();
});
