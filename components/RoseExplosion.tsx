'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface RoseExplosionProps {
  trigger: boolean;
  onComplete?: () => void;
  particleCount?: number;
}

// ==================== 玫瑰花纹理生成 ====================
function createPetalTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // 绘制花瓣形状（水滴形 + 渐变）
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 200, 220, 0.95)');
  gradient.addColorStop(0.7, 'rgba(255, 80, 130, 0.7)');
  gradient.addColorStop(1, 'rgba(180, 20, 60, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  // 花瓣形状：上尖下圆
  ctx.moveTo(64, 8);
  ctx.bezierCurveTo(100, 30, 110, 80, 64, 120);
  ctx.bezierCurveTo(18, 80, 28, 30, 64, 8);
  ctx.closePath();
  ctx.fill();

  // 添加高光
  const highlight = ctx.createRadialGradient(50, 40, 0, 50, 40, 30);
  highlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = highlight;
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ==================== 玫瑰花光点纹理 ====================
function createGlowTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 180, 200, 0.9)');
  gradient.addColorStop(0.5, 'rgba(255, 80, 130, 0.4)');
  gradient.addColorStop(1, 'rgba(255, 0, 80, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(32, 32, 32, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ==================== 生成玫瑰花形状坐标 ====================
// 使用 3D 玫瑰曲线方程生成多层花瓣
function createRosePositions(
  count: number,
  petalCount: number = 6,
  scale: number = 1,
  layerOffset: [number, number, number] = [0, 0, 0]
): { positions: Float32Array; petalIndices: Float32Array; layers: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const petalIndices = new Float32Array(count);
  const layers = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // 分层：外层大花瓣，内层小花瓣
    const layer = Math.floor(Math.random() * 3); // 0, 1, 2 三层
    const layerScale = 1 - layer * 0.25; // 外层最大
    const layerRadius = scale * layerScale;

    // 玫瑰曲线：r = a * cos(k * θ)
    const theta = Math.random() * Math.PI * 2;
    const k = petalCount / 2;
    const r = Math.abs(Math.cos(k * theta)) * layerRadius;

    // 转换为笛卡尔坐标，添加 3D 深度
    const x = r * Math.cos(theta) + (Math.random() - 0.5) * 0.15;
    const y = r * Math.sin(theta) + (Math.random() - 0.5) * 0.15;
    // z 方向：中心凸起，边缘平坦（形成立体花朵）
    const distFromCenter = Math.sqrt(x * x + y * y) / layerRadius;
    const z = (1 - distFromCenter) * 0.5 * layerScale + (Math.random() - 0.5) * 0.1;

    positions[i * 3] = x + layerOffset[0];
    positions[i * 3 + 1] = y + layerOffset[1];
    positions[i * 3 + 2] = z + layerOffset[2];

    petalIndices[i] = Math.floor(theta / (Math.PI * 2 / petalCount));
    layers[i] = layer;

    // 颜色：外层深红，内层浅粉
    const colorMix = layer / 2; // 0 = 外层, 1 = 内层
    // 深红 (180, 20, 60) → 粉红 (255, 150, 180) → 白 (255, 240, 245)
    if (layer === 0) {
      // 外层：深红到玫瑰红
      colors[i * 3] = 0.9 + Math.random() * 0.1;
      colors[i * 3 + 1] = 0.1 + Math.random() * 0.15;
      colors[i * 3 + 2] = 0.3 + Math.random() * 0.1;
    } else if (layer === 1) {
      // 中层：玫瑰红到粉红
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.4 + Math.random() * 0.2;
      colors[i * 3 + 2] = 0.5 + Math.random() * 0.15;
    } else {
      // 内层：粉红到近白
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.8 + Math.random() * 0.15;
      colors[i * 3 + 2] = 0.85 + Math.random() * 0.15;
    }
  }

  return { positions, petalIndices, layers, colors };
}

