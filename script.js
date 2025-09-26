/**
 * GridX Microgrid Monitoring Dashboard with DC-DC Boost Converter Analytics
 * Corrected and cleaned JavaScript for real-time data simulation and dashboard functionality
 */

// Global variables for data management
let energyChart;
let voltageGauge, efficiencyGauge;
let chartData = {
    labels: [],
    generation: [],
    consumption: []
};

// System alerts array (cleaned)
let systemAlerts = [
    {
        id: 1,
        type: 'warning',
        title: 'DC-DC Converter Efficiency Low',
        description: 'Boost converter efficiency has dropped to 89%. Check switching frequency and inductor.',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        severity: 'medium'
    },
    {
        id: 2,
        type: 'error',
        title: 'Output Voltage Regulation',
        description: 'Output voltage showing fluctuations beyond ±2% tolerance.',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        severity: 'high'
    },
    {
        id: 3,
        type: 'info',
        title: 'Duty Cycle Optimization',
        description: 'System operating at optimal duty cycle for current load conditions.',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        severity: 'low'
    }
];

// Configuration for data simulation
const CONFIG = {
    UPDATE_INTERVAL: 5000, // 5 seconds
    MAX_DATA_POINTS: 20,   // Keep last 20 data points for chart
    GENERATION_RANGE: { min: 8.5, max: 15.2 }, // kWh
    CONSUMPTION_RANGE: { min: 6.8, max: 12.5 }, // kWh
    BATTERY_RANGE: { min: 45, max: 95 }, // Percentage
    // DC-DC Converter ranges
    INPUT_VOLTAGE_RANGE: { min: 10.0, max: 15.0 }, // V
    OUTPUT_VOLTAGE_RANGE: { min: 20.0, max: 28.0 }, // V
    INPUT_CURRENT_RANGE: { min: 1.0, max: 4.0 }, // A
    OUTPUT_CURRENT_RANGE: { min: 0.8, max: 2.5 }, // A
    EFFICIENCY_RANGE: { min: 85, max: 96 }, // %
    DUTY_CYCLE_RANGE: { min: 40, max: 65 } // %
};

/**
 * Create HTML element for a single alert
 */
function createAlertElement(alert) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-item';
    alertDiv.dataset.alertId = alert.id;

    // Determine alert icon and class based on type
    let alertIcon = '⚠️';
    let alertClass = 'alert-warning';
    if (alert.type === 'error') {
        alertIcon = '🚨';
        alertClass = 'alert-error';
    } else if (alert.type === 'info') {
        alertIcon = 'ℹ️';
        alertClass = 'alert-info';
    }

    const timeAgo = getTimeAgo(alert.timestamp);

    alertDiv.innerHTML = `
        <div class="alert-left ${alertClass}">
            <div class="alert-icon">${alertIcon}</div>
        </div>
        <div class="alert-body">
            <div class="alert-header">
                <strong class="alert-title">${escapeHtml(alert.title)}</strong>
                <span class="alert-time">${escapeHtml(timeAgo)}</span>
            </div>
            <div class="alert-desc">${escapeHtml(alert.description)}</div>
            <div class="alert-meta">Severity: ${escapeHtml(alert.severity)}</div>
        </div>
    `;

    // Add click handler for alert dismissal
    alertDiv.addEventListener('click', () => dismissAlert(alert.id));

    return alertDiv;
}

/**
 * Basic HTML-escaping helper to avoid accidental HTML injection
 */
function escapeHtml(unsafe) {
    if (unsafe === undefined || unsafe === null) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Calculate time ago string for alerts
 */
function getTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
}

/**
 * Dismiss a specific alert
 */
function dismissAlert(alertId) {
    systemAlerts = systemAlerts.filter(alert => alert.id !== alertId);
    renderAlerts();
    console.log(`Alert ${alertId} dismissed`);
}

/**
 * Clear all alerts
 */
function clearAlerts() {
    systemAlerts = [];
    renderAlerts();
    console.log('All alerts cleared');
}

/**
 * Simulate random alert generation for DC-DC converter
 * In a real system, alerts would come from actual sensor monitoring
 */
