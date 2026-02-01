# Project Context

## Purpose
CCW (Carnage Championship Wrestling) is a browser-based 2D beat-em-up extreme wrestling game that celebrates hardcore/deathmatch wrestling in the style of ECW, FMW, and BJW. The goal is to deliver devastating weapon combat and flaming table spots with accessible arcade controls.

## Tech Stack
- **Framework**: Phaser 3.80+
- **Language**: Vanilla JavaScript (ES6+)
- **Build**: Vite
- **Rendering**: Canvas 2D with Arcade Physics
- **Resolution**: 800x450
- **Hosting**: Vercel or Cloudflare Pages

## Project Conventions

### Code Style
- PascalCase for class files (`Fighter.js`, `CombatSystem.js`)
- camelCase for utility/config files (`constants.js`, `controls.js`)
- UPPER_SNAKE_CASE for constants (`MAX_HEALTH`, `FIST_DAMAGE`)
- kebab-case for animation keys, prefixed with character (`dumpster-idle`, `scar-attack-chair`)

### Architecture Patterns
- **Thin Scenes**: Scenes only wire things together; delegate logic to systems and entities
- **Entity Pattern**: Game objects (Fighter, Chair, Table) extend Phaser.GameObjects.Sprite and manage their own state
- **Systems**: Cross-cutting concerns live in system classes (CombatSystem, EffectsManager, AIController)
- **Config-Driven**: All tunable values (damage, speeds, timings) live in `/src/config/`, never hardcoded

### State Management
Fighters use a simple state machine with states:
- `idle` — Can move and act
- `attacking` — Locked in attack animation
- `hitstun` — Brief stagger after taking damage
- `down` — Knocked down, recovering
- `getup` — Rising from knockdown (brief invulnerability after)
- `ko` — Health depleted, match over

### Testing Strategy
Manual testing checklist before commits:
- Game loads without console errors
- Both characters can move and attack
- Chair can be picked up and used
- Table can be lit and broken
- Health bars update correctly
- KO triggers win condition
- Menu and restart work
- Stable 60 FPS during combat

### Git Workflow
- Main branch should always be deployable
- Feature branches for new capabilities
- Use OpenSpec proposals for significant changes
- Commit messages: imperative mood, concise ("Add chair pickup mechanic")

## Domain Context

### Wrestling Game Terminology
- **Deathmatch**: Wrestling match with weapons, no disqualification
- **Spot**: A planned high-impact move or sequence
- **Bump**: Taking a fall or hit
- **Heat**: Crowd reaction/engagement
- **Hitstop**: Brief pause on impact for feedback/weight
- **DOT**: Damage over time (fire effect)
- **KO**: Knockout — health reduced to zero

### Core Mechanics
- **Combat**: Strike-based beat-em-up (no complex grappling in MVP)
- **Weapons**: Steel chair (22 damage, causes knockdown)
- **Tables**: Can be ignited, slam opponent through for massive damage (35/55 if burning)
- **Extreme Meter**: Builds from dealing/taking damage, gates special moves
- **Win Condition**: Deplete opponent health to 0 for KO

### Key Values
| Stat | Value |
|------|-------|
| Starting Health | 100 |
| Fist Damage | 8-12 (random) |
| Chair Damage | 22 |
| Table Slam | 35 |
| Flaming Table Slam | 55 |
| Fire DOT | 3 damage/tick, 6 ticks |
| Movement Speed | 160 px/s |

## Important Constraints

### Technical
- Browser-only (no native/mobile)
- No backend required for MVP
- Keyboard input only (gamepad deferred)
- Must maintain 60 FPS with up to 200 particles

### Business
- Solo developer
- No budget for licensed content (original characters only)
- Avoid WWE/AEW/ECW trademark issues
- Target 4-6 week MVP timeline

### Scope (MVP)
**In**: 2 characters, 1 arena, steel chair, flaming tables, AI opponent, health/meter UI, win/lose conditions
**Out**: Online multiplayer, character creator, mobile, story mode, multiple arenas, grappling system

## External Dependencies
- Phaser 3 (game framework)
- Vite (build tool)
- No external APIs or backend services for MVP
