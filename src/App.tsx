import React, {useEffect, useState} from 'react';
import './App.css';
import {
  AppBar, Box,
  Card,
  CardContent,
  Container, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent,
  Toolbar,
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

const unitsOfMeasurement = ['milliliters', 'ounces', 'glasses', 'bottles'] as const

type Total = {
  name: string;
  pouredML: number;
  priceCents: number;
  glasses: number;
}

function App() {
  const [totals, setTotals] = useState<Total[] | []>([])
  const [totalPoured, setTotalPoured] = useState(0)
  const [totalData, setTotalData] = useState<number[]>([])
  const [totalMoney, setTotalMoney] = useState(0)
  const [timeframeHour, setTimeframeHour] = useState(1)
  const [unit, setUnit] = useState<typeof unitsOfMeasurement[number]>('milliliters')

  const shortenLabel = (label: string): string => {
    if (label?.length > 0) {
      let _label = label.split(' ')
      let shortedLabel = ''
      _label.forEach(word => {
        if (/^[A-Za-z0-9]*$/.test(word)) {
          shortedLabel = shortedLabel.concat(word.slice(0, 4) + ' ')
        }
      })
      return shortedLabel.trim();
    } else {
      return ''
    }
  }

  const convertMillilitersToUnit = (milliliters: number, unitType: typeof unitsOfMeasurement[number]): number => {
    switch (unitType) {
      case 'milliliters':
        return milliliters
      case 'ounces':
        return Math.round(milliliters * 0.033814 * 100) / 100
      case 'glasses':
        return Math.round((milliliters / 177.441) * 100) / 100
      case 'bottles':
        return Math.round((milliliters / 750) * 100) / 100
      default:
        return 0
    }
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
  const totalPouredLabels = totals?.map(total => shortenLabel(total.name));
  const totalPouredData = {
    labels: totalPouredLabels,
    datasets: [
      {
        label: 'Total Poured',
        data: totalData,
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
    fetch(`http://${process.env.REACT_APP_SERVER_IP_ADDRESS}:${process.env.REACT_APP_SERVER_API_PORT}/total?timeframeHour=${timeframeHour}`, {
      method: 'GET'
    })
      .then(async response => await response.json())
      .then((data: Total[]) => {
        setTotals(data)
      })
  }, [timeframeHour])

  useEffect(() => {
    let _totalPoured = 0
    let _totalMoney = 0
    let _totalData: number[] = []
    let poured = 0;
    totals?.forEach(total => {
      poured = convertMillilitersToUnit(total.pouredML, unit)
      _totalPoured += poured
      _totalMoney += total.priceCents
      _totalData.push(poured)
    })
    setTotalPoured(_totalPoured)
    setTotalMoney(_totalMoney)
    setTotalData(_totalData)
  }, [totals, unit])

  const handleUnitChange = (event: SelectChangeEvent) => {
    const unit = event.target.value as typeof unitsOfMeasurement[number]
    setUnit(unit);
  };

  const handleHourChange = (event: SelectChangeEvent) => {
    setTimeframeHour(parseInt(event.target.value as string));
  };

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
        <Grid container spacing={2} justifyContent="space-evenly"
              alignItems="stretch">
          <Grid xs={6} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="unit-select-label">Unit</InputLabel>
              <Select
                labelId="unit-select-label"
                id="unit-select"
                value={unit}
                label="Unit"
                onChange={handleUnitChange}
              >
                {
                  unitsOfMeasurement.map(unitOfMeasurement =>
                    <MenuItem key={unitOfMeasurement} value={unitOfMeasurement}>{unitOfMeasurement}</MenuItem>
                  )}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={6} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="hour-select-label">Time</InputLabel>
              <Select
                labelId="hour-select-label"
                id="hour-select"
                value={timeframeHour.toString()}
                label="Hour"
                onChange={handleHourChange}
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={4}>4</MenuItem>
                <MenuItem value={8}>8</MenuItem>
                <MenuItem value={12}>12</MenuItem>
                <MenuItem value={24}>Day</MenuItem>
                <MenuItem value={48}>Two Days</MenuItem>
                <MenuItem value={168}>Week</MenuItem>
                <MenuItem value={336}>Two Weeks</MenuItem>
                <MenuItem value={730}>Month</MenuItem>
                <MenuItem value={2190}>3 Months</MenuItem>
                <MenuItem value={4380}>6 Months</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={6} sm={3}>
            <Typography component={'span'} color="text.secondary" align={'center'} noWrap>
              <Box sx={{textTransform: 'capitalize'}}>Total {unit}</Box>
            </Typography>
            <Typography variant="h5" component="div" align={'center'} gutterBottom>
              {parseFloat(totalPoured.toFixed(2))}
            </Typography>
          </Grid>
          <Grid xs={6} sm={3}>
            <Typography color="text.secondary" align={'center'} noWrap>
              Total Money
            </Typography>
            <Typography variant="h5" component="div" align={'center'} gutterBottom>
              ${parseFloat((totalMoney / 100).toFixed(2))}
            </Typography>
          </Grid>
          {totals.length > 0
            ? <>
              <Grid xs={12} sm={12} md={12} lg={6}>
                <Card>
                  <CardContent>
                    <Bar options={options} data={totalPouredData}/>
                  </CardContent>
                </Card>
              </Grid>
              <Grid xs={12} sm={12} md={12} lg={6}>
                <Card>
                  <CardContent>
                    <Pie data={totalPouredData}/>
                  </CardContent>
                </Card>
              </Grid>
            </>
            : <Grid xs={12}>
              <Typography color="text.secondary" align={'center'} noWrap>
                No data for selected time
              </Typography>
            </Grid>
          }
        </Grid>
      </Container>
    </>
  )
}

export default App;
