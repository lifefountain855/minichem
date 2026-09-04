import { Component, Suspense, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Float, useGLTF, Center, Resize } from '@react-three/drei'
import { motion, useScroll } from 'motion/react'
import * as THREE from 'three'
import Lenis from 'lenis'

const sections = [
  {
    number: '01',
    kicker: 'efficient',
    title: 'Clean \nyour home\ndifferently.',
    copy: 'one 1 fl oz bottle makes 32 fl oz of cleaner - as much as any sprayer from the store. pay for the formula, not the water.',
    align: 'text-left',
  },
  {
    number: '02',
    kicker: 'enviroment focused',
    title: 'Small footprint.\nFull presence.',
    copy: (<span>*<span style={{textTransform: 'uppercase'}}>zer0</span> consumer plastic waste.<br/>soft on skin, tough on grease.<br/>don't drink it though.</span>),
    align: 'text-right items-end',
  },
  {
    number: '03',
    kicker: 'Make it yours',
    title: 'clean,\nyour way.',
    copy: 'free & clear, or with premium fragrences. have it your way.',
    align: 'text-left',
  },
]

function ProductPlaceholder() {
  const points = useMemo(() => {
    const pts = []
    const scale = 0.1 // Scale mm down to standard 3D units

    // --- OUTER WALL (Bottom to Top) ---
    // 1. Center bottom start
    pts.push(new THREE.Vector2(0, 0))
    
    // 2. Base standing surface (Φ27mm -> radius 13.5mm)
    pts.push(new THREE.Vector2(13.5 * scale, 0))
    
    // 3. Heel curve (R2 corner up to the Φ32.8mm main body at Y=5mm)
    pts.push(new THREE.Vector2(16.4 * scale, 2.0 * scale))
    pts.push(new THREE.Vector2(16.4 * scale, 5.0 * scale))
    
    // 4. Main cylindrical body (Vertical wall up to Y=51.2mm)
    pts.push(new THREE.Vector2(16.4 * scale, 51.2 * scale))
    
    // 5. Shoulder curve (R10.3 / R4 transitions towards the neck base at Y=63.9mm)
    pts.push(new THREE.Vector2(14.5 * scale, 56.0 * scale))
    pts.push(new THREE.Vector2(11.0 * scale, 61.0 * scale))
    pts.push(new THREE.Vector2(8.75 * scale, 63.9 * scale)) // Neck base (Φ17.5mm)

    // 6. Lower collar bead (Φ20.64mm ridge shown in the detail view)
    pts.push(new THREE.Vector2(10.32 * scale, 64.5 * scale))
    pts.push(new THREE.Vector2(8.75 * scale, 65.0 * scale))

    // 7. Simulated screw thread ridges (Horizontal rings approximating the helical finish)
    pts.push(new THREE.Vector2(9.8 * scale, 68.0 * scale))
    pts.push(new THREE.Vector2(8.75 * scale, 69.5 * scale))
    pts.push(new THREE.Vector2(9.8 * scale, 72.0 * scale))
    pts.push(new THREE.Vector2(8.75 * scale, 73.5 * scale))

    // 8. Top Lip Rim outer edge (Total Height 78.58mm)
    pts.push(new THREE.Vector2(8.75 * scale, 78.58 * scale))
    
    // // --- HOLLOWING TURN (Going inside the bottle) ---
    // // 9. Inner lip opening (Minimum inside Φ10.26mm -> radius 5.13mm)
    pts.push(new THREE.Vector2(5.13 * scale, 78.58 * scale))
    
    // // --- INNER WALL (Top to Bottom, maintaining ~1.5mm to 2mm glass thickness) ---
    // // 10. Down the inside of the neck
    // pts.push(new THREE.Vector2(5.13 * scale, 63.9 * scale))
    
    // // 11. Following the curve of the shoulder internally
    // pts.push(new THREE.Vector2(8.5 * scale, 59.0 * scale))
    // pts.push(new THREE.Vector2(12.0 * scale, 54.5 * scale))
    
    // // 12. Down the inside of the main body (Clearance radius ~14.6mm)
    // pts.push(new THREE.Vector2(14.6 * scale, 51.2 * scale))
    // pts.push(new THREE.Vector2(14.6 * scale, 5.0 * scale))
    
    // // 13. Curving into the inner floor
    // pts.push(new THREE.Vector2(12.0 * scale, 2.5 * scale))
    
    // // 14. Finishing at the bottom interior center (leaving a solid base floor)
    // pts.push(new THREE.Vector2(0, 2.0 * scale))

    return pts
  }, [])

  const liquidPoints = useMemo(() => {
    const pts = []
    // To prevent clipping/Z-fighting with the glass inner wall,
    // we make the liquid radius infinitesimally smaller (99.5%)
    const fit = 0.995 
    const scale = 0.05

    // Bottom center of fluid
    pts.push(new THREE.Vector2(0, 2.0 * scale))
    
    // Along the inner floor curve
    pts.push(new THREE.Vector2(12.0 * scale * fit, 2.5 * scale))
    pts.push(new THREE.Vector2(14.6 * scale * fit, 5.0 * scale))
    
    // Up the inner cylindrical wall
    pts.push(new THREE.Vector2(14.6 * scale * fit, 51.2 * scale)) // Liquid height wall
    pts.push(new THREE.Vector2(14.5 * scale, 56.0 * scale))
    
    // THE CUTOFF: Spin flat horizontally back to the center axis (X=0)
    pts.push(new THREE.Vector2(0, 54.0 * scale)) 

    return pts
  }, [])

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, -1, 0]} scale={[0.5,0.5,0.5]} renderOrder={2}>
        {/* <capsuleGeometry args={[0.78, 2.72, 12, 48]} /> */}
        <latheGeometry args={[points, 64]} />
        <meshPhysicalMaterial color="#b5651d"
        metalness={0.0}
        transmission={0.95}         // High transmission allows light to pass all the way through
        ior={1.52}
        thickness={0.2}       // Adjusts light refraction through the walls
        roughness={0.2}
        attenuationColor="#633200"  // Darker brownish-amber color for thick sections
        attenuationDistance={0.5}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        transparent  />
      </mesh>
      <mesh position={[0, -1, 0]} renderOrder={1}>
        <latheGeometry args={[liquidPoints, 64]} />
        <meshPhysicalMaterial 
          color="#22347d"         // Deep ruby red/orange liquid color tint
          roughness={0.0}          // Liquids have perfectly smooth surface speculars
          transparency={true}
          metalness={0.5}
          opacity={0.85}
        />
      </mesh>
      <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.058, 12, 64]} />
        <meshBasicMaterial color="#d8ff38" />
      </mesh>
    </group>
  )
}

