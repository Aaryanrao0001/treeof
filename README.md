# 🌳 Infinite Messaging Tree

A living, magical, ever-expanding digital organism where every message becomes a glowing node on a magical tree.

## ✨ Overview

The Infinite Messaging Tree is a WebGL-based 3D interactive experience built with Three.js. Users can compose messages that become glowing nodes on a mystical tree, each node taking on a visual form based on the emotion selected. The tree exists in a dynamic environment with weather effects, fireflies, and dreamy animations.

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
Every message someone leaves becomes a **node** (a visual object) attached to the magical tree. The tree never stops growing—each new message spawns a leaf, blossom, fruit, or spark depending on the emotional essence of the message.

### Emotion → Visual Form Mapping

| Emotion | Growth Type | Color | Description |
|---------|-------------|-------|-------------|
| Joy | Tender pale-green leaf | `#90EE90` | Icosahedron shape with gentle glow |
| Love | Warm pink blossom | `#FFB6C1` | Soft sphere with pulsing light |
| Sadness | Silver droplet | `#C0C0C0` | Teardrop shape, subtle shimmer |
| Anger | Twisted dark bud | `#8B0000` | Cone shape with deep red emissive |
| Confusion | Curled leaf | `#DDA0DD` | Torus shape, purple tones |
| Secret | Hollow golden fruit | `#FFD700` | Dodecahedron with warm glow |
| Excitement | Tiny bright spark | `#FFFF00` | Octahedron with intense brightness |

### Node Behaviors
- Each node glows with its emotion-specific color
- Slow dreamy sway animation (1-3 degrees amplitude, low frequency)
- Node birth animation: 900-1400ms ease pulse, then slow drift loop
- Hover shows username label (250ms delay)
- Click opens modal with full message details

### Weather Magic System

| Weather | Effects |
|---------|---------|
| ☀️ Clear | Warm god-rays, soft breezes, full bloom effects |
| 🌧️ Rain | Glowing droplets on leaves, enhanced puddle reflections |
| 🌫️ Fog | Soft scattering, muted colors, dreamy atmosphere |
| 💨 Wind | Slow lateral sway, drifting petals and leaves |
| ❄️ Snow | White shimmer, gentle snowfall, frost effects |

### Yearly Apple System (Yearfruit)

Messages accumulate into "apples" that represent community milestones:

| Threshold | Tier | Appearance |
|-----------|------|------------|
| 0 | Red | 🍎 Standard red apple |
| 100,000 | Silver | ⚪ Silver gleaming apple |
| 1,000,000 | Gold | 🌟 Golden radiant apple |
| 10,000,000 | Runic | 🔮 Ancient runic apple |
| 100,000,000 | White | 🍏 Ethereal white apple |

## 🎨 Visual Style

The aesthetic is **ethereal fantasy realism**—NOT anime or cartoon:
- Cinematic, emotional, immersive
- Slow, peaceful animations throughout
- Firefly-like drifting particles
- Everything moves very slowly—wind breathes, petals drift, nodes bob
- Warm golden-hour lighting on one side, cool twilight on the other
- Volumetric god-rays and soft bloom post-processing

## 🖥️ UI Components

### Header (Top Center)
- App title with search functionality
- Enter a Message ID to fly the camera to that node

### Composer Panel (Bottom Left)
- Name input field
- Emotion dropdown selector
- Message textarea
- Glowing "Grow" button to create new messages

### Weather Panel (Bottom Right)
- Weather selection buttons
- Auto-Weather toggle for automatic cycling

### Node Legend (Left Side)
- Visual guide to node types and colors

### Yearfruit Display (Top Left)
- Shows current year's apple with tier indicator
- Displays message count for the year

## 🔧 Technical Details

### Deterministic Positioning
Nodes are positioned deterministically based on username and message ID:

```javascript
function getNodePosition(userName, messageId) {
  const seed = hashCode(userName + messageId);
  // Converts to spherical coordinates on tree canopy
  return { x, y, z };
}
```

### Data Structure
```javascript
{
  message_id: string,      // Unique identifier
  userName: string,        // Author's name
  message: string,         // Message content
  emotion: string,         // joy|love|sadness|anger|confusion|secret|excitement
  timestamp: Date,         // Creation time
  node_position: {x, y, z} // 3D position on tree
}
```

### LOD System
- **LOD0** (close): Full 3D mesh, clickable
- **LOD1** (medium): Instanced textured quads
- **LOD2** (far): Particle/haze clusters

### Animation Timings

| Animation | Duration | Easing |
|-----------|----------|--------|
| Node birth pulse | 900-1400ms | ease-out |
| Node drift loop | 2-6s | sinusoidal |
| Camera fly-to | 800-1200ms | ease-out-quad |
| Hover label appear | 250ms | ease |
| Wind sway | 1-3° amplitude | low frequency sine |
| Weather transition | 500-1000ms | ease-in-out |

### Storage
Messages persist in localStorage (no backend required for prototype)

## 📁 Project Structure

```
/
├── index.html              # Main HTML entry
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── src/
│   ├── main.js             # Entry point
│   ├── scene/
│   │   ├── Tree.js         # Tree mesh & materials
│   │   ├── Environment.js  # Meadow, sky, lighting
│   │   ├── Nodes.js        # Message node system
│   │   ├── Weather.js      # Weather effects
│   │   └── PostProcessing.js # Bloom, god-rays
│   ├── ui/
│   │   ├── Composer.js     # Message input panel
│   │   ├── Modal.js        # Message detail modal
│   │   ├── Search.js       # Search functionality
│   │   ├── WeatherUI.js    # Weather controls
│   │   └── Yearfruit.js    # Yearfruit display
│   ├── utils/
│   │   ├── hash.js         # Deterministic positioning
│   │   └── storage.js      # localStorage helpers
│   └── styles/
│       └── main.css        # UI styling
├── public/
│   └── textures/           # Tree bark, leaves, etc.
└── README.md               # This file
```

## 🌱 Memory Seeds

Each message is a **memory seed**—a tiny capsule of human thought planted in the digital soil. Once planted, it becomes part of the tree forever, creating a living archive of collective consciousness.

## 🎭 Auto-Expansion Rule

The tree grows automatically as messages accumulate:
- More messages = larger canopy
- Diverse emotions = richer color palette
- Community activity = brighter glow

## 📱 Mobile Support

The interface is fully responsive:
- Touch controls for camera manipulation
- Tap nodes to view details
- Optimized panels for smaller screens

## 🔮 Future Enhancements

- Backend integration for persistent storage
- Real-time multiplayer viewing
- Sound design and ambient audio
- Advanced particle effects
- VR/AR support

## 📄 License

MIT License - Feel free to use, modify, and distribute.

---

*Plant a message. Watch it grow. Become part of the infinite tree.* 🌳✨
