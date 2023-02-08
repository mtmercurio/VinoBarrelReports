import React from 'react';
import './App.css';
import {Route, Routes} from "react-router-dom";
import Reports from "./routes/Reports";
import BarrelsOverview from "./routes/BarrelsOverview";
import BarrelEdit from "./routes/BarrelEdit";
import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import Layout from "./Layout";
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyCdarpfE9BN07iyiDjcufHd3MKyETzDUnw",
  authDomain: "vinobarrel-58576.firebaseapp.com",
  projectId: "vinobarrel-58576",
  storageBucket: "vinobarrel-58576.appspot.com",
  messagingSenderId: "374710471223",
  appId: "1:374710471223:web:d34cb30be1d63c35264db2",
  measurementId: "G-LJTGLW7H8W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout/>}>
        <Route index element={<Reports db={db}/>}/>
        <Route path="reports" element={<Reports db={db}/>}/>
        <Route path="barrels" element={<BarrelsOverview db={db}/>}/>
        <Route path="edit/:barrelId" element={<BarrelEdit db={db}/>}/>

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