function ProductModel() {
  const { scene } = useGLTF('/models/bottle18.glb')
  return <primitive object={scene} scale={1.5} />
}

class ModelErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

function RotatingProduct({ progress }) {
  const group = useRef()
  const { viewport } = useThree()
  const isMobile = viewport.width < 4.4
  useFrame((_, delta) => {
    if (!group.current) return
    // group.current.position.y=-0.6

    const p = progress.current // 0 to 1

    // Phase ranges: 0-20%, 20-90%, 90-100%
    const phase1 = THREE.MathUtils.clamp(p / 0.1, 0, 1)
    const phase2 = THREE.MathUtils.clamp((p - 0.1) / 0.9, 0, 1)
    const phase3 = THREE.MathUtils.clamp((p - 0.9) / 0.1, 0, 1)
    // const currentOpacity = THREE.MathUtils.clamp(p / 0.1, 0, 1)

    const minScale = isMobile ? viewport.width / 2 : viewport.width / 6
    const maxScale = isMobile ? viewport.width / 1.5 : viewport.width / 2.27
    const currentScale = minScale + (isMobile ? phase1 : phase2) * (maxScale - minScale);

    const sectionOneRotation = THREE.MathUtils.degToRad(90)

    // Peak rotation before reset (3π is half-turned, 4π brings it back front-facing)
    const baseTargetX = phase2 * Math.PI * (isMobile ? -1.5 : -1.2)
    const nearestFrontX = Math.PI * -2

    // 2. Interpolate X and Z back to 0
    let targetX = THREE.MathUtils.lerp(sectionOneRotation * baseTargetX, nearestFrontX, phase3)
    let targetZ = THREE.MathUtils.lerp(phase1 * sectionOneRotation, 0, 0)
    let targetPosX = isMobile ? 0 : THREE.MathUtils.lerp(phase1, 0, phase3)
    let targetPosY = isMobile ? THREE.MathUtils.lerp(1,(phase3 > 0 ? (phase3*2)-phase2 : -1),phase1) : THREE.MathUtils.lerp(-0.6, 0.6, phase3)

    // 3. Apply smooth damping
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 4.5, delta)
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, targetZ, 4.5, delta)
    
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetPosX, 4.5, delta)
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetPosY, 4.5, delta)

    // group.current.traverse((child) => {
    //   if (child.isMesh && child.material) {
    //     child.material.transparent = true; //
    //     child.material.opacity = currentOpacity; //
    //     // Optional: Helps prevent glitchy internal overlapping parts
    //     // child.material.depthWrite = currentOpacity === 1; 
    //   }
    // });

    group.current.scale.set(currentScale,currentScale,currentScale)
  })

  return (
    <group ref={group}>
      <Float speed={1.2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Suspense fallback={<ProductPlaceholder />}>
          <ModelErrorBoundary fallback={<ProductPlaceholder />}>
            <Center>
              <Resize height>
                <ProductModel />
              </Resize>
            </Center>
          </ModelErrorBoundary>
        </Suspense>
      </Float>
    </group>
  )
}

