// Global state
let currentData = [];
let nuclearChartData = [];
let currentChart = null;
let strengthChart = null;
let nuclearChart = null;
let chainPlotChart = null;
let selectedNucleus = null;
let highlightMode = 'none';

// Element symbols for nucleus names
const ELEMENT_SYMBOLS = {
    1: 'H', 2: 'He', 3: 'Li', 4: 'Be', 5: 'B', 6: 'C', 7: 'N', 8: 'O', 9: 'F', 10: 'Ne',
    11: 'Na', 12: 'Mg', 13: 'Al', 14: 'Si', 15: 'P', 16: 'S', 17: 'Cl', 18: 'Ar', 19: 'K', 20: 'Ca',
    21: 'Sc', 22: 'Ti', 23: 'V', 24: 'Cr', 25: 'Mn', 26: 'Fe', 27: 'Co', 28: 'Ni', 29: 'Cu', 30: 'Zn',
    31: 'Ga', 32: 'Ge', 33: 'As', 34: 'Se', 35: 'Br', 36: 'Kr', 37: 'Rb', 38: 'Sr', 39: 'Y', 40: 'Zr',
    41: 'Nb', 42: 'Mo', 43: 'Tc', 44: 'Ru', 45: 'Rh', 46: 'Pd', 47: 'Ag', 48: 'Cd', 49: 'In', 50: 'Sn',
    51: 'Sb', 52: 'Te', 53: 'I', 54: 'Xe', 55: 'Cs', 56: 'Ba', 57: 'La', 58: 'Ce', 59: 'Pr', 60: 'Nd',
    61: 'Pm', 62: 'Sm', 63: 'Eu', 64: 'Gd', 65: 'Tb', 66: 'Dy', 67: 'Ho', 68: 'Er', 69: 'Tm', 70: 'Yb',
    71: 'Lu', 72: 'Hf', 73: 'Ta', 74: 'W', 75: 'Re', 76: 'Os', 77: 'Ir', 78: 'Pt', 79: 'Au', 80: 'Hg',
    81: 'Tl', 82: 'Pb', 83: 'Bi', 84: 'Po', 85: 'At', 86: 'Rn', 87: 'Fr', 88: 'Ra', 89: 'Ac', 90: 'Th',
    91: 'Pa', 92: 'U', 93: 'Np', 94: 'Pu', 95: 'Am', 96: 'Cm', 97: 'Bk', 98: 'Cf', 99: 'Es', 100: 'Fm',
    101: 'Md', 102: 'No', 103: 'Lr', 104: 'Rf', 105: 'Db', 106: 'Sg', 107: 'Bh', 108: 'Hs', 109: 'Mt',
    110: 'Ds', 111: 'Rg', 112: 'Cn', 113: 'Nh', 114: 'Fl', 115: 'Mc', 116: 'Lv', 117: 'Ts', 118: 'Og',
    119: 'Uue', 120: 'Ubn'
};

const MAGIC_NUMBERS = [2, 8, 20, 28, 50, 82, 126];

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeBetaDecayControls();
    initializeStrengthFunctionControls();
    initializeNuclearChartControls();
    populateNucleusList();
});

// Navigation
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.section;
            switchSection(sectionId);
        });
    });
}

function switchSection(sectionId) {
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionId);
    });

    // Update active section
    document.querySelectorAll('.section').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Beta Decay Controls
function initializeBetaDecayControls() {
    const chainType = document.getElementById('chain-type');
    const loadButton = document.getElementById('load-data-btn');

    // Handle chain type changes
    chainType.addEventListener('change', updateChainInputs);

    loadButton.addEventListener('click', loadBetaDecayData);
}

function updateChainInputs() {
    const chainType = document.getElementById('chain-type').value;
    const zGroup = document.getElementById('z-input-group');
    const nGroup = document.getElementById('n-input-group');
    const aGroup = document.getElementById('a-input-group');

    // Hide all input groups
    zGroup.style.display = 'none';
    nGroup.style.display = 'none';
    aGroup.style.display = 'none';

    // Show appropriate input based on chain type
    if (chainType === 'isotope') {
        zGroup.style.display = 'flex';
    } else if (chainType === 'isotone') {
        nGroup.style.display = 'flex';
    } else if (chainType === 'isobar') {
        aGroup.style.display = 'flex';
    }
}

