# CCW Content Production Pipeline

A systematic workflow for adding new content to CCW. Use this as a checklist when building new elements.

---

## Character Pipeline

### 1. Design (30 min)
- [ ] Name and persona
- [ ] Visual description (clothing, build, distinguishing features)
- [ ] Stats (speed modifier, attack power, defense)
- [ ] Backstory (1-2 sentences for announcer/story mode)

### 2. Sprites Needed (12 sprites per character)

| Sprite | Frames | Purpose |
|--------|--------|---------|
| `idle` | 4 | Standing animation |
| `walk` | 4 | Movement |
| `punch` | 4 | Basic attack |
| `hit` | 4 | Taking damage |
| `down` | 4 | Knocked down |
| `getup` | 4 | Recovery |
| `victory` | 4 | Win pose |
| `grapple` | 4 | Initiating grapple |
| `grappled` | 4 | Being grappled |
| `throw-suplex` | 4 | Suplex move (both wrestlers) |
| `throw-ddt` | 4 | DDT move (both wrestlers) |
| `throw-bodyslam` | 4 | Body slam (both wrestlers) |

**Optional extras:**
- `chair` - Chair swing attack
- `special` - Finisher/signature move
- `taunt` - Taunt animation

### 3. Generation Workflow

```bash
# For each sprite:
1. Generate static image with Ludo createImage
   - Use consistent character description
   - Specify pose/action clearly

2. Animate with Ludo animateSprite
   - frames: 4
   - frame_size: 256
   - duration: 2
   - model: "standard"

3. Process sprite
   - Resize to 256x256
   - Fix transparency (remove white background)
   - Save to public/assets/sprites/{character}-{action}.png
```

### 4. Code Integration

**characters.js:**
```javascript
NEWCHAR: {
  name: 'Character Name',
  spriteKey: 'newchar',
  health: HEALTH.MAX,
  speed: MOVEMENT.SPEED * 1.0,  // Adjust for character
  width: 64,
  height: 64,
  hitboxWidth: 40,
  hitboxHeight: 56,
  hitboxOffsetX: 12,
  hitboxOffsetY: 4,
  attackPower: 1.0,
  defense: 1.0,
  animations: {
    idle: 'newchar-idle',
    walk: 'newchar-walk',
    punch: 'newchar-punch',
    chair: 'newchar-chair',
    hit: 'newchar-hit',
    down: 'newchar-down',
    getup: 'newchar-getup',
    victory: 'newchar-victory',
    grapple: 'newchar-grapple',
    grappled: 'newchar-grappled',
    throw: 'newchar-throw',
    throwSuplex: 'newchar-throw-suplex',
    throwDdt: 'newchar-throw-ddt',
    throwBodyslam: 'newchar-throw-bodyslam'
  }
}
```

**BootScene.js:**
```javascript
// Add spritesheet loading for each animation
this.load.spritesheet('newchar-idle', 'assets/sprites/newchar-idle.png', { frameWidth: 128, frameHeight: 128 });
// ... repeat for all sprites

// Add animation definitions
this.anims.create({ key: 'newchar-idle', frames: this.anims.generateFrameNumbers('newchar-idle', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
// ... repeat for all animations
```

### 5. Testing
- [ ] Character appears in game
- [ ] All animations play correctly
- [ ] Hitbox feels right
- [ ] Stats feel balanced
- [ ] Unit tests for any unique mechanics

---

## Arena/Scene Pipeline

### 1. Design
- [ ] Theme (warehouse, parking lot, bar, etc.)
- [ ] Mood (lighting, time of day)
- [ ] Interactive elements (tables, chairs, hazards)
- [ ] Bounds (playable area)

### 2. Assets Needed

| Asset | Size | Purpose |
|-------|------|---------|
| `arena-{name}` | 800x450 | Background image |
| Props | Varies | Tables, chairs, barrels, etc. |

### 3. Generation
```bash
# Background
Ludo createImage:
  - image_type: "fixed_background"
  - aspect_ratio: "ar_16_9"
  - prompt: Detailed scene description

# Props
Ludo createImage:
  - image_type: "asset"
  - Individual prop sprites
```

### 4. Code Integration

**BootScene.js:**
```javascript
this.load.image('arena-newscene', 'assets/arenas/arena-newscene.png');
```

