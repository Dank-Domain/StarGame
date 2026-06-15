# Starline Conquest — Design Handoff

This document captures the design stack, conventions, and the specific tricks used to bring the Codex-generated prototype up to a polished, themed product. It is written so any AI assistant (Codex, Cursor, Aider, etc.) or human dev can pick up where we left off without losing the visual language or the integration tricks.

---

## 1. What this project is

A browser-based real-time strategy game (Star-Wars-flavored, "rustic space civilization, if steampunk made it to space"). The simulation and rendering live in one Phaser 3 scene; everything else (HUD, menus, panels, tweaks) is plain DOM/CSS sitting in an overlay above the canvas.

- **Renderer:** Phaser 3.90 (CDN).
- **Build:** Vite (dev/HMR) — but `playable-game.js` is a single file, no JSX/TS in the runtime path, no transpile required.
- **Entry:** `index.html` → `src/playable-game.js` → constructs `Phaser.Game` on `#game-root`, builds the HUD inside `#hud-root`.

```
index.html
├── src/style.css                 ← all visual styling, animated bg, panels
├── src/playable-game.js          ← simulation + Phaser scene + HUD
└── (Phaser via CDN)
```

The HUD never goes through React. It is built with template strings and a single `Shell` class. Panels are accessed via `data-el="..."` and actions via `data-action="..."`.

---

## 2. Visual system

### 2.1 Aesthetic
**Rustic-space / brass-and-parchment.** Think weathered industrial-era brass on top of dark iron plates, floating in a colored nebula. Not slick chrome sci-fi, not pure cyberpunk.

### 2.2 Type pairing
Loaded from Google Fonts in `style.css`:

- **Display / titles:** Cinzel (serif, ~600 weight). UPPERCASE with `letter-spacing: 0.08–0.32em`.
- **Body / italics / flavor text:** Cormorant Garamond (italic at 500–600 for "dossier" entries).
- **Numeric / monospace / labels:** JetBrains Mono and Share Tech Mono. Use `font-feature-settings: 'tnum'` for tabular numbers.

Tweakable via the in-game Tweaks panel (5 font-system options).

### 2.3 Color palette (CSS custom properties — top of `style.css`)

```
--brass-1: #e8c879   /* highlight */
--brass-2: #c8a25b   /* primary brass */
--brass-3: #8d6730   /* edge / border */
--brass-deep: #5a3d1c

--void-1: #050912    /* deepest space */
--void-2: #0a1224
--void-3: #11192c

--iron-1: #1a1d28    /* panel bodies */
--iron-2: #252a38
--iron-edge: #383d50

--parchment: #efe3c4 /* primary text */
--parchment-2: #d8c89a
--parchment-faint: #8c7e58

--signal-blue: #6cb4d6
--good: #6fb37a   --warn: #d4a857   --danger: #d75c4a
```

All faction colors come from `playable-game.js` constants (`COLORS`, `INVADER_FACTION.color`) and are passed through `colorFor(ownerId, factions)` for canvas drawing and `cssFor(...)` for DOM.

### 2.4 The recurring "plate" element
Every panel uses the same chassis:
- Linear gradient from `rgba(38,32,24,0.92)` → `rgba(20,18,26,0.95)`
- 1px brass border (`--brass-3`)
- Inset highlight on top (rgba 232,200,121,0.18) and shadow on bottom
- Drop shadow `0 6px 16px rgba(0,0,0,0.5)`

CSS class: `.plate`. Used in: main menu, command rail, standings, dossier, tactical map, endgame card.

### 2.5 Animated background (CSS only)
Lives in `<div id="space-bg">` — a fixed full-viewport div behind the Phaser canvas.
Layers:
1. Radial gradients painted directly on `#space-bg` (purple/blue/orange tints).
2. Three `.nebula` divs with `filter: blur(80px)`, `mix-blend-mode: screen`, `animation: nebula-drift` (60–110s).
3. Three `.star-layer` divs (`layer-1/2/3`) using stacked `radial-gradient` background images, each repeating, animated with `star-drift` at 240/360/540s for parallax.
4. Three `.shooting-star` divs animated with `@keyframes shoot`.

### 2.6 Phaser canvas must be transparent
This is the single most important integration rule. The CSS animated background has to show through.

```js
this.cameras.main.transparent = true;
// In Phaser.Game config:
backgroundColor: "rgba(0,0,0,0)",
transparent: true,
```

And `body { background: #050912; }` for the fallback. The game's `drawSpace()` method only draws a faint brass cartographer's grid in world-space — no opaque void fill.

---

## 3. HUD layout

