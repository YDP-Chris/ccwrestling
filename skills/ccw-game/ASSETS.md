# CCW: Asset Requirements

## Overview

This document specifies all visual and audio assets needed for CCW. Assets should follow a consistent pixel art style at **64x64 pixels** for characters and **32x32 or 16x16** for smaller elements.

---

## Art Style Guidelines

### Visual Direction
- **Style**: 16-bit era pixel art (SNES/Genesis aesthetic)
- **Palette**: Limited palette per character (8-12 colors max)
- **Outline**: 1px black outline on characters
- **Scale**: Characters are 64x64, scaled 2x in game (appear 128x128)
- **Animation**: Smooth but snappy, 6-10 frames per action

### Color Palette Anchors
| Element | Primary | Secondary | Accent |
|---------|---------|-----------|--------|
| The Dumpster | #8B7355 (brown) | #D4C4A8 (tan) | #808080 (gray) |
| Scar | #8B0000 (crimson) | #1a1a1a (black) | #C0C0C0 (silver) |
| Arena | #2d2d2d (dark gray) | #4a3728 (wood) | #ff6600 (fire) |
| UI | #ff0000 (health) | #ffff00 (meter) | #ffffff (text) |

---

## Character Sprites

### The Dumpster — `dumpster.png`
**Sprite Sheet**: 64x64 per frame, horizontal layout

| Animation | Frames | Row | Frame Numbers | Notes |
|-----------|--------|-----|---------------|-------|
| Idle | 4 | 1 | 0-3 | Breathing, slight sway |
| Walk | 6 | 2 | 4-9 | Lumbering, heavy steps |
| Attack (fist) | 5 | 3 | 10-14 | Haymaker punch |
| Attack (chair) | 5 | 4 | 15-19 | Overhead chair swing |
| Hit/Stagger | 3 | 5 | 20-22 | Recoil backwards |
| Knockdown | 2 | 6 | 23-24 | Fall and lying down |
| Get Up | 3 | 7 | 25-27 | Rising from ground |
| Victory | 4 | 8 | 28-31 | Arms raised, celebrating |

**Total frames**: 32  
**Sheet size**: 2048x512 (32 frames × 64px wide, 8 rows × 64px tall)

**Character Design Notes**:
- Heavyset build, barrel chest
- Long gray hair, balding on top
- Sleeveless shirt or bare chest
- Torn jeans, work boots
- Elbow pads (taped)
- Scars on arms and face

### Scar — `scar.png`
**Sprite Sheet**: Same layout as Dumpster

| Animation | Frames | Row | Frame Numbers | Notes |
|-----------|--------|-----|---------------|-------|
| Idle | 4 | 1 | 0-3 | Twitchy, bouncing |
| Walk | 6 | 2 | 4-9 | Quick, aggressive stride |
| Attack (fist) | 5 | 3 | 10-14 | Quick jab combo |
| Attack (chair) | 5 | 4 | 15-19 | Running chair swing |
| Hit/Stagger | 3 | 5 | 20-22 | Stumble back |
| Knockdown | 2 | 6 | 23-24 | Dramatic fall |
| Get Up | 3 | 7 | 25-27 | Angry rise |
| Victory | 4 | 8 | 28-31 | Holds up chair, screams |

**Character Design Notes**:
- Lean, wiry build
- Spiky black hair
- Facial scars (across eye, cheek)
- Black trunks/shorts
- Hand tape/wraps
- Combat boots

---

## Weapon Sprites

### Steel Chair — `chair.png`
**Size**: 32x32 per frame

| State | Frames | Description |
|-------|--------|-------------|
| Ground | 1 | Folded chair lying flat |
| Held | 1 | Chair held overhead (integrate with character or separate) |
| Swinging | 3 | Chair arc motion (for impact frames) |

**Design Notes**:
- Classic metal folding chair
- Silver/gray metal
- Black seat/back

### Table — `table.png` / `table-fire.png` / `table-broken.png`
**Size**: 96x48 per state

| State | File | Description |
|-------|------|-------------|
| Intact | `table.png` | Folding table, side view |
| On Fire | `table-fire.png` | Same table with flame overlay (or use particles) |
| Broken | `table-broken.png` | Shattered remains, 2-3 large pieces |

**Design Notes**:
- Standard folding banquet table
- Wood grain texture on top
- Metal legs
- When broken: splintered wood, bent legs

---

## Particle Sprites

All particles are **16x16** or **8x8** simple shapes.

### Blood — `particle-blood.png`
- Red droplet/splatter shape
- 2-3 variations in single sheet
- Color: #8B0000 to #FF0000

### Sparks — `particle-spark.png`
- Yellow/white star or line
- 2-3 variations
- Color: #FFFF00 to #FFFFFF

### Fire — `particle-fire.png`
- Flame shape, pointed top
- 3-4 frame animation (optional) or single frame
- Colors: #FF4400, #FF8800, #FFCC00

### Debris — `particle-debris.png`
- Wood splinter shapes
- 3-4 variations (different sizes/angles)
- Color: #8B4513 (wood brown)

### Smoke — `particle-smoke.png` (optional)
- Gray puff
- 2-3 frame dissipation
- Color: #666666 to transparent

---

## Arena Background

### Warehouse Arena — `arena-warehouse.png`
**Size**: 800x450 (full screen background)

**Composition**:
- **Floor**: Concrete with cracks, stains (blood?), industrial look
- **Walls**: Brick or corrugated metal, graffiti optional
- **Atmosphere**: Dim lighting, hazy (like smoke or dust)
- **Details**: 
  - Crowd silhouettes in background (dark shapes)
  - Light fixtures hanging (practical lighting sources)
  - Folding chairs scattered (not interactive, just set dressing)
  - Maybe a burning barrel in corner

