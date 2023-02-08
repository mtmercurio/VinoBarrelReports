import React from 'react';
import './App.css';
import {Outlet} from "react-router-dom";
import VinoBarrelAppBar from "./comonents/VinoBarrelAppBar";

function Layout() {
  return (
    <>
      <VinoBarrelAppBar/>
      <Outlet/>
    </>
  )
}

export default Layout;
