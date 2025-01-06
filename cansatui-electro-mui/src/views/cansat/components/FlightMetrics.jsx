'use client'

import { useState, useEffect } from 'react'

import dynamic from 'next/dynamic'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const FlightMetrics = ({ data }) => {
  const [value, setValue] = useState('altitude')

  const [metricsHistory, setMetricsHistory] = useState({
    altitude: [],
    temperature: [],
    humidity: [],
    pressure: [],
    acceleration: [],
    gyroscope: [],
    timestamps: []
  })

  // Update history with new data
  useEffect(() => {
    setMetricsHistory(prev => {
      const timestamp = new Date().toLocaleTimeString()
      const acceleration = Math.sqrt(
        Math.pow(data.accel_x, 2) + 
        Math.pow(data.accel_y, 2) + 
        Math.pow(data.accel_z, 2)
      )
      const gyroscope = Math.sqrt(
        Math.pow(data.gyro_x, 2) + 
        Math.pow(data.gyro_y, 2) + 
        Math.pow(data.gyro_z, 2)
      )

      return {
        altitude: [...prev.altitude.slice(-20), data.altitude],
        temperature: [...prev.temperature.slice(-20), data.bmp_temperature],
        humidity: [...prev.humidity.slice(-20), data.humidity],
        pressure: [...prev.pressure.slice(-20), data.pressure],
        acceleration: [...prev.acceleration.slice(-20), acceleration],
        gyroscope: [...prev.gyroscope.slice(-20), gyroscope],
        timestamps: [...prev.timestamps.slice(-20), timestamp]
      }
    })
  }, [data])

  const chartOptions = {
    chart: {
      type: 'line',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 1000
        }
      },
      toolbar: { show: false },
      background: 'transparent'
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.1)',
      strokeDashArray: 5
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        opacityFrom: 0.7,
        opacityTo: 0.2
      }
    },
    xaxis: {
      categories: metricsHistory.timestamps,
      labels: {
        style: {
          colors: 'var(--mui-palette-text-disabled)'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: 'var(--mui-palette-text-disabled)'
        }
      }
    }
  }

  const chartData = {
    altitude: [{ name: 'Altitude (m)', data: metricsHistory.altitude }],
    temperature: [{ name: 'Temperature (°C)', data: metricsHistory.temperature }],
    humidity: [{ name: 'Humidity (%)', data: metricsHistory.humidity }],
    pressure: [{ name: 'Pressure (hPa)', data: metricsHistory.pressure }],
    acceleration: [{ name: 'Acceleration (g)', data: metricsHistory.acceleration }],
    gyroscope: [{ name: 'Angular Velocity (°/s)', data: metricsHistory.gyroscope }]
  }

  return (
    <Card 
      sx={{ 
        background: theme => `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.dark}15 100%)`,
        boxShadow: theme => `0 8px 32px -4px ${theme.palette.primary.main}20`
      }}
    >
      <CardHeader title='Flight Metrics' />
      <CardContent>
        <TabContext value={value}>
          <TabList onChange={(_, newValue) => setValue(newValue)}>
            <Tab label='Altitude' value='altitude' />
            <Tab label='Temperature' value='temperature' />
            <Tab label='Humidity' value='humidity' />
            <Tab label='Pressure' value='pressure' />
            <Tab label='Acceleration' value='acceleration' />
            <Tab label='Gyroscope' value='gyroscope' />
          </TabList>
          {Object.keys(chartData).map(metric => (
            <TabPanel key={metric} value={metric} className='p-0'>
              <AppReactApexCharts type='line' height={400} options={chartOptions} series={chartData[metric]} />
            </TabPanel>
          ))}
        </TabContext>
      </CardContent>
    </Card>
  )
}

export default FlightMetrics
