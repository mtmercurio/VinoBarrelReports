import React, {useCallback, useEffect, useState} from 'react';
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
import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {collection, query, where, getDocs, Timestamp, orderBy} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const unitsOfMeasurement = ['ounces', 'milliliters', 'glasses (6oz)', 'bottles (750ml)'] as const

type Total = {
  name: string;
  pouredML: number;
  priceCents: number;
  glasses: number;
}

type Transaction = {
  glass_id: string;
  kegId: string;
  millilitersPoured: number;
  millilitersRemaining: number;
  name: string;
  pourType: string;
  price: number;
  timestamp: Timestamp
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[] | []>([])
  const [totals, setTotals] = useState<Total[] | []>([])
  const [remaining, setRemaining] = useState<Total[] | []>([])
  const [totalPoured, setTotalPoured] = useState(0)
  const [totalData, setTotalData] = useState<number[]>([])
  const [remainingData, setRemainingData] = useState<number[]>([])
  const [totalMoney, setTotalMoney] = useState(0)
  const [timeframeHour, setTimeframeHour] = useState(8)
  const [unit, setUnit] = useState<typeof unitsOfMeasurement[number]>('glasses (6oz)')

  const shortenLabel = (label: string): string => {
    if (label?.length > 0) {
      let _label = label.split(' ')
      let shortedLabel = ''
      _label.forEach(word => {
        if (/^[A-Za-z0-9]*$/.test(word)) {
          shortedLabel = shortedLabel.concat(word.slice(0, 3) + ' ')
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
        return Math.round(milliliters * 0.033814 * 10) / 10
      case 'glasses (6oz)':
        return Math.round(milliliters / 177.441)
      case 'bottles (750ml)':
        return Math.round((milliliters / 750) * 10) / 10
      default:
        return 0
    }
  }

  const barRemainingOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Total Remaining (${unit})`,
      },
    },
  };

  const barPouredOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Total Poured (${unit})`,
      },
    },
  };

  const piePouredOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Total Poured (${unit})`,
      },
    },
  };

  const totalPouredLabels = totals?.map(total => shortenLabel(total.name));
  const totalPouredData = {
    labels: totalPouredLabels,
    datasets: [
      {
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

  const totalRemainingLabels = remaining?.map(keg => shortenLabel(keg.name));
  const totalRemainingData = {
    labels: totalRemainingLabels,
    datasets: [
      {
        data: remainingData,
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

  const getTransactions = useCallback(async () => {
    const timestamp = Timestamp.now().toMillis() - (timeframeHour * 3600000)
    const q = query(collection(db, "transactions"), where("timestamp", ">=", Timestamp.fromMillis(timestamp)), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const _transactions: Transaction[] = []
    querySnapshot.forEach((doc) => {
      console.log(doc.data())
      _transactions.push(doc.data() as Transaction)
    });
    setTransactions(_transactions)
  }, [timeframeHour])

  useEffect(() => {
    getTransactions().then()
  }, [getTransactions])

  useEffect(() => {
    fetch(`http://${process.env.REACT_APP_SERVER_IP_ADDRESS}:${process.env.REACT_APP_SERVER_API_PORT}/total?timeframeHour=${timeframeHour}`, {
      method: 'GET'
    })
      .then(async response => await response.json())
      .then((data: Total[]) => {
        setTotals(data)
      })
  }, [timeframeHour])
  //
  // useEffect(() => {
  //   //TODO: change this fetch look at the tablet server to get accurate data
  //   fetch(`http://${process.env.REACT_APP_SERVER_IP_ADDRESS}:${process.env.REACT_APP_SERVER_API_PORT}/total?timeframeHour=${180}`, {
  //     method: 'GET'
  //   })
  //     .then(async response => await response.json())
  //     .then((data: Total[]) => {
  //       let _totalData: Total[] = []
  //       data?.forEach(total => {
  //         _totalData.push({...total})
  //       })
  //       setRemaining(_totalData)
  //     })
  // }, [])
  //
  // useEffect(() => {
  //   let _totalPoured = 0
  //   let _totalMoney = 0
  //   let _totalData: number[] = []
  //   let poured = 0;
  //   totals?.forEach(total => {
  //     poured = convertMillilitersToUnit(total.pouredML, unit)
  //     _totalPoured += poured
  //     _totalMoney += total.priceCents
  //     _totalData.push(poured)
  //   })
  //   setTotalPoured(_totalPoured)
  //   setTotalMoney(_totalMoney)
  //   setTotalData(_totalData)
  // }, [totals, unit])
  //
  // useEffect(() => {
  //   let _totalData: number[] = []
  //   let poured = 0;
  //   remaining?.forEach(total => {
  //     poured = convertMillilitersToUnit(total.pouredML, unit)
  //     _totalData.push(poured)
  //   })
  //   setRemainingData(_totalData)
  // }, [remaining, unit])

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
                <MenuItem value={1}>1 Hour</MenuItem>
                <MenuItem value={2}>2 Hours</MenuItem>
                <MenuItem value={4}>4 Hours</MenuItem>
                <MenuItem value={8}>8 Hours</MenuItem>
                <MenuItem value={12}>12 Hours</MenuItem>
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
              {totalPoured}
            </Typography>
          </Grid>
          <Grid xs={6} sm={3}>
            <Typography color="text.secondary" align={'center'} noWrap>
              Total Money
            </Typography>
            <Typography variant="h5" component="div" align={'center'} gutterBottom>
              ${totalMoney / 100}
            </Typography>
          </Grid>
          {/*<Grid xs={12}>*/}
          {/*  <Card>*/}
          {/*    <CardContent>*/}
          {/*      <Bar options={barRemainingOptions} data={totalRemainingData}/>*/}
          {/*    </CardContent>*/}
          {/*  </Card>*/}
          {/*</Grid>*/}
          <Grid xs={12}>
            <Card>
              <CardContent>
                <Bar options={barPouredOptions} data={totalPouredData}/>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12}>
            <Card>
              <CardContent>
                <Pie options={piePouredOptions} data={totalPouredData}/>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default App;
