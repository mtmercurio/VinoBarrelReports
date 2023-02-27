import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {createBrowserRouter, redirect, RouterProvider} from "react-router-dom";
import Reports from "./routes/Reports";
import BarrelsOverview from "./routes/BarrelsOverview";
import BarrelEdit from "./routes/BarrelEdit";
import BeveragesOverview from "./routes/BeveragesOverview";
import BeverageEdit from "./routes/BeverageEdit";
import App from "./App";
import {
  BarrelUI,
  BeverageUI,
  getBarrel,
  getBarrels,
  getBeverage,
  getBeverages, getCurrentUser
} from "./library/FirebaseUtils";
import SignUp from "./routes/SignUp";
import Login from "./routes/Login";

const router = createBrowserRouter([
    {
      path: '/signup',
      element: <SignUp/>
    },
    {
      path: '/login',
      element: <Login/>
    },
    {
      path: "/",
      element: <App/>,
      loader: async () => {
        const user = await getCurrentUser()
        if (!user) {
          return redirect("/signup");
        }
        return null;
      },
      children: [
        {
          index: true,
          element: <Reports/>,
        },
        {
          path: "reports",
          element: <Reports/>,
        },
        {
          path: "barrels",
          element: <BarrelsOverview/>,
          loader: async () => {
            return await getBarrels();
          },
        },
        {
          path: "barrels/:barrelId",
          element: <BarrelEdit/>,
          loader: async ({params}) => {
            let barrel: BarrelUI | undefined
            if (params.barrelId) {
              barrel = await getBarrel(params.barrelId);
            }
            let beverages = await getBeverages()

            return {barrel, beverages}
          },
        },
        {
          path: "beverages",
          element: <BeveragesOverview/>,
          loader: async () => {
            return await getBeverages();
          },
        },
        {
          path: "beverages/:beverageId",
          element: <BeverageEdit/>,
          loader: async ({params}) => {
            let beverage: BeverageUI | undefined
            if (params.beverageId) {
              beverage = await getBeverage(params.beverageId);
            }

            return beverage
          },
        },
        {
          path: "*",
          element:
            (<main style={{padding: "1rem"}}>
              <p>There is nothing here!</p>
            </main>)
        }
      ],
    }
  ])
;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
