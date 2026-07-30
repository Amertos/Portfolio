import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export interface SceneSetupResult {
  animate: (time: number, mouseX: number, mouseY: number, clickedAt: number) => void;
  cleanup?: () => void;
  /** If provided, this composer's render() is used instead of renderer.render() */
  composer?: {
    render: () => void;
    setSize: (w: number, h: number) => void;
    dispose: () => void;
  };
}

export type SceneSetupFn = (
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  size: { width: number; height: number },
  renderer: THREE.WebGLRenderer
) => SceneSetupResult;

interface ThreeDCanvasProps {
  sceneSetup: SceneSetupFn;
  className?: string;
  style?: React.CSSProperties;
}

export default function ThreeDCanvas({ sceneSetup, className = '', style }: ThreeDCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const clickedRef = useRef(0);
  const animRef = useRef<SceneSetupResult | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 6;

    // ── Detect device capability ──
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isSmallScreen = width < 600;
    // Desktop can push higher DPR for crisp rendering; mobile caps lower for battery/heat.
    const dpr = isMobile || isSmallScreen
      ? Math.min(window.devicePixelRatio, 2)
      : Math.min(window.devicePixelRatio, 2.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // Setup scene
    const result = sceneSetup(scene, camera, { width, height }, renderer);
    animRef.current = result;

    // Mouse tracking
    const handleMouse = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
      };
    };
    container.addEventListener('mousemove', handleMouse);

    // Click tracking
    const handleClick = () => {
      clickedRef.current = performance.now();
    };
    container.addEventListener('click', handleClick);

    // Resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
          result.composer?.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation loop
    let animationId: number;
    const animate = (time: number) => {
      animationId = requestAnimationFrame(animate);
      if (animRef.current) {
        animRef.current.animate(time, mouseRef.current.x, mouseRef.current.y, clickedRef.current);
      }
      if (result.composer) {
        result.composer.render();
      } else {
        renderer.render(scene, camera);
      }
    };
    animationId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('mousemove', handleMouse);
      container.removeEventListener('click', handleClick);
      resizeObserver.disconnect();
      result.cleanup?.();
      result.composer?.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, [sceneSetup]);

  return <div ref={containerRef} className={className} style={style} />;
}
