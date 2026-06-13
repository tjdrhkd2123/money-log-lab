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

    // Outer shell body geometry (Full 360 deg sweep)
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

    // Materials - initialized as transparent to support fading to outline dome
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
      color: 0x5b3f29, // Deep dark oak cap
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
      metalness: 0.1,
      transparent: true,
      opacity: 1.0
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

    // Neon grid rings on the floor
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ringMesh1 = new THREE.Mesh(new THREE.RingGeometry(0.52, 0.54, 32), ringMat);
    ringMesh1.rotation.x = -Math.PI / 2;
    ringMesh1.position.y = -0.648;
    acornGroup.add(ringMesh1);

    const ringMesh2 = new THREE.Mesh(new THREE.RingGeometry(0.38, 0.39, 32), ringMat);
    ringMesh2.rotation.x = -Math.PI / 2;
    ringMesh2.position.y = -0.648;
    acornGroup.add(ringMesh2);

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

    // 6e. Research Bookcase (sitting at the back)
    const bookcaseGroup = new THREE.Group();
    bookcaseGroup.position.set(0, -0.64, -0.28); // Sits on floor y = -0.65
    furnitureGroup.add(bookcaseGroup);

    // Bookcase Frame Material
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x3d2a1d, // Mahogany wood
      roughness: 0.7,
      metalness: 0.2,
      transparent: true,
      opacity: 0.0
    });
    
    const backPanel = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.015), frameMat);
    backPanel.position.set(0, 0.19, 0);
    bookcaseGroup.add(backPanel);

    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.38, 0.07), frameMat);
    sideL.position.set(-0.14, 0.19, 0.025);
    bookcaseGroup.add(sideL);

    const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.38, 0.07), frameMat);
    sideR.position.set(0.14, 0.19, 0.025);
    bookcaseGroup.add(sideR);

    const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.012, 0.06), frameMat);
    shelf1.position.set(0, 0.12, 0.025);
    bookcaseGroup.add(shelf1);

    const shelf2 = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.012, 0.06), frameMat);
    shelf2.position.set(0, 0.24, 0.025);
    bookcaseGroup.add(shelf2);

    const topPanel = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.015, 0.07), frameMat);
    topPanel.position.set(0, 0.38, 0.025);
    bookcaseGroup.add(topPanel);

    // Mini books to fill bookcase shelves
    const miniBookColors = [0x9b2c2c, 0x2b6cb0, 0x2f855a, 0xd69e2e, 0x4e382b];
    for (let s = 0; s < 3; s++) { // 3 shelf rows (including bottom floor shelf)
      const shelfY = s === 0 ? 0.01 : s === 1 ? 0.13 : 0.25;
      for (let b = 0; b < 6; b++) {
        const bookMat = new THREE.MeshStandardMaterial({
          color: miniBookColors[(s * 3 + b) % miniBookColors.length],
          roughness: 0.8,
          transparent: true,
          opacity: 0.0
        });
        const bookHeight = 0.05 + Math.random() * 0.015;
        const bookMesh = new THREE.Mesh(new THREE.BoxGeometry(0.012, bookHeight, 0.045), bookMat);
        bookMesh.position.set(-0.1 + b * 0.038, shelfY + bookHeight / 2, 0.025);
        if (Math.random() > 0.65) {
          bookMesh.rotation.z = (Math.random() - 0.5) * 0.18;
        }
        bookcaseGroup.add(bookMesh);
      }
    }

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
    hlCtx.font = 'bold 32px "Outfit", sans-serif'; // Adjusted size slightly for Korean fonts
    hlCtx.textAlign = 'center';
    hlCtx.textBaseline = 'middle';
    hlCtx.fillText('실시간 뉴스', 128, 65);
    hlCtx.font = 'bold 18px "Outfit", sans-serif';
    hlCtx.fillText('[클릭하여 열기]', 128, 115);

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

    // Hologram Projector Base (metal disk on the floor)
    const projectorBaseMat = new THREE.MeshStandardMaterial({
      color: 0x4a5568,
      roughness: 0.5,
      metalness: 0.8,
      transparent: true,
      opacity: 0.0
    });
    const projectorBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.015, 12), projectorBaseMat);
    projectorBase.position.set(0.18, -0.64, -0.22);
    acornGroup.add(projectorBase);

    // Holographic Light Cone (beam from floor to screen)
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const beamCone = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.42, 16, 1, true), beamMat);
    beamCone.position.set(0.18, -0.43, -0.22);
    acornGroup.add(beamCone);

    // Cyber Server Rack on the floor
    const serverMat = new THREE.MeshStandardMaterial({
      color: 0x242831,
      roughness: 0.5,
      metalness: 0.9,
      transparent: true,
      opacity: 0.0
    });
    const serverMesh = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.28, 0.15), serverMat);
    serverMesh.position.set(0.32, -0.51, -0.12);
    acornGroup.add(serverMesh);

    // Server LED indicator lights
    const serverLeds = [];
    const ledColors = [0x00ff66, 0xff3333, 0xffcc00];
    for (let l = 0; l < 4; l++) {
      const ledMat = new THREE.MeshBasicMaterial({
        color: ledColors[l % ledColors.length],
        transparent: true,
        opacity: 0.0
      });
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), ledMat);
      led.position.set(0.32 - 0.076, -0.42 - l * 0.045, -0.12 + (l % 2 === 0 ? 0.03 : -0.03));
      acornGroup.add(led);
      serverLeds.push(led);
    }

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

    // 8. Build 3D Mascot (Rogi)
    const rogiGroup = new THREE.Group();
    rogiGroup.position.set(0, -0.64, 0.1); // Floor y is -0.65, so foot starts around here
    acornGroup.add(rogiGroup);

    const rogiMaterials = [];
    const createRogiMaterial = (color, roughness = 0.5, metalness = 0.1) => {
      const mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: roughness,
        metalness: metalness,
        transparent: true,
        opacity: 0.0
      });
      rogiMaterials.push(mat);
      return mat;
    };

    // Warm friendly squirrel tones matching rogi_mascot artwork
    const sqBrown = createRogiMaterial(0xbb6c3a, 0.7, 0.02); // Rich warm squirrel orange-brown
    const sqLight = createRogiMaterial(0xfff5e6, 0.6, 0.02); // Creamy warm white/wheat for tummy & cheeks
    const sqPink = createRogiMaterial(0xffc0cb, 0.6, 0.02);  // Cozy pink for inner ears
    const sqDark = createRogiMaterial(0x422216, 0.85, 0.02); // Dark chocolate stripes
    const sqBlack = createRogiMaterial(0x0e0e0e, 0.15, 0.85); // Glossy cartoon eyes/nose
    const sqWhite = createRogiMaterial(0xffffff, 0.05, 0.95); // Shiny glare reflections

    // Subgroup to animate walking bobbing
    const rogiBodyGroup = new THREE.Group();
    rogiGroup.add(rogiBodyGroup);

    // 8a. Tummy / Lower Body (Sphere)
    const bodyGeom = new THREE.SphereGeometry(0.09, 18, 18);
    bodyGeom.scale(1.0, 1.25, 0.95);
    const bodyMesh = new THREE.Mesh(bodyGeom, sqBrown);
    bodyMesh.position.y = 0.11;
    rogiBodyGroup.add(bodyMesh);

    // Light belly patch (Sphere, slightly forward)
    const bellyGeom = new THREE.SphereGeometry(0.075, 18, 18);
    bellyGeom.scale(0.82, 1.02, 0.45);
    const bellyMesh = new THREE.Mesh(bellyGeom, sqLight);
    bellyMesh.position.set(0, 0.095, 0.055);
    rogiBodyGroup.add(bellyMesh);

    // Dark back stripes (3 lines of stripes on the back of body)
    const stripeL = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.14, 0.008), sqDark);
    stripeL.position.set(-0.03, 0.11, -0.078);
    rogiBodyGroup.add(stripeL);
    
    const stripeC = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.14, 0.008), sqLight); // middle light accent stripe
    stripeC.position.set(0, 0.11, -0.082);
    rogiBodyGroup.add(stripeC);

    const stripeR = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.14, 0.008), sqDark);
    stripeR.position.set(0.03, 0.11, -0.078);
    rogiBodyGroup.add(stripeR);

    // 8b. Head (Sphere)
    const headGeom = new THREE.SphereGeometry(0.085, 18, 18);
    const headMesh = new THREE.Mesh(headGeom, sqBrown);
    headMesh.position.set(0, 0.22, 0);
    rogiBodyGroup.add(headMesh);

    // Dark forehead stripes (signature stripe down the middle of head)
    const foreheadStripe = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.055, 0.008), sqDark);
    foreheadStripe.position.set(0, 0.26, 0.075);
    foreheadStripe.rotation.x = -Math.PI / 12;
    rogiBodyGroup.add(foreheadStripe);

    // Muzzle / Cheeks (Cream colored chubby cheeks left/right)
    const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.036, 14, 14), sqLight);
    cheekL.position.set(-0.024, 0.195, 0.055);
    rogiBodyGroup.add(cheekL);
    const cheekR = new THREE.Mesh(new THREE.SphereGeometry(0.036, 14, 14), sqLight);
    cheekR.position.set(0.024, 0.195, 0.055);
    rogiBodyGroup.add(cheekR);

    // Nose (Tiny black sphere)
    const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), sqBlack);
    noseMesh.position.set(0, 0.208, 0.086);
    rogiBodyGroup.add(noseMesh);

    // Eyes (Big cute cartoon eyes)
    const eyeGeom = new THREE.SphereGeometry(0.018, 14, 14);
    const eyeL = new THREE.Mesh(eyeGeom, sqBlack);
    eyeL.position.set(-0.035, 0.23, 0.062);
    rogiBodyGroup.add(eyeL);
    const eyeR = new THREE.Mesh(eyeGeom, sqBlack);
    eyeR.position.set(0.035, 0.23, 0.062);
    rogiBodyGroup.add(eyeR);

    // Eye Highlights (Shiny glare)
    const glareGeom = new THREE.SphereGeometry(0.006, 8, 8);
    const glareL = new THREE.Mesh(glareGeom, sqWhite);
    glareL.position.set(-0.03, 0.238, 0.074);
    rogiBodyGroup.add(glareL);
    const glareR = new THREE.Mesh(glareGeom, sqWhite);
    glareR.position.set(0.04, 0.238, 0.074);
    rogiBodyGroup.add(glareR);

    // 8c. Ears (Slightly larger, cute angled ears)
    const earGeom = new THREE.ConeGeometry(0.03, 0.075, 4);
    earGeom.rotateX(Math.PI / 8);

    const earL = new THREE.Mesh(earGeom, sqBrown);
    earL.position.set(-0.058, 0.292, 0.005);
    earL.rotation.z = 0.24;
    rogiBodyGroup.add(earL);

    const innerEarL = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.055, 4), sqPink);
    innerEarL.position.set(-0.052, 0.284, 0.014);
    innerEarL.rotation.z = 0.24;
    rogiBodyGroup.add(innerEarL);

    const earR = new THREE.Mesh(earGeom, sqBrown);
    earR.position.set(0.058, 0.292, 0.005);
    earR.rotation.z = -0.24;
    rogiBodyGroup.add(earR);

    const innerEarR = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.055, 4), sqPink);
    innerEarR.position.set(0.052, 0.284, 0.014);
    innerEarR.rotation.z = -0.24;
    rogiBodyGroup.add(innerEarR);

    // 8d. Arms (Cylinders - Initialized in a cute hand-resting pose over tummy)
    const armGeom = new THREE.CylinderGeometry(0.015, 0.011, 0.065, 8);
    armGeom.translate(0, -0.03, 0);

    const armL = new THREE.Mesh(armGeom, sqBrown);
    armL.position.set(-0.085, 0.14, 0.025);
    armL.rotation.z = 1.1; // Rest over tummy
    armL.rotation.y = 0.5;
    armL.rotation.x = 0.4;
    rogiBodyGroup.add(armL);

    const armR = new THREE.Mesh(armGeom, sqBrown);
    armR.position.set(0.085, 0.14, 0.025);
    armR.rotation.z = -1.1; // Rest over tummy
    armR.rotation.y = -0.5;
    armR.rotation.x = 0.4;
    rogiBodyGroup.add(armR);

    // 8e. Legs and feet (Mini cylinders)
    const legGeom = new THREE.CylinderGeometry(0.022, 0.02, 0.04, 8);
    
    const legL = new THREE.Mesh(legGeom, sqBrown);
    legL.position.set(-0.045, 0.02, 0.002);
    rogiBodyGroup.add(legL);

    const legR = new THREE.Mesh(legGeom, sqBrown);
    legR.position.set(0.045, 0.02, 0.002);
    rogiBodyGroup.add(legR);

    const footGeom = new THREE.BoxGeometry(0.03, 0.015, 0.055);
    
    const footL = new THREE.Mesh(footGeom, sqLight);
    footL.position.set(-0.045, 0.0075, 0.012);
    rogiBodyGroup.add(footL);

    const footR = new THREE.Mesh(footGeom, sqLight);
    footR.position.set(0.045, 0.0075, 0.012);
    rogiBodyGroup.add(footR);

    // 8f. Large Fluffy Squirrel Tail (Bigger, sweeping segmented design)
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.07, -0.07);
    rogiBodyGroup.add(tailGroup);

    const numTailSegs = 6;
    const tailSegRefs = [];
    for (let i = 0; i < numTailSegs; i++) {
      const tRatio = i / (numTailSegs - 1);
      const segSize = 0.042 + Math.sin(tRatio * Math.PI) * 0.065; // Much bulkier tail
      const segGeom = new THREE.SphereGeometry(segSize, 10, 10);
      const segMesh = new THREE.Mesh(segGeom, sqBrown);
      
      const arcAngle = tRatio * Math.PI * 0.88;
      const radius = 0.14; // sweeping curve radius
      segMesh.position.z = -Math.sin(arcAngle) * radius;
      segMesh.position.y = Math.cos(arcAngle) * radius + 0.07;
      
      tailGroup.add(segMesh);
      tailSegRefs.push(segMesh);

      // Deep dark brown tail stripes
      if (i % 2 === 1) {
        const stripeGeom = new THREE.SphereGeometry(segSize + 0.002, 10, 10);
        stripeGeom.scale(1.04, 1.0, 0.38);
        const stripeMesh = new THREE.Mesh(stripeGeom, sqDark);
        stripeMesh.position.copy(segMesh.position);
        stripeMesh.rotation.x = arcAngle;
        tailGroup.add(stripeMesh);
      }
    }

    // 8g. Dropshadow (Dynamic Ground Circle)
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(new THREE.CircleGeometry(0.075, 16), shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -0.648, 0.1); // slightly above floor
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
    const keysPressed = { Left: false, Right: false, Forward: false, Backward: false };

    const handleKeyDown = (e) => {
      if (!isEnteredRef.current) return;
      const key = e.key.toLowerCase();
      if (e.key === 'ArrowLeft' || key === 'a') keysPressed.Left = true;
      if (e.key === 'ArrowRight' || key === 'd') keysPressed.Right = true;
      if (e.key === 'ArrowUp' || key === 'w') keysPressed.Forward = true;
      if (e.key === 'ArrowDown' || key === 's') keysPressed.Backward = true;
    };

    const handleKeyUp = (e) => {
      if (!isEnteredRef.current) return;
      const key = e.key.toLowerCase();
      if (e.key === 'ArrowLeft' || key === 'a') keysPressed.Left = false;
      if (e.key === 'ArrowRight' || key === 'd') keysPressed.Right = false;
      if (e.key === 'ArrowUp' || key === 'w') keysPressed.Forward = false;
      if (e.key === 'ArrowDown' || key === 's') keysPressed.Backward = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 11. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();
    let rogiX = 0;
    let rogiZ = 0.1; // Starting depth coordinate inside the room
    const rogiSpeed = 0.0065; // Fine-tuned speed for multi-directional navigation

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

      // Camera Targets (Animal Crossing-style Panning Follow Camera when inside)
      if (entered) {
        // Camera pans horizontally and vertically to track Rogi, keeping a cozy overhead perspective
        const targetCamX = rogiX * 0.72; 
        const targetCamY = 0.28;        
        const targetCamZ = rogiZ + 1.62; 

        camera.position.x += (targetCamX - camera.position.x) * 0.07;
        camera.position.y += (targetCamY - camera.position.y) * 0.07;
        camera.position.z += (targetCamZ - camera.position.z) * 0.07;

        // Fixed yaw rotation: look straight ahead relative to camera position to avoid dizzying turns
        camera.lookAt(new THREE.Vector3(camera.position.x, -0.64 + 0.14, camera.position.z - 1.62));
      } else {
        camera.position.x += (0 - camera.position.x) * 0.08;
        camera.position.y += (0 - camera.position.y) * 0.08;
        camera.position.z += (5.2 - camera.position.z) * 0.08;
        camera.lookAt(new THREE.Vector3(0, 0, 0));
      }

      // Acorn Shell Targets (Solid -> Completely hidden inside room)
      const targetShellOpacity = entered ? 0.0 : 1.0;
      glassMaterial.opacity += (targetShellOpacity - glassMaterial.opacity) * 0.08;
      capMaterial.opacity += (targetShellOpacity - capMaterial.opacity) * 0.08;
      stemMaterial.opacity += (targetShellOpacity - stemMaterial.opacity) * 0.08;

      // Interior Props Targets (Invisible -> Fully Lit)
      const targetInteriorOpacity = entered ? 1.0 : 0.0;
      floorMaterial.opacity += (targetInteriorOpacity - floorMaterial.opacity) * 0.08;
      furnitureMat.opacity += (targetInteriorOpacity - furnitureMat.opacity) * 0.08;
      metallicMat.opacity += (targetInteriorOpacity - metallicMat.opacity) * 0.08;
      glassBodyMat.opacity += (targetInteriorOpacity - glassBodyMat.opacity) * 0.08;
      flLiquidMat.opacity += (targetInteriorOpacity - flLiquidMat.opacity) * 0.08;
      bkLiquidMat.opacity += (targetInteriorOpacity - bkLiquidMat.opacity) * 0.08;
      
      // Bookcase fading
      frameMat.opacity += (targetInteriorOpacity - frameMat.opacity) * 0.08;
      bookcaseGroup.children.forEach(child => {
        if (child.material && child.material !== frameMat) {
          child.material.opacity += (targetInteriorOpacity - child.material.opacity) * 0.08;
        }
      });
      
      // Interactive Devices opacity
      hlMaterial.opacity += (targetInteriorOpacity - hlMaterial.opacity) * 0.08;
      calcBodyMat.opacity += (targetInteriorOpacity - calcBodyMat.opacity) * 0.08;
      calcScreenMat.opacity += (targetInteriorOpacity - calcScreenMat.opacity) * 0.08;
      btnMat.opacity += (targetInteriorOpacity - btnMat.opacity) * 0.08;
      globeMat.opacity += (targetInteriorOpacity - globeMat.opacity) * 0.08;
      envPaperMat.opacity += (targetInteriorOpacity - envPaperMat.opacity) * 0.08;
      sealMat.opacity += (targetInteriorOpacity - sealMat.opacity) * 0.08;

      // SF Props opacity
      projectorBaseMat.opacity += (targetInteriorOpacity - projectorBaseMat.opacity) * 0.08;
      beamMat.opacity += ((entered ? 0.24 + Math.sin(time * 6) * 0.05 : 0) - beamMat.opacity) * 0.08;
      ringMat.opacity += ((entered ? 0.45 : 0) - ringMat.opacity) * 0.08;
      serverMat.opacity += (targetInteriorOpacity - serverMat.opacity) * 0.08;
      serverLeds.forEach((led, idx) => {
        // Blink LEDs in loop using sine wave with phase offset
        const blinkVal = entered ? (Math.sin(time * 9 + idx * 1.5) > 0.1 ? 0.85 : 0.15) : 0;
        led.material.opacity += (blinkVal - led.material.opacity) * 0.15;
      });

      // Mascot & dropshadow opacity
      rogiMaterials.forEach(m => {
        m.opacity += (targetInteriorOpacity - m.opacity) * 0.08;
      });
      shadowMat.opacity += ((entered ? 0.42 : 0.0) - shadowMat.opacity) * 0.08;

      // Render book pile opacities
      bookGroup.children.forEach(b => {
        b.material.opacity += (targetInteriorOpacity - b.material.opacity) * 0.08;
      });

      // 13. Keyboard walking and 3D 8-Directional Animation logic
      let isWalking = false;
      let moveX = 0;
      let moveZ = 0;

      if (entered) {
        if (keysPressed.Left) moveX -= 1;
        if (keysPressed.Right) moveX += 1;
        if (keysPressed.Forward) moveZ -= 1;  // Forward is -z (deeper)
        if (keysPressed.Backward) moveZ += 1; // Backward is +z (closer)
      }

      let targetRogiRotY = 0;

      if (moveX !== 0 || moveZ !== 0) {
        isWalking = true;
        // Normalize movement vector so diagonal move isn't faster
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        rogiX += (moveX / length) * rogiSpeed;
        rogiZ += (moveZ / length) * rogiSpeed;

        // Angle character towards movement direction (atan2(x, z))
        targetRogiRotY = Math.atan2(moveX, moveZ);
      }

      // Constrain position to circle floor boundary (dome radius is ~0.45)
      const dist = Math.sqrt(rogiX * rogiX + rogiZ * rogiZ);
      const maxRadius = 0.42;
      if (dist > maxRadius) {
        const angle = Math.atan2(rogiZ, rogiX);
        rogiX = Math.cos(angle) * maxRadius;
        rogiZ = Math.sin(angle) * maxRadius;
      }

      rogiGroup.position.x = rogiX;
      rogiGroup.position.z = rogiZ;
      shadowMesh.position.x = rogiX;
      shadowMesh.position.z = rogiZ;

      // Smooth rotate towards target direction (lerp to 0 if stopped)
      if (isWalking) {
        rogiGroup.rotation.y += (targetRogiRotY - rogiGroup.rotation.y) * 0.16;
      } else {
        rogiGroup.rotation.y += (0 - rogiGroup.rotation.y) * 0.12;
      }

      if (isWalking) {
        // Hopping bobbing motion when walking
        rogiBodyGroup.position.y = Math.abs(Math.sin(time * 13)) * 0.022;
        rogiBodyGroup.rotation.z = Math.sin(time * 13) * 0.045;
        rogiBodyGroup.rotation.x = 0.04;

        // Swing arms forward-backward naturally (reset Y & Z to normal swinging angles)
        armL.rotation.x = 0.25 + Math.sin(time * 13) * 0.5;
        armL.rotation.z += (0.25 - armL.rotation.z) * 0.12;
        armL.rotation.y += (0.1 - armL.rotation.y) * 0.12;

        armR.rotation.x = 0.25 - Math.sin(time * 13) * 0.5;
        armR.rotation.z += (-0.25 - armR.rotation.z) * 0.12;
        armR.rotation.y += (-0.1 - armR.rotation.y) * 0.12;

        // Move legs
        legL.rotation.x = Math.sin(time * 13) * 0.4;
        legR.rotation.x = -Math.sin(time * 13) * 0.4;
        footL.rotation.x = Math.sin(time * 13) * 0.4;
        footR.rotation.x = -Math.sin(time * 13) * 0.4;

        // Tail wagging
        tailGroup.rotation.z = Math.sin(time * 13) * 0.12;
      } else {
        // Idle breathing
        rogiBodyGroup.position.y = Math.sin(time * 1.6) * 0.005;
        rogiBodyGroup.rotation.z += (0 - rogiBodyGroup.rotation.z) * 0.12;
        rogiBodyGroup.rotation.x += (0 - rogiBodyGroup.rotation.x) * 0.12;

        // Reset arms back to resting tummy pose
        armL.rotation.x += (0.4 - armL.rotation.x) * 0.12;
        armL.rotation.z += (1.1 - armL.rotation.z) * 0.12;
        armL.rotation.y += (0.5 - armL.rotation.y) * 0.12;

        armR.rotation.x += (0.4 - armR.rotation.x) * 0.12;
        armR.rotation.z += (-1.1 - armR.rotation.z) * 0.12;
        armR.rotation.y += (-0.5 - armR.rotation.y) * 0.12;

        // Reset legs / feet
        legL.rotation.x += (0 - legL.rotation.x) * 0.12;
        legR.rotation.x += (0 - legR.rotation.x) * 0.12;
        footL.rotation.x += (0 - footL.rotation.x) * 0.12;
        footR.rotation.x += (0 - footR.rotation.x) * 0.12;

        // Tail breathing wiggle
        tailGroup.rotation.z = Math.sin(time * 1.6) * 0.04;
      }

      // Adjust dropshadow scale depending on Rogi's height from floor
      const shadowHeightOffset = rogiBodyGroup.position.y;
      const shadowScale = Math.max(0.4, 1.0 - shadowHeightOffset * 2.8);
      shadowMesh.scale.set(shadowScale, shadowScale, 1.0);
      shadowMat.opacity = Math.max(0.12, 0.42 - shadowHeightOffset * 1.2) * (entered ? 1.0 : 0.0);

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
