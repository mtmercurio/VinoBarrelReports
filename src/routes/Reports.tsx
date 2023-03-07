import React, {useEffect, useState} from 'react';
import {
  Box,
  Card,
  CardContent,
  Container, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent,
  Typography
} from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import {Chart as ChartJS, BarElement, CategoryScale, Legend, LinearScale, Title, Tooltip, ArcElement} from "chart.js";
import {Bar, Pie} from "react-chartjs-2";
import {Timestamp, onSnapshot} from "firebase/firestore";
import {getTransactionsQuery} from "../library/FirebaseUtils";

const groupArray = require('group-array');

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

export type Transaction = {
  glass_id: string;
  kegId: string;
  ouncesPoured: number;
  ouncesRemaining: number;
  name: string;
  pourType: string;
  price: number;
  timestamp: Timestamp
}

export default function Reports() {
  const [totals, setTotals] = useState<Total[] | []>([])
  const [totalPoured, setTotalPoured] = useState(0)
  const [totalData, setTotalData] = useState<number[]>([])
  const [totalMoney, setTotalMoney] = useState(0)
  const [timeframeHour, setTimeframeHour] = useState(12)
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

  const convertOuncesToUnit = (ounces: number, unitType: typeof unitsOfMeasurement[number]): number => {
    switch (unitType) {
      case 'ounces':
        return ounces
      case 'milliliters':
        return Math.round(ounces * 29.574)
      case 'glasses (6oz)':
        return Math.round((ounces / 6) * 100) / 100
      case 'bottles (750ml)':
        return Math.round(((ounces * 29.574) / 750) * 100) / 100
      default:
        return 0
    }
  }

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

  useEffect(() => {
    let unsubscribe = () => {}
    getTransactionsQuery(timeframeHour)
      .then(q => {
        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const transactions: Transaction[] = []
          querySnapshot.forEach((doc) => {
            transactions.push(doc.data() as Transaction)
          });
          let _totals: Total[] | [] = []
          if (transactions.length > 0) {
            const groupedTransactions = groupArray(transactions, 'name')
            _totals = Object.keys(groupedTransactions).map((name: string) => {
              return {
                name: name,
                pouredML: groupedTransactions[name].reduce(
                  (accumulator: any, currentValue: any) => accumulator + currentValue.ouncesPoured,
                  0
                ),
                priceCents: groupedTransactions[name].reduce(
                  (accumulator: any, currentValue: any) => accumulator + currentValue.price,
                  0
                ),
                glasses: groupedTransactions[name].length,
              }
            })
          }
          setTotals(_totals)
        });
      })
    return () => {
      unsubscribe()
    }
  }, [timeframeHour])

  useEffect(() => {
    let _totalPoured = 0
    let _totalMoney = 0
    let _totalData: number[] = []
    let poured = 0;
    totals?.forEach(total => {
      poured = convertOuncesToUnit(total.pouredML, unit)
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
            ${totalMoney}
          </Typography>
        </Grid>
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
  )
}