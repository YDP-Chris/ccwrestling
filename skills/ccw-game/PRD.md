# CCW: Carnage Championship Wrestling
## Product Requirements Document

**Version:** 1.0  
**Date:** January 2026  
**Author:** Chris  
**Status:** Ready for Development

---

## 1. Product Overview

### Product Name
**CCW: Carnage Championship Wrestling**

Alternative names considered: Deathmatch Maniacs, Hardcore Havoc, Extreme Wrestling Carnage

### Elevator Pitch
A 2D beat-em-up extreme wrestling game that captures the brutal, weapon-filled chaos of ECW, FMW, and Japanese deathmatch wrestling—playable instantly in your browser.

### Vision
CCW is the definitive indie extreme wrestling game experience. While mainstream wrestling games sanitize the violence and simulation-style games bury players in complexity, CCW puts the visceral thrill of deathmatch wrestling front and center with accessible arcade controls, devastating weapon impacts, and the spectacle of flaming tables.

### The Index Card
| Input | Output |
|-------|--------|
| Player selects a hardcore wrestler | Survive a deathmatch using steel chairs, flaming tables, and brutal strikes to KO your opponent |

---

## 2. Problem Statement

### Core Problems Being Solved
1. **No dedicated hardcore wrestling games exist** — Deathmatch wrestling is a beloved subgenre with zero game representation
2. **Modern wrestling games are sanitized** — WWE 2K removed blood, AEW has no hardcore mode
3. **Simulation complexity is a barrier** — Fire Pro's learning curve alienates casual fans
4. **No browser-accessible wrestling games** — Everything requires downloads, installs, consoles

### User Pain Points
| Pain Point | Evidence |
|------------|----------|
| "WWE 2K feels boring without blood and weapons" | Steam reviews, Reddit threads |
| "Fire Pro is too complex, I just want to hit people with chairs" | r/fireprowrestling |
| "I miss the old SmackDown games with crazy weapons" | Nostalgia posts across wrestling forums |
| "No wrestling games on browser, I can't play at work/school" | Market gap observation |

### Why Now?
- **Retro gaming renaissance**: Pixel art and arcade-style games are culturally relevant
- **Wrestling cultural moment**: AEW has revitalized wrestling fandom
- **Browser gaming maturity**: WebGL/Canvas can handle this scope
- **Nostalgia market**: ECW/Attitude Era fans are 30-45 with disposable income
- **Content creator ecosystem**: Streamers need clip-worthy chaos

---

## 3. Target Users & Personas

### Primary Segment
Wrestling fans aged 25-45 who watched ECW, Attitude Era WWE, or Japanese deathmatch promotions and want to relive that chaos in game form.

### Secondary Segment
Retro gaming enthusiasts who appreciate pixel art beat-em-ups and arcade-style action games.

### Persona 1: Marcus, 38 — "The Hardcore Faithful"
| Attribute | Detail |
|-----------|--------|
| **Demographics** | 38, IT professional, suburban dad |
| **Gaming habits** | 1-2 hours/evening, retro games, WWE 2K (disappointed) |
| **Wrestling fandom** | Watched ECW religiously, follows AEW, collects deathmatch DVDs |
| **Goals** | Relive the feeling of Terry Funk vs Cactus Jack matches |
| **Frustrations** | Modern games are too "safe," can't hit people with flaming tables |
| **Quote** | "I want to feel the chair shots. WWE 2K chairs feel like pool noodles." |

### Persona 2: Jamie, 32 — "The Arcade Nostalgist"
| Attribute | Detail |
|-----------|--------|
| **Demographics** | 32, graphic designer, urban apartment |
| **Gaming habits** | Quick sessions, browser games at lunch, retro collections |
| **Wrestling fandom** | Casual, watched as a kid, knows the big names |
| **Goals** | Quick, satisfying arcade action without learning curve |
| **Frustrations** | Wrestling games are too complex, too many buttons |
| **Quote** | "I just want to pick up and play. I don't need 100 moves." |

### Persona 3: Alex, 27 — "The Content Creator"
| Attribute | Detail |
|-----------|--------|
| **Demographics** | 27, part-time streamer, 500 Twitch followers |
| **Gaming habits** | Games that create "moments" and clips |
| **Wrestling fandom** | Moderate, appreciates the spectacle |
| **Goals** | Content that gets reactions, shareable clips |
| **Frustrations** | Predictable games, nothing surprising happens |
| **Quote** | "Chat goes crazy when something explodes. I need those moments." |

---

## 4. Goals & Success Metrics

### Business Objectives
| Objective | Target | Timeframe |
|-----------|--------|-----------|
| Players acquired | 10,000 | 6 months |
| Players acquired | 50,000 | 12 months |
| Day 7 retention | 25-35% | Ongoing |
| Organic traffic share | 50%+ | 6 months |