The HUD lives in `#hud-root` (`pointer-events: none` on the wrapper, `auto` on children). All panels are absolutely positioned. Default layout:

| Region              | Element              | Class                | Default position           |
|---------------------|----------------------|----------------------|----------------------------|
| Top full-width      | Command Rail         | `.command-rail`      | `top:14px; left/right:14px`|
| Left, below rail    | Faction Standings    | `.standings`         | `top:92px; left:14px`      |
| Right, below rail   | World Dossier        | `.dossier`           | `top:92px; right:14px`     |
| Right edge mid      | Zoom controls        | `.zoom-stack`        | `right:14px; bottom:220px` |
| Bottom right        | Tactical Survey      | `.tactical-map`      | `bottom:14px; right:14px`  |
| Bottom left         | Holdings pills       | `.holdings`          | `bottom:14px; left:14px`   |
| Top center          | Toast rail           | `.toast-rail`        | `top:88px; left:50%`       |

**Mobile breakpoints** at 900px and 720px collapse panels and hide the minimap. See bottom of `style.css`.

### 3.1 Draggable panels
Standings, Dossier, and Tactical Survey are draggable.
- Mark a panel with `data-draggable="<unique-id>"`.
- Mark its drag handle with `data-drag-handle` (typically the panel header).
- `Shell.initDraggable()` (in `playable-game.js`) wires pointerdown → window pointermove/pointerup, clamps to viewport bounds, persists `{left, top}` to `localStorage` under key `starline_panel_positions_v1`.
- A `MutationObserver` re-attaches the handle when the dossier re-renders (its header is rebuilt on world-select).
- Drag handle gets a small dotted brass texture via `[data-drag-handle]::before` and `cursor: grab → grabbing`.
- `[data-draggable].dragging` adds a brass outline + elevated shadow + `z-index: 50`.

To make another panel draggable: add the two attributes; the wiring is automatic.

---

## 4. Map rendering — the key fixes

The Codex starting point used **fixed sector polygons** for territory ownership. They looked rigid and pre-determined. We replaced them with **organic influence fields** in two places:

### 4.1 Main map (`drawTerritories()` in `playable-game.js` ConquestScene)
For every owned world:
1. Two soft concentric circles (low alpha 0.05–0.07, no stacking layers per world).
2. Radius scales with importance: capital 110, planet 80, station/gate 60, plus `min(28, sqrt(ships)*3)` boost.
3. Lanes between **same-owner adjacent** worlds get a thin lozenge-shaped band (taper via `Math.sin(t*π)`, alpha 0.04). This is what makes territories visually merge.
4. Capitals get a single subtle pulsing ring (alpha 0.22).
5. Sector centroid still gets a small brass-rimmed heraldic dot (informational only — not a border).

Critical: **don't stack opacities** — overlap noise gets muddy fast. Use one or two flat low-alpha rings, not a ring stack.

### 4.2 Minimap (`renderMinimap()`)
Mirrors the same approach in canvas 2D: per-world soft circles with a hex alpha suffix (`+ '24'`, `+ '14'`) and connective bands between same-owner lanes. No `sectorPolygon()` calls.

### 4.3 World glyphs (`drawWorld`, `drawPlanetGlyph`, `drawStationGlyph`)
- **Planet:** body fill + terminator shadow (offset dark circle) + top-left highlight + 4 procedural surface dots seeded by `world.id` + brass rivet at top.
- **Shipyard:** hexagon (use `drawHex` helper) with cross-bracing.
- **Hyperspace gate:** double ring + 4 rotating brass pips (`angle = phase*0.4 + …`) + pulsing inner cyan core.
- **Fortress:** diamond outlined in iron + center rivet + 4 corner studs.
- **Default station:** square with 4 antenna struts and a blinking red comms light.
- **Capital:** gold orbital ring + 4-tick spike crown rotating slowly.
- **Invader:** pulsing violet rings (`1 + sin(phase*2)*0.08`).
- **Selection:** 4 brass L-shaped corner brackets (drawn at `Math.PI/4 + i*Math.PI/2` around the world).
- **Tier indicators:** small diamond pips above the world (1 dot per level above 1, capped at 3).

### 4.4 Lanes
Two-layer style: a 3px iron rail (`0x2a2218`) underneath, a 1px brass thread (`0xc8a25b`) on top, with a brass pip at the midpoint. Selected lanes go to 7px / 2.5px / cyan-bright.

### 4.5 Labels
Phaser `add.text(...)` with:
```js
fontFamily: "'Share Tech Mono', 'JetBrains Mono', monospace",
fontSize: "11px",
stroke: "#000000",
strokeThickness: 3
```
The black stroke is essential for readability on top of the animated nebula background.

