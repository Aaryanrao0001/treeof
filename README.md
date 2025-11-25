# 🌳 Infinite Messaging Tree

A photorealistic, magical tree where messages are embedded as **glowing inscriptions** directly onto tree parts (bark, branches, leaves, roots) - creating a living archive of human thoughts.

## ✨ Overview

The Infinite Messaging Tree is a WebGL-based 3D interactive experience built with Three.js. Users can compose messages that become **glowing inscriptions ON the tree itself** - carved runes in bark, luminescent veins in branches, soft glows in leaves, and surface inscriptions on roots. All messages use a unified golden/warm glow aesthetic.

![Infinite Messaging Tree](https://github.com/user-attachments/assets/79fa0dc6-4f76-4422-95d7-3d0fbaac8222)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:3000`

## 🎮 Features

### Core Concept
Every message someone leaves becomes a **glowing inscription** on the magical tree. Messages are placed ON tree parts - not as separate floating objects:

| Tree Part | Message Appearance |
|-----------|-------------------|
| Trunk Bark | Carved glowing runes |
| Branch | Luminescent vein pulse |
| Leaf | Soft inner glow |
| Root | Surface inscription |

### Message Placement System
Messages are deterministically placed on tree geometry based on username and message ID:
- **Trunk** - Messages carved into bark surface
- **Branch** - Glowing veins along branches
- **Leaf** - Soft illumination in the canopy
- **Root** - Inscriptions on exposed root surfaces

### Unified Visual Style
- All messages use **golden/warm glow** aesthetic
- No emotion-based color differentiation
- Consistent magical appearance across all tree parts

### Weather System

| Weather | Effects |
|---------|---------|
| ☀️ Sun | Warm god-rays, soft breezes, full bloom effects |
| 🌧️ Rain | Glowing droplets on leaves, enhanced puddle reflections |
| ❄️ Snow | White shimmer, gentle snowfall, frost effects |
| 💨 Wind | Slow lateral sway, drifting petals and leaves |

## 🎨 Visual Style

The aesthetic is **ethereal fantasy realism**:
- Photorealistic tree with detailed bark texture
- Glowing golden veins running through trunk and roots
- Cinematic, emotional, immersive lighting
- Slow, peaceful animations throughout
- Firefly-like drifting particles
- Warm golden-hour lighting on one side, cool twilight on the other
- Volumetric god-rays and soft bloom post-processing

## 🖥️ UI Components

### Header (Top Center)
- App title with search functionality
- Enter a Message ID to fly the camera to that inscription

### Composer Panel (Bottom Left) - Simplified
- **Name input** - Your name
- **Message textarea** - Your message
- **Grow button** - Create new inscription
- *No emotion dropdown - all messages use unified golden glow*

### Weather Panel (Bottom Right)
- Weather selection buttons (Sun, Rain, Snow, Wind)

### Message Modal (On Click)
- Username
- Message text
- Timestamp
- Message ID
- Location on tree (trunk/branch/leaf/root)

## 🔧 Technical Details

### Data Structure
```javascript
{
  message_id: string,      // Unique identifier
  userName: string,        // Author's name
  message: string,         // Message content
  timestamp: Date,         // Creation time
  treePart: 'trunk' | 'branch' | 'leaf' | 'root',
  position: { x, y, z },   // 3D position on tree
  glowIntensity: number    // 0.5 - 1.0
}
```

### Message Placement
```javascript
// Messages placed ON tree geometry, not as separate objects
function getMessagePlacement(userName, messageId) {
  const seed = hashCode(userName + messageId);
  
  // Determine which tree part (trunk, branch, leaf, root)
  const treePart = getTreePart(seed);
  
  // Get 3D position on that part's surface
  const position = getPositionForTreePart(treePart, seed);
  
  // Golden glow intensity
  const glowIntensity = 0.5 + Math.random() * 0.5;
  
  return { treePart, position, glowIntensity };
}
```

### Animation Timings

| Animation | Duration | Easing |
|-----------|----------|--------|
| Inscription birth pulse | 1200ms | ease-out |
| Inscription drift loop | 2-6s | sinusoidal |
| Camera fly-to | 800-1200ms | ease-out-quad |
| Hover label appear | 250ms | ease |
| Wind sway | 1-3° amplitude | low frequency sine |
| Weather transition | 800ms | ease-in-out |

### Storage
Messages persist in localStorage (no backend required for prototype)

## 📁 Project Structure

```
/
├── index.html              # Main HTML entry (simplified UI)
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── src/
│   ├── main.js             # Entry point
│   ├── scene/
│   │   ├── Tree.js         # Tree mesh with glowing veins
│   │   ├── Environment.js  # Meadow, sky, lighting
│   │   ├── Nodes.js        # Message inscription system
│   │   ├── Weather.js      # Weather effects
│   │   └── PostProcessing.js # Bloom, god-rays
│   ├── ui/
│   │   ├── Composer.js     # Simplified: name + message only
│   │   ├── Modal.js        # Message detail with tree location
│   │   ├── Search.js       # Search functionality
│   │   └── WeatherUI.js    # Weather controls
│   ├── utils/
│   │   ├── hash.js         # Message placement algorithm
│   │   └── storage.js      # localStorage helpers
│   └── styles/
│       └── main.css        # UI styling
└── README.md               # This file
```

## 🌱 Memory Seeds

Each message is a **memory seed**—a tiny capsule of human thought inscribed onto the digital tree. Once planted, it becomes part of the tree forever, creating a living archive of collective consciousness.

## 📱 Mobile Support

The interface is fully responsive:
- Touch controls for camera manipulation
- Tap inscriptions to view details
- Optimized panels for smaller screens

## 📄 License

MIT License - Feel free to use, modify, and distribute.

---

*Plant a message. Watch it glow. Become part of the infinite tree.* 🌳✨
