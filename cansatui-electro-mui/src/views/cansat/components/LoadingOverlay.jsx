'use client'

import { CircularProgress, Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'

const LoadingOverlay = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 9999
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={60} sx={{ color: '#FFFFFF' }} />
        <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
          Initializing CanSat Dashboard...
        </Typography>
      </Box>
    </motion.div>
  )
}

export default LoadingOverlay