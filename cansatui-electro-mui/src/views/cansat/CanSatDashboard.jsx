'use client'

import { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import { motion } from 'framer-motion'
import { useTheme } from '@mui/material/styles'

import CanSatStats from './components/CanSatStats'
import CanSat3DVisualization from './components/CanSat3DVisualization'
import FlightMetrics from './components/FlightMetrics'
import ControlPanel from './components/ControlPanel'
import LoadingOverlay from './components/LoadingOverlay'
import GyroMetrics from './components/GyroMetrics'

const CanSatDashboard = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [sensorData, setSensorData] = useState({
    altitude: 0,
    humidity: 0,
    pressure: 0,
    accel_x: 0,
    accel_y: 0,
    accel_z: 0,
    gyro_x: 0,
    gyro_y: 0,
    gyro_z: 0,
    bmp_temperature: 0,
    coordinates: { x: 0, y: 0, z: 0 }
  })

  const fetchBangladeshHumidity = async () => {
    try {
      const response = await fetch(
        'https://api.openweathermap.org/data/2.5/weather?q=Dhaka,BD&appid=9c97efb19d28d79c44571c3f418b7f5d'
      )
      const data = await response.json()
      return data.main.humidity
    } catch (error) {
      console.error('Error fetching humidity data:', error)
      return null
    }
  }

  // Fetch sensor data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sensor data
        const response = await fetch('http://localhost:8000/sensor-data/latest/')
        const latestReading = await response.json()
        
        // Fetch humidity data
        const bangladeshHumidity = await fetchBangladeshHumidity()
        
        setSensorData({
          altitude: latestReading.altitude,
          humidity: bangladeshHumidity || 0,
          pressure: latestReading.pressure,
          accel_x: latestReading.accel_x,
          accel_y: latestReading.accel_y, 
          accel_z: latestReading.accel_z,
          gyro_x: latestReading.gyro_x,
          gyro_y: latestReading.gyro_y,
          gyro_z: latestReading.gyro_z,
          bmp_temperature: latestReading.bmp_temperature,
          coordinates: {
            x: latestReading.accel_x,
            y: latestReading.accel_y,
            z: latestReading.altitude
          }
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    // Initial fetch
    fetchData()
    
    // Poll every second
    const interval = setInterval(fetchData, 1000)
    
    // Simulate loading state
    setTimeout(() => setIsLoading(false), 200)
    
    return () => clearInterval(interval)
  }, [])

  const theme = useTheme()

  if (isLoading) {
    return <LoadingOverlay />
  }

  return (
    <Box
      sx={{
        background: `linear-gradient(145deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        borderRadius: 2,
        p: 2
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Grid container spacing={3}>
          {/* Stats Cards Row */}
          <Grid item xs={12}>
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CanSatStats data={sensorData} />
            </motion.div>
          </Grid>

          {/* 3D Visualization */}
          <Grid item xs={12}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CanSat3DVisualization coordinates={sensorData.coordinates} />
            </motion.div>
          </Grid>

          {/* Gyroscope Data */}
          <Grid item xs={12}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <GyroMetrics 
                data={{
                  x: sensorData.gyro_x,
                  y: sensorData.gyro_y,
                  z: sensorData.gyro_z
                }} 
              />
            </motion.div>
          </Grid>

          {/* Flight Metrics */}
          <Grid item xs={12}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <FlightMetrics data={sensorData} />
            </motion.div>
          </Grid>

          {/* Control Panel */}
          <Grid item xs={12} container justifyContent="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <ControlPanel />
              </motion.div>
            </Grid>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  )
}

export default CanSatDashboard
