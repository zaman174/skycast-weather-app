import React, { useState, useEffect } from "react";
import "./App.css";
import logo from "./skycast-logo.png";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState([]);

  const API_KEY = process.env.REACT_APP_WEATHER_KEY;

  const saveHistory = (searchedCity) => {
    const updatedHistory = [
      searchedCity,
      ...history.filter((item) => item !== searchedCity),
    ].slice(0, 5);

    setHistory(updatedHistory);
    localStorage.setItem("weatherHistory", JSON.stringify(updatedHistory));
  };

  const processForecast = (forecastData) => {
    const dailyForecast = forecastData.list.filter(
      (_, index) => index % 8 === 0
    );

    const hourly = forecastData.list.slice(0, 8);

    setForecast(dailyForecast);
    setHourlyForecast(hourly);
  };

const getWeather = async (searchCity = city.trim()) => {
  if (!searchCity) {
    setError("Please enter a city name");
    return;
  }

  setLoading(true);
setError("");
setWeather(null);
setForecast([]);
setHourlyForecast([]);

  try {
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}&units=metric`
    );

    const currentData = await currentResponse.json();

    if (currentData.cod !== 200) {
      setError(currentData.message);
      setLoading(false);
      return;
    }

    setWeather(currentData);
    saveHistory(currentData.name);

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&appid=${API_KEY}&units=metric`
    );

    const forecastData = await forecastResponse.json();

    processForecast(forecastData);

  } catch {
    setError("Something went wrong");
  }

  setLoading(false);
};

  const getLocationWeather = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      setLoading(true);

      try {
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        const currentData = await currentResponse.json();

        setWeather(currentData);
        saveHistory(currentData.name);

        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        const forecastData = await forecastResponse.json();

        processForecast(forecastData);

      } catch {
        setError("Location weather failed");
      }

      setLoading(false);
    });
  };

  useEffect(() => {
    getWeather("Delhi");

    const savedHistory =
      JSON.parse(localStorage.getItem("weatherHistory")) || [];

    setHistory(savedHistory);
  }, []);

  const getBackgroundClass = () => {
    if (!weather) return "";

    const condition = weather.weather[0].main.toLowerCase();

    if (condition.includes("cloud")) return "cloudy";
    if (condition.includes("rain")) return "rainy";
    if (condition.includes("clear")) return "sunny";
    if (condition.includes("snow")) return "snowy";

    return "";
  };

  return (
    <div className={`app ${darkMode ? "dark" : ""} ${getBackgroundClass()}`}>
      <div className="weather-card">
        <button
          className="theme-btn"
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
              if (e.key === "Enter") getWeather();
            }}
          />

          <button onClick={getWeather} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        <button className="location-btn" onClick={getLocationWeather}>
          📍 Use My Location
        </button>

        {history.length > 0 && (
          <div className="history">
            <h3>Recent Searches</h3>
            {history.map((item, index) => (
              <button key={index} onClick={() => getWeather(item)}>
                {item}
              </button>
            ))}
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

            <div className="details">
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
          <>
            <h3>Hourly Forecast</h3>
            <div className="hourly">
              {hourlyForecast.map((hour, index) => (
                <div key={index} className="hour-card">
                  <p>
                    {new Date(hour.dt_txt).toLocaleTimeString([], {
                      hour: "numeric",
                    })}
                  </p>

                  <img
                    src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`}
                    alt=""
                  />

                  <p>{Math.round(hour.main.temp)}°C</p>
                </div>
              ))}
            </div>
          </>
        )}

        {forecast.length > 0 && (
          <div className="forecast">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-card">
                <p>
                  {new Date(day.dt_txt).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </p>

                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                  alt=""
                />

                <p>{Math.round(day.main.temp)}°C</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;