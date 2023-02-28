import React from 'react';
import './App.css';
import {Outlet} from "react-router-dom";
import VinoBarrelAppBar from "./comonents/VinoBarrelAppBar";

function App() {

  return (
    <>
      <VinoBarrelAppBar/>
      <Outlet/>
    </>
  )
}

export default App;
