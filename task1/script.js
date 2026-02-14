// Weather API - Using Open-Meteo (FREE, no API key required)
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// City coordinates with timezone info
const CITIES = {
    'London': { 
        lat: 51.5074, 
        lon: -0.1278, 
        country: 'UK',
        timezone: 'Europe/London'
    },
    'New York': { 
        lat: 40.7128, 
        lon: -74.0060, 
        country: 'US',
        timezone: 'America/New_York'
    },
    'Tokyo': { 
        lat: 35.6762, 
        lon: 139.6503, 
        country: 'JP',
        timezone: 'Asia/Tokyo'
    },
    'Paris': { 
        lat: 48.8566, 
        lon: 2.3522, 
        country: 'FR',
        timezone: 'Europe/Paris'
    },
    'Delhi': { 
        lat: 28.6139, 
        lon: 77.2090, 
        country: 'IN',
        timezone: 'Asia/Kolkata'
    },
    'Sydney': { 
        lat: -33.8688, 
        lon: 151.2093, 
        country: 'AU',
        timezone: 'Australia/Sydney'
    },
    'Mumbai': { 
        lat: 19.0760, 
        lon: 72.8777, 
        country: 'IN',
        timezone: 'Asia/Kolkata'
    },
    'Dubai': { 
        lat: 25.2048, 
        lon: 55.2708, 
        country: 'AE',
        timezone: 'Asia/Dubai'
    },
    'Singapore': { 
        lat: 1.3521, 
        lon: 103.8198, 
        country: 'SG',
        timezone: 'Asia/Singapore'
    },
    'Berlin': { 
        lat: 52.5200, 
        lon: 13.4050, 
        country: 'DE',
        timezone: 'Europe/Berlin'
    },
    'Moscow': { 
        lat: 55.7558, 
        lon: 37.6173, 
        country: 'RU',
        timezone: 'Europe/Moscow'
    },
    'Beijing': { 
        lat: 39.9042, 
        lon: 116.4074, 
        country: 'CN',
        timezone: 'Asia/Shanghai'
    },
    'Cairo': { 
        lat: 30.0444, 
        lon: 31.2357, 
        country: 'EG',
        timezone: 'Africa/Cairo'
    },
    'Rio de Janeiro': { 
        lat: -22.9068, 
        lon: -43.1729, 
        country: 'BR',
        timezone: 'America/Sao_Paulo'
    },
    'Toronto': { 
        lat: 43.6532, 
        lon: -79.3832, 
        country: 'CA',
        timezone: 'America/Toronto'
    }
};

// Weather code descriptions
const WEATHER_DESCRIPTIONS = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Light rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Heavy thunderstorm with hail'
};

// Weather code icons
const WEATHER_ICONS = {
    0: '01', 1: '02', 2: '03', 3: '04',
    45: '50', 48: '50',
    51: '09', 53: '09', 55: '09',
    56: '13', 57: '13',
    61: '10', 63: '10', 65: '10',
    66: '13', 67: '13',
    71: '13', 73: '13', 75: '13', 77: '13',
    80: '09', 81: '09', 82: '09',
    85: '13', 86: '13',
    95: '11', 96: '11', 99: '11'
};

// DOM Elements
const elements = {
    cityInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    locationBtn: document.getElementById('location-btn'),
    retryBtn: document.getElementById('retry-btn'),
    cityTags: document.querySelectorAll('.city-tag'),
    cityName: document.getElementById('city-name'),
    country: document.getElementById('country'),
    dateTime: document.getElementById('date-time'),
    temperature: document.getElementById('temperature'),
    weatherIcon: document.getElementById('weather-icon'),
    weatherDescription: document.getElementById('weather-description'),
    feelsLike: document.getElementById('feels-like'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('wind-speed'),
    pressure: document.getElementById('pressure'),
    lastUpdated: document.getElementById('last-updated'),
    forecastDays: document.getElementById('forecast-days'),
    loading: document.getElementById('loading'),
    weatherData: document.querySelector('.weather-data'),
    errorMessage: document.getElementById('error-message'),
    forecastLoading: document.getElementById('forecast-loading'),
    notification: document.getElementById('notification'),
    notificationText: document.getElementById('notification-text')
};

// Current city and timezone
let currentCity = 'London';
let currentTimezone = 'Europe/London';

// Initialize
function init() {
    console.log('🌤️ Weather Dashboard with Local Time Initialized');
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial weather
    fetchWeather(currentCity);
    
    // Update last updated time
    updateLastUpdated();
    setInterval(updateLastUpdated, 1000);
}

// Setup event listeners
function setupEventListeners() {
    // Search button
    elements.searchBtn.addEventListener('click', handleSearch);
    
    // Enter key
    elements.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Location button
    elements.locationBtn.addEventListener('click', getLocationWeather);
    
    // Retry button
    elements.retryBtn.addEventListener('click', () => fetchWeather(currentCity));
    
    // Quick city tags
    elements.cityTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const city = tag.getAttribute('data-city');
            fetchWeather(city);
        });
    });
}

