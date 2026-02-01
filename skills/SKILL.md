# CCW: Carnage Championship Wrestling — Project Skills

## Overview

This project is a 2D beat-em-up extreme wrestling game built with Phaser 3. The goal is to capture the brutal, weapon-filled chaos of ECW, FMW, and Japanese deathmatch wrestling in an accessible browser game.

## Skill Files

| File | Purpose |
|------|---------|
| `phaser3/SKILL.md` | Phaser 3 API patterns, code examples, and best practices |
| `ccw-game/PRD.md` | Complete Product Requirements Document — features, personas, specs |
| `ccw-game/ASSETS.md` | Asset requirements — sprites, audio, file structure |
| `ccw-game/ARCHITECTURE.md` | Code architecture — file structure, patterns, systems |

## Quick Reference

### Tech Stack
- **Framework**: Phaser 3.80+
- **Build**: Vite
- **Language**: Vanilla JavaScript (ES6+)
- **Rendering**: Canvas 2D
- **Hosting**: Vercel or Cloudflare Pages

### Game Summary
| Element | Details |
|---------|---------|
| **Genre** | 2D beat-em-up / arcade wrestling |
| **Resolution** | 800x450 |
| **Characters** | The Dumpster, Scar |
| **Core Mechanic** | Weapon-based deathmatch combat |
| **Key Features** | Steel chairs, flaming tables, Extreme meter |
| **Target** | Hardcore wrestling fans, retro gaming enthusiasts |

### MVP Scope
- Single player vs AI
- 2 characters
- 1 weapon (steel chair)
- 1 table (breakable, burnable)
- 1 arena
- Basic combat (move, strike, pickup, slam)
- Health bars, Extreme meter
- Win/lose conditions

### Controls
| Action | Key |
|--------|-----|
| Move | WASD or Arrows |
| Attack | J or Z |
| Pickup | K or X |
| Table Slam | L or C |
| Light Fire | F |
| Pause | ESC |
| Start | ENTER |

### Key Values
| Stat | Value |
|------|-------|
| Player Health | 100 |
| Fist Damage | 8-12 |
| Chair Damage | 22 |
| Table Slam | 35 |
| Flaming Table | 55 |
| Fire DOT | 3/tick |

## Development Order

### Phase 1: Core (Get it playable)
1. Project setup (Vite + Phaser)
2. Boot scene with placeholder assets
3. Fighter entity with movement
4. Basic combat (attack, damage, hitstun)
5. Health bars
6. Win condition

### Phase 2: Weapons (Make it fun)
1. Chair pickup and swing
2. Table placement
3. Fire mechanic
4. Table slam/break
5. Particle effects
6. Screen shake

### Phase 3: Polish (Make it good)
1. AI opponent
2. Extreme meter
3. Menu and game over screens
4. Sound effects
5. Full animations
6. Final balance tuning

## Read Order for Claude

When starting work on this project:

1. **First**: Read `ccw-game/PRD.md` to understand what we're building
2. **Second**: Read `ccw-game/ARCHITECTURE.md` to understand how to structure code
3. **Reference**: Use `phaser3/SKILL.md` for API patterns as needed
4. **Reference**: Use `ccw-game/ASSETS.md` when creating/loading assets

## Notes for Claude

- Use the entity pattern (Fighter class) rather than bare sprites
- Keep scenes thin — use systems (CombatSystem, EffectsManager)
- All tunable values go in config files, not hardcoded
- Create placeholder graphics if real assets don't exist
- Test frequently — game should be playable at each phase
- Follow the file structure in ARCHITECTURE.md
