const apiKey = '568ab9708a2b6ca13762a2b0f93642cb'; 

async function getWeather() {
    const city = document.getElementById('cityInput').value;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("City not found");

        const data = await response.json();

        document.getElementById('cityName').textContent = data.name;
        document.getElementById('temperature').textContent = `Temperature: ${data.main.temp}°C`;
        document.getElementById('description').textContent = `Description: ${data.weather[0].description}`;
        document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;

        // Handle rain data if available
        const rainVolume = data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0;
        document.getElementById('rain').textContent = `Rain: ${rainVolume}%`;

        // Update weather icon
        const iconCode = data.weather[0].icon;
        document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    } catch (error) {
        alert("Error: " + error.message);
    }
}
