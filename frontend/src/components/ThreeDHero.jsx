import React, { useRef, useEffect, useState } from 'react';
import rogiMascotUrl from '../assets/rogi_mascot.png';

export default function ThreeDHero({ onItemClick, isEntered }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const isEnteredRef = useRef(isEntered);

  // Sync isEntered state to ref for access in animate loop
  useEffect(() => {
    isEnteredRef.current = isEntered;
  }, [isEntered]);

  useEffect(() => {
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
    camera.position.set(0, 0, 5.2); // Start at standard distance

    // 3. Create Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xc5a880, 2.0);
    keyLight.position.set(5, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-5, 3, 2);
    scene.add(fillLight);

    const pointLight = new THREE.PointLight(0x00ffff, 1.2, 5); // Hologram cyan light source
    pointLight.position.set(0.25, 0, -0.1);
    scene.add(pointLight);

    // 5. Build Acorn Group (Container)
    const acornGroup = new THREE.Group();
    acornGroup.scale.set(1.4, 1.4, 1.4);
    scene.add(acornGroup);

    // Outer shell body geometry
    const bodyPoints = [];
    bodyPoints.push(new THREE.Vector2(0, -1.1));
    bodyPoints.push(new THREE.Vector2(0.35, -1.0));
    bodyPoints.push(new THREE.Vector2(0.68, -0.7));
    bodyPoints.push(new THREE.Vector2(0.85, -0.2));
    bodyPoints.push(new THREE.Vector2(0.9, 0.25));
    bodyPoints.push(new THREE.Vector2(0.85, 0.45));
    bodyPoints.push(new THREE.Vector2(0, 0.45));
    const bodyGeom = new THREE.LatheGeometry(bodyPoints, 32);

    // Outer cap geometry
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

    // Materials - initialized as transparent to support fading
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0xc5a880, // Rich warm metallic gold/amber
      roughness: 0.15,
      metalness: 0.9,
      transparent: true,
      opacity: 1.0, // Start fully solid
      side: THREE.DoubleSide,
      emissive: 0xc5a880,
      emissiveIntensity: 0.1,
      depthWrite: false
    });

    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0x5b3f29, // Deep dark oak/chocolate cap
      roughness: 0.45,
      metalness: 0.65,
      transparent: true,
      opacity: 1.0, // Start fully solid
      side: THREE.DoubleSide,
      emissive: 0x5b3f29,
      emissiveIntensity: 0.05,
      depthWrite: false
    });

    const stemMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d271a,
      roughness: 0.8,
      metalness: 0.1
    });

    const bodyMesh = new THREE.Mesh(bodyGeom, glassMaterial);
    bodyMesh.renderOrder = 3;

    const capMesh = new THREE.Mesh(capGeom, capMaterial);
    capMesh.renderOrder = 3;

    const stemMesh = new THREE.Mesh(stemGeom, stemMaterial);

    acornGroup.add(bodyMesh);
    acornGroup.add(capMesh);
    acornGroup.add(stemMesh);

    // 6. Build Laboratory Interior Environment (Starts transparent/hidden)
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x181a20, // Clean charcoal floor
      roughness: 0.8,
      metalness: 0.2,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide
    });
    const floorMesh = new THREE.Mesh(new THREE.CircleGeometry(0.55, 32), floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.65;
    acornGroup.add(floorMesh);

    // Setup group for lab furniture to sync opacities together
    const furnitureGroup = new THREE.Group();
    acornGroup.add(furnitureGroup);

    const furnitureMat = new THREE.MeshStandardMaterial({
      color: 0x3d2a1d, // Mahogany wood finish
      roughness: 0.7,
      metalness: 0.2,
      transparent: true,
      opacity: 0.0
    });

    const metallicMat = new THREE.MeshStandardMaterial({
      color: 0x718096, // Steel metal trim
      roughness: 0.4,
      metalness: 0.8,
      transparent: true,
      opacity: 0.0
    });

    // 6a. Lab Table Top
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.02, 0.22), furnitureMat);
    tableTop.position.set(-0.25, -0.48, -0.1);
    furnitureGroup.add(tableTop);

    // Lab Table Legs
    const legGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.15, 8);
    const legL1 = new THREE.Mesh(legGeom, metallicMat);
    legL1.position.set(-0.42, -0.56, -0.19);
    furnitureGroup.add(legL1);
    const legL2 = new THREE.Mesh(legGeom, metallicMat);
    legL2.position.set(-0.42, -0.56, -0.01);
    furnitureGroup.add(legL2);
    const legR1 = new THREE.Mesh(legGeom, metallicMat);
    legR1.position.set(-0.08, -0.56, -0.19);
    furnitureGroup.add(legR1);
    const legR2 = new THREE.Mesh(legGeom, metallicMat);
    legR2.position.set(-0.08, -0.56, -0.01);
    furnitureGroup.add(legR2);

    // 6b. Research Stool Chair
    const stoolSeat = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 12), furnitureMat);
    stoolSeat.position.set(-0.24, -0.54, 0.16);
    furnitureGroup.add(stoolSeat);
    const stoolLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.1, 8), metallicMat);
    stoolLeg.position.set(-0.24, -0.6, 0.16);
    furnitureGroup.add(stoolLeg);

    // 6c. Stacked Colored Books (on the floor)
    const bookColors = [0x9b2c2c, 0xc05621, 0x2b6cb0]; // Red, Orange, Blue binders
    const bookGroup = new THREE.Group();
    bookColors.forEach((color, idx) => {
      const bookMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.8,
        metalness: 0.1,
        transparent: true,
        opacity: 0.0
      });
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.018, 0.09), bookMat);
      book.position.set(0.3, -0.64 + idx * 0.02, 0.18);
      book.rotation.y = (idx === 1) ? 0.25 : (idx === 2) ? -0.15 : 0;
      bookGroup.add(book);
    });
    furnitureGroup.add(bookGroup);

    // 6d. Chemical Flask & Beaker on Table (Transparent glass + Glowing liquid)
    const glassBodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide
    });
    
    // Flask (Glass Body + Green Liquid)
    const flask = new THREE.Group();
    flask.position.set(-0.35, -0.45, -0.14);
    const flBody = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.045, 8), glassBodyMat);
    const flLiquidMat = new THREE.MeshStandardMaterial({
      color: 0x00ff66,
      emissive: 0x00ff66,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.0
    });
    const flLiquid = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.03, 8), flLiquidMat);
    flLiquid.position.y = -0.005;
    flask.add(flBody);
    flask.add(flLiquid);
    furnitureGroup.add(flask);

    // Beaker (Glass Body + Blue Liquid)
    const beaker = new THREE.Group();
    beaker.position.set(-0.3, -0.45, -0.06);
    const bkBody = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.04, 8), glassBodyMat);
    const bkLiquidMat = new THREE.MeshStandardMaterial({
      color: 0x0099ff,
      emissive: 0x0099ff,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.0
    });
    const bkLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.024, 8), bkLiquidMat);
    bkLiquid.position.y = -0.006;
    beaker.add(bkBody);
    beaker.add(bkLiquid);
    furnitureGroup.add(beaker);

    // 7. Build Interactive Holographic & Hardware Devices
    const clickables = [];

    // 7a. NEWS Holographic Floating Screen (Cyan Blue)
    const hlCanvas = document.createElement('canvas');
    hlCanvas.width = 256;
    hlCanvas.height = 160;
    const hlCtx = hlCanvas.getContext('2d');
    hlCtx.fillStyle = 'rgba(10, 15, 25, 0.3)';
    hlCtx.fillRect(0, 0, 256, 160);
    // Draw sci-fi borders
    hlCtx.strokeStyle = '#00ffff';
    hlCtx.lineWidth = 6;
    hlCtx.strokeRect(0, 0, 256, 160);
    // Draw scanner lines
    hlCtx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    hlCtx.lineWidth = 2;
    for (let i = 10; i < 160; i += 8) {
      hlCtx.beginPath();
      hlCtx.moveTo(0, i);
      hlCtx.lineTo(256, i);
      hlCtx.stroke();
    }
    // Draw HUD text
    hlCtx.fillStyle = '#00ffff';
    hlCtx.shadowColor = '#00ffff';
    hlCtx.shadowBlur = 10;
    hlCtx.font = 'bold 30px "Outfit", sans-serif';
    hlCtx.textAlign = 'center';
    hlCtx.textBaseline = 'middle';
    hlCtx.fillText('NEWS CLIPS', 128, 65);
    hlCtx.font = 'bold 16px "Outfit", sans-serif';
    hlCtx.fillText('[CLICK TO ENTER]', 128, 115);

    const hlTexture = new THREE.CanvasTexture(hlCanvas);
    const hlMaterial = new THREE.MeshStandardMaterial({
      map: hlTexture,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      emissive: 0x00ffff,
      emissiveIntensity: 0.65,
      depthWrite: false
    });
    const hologramMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.35), hlMaterial);
    hologramMesh.position.set(0.18, -0.22, -0.22); // Hovering in the back right
    hologramMesh.rotation.y = -0.15;
    hologramMesh.renderOrder = 1;
    hologramMesh.userData = { id: 'news' };
    acornGroup.add(hologramMesh);
    clickables.push(hologramMesh);

    // 7b. Interactive 3D Mini-Calculator (sitting on desk)
    const calcGroup = new THREE.Group();
    calcGroup.position.set(-0.16, -0.465, -0.05);
    calcGroup.rotation.y = 0.12;
    calcGroup.userData = { id: 'calculators' };

    const calcBodyMat = new THREE.MeshStandardMaterial({
      color: 0x2d3748, // Charcoal grey slate casing
      roughness: 0.6,
      metalness: 0.4,
      transparent: true,
      opacity: 0.0
    });
    const calcBody = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.015, 0.1), calcBodyMat);
    calcGroup.add(calcBody);

    const calcScreenMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00, // Golden glowing calculator panel
      emissive: 0xffaa00,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.0
    });
    const calcScreen = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.002, 0.024), calcScreenMat);
    calcScreen.position.set(0, 0.009, -0.026);
    calcGroup.add(calcScreen);

    // Tiny buttons on calculator
    const btnMat = new THREE.MeshStandardMaterial({
      color: 0xc5a880,
      roughness: 0.8,
      transparent: true,
      opacity: 0.0
    });
    const buttonGeom = new THREE.BoxGeometry(0.01, 0.008, 0.01);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const btn = new THREE.Mesh(buttonGeom, btnMat);
        btn.position.set(-0.024 + c * 0.024, 0.009, 0.006 + r * 0.016);
        calcGroup.add(btn);
      }
    }
    acornGroup.add(calcGroup);
    clickables.push(calcGroup);

    // 7c. Holographic Wireframe Globe (for Financial Dashboard)
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88, // Emerald green wireframe
      emissive: 0x00ff88,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.0,
      wireframe: true
    });
    const globeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), globeMat);
    globeMesh.position.set(-0.25, -0.32, -0.1); // Float above the desk center
    globeMesh.userData = { id: 'dashboard' };
    acornGroup.add(globeMesh);
    clickables.push(globeMesh);

    // 7d. Interactive 3D Envelope (for Dotori Subscription)
    const letterGroup = new THREE.Group();
    letterGroup.position.set(-0.15, -0.465, -0.16);
    letterGroup.rotation.y = -0.35;
    letterGroup.userData = { id: 'subscribe' };

    const envPaperMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Clean white paper envelope
      roughness: 0.9,
      metalness: 0.05,
      transparent: true,
      opacity: 0.0
    });
    const envBase = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.006, 0.06), envPaperMat);
    letterGroup.add(envBase);

    // Tiny red wax seal stamp on envelope
    const sealMat = new THREE.MeshStandardMaterial({
      color: 0xe53e3e,
      emissive: 0xe53e3e,
      emissiveIntensity: 0.25,
      roughness: 0.5,
      transparent: true,
      opacity: 0.0
    });
    const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.002, 8), sealMat);
    seal.position.set(0, 0.004, 0);
    letterGroup.add(seal);

    acornGroup.add(letterGroup);
    clickables.push(letterGroup);

    // 8. Build 2.5D Paper Cutout Mascot (Rogi)
    const rogiMaterial = new THREE.MeshStandardMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 0.95,
      metalness: 0.05,
      opacity: 0.0 // Starts invisible
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
          data[i+3] = 0; // Set Alpha to 0
        }
      }
      ctx.putImageData(imgData, 0, 0);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      rogiMaterial.map = texture;
      rogiMaterial.needsUpdate = true;
    };

    const rogiGeom = new THREE.PlaneGeometry(0.7, 0.7); // Smaller, cute scale inside room
    const rogiMesh = new THREE.Mesh(rogiGeom, rogiMaterial);
    rogiMesh.position.set(0, -0.32, 0.1); // Standing on floor
    rogiMesh.renderOrder = 2; // Render before glass
    acornGroup.add(rogiMesh);

    // 2.5D Dropshadow beneath Rogi's feet
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -0.64, 0.1); // Slightly above floor to prevent z-fighting
    shadowMesh.renderOrder = 1;
    acornGroup.add(shadowMesh);

    // 9. Mouse Tracker & Raycaster variables
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    const checkIntersection = (x, y) => {
      mouseVec.set(x, y);
      acornGroup.updateMatrixWorld(true); // Ensure world coordinates are perfectly aligned
      raycaster.setFromCamera(mouseVec, camera);
      const intersects = raycaster.intersectObjects(clickables, true);
      return intersects.length > 0 ? intersects[0] : null;
    };

    const handleMouseMove = (event) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      targetMouseX = (x / rect.width) * 2 - 1;
      targetMouseY = -(y / rect.height) * 2 + 1;

      // Only check raycasting highlights when entered inside laboratory
      if (!isEnteredRef.current) {
        canvasRef.current.style.cursor = 'grab';
        return;
      }

      // Reset default intensities
      hlMaterial.emissiveIntensity = 0.65;
      hlMaterial.emissive.setHex(0x00ffff);

      calcScreenMat.emissiveIntensity = 0.35;
      calcScreenMat.emissive.setHex(0xffaa00);

      globeMat.emissiveIntensity = 0.5;
      globeMat.emissive.setHex(0x00ff88);

      sealMat.emissiveIntensity = 0.25;
      sealMat.emissive.setHex(0xe53e3e);

      const hit = checkIntersection(targetMouseX, targetMouseY);
      if (hit) {
        canvasRef.current.style.cursor = 'pointer';
        let obj = hit.object;
        while (obj && !obj.userData.id) {
          obj = obj.parent;
        }
        if (obj) {
          if (obj.userData.id === 'news') {
            hlMaterial.emissiveIntensity = 1.4;
            hlMaterial.emissive.setHex(0x00ffff);
          } else if (obj.userData.id === 'calculators') {
            calcScreenMat.emissiveIntensity = 0.95;
            calcScreenMat.emissive.setHex(0xffbb00);
          } else if (obj.userData.id === 'dashboard') {
            globeMat.emissiveIntensity = 1.3;
            globeMat.emissive.setHex(0x00ffaa);
          } else if (obj.userData.id === 'subscribe') {
            sealMat.emissiveIntensity = 0.95;
            sealMat.emissive.setHex(0xff3333);
          }
        }
      } else {
        canvasRef.current.style.cursor = 'grab';
      }
    };

    const handleCanvasClick = () => {
      if (!isEnteredRef.current) return;
      const hit = checkIntersection(targetMouseX, targetMouseY);
      if (hit) {
        let obj = hit.object;
        while (obj && !obj.userData.id) {
          obj = obj.parent;
        }
        if (obj && obj.userData.id) {
          if (onItemClick) {
            onItemClick(obj.userData.id);
          }
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvasRef.current.addEventListener('click', handleCanvasClick);

    // 10. Keyboard Controls Tracker (Only active when entered)
    const keysPressed = { Left: false, Right: false };

    const handleKeyDown = (e) => {
      if (!isEnteredRef.current) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'w') {
        keysPressed.Left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key.toLowerCase() === 'd' || e.key.toLowerCase() === 's') {
        keysPressed.Right = true;
      }
    };

    const handleKeyUp = (e) => {
      if (!isEnteredRef.current) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'w') {
        keysPressed.Left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key.toLowerCase() === 'd' || e.key.toLowerCase() === 's') {
        keysPressed.Right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 11. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();
    let rogiX = 0;
    let rogiDirection = 1; // 1 = right, -1 = left
    const rogiSpeed = 0.0075;

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

      // Slowly rotate the wireframe indices globe
      globeMesh.rotation.y = time * 0.4;
      globeMesh.rotation.x = time * 0.1;

      // 12. Dynamic Transition Interpolation (Opaque Acorn -> Transparent Lab Room)
      const entered = isEnteredRef.current;

      // Camera Targets
      const targetCamZ = entered ? 3.6 : 5.2;
      const targetCamY = entered ? -0.05 : 0;
      camera.position.z += (targetCamZ - camera.position.z) * 0.08;
      camera.position.y += (targetCamY - camera.position.y) * 0.08;

      // Acorn Shell Targets (Solid -> Outline)
      const targetShellOpacity = entered ? 0.06 : 1.0;
      const targetCapOpacity = entered ? 0.12 : 1.0;
      glassMaterial.opacity += (targetShellOpacity - glassMaterial.opacity) * 0.08;
      capMaterial.opacity += (targetCapOpacity - capMaterial.opacity) * 0.08;

      // Interior Props Targets (Invisible -> Fully Lit)
      const targetInteriorOpacity = entered ? 1.0 : 0.0;
      floorMaterial.opacity += (targetInteriorOpacity - floorMaterial.opacity) * 0.08;
      furnitureMat.opacity += (targetInteriorOpacity - furnitureMat.opacity) * 0.08;
      metallicMat.opacity += (targetInteriorOpacity - metallicMat.opacity) * 0.08;
      glassBodyMat.opacity += (targetInteriorOpacity - glassBodyMat.opacity) * 0.08;
      flLiquidMat.opacity += (targetInteriorOpacity - flLiquidMat.opacity) * 0.08;
      bkLiquidMat.opacity += (targetInteriorOpacity - bkLiquidMat.opacity) * 0.08;
      
      // Interactive Devices opacity
      hlMaterial.opacity += (targetInteriorOpacity - hlMaterial.opacity) * 0.08;
      calcBodyMat.opacity += (targetInteriorOpacity - calcBodyMat.opacity) * 0.08;
      calcScreenMat.opacity += (targetInteriorOpacity - calcScreenMat.opacity) * 0.08;
      btnMat.opacity += (targetInteriorOpacity - btnMat.opacity) * 0.08;
      globeMat.opacity += (targetInteriorOpacity - globeMat.opacity) * 0.08;
      envPaperMat.opacity += (targetInteriorOpacity - envPaperMat.opacity) * 0.08;
      sealMat.opacity += (targetInteriorOpacity - sealMat.opacity) * 0.08;

      // Mascot & dropshadow opacity
      rogiMaterial.opacity += (targetInteriorOpacity - rogiMaterial.opacity) * 0.08;
      shadowMat.opacity += (entered ? 0.45 : 0.0 - shadowMat.opacity) * 0.08;

      // Render book pile opacities
      bookGroup.children.forEach(b => {
        b.material.opacity += (targetInteriorOpacity - b.material.opacity) * 0.08;
      });

      // 13. Keyboard walking and 2.5D Animation logic
      let isWalking = false;
      if (entered) {
        if (keysPressed.Left && !keysPressed.Right) {
          rogiX -= rogiSpeed;
          rogiDirection = -1;
          isWalking = true;
        } else if (keysPressed.Right && !keysPressed.Left) {
          rogiX += rogiSpeed;
          rogiDirection = 1;
          isWalking = true;
        }
      }

      // Constrain position to circle floor
      if (rogiX > 0.32) rogiX = 0.32;
      if (rogiX < -0.32) rogiX = -0.32;

      rogiMesh.position.x = rogiX;
      shadowMesh.position.x = rogiX;

      // Face walking direction
      rogiMesh.scale.x = rogiDirection;

      if (isWalking) {
        // Wobbling and paper-bobbing walks
        rogiMesh.position.y = -0.34 + Math.abs(Math.sin(time * 14)) * 0.035;
        rogiMesh.rotation.z = Math.sin(time * 14) * 0.06;
      } else {
        // Standing breathing idle
        rogiMesh.position.y = -0.34 + Math.sin(time * 1.8) * 0.008;
        rogiMesh.rotation.z += (0 - rogiMesh.rotation.z) * 0.15;
      }

      // Adjust dropshadow scale depending on Rogi's height from floor
      const heightOffset = rogiMesh.position.y - (-0.34);
      const shadowScale = Math.max(0.4, 1.0 - heightOffset * 3.5);
      shadowMesh.scale.set(shadowScale, shadowScale, 1.0);
      shadowMat.opacity = Math.max(0.15, 0.45 - heightOffset * 1.5) * targetInteriorOpacity;

      renderer.render(scene, camera);
    };

    animate();

    // 14. Resize handler
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
          로기가 3D 미래 도토리 연구소를 활성화하는 중... 🛠️
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