function Scene({ progress }) {
  return (
    <Canvas
      className="!fixed !inset-0 !z-0 !h-screen !w-screen pointer-events-none"
      camera={{ position: [0, 0.25, 6], fov: 45 }}
      dpr={[1, 1.7]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      shadows
    >
      <ambientLight intensity={0.01} />
      <directionalLight castShadow position={[3, 4, 4]} intensity={0.2} color="#fffbed" />
      <directionalLight position={[-4, 0, 2]} intensity={0.1} color="#8db3bd" />
      <RotatingProduct progress={progress} />
      <ContactShadows position={[0, -1.45, 0]} opacity={0.38} scale={4} blur={2.8} far={3} />
      <Environment preset="warehouse" environmentIntensity={0.5} />
    </Canvas>
  )
}

export default function App() {
  const progress = useRef(0)
  const { scrollYProgress } = useScroll()

  useEffect(() => {
    const lenis = new Lenis({ autoRaf: false, lerp: 0.085, smoothWheel: true })
    let frame
    const raf = (time) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    return scrollYProgress.on('change', (value) => {
      progress.current = value
    })
  }, [scrollYProgress])

  return (
    <main className="relative min-h-[300vh] overflow-hidden bg-ink text-mist">
      <Scene progress={progress} />
      <div className="grain fixed inset-0 z-[1] opacity-[0.08]" />

      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-8 sm:py-7 bg-black/80 backdrop-blur-sm">
        <a href="#top" className="font-display text-xl font-semibold tracking-[-0.06em] flex flex-row justify-center items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="35" viewBox="0 0 1254 1254" xml:space="preserve" height="35">
            <path fill="#ccc" d="M916.536 747.02c.096-6.38.193-12.759.27-19.99a373 373 0 0 0-.248-5.011c.095-1.41.19-2.82.263-5.073-.107-3.871-.193-6.899-.28-9.927.094-1.41.188-2.819.264-5.068-.1-3.537-.18-6.235-.26-8.932.098-6.64.28-13.279.28-19.918.012-48.74-.012-97.48-.044-147.122-.096-13.256-.173-25.608-.25-37.96.095-1.736.19-3.471.269-6.073-.104-10.22-.19-19.573-.277-28.927.093-1.41.185-2.82.26-5.087-.102-10.542-.185-20.228-.268-29.913.09-17.732.186-35.463.264-53.195.02-4.312-.021-8.624-.017-13.797.065-2.58.113-4.3.16-6.02.284-1.358.567-2.716.932-4.82.074-1.23.066-1.715.058-2.2.604-1.704 1.202-3.41 1.812-5.112 8.773-24.478 32.035-35.998 58.935-29.277 18.708 4.673 29.535 16.858 33.832 35.275.714 3.061.945 6.234 1.48 10.185.198 3.194.316 5.56.433 7.925-.087.457-.174.915-.247 2.158-.033 30.269-.117 59.753-.12 89.237-.016 119.594-.007 239.188-.008 358.783.006 1.517.012 3.034-.16 4.878a20 20 0 0 0-.595 2.226c-2.735 18.2-15.125 30.716-26.006 44.107a896960 896960 0 0 1-175.611 216.053c-19.446 23.916-39.055 47.7-58.37 71.72-10.574 13.149-24.313 18.358-40.783 18.29-49.66-.205-99.32-.214-148.98-.289-7.333-.011-14.665.076-21.997.05-15.2-.053-28.092-5.51-37.777-17.298-21.893-26.648-43.56-53.482-65.286-80.268-40.411-49.82-80.795-99.663-121.198-149.49-19.73-24.33-39.29-48.803-59.292-72.908-11.151-13.438-15.388-28.73-15.288-45.832.42-71.323.893-142.647.921-213.97.03-74.821-.572-149.643-.493-224.463.01-9.508.897-19.582 4.093-28.411 9.001-24.875 33.799-33.144 58.396-27.17 18.982 4.611 31.927 20.1 33.414 39.635.733 9.619.76 19.307.757 28.963-.043 128.151-.155 256.302-.211 384.453-.003 5.66.147 11.34.622 16.977.79 9.373 4.44 17.299 10.7 24.663 33.888 39.858 67.37 80.061 101.023 120.12 12.325 14.67 24.724 29.28 37.115 43.897 5.27 6.216 8.846 5.99 13.033-.981 20.33-33.848 40.564-67.753 60.907-101.591a19931 19931 0 0 1 50.14-82.972c7.136-11.739 23.832-11.442 31.136.539 11.098 18.205 22.073 36.487 33.044 54.77 25.885 43.14 51.727 86.304 77.613 129.444 3.89 6.483 7.54 6.807 12.322 1.114 44.798-53.327 89.54-106.702 134.404-159.975 6.255-7.428 12.979-14.475 14.176-24.69.543-4.625.67-9.299.975-14.782-.09-2.872-.169-4.911-.247-6.95a36 36 0 0 0 .271-3.093c-.098-2.83-.18-4.869-.261-6.908M590.5 1070.093c28.145.01 56.29.052 84.436-.014 3.644-.008 7.38-.16 10.911-.96 10.157-2.302 12.707-8.198 7.501-17.124-20.463-35.086-40.991-70.134-61.518-105.183-.955-1.631-2.125-3.136-3.553-5.222-1.322 2.008-2.277 3.33-3.102 4.73-12.254 20.796-24.534 41.577-36.717 62.416a4677 4677 0 0 0-25.473 44.116c-4.335 7.602-2.155 13.189 6.197 15.768 2.977.92 6.197 1.214 9.33 1.415 3.65.235 7.325.054 11.988.058"/>
            <path fill="#fff" d="M511.782 607.074a140 140 0 0 0-.293 4.885c.104 3.54.197 6.328.29 9.116-.092 1.705-.184 3.409-.256 5.927.113 2.545.207 4.277.302 6.01-.106.445-.211.89-.316 2.046.086 4.443.17 8.175.07 12.183.156.689.493 1.101.83 1.514.195-.585.39-1.17.719-2.082a271 271 0 0 1 3.299-5.538c9.797-17.536 19.647-35.044 29.378-52.617 10.06-18.17 20.066-36.37 29.94-54.642 1.464-2.709 2.074-5.88 3.137-9.636.088-2.467.143-4.132.145-5.798.114-121.33.227-242.66.32-363.99.004-5.819-.183-11.639-.28-17.459 1.186-7.518 1.447-15.331 3.73-22.5 6.998-21.964 25.023-34.262 48.044-33.773 22.082.468 39.161 13.752 45.915 36.357.915 4.796 1.708 8.85 2.5 12.906-.075 16.71-.15 33.422-.213 51.036-.028 101.618-.083 202.333-.091 303.047-.002 13.972.23 27.944.354 41.916-.092.465-.183.93-.19 1.983.308 1.087.532 1.584.756 2.082 4.076 7.962 7.967 16.027 12.261 23.87 17.28 31.562 34.682 63.056 52.053 94.567.302.547.77 1.003 2.362 1.477v-5.445c.011-85.987.01-171.975.039-257.962.018-55.659.073-111.318.124-166.977.014-15.446 3.958-29.514 15.904-40.06 15.394-13.589 33.277-15.35 51.945-8.56 17.69 6.435 26.56 20.363 29.35 38.448.707 4.584.792 9.298.792 13.952q.006 263.715-.093 527.429c-.002 5.658-.088 11.35-.686 16.967-.828 7.769-3.88 14.61-8.945 20.77-15.663 19.043-31.126 38.253-46.52 57.515-9.606 12.019-25.923 10.971-33.631-2.29-40.684-69.992-81.393-139.97-122.099-209.95-3.007-5.17-5.545-5.214-8.51-.099-40.605 70.043-81.213 140.085-121.774 210.153-7.455 12.879-24.021 14.164-33.387 2.58-15.922-19.693-31.943-39.305-47.937-58.939-6.79-8.336-8.777-18.178-8.767-28.549.083-87.488.226-174.976.343-262.464.123-91.987.198-183.974.386-275.961.037-18.008 5.17-33.698 20.74-44.753 22.905-16.264 68.598-10.722 76.28 31.135.15.817.3 1.634.59 3.201.335 2.463.527 4.175.719 5.887-.067.457-.135.914-.176 2.149.053 103.012.06 205.245.126 307.479.011 16.799.275 33.598.422 50.397-.098 1.72-.197 3.442-.275 5.96.104 8.898.19 17 .274 25.1"/>
          </svg>
          <span className="hidden sm:inline">white-glove-ward</span>
        </a>
        <div className="hidden items-center gap-8 sm:flex">
          <a className="eyebrow text-white/60 transition-colors hover:text-primary-500" href="#story">the story</a>
          <a className="eyebrow text-white/60 transition-colors hover:text-primary-500" href="#details">details</a>
        </div>
        <button className="eyebrow rounded-full border border-white/20 px-4 py-2 text-white transition-colors hover:border-primary-500 hover:text-primary-500">pre-order</button>
      </header>

      <div id="top" className="relative z-10">
        <section className="flex min-h-screen items-end px-5 mb-32 pb-10 sm:mb-85 sm:pb-16">
          <div className="w-full sm:flex sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-5 text-primary-500"><span className="uppercase">WGW01</span> / just.clean.</p>
              <h1 className="max-w-[12ch] font-display text-[clamp(3.7rem,11vw,9.5rem)] font-medium leading-[0.86] tracking-[-0.085em]">
                The new<br /><span className="text-white/35">way to</span><br />clean.
              </h1>
            </div>
            <div className="mt-8 max-w-[18rem] sm:mb-2 sm:mt-0">
              <p className="text-sm leading-relaxed text-white/60">Scroll to explore the sustainable and effecient to clean.</p>
              <motion.div className="mt-8 flex items-center gap-3 text-white/35"
                          animate={{
                            // Maps closely to a sine wave (0 -> max up -> 0 -> max down -> 0)
                            y: [0, -10, 0],
                          }}
                          transition={{
                            type:"tween",
                            duration: 1.5,          // Time for one full cycle
                            ease: "easeInOut",    // Smooth acceleration/deceleration at the peaks
                            repeat: Infinity,     // Loop forever
                          }}>
                <span className="h-px w-10 bg-primary-500" />
                <span className="eyebrow">Keep scrolling</span>
              </motion.div>
            </div>
          </div>
        </section>

        <div id="story">
          {sections.map((section) => (
            <section key={section.number} className={`flex min-h-screen py-34 justify-center sm:justify-start items-start ${section.align}`}>
              <div className={`p-8 sm:p-2 rounded-3xl flex w-full max-w-[25rem] flex-col justify-center sm:max-w-[31rem] bg-black/30 backdrop-blur-sm ${section.align}`}>
                <div className="mb-5 flex items-center gap-4 text-primary-500">
                  <span className="eyebrow">{section.number}</span>
                  <span className="h-px w-8 bg-primary-500/60" />
                  <span className="eyebrow">{section.kicker}</span>
                </div>
                <h2 className="whitespace-pre-line font-display text-[clamp(2.8rem,7vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.075em]">{section.title}</h2>
                <p className="mt-7 max-w-[20rem] text-sm leading-relaxed text-white/55">{section.copy}</p>
              </div>
            </section>
          ))}
        </div>

        <section id="details" className="flex min-h-screen items-end px-5 pb-12 sm:px-10">
          <div className="flex w-full flex-col justify-between gap-10 border-t border-white/15 pt-6 sm:flex-row sm:items-center">
            <div className="flex w-full justify-between sm:flex-row-reverse sm:justify-end sm:mr-8">
              <div className="min-w-min w-[60%]">
                <p className="eyebrow mb-4 text-primary-500 uppercase">WGW-01</p>
                <h2 className="font-display text-5xl tracking-[-0.07em] sm:text-7xl">Stay a while.</h2>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254" xml:space="preserve" className="inline sm:hidden md:inline min-w-[20%] w-[60%] max-w-[100px]">
                <path fill="#ccc" d="M916.536 747.02c.096-6.38.193-12.759.27-19.99a373 373 0 0 0-.248-5.011c.095-1.41.19-2.82.263-5.073-.107-3.871-.193-6.899-.28-9.927.094-1.41.188-2.819.264-5.068-.1-3.537-.18-6.235-.26-8.932.098-6.64.28-13.279.28-19.918.012-48.74-.012-97.48-.044-147.122-.096-13.256-.173-25.608-.25-37.96.095-1.736.19-3.471.269-6.073-.104-10.22-.19-19.573-.277-28.927.093-1.41.185-2.82.26-5.087-.102-10.542-.185-20.228-.268-29.913.09-17.732.186-35.463.264-53.195.02-4.312-.021-8.624-.017-13.797.065-2.58.113-4.3.16-6.02.284-1.358.567-2.716.932-4.82.074-1.23.066-1.715.058-2.2.604-1.704 1.202-3.41 1.812-5.112 8.773-24.478 32.035-35.998 58.935-29.277 18.708 4.673 29.535 16.858 33.832 35.275.714 3.061.945 6.234 1.48 10.185.198 3.194.316 5.56.433 7.925-.087.457-.174.915-.247 2.158-.033 30.269-.117 59.753-.12 89.237-.016 119.594-.007 239.188-.008 358.783.006 1.517.012 3.034-.16 4.878a20 20 0 0 0-.595 2.226c-2.735 18.2-15.125 30.716-26.006 44.107a896960 896960 0 0 1-175.611 216.053c-19.446 23.916-39.055 47.7-58.37 71.72-10.574 13.149-24.313 18.358-40.783 18.29-49.66-.205-99.32-.214-148.98-.289-7.333-.011-14.665.076-21.997.05-15.2-.053-28.092-5.51-37.777-17.298-21.893-26.648-43.56-53.482-65.286-80.268-40.411-49.82-80.795-99.663-121.198-149.49-19.73-24.33-39.29-48.803-59.292-72.908-11.151-13.438-15.388-28.73-15.288-45.832.42-71.323.893-142.647.921-213.97.03-74.821-.572-149.643-.493-224.463.01-9.508.897-19.582 4.093-28.411 9.001-24.875 33.799-33.144 58.396-27.17 18.982 4.611 31.927 20.1 33.414 39.635.733 9.619.76 19.307.757 28.963-.043 128.151-.155 256.302-.211 384.453-.003 5.66.147 11.34.622 16.977.79 9.373 4.44 17.299 10.7 24.663 33.888 39.858 67.37 80.061 101.023 120.12 12.325 14.67 24.724 29.28 37.115 43.897 5.27 6.216 8.846 5.99 13.033-.981 20.33-33.848 40.564-67.753 60.907-101.591a19931 19931 0 0 1 50.14-82.972c7.136-11.739 23.832-11.442 31.136.539 11.098 18.205 22.073 36.487 33.044 54.77 25.885 43.14 51.727 86.304 77.613 129.444 3.89 6.483 7.54 6.807 12.322 1.114 44.798-53.327 89.54-106.702 134.404-159.975 6.255-7.428 12.979-14.475 14.176-24.69.543-4.625.67-9.299.975-14.782-.09-2.872-.169-4.911-.247-6.95a36 36 0 0 0 .271-3.093c-.098-2.83-.18-4.869-.261-6.908M590.5 1070.093c28.145.01 56.29.052 84.436-.014 3.644-.008 7.38-.16 10.911-.96 10.157-2.302 12.707-8.198 7.501-17.124-20.463-35.086-40.991-70.134-61.518-105.183-.955-1.631-2.125-3.136-3.553-5.222-1.322 2.008-2.277 3.33-3.102 4.73-12.254 20.796-24.534 41.577-36.717 62.416a4677 4677 0 0 0-25.473 44.116c-4.335 7.602-2.155 13.189 6.197 15.768 2.977.92 6.197 1.214 9.33 1.415 3.65.235 7.325.054 11.988.058"/>
                <path fill="#fff" d="M511.782 607.074a140 140 0 0 0-.293 4.885c.104 3.54.197 6.328.29 9.116-.092 1.705-.184 3.409-.256 5.927.113 2.545.207 4.277.302 6.01-.106.445-.211.89-.316 2.046.086 4.443.17 8.175.07 12.183.156.689.493 1.101.83 1.514.195-.585.39-1.17.719-2.082a271 271 0 0 1 3.299-5.538c9.797-17.536 19.647-35.044 29.378-52.617 10.06-18.17 20.066-36.37 29.94-54.642 1.464-2.709 2.074-5.88 3.137-9.636.088-2.467.143-4.132.145-5.798.114-121.33.227-242.66.32-363.99.004-5.819-.183-11.639-.28-17.459 1.186-7.518 1.447-15.331 3.73-22.5 6.998-21.964 25.023-34.262 48.044-33.773 22.082.468 39.161 13.752 45.915 36.357.915 4.796 1.708 8.85 2.5 12.906-.075 16.71-.15 33.422-.213 51.036-.028 101.618-.083 202.333-.091 303.047-.002 13.972.23 27.944.354 41.916-.092.465-.183.93-.19 1.983.308 1.087.532 1.584.756 2.082 4.076 7.962 7.967 16.027 12.261 23.87 17.28 31.562 34.682 63.056 52.053 94.567.302.547.77 1.003 2.362 1.477v-5.445c.011-85.987.01-171.975.039-257.962.018-55.659.073-111.318.124-166.977.014-15.446 3.958-29.514 15.904-40.06 15.394-13.589 33.277-15.35 51.945-8.56 17.69 6.435 26.56 20.363 29.35 38.448.707 4.584.792 9.298.792 13.952q.006 263.715-.093 527.429c-.002 5.658-.088 11.35-.686 16.967-.828 7.769-3.88 14.61-8.945 20.77-15.663 19.043-31.126 38.253-46.52 57.515-9.606 12.019-25.923 10.971-33.631-2.29-40.684-69.992-81.393-139.97-122.099-209.95-3.007-5.17-5.545-5.214-8.51-.099-40.605 70.043-81.213 140.085-121.774 210.153-7.455 12.879-24.021 14.164-33.387 2.58-15.922-19.693-31.943-39.305-47.937-58.939-6.79-8.336-8.777-18.178-8.767-28.549.083-87.488.226-174.976.343-262.464.123-91.987.198-183.974.386-275.961.037-18.008 5.17-33.698 20.74-44.753 22.905-16.264 68.598-10.722 76.28 31.135.15.817.3 1.634.59 3.201.335 2.463.527 4.175.719 5.887-.067.457-.135.914-.176 2.149.053 103.012.06 205.245.126 307.479.011 16.799.275 33.598.422 50.397-.098 1.72-.197 3.442-.275 5.96.104 8.898.19 17 .274 25.1"/>
              </svg>
            </div>
            <div className="flex flex-col gap-2 w-full sm:gap-4 sm:min-w-[10%] sm:max-w-[50%] items-center">
              <p className='text-white/30 text-[0.5rem] mb-5'>* currently use plastic containers to safely receive and transfer ingredients on the commercial side.</p>
              <p className="text-xs leading-relaxed text-white/45">designed in rexburg. made for everywhere.</p>
              <button className="max-w-[250px] rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-105">get early access</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}