function generateRandomAlert() {
    const alertTypes = [
        {
            type: 'warning',
            title: 'DC-DC Converter Temperature',
            description: 'Boost converter operating temperature slightly elevated. Monitor thermal management.',
            severity: 'medium'
        },
        {
            type: 'info',
            title: 'Optimal Load Condition',
            description: 'DC-DC converter operating at peak efficiency range.',
            severity: 'low'
        },
        {
            type: 'error',
            title: 'Output Voltage Ripple',
            description: 'Output voltage ripple exceeding 2%. Check output capacitors.',
            severity: 'high'
        },
        {
            type: 'warning',
            title: 'Duty Cycle Limit',
            description: 'Operating near maximum duty cycle. Consider input voltage regulation.',
            severity: 'medium'
        },
        {
            type: 'info',
            title: 'Switching Frequency Stable',
            description: 'PWM switching frequency maintaining optimal performance.',
            severity: 'low'
        },
        {
            type: 'error',
            title: 'Input Current Surge',
            description: 'Input current spike detected. Check input filtering and protection.',
            severity: 'high'
        }
    ];

    // Only add alert if we don't have too many already
    if (systemAlerts.length < 5 && Math.random() < 0.08) { // 8% chance every update
        const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const newAlert = {
            id: Date.now() + Math.floor(Math.random() * 1000), // Unique-ish ID
            ...randomAlert,
            timestamp: new Date()
        };

        systemAlerts.unshift(newAlert); // Add to beginning of array
        renderAlerts();
        console.log('New DC-DC converter alert generated:', newAlert.title);
    }
}

/**
 * Update timestamp in footer
 */
function updateTimestamp() {
    const timestampElement = document.getElementById('last-update');
    if (timestampElement) {
        const now = new Date();
        timestampElement.textContent = now.toLocaleTimeString();
    }
}

/**
 * Start automatic data updates
 */
function startDataUpdates() {
    // Update dashboard data every CONFIG.UPDATE_INTERVAL milliseconds
    setInterval(() => {
        updateDashboard();
        generateRandomAlert();
    }, CONFIG.UPDATE_INTERVAL);

    console.log(`Started automatic updates every ${CONFIG.UPDATE_INTERVAL / 1000} seconds`);
}

/**
 * Time range selector functionality
 */
document.addEventListener('DOMContentLoaded', function () {
    const timeRangeButtons = document.querySelectorAll('.time-range');

    timeRangeButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            timeRangeButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // In a real implementation, this would filter chart data by time range
            console.log(`Time range changed to: ${this.textContent}`);
        });
    });
});

/**
 * Update dashboard with real sensor data including DC-DC converter
 * This function should be called when receiving actual IoT data
 */
function updateDashboardWithRealData(data) {
    // Update energy metrics
    if (data.generation !== undefined) {
        updateMetricCard('generation', Number(data.generation).toFixed(1));
    }

    if (data.consumption !== undefined) {
        updateMetricCard('consumption', Number(data.consumption).toFixed(1));
    }

    if (data.batteryLevel !== undefined) {
        updateMetricCard('storage', data.batteryLevel);
        updateBatteryIndicator(data.batteryLevel);
    }

    if (data.efficiency !== undefined) {
        const effEl = document.getElementById('efficiency-value');
        if (effEl) effEl.textContent = data.efficiency + '%';
    }

    // Update DC-DC converter data
    if (data.converter) {
        updateConverterMetrics(data.converter);

        // Update gauges
        if (data.converter.outputVoltage !== undefined && voltageGauge) {
            voltageGauge.setValue(data.converter.outputVoltage);
            const vd = document.getElementById('voltage-display');
            if (vd) vd.textContent = data.converter.outputVoltage + ' V';
        }

        if (data.converter.efficiency !== undefined && efficiencyGauge) {
            efficiencyGauge.setValue(data.converter.efficiency);
            const ed = document.getElementById('efficiency-display');
            if (ed) ed.textContent = data.converter.efficiency + ' %';
        }
    }

    // Update system status
    if (data.systemStatus !== undefined) {
        updateSystemStatus(data.systemStatus);
    }

    // Update chart with real data
    const chartDataPoint = {
        generation: data.generation || 0,
        consumption: data.consumption || 0,
        batteryLevel: data.batteryLevel || 0,
        timestamp: new Date(data.timestamp || Date.now()),
        efficiency: data.efficiency || 95
    };

    updateChartData(chartDataPoint);

    // Update system timestamp
    updateSystemTimestamp();
}

