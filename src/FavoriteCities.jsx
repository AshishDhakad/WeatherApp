import React, { useState, useEffect } from "react";
import axios from "axios";  
import "./App.css";
import ApiKeys from "./apiKeys";

const FavoriteCities = () => {
  const [favorites, setFavorites] = useState([]);
  const [newCity, setNewCity] = useState(""); 
  const [weatherData, setWeatherData] = useState({}); 

  const apiKey = ApiKeys.key; 

  

  // Function to fetch favorite cities
  const fetchFavorites = async () => {
    try {
      const response = await fetch("http://localhost:3001/favorites");
      const data = await response.json();
      setFavorites(data); // Update the state with the fetched cities

      //  weather data
      data.forEach(city => {
        fetchWeather(city.name);
      });
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  // Fetch favorite cities when the component loads
  useEffect(() => {
    fetchFavorites();
  }, []);


  // Function to fetch weather for a city
  const fetchWeather = async (cityName) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`
      );
      const weather = response.data;
      setWeatherData((prevWeatherData) => ({
        ...prevWeatherData,
        [cityName]: weather.main.temp, // Store temperature data for each city
      }));
    } catch (error) {
      console.error(`Error fetching weather for ${cityName}:`, error);
    }
  };

  // Function to add a city to the favorites
  const addFavorite = async (cityName) => {
    const city = cityName.trim();

    if (!city) {
      alert("Please enter a city name");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: cityName }),
      });
      const newCity = await response.json();

      const updatedFavorites = [...favorites, newCity];

      if (updatedFavorites.length > 5) {
        updatedFavorites.shift(); // Remove the first city if more than 5
      }

      setFavorites(updatedFavorites); // Update the favorites list
      setNewCity(""); // Clear
      fetchWeather(cityName); // Fetch weather data for the newly added city
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  };

  // Function to remove a city from the favorites
  const removeFavorite = async (cityId) => {
    try {
      await fetch(`http://localhost:3001/favorites/${cityId}`, {
        method: "DELETE",
      });
      setFavorites(favorites.filter((city) => city.id !== cityId)); // Remove city from state
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  return (
    <div className="favorite-cities-container">
      <h2>Favorite Cities</h2>

      {/* Input to add a new city */}
      <div className="srch">
        <input
          type="text"
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          placeholder="Enter city name"
        />
        <button onClick={() => addFavorite(newCity)}>Add City</button>
      </div>

      {/* Display list of favorite cities with weather data */}
      <div className="favCity">
        {favorites.map((city) => (
          <div className="cities" key={city.id}>
            <span>{city.name}</span>
            {/* Display the temperature for the city if it's available */}
            {weatherData[city.name] !== undefined ? (
              <span>  {weatherData[city.name]}°C</span>
            ) : (
              <span>city not found</span>
            )}
            <button onClick={() => removeFavorite(city.id)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoriteCities;
