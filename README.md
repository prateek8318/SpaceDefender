# 🚀 SpaceDefender - React Native Game

A fully-featured space shooter game built with React Native and React Native Game Engine. Defend Earth from waves of alien invaders in this classic arcade-style game!

![SpaceDefender Logo](https://img.shields.io/badge/SpaceDefender-React%20Native-blue?style=for-the-badge&logo=react)

## 📱 Screenshots

*(Add screenshots here when available)*

## 🎮 Game Features

### Core Gameplay
- **Smooth Controls** - Touch-based movement with gesture handling
- **Auto-Firing** - Continuous bullet shooting with upgradeable weapons
- **Enemy Waves** - Progressive difficulty with multiple enemy types
- **Particle Effects** - Explosions and visual feedback
- **Sound Effects** - Immersive audio experience

### Enemy Types
- **🔷 Basic Enemies** - Standard red invaders
- **⚡ Fast Enemies** - Quick orange attackers
- **🛡️ Tank Enemies** - Heavy purple defenders with multiple HP
- **👑 Boss Enemies** - Epic bosses appearing every 5 levels

### Weapon System
- **Level 1-2**: Single shot
- **Level 3-4**: Double shot
- **Level 5+**: Triple shot with increased fire rate

### Game Systems
- **10 Progressive Levels** - Increasing difficulty and enemy speed
- **Score Tracking** - Points for each enemy destroyed
- **Lives System** - 3 lives with game over functionality
- **Pause/Resume** - Full game state management
- **Leaderboard** - High score tracking

## 🛠️ Technical Implementation

### Architecture
- **React Native Game Engine** - Entity-component-system architecture
- **TypeScript** - Full type safety
- **Gesture Handling** - React Native Gesture Handler
- **Navigation** - React Navigation with smooth transitions
- **State Management** - Custom hooks for game state

### Game Systems
```typescript
// Core Systems
- PlayerSystem      // Handles player movement and controls
- BulletSystem      // Manages bullet spawning and movement
- EnemySystem       // Controls enemy spawning and AI
- CollisionSystem    // Handles collision detection and physics
- ParticleSystem     // Manages visual effects and explosions
```

### Entity Management
- **Component-based Rendering** - React components for each entity type
- **Dynamic Entity Creation** - Runtime entity spawning
- **Efficient Collision Detection** - Circle-based collision algorithms
- **Memory Management** - Proper entity cleanup

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ 
- React Native development environment
- Android Studio / Xcode for device testing

### Clone & Install
```bash
git clone https://github.com/prateek8318/SpaceDefender.git
cd SpaceDefender
npm install
```

### iOS Setup
```bash
cd ios && pod install && cd ..
```

### Run the Game

#### Development Mode
```bash
# Start Metro bundler
npm start

# In another terminal, run on Android
npm run android

# Or run on iOS
npm run ios
```

#### Production Build
```bash
# Android
cd android && ./gradlew assembleRelease

# iOS
cd ios && xcodebuild -workspace SpaceDefender.xcworkspace -scheme SpaceDefender -configuration Release
```

## 🎯 How to Play

1. **Start Game** - Tap "Start Game" from the main menu
2. **Move Player** - Touch and drag to move your spaceship left/right
3. **Auto-Fire** - Your ship automatically shoots bullets
4. **Destroy Enemies** - Hit enemies before they reach the bottom
5. **Avoid Collisions** - Don't let enemies hit your spaceship
6. **Progress Levels** - Destroy required enemies to advance
7. **Survive** - Game ends when all 3 lives are lost

### Scoring System
- **Basic Enemy**: 10 points
- **Fast Enemy**: 20 points  
- **Tank Enemy**: 50 points
- **Boss Enemy**: 100 points

### Level Progression
- **Kills Required**: Increases per level (5→6→7→8→9→10→11→12→13→15)
- **Enemy Speed**: Increases 0.1x per level
- **Spawn Rate**: Decreases 100ms per level
- **Boss Battles**: Every 5th level (5, 10)

## 📁 Project Structure

```
src/
├── components/          # React components for game entities
│   ├── Player.tsx      # Player spaceship component
│   ├── Enemy.tsx       # Enemy components
│   ├── Bullet.tsx      # Bullet components
│   ├── Particle.tsx    # Particle effects
│   └── HUD.tsx        # Heads-up display
├── systems/            # Game engine systems
│   ├── PlayerSystem.ts  # Player movement logic
│   ├── BulletSystem.ts  # Bullet spawning and physics
│   ├── EnemySystem.ts   # Enemy spawning and AI
│   ├── CollisionSystem.ts # Collision detection
│   └── ParticleSystem.ts # Particle management
├── hooks/              # Custom React hooks
│   ├── useGameState.ts # Game state management
│   └── useSounds.ts   # Audio system
├── screens/            # Navigation screens
│   ├── HomeScreen.tsx  # Main menu
│   ├── GameScreen.tsx  # Main game screen
│   ├── LevelSelectScreen.tsx # Level selection
│   └── LeaderboardScreen.tsx # High scores
├── utils/              # Utility functions
│   ├── colors.ts       # Game color scheme
│   ├── responsive.ts   # Screen dimensions
│   ├── physics.ts      # Collision helpers
│   └── levelConfig.ts # Level configurations
└── types/              # TypeScript definitions
    └── game.types.ts   # Game entity types
```

## 🎨 Customization

### Adding New Enemy Types
```typescript
// In EnemySystem.ts
const createEnemy = (type: 'basic' | 'fast' | 'tank' | 'boss' | 'new-type') => {
  const config = {
    'new-type': { hp: 2, speed: 1.5, points: 30, width: 35, height: 35 }
  };
  // ... implementation
};
```

### Modifying Game Difficulty
```typescript
// In levelConfig.ts
export const LEVELS: Level[] = [
  { id: 1, enemyInterval: 1400, enemySpeed: 0.9, killsToAdvance: 5 },
  // Customize levels as needed
];
```

### Adding Power-ups
Extend the entity system with power-up components and collision logic.

## 🔧 Development

### Available Scripts
```bash
npm start          # Start Metro bundler
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator
npm run lint       # Run ESLint
npm test           # Run Jest tests
```

### Debugging
- **React Native Debugger** - Connect to debug Redux state and network
- **Flipper** - Advanced debugging with React Native
- **Console Logs** - Debug game state and entity updates

## 🐛 Troubleshooting

### Common Issues
1. **Metro Port Conflict** - Kill existing Metro processes or use different port
2. **Android Build Fail** - Clean with `cd android && ./gradlew clean`
3. **iOS Pod Issues** - Reinstall with `cd ios && pod deintegrate && pod install`
4. **Game Not Visible** - Check entity renderer assignments in systems

### Performance Tips
- Use `React.memo` for entity components
- Optimize collision detection algorithms
- Limit particle count for performance
- Use `useCallback` for event handlers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Native Game Engine** - For the excellent game engine framework
- **React Native Gesture Handler** - For smooth touch controls
- **React Navigation** - For seamless navigation
- **Matter.js** - For physics calculations (included in dependencies)

---

**Made with ❤️ using React Native**

*Game on! 🎮*