/**
 * Advanced DC-DC Converter Monitoring Functions
 */

/**
 * Calculate power conversion efficiency
 */
function calculateEfficiency(inputVoltage, inputCurrent, outputVoltage, outputCurrent) {
    const inputPower = inputVoltage * inputCurrent;
    const outputPower = outputVoltage * outputCurrent;
    if (inputPower === 0) return 0;
    return (outputPower / inputPower) * 100;
}

/**
 * Monitor for critical alerts based on converter parameters
 */
function checkConverterAlerts(converterData) {
    const alerts = [];

    // Check efficiency
    if (converterData.efficiency < 85) {
        alerts.push({
            type: 'error',
            title: 'Critical Efficiency Drop',
            description: `Converter efficiency at ${converterData.efficiency}%. Check components.`,
            severity: 'high'
        });
    }

    // Check output voltage regulation
    const targetVoltage = 24.0; // Example target
    const voltageTolerance = 0.48; // ±2%
    if (Math.abs(converterData.outputVoltage - targetVoltage) > voltageTolerance) {
        alerts.push({
            type: 'warning',
            title: 'Output Voltage Out of Range',
            description: `Output voltage ${converterData.outputVoltage}V outside ±2% tolerance.`,
            severity: 'medium'
        });
    }

    // Check duty cycle limits
    if (converterData.dutyCycle > 90) {
        alerts.push({
            type: 'error',
            title: 'Critical Duty Cycle',
            description: `Duty cycle at ${converterData.dutyCycle}%. Risk of instability.`,
            severity: 'high'
        });
    }

    // Add alerts to system
    alerts.forEach(alert => {
        const newAlert = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            ...alert,
            timestamp: new Date()
        };
        systemAlerts.unshift(newAlert);
    });

    if (alerts.length > 0) {
        renderAlerts();
    }
}

/**
 * Generate simulated DC-DC Boost Converter and IoT sensor data
 */
function generateSensorData() {
    const now = new Date();

    // Simulate realistic energy patterns based on time of day
    const hour = now.getHours();

    // Solar generation peaks around noon, drops at night
    let generationBase = CONFIG.GENERATION_RANGE.min;
    if (hour >= 6 && hour <= 18) {
        const solarFactor = Math.sin((hour - 6) * Math.PI / 12);
        generationBase = CONFIG.GENERATION_RANGE.min +
            (CONFIG.GENERATION_RANGE.max - CONFIG.GENERATION_RANGE.min) * solarFactor;
    }

    // Add some randomness for wind generation
    const generation = generationBase + (Math.random() - 0.5) * 2;

    // Consumption varies throughout the day
    let consumptionBase = CONFIG.CONSUMPTION_RANGE.min;
    if (hour >= 7 && hour <= 22) {
        consumptionBase = CONFIG.CONSUMPTION_RANGE.min +
            (CONFIG.CONSUMPTION_RANGE.max - CONFIG.CONSUMPTION_RANGE.min) * 0.7;
    }

    const consumption = consumptionBase + (Math.random() - 0.5) * 2;

    // Battery level based on generation vs consumption balance
    const storageEl = document.getElementById('storage-value');
    const currentBattery = storageEl ? parseInt(storageEl.textContent, 10) || 75 : 75;
    const energyBalance = generation - consumption;
    let newBatteryLevel = currentBattery + (energyBalance * 2); // Simplified calculation

    // Keep battery within realistic bounds
    newBatteryLevel = Math.max(CONFIG.BATTERY_RANGE.min,
        Math.min(CONFIG.BATTERY_RANGE.max, newBatteryLevel));

    // DC-DC Boost Converter data simulation
    const inputVoltage = CONFIG.INPUT_VOLTAGE_RANGE.min +
        (CONFIG.INPUT_VOLTAGE_RANGE.max - CONFIG.INPUT_VOLTAGE_RANGE.min) *
        (0.8 + Math.random() * 0.4); // Vary around nominal

    const outputVoltage = CONFIG.OUTPUT_VOLTAGE_RANGE.min +
        (CONFIG.OUTPUT_VOLTAGE_RANGE.max - CONFIG.OUTPUT_VOLTAGE_RANGE.min) *
        (0.7 + Math.random() * 0.3); // More stable output

    const inputCurrent = CONFIG.INPUT_CURRENT_RANGE.min +
        (CONFIG.INPUT_CURRENT_RANGE.max - CONFIG.INPUT_CURRENT_RANGE.min) *
        (consumption / CONFIG.CONSUMPTION_RANGE.max); // Based on load

    const outputCurrent = inputCurrent * (inputVoltage / outputVoltage) * 0.92; // Accounting for efficiency

    const outputPower = outputVoltage * outputCurrent;

    // Duty cycle calculation (simplified boost converter formula)
    const dutyCycle = Math.min(CONFIG.DUTY_CYCLE_RANGE.max,
        Math.max(CONFIG.DUTY_CYCLE_RANGE.min,
            (1 - inputVoltage / outputVoltage) * 100));

    // Efficiency calculation based on realistic factors
    const baseEfficiency = CONFIG.EFFICIENCY_RANGE.max;
    const loadFactor = outputCurrent / CONFIG.OUTPUT_CURRENT_RANGE.max;
    const optimalLoad = 0.7; // Peak efficiency at 70% load
    const loadEfficiency = 1 - Math.abs(loadFactor - optimalLoad) * 0.1;
    const converterEfficiency = Math.max(CONFIG.EFFICIENCY_RANGE.min,
        baseEfficiency * loadEfficiency + (Math.random() - 0.5) * 2);

    return {
        generation: Math.max(0, generation),
        consumption: Math.max(0, consumption),
        batteryLevel: Math.round(newBatteryLevel),
        timestamp: now,
        efficiency: Math.round(92 + Math.random() * 6), // Overall system efficiency
        // DC-DC Converter specific data
        converter: {
            inputVoltage: Math.round(inputVoltage * 10) / 10,
            outputVoltage: Math.round(outputVoltage * 10) / 10,
            inputCurrent: Math.round(inputCurrent * 10) / 10,
            outputCurrent: Math.round(outputCurrent * 10) / 10,
            outputPower: Math.round(outputPower * 10) / 10,
            dutyCycle: Math.round(dutyCycle * 10) / 10,
            efficiency: Math.round(converterEfficiency * 10) / 10
        }
    };
}

