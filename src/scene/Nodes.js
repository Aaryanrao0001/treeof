/**
 * Nodes.js - Message Inscription System
 * Handles creation and management of message inscriptions on tree parts
 * Messages appear as glowing inscriptions ON tree (not separate objects)
 */

import * as THREE from 'three';
import { getMessagePlacement } from '../utils/hash.js';

// Unified golden glow config for all messages
const MESSAGE_CONFIG = {
  color: 0xffd700,      // Golden
  emissive: 0xffa500,   // Orange-gold emissive
  scale: 0.25
};

export class NodeSystem {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.nodes = new Map(); // messageId -> node data
    this.meshes = new Map(); // messageId -> THREE.Mesh
    this.time = 0;
    
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.hoveredNode = null;
    this.hoverTimeout = null;
    
    this.onNodeClick = null; // Callback for node clicks
    this.onNodeHover = null; // Callback for node hovers
    
    this.setupEventListeners();
  }
  
  /**
   * Create geometry based on tree part (inscriptions on different parts)
   */
  createGeometry(treePart) {
    const scale = MESSAGE_CONFIG.scale;
    
    switch (treePart) {
      case 'trunk':
        // Carved rune shape - flat panel for inscription
        return new THREE.BoxGeometry(scale * 1.5, scale * 2, scale * 0.3);
      case 'branch':
        // Luminescent vein - elongated shape
        return new THREE.CapsuleGeometry(scale * 0.3, scale * 1.2, 4, 8);
      case 'leaf':
        // Soft glowing leaf shape
        return new THREE.SphereGeometry(scale, 8, 8);
      case 'root':
        // Surface inscription on root
        return new THREE.TorusGeometry(scale * 0.6, scale * 0.2, 6, 12);
      default:
        return new THREE.SphereGeometry(scale, 16, 16);
    }
  }
  
  /**
   * Create unified golden glow material for inscriptions
   */
  createMaterial(glowIntensity = 1.0) {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(MESSAGE_CONFIG.color) },
        emissiveColor: { value: new THREE.Color(MESSAGE_CONFIG.emissive) },
        pulsePhase: { value: Math.random() * Math.PI * 2 },
        glowIntensity: { value: glowIntensity },
        birthTime: { value: 0 },
        currentTime: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float time;
        uniform float pulsePhase;
        
        void main() {
          vNormal = normal;
          vPosition = position;
          
          // Subtle breathing animation
          float breath = sin(time * 0.5 + pulsePhase) * 0.05 + 1.0;
          vec3 pos = position * breath;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 baseColor;
        uniform vec3 emissiveColor;
        uniform float time;
        uniform float pulsePhase;
        uniform float glowIntensity;
        uniform float birthTime;
        uniform float currentTime;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Birth animation (fade in during first 1.4 seconds)
          float birthDuration = 1.4;
          float birthProgress = clamp((currentTime - birthTime) / birthDuration, 0.0, 1.0);
          
          // Pulsing golden glow
          float pulse = sin(time * 2.0 + pulsePhase) * 0.3 + 0.7;
          
          // Fresnel effect for rim glow
          vec3 viewDir = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.0);
          
          // Warm golden color with intensity variation
          vec3 color = mix(baseColor, emissiveColor, pulse * 0.3 + fresnel * 0.4);
          
          // Add emissive glow based on intensity
          color += emissiveColor * fresnel * glowIntensity * 0.8;
          
          // Apply birth fade
          float alpha = birthProgress * (0.7 + glowIntensity * 0.3);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
  }
  
  /**
   * Add a new message inscription to the scene
   */
  addNode(message) {
    const { message_id, userName, treePart, position, glowIntensity } = message;
    
    // Skip if node already exists
    if (this.meshes.has(message_id)) return;
    
    // Get or calculate placement
    const placement = position ? { position, treePart, glowIntensity } 
      : getMessagePlacement(userName, message_id);
    
    const part = treePart || placement.treePart;
    const pos = position || placement.position;
    const intensity = glowIntensity || placement.glowIntensity;
    
    // Create geometry and material
    const geometry = this.createGeometry(part);
    const material = this.createMaterial(intensity);
    
    // Set birth time for animation
    material.uniforms.birthTime.value = this.time;
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(pos.x, pos.y, pos.z);
    mesh.userData = { 
      messageId: message_id, 
      message: { ...message, treePart: part },
      originalPosition: { ...pos },
      swayPhase: Math.random() * Math.PI * 2,
      swayAmplitude: 0.01 + Math.random() * 0.02
    };
    
    // Add subtle point light for glow effect
    const glow = new THREE.PointLight(MESSAGE_CONFIG.emissive, intensity * 0.3, 2);
    mesh.add(glow);
    
    this.scene.add(mesh);
    this.meshes.set(message_id, mesh);
    this.nodes.set(message_id, { ...message, treePart: part });
    
    // Birth animation
    this.animateBirth(mesh);
    
    return mesh;
  }
  
  /**
   * Birth animation for new inscriptions
   */
  animateBirth(mesh) {
    const startScale = 0.1;
    const endScale = 1.0;
    const duration = 1200; // ms
    const startTime = performance.now();
    
    mesh.scale.setScalar(startScale);
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      
      // Scale with overshoot
      const overshoot = 1.1;
      let scale;
      if (progress < 0.7) {
        scale = startScale + (endScale * overshoot - startScale) * (progress / 0.7);
      } else {
        const t = (progress - 0.7) / 0.3;
        scale = endScale * overshoot - (endScale * overshoot - endScale) * t;
      }
      
      mesh.scale.setScalar(scale);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
  
  /**
   * Load existing nodes from storage
   */
  loadNodes(messages) {
    messages.forEach(message => {
      this.addNode(message);
    });
  }
  
  /**
   * Get node by message ID
   */
  getNodeByMessageId(messageId) {
    return this.meshes.get(messageId);
  }
  
  /**
   * Setup mouse event listeners
   */
  setupEventListeners() {
    const canvas = this.renderer.domElement;
    
    canvas.addEventListener('mousemove', (event) => {
      this.onMouseMove(event);
    });
    
    canvas.addEventListener('click', (event) => {
      this.onMouseClick(event);
    });
    
    canvas.addEventListener('touchstart', (event) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        this.onMouseClick({ clientX: touch.clientX, clientY: touch.clientY });
      }
    });
  }
  
  /**
   * Handle mouse movement for hover effects
   */
  onMouseMove(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Raycast to find hovered node
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshArray = Array.from(this.meshes.values());
    const intersects = this.raycaster.intersectObjects(meshArray);
    
    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      
      if (this.hoveredNode !== mesh) {
        // Clear existing timeout
        if (this.hoverTimeout) {
          clearTimeout(this.hoverTimeout);
        }
        
        this.hoveredNode = mesh;
        
        // Delay showing hover label
        this.hoverTimeout = setTimeout(() => {
          if (this.onNodeHover && mesh.userData.message) {
            this.onNodeHover(mesh.userData.message, event.clientX, event.clientY);
          }
        }, 250);
      }
    } else {
      if (this.hoveredNode) {
        clearTimeout(this.hoverTimeout);
        this.hoveredNode = null;
        if (this.onNodeHover) {
          this.onNodeHover(null);
        }
      }
    }
  }
  
  /**
   * Handle mouse click for node selection
   */
  onMouseClick(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshArray = Array.from(this.meshes.values());
    const intersects = this.raycaster.intersectObjects(meshArray);
    
    if (intersects.length > 0 && this.onNodeClick) {
      const mesh = intersects[0].object;
      if (mesh.userData.message) {
        this.onNodeClick(mesh.userData.message);
      }
    }
  }
  
  /**
   * Update all nodes (animation loop)
   */
  update(deltaTime) {
    this.time += deltaTime;
    
    this.meshes.forEach((mesh) => {
      // Update shader uniforms
      if (mesh.material.uniforms) {
        mesh.material.uniforms.time.value = this.time;
        mesh.material.uniforms.currentTime.value = this.time;
      }
      
      // Dreamy sway animation
      const userData = mesh.userData;
      if (userData.originalPosition) {
        const swayX = Math.sin(this.time * 0.3 + userData.swayPhase) * userData.swayAmplitude;
        const swayY = Math.sin(this.time * 0.4 + userData.swayPhase + 1) * userData.swayAmplitude * 0.5;
        const swayZ = Math.cos(this.time * 0.35 + userData.swayPhase) * userData.swayAmplitude;
        
        mesh.position.x = userData.originalPosition.x + swayX;
        mesh.position.y = userData.originalPosition.y + swayY;
        mesh.position.z = userData.originalPosition.z + swayZ;
      }
      
      // Slow rotation
      mesh.rotation.y += deltaTime * 0.1;
    });
  }
  
  /**
   * Apply wind effect to all nodes
   */
  applyWind(strength) {
    this.meshes.forEach((mesh) => {
      const userData = mesh.userData;
      userData.swayAmplitude = 0.02 + strength * 0.05;
    });
  }
  
  /**
   * Get all node positions for camera targeting
   */
  getAllPositions() {
    const positions = [];
    this.meshes.forEach((mesh) => {
      positions.push(mesh.position.clone());
    });
    return positions;
  }
  
  /**
   * Highlight a specific node (for search results)
   */
  highlightNode(messageId) {
    const mesh = this.meshes.get(messageId);
    if (!mesh) return null;
    
    // Create highlight effect
    const highlightGeom = new THREE.SphereGeometry(0.6, 16, 16);
    const highlightMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    
    const highlight = new THREE.Mesh(highlightGeom, highlightMat);
    highlight.position.copy(mesh.position);
    this.scene.add(highlight);
    
    // Animate highlight
    let scale = 0.5;
    const animateHighlight = () => {
      scale += 0.02;
      highlight.scale.setScalar(scale);
      highlight.material.opacity = Math.max(0, 0.5 - scale * 0.15);
      
      if (highlight.material.opacity > 0) {
        requestAnimationFrame(animateHighlight);
      } else {
        this.scene.remove(highlight);
        highlightGeom.dispose();
        highlightMat.dispose();
      }
    };
    
    animateHighlight();
    
    return mesh.position;
  }
}
