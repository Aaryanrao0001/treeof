/**
 * WeatherUI.js - Weather Controls Panel
 * Handles weather selection with simplified UI (no auto-weather)
 */

import { getSettings, saveSettings } from '../utils/storage.js';

export class WeatherUI {
  constructor(weatherSystem, environment, postProcessing) {
    this.weatherSystem = weatherSystem;
    this.environment = environment;
    this.postProcessing = postProcessing;
    
    this.weatherButtons = document.querySelectorAll('.weather-btn');
    
    this.currentWeather = 'clear';
    
    this.setupEventListeners();
    this.loadSettings();
  }
  
  /**
   * Setup weather control event listeners
   */
  setupEventListeners() {
    // Weather button clicks
    this.weatherButtons.forEach(button => {
      button.addEventListener('click', () => {
        const weather = button.dataset.weather;
        this.setWeather(weather);
        this.updateButtonStates(weather);
        this.saveCurrentSettings();
      });
    });
  }
  
  /**
   * Set weather state
   */
  setWeather(weather) {
    this.currentWeather = weather;
    
    // Update weather system
    if (this.weatherSystem) {
      this.weatherSystem.setWeather(weather);
    }
    
    // Update environment lighting
    if (this.environment) {
      this.environment.setWeather(weather);
    }
    
    // Update post-processing
    if (this.postProcessing) {
      this.postProcessing.setWeather(weather);
    }
  }
  
  /**
   * Update button active states
   */
  updateButtonStates(activeWeather) {
    this.weatherButtons.forEach(button => {
      if (button.dataset.weather === activeWeather) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }
  
  /**
   * Load settings from storage
   */
  loadSettings() {
    const settings = getSettings();
    
    if (settings.weather) {
      this.setWeather(settings.weather);
      this.updateButtonStates(settings.weather);
    }
  }
  
  /**
   * Save current settings
   */
  saveCurrentSettings() {
    saveSettings({
      weather: this.currentWeather
    });
  }
  
  /**
   * Get current weather
   */
  getCurrentWeather() {
    return this.currentWeather;
  }
}