/**
 * Update all dashboard elements with new data
 */
function updateDashboard() {
    const data = generateSensorData();

    // Update system status and timestamp
    updateSystemStatus('ACTIVE');
    updateSystemTimestamp();

    // Update metric cards
    updateMetricCard('generation', Number(data.generation).toFixed(1));
    updateMetricCard('consumption', Number(data.consumption).toFixed(1));
    updateMetricCard('storage', data.batteryLevel);

    // Update battery indicator
    updateBatteryIndicator(data.batteryLevel);

    // Update efficiency
    const effEl = document.getElementById('efficiency-value');
    if (effEl) effEl.textContent = data.efficiency + '%';

    // Update generation trend (simplified)
    updateGenerationTrend(data.generation);

    // Update DC-DC Converter metrics
    updateConverterMetrics(data.converter);

    // Update gauges
    if (voltageGauge) {
        voltageGauge.setValue(data.converter.outputVoltage);
        const vd = document.getElementById('voltage-display');
        if (vd) vd.textContent = data.converter.outputVoltage + ' V';
    }

    if (efficiencyGauge) {
        efficiencyGauge.setValue(data.converter.efficiency);
        const ed = document.getElementById('efficiency-display');
        if (ed) ed.textContent = data.converter.efficiency + ' %';
    }

    // Update chart data
    updateChartData(data);

    // Check converter alerts
    checkConverterAlerts(data.converter);

    console.log('Dashboard updated:', data);
}

/**
 * Update system status indicator
 */
function updateSystemStatus(status) {
    const statusBadge = document.getElementById('system-status');
    if (!statusBadge) return;
    const statusText = statusBadge.querySelector('.status-text') || statusBadge;

    if (status === 'ACTIVE') {
        statusBadge.classList.remove('inactive');
        statusText.textContent = 'ACTIVE';
    } else {
        statusBadge.classList.add('inactive');
        statusText.textContent = 'INACTIVE';
    }
}

/**
 * Update system timestamp
 */
