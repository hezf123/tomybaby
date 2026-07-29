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
    const z = (Math.random() - 0.5) * 3;
    
    const scale = 0.15;
    positions[i * 3] = x * scale * r + (Math.random() - 0.5) * 0.3;
    positions[i * 3 + 1] = y * scale * r + (Math.random() - 0.5) * 0.3;
    positions[i * 3 + 2] = z * r;
  }
  
  return positions;
}

// 创建爆炸效果 - 大幅度扩散
function createExplosionPoints(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.random() * 15 + 3;
    
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  
  return positions;
}

// 初始散落位置
function createScatterPoints(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  
  return positions;
}

export default function HeartExplosion({
  trigger,
  onComplete,
  particleCount = 300000,
}: HeartExplosionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 8;
    // 微微从下往上看心形
    camera.position.y = 0.5;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const geometry = new THREE.BufferGeometry();
    const scatterPositions = createScatterPoints(particleCount);
    const heartPositions = createHeartPoints(particleCount);
    const explosionPositions = createExplosionPoints(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // 初始散落在各处
      const posIdx = i * 3;
      scatterPositions[posIdx] = (Math.random() - 0.5) * 20;
      scatterPositions[posIdx + 1] = (Math.random() - 0.5) * 15;
      scatterPositions[posIdx + 2] = (Math.random() - 0.5) * 8;

      const hue = 0.75 + Math.random() * 0.1;
      const color = new THREE.Color().setHSL(hue % 1, 0.95, 0.35 + Math.random() * 0.3);
      colors[posIdx] = color.r;
      colors[posIdx + 1] = color.g;
      colors[posIdx + 2] = color.b;

      sizes[i] = Math.random() * 0.1 + 0.05;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(scatterPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // 创建发光粒子纹理
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.15, 'rgba(255,255,255,0.9)');
    gradient.addColorStop(0.4, 'rgba(255,200,255,0.5)');
    gradient.addColorStop(0.7, 'rgba(180,100,255,0.15)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: texture,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 动画阶段: scatter -> gather -> hold(3s) -> explode -> fade
    let startTime: number | null = null;
    let holdStartTime: number | null = null;
    const GATHER_DURATION = 1.5;
    const HOLD_DURATION = 3.0;
    const EXPLODE_DURATION = 1.0;
    const FADE_DURATION = 0.8;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;

      const positions = particles.geometry.attributes.position.array as Float32Array;
      
      if (elapsed < GATHER_DURATION) {
        // Phase 1: 散落粒子聚合为心形
        const progress = elapsed / GATHER_DURATION;
        const ease = 1 - Math.pow(1 - progress, 3);
        for (let i = 0; i < particleCount * 3; i++) {
          positions[i] = scatterPositions[i] * (1 - ease) + heartPositions[i] * ease;
        }
        particles.rotation.y = elapsed * 0.5;
        material.opacity = Math.min(1, elapsed / 0.3);
        material.size = 0.15;
      } else if (elapsed < GATHER_DURATION + HOLD_DURATION) {
        // Phase 2: 保持心形 3 秒
        if (!holdStartTime) holdStartTime = timestamp;
        const holdElapsed = (timestamp - holdStartTime) / 1000;
        
        for (let i = 0; i < particleCount * 3; i++) {
          positions[i] = heartPositions[i];
        }
        // 轻微呼吸效果
        const breathe = 1 + Math.sin(holdElapsed * 2) * 0.03;
        particles.scale.setScalar(breathe);
        // 缓慢旋转展示
        particles.rotation.y = holdElapsed * 0.15;
        material.size = 0.15;
        material.opacity = 1;
      } else if (elapsed < GATHER_DURATION + HOLD_DURATION + EXPLODE_DURATION) {
        // Phase 3: 爆炸!
        const explodeElapsed = elapsed - GATHER_DURATION - HOLD_DURATION;
        const progress = explodeElapsed / EXPLODE_DURATION;
        const ease = progress * progress * progress; // easeInCubic - 越炸越快
        
        for (let i = 0; i < particleCount * 3; i++) {
          positions[i] = heartPositions[i] * (1 - ease) + explosionPositions[i] * ease;
        }
        // 爆炸时粒子变大、旋转加速、相机震动
        material.size = 0.15 + progress * 0.3;
        particles.rotation.y += 0.08;
        particles.rotation.x += 0.04;
        // 相机震动
        const shake = progress < 0.5 ? progress * 2 * 0.3 : (1 - progress) * 0.3;
        camera.position.x = Math.sin(elapsed * 30) * shake;
        camera.position.y = 0.5 + Math.cos(elapsed * 25) * shake;
        camera.lookAt(0, 0, 0);
      } else {
        // Phase 4: 淡出
        const fadeElapsed = elapsed - GATHER_DURATION - HOLD_DURATION - EXPLODE_DURATION;
        const fadeProgress = fadeElapsed / FADE_DURATION;
        material.opacity = Math.max(0, 1 - fadeProgress);
        particles.rotation.y += 0.02;
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
      texture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [particleCount]);

  useEffect(() => {
    if (trigger) {
      setIsVisible(true);
      // 总时长: 聚合1.5s + 保持3s + 爆炸1s + 淡出0.8s = 6.3s
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ zIndex: 50 }}
    />
  );
}
