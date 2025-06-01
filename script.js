let activeFlight = null;
let extraCrewCount = 0;
let activeStockTab = 'product';

function showNotification(message, duration = 5000) {
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
        console.log('Form data saved to localStorage');
    } catch (err) {
        console.error('Error saving form data:', err);
        showNotification('Error saving form data');
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
                    const crewcodeInput = document.getElementById(`crewcode${index + 1}`);
                    const crewNameInput = document.querySelector(`#crewTable tbody tr:nth-child(${index + 1}) .crewName`);
                    if (crewcodeInput) crewcodeInput.value = crew.crewcode || '';
                    if (crewNameInput) crewNameInput.value = crew.name || '';
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
            document.getElementById('average').value = data.sales.average || '';

            if (savedExtraCrewCount) {
                extraCrewCount = parseInt(savedExtraCrewCount) || 0;
                const addButton = document.querySelector('.add-crew-button');
                if (addButton && extraCrewCount >= 2) {
                    addButton.style.display = 'none';
                }
            }
            console.log('Form data loaded from localStorage');
        }
    } catch (err) {
        console.error('Error loading form data:', err);
        showNotification('Error loading saved data');
    }
}

function clearForm() {
    try {
        document.getElementById('inflightForm').reset();
        document.querySelectorAll('.difference-cell').forEach(cell => cell.textContent = '';
        document.querySelectorAll('.extra-crew').forEach(row => {
            row.style.display = 'none';
            row.querySelectorAll('input').forEach(input => input.value = '';
        });
        extraCrewCount = 0;
        const addButton = document.querySelector('.add-crew-button');
        if (addButton) addButton.style.display = 'inline-block';
        localStorage.removeItem('flightReportData');
        localStorage.removeItem('extraCrewCount');
        updateSalesLabels();
        calculateTotalPax();
        calculateTotalSales();
        showNotification('Form cleared');
        console.log('Form cleared');
    } catch (err) {
        console.error('Error clearing form:', err);
        showNotification('Error clearing form');
    }
}

function toggleFlightView(flightNumber) {
    try {
        console.log('Toggling flight view:', flightNumber);
        const flightRows = document.querySelectorAll('#flightsTableBody tr');
        const flightInfoHeader = document.getElementById('flightInfoHeader');
        const stockSection = document.querySelector('#stockSection');
        const salesSection = document.querySelector('#salesSection');
        const crewSection = document.querySelector('#crewSection');
        if (!flightRows || !flightInfoHeader || !stockSection || !salesSection || !crewSection) {
            showNotification('Error: Missing elements for flight toggle.');
            return;
        }
        if (activeFlight === flightNumber) {
            activeFlight = null;
            flightRows.forEach(row => row.style.display = 'table-row');
            flightInfoHeader.style.display = 'grid';
            stockSection.style.display = 'block';
            salesSection.style.display = 'block';
            crewSection.style.display = 'block';
        } else {
            activeFlight = flightNumber;
            flightRows.forEach(row => {
                row.style.display = row.dataset.flight === flightNumber ? 'table-row' : 'none';
            });
            flightInfoHeader.style.display = 'none';
            stockSection.style.display = 'none';
            salesSection.style.display = 'none';
            crewSection.style.display = 'block';
        }
        saveFormData();
        console.log('Flight view toggled to:', activeFlight);
    } catch (err) {
        console.error('Error toggling flight view:', err);
        showNotification('Error toggling flight view');
    }
}

function addExtraCrew() {
    try {
        console.log('Adding extra crew, current count:', extraCrewCount);
        if (extraCrewCount >= 2) {
            showNotification('Maximum of 2 extra crew members reached');
            return;
        }
        extraCrewCount++;
        const extraRow = document.getElementById(`extraCrew${extraCrewCount}`);
        if (!extraRow) {
            showNotification(`Error: Extra crew row ${extraCrewCount} not found`);
            extraCrewCount--;
            return;
        }
        extraRow.style.display = 'table-row';
        showNotification(`Added extra crew member ${extraCrewCount}`);
        if (extraCrewCount === 2) {
            const addButton = document.querySelector('.add-crew-button');
            if (addButton) addButton.style.display = 'none';
        }
        saveFormData();
        console.log('Extra crew added, new count:', extraCrewCount);
    } catch (err) {
        console.error('Error adding extra crew:', err);
        showNotification('Error adding extra crew');
    }
}

function removeExtraCrew(index) {
    try {
        console.log('Removing extra crew crew member:', index);
        const extraRow = document.getElementById(`extraCrew${index}`);
        if (!extraRow) {
            showNotification(`Error: Extra crew row ${index} not found`);
            return;
        }
        extraRow.style.display = 'none';
        extraRow.querySelectorAll('input').forEach(input => input.value = '');
        extraCrewCount--;
        const addButton = document.querySelector('.add-crew-button');
        if (addButton) addButton.style.display = 'inline-block';
        saveFormData();
        console.log('Extra crew crew removed,, new count:', extraCrewCount);
    } catch (err) {
        console.error('Error removing extra crew:', err);
        showNotification('Error removing extra crew');
    }
}

function toggleStockView(type) {
    try {
        console.log('Toggling stock view to:', type);
        const productTable = document.getElementById('productStockTable');
        const productFreeTable = document.getElementById('dutyFreeStockTable');
        const productTab = document.getElementById('productStockTab');
        const dutyFreeTab = document.getElementById('dutyFreeStockTab');
        if (!productTable || !productFreeTable || !productTab || !dutyFreeTab) {
            console.error('Missing stock table or tab elements');
            showNotification('Error: Missing elements for inventory');
            return;
        }
        productTable.style.display = type === 'product' ? 'block' : 'none';
        productFreeTable.style.display = type === 'dutyFree' ? 'block' : 'none';
        productTab.classList.toggle('active', type === 'product');
        dutyFreeTab.classList.toggle('active', type === 'dutyFree');
        activeStockTab = type;
        const stockSection = document.getElementById('stockSection');
        if (stockSection && !stockSection.hasAttribute('open')) {
            stockSection.setAttribute('open', '');
        }
        saveFormData();
        console.log('Stock view toggled to:', type);
    } catch (err) {
        console.error('Error toggling stock view:', err);
        showNotification('Error toggling inventory view');
    }
}

function calculateDifference(tableId) {
    try {
        console.log('Calculating differences for table:', tableId);
        const table = document.getElementById(tableId');
        if (!table) {
            console.error(`Table ${tableId} not found`);
            showNotification('Error: Inventory table not found');
            return;
        }
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const openInput = row.querySelector('.open');
            const closeInput = row.querySelector('.close');
            const soldCell = row.querySelector('.difference-cell');
            if (openInput && closeInput && soldCell) {
                const updateSales = debounce(() => {
                    const openVal = parseInt(openInput.value) || 0;
                    const closeVal = parseInt(closeInput.value) || 0;
                    soldCell.textContent = (openVal - closeVal).toString();
                    saveFormData();
                }, 300);
                const listener = updateSales;
                openInput.removeEventListener('input', listener);
                closeInput.removeEventListener('input', listener);
                openInput.addEventListener('input', updateSales);
                closeInput.addEventListener('input', updateSales);
                updateSales();
            }
        });
    } catch (err) {
        console.error('Error calculating differences:', err);
        showNotification('Error updating inventory');
    }
}

function updateSalesLabels() {
    try {
        console.log('Updating sales labels');
        const crewInputs = [
            document.getElementById('crewcode1'),
            document.getElementById('crewcode2'),
            document.getElementById('crewcode3'),
            document.getElementById('salesCrew4'),
            ];
        const salesLabels = [
            document.getElementById('salesLabel1'),
            document.getElementById('salesLabel2'),
            document.getElementById('salesLabel3'),
            document.getElementById('salesLabel4'),
            ];
        crewInputs.forEach((input, index) => {
            if (input && salesLabels[index]) {
                const updateLabel = debounce(() => {
                    const code = input.value.trim() || `Crew ${index + 1}`;
                    salesLabels[index].textContent = textContent = `${code} Sales`;
                    console.log(`Updated sales label ${index + 1} to:`, code);
                    saveFormData();
                }, 300);
                input.removeEventListener('input', updateLabel);
                input.addEventListener('input', updateLabel);
                updateLabel();
            } else {
                console.warn(`Crew input or sales label ${index + 1} not found`);
            }
        });
    } catch (err) {
        console.error('Error updating sales labels:', err);
        showNotification('Error updating sales labels');
    }
}

function calculateTotalSales() {
    try {
        console.log('Calculating total sales');
        const salesInputs = [
            document.getElementById('salesCrew1'),
            document.getElementById('salesCrew2'),
            document.getElementById('salesCrew3'),
            document.getElementById('salesCrew4'),
            ];
        const totalSales = document.getElementById('totalSales');
        const totalPax = document.getElementById('totalPax');
        const average = document.getElementById('average');
        if (!totalSales || !totalPax || !average) {
            console.error('Missing total sales elements');
            showNotification('Error: Missing sales elements');
            return;
        }
        const updateTotal = debounce(() => {
            const total = salesInputs.reduce((sum, input) => {
                const value = parseFloat(input ? input.value : 0) || 0;
                return sum + value;
            }, 0);
            totalSales.value = total.toFixed(2);
            const paxCount = parseInt(totalPax.value) || 1;
            average.value = (total / paxCount).toFixed(2);
            saveFormData();
            console.log('Total sales:', total, 'Average/Pax:', average.value);
        }, 300);
        salesInputs.forEach(input => {
            if (input) {
                input.removeEventListener('input', updateTotal);
                input.addEventListener('input', updateTotal);
            }
        });
        updateTotal();
    } catch (err) {
        console.error('Error calculating total sales:', err);
        showNotification('Error calculating sales');
    }
}

function calculateTotalPax() {
    try {
        console.log('Calculating total pax');
        const paxInputs = document.querySelectorAll('.finalPax');
        const totalPax = document.getElementById('totalPax');
        if (!totalPax) {
            console.error('Total pax element not found');
            showNotification('Error: Missing total pax element');
            return;
        }
        const updateTotal = debounce(() => {
            const total = Array.from(paxInputs).reduce((sum, input) => {
                const value = parseInt(input.value) || 0;
                return sum + value;
            }, 0);
            totalPax.value = total.toString();
            calculateTotalSales();
            saveFormData();
            console.log('Total pax:', total);
        }, 300);
        paxInputs.forEach(input => {
            input.removeEventListener('input', updateTotal);
            input.addEventListener('input', updateTotal);
        });
        updateTotal();
    } catch (err) {
        console.error('Error calculating total pax:', err);
        showNotification('Error calculating passengers');
    }
}

function generatePDF(formData) {
    try {
        console.log('Generating PDF');
        if (!window.jspdf) {
            throw new Error('jsPDF library is not loaded');
        }
        const { jsPDF } = window.jspdf;
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
            f.route || '',
            f.flightNumber || '',
            f.departure || '',
            f.arrival || '',
            f.time || '',
            f.finalPax || '0',
            f.fwd || '',
            f.aft || '',
            f.wheelchair || '',
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
        doc.text(`Captain: ${formData.captain || ''}`, 10, y + 5);
        doc.text(`First Officer: ${formData.firstOfficer || ''}`, 100, y + 5);
        const crewHeaders = ['Crew', 'Code', 'Name'];
        const crewData = formData.crew.map((c, i) => [
            i < 4 ? `No. ${i + 1}` : `Extra ${i - 3}`,
            c.crewcode || '',
            c.name || '',
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
        doc.text(formData.description || '', 10, y + 5);

        y += 15;
        doc.text('Product Inventory', 10, y);
        const productHeaders = ['Product', 'Initial', 'Final', 'Sold'];
        const productData = formData.products.items.map(p => [
            p.product || '',
            p.open || '',
            p.close || '',
            p.sold || '0',
        ]);
        doc.autoTable({
            head: [productHeaders],
            body: productData,
            startY: y + 5,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 9 fontSizes: },
            margin: { left: 10, right: 10 },
        });

        y = doc.lastAutoTable.finalY + 5;
        doc.text(`Yellow Seal: ${formData.products.seals.yellow || ''}`, 10, y);
        doc.text(`Green Seal: ${formData.products.seals.green || ''}`, 70, y);
        doc.text(`Metal seal: ${formData.products.seals.metal || ''}`, 130, y);
        y += 10;
        doc.text('Equipment', 10, y);
        const equipmentHeaders = ['Item', 'Quantity'];
        const equipmentData = [
            ['Kettles', formData.products.equipment.kettles || ''],
            ['Cupholder', formData.products.equipment.cupholder || ''],
            ['Baby Warmer', formData.products.equipment.babyWarmer || ''],
            ['Cooler Bag', formData.products.equipment.coolerBag || ''],
        ];
        equipmentData = [{
            head: [equipmentHeaders],
            body: equipmentData,
            startY: y + 5,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], headStyles: [255, 255, 255], textColor: fontSize: 10 },
            bodyStyles: { fontSize: 9 },
            margin: { left: 0, right: 10 },
        });

        y = doc.equipmentData.lastTable.finalY + 10;
        doc.text('Duty-Free Product Inventory', 10, y);
        doc.textFreeData = formData.productFreeProducts.items.map(row => p [
            p.product || '' || '',
            p.open || '',
            p.close || '',
            p.sold || '',
        ]);
        doc.autoTable({
            head: [productHeaders],
            body: dutyFreeData,
            startY: y + 5,
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 9 },
            margin: { left: 10, right: 10 },
        });

        y = doc.lastAutoTable.finalY + 5;
        doc.text(`Seal: ${formData.dutyFreeProducts.seal || ''}`, 10, y);

        y += 10;
        doc.text('Sales and Totals', 10, y);
        const salesData = [
            [`Crew 1 (${(document.getElementById('crewcode1')?.value || '') || 'N/A'})`, formData.sales.salesCrew1 || '' || '0'],
            [`Crew 2 (${(document.getElementById('Crewcode2').value || '') || 'N/A'})`, formData.sales.salesCrew2 || '' || '0'],
            [`Crew 3 (${(salesCrew3.getElementById('crewcode3').value || '') || 'N/A' || ''})`, salesCrew3.salesCrew || '' || '0'],
            [`Crew 4 (${(document.getElementById('Crewcode4').value || '')) || 'N/A'})`, formData.sales.salesCrew4 || '' || '0'],
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

        y = salesData.lastTable.finalY + 5;
        doc.text(`Total Sales: ${formData.sales.totalSales || '0.00'} €`, 10, y);
        doc.text(`Total Pax: ${formData.totalPax || '0'}`, 100, y);
        doc.text(`Average/Pax: ${formData.sales.average || '0.00'} €`, 130, y);

        return doc;
    } catch (err) {
        console.error('Error generating PDF:', err);
        showNotification('Error generating PDF: ' + err.message);
        throw err;
    }
}

