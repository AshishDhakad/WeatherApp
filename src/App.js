import React, { useState } from "react";
import "./App.css";
import Forcast from "./forcast";
import FavoriteCities from "./FavoriteCities";

function App() {
  return (
    <React.Fragment>
      <div className="container">
        <Forcast/>
        {/* <FavoriteCities/> */}
      </div> 
    </React.Fragment>
  );
}

export default App;
