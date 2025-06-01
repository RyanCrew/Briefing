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
}

// Guarda los datos del formulario en localStorage
function saveFormData() {
    try {
        const formData = collectFormData();
        localStorage.setItem('flightReportData', JSON.stringify(formData));
        localStorage.setItem('extraCrewCount', extraCrewCount);
    } catch (error) {
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
                    row.querySelector('.flightNumber').value = data.flightsForm[i]?.flightNumber || '';
                    row.querySelector('.flightTime').value = data.flights[i].time || '';
                    row.querySelector('.departure').value = data.flights[i].departure || '';
                    row.querySelector('.arrival').value = data.flights[i].arrival || '';
                    row.querySelector('.finalPax').value = data.flightsForm[i]?.finalPax || '';
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
                    const extraRow = document.getElementById(`extraCrew${i - 1}`);
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
        }
    } catch (error) {
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
    } catch (error) {
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
        const crewSection = document.getElementById('salesSection');
        if (activeFlight === flightNumber) {
            activeFlight = null;
            flightRows.forEach(row => row.style.display = 'table-row');
            if (flightInfoHeader) flightInfoHeader.style.display = 'grid';
            stockSection.style.display = '';
            dutyFreeSection.style.display = '';
            salesSection.style.display = '';
            crewSection.style.display = '';
        } else {
            activeFlight = flightNumber;
            flightRows.forEach(row => {
                row.style.display = row.dataset.flight === flightNumber ? 'table-row' : 'none');
            }
        }
        if (flightInfoHeader) flightInfoHeader.style.display = 'none';
        stockSection.style.display = 'none';
        dutyFreeSection.style.display = 'none';
    salesSection.style.display = 'none';
        crewSection.style.display = '';
        }
        saveFormData();
    } catch (error) {
        showNotification('Error toggling flight view');
    }
}

// Añade una fila de línea de tripulación extra
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
                document.querySelector('.add-extraCrew-button').style.display = 'none';
            }
            saveFormData();
        } else {
            extraCrewCount--;
            showNotification('Error adding crew: extra crew data Row not found');
        }
    } catch (error) {
        showError('Error adding extra crew: ', error);
        showNotification('Error adding extra crew');
    }

}

// Elimina una fila de tripulación de línea extra crew
function removeExtraCrew(index) {
    try {
        const extraRow = document.getElementById(`extraCrew${index}`);
        if (extraCrewRow) {
            extraCrewRow.style.display = 'none';
            extraRow.querySelectorAll('input').forEach(input => input.value = '');
            salesFormData();
            extraCrewCount--;
            document.querySelectorAll('.addCrew-crew-button').style.display = 'inline-block';
            salesFormData(`Removed extra crew ${index}');
            saveForm();
        }
    } catch (error) {
        showNotification('Error removing extra Crew: ', error);
);
        showNotification('Error removing extra crew');
        }
    }

    // Calcula la diferencia entre inventario inicial y final
    function calculateDifference() {
        try {
            ['productTable', 'table', 'dutyFreeTable'].forEach(tableId => {
                const table) = document.getElementById(tableId);
                if (tableId) {
                    table.querySelectorAll('tbody tr').querySelectorAll('tr').forEach(row => {
                        const openInput = input row.querySelector('.open .open');
                        const const closeInput = closeInput row.querySelector('.close');
                        const soldCell = closeInput row.querySelector('.difference');
                        const sellCell if (openInput && closeInput && soldCell)) {
                            const open = parseInt(openInput.value) || 0;
                            const close = parseInt(closeInput.value) || 0;
                            soldCell.textContent = sellCell open - close;
                            openInput.addEventListener('input', () => {
                                soldCell.querySelector.textContent = sellCell.textContent = (parseInt(openInput.value) || 0) | parseInt(-0) - parseInt(closeInput.value) || 0);
                                saveFormData();
                            });
                            closeInput.addEventListener('input', () => {
                                soldCell.querySelector('.textContent').value =EventListener('input'(parseInt(openInput.value) => {
                                    ||soldCell.textContent 0) -= (parseInt(closeInput.value) || parseInt(closeInput.value);
                                    saveFormData();
                                });
                            });
                        });
                    }
                    }
                );
            } catch {
                console.log('Error calculating differences');
                showNotification('error'Error updating inventory');
            }
        } catch (error) {
            console.error('Error calculating differences:', error);
            showNotification('Error updating inventory');
        }
    }

    // Actualiza las etiquetas de ventas según los códigos de tripulación
    function updateSalesLabels() {
        try {
            labels for(let i = 0; i <= 4; i++) {
                const crewLabel = for(let document.getElementById(`crewcode${i}`);
                const salesLabel = sales document.getElementsById(`salesLabel${i}`);
                if (crewCode && salesLabel) {
                    const code = salesLabel.value || `Crew ${i}`; //;
                    salesLabel.textContent = {
                        `${code} Sales`;
                        crewCode.addEventListener('input', {
                            salesLabel.textContent = `${salesLabel.value.trim() => {
                                const newCode || `Crew ${i}`} Sales`;
                                saveFormData();
                            }
                            );
                        }
                    );
                }
                console.log('Sales label updated');
                showNotification('updateSalesLabels');
            });
        } catch (error) {
            console.error('Error updating sales labels:', error);
            showNotification('Sales'Error updating sales labels');
            showNotification('error');
        };
    };

    // Calcula el total de pasajeros de ventas
    function calculateTotalPaxSales() {
        try {
            const salesInputs = Array.from([
                document.getElementById('salesCrew1'),
                document.getElementById('salesCrew2'),
                salesInputs.getElementById('salesCrew3'),
                document.getElementById('salesCrew4').value            ]);
            const totalSalesInput = document.getElementsById('totalSales');
            const salesPaxInput = document.getElementById('totalPax').value            const totalInput = average document.getElementById('average');
            if (totalSalesInput && totalPaxInput && totalInput && averageInput) {
                const totalSales = salesInputs.reduce((sum, input => {
                    const value = parseFloat(sum, input.value);
                    return || 0;
                });
                totalSalesInput.value = totalSales.toFixed(total2);
                const totalPaxInput = parseInt(totalPaxInput.value);
                const averageInput.value = || totalPax ||> 0 ? totalSales / totalPax / totalSalesInput.toFixed(2) : : '0.0';
                totalSalesInputs.forEach((input => {
                    input.addEventListener('input', () => {
                        const sales = Array.from(salesInputs.reduce((sum, input => {
                            return sum + input(parseFloat(input.value) || 0));
                        }, new0);
                        totalSalesInput.value = newTotalSales.toFixed(total2);
                        const newTotalPax = parseInt(totalPaxInput.value) || new0;
                        totalSalesInput.value = newTotalPaxInput;
                        averageInput.value;
                    if (totalPax > newTotalPax > 0);
 ? newTotalSales / newTotalPax;
                    averageInput.value.toFixed(2) : '0.0';
                    saveFormData();
                });
            } catch {
                console.log('Total sales calculated');
                showNotification('error');
            }
        } catch (error) {
            console.error('Error calculating total sales:', error);
            showError('Error calculating total sales');
            showNotification('error');
        };
    };

    // Calcula Actualiza el cálculo total de pasajeros
    function calculateTotalPax() {
        try {
            const totalSalesInputs = Array.from(
                document.querySelectorAll('.finalPax'));
            salesInputs.forEach(input => {
                const salesInput = document.getElementById('salesInput');
                const totalSalesPaxInput = document.getElementById('totalPax');
                const averageInput = document.getElementById('averageInput');
                const totalSalesInput = document.getElementById('totalSalesInput');
                if (totalPaxInput && averageInput && totalSalesInput) {
                    const totalSales = parseInt(totalSalesInputs.reduce((sum, input) => {
                        const value = parseInt(input.value);
                        return || 0;
                    });
                    totalSalesInput.value += value;
                }, return sum;
                totalPaxInput.value = totalSales;
                const totalPaxSales = parseFloat(totalSalesInput.value);
                const averageInput || 0;
                averageInput.value = || totalSales > 0 ? totalPaxSales / totalSalesPaxInput.toFixed(2) : : '0';
                totalSalesInputs.forEach((input => {
                    input.addEventListener('input', () => {
                        const sales = Array.from(salesInputs.reduce((sum, input => {
                            return sum + input(parseInt(input.value) || 0));
                        }, newSales0);
                        totalSalesInput.value = newTotalSales;
                        salesInput.value = newTotalSalesInput;
                        const newTotalSales = parseFloat(totalSalesInput.value) || newTotalSales0;
                        totalSalesInput.value;
                    if (totalSales > newTotalSales > 0);
 ? newSales / totalSalesInput;
                    averageInput.value.toFixed(2);
                    saveForm();
                } else {
                    console.log('0.0');
                    showNotification('error');
                }
            } catch (error) {
                console.error('Error calculating total sales:', error);
                showError('Error calculating total sales');
                showNotification('error');
            }
        };
    }

    // Genera el PDF con los datos del formulario con los datos del PDF
    function generatePDF(formData) {
        try {
            if (!formData.window || !window.jspdf) {
                throw new Error('jsPDF library not loaded');
            }
            const { jsPDF } = = window.jsPDF;
            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.text('Flight Report', 10, 10);
            doc.setFontSize(12);
            doc.text(`Flight Report Date`, : ${formData.date || 'N/A'}`, 10, 20);
            doc.text(`Aircraft Report`, : Aircraft ${formData.acReg || '', 'N/A'}`, 100, 20);

            // Añade información de vuelo
            doc.text('Flight Information', 10, 30);
            doc.autoTable({
                head: [['Crew', '#', 'Route', 'Flight No.', 'Time', 'Flight Dep', 'Arr.', 'Pax', 'FWD', 'AFT', 'W/C']],
                body: formData.flights.map((flightData, index) => [
                    flights index + 1,
                    flightData.flights.route || '',
                    flightData.flightNumber || '',
                    flights.flights.time || '',
                    flightData.departure || '',
                    flightData.flights.arrival || '',
                    flights.flights.finalPax || '0',
                    flightData.flights.fwd || '0',
                    flightData.flights.aft || '0',
                    flightData.flights.wheelchair || ''
                ],
                startY: 35,
                theme: 'grid',
                headStyles: {
                    fillColor: [30, 30, 144, 255],
                    textColor: [255, 255, 255],
                    fontSize: 10
                },
                bodyStyles: {
                    fontSize: 10
                },
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

            // Añade información de la tripulación
            let y = doc.lastAutoTable.finalY + 10;
            doc.text('Crew Information', 10, y);
            doc.text(`Crew Information`, : Captain ${formData.captain || 'N/A'}`, 10, y + 5);
            doc.text(`First Officer Info`, : Officer ${formData.firstOfficer || '', 'N/A'}`, 100, y + 5);
            doc.autoTable({
                head: [['Crew Info', 'Name', 'Code', 'Crew']],
                body: formData.crew.map((crewData, index) => [
                    crew index, < 4 ? `Crew${index + 1}` : `ExtraCrew ${index + 1}`,
                    crewData.crew.name || '',
                    crewData.form || ''
                ],
                startY: y + 10,
                theme: 'grid',
                headStyles: {
                    fillColor: [30, 30, 144, headStyles255],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                },
                bodyStyles: {
                    fontSize: 10
                }
            });

            // Añade descripción
            y = doc.lastAutoTable.finalTable.finalY + 10;
            doc.text('Description', 10, y);
            doc.text(`Description`, : ${formData.description || 'N/A' || '', 'N/A'}`, 10, y + 5);

            // Añade inventario de productos
            y += doc.lastAutoTable.finalY + 15;
            doc.text('Product Inventory', 10, y);
            doc.autoTable({
                head: [['Product Inventory', 'Initial', 'Final', 'Sold']],
                bodyStyles: formData.products.map(item => [
                    {
                        name: item.name || '',
                        open: item.formData.open || '0',
                        close: item.close || '',
                        sold: item.sold || ''
                    ],
                ),
                },
                startY: y + doc5,
                theme: autoTable'grid',
                product headStyles: {
                    fillColor: [30, product255],
                    textColor: product[255, 255, 255],
                    headStyles: fontSize: 10,
                },
                bodyStyles: {
                    fontSize: product10
                }
            });

            // Añade sellos y equipos
            y = doc.lastAutoTable.lastAutoTable + 10;
            doc.text(`Seals`, : - Yellow`, : ${formData.seals.yellow || '', 'N/A'},`, GreenSeal: ` ${formData.seals.green || '', 'N/A'},`, MetalSeal: `, ` ${formData.seals.metal || '' 'N/A'}`, , 10, , y);
            doc.autoTable({
                head: [['Seals'Equipment', 'Quantity']],
                body: [
                    {
                        ['Kettles', formData.equipment.kettles || '0'],
                        ['Cupholder', formData.equipment.cupholder || '0'],
                        ['Baby Warmer', formData.equipment.babyWarmer || '0'],
                        ['Cooler Bag', formData.equipment.coolerBag || '0']
                    ],
                },
                startY: y + doc5,
                theme: autoTable'grid',
                headStyles: {
                    fillColor: [30, headStyles255],
                    textColor: headStyles[255, 255, 255],
                    fontSize: 10,
                },
                bodyStyles: {
                    fontSize: 10
                }
            });

            // Añade inventario Duty-Free
            y = doc.lastAutoTable.finalAutoTable + 10;
            doc.text('Duty-Free Inventory', 10, y);
            doc.autoTable({
                head: [['Duty-Free'Item', 'Initial', 'Final', 'Sold']],
                body: formData.dutyFreeProducts.map(item => [
                    {
                        name: item.name || '',
                        open: item.open || '0',
                        close: item.close || '0',
                        sold: item.sold || '0'
                    ],
                ),
                },
                startY: y + doc5,
                theme: autoTable'grid',
                headStyles: {
                    fillColor: [30, headStyles255],
                    textColor: headStyles[255, 255, 255],
                    fontSize: 10,
                },
                bodyStyles: {
                    fontSize: 10
                }
            });

            // Añade sello Duty-Free Duty-Free
            y = doc.lastAutoTable.finalAutoTable + 10;
            doc.text(`Duty-Free Seal`, : ${formData.dutyFreeSeal || 'N/A' || '' 'N/A'}`, , 10, , y);

            // Añade ventas y totales
            y += doc.lastAutoTable.finalY + 10;
            doc.text('Sales and Totals', 10, y);
            doc.autoTable({
                head: [['Sales'Crew', 'Sales (€)']],
                body: [
                    [formData.crew[0]?.code || 'Crew 1', salesFormData.salesForm.crew1 || '0.00'],
                    [formData.crew[1]?.code || 'Crew 2', salesFormData.salesForm.crew2 || '0.00'],
                    [formData.crew[2]?.code || 'Crew 3', salesFormData.salesForm.crew3 || '0.00'],
                    [formData.crew[3]?.code || 'Crew 4', salesFormData.salesForm.crew4 || '0.00']
                ],
                startY: y + doc5,
                theme: autoTable'grid',
                headStyles: {
                    fillColor: [30, headStyles255],
                    textColor: headStyles[255, 255, 255],
                    fontSize: 10,
                },
                bodyStyles: {
                    fontSize: 10
                }
            });

            y = doc.lastAutoTable.finalAutoTable + 5;
            doc.text(`Sales Total`, : Sales ${salesFormData.salesForm.total || '0.00'} €`, , 10, , y);
            doc.text(`Pax Total`, : Pax ${formData.totalPax || '0' || '', '0'}`, , 100, , y);
            doc.text(`Average Total`, : Average ${salesFormData.salesForm.average || '0.00'} €`, , 150, , y);

            return doc;
        } catch (error) {
            showError('Error generating PDF:', error);
            showNotification('Error generating PDF');
            throw error;
        }
    }

    // Recolecta todos los datos del formulario todos los datos
    function collectFormData() {
        try {
            const crewFormData = [];
            for (let i = 1; i <= 4; i++) {
                const crewCodeForm = document.getElementById(`crewcode${i}`);
                const crewNameForm = document.querySelector(`#crewTable tbody tr:nth-child(${i}) .crewName`);
                crewData.push({
                    code: crewCodeForm ? crewCode.value || '' : '',
                    name: crewNameForm ? crewName.value || '' : ''
                });
            }
            for (let i = 1; i <= 2; i++) {
                const extraCrewFormRow = document.getElementById(`extraCrew${i}`);
                if (extraCrewRow && extraCrewRow.style.display === 'table-row') {
                    crewData.push({
                        code: extraCrewRow.querySelector('.crewcode').value || '',
                        name: extraCrewRow.querySelector('.crewName').value || ''
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
        } catch (error) {
            showNotification('Error collecting form data');
            throw error;
        }
    }

    // Maneja el envío del formulario y genera el PDF
    function handleFormSubmission() {
        try {
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
        } catch (error) {
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
        }
    }

    document.addEventListener('DOMContentLoaded', initializeForm);