---

## 5. Tweaks panel

The protocol is the host editor's "Edit Mode". Implementation notes:

1. Wrap defaults in JSON between `/*EDITMODE-BEGIN*/` and `/*EDITMODE-END*/` comment markers — exactly one block in the root HTML, inside an inline `<script>`. Host parses and rewrites this on disk.
2. **Register the `message` listener BEFORE posting `__edit_mode_available`**. Order matters; otherwise the activate message can race the listener.
3. Listen for `{type:'__activate_edit_mode'}` and `{type:'__deactivate_edit_mode'}`.
4. On each tweak change: apply live in-page AND post `{type:'__edit_mode_set_keys', edits: {...}}` to persist.
5. If you build your own close button, post `{type:'__edit_mode_dismissed'}` to flip the toolbar toggle off.

In this project the panel is built from React via the `tweaks_panel.jsx` starter component and lets users swap font systems, accent color, nebula intensity, starfield density, shooting-star toggle, UI density, panel opacity.

---

## 6. Speaker notes / postMessage to host

Not used in this project. If you add a deck, drop a `<script type="application/json" id="speaker-notes">` and `postMessage({slideIndexChanged: N})` on slide change.

---

## 7. Extending the game — common tasks

### Add a new HUD panel
1. Add markup inside the `<div class="hud">` template string in `Shell.buildHud()` (search for it in `playable-game.js`).
2. Style with `.plate` chassis pattern.
3. If draggable: `data-draggable="myPanel"` on the root, `data-drag-handle` on the header.
4. Render content from `Shell.render()` if it needs live updates.

### Add a new world type
1. Extend `world.kind` checks in `drawWorld`.
2. Add a `draw<Kind>Glyph(...)` method on the scene.
3. Make sure the dossier renderer (`renderDossier()`) handles the new kind label.

### Add a new faction
- Edit `FACTIONS` array (id, name, color hex). Color must be a Phaser-compatible hex number (`0xRRGGBB`).
- `colorFor` and `cssFor` will pick it up automatically.
- Heraldic sigils are SVG inlined in `factionSigil(factionId)` — add a case there.

### Tune the territory influence look
All knobs are in `drawTerritories()` and `renderMinimap()`:
- `baseR` per world kind
- `shipBoost` cap and multiplier
- The 0.04–0.07 alpha values (raise carefully — overlap noise rises fast)
- `steps = Math.max(4, len/50)` controls band smoothness vs cost

---

## 8. Performance notes

- Every frame redraws the whole graphics layer via `this.graphics.clear()` then re-issues fills/strokes. This is fine up to ~80 worlds. Above that, consider RenderTexture caching for the territory layer (only re-rebuild on ownership change).
- The CSS background animations are GPU-accelerated (`transform`, `opacity`, `background-position` only). Keep it that way.
- Star layers use background-image radial-gradients, NOT individual DOM stars. Keeps the count out of the DOM.

---

## 9. Files & where to look

| File | Purpose |
|---|---|
| `index.html` | Tiny shell. Loads style + Phaser + game script. |
| `src/style.css` | All HUD styling, animated bg, fonts, drag visuals. |
| `src/playable-game.js` | Simulation + Phaser scene + HUD shell. The whole game. |
| `original-index.html` | Untouched original Codex output for diffing. |
| `tweaks-panel.jsx` (if used) | Tweaks UI starter component. |
| `DESIGNHANDOFF.md` | This file. |

Search anchors inside `playable-game.js`:
- `class ConquestScene` — Phaser scene
- `drawTerritories()` — influence-field map render
- `drawWorld(world)` — world-glyph dispatcher
- `class Shell` — HUD shell
- `initDraggable()` — drag system
- `renderMinimap()` — minimap canvas paint
- `buildHud()` — HUD HTML template

---

## 10. Don't-break list

1. Keep Phaser camera + game `transparent: true` so the CSS background shows through.
2. Don't reintroduce `sectorPolygon` for territory drawing — use the per-world influence rendering.
3. Don't stack >2 alpha layers per world for territories.
4. Keep label `strokeThickness: 3` for legibility on nebula bg.
5. When rendering React/JSX side panels, give every styles object a unique name (`tweakStyles`, not `styles`) — globals collide otherwise.
6. Register the Tweaks `message` listener BEFORE posting `__edit_mode_available`.
7. Drag wiring uses `MutationObserver` because the dossier rebuilds its header on selection — don't replace it with a one-shot `attachHandle` call.
