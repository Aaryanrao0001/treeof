/**
 * Weather.js - Weather Effects System
 * Manages rain, snow, fog, wind, and clear weather states
 */

import * as THREE from 'three';

export class WeatherSystem {
  constructor(scene) {
    this.scene = scene;
    this.currentWeather = 'clear';
    this.time = 0;
    
    this.particles = {};
    this.createRainParticles();
    this.createSnowParticles();
    this.createFogEffect();
    this.createWindParticles();
    
    // Set initial state
    this.setWeather('clear');
  }
  
  /**
   * Create rain particle system
   */
  createRainParticles() {
    const particleCount = 5000;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 1] = -0.5 - Math.random() * 0.3;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0 }
      },
      vertexShader: `
        attribute vec3 velocity;
        uniform float time;
        varying float vAlpha;
        
        void main() {
          vec3 pos = position;
          
          // Simulate rain falling
          pos.y = mod(pos.y + velocity.y * time * 50.0, 30.0);
          pos.x += velocity.x * time * 10.0;
          pos.z += velocity.z * time * 10.0;
          
          vAlpha = 0.3 + pos.y / 30.0 * 0.4;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = 2.0 * (100.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float opacity;
        varying float vAlpha;
        
        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          float alpha = (1.0 - dist * 2.0) * vAlpha * opacity;
          
          vec3 color = vec3(0.7, 0.8, 0.9);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    this.particles.rain = new THREE.Points(geometry, material);
    this.particles.rain.visible = false;
    this.scene.add(this.particles.rain);
  }
  
  /**
   * Create snow particle system
   */
  createSnowParticles() {
    const particleCount = 3000;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      
      sizes[i] = 0.05 + Math.random() * 0.15;
      phases[i] = Math.random() * Math.PI * 2;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0 },
        pixelRatio: { value: window.devicePixelRatio }
      },
      vertexShader: `
        attribute float size;
        attribute float phase;
        uniform float time;
        uniform float pixelRatio;
        varying float vAlpha;
        
        void main() {
          vec3 pos = position;
          
          // Gentle falling with swaying
          float fallSpeed = 0.05;
          pos.y = mod(pos.y - time * fallSpeed * 20.0, 30.0);
          pos.x += sin(time * 0.5 + phase) * 0.5;
          pos.z += cos(time * 0.3 + phase) * 0.3;
          
          vAlpha = 0.6 + size * 2.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * pixelRatio * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float opacity;
        varying float vAlpha;
        
        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          float alpha = (1.0 - smoothstep(0.0, 0.5, dist)) * vAlpha * opacity;
          
          vec3 color = vec3(1.0, 1.0, 1.0);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    this.particles.snow = new THREE.Points(geometry, material);
    this.particles.snow.visible = false;
    this.scene.add(this.particles.snow);
  }
  
  /**
   * Create fog effect
   */
  createFogEffect() {
    // Volumetric fog using a custom fog plane
    const fogGeometry = new THREE.PlaneGeometry(200, 200, 1, 1);
    const fogMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0 },
        fogColor: { value: new THREE.Color(0x8090a0) }
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
        uniform float opacity;
        uniform vec3 fogColor;
        varying vec2 vUv;
        
        // Simplex noise
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                             -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
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
          float noise = snoise(vUv * 3.0 + time * 0.05);
          noise += snoise(vUv * 6.0 - time * 0.03) * 0.5;
          noise = noise * 0.5 + 0.5;
          
          float alpha = noise * opacity * 0.4;
          
          // Fade at edges
          float edgeFade = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
          edgeFade *= smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
          
          gl_FragColor = vec4(fogColor, alpha * edgeFade);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    
    this.fogPlane = new THREE.Mesh(fogGeometry, fogMaterial);
    this.fogPlane.rotation.x = -Math.PI / 2;
    this.fogPlane.position.y = 5;
    this.fogPlane.visible = false;
    this.scene.add(this.fogPlane);
    
    // Also add scene fog
    this.sceneFog = new THREE.FogExp2(0x8090a0, 0);
    this.originalFog = this.scene.fog;
  }
  
  /**
   * Create wind particle effects (drifting petals/leaves)
   */
  createWindParticles() {
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const rotations = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    
    const petalColors = [
      { r: 1.0, g: 0.8, b: 0.8 }, // Pink
      { r: 0.8, g: 1.0, b: 0.8 }, // Light green
      { r: 1.0, g: 1.0, b: 0.8 }, // Cream
    ];
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      
      rotations[i] = Math.random() * Math.PI * 2;
      
      const color = petalColors[Math.floor(Math.random() * petalColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('rotation', new THREE.BufferAttribute(rotations, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0 },
        windStrength: { value: 1.0 },
        pixelRatio: { value: window.devicePixelRatio }
      },
      vertexShader: `
        attribute float rotation;
        attribute vec3 color;
        uniform float time;
        uniform float windStrength;
        uniform float pixelRatio;
        varying vec3 vColor;
        varying float vRotation;
        
        void main() {
          vColor = color;
          vRotation = rotation + time;
          
          vec3 pos = position;
          
          // Wind movement
          pos.x += sin(time * 0.5 + position.z * 0.1) * windStrength * 3.0;
          pos.x = mod(pos.x + 20.0, 40.0) - 20.0;
          pos.y += sin(time * 0.3 + position.x * 0.2) * 0.5;
          pos.z += cos(time * 0.4 + position.y * 0.1) * windStrength;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = 8.0 * pixelRatio * (50.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float opacity;
        varying vec3 vColor;
        varying float vRotation;
        
        void main() {
          vec2 center = gl_PointCoord - 0.5;
          
          // Rotate
          float c = cos(vRotation);
          float s = sin(vRotation);
          vec2 rotated = vec2(
            center.x * c - center.y * s,
            center.x * s + center.y * c
          );
          
          // Petal shape (ellipse)
          float dist = length(rotated * vec2(1.0, 2.0));
          float alpha = (1.0 - smoothstep(0.0, 0.4, dist)) * opacity;
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false
    });
    
    this.particles.wind = new THREE.Points(geometry, material);
    this.particles.wind.visible = false;
    this.scene.add(this.particles.wind);
  }
  
  /**
   * Set weather state with smooth transition
   */
  setWeather(weather) {
    const transitionDuration = 800;
    const startTime = performance.now();
    const previousWeather = this.currentWeather;
    this.currentWeather = weather;
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / transitionDuration, 1);
      
      // Ease in-out
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      // Fade out previous weather
      if (previousWeather !== 'clear' && this.particles[previousWeather]) {
        this.particles[previousWeather].material.uniforms.opacity.value = 1 - eased;
      }
      if (previousWeather === 'fog') {
        this.fogPlane.material.uniforms.opacity.value = 1 - eased;
        this.sceneFog.density = (1 - eased) * 0.02;
      }
      
      // Fade in new weather
      if (weather !== 'clear' && this.particles[weather]) {
        this.particles[weather].visible = true;
        this.particles[weather].material.uniforms.opacity.value = eased;
      }
      if (weather === 'fog') {
        this.fogPlane.visible = true;
        this.fogPlane.material.uniforms.opacity.value = eased;
        this.scene.fog = this.sceneFog;
        this.sceneFog.density = eased * 0.02;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Clean up previous weather
        if (previousWeather !== 'clear' && previousWeather !== weather && this.particles[previousWeather]) {
          this.particles[previousWeather].visible = false;
        }
        if (previousWeather === 'fog' && weather !== 'fog') {
          this.fogPlane.visible = false;
          this.scene.fog = this.originalFog;
        }
      }
    };
    
    animate();
  }
  
  /**
   * Update weather effects
   */
  update(deltaTime) {
    this.time += deltaTime;
    
    // Update rain
    if (this.particles.rain.visible) {
      this.particles.rain.material.uniforms.time.value = this.time;
    }
    
    // Update snow
    if (this.particles.snow.visible) {
      this.particles.snow.material.uniforms.time.value = this.time;
    }
    
    // Update fog
    if (this.fogPlane.visible) {
      this.fogPlane.material.uniforms.time.value = this.time;
    }
    
    // Update wind
    if (this.particles.wind.visible) {
      this.particles.wind.material.uniforms.time.value = this.time;
    }
  }
  
  /**
   * Get current weather
   */
  getCurrentWeather() {
    return this.currentWeather;
  }
}
