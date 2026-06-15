# Starline Conquest Handoff

Last updated: 2026-05-09

## Current Goal

Continue development from the updated brass-and-parchment `DankArcade` UI, now made live at the project root. The old blue HUD/runtime should not be treated as the design source anymore.

The project is a Phaser browser strategy game where factions fight over an isometric galaxy, capture worlds, upgrade planets, control sectors, launch fleets, and eventually face the Void Ascendancy crisis.

## Most Important Context

- The live game is at the project root:
  - `index.html`
  - `src/playable-game.js`
  - `src/style.css`
- `DankArcade/` is the visual source of truth and was copied into the root runtime.
- Do not migrate gameplay work into the unused TypeScript/Vite scaffold unless explicitly requested.
- Keep the Phaser canvas transparent. The animated CSS background is part of the intended look.
- Preserve the updated UI language:
  - command rail
  - standings panel
  - dossier panel
  - holdings strip
  - tactical survey/minimap
  - draggable panels
  - parchment/brass styling
  - organic territory rendering
- Avoid reintroducing the old blue floating HUD, opaque canvas background, or old sector polygon look.

## How To Run

From the project root:

```powershell
C:\Users\tjbac\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe server.mjs
```

Open:

```text
http://127.0.0.1:5173
```

At the end of the previous session, the local server was already responding on port `5173`.

## Current Worktree State

Expected modified files:

- `index.html`
- `src/playable-game.js`
- `src/style.css`

Expected untracked files:

- `DankArcade/`
- `FEEDBACK.md`
- `tweaks-panel.jsx`
- `starline-tweaks.jsx`

`tweaks-panel.jsx` and `starline-tweaks.jsx` were brought to the root because the updated root `index.html` now loads the DankArcade tweak panel scripts.

Several old smoke screenshot PNG files are present in the root from earlier sessions. Treat them as existing project artifacts unless the user asks to clean them up.

## What Was Implemented In The Last Session

### UI Restoration

The root app was replaced with the `DankArcade` visual/runtime structure:

- `DankArcade/index.html` became root `index.html`.
- `DankArcade/src/playable-game.js` became root `src/playable-game.js`.
- `DankArcade/src/style.css` became root `src/style.css`.
- `DankArcade/tweaks-panel.jsx` and `DankArcade/starline-tweaks.jsx` were copied to root.

The browser smoke test confirmed:

- command rail appears
- standings panel appears
- dossier panel appears
- tactical survey appears
- Chronicle panel exists
- animated background exists
- Phaser canvas background is transparent: `rgba(0, 0, 0, 0)`
- no desktop or mobile console/page errors

### Six Gameplay Fixes Reapplied To The Updated Runtime

1. Performance and smoothness
   - Added simulation caches:
     - `worldById`
     - `neighborsById`
     - `laneKeys`
   - `getWorld`, `getNeighbors`, and `areConnected` now use cached lookups.
   - Caches rebuild on restart and map changes such as Void spawn.
   - HUD panel rendering is throttled through `HUD_RENDER_INTERVAL`.
   - World labels and fleet labels use viewport culling.

2. Map centering
   - Added `normalizeGalaxyWorlds(...)` after map transform.
   - Initial camera focus now uses playable galaxy core:
     - active capitals
     - Nexus/Core sector when present
     - fallback to all active worlds
   - Camera bounds still include all worlds plus padding.
   - Void spawn expands map bounds without intentionally yanking camera focus.

3. Crisis balance
   - Void spawn no longer uses the old fixed 360-900 style cap.
   - Spawn now scales from current universe strength:
     - owned ships
     - fleets in transit
     - production
     - upgraded worlds
     - active faction count
     - strongest faction power
     - map size
   - `invaderScale` feeds post-spawn Void pressure.
   - Normal factions heavily prioritize Void worlds after spawn.

4. Camera movement
   - Keyboard state is tracked manually with `keydown`/`keyup`.
   - WASD and arrow keys pan while not typing/selecting visible HUD controls.
   - Drag pan starts on empty canvas space.
   - Edge pan is active near canvas edges.
   - Wheel zoom is centered through the camera controller.
   - Zoom buttons and tactical minimap jump use the same camera clamping rules.

