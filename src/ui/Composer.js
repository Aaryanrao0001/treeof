/**
 * Composer.js - Message Input Panel
 * Handles the composition and submission of new messages
 * Simplified: Just name + message (no emotion system)
 */

import { generateMessageId, getMessagePlacement } from '../utils/hash.js';
import { saveMessage } from '../utils/storage.js';

export class Composer {
  constructor(onMessageSubmit) {
    this.onMessageSubmit = onMessageSubmit;
    
    this.nameInput = document.getElementById('composer-name');
    this.messageTextarea = document.getElementById('composer-message');
    this.submitButton = document.getElementById('composer-submit');
    
    this.setupEventListeners();
  }
  
  /**
   * Setup form event listeners
   */
  setupEventListeners() {
    this.submitButton.addEventListener('click', () => this.handleSubmit());
    
    // Allow Enter + Ctrl/Cmd to submit
    this.messageTextarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        this.handleSubmit();
      }
    });
    
    // Visual feedback on input
    this.nameInput.addEventListener('focus', () => this.addFocusGlow(this.nameInput));
    this.nameInput.addEventListener('blur', () => this.removeFocusGlow(this.nameInput));
    this.messageTextarea.addEventListener('focus', () => this.addFocusGlow(this.messageTextarea));
    this.messageTextarea.addEventListener('blur', () => this.removeFocusGlow(this.messageTextarea));
  }
  
  /**
   * Handle form submission
   */
  handleSubmit() {
    const userName = this.nameInput.value.trim();
    const messageText = this.messageTextarea.value.trim();
    
    // Validation
    if (!userName) {
      this.showError(this.nameInput, 'Please enter your name');
      return;
    }
    
    if (!messageText) {
      this.showError(this.messageTextarea, 'Please enter a message');
      return;
    }
    
    // Generate message object with tree placement
    const messageId = generateMessageId();
    const timestamp = new Date().toISOString();
    const placement = getMessagePlacement(userName, messageId);
    
    const message = {
      message_id: messageId,
      userName,
      message: messageText,
      timestamp,
      treePart: placement.treePart,
      position: placement.position,
      glowIntensity: placement.glowIntensity
    };
    
    // Save to localStorage
    if (saveMessage(message)) {
      // Trigger callback with new message
      if (this.onMessageSubmit) {
        this.onMessageSubmit(message);
      }
      
      // Clear form
      this.messageTextarea.value = '';
      
      // Show success animation
      this.showSuccessAnimation();
    } else {
      this.showError(this.submitButton, 'Failed to save message');
    }
  }
  
  /**
   * Show error state on element
   */
  showError(element, message) {
    element.style.borderColor = '#ff4444';
    element.style.animation = 'shake 0.5s ease';
    
    setTimeout(() => {
      element.style.borderColor = '';
      element.style.animation = '';
    }, 1000);
    
    // Could show a tooltip with the message
    console.warn(message);
  }
  
  /**
   * Add focus glow effect
   */
  addFocusGlow(element) {
    element.style.boxShadow = '0 0 15px rgba(144, 238, 144, 0.3)';
  }
  
  /**
   * Remove focus glow effect
   */
  removeFocusGlow(element) {
    element.style.boxShadow = '';
  }
  
  /**
   * Show success animation on submit
   */
  showSuccessAnimation() {
    const button = this.submitButton;
    const originalText = button.textContent;
    
    button.textContent = '🌱 Growing...';
    button.style.background = 'linear-gradient(135deg, #8BC34A, #4CAF50)';
    
    setTimeout(() => {
      button.textContent = '✨ Grown!';
    }, 500);
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
    }, 1500);
  }
  
  /**
   * Set default name (if remembered)
   */
  setDefaultName(name) {
    if (name && !this.nameInput.value) {
      this.nameInput.value = name;
    }
  }
  
  /**
   * Get current name for persistence
   */
  getCurrentName() {
    return this.nameInput.value.trim();
  }
}
