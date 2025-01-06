'use client'

import { useEffect, useRef, useState, useMemo } from 'react'

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {
  Environment,
  OrbitControls,
  Trail,
  Text,
  useTexture,
  Sky,
  Stars,
  AdaptiveDpr,
  AdaptiveEvents,
  Preload
} from '@react-three/drei'
import { TextureLoader, Vector3, RepeatWrapping, Euler, MathUtils } from 'three'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Slider from '@mui/material/Slider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { IconButton, Tooltip } from '@mui/material'
import { Icon } from '@iconify/react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Modified CameraController for smoother following and better sensitivity
const CameraController = ({ target, followCansat }) => {
  const { camera } = useThree()
  const orbitControlsRef = useRef()
  const isInitialPosition = useRef(true)

  useFrame((state, delta) => {
    if (followCansat) {
      if (isInitialPosition.current) {
        // Adjusted initial camera position for better view
        camera.position.set(-30, target.z + 15, 30)
        camera.lookAt(target.x, target.z, target.y)
        isInitialPosition.current = false
      }

      // More sensitive camera movement
      const targetPosition = new Vector3(target.x, target.z, target.y)
      const idealOffset = new Vector3(-30, target.z + 15, 30)
      
      // Increased lerp factor for more responsive movement
      camera.position.lerp(idealOffset, 0.1)
      camera.lookAt(targetPosition)
    }
  })

  return (
    <OrbitControls
      ref={orbitControlsRef}
      enablePan={true}
      maxPolarAngle={Math.PI / 1.5}
      minDistance={5} // Reduced minimum distance
      maxDistance={500} // Reduced maximum distance
      zoomSpeed={1} // Increased zoom speed
      enabled={!followCansat}
      enableDamping={true}
      dampingFactor={0.05}
    />
  )
}

// Add this new helper for interpolation
const lerp = (start, end, factor) => {
  return start + (end - start) * factor
}

// Updated CanSat component with smooth interpolation
const CanSat = ({ position, trajectory, showTrajectory, gyroData }) => {
  const meshRef = useRef()
  const modelRef = useRef()
  const trailRef = useRef()
  const [modelLoaded, setModelLoaded] = useState(false)
  
  // Refs for smooth interpolation
  const currentRotation = useRef({ x: 0, y: 0, z: 0 })
  const targetRotation = useRef({ x: 0, y: 0, z: 0 })
  const currentPosition = useRef(new Vector3(position[0], position[1], position[2]))
  const targetPosition = useRef(new Vector3(position[0], position[1], position[2]))

  // Update target values when new data arrives
  useEffect(() => {
    targetPosition.current = new Vector3(position[0], position[1], position[2])
    
    // Convert gyro data to cumulative rotation
    targetRotation.current = {
      x: targetRotation.current.x + gyroData.x * 0.01, // Adjust multiplier for rotation speed
      y: targetRotation.current.y + gyroData.y * 0.01,
      z: targetRotation.current.z + gyroData.z * 0.01
    }
  }, [position, gyroData])

  useEffect(() => {
    const loader = new GLTFLoader()

    loader.load(
      '/models/cansat.glb',
      gltf => {
        if (meshRef.current) {
          // Clear any existing model
          while (meshRef.current.children.length) {
            meshRef.current.remove(meshRef.current.children[0])
          }
          
          // Add new model
          modelRef.current = gltf.scene
          modelRef.current.position.set(0, 0, 0)
          meshRef.current.add(modelRef.current)
          setModelLoaded(true)
        }
      },
      undefined,
      error => {
        console.error('Error loading model:', error)
        setModelLoaded(false)
      }
    )
  }, [])

  // Smooth interpolation in animation frame
  useFrame((state, delta) => {
    if (meshRef.current && modelLoaded) {
      // Smooth position interpolation
      const lerpFactor = 0.1 // Adjust for smoother/faster movement
      
      currentPosition.current.x = lerp(currentPosition.current.x, targetPosition.current.x, lerpFactor)
      currentPosition.current.y = lerp(currentPosition.current.y, targetPosition.current.y, lerpFactor)
      currentPosition.current.z = lerp(currentPosition.current.z, targetPosition.current.z, lerpFactor)
      
      meshRef.current.position.copy(currentPosition.current)

      // Smooth rotation interpolation
      const rotationLerpFactor = 0.15 // Adjust for smoother/faster rotation
      
      currentRotation.current = {
        x: lerp(currentRotation.current.x, targetRotation.current.x, rotationLerpFactor),
        y: lerp(currentRotation.current.y, targetRotation.current.y, rotationLerpFactor),
        z: lerp(currentRotation.current.z, targetRotation.current.z, rotationLerpFactor)
      }

      meshRef.current.rotation.x = currentRotation.current.x
      meshRef.current.rotation.y = currentRotation.current.y
      meshRef.current.rotation.z = currentRotation.current.z
    }
  })

  return (
    <group>
      <Trail ref={trailRef} width={2} length={50} color={'#00ff00'} attenuation={t => t * t} interval={1}>
        <mesh ref={meshRef} scale={0.2}>
          {!modelLoaded && (
            <>
              <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
              <meshStandardMaterial color='#00ff00' />
            </>
          )}
        </mesh>
      </Trail>

      {showTrajectory && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach='attributes-position'
              count={trajectory.length / 3}
              array={new Float32Array(trajectory)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color='#ff3333' linewidth={3} opacity={0.8} transparent depthWrite={false} />
        </line>
      )}
    </group>
  )
}

