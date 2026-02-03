# CCW v1.0 Roadmap

**Goal:** A polished, complete browser-based wrestling game with multiple characters, arenas, weapons, and game modes.

**Target:** ~40-50 development sessions (1-2 hours each)

---

## Current State (v0.9) - Updated 2026-02-03

### Done ✅
- [x] Core fighting mechanics (movement, punch, hitstun, knockdown)
- [x] 5 characters defined (Dumpster, Scar, Blaze, Tank, Viper)
- [x] 5 fully animated characters (all 14 sprites each - 70 total)
- [x] 5+ arenas (Warehouse, Basement, Boiler Room, Factory, Parking Lot)
- [x] Grapple system with 4 throws (suplex, DDT, bodyslam, base throw)
- [x] Health bars and Extreme meter
- [x] AI opponent with weapon awareness
- [x] Menu, Title, and Game Over screens
- [x] Character Select screen (functional)
- [x] Arena Select screen (functional)
- [x] Unit tests (61+ grapple tests, replay tests)
- [x] Replay system with seeded RNG
- [x] Pause functionality
- [x] Chair weapon (pickup, swing, breaks after 3 hits, debris particles)
- [x] Table weapon (placement, break mechanics, fire state)
- [x] Fire mechanic (ignite table, DOT 3dmg × 6 ticks)
- [x] Career mode (5 chapters, 6 PPVs, rivalry system, full UI)
- [x] Stats tracking system
- [x] Transition manager for scene changes
- [x] All SFX wired and playing (hit, chair, table, fire, crowd, menu, KO, music)
- [x] Best of 3 mode with round system
- [x] Survival mode with streak tracking and difficulty ramp

### Partially Done 🟡
- [ ] Fire visual effects on burning fighters (deferred)

---

## Character Reference

### Visual Designs

| Character | Build | Appearance | Palette |
|-----------|-------|------------|---------|
| **Dumpster** | Heavyset, barrel chest | Red/black plaid flannel, gray hair/beard, jeans, work boots | Browns, reds, gray |
| **Scar** | Lean, wiry | Shirtless, black pants, dark spiky hair, red bandana, hand wraps | Black, red, skin |
| **Blaze** | Athletic, muscular | Shirtless, red/orange trunks & boots, spiky fire-red hair | Orange, red, yellow |
| **Tank** | Massive, bulky | Black tank top, bald, heavily tattooed arms | Black, skin, tattoo colors |
| **Viper** | Lean, athletic | Shirtless, green patterned pants, green mask/face paint | Green, black, skin |

### Animation Status

| Character | idle | walk | punch | hit | down | victory | chair | getup | grapple | grappled | throw | throw-suplex | throw-ddt | throw-bodyslam |
|-----------|------|------|-------|-----|------|---------|-------|-------|---------|----------|-------|--------------|-----------|----------------|
| Dumpster | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Scar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Blaze | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tank | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Viper | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**All 70 sprites complete!** (14 per character × 5 characters)

### Character Stats

| Character | Health | Speed | Attack | Defense | Play Style |
|-----------|--------|-------|--------|---------|------------|
| Dumpster | 100% | 0.9x | 1.1x | 1.1x | Power - slow but hits hard, takes less damage |
| Scar | 100% | 1.1x | 1.0x | 0.9x | Speed - fast but fragile |
| Blaze | 85% | 1.2x | 1.25x | 0.75x | Glass cannon - very fast, high damage, very fragile |
| Tank | 120% | 0.75x | 1.3x | 1.25x | Tank - slow, devastating hits, very durable |
| Viper | 100% | 1.0x | 1.0x | 1.0x | Balanced - all-rounder |

---

## Phase 1: Complete Characters (Sessions 1-4) ✅ COMPLETE

**Goal:** All 5 characters fully playable with complete animation sets.

### Session 1-2: Blaze Animations ✅
- [x] Generate 8 missing sprites for Blaze
- [x] Verify animations in BootScene.js
- [x] Playtest Blaze vs AI

### Session 3-4: Tank & Viper Animations ✅
- [x] Generate 8 missing sprites for Tank
- [x] Generate 8 missing sprites for Viper
- [x] Playtest all 5 characters

**Phase 1 Deliverable:** 5 fully animated, playable characters. ✅

---

## Phase 2: Audio & Polish (Sessions 5-10) ✅ COMPLETE

**Goal:** Wire up existing audio and add missing juice.

