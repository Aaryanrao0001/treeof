/**
 * WeatherUI.js - Weather Controls Panel
 * Handles weather selection and auto-weather toggle
 */

import { getSettings, saveSettings } from '../utils/storage.js';

export class WeatherUI {
  constructor(weatherSystem, environment, postProcessing) {
    this.weatherSystem = weatherSystem;
    this.environment = environment;
    this.postProcessing = postProcessing;
    
    this.weatherButtons = document.querySelectorAll('.weather-btn');
    this.autoWeatherToggle = document.getElementById('auto-weather-toggle');
    
    this.autoWeatherInterval = null;
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
        
        // Disable auto weather when manually selecting
        if (this.autoWeatherToggle.checked) {
          this.autoWeatherToggle.checked = false;
          this.stopAutoWeather();
        }
        
        this.saveCurrentSettings();
      });
    });
    
    // Auto weather toggle
    this.autoWeatherToggle.addEventListener('change', () => {
      if (this.autoWeatherToggle.checked) {
        this.startAutoWeather();
      } else {
        this.stopAutoWeather();
      }
      this.saveCurrentSettings();
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
   * Start automatic weather cycling
   */
  startAutoWeather() {
    const weathers = ['clear', 'rain', 'wind', 'fog', 'snow'];
    let index = weathers.indexOf(this.currentWeather);
    
    // Change weather every 30 seconds
    this.autoWeatherInterval = setInterval(() => {
      index = (index + 1) % weathers.length;
      const newWeather = weathers[index];
      
      this.setWeather(newWeather);
      this.updateButtonStates(newWeather);
    }, 30000);
  }
  
  /**
   * Stop automatic weather cycling
   */
  stopAutoWeather() {
    if (this.autoWeatherInterval) {
      clearInterval(this.autoWeatherInterval);
      this.autoWeatherInterval = null;
    }
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
    
    if (settings.autoWeather) {
      this.autoWeatherToggle.checked = true;
      this.startAutoWeather();
    }
  }
  
  /**
   * Save current settings
   */
  saveCurrentSettings() {
    saveSettings({
      weather: this.currentWeather,
      autoWeather: this.autoWeatherToggle.checked
    });
  }
  
  /**
   * Get current weather
   */
  getCurrentWeather() {
    return this.currentWeather;
  }
  
  /**
   * Cleanup
   */
  dispose() {
    this.stopAutoWeather();
  }
}
