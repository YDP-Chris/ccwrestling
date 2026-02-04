# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CCW (Carnage Championship Wrestling) is a browser-based 2D beat-em-up extreme wrestling game celebrating hardcore/deathmatch wrestling in the style of ECW, FMW, and BJW. Built with Phaser 3 and Vite.

**Current Status:** v1.1 - 5 fully animated characters, 9 game modes, tournament system, stats tracking, replay system.

## Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Start Vite dev server (localhost:5173)
npm run build            # Production build to /dist

# Testing
npm run test             # Run unit tests (vitest)
npm run test:watch       # Watch mode for tests
npm run test:ui          # Vitest UI
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:headed  # E2E with visible browser

vercel deploy --prod     # Deploy to Vercel
```

## Tech Stack

- **Framework:** Phaser 3.80+ with Arcade Physics
- **Language:** Vanilla JavaScript (ES6 modules)
- **Build:** Vite 5.4+
- **Testing:** Vitest (unit), Playwright (E2E)
- **Resolution:** 800x450, Canvas 2D

## Architecture

### Scene Flow
```
BootScene → TitleScene → MenuScene → CharacterSelectScene → FightScene → GameOverScene
                              ↓
                    ┌─────────┼─────────┬────────────┐
                    ↓         ↓         ↓            ↓
             CareerMenuScene  OptionsScene  StatsScene  ReplayScene
                                            ↓
                              TournamentScene → TournamentBracketScene
```

### Core Systems (src/systems/)
| System | Purpose |
|--------|---------|
| `CombatSystem.js` | Hit detection, damage calculation, knockback |
| `AIController.js` | Enemy AI with 7 states (IDLE, APPROACH, ATTACK, RETREAT, SEEK_WEAPON, SEEK_TABLE, GRAPPLE) |
| `EffectsManager.js` | Particles, screen shake, audio, dynamic music, 60+ announcer callouts |
| `GrappleLogic.js` | Pure grapple logic (Phaser-independent, fully unit tested) |
| `StatsManager.js` | Match statistics, achievements, per-character records |
| `CareerManager.js` | Career mode progression data |
| `TransitionManager.js` | Scene transitions with data passing |
| `TournamentManager.js` | Tournament bracket creation, progression, persistence |
| `replay/` | Deterministic replay system with seeded RNG |

### UI Components (src/ui/)
| Component | Purpose |
|-----------|---------|
| `HealthBar.js` | Fighter health display |
| `ExtremeMeter.js` | Special move meter |
| `DamageNumbers.js` | Floating damage text |
| `ComboCounter.js` | Combo hit display |
| `MatchTimer.js` | Match countdown timer |
| `PracticeOverlay.js` | Practice mode move list, input display, damage tracker |

### Entity Pattern
`Fighter.js` is the base class with a state machine:
- States: `IDLE`, `WALKING`, `ATTACKING`, `HITSTUN`, `DOWN`, `GETUP`, `KO`, `GRAPPLING`, `GRAPPLED`, `THROWING`
- Weapons (`Chair.js`, `Table.js`) are separate entities fighters can pick up

### Configuration-Driven Design
All tunable values live in `src/config/`:
- `constants.js` - Damage, ranges, timings, meter gains
- `characters.js` - Character stats and animation definitions
- `controls.js` - Input key mappings

## Game Values (from constants.js)

| Category | Value |
|----------|-------|
| **Health** | 300 HP base |
| **Movement** | 280 px/s base |
| **Fist Damage** | 8-12 |
| **Chair Damage** | 22 |
| **Table Slam** | 35 |
| **Flaming Table** | 55 |
| **Fire DOT** | 3/tick × 6 ticks |
| **Grapple Throws** | 14-20 (throw/bodyslam/suplex/DDT) |

## Controls

| Action | Player 1 | Player 2 |
|--------|----------|----------|
| Move | WASD | Arrows |
| Attack | J | Z |
| Pickup | K | X |
| Table Slam | L | C |
| Light Fire | F | — |
| Grapple | G | V |
| Pause | ESC | ESC |

## Key Patterns

- **Scenes are thin** — delegate to systems and entities
- **Entities own their state** — Fighter manages its own state machine
- **Systems handle cross-entity logic** — CombatSystem for hits, EffectsManager for juice
- **Config files for all tunable values** — never hardcode damage, speeds, timings
- **Animation keys:** `{character}-{action}` (e.g., `dumpster-idle`, `scar-punch`)
- **Sprites:** 128×128 frames in 256×256 spritesheets (2×2 grid), displayed at 2.5x scale

## Testing

Unit tests (150 total) cover GrappleLogic, replay system, TournamentManager, and effects. Run specific tests:
```bash
npm run test                   # Run all 150 unit tests
npm run test -- grapple        # Run grapple tests (58)
npm run test -- replay         # Run replay tests (21)
npm run test -- tournament     # Run tournament tests (37)
npm run test -- effects        # Run effects tests (22)
```

E2E tests in `tests/` cover full game flows (chair mechanics, table mechanics, AI behavior).

## Documentation

| File | Purpose |
|------|---------|
| `skills/ccw-game/PRD.md` | Product requirements |
| `skills/ccw-game/ARCHITECTURE.md` | Code patterns |
| `skills/ccw-game/ASSETS.md` | Asset specifications |
| `skills/phaser3/SKILL.md` | Phaser 3 API reference |
| `ROADMAP.md` | v1.0 development roadmap with current status |

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

### When to Use OpenSpec
- **Use it**: New features, breaking changes, architecture decisions
- **Skip it**: Bug fixes, typos, config changes, tests for existing behavior

### Workflow
1. **Create proposal**: Scaffold under `openspec/changes/<change-id>/`
2. **Get approval**: Do not implement until approved
3. **Implement**: Follow `tasks.md` checklist
4. **Archive**: Move to `changes/archive/` after deployment
