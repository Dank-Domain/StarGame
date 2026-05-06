# Starline Conquest Handoff

## Project Summary
This is a 2D Phaser browser strategy game prototype called **Starline Conquest**. The player or spectator watches factions fight across an isometric galaxy map, capture worlds, control sectors, upgrade planets, launch higher-tier fleets, trigger capital rewards, and eventually face a late-game invader if nobody wins quickly enough.

The playable version still runs without npm or Vite by serving `index.html` locally and loading Phaser from a CDN. The TypeScript/Vite files are scaffold leftovers; do not assume they are live.

Current local URL:

```text
http://127.0.0.1:5173
```

## How To Run
From the project folder:

```powershell
C:\Users\tjbac\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe server.mjs
```

Then open:

```text
http://127.0.0.1:5173
```

The server was already running on port `5173` in the last session. If the site cannot be reached, start `server.mjs` again.

## Important Files
- `index.html`: Loads CSS, Phaser CDN, and `src/playable-game.js`.
- `src/playable-game.js`: The actual running game. Gameplay, AI, combat, tiers, invader, camera, minimap, and HUD rendering are all here.
- `src/style.css`: Main menu, HUD, sector strip, legend, minimap, and responsive styling.
- `server.mjs`: Tiny local static server.
- Latest screenshots for current systems:
  - `smoke-invader-menu.png`
  - `smoke-invader-game.png`
  - `smoke-invader-mobile.png`

## Current Gameplay State
- Main menu has:
  - Rival AI count selector: 1-5 AIs.
  - Human Commander mode.
  - Spectator Simulation mode.
- Current normal factions:
  - Free Star Alliance
  - Imperial Directorate
  - Outer Rim Syndicate
  - Trade Combine
  - Ashen Order
  - Verdant League
- Runtime-only end-game faction:
  - Void Ascendancy
- Map starts with:
  - 52 worlds.
  - 10 sectors.
  - 76 hyperspace lanes.
- At 10:00 simulation time, if the match is still active, `The Rift Crown` spawns as a new edge-map node and adds 4 lanes.
- World data includes owner, ships, generation, kind, capital flag, sector, and `level`.
- Player action is intentionally simple:
  - Click owned world.
  - Click connected target.
  - Sends part of the source fleet.
  - Clicking the same selected owned world upgrades it if it qualifies.

## Planet Levels, Fleet Tiers, And Combat
- All worlds, including capitals, start at Level 1.
- Planet upgrades:
  - Level 2 requires 140 ships and spends 45.
  - Level 3 requires 250 ships and spends 90.
  - Normal factions cannot upgrade past Level 3.
- Fleet tier equals source planet level at launch.
- Combat power:
  - Tier I: `1.00x`
  - Tier II: `1.14x`
  - Tier III: `1.28x`
  - Tier IV: `1.48x`, invader-only.
- Upgraded planets add production:
  - Level 2: `+1`
  - Level 3: `+2`
- Fortresses, stations, and command worlds defend better.
- Shipyards and gates give outgoing fleets a small attack modifier.
- Combat uses modest random variance and occasional close-battle decisive strike messages.
- Fleet labels show tier, for example `80 III`.
- World labels show ships and level.

## AI And Capital Rewards
AI is implemented in `src/playable-game.js`, primarily around:
- `Simulation.updateAi`
- `createAiPlan`
- `chooseAiTarget`
- `aiTargetScore`
- `shouldAiAttack`
- `tryAiUpgrade`

Current AI behavior:
- Uses campaign plans focused on rival capitals.
- Tracks target capitals, target sectors, staging worlds, and war posture.
- Can coordinate multiple launches toward the same objective.
- Takes bigger risks during assault/surge pressure.
- Avoids wasteful reinforcement loops more than earlier versions.
- Upgrades valuable staging worlds, capitals, and shipyards when it can afford the troop spend.

Capital capture reward:
- Capturing a rival capital triggers war surge.
- Captured capital and owned worlds gain ships.
- Shipyards get extra reward ships.
- War surge temporarily boosts production and AI aggression.

## Galaxy Age And End-Game Invader
Galaxy age uses `Simulation.elapsed` and is shown in the HUD as `Age: MM:SS`.

Warnings:
- 8:00: rift forming warning.
- 9:30: imminent invasion warning.

At 10:00:
- `Void Ascendancy` spawns from `The Rift Crown`.
- `The Rift Crown` is a runtime-only world with Level 4 and Tier IV fleets.
- Starting ships scale from universe strength:
  - Minimum 360.
  - Maximum 900.
  - Scales using total faction ships, strongest faction, upgraded worlds, and active faction count.
- Invader wave size scales around 55-65% of source ships.
- Invader production rises slightly every 2 minutes after spawn.
- Invader captures worlds as Level 4.
- Normal factions prioritize Void worlds heavily after spawn.

Defeating the invader:
- Capturing `The Rift Crown` defeats the Void Ascendancy.
- Remaining Void-owned non-origin worlds become neutral.
- Void fleets are cleared.
- Capturer gets:
  - `The Rift Crown` downgraded to Level 3.
  - At least 120 ships on the origin world.
  - `+25` ships to owned worlds.
  - Extra `+10` for shipyards.
  - 60-second war surge.
- Normal victory rules continue afterward.

