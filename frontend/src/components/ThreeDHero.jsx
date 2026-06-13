import React, { useRef, useEffect, useState } from 'react';

export default function ThreeDHero({ onItemClick, onNearNPCChange, isEntered }) {
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(5, 8, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 0.9);
    fillLight.position.set(-5, 4, 2);
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

    // 6. Build Laboratory Interior Environment (White / Chrome SF Theme)
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6, // Bright white-gray epoxy floor
      roughness: 0.18,
      metalness: 0.4,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide
    });
    const floorMesh = new THREE.Mesh(new THREE.CircleGeometry(0.55, 32), floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.65;
    acornGroup.add(floorMesh);

    // White curved walls enclosing the room
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xfafafa, // Clean white laboratory panels
      roughness: 0.35,
      metalness: 0.15,
      transparent: true,
      opacity: 0.0,
      side: THREE.BackSide // Render interior face only
    });
    const wallMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.15, 32, 1, true), wallMaterial);
    wallMesh.position.y = -0.65 + 0.575;
    acornGroup.add(wallMesh);

    // Elegant silver horizontal wall trim
    const wallTrimMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Chrome steel trim
      roughness: 0.15,
      metalness: 0.9,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide
    });
    const wallTrimMesh1 = new THREE.Mesh(new THREE.RingGeometry(0.548, 0.55, 32), wallTrimMat);
    wallTrimMesh1.rotation.x = -Math.PI / 2;
    wallTrimMesh1.position.y = -0.15;
    acornGroup.add(wallTrimMesh1);

    const wallTrimMesh2 = new THREE.Mesh(new THREE.RingGeometry(0.548, 0.55, 32), wallTrimMat);
    wallTrimMesh2.rotation.x = -Math.PI / 2;
    wallTrimMesh2.position.y = 0.25;
    acornGroup.add(wallTrimMesh2);

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
      color: 0xf8fafc, // High-gloss white furniture
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.0
    });

    const metallicMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Chrome steel metal trim
      roughness: 0.12,
      metalness: 0.95,
      transparent: true,
      opacity: 0.0
    });

    // 6a. White Lab Table Top
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.02, 0.22), furnitureMat);
    tableTop.position.set(-0.25, -0.48, -0.1);
    furnitureGroup.add(tableTop);

    // Table Legs (Chrome)
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

    // 6b. Research Stool Chair (White + Chrome)
    const stoolSeat = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 12), furnitureMat);
    stoolSeat.position.set(-0.24, -0.54, 0.16);
    furnitureGroup.add(stoolSeat);
    const stoolLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.1, 8), metallicMat);
    stoolLeg.position.set(-0.24, -0.6, 0.16);
    furnitureGroup.add(stoolLeg);

    // 6c. Stacked Reports / Mini Books (on the floor)
    const bookColors = [0xcbd5e1, 0x3b82f6, 0x10b981]; // White-Gray, Blue, Green binders
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

    // 6e. Research Bookcase (White Cabinet at the back)
    const bookcaseGroup = new THREE.Group();
    bookcaseGroup.position.set(0, -0.64, -0.28); // Sits on floor y = -0.65
    furnitureGroup.add(bookcaseGroup);

    // Bookcase Frame Material
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9, // Glossy white/light gray
      roughness: 0.3,
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

    // Lab binder folders to fill shelves (Cool tone layout: Blue, White, Gray)
    const miniBookColors = [0x3b82f6, 0x64748b, 0x10b981, 0x94a3b8, 0x0284c7];
    for (let s = 0; s < 3; s++) { // 3 shelf rows
      const shelfY = s === 0 ? 0.01 : s === 1 ? 0.13 : 0.25;
      for (let b = 0; b < 6; b++) {
        const bookMat = new THREE.MeshStandardMaterial({
          color: miniBookColors[(s * 3 + b) % miniBookColors.length],
          roughness: 0.6,
          transparent: true,
          opacity: 0.0
        });
        const bookHeight = 0.052 + Math.random() * 0.012;
        const bookMesh = new THREE.Mesh(new THREE.BoxGeometry(0.012, bookHeight, 0.045), bookMat);
        bookMesh.position.set(-0.1 + b * 0.038, shelfY + bookHeight / 2, 0.025);
        if (Math.random() > 0.7) {
          bookMesh.rotation.z = (Math.random() - 0.5) * 0.15;
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
    hlCtx.fillStyle = 'rgba(15, 23, 42, 0.5)';
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
    hlCtx.font = 'bold 32px "Outfit", sans-serif';
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

    // Hologram Projector Base (white-metal disk on the floor)
    const projectorBaseMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.35,
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

    // Cyber Server Rack on the floor (White/Silver theme)
    const serverMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.4,
      metalness: 0.8,
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
      color: 0xf1f5f9, // Matte white casing
      roughness: 0.5,
      metalness: 0.2,
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

    // Tiny buttons on calculator (Chrome metal look)
    const btnMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.5,
      metalness: 0.7,
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
      color: 0xffffff, // Crisp clean white paper
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

    // 8. Reusable Squirrel NPC Mesh Generator Function
    const npcMaterialsList = [];
    
    const createSquirrel = (colorPalette, options = {}) => {
      const sqGroup = new THREE.Group();
      const sqBodyGroup = new THREE.Group();
      sqGroup.add(sqBodyGroup);

      const createNPCMat = (color, roughness = 0.5, metalness = 0.1) => {
        const mat = new THREE.MeshStandardMaterial({
          color: color,
          roughness: roughness,
          metalness: metalness,
          transparent: true,
          opacity: 0.0
        });
        npcMaterialsList.push(mat);
        return mat;
      };

      const cMain = createNPCMat(colorPalette.main, 0.7, 0.02);
      const cLight = createNPCMat(colorPalette.light, 0.6, 0.02);
      const cPink = createNPCMat(0xffc0cb, 0.6, 0.02);
      const cDark = createNPCMat(colorPalette.dark || 0x422216, 0.85, 0.02);
      const cBlack = createNPCMat(0x0e0e0e, 0.15, 0.85);
      const cWhite = createNPCMat(0xffffff, 0.05, 0.95);

      // Clothes / Coat Mat
      const coatMat = options.coatColor ? createNPCMat(options.coatColor, 0.7, 0.05) : null;
      const primaryBodyMat = coatMat ? coatMat : cMain;

      // 8a. Tummy / Lower Body (Sphere)
      const sqBodyGeom = new THREE.SphereGeometry(0.09, 18, 18);
      sqBodyGeom.scale(1.0, 1.25, 0.95);
      const sqBodyMesh = new THREE.Mesh(sqBodyGeom, primaryBodyMat);
      sqBodyMesh.position.y = 0.11;
      sqBodyGroup.add(sqBodyMesh);

      // Light belly patch
      const sqBellyGeom = new THREE.SphereGeometry(0.075, 18, 18);
      sqBellyGeom.scale(0.82, 1.02, 0.45);
      const sqBellyMesh = new THREE.Mesh(sqBellyGeom, cLight);
      sqBellyMesh.position.set(0, 0.095, 0.055);
      sqBodyGroup.add(sqBellyMesh);

      // Back stripes
      if (!options.coatColor) {
        const stripeL = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.14, 0.008), cDark);
        stripeL.position.set(-0.03, 0.11, -0.078);
        sqBodyGroup.add(stripeL);
        const stripeC = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.14, 0.008), cLight);
        stripeC.position.set(0, 0.11, -0.082);
        sqBodyGroup.add(stripeC);
        const stripeR = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.14, 0.008), cDark);
        stripeR.position.set(0.03, 0.11, -0.078);
        sqBodyGroup.add(stripeR);
      }

      // 8b. Head (Sphere)
      const sqHeadGeom = new THREE.SphereGeometry(0.085, 18, 18);
      const sqHeadMesh = new THREE.Mesh(sqHeadGeom, cMain);
      sqHeadMesh.position.set(0, 0.22, 0);
      sqBodyGroup.add(sqHeadMesh);

      // Forehead stripe
      const sqForeheadStripe = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.055, 0.008), cDark);
      sqForeheadStripe.position.set(0, 0.26, 0.075);
      sqForeheadStripe.rotation.x = -Math.PI / 12;
      sqBodyGroup.add(sqForeheadStripe);

      // Chubby cheeks
      const sqCheekL = new THREE.Mesh(new THREE.SphereGeometry(0.036, 14, 14), cLight);
      sqCheekL.position.set(-0.024, 0.195, 0.055);
      sqBodyGroup.add(sqCheekL);
      const sqCheekR = new THREE.Mesh(new THREE.SphereGeometry(0.036, 14, 14), cLight);
      sqCheekR.position.set(0.024, 0.195, 0.055);
      sqBodyGroup.add(sqCheekR);

      // Nose
      const sqNoseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), cBlack);
      sqNoseMesh.position.set(0, 0.208, 0.086);
      sqBodyGroup.add(sqNoseMesh);

      // Eyes
      const sqEyeGeom = new THREE.SphereGeometry(0.018, 14, 14);
      const sqEyeL = new THREE.Mesh(sqEyeGeom, cBlack);
      sqEyeL.position.set(-0.035, 0.23, 0.062);
      sqBodyGroup.add(sqEyeL);
      const sqEyeR = new THREE.Mesh(sqEyeGeom, sqEyeL.material);
      sqEyeR.position.set(0.035, 0.23, 0.062);
      sqBodyGroup.add(sqEyeR);

      // Eye Highlights
      const sqGlareGeom = new THREE.SphereGeometry(0.006, 8, 8);
      const sqGlareL = new THREE.Mesh(sqGlareGeom, cWhite);
      sqGlareL.position.set(-0.03, 0.238, 0.074);
      sqBodyGroup.add(sqGlareL);
      const sqGlareR = new THREE.Mesh(sqGlareGeom, sqGlareL.material);
      sqGlareR.position.set(0.04, 0.238, 0.074);
      sqBodyGroup.add(sqGlareR);

      // Glasses Option
      if (options.hasGlasses) {
        const glassesGroup = new THREE.Group();
        glassesGroup.position.set(0, 0.23, 0.07);
        const glassFrameMat = createNPCMat(options.glassesColor || 0x1a202c, 0.3, 0.8);
        
        // Left frame ring
        const ringGeom = new THREE.TorusGeometry(0.02, 0.003, 8, 16);
        const fL = new THREE.Mesh(ringGeom, glassFrameMat);
        fL.position.set(-0.033, 0, 0);
        glassesGroup.add(fL);

        // Right frame ring
        const fR = new THREE.Mesh(ringGeom, glassFrameMat);
        fR.position.set(0.033, 0, 0);
        glassesGroup.add(fR);

        // Center bridge
        const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.004, 0.004), glassFrameMat);
        bridge.position.set(0, 0.005, 0);
        glassesGroup.add(bridge);

        sqBodyGroup.add(glassesGroup);
      }

      // 8c. Ears
      const sqEarGeom = new THREE.ConeGeometry(0.03, 0.075, 4);
      sqEarGeom.rotateX(Math.PI / 8);

      const sqEarL = new THREE.Mesh(sqEarGeom, cMain);
      sqEarL.position.set(-0.058, 0.292, 0.005);
      sqEarL.rotation.z = 0.24;
      sqBodyGroup.add(sqEarL);

      const sqInnerEarL = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.055, 4), cPink);
      sqInnerEarL.position.set(-0.052, 0.284, 0.014);
      sqInnerEarL.rotation.z = 0.24;
      sqBodyGroup.add(sqInnerEarL);

      const sqEarR = new THREE.Mesh(sqEarGeom, cMain);
      sqEarR.position.set(0.058, 0.292, 0.005);
      sqEarR.rotation.z = -0.24;
      sqBodyGroup.add(sqEarR);

      const sqInnerEarR = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.055, 4), cPink);
      sqInnerEarR.position.set(0.052, 0.284, 0.014);
      sqInnerEarR.rotation.z = -0.24;
      sqBodyGroup.add(sqInnerEarR);

      // 8d. Arms (Cylinders)
      const sqArmGeom = new THREE.CylinderGeometry(0.015, 0.011, 0.065, 8);
      sqArmGeom.translate(0, -0.03, 0);

      const sqArmL = new THREE.Mesh(sqArmGeom, coatMat ? coatMat : cMain);
      sqArmL.position.set(-0.085, 0.14, 0.025);
      sqArmL.rotation.z = 1.1; // resting pose
      sqArmL.rotation.y = 0.5;
      sqArmL.rotation.x = 0.4;
      sqBodyGroup.add(sqArmL);

      const sqArmR = new THREE.Mesh(sqArmGeom, coatMat ? coatMat : cMain);
      sqArmR.position.set(0.085, 0.14, 0.025);
      sqArmR.rotation.z = -1.1; // resting pose
      sqArmR.rotation.y = -0.5;
      sqArmR.rotation.x = 0.4;
      sqBodyGroup.add(sqArmR);

      // 8e. Legs & feet
      const sqLegGeom = new THREE.CylinderGeometry(0.022, 0.02, 0.04, 8);
      const sqLegL = new THREE.Mesh(sqLegGeom, coatMat ? coatMat : cMain);
      sqLegL.position.set(-0.045, 0.02, 0.002);
      sqBodyGroup.add(sqLegL);

      const sqLegR = new THREE.Mesh(sqLegGeom, coatMat ? coatMat : cMain);
      sqLegR.position.set(0.045, 0.02, 0.002);
      sqBodyGroup.add(sqLegR);

      const sqFootGeom = new THREE.BoxGeometry(0.03, 0.015, 0.055);
      const sqFootL = new THREE.Mesh(sqFootGeom, cLight);
      sqFootL.position.set(-0.045, 0.0075, 0.012);
      sqBodyGroup.add(sqFootL);

      const sqFootR = new THREE.Mesh(sqFootGeom, cLight);
      sqFootR.position.set(0.045, 0.0075, 0.012);
      sqBodyGroup.add(sqFootR);

      // 8f. Tail
      const sqTailGroup = new THREE.Group();
      sqTailGroup.position.set(0, 0.07, -0.07);
      sqBodyGroup.add(sqTailGroup);

      const numTailSegs = 6;
      for (let i = 0; i < numTailSegs; i++) {
        const tRatio = i / (numTailSegs - 1);
        const segSize = 0.042 + Math.sin(tRatio * Math.PI) * 0.065;
        const segGeom = new THREE.SphereGeometry(segSize, 10, 10);
        const segMesh = new THREE.Mesh(segGeom, cMain);
        
        const arcAngle = tRatio * Math.PI * 0.88;
        const radius = 0.14;
        segMesh.position.z = -Math.sin(arcAngle) * radius;
        segMesh.position.y = Math.cos(arcAngle) * radius + 0.07;
        
        sqTailGroup.add(segMesh);

        if (i % 2 === 1) {
          const stripeGeom = new THREE.SphereGeometry(segSize + 0.002, 10, 10);
          stripeGeom.scale(1.04, 1.0, 0.38);
          const stripeMesh = new THREE.Mesh(stripeGeom, cDark);
          stripeMesh.position.copy(segMesh.position);
          stripeMesh.rotation.x = arcAngle;
          sqTailGroup.add(stripeMesh);
        }
      }

      return {
        mesh: sqGroup,
        bodyGroup: sqBodyGroup,
        armL: sqArmL,
        armR: sqArmR,
        legL: sqLegL,
        legR: sqLegR,
        tail: sqTailGroup
      };
    };

    // 8g. Create Rogi (Player Squirrel)
    const rogiObj = createSquirrel(
      { main: 0xbb6c3a, light: 0xfff5e6, dark: 0x422216 }, // Rogi's original warm palette
      { hasGlasses: false }
    );
    rogiObj.mesh.position.set(0, -0.64, 0.15);
    acornGroup.add(rogiObj.mesh);

    // 8h. Create NPC 1: 뉴스 제작 연구원 (Hologram Screen 앞)
    const npcNews = createSquirrel(
      { main: 0x4a5568, light: 0xe2e8f0, dark: 0x1e293b },
      { hasGlasses: true, glassesColor: 0x1e293b, coatColor: 0xffffff }
    );
    npcNews.mesh.position.set(0.18, -0.64, -0.1); 
    npcNews.mesh.rotation.y = -Math.PI / 4; 
    npcNews.mesh.userData = { id: 'npc_news' };
    acornGroup.add(npcNews.mesh);
    clickables.push(npcNews.mesh);

    // 8i. Create NPC 2: 환율 계산 연구원 (Desk/Calculator 앞)
    const npcCalc = createSquirrel(
      { main: 0xfbd38d, light: 0xfffaf0, dark: 0x7b341e },
      { hasGlasses: true, glassesColor: 0xd69e2e, coatColor: 0xffffff }
    );
    npcCalc.mesh.position.set(-0.25, -0.64, 0.05); 
    npcCalc.mesh.rotation.y = Math.PI / 3; 
    npcCalc.mesh.userData = { id: 'npc_calc' };
    acornGroup.add(npcCalc.mesh);
    clickables.push(npcCalc.mesh);

    // 8j. Create NPC 3: 혜택 안내 연구원 (Mailbox/Envelope 앞)
    const npcBenefit = createSquirrel(
      { main: 0xd69e2e, light: 0xfefcbf, dark: 0x4a3728 },
      { hasGlasses: false, coatColor: 0xe53e3e } 
    );
    npcBenefit.mesh.position.set(-0.15, -0.64, -0.21); 
    npcBenefit.mesh.rotation.y = Math.PI / 5;
    npcBenefit.mesh.userData = { id: 'npc_benefit' };
    acornGroup.add(npcBenefit.mesh);
    clickables.push(npcBenefit.mesh);

    // 8k. Create NPC 4: 금융 대시보드 연구원 (Holographic Globe 앞)
    const npcDashboard = createSquirrel(
      { main: 0xf6e05e, light: 0xfffaf0, dark: 0x744210 },
      { hasGlasses: true, glassesColor: 0xa0aec0, coatColor: 0x3182ce } 
    );
    npcDashboard.mesh.position.set(-0.35, -0.64, -0.08); 
    npcDashboard.mesh.rotation.y = Math.PI / 2.5;
    npcDashboard.mesh.userData = { id: 'npc_dashboard' };
    acornGroup.add(npcDashboard.mesh);
    clickables.push(npcDashboard.mesh);

    // 8l. Dropshadow for Rogi
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(new THREE.CircleGeometry(0.075, 16), shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -0.648, 0.15); 
    shadowMesh.renderOrder = 1;
    acornGroup.add(shadowMesh);

    // Dropshadows for NPCs
    const createNPCShadow = (npcMesh) => {
      const npcShadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.0,
        depthWrite: false
      });
      const npcShadowMesh = new THREE.Mesh(new THREE.CircleGeometry(0.07, 16), npcShadowMat);
      npcShadowMesh.rotation.x = -Math.PI / 2;
      npcShadowMesh.position.set(npcMesh.position.x, -0.648, npcMesh.position.z);
      npcShadowMesh.renderOrder = 1;
      acornGroup.add(npcShadowMesh);
      return { mesh: npcShadowMesh, mat: npcShadowMat };
    };

    const shadowNews = createNPCShadow(npcNews.mesh);
    const shadowCalc = createNPCShadow(npcCalc.mesh);
    const shadowBenefit = createNPCShadow(npcBenefit.mesh);
    const shadowDashboard = createNPCShadow(npcDashboard.mesh);

    // 9. Mouse Tracker & Raycaster variables
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    const checkIntersection = (x, y) => {
      mouseVec.set(x, y);
      acornGroup.updateMatrixWorld(true);
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

      if (!isEnteredRef.current) {
        canvasRef.current.style.cursor = 'grab';
        return;
      }

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
          if (obj.userData.id === 'news' || obj.userData.id === 'npc_news') {
            hlMaterial.emissiveIntensity = 1.4;
          } else if (obj.userData.id === 'calculators' || obj.userData.id === 'npc_calc') {
            calcScreenMat.emissiveIntensity = 0.95;
            calcScreenMat.emissive.setHex(0xffbb00);
          } else if (obj.userData.id === 'dashboard' || obj.userData.id === 'npc_dashboard') {
            globeMat.emissiveIntensity = 1.3;
            globeMat.emissive.setHex(0x00ffaa);
          } else if (obj.userData.id === 'subscribe' || obj.userData.id === 'npc_benefit') {
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
            if (obj.userData.id === 'npc_news') onItemClick('news');
            else if (obj.userData.id === 'npc_calc') onItemClick('calculators');
            else if (obj.userData.id === 'npc_benefit') onItemClick('subscribe');
            else if (obj.userData.id === 'npc_dashboard') onItemClick('dashboard');
            else onItemClick(obj.userData.id);
          }
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvasRef.current.addEventListener('click', handleCanvasClick);

    // 10. Keyboard Controls Tracker
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
    let rogiZ = 0.15; 
    const rogiSpeed = 0.0065; 

    let currentNearNPCId = null;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      mouseX += (targetMouseX - mouseX) * 0.07;
      mouseY += (targetMouseY - mouseY) * 0.07;

      acornGroup.rotation.y = time * 0.18 + mouseX * 0.6;
      acornGroup.rotation.x = mouseY * 0.35;
      acornGroup.position.y = Math.sin(time * 0.8) * 0.05;

      globeMesh.rotation.y = time * 0.4;
      globeMesh.rotation.x = time * 0.1;

      const entered = isEnteredRef.current;

      if (entered) {
        const targetCamX = rogiX * 0.72; 
        const targetCamY = 0.28;        
        const targetCamZ = rogiZ + 1.62; 

        camera.position.x += (targetCamX - camera.position.x) * 0.07;
        camera.position.y += (targetCamY - camera.position.y) * 0.07;
        camera.position.z += (targetCamZ - camera.position.z) * 0.07;

        camera.lookAt(new THREE.Vector3(camera.position.x, -0.64 + 0.14, camera.position.z - 1.62));
      } else {
        camera.position.x += (0 - camera.position.x) * 0.08;
        camera.position.y += (0 - camera.position.y) * 0.08;
        camera.position.z += (5.2 - camera.position.z) * 0.08;
        camera.lookAt(new THREE.Vector3(0, 0, 0));
      }

      const targetShellOpacity = entered ? 0.0 : 1.0;
      glassMaterial.opacity += (targetShellOpacity - glassMaterial.opacity) * 0.08;
      capMaterial.opacity += (targetShellOpacity - capMaterial.opacity) * 0.08;
      stemMaterial.opacity += (targetShellOpacity - stemMaterial.opacity) * 0.08;

      const targetInteriorOpacity = entered ? 1.0 : 0.0;
      floorMaterial.opacity += (targetInteriorOpacity - floorMaterial.opacity) * 0.08;
      wallMaterial.opacity += (targetInteriorOpacity * 0.95 - wallMaterial.opacity) * 0.08;
      wallTrimMat.opacity += (targetInteriorOpacity - wallTrimMat.opacity) * 0.08;
      furnitureMat.opacity += (targetInteriorOpacity - furnitureMat.opacity) * 0.08;
      metallicMat.opacity += (targetInteriorOpacity - metallicMat.opacity) * 0.08;
      glassBodyMat.opacity += (targetInteriorOpacity - glassBodyMat.opacity) * 0.08;
      flLiquidMat.opacity += (targetInteriorOpacity - flLiquidMat.opacity) * 0.08;
      bkLiquidMat.opacity += (targetInteriorOpacity - bkLiquidMat.opacity) * 0.08;
      
      frameMat.opacity += (targetInteriorOpacity - frameMat.opacity) * 0.08;
      bookcaseGroup.children.forEach(child => {
        if (child.material && child.material !== frameMat) {
          child.material.opacity += (targetInteriorOpacity - child.material.opacity) * 0.08;
        }
      });
      
      hlMaterial.opacity += (targetInteriorOpacity - hlMaterial.opacity) * 0.08;
      calcBodyMat.opacity += (targetInteriorOpacity - calcBodyMat.opacity) * 0.08;
      calcScreenMat.opacity += (targetInteriorOpacity - calcScreenMat.opacity) * 0.08;
      btnMat.opacity += (targetInteriorOpacity - btnMat.opacity) * 0.08;
      globeMat.opacity += (targetInteriorOpacity - globeMat.opacity) * 0.08;
      envPaperMat.opacity += (targetInteriorOpacity - envPaperMat.opacity) * 0.08;
      sealMat.opacity += (targetInteriorOpacity - sealMat.opacity) * 0.08;

      projectorBaseMat.opacity += (targetInteriorOpacity - projectorBaseMat.opacity) * 0.08;
      beamMat.opacity += ((entered ? 0.24 + Math.sin(time * 6) * 0.05 : 0) - beamMat.opacity) * 0.08;
      ringMat.opacity += ((entered ? 0.45 : 0) - ringMat.opacity) * 0.08;
      serverMat.opacity += (targetInteriorOpacity - serverMat.opacity) * 0.08;
      serverLeds.forEach((led, idx) => {
        const blinkVal = entered ? (Math.sin(time * 9 + idx * 1.5) > 0.1 ? 0.85 : 0.15) : 0;
        led.material.opacity += (blinkVal - led.material.opacity) * 0.15;
      });

      npcMaterialsList.forEach(m => {
        m.opacity += (targetInteriorOpacity - m.opacity) * 0.08;
      });

      const targetShadowOpacity = entered ? 0.38 : 0.0;
      shadowNews.mat.opacity += (targetShadowOpacity - shadowNews.mat.opacity) * 0.08;
      shadowCalc.mat.opacity += (targetShadowOpacity - shadowCalc.mat.opacity) * 0.08;
      shadowBenefit.mat.opacity += (targetShadowOpacity - shadowBenefit.mat.opacity) * 0.08;
      shadowDashboard.mat.opacity += (targetShadowOpacity - shadowDashboard.mat.opacity) * 0.08;

      bookGroup.children.forEach(b => {
        b.material.opacity += (targetInteriorOpacity - b.material.opacity) * 0.08;
      });

      // Rogi walking
      let isWalking = false;
      let moveX = 0;
      let moveZ = 0;

      if (entered) {
        if (keysPressed.Left) moveX -= 1;
        if (keysPressed.Right) moveX += 1;
        if (keysPressed.Forward) moveZ -= 1; 
        if (keysPressed.Backward) moveZ += 1;
      }

      let targetRogiRotY = 0;

      if (moveX !== 0 || moveZ !== 0) {
        isWalking = true;
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        rogiX += (moveX / length) * rogiSpeed;
        rogiZ += (moveZ / length) * rogiSpeed;
        targetRogiRotY = Math.atan2(moveX, moveZ);
      }

      const dist = Math.sqrt(rogiX * rogiX + rogiZ * rogiZ);
      const maxRadius = 0.44;
      if (dist > maxRadius) {
        const angle = Math.atan2(rogiZ, rogiX);
        rogiX = Math.cos(angle) * maxRadius;
        rogiZ = Math.sin(angle) * maxRadius;
      }

      rogiObj.mesh.position.x = rogiX;
      rogiObj.mesh.position.z = rogiZ;
      shadowMesh.position.x = rogiX;
      shadowMesh.position.z = rogiZ;

      if (isWalking) {
        rogiObj.mesh.rotation.y += (targetRogiRotY - rogiObj.mesh.rotation.y) * 0.16;
      } else {
        rogiObj.mesh.rotation.y += (0 - rogiObj.mesh.rotation.y) * 0.12;
      }

      if (isWalking) {
        rogiObj.bodyGroup.position.y = Math.abs(Math.sin(time * 13)) * 0.022;
        rogiObj.bodyGroup.rotation.z = Math.sin(time * 13) * 0.045;
        rogiObj.bodyGroup.rotation.x = 0.04;

        rogiObj.armL.rotation.x = 0.25 + Math.sin(time * 13) * 0.5;
        rogiObj.armL.rotation.z += (0.25 - rogiObj.armL.rotation.z) * 0.12;
        rogiObj.armL.rotation.y += (0.1 - rogiObj.armL.rotation.y) * 0.12;

        rogiObj.armR.rotation.x = 0.25 - Math.sin(time * 13) * 0.5;
        rogiObj.armR.rotation.z += (-0.25 - rogiObj.armR.rotation.z) * 0.12;
        rogiObj.armR.rotation.y += (-0.1 - rogiObj.armR.rotation.y) * 0.12;

        rogiObj.legL.rotation.x = Math.sin(time * 13) * 0.4;
        rogiObj.legR.rotation.x = -Math.sin(time * 13) * 0.4;

        rogiObj.tail.rotation.z = Math.sin(time * 13) * 0.12;
      } else {
        rogiObj.bodyGroup.position.y = Math.sin(time * 1.6) * 0.005;
        rogiObj.bodyGroup.rotation.z += (0 - rogiObj.bodyGroup.rotation.z) * 0.12;
        rogiObj.bodyGroup.rotation.x += (0 - rogiObj.bodyGroup.rotation.x) * 0.12;

        rogiObj.armL.rotation.x += (0.4 - rogiObj.armL.rotation.x) * 0.12;
        rogiObj.armL.rotation.z += (1.1 - rogiObj.armL.rotation.z) * 0.12;
        rogiObj.armL.rotation.y += (0.5 - rogiObj.armL.rotation.y) * 0.12;

        rogiObj.armR.rotation.x += (0.4 - rogiObj.armR.rotation.x) * 0.12;
        rogiObj.armR.rotation.z += (-1.1 - rogiObj.armR.rotation.z) * 0.12;
        rogiObj.armR.rotation.y += (-0.5 - rogiObj.armR.rotation.y) * 0.12;

        rogiObj.legL.rotation.x += (0 - rogiObj.legL.rotation.x) * 0.12;
        rogiObj.legR.rotation.x += (0 - rogiObj.legR.rotation.x) * 0.12;

        rogiObj.tail.rotation.z = Math.sin(time * 1.6) * 0.04;
      }

      // NPCs animation and lookAt player
      const animateNPCIdle = (npc, offset) => {
        npc.bodyGroup.position.y = Math.sin(time * 1.4 + offset) * 0.004;
        npc.tail.rotation.z = Math.sin(time * 1.4 + offset) * 0.03;
        
        const dx = rogiX - npc.mesh.position.x;
        const dz = rogiZ - npc.mesh.position.z;
        const nDist = Math.sqrt(dx*dx + dz*dz);
        if (nDist < 0.28) {
          const targetRot = Math.atan2(dx, dz);
          let diff = targetRot - npc.mesh.rotation.y;
          diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          npc.mesh.rotation.y += diff * 0.08;
        }
      };

      animateNPCIdle(npcNews, 0.0);
      animateNPCIdle(npcCalc, 1.0);
      animateNPCIdle(npcBenefit, 2.0);
      animateNPCIdle(npcDashboard, 3.0);

      const shadowHeightOffset = rogiObj.bodyGroup.position.y;
      const shadowScale = Math.max(0.4, 1.0 - shadowHeightOffset * 2.8);
      shadowMesh.scale.set(shadowScale, shadowScale, 1.0);
      shadowMat.opacity = Math.max(0.12, 0.42 - shadowHeightOffset * 1.2) * (entered ? 1.0 : 0.0);

      // Realtime NPC Proximity Detection
      if (entered) {
        const npcs = [
          { id: 'npc_news', name: '차돌 뉴스 연구원', role: '실시간 뉴스 분석 중', x: npcNews.mesh.position.x, z: npcNews.mesh.position.z },
          { id: 'npc_calc', name: '뽀짝 환율 연구원', role: '오늘의 환율 계산 중', x: npcCalc.mesh.position.x, z: npcCalc.mesh.position.z },
          { id: 'npc_benefit', name: '베이지 혜택 연구원', role: '연구소 구독 혜택 안내 중', x: npcBenefit.mesh.position.x, z: npcBenefit.mesh.position.z },
          { id: 'npc_dashboard', name: '노랑 지표 연구원', role: '금융 지표 분석 중', x: npcDashboard.mesh.position.x, z: npcDashboard.mesh.position.z }
        ];

        let closestNPC = null;
        let minNPCListDist = 0.22; // Proximity threshold

        npcs.forEach(npc => {
          const dx = rogiX - npc.x;
          const dz = rogiZ - npc.z;
          const distance = Math.sqrt(dx * dx + dz * dz);
          if (distance < minNPCListDist) {
            minNPCListDist = distance;
            closestNPC = npc;
          }
        });

        const newNearId = closestNPC ? closestNPC.id : null;
        if (newNearId !== currentNearNPCId) {
          currentNearNPCId = newNearId;
          if (onNearNPCChange) {
            onNearNPCChange(closestNPC); 
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

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
