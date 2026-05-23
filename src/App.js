import React, { useState, useEffect } from "react";
import "./App.css";

const API_KEY = process.env.REACT_APP_WEATHER_KEY;

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);

  const getWeather = async (cityName) => {
    if (!cityName.trim()) return;

    try {
      setError("");

      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );

      const weatherData = await weatherResponse.json();

      if (weatherData.cod !== 200) {
        setError("City not found");
        return;
      }

      setWeather(weatherData);

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );

      const forecastData = await forecastResponse.json();

      setHourlyForecast(forecastData.list.slice(0, 5));

      const dailyData = forecastData.list.filter((item, index) => index % 8 === 0);
      setForecast(dailyData.slice(0, 5));

      let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];

      if (!searches.includes(weatherData.name)) {
        searches.unshift(weatherData.name);
        searches = searches.slice(0, 5);
        localStorage.setItem("recentSearches", JSON.stringify(searches));
      }

      setRecentSearches(searches);
      setCity("");
    } catch (err) {
      setError("Something went wrong");
    }
  };

  const getLocationWeather = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );

        const data = await response.json();

        if (data.cod === 200) {
          getWeather(data.name);
        }
      } catch (err) {
        setError("Location fetch failed");
      }
    });
  };

  useEffect(() => {
    const savedSearches =
      JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(savedSearches);

    getWeather("Delhi");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={darkMode ? "app dark" : "app light"}>
      <div className="weather-container">
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

        <h1>SkyCast</h1>

        <div className="search-box">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                getWeather(city);
              }
            }}
          />
          <button onClick={() => getWeather(city)}>Search</button>
        </div>

        <button className="location-btn" onClick={getLocationWeather}>
          📍 Use My Location
        </button>

        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <h3>Recent Searches</h3>
            <div className="recent-list">
              {recentSearches.map((item, index) => (
                <button key={index} onClick={() => getWeather(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="weather-info">
            <h2>{weather.name}</h2>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt="weather"
            />
            <h1>{Math.round(weather.main.temp)}°C</h1>
            <p>{weather.weather[0].main}</p>

            <div className="extra-info">
              <div>
                <h3>Humidity</h3>
                <p>{weather.main.humidity}%</p>
              </div>
              <div>
                <h3>Wind Speed</h3>
                <p>{weather.wind.speed} m/s</p>
              </div>
            </div>
          </div>
        )}

        {hourlyForecast.length > 0 && (
          <div className="forecast">
            <h2>Hourly Forecast</h2>
            <div className="forecast-list">
              {hourlyForecast.map((item, index) => (
                <div key={index} className="forecast-card">
                  <p>{new Date(item.dt_txt).toLocaleTimeString([], { hour: "numeric" })}</p>
                  <img
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                    alt=""
                  />
                  <p>{Math.round(item.main.temp)}°C</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {forecast.length > 0 && (
          <div className="forecast">
            <h2>5-Day Forecast</h2>
            <div className="forecast-list">
              {forecast.map((item, index) => (
                <div key={index} className="forecast-card">
                  <p>
                    {new Date(item.dt_txt).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </p>
                  <img
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                    alt=""
                  />
                  <p>{Math.round(item.main.temp)}°C</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;