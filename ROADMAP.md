# CCW v1.0 Roadmap

**Goal:** A polished, complete browser-based wrestling game with multiple characters, arenas, weapons, and game modes.

**Target:** ~40-50 development sessions (1-2 hours each)

---

## Current State (v0.5)

### Done ✅
- [x] Core fighting mechanics (movement, punch, hitstun, knockdown)
- [x] 2 characters (Dumpster, Scar)
- [x] 2 arenas (Warehouse, Basement)
- [x] Grapple system with 4 throws
- [x] Health bars and Extreme meter
- [x] AI opponent
- [x] Menu and Game Over screens
- [x] Unit tests (79 passing)
- [x] Replay system
- [x] Pause functionality

### Partially Done 🟡
- [ ] Chair weapon (code exists, needs polish)
- [ ] Table weapon (code exists, needs fire mechanic)
- [ ] Sound effects (some exist, need more)

---

## Phase 1: Core Polish (Sessions 1-8)

**Goal:** Make what exists feel complete and polished.

### Session 1-2: Weapons Complete
- [ ] Chair pickup and swing working
- [ ] Chair sprites (ground, held)
- [ ] Chair hit sound effect
- [ ] Chair breaks after 3 hits

### Session 3-4: Table Mechanics
- [ ] Table placement in arena
- [ ] Table slam move (throw opponent through)
- [ ] Table breaks with debris particles
- [ ] Table slam sound effect

### Session 5-6: Fire Mechanic
- [ ] Light table on fire (F key near table)
- [ ] Fire visual effect on table
- [ ] Flaming table slam (bonus damage)
- [ ] Fire DOT when fighter is burning
- [ ] Fire particle effects

### Session 7-8: Audio Pass
- [ ] Hit sounds (punch, chair, slam)
- [ ] Grapple/throw sounds
- [ ] Crowd reactions
- [ ] Fight music track
- [ ] Victory fanfare

**Phase 1 Deliverable:** Complete fighting experience with weapons and audio.

---

## Phase 2: Characters (Sessions 9-18)

**Goal:** 4 playable characters with distinct styles.

### Session 9-10: Character 3 - "Hardcore Holly" Type
- [ ] Design: Technical wrestler, balanced stats
- [ ] Generate 12 sprites
- [ ] Add to characters.js
- [ ] Add to BootScene.js
- [ ] Playtest and balance

### Session 11-12: Character 4 - "Big Show" Type
- [ ] Design: Giant, slow but powerful
- [ ] Generate 12 sprites
- [ ] Code integration
- [ ] Unique: Higher knockback, slower recovery

### Session 13-14: Character 3 Grapple Moves
- [ ] Generate 3 throw sprites (suplex, DDT, bodyslam)
- [ ] Integrate animations

### Session 15-16: Character 4 Grapple Moves
- [ ] Generate 3 throw sprites
- [ ] Integrate animations

### Session 17-18: Character Select Screen
- [ ] Character select UI
- [ ] Character portraits (4)
- [ ] Stats display
- [ ] P1/P2 selection (for future 2P)
- [ ] Confirm and start fight

**Phase 2 Deliverable:** 4 unique characters with selection screen.

---

## Phase 3: Arenas (Sessions 19-24)

**Goal:** 4 distinct fighting environments.

### Session 19-20: Arena 3 - Parking Lot
- [ ] Outdoor night scene
- [ ] Cars as background props
- [ ] Street lights
- [ ] Concrete floor bounds

### Session 21-22: Arena 4 - Bar/Saloon
- [ ] Indoor bar setting
- [ ] Bottles and stools as props
- [ ] Neon signs
- [ ] Wooden floor

### Session 23-24: Arena Select + Props
- [ ] Arena select screen
- [ ] Arena preview images
- [ ] Interactive props per arena (optional)
- [ ] Arena-specific ambient sounds

**Phase 3 Deliverable:** 4 arenas with selection screen.

---

## Phase 4: Game Modes (Sessions 25-32)

**Goal:** Multiple ways to play.

### Session 25-26: Best of 3
- [ ] Round system
- [ ] Round win tracking
- [ ] Round transition screen
- [ ] "Round 1... FIGHT!" announcements

### Session 27-28: Survival Mode
- [ ] Endless opponents
- [ ] Health carries over (partial restore)
- [ ] Score tracking
- [ ] High score save (localStorage)
- [ ] Difficulty ramp

### Session 29-30: Hardcore Mode
- [ ] Weapons spawn randomly
- [ ] Multiple chairs and tables
- [ ] Faster action
- [ ] No DQ rules display

### Session 31-32: Mode Select Screen
- [ ] Mode selection UI
- [ ] Mode descriptions
- [ ] Mode-specific options
- [ ] Flow: Menu → Mode → Character → Arena → Fight

**Phase 4 Deliverable:** 4 game modes with proper menu flow.

---

## Phase 5: Polish & Juice (Sessions 33-38)

**Goal:** Make it feel like a real game.

