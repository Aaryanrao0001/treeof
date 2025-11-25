/**
 * Modal.js - Message Detail Modal
 * Displays full message details when a node is clicked
 * Shows message location on tree (trunk/branch/leaf/root)
 */

export class Modal {
  constructor() {
    this.modal = document.getElementById('message-modal');
    this.username = document.getElementById('modal-username');
    this.message = document.getElementById('modal-message');
    this.timestamp = document.getElementById('modal-timestamp');
    this.messageId = document.getElementById('modal-id');
    this.location = document.getElementById('modal-location');
    this.closeButton = this.modal.querySelector('.modal-close');
    
    this.setupEventListeners();
  }
  
  /**
   * Setup modal event listeners
   */
  setupEventListeners() {
    // Close button
    this.closeButton.addEventListener('click', () => this.hide());
    
    // Click outside to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
        this.hide();
      }
    });
  }
  
  /**
   * Show modal with message data
   */
  show(message) {
    // Populate modal content
    this.username.textContent = message.userName;
    this.message.textContent = message.message;
    this.timestamp.textContent = this.formatTimestamp(message.timestamp);
    this.messageId.textContent = `ID: ${message.message_id}`;
    
    // Show tree location
    const treePart = message.treePart || 'trunk';
    this.location.textContent = `Location: ${this.formatTreePart(treePart)}`;
    
    // Show modal with animation
    this.modal.classList.remove('hidden');
    
    // Focus close button for accessibility
    this.closeButton.focus();
  }
  
  /**
   * Hide modal
   */
  hide() {
    this.modal.classList.add('hidden');
  }
  
  /**
   * Format timestamp to readable string
   */
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  }
  
  /**
   * Format tree part name for display
   */
  formatTreePart(treePart) {
    const partNames = {
      trunk: '🌳 Trunk Bark',
      branch: '🌿 Branch',
      leaf: '🍃 Leaf',
      root: '🌱 Root'
    };
    return partNames[treePart] || treePart;
  }
  
  /**
   * Check if modal is visible
   */
  isVisible() {
    return !this.modal.classList.contains('hidden');
  }
}
