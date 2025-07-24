# 3D Hockey Game Project

## Project Overview
This is a 3D hockey game built with Three.js, featuring top-down gameplay similar to classic arcade hockey games. The project started with a texture rendering issue but has expanded into developing a full game.

## Current State
- Basic 3D scene with hockey rink, sideboards, and puck
- Overhead camera view
- White rink surface (texture with NHL markings not rendering)
- LoadingManager implemented for asset loading

## Known Issues
1. **Rink Texture Not Rendering**: External texture URLs fail to display on the ice surface despite multiple attempts and proper loading management. Consider programmatic approach to draw markings.

## Project Structure
```
/
├── index.html          # Entry point with Three.js import map
├── main.js            # Game logic and Three.js scene setup
├── README.md          # Basic project info
└── tasks/
    └── rink-texture-issue.md  # Development plan and progress tracking
```

## Development Roadmap

### Phase 1: Foundation (High Priority)
1. Fix rink texture - Draw markings programmatically
2. Add player paddles (red vs blue teams)
3. Implement controls (Arrow keys + WASD)

### Phase 2: Gameplay (High Priority)
4. Puck physics (sliding, friction, bouncing)
5. Goals with nets
6. Collision detection
7. Score tracking and game timer

### Phase 3: Polish (Medium-Low Priority)
8. Sound effects
9. AI opponent
10. Visual effects (ice spray particles)

## Technical Details
- **Framework**: Three.js (loaded via CDN)
- **Camera**: Fixed overhead view
- **Rink Dimensions**: 30x15 units
- **Controls**: Arrow keys (Player 1), WASD (Player 2)

## Commands
```bash
# No build process - open index.html directly in browser
# or use a local server:
python -m http.server 8000
```

## Key Implementation Notes
- When adding new features, maintain the overhead camera perspective
- Keep physics arcade-style rather than fully realistic
- Prioritize fun gameplay over simulation accuracy
- Test with both players using keyboard simultaneously

## GitHub Issue
- Issue #1: Tracks full game development progress
- Repository: johnharl/sports-game-test