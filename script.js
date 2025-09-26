/**
 * GridX Microgrid Monitoring Dashboard
 * JavaScript for real-time data simulation and dashboard functionality
 * 
 * This script simulates IoT sensor data and can be easily integrated with:
 * - Firebase Realtime Database
 * - MQTT brokers (Mosquitto, AWS IoT Core, etc.)
 * - REST APIs
 * - WebSocket connections
 */

// Global variables for data management
let energyChart;
let chartData = {
    labels: [],
    generation: [],
    consumption: []
};

// System alerts array
let systemAlerts = [
    {
        id: 1,
        type: 'warning',
        title: 'Battery Efficiency Low',
        description: 'Battery storage efficiency has dropped to 89%. Consider maintenance check.',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        severity: 'medium'
    },
    {
        id: 2,
        type: 'error',
        title: 'Wind Turbine Anomaly',
        description: 'Wind turbine #2 showing irregular power output patterns.',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        severity: 'high'
    },
    {
        id: 3,
        type: 'info',
        title: 'Solar Panel Cleaning Due',
        description: 'Scheduled maintenance for solar panel cleaning in 2 days.',
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
    BATTERY_RANGE: { min: 45, max: 95 } // Percentage
};

/**
 * Initialize dashboard when page loads
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('GridX Dashboard initializing...');
    
    // Initialize chart
    initializeChart();
    
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
 * Initialize the energy chart using Chart.js
 */
function initializeChart() {
    const ctx = document.getElementById('energyChart').getContext('2d');
    
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
                    position: 'top',
                    labels: {
                        color: '#cbd5e1',
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    titleFont: {
                        size: 14,
                        weight: '600'
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time',
                        color: '#94a3b8',
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    },
                    ticks: {
                        color: '#64748b',
                        maxTicksLimit: 8,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)',
                        drawBorder: false
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Energy (kWh)',
                        color: '#94a3b8',
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    },
                    ticks: {
                        color: '#64748b',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)',
                        drawBorder: false
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Generate simulated IoT sensor data
 * In a real implementation, this would be replaced with actual sensor readings
 */
function generateSensorData() {
    const now = new Date();
    
    // Simulate realistic energy patterns based on time of day
    const hour = now.getHours();
    const minute = now.getMinutes();
    
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
    const currentBattery = parseInt(document.getElementById('storage-value').textContent) || 75;
    const energyBalance = generation - consumption;
    let newBatteryLevel = currentBattery + (energyBalance * 2); // Simplified calculation
    
    // Keep battery within realistic bounds
    newBatteryLevel = Math.max(CONFIG.BATTERY_RANGE.min, 
                              Math.min(CONFIG.BATTERY_RANGE.max, newBatteryLevel));
    
    return {
        generation: Math.max(0, generation),
        consumption: Math.max(0, consumption),
        batteryLevel: Math.round(newBatteryLevel),
        timestamp: now,
        efficiency: Math.round(92 + Math.random() * 6) // 92-98% efficiency
    };
}

/**
 * Update all dashboard elements with new data
 */
function updateDashboard() {
    const data = generateSensorData();
    
    // Update metric cards
    updateMetricCard('generation', data.generation.toFixed(1));
    updateMetricCard('consumption', data.consumption.toFixed(1));
    updateMetricCard('storage', data.batteryLevel);
    
    // Update battery indicator
    updateBatteryIndicator(data.batteryLevel);
    
    // Update efficiency
    document.getElementById('efficiency-value').textContent = data.efficiency + '%';
    
    // Update generation trend (simplified)
    updateGenerationTrend(data.generation);
    
    // Update chart data
    updateChartData(data);
    
    console.log('Dashboard updated:', data);
}

/**
 * Update individual metric card values
 */
function updateMetricCard(type, value) {
    const element = document.getElementById(type + '-value');
    if (element) {
        // Add animation class
        element.style.transform = 'scale(1.05)';
        element.textContent = value;
        
        // Remove animation after short delay
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
        // Get previous generation value for comparison
        const prevGeneration = chartData.generation[chartData.generation.length - 1] || currentGeneration;
        const change = ((currentGeneration - prevGeneration) / prevGeneration * 100);
        
        if (change > 0) {
            trendElement.textContent = '↗';
            trendElement.style.color = '#22c55e';
            changeElement.textContent = `+${change.toFixed(1)}%`;
            changeElement.style.color = '#22c55e';
        } else if (change < 0) {
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
 * Create HTML element for a single alert
 */
function createAlertElement(alert) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-item';
    alertDiv.dataset.alertId = alert.id;
    
    // Determine alert icon based on type
    let alertIcon = '⚠️';
    if (alert.type === 'error') alertIcon = '🚨';
    if (alert.type === 'info') alertIcon = 'ℹ️';
    
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
    
    // Add click handler for alert dismissal
    alertDiv.addEventListener('click', () => dismissAlert(alert.id));
    
    return alertDiv;
}

/**
 * Calculate time ago string for alerts
 */
function getTimeAgo(timestamp) {
    const now = new Date();
    const diffMs = now - timestamp;
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
 * Simulate random alert generation
 * In a real system, alerts would come from actual sensor monitoring
 */
function generateRandomAlert() {
    const alertTypes = [
        {
            type: 'warning',
            title: 'High Energy Demand',
            description: 'Energy consumption is above normal levels for this time of day.',
            severity: 'medium'
        },
        {
            type: 'info',
            title: 'Weather Update',
            description: 'Favorable wind conditions expected for next 6 hours.',
            severity: 'low'
        },
        {
            type: 'error',
            title: 'Communication Error',
            description: 'Lost connection to remote sensor node #3.',
            severity: 'high'
        },
        {
            type: 'warning',
            title: 'Battery Temperature',
            description: 'Battery temperature slightly elevated. Monitoring closely.',
            severity: 'medium'
        }
    ];
    
    // Only add alert if we don't have too many already
    if (systemAlerts.length < 5 && Math.random() < 0.1) { // 10% chance every update
        const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const newAlert = {
            id: Date.now(), // Use timestamp as unique ID
            ...randomAlert,
            timestamp: new Date()
        };
        
        systemAlerts.unshift(newAlert); // Add to beginning of array
        renderAlerts();
        console.log('New alert generated:', newAlert.title);
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
    // Update dashboard data every 5 seconds
    setInterval(() => {
        updateDashboard();
        generateRandomAlert();
    }, CONFIG.UPDATE_INTERVAL);
    
    console.log(`Started automatic updates every ${CONFIG.UPDATE_INTERVAL/1000} seconds`);
}

/**
 * Time range selector functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    const timeRangeButtons = document.querySelectorAll('.time-range');
    
    timeRangeButtons.forEach(button => {
        button.addEventListener('click', function() {
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
 * Integration helpers for real IoT systems
 * These functions provide a foundation for connecting to actual data sources
 */

/**
 * Firebase Integration Template
 * Uncomment and configure for Firebase Realtime Database
 */
/*
function connectToFirebase() {
    // Initialize Firebase (replace with your config)
    const firebaseConfig = {
        databaseURL: "https://your-project.firebaseio.com/"
    };
    
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    
    // Listen for real-time updates
    database.ref('sensors').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            updateDashboardWithRealData(data);
        }
    });
}
*/

/**
 * MQTT Integration Template
 * Uncomment and configure for MQTT broker connection
 */
/*
function connectToMQTT() {
    // Using a library like mqtt.js or Paho MQTT
    const client = mqtt.connect('ws://your-mqtt-broker:9001');
    
    client.on('connect', () => {
        console.log('Connected to MQTT broker');
        client.subscribe('sensors/energy/+');
    });
    
    client.on('message', (topic, message) => {
        const data = JSON.parse(message.toString());
        handleMQTTMessage(topic, data);
    });
}

function handleMQTTMessage(topic, data) {
    if (topic.includes('generation')) {
        updateMetricCard('generation', data.value);
    } else if (topic.includes('storage')) {
        updateMetricCard('storage', data.value);
        updateBatteryIndicator(data.value);
    } else if (topic.includes('consumption')) {
        updateMetricCard('consumption', data.value);
    }
}
*/

/**
 * REST API Integration Template
 * Uncomment and configure for REST API polling
 */
/*
async function fetchSensorData() {
    try {
        const response = await fetch('/api/sensors/latest');
        const data = await response.json();
        updateDashboardWithRealData(data);
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        // Handle error - maybe show connection alert
    }
}

// Poll API every 30 seconds
setInterval(fetchSensorData, 30000);
*/

/**
 * WebSocket Integration Template
 * Uncomment and configure for WebSocket real-time connection
 */
/*
function connectWebSocket() {
    const ws = new WebSocket('ws://your-websocket-server:3000');
    
    ws.onopen = () => {
        console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        updateDashboardWithRealData(data);
    };
    
    ws.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt reconnection
        setTimeout(connectWebSocket, 5000);
    };
}
*/

/**
 * Update dashboard with real sensor data
 * This function should be called when receiving actual IoT data
 */
function updateDashboardWithRealData(data) {
    if (data.generation !== undefined) {
        updateMetricCard('generation', data.generation.toFixed(1));
    }
    
    if (data.consumption !== undefined) {
        updateMetricCard('consumption', data.consumption.toFixed(1));
    }
    
    if (data.batteryLevel !== undefined) {
        updateMetricCard('storage', data.batteryLevel);
        updateBatteryIndicator(data.batteryLevel);
    }
    
    if (data.efficiency !== undefined) {
        document.getElementById('efficiency-value').textContent = data.efficiency + '%';
    }
    
    // Update chart with real data
    const chartData = {
        generation: data.generation || 0,
        consumption: data.consumption || 0,
        batteryLevel: data.batteryLevel || 0,
        timestamp: new Date(data.timestamp || Date.now()),
        efficiency: data.efficiency || 95
    };
    
    updateChartData(chartData);
}

// Export functions for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateDashboard,
        generateSensorData,
        updateDashboardWithRealData,
        clearAlerts,
        dismissAlert
    };
}