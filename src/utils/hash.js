/**
 * Deterministic hash function for consistent node positioning
 * Uses a simple but effective hash algorithm
 */

/**
 * Generate a hash code from a string
 * @param {string} str - Input string to hash
 * @returns {number} - 32-bit hash code
 */
export function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Seeded random number generator for deterministic randomness
 * @param {number} seed - Seed value
 * @returns {function} - Function that returns pseudo-random numbers [0, 1)
 */
export function seededRandom(seed) {
  let s = seed;
  return function() {
    s = Math.sin(s * 9999) * 10000;
    return s - Math.floor(s);
  };
}

/**
 * Generate deterministic 3D position for a message node
 * Positions are distributed on and around the tree canopy
 * @param {string} userName - User's name
 * @param {string} messageId - Unique message identifier
 * @returns {{x: number, y: number, z: number}} - 3D position
 */
export function getNodePosition(userName, messageId) {
  const seed = hashCode(userName + messageId);
  const rand = seededRandom(seed);
  
  // Generate spherical coordinates for tree canopy distribution
  // Tree canopy is roughly spherical with center at (0, 8, 0)
  const canopyCenter = { x: 0, y: 8, z: 0 };
  const canopyRadius = 6;
  
  // Use golden angle for better distribution
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const theta = seed * goldenAngle;
  
  // Vertical distribution - bias towards middle of canopy
  const phi = Math.acos(1 - 2 * rand());
  
  // Radius variation for depth within canopy
  const r = canopyRadius * (0.6 + rand() * 0.4);
  
  // Convert spherical to Cartesian
  const x = canopyCenter.x + r * Math.sin(phi) * Math.cos(theta);
  const y = canopyCenter.y + r * Math.cos(phi) * 0.8; // Slightly flattened
  const z = canopyCenter.z + r * Math.sin(phi) * Math.sin(theta);
  
  return { x, y, z };
}

/**
 * Generate a unique message ID
 * @returns {string} - Unique identifier
 */
export function generateMessageId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomPart}`;
}
