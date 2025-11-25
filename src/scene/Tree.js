/**
 * Tree.js - Magical Tree Mesh & Materials
 * Creates the central magical tree with glowing trunk veins
 */

import * as THREE from 'three';

export class MagicalTree {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.time = 0;
    
    this.createTrunk();
    this.createBranches();
    this.createRoots();
    this.createCanopyParticles();
    
    this.scene.add(this.group);
  }
  
  /**
   * Create the main trunk with glowing veins
   */
  createTrunk() {
    // Main trunk geometry - tapered cylinder
    const trunkGeometry = new THREE.CylinderGeometry(0.8, 1.5, 8, 32, 16, false);
    
    // Custom shader material for glowing veins
    this.trunkMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(0x3d2817) },
        veinColor: { value: new THREE.Color(0xffd700) },
        veinIntensity: { value: 1.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vUv = uv;
          vPosition = position;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 baseColor;
        uniform vec3 veinColor;
        uniform float veinIntensity;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                             -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m;
          m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }
        
        void main() {
          // Create vein pattern using noise
          float veinPattern = snoise(vec2(vUv.x * 20.0, vUv.y * 5.0 + time * 0.1));
          veinPattern += snoise(vec2(vUv.x * 40.0, vUv.y * 10.0 - time * 0.05)) * 0.5;
          
          // Create vertical vein lines
          float verticalVeins = sin(vUv.x * 50.0 + veinPattern * 2.0) * 0.5 + 0.5;
          verticalVeins = pow(verticalVeins, 8.0);
          
          // Pulsing effect
          float pulse = sin(time * 0.5 + vUv.y * 3.0) * 0.3 + 0.7;
          
          // Combine vein patterns
          float veins = verticalVeins * pulse * veinIntensity;
          veins = clamp(veins, 0.0, 1.0);
          
          // Mix base color with vein glow
          vec3 finalColor = mix(baseColor, veinColor, veins);
          
          // Add subtle glow
          float glow = veins * 0.5;
          finalColor += veinColor * glow;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });
    
    const trunk = new THREE.Mesh(trunkGeometry, this.trunkMaterial);
    trunk.position.y = 4;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    this.group.add(trunk);
    
    // Add bark texture overlay
    const barkGeometry = new THREE.CylinderGeometry(0.82, 1.52, 8, 32, 16, false);
    const barkMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d1810,
      roughness: 0.9,
      metalness: 0.0,
      transparent: true,
      opacity: 0.6
    });
    const bark = new THREE.Mesh(barkGeometry, barkMaterial);
    bark.position.y = 4;
    this.group.add(bark);
  }
  
  /**
   * Create major branches
   */
  createBranches() {
    const branchMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d2817,
      roughness: 0.8,
      metalness: 0.1
    });
    
    const branchConfigs = [
      { angle: 0, height: 6, length: 4, thickness: 0.3 },
      { angle: Math.PI / 3, height: 6.5, length: 3.5, thickness: 0.25 },
      { angle: 2 * Math.PI / 3, height: 6, length: 4, thickness: 0.3 },
      { angle: Math.PI, height: 6.2, length: 3.8, thickness: 0.28 },
      { angle: 4 * Math.PI / 3, height: 6.3, length: 3.5, thickness: 0.25 },
      { angle: 5 * Math.PI / 3, height: 6.1, length: 4, thickness: 0.3 },
      { angle: Math.PI / 6, height: 7, length: 3, thickness: 0.2 },
      { angle: Math.PI / 2, height: 7.2, length: 2.8, thickness: 0.2 },
    ];
    
    branchConfigs.forEach(config => {
      const branchGeom = new THREE.CylinderGeometry(
        config.thickness * 0.4,
        config.thickness,
        config.length,
        8
      );
      const branch = new THREE.Mesh(branchGeom, branchMaterial);
      
      branch.position.set(
        Math.cos(config.angle) * 0.5,
        config.height,
        Math.sin(config.angle) * 0.5
      );
      
      branch.rotation.z = -Math.PI / 4 + Math.random() * 0.2;
      branch.rotation.y = config.angle;
      
      branch.castShadow = true;
      this.group.add(branch);
    });
  }
  
  /**
   * Create exposed roots with glowing veins
   */
  createRoots() {
    const rootMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(0x2d1810) },
        veinColor: { value: new THREE.Color(0xffd700) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 baseColor;
        uniform vec3 veinColor;
        varying vec2 vUv;
        
        void main() {
          float vein = sin(vUv.x * 30.0 + time * 0.3) * 0.5 + 0.5;
          vein = pow(vein, 6.0) * 0.5;
          vec3 color = mix(baseColor, veinColor, vein);
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });
    
    this.rootMaterial = rootMaterial;
    
    const rootConfigs = [
      { angle: 0, length: 4, thickness: 0.4 },
      { angle: Math.PI / 2, length: 3.5, thickness: 0.35 },
      { angle: Math.PI, length: 4, thickness: 0.4 },
      { angle: 3 * Math.PI / 2, length: 3.8, thickness: 0.38 },
      { angle: Math.PI / 4, length: 3, thickness: 0.25 },
      { angle: 3 * Math.PI / 4, length: 3.2, thickness: 0.28 },
      { angle: 5 * Math.PI / 4, length: 3, thickness: 0.25 },
      { angle: 7 * Math.PI / 4, length: 3.3, thickness: 0.3 },
    ];
    
    rootConfigs.forEach(config => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.5, 0),
        new THREE.Vector3(
          Math.cos(config.angle) * config.length * 0.3,
          0,
          Math.sin(config.angle) * config.length * 0.3
        ),
        new THREE.Vector3(
          Math.cos(config.angle) * config.length * 0.7,
          -0.3,
          Math.sin(config.angle) * config.length * 0.7
        ),
        new THREE.Vector3(
          Math.cos(config.angle) * config.length,
          -0.2,
          Math.sin(config.angle) * config.length
        )
      ]);
      
      const rootGeom = new THREE.TubeGeometry(curve, 20, config.thickness, 8, false);
      const root = new THREE.Mesh(rootGeom, rootMaterial);
      root.castShadow = true;
      this.group.add(root);
    });
  }
  
  /**
   * Create particle system for canopy lights
   */
  createCanopyParticles() {
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const canopyCenter = new THREE.Vector3(0, 8, 0);
    const canopyRadius = 6;
    
    for (let i = 0; i < particleCount; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = canopyRadius * (0.5 + Math.random() * 0.5);
      
      positions[i * 3] = canopyCenter.x + r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = canopyCenter.y + r * Math.cos(phi) * 0.6;
      positions[i * 3 + 2] = canopyCenter.z + r * Math.sin(phi) * Math.sin(theta);
      
      // Green to gold color variation
      const colorChoice = Math.random();
      if (colorChoice < 0.6) {
        // Green leaves
        colors[i * 3] = 0.3 + Math.random() * 0.2;
        colors[i * 3 + 1] = 0.6 + Math.random() * 0.3;
        colors[i * 3 + 2] = 0.2 + Math.random() * 0.2;
      } else if (colorChoice < 0.8) {
        // Golden lights
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.3;
      } else {
        // Pink blossoms
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
      }
      
      sizes[i] = 0.05 + Math.random() * 0.1;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Custom shader for glowing particles
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: window.devicePixelRatio }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform float pixelRatio;
        
        void main() {
          vColor = color;
          
          // Subtle floating animation
          vec3 pos = position;
          pos.y += sin(time * 0.5 + position.x * 2.0) * 0.05;
          pos.x += sin(time * 0.3 + position.z * 2.0) * 0.03;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          
          // Soft glow
          vec3 glow = vColor * (1.0 + alpha * 0.5);
          
          gl_FragColor = vec4(glow, alpha * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    this.canopyParticles = new THREE.Points(geometry, particleMaterial);
    this.canopyParticleMaterial = particleMaterial;
    this.group.add(this.canopyParticles);
  }
  
  /**
   * Update animations
   */
  update(deltaTime) {
    this.time += deltaTime;
    
    // Update trunk shader
    if (this.trunkMaterial) {
      this.trunkMaterial.uniforms.time.value = this.time;
    }
    
    // Update root shader
    if (this.rootMaterial) {
      this.rootMaterial.uniforms.time.value = this.time;
    }
    
    // Update canopy particles
    if (this.canopyParticleMaterial) {
      this.canopyParticleMaterial.uniforms.time.value = this.time;
    }
    
    // Subtle tree sway
    this.group.rotation.z = Math.sin(this.time * 0.2) * 0.01;
  }
  
  /**
   * Set vein intensity (for weather effects)
   */
  setVeinIntensity(intensity) {
    if (this.trunkMaterial) {
      this.trunkMaterial.uniforms.veinIntensity.value = intensity;
    }
  }
}