5. Recent events
   - Added `simulation.events`, capped by `EVENT_HISTORY_LIMIT`.
   - Added `Simulation.addEvent(...)`.
   - Added brass-style `Chronicle` rail button and dropdown panel.
   - Chronicle entries are newest-first and include formatted match age.
   - Events are recorded for:
     - match start
     - crisis warnings
     - Void spawn
     - Void defeat
     - capital loss/reclaim
     - faction elimination
     - sector control changes
     - major upgrades
     - decisive battles
     - victory/defeat

6. Capital loss and faction survival
   - Capital capture no longer instantly defeats the human player.
   - Spectator mode no longer ends merely because only one capital remains.
   - Faction survival is now based on owned worlds plus fleets.
   - A faction with no capital can still produce, upgrade, launch fleets, and plan.
   - AI can prioritize reclaiming its original capital.
   - Human victory occurs when rival non-Void factions are eliminated and the Void is defeated or dormant.

## Key Code Areas

Main runtime:

- `src/playable-game.js`

Important sections and methods:

- Map generation and normalization:
  - `buildGalaxy`
  - `normalizeGalaxyWorlds`
  - `transformGalaxyWorld`
- Simulation caches and events:
  - `Simulation.clear`
  - `Simulation.restart`
  - `Simulation.rebuildCaches`
  - `Simulation.addEvent`
  - `Simulation.getWorld`
  - `Simulation.getNeighbors`
  - `Simulation.areConnected`
- Void crisis:
  - `Simulation.updateGalaxyAgeEvents`
  - `Simulation.spawnInvader`
  - `Simulation.universeStrengthSnapshot`
  - `Simulation.invaderPressure`
  - `Simulation.defeatInvader`
- Faction survival:
  - `Simulation.handleCapture`
  - `Simulation.checkFactionEliminations`
  - `Simulation.isFactionActive`
  - `Simulation.activeNormalFactions`
  - `Simulation.checkVictoryConditions`
  - `Simulation.createAiPlan`
- UI:
  - `Hud.buildMenu`
  - `Hud.buildHud`
  - `Hud.buildChroniclePanel`
  - `Hud.render`
  - `Hud.renderPanelData`
  - `Hud.renderChronicle`
  - `Hud.renderStandings`
  - `Hud.renderDossier`
  - `Hud.renderHoldings`
  - `Hud.renderMinimap`
- Camera/rendering:
  - `ConquestScene.resetCamera`
  - `ConquestScene.computeMapFocus`
  - `ConquestScene.computeMapBounds`
  - `ConquestScene.adjustZoom`
  - `ConquestScene.updateCameraControls`
  - `ConquestScene.jumpToMinimap`
  - `ConquestScene.handleNativePointerDown`
  - `ConquestScene.handleNativePointerMove`
  - `ConquestScene.isProjectedInView`
  - `ConquestScene.drawTerritories`
  - `ConquestScene.drawWorldsAndFleets`

Main styling:

- `src/style.css`

Important UI classes:

- `.command-rail`
- `.standings`
- `.dossier`
- `.holdings`
- `.tactical-map`
- `.chronicle-panel`
- `.chronicle-event`
- `.zoom-stack`
- `.main-menu`

## Verification Already Completed

Syntax:

```powershell
C:\Users\tjbac\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe --check src\playable-game.js
```

Result: passed.

Browser smoke at `http://127.0.0.1:5173`:

- desktop viewport passed
- mobile viewport passed
- no console/page errors
- brass UI confirmed live
- transparent canvas confirmed
- Human Commander and Spectator Simulation start with 1, 3, and 5 AI factions
- WASD and arrow key panning confirmed
- drag pan confirmed after waiting for the menu to hide
- edge pan confirmed
- wheel handler confirmed through direct canvas wheel dispatch
- zoom buttons confirmed
- fit galaxy confirmed
- minimap jump confirmed
- capital loss does not end human game
- Void spawn scales and logs to events
- Chronicle panel opens and renders entries
- classic, ring, twin, core, and frontier focus points were checked

Observed camera note:

