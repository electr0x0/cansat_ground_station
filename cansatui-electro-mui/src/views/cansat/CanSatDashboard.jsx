'use client'

import { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid'

import CanSatStats from './components/CanSatStats'
import CanSat3DVisualization from './components/CanSat3DVisualization'
import FlightMetrics from './components/FlightMetrics'
import ControlPanel from './components/ControlPanel'

const CanSatDashboard = () => {
  const [sensorData, setSensorData] = useState({
    altitude: 400, // Start at 100m
    velocity: 0, // Initial velocity
    temperature: 25,
    pressure: 1013,
    batteryVoltage: 12,
    coordinates: { x: 0, y: 0, z: 400 }
  })

  // Physics constants
  const GRAVITY = 9.81 // m/s²
  const AIR_DENSITY = 1.225 // kg/m³
  const CANSAT_MASS = 0.35 // kg (350g)
  const CANSAT_AREA = 0.0064 // m² (assuming 8cm diameter circular cross-section)
  const DRAG_COEFFICIENT = 0.47 // Typical value for a cylinder
  const TIME_STEP = 0.1 // seconds

  // Simulate realistic falling motion with physics
  useEffect(() => {
    let currentVelocity = 0
    let currentAltitude = 400
    let currentX = 0
    let currentY = 0

    const interval = setInterval(() => {
      // Only update if we haven't reached the ground
      if (currentAltitude > 0) {
        // Calculate drag force
        const dragForce = 0.5 * AIR_DENSITY * CANSAT_AREA * DRAG_COEFFICIENT * (currentVelocity * currentVelocity)
        const dragAcceleration = dragForce / CANSAT_MASS

        // Calculate net acceleration (gravity minus drag)
        const netAcceleration = GRAVITY - (currentVelocity > 0 ? dragAcceleration : 0)

        // Update velocity using acceleration
        currentVelocity += netAcceleration * TIME_STEP

        // Update position
        currentAltitude = Math.max(0, currentAltitude - currentVelocity * TIME_STEP)

        // Add some realistic wind drift
        const windEffect = Math.sin(Date.now() / 1000) * 0.1

        currentX += windEffect
        currentY += windEffect * 0.5

        // Calculate air pressure using barometric formula
        const pressure = 1013.25 * Math.exp(-currentAltitude / 7400)

        // Calculate temperature (assuming standard lapse rate of -6.5°C/km)
        const temperature = 25 - currentAltitude * 0.0065

        setSensorData({
          altitude: currentAltitude,
          velocity: currentVelocity,
          temperature: temperature,
          pressure: pressure,
          batteryVoltage: 12 - (100 - currentAltitude) * 0.01, // Simple battery drain simulation
          coordinates: {
            x: currentX,
            y: currentY,
            z: currentAltitude
          }
        })
      } else {
        // Stop updating when we hit the ground
        clearInterval(interval)
      }
    }, TIME_STEP * 1000) // Convert time step to milliseconds

    return () => clearInterval(interval)
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={8}>
        <CanSat3DVisualization coordinates={sensorData.coordinates} />
      </Grid>
      <Grid item xs={12} md={4}>
        <CanSatStats data={sensorData} />
      </Grid>
      <Grid item xs={12} md={8}>
        <FlightMetrics data={sensorData} />
      </Grid>
      <Grid item xs={12} md={4}>
        <ControlPanel />
      </Grid>
    </Grid>
  )
}

export default CanSatDashboard