function updateSystemTimestamp() {
    const timestampElement = document.getElementById('system-timestamp');
    if (timestampElement) {
        const now = new Date();
        const formatted = now.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        timestampElement.textContent = formatted;
    }
}

/**
 * Update DC-DC Converter performance metrics
 */
function updateConverterMetrics(converterData) {
    if (!converterData) return;

    // Update input voltage
    const inputVoltageEl = document.getElementById('input-voltage');
    if (inputVoltageEl && converterData.inputVoltage !== undefined) {
        animateMetricValue(inputVoltageEl, converterData.inputVoltage);
    }

    // Update input current
    const inputCurrentEl = document.getElementById('input-current');
    if (inputCurrentEl && converterData.inputCurrent !== undefined) {
        animateMetricValue(inputCurrentEl, converterData.inputCurrent);
    }

    // Update output current
    const outputCurrentEl = document.getElementById('output-current');
    if (outputCurrentEl && converterData.outputCurrent !== undefined) {
        animateMetricValue(outputCurrentEl, converterData.outputCurrent);
    }

    // Update output power
    const outputPowerEl = document.getElementById('output-power');
    if (outputPowerEl && converterData.outputPower !== undefined) {
        animateMetricValue(outputPowerEl, converterData.outputPower);
    }

    // Update duty cycle
    const dutyCycleEl = document.getElementById('duty-cycle');
    if (dutyCycleEl && converterData.dutyCycle !== undefined) {
        animateMetricValue(dutyCycleEl, converterData.dutyCycle);
    }
}

/**
 * Animate metric value changes with smooth transitions
 */
function animateMetricValue(element, newValue) {
    if (!element) return;

    element.style.transition = 'transform 150ms ease';
    element.style.transform = 'scale(1.05)';
    element.style.color = '#fff';

    setTimeout(() => {
        element.textContent = newValue;
        element.style.transform = 'scale(1)';
        element.style.color = '';
    }, 150);
}

/**
 * Update individual metric card values
 */
function updateMetricCard(type, value) {
    const element = document.getElementById(type + '-value');
    if (element) {
        element.style.transition = 'transform 150ms ease';
        element.style.transform = 'scale(1.05)';
        element.textContent = value;

        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }
}

/**
 * Update battery visual indicator
 */
function updateBatteryIndicator(batteryLevel) {
    const batteryFill = document.getElementById('battery-fill');
    if (batteryFill) {
        batteryFill.style.width = batteryLevel + '%';

        // Change color based on battery level
        if (batteryLevel < 20) {
            batteryFill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
        } else if (batteryLevel < 50) {
            batteryFill.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
        } else {
            batteryFill.style.background = 'linear-gradient(90deg, #3b82f6, #60a5fa)';
        }
    }
}

/**
 * Update generation trend indicator
 */
function updateGenerationTrend(currentGeneration) {
    const trendElement = document.getElementById('generation-trend');
    const changeElement = document.getElementById('generation-change');

    if (trendElement && changeElement) {
        const prevGeneration = chartData.generation[chartData.generation.length - 1] || currentGeneration;
        const change = prevGeneration === 0 ? 0 : ((currentGeneration - prevGeneration) / prevGeneration * 100);

        if (change > 0.01) {
            trendElement.textContent = '↗';
            trendElement.style.color = '#22c55e';
            changeElement.textContent = `+${change.toFixed(1)}%`;
            changeElement.style.color = '#22c55e';
        } else if (change < -0.01) {
            trendElement.textContent = '↘';
            trendElement.style.color = '#ef4444';
            changeElement.textContent = `${change.toFixed(1)}%`;
            changeElement.style.color = '#ef4444';
        } else {
            trendElement.textContent = '→';
            trendElement.style.color = '#64748b';
            changeElement.textContent = '0.0%';
            changeElement.style.color = '#64748b';
        }
    }
}

/**
 * Update chart with new data point
 */
function updateChartData(data) {
    const timeLabel = data.timestamp.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });

    // Add new data point
    chartData.labels.push(timeLabel);
    chartData.generation.push(data.generation);
    chartData.consumption.push(data.consumption);

    // Remove old data points if we exceed maximum
    if (chartData.labels.length > CONFIG.MAX_DATA_POINTS) {
        chartData.labels.shift();
        chartData.generation.shift();
        chartData.consumption.shift();
    }

    // Update chart
    if (energyChart) {
        energyChart.update('quiet');
    }
}