- If automated drag tests click on HUD-covered regions, the HUD correctly receives the pointer instead of the canvas. Wait for `.main-menu` to lose `.visible`, then choose a point where `document.elementFromPoint(x, y).tagName === "CANVAS"` for reliable drag/wheel tests.

## Useful Playwright Smoke Snippets

Set `NODE_PATH` first:

```powershell
$env:NODE_PATH='C:\Users\tjbac\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
```

Basic boot check:

```powershell
C:\Users\tjbac\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe -e "const { chromium } = require('playwright'); (async()=>{ const browser=await chromium.launch({headless:true}); const page=await browser.newPage({viewport:{width:1440,height:900}}); const errors=[]; page.on('pageerror', e=>errors.push(e.message)); page.on('console', m=>{ if(m.type()==='error') errors.push(m.text()); }); await page.goto('http://127.0.0.1:5173', {waitUntil:'networkidle'}); console.log(JSON.stringify({title:await page.title(), start:await page.locator('[data-action=\"start\"]').count(), commandRail:await page.locator('.command-rail').count(), errors}, null, 2)); await browser.close(); })();"
```

Force Void spawn from browser console or Playwright:

```js
window.__conquestSimulation.elapsed = 599;
window.__conquestSimulation.update(1.5);
```

Force human capital capture without ending the game:

```js
const sim = window.__conquestSimulation;
const capital = sim.getWorld("alliance-capital");
const oldOwner = capital.owner;
capital.owner = "directorate";
sim.handleCapture(capital, oldOwner);
sim.checkFactionEliminations();
sim.checkVictoryConditions();
console.log(sim.status, sim.message);
```

Expected result:

```text
playing
Liberty Prime has fallen...
```

## Known Watch-Outs

- `src/playable-game.js` is still a large single-file runtime. Keep edits scoped and test frequently.
- Root `index.html` loads React, ReactDOM, Babel, and the tweak panel scripts from CDN. The last browser smoke produced no SRI or load errors.
- Do not assume `DankArcade/` should be deleted; it remains useful as the design reference.
- `FEEDBACK.md` is user-provided feedback. Preserve it.
- If changing pointer or HUD layering, retest drag pan carefully because the updated UI intentionally overlays several panels on top of the transparent canvas.
- If changing Void balance, test weak, average, and strong universes. Current smoke saw a large-map/strong-state spawn around 1335 ships, which is intentionally above the old fixed cap.
- If changing event rendering, preserve the brass Chronicle style rather than adding a blue stats dropdown.
- If changing victory/loss logic, preserve the chosen rule: factions only truly lose when they have no worlds and no fleets.

## Good Next Tasks

Short-term polish:

- Tune Chronicle density and filtering once more event types accumulate.
- Add a small visual indicator when a faction has lost its capital but remains active.
- Improve drag-pan automation/manual feel around HUD edges if the user reports friction.
- Add clearer Void pressure cues on the tactical survey.
- Add a "capital reclaim" callout in dossier/standings.

Medium-term gameplay:

- Tune Void scaling by running 1, 3, and 5 AI simulations at 1x, 3x, and 5x.
- Add deterministic debug controls for forced crisis/capital loss/event generation.
- Add saveable match settings if the user keeps iterating on layouts.
- Expand AI reclaim logic for multi-step routes when the lost capital is not adjacent to a strong owned world.

Medium-term UI:

- Let Chronicle collapse into a compact rail popover on smaller mobile heights.
- Add event filters: Crisis, Capitals, Battles, Economy.
- Add faction activity state to standings: active, capital lost, eliminated, Void pressure.
- Add tactical survey overlays for production, planet level, and capital threat.

## Development Preference For Next Session

Before editing:

1. Check `git status --short`.
2. Treat root `src/playable-game.js` and `src/style.css` as live.
3. Treat `DankArcade/` as design reference.
4. Start or verify `server.mjs`.
5. Keep Playwright smoke tests focused but real: boot, start, interact, screenshot, console errors.

After editing:

1. Run `node --check src\playable-game.js`.
2. Smoke desktop and mobile.
3. Verify the UI still looks like DankArcade, not the old HUD.
4. Verify any touched gameplay rule with direct simulation checks.
