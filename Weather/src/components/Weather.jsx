import React, { useRef, useEffect, useState } from 'react';
import './Weather.css';
import search_icon from '../assets/search.png';
import clear_icon from '../assets/clear.png';
import cloud_icon from '../assets/cloud.png';
import drizzle_icon from '../assets/drizzle.png';
import rain_icon from '../assets/rain.png';
import snow_icon from '../assets/snow.png';
import wind_icon from '../assets/wind.png';
import humidity_icon from '../assets/humidity.png';

const allIcons = {
  '01d': clear_icon, '01n': clear_icon,
  '02d': cloud_icon, '02n': cloud_icon,
  '03d': cloud_icon, '03n': cloud_icon,
  '04d': cloud_icon, '04n': cloud_icon,
  '09d': drizzle_icon,'09n': drizzle_icon,
  '10d': rain_icon,  '10n': rain_icon,
  '11d': rain_icon,  '11n': rain_icon,
  '13d': snow_icon,  '13n': snow_icon,
  // '50d'/'50n' (mist) could map to cloud_icon if you want
};

const Weather = () => {
  const inputRef = useRef(null);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const search = async (city) => {
    const trimmed = (city || '').trim();
    if (!trimmed) {
      setError('Enter a city name.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        trimmed
      )}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        // OpenWeather often returns { cod, message } on errors
        throw new Error(data?.message || 'Failed to fetch weather');
      }

      const iconCode = data?.weather?.[0]?.icon || '01d';
      const icon = allIcons[iconCode] || clear_icon;

      setWeatherData({
        humidity: data.main.humidity,
        // convert m/s -> km/h for display
        windSpeedKmh: Math.round(data.wind.speed * 3.6),
        temperature: Math.round(data.main.temp),
        location: data.name,
        icon,
      });
    } catch (e) {
      setWeatherData(null);
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search('New York');
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') search(inputRef.current?.value);
  };

  return (
    <div className="weather">
      <div className="search-bar">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search"
          onKeyDown={handleKeyDown}
        />
        <img
          src={search_icon}
          alt="Search"
          onClick={() => search(inputRef.current?.value)}
          style={{ cursor: 'pointer' }}
        />
      </div>

      {loading && <p className="status">Loading…</p>}
      {error && <p className="status error">{error}</p>}

      {weatherData && !loading && !error && (
        <>
          <img src={weatherData.icon} alt="" className="weather-icon" />
          <p className="temperature">{weatherData.temperature}°C</p>
          <p className="location">{weatherData.location}</p>

          <div className="weather-data">
            <div className="col">
              <img src={humidity_icon} alt="Humidity" />
              <div>
                <p>{weatherData.humidity} %</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className="col">
              <img src={wind_icon} alt="Wind speed" />
              <div>
                <p>{weatherData.windSpeedKmh} km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Weather;
