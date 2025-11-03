
document.addEventListener('DOMContentLoaded', function () {
    const mainTabs = document.querySelectorAll('.tab-button');
    const mainContentSections = document.querySelectorAll('.content-section');

    mainTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');

            mainContentSections.forEach(section => {
                section.classList.add('hidden');
            });

            mainTabs.forEach(t => {
                t.classList.remove('active');
                t.classList.add('bg-white', 'bg-opacity-50', 'hover:bg-opacity-100');
            });

            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }

            tab.classList.add('active');
            tab.classList.remove('bg-white', 'bg-opacity-50', 'hover:bg-opacity-100');
        });
    });

    const subTabs = document.querySelectorAll('.sub-tab-button');
    const subContentSections = document.querySelectorAll('.sub-content-section');

    subTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');

            subContentSections.forEach(section => {
                section.classList.add('hidden');
            });

            subTabs.forEach(t => {
                t.classList.remove('active', 'shadow');
                t.classList.add('bg-white', 'bg-opacity-50');
            });

            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }

            tab.classList.add('active', 'shadow');
            tab.classList.remove('bg-white', 'bg-opacity-50');
        });
    });

    // --- LÓGICA DEL CLIMA Y MAPA ---

    const temperaturaEl = document.getElementById('temperatura');
    const descripcionEl = document.getElementById('descripcion');
    const humedadEl = document.getElementById('humedad');
    const vientoEl = document.getElementById('viento');
    const lluviaEl = document.getElementById('lluvia');
    const actualizadoEl = document.getElementById('actualizado');
    const alertasContainer = document.getElementById('alertas-container');
    let map;
    let marker;

    const COMARAPA_COORDS = { latitude: -17.9054, longitude: -64.4889 };

    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                fetchWeatherData(position.coords);
                fetchAlerts(position.coords);
            }, handleLocationError);
        } else {
            alert("La geolocalización no es soportada por este navegador. Mostrando datos para Comarapa.");
            fetchWeatherData(COMARAPA_COORDS);
            fetchAlerts(COMARAPA_COORDS);
        }
    }

    function handleLocationError(error) {
        console.error("Error de geolocalización:", error);
        alert("No se pudo obtener tu ubicación. Mostrando datos para Comarapa.");
        fetchWeatherData(COMARAPA_COORDS);
        fetchAlerts(COMARAPA_COORDS);
    }

    async function fetchWeatherData(coords) {
        const { latitude, longitude } = coords;
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=precipitation_probability,relativehumidity_2m,windspeed_10m&daily=weathercode&timezone=auto`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            updateWeatherUI(data, latitude, longitude);
        } catch (error) {
            console.error("Error al obtener los datos del clima:", error);
            temperaturaEl.textContent = "Error";
        }
    }

    async function fetchAlerts(coords) {
        // NOTA: Se necesita una API Key de OpenWeather para obtener alertas reales.
        // Por ahora, se usan datos de ejemplo.
        const { latitude, longitude } = coords;
        const API_KEY = 'TU_API_KEY_DE_OPENWEATHER'; // ¡Reemplazar con tu clave!
        // const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,daily,current&appid=${API_KEY}`;

        // Datos de ejemplo mientras no haya API Key
        const dummyAlerts = [
            {
                event: "Alerta Amarilla: Vientos Fuertes",
                description: "Se esperan ráfagas de viento de hasta 40 km/h en las próximas 6 horas. Asegure invernaderos y cubiertas."
            },
            {
                event: "Aviso: Descenso de Temperatura",
                description: "Posible descenso de temperatura nocturna para el 04 de Nov. Riesgo leve de heladas en zonas altas."
            }
        ];

        updateAlertsUI(dummyAlerts);

        /* Descomentar cuando se tenga una API Key:
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            updateAlertsUI(data.alerts);
        } catch (error) {
            console.error("Error al obtener las alertas:", error);
        }
        */
    }

    function updateWeatherUI(data, lat, lon) {
        if (data && data.current_weather) {
            const currentWeather = data.current_weather;
            const hourly = data.hourly;

            temperaturaEl.textContent = `${Math.round(currentWeather.temperature)}°C`;
            descripcionEl.textContent = getWeatherDescription(currentWeather.weathercode);

            const now = new Date();
            const currentHourIndex = hourly.time.findIndex(t => new Date(t) >= now);

            if (currentHourIndex !== -1) {
                humedadEl.textContent = hourly.relativehumidity_2m[currentHourIndex];
                vientoEl.textContent = hourly.windspeed_10m[currentHourIndex];
                lluviaEl.textContent = hourly.precipitation_probability[currentHourIndex];
            }

            actualizadoEl.textContent = new Date().toLocaleString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            if (!map) {
                initMap(lat, lon);
            } else {
                marker.setLatLng([lat, lon]);
                map.setView([lat, lon], 13);
            }
        }
    }

    function updateAlertsUI(alerts) {
        alertasContainer.innerHTML = ''; // Limpiar alertas anteriores

        if (alerts && alerts.length > 0) {
            alerts.forEach(alerta => {
                const alertElement = document.createElement('div');
                alertElement.className = 'border-l-4 border-yellow-500 pl-4';
                alertElement.innerHTML = `
                    <h4 class="font-bold text-lg">${alerta.event}</h4>
                    <p class="text-gray-700">${alerta.description}</p>
                `;
                alertasContainer.appendChild(alertElement);
            });
        } else {
            alertasContainer.innerHTML = '<p class="text-gray-500">No hay alertas en este momento.</p>';
        }
    }

    function getWeatherDescription(code) {
        const descriptions = {
            0: "Despejado", 1: "Principalmente despejado", 2: "Parcialmente nublado", 3: "Nublado",
            45: "Niebla", 48: "Niebla con escarcha", 51: "Llovizna ligera", 53: "Llovizna moderada",
            55: "Llovizna densa", 61: "Lluvia ligera", 63: "Lluvia moderada", 65: "Lluvia fuerte",
            80: "Chubascos ligeros", 81: "Chubascos moderados", 82: "Chubascos violentos", 95: "Tormenta"
        };
        return descriptions[code] || "No disponible";
    }

    function initMap(lat, lon) {
        map = L.map('map').setView([lat, lon], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        marker = L.marker([lat, lon]).addTo(map)
            .bindPopup('Ubicación actual.')
            .openPopup();
    }

    // --- INICIALIZACIÓN ---

    getUserLocation();

    setInterval(getUserLocation, 1800000); // 30 minutos
});