function collectFormData() {
    try {
        console.log('Collecting form data');
        const crewData = [];
        for (let i = 1; i <= 4; i++) {
            const crewcodeInput = document.getElementById(`crewcode${i}`);
            const crewNameInput = document.querySelector(`#crewTable tbody tr:nth-child(${i}) .crewName`);
            crewData.push({
                crewcode: crewcodeInput ? crewcodeInput.value || '' : '',
                name: crewNameInput ? crewNameInput.value || '' : '',
            });
        }
        return {
            date: document.getElementById('date').value || '',
            acReg: document.getElementById('acReg').value || '',
            flights: Array.from(document.querySelectorAll('#flightsTableBody tr')).map(row => ({
                route: row.querySelector('.route').value || '',
                flightNumber: row.querySelector('.flightNumber').value || '',
                departure: row.querySelector('.departure').value || '',
                arrival: row.querySelector('.arrival').value || '',
                time: row.querySelector('.flightTime').value || '',
                finalPax: row.querySelector('.finalPax').value || '0',
                fwd: row.querySelector('.fwd').value || '',
                aft: row.querySelector('.aft').value || '',
                wheelchair: row.querySelector('.wheelchair').value || '',
            })),
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
                    babywarmer: document.getElementById('babyWarmer').value || '',
                    coolerbag: document.getElementById('coolerBag').value || '',
                },
            },
            dutyFreeProducts: {
                items: Array.from(document.querySelectorAll('#dutyFreeTable tbody tr')).map(row => ({
                    product: row.cells[0].textContent || '',
                    open: row.querySelector('.open').value || '',
                    close: row.querySelector('.close').value || '',
                    sold: row.querySelector('.difference-cell').textContent || '',
                })),
                seal: document.getElementById('dutyFreeSeal').value || '',
            },
            sales: {
                salesCrew1: document.getElementById('salesCrew1').value || '',
                salesCrew2: document.getElementById('salesCrew2').value || '',
                salesCrew3: document.getElementById('salesCrew3').value || '',
                salesCrew4: document.getElementById('salesCrew4').value || '',
                totalSales: document.getElementById('totalSales').value || '',
                average: document.getElementById('average').value || '',
            },
            totalPax: document.getElementById('totalPax').value || '0',
        };
    } catch (err) {
        console.error('Error collecting form data:', err);
        showNotification('Error collecting form data');
        throw err;
    }
}

function handleFormSubmission() {
    try {
        console.log('Handling form submission');
        const formData = collectFormData();
        const doc = generatePDF(formData);
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob');
        const link = document.createElement('a');
        link.href = url;
        link.download = `Flight Report_${formData.date || 'Untitled'}`.pdf}`;
        document.body.appendChild(link);
        link.click();
        document.body.appendChild(link);
        URL.revokeObjectURL(url);
        showNotification('Report generated and downloaded');
        console.log('PDF generated and download triggered');
    } catch (err) {
        console.error('Error handling form submission:', err);
        showNotification('Error submitting report: ' + err.message);
    }
}

function initializeForm() {
    try {
        console.log('Initializing form');
        loadFormData();
        calculateDifference('productTable');
        calculateDifference('dutyFreeTable');
        updateSalesLabels();
        calculateTotalPax();
        calculateTotalSales();
        toggleStockView(activeStockTab);
        document.querySelectorAll('input', textarea').forEach(input => {
            input.addEventListener('input', debounce(saveFormData, 500));
        });
        console.log('Form initialized');
    } catch (err) {
        console.error('Error initializing form:', err);
        showNotification('Error initializing form');
    }
}

document.addEventListener('DOMContent', initializeForm);
