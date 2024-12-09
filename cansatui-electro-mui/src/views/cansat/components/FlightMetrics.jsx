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
    velocity: [],
    temperature: [],
    pressure: [],
    timestamps: []
  })

  // Update history with new data
  useEffect(() => {
    setMetricsHistory(prev => {
      const timestamp = new Date().toLocaleTimeString()

      return {
        altitude: [...prev.altitude.slice(-20), data.altitude],
        velocity: [...prev.velocity.slice(-20), data.velocity],
        temperature: [...prev.temperature.slice(-20), data.temperature],
        pressure: [...prev.pressure.slice(-20), data.pressure],
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
      toolbar: { show: false }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    grid: {
      borderColor: 'var(--mui-palette-divider)'
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
    velocity: [{ name: 'Velocity (m/s)', data: metricsHistory.velocity }],
    temperature: [{ name: 'Temperature (°C)', data: metricsHistory.temperature }],
    pressure: [{ name: 'Pressure (hPa)', data: metricsHistory.pressure }]
  }

  return (
    <Card>
      <CardHeader title='Flight Metrics' />
      <CardContent>
        <TabContext value={value}>
          <TabList onChange={(_, newValue) => setValue(newValue)}>
            <Tab label='Altitude' value='altitude' />
            <Tab label='Velocity' value='velocity' />
            <Tab label='Temperature' value='temperature' />
            <Tab label='Pressure' value='pressure' />
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
