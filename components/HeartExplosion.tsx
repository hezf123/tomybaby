'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface HeartExplosionProps {
  trigger: boolean;
  onComplete?: () => void;
  particleCount?: number;
}

// 创建心形形状的3D坐标点
function createHeartPoints(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    const r = Math.pow(Math.random(), 0.5);
    
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const z = (Math.random() - 0.5) * 4;
    
    const scale = 0.15;
    positions[i * 3] = x * scale * r + (Math.random() - 0.5) * 0.5;
    positions[i * 3 + 1] = y * scale * r + (Math.random() - 0.5) * 0.5;
    positions[i * 3 + 2] = z * r;
  }
  
  return positions;
}

// 创建爆炸效果的位置
function createExplosionPoints(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.random() * 8 + 2;
    
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  
  return positions;
}

export default function HeartExplosion({
  trigger,
  onComplete,
  particleCount = 2000,
}: HeartExplosionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isExploding, setIsExploding] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 8;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const geometry = new THREE.BufferGeometry();
    const initialPositions = new Float32Array(particleCount * 3);
    const targetPositions = createHeartPoints(particleCount);
    const explosionPositions = createExplosionPoints(particleCount);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * 0.5;
      initialPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      initialPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      initialPositions[i * 3 + 2] = r * Math.cos(phi);

      const hue = 0.9 + Math.random() * 0.2;
      const color = new THREE.Color().setHSL(hue % 1, 0.8, 0.6 + Math.random() * 0.2);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: texture,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    let startTime: number | null = null;
    let currentPhase: 'idle' | 'heart' | 'explode' | 'heartAgain' | 'fade' = 'idle';

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;

      const positions = particles.geometry.attributes.position.array as Float32Array;
      const phaseDuration = {
        idle: 0.5,
        heart: 2.0,
        explode: 1.5,
        heartAgain: 3.0,
        fade: 0.5,
      };

      if (currentPhase === 'idle' && elapsed > phaseDuration.idle) {
        currentPhase = 'heart';
      } else if (currentPhase === 'heart' && elapsed > phaseDuration.idle + phaseDuration.heart) {
        currentPhase = 'explode';
      } else if (currentPhase === 'explode' && elapsed > phaseDuration.idle + phaseDuration.heart + phaseDuration.explode) {
        currentPhase = 'heartAgain';
        startTime = timestamp;
      } else if (currentPhase === 'heartAgain' && elapsed > phaseDuration.heartAgain) {
        currentPhase = 'fade';
      }

      if (currentPhase === 'idle') {
        // 保持紧凑
      } else if (currentPhase === 'heart') {
        const progress = Math.min(1, (elapsed - phaseDuration.idle) / phaseDuration.heart);
        const ease = 1 - Math.pow(1 - progress, 3);
        for (let i = 0; i < particleCount * 3; i++) {
          positions[i] = initialPositions[i] * (1 - ease) + targetPositions[i] * ease;
        }
        particles.rotation.y = elapsed * 0.3;
      } else if (currentPhase === 'explode') {
        const progress = Math.min(1, (elapsed - phaseDuration.heart) / phaseDuration.explode);
        const ease = progress * progress;
        for (let i = 0; i < particleCount * 3; i++) {
          positions[i] = targetPositions[i] * (1 - ease) + explosionPositions[i] * ease;
        }
        particles.rotation.y += 0.05;
      } else if (currentPhase === 'heartAgain') {
        const progress = Math.min(1, elapsed / phaseDuration.heartAgain);
        const ease = 1 - Math.pow(1 - progress, 3);
        for (let i = 0; i < particleCount * 3; i++) {
          positions[i] = explosionPositions[i] * (1 - ease) + targetPositions[i] * ease;
        }
        particles.rotation.y += 0.01;
      } else if (currentPhase === 'fade') {
        const progress = Math.min(1, (elapsed - phaseDuration.heartAgain) / phaseDuration.fade);
        material.opacity = 1 - progress;
      }

      particles.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [particleCount]);

  useEffect(() => {
    if (trigger) {
      setIsExploding(true);
      const timer = setTimeout(() => {
        setIsExploding(false);
        onComplete?.();
      }, 7500);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${
        isExploding ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ zIndex: 50 }}
    />
  );
}