// Handle search
function handleSearch() {
    const city = elements.cityInput.value.trim();
    if (city) {
        if (CITIES[city]) {
            fetchWeather(city);
            elements.cityInput.value = '';
        } else {
            // Try to find city with partial match
            const foundCity = Object.keys(CITIES).find(c => 
                c.toLowerCase().includes(city.toLowerCase())
            );
            
            if (foundCity) {
                fetchWeather(foundCity);
                elements.cityInput.value = '';
            } else {
                showNotification(`City "${city}" not found. Try: ${Object.keys(CITIES).slice(0, 8).join(', ')}`, 'error');
            }
        }
    } else {
        showNotification('Please enter a city name', 'error');
    }
}

// Fetch weather data
async function fetchWeather(city) {
    showLoading();
    currentCity = city;
    
    const cityData = CITIES[city];
    if (!cityData) {
        showError(`City "${city}" not found in database.`);
        showNotification(`City "${city}" not available. Try other cities.`, 'error');
        return;
    }
    
    // Store timezone for this city
    currentTimezone = cityData.timezone;
    
    try {
        // Get weather data with timezone from API
        const url = `${WEATHER_API}?latitude=${cityData.lat}&longitude=${cityData.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=${cityData.timezone}`;
        
        console.log('Fetching weather for:', city, 'Timezone:', cityData.timezone);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Weather Data:', data);
        
        // Update UI with city's local time
        updateCurrentWeather(data, city, cityData);
        updateForecast(data);
        
        hideLoading();
        showWeatherData();
        showNotification(`Weather for ${city} loaded successfully!`);
        
    } catch (error) {
        console.error('Fetch error:', error);
        
        // Fallback to mock data
        showMockData(city, cityData);
        showNotification(`Using demo data for ${city}`, 'info');
    }
}

// Update current weather with city's local time
function updateCurrentWeather(data, city, cityData) {
    const current = data.current;
    const weatherCode = current.weather_code;
    
    // Update basic info
    elements.cityName.textContent = city;
    elements.country.textContent = cityData.country;
    elements.temperature.textContent = Math.round(current.temperature_2m);
    elements.feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`;
    elements.humidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;
    elements.windSpeed.textContent = `${current.wind_speed_10m.toFixed(1)} m/s`;
    elements.pressure.textContent = `${Math.round(current.pressure_msl)} hPa`;
    
    // Update weather description and icon
    const description = WEATHER_DESCRIPTIONS[weatherCode] || 'Clear sky';
    const iconCode = WEATHER_ICONS[weatherCode] || '01';
    const isDayTime = isDayTimeInCity(cityData.timezone);
    const dayNight = isDayTime ? 'd' : 'n';
    
    elements.weatherDescription.textContent = description;
    elements.weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}${dayNight}@2x.png`;
    elements.weatherIcon.alt = description;
    
    // Update date and time in city's local timezone
    updateCityDateTime(cityData.timezone);
}

// Check if it's daytime in the city
function isDayTimeInCity(timezone) {
    const now = new Date();
    const cityTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const hour = cityTime.getHours();
    return hour >= 6 && hour < 18; // Daytime: 6 AM to 6 PM
}

