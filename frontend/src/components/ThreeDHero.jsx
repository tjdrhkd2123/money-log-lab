import React, { useRef, useEffect, useState } from 'react';
import rogiMascotUrl from '../assets/rogi_mascot.png';

export default function ThreeDHero({ onWhiteboardClick }) {
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Key Light (Warm Champagne Gold)
    const keyLight = new THREE.DirectionalLight(0xc5a880, 2.2);
    keyLight.position.set(5, 5, 4);
    scene.add(keyLight);

    // Fill Light (Soft White)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.9);
    fillLight.position.set(-5, 3, 2);
    scene.add(fillLight);

    // Top Rim Light
    const topLight = new THREE.DirectionalLight(0xfff8ee, 1.5);
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
      emissiveIntensity: 0.15,
      depthWrite: false // Fix transparency sorting
    });

    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0x9b7e56,
      roughness: 0.35,
      metalness: 0.85,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      emissive: 0x9b7e56,
      emissiveIntensity: 0.08,
      depthWrite: false // Fix transparency sorting
    });

    const stemMaterial = new THREE.MeshStandardMaterial({
      color: 0x4d3829,
      roughness: 0.7,
      metalness: 0.3
    });

    const bodyMesh = new THREE.Mesh(bodyGeom, glassMaterial);
    bodyMesh.renderOrder = 2; // Render after Rogi

    const capMesh = new THREE.Mesh(capGeom, capMaterial);
    capMesh.renderOrder = 2; // Render after Rogi

    const stemMesh = new THREE.Mesh(stemGeom, stemMaterial);

    acornGroup.add(bodyMesh);
    acornGroup.add(capMesh);
    acornGroup.add(stemMesh);
    
    // Scale up the acorn a bit
    acornGroup.scale.set(1.4, 1.4, 1.4);
    scene.add(acornGroup);

    // 6. Build Laboratory Floor (Circular Platform)
    const floorGeom = new THREE.CircleGeometry(0.55, 32);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f242d, // Deep warm charcoal laboratory floor
      roughness: 0.85,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const floorMesh = new THREE.Mesh(floorGeom, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.65;
    acornGroup.add(floorMesh);

    // 7. Build Interactive Whiteboard
    const wbCanvas = document.createElement('canvas');
    wbCanvas.width = 256;
    wbCanvas.height = 128;
    const wbCtx = wbCanvas.getContext('2d');
    wbCtx.fillStyle = '#f8fafc'; // White board
    wbCtx.fillRect(0, 0, 256, 128);

    // Whiteboard border
    wbCtx.strokeStyle = '#c5a880'; // Gold border
    wbCtx.lineWidth = 14;
    wbCtx.strokeRect(0, 0, 256, 128);

    // Board text
    wbCtx.fillStyle = '#0a0b0d';
    wbCtx.font = 'bold 36px "Outfit", sans-serif';
    wbCtx.textAlign = 'center';
    wbCtx.textBaseline = 'middle';
    wbCtx.fillText('NEWS 📰', 128, 64);

    const wbTexture = new THREE.CanvasTexture(wbCanvas);
    const wbMaterial = new THREE.MeshStandardMaterial({
      map: wbTexture,
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.DoubleSide,
      emissive: 0x000000,
      emissiveIntensity: 0
    });

    const wbGeom = new THREE.PlaneGeometry(0.65, 0.325);
    const wbMesh = new THREE.Mesh(wbGeom, wbMaterial);
    wbMesh.position.set(0.12, -0.3, -0.25); // Position inside the room
    wbMesh.rotation.y = -0.12; // Rotate slightly
    wbMesh.renderOrder = 1;
    acornGroup.add(wbMesh);

    const clickables = [wbMesh]; // Objects clickable by Raycaster

    // 8. Build Inner Rogi Mascot (White Background Removed dynamically)
    const rogiMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide
    });

    const img = new Image();
    img.src = rogiMascotUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Chroma keying: remove white background pixels
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) {
          data[i+3] = 0; // Alpha transparent
        }
      }
      ctx.putImageData(imgData, 0, 0);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      rogiMaterial.map = texture;
      rogiMaterial.needsUpdate = true;
    };

    const rogiGeom = new THREE.PlaneGeometry(1.2, 1.2);
    const rogiMesh = new THREE.Mesh(rogiGeom, rogiMaterial);
    rogiMesh.position.set(0, -0.32, 0.1); // Stand on the laboratory floor
    rogiMesh.renderOrder = 1; // Render before glass
    acornGroup.add(rogiMesh);

    // 9. Mouse Tracker & Raycaster variables
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    const checkIntersection = (x, y) => {
      mouseVec.set(x, y);
      raycaster.setFromCamera(mouseVec, camera);
      // Raycast objects inside the group (need to check their world coordinates)
      const intersects = raycaster.intersectObjects(clickables);
      return intersects.length > 0 ? intersects[0] : null;
    };

    const handleMouseMove = (event) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      targetMouseX = (x / rect.width) * 2 - 1;
      targetMouseY = -(y / rect.height) * 2 + 1;

      // Check hover for cursor & whiteboard glow feedback
      const hit = checkIntersection(targetMouseX, targetMouseY);
      if (hit) {
        canvasRef.current.style.cursor = 'pointer';
        wbMesh.material.emissive.setHex(0xc5a880); // Gold glow
        wbMesh.material.emissiveIntensity = 0.45;
      } else {
        canvasRef.current.style.cursor = 'grab';
        wbMesh.material.emissive.setHex(0x000000);
        wbMesh.material.emissiveIntensity = 0;
      }
    };

    const handleCanvasClick = () => {
      const hit = checkIntersection(targetMouseX, targetMouseY);
      if (hit) {
        // Trigger news view redirection callback
        if (onWhiteboardClick) {
          onWhiteboardClick();
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvasRef.current.addEventListener('click', handleCanvasClick);

    // 10. Animation Pacing variables
    let animationFrameId;
    let clock = new THREE.Clock();
    let rogiX = 0;
    let rogiDirection = 1; // 1 = right, -1 = left
    const rogiSpeed = 0.0055;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      // Smooth mouse tracking interpolation
      mouseX += (targetMouseX - mouseX) * 0.07;
      mouseY += (targetMouseY - mouseY) * 0.07;

      // Rotate outer 3D acorn container (tilt towards mouse + auto spin)
      acornGroup.rotation.y = time * 0.18 + mouseX * 0.6;
      acornGroup.rotation.x = mouseY * 0.35;
      acornGroup.position.y = Math.sin(time * 0.8) * 0.05;

      // Pacing walking logic inside the laboratory
      rogiX += rogiSpeed * rogiDirection;
      if (rogiX > 0.32) {
        rogiX = 0.32;
        rogiDirection = -1;
      } else if (rogiX < -0.32) {
        rogiX = -0.32;
        rogiDirection = 1;
      }

      rogiMesh.position.x = rogiX;
      
      // Flip scale dynamically depending on walking direction
      rogiMesh.scale.x = rogiDirection * 1.15;
      
      // Walking bobbing / wobble bounce
      rogiMesh.position.y = -0.32 + Math.abs(Math.sin(time * 8.5)) * 0.05;
      rogiMesh.rotation.z = Math.sin(time * 8.5) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // 11. Resize handler
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
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('click', handleCanvasClick);
      }
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
        justifyContent: 'center'
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