/**
 * Render system alerts in the alerts panel
 */
function renderAlerts() {
    const alertsList = document.getElementById('alerts-list');
    const alertCount = document.getElementById('alert-count');

    if (!alertsList || !alertCount) return;

    // Update alert count
    alertCount.textContent = systemAlerts.length;

    // Clear existing alerts
    alertsList.innerHTML = '';

    // Render each alert
    systemAlerts.forEach(alert => {
        const alertElement = createAlertElement(alert);
        alertsList.appendChild(alertElement);
    });

    // Show "No alerts" message if empty
    if (systemAlerts.length === 0) {
        alertsList.innerHTML = '<div class="no-alerts">No active alerts</div>';
        alertCount.textContent = '0';
    }
}

/**
 * Initialize circular gauges for voltage and efficiency
 */
function initializeGauges() {
    // Initialize voltage gauge
    const voltageCanvas = document.getElementById('voltageGauge');
    if (voltageCanvas) {
        voltageGauge = new CircularGauge(voltageCanvas, {
            min: 0,
            max: 60,
            value: 24.5,
            unit: 'V',
            color: '#60a5fa',
            backgroundColor: '#1e293b'
        });
    }

    // Initialize efficiency gauge
    const efficiencyCanvas = document.getElementById('efficiencyGauge');
    if (efficiencyCanvas) {
        efficiencyGauge = new CircularGauge(efficiencyCanvas, {
            min: 0,
            max: 100,
            value: 94.2,
            unit: '%',
            color: '#4ade80',
            backgroundColor: '#1e293b'
        });
    }
}

/**
 * Simple circular gauge class
 */
class CircularGauge {
    constructor(canvas, options) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = {
            min: options.min || 0,
            max: options.max || 100,
            value: options.value || 0,
            unit: options.unit || '',
            color: options.color || '#60a5fa',
            backgroundColor: options.backgroundColor || '#1e293b'
        };
        this.draw();
    }

    draw() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, 2.25 * Math.PI);
        ctx.lineWidth = 15;
        ctx.strokeStyle = this.options.backgroundColor;
        ctx.stroke();

        // Progress arc
        const progress = (this.options.value - this.options.min) / (this.options.max - this.options.min);
        const endAngle = 0.75 * Math.PI + progress * 1.5 * Math.PI;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, endAngle);
        ctx.lineWidth = 15;
        ctx.strokeStyle = this.options.color;
        ctx.stroke();

        // Center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 40, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
        ctx.fill();
    }

    setValue(value) {
        this.options.value = value;
        this.draw();
    }
}

/**
 * Initialize the energy chart using Chart.js
 */
function initializeChart() {
    const chartEl = document.getElementById('energyChart');
    if (!chartEl) return;
    const ctx = chartEl.getContext('2d');

    energyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'Generation (kWh)',
                    data: chartData.generation,
                    borderColor: '#4ade80',
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4ade80',
                    pointBorderColor: '#22c55e',
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Consumption (kWh)',
                    data: chartData.consumption,
                    borderColor: '#fbbf24',
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#fbbf24',
                    pointBorderColor: '#f59e0b',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {}
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Energy (kWh)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Initialize dashboard when page loads
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('GridX Dashboard with DC-DC Analytics initializing...');

    // Initialize chart and gauges
    initializeChart();
    initializeGauges();

    // Load initial data
    updateDashboard();
    renderAlerts();

    // Start real-time data updates
    startDataUpdates();

    // Update timestamp
    updateTimestamp();
    setInterval(updateTimestamp, 1000);

    console.log('GridX Dashboard initialized successfully');
});

/**
 * Export functions for module usage (if needed)
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateDashboard,
        generateSensorData,
        updateDashboardWithRealData,
        updateConverterMetrics,
        clearAlerts,
        dismissAlert,
        calculateEfficiency,
        checkConverterAlerts
    };
}

// Format timestamp
const timeAgo = getTimeAgo(alert.timestamp);

alertDiv.innerHTML = `
    <div class="alert-icon">${alertIcon}</div>
    <div class="alert-content">
        <div class="alert-title">${alert.title}</div>
        <div class="alert-description">${alert.description}</div>
        <div class="alert-time">${timeAgo}</div>
    </div>
`;
