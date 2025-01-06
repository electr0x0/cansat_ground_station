'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

// Dynamically import the CanSatDashboard component with no SSR
const CanSatDashboard = dynamic(
  () => import('@/views/cansat/CanSatDashboard'),
  { 
    ssr: false,
    loading: () => (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    )
  }
)

const HomePage = () => {
  return (
    <Suspense>
      <CanSatDashboard />
    </Suspense>
  )
}

export default HomePage