// ==================== 主组件 ====================
export default function RoseExplosion({ trigger, onComplete, particleCount = 4000 }: RoseExplosionProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef(trigger);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    triggerRef.current = trigger;
    if (trigger) {
      setIsVisible(true);
    }
  }, [trigger]);

  useEffect(() => {
    if (!isVisible) return;
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // ===== 移动端自适应 =====
    const isMobile = width < 768;
    const aspect = width / height;
    const isPortrait = aspect < 1;

    // 粒子数量：移动端减半
    const adjustedParticleCount = isMobile
      ? Math.min(particleCount, 1800)
      : particleCount;

    // ====== 根据屏幕比例精确控制场景大小 ======
    // PerspectiveCamera fov=60, 半高视场 = tan(30°) ≈ 0.577
    // 在 cameraZ 距离下，屏幕可见高度 = 2 * cameraZ * tan(fov/2)
    const FOV = 60;
    const TAN_HALF_FOV = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

    // 安全系数：主花占据可见区域的比例（留出 40% 余量）
    const SAFE_RATIO = 0.6;

    // 先算主花尺度，再反推相机距离（更精确）
    // 竖屏：以"宽度"为约束；横屏：以"高度"为约束
    let cameraZ: number;
    let mainScale: number;
    if (isPortrait) {
      // 竖屏：宽度紧张 → 用宽度约束
      mainScale = 1.6; // 主花scale 1.6 对应直径≈1.6*2.3≈3.7
      // 所需可见宽度 = (mainScale * 2.3) / SAFE_RATIO
      // cameraZ 与 可见宽 关系：visibleWidth = 2 * Z * tan(fov/2) * aspect
      const needVisibleWidth = (mainScale * 2.3) / SAFE_RATIO;
      cameraZ = needVisibleWidth / (2 * TAN_HALF_FOV * aspect);
    } else {
      // 横屏：高度紧张 → 用高度约束
      mainScale = 2.5;
      const needVisibleHeight = (mainScale * 2.3) / SAFE_RATIO;
      cameraZ = needVisibleHeight / (2 * TAN_HALF_FOV);
    }
    const gatherFromZ = cameraZ + 2; // 聚合起始在更远 2 单位

    // 粒子大小：基于相机距离微调（距离越远，粒子稍微调大保持可见）
    const baseSize = isPortrait ? 0.26 * (cameraZ / 7.5) : 0.25 * (cameraZ / 6);
    const subSize = isPortrait ? 0.22 * (cameraZ / 7.5) : 0.2 * (cameraZ / 6);
    const sparkleSize = isPortrait ? 0.10 * (cameraZ / 7.5) : 0.08 * (cameraZ / 6);

    // 副花位置和大小：竖屏只放 2 朵，纵向近一点，全部往内靠
    const subRoseConfigs = isPortrait
      ? [
          // 竖屏手机：2 朵副花，上下分布，偏移更小
          { offset: [0, 2.0 * (cameraZ / 7.5), -1] as [number, number, number], scale: 0.75, petals: 5 },
          { offset: [-1.1 * (cameraZ / 7.5), -1.8 * (cameraZ / 7.5), -0.5] as [number, number, number], scale: 0.65, petals: 6 },
          { offset: [1.1 * (cameraZ / 7.5), -1.8 * (cameraZ / 7.5), -0.5] as [number, number, number], scale: 0.65, petals: 6 },
        ]
      : [
          // 横屏：原来的分布
          { offset: [-3, 1.5, -1] as [number, number, number], scale: 1.2, petals: 5 },
          { offset: [3, 1.5, -1] as [number, number, number], scale: 1.2, petals: 5 },
          { offset: [-2.5, -2, -0.5] as [number, number, number], scale: 1.0, petals: 6 },
          { offset: [2.5, -2, -0.5] as [number, number, number], scale: 1.0, petals: 6 },
          { offset: [0, 3, -1.5] as [number, number, number], scale: 0.9, petals: 4 },
        ];

    // DPR：移动端限制为 1.25（避免过高DPR导致性能崩溃）
    const targetDPR = isMobile ? Math.min(window.devicePixelRatio, 1.25) : Math.min(window.devicePixelRatio, 2);

    // 背景光点数量：移动端减少
    const sparkleCount = isMobile ? 400 : 800;

    // ===== 场景初始化 =====
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a0010, 0.05);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 0, cameraZ);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile, // 移动端关闭抗锯齿，性能优先
      powerPreference: isMobile ? 'default' : 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(targetDPR);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ===== 纹理 =====
    const petalTexture = createPetalTexture();
    const glowTexture = createGlowTexture();

    // ===== 创建多朵玫瑰花 =====
    const roses: THREE.Points[] = [];
    const roseData: {
      points: THREE.Points;
      originalPositions: Float32Array;
      velocities: Float32Array;
      rotations: Float32Array;
      rotationSpeeds: Float32Array;
      center: [number, number, number];
    }[] = [];

    // 主玫瑰花（中心，大）
    const mainRoseRatio = 0.5; // 50% 粒子给主花
    const mainRoseCount = Math.floor(adjustedParticleCount * mainRoseRatio);
    const mainRose = createRosePositions(mainRoseCount, 6, mainScale, [0, 0, 0]);
    const mainGeometry = new THREE.BufferGeometry();
    mainGeometry.setAttribute('position', new THREE.BufferAttribute(mainRose.positions, 3));
    mainGeometry.setAttribute('color', new THREE.BufferAttribute(mainRose.colors, 3));

    const mainMaterial = new THREE.PointsMaterial({
      size: baseSize,
      map: petalTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const mainPoints = new THREE.Points(mainGeometry, mainMaterial);
    scene.add(mainPoints);

    // 副玫瑰花（周围，小）—— 根据屏幕比例自适应位置
    subRoseConfigs.forEach((config) => {
      // 剩余粒子平均分给副花
      const subCount = Math.floor((adjustedParticleCount - mainRoseCount) / subRoseConfigs.length);
      const subRose = createRosePositions(subCount, config.petals, config.scale, config.offset);
      const subGeo = new THREE.BufferGeometry();
      subGeo.setAttribute('position', new THREE.BufferAttribute(subRose.positions, 3));
      subGeo.setAttribute('color', new THREE.BufferAttribute(subRose.colors, 3));

      const subMat = new THREE.PointsMaterial({
        size: subSize,
        map: petalTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });

      const subPoints = new THREE.Points(subGeo, subMat);
      scene.add(subPoints);
      roses.push(subPoints);

      // 存储爆炸速度（竖屏手机减慢，避免飞出屏幕）
      const speedScale = isPortrait ? 0.55 : 1.0;
      const velocities = new Float32Array(subCount * 3);
      const rotations = new Float32Array(subCount);
      const rotationSpeeds = new Float32Array(subCount);
      for (let i = 0; i < subCount; i++) {
        const dx = subRose.positions[i * 3] - config.offset[0];
        const dy = subRose.positions[i * 3 + 1] - config.offset[1];
        const dz = subRose.positions[i * 3 + 2] - config.offset[2];
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        const speed = (0.02 + Math.random() * 0.05) * speedScale;
        velocities[i * 3] = (dx / len) * speed + (Math.random() - 0.5) * 0.03 * speedScale;
        velocities[i * 3 + 1] = (dy / len) * speed + (Math.random() - 0.5) * 0.03 * speedScale;
        velocities[i * 3 + 2] = (dz / len) * speed + (Math.random() - 0.5) * 0.03 * speedScale;
        rotations[i] = Math.random() * Math.PI * 2;
        rotationSpeeds[i] = (Math.random() - 0.5) * 0.1 * speedScale;
      }

      roseData.push({
        points: subPoints,
        originalPositions: subRose.positions,
        velocities,
        rotations,
        rotationSpeeds,
        center: config.offset,
      });
    });

    // 主玫瑰花爆炸数据（竖屏手机减慢，防止飞出）
    const mainSpeedScale = isPortrait ? 0.55 : 1.0;
    const mainVelocities = new Float32Array(mainRoseCount * 3);
    const mainRotations = new Float32Array(mainRoseCount);
    const mainRotationSpeeds = new Float32Array(mainRoseCount);
    for (let i = 0; i < mainRoseCount; i++) {
      const dx = mainRose.positions[i * 3];
      const dy = mainRose.positions[i * 3 + 1];
      const dz = mainRose.positions[i * 3 + 2];
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      const speed = (0.03 + Math.random() * 0.06) * mainSpeedScale;
      mainVelocities[i * 3] = (dx / len) * speed + (Math.random() - 0.5) * 0.04 * mainSpeedScale;
      mainVelocities[i * 3 + 1] = (dy / len) * speed + (Math.random() - 0.5) * 0.04 * mainSpeedScale;
      mainVelocities[i * 3 + 2] = (dz / len) * speed + (Math.random() - 0.5) * 0.04 * mainSpeedScale;
      mainRotations[i] = Math.random() * Math.PI * 2;
      mainRotationSpeeds[i] = (Math.random() - 0.5) * 0.15 * mainSpeedScale;
    }
    roseData.unshift({
      points: mainPoints,
      originalPositions: mainRose.positions,
      velocities: mainVelocities,
      rotations: mainRotations,
      rotationSpeeds: mainRotationSpeeds,
      center: [0, 0, 0],
    });

    // ===== 背景光点粒子 =====
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePositions = new Float32Array(sparkleCount * 3);
    const sparkleColors = new Float32Array(sparkleCount * 3);
    const sparkleVelocities = new Float32Array(sparkleCount * 3);

    for (let i = 0; i < sparkleCount; i++) {
      sparklePositions[i * 3] = (Math.random() - 0.5) * 20;
      sparklePositions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      sparklePositions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;

      const colorChoice = Math.random();
      if (colorChoice < 0.4) {
        // 金色光点
        sparkleColors[i * 3] = 1.0;
        sparkleColors[i * 3 + 1] = 0.85;
        sparkleColors[i * 3 + 2] = 0.4;
      } else if (colorChoice < 0.7) {
        // 粉色光点
        sparkleColors[i * 3] = 1.0;
        sparkleColors[i * 3 + 1] = 0.5;
        sparkleColors[i * 3 + 2] = 0.7;
      } else {
        // 白色光点
        sparkleColors[i * 3] = 1.0;
        sparkleColors[i * 3 + 1] = 0.95;
        sparkleColors[i * 3 + 2] = 1.0;
      }

      sparkleVelocities[i * 3] = (Math.random() - 0.5) * 0.01;
      sparkleVelocities[i * 3 + 1] = Math.random() * 0.02 + 0.005;
      sparkleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
    sparkleGeo.setAttribute('color', new THREE.BufferAttribute(sparkleColors, 3));

    const sparkleMat = new THREE.PointsMaterial({
      size: sparkleSize,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
    scene.add(sparkles);

    // ===== 动画状态机 =====
    type Phase = 'gather' | 'hold' | 'explode' | 'fade';
    let phase: Phase = 'gather';
    let phaseStartTime = performance.now();
    const GATHER_DURATION = 1200;
    const HOLD_DURATION = 2500;
    const EXPLODE_DURATION = 1500;
    const FADE_DURATION = 1000;

    // 聚合阶段的起始位置（随机散布在远处，随屏幕比例调整）
    const scatterW = isPortrait ? 18 : 25;
    const scatterH = isPortrait ? 30 : 20;
    const startPositions = roseData.map(rd => {
      const sp = new Float32Array(rd.originalPositions.length);
      for (let i = 0; i < sp.length; i += 3) {
        sp[i] = (Math.random() - 0.5) * scatterW;
        sp[i + 1] = (Math.random() - 0.5) * scatterH;
        sp[i + 2] = (Math.random() - 0.5) * 15 - 3;
      }
      return sp;
    });

    let frameId: number;
    let cameraShake = 0;

    const animate = () => {
      const now = performance.now();
      const elapsed = now - phaseStartTime;

      // ===== 阶段切换 =====
      if (phase === 'gather' && elapsed >= GATHER_DURATION) {
        phase = 'hold';
        phaseStartTime = now;
      } else if (phase === 'hold' && elapsed >= HOLD_DURATION) {
        phase = 'explode';
        phaseStartTime = now;
        cameraShake = 0.3;
      } else if (phase === 'explode' && elapsed >= EXPLODE_DURATION) {
        phase = 'fade';
        phaseStartTime = now;
      } else if (phase === 'fade' && elapsed >= FADE_DURATION) {
        if (onComplete) onComplete();
        setIsVisible(false);
        return; // 停止动画
      }

      // ===== 各阶段动画 =====
      roseData.forEach((rd, roseIdx) => {
        const positions = rd.points.geometry.attributes.position.array as Float32Array;
        const count = positions.length / 3;

        if (phase === 'gather') {
          // 聚合：从远处飞向玫瑰花形状
          const t = Math.min(elapsed / GATHER_DURATION, 1);
          const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
          const sp = startPositions[roseIdx];

          for (let i = 0; i < count; i++) {
            positions[i * 3] = sp[i * 3] + (rd.originalPositions[i * 3] - sp[i * 3]) * eased;
            positions[i * 3 + 1] = sp[i * 3 + 1] + (rd.originalPositions[i * 3 + 1] - sp[i * 3 + 1]) * eased;
            positions[i * 3 + 2] = sp[i * 3 + 2] + (rd.originalPositions[i * 3 + 2] - sp[i * 3 + 2]) * eased;
          }

          // 逐渐显现
          (rd.points.material as THREE.PointsMaterial).opacity = eased * 0.95;
        } else if (phase === 'hold') {
          // 保持：呼吸 + 旋转
          const breath = 1 + Math.sin(elapsed * 0.003) * 0.05;
          for (let i = 0; i < count; i++) {
            const ox = rd.originalPositions[i * 3] - rd.center[0];
            const oy = rd.originalPositions[i * 3 + 1] - rd.center[1];
            const oz = rd.originalPositions[i * 3 + 2] - rd.center[2];
            positions[i * 3] = ox * breath + rd.center[0];
            positions[i * 3 + 1] = oy * breath + rd.center[1];
            positions[i * 3 + 2] = oz * breath + rd.center[2];
          }
          // 整体旋转
          rd.points.rotation.z += 0.003;
          rd.points.rotation.y = Math.sin(elapsed * 0.001) * 0.15;
        } else if (phase === 'explode') {
          // 爆炸：花瓣飞散
          const t = elapsed / EXPLODE_DURATION;
          const speed = 1 + t * 2; // 加速

          for (let i = 0; i < count; i++) {
            positions[i * 3] += rd.velocities[i * 3] * speed;
            positions[i * 3 + 1] += rd.velocities[i * 3 + 1] * speed;
            // 重力效果（花瓣下落）
            positions[i * 3 + 1] -= 0.008 * t;
            positions[i * 3 + 2] += rd.velocities[i * 3 + 2] * speed;
          }
          rd.points.rotation.z += 0.01;
        } else if (phase === 'fade') {
          // 淡出
          const t = elapsed / FADE_DURATION;
          const opacity = Math.max(0, 1 - t);
          (rd.points.material as THREE.PointsMaterial).opacity = opacity * 0.95;

          // 继续飘落
          for (let i = 0; i < count; i++) {
            positions[i * 3] += rd.velocities[i * 3] * 0.5;
            positions[i * 3 + 1] += rd.velocities[i * 3 + 1] * 0.5 - 0.015;
            positions[i * 3 + 2] += rd.velocities[i * 3 + 2] * 0.5;
          }
        }

        rd.points.geometry.attributes.position.needsUpdate = true;
      });

      // ===== 背景光点动画 =====
      const sparklePos = sparkles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < sparkleCount; i++) {
        sparklePos[i * 3] += sparkleVelocities[i * 3];
        sparklePos[i * 3 + 1] += sparkleVelocities[i * 3 + 1];
        sparklePos[i * 3 + 2] += sparkleVelocities[i * 3 + 2];

        // 循环
        if (sparklePos[i * 3 + 1] > 10) {
          sparklePos[i * 3 + 1] = -10;
          sparklePos[i * 3] = (Math.random() - 0.5) * 20;
        }
      }
      sparkles.geometry.attributes.position.needsUpdate = true;

      // 光点闪烁
      sparkleMat.opacity = 0.5 + Math.sin(now * 0.003) * 0.3;

      // ===== 相机震动（爆炸时） =====
      if (cameraShake > 0) {
        camera.position.x = (Math.random() - 0.5) * cameraShake;
        camera.position.y = (Math.random() - 0.5) * cameraShake;
        cameraShake *= 0.92;
      } else {
        camera.position.x = 0;
        camera.position.y = 0;
      }

      // 相机缓慢推进（根据屏幕比例自适应距离）
      if (phase === 'gather') {
        const t = elapsed / GATHER_DURATION;
        camera.position.z = gatherFromZ - t * (gatherFromZ - cameraZ);
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    // ===== 窗口大小响应 =====
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ===== 清理 =====
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Points) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        }
      });
      petalTexture.dispose();
      glowTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [isVisible, particleCount, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    />
  );
}
