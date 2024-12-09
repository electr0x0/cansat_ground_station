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
import { TextureLoader, Vector3, RepeatWrapping } from 'three'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Slider from '@mui/material/Slider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Camera controller with stable following
const CameraController = ({ target, followCansat }) => {
  const { camera } = useThree()
  const orbitControlsRef = useRef()
  const isInitialPosition = useRef(true)

  useFrame((state, delta) => {
    if (followCansat) {
      if (isInitialPosition.current) {
        camera.position.set(-60, target.z + 30, 60)
        camera.lookAt(target.x, target.z, target.y)
        isInitialPosition.current = false
      }

      // Fixed camera height offset to prevent up/down motion
      const targetPosition = new Vector3(target.x, target.z, target.y)
      const idealOffset = new Vector3(-60, target.z + 30, 60)

      // Smoother camera movement with fixed vertical offset
      camera.position.lerp(idealOffset, 0.05)
      camera.lookAt(targetPosition)
    }
  })

  return (
    <OrbitControls
      ref={orbitControlsRef}
      enablePan={true}
      maxPolarAngle={Math.PI / 1.5}
      minDistance={10}
      maxDistance={1000}
      zoomSpeed={0.5}
      enabled={!followCansat}
      enableDamping={true}
      dampingFactor={0.05}
    />
  )
}

// CanSat with fixed coordinate system
const CanSat = ({ position, trajectory, showTrajectory }) => {
  const meshRef = useRef()
  const trailRef = useRef()
  const [modelLoaded, setModelLoaded] = useState(false)

  // Convert coordinates to fixed system
  const canSatPosition = new Vector3(position[0], position[1], position[2])

  useEffect(() => {
    const loader = new GLTFLoader()

    loader.load(
      '/models/cansat.glb',
      gltf => {
        if (meshRef.current) {
          meshRef.current.add(gltf.scene)
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

  return (
    <group position={canSatPosition}>
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

// Height marker with better visibility
const HeightMarker = ({ height }) => {
  return (
    <group position={[-20, height, 0]}>
      <Text
        position={[0, 0, 0]}
        fontSize={2}
        color='white'
        anchorX='left'
        outlineWidth={0.1}
        outlineColor='black'
        outlineOpacity={1}
        backgroundColor='rgba(0,0,0,0.5)'
        padding={0.5}
      >
        {height}m
      </Text>
      {/* Add horizontal line for better reference */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach='attributes-position'
            count={2}
            array={new Float32Array([-20, 0, 0, 20, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color='#ffffff' linewidth={2} opacity={0.3} transparent />
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

// Main visualization component
const CanSat3DVisualization = ({ coordinates }) => {
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

  return (
    <Card>
      <CardHeader
        title='CanSat Live Trajectory'
        subheader={`Altitude: ${currentData.coordinates.z.toFixed(2)}m`}
        action={
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {hasLanded && (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showTrajectory}
                      onChange={e => setShowTrajectory(e.target.checked)}
                      color='secondary'
                    />
                  }
                  label='Show Path'
                />
              </>
            )}
            <FormControlLabel
              control={
                <Switch checked={followCansat} onChange={e => setFollowCansat(e.target.checked)} color='primary' />
              }
              label='Follow CanSat'
            />
          </div>
        }
      />
      <CardContent>
        <div style={{ height: '600px', position: 'relative' }}>
          <Canvas
            shadows
            camera={{
              position: [-60, currentData.coordinates.z + 30, 60],
              fov: 45,
              near: 0.1,
              far: 10000
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
              position={[currentData.coordinates.x, currentData.coordinates.z, currentData.coordinates.y]}
              trajectory={currentData.trajectory}
              showTrajectory={followCansat || (hasLanded && showTrajectory)}
            />
            <Ground />
            <CameraController target={currentData.coordinates} followCansat={followCansat} />

            {/* Height Markers */}
            {[25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400].map(height => (
              <HeightMarker key={height} height={height} />
            ))}
          </Canvas>

          {/* Overlay Information */}
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
            <div>X: {currentData.coordinates.x.toFixed(2)}m</div>
            <div>Y: {currentData.coordinates.y.toFixed(2)}m</div>
            <div>Z: {currentData.coordinates.z.toFixed(2)}m</div>
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