### Session 5-6: Sound Integration ✅
- [x] Wire sfx-hit to punch impacts
- [x] Wire sfx-chair-hit to chair attacks
- [x] Wire sfx-table-break to table destruction
- [x] Wire crowd reactions to big hits
- [x] Wire music to scenes (menu, fight, victory)
- [x] Menu navigation and selection sounds

### Session 7-8: Fire Visual Effects ✅
- [x] Fire particle emitter on burning tables (continuous particles)
- [ ] Add burning tint/particles to fighters on fire (deferred)
- [ ] Smoke effects (deferred)

### Session 9-10: Combat Juice ✅
- [x] Screen shake on big hits
- [x] Hit sparks/impact particles
- [x] Slowmo on finishing blow
- [x] Damage numbers (DamageNumbers.js integrated)

**Phase 2 Deliverable:** Full audiovisual feedback loop. ✅

---

## Phase 3: Game Modes (Sessions 11-18) ✅ COMPLETE

**Goal:** Multiple ways to play.

### Session 11-12: Career Mode UI ✅
- [x] Display chapter/story progression (CareerMenuScene)
- [x] Dialogue/promo system (story events overlay)
- [x] Rivalry visualization (roster viewer with rival indicator)
- [x] PPV event screens (upcoming match panel)

### Session 13-14: Best of 3 Mode ✅
- [x] Round system (FightScene round tracking)
- [x] Round win tracking (playerRoundWins/opponentRoundWins)
- [x] "Round X... FIGHT!" announcements (showRoundAnnouncement)

### Session 15-16: Survival Mode ✅
- [x] Endless opponents (continuous fights)
- [x] Score tracking (survivalStreak)
- [x] High score persistence (localStorage)
- [x] Difficulty ramp (AI aggression increases with streak)

### Session 17-18: Mode & Arena Select ✅
- [x] Mode select screen (MenuScene with 6 modes)
- [x] Arena select screen (ArenaSelectScene with 5 arenas + random)
- [x] Full flow: Menu → Mode → Character → Arena → Fight

**Phase 3 Deliverable:** Multiple game modes with proper menu flow. ✅

---

## Phase 4: Polish & Ship (Sessions 19-24)

### Session 19-20: Local 2-Player
- [ ] Player 2 controls
- [ ] 2P character select
- [ ] 2P UI

### Session 21-22: Settings & Accessibility
- [ ] Options menu
- [ ] Volume controls
- [ ] Difficulty settings

### Session 23-24: Launch Prep
- [ ] Bug bash
- [ ] Performance check
- [ ] Mobile browser test
- [ ] README update
- [ ] Deploy to Vercel
- [ ] v1.0 tag

**Phase 4 Deliverable:** Shipped game! 🎉

---

## Quick Reference: Asset Status

### Characters (5 total)
| Character | Sprites | Status |
|-----------|---------|--------|
| Dumpster | 14/14 | ✅ Complete |
| Scar | 14/14 | ✅ Complete |
| Blaze | 14/14 | ✅ Complete |
| Tank | 14/14 | ✅ Complete |
| Viper | 14/14 | ✅ Complete |

### Arenas (6+ exist)
| Arena | Status |
|-------|--------|
| Warehouse | ✅ Done |
| Basement | ✅ Done |
| Parking Lot | ✅ Asset exists |
| Factory | ✅ Asset exists |
| Alley | ✅ Asset exists |
| Open/Empty variants | ✅ Assets exist |

### Weapons
| Weapon | Status |
|--------|--------|
| Chair | ✅ Fully functional |
| Table | ✅ Fully functional with fire |

### Audio
| Type | Status |
|------|--------|
| All SFX | ✅ Wired and playing |
| Music | ✅ Wired and playing |

### UI Screens
| Screen | Status |
|--------|--------|
| Main Menu | ✅ Done |
| Title Screen | ✅ Done |
| Character Select | ✅ Done |
| Arena Select | ✅ Done |
| Mode Select | ✅ Done (in Menu) |
| Fight HUD | ✅ Done |
| Pause | ✅ Done |
| Game Over | ✅ Done |
| Options | ✅ Done |
| Career Menu | ✅ Done |

---

## Milestone Summary (Revised)

| Phase | Sessions | Deliverable | Status |
|-------|----------|-------------|--------|
| Phase 1 | 1-4 | 5 Complete Characters | ✅ Complete |
| Phase 2 | 5-10 | Audio & Polish | ✅ Complete |
| Phase 3 | 11-18 | Game Modes | ✅ Complete |
| Phase 4 | 19-24 | Ship v1.0 | ⬜ TODO |

**Estimated remaining:** ~6 sessions (Phase 4: 2P, settings, polish, ship)