### North Star Metric
**Matches completed per week per active player: Target 3+**

This measures core engagement—are players coming back and actually playing?

### Key Performance Indicators
| KPI | Target | Why It Matters |
|-----|--------|----------------|
| Average match duration | 2-4 minutes | Right-sized for arcade feel |
| Weapon usage rate | 80%+ of matches | Core mechanic engagement |
| Table break rate | 40%+ of matches | Signature feature usage |
| Session length | 15+ minutes | Multiple matches per session |
| Social shares | 5% of sessions | Viral potential |

---

## 5. Core Features & Requirements

### MoSCoW Prioritization

#### Must Have (P0) — MVP Launch
| Feature | Description |
|---------|-------------|
| Core combat system | Movement, striking, blocking (if any), knockdowns |
| 2 playable characters | The Dumpster and Scar with unique sprites |
| Steel chair weapon | Pickup, swing, increased damage |
| Table + fire system | Place table, light on fire, slam opponent through |
| Extreme meter | Builds from damage, unlocks special moves |
| Single arena | Warehouse/backyard wrestling venue |
| AI opponent | Basic attack/defend/weapon-use behavior |
| Visual feedback | Screen shake, particles (blood, sparks, fire) |
| Health/meter UI | Clear bars, announcements |
| Win/lose conditions | KO opponent to win |
| Menu system | Title screen, controls display, start game |

#### Should Have (P1) — Fast Follow
| Feature | Description |
|---------|-------------|
| Sound effects | Hit impacts, chair shots, fire, crowd reactions |
| 2-player local multiplayer | Keyboard split (WASD vs Arrows) |
| Additional weapons | Barbed wire bat, ladder (1-2 more) |
| Grapple system | Basic grab → throw/slam |
| Character select screen | Choose fighter before match |
| Background music | Arena ambiance, fight music |

#### Could Have (P2) — Future Versions
| Feature | Description |
|---------|-------------|
| Character creator | Basic appearance customization |
| 4-6 characters | Expanded roster |
| Match types | Last Man Standing, Falls Count Anywhere |
| Career/arcade mode | Series of fights with progression |
| Online multiplayer | WebRTC or server-based |
| Replay system | Save and share match clips |
| Additional arenas | Parking lot, ring, warehouse variations |

#### Won't Have (Out of Scope)
- Licensed wrestlers or promotions
- 3D graphics
- Simulation/realistic gameplay
- Mobile touch controls (MVP)
- Microtransactions

---

### Functional Requirements

#### Combat System
```
US-001: As a player, I want to move my wrestler around the arena so I can position for attacks.
  - WASD or Arrow keys for 8-directional movement
  - Movement speed: 160 pixels/second
  - Cannot move while attacking or in hit stun

US-002: As a player, I want to strike my opponent so I can deal damage.
  - J or Z key for basic attack
  - Attack hitbox appears in facing direction
  - Base damage: 8-12 (randomized)
  - Attack animation: ~300ms duration
  - Cannot attack during hit stun or knockdown

US-003: As a player, I want visual feedback when I land hits so combat feels impactful.
  - Screen shake on hit (100ms, 0.005 intensity)
  - Blood particles emit from hit location
  - Enemy flashes red briefly
  - Hit stun on enemy: 200ms

US-004: As a player, I want to knock down my opponent with strong attacks so I can set up big moves.
  - Heavy attacks (chair, post-meter) cause knockdown
  - Knockdown duration: 1500ms before auto-recovery
  - Downed opponent cannot be hit (invulnerable frames)
```

#### Weapon System (Steel Chair)
```
US-005: As a player, I want to pick up a steel chair so I can deal extra damage.
  - K or X key when near chair (within 40px)
  - Chair attaches to character sprite (held overhead or at side)
  - Chair pickup animation: 200ms

US-006: As a player, I want to swing the chair at my opponent so I can deal devastating damage.
  - J or Z key while holding chair
  - Chair damage: 22 (vs 8-12 base)
  - Enhanced screen shake (200ms, 0.01 intensity)
  - Spark particles emit on hit
  - Chair swing animation: 400ms, wider hitbox

US-007: As a player, I want to see and hear the chair impact so it feels brutal.
  - Distinct chair impact sound effect
  - Yellow/white spark particles
  - Larger screen shake than fist hits
  - Opponent knockback increased (200 vs 150 force)
```

