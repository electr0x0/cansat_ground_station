'use client'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { motion } from 'framer-motion'

import CustomAvatar from '@core/components/mui/Avatar'

const StatCard = ({ title, value, unit, icon, color, precision = 2 }) => (
  <Card sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
    <CardContent sx={{ width: '100%', py: 2.5 }}>
      <motion.div
        className='flex items-center gap-4'
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <CustomAvatar skin='light' color={color} variant='rounded' sx={{ width: 45, height: 45 }}>
          <i className={`${icon} fs-3`}></i>
        </CustomAvatar>
        <div style={{ flex: 1 }}>
          <Typography variant='body2' sx={{ mb: 1 }}>
            {title}
          </Typography>
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant='h5'>
              {typeof value === 'number' ? value.toFixed(precision) : value} {unit}
            </Typography>
          </motion.div>
        </div>
      </motion.div>
    </CardContent>
  </Card>
)

const CanSatStats = ({ data }) => {
  // Calculate descent rate
  const descentRate = data.velocity

  // Calculate estimated time to landing
  const timeToLanding = data.altitude > 0 ? (data.altitude / descentRate).toFixed(1) : 0

  // Calculate air density using temperature and pressure
  const airDensity = (data.pressure * 100) / (287.05 * (data.temperature + 273.15))

  return (
    <Grid container spacing={3}>
      {/* Primary Metrics */}
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard title='Altitude' value={data.altitude} unit='m' icon='tabler-arrow-up' color='primary' />
      </Grid>
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard title='Velocity' value={data.velocity} unit='m/s' icon='tabler-speed' color='success' />
      </Grid>

      {/* Environmental Data */}
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard title='Temperature' value={data.temperature} unit='°C' icon='tabler-temperature' color='error' />
      </Grid>
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard title='Pressure' value={data.pressure} unit='hPa' icon='tabler-gauge' color='warning' />
      </Grid>

      {/* Position Data */}
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard title='Latitude' value={data.coordinates?.x || 0} unit='m' icon='tabler-map-pin' color='info' />
      </Grid>
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard title='Longitude' value={data.coordinates?.y || 0} unit='m' icon='tabler-map-pin' color='info' />
      </Grid>

      {/* System Status */}
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard
          title='Battery'
          value={data.batteryVoltage}
          unit='V'
          icon='tabler-battery'
          color={data.batteryVoltage > 11 ? 'success' : 'error'}
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard
          title='Signal Strength'
          value={data.signalStrength || 100}
          unit='%'
          icon='tabler-antenna'
          color='secondary'
        />
      </Grid>

      {/* Calculated Metrics */}
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard
          title='Air Density'
          value={airDensity}
          unit='kg/m³'
          icon='tabler-wind'
          color='primary'
          precision={4}
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard
          title='Time to Landing'
          value={timeToLanding}
          unit='s'
          icon='tabler-clock'
          color='warning'
          precision={1}
        />
      </Grid>

      {/* Mission Status - Full Width */}
      <Grid item xs={12}>
        <StatCard
          title='Mission Phase'
          value={data.altitude > 0 ? 'DESCENT' : 'LANDED'}
          unit=''
          icon='tabler-rocket'
          color={data.altitude > 0 ? 'warning' : 'success'}
        />
      </Grid>
    </Grid>
  )
}

export default CanSatStats
