/**
 * main.js - Entry Point
 * Infinite Messaging Tree - A living, magical, ever-expanding digital organism
 * Messages appear as glowing inscriptions ON tree parts (not separate objects)
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene components
import { MagicalTree } from './scene/Tree.js';
import { Environment } from './scene/Environment.js';
import { NodeSystem } from './scene/Nodes.js';
import { WeatherSystem } from './scene/Weather.js';
import { PostProcessing } from './scene/PostProcessing.js';

// UI components
import { Composer } from './ui/Composer.js';
import { Modal } from './ui/Modal.js';
import { Search } from './ui/Search.js';
import { WeatherUI } from './ui/WeatherUI.js';

// Utilities
import { getAllMessages } from './utils/storage.js';

class InfiniteMessagingTree {
  constructor() {
    this.clock = new THREE.Clock();
    this.container = document.getElementById('canvas-container');
    
    this.init();
    this.createScene();
    this.createUI();
    this.loadExistingMessages();
    this.animate();
    
    window.addEventListener('resize', () => this.onResize());
  }
  
  /**
   * Initialize Three.js renderer and camera
   */
  init() {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);
    
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a15);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    this.camera.position.set(15, 10, 20);
    
    // Orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.3;
    this.controls.target.set(0, 6, 0);
    this.controls.update();
  }
  
  /**
   * Create 3D scene components
   */
  createScene() {
    // Environment (ground, sky, lighting)
    this.environment = new Environment(this.scene);
    
    // Magical tree
    this.tree = new MagicalTree(this.scene);
    
    // Weather system
    this.weather = new WeatherSystem(this.scene);
    
    // Message node system
    this.nodeSystem = new NodeSystem(this.scene, this.camera, this.renderer);
    
    // Post-processing
    this.postProcessing = new PostProcessing(this.renderer, this.scene, this.camera);
    
    // Setup node interaction callbacks
    this.nodeSystem.onNodeClick = (message) => this.onNodeClick(message);
    this.nodeSystem.onNodeHover = (message, x, y) => this.onNodeHover(message, x, y);
  }
  
  /**
   * Create UI components
   */
  createUI() {
    // Modal for message details
    this.modal = new Modal();
    
    // Composer for creating messages
    this.composer = new Composer((message) => this.onNewMessage(message));
    
    // Search functionality
    this.search = new Search(this.camera, this.controls, this.nodeSystem);
    
    // Weather controls
    this.weatherUI = new WeatherUI(this.weather, this.environment, this.postProcessing);
    
    // Hover label element
    this.hoverLabel = document.getElementById('hover-label');
  }
  
  /**
   * Load existing messages from storage
   */
  loadExistingMessages() {
    const messages = getAllMessages();
    this.nodeSystem.loadNodes(messages);
    
    console.log(`Loaded ${messages.length} existing messages`);
  }
  
  /**
   * Handle new message creation
   */
  onNewMessage(message) {
    // Add node to scene
    this.nodeSystem.addNode(message);
    
    console.log('New message created:', message.message_id);
  }
  
  /**
   * Handle node click
   */
  onNodeClick(message) {
    this.modal.show(message);
  }
  
  /**
   * Handle node hover
   */
  onNodeHover(message, x, y) {
    if (message) {
      this.hoverLabel.textContent = message.userName;
      this.hoverLabel.style.left = `${x}px`;
      this.hoverLabel.style.top = `${y - 20}px`;
      this.hoverLabel.classList.remove('hidden');
    } else {
      this.hoverLabel.classList.add('hidden');
    }
  }
  
  /**
   * Handle window resize
   */
  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
  }
  
  /**
   * Animation loop
   */
  animate() {
    requestAnimationFrame(() => this.animate());
    
    const deltaTime = this.clock.getDelta();
    
    // Update controls
    this.controls.update();
    
    // Update scene components
    this.tree.update(deltaTime);
    this.environment.update(deltaTime);
    this.nodeSystem.update(deltaTime);
    this.weather.update(deltaTime);
    
    // Render with post-processing
    this.postProcessing.render();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new InfiniteMessagingTree();
});