#### Table & Fire System
```
US-008: As a player, I want to light the table on fire so I can create a hazard.
  - F key when near table (within 50px)
  - Table ignites with fire particle effect
  - Fire spreads across table surface (continuous emitter)
  - Ignition animation: 500ms

US-009: As a player, I want to slam my opponent through a table so I can deal massive damage.
  - L or C key when: holding/grappling opponent AND near table
  - Table slam damage: 35 (normal) / 55 (flaming)
  - Table breaks into debris particles
  - Major screen shake (300ms, 0.02 intensity)

US-010: As a player, I want fire to damage over time so flaming tables are extra dangerous.
  - Fire DOT: 3 damage per tick, every 500ms
  - DOT lasts: 3 seconds after leaving fire
  - Fighter visually "on fire" (small flame particles attached)
  - Can be extinguished by: time expiring or rolling (future mechanic)

US-011: As a player, I want to see table destruction so it feels spectacular.
  - Table shatters into 6-8 debris particles
  - Debris flies outward based on impact direction
  - Wood cracking sound effect
  - Table disappears after break (or leaves broken remnant)
```

#### Extreme Meter
```
US-012: As a player, I want to build an Extreme meter by fighting so I can unleash special moves.
  - Meter builds from: dealing damage (+5%), taking damage (+3%), weapon hits (+8%)
  - Meter displayed as bar at bottom of screen
  - Meter maxes at 100%
  - Visual glow/pulse when meter is full

US-013: As a player, I want to spend my full meter on a devastating finisher.
  - Activated when meter = 100% and special input (e.g., Attack + Pickup together)
  - Finisher is character-specific signature move
  - Damage: 40-50
  - Unique animation and effects
  - Meter resets to 0% after use
```

#### Win Conditions
```
US-014: As a player, I want to win by depleting my opponent's health to zero.
  - Health reaches 0 → KO state triggered
  - KO'd fighter plays "down" animation, stays down
  - "K.O.!" announcement displays on screen
  - 3-second pause, then victory screen

US-015: As a player, I want to see a victory/defeat screen so I know the match outcome.
  - Winner announcement: "[CHARACTER] WINS!"
  - Option to: Rematch, Return to Menu
  - Display final stats: time, damage dealt, weapons used (optional)
```

---

### Character Specifications

#### The Dumpster
| Attribute | Value |
|-----------|-------|
| **Full Name** | "The Dumpster" Dale Murphy |
| **Power** | 9/10 |
| **Speed** | 4/10 |
| **Toughness** | 10/10 |
| **Hardcore** | 10/10 |
| **Palette** | Brown, tan, gray |
| **Design** | Heavyset, long gray hair (balding), elbow pads, torn jeans |
| **Signature Move** | "Dumpster Drop" — Running elbow drop |
| **Bio** | "20 years of barbed wire and broken bones. They say he sleeps in a dumpster behind the arena. They're not wrong." |

#### Scar
| Attribute | Value |
|-----------|-------|
| **Full Name** | Scar |
| **Power** | 7/10 |
| **Speed** | 7/10 |
| **Toughness** | 8/10 |
| **Hardcore** | 10/10 |
| **Palette** | Crimson, black, silver |
| **Design** | Lean and wiry, spiky black hair, facial scars, tape on hands |
| **Signature Move** | "Scar Tissue" — Running chair shot with spin |
| **Bio** | "Every scar tells a story. Most of his stories end with someone in the hospital." |

---

### Non-Functional Requirements

#### Performance
| Requirement | Target |
|-------------|--------|
| Frame rate | Stable 60 FPS |
| Initial load | < 5 seconds |
| Input latency | < 100ms (feel instant) |
| Particle limit | 200 simultaneous |

#### Platform Support
| Platform | Support Level |
|----------|---------------|
| Chrome (latest 2 versions) | Full |
| Firefox (latest 2 versions) | Full |
| Safari (latest 2 versions) | Full |
| Edge (latest version) | Full |
| Mobile browsers | Not supported (MVP) |

#### Accessibility
- High contrast UI elements
- Colorblind-friendly health bars (shape + color)
- Remappable controls (future)
- No flashing >3Hz (epilepsy safety)

---

## 6. Scope & Constraints

### In Scope (MVP)
- Single-player vs AI
- 2 characters (The Dumpster, Scar)
- Beat-em-up combat (no grapples in MVP)
- Steel chair weapon
- Flaming table mechanic
- Extreme meter (builds, no special move in MVP if complex)
- One arena (warehouse)
- Health bars, meter display
- Menu, pause, restart
- Browser-based (Phaser 3)

### Out of Scope (MVP)
- Online multiplayer
- Character creator
- Mobile touch controls
- Story/career mode
- Multiple arenas
- Grappling system
- Commentary/announcer audio
- Leaderboards
- Save system
- Replay/clip export

### Technical Constraints
- Browser-based only (no downloads)
- No backend/server required
- Canvas 2D rendering (Phaser 3)
- Keyboard input only (no gamepad MVP)
- Hosted on Vercel or similar static host

### Business Constraints
- Solo developer
- No budget for licensed content
- Must avoid WWE/AEW copyright issues
- Target 4-6 week development timeline

### Assumptions
- Players have access to keyboard
- Target audience familiar with wrestling game conventions
- 2D pixel/sprite art is acceptable (retro aesthetic)
- Hardcore wrestling audience exists and is underserved

