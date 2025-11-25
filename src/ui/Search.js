/**
 * Search.js - Search Functionality
 * Handles message ID search with camera fly-to animation
 */

import * as THREE from 'three';

export class Search {
  constructor(camera, controls, nodeSystem) {
    this.camera = camera;
    this.controls = controls;
    this.nodeSystem = nodeSystem;
    
    this.searchInput = document.getElementById('search-input');
    this.searchButton = document.getElementById('search-btn');
    
    this.isAnimating = false;
    this.lightBeam = null;
    
    this.setupEventListeners();
  }
  
  /**
   * Setup search event listeners
   */
  setupEventListeners() {
    this.searchButton.addEventListener('click', () => this.handleSearch());
    
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleSearch();
      }
    });
    
    // Clear highlight on new input
    this.searchInput.addEventListener('input', () => {
      this.searchInput.style.borderColor = '';
    });
  }
  
  /**
   * Handle search submission
   */
  handleSearch() {
    const messageId = this.searchInput.value.trim();
    
    if (!messageId) {
      this.showError('Please enter a Message ID');
      return;
    }
    
    // Find the node
    const targetPosition = this.nodeSystem.highlightNode(messageId);
    
    if (targetPosition) {
      this.flyToPosition(targetPosition);
      this.searchInput.style.borderColor = 'rgba(76, 175, 80, 0.8)';
    } else {
      this.showError('Message not found');
    }
  }
  
  /**
   * Animate camera to target position
   */
  flyToPosition(targetPosition) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    const duration = 800 + Math.random() * 400; // 800-1200ms range
    const startTime = performance.now();
    
    // Store start position
    const startPosition = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    
    // Calculate end position (offset from target to view it)
    const offset = new THREE.Vector3(3, 2, 5);
    const endPosition = targetPosition.clone().add(offset);
    const endTarget = targetPosition.clone();
    
    // Create guiding light beam
    this.createLightBeam(targetPosition);
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      
      // Interpolate camera position
      this.camera.position.lerpVectors(startPosition, endPosition, eased);
      
      // Interpolate target
      this.controls.target.lerpVectors(startTarget, endTarget, eased);
      
      // Update controls
      this.controls.update();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;
        this.removeLightBeam();
      }
    };
    
    animate();
  }
  
  /**
   * Create guiding light beam effect
   */
  createLightBeam(targetPosition) {
    // Simple cylinder beam from above
    const beamGeometry = new THREE.CylinderGeometry(0.1, 0.5, 20, 16, 1, true);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    this.lightBeam = new THREE.Mesh(beamGeometry, beamMaterial);
    this.lightBeam.position.set(targetPosition.x, targetPosition.y + 10, targetPosition.z);
    
    // Get scene from nodeSystem
    if (this.nodeSystem.scene) {
      this.nodeSystem.scene.add(this.lightBeam);
    }
    
    // Animate beam fade out
    const fadeStart = performance.now();
    const fadeDuration = 2000;
    
    const fadeAnimate = () => {
      const elapsed = performance.now() - fadeStart;
      const progress = elapsed / fadeDuration;
      
      if (this.lightBeam && progress < 1) {
        this.lightBeam.material.opacity = 0.3 * (1 - progress);
        requestAnimationFrame(fadeAnimate);
      } else {
        this.removeLightBeam();
      }
    };
    
    fadeAnimate();
  }
  
  /**
   * Remove light beam from scene
   */
  removeLightBeam() {
    if (this.lightBeam) {
      if (this.lightBeam.parent) {
        this.lightBeam.parent.remove(this.lightBeam);
      }
      this.lightBeam.geometry.dispose();
      this.lightBeam.material.dispose();
      this.lightBeam = null;
    }
  }
  
  /**
   * Show search error
   */
  showError(message) {
    this.searchInput.style.borderColor = 'rgba(255, 68, 68, 0.8)';
    this.searchInput.placeholder = message;
    
    setTimeout(() => {
      this.searchInput.style.borderColor = '';
      this.searchInput.placeholder = 'Enter Message ID...';
    }, 2000);
  }
  
  /**
   * Clear search
   */
  clear() {
    this.searchInput.value = '';
    this.searchInput.style.borderColor = '';
  }
}
