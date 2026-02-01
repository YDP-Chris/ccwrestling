# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CCW (Carnage Championship Wrestling) is a browser-based 2D beat-em-up extreme wrestling game celebrating hardcore/deathmatch wrestling in the style of ECW, FMW, and BJW.

**Status:** Ready for Development

## Skill Files (Read These First)

| File | Purpose |
|------|---------|
| `skills/SKILL.md` | Quick overview and read order |
| `skills/ccw-game/PRD.md` | What to build — features, personas, specs |
| `skills/ccw-game/ARCHITECTURE.md` | How to structure code — patterns, file organization |
| `skills/phaser3/SKILL.md` | Phaser 3 API patterns (reference as needed) |
| `skills/ccw-game/ASSETS.md` | Asset specs — sprites, audio, file structure |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Phaser 3.80+ |
| Language | Vanilla JavaScript (ES6+) |
| Build | Vite |
| Rendering | Canvas 2D (Arcade Physics) |
| Resolution | 800x450 |
| Hosting | Vercel or Cloudflare Pages |

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (localhost:5173)
npm run build        # Production build to /dist
vercel deploy --prod # Deploy to Vercel
```

## Project Structure

```
src/
├── main.js              # Phaser game config and launch
├── scenes/
│   ├── BootScene.js     # Asset loading
│   ├── MenuScene.js     # Title screen
│   ├── FightScene.js    # Main gameplay
│   └── GameOverScene.js # Results screen
├── entities/
│   ├── Fighter.js       # Base fighter class
│   ├── Dumpster.js      # Character-specific
│   ├── Scar.js          # Character-specific
│   ├── Chair.js         # Steel chair weapon
│   └── Table.js         # Breakable/burnable table
├── systems/
│   ├── CombatSystem.js  # Hit detection, damage
│   ├── AIController.js  # Enemy AI behavior
│   └── EffectsManager.js# Particles, shake, sounds
├── ui/
│   ├── HealthBar.js
│   ├── ExtremeMeter.js
│   └── Announcer.js
└── config/
    ├── constants.js     # DAMAGE, COMBAT, METER values
    ├── characters.js    # Stats, hitboxes, animations
    └── controls.js      # Key mappings
```

## Key Patterns

- **Scenes are thin** — delegate to systems and entities
- **Entities manage their own state** — Fighter has state machine (idle, attacking, hitstun, down, getup, ko)
- **Systems handle cross-entity logic** — CombatSystem for hits, EffectsManager for juice
- **Config files for all tunable values** — never hardcode damage, speeds, timings
- **Animation keys prefixed with character** — `dumpster-idle`, `scar-attack-chair`

## Game Values Quick Reference

| Stat | Value |
|------|-------|
| Player Health | 100 |
| Fist Damage | 8-12 |
| Chair Damage | 22 |
| Table Slam | 35 |
| Flaming Table | 55 |
| Fire DOT | 3/tick (6 ticks) |
| Movement Speed | 160 px/s |

## Controls

| Action | Player 1 | Player 2 |
|--------|----------|----------|
| Move | WASD | Arrows |
| Attack | J | Z |
| Pickup | K | X |
| Table Slam | L | C |
| Light Fire | F | — |
| Pause | ESC | ESC |

## Development Phases

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

## Coding Standards

- **Files**: PascalCase for classes (`Fighter.js`), camelCase for config (`constants.js`)
- **Classes**: PascalCase (`CombatSystem`)
- **Methods**: camelCase (`performAttack`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_HEALTH`)
- **Animation keys**: kebab-case with character prefix (`dumpster-idle`)

## OpenSpec Workflow

This project uses OpenSpec for spec-driven development. Use OpenSpec when adding new features, making breaking changes, or planning architecture shifts.

<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

### OpenSpec Quick Reference

```bash
openspec list                  # List active changes
openspec list --specs          # List specifications
openspec show [item]           # Display change or spec
openspec validate [item] --strict --no-interactive  # Validate
openspec archive <change-id> --yes  # Archive after deployment
```

### OpenSpec Directory Structure
```
openspec/
├── project.md          # Project conventions
├── specs/              # Current truth (what IS built)
├── changes/            # Proposals (what SHOULD change)
└── changes/archive/    # Completed changes
```

### When to Use OpenSpec
- **Use it**: New features, breaking changes, architecture decisions
- **Skip it**: Bug fixes, typos, config changes, tests for existing behavior

### Workflow
1. **Create proposal**: Scaffold under `openspec/changes/<change-id>/`
2. **Get approval**: Do not implement until approved
3. **Implement**: Follow `tasks.md` checklist
4. **Archive**: Move to `changes/archive/` after deployment