### Dependencies
- Phaser 3 framework
- Vite build tool
- Free/created sprite assets
- Sound effects (free/created)

---

## 7. Competitive Landscape

### Key Competitors
| Competitor | Strengths | Weaknesses | CCW Opportunity |
|------------|-----------|------------|-----------------|
| WWE 2K series | Realistic graphics, huge roster, licensed | Expensive, sanitized (no blood), simulation complexity | Hardcore content gap, accessibility |
| Fire Pro Wrestling World | Deep simulation, Steam Workshop | Steep learning curve, no fire/glass mechanics | Instant accessibility, deathmatch focus |
| AEW Fight Forever | Licensed roster, arcade-style | No hardcore mode, console-only | Extreme wrestling focus, browser play |
| RetroMania Wrestling | Retro aesthetic, accessible | No extreme/deathmatch matches | Deathmatch specialization |
| Wrestling Revolution 3D | Mobile, free, career mode | Poor graphics, floaty combat, ads | Quality, polish, no ads |

### Differentiation
CCW is the **only** game that:
1. Focuses exclusively on deathmatch/extreme wrestling
2. Has functional fire and table destruction mechanics
3. Plays instantly in browser with no install
4. Offers beat-em-up accessibility (not simulation)
5. Celebrates hardcore wrestling without copyright issues

### Positioning Statement
> "For hardcore wrestling fans who crave the chaos of ECW and Japanese deathmatch wrestling, CCW delivers devastating weapon-based combat and flaming table spots in an accessible, browser-based package. Unlike Fire Pro's simulation complexity or WWE 2K's sanitized violence, CCW puts extreme wrestling front and center with pick-up-and-play arcade action."

---

## 8. Risks & Open Questions

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Combat feels weightless/unsatisfying | Medium | High | Extensive playtesting, tunable screen shake/particles, study reference games |
| AI is frustrating or too easy | High | Medium | Multiple difficulty settings, tune based on feedback |
| Limited content causes player burnout | Medium | Medium | Focus on replayability via combat depth, fast-follow content |
| Browser performance issues | Low | High | Test across browsers, particle limits, optimize sprite sheets |
| Copyright claims despite original characters | Low | High | Legal review if scaling, avoid specific likenesses |
| Niche audience too small | Medium | Medium | Cross-promote to beat-em-up and retro gaming communities |

### Open Questions

#### Design Questions
- Should matches have time limits?
- How many AI difficulty levels?
- Should there be a pin mechanic or just KO?
- What's the right balance for fire DOT damage?
- Should the Extreme meter special be in MVP or P1?

#### Technical Questions
- Phaser 3 Arcade physics sufficient or need Matter.js?
- How to handle 2-player keyboard input without conflicts?
- Sprite animation approach: sprite sheets vs frame-by-frame?
- Audio format compatibility across browsers?

#### Business Questions
- Monetization model: free, donation, paid?
- Should there be a downloadable version (Electron)?
- Marketing strategy: where does target audience congregate?
- Analytics: what events to track?

---

## 9. Appendix

### Control Scheme
| Action | Primary Key | Alt Key |
|--------|-------------|---------|
| Move Left | A | ← |
| Move Right | D | → |
| Move Up | W | ↑ |
| Move Down | S | ↓ |
| Attack / Swing Chair | J | Z |
| Pickup Weapon | K | X |
| Table Slam | L | C |
| Light Table on Fire | F | — |
| Pause | ESC | — |
| Start / Confirm | ENTER | — |

### Damage Values
| Attack | Damage | Notes |
|--------|--------|-------|
| Basic strike | 8-12 | Randomized |
| Chair swing | 22 | Weapon |
| Table slam | 35 | Through normal table |
| Flaming table slam | 55 | Through burning table |
| Fire DOT | 3/tick | Every 500ms for 3 seconds |
| Extreme finisher | 40-50 | Uses full meter |
| **Starting Health** | **100** | Both fighters |

### Future Character Concepts (Post-MVP)
| Name | Archetype | Hook |
|------|-----------|------|
| Vertigo | High-flyer | Faster, aerial moves, less health |
| Furnace Worker | Power/Fire specialist | Bonus fire damage, slower |
| Glass Goddess | Technical/Light tubes | Future weapon type |
| The Butcher | Brawler/Barbed wire | Future weapon type |

### Reference Material
These matches capture the tone and mechanics CCW aims to recreate:
- Terry Funk vs Mick Foley — King of the Deathmatch 1995
- Atsushi Onita vs Hayabusa — FMW
- Tommy Dreamer vs Raven — ECW Hardcore Heaven
- Jun Kasai vs Ryuji Ito — BJW
- Cactus Jack vs Triple H — Royal Rumble 2000

---

*Document prepared January 2026*
