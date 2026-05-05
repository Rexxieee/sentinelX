'use client';

import React, { useEffect, useState, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, QuadraticBezierLine, Sphere, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useAlertStore } from '../store/useAlertStore';

const GLOBE_RADIUS = 2;
// Lekki, Lagos, Nigeria
const OUR_NETWORK_LAT = 6.4698;
const OUR_NETWORK_LON = 3.5852;

// Texture URLs from official Three.js examples
const TEXTURES = {
  day: '/earth_day_tiny.png'
};

function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

interface ActiveArc {
  id: string;
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
  midPoint: THREE.Vector3;
  timestamp: number;
}

const Arc = ({ arc }: { arc: ActiveArc }) => {
  const lineRef = useRef<any>(null);
  const [opacity, setOpacity] = useState(1);

  useFrame(() => {
    if (lineRef.current) {
      const age = Date.now() - arc.timestamp;
      if (age > 2000) {
        setOpacity(Math.max(0, 1 - (age - 2000) / 1000));
      }
      
      const material = lineRef.current.material;
      if (material) {
        material.opacity = opacity;
        material.transparent = true;
        material.blending = THREE.AdditiveBlending;
        material.depthWrite = false;
        material.needsUpdate = true;
      }
    }
  });

  if (opacity <= 0) return null;

  return (
    <QuadraticBezierLine
      ref={lineRef}
      start={[arc.start.x, arc.start.y, arc.start.z]}
      end={[arc.end.x, arc.end.y, arc.end.z]}
      mid={[arc.midPoint.x, arc.midPoint.y, arc.midPoint.z]}
      color={arc.color}
      lineWidth={2}
      transparent
      opacity={opacity}
    />
  );
};

const HighFidelityPointGlobe = ({ radius }: { radius: number }) => {
  const [positions, setPositions] = useState<Float32Array | null>(null);
  const [colors, setColors] = useState<Float32Array | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = TEXTURES.day;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 512;
      canvas.height = 256;
      ctx.drawImage(img, 0, 0, 512, 256);
      const data = ctx.getImageData(0, 0, 512, 256).data;

      const pos = [];
      const cols = [];
      const numPoints = 25000;

      for (let i = 0; i < numPoints; i++) {
        const phi = Math.acos(-1 + (2 * i) / numPoints);
        const theta = Math.sqrt(numPoints * Math.PI) * phi;
        
        const lat = 90 - (phi * 180) / Math.PI;
        const lon = (theta * 180) / Math.PI % 360;

        // Sample texture
        const x_tex = Math.floor(((lon + 180) % 360) / 360 * 512);
        const y_tex = Math.floor((90 - lat) / 180 * 256);
        const pixelIdx = (y_tex * 512 + x_tex) * 4;
        const brightness = data[pixelIdx]; // Blue channel or gray

        if (brightness > 60) { // On land
          const x = radius * Math.cos(theta) * Math.sin(phi);
          const y = radius * Math.sin(theta) * Math.sin(phi);
          const z = radius * Math.cos(phi);
          pos.push(x, y, z);
          
          // Color based on brightness for a "realistic" depth look
          const c = brightness / 255;
          cols.push(c * 0.2, c * 0.6, c * 1.0); // Cyan-ish depth
        }
      }
      setPositions(new Float32Array(pos));
      setColors(new Float32Array(cols));
    };
  }, [radius]);

  if (!positions) return null;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors!.length / 3}
          array={colors!}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.02} 
        vertexColors 
        transparent 
        opacity={0.8} 
        blending={THREE.AdditiveBlending} 
        sizeAttenuation 
      />
    </points>
  );
};

export default function ThreatGlobe() {
  const alerts = useAlertStore((state) => state.alerts);
  const [activeArcs, setActiveArcs] = useState<ActiveArc[]>([]);
  const lastSeenAlertRef = useRef<string | null>(null);

  useEffect(() => {
    if (alerts.length === 0) return;

    const newestAlert = alerts[0];
    const alertId = `${newestAlert.details.timestamp}-${newestAlert.details.source_ip}`;

    if (alertId !== lastSeenAlertRef.current && newestAlert.details.source_geo) {
      lastSeenAlertRef.current = alertId;

      const { lat, lon } = newestAlert.details.source_geo;
      const start = latLongToVector3(lat, lon, GLOBE_RADIUS);
      const end = latLongToVector3(OUR_NETWORK_LAT, OUR_NETWORK_LON, GLOBE_RADIUS);

      const midPoint = start.clone().lerp(end, 0.5).normalize().multiplyScalar(GLOBE_RADIUS * 1.6);
      const color = newestAlert.severity.toLowerCase() === 'high' ? '#ef4444' : '#3b82f6';

      const newArc: ActiveArc = {
        id: alertId + '-' + Date.now(),
        start,
        end,
        midPoint,
        color,
        timestamp: Date.now()
      };

      setActiveArcs((prev) => [...prev, newArc]);
      setTimeout(() => {
        setActiveArcs((prev) => prev.filter(a => a.id !== newArc.id));
      }, 3000);
    }
  }, [alerts]);

  const networkPos = latLongToVector3(OUR_NETWORK_LAT, OUR_NETWORK_LON, GLOBE_RADIUS);

  return (
    <div className="w-full h-full bg-[#030712] border border-slate-800 rounded-xl shadow-2xl relative overflow-hidden group">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-xl font-semibold text-white tracking-tight">Global Threat Intelligence</h3>
        <p className="text-xs text-slate-400 font-medium tracking-wide">HIGH-FIDELITY VECTOR MAPPING</p>
      </div>

      <div className="absolute bottom-6 right-6 z-10 pointer-events-none text-right">
        <div className="text-[10px] font-mono text-slate-500 space-y-1 bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-white/5">
          <p>STATION: LAGOS_NODE_01</p>
          <p>UPLINK: SECURE</p>
        </div>
      </div>

      <Suspense fallback={
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#030712] gap-4">
          <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-blue-400 text-[10px] font-mono animate-pulse">BOOTING GLOBAL VIEW...</p>
        </div>
      }>
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 45 }} 
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
          }}
        >
          <color attach="background" args={['#030712']} />
          <Stars radius={200} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ambientLight intensity={1.0} />
          
          <HighFidelityPointGlobe radius={GLOBE_RADIUS} />

          {/* Oceanic Shell */}
          <Sphere args={[GLOBE_RADIUS * 0.98, 32, 32]}>
            <meshBasicMaterial color="#001a33" transparent opacity={0.5} />
          </Sphere>

          {/* Network Target Marker */}
          <group position={[networkPos.x, networkPos.y, networkPos.z]}>
            <Sphere args={[0.04, 12, 12]}>
              <meshBasicMaterial color="#ef4444" />
            </Sphere>
          </group>

          {activeArcs.map((arc) => (
            <Arc key={arc.id} arc={arc} />
          ))}

          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={8}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