## Current Camera And UI
- Drag pan on the map.
- Mouse wheel zoom.
- HUD `-` and `+` zoom buttons.
- Keyboard and edge panning.
- Camera clamps to the current map bounds.
- Map bounds update when the runtime invader node appears.
- Clickable minimap in the lower-right:
  - Shows sector territory, worlds, fleets, and camera viewport.
  - Includes the runtime invader node after it spawns.
- HUD currently shows:
  - Pause/play.
  - Speed.
  - Zoom controls.
  - Restart and main menu.
  - Age/status/message text.
  - Sector holdings strip.
  - Legend.

## Recommended Next Session Goal
The user wants to work on **UI, stat trackers, and maps**.

Good next direction:
- Keep the game browser-playable after every change.
- Avoid a full rewrite or dependency/build migration.
- Improve information clarity without burying the playfield.
- Prefer DOM HUD/panels for stats, with the Phaser canvas continuing to render the galaxy.

Recommended UI improvements:
- Add a compact stats panel or toggleable overlay for:
  - Faction world count.
  - Total ships.
  - Capitals held.
  - Sectors held.
  - Highest planet level.
  - Active war surge time.
  - Void invasion status.
- Add selected-world detail panel:
  - Owner.
  - Level/tier.
  - Ships.
  - Production.
  - Upgrade requirement/cost.
  - Connected worlds.
  - Incoming friendly/enemy fleet counts.
- Add event log:
  - Captures.
  - Capital falls.
  - Planet upgrades.
  - Void warnings/spawn/defeat.
  - Decisive combat outcomes.
- Improve HUD layout so long status messages do not crowd controls.

Recommended stat tracker work:
- Add `Simulation.stats` or derived helper methods rather than scattering calculations in HUD code.
- Track per-faction counters:
  - Worlds captured.
  - Capitals captured/lost.
  - Fleets launched.
  - Fleets lost.
  - Ships destroyed.
  - Planets upgraded.
  - Void damage dealt/received.
- Decide whether stats are current snapshot only, historical totals only, or both.
- Keep stats reset on match restart.

Recommended map work:
- Add map overlays/toggles:
  - Sector ownership.
  - Production values.
  - Planet levels.
  - Capital threat routes.
  - Void invasion routes after spawn.
- Improve minimap readability:
  - Distinct capital markers.
  - Distinct Void marker.
  - Optional camera viewport contrast.
- Consider a larger map panel or tactical map mode that can be opened from the HUD.
- If adding map controls, use compact icon/toggle buttons and avoid covering the center playfield.

## Likely Code Areas For UI/Stats/Maps
- HUD/menu construction:
  - `Hud.buildHud`
  - `Hud.render`
  - `Hud.renderSectors`
  - `Hud.renderLegend`
  - `Hud.renderMinimap`
- Canvas rendering:
  - `ConquestScene.drawTerritories`
  - `ConquestScene.drawLanes`
  - `ConquestScene.drawWorld`
  - `ConquestScene.drawFleet`
- Simulation data helpers:
  - Add helper methods near existing `ownedSectorsFor`, `incomingShips`, `formattedAge`, etc.
- Styling:
  - `src/style.css`

## Testing Workflow
Use Playwright through the bundled Node runtime. Chromium is already installed.

Basic smoke test:

```powershell
$env:NODE_PATH='C:\Users\tjbac\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
C:\Users\tjbac\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe -e "const { chromium } = require('playwright'); (async()=>{ const browser=await chromium.launch({headless:true}); const page=await browser.newPage({viewport:{width:1360,height:780}}); const errors=[]; page.on('pageerror', err=>errors.push(err.message)); page.on('console', msg=>{ if(msg.type()==='error') errors.push(msg.text()); }); await page.goto('http://127.0.0.1:5173', {waitUntil:'networkidle', timeout:30000}); await page.screenshot({path:'smoke-latest.png', fullPage:false}); console.log(JSON.stringify({title:await page.title(), canvasCount:await page.locator('canvas').count(), menuVisible:await page.locator('.main-menu.visible').count(), errors}, null, 2)); await browser.close(); })();"
```

For UI/stat/map work, test at minimum:
- Start Human Commander with 1, 3, and 5 AIs.
- Start Spectator Simulation with 1, 3, and 5 AIs.
- Select an Alliance world.
- Select/upgrade a qualifying world by forcing ships in Playwright if needed.
- Launch a human fleet.
- Run spectator at `5x` for several seconds and confirm stats update.
- Force time near 10:00 and confirm Void UI/map state updates.
- Capture desktop and mobile screenshots.
- Check console/page errors.

Useful forced invader check from prior session:
- Set `window.__conquestSimulation.elapsed = 599`
- Call `window.__conquestSimulation.update(1.2)`
- Confirm `rift-crown` exists, lanes increase, and HUD/minimap update.

## Recent Verification
Latest successful Playwright checks verified:
- Syntax check passes.
- Human and spectator starts for 1, 3, and 5 AIs.
- All worlds start Level 1.
- Level upgrade thresholds/costs work.
- Tier III fleet launch works.
- Capital capture war surge still works.
- Invader warnings, spawn, scaling, Tier IV launch, and defeat reward work.
- Weak universe spawned Void at 360 ships.
- Strong universe capped Void at 900 ships.
- No page errors.

Latest screenshots:
- `smoke-invader-menu.png`
- `smoke-invader-game.png`
- `smoke-invader-mobile.png`

## User Preference
The user is non-technical and wants the game to work in the browser after each change. Do not stop at plans when they ask for implementation. Keep the local server running, test as you go, and provide the playable URL after changes.
