'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const GRID_SIZE = 12
const GRID_SPACING = 1.4
const NODE_COUNT = GRID_SIZE * GRID_SIZE

export default function BackgroundScene() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, 0, 14)

    // --- Grid nodes (flat plane of spheres) ---
    const nodePositions: THREE.Vector3[] = []
    const nodeMeshes: THREE.Mesh[] = []
    const nodeGeo = new THREE.SphereGeometry(0.06, 8, 8)

    const offset = ((GRID_SIZE - 1) * GRID_SPACING) / 2

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const x = col * GRID_SPACING - offset
        const y = row * GRID_SPACING - offset
        const z = 0
        const pos = new THREE.Vector3(x, y, z)
        nodePositions.push(pos)

        const color = new THREE.Color()
        const t = (row * GRID_SIZE + col) / NODE_COUNT
        if (t < 0.33) color.set(0x00fff5)        // cyan
        else if (t < 0.66) color.set(0xbf00ff)   // purple
        else color.set(0x39ff14)                  // green

        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 })
        const mesh = new THREE.Mesh(nodeGeo, mat)
        mesh.position.copy(pos)
        scene.add(mesh)
        nodeMeshes.push(mesh)
      }
    }

    // --- Grid edges (horizontal + vertical lines) ---
    const edgeLineMat = new THREE.LineBasicMaterial({
      color: 0x00fff5,
      transparent: true,
      opacity: 0.12,
    })

    function makeGridLine(a: THREE.Vector3, b: THREE.Vector3) {
      const geo = new THREE.BufferGeometry().setFromPoints([a, b])
      return new THREE.Line(geo, edgeLineMat)
    }

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const idx = row * GRID_SIZE + col
        if (col < GRID_SIZE - 1) scene.add(makeGridLine(nodePositions[idx], nodePositions[idx + 1]))
        if (row < GRID_SIZE - 1) scene.add(makeGridLine(nodePositions[idx], nodePositions[idx + GRID_SIZE]))
      }
    }

    // --- Floating pulse: animated "signal" traveling along random edges ---
    const PULSE_COUNT = 8
    interface Pulse {
      mesh: THREE.Mesh
      from: THREE.Vector3
      to: THREE.Vector3
      t: number
      speed: number
      color: THREE.Color
    }
    const pulses: Pulse[] = []
    const pulseGeo = new THREE.SphereGeometry(0.1, 8, 8)

    function pickRandomEdge(): [THREE.Vector3, THREE.Vector3] {
      const horiz = Math.random() > 0.5
      if (horiz) {
        const row = Math.floor(Math.random() * GRID_SIZE)
        const col = Math.floor(Math.random() * (GRID_SIZE - 1))
        const idx = row * GRID_SIZE + col
        return [nodePositions[idx].clone(), nodePositions[idx + 1].clone()]
      } else {
        const row = Math.floor(Math.random() * (GRID_SIZE - 1))
        const col = Math.floor(Math.random() * GRID_SIZE)
        const idx = row * GRID_SIZE + col
        return [nodePositions[idx].clone(), nodePositions[idx + GRID_SIZE].clone()]
      }
    }

    const pulseColors = [0x00fff5, 0xbf00ff, 0x39ff14, 0xff6b35]
    for (let i = 0; i < PULSE_COUNT; i++) {
      const [from, to] = pickRandomEdge()
      const color = new THREE.Color(pulseColors[i % pulseColors.length])
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 })
      const mesh = new THREE.Mesh(pulseGeo, mat)
      mesh.position.copy(from)
      scene.add(mesh)
      pulses.push({ mesh, from, to, t: Math.random(), speed: 0.008 + Math.random() * 0.012, color })
    }

    // --- Diagonal accent lines (depth illusion) ---
    const accentMat = new THREE.LineBasicMaterial({
      color: 0xbf00ff,
      transparent: true,
      opacity: 0.07,
    })
    for (let i = 0; i < GRID_SIZE - 1; i++) {
      for (let j = 0; j < GRID_SIZE - 1; j++) {
        const idx = i * GRID_SIZE + j
        const geo = new THREE.BufferGeometry().setFromPoints([
          nodePositions[idx],
          nodePositions[idx + GRID_SIZE + 1],
        ])
        scene.add(new THREE.Line(geo, accentMat))
      }
    }

    // --- Mouse parallax ---
    const mouse = { x: 0, y: 0 }
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // --- Animation ---
    let frameId = 0
    let elapsed = 0
    let lastTime = performance.now()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const now = performance.now()
      const delta = (now - lastTime) / 1000
      lastTime = now
      elapsed += delta

      // Gentle wave on node Z positions
      nodeMeshes.forEach((mesh, i) => {
        const row = Math.floor(i / GRID_SIZE)
        const col = i % GRID_SIZE
        mesh.position.z = Math.sin(elapsed * 0.6 + row * 0.5 + col * 0.4) * 0.35
        ;(mesh.material as THREE.MeshBasicMaterial).opacity =
          0.4 + 0.3 * Math.sin(elapsed * 0.8 + i * 0.2)
      })

      // Pulse travel
      pulses.forEach((p) => {
        p.t += p.speed
        if (p.t >= 1) {
          p.t = 0
          const [from, to] = pickRandomEdge()
          p.from = from
          p.to = to
        }
        p.mesh.position.lerpVectors(p.from, p.to, p.t)
        // Pulse Z follows wave
        const col = Math.round((p.mesh.position.x + offset) / GRID_SPACING)
        const row = Math.round((p.mesh.position.y + offset) / GRID_SPACING)
        p.mesh.position.z =
          Math.sin(elapsed * 0.6 + row * 0.5 + col * 0.4) * 0.35 + 0.15
        const scale = 0.8 + 0.4 * Math.sin(elapsed * 4 + p.t * Math.PI * 2)
        p.mesh.scale.setScalar(scale)
      })

      // Camera parallax
      camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.05
      camera.position.y += (mouse.y * 0.8 - camera.position.y) * 0.05
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      nodeGeo.dispose()
      pulseGeo.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  )
}
