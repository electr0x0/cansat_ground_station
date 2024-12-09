'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { motion } from 'framer-motion'

const ControlButton = ({ icon, label, color, onClick }) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <Button
      fullWidth
      variant='contained'
      color={color}
      startIcon={<i className={icon} />}
      onClick={onClick}
      sx={{ height: '60px' }}
    >
      {label}
    </Button>
  </motion.div>
)

const ControlPanel = () => {
  const handleEmergencyStop = () => {
    console.log('Emergency Stop Triggered')

    // Add emergency stop logic here
  }

  const handleDataExport = () => {
    console.log('Exporting Data')

    // Add data export logic here
  }

  const handleCalibrate = () => {
    console.log('Calibrating Sensors')

    // Add calibration logic here
  }

  return (
    <Card>
      <CardHeader title='Control Panel' />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ControlButton
              icon='tabler-emergency-stop'
              label='Emergency Stop'
              color='error'
              onClick={handleEmergencyStop}
            />
          </Grid>
          <Grid item xs={12}>
            <ControlButton icon='tabler-download' label='Export Data' color='primary' onClick={handleDataExport} />
          </Grid>
          <Grid item xs={12}>
            <ControlButton icon='tabler-refresh' label='Calibrate Sensors' color='warning' onClick={handleCalibrate} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ControlPanel
