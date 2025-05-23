const weatherApiKey = "568ab9708a2b6ca13762a2b0f93642cb"
const unsplashAccessKey = "N02LsOJq4iDq1Esz8qxhQvztXmtpIR5SS8jru7SLOJo"
const favorites = JSON.parse(localStorage.getItem("weatherFavorites")) || []
let currentCity = ""
let currentUnit = localStorage.getItem("weatherUnit") || "metric" // metric or imperial

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  // Set temperature unit
  updateUnitButtons()

  // Load favorites
  displayFavorites()

  // Get current location weather
  getCurrentLocationWeather()

  // Add event listeners for unit toggle
  document.getElementById("celsiusBtn").addEventListener("click", () => {
    setTemperatureUnit("metric")
  })
  document.getElementById("fahrenheitBtn").addEventListener("click", () => {
    setTemperatureUnit("imperial")
  })
})

// Set temperature unit
function setTemperatureUnit(unit) {
  if (currentUnit === unit) return

  currentUnit = unit
  localStorage.setItem("weatherUnit", unit)
  updateUnitButtons()

  
  if (currentCity) {
    document.getElementById("cityInput").value = currentCity
    getWeather()
  } else {
    getCurrentLocationWeather()
  }
}

// Update unit toggle buttons
function updateUnitButtons() {
  const celsiusBtn = document.getElementById("celsiusBtn")
  const fahrenheitBtn = document.getElementById("fahrenheitBtn")

  if (currentUnit === "metric") {
    celsiusBtn.classList.add("active")
    fahrenheitBtn.classList.remove("active")
  } else {
    celsiusBtn.classList.remove("active")
    fahrenheitBtn.classList.add("active")
  }
}

// Get current location weather
function getCurrentLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        getWeatherByCoords(lat, lon)
      },
      (error) => {
        console.error("Geolocation error:", error)
        document.getElementById("cityName").textContent = "Location access denied"
      },
    )
  } else {
    document.getElementById("cityName").textContent = "Geolocation not supported"
  }
}

// Get weather by coordinates
async function getWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=${currentUnit}`

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error("Weather data not found")

    const data = await response.json()
    updateWeatherUI(data)
    setBackground(data.name)
  } catch (error) {
    console.error("Error fetching weather:", error)
    document.getElementById("cityName").textContent = "Error getting weather data"
  }
}

// Get weather by city name
async function getWeather() {
  const city = document.getElementById("cityInput").value.trim()
  if (!city) {
    alert("Please enter a city name.")
    return
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=${currentUnit}`

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error("City not found")

    const data = await response.json()
    updateWeatherUI(data)
    setBackground(city)

    // Update current city for favorites
    currentCity = city
    updateFavoriteButton()
  } catch (error) {
    alert("Error: " + error.message)
  }
}

// Update weather UI
function updateWeatherUI(data) {
  // Update city name with country code
  document.getElementById("cityName").textContent = `${data.name}, ${data.sys.country}`

  // Update weather description
  document.getElementById("description").textContent = data.weather[0].main

  // Update temperature with unit
  const tempUnit = currentUnit === "metric" ? "°C" : "°F"
  document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}${tempUnit}`
  document.getElementById("feelsLike").textContent = `${Math.round(data.main.feels_like)}${tempUnit}`

  // Update humidity
  document.getElementById("humidity").textContent = `${data.main.humidity}%`

  // Update wind speed with unit
  const windSpeedUnit = currentUnit === "metric" ? "m/s" : "mph"
  document.getElementById("windSpeed").textContent = `${data.wind.speed} ${windSpeedUnit}`

  // Update sunrise and sunset times
  const sunriseTime = formatTime(data.sys.sunrise * 1000)
  const sunsetTime = formatTime(data.sys.sunset * 1000)
  document.getElementById("sunrise").textContent = sunriseTime
  document.getElementById("sunset").textContent = sunsetTime

  // Update weather icon
  const iconCode = data.weather[0].icon
  const iconEl = document.getElementById("weatherIcon")
  iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`

  // Update current city for favorites
  currentCity = data.name
  updateFavoriteButton()
}

// Format time from timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
}

// Set background image
async function setBackground(city) {
    if (city.toLowerCase().trim() === "greater noida") {
        document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('images/greater_noida.png')`
        return
      }
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(city)}&orientation=landscape&per_page=1&client_id=${unsplashAccessKey}`

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch Unsplash image")

    const data = await response.json()
    const imageUrl = data.results[0]?.urls?.regular

    if (imageUrl) {
      document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${imageUrl}')`
    } else {
      document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://source.unsplash.com/1600x900/?${encodeURIComponent(city)},city')`
    }
  } catch (error) {
    console.error("Background image error:", error.message)
    document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://source.unsplash.com/1600x900/?${encodeURIComponent(city)},city')`
  }
}

// Favorites functionality
function toggleFavorite() {
  if (!currentCity) return

  const index = favorites.indexOf(currentCity)

  if (index === -1) {
    // Add to favorites
    favorites.push(currentCity)
  } else {
    // Remove from favorites
    favorites.splice(index, 1)
  }

  // Save to localStorage
  localStorage.setItem("weatherFavorites", JSON.stringify(favorites))

  // Update favorites display
  displayFavorites()
  updateFavoriteButton()
}

// Update favorite button
function updateFavoriteButton() {
  // Add favorite button if it doesn't exist
  if (!document.getElementById("favBtn")) {
    const cityNameEl = document.getElementById("cityName")
    const favBtn = document.createElement("button")
    favBtn.id = "favBtn"
    favBtn.innerHTML = '<i class="far fa-heart"></i>'
    favBtn.onclick = toggleFavorite
    favBtn.style.marginLeft = "10px"
    favBtn.style.background = "none"
    favBtn.style.border = "none"
    favBtn.style.cursor = "pointer"
    favBtn.style.fontSize = "1.2rem"
    cityNameEl.parentNode.appendChild(favBtn)
  }

  const favBtn = document.getElementById("favBtn")
  if (favorites.includes(currentCity)) {
    favBtn.innerHTML = '<i class="fas fa-heart" style="color: #ff6b6b;"></i>'
  } else {
    favBtn.innerHTML = '<i class="far fa-heart"></i>'
  }
}

// Display favorites
function displayFavorites() {
  const favoritesList = document.getElementById("favoritesList")
  favoritesList.innerHTML = ""

  if (favorites.length === 0) {
    const noFavs = document.createElement("p")
    noFavs.textContent = "No favorites yet"
    noFavs.style.color = "white"
    noFavs.style.textAlign = "center"
    favoritesList.appendChild(noFavs)
    return
  }

  favorites.forEach((city) => {
    const favoriteItem = document.createElement("div")
    favoriteItem.className = "favorite-item"
    favoriteItem.innerHTML = `
      <span>${city}</span>
      <i class="fas fa-times" onclick="removeFavorite(event, '${city}')"></i>
    `
    favoriteItem.addEventListener("click", (e) => {
      if (!e.target.classList.contains("fa-times")) {
        document.getElementById("cityInput").value = city
        getWeather()
      }
    })

    favoritesList.appendChild(favoriteItem)
  })
}

// Remove favorite
function removeFavorite(event, city) {
  event.stopPropagation()

  const index = favorites.indexOf(city)
  if (index !== -1) {
    favorites.splice(index, 1)
    localStorage.setItem("weatherFavorites", JSON.stringify(favorites))
    displayFavorites()

    // Update favorite button if current city
    if (city === currentCity) {
      updateFavoriteButton()
    }
  }
}

// Add event listener for Enter key in search input
document.getElementById("cityInput").addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    getWeather()
  }
})