**FightScene.js:**
```javascript
// Add to arena selection
const arenas = ['arena-warehouse', 'arena-basement', 'arena-newscene'];
```

---

## Weapon Pipeline

### 1. Design
- [ ] Weapon type (chair, bat, ladder, etc.)
- [ ] Damage value
- [ ] Range
- [ ] Special properties (breakable, throwable)

### 2. Assets Needed

| Asset | Purpose |
|-------|---------|
| `{weapon}-ground` | On floor, pickable |
| `{weapon}-held` | In character's hand |
| `{weapon}-swing` | Attack animation (optional) |

### 3. Code Integration

**characters.js (WEAPON_TYPES):**
```javascript
BAT: {
  name: 'Baseball Bat',
  damage: 18,
  range: 55,
  textures: {
    ground: 'bat-ground',
    held: 'bat-held',
    swing: 'bat-swing'
  }
}
```

**Create entity class:**
```javascript
// src/entities/Bat.js - extend from Chair.js pattern
```

---

## Special Move Pipeline

### 1. Design
- [ ] Move name
- [ ] Input (button combo or meter-based)
- [ ] Damage
- [ ] Visual effect
- [ ] Sound effect
- [ ] Meter cost (if applicable)

### 2. Assets Needed
- Character-specific animation sprite
- VFX sprites (impact, particles)
- Sound effect

### 3. Code Integration

**Fighter.js:**
```javascript
// Add method for special move
performSpecialMove() {
  if (!this.canUseSpecial()) return;
  // Implementation
}
```

**constants.js:**
```javascript
SPECIAL_MOVES: {
  PILEDRIVER: { damage: 30, meterCost: 50 },
  // etc.
}
```

---

## Game Mode Pipeline

### 1. Design
- [ ] Mode name
- [ ] Win condition
- [ ] Rules/modifiers
- [ ] UI needs

### 2. Modes to Consider

| Mode | Description |
|------|-------------|
| VS | 1v1, first KO wins (done) |
| Best of 3 | Win 2 rounds |
| Survival | Endless opponents |
| Tag Team | 2v2 with tagging |
| Royal Rumble | Multiple fighters |
| Hardcore | Weapons everywhere |
| Inferno | Ring surrounded by fire |

### 3. Code Structure
```
src/scenes/
  modes/
    VSMode.js
    SurvivalMode.js
    TagTeamMode.js
```

---

## Story Mode Pipeline

### 1. Design
- [ ] Story arc (rivalry, championship chase, revenge)
- [ ] Chapter structure
- [ ] Dialogue/cutscenes
- [ ] Unlockables

### 2. Assets Needed
- Character portraits for dialogue
- Cutscene backgrounds
- Text/dialogue scripts

### 3. Code Structure
```
src/
  story/
    chapters/
      chapter1.json
      chapter2.json
    StoryManager.js
    DialogueSystem.js
  scenes/
    StoryScene.js
    DialogueScene.js
```

### 4. Data Format
```json
{
  "chapter": 1,
  "title": "The Beginning",
  "scenes": [
    {
      "type": "dialogue",
      "speaker": "DUMPSTER",
      "text": "You think you can take my title?"
    },
    {
      "type": "fight",
      "opponent": "SCAR",
      "arena": "arena-warehouse"
    }
  ]
}
```

---

## Daily Development Workflow

### Morning (Planning)
1. Pick ONE element to add
2. Review this checklist for requirements
3. Create task list

### Midday (Creation)
1. Generate assets with Ludo
2. Process and save sprites
3. Write code integration

### Afternoon (Testing)
1. Run unit tests
2. Quick playtest
3. Screenshot verification

### Evening (Polish)
1. Adjust balance if needed
2. Add sound effects
3. Commit changes

---

## Asset Naming Convention

```
{character}-{action}.png       # Character sprites
{weapon}-{state}.png          # Weapon sprites
arena-{name}.png              # Backgrounds
sfx-{action}.mp3              # Sound effects
music-{scene}.mp3             # Music tracks
```

---

## Quality Checklist

Before marking any content "done":

- [ ] All sprites load without errors
- [ ] Animations play smoothly
- [ ] No white/broken backgrounds
- [ ] Hitboxes feel fair
- [ ] Damage values balanced
- [ ] Unit tests pass
- [ ] Quick playtest completed
- [ ] Screenshots captured for reference
