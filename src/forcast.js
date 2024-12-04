


import './forcast.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import apiKeys from "./apiKeys";
import sun from "./sun.png"
import FavoriteCities from './FavoriteCities';

const Forcast = () => {
  const [city, setCity] = useState("Bhopal"); // Get city from localStorage 
  const [filteredWeather, setFilteredWeather] = useState([]); // Filtered weather data for 5 days
  const [currCity, setCurrCity] = useState(""); // Current city 
  const [date, setDate] = useState(new Date());
 
  let [unit,setUnit]=useState(true)
  const [prevCities, setPrevCities] = useState([]);
  

  // Update the current time every second
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer); 
  }, []);

  // Function to filter weather data to get unique forecast per day
  const filterWeatherData = (data) => {
    const days = {};
    data.forEach((forecast) => {
      const forecastDate = new Date(forecast.dt * 1000); // Convert timestamp to Date object
      const dateKey = forecastDate.toLocaleDateString(); // Get the date 

      if (!days[dateKey]) {
        days[dateKey] = forecast;
      }
    });

    const filteredData = Object.values(days).slice(1, 6); // Limit to the next 5 days
    setFilteredWeather(filteredData);
  };

  // Search function to fetch data from API
  const search = () => {
    if (!city) {
      alert("City name cannot be empty");
      return;
    }

    axios
      .get(`${apiKeys.base}forecast?q=${city}&appid=${apiKeys.key}`)
      .then((response) => {
        filterWeatherData(response.data.list); // Filter the data to get 5 unique days
        setCurrCity(city.toUpperCase());
        setCity(""); // Reset 

         // Update localStorage with the last searched city
        let lastSearchedCities = JSON.parse(localStorage.getItem("lastSearchedCities")) || [];

        if (!lastSearchedCities.includes(city)) {
          lastSearchedCities.unshift(city); // Add city to the beginning
          if (lastSearchedCities.length > 5) lastSearchedCities = lastSearchedCities.slice(0, 5); // Limit to 5 cities
          localStorage.setItem("lastSearchedCities", JSON.stringify(lastSearchedCities));
        }

        setPrevCities(lastSearchedCities); // Update state for previous cities

      })
      .catch((err) => {
        console.error(err);
        setFilteredWeather([]); // Reset weather data in case of error
      });
  };

  // Function to format the date as  weekday name
  const formatDay = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Use default search 
  useEffect(() => {
    search(); 
  }, []);

 // Toggle between Celsius and Fahrenheit
 const toggleUnit = () => setUnit(!unit);

  // Current weather
  const currentWeather = filteredWeather[0];


  return (
    <div className="weather-app">
      {/* Left section for main weather */}
      <div className="weather-left">
         {/* Unit Toggle */}
         <button className="toggle-unit" onClick={toggleUnit}>
          Switch to {unit ? "°F" : "°C"}
        </button>
        <h1 className="location">{currCity} &nbsp; &nbsp; 
          {currentWeather && currentWeather.main ? `${unit?Math.round(currentWeather.main.temp-273.15):Math.round(currentWeather.main.temp- 273.15) * 9/5 + 32}` : "N/A"} {unit?"°C":"°F"}</h1>
        <div className="time-container">
          <h3 className="time">{date.toLocaleTimeString()}</h3>
          <p className="date">&nbsp;&nbsp;{currentWeather ? formatDay(currentWeather.dt) : "N/A"}</p>
        </div>
        <div className="temperature-container">
          {/* <h3 className="weather">Next 5 Days Weather</h3> */}
          <div className="forecast">
            <div className="forecast-list">
              {filteredWeather.length > 0 ? (
                filteredWeather.map((forecast, index) => (
                  <div className="forecast-item" key={index}>
                    <p>{formatDay(forecast.dt)}&nbsp;&nbsp;</p> {/* Show the day of the week */}
                    <img
                    style={forecast.weather[0].main === "Clear" ? { height: '40px', width: '40px' } : {}}
                      src={forecast.weather[0].main=="Clear"?sun:`http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`}
                      alt="Weather Icon"
                    />
                    <p>&nbsp;&nbsp;&nbsp;{unit?Math.round(forecast.main.temp-273.15):Math.round((forecast.main.temp- 273.15) * 9/5 + 32)} {unit?"°C":"°F"} &nbsp;</p>
                    <p>&nbsp;{forecast.weather[0].main}</p>
                  </div>
                ))
              ) : (
                <p>No forecast data available</p>
              )}
            </div>

          {/* <FavoriteCities/> */}

          </div>
        </div>
      </div>

      {/* Right section for search and weather details */}
      <div className="weather-right">
        {/* Weather status */}
        <div className="weather-status">
          <p>{currCity} &nbsp;&nbsp;</p>
          <div className="icon">
            {currentWeather && currentWeather.weather ? (
              <img
              style={currentWeather.weather[0].main === "Clear" ? { height: '70px', width: '70px' } : { height: '100px', width: '100px',background:"#d3d3d32"}}
                src={currentWeather.weather[0].main === "Clear"?sun:`http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}.png`}
                alt="Weather Icon"
              />
            ) : (
              <img src="" alt="Weather Icon" />
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search any city"
            onChange={(e) => setCity(e.target.value)}
            value={city}
            className="search-input"
          />
          <button className="search-button" onClick={search}>🔍</button>
        </div>

        {/* Weather details */}
        <div className="weather-details">
          {currentWeather ? (
            <>
              <p>Temperature: {unit?(Math.round(currentWeather.main.temp-273.15)):Math.round((currentWeather.main.temp- 273.15) * 9/5 + 32)} {unit?"°C":"°F"} </p>
              <p>Humidity: {currentWeather.main?.humidity}%</p>
              <p>Visibility: {currentWeather.visibility ? `${currentWeather.visibility / 1000} km` : "N/A"}</p>
              <p>Wind Speed: {Math.round(currentWeather.wind?.speed)} Km/h</p>
              <p> Discription: {currentWeather.weather?.[0].description}</p>
            </>
          ) : (
            <p>No data available</p>
          )}
        </div>

         {/* Previous Cities */}
         <div className='diff'>
        <div className="previous-cities">
          <h4>Last Visit Cities</h4>
          <ul>
            {prevCities.length > 0 ? (
              prevCities.map((prevCity, index) => (
                < li key={index}>
                  <button>{prevCity}</button>
                </li>
              ))
            ) : (
              <h4>No cities visited</h4>
            )}
          </ul>
        </div>
        <div className='favc'>
          <FavoriteCities/>
        </div>
        </div>
      </div>
      
    </div>
  );
};

export default Forcast;