### Session 33-34: Visual Effects
- [ ] Hit sparks/impact effects
- [ ] Blood splatter (optional toggle)
- [ ] Dust on landing
- [ ] Screen flash on big hits
- [ ] Slowmo on finishing blow

### Session 35-36: Announcer System
- [ ] "FIGHT!" voice
- [ ] Move callouts ("SUPLEX!", "DDT!")
- [ ] Health warnings ("He's hurt!")
- [ ] Victory announcements
- [ ] Generate with Ludo createVoice

### Session 37-38: UI Polish
- [ ] Animated health bars
- [ ] Combo counter
- [ ] Damage numbers (floating)
- [ ] Better fonts
- [ ] Loading screen

**Phase 5 Deliverable:** Polished, juicy game feel.

---

## Phase 6: Story Mode (Sessions 39-44)

**Goal:** Single-player campaign.

### Session 39-40: Story System
- [ ] Chapter/fight progression
- [ ] Dialogue system
- [ ] Character portraits for dialogue
- [ ] Save progress (localStorage)

### Session 41-42: Story Content - Act 1
- [ ] 3-4 fights with dialogue
- [ ] Dumpster's story arc
- [ ] Intro cutscene
- [ ] Rival introduction

### Session 43-44: Story Content - Act 2
- [ ] 3-4 more fights
- [ ] Final boss fight
- [ ] Ending cutscene
- [ ] Credits roll

**Phase 6 Deliverable:** Complete story mode with 6-8 fights.

---

## Phase 7: Final Polish (Sessions 45-50)

**Goal:** Ship-ready quality.

### Session 45-46: Local 2-Player
- [ ] Player 2 controls (arrows + ZXC)
- [ ] 2P character select
- [ ] Camera adjustments if needed
- [ ] 2P UI (both health bars work)

### Session 47-48: Settings & Accessibility
- [ ] Options menu
- [ ] Volume controls
- [ ] Control rebinding (optional)
- [ ] Difficulty settings
- [ ] Screen shake toggle

### Session 49: Bug Bash
- [ ] Full playthrough all modes
- [ ] Fix any bugs found
- [ ] Performance check
- [ ] Mobile browser test

### Session 50: Launch Prep
- [ ] Final build
- [ ] Deploy to Vercel/hosting
- [ ] Screenshots for sharing
- [ ] README update
- [ ] v1.0 tag

**Phase 7 Deliverable:** Shipped game! 🎉

---

## Quick Reference: All Assets Needed

### Characters (4 total)
| Character | Sprites | Status |
|-----------|---------|--------|
| Dumpster | 12 | ✅ Done |
| Scar | 12 | ✅ Done |
| Character 3 | 12 | ⬜ TODO |
| Character 4 | 12 | ⬜ TODO |

**Total character sprites: 48**

### Arenas (4 total)
| Arena | Status |
|-------|--------|
| Warehouse | ✅ Done |
| Basement | ✅ Done |
| Parking Lot | ⬜ TODO |
| Bar | ⬜ TODO |

### Weapons (3 total)
| Weapon | Sprites | Status |
|--------|---------|--------|
| Chair | 2 | 🟡 Partial |
| Table | 3 | 🟡 Partial |
| Ladder/Bat | 2 | ⬜ TODO |

### Audio
| Type | Count | Status |
|------|-------|--------|
| Music tracks | 3 | 🟡 1 done |
| Hit SFX | 8 | ⬜ TODO |
| Voice lines | 10 | ⬜ TODO |
| Ambient | 4 | ⬜ TODO |

### UI Screens
| Screen | Status |
|--------|--------|
| Main Menu | ✅ Done |
| Character Select | ⬜ TODO |
| Arena Select | ⬜ TODO |
| Mode Select | ⬜ TODO |
| Fight HUD | ✅ Done |
| Pause | ✅ Done |
| Game Over | ✅ Done |
| Options | ⬜ TODO |

---

## Milestone Summary

| Milestone | Sessions | Deliverable |
|-----------|----------|-------------|
| Phase 1 | 1-8 | Weapons + Audio |
| Phase 2 | 9-18 | 4 Characters |
| Phase 3 | 19-24 | 4 Arenas |
| Phase 4 | 25-32 | 4 Game Modes |
| Phase 5 | 33-38 | Polish + Juice |
| Phase 6 | 39-44 | Story Mode |
| Phase 7 | 45-50 | Ship v1.0 |

---

## Daily Session Template

```markdown
## Session [N] - [Date]

### Goal
[One sentence goal]

### Tasks
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Assets Created
- sprite1.png
- sprite2.png

### Code Changed
- file1.js
- file2.js

### Notes
[Any issues, decisions, or ideas for later]

### Tomorrow
[What's next]
```

---

## Starting Tomorrow?

**Recommended first session:** Phase 1, Session 1-2 (Weapons Complete)

The chair code already exists but needs:
1. Working pickup/drop
2. Proper sprites
3. Sound effect
4. Testing

This builds on existing code and gives immediate visible progress.
