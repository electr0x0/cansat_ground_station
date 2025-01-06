import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import ReactApexCharts from 'react-apexcharts'
import dayjs from 'dayjs'

const History = () => {
  const [startDate, setStartDate] = useState(dayjs().subtract(24, 'hour')) // 24 hours ago
  const [endDate, setEndDate] = useState(dayjs())
  const [sensorData, setSensorData] = useState([])
  const [activeTab, setActiveTab] = useState('1')
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `http://localhost:8000/sensor-data/time-range/?start_time=${startDate.toISOString()}&end_time=${endDate.toISOString()}`
      )
      const data = await response.json()
      setSensorData(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Chart configurations
  const altitudePressureOptions = {
    chart: {
      type: 'line',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 1000
        }
      },
      toolbar: {
        show: true
      },
      zoom: {
        enabled: true
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    grid: {
      padding: {
        left: 0,
        right: 0
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false
      }
    },
    yaxis: [
      {
        title: {
          text: 'Altitude (m)'
        }
      },
      {
        opposite: true,
        title: {
          text: 'Pressure (hPa)'
        }
      }
    ]
  }

  const accelerationOptions = {
    ...altitudePressureOptions,
    yaxis: {
      title: {
        text: 'Acceleration (m/s²)'
      }
    }
  }

  const gyroscopeOptions = {
    ...altitudePressureOptions,
    yaxis: {
      title: {
        text: 'Angular Velocity (°/s)'
      }
    }
  }

  const temperatureOptions = {
    ...altitudePressureOptions,
    yaxis: {
      title: {
        text: 'Temperature (°C)'
      }
    }
  }

  // Prepare chart series
  const altitudePressureSeries = [
    {
      name: 'Altitude',
      data: sensorData.map(d => [new Date(d.timestamp).getTime(), d.altitude])
    },
    {
      name: 'Pressure',
      data: sensorData.map(d => [new Date(d.timestamp).getTime(), d.pressure])
    }
  ]

  const accelerationSeries = [
    {
      name: 'X-Axis',
      data: sensorData.map(d => [new Date(d.timestamp).getTime(), d.accel_x])
    },
    {
      name: 'Y-Axis',
      data: sensorData.map(d => [new Date(d.timestamp).getTime(), d.accel_y])
    },
    {
      name: 'Z-Axis',
      data: sensorData.map(d => [new Date(d.timestamp).getTime(), d.accel_z])
    }
  ]

  const gyroscopeSeries = [
    {
      name: 'X-Axis',
      data: sensorData.map(d => [new Date(d.timestamp).getTime(), d.gyro_x])
    },
    {
      name: 'Y-Axis',
      data: sensorData.map(d => [new Date(d.timestamp).getTime(), d.gyro_y])
    },
    {
      name: 'Z-Axis',
      data: sensorData.map(d => [new Date(d.timestamp).getTime(), d.gyro_z])
    }
  ]

  const temperatureSeries = [
    {
      name: 'BMP Temperature',
      data: sensorData.map(d => [new Date(d.timestamp).getTime(), d.bmp_temperature])
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Flight History'
            action={
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <DateTimePicker
                    label='Start Date'
                    value={startDate}
                    onChange={setStartDate}
                  />
                  <DateTimePicker
                    label='End Date'
                    value={endDate}
                    onChange={setEndDate}
                  />
                  <Button variant='contained' onClick={fetchData} disabled={loading}>
                    {loading ? 'Loading...' : 'Fetch Data'}
                  </Button>
                </Box>
              </LocalizationProvider>
            }
          />
          <CardContent>
            <TabContext value={activeTab}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={(_, newValue) => setActiveTab(newValue)} aria-label='flight data tabs'>
                  <Tab label='Altitude & Pressure' value='1' />
                  <Tab label='Acceleration' value='2' />
                  <Tab label='Gyroscope' value='3' />
                  <Tab label='Temperature' value='4' />
                </TabList>
              </Box>
              <TabPanel value='1'>
                <ReactApexCharts
                  options={altitudePressureOptions}
                  series={altitudePressureSeries}
                  height={400}
                  type='line'
                />
              </TabPanel>
              <TabPanel value='2'>
                <ReactApexCharts options={accelerationOptions} series={accelerationSeries} height={400} type='line' />
              </TabPanel>
              <TabPanel value='3'>
                <ReactApexCharts options={gyroscopeOptions} series={gyroscopeSeries} height={400} type='line' />
              </TabPanel>
              <TabPanel value='4'>
                <ReactApexCharts options={temperatureOptions} series={temperatureSeries} height={400} type='line' />
              </TabPanel>
            </TabContext>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default History
