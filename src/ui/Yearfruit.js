/**
 * Yearfruit.js - Yearfruit Display
 * Shows the current year's apple with tier indicator based on message count
 */

import { getMessagesForYear, calculateTier, getMessageCount } from '../utils/storage.js';

export class Yearfruit {
  constructor() {
    this.appleElement = document.getElementById('yearfruit-apple');
    this.yearElement = document.getElementById('yearfruit-year');
    this.tierElement = document.getElementById('yearfruit-tier');
    this.countElement = document.getElementById('yearfruit-count');
    
    this.currentYear = new Date().getFullYear();
    
    this.update();
  }
  
  /**
   * Update yearfruit display
   */
  update() {
    const yearMessages = getMessagesForYear(this.currentYear);
    const count = yearMessages.length;
    const tier = calculateTier(count);
    
    // Update year
    this.yearElement.textContent = this.currentYear;
    
    // Update tier
    this.tierElement.textContent = tier.tier;
    this.tierElement.style.color = tier.color;
    
    // Update count
    this.countElement.textContent = this.formatCount(count);
    
    // Update apple emoji based on tier
    this.appleElement.textContent = tier.emoji;
    
    // Add glow effect matching tier color
    this.appleElement.style.filter = `drop-shadow(0 0 10px ${tier.color})`;
    
    // Animate on update
    this.animateUpdate();
  }
  
  /**
   * Format count with commas
   */
  formatCount(count) {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M messages';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K messages';
    } else {
      return count + (count === 1 ? ' message' : ' messages');
    }
  }
  
  /**
   * Animate update pulse
   */
  animateUpdate() {
    this.appleElement.style.transform = 'scale(1.2)';
    
    setTimeout(() => {
      this.appleElement.style.transform = 'scale(1)';
    }, 300);
  }
  
  /**
   * Get tier thresholds info
   */
  getTierInfo() {
    return [
      { tier: 'Red', threshold: 0, emoji: '🍎' },
      { tier: 'Silver', threshold: 100000, emoji: '⚪' },
      { tier: 'Gold', threshold: 1000000, emoji: '🌟' },
      { tier: 'Runic', threshold: 10000000, emoji: '🔮' },
      { tier: 'White', threshold: 100000000, emoji: '🍏' }
    ];
  }
  
  /**
   * Get progress to next tier
   */
  getProgressToNextTier() {
    const count = getMessageCount();
    const tiers = this.getTierInfo();
    
    for (let i = 0; i < tiers.length - 1; i++) {
      if (count < tiers[i + 1].threshold) {
        const current = tiers[i].threshold;
        const next = tiers[i + 1].threshold;
        const progress = (count - current) / (next - current);
        return {
          currentTier: tiers[i].tier,
          nextTier: tiers[i + 1].tier,
          progress: Math.min(Math.max(progress, 0), 1),
          remaining: next - count
        };
      }
    }
    
    // Max tier reached
    return {
      currentTier: tiers[tiers.length - 1].tier,
      nextTier: null,
      progress: 1,
      remaining: 0
    };
  }
}
