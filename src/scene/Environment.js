/**
 * Environment.js - Meadow, sky, lighting
 * Creates the magical environment around the tree
 */

import * as THREE from 'three';

export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.time = 0;
    
    this.createGround();
    this.createHills();
    this.createSky();
    this.createLighting();
    this.createPuddles();
    this.createFireflies();
    this.createFlowers();
  }
  
  /**
   * Create the flower meadow ground
   */
  createGround() {
    // Main ground plane
    const groundGeometry = new THREE.CircleGeometry(50, 64);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d4a1c,
      roughness: 0.9,
      metalness: 0.0
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Grass particles
    this.createGrassParticles();
  }
  
  /**
   * Create grass particle system
   */
  createGrassParticles() {
    const grassCount = 10000;
    const positions = new Float32Array(grassCount * 3);
    const colors = new Float32Array(grassCount * 3);
    
    for (let i = 0; i < grassCount; i++) {
      // Random position on ground
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 40;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.random() * 0.3;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      // Grass color variation
      colors[i * 3] = 0.2 + Math.random() * 0.15;
      colors[i * 3 + 1] = 0.4 + Math.random() * 0.3;
      colors[i * 3 + 2] = 0.1 + Math.random() * 0.1;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    const grass = new THREE.Points(geometry, material);
    this.scene.add(grass);
  }
  
  /**
   * Create soft rolling hills in background
   */
  createHills() {
    const hillMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a3310,
      roughness: 1.0,
      metalness: 0.0
    });
    
    const hillConfigs = [
      { x: -30, z: -40, radius: 15, height: 8 },
      { x: 25, z: -35, radius: 12, height: 6 },
      { x: -15, z: -50, radius: 20, height: 10 },
      { x: 35, z: -45, radius: 18, height: 7 },
      { x: 0, z: -55, radius: 25, height: 12 },
    ];
    
    hillConfigs.forEach(config => {
      const hillGeom = new THREE.SphereGeometry(config.radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const hill = new THREE.Mesh(hillGeom, hillMaterial);
      hill.position.set(config.x, 0, config.z);
      hill.scale.y = config.height / config.radius;
      this.scene.add(hill);
    });
  }
  
  /**
   * Create atmospheric sky
   */
  createSky() {
    // Sky dome with gradient
    const skyGeometry = new THREE.SphereGeometry(100, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0a0a20) },
        bottomColor: { value: new THREE.Color(0x2d1b4e) },
        horizonColor: { value: new THREE.Color(0xff6b35) },
        sunPosition: { value: new THREE.Vector3(30, 15, -50) }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 horizonColor;
        uniform vec3 sunPosition;
        varying vec3 vWorldPosition;
        
        void main() {
          float h = normalize(vWorldPosition).y;
          
          // Create gradient from bottom to top
          vec3 color;
          if (h < 0.0) {
            color = bottomColor;
          } else if (h < 0.3) {
            float t = h / 0.3;
            color = mix(horizonColor, bottomColor, t);
          } else {
            float t = (h - 0.3) / 0.7;
            color = mix(bottomColor, topColor, t);
          }
          
          // Add subtle stars
          float stars = step(0.998, fract(sin(dot(vWorldPosition.xz, vec2(12.9898, 78.233))) * 43758.5453));
          color += vec3(stars) * step(0.5, h) * 0.5;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide
    });
    
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.skyMaterial = skyMaterial;
    this.scene.add(sky);
  }
  
  /**
   * Create scene lighting
   */
  createLighting() {
    // Ambient light for base illumination
    const ambient = new THREE.AmbientLight(0x404060, 0.3);
    this.scene.add(ambient);
    this.ambientLight = ambient;
    
    // Main sun light (warm golden hour)
    const sunLight = new THREE.DirectionalLight(0xffd27f, 1.2);
    sunLight.position.set(30, 20, -10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    this.scene.add(sunLight);
    this.sunLight = sunLight;
    
    // Cool fill light from opposite side (twilight)
    const fillLight = new THREE.DirectionalLight(0x6b8cff, 0.4);
    fillLight.position.set(-20, 15, 10);
    this.scene.add(fillLight);
    this.fillLight = fillLight;
    
    // Rim light for tree silhouette
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
    rimLight.position.set(0, 30, 20);
    this.scene.add(rimLight);
    
    // Ground bounce light
    const bounceLight = new THREE.HemisphereLight(0x4a7c2c, 0x2d1b4e, 0.3);
    this.scene.add(bounceLight);
    this.bounceLight = bounceLight;
  }
  
  /**
   * Create reflective puddles
   */
  createPuddles() {
    const puddleConfigs = [
      { x: 5, z: 8, size: 2 },
      { x: -4, z: 6, size: 1.5 },
      { x: 8, z: 4, size: 1.8 },
      { x: -7, z: 9, size: 2.2 },
    ];
    
    const puddleMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a2a3a,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.7
    });
    
    puddleConfigs.forEach(config => {
      const puddleGeom = new THREE.CircleGeometry(config.size, 32);
      const puddle = new THREE.Mesh(puddleGeom, puddleMaterial);
      puddle.rotation.x = -Math.PI / 2;
      puddle.position.set(config.x, 0.01, config.z);
      this.scene.add(puddle);
    });
  }
  
  /**
   * Create firefly particle system
   */
  createFireflies() {
    const fireflyCount = 100;
    const positions = new Float32Array(fireflyCount * 3);
    const velocities = [];
    
    for (let i = 0; i < fireflyCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = 1 + Math.random() * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.02,
        phase: Math.random() * Math.PI * 2
      });
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: window.devicePixelRatio }
      },
      vertexShader: `
        uniform float time;
        uniform float pixelRatio;
        varying float vAlpha;
        
        void main() {
          // Flickering effect
          float flicker = sin(time * 3.0 + position.x * 10.0) * 0.5 + 0.5;
          flicker *= sin(time * 5.0 + position.z * 8.0) * 0.5 + 0.5;
          vAlpha = flicker;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (3.0 + flicker * 2.0) * pixelRatio * (100.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        
        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          float alpha = (1.0 - smoothstep(0.0, 0.5, dist)) * vAlpha;
          
          vec3 color = vec3(1.0, 0.95, 0.5);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    this.fireflies = new THREE.Points(geometry, material);
    this.fireflyMaterial = material;
    this.fireflyVelocities = velocities;
    this.scene.add(this.fireflies);
  }
  
  /**
   * Create meadow flowers
   */
  createFlowers() {
    const flowerCount = 500;
    const positions = new Float32Array(flowerCount * 3);
    const colors = new Float32Array(flowerCount * 3);
    
    const flowerColors = [
      { r: 1.0, g: 0.4, b: 0.4 }, // Red
      { r: 1.0, g: 0.8, b: 0.2 }, // Yellow
      { r: 0.9, g: 0.5, b: 0.9 }, // Purple
      { r: 1.0, g: 1.0, b: 1.0 }, // White
      { r: 0.4, g: 0.6, b: 1.0 }, // Blue
    ];
    
    for (let i = 0; i < flowerCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 35;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 0.2 + Math.random() * 0.3;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      const colorIndex = Math.floor(Math.random() * flowerColors.length);
      const color = flowerColors[colorIndex];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.9
    });
    
    const flowers = new THREE.Points(geometry, material);
    this.scene.add(flowers);
  }
  
  /**
   * Update environment animations
   */
  update(deltaTime) {
    this.time += deltaTime;
    
    // Update fireflies
    if (this.fireflyMaterial) {
      this.fireflyMaterial.uniforms.time.value = this.time;
    }
    
    // Move fireflies
    if (this.fireflies && this.fireflyVelocities) {
      const positions = this.fireflies.geometry.attributes.position.array;
      
      for (let i = 0; i < this.fireflyVelocities.length; i++) {
        const vel = this.fireflyVelocities[i];
        
        // Sinusoidal movement
        positions[i * 3] += Math.sin(this.time + vel.phase) * vel.x;
        positions[i * 3 + 1] += Math.sin(this.time * 0.5 + vel.phase) * vel.y;
        positions[i * 3 + 2] += Math.cos(this.time + vel.phase) * vel.z;
        
        // Keep within bounds
        if (Math.abs(positions[i * 3]) > 20) positions[i * 3] *= 0.9;
        if (positions[i * 3 + 1] < 1) positions[i * 3 + 1] = 1;
        if (positions[i * 3 + 1] > 15) positions[i * 3 + 1] = 15;
        if (Math.abs(positions[i * 3 + 2]) > 20) positions[i * 3 + 2] *= 0.9;
      }
      
      this.fireflies.geometry.attributes.position.needsUpdate = true;
    }
  }
  
  /**
   * Set weather lighting
   */
  setWeather(weather) {
    switch (weather) {
      case 'clear':
        this.sunLight.intensity = 1.2;
        this.ambientLight.intensity = 0.3;
        break;
      case 'rain':
        this.sunLight.intensity = 0.4;
        this.ambientLight.intensity = 0.5;
        break;
      case 'fog':
        this.sunLight.intensity = 0.3;
        this.ambientLight.intensity = 0.6;
        break;
      case 'snow':
        this.sunLight.intensity = 0.8;
        this.sunLight.color.setHex(0xffffff);
        this.ambientLight.intensity = 0.5;
        break;
      case 'wind':
        this.sunLight.intensity = 1.0;
        this.ambientLight.intensity = 0.35;
        break;
    }
  }
}
