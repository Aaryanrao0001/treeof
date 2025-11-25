/**
 * LocalStorage helpers for message persistence
 */

const STORAGE_KEY = 'infinite_messaging_tree_messages';
const SETTINGS_KEY = 'infinite_messaging_tree_settings';

/**
 * Get all messages from localStorage
 * @returns {Array} - Array of message objects
 */
export function getAllMessages() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading messages from localStorage:', error);
    return [];
  }
}

/**
 * Save a new message to localStorage
 * @param {Object} message - Message object to save
 * @returns {boolean} - Success status
 */
export function saveMessage(message) {
  try {
    const messages = getAllMessages();
    messages.push(message);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    return true;
  } catch (error) {
    console.error('Error saving message to localStorage:', error);
    return false;
  }
}

/**
 * Get a message by its ID
 * @param {string} messageId - The message ID to find
 * @returns {Object|null} - The message object or null if not found
 */
export function getMessageById(messageId) {
  const messages = getAllMessages();
  return messages.find(m => m.message_id === messageId) || null;
}

/**
 * Get message count
 * @returns {number} - Total number of messages
 */
export function getMessageCount() {
  return getAllMessages().length;
}

/**
 * Get messages for current year
 * @returns {Array} - Array of messages from current year
 */
export function getMessagesForYear(year = new Date().getFullYear()) {
  const messages = getAllMessages();
  return messages.filter(m => {
    const msgYear = new Date(m.timestamp).getFullYear();
    return msgYear === year;
  });
}

/**
 * Get settings from localStorage
 * @returns {Object} - Settings object
 */
export function getSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { weather: 'clear', autoWeather: false };
  } catch (error) {
    console.error('Error reading settings from localStorage:', error);
    return { weather: 'clear', autoWeather: false };
  }
}

/**
 * Save settings to localStorage
 * @param {Object} settings - Settings object to save
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
  }
}

/**
 * Calculate the tier based on message count
 * @param {number} count - Number of messages
 * @returns {{tier: string, color: string, emoji: string}}
 */
export function calculateTier(count) {
  if (count >= 100000000) {
    return { tier: 'White', color: '#FFFFFF', emoji: '🍏' };
  } else if (count >= 10000000) {
    return { tier: 'Runic', color: '#9B59B6', emoji: '🔮' };
  } else if (count >= 1000000) {
    return { tier: 'Gold', color: '#FFD700', emoji: '🌟' };
  } else if (count >= 100000) {
    return { tier: 'Silver', color: '#C0C0C0', emoji: '⚪' };
  } else {
    return { tier: 'Red', color: '#FF6B6B', emoji: '🍎' };
  }
}

/**
 * Clear all messages (for development/testing)
 */
export function clearAllMessages() {
  localStorage.removeItem(STORAGE_KEY);
}
