/**
 * PostProcessing.js - Bloom and God-rays Effects
 * Handles visual post-processing for the ethereal look
 */

import * as THREE from 'three';

export class PostProcessing {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.setupRenderTargets();
    this.setupBloomPass();
    this.setupGodRays();
    this.setupCompositor();
    
    window.addEventListener('resize', () => this.onResize());
  }
  
  /**
   * Setup render targets for multi-pass rendering
   */
  setupRenderTargets() {
    const params = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType
    };
    
    // Main scene render target
    this.sceneRT = new THREE.WebGLRenderTarget(this.width, this.height, params);
    
    // Bright pass for bloom
    this.brightRT = new THREE.WebGLRenderTarget(this.width / 2, this.height / 2, params);
    
    // Bloom blur passes (ping-pong)
    this.bloomRT1 = new THREE.WebGLRenderTarget(this.width / 4, this.height / 4, params);
    this.bloomRT2 = new THREE.WebGLRenderTarget(this.width / 4, this.height / 4, params);
    
    // God rays render target
    this.godRaysRT = new THREE.WebGLRenderTarget(this.width / 2, this.height / 2, params);
  }
  
  /**
   * Setup bloom pass materials
   */
  setupBloomPass() {
    // Full screen quad geometry
    this.quadGeometry = new THREE.PlaneGeometry(2, 2);
    
    // Bright pass - extracts bright areas
    this.brightMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        threshold: { value: 0.5 },
        smoothing: { value: 0.3 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float threshold;
        uniform float smoothing;
        varying vec2 vUv;
        
        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
          float contribution = smoothstep(threshold - smoothing, threshold + smoothing, brightness);
          gl_FragColor = vec4(color.rgb * contribution, 1.0);
        }
      `
    });
    
    // Gaussian blur pass
    this.blurMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        direction: { value: new THREE.Vector2(1, 0) },
        resolution: { value: new THREE.Vector2(this.width / 4, this.height / 4) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 direction;
        uniform vec2 resolution;
        varying vec2 vUv;
        
        void main() {
          vec2 texelSize = 1.0 / resolution;
          vec3 result = vec3(0.0);
          
          // 9-tap Gaussian blur
          float weights[5];
          weights[0] = 0.227027;
          weights[1] = 0.1945946;
          weights[2] = 0.1216216;
          weights[3] = 0.054054;
          weights[4] = 0.016216;
          
          result += texture2D(tDiffuse, vUv).rgb * weights[0];
          
          for (int i = 1; i < 5; i++) {
            vec2 offset = direction * texelSize * float(i) * 2.0;
            result += texture2D(tDiffuse, vUv + offset).rgb * weights[i];
            result += texture2D(tDiffuse, vUv - offset).rgb * weights[i];
          }
          
          gl_FragColor = vec4(result, 1.0);
        }
      `
    });
    
    this.brightQuad = new THREE.Mesh(this.quadGeometry, this.brightMaterial);
    this.blurQuad = new THREE.Mesh(this.quadGeometry, this.blurMaterial);
    
    this.brightScene = new THREE.Scene();
    this.blurScene = new THREE.Scene();
    this.brightScene.add(this.brightQuad);
    this.blurScene.add(this.blurQuad);
    
    this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }
  
  /**
   * Setup god rays effect
   */
  setupGodRays() {
    this.godRaysMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        lightPosition: { value: new THREE.Vector2(0.7, 0.3) },
        exposure: { value: 0.3 },
        decay: { value: 0.95 },
        density: { value: 0.8 },
        weight: { value: 0.4 },
        samples: { value: 50 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 lightPosition;
        uniform float exposure;
        uniform float decay;
        uniform float density;
        uniform float weight;
        uniform int samples;
        varying vec2 vUv;
        
        void main() {
          vec2 deltaTexCoord = (vUv - lightPosition) * density / float(samples);
          vec2 texCoord = vUv;
          
          vec4 fragColor = vec4(0.0);
          float illuminationDecay = 1.0;
          
          for (int i = 0; i < 50; i++) {
            if (i >= samples) break;
            
            texCoord -= deltaTexCoord;
            vec4 sampleColor = texture2D(tDiffuse, texCoord);
            sampleColor *= illuminationDecay * weight;
            fragColor += sampleColor;
            illuminationDecay *= decay;
          }
          
          fragColor *= exposure;
          fragColor.a = 1.0;
          
          gl_FragColor = fragColor;
        }
      `
    });
    
    this.godRaysQuad = new THREE.Mesh(this.quadGeometry, this.godRaysMaterial);
    this.godRaysScene = new THREE.Scene();
    this.godRaysScene.add(this.godRaysQuad);
  }
  
  /**
   * Setup final compositor
   */
  setupCompositor() {
    this.compositorMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tScene: { value: null },
        tBloom: { value: null },
        tGodRays: { value: null },
        bloomStrength: { value: 0.5 },
        godRaysStrength: { value: 0.3 },
        exposure: { value: 1.0 },
        gamma: { value: 2.2 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tScene;
        uniform sampler2D tBloom;
        uniform sampler2D tGodRays;
        uniform float bloomStrength;
        uniform float godRaysStrength;
        uniform float exposure;
        uniform float gamma;
        varying vec2 vUv;
        
        void main() {
          vec3 scene = texture2D(tScene, vUv).rgb;
          vec3 bloom = texture2D(tBloom, vUv).rgb;
          vec3 godRays = texture2D(tGodRays, vUv).rgb;
          
          // Combine passes
          vec3 color = scene;
          color += bloom * bloomStrength;
          color += godRays * godRaysStrength;
          
          // Tone mapping (Reinhard)
          color = color / (color + vec3(1.0));
          
          // Exposure
          color *= exposure;
          
          // Gamma correction
          color = pow(color, vec3(1.0 / gamma));
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });
    
    this.compositorQuad = new THREE.Mesh(this.quadGeometry, this.compositorMaterial);
    this.compositorScene = new THREE.Scene();
    this.compositorScene.add(this.compositorQuad);
  }
  
  /**
   * Render with post-processing
   */
  render() {
    // 1. Render scene to render target
    this.renderer.setRenderTarget(this.sceneRT);
    this.renderer.render(this.scene, this.camera);
    
    // 2. Bright pass for bloom
    this.brightMaterial.uniforms.tDiffuse.value = this.sceneRT.texture;
    this.renderer.setRenderTarget(this.brightRT);
    this.renderer.render(this.brightScene, this.orthoCamera);
    
    // 3. Blur passes for bloom
    // Horizontal blur
    this.blurMaterial.uniforms.tDiffuse.value = this.brightRT.texture;
    this.blurMaterial.uniforms.direction.value.set(1, 0);
    this.renderer.setRenderTarget(this.bloomRT1);
    this.renderer.render(this.blurScene, this.orthoCamera);
    
    // Vertical blur
    this.blurMaterial.uniforms.tDiffuse.value = this.bloomRT1.texture;
    this.blurMaterial.uniforms.direction.value.set(0, 1);
    this.renderer.setRenderTarget(this.bloomRT2);
    this.renderer.render(this.blurScene, this.orthoCamera);
    
    // Additional blur passes for softer bloom
    this.blurMaterial.uniforms.tDiffuse.value = this.bloomRT2.texture;
    this.blurMaterial.uniforms.direction.value.set(1, 0);
    this.renderer.setRenderTarget(this.bloomRT1);
    this.renderer.render(this.blurScene, this.orthoCamera);
    
    this.blurMaterial.uniforms.tDiffuse.value = this.bloomRT1.texture;
    this.blurMaterial.uniforms.direction.value.set(0, 1);
    this.renderer.setRenderTarget(this.bloomRT2);
    this.renderer.render(this.blurScene, this.orthoCamera);
    
    // 4. God rays
    this.godRaysMaterial.uniforms.tDiffuse.value = this.brightRT.texture;
    this.renderer.setRenderTarget(this.godRaysRT);
    this.renderer.render(this.godRaysScene, this.orthoCamera);
    
    // 5. Final composite
    this.compositorMaterial.uniforms.tScene.value = this.sceneRT.texture;
    this.compositorMaterial.uniforms.tBloom.value = this.bloomRT2.texture;
    this.compositorMaterial.uniforms.tGodRays.value = this.godRaysRT.texture;
    
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.compositorScene, this.orthoCamera);
  }
  
  /**
   * Handle window resize
   */
  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.sceneRT.setSize(this.width, this.height);
    this.brightRT.setSize(this.width / 2, this.height / 2);
    this.bloomRT1.setSize(this.width / 4, this.height / 4);
    this.bloomRT2.setSize(this.width / 4, this.height / 4);
    this.godRaysRT.setSize(this.width / 2, this.height / 2);
    
    this.blurMaterial.uniforms.resolution.value.set(this.width / 4, this.height / 4);
  }
  
  /**
   * Set bloom intensity
   */
  setBloomStrength(strength) {
    this.compositorMaterial.uniforms.bloomStrength.value = strength;
  }
  
  /**
   * Set god rays intensity
   */
  setGodRaysStrength(strength) {
    this.compositorMaterial.uniforms.godRaysStrength.value = strength;
  }
  
  /**
   * Update sun position for god rays
   */
  updateSunPosition(screenPosition) {
    this.godRaysMaterial.uniforms.lightPosition.value.copy(screenPosition);
  }
  
  /**
   * Adjust for weather
   */
  setWeather(weather) {
    switch (weather) {
      case 'clear':
        this.setBloomStrength(0.5);
        this.setGodRaysStrength(0.3);
        break;
      case 'rain':
        this.setBloomStrength(0.3);
        this.setGodRaysStrength(0.1);
        break;
      case 'fog':
        this.setBloomStrength(0.2);
        this.setGodRaysStrength(0.05);
        break;
      case 'snow':
        this.setBloomStrength(0.6);
        this.setGodRaysStrength(0.2);
        break;
      case 'wind':
        this.setBloomStrength(0.4);
        this.setGodRaysStrength(0.25);
        break;
    }
  }
  
  /**
   * Dispose resources
   */
  dispose() {
    this.sceneRT.dispose();
    this.brightRT.dispose();
    this.bloomRT1.dispose();
    this.bloomRT2.dispose();
    this.godRaysRT.dispose();
    
    this.quadGeometry.dispose();
    this.brightMaterial.dispose();
    this.blurMaterial.dispose();
    this.godRaysMaterial.dispose();
    this.compositorMaterial.dispose();
  }
}
