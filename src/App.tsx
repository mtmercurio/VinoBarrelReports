import React from 'react';
import './App.css';
import {Route, Routes} from "react-router-dom";
import Reports from "./routes/Reports";
import BarrelsOverview from "./routes/BarrelsOverview";
import BarrelEdit from "./routes/BarrelEdit";
import Layout from "./Layout";
import BeveragesOverview from "./routes/BeveragesOverview";
import BeverageEdit from "./routes/BeverageEdit";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout/>}>
        <Route index element={<Reports/>}/>
        <Route path="reports" element={<Reports/>}/>
        <Route path="barrels" element={<BarrelsOverview/>}/>
        <Route path="barrel/:barrelId" element={<BarrelEdit/>}/>
        <Route path="beverages" element={<BeveragesOverview/>}/>
        <Route path="beverage/:beverageId" element={<BeverageEdit/>}/>

        <Route path="*" element={
          <main style={{padding: "1rem"}}>
            <p>There is nothing here!</p>
          </main>
        }/>
      </Route>
    </Routes>
  )
}

export default App;
