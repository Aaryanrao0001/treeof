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
 * Tree parts for message placement
 */
const TREE_PARTS = ['trunk', 'branch', 'leaf', 'root'];

/** Default tree part for fallback */
export const DEFAULT_TREE_PART = 'trunk';

/**
 * Get deterministic message placement on tree
 * Messages are placed ON tree geometry, not as separate objects
 * @param {string} userName - User's name
 * @param {string} messageId - Unique message identifier
 * @returns {{treePart: string, position: {x, y, z}, glowIntensity: number}}
 */
export function getMessagePlacement(userName, messageId) {
  const seed = hashCode(userName + messageId);
  const rand = seededRandom(seed);
  
  // Determine which tree part (trunk, branch, leaf, root)
  const partIndex = seed % TREE_PARTS.length;
  const treePart = TREE_PARTS[partIndex];
  
  // Get position based on tree part
  const position = getPositionForTreePart(treePart, rand, seed);
  
  // Random glow intensity (0.5 - 1.0)
  const glowIntensity = 0.5 + rand() * 0.5;
  
  return {
    treePart,
    position,
    glowIntensity
  };
}

/**
 * Get 3D position based on tree part
 */
function getPositionForTreePart(treePart, rand, seed) {
  switch (treePart) {
    case 'trunk': {
      // Position on trunk surface (cylinder)
      const angle = (seed * 0.618) % (Math.PI * 2);
      const height = 1 + rand() * 6; // Height 1-7 on trunk
      const radius = 1.2 + (height / 8) * -0.3; // Tapers towards top
      return {
        x: Math.cos(angle) * radius,
        y: height,
        z: Math.sin(angle) * radius
      };
    }
    case 'branch': {
      // Position along branches
      const branchAngle = (seed * 0.718) % (Math.PI * 2);
      const branchLength = 1 + rand() * 3;
      const height = 5 + rand() * 3;
      return {
        x: Math.cos(branchAngle) * branchLength,
        y: height,
        z: Math.sin(branchAngle) * branchLength
      };
    }
    case 'leaf': {
      // Position in canopy
      const theta = (seed * 0.618) % (Math.PI * 2);
      const phi = Math.acos(1 - 2 * rand());
      const canopyRadius = 4 + rand() * 2;
      return {
        x: canopyRadius * Math.sin(phi) * Math.cos(theta),
        y: 8 + canopyRadius * Math.cos(phi) * 0.6,
        z: canopyRadius * Math.sin(phi) * Math.sin(theta)
      };
    }
    case 'root': {
      // Position on exposed roots
      const rootAngle = (seed * 0.818) % (Math.PI * 2);
      const rootLength = 2 + rand() * 2;
      return {
        x: Math.cos(rootAngle) * rootLength,
        y: -0.1 + rand() * 0.5,
        z: Math.sin(rootAngle) * rootLength
      };
    }
    default:
      return { x: 0, y: 5, z: 0 };
  }
}

/**
 * Generate deterministic 3D position for a message node
 * @deprecated Use getMessagePlacement() instead for full placement info
 * @param {string} userName - User's name
 * @param {string} messageId - Unique message identifier
 * @returns {{x: number, y: number, z: number}} - 3D position
 */
export function getNodePosition(userName, messageId) {
  const placement = getMessagePlacement(userName, messageId);
  return placement.position;
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