// Update date and time display for the city's timezone
function updateCityDateTime(timezone) {
    const now = new Date();
    const cityTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    
    // Format date
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: timezone
    };
    
    // Format time
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        timeZone: timezone,
        hour12: true
    };
    
    const dateStr = cityTime.toLocaleDateString('en-US', dateOptions);
    const timeStr = cityTime.toLocaleTimeString('en-US', timeOptions);
    
    elements.dateTime.textContent = `${dateStr} • ${timeStr}`;
}

// Update forecast
function updateForecast(data) {
    elements.forecastLoading.style.display = 'none';
    
    const daily = data.daily;
    let forecastHTML = '';
    
    // Show next 5 days
    for (let i = 1; i <= 5 && i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const dayName = date.toLocaleDateString('en-US', { 
            weekday: 'short',
            timeZone: currentTimezone
        });
        const monthDay = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            timeZone: currentTimezone
        });
        
        const weatherCode = daily.weather_code[i];
        const description = WEATHER_DESCRIPTIONS[weatherCode] || 'Clear';
        const iconCode = WEATHER_ICONS[weatherCode] || '01';
        
        forecastHTML += `
            <div class="forecast-day">
                <div class="forecast-date">${dayName}<br>${monthDay}</div>
                <img class="forecast-icon" src="https://openweathermap.org/img/wn/${iconCode}d.png" alt="${description}">
                <div class="forecast-temp">
                    <span class="temp-high">${Math.round(daily.temperature_2m_max[i])}°</span>
                    <span class="temp-low">${Math.round(daily.temperature_2m_min[i])}°</span>
                </div>
                <div class="forecast-desc">${description}</div>
            </div>
        `;
    }
    
    elements.forecastDays.innerHTML = forecastHTML;
}

// Mock data fallback
function showMockData(city, cityData) {
    // Generate realistic mock data
    const mockTemp = getSeasonalTemperature(city, cityData.lat);
    const mockHumidity = Math.floor(Math.random() * 40) + 40; // 40-80%
    const mockWind = (Math.random() * 10).toFixed(1); // 0-10 m/s
    const mockPressure = Math.floor(Math.random() * 100) + 1000; // 1000-1100 hPa
    
    elements.cityName.textContent = city;
    elements.country.textContent = cityData.country;
    elements.temperature.textContent = mockTemp;
    elements.feelsLike.textContent = `${mockTemp - 2}°C`;
    elements.humidity.textContent = `${mockHumidity}%`;
    elements.windSpeed.textContent = `${mockWind} m/s`;
    elements.pressure.textContent = `${mockPressure} hPa`;
    
    // Determine if it's daytime in the city for icon
    const isDayTime = isDayTimeInCity(cityData.timezone);
    const dayNight = isDayTime ? 'd' : 'n';
    elements.weatherIcon.src = `https://openweathermap.org/img/wn/03${dayNight}@2x.png`;
    elements.weatherDescription.textContent = 'Partly cloudy';
    
    // Update city's local time
    updateCityDateTime(cityData.timezone);
    
    // Generate mock forecast
    let forecastHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i);
        
        const dayName = futureDate.toLocaleDateString('en-US', { 
            weekday: 'short',
            timeZone: cityData.timezone
        });
        const monthDay = futureDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            timeZone: cityData.timezone
        });
        
        const highTemp = mockTemp + Math.floor(Math.random() * 5);
        const lowTemp = mockTemp - Math.floor(Math.random() * 5);
        
        forecastHTML += `
            <div class="forecast-day">
                <div class="forecast-date">${dayName}<br>${monthDay}</div>
                <img class="forecast-icon" src="https://openweathermap.org/img/wn/03d.png" alt="Partly cloudy">
                <div class="forecast-temp">
                    <span class="temp-high">${highTemp}°</span>
                    <span class="temp-low">${lowTemp}°</span>
                </div>
                <div class="forecast-desc">Partly cloudy</div>
            </div>
        `;
    }
    
    elements.forecastDays.innerHTML = forecastHTML;
    
    hideLoading();
    showWeatherData();
}

