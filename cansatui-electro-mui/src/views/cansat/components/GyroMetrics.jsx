import { useEffect, useState, useRef } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import Plot from 'react-plotly.js'

const GyroMetrics = ({ data }) => {
  const theme = useTheme()
  const [plotData, setPlotData] = useState({
    x: [],
    y: [],
    z: [],
    timestamps: []
  })

  const maxDataPoints = 100 // Maximum number of points to show

  // Update plot data when new gyro data arrives
  useEffect(() => {
    setPlotData(prev => {
      const newTimestamp = new Date().getTime()
      
      return {
        x: [...prev.x, data.x].slice(-maxDataPoints),
        y: [...prev.y, data.y].slice(-maxDataPoints),
        z: [...prev.z, data.z].slice(-maxDataPoints),
        timestamps: [...prev.timestamps, newTimestamp].slice(-maxDataPoints)
      }
    })
  }, [data])

  const plot3DData = [{
    type: 'scatter3d',
    mode: 'lines+markers',
    x: plotData.x,
    y: plotData.y,
    z: plotData.z,
    marker: {
      size: 3,
      color: plotData.timestamps,
      colorscale: 'Viridis',
      opacity: 0.8
    },
    line: {
      color: theme.palette.primary.main,
      width: 2
    },
    name: 'Gyroscope Path'
  }]

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    scene: {
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.5 }
      },
      xaxis: {
        title: 'X-Axis Rotation',
        gridcolor: theme.palette.divider,
        zerolinecolor: theme.palette.divider,
        showbackground: true,
        backgroundcolor: theme.palette.background.paper
      },
      yaxis: {
        title: 'Y-Axis Rotation',
        gridcolor: theme.palette.divider,
        zerolinecolor: theme.palette.divider,
        showbackground: true,
        backgroundcolor: theme.palette.background.paper
      },
      zaxis: {
        title: 'Z-Axis Rotation',
        gridcolor: theme.palette.divider,
        zerolinecolor: theme.palette.divider,
        showbackground: true,
        backgroundcolor: theme.palette.background.paper
      }
    },
    autosize: true,
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0
    },
    showlegend: false,
    hovermode: 'closest'
  }

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
      'lasso2d',
      'select2d',
      'autoScale2d',
    ]
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title="3D Gyroscope Visualization" 
        subheader="Real-time 3D angular velocity path"
      />
      <CardContent>
        <Plot
          data={plot3DData}
          layout={layout}
          config={config}
          style={{ width: '100%', height: '400px' }}
        />
      </CardContent>
    </Card>
  )
}

export default GyroMetrics 