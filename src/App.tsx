import React, {useEffect, useState} from 'react';
import './App.css';
import {
  AppBar,
  Card,
  CardContent,
  Container,
  Stack, Toolbar,
  Typography
} from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import {Chart as ChartJS, BarElement, CategoryScale, Legend, LinearScale, Title, Tooltip, ArcElement} from "chart.js";
import {Bar, Pie} from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Total = {
  name: string;
  pouredML: number;
  priceCents: number;
  glasses: number;
}

function App() {
  const [totalMilliliters, setTotalMilliliters] = useState(0)
  const [totalOunces, setTotalOunces] = useState(0)
  const [totalGlasses, setTotalGlasses] = useState(0)
  const [totalMoney, setTotalMoney] = useState(0)
  const [totals, setTotals] = useState<Total[] | null>()

  const shortenLabel = (label: string): string => {
    let _label = label.trim().split(' ')
    let shortedLabel = ''
    console.log(_label)
    _label.forEach(word => {
      console.log(word)
      if (/^[A-Za-z0-9]*$/.test(word)) {
        console.log(true)
        shortedLabel = shortedLabel.concat(word.slice(0, 4) + ' ')
        console.log(shortedLabel)
      }
    })
    return shortedLabel.trim();
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Total',
      },
    },
  };
  const totalDrankLabels = totals?.map(total => shortenLabel(total.name));
  const totalDrankData = {
    labels: totalDrankLabels,
    datasets: [
      {
        label: 'Total Consumed (ml)',
        data: totals?.map(total => total.pouredML),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
      },
    ],
  };

  useEffect(() => {
    fetch(`http://${process.env.REACT_APP_SERVER_IP_ADDRESS}:${process.env.REACT_APP_SERVER_API_PORT}/total?timeframeHour=${180}`, {
      method: 'GET'
    })
      .then(async response => await response.json())
      .then((data: Total[]) => {
        let _totalMilliliters = 0
        let _totalOunces = 0
        let _totalGlasses = 0
        let _totalMoney = 0
        data.forEach(total => {
          _totalMilliliters += total.pouredML
          _totalOunces += (total.pouredML / 29.5735)
          _totalGlasses += total.glasses
          _totalMoney += total.priceCents
        })
        setTotalMilliliters(_totalMilliliters)
        setTotalOunces(_totalOunces)
        setTotalGlasses(_totalGlasses)
        setTotalMoney(_totalMoney)
        setTotals(data)
      })
  }, [])

  return (
    <>
      <AppBar position="sticky" color={'inherit'} sx={{mb: 3}}>
        <Toolbar>
          <Typography variant="h5" component="div">
            Vino<span className={'bold'}>Barrel</span>
          </Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <Stack direction={'row'}>
          <Container>
            <Typography color="text.secondary" align={'center'} noWrap>
              Total Milliliters
            </Typography>
            <Typography variant="h5" component="div" align={'center'} gutterBottom>
              {totalMilliliters}
            </Typography>
            <Typography color="text.secondary" align={'center'} noWrap>
              Total Ounces
            </Typography>
            <Typography variant="h5" component="div" align={'center'} gutterBottom>
              {totalOunces.toFixed(1)}
            </Typography>
          </Container>
          <Container>
            <Typography color="text.secondary" align={'center'} noWrap>
              Total Money
            </Typography>
            <Typography variant="h5" component="div" align={'center'} gutterBottom>
              ${totalMoney / 100}
            </Typography>
            <Typography color="text.secondary" align={'center'} noWrap>
              Total Glasses
            </Typography>
            <Typography variant="h5" component="div" align={'center'} gutterBottom>
              {totalGlasses}
            </Typography>
          </Container>
        </Stack>
        <Grid container spacing={3}>
          <Grid xs={12} sm={12} md={12} lg={6} >
            <Card >
              <CardContent>
                <Bar options={options} data={totalDrankData}/>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={12} md={12} lg={6} display={'flex'} justifyContent="center" alignItems="center">
            <Card>
              <CardContent>
                <Pie data={totalDrankData}/>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default App;