// Get seasonal temperature based on latitude and month
function getSeasonalTemperature(city, lat) {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const isNorthern = lat > 0;
    
    if (isNorthern) {
        // Northern hemisphere
        if (month >= 11 || month <= 1) return Math.floor(Math.random() * 10) - 5; // Winter: -5 to 5°C
        if (month >= 2 && month <= 4) return Math.floor(Math.random() * 15) + 5; // Spring: 5-20°C
        if (month >= 5 && month <= 7) return Math.floor(Math.random() * 20) + 15; // Summer: 15-35°C
        return Math.floor(Math.random() * 15) + 10; // Autumn: 10-25°C
    } else {
        // Southern hemisphere (reversed seasons)
        if (month >= 5 && month <= 7) return Math.floor(Math.random() * 10) - 5; // Winter: -5 to 5°C
        if (month >= 8 && month <= 10) return Math.floor(Math.random() * 15) + 5; // Spring: 5-20°C
        if (month >= 11 || month <= 1) return Math.floor(Math.random() * 20) + 15; // Summer: 15-35°C
        return Math.floor(Math.random() * 15) + 10; // Autumn: 10-25°C
    }
}

// Get location weather
function getLocationWeather() {
    if (!navigator.geolocation) {
        showNotification('Geolocation not supported', 'error');
        return;
    }
    
    showNotification('Getting your location...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            
            // Find nearest city
            let nearestCity = 'London';
            let minDistance = Infinity;
            
            for (const [city, cityData] of Object.entries(CITIES)) {
                const distance = Math.sqrt(
                    Math.pow(cityData.lat - latitude, 2) + 
                    Math.pow(cityData.lon - longitude, 2)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestCity = city;
                }
            }
            
            fetchWeather(nearestCity);
        },
        (error) => {
            console.error('Geolocation error:', error);
            showNotification('Could not get location. Using London.', 'error');
            fetchWeather('London');
        }
    );
}

// UI Helper Functions
function showLoading() {
    elements.loading.style.display = 'flex';
    elements.weatherData.style.display = 'none';
    elements.errorMessage.style.display = 'none';
    elements.forecastLoading.style.display = 'flex';
}

function hideLoading() {
    elements.loading.style.display = 'none';
    elements.forecastLoading.style.display = 'none';
}

function showWeatherData() {
    elements.weatherData.style.display = 'grid';
    elements.errorMessage.style.display = 'none';
}

function showError(message) {
    hideLoading();
    elements.weatherData.style.display = 'none';
    elements.errorMessage.style.display = 'block';
    elements.errorMessage.querySelector('p').textContent = message;
}

function updateLastUpdated() {
    const now = new Date();
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    elements.lastUpdated.textContent = `Last updated: ${now.toLocaleTimeString('en-US', timeOptions)}`;
}

function showNotification(message, type = 'success') {
    elements.notificationText.textContent = message;
    
    // Set color
    if (type === 'error') {
        elements.notification.style.background = '#ff4757';
    } else if (type === 'info') {
        elements.notification.style.background = '#2d3436';
    } else {
        elements.notification.style.background = '#4CAF50';
    }
    
    // Show
    elements.notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

// Console welcome message
console.log(`
╔══════════════════════════════════════════════════╗
║     WEATHER DASHBOARD WITH LOCAL TIMEZONES       ║
╚══════════════════════════════════════════════════╝
✅ Shows LOCAL TIME for each city (not your time)
✅ 15 supported cities worldwide
✅ Day/Night icons based on city's local time
✅ Real weather data (no API key needed!)
✅ 5-day forecast with city timezone

SUPPORTED CITIES:
• London (Europe/London)
• New York (America/New_York)
• Tokyo (Asia/Tokyo)
• Paris (Europe/Paris)
• Delhi (Asia/Kolkata) - IST
• Sydney (Australia/Sydney)
• Dubai (Asia/Dubai)
• Singapore (Asia/Singapore)
• Berlin (Europe/Berlin)
• Moscow (Europe/Moscow)
• Beijing (Asia/Shanghai)
• Cairo (Africa/Cairo)
• Rio de Janeiro (America/Sao_Paulo)
• Toronto (America/Toronto)

FEATURES:
• Local date/time for each city
• Correct day/night icons
• City-specific timezones
• Real-time weather updates
• Responsive design

TRY: Search "London" and see UK time, not India time!
`);