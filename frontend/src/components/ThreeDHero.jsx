import React, { useRef, useEffect, useState } from 'react';

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

    // 8. Build Inner 3D Rogi Mascot
    const create3DRogi = () => {
      const rogiGroup = new THREE.Group();

      // Materials
      const brownMat = new THREE.MeshStandardMaterial({
        color: 0xc07a43, // Squirrel chestnut brown
        roughness: 0.8,
        metalness: 0.1
      });
      const creamMat = new THREE.MeshStandardMaterial({
        color: 0xf3e5ab, // Soft cream belly/cheeks
        roughness: 0.8,
        metalness: 0.1
      });
      const darkMat = new THREE.MeshStandardMaterial({
        color: 0x222222, // Eyes/nose
        roughness: 0.5,
        metalness: 0.1
      });

      // 1. Body
      const bodyGeom = new THREE.SphereGeometry(0.22, 16, 16);
      const bodyMesh = new THREE.Mesh(bodyGeom, brownMat);
      bodyMesh.scale.set(1, 1.35, 0.95);
      bodyMesh.position.y = 0.28;
      rogiGroup.add(bodyMesh);

      // Belly patch (cream sphere squashed)
      const bellyGeom = new THREE.SphereGeometry(0.15, 12, 12);
      const bellyMesh = new THREE.Mesh(bellyGeom, creamMat);
      bellyMesh.scale.set(0.9, 1.1, 0.5);
      bellyMesh.position.set(0, 0.26, 0.14);
      rogiGroup.add(bellyMesh);

      // 2. Head
      const headGeom = new THREE.SphereGeometry(0.18, 16, 16);
      const headMesh = new THREE.Mesh(headGeom, brownMat);
      headMesh.position.set(0, 0.55, 0.02);
      rogiGroup.add(headMesh);

      // Cheeks (cream spheres)
      const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), creamMat);
      cheekL.position.set(-0.05, 0.51, 0.13);
      rogiGroup.add(cheekL);
      const cheekR = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), creamMat);
      cheekR.position.set(0.05, 0.51, 0.13);
      rogiGroup.add(cheekR);

      // Snout/Nose
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), darkMat);
      nose.position.set(0, 0.54, 0.18);
      rogiGroup.add(nose);

      // Eyes
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), darkMat);
      eyeL.position.set(-0.08, 0.58, 0.12);
      rogiGroup.add(eyeL);
      const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), darkMat);
      eyeR.position.set(0.08, 0.58, 0.12);
      rogiGroup.add(eyeR);

      // Ears (outer)
      const earGeom = new THREE.ConeGeometry(0.045, 0.12, 4);
      earGeom.translate(0, 0.06, 0);

      const earL = new THREE.Mesh(earGeom, brownMat);
      earL.position.set(-0.11, 0.68, 0.02);
      earL.rotation.z = 0.22;
      rogiGroup.add(earL);

      const earR = new THREE.Mesh(earGeom, brownMat);
      earR.position.set(0.11, 0.68, 0.02);
      earR.rotation.z = -0.22;
      rogiGroup.add(earR);

      // 3. Bushy Tail (Curved chain of spheres)
      const tailGroup = new THREE.Group();
      tailGroup.position.set(0, 0.15, -0.15);
      
      const tailSpheres = [
        { r: 0.08, pos: [0, 0.06, -0.05] },
        { r: 0.12, pos: [0, 0.18, -0.12] },
        { r: 0.15, pos: [0, 0.32, -0.16] },
        { r: 0.13, pos: [0, 0.42, -0.12] },
        { r: 0.09, pos: [0, 0.46, -0.02] }
      ];

      tailSpheres.forEach(spec => {
        const sMesh = new THREE.Mesh(new THREE.SphereGeometry(spec.r, 12, 12), brownMat);
        sMesh.position.set(...spec.pos);
        tailGroup.add(sMesh);
      });
      rogiGroup.add(tailGroup);

      // 4. Arms (holding an acorn!)
      const armGeom = new THREE.CylinderGeometry(0.03, 0.02, 0.18, 8);
      armGeom.translate(0, -0.09, 0);

      const armL = new THREE.Mesh(armGeom, brownMat);
      armL.position.set(-0.16, 0.38, 0.05);
      armL.rotation.z = 0.45;
      armL.rotation.x = 0.6;
      rogiGroup.add(armL);

      const armR = new THREE.Mesh(armGeom, brownMat);
      armR.position.set(0.16, 0.38, 0.05);
      armR.rotation.z = -0.45;
      armR.rotation.x = 0.6;
      rogiGroup.add(armR);

      // Small 3D acorn held by Rogi!
      const heldAcorn = new THREE.Group();
      heldAcorn.position.set(0, 0.32, 0.18);
      heldAcorn.scale.set(0.15, 0.15, 0.15);
      
      const haBody = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshStandardMaterial({ color: 0xb45309 }));
      haBody.scale.set(1, 1.2, 1);
      const haCap = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8, 0, Math.PI*2, 0, Math.PI/2), new THREE.MeshStandardMaterial({ color: 0x78350f }));
      haCap.position.y = 0.12;
      heldAcorn.add(haBody);
      heldAcorn.add(haCap);
      rogiGroup.add(heldAcorn);

      // 5. Legs
      const legGeom = new THREE.CylinderGeometry(0.04, 0.03, 0.16, 8);
      legGeom.translate(0, -0.08, 0);

      const legL = new THREE.Mesh(legGeom, brownMat);
      legL.position.set(-0.1, 0.12, 0.02);
      rogiGroup.add(legL);

      const legR = new THREE.Mesh(legGeom, brownMat);
      legR.position.set(0.1, 0.12, 0.02);
      rogiGroup.add(legR);

      // Expose joints for animation in loop
      rogiGroup.userData = { legL, legR, armL, armR, tailGroup };

      return rogiGroup;
    };

    const rogiMesh = create3DRogi();
    rogiMesh.position.set(0, -0.61, 0.1); // Stand on the laboratory floor
    rogiMesh.scale.set(1.15, 1.15, 1.15);
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
      acornGroup.updateMatrixWorld(true); // Ensure coordinates are completely fresh
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

    // 10. Keyboard controls tracker
    const keysPressed = { Left: false, Right: false };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        keysPressed.Left = true;
      }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        keysPressed.Right = true;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        keysPressed.Left = false;
      }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        keysPressed.Right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 11. Animation variables
    let animationFrameId;
    let clock = new THREE.Clock();
    let rogiX = 0;
    let rogiDirection = 1; // 1 = right, -1 = left
    const rogiSpeed = 0.0075; // Slightly faster for interactive responsiveness

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

      // Keyboard-driven movement logic inside the laboratory
      let isWalking = false;
      if (keysPressed.Left && !keysPressed.Right) {
        rogiX -= rogiSpeed;
        rogiDirection = -1;
        isWalking = true;
      } else if (keysPressed.Right && !keysPressed.Left) {
        rogiX += rogiSpeed;
        rogiDirection = 1;
        isWalking = true;
      }

      // Constrain within circular floor bounds
      if (rogiX > 0.32) rogiX = 0.32;
      if (rogiX < -0.32) rogiX = -0.32;

      rogiMesh.position.x = rogiX;
      rogiMesh.scale.x = rogiDirection * 1.15;

      // Animate joints based on movement state
      if (isWalking) {
        // Walking limb swing animation
        const walkCycle = Math.sin(time * 14);
        if (rogiMesh.userData.legL) rogiMesh.userData.legL.rotation.x = walkCycle * 0.55;
        if (rogiMesh.userData.legR) rogiMesh.userData.legR.rotation.x = -walkCycle * 0.55;
        if (rogiMesh.userData.armL) rogiMesh.userData.armL.rotation.x = 0.6 - walkCycle * 0.25;
        if (rogiMesh.userData.armR) rogiMesh.userData.armR.rotation.x = 0.6 + walkCycle * 0.25;
        
        // Wobble & bobbing bounce
        rogiMesh.position.y = -0.61 + Math.abs(Math.sin(time * 14)) * 0.04;
        rogiMesh.rotation.z = Math.sin(time * 14) * 0.04;
        if (rogiMesh.userData.tailGroup) {
          rogiMesh.userData.tailGroup.rotation.z = Math.sin(time * 7) * 0.08;
        }
      } else {
        // Idle smooth interpolation to stance
        if (rogiMesh.userData.legL) rogiMesh.userData.legL.rotation.x += (0 - rogiMesh.userData.legL.rotation.x) * 0.15;
        if (rogiMesh.userData.legR) rogiMesh.userData.legR.rotation.x += (0 - rogiMesh.userData.legR.rotation.x) * 0.15;
        if (rogiMesh.userData.armL) rogiMesh.userData.armL.rotation.x += (0.6 - rogiMesh.userData.armL.rotation.x) * 0.15;
        if (rogiMesh.userData.armR) rogiMesh.userData.armR.rotation.x += (0.6 - rogiMesh.userData.armR.rotation.x) * 0.15;
        
        // Breathing movement
        rogiMesh.position.y = -0.61 + Math.sin(time * 1.8) * 0.012;
        rogiMesh.rotation.z += (0 - rogiMesh.rotation.z) * 0.15;
        if (rogiMesh.userData.tailGroup) {
          rogiMesh.userData.tailGroup.rotation.z = Math.sin(time * 1.8) * 0.04;
        }
      }

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
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
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
        height: '100%', 
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
