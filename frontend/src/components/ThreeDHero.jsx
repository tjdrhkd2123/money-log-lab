import React, { useRef, useEffect, useState } from 'react';
import rogiMascotUrl from '../assets/rogi_mascot.png';

export default function ThreeDHero() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [threeLoaded, setThreeLoaded] = useState(false);

  useEffect(() => {
    // Check if Three.js is loaded from script tag
    const checkThree = () => {
      if (window.THREE) {
        setThreeLoaded(true);
      } else {
        setTimeout(checkThree, 100);
      }
    };
    checkThree();
  }, []);

  useEffect(() => {
    if (!threeLoaded) return;

    const THREE = window.THREE;
    let width = containerRef.current.clientWidth || 400;
    let height = containerRef.current.clientHeight || 400;

    // 1. Create Scene
    const scene = new THREE.Scene();

    // 2. Create Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    // 3. Create Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true // Transparent background to blend with CSS gradient
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Key Light (Warm Champagne Gold)
    const keyLight = new THREE.DirectionalLight(0xc5a880, 2.0);
    keyLight.position.set(5, 5, 4);
    scene.add(keyLight);

    // Fill Light (Soft White)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-5, 3, 2);
    scene.add(fillLight);

    // Top Rim Light
    const topLight = new THREE.DirectionalLight(0xfff8ee, 1.2);
    topLight.position.set(0, 8, 0);
    scene.add(topLight);

    // 5. Build Procedural 3D Glass Acorn Group
    const acornGroup = new THREE.Group();

    // Body curve points
    const bodyPoints = [];
    bodyPoints.push(new THREE.Vector2(0, -1.1));
    bodyPoints.push(new THREE.Vector2(0.35, -1.0));
    bodyPoints.push(new THREE.Vector2(0.68, -0.7));
    bodyPoints.push(new THREE.Vector2(0.85, -0.2));
    bodyPoints.push(new THREE.Vector2(0.9, 0.25));
    bodyPoints.push(new THREE.Vector2(0.85, 0.45));
    bodyPoints.push(new THREE.Vector2(0, 0.45));
    const bodyGeom = new THREE.LatheGeometry(bodyPoints, 32);

    // Cap curve points
    const capPoints = [];
    capPoints.push(new THREE.Vector2(0.86, 0.44));
    capPoints.push(new THREE.Vector2(0.92, 0.55));
    capPoints.push(new THREE.Vector2(0.86, 0.72));
    capPoints.push(new THREE.Vector2(0.62, 0.92));
    capPoints.push(new THREE.Vector2(0.3, 1.02));
    capPoints.push(new THREE.Vector2(0, 1.02));
    const capGeom = new THREE.LatheGeometry(capPoints, 32);

    // Stem cylinder
    const stemGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.35, 12);
    stemGeom.translate(0, 1.15, 0);

    // Premium Matte Gold Glass Materials
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0xc5a880,
      roughness: 0.12,
      metalness: 0.95,
      transparent: true,
      opacity: 0.26,
      side: THREE.DoubleSide,
      emissive: 0xc5a880,
      emissiveIntensity: 0.15
    });

    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0x9b7e56,
      roughness: 0.35,
      metalness: 0.85,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      emissive: 0x9b7e56,
      emissiveIntensity: 0.08
    });

    const stemMaterial = new THREE.MeshStandardMaterial({
      color: 0x4d3829,
      roughness: 0.7,
      metalness: 0.3
    });

    const bodyMesh = new THREE.Mesh(bodyGeom, glassMaterial);
    const capMesh = new THREE.Mesh(capGeom, capMaterial);
    const stemMesh = new THREE.Mesh(stemGeom, stemMaterial);

    acornGroup.add(bodyMesh);
    acornGroup.add(capMesh);
    acornGroup.add(stemMesh);
    
    // Scale up the acorn a bit
    acornGroup.scale.set(1.4, 1.4, 1.4);
    scene.add(acornGroup);

    // 6. Build Inner Rogi Mascot
    const textureLoader = new THREE.TextureLoader();
    const rogiTexture = textureLoader.load(rogiMascotUrl);
    
    // Use high-fidelity texture filtering
    rogiTexture.minFilter = THREE.LinearFilter;
    rogiTexture.magFilter = THREE.LinearFilter;

    const rogiMaterial = new THREE.MeshBasicMaterial({
      map: rogiTexture,
      transparent: true,
      side: THREE.DoubleSide
    });

    // Make Rogi fit inside the transparent acorn body
    const rogiGeom = new THREE.PlaneGeometry(1.3, 1.3);
    const rogiMesh = new THREE.Mesh(rogiGeom, rogiMaterial);
    rogiMesh.position.set(0, -0.15, 0);
    scene.add(rogiMesh);

    // 7. Mouse Tracker variables
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (event) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      targetMouseX = (x / rect.width) * 2 - 1;
      targetMouseY = -(y / rect.height) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 8. Animation loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      // Smooth mouse tracking interpolation
      mouseX += (targetMouseX - mouseX) * 0.07;
      mouseY += (targetMouseY - mouseY) * 0.07;

      // Rotate outer 3D acorn container (tilt towards mouse + auto spin)
      acornGroup.rotation.y = time * 0.25 + mouseX * 0.7;
      acornGroup.rotation.x = mouseY * 0.4;
      acornGroup.position.y = Math.sin(time * 0.9) * 0.06;

      // Animate inner Rogi mascot (floating parallax effect)
      rogiMesh.position.y = -0.15 + Math.sin(time * 1.4) * 0.12;
      rogiMesh.position.x = mouseX * 0.28; // slide offset in opposition/sync
      
      // Make Rogi always face the screen camera (Billboard effect)
      rogiMesh.quaternion.copy(camera.quaternion);
      
      // Playful roll animation
      rogiMesh.rotateZ(Math.cos(time * 0.8) * 0.06 - mouseX * 0.15);

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer) renderer.dispose();
    };
  }, [threeLoaded]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '420px', 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        cursor: 'grab'
      }}
    >
      {!threeLoaded && (
        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-headers)' }}>
          로기가 3D 도토리 연구실을 조립하는 중... 🛠️
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          display: threeLoaded ? 'block' : 'none',
          outline: 'none'
        }} 
      />
    </div>
  );
}
