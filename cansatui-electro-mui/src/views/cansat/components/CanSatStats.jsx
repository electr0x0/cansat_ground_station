'use client'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { motion } from 'framer-motion'
import { useTheme } from '@mui/material/styles'
import { Box } from '@mui/material'
import { Icon } from '@iconify/react'

import CustomAvatar from '@core/components/mui/Avatar'

const StatCard = ({ title, value, unit, icon, color, precision = 2 }) => (
  <Card 
    sx={{ 
      height: '100%', 
      backdropFilter: 'blur(20px)',
      backgroundColor: theme => theme.palette.mode === 'dark' 
        ? 'rgba(45, 45, 45, 0.8)' 
        : 'rgba(255, 255, 255, 0.8)',
      border: theme => `1px solid ${theme.palette.divider}`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme => theme.shadows[4]
      }
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CustomAvatar 
          skin='light' 
          color={color} 
          variant='rounded' 
          sx={{ 
            width: 48, 
            height: 48,
            borderRadius: '12px'
          }}
        >
          <Icon icon={icon} width={24} height={24} />
        </CustomAvatar>
        <Box>
          <Typography variant='body2' sx={{ mb: 1, color: 'text.secondary' }}>
            {title}
          </Typography>
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            {typeof value === 'number' ? value.toFixed(precision) : value}
            <Typography component='span' variant='body2' sx={{ ml: 1, color: 'text.secondary' }}>
              {unit}
            </Typography>
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
)

const CanSatStats = ({ data }) => {
  const theme = useTheme()

  return (
    <Grid container spacing={3}>
      {/* Primary Metrics */}
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard title='Altitude' value={data.altitude} unit='m' icon='tabler:arrow-up' color='primary' />
      </Grid>

      {/* Temperature & Humidity */}
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard 
          title='Temperature' 
          value={data.bmp_temperature} 
          unit='°C' 
          icon='tabler:temperature' 
          color='error' 
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard 
          title='Humidity' 
          value={data.humidity} 
          unit='%' 
          icon='tabler:droplet' 
          color='info' 
        />
      </Grid>

      {/* BMP280 Data */}
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard 
          title='Pressure' 
          value={data.pressure} 
          unit='hPa' 
          icon='tabler:gauge' 
          color='warning' 
        />
      </Grid>

      {/* MPU6050 Data */}
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard title='Accel X' value={data.accel_x} unit='g' icon='tabler:arrow-left-right' color='success' />
      </Grid>
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard title='Accel Y' value={data.accel_y} unit='g' icon='tabler:arrow-left-right' color='success' />
      </Grid>
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard title='Accel Z' value={data.accel_z} unit='g' icon='tabler:arrow-up-down' color='success' />
      </Grid>
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard title='Gyro X' value={data.gyro_x} unit='°/s' icon='tabler:rotate' color='info' />
      </Grid>
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard title='Gyro Y' value={data.gyro_y} unit='°/s' icon='tabler:rotate' color='info' />
      </Grid>
      <Grid item xs={12} sm={6} lg={6}>
        <StatCard title='Gyro Z' value={data.gyro_z} unit='°/s' icon='tabler:rotate' color='info' />
      </Grid>
    </Grid>
  )
}

export default CanSatStats
