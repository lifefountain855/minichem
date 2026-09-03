import { Component, Suspense, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Float, useGLTF, Center, Resize } from '@react-three/drei'
import { useScroll } from 'motion/react'
import * as THREE from 'three'
import Lenis from 'lenis'

const sections = [
  {
    number: '01',
    kicker: 'A new kind of quiet',
    title: 'Hear the room\ndifferently.',
    copy: 'A sculptural speaker designed to disappear into the moment — then bring every detail forward.',
    align: 'items-start text-left',
  },
  {
    number: '02',
    kicker: 'Engineered feeling',
    title: 'Small footprint.\nFull presence.',
    copy: 'Precision-tuned drivers and a sealed acoustic chamber create a generous soundstage from an unexpectedly compact form.',
    align: 'items-end text-right',
  },
  {
    number: '03',
    kicker: 'Make it yours',
    title: 'Sound, in\nyour colour.',
    copy: 'Four considered finishes. One unmistakable silhouette. Meet the object that belongs in your space.',
    align: 'items-start text-left',
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
  useFrame((_, delta) => {
    if (!group.current) return

    const p = progress.current // 0 to 1

    // Phase ranges: 0-20%, 20-90%, 90-100%
    const phase1 = THREE.MathUtils.clamp(p / 0.2, 0, 1)
    const phase2 = THREE.MathUtils.clamp((p - 0.2) / 0.7, 0, 1)
    const phase3 = THREE.MathUtils.clamp((p - 0.9) / 0.1, 0, 1)
    const currentOpacity = THREE.MathUtils.clamp(p / 0.2, 0, 1)

    const minScale = 1;
    const maxScale = 3;
    const currentScale = minScale + phase2 * (maxScale - minScale);

    const sectionOneRotation = THREE.MathUtils.degToRad(90)

    // Peak rotation before reset (3π is half-turned, 4π brings it back front-facing)
    const baseTargetX = phase2 * Math.PI * -1
    const nearestFrontX = Math.PI * -2

    // 2. Interpolate X and Z back to 0
    let targetX = THREE.MathUtils.lerp(sectionOneRotation * baseTargetX, nearestFrontX, phase3)
    let targetZ = THREE.MathUtils.lerp(phase1 * sectionOneRotation, 0, 0)

    // 3. Apply smooth damping
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 4.5, delta)
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, targetZ, 4.5, delta)
    
    group.current.traverse((child) => {
      if (child.isMesh && child.material) {
        // child.material.transparent = true; //
        child.material.opacity = currentOpacity; //
        
        // Optional: Helps prevent glitchy internal overlapping parts
        // child.material.depthWrite = currentOpacity === 1; 
      }
    });

    group.current.scale.set(currentScale,currentScale,currentScale)
  })

  return (
    <group ref={group} scale={5}>
      <Float speed={1.2} rotationIntensity={0} floatIntensity={0.18}>
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
      camera={{ position: [0, 0.25, 5.2], fov: 34 }}
      dpr={[1, 1.7]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      shadows
    >
      <ambientLight intensity={0.5} />
      <directionalLight castShadow position={[3, 4, 4]} intensity={3.2} color="#fffbed" />
      <directionalLight position={[-4, 0, 2]} intensity={2.1} color="#8db3bd" />
      <RotatingProduct progress={progress} />
      <ContactShadows position={[0, -1.45, 0]} opacity={0.38} scale={4} blur={2.8} far={3} />
      <Environment preset="sunset" />
    </Canvas>
  )
}

function App() {
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

      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-8 sm:py-7">
        <a href="#top" className="font-display text-xl font-semibold tracking-[-0.06em]">orbit<span className="text-primary-500">.</span></a>
        <div className="hidden items-center gap-8 sm:flex">
          <a className="eyebrow text-white/60 transition-colors hover:text-primary-500" href="#story">the story</a>
          <a className="eyebrow text-white/60 transition-colors hover:text-primary-500" href="#details">details</a>
        </div>
        <button className="eyebrow rounded-full border border-white/20 px-4 py-2 text-white transition-colors hover:border-primary-500 hover:text-primary-500">Pre-order</button>
      </header>

      <div id="top" className="relative z-10">
        <section className="flex min-h-screen items-end px-5 pb-14 sm:px-10 sm:pb-16">
          <div className="w-full sm:flex sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-5 text-primary-500">WGW01 / just.clean.</p>
              <h1 className="max-w-[12ch] font-display text-[clamp(3.7rem,11vw,9.5rem)] font-medium leading-[0.86] tracking-[-0.085em]">
                The new<br /><span className="text-white/35">way to</span><br />clean.
              </h1>
            </div>
            <div className="mt-8 max-w-[18rem] sm:mb-2 sm:mt-0">
              <p className="text-sm leading-relaxed text-white/60">Scroll to explore a speaker made for the space between silence and everything else.</p>
              <div className="mt-8 flex items-center gap-3 text-white/35">
                <span className="h-px w-10 bg-primary-500" />
                <span className="eyebrow">Keep scrolling</span>
              </div>
            </div>
          </div>
        </section>

        <div id="story">
          {sections.map((section) => (
            <section key={section.number} className={`flex min-h-screen px-5 py-24 sm:px-10 ${section.align}`}>
              <div className="flex w-full max-w-[25rem] flex-col justify-center sm:max-w-[31rem]">
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
          <div className="flex w-full flex-col justify-between gap-10 border-t border-white/15 pt-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow mb-4 text-primary-500">OR-01</p>
              <h2 className="font-display text-5xl tracking-[-0.07em] sm:text-7xl">Stay a while.</h2>
            </div>
            <div className="flex items-end justify-between gap-10 sm:gap-20">
              <p className="max-w-[12rem] text-xs leading-relaxed text-white/45">Designed in Copenhagen.<br />Tuned for everywhere.</p>
              <button className="rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-105">Get early access</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