// Load and parse beta decay data
async function loadBetaDecayData() {
    const interaction = document.getElementById('interaction-select').value;
    const chainType = document.getElementById('chain-type').value;
    const plotType = document.getElementById('plot-type').value;

    // Get the appropriate input value based on chain type
    let chainValue;
    let chainLabel;
    if (chainType === 'isotope') {
        chainValue = parseInt(document.getElementById('z-input').value);
        chainLabel = `Z=${chainValue}`;
    } else if (chainType === 'isotone') {
        chainValue = parseInt(document.getElementById('n-input').value);
        chainLabel = `N=${chainValue}`;
    } else if (chainType === 'isobar') {
        chainValue = parseInt(document.getElementById('a-input').value);
        chainLabel = `A=${chainValue}`;
    }

    if (!chainValue || isNaN(chainValue)) {
        alert('Please enter a valid number');
        return;
    }

    const dataFile = `data/beta_decay/data_${interaction}.txt`;
    const loading = document.getElementById('loading');
    
    loading.style.display = 'flex';

    try {
        const response = await fetch(dataFile);
        const text = await response.text();

        // Parse CSV, skipping comment lines
        const lines = text.split('\n').filter(line => !line.startsWith('#') && line.trim());
        const data = lines.map(line => {
            const [N, Z, E_beta, beta2, Q, HL_log10, FF_percent] = line.trim().split(/\s+/).map(Number);
            return { N, Z, A: N + Z, E_beta, beta2, Q, HL_log10, FF_percent };
        });

        currentData = data;

        // Filter data based on chain type
        let filteredData;
        if (chainType === 'isotope') {
            filteredData = data.filter(d => d.Z === chainValue);
        } else if (chainType === 'isotone') {
            filteredData = data.filter(d => d.N === chainValue);
        } else if (chainType === 'isobar') {
            filteredData = data.filter(d => d.A === chainValue);
        }

        if (filteredData.length === 0) {
            alert(`No data found for ${chainLabel} with ${interaction}`);
            loading.style.display = 'none';
            return;
        }

        createBetaDecayChart(filteredData, chainType, chainValue, chainLabel, interaction, plotType);
        updateDataTable(filteredData);
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data. Please check the console for details.');
    } finally {
        loading.style.display = 'none';
    }
}

// Create charts
function createBetaDecayChart(data, chainType, chainValue, chainLabel, interaction, plotType) {
    const ctx = document.getElementById('betaDecayChart').getContext('2d');

    // Destroy previous chart
    if (currentChart) {
        currentChart.destroy();
    }

    let chartData, title, xLabel, yLabel;

    // Determine x-axis based on chain type
    if (chainType === 'isotope') {
        xLabel = 'Neutron Number (N)';
    } else if (chainType === 'isotone') {
        xLabel = 'Proton Number (Z)';
    } else if (chainType === 'isobar') {
        xLabel = 'Proton Number (Z)';
    }

    switch (plotType) {
        case 'halflife':
            if (chainType === 'isotope') {
                chartData = data.map(d => ({ x: d.N, y: d.HL_log10 }));
            } else if (chainType === 'isotone') {
                chartData = data.map(d => ({ x: d.Z, y: d.HL_log10 }));
            } else {
                chartData = data.map(d => ({ x: d.Z, y: d.HL_log10 }));
            }
            title = `Half-life (${chainLabel}, ${interaction})`;
            yLabel = 'log₁₀(T½ [s])';
            break;
        case 'qvalue':
            if (chainType === 'isotope') {
                chartData = data.map(d => ({ x: d.N, y: d.Q }));
            } else if (chainType === 'isotone') {
                chartData = data.map(d => ({ x: d.Z, y: d.Q }));
            } else {
                chartData = data.map(d => ({ x: d.Z, y: d.Q }));
            }
            title = `Q-value (${chainLabel}, ${interaction})`;
            yLabel = 'Q-value [MeV]';
            break;
        case 'deformation':
            if (chainType === 'isotope') {
                chartData = data.map(d => ({ x: d.N, y: d.beta2 }));
            } else if (chainType === 'isotone') {
                chartData = data.map(d => ({ x: d.Z, y: d.beta2 }));
            } else {
                chartData = data.map(d => ({ x: d.Z, y: d.beta2 }));
            }
            title = `Deformation β₂ (${chainLabel}, ${interaction})`;
            yLabel = 'β₂';
            break;
        case 'ff-contribution':
            if (chainType === 'isotope') {
                chartData = data.map(d => ({ x: d.N, y: d.FF_percent }));
            } else if (chainType === 'isotone') {
                chartData = data.map(d => ({ x: d.Z, y: d.FF_percent }));
            } else {
                chartData = data.map(d => ({ x: d.Z, y: d.FF_percent }));
            }
            title = `First-Forbidden Contribution (${chainLabel}, ${interaction})`;
            yLabel = 'FF Contribution [%]';
            break;
        case 'binding':
            if (chainType === 'isotope') {
                chartData = data.map(d => ({ x: d.N, y: d.E_beta }));
            } else if (chainType === 'isotone') {
                chartData = data.map(d => ({ x: d.Z, y: d.E_beta }));
            } else {
                chartData = data.map(d => ({ x: d.Z, y: d.E_beta }));
            }
            title = `Binding Energy (${chainLabel}, ${interaction})`;
            yLabel = 'E(β) [MeV]';
            break;
    }

    currentChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: yLabel,
                data: chartData,
                backgroundColor: 'rgba(37, 99, 235, 0.6)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                showLine: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const point = data[context.dataIndex];
                            const element = ELEMENT_SYMBOLS[point.Z] || '??';
                            return [
                                `${element}-${point.A} (N=${point.N}, Z=${point.Z})`,
                                `${yLabel}: ${context.parsed.y.toFixed(3)}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: xLabel,
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: {
                        color: (context) => {
                            const value = context.tick.value;
                            // Highlight magic numbers
                            if (MAGIC_NUMBERS.includes(value)) {
                                return 'rgba(239, 68, 68, 0.3)';
                            }
                            return 'rgba(0, 0, 0, 0.05)';
                        },
                        lineWidth: (context) => {
                            return MAGIC_NUMBERS.includes(context.tick.value) ? 2 : 1;
                        }
                    },
                    ticks: {
                        color: (context) => {
                            return MAGIC_NUMBERS.includes(context.tick.value) ? '#ef4444' : '#64748b';
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: yLabel,
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

// Update data table
function updateDataTable(data) {
    const tableBody = document.getElementById('table-body');
    const tableContainer = document.getElementById('data-table-container');

    if (data.length === 0) {
        tableContainer.style.display = 'none';
        return;
    }

    tableBody.innerHTML = data.map(d => {
        const element = ELEMENT_SYMBOLS[d.Z] || '??';
        return `
        <tr>
            <td>${element}-${d.A}</td>
            <td>${d.N}</td>
            <td>${d.Z}</td>
            <td>${d.A}</td>
            <td>${d.E_beta.toFixed(2)}</td>
            <td>${d.beta2.toFixed(6)}</td>
            <td>${d.Q.toFixed(2)}</td>
            <td>${d.HL_log10.toFixed(3)}</td>
            <td>${d.FF_percent.toFixed(2)}</td>
        </tr>
    `}).join('');

    tableContainer.style.display = 'block';
}

// Strength Functions
function initializeStrengthFunctionControls() {
    const loadButton = document.getElementById('load-strength-btn');
    loadButton.addEventListener('click', loadStrengthFunction);
}

async function populateNucleusList() {
    try {
        const response = await fetch('data/strength_functions/');
        const text = await response.text();
        
        // Parse directory listing or use a known list
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const links = Array.from(doc.querySelectorAll('a'));
        
        // Extract unique nucleus names
        const nuclei = new Set();
        links.forEach(link => {
            const match = link.textContent.match(/^([A-Z][a-z]?\d+)_/);
            if (match) {
                nuclei.add(match[1]);
            }
        });

        // If GitHub doesn't allow directory listing, use a static list
        if (nuclei.size === 0) {
            // Get list from actual files using file_search
            await populateNucleusListFromKnownFiles();
            return;
        }

        const select = document.getElementById('nucleus-select');
        Array.from(nuclei).sort().forEach(nucleus => {
            const option = document.createElement('option');
            option.value = nucleus;
            option.textContent = nucleus;
            select.appendChild(option);
        });
    } catch (error) {
        console.log('Using static nucleus list');
        await populateNucleusListFromKnownFiles();
    }
}

async function populateNucleusListFromKnownFiles() {
    // Use the static list from nuclei-list.js
    const nuclei = typeof AVAILABLE_NUCLEI !== 'undefined' ? AVAILABLE_NUCLEI : [
        'V53', 'Y109', 'Ag131', 'W233', 'U249', 'U297',
        'Ac256', 'Ac295', 'Am247', 'Am249'
    ];

    const select = document.getElementById('nucleus-select');
    nuclei.forEach(nucleus => {
        const option = document.createElement('option');
        option.value = nucleus;
        option.textContent = nucleus;
        select.appendChild(option);
    });
}

async function loadStrengthFunction() {
    const nucleus = document.getElementById('nucleus-select').value;
    const strengthType = document.getElementById('strength-type').value;
    const kComponent = document.getElementById('k-component').value;

    if (!nucleus) {
        alert('Please select a nucleus');
        return;
    }

    // Handle nuclei with underscore prefix
    const nucleusName = nucleus.startsWith('_') ? nucleus : nucleus;
    const fileName = `${nucleusName}_DDPCX_${strengthType}_${kComponent}.txt`;
    const filePath = `data/strength_functions/${fileName}`;
    const loading = document.getElementById('strength-loading');

    loading.style.display = 'flex';

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`File not found: ${fileName}`);
        }

        const text = await response.text();
        const lines = text.split('\n').filter(line => !line.startsWith('#') && line.trim());
        
        const data = lines.map(line => {
            const [energy, strength] = line.trim().split(/\s+/).map(Number);
            return { energy, strength };
        });

        if (data.length === 0) {
            throw new Error('No data found in file');
        }

        createStrengthChart(data, nucleus, strengthType, kComponent);
    } catch (error) {
        console.error('Error loading strength function:', error);
        alert(`Error loading data: ${error.message}\n\nPlease ensure the file exists in data/strength_functions/`);
    } finally {
        loading.style.display = 'none';
    }
}

function createStrengthChart(data, nucleus, strengthType, kComponent) {
    const ctx = document.getElementById('strengthChart').getContext('2d');

    if (strengthChart) {
        strengthChart.destroy();
    }

    const typeLabel = strengthType === 'GAMTGAMT' ? 'Gamow-Teller (GT)' : 'First-Forbidden (FF)';
    const kLabel = kComponent === 'Total' ? 'Total (K=0 + 2×K=1)' : `K=${kComponent.replace('K', '')}`;

    strengthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.energy.toFixed(2)),
            datasets: [{
                label: `Strength Function`,
                data: data.map(d => d.strength),
                borderColor: 'rgba(124, 58, 237, 1)',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                title: {
                    display: true,
                    text: `${typeLabel} Strength Function - ${nucleus} (${kLabel})`,
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: (context) => `E = ${context[0].label} MeV`,
                        label: (context) => `S(E) = ${context.parsed.y.toExponential(3)}`
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Excitation Energy [MeV]',
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: {
                        maxTicksLimit: 15,
                        callback: function(value, index, values) {
                            return index % 2 === 0 ? this.getLabelForValue(value) : '';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Strength S(E)',
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Nuclear Chart Functions
function initializeNuclearChartControls() {
    const loadButton = document.getElementById('load-chart-btn');
    const resetButton = document.getElementById('reset-chart-btn');
    
    loadButton.addEventListener('click', loadNuclearChart);
    resetButton.addEventListener('click', resetNuclearChart);
    
    document.getElementById('chart-property').addEventListener('change', updateNuclearChartColors);
    document.getElementById('chart-highlight').addEventListener('change', updateHighlightMode);
}

async function loadNuclearChart() {
    const interaction = document.getElementById('chart-interaction').value;
    const dataFile = `data/beta_decay/data_${interaction}.txt`;
    const loading = document.getElementById('chart-loading');
    
    loading.style.display = 'flex';

    try {
        const response = await fetch(dataFile);
        const text = await response.text();

        // Parse data
        const lines = text.split('\n').filter(line => !line.startsWith('#') && line.trim());
        nuclearChartData = lines.map(line => {
            const [N, Z, E_beta, beta2, Q, HL_log10, FF_percent] = line.trim().split(/\s+/).map(Number);
            return { 
                N, Z, 
                A: N + Z,
                E_beta, 
                beta2, 
                Q, 
                HL_log10, 
                FF_percent,
                element: ELEMENT_SYMBOLS[Z] || '??'
            };
        });

        createNuclearChartVisualization();
        document.getElementById('chart-legend').style.display = 'block';
    } catch (error) {
        console.error('Error loading nuclear chart:', error);
        alert('Error loading data. Please check the console for details.');
    } finally {
        loading.style.display = 'none';
    }
}

function createNuclearChartVisualization() {
    const canvas = document.getElementById('nuclearChartCanvas');
    const ctx = canvas.getContext('2d');
    
    if (nuclearChart) {
        nuclearChart.destroy();
    }

    const property = document.getElementById('chart-property').value;
    const { colorData, legend } = getColorMapping(property);

    // Find min/max for grid layout
    const minN = Math.min(...nuclearChartData.map(d => d.N));
    const maxN = Math.max(...nuclearChartData.map(d => d.N));
    const minZ = Math.min(...nuclearChartData.map(d => d.Z));
    const maxZ = Math.max(...nuclearChartData.map(d => d.Z));

    // Create scatter plot data
    const chartData = nuclearChartData.map((d, index) => ({
        x: d.N,
        y: d.Z,
        value: colorData[index],
        nucleus: d
    }));

    // Custom plugin to draw space-filling squares
    const squareGridPlugin = {
        id: 'squareGrid',
        afterDatasetsDraw(chart) {
            const ctx = chart.ctx;
            const meta = chart.getDatasetMeta(0);
            const xScale = chart.scales.x;
            const yScale = chart.scales.y;
            
            // Save the current context state
            ctx.save();
            
            // Clip to the chart area to prevent drawing over title/axes
            ctx.beginPath();
            ctx.rect(xScale.left, yScale.top, xScale.right - xScale.left, yScale.bottom - yScale.top);
            ctx.clip();
            
            // Calculate square size based on zoom level
            const xRange = xScale.max - xScale.min;
            const yRange = yScale.max - yScale.min;
            const chartWidth = xScale.right - xScale.left;
            const chartHeight = yScale.bottom - yScale.top;
            
            // Size of one unit in pixels
            const pixelsPerUnitX = chartWidth / xRange;
            const pixelsPerUnitY = chartHeight / yRange;
            
            // Use the smaller dimension to ensure squares don't overlap
            const squareSize = Math.min(pixelsPerUnitX, pixelsPerUnitY) * 0.95;
            
            // Draw each nucleus as a square
            chartData.forEach((dataPoint, index) => {
                const nucleus = nuclearChartData[index];
                const x = xScale.getPixelForValue(dataPoint.x);
                const y = yScale.getPixelForValue(dataPoint.y);
                
                // Draw filled square
                ctx.fillStyle = dataPoint.value.color;
                ctx.fillRect(
                    x - squareSize / 2,
                    y - squareSize / 2,
                    squareSize,
                    squareSize
                );
                
                // Draw border
                ctx.strokeStyle = getBorderColor(nucleus);
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    x - squareSize / 2,
                    y - squareSize / 2,
                    squareSize,
                    squareSize
                );
            });
            
            // Restore the context state (removes clipping)
            ctx.restore();
        }
    };
    
    // Register the plugin
    Chart.register(squareGridPlugin);

    // Track mouse position for drag detection
    let mouseDownPos = null;
    canvas.addEventListener('mousedown', (e) => {
        mouseDownPos = { x: e.clientX, y: e.clientY };
    });

    nuclearChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Nuclei',
                data: chartData,
                backgroundColor: 'transparent', // Don't draw default points
                borderColor: 'transparent',
                pointRadius: 0, // Hide default points
                pointHoverRadius: 0, // Disable hover
                pointHitRadius: 15 // Make clicking easier with larger hit area
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                axis: 'xy',
                intersect: true
            },
            plugins: {
                title: {
                    display: true,
                    text: `Nuclear Chart - ${legend.title}`,
                    font: { size: 18, weight: 'bold' }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    mode: 'nearest',
                    intersect: true,
                    callbacks: {
                        title: (context) => {
                            if (context.length === 0) return '';
                            const d = nuclearChartData[context[0].dataIndex];
                            const element = ELEMENT_SYMBOLS[d.Z] || '??';
                            return `${element}-${d.A}`;
                        },
                        label: (context) => {
                            const d = nuclearChartData[context.dataIndex];
                            return `N=${d.N}, Z=${d.Z}`;
                        }
                    }
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                            speed: 0.1
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'xy'
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy',
                        modifierKey: 'shift' // Hold Shift to pan
                    },
                    limits: {
                        x: {min: minN - 5, max: maxN + 5},
                        y: {min: minZ - 5, max: maxZ + 5}
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Neutron Number (N)',
                        font: { size: 16, weight: 'bold' }
                    },
                    grid: {
                        color: (context) => {
                            if (MAGIC_NUMBERS.includes(context.tick.value)) {
                                return 'rgba(239, 68, 68, 0.4)';
                            }
                            return 'rgba(0, 0, 0, 0.1)';
                        },
                        lineWidth: (context) => MAGIC_NUMBERS.includes(context.tick.value) ? 3 : 1
                    },
                    ticks: {
                        stepSize: 2,
                        color: (context) => MAGIC_NUMBERS.includes(context.tick.value) ? '#ef4444' : '#64748b'
                    },
                    min: minN - 2,
                    max: maxN + 2
                },
                y: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Proton Number (Z)',
                        font: { size: 16, weight: 'bold' }
                    },
                    grid: {
                        color: (context) => {
                            if (MAGIC_NUMBERS.includes(context.tick.value)) {
                                return 'rgba(239, 68, 68, 0.4)';
                            }
                            return 'rgba(0, 0, 0, 0.1)';
                        },
                        lineWidth: (context) => MAGIC_NUMBERS.includes(context.tick.value) ? 3 : 1
                    },
                    ticks: {
                        stepSize: 2,
                        color: (context) => MAGIC_NUMBERS.includes(context.tick.value) ? '#ef4444' : '#64748b'
                    },
                    min: minZ - 2,
                    max: maxZ + 2
                }
            },
            onClick: (event, elements) => {
                // Only handle click if mouse hasn't moved much (not a drag)
                if (mouseDownPos) {
                    const dx = event.native.clientX - mouseDownPos.x;
                    const dy = event.native.clientY - mouseDownPos.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // If movement is less than 5 pixels, it's a click not a drag
                    if (distance < 5 && elements.length > 0) {
                        const index = elements[0].index;
                        showNucleusTooltip(nuclearChartData[index]);
                    }
                }
                mouseDownPos = null;
            }
        }
    });

    // Set canvas height - use fixed height for better control
    canvas.style.height = '600px';
    
    // Add manual pan functionality as fallback
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    
    canvas.addEventListener('mousedown', (e) => {
        if (e.shiftKey) {
            isPanning = true;
            panStart = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = 'grabbing';
            e.preventDefault();
        }
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isPanning && e.shiftKey) {
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;
            
            const xScale = nuclearChart.scales.x;
            const yScale = nuclearChart.scales.y;
            
            // Calculate how much to pan in data units
            const xRange = xScale.max - xScale.min;
            const yRange = yScale.max - yScale.min;
            const xPixels = xScale.right - xScale.left;
            const yPixels = yScale.bottom - yScale.top;
            
            const xPan = -(dx / xPixels) * xRange;
            const yPan = (dy / yPixels) * yRange; // Inverted because canvas y goes down
            
            // Update scale limits
            xScale.options.min = xScale.min + xPan;
            xScale.options.max = xScale.max + xPan;
            yScale.options.min = yScale.min + yPan;
            yScale.options.max = yScale.max + yPan;
            
            nuclearChart.update('none');
            
            panStart = { x: e.clientX, y: e.clientY };
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        isPanning = false;
        canvas.style.cursor = 'crosshair';
    });
    
    canvas.addEventListener('mouseleave', () => {
        isPanning = false;
        canvas.style.cursor = 'crosshair';
    });
    
    updateLegend(legend);
}

function getColorMapping(property) {
    const colors = [];
    let title = '';
    let ranges = [];

    switch (property) {
        case 'halflife':
            title = 'Half-life (log₁₀ T½ [s])';
            nuclearChartData.forEach(d => {
                const hl = d.HL_log10;
                if (hl < -2) colors.push({ color: '#ef4444', label: '< -2' });
                else if (hl < 0) colors.push({ color: '#f97316', label: '-2 to 0' });
                else if (hl < 2) colors.push({ color: '#eab308', label: '0 to 2' });
                else if (hl < 4) colors.push({ color: '#84cc16', label: '2 to 4' });
                else colors.push({ color: '#22c55e', label: '≥ 4' });
            });
            ranges = [
                { color: '#ef4444', label: '< -2 (very short)' },
                { color: '#f97316', label: '-2 to 0' },
                { color: '#eab308', label: '0 to 2' },
                { color: '#84cc16', label: '2 to 4' },
                { color: '#22c55e', label: '≥ 4 (very long)' }
            ];
            break;
            
        case 'qvalue':
            title = 'Q-value [MeV]';
            nuclearChartData.forEach(d => {
                const q = d.Q;
                if (q < 5) colors.push({ color: '#3b82f6', label: '< 5' });
                else if (q < 10) colors.push({ color: '#06b6d4', label: '5 to 10' });
                else if (q < 15) colors.push({ color: '#10b981', label: '10 to 15' });
                else if (q < 20) colors.push({ color: '#f59e0b', label: '15 to 20' });
                else colors.push({ color: '#ef4444', label: '≥ 20' });
            });
            ranges = [
                { color: '#3b82f6', label: '< 5 MeV' },
                { color: '#06b6d4', label: '5 to 10 MeV' },
                { color: '#10b981', label: '10 to 15 MeV' },
                { color: '#f59e0b', label: '15 to 20 MeV' },
                { color: '#ef4444', label: '≥ 20 MeV' }
            ];
            break;
            
        case 'deformation':
            title = 'Deformation (β₂)';
            nuclearChartData.forEach(d => {
                const beta2 = Math.abs(d.beta2);
                if (beta2 < 0.05) colors.push({ color: '#8b5cf6', label: '< 0.05' });
                else if (beta2 < 0.15) colors.push({ color: '#3b82f6', label: '0.05 to 0.15' });
                else if (beta2 < 0.25) colors.push({ color: '#06b6d4', label: '0.15 to 0.25' });
                else if (beta2 < 0.35) colors.push({ color: '#f59e0b', label: '0.25 to 0.35' });
                else colors.push({ color: '#ef4444', label: '≥ 0.35' });
            });
            ranges = [
                { color: '#8b5cf6', label: '< 0.05 (spherical)' },
                { color: '#3b82f6', label: '0.05 to 0.15' },
                { color: '#06b6d4', label: '0.15 to 0.25' },
                { color: '#f59e0b', label: '0.25 to 0.35' },
                { color: '#ef4444', label: '≥ 0.35 (highly deformed)' }
            ];
            break;
            
        case 'ff-contribution':
            title = 'First-Forbidden Contribution [%]';
            nuclearChartData.forEach(d => {
                const ff = d.FF_percent;
                if (ff < 1) colors.push({ color: '#cbd5e1', label: '< 1' });
                else if (ff < 10) colors.push({ color: '#93c5fd', label: '1 to 10' });
                else if (ff < 25) colors.push({ color: '#3b82f6', label: '10 to 25' });
                else if (ff < 50) colors.push({ color: '#7c3aed', label: '25 to 50' });
                else colors.push({ color: '#db2777', label: '≥ 50' });
            });
            ranges = [
                { color: '#cbd5e1', label: '< 1% (negligible)' },
                { color: '#93c5fd', label: '1 to 10%' },
                { color: '#3b82f6', label: '10 to 25%' },
                { color: '#7c3aed', label: '25 to 50%' },
                { color: '#db2777', label: '≥ 50% (dominant)' }
            ];
            break;
            
        case 'binding':
            title = 'Binding Energy [MeV]';
            const minBE = Math.min(...nuclearChartData.map(d => d.E_beta));
            const maxBE = Math.max(...nuclearChartData.map(d => d.E_beta));
            const step = (maxBE - minBE) / 5;
            nuclearChartData.forEach(d => {
                const be = d.E_beta;
                if (be < minBE + step) colors.push({ color: '#1e40af', label: 'Low' });
                else if (be < minBE + 2*step) colors.push({ color: '#3b82f6', label: '' });
                else if (be < minBE + 3*step) colors.push({ color: '#06b6d4', label: 'Medium' });
                else if (be < minBE + 4*step) colors.push({ color: '#10b981', label: '' });
                else colors.push({ color: '#22c55e', label: 'High' });
            });
            ranges = [
                { color: '#1e40af', label: `${minBE.toFixed(0)} MeV` },
                { color: '#3b82f6', label: '' },
                { color: '#06b6d4', label: `${(minBE + maxBE)/2}.toFixed(0)} MeV` },
                { color: '#10b981', label: '' },
                { color: '#22c55e', label: `${maxBE.toFixed(0)} MeV` }
            ];
            break;
    }

    return { colorData: colors, legend: { title, ranges } };
}

function getBorderColor(nucleus) {
    const highlightMode = document.getElementById('chart-highlight').value;
    
    // Magic number highlighting
    if (highlightMode === 'magic') {
        if (MAGIC_NUMBERS.includes(nucleus.N) && MAGIC_NUMBERS.includes(nucleus.Z)) {
            return '#dc2626'; // Double magic - darker red
        }
        if (MAGIC_NUMBERS.includes(nucleus.N) || MAGIC_NUMBERS.includes(nucleus.Z)) {
            return '#ef4444'; // Single magic - red
        }
    }
    
    // Chain highlighting
    if (selectedNucleus) {
        if (highlightMode === 'isotope' && nucleus.Z === selectedNucleus.Z) {
            return '#2563eb'; // Blue for isotopes
        }
        if (highlightMode === 'isotone' && nucleus.N === selectedNucleus.N) {
            return '#7c3aed'; // Purple for isotones
        }
        if (highlightMode === 'isobar' && nucleus.A === selectedNucleus.A) {
            return '#06b6d4'; // Cyan for isobars
        }
    }
    
    return 'rgba(0, 0, 0, 0.4)'; // Default border
}

function updateLegend(legend) {
    const legendContent = document.getElementById('legend-content');
    legendContent.innerHTML = legend.ranges
        .filter(r => r.label)
        .map(range => `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${range.color}"></div>
                <span class="legend-label">${range.label}</span>
            </div>
        `).join('');
}

function updateNuclearChartColors() {
    if (nuclearChart && nuclearChartData.length > 0) {
        createNuclearChartVisualization();
    }
}

function updateHighlightMode() {
    highlightMode = document.getElementById('chart-highlight').value;
    if (nuclearChart && nuclearChartData.length > 0) {
        updateNuclearChartBorders();
    }
}

function updateNuclearChartBorders() {
    if (!nuclearChart) return;
    
    const dataset = nuclearChart.data.datasets[0];
    
    dataset.borderColor = nuclearChartData.map(n => getBorderColor(n));
    dataset.borderWidth = nuclearChartData.map(n => {
        const hl = document.getElementById('chart-highlight').value;
        if (hl === 'magic' && (MAGIC_NUMBERS.includes(n.N) || MAGIC_NUMBERS.includes(n.Z))) {
            return 3;
        }
        if (!selectedNucleus) return 2;
        if (hl === 'isotope' && n.Z === selectedNucleus.Z) return 4;
        if (hl === 'isotone' && n.N === selectedNucleus.N) return 4;
        if (hl === 'isobar' && n.A === selectedNucleus.A) return 4;
        return 1;
    });
    
    dataset.pointRadius = nuclearChartData.map(n => {
        const hl = document.getElementById('chart-highlight').value;
        if (!selectedNucleus) return 8;
        if (hl === 'isotope' && n.Z === selectedNucleus.Z) return 10;
        if (hl === 'isotone' && n.N === selectedNucleus.N) return 10;
        if (hl === 'isobar' && n.A === selectedNucleus.A) return 10;
        return 6;
    });
    
    nuclearChart.update('none'); // Update without animation for smooth interaction
}

function showNucleusTooltip(nucleus) {
    selectedNucleus = nucleus;
    
    const tooltip = document.getElementById('nucleus-tooltip');
    const backdrop = document.createElement('div');
    backdrop.className = 'tooltip-backdrop active';
    backdrop.id = 'tooltip-backdrop';
    backdrop.onclick = hideNucleusTooltip;
    
    // Remove existing backdrop if any
    const existing = document.getElementById('tooltip-backdrop');
    if (existing) existing.remove();
    
    document.body.appendChild(backdrop);
    
    // Populate tooltip
    document.getElementById('tooltip-title').textContent = 
        `${nucleus.element}-${nucleus.A}`;
    document.getElementById('tooltip-z').textContent = nucleus.Z;
    document.getElementById('tooltip-n').textContent = nucleus.N;
    document.getElementById('tooltip-a').textContent = nucleus.A;
    document.getElementById('tooltip-be').textContent = 
        `${nucleus.E_beta.toFixed(2)} MeV`;
    document.getElementById('tooltip-beta2').textContent = 
        nucleus.beta2.toFixed(6);
    document.getElementById('tooltip-q').textContent = 
        `${nucleus.Q.toFixed(2)} MeV`;
    
    const halfLife = Math.pow(10, nucleus.HL_log10);
    let hlText = '';
    if (halfLife < 1) hlText = `${(halfLife * 1000).toFixed(2)} ms`;
    else if (halfLife < 60) hlText = `${halfLife.toFixed(2)} s`;
    else if (halfLife < 3600) hlText = `${(halfLife / 60).toFixed(2)} min`;
    else if (halfLife < 86400) hlText = `${(halfLife / 3600).toFixed(2)} h`;
    else if (halfLife < 31536000) hlText = `${(halfLife / 86400).toFixed(2)} d`;
    else hlText = `${(halfLife / 31536000).toExponential(2)} y`;
    
    document.getElementById('tooltip-hl').textContent = hlText;
    document.getElementById('tooltip-ff').textContent = 
        `${nucleus.FF_percent.toFixed(2)}%`;
    
    // Update action buttons
    document.getElementById('action-z').textContent = nucleus.Z;
    document.getElementById('action-n').textContent = nucleus.N;
    document.getElementById('action-a').textContent = nucleus.A;
    
    tooltip.style.display = 'block';
}

function hideNucleusTooltip() {
    document.getElementById('nucleus-tooltip').style.display = 'none';
    const backdrop = document.getElementById('tooltip-backdrop');
    if (backdrop) backdrop.remove();
}

function highlightIsotopes() {
    if (!selectedNucleus) return;
    document.getElementById('chart-highlight').value = 'isotope';
    updateHighlightMode();
    plotChainData('isotope', selectedNucleus.Z);
    hideNucleusTooltip();
}

function highlightIsotones() {
    if (!selectedNucleus) return;
    document.getElementById('chart-highlight').value = 'isotone';
    updateHighlightMode();
    plotChainData('isotone', selectedNucleus.N);
    hideNucleusTooltip();
}

function highlightIsobars() {
    if (!selectedNucleus) return;
    document.getElementById('chart-highlight').value = 'isobar';
    updateHighlightMode();
    plotChainData('isobar', selectedNucleus.A);
    hideNucleusTooltip();
}

function plotChainData(chainType, chainValue) {
    const container = document.getElementById('chain-plot-container');
    const canvas = document.getElementById('chainPlotCanvas');
    const ctx = canvas.getContext('2d');
    const title = document.getElementById('chain-plot-title');
    
    // Filter data for the selected chain
    let chainData;
    let chainLabel;
    let xAxisLabel;
    
    if (chainType === 'isotope') {
        chainData = nuclearChartData.filter(d => d.Z === chainValue);
        const element = ELEMENT_SYMBOLS[chainValue] || '??';
        chainLabel = `${element} Isotopes (Z=${chainValue})`;
        xAxisLabel = 'Neutron Number (N)';
    } else if (chainType === 'isotone') {
        chainData = nuclearChartData.filter(d => d.N === chainValue);
        chainLabel = `Isotones (N=${chainValue})`;
        xAxisLabel = 'Proton Number (Z)';
    } else if (chainType === 'isobar') {
        chainData = nuclearChartData.filter(d => d.A === chainValue);
        chainLabel = `Isobars (A=${chainValue})`;
        xAxisLabel = 'Proton Number (Z)';
    }
    
    if (chainData.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    // Sort the data
    if (chainType === 'isotope') {
        chainData.sort((a, b) => a.N - b.N);
    } else {
        chainData.sort((a, b) => a.Z - b.Z);
    }
    
    // Destroy previous chart
    if (chainPlotChart) {
        chainPlotChart.destroy();
    }
    
    // Prepare datasets for multiple properties
    const xValues = chainType === 'isotope' 
        ? chainData.map(d => d.N)
        : chainData.map(d => d.Z);
    
    const datasets = [
        {
            label: 'Half-life (log₁₀ T½)',
            data: chainData.map((d, i) => ({ x: xValues[i], y: d.HL_log10 })),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            yAxisID: 'y',
            tension: 0.1,
            fill: false
        },
        {
            label: 'Q-value [MeV]',
            data: chainData.map((d, i) => ({ x: xValues[i], y: d.Q })),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            yAxisID: 'y1',
            tension: 0.1,
            fill: false
        },
        {
            label: 'Deformation β₂ (×10)',
            data: chainData.map((d, i) => ({ x: xValues[i], y: d.beta2 * 10 })),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            yAxisID: 'y2',
            tension: 0.1,
            fill: false
        },
        {
            label: 'FF % (÷10)',
            data: chainData.map((d, i) => ({ x: xValues[i], y: d.FF_percent / 10 })),
            borderColor: '#7c3aed',
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            yAxisID: 'y2',
            tension: 0.1,
            fill: false
        }
    ];
    
    title.textContent = chainLabel;
    
    chainPlotChart = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        title: (context) => {
                            const index = context[0].dataIndex;
                            const d = chainData[index];
                            const element = ELEMENT_SYMBOLS[d.Z] || '??';
                            return `${element}-${d.A} (N=${d.N}, Z=${d.Z})`;
                        },
                        label: (context) => {
                            const label = context.dataset.label;
                            let value = context.parsed.y;
                            
                            // Reverse scaling for display
                            if (label.includes('β₂')) {
                                value = value / 10;
                                return `Deformation β₂: ${value.toFixed(6)}`;
                            } else if (label.includes('FF')) {
                                value = value * 10;
                                return `FF Contribution: ${value.toFixed(2)}%`;
                            } else if (label.includes('Half-life')) {
                                const seconds = Math.pow(10, value);
                                return `Half-life: ${seconds.toExponential(2)} s (log₁₀: ${value.toFixed(3)})`;
                            } else {
                                return `${label}: ${value.toFixed(3)}`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: xAxisLabel,
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: {
                        color: (context) => {
                            if (MAGIC_NUMBERS.includes(context.tick.value)) {
                                return 'rgba(239, 68, 68, 0.3)';
                            }
                            return 'rgba(0, 0, 0, 0.05)';
                        },
                        lineWidth: (context) => MAGIC_NUMBERS.includes(context.tick.value) ? 2 : 1
                    },
                    ticks: {
                        color: (context) => MAGIC_NUMBERS.includes(context.tick.value) ? '#ef4444' : '#64748b',
                        stepSize: chainType === 'isotope' ? 2 : 1
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'log₁₀(T½ [s])',
                        font: { size: 12, weight: 'bold' },
                        color: '#2563eb'
                    },
                    ticks: {
                        color: '#2563eb'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Q-value [MeV]',
                        font: { size: 12, weight: 'bold' },
                        color: '#10b981'
                    },
                    ticks: {
                        color: '#10b981'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                y2: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'β₂ (×10) / FF% (÷10)',
                        font: { size: 12, weight: 'bold' },
                        color: '#f59e0b'
                    },
                    ticks: {
                        color: '#f59e0b'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
    
    // Show the container and scroll to it
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function resetNuclearChart() {
    selectedNucleus = null;
    document.getElementById('chart-highlight').value = 'none';
    hideNucleusTooltip();
    updateHighlightMode();
    
    // Reset zoom
    if (nuclearChart) {
        nuclearChart.resetZoom();
    }
    
    // Hide chain plot
    const container = document.getElementById('chain-plot-container');
    if (container) {
        container.style.display = 'none';
    }
    if (chainPlotChart) {
        chainPlotChart.destroy();
        chainPlotChart = null;
    }
}

// Export for global access
window.switchSection = switchSection;
window.hideNucleusTooltip = hideNucleusTooltip;
window.highlightIsotopes = highlightIsotopes;
window.highlightIsotones = highlightIsotones;
window.highlightIsobars = highlightIsobars;