**Parallax layers** (optional enhancement):
1. Far background (crowd, walls) — static
2. Mid-ground (some chairs, debris) — slight parallax
3. Foreground (nothing or light overlay) — faster parallax

---

## UI Elements

### Health Bar Frame — `ui-healthbar-frame.png`
**Size**: 204x28
- Metal or leather border
- Slots for team color indicator
- Space for name text above

### Health Bar Fill — `ui-healthbar-fill.png`
**Size**: 200x20
- Solid color, will be tinted by code
- Can have subtle gradient or texture

### Extreme Meter Frame — `ui-meter-frame.png`
**Size**: 304x24
- Different style from health (more "extreme")
- Skull or flame motifs on ends (optional)

### Extreme Meter Fill — `ui-meter-fill.png`
**Size**: 300x16
- Yellow/orange base
- Animated glow when full (can be code effect)

### Announcements (Text can be code-generated, but optional graphics):
- "K.O.!" graphic
- "WINNER" graphic
- "ROUND 1" etc.

---

## Audio Assets

### Sound Effects

| Sound | Filename | Description | Duration |
|-------|----------|-------------|----------|
| Basic hit | `hit.wav` | Punch/strike impact | 0.2s |
| Chair hit | `chair-hit.wav` | Metal clang + thud | 0.3s |
| Chair pickup | `chair-pickup.wav` | Metal scrape | 0.2s |
| Table break | `table-break.wav` | Wood splintering | 0.5s |
| Fire ignite | `fire-ignite.wav` | Whoosh + crackle | 0.4s |
| Fire loop | `fire-loop.wav` | Crackling fire (loop) | 2-3s |
| Body fall | `body-fall.wav` | Thud on ground | 0.3s |
| Crowd reaction (hit) | `crowd-ooh.wav` | Crowd "ooh!" | 0.5s |
| Crowd reaction (big hit) | `crowd-pop.wav` | Crowd pop/cheer | 1s |
| Crowd ambiance | `crowd-loop.wav` | General crowd noise (loop) | 5-10s |
| Menu select | `menu-select.wav` | Click/confirmation | 0.1s |
| Menu navigate | `menu-navigate.wav` | Blip/move | 0.1s |
| Victory sting | `victory.wav` | Short triumphant jingle | 2s |
| KO announcement | `ko.wav` | "K.O.!" voice or sound | 1s |

### Music (Optional for MVP)

| Track | Filename | Description | Duration |
|-------|----------|-------------|----------|
| Menu theme | `music-menu.mp3` | Ominous, building tension | 1-2 min loop |
| Fight theme | `music-fight.mp3` | High energy, aggressive | 2-3 min loop |
| Victory theme | `music-victory.mp3` | Triumphant, short | 10-15s |

**Music Style Notes**:
- Heavy metal / industrial influenced
- No lyrics (avoid licensing issues)
- Royalty-free or original composition

---

## File Structure

```
/assets
├── /sprites
│   ├── dumpster.png
│   ├── scar.png
│   ├── chair.png
│   ├── table.png
│   ├── table-fire.png
│   ├── table-broken.png
│   └── /particles
│       ├── blood.png
│       ├── spark.png
│       ├── fire.png
│       ├── debris.png
│       └── smoke.png
├── /backgrounds
│   └── arena-warehouse.png
├── /ui
│   ├── healthbar-frame.png
│   ├── healthbar-fill.png
│   ├── meter-frame.png
│   ├── meter-fill.png
│   └── logo.png
├── /sfx
│   ├── hit.wav
│   ├── chair-hit.wav
│   ├── chair-pickup.wav
│   ├── table-break.wav
│   ├── fire-ignite.wav
│   ├── fire-loop.wav
│   ├── body-fall.wav
│   ├── crowd-ooh.wav
│   ├── crowd-pop.wav
│   ├── crowd-loop.wav
│   ├── menu-select.wav
│   ├── menu-navigate.wav
│   ├── victory.wav
│   └── ko.wav
└── /music
    ├── menu.mp3
    ├── fight.mp3
    └── victory.mp3
```

---

## Asset Creation Tools (Recommendations)

### Pixel Art
- **Aseprite** ($20) — Industry standard for pixel art and animation
- **Piskel** (free, web-based) — Good for simple sprites
- **GraphicsGale** (free) — Classic pixel art tool

### Audio
- **Bfxr/Sfxr** (free) — Retro sound effect generator
- **Audacity** (free) — Audio editing
- **Freesound.org** — Royalty-free samples

### AI Generation (for placeholders)
- Use AI image generators for concept art / color exploration
- Pixel art can be generated but often needs manual cleanup
- Always verify licensing for any generated content

---

## Asset Priority for MVP

### Phase 1 (Must have to be playable)
1. ✅ Dumpster sprite sheet (idle, walk, attack, hit, down minimum)
2. ✅ Scar sprite sheet (same animations)
3. ✅ Chair (ground and held states)
4. ✅ Table (intact and broken)
5. ✅ Basic particles (blood, spark, fire — can be simple colored rectangles)
6. ✅ Arena background (can be simple/placeholder)
7. ✅ Basic sound effects (hit, chair hit, table break)

### Phase 2 (Polish)
- Full animation sets for both characters
- Fire particle effects
- Crowd sounds
- UI graphics
- Music

### Phase 3 (Nice to have)
- Additional particle variations
- Background details/parallax
- Victory/defeat graphics
- Announcer voice clips