// Modified HeightMarker component to highlight current altitude
const HeightMarker = ({ height, isCurrentHeight }) => {
  return (
    <group position={[-10, height, 0]}>
      <Text
        position={[0, 0, 0]}
        fontSize={isCurrentHeight ? 2 : 1.5} // Larger font for current height
        color={isCurrentHeight ? '#00ff00' : 'white'} // Green color for current height
        anchorX='left'
        outlineWidth={0.1}
        outlineColor={isCurrentHeight ? '#003300' : 'black'}
        outlineOpacity={1}
        backgroundColor={isCurrentHeight ? 'rgba(0,255,0,0.2)' : 'rgba(0,0,0,0.5)'}
        padding={0.5}
      >
        {height}m
      </Text>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach='attributes-position'
            count={2}
            array={new Float32Array([-10, 0, 0, 10, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          color={isCurrentHeight ? '#00ff00' : '#ffffff'} 
          linewidth={isCurrentHeight ? 2 : 1} 
          opacity={isCurrentHeight ? 0.8 : 0.3} 
          transparent 
        />
      </line>
    </group>
  )
}

// Enhanced ground with fixed position
const Ground = () => {
  const [grassTexture, normalMap, roughnessMap] = useLoader(TextureLoader, [
    '/textures/grass.jpg',
    '/textures/grass_normal.jpg',
    '/textures/grass_roughness.jpg'
  ])

  // Configure texture repeating
  const textures = [grassTexture, normalMap, roughnessMap]

  textures.forEach(texture => {
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(100, 100)
  })

  return (
    <group position={[0, 0, 0]}>
      {' '}
      {/* Fixed position at 0 */}
      {/* Extended ground plane */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial
          map={grassTexture}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          normalScale={[0.5, 0.5]}
        />
      </mesh>
      {/* Extended grid helper */}
      <gridHelper args={[2000, 200, '#666666', '#444444']} />
      {/* Landing zone indicators */}
      <group position={[0, 0.01, 0]}>
        {[4, 3, 2].map((radius, index) => (
          <mesh key={radius} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[radius, radius + 0.1, 32]} />
            <meshBasicMaterial color={index === 0 ? '#ff0000' : '#ff6600'} opacity={0.8 - index * 0.1} transparent />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// Simplified atmosphere effects without stars
const Atmosphere = () => {
  return (
    <>
      <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
      <hemisphereLight intensity={0.5} groundColor='#053594' />
    </>
  )
}

// Main visualization component with adjusted scale
const CanSat3DVisualization = ({ coordinates, onStopFetch }) => {
  const [trajectory, setTrajectory] = useState([])
  const [followCansat, setFollowCansat] = useState(true)
  const [showTrajectory, setShowTrajectory] = useState(true)
  const [timeSeriesData, setTimeSeriesData] = useState([])
  const [replayTime, setReplayTime] = useState(0)
  const hasLanded = coordinates.z <= 0
  const startTime = useRef(Date.now())

  // Store time-series data during flight
  useEffect(() => {
    if (!hasLanded) {
      const timepoint = {
        time: (Date.now() - startTime.current) / 1000, // Time in seconds
        coordinates: { ...coordinates },
        trajectory: [...trajectory]
      }

      setTimeSeriesData(prev => [...prev, timepoint])
    }
  }, [coordinates, hasLanded, trajectory])

  // Get replay data for current slider position
  const currentData = useMemo(() => {
    if (!hasLanded || timeSeriesData.length === 0) return { coordinates, trajectory }

    const index = Math.floor((replayTime / 100) * (timeSeriesData.length - 1))

    return timeSeriesData[index] || timeSeriesData[timeSeriesData.length - 1]
  }, [hasLanded, timeSeriesData, replayTime, coordinates])

  // Generate height markers with current height highlight
  const generateHeightMarkers = () => {
    const markers = []
    const maxHeight = Math.max(100, Math.ceil(currentData.coordinates.z / 5) * 5) // Adjust max height based on current altitude
    const interval = 5 // Marker interval
    const currentHeight = Math.round(currentData.coordinates.z)
    
    // Add regular interval markers
    for (let height = 0; height <= maxHeight; height += interval) {
      markers.push({
        height,
        isCurrentHeight: Math.abs(height - currentHeight) < interval / 2
      })
    }

    // Add current height marker if not close to an interval
    if (!markers.some(m => m.isCurrentHeight)) {
      markers.push({
        height: currentHeight,
        isCurrentHeight: true
      })
    }

    // Sort markers by height
    return markers.sort((a, b) => a.height - b.height)
  }

  const handleExport = async () => {
    const canvas = await html2canvas(document.querySelector('#visualization-container'))
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF()
    
    pdf.addImage(imgData, 'PNG', 0, 0)
    pdf.save('cansat-visualization.pdf')
  }

  return (
    <Card 
      sx={{ 
        backdropFilter: 'blur(20px)',
        backgroundColor: theme => theme.palette.mode === 'dark' 
          ? 'rgba(35, 35, 35, 0.9)' 
          : 'rgba(255, 255, 255, 0.9)',
        border: theme => `1px solid ${theme.palette.divider}`,
        overflow: 'visible'
      }}
    >
      <CardHeader 
        title='CanSat Visualization'
        action={
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={followCansat}
                  onChange={e => setFollowCansat(e.target.checked)}
                  color="primary"
                />
              }
              label="Follow CanSat"
            />
            <Tooltip title="Stop Live Updates">
              <IconButton 
                onClick={onStopFetch}
                color="error"
                sx={{ 
                  backdropFilter: 'blur(10px)',
                  backgroundColor: 'rgba(255, 0, 0, 0.1)'
                }}
              >
                <Icon icon="mdi:stop-circle-outline" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Visualization">
              <IconButton 
                onClick={handleExport}
                color="primary"
                sx={{ 
                  backdropFilter: 'blur(10px)',
                  backgroundColor: 'rgba(25, 118, 210, 0.1)'
                }}
              >
                <Icon icon="mdi:export" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <CardContent id="visualization-container">
        <div style={{ height: '600px', position: 'relative' }}>
          <Canvas
            shadows
            camera={{
              position: [-30, currentData.coordinates.z + 15, 30],
              fov: 60,
              near: 0.1,
              far: 1000
            }}
            frameloop='always'
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: 'high-performance'
            }}
          >
            <Preload all />
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />
            <Environment preset='sunset' />
            <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
            <ambientLight intensity={0.5} />

            <Atmosphere />
            <CanSat
              position={[
                currentData.coordinates.x,
                currentData.coordinates.z,
                currentData.coordinates.y
              ]}
              trajectory={currentData.trajectory}
              showTrajectory={followCansat || (hasLanded && showTrajectory)}
              gyroData={{
                x: coordinates.gyro_x || 0,
                y: coordinates.gyro_y || 0,
                z: coordinates.gyro_z || 0
              }}
            />
            <Ground />
            <CameraController target={currentData.coordinates} followCansat={followCansat} />

            {/* Updated height markers */}
            {generateHeightMarkers().map(({ height, isCurrentHeight }) => (
              <HeightMarker 
                key={height} 
                height={height} 
                isCurrentHeight={isCurrentHeight}
              />
            ))}
          </Canvas>

          {/* Updated overlay information with more precision */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'rgba(0,0,0,0.7)',
              padding: '10px',
              borderRadius: '5px',
              color: 'white',
              fontFamily: 'monospace'
            }}
          >
            <div>X: {currentData.coordinates.x.toFixed(3)}m</div>
            <div>Y: {currentData.coordinates.y.toFixed(3)}m</div>
            <div>Z: {currentData.coordinates.z.toFixed(3)}m</div>
          </div>
        </div>

        {/* Timeline Slider */}
        {hasLanded && timeSeriesData.length > 0 && (
          <Box sx={{ mt: 2, px: 3 }}>
            <Typography gutterBottom>
              Flight Time:{' '}
              {(timeSeriesData[Math.floor((replayTime / 100) * (timeSeriesData.length - 1))]?.time || 0).toFixed(1)}s
            </Typography>
            <Slider
              value={replayTime}
              onChange={(_, newValue) => setReplayTime(newValue)}
              aria-labelledby='flight-time-slider'
              valueLabelDisplay='auto'
              valueLabelFormat={value =>
                (timeSeriesData[Math.floor((value / 100) * (timeSeriesData.length - 1))]?.time || 0).toFixed(1) + 's'
              }
              sx={{
                '& .MuiSlider-thumb': {
                  width: 20,
                  height: 20
                },
                '& .MuiSlider-track': {
                  height: 6
                },
                '& .MuiSlider-rail': {
                  height: 6
                }
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default CanSat3DVisualization
