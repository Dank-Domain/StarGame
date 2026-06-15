(function () {
  const MAP_WIDTH = 1800;
  const MAP_HEIGHT = 1260;
  const ISO_SCALE_X = 0.78;
  const ISO_SCALE_Y = 0.42;
  const ISO_OFFSET_X = 910;
  const ISO_OFFSET_Y = 18;
  const ECONOMY_INTERVAL = 2.2;
  const AI_INTERVAL = 2.15;
  const TRAVEL_SECONDS = 3.25;
  const MIN_ATTACKING_SHIPS = 2;
  const SECTOR_BONUS = 1;
  const EDGE_PAN_SIZE = 28;
  const EDGE_PAN_SPEED = 520;
  const KEY_PAN_SPEED = 620;
  const NEUTRAL = "neutral";
  const CAPITAL_CAPTURE_REWARD = 18;
  const CAPITAL_CAPTURE_WORLD_REWARD = 5;
  const AI_PLAN_SECONDS = 30;
  const WAR_SURGE_SECONDS = 32;
  const WAR_SURGE_PRODUCTION_BONUS = 1;
  const CAPITAL_STALEMATE_SECONDS = 60;
  const FACTION_STALEMATE_SECONDS = 30;
  const INVADER = "void";
  const INVADER_SPAWN_SECONDS = 600;
  const INVADER_WARNING_ONE = 480;
  const INVADER_WARNING_TWO = 570;
  const INVADER_REWARD_SURGE_SECONDS = 60;
  const INVADER_WORLD = {
    id: "rift-crown",
    name: "The Rift Crown",
    kind: "rift",
    x: 1885,
    y: 55,
    ownerSlot: null,
    ships: 0,
    generationRate: 8,
    isCapital: false,
    isInvaderOrigin: true,
    sectorId: null
  };
  const INVADER_LANES = [
    ["rift-crown", "storm-altar"],
    ["rift-crown", "syndicate-capital"],
    ["rift-crown", "last-beacon"],
    ["rift-crown", "glass-moon"]
  ];
  const INVADER_FACTION = {
    id: INVADER,
    name: "Void Ascendancy",
    shortName: "Void",
    color: 0xf4e9ff,
    css: "#f4e9ff",
    aiDelay: 0.2
  };
  const PLANET_UPGRADES = {
    2: { threshold: 140, cost: 45 },
    3: { threshold: 250, cost: 90 }
  };
  const TIER_POWER = { 1: 1, 2: 1.14, 3: 1.28, 4: 1.48 };
  const TIER_ROMAN = { 1: "I", 2: "II", 3: "III", 4: "IV" };
  const DEFAULT_SETTINGS = { aiCount: 3, spectatorMode: false, mapLayout: "classic", galaxySize: "medium" };
  const MAP_LAYOUTS = {
    classic: { label: "Classic Front", scaleX: 1, scaleY: 1, twist: 0, ring: 0, centerPull: 0 },
    ring: { label: "Orbital Ring", scaleX: 1.05, scaleY: 1.05, twist: 0.48, ring: 0.72, centerPull: 0 },
    twin: { label: "Twin Fronts", scaleX: 1.18, scaleY: 0.9, twist: -0.2, ring: 0.18, centerPull: -0.12 },
    core: { label: "Dense Core", scaleX: 0.82, scaleY: 0.82, twist: 0.18, ring: 0.1, centerPull: 0.28 },
    frontier: { label: "Wide Frontier", scaleX: 1.34, scaleY: 1.18, twist: -0.12, ring: 0.2, centerPull: -0.24 }
  };
  const GALAXY_SIZES = {
    small: { label: "Small", spread: 0.86, trim: true, addFrontier: 0 },
    medium: { label: "Medium", spread: 1, trim: false, addFrontier: 0 },
    large: { label: "Large", spread: 1.16, trim: false, addFrontier: 1 }
  };
  const SMALL_TRIM_WORLD_IDS = new Set([
    "frost-needle", "white-comet", "silent-yard", "mirage-station", "amber-dock", "tide-lock",
    "red-lantern", "dust-harbor", "void-shelf", "storm-altar", "glass-moon", "last-beacon"
  ]);
  const LARGE_FRONTIER_WORLDS = [
    { id: "aurora-cache", name: "Aurora Cache", kind: "shipyard", x: 35, y: 1040, ownerSlot: null, ships: 23, generationRate: 4, isCapital: false, sectorId: "western-frontier" },
    { id: "helios-shard", name: "Helios Shard", kind: "planet", x: 150, y: 60, ownerSlot: null, ships: 22, generationRate: 3, isCapital: false, sectorId: "western-frontier" },
    { id: "night-gate", name: "Night Gate", kind: "gate", x: 1815, y: 300, ownerSlot: null, ships: 27, generationRate: 4, isCapital: false, sectorId: "eastern-frontier" },
    { id: "saffron-bastion", name: "Saffron Bastion", kind: "fortress", x: 1810, y: 1115, ownerSlot: null, ships: 28, generationRate: 3, isCapital: false, sectorId: "eastern-frontier" },
    { id: "zenith-forge", name: "Zenith Forge", kind: "shipyard", x: 940, y: -60, ownerSlot: null, ships: 24, generationRate: 4, isCapital: false, sectorId: "zenith-frontier" },
    { id: "deepwell", name: "Deepwell", kind: "planet", x: 920, y: 1325, ownerSlot: null, ships: 25, generationRate: 4, isCapital: false, sectorId: "southern-frontier" },
    { id: "crystal-ark", name: "Crystal Ark", kind: "station", x: 390, y: 1340, ownerSlot: null, ships: 22, generationRate: 3, isCapital: false, sectorId: "southern-frontier" },
    { id: "ember-gate", name: "Ember Gate", kind: "gate", x: 1505, y: -35, ownerSlot: null, ships: 24, generationRate: 4, isCapital: false, sectorId: "zenith-frontier" }
  ];
  const LARGE_FRONTIER_SECTORS = [
    { id: "western-frontier", name: "Western Frontier", worldIds: ["aurora-cache", "helios-shard"] },
    { id: "eastern-frontier", name: "Eastern Frontier", worldIds: ["night-gate", "saffron-bastion"] },
    { id: "zenith-frontier", name: "Zenith Frontier", worldIds: ["zenith-forge", "ember-gate"] },
    { id: "southern-frontier", name: "Southern Frontier", worldIds: ["deepwell", "crystal-ark"] }
  ];
  const LARGE_FRONTIER_LANES = [
    ["aurora-cache", "mirage-station"], ["aurora-cache", "low-sun"], ["helios-shard", "living-moon"],
    ["helios-shard", "frost-needle"], ["night-gate", "shadow-port"], ["night-gate", "syndicate-capital"],
    ["saffron-bastion", "last-beacon"], ["saffron-bastion", "dust-harbor"], ["zenith-forge", "ashen-capital"],
    ["zenith-forge", "storm-altar"], ["deepwell", "combine-capital"], ["deepwell", "tide-lock"],
    ["crystal-ark", "amber-dock"], ["crystal-ark", "low-sun"], ["ember-gate", "storm-altar"], ["ember-gate", "night-gate"]
  ];

  const AI_PERSONALITIES = {
    alliance: { aggression: 1.05, risk: 1.02, capitalFocus: 1.2, sectorFocus: 1.05, expansion: 1 },
    directorate: { aggression: 1.2, risk: 1.15, capitalFocus: 1.35, sectorFocus: 0.9, expansion: 0.85 },
    syndicate: { aggression: 1.12, risk: 1.25, capitalFocus: 1.05, sectorFocus: 0.9, expansion: 0.95 },
    combine: { aggression: 0.95, risk: 0.95, capitalFocus: 0.95, sectorFocus: 1.35, expansion: 1.25 },
    ashen: { aggression: 1.08, risk: 1.08, capitalFocus: 1.45, sectorFocus: 0.95, expansion: 0.8 },
    verdant: { aggression: 0.9, risk: 0.88, capitalFocus: 0.9, sectorFocus: 1.25, expansion: 1.35 }
  };

  const FACTIONS = [
    { id: "alliance", name: "Free Star Alliance", shortName: "Alliance", color: 0x48b8ff, css: "#48b8ff", aiDelay: 0.45 },
    { id: "directorate", name: "Imperial Directorate", shortName: "Directorate", color: 0xf05d63, css: "#f05d63", aiDelay: 0.85 },
    { id: "syndicate", name: "Outer Rim Syndicate", shortName: "Syndicate", color: 0x43c874, css: "#43c874", aiDelay: 1.2 },
    { id: "combine", name: "Trade Combine", shortName: "Combine", color: 0xf0b64f, css: "#f0b64f", aiDelay: 1.55 },
    { id: "ashen", name: "Ashen Order", shortName: "Ashen Order", color: 0xb46cff, css: "#b46cff", aiDelay: 1.9 },
    { id: "verdant", name: "Verdant League", shortName: "Verdant", color: 0x2fd7c4, css: "#2fd7c4", aiDelay: 2.25 }
  ];

  const COLORS = {
    neutral: 0xa7b6c8,
    capital: 0xffd27a,
    lane: 0x426178,
    laneGlow: 0x9fe5ff,
    minimapFrame: 0xdcecff
  };

  const SECTORS = [
    { id: "dawn-sector", name: "Dawn Sector", worldIds: ["alliance-capital", "nova-yard", "blue-moon", "dawn-relay", "ion-field"] },
    { id: "verdant-sector", name: "Verdant Reach", worldIds: ["verdant-capital", "jade-outpost", "living-moon", "green-haven", "spire-watch"] },
    { id: "ashen-sector", name: "Ashen Veil", worldIds: ["ashen-capital", "oracle-drift", "ember-veil", "eclipse-gate", "quiet-oracle"] },
    { id: "syndicate-sector", name: "Rim Bazaar", worldIds: ["syndicate-capital", "knife-moon", "black-market", "shadow-port", "dice-rock"] },
    { id: "directorate-sector", name: "Iron Dominion", worldIds: ["directorate-capital", "iron-vigil", "obsidian-dock", "scarlet-bastion", "hammer-yard"] },
    { id: "combine-sector", name: "Guild Run", worldIds: ["combine-capital", "toll-ring", "cargo-haven", "mint-foundry", "ledger-moon"] },
    { id: "nexus-sector", name: "Nexus Core", worldIds: ["anchor-drift", "relay-seven", "kessel-gate", "ghost-ring", "hollow-sun", "sable-depot"] },
    { id: "southern-sector", name: "Southern Expanse", worldIds: ["frontier-well", "low-sun", "tide-lock", "mirage-station", "amber-dock"] },
    { id: "northern-sector", name: "Northern Reaches", worldIds: ["frost-needle", "white-comet", "storm-altar", "glass-moon", "silent-yard"] },
    { id: "crossroads-sector", name: "Outer Crossroads", worldIds: ["farpoint", "red-lantern", "cobalt-ring", "dust-harbor", "last-beacon", "void-shelf"] }
  ];

  const GALAXY_TEMPLATE = {
    worlds: [
      { id: "alliance-capital", name: "Liberty Prime", kind: "command world", x: 120, y: 620, ownerSlot: 0, ships: 45, generationRate: 4, isCapital: true, sectorId: "dawn-sector" },
      { id: "nova-yard", name: "Nova Yard", kind: "shipyard", x: 235, y: 470, ownerSlot: 0, ships: 24, generationRate: 3, isCapital: false, sectorId: "dawn-sector" },
      { id: "blue-moon", name: "Blue Moon", kind: "moon", x: 280, y: 745, ownerSlot: 0, ships: 22, generationRate: 3, isCapital: false, sectorId: "dawn-sector" },
      { id: "dawn-relay", name: "Dawn Relay", kind: "station", x: 395, y: 590, ownerSlot: 0, ships: 21, generationRate: 3, isCapital: false, sectorId: "dawn-sector" },
      { id: "ion-field", name: "Ion Field", kind: "nebula", x: 450, y: 800, ownerSlot: null, ships: 18, generationRate: 3, isCapital: false, sectorId: "dawn-sector" },

      { id: "verdant-capital", name: "Garden Spire", kind: "command world", x: 260, y: 155, ownerSlot: 5, ships: 41, generationRate: 4, isCapital: true, sectorId: "verdant-sector" },
      { id: "jade-outpost", name: "Jade Outpost", kind: "station", x: 410, y: 225, ownerSlot: 5, ships: 22, generationRate: 3, isCapital: false, sectorId: "verdant-sector" },
      { id: "living-moon", name: "Living Moon", kind: "moon", x: 160, y: 300, ownerSlot: 5, ships: 22, generationRate: 3, isCapital: false, sectorId: "verdant-sector" },
      { id: "green-haven", name: "Green Haven", kind: "planet", x: 330, y: 360, ownerSlot: 5, ships: 20, generationRate: 3, isCapital: false, sectorId: "verdant-sector" },
      { id: "spire-watch", name: "Spire Watch", kind: "station", x: 520, y: 340, ownerSlot: null, ships: 18, generationRate: 3, isCapital: false, sectorId: "verdant-sector" },

      { id: "ashen-capital", name: "Eclipse Sanctum", kind: "command world", x: 870, y: 115, ownerSlot: 4, ships: 41, generationRate: 4, isCapital: true, sectorId: "ashen-sector" },
      { id: "oracle-drift", name: "Oracle Drift", kind: "station", x: 710, y: 180, ownerSlot: 4, ships: 22, generationRate: 3, isCapital: false, sectorId: "ashen-sector" },
      { id: "ember-veil", name: "Ember Veil", kind: "nebula", x: 910, y: 295, ownerSlot: 4, ships: 22, generationRate: 3, isCapital: false, sectorId: "ashen-sector" },
      { id: "eclipse-gate", name: "Eclipse Gate", kind: "gate", x: 1045, y: 185, ownerSlot: 4, ships: 20, generationRate: 3, isCapital: false, sectorId: "ashen-sector" },
      { id: "quiet-oracle", name: "Quiet Oracle", kind: "moon", x: 700, y: 345, ownerSlot: null, ships: 18, generationRate: 3, isCapital: false, sectorId: "ashen-sector" },

      { id: "syndicate-capital", name: "Smuggler Crown", kind: "command world", x: 1345, y: 200, ownerSlot: 2, ships: 42, generationRate: 4, isCapital: true, sectorId: "syndicate-sector" },
      { id: "knife-moon", name: "Knife Moon", kind: "moon", x: 1195, y: 175, ownerSlot: 2, ships: 23, generationRate: 3, isCapital: false, sectorId: "syndicate-sector" },
      { id: "black-market", name: "Black Market", kind: "station", x: 1270, y: 365, ownerSlot: 2, ships: 24, generationRate: 3, isCapital: false, sectorId: "syndicate-sector" },
      { id: "shadow-port", name: "Shadow Port", kind: "shipyard", x: 1455, y: 390, ownerSlot: 2, ships: 22, generationRate: 3, isCapital: false, sectorId: "syndicate-sector" },
      { id: "dice-rock", name: "Dice Rock", kind: "moon", x: 1115, y: 405, ownerSlot: null, ships: 18, generationRate: 3, isCapital: false, sectorId: "syndicate-sector" },

      { id: "directorate-capital", name: "Cinder Throne", kind: "command world", x: 1655, y: 640, ownerSlot: 1, ships: 45, generationRate: 4, isCapital: true, sectorId: "directorate-sector" },
      { id: "iron-vigil", name: "Iron Vigil", kind: "fortress", x: 1515, y: 500, ownerSlot: 1, ships: 25, generationRate: 3, isCapital: false, sectorId: "directorate-sector" },
      { id: "obsidian-dock", name: "Obsidian Dock", kind: "station", x: 1510, y: 775, ownerSlot: 1, ships: 23, generationRate: 3, isCapital: false, sectorId: "directorate-sector" },
      { id: "scarlet-bastion", name: "Scarlet Bastion", kind: "fortress", x: 1355, y: 665, ownerSlot: 1, ships: 24, generationRate: 3, isCapital: false, sectorId: "directorate-sector" },
      { id: "hammer-yard", name: "Hammer Yard", kind: "shipyard", x: 1665, y: 885, ownerSlot: null, ships: 19, generationRate: 3, isCapital: false, sectorId: "directorate-sector" },

      { id: "combine-capital", name: "Guild Nexus", kind: "command world", x: 1015, y: 1120, ownerSlot: 3, ships: 42, generationRate: 4, isCapital: true, sectorId: "combine-sector" },
      { id: "toll-ring", name: "Toll Ring", kind: "station", x: 810, y: 1000, ownerSlot: 3, ships: 24, generationRate: 3, isCapital: false, sectorId: "combine-sector" },
      { id: "cargo-haven", name: "Cargo Haven", kind: "shipyard", x: 1185, y: 1010, ownerSlot: 3, ships: 24, generationRate: 3, isCapital: false, sectorId: "combine-sector" },
      { id: "mint-foundry", name: "Mint Foundry", kind: "shipyard", x: 925, y: 865, ownerSlot: 3, ships: 22, generationRate: 3, isCapital: false, sectorId: "combine-sector" },
      { id: "ledger-moon", name: "Ledger Moon", kind: "moon", x: 1120, y: 865, ownerSlot: null, ships: 18, generationRate: 3, isCapital: false, sectorId: "combine-sector" },

      { id: "anchor-drift", name: "Anchor Drift", kind: "station", x: 620, y: 560, ownerSlot: null, ships: 21, generationRate: 3, isCapital: false, sectorId: "nexus-sector" },
      { id: "relay-seven", name: "Relay Seven", kind: "station", x: 780, y: 470, ownerSlot: null, ships: 20, generationRate: 3, isCapital: false, sectorId: "nexus-sector" },
      { id: "kessel-gate", name: "Kessel Gate", kind: "gate", x: 940, y: 610, ownerSlot: null, ships: 30, generationRate: 5, isCapital: false, sectorId: "nexus-sector" },
      { id: "ghost-ring", name: "Ghost Ring", kind: "station", x: 1110, y: 560, ownerSlot: null, ships: 22, generationRate: 4, isCapital: false, sectorId: "nexus-sector" },
      { id: "hollow-sun", name: "Hollow Sun", kind: "planet", x: 780, y: 705, ownerSlot: null, ships: 24, generationRate: 4, isCapital: false, sectorId: "nexus-sector" },
      { id: "sable-depot", name: "Sable Depot", kind: "shipyard", x: 1045, y: 760, ownerSlot: null, ships: 24, generationRate: 4, isCapital: false, sectorId: "nexus-sector" },

      { id: "frontier-well", name: "Frontier Well", kind: "planet", x: 550, y: 925, ownerSlot: null, ships: 20, generationRate: 3, isCapital: false, sectorId: "southern-sector" },
      { id: "low-sun", name: "Low Sun", kind: "planet", x: 360, y: 1020, ownerSlot: null, ships: 20, generationRate: 3, isCapital: false, sectorId: "southern-sector" },
      { id: "tide-lock", name: "Tide Lock", kind: "station", x: 635, y: 1120, ownerSlot: null, ships: 21, generationRate: 3, isCapital: false, sectorId: "southern-sector" },
      { id: "mirage-station", name: "Mirage Station", kind: "station", x: 230, y: 910, ownerSlot: null, ships: 18, generationRate: 3, isCapital: false, sectorId: "southern-sector" },
      { id: "amber-dock", name: "Amber Dock", kind: "shipyard", x: 445, y: 1165, ownerSlot: null, ships: 19, generationRate: 3, isCapital: false, sectorId: "southern-sector" },

      { id: "frost-needle", name: "Frost Needle", kind: "planet", x: 575, y: 80, ownerSlot: null, ships: 19, generationRate: 3, isCapital: false, sectorId: "northern-sector" },
      { id: "white-comet", name: "White Comet", kind: "moon", x: 500, y: 500, ownerSlot: null, ships: 20, generationRate: 3, isCapital: false, sectorId: "northern-sector" },
      { id: "storm-altar", name: "Storm Altar", kind: "nebula", x: 1110, y: 85, ownerSlot: null, ships: 20, generationRate: 3, isCapital: false, sectorId: "northern-sector" },
      { id: "glass-moon", name: "Glass Moon", kind: "moon", x: 1235, y: 520, ownerSlot: null, ships: 20, generationRate: 3, isCapital: false, sectorId: "northern-sector" },
      { id: "silent-yard", name: "Silent Yard", kind: "shipyard", x: 645, y: 265, ownerSlot: null, ships: 19, generationRate: 3, isCapital: false, sectorId: "northern-sector" },

      { id: "farpoint", name: "Farpoint", kind: "planet", x: 1305, y: 850, ownerSlot: null, ships: 22, generationRate: 3, isCapital: false, sectorId: "crossroads-sector" },
      { id: "red-lantern", name: "Red Lantern", kind: "station", x: 1415, y: 1015, ownerSlot: null, ships: 19, generationRate: 3, isCapital: false, sectorId: "crossroads-sector" },
      { id: "cobalt-ring", name: "Cobalt Ring", kind: "station", x: 1230, y: 650, ownerSlot: null, ships: 21, generationRate: 3, isCapital: false, sectorId: "crossroads-sector" },
      { id: "dust-harbor", name: "Dust Harbor", kind: "shipyard", x: 1520, y: 1095, ownerSlot: null, ships: 20, generationRate: 3, isCapital: false, sectorId: "crossroads-sector" },
      { id: "last-beacon", name: "Last Beacon", kind: "station", x: 1650, y: 1040, ownerSlot: null, ships: 18, generationRate: 3, isCapital: false, sectorId: "crossroads-sector" },
      { id: "void-shelf", name: "Void Shelf", kind: "planet", x: 1390, y: 1165, ownerSlot: null, ships: 21, generationRate: 3, isCapital: false, sectorId: "crossroads-sector" }
    ],
    lanes: [
      ["alliance-capital", "nova-yard"], ["alliance-capital", "blue-moon"], ["nova-yard", "dawn-relay"], ["blue-moon", "dawn-relay"], ["blue-moon", "ion-field"], ["dawn-relay", "anchor-drift"], ["ion-field", "frontier-well"],
      ["verdant-capital", "living-moon"], ["verdant-capital", "jade-outpost"], ["living-moon", "green-haven"], ["jade-outpost", "green-haven"], ["jade-outpost", "spire-watch"], ["green-haven", "dawn-relay"], ["spire-watch", "anchor-drift"],
      ["ashen-capital", "oracle-drift"], ["ashen-capital", "eclipse-gate"], ["oracle-drift", "quiet-oracle"], ["quiet-oracle", "ember-veil"], ["ember-veil", "eclipse-gate"], ["quiet-oracle", "relay-seven"], ["ember-veil", "kessel-gate"],
      ["syndicate-capital", "knife-moon"], ["syndicate-capital", "black-market"], ["black-market", "shadow-port"], ["knife-moon", "dice-rock"], ["dice-rock", "black-market"], ["eclipse-gate", "knife-moon"], ["shadow-port", "iron-vigil"],
      ["directorate-capital", "iron-vigil"], ["directorate-capital", "obsidian-dock"], ["iron-vigil", "scarlet-bastion"], ["obsidian-dock", "scarlet-bastion"], ["obsidian-dock", "hammer-yard"], ["scarlet-bastion", "cobalt-ring"], ["hammer-yard", "last-beacon"],
      ["combine-capital", "toll-ring"], ["combine-capital", "cargo-haven"], ["toll-ring", "mint-foundry"], ["cargo-haven", "ledger-moon"], ["mint-foundry", "ledger-moon"], ["mint-foundry", "sable-depot"], ["toll-ring", "frontier-well"], ["cargo-haven", "farpoint"],
      ["anchor-drift", "relay-seven"], ["relay-seven", "kessel-gate"], ["kessel-gate", "ghost-ring"], ["ghost-ring", "sable-depot"], ["sable-depot", "hollow-sun"], ["hollow-sun", "anchor-drift"], ["hollow-sun", "kessel-gate"], ["ghost-ring", "cobalt-ring"],
      ["frontier-well", "low-sun"], ["low-sun", "mirage-station"], ["low-sun", "amber-dock"], ["amber-dock", "tide-lock"], ["tide-lock", "frontier-well"], ["frontier-well", "hollow-sun"], ["tide-lock", "toll-ring"],
      ["frost-needle", "verdant-capital"], ["frost-needle", "oracle-drift"], ["white-comet", "spire-watch"], ["white-comet", "anchor-drift"], ["storm-altar", "eclipse-gate"], ["storm-altar", "knife-moon"], ["glass-moon", "dice-rock"], ["glass-moon", "ghost-ring"], ["silent-yard", "oracle-drift"], ["silent-yard", "spire-watch"],
      ["farpoint", "cobalt-ring"], ["farpoint", "red-lantern"], ["red-lantern", "dust-harbor"], ["dust-harbor", "last-beacon"], ["last-beacon", "void-shelf"], ["void-shelf", "red-lantern"], ["cobalt-ring", "farpoint"], ["farpoint", "obsidian-dock"], ["cobalt-ring", "scarlet-bastion"], ["void-shelf", "combine-capital"]
    ]
  };

  const FAR_STARS = Array.from({ length: 380 }, (_, index) => ({
    x: (index * 271 + 17) % 2400 - 200,
    y: (index * 113 + Math.floor(index / 5) * 47) % 1600 - 200,
    r: 0.5 + ((index * 7) % 3) * 0.15
  }));

  const MID_STARS = Array.from({ length: 140 }, (_, index) => {
    const tints = [0xffffff, 0xffe9c6, 0xc8d8ff, 0xfff2d6, 0xb8e0ff];
    return {
      x: (index * 419 + 53) % 2400 - 200,
      y: (index * 233 + Math.floor(index / 3) * 71) % 1600 - 200,
      r: 0.9 + ((index * 13) % 5) * 0.32,
      tint: tints[index % tints.length],
      alpha: 0.55 + ((index * 17) % 5) * 0.09
    };
  });

  const STARFIELD = Array.from({ length: 230 }, (_, index) => ({
    x: (index * 131) % 2500 - 350,
    y: (index * 71 + Math.floor(index / 4) * 31) % 1500 - 160,
    radius: index % 11 === 0 ? 1.9 : index % 5 === 0 ? 1.25 : 0.85,
    alpha: 0.2 + (index % 8) * 0.075
  }));

  function projectPoint(x, y) {
    return {
      x: (x - y) * ISO_SCALE_X + ISO_OFFSET_X,
      y: (x + y) * ISO_SCALE_Y + ISO_OFFSET_Y
    };
  }

  function unprojectPoint(x, y) {
    const dx = (x - ISO_OFFSET_X) / ISO_SCALE_X;
    const dy = (y - ISO_OFFSET_Y) / ISO_SCALE_Y;
    return {
      x: (dy + dx) / 2,
      y: (dy - dx) / 2
    };
  }

  function activeFactionsFor(settings) {
    return FACTIONS.slice(0, settings.aiCount + 1).map((faction, index) => ({
      ...faction,
      isHuman: index === 0 && !settings.spectatorMode
    }));
  }

  function colorFor(owner, factions) {
    if (owner === NEUTRAL) return COLORS.neutral;
    return factions.find((faction) => faction.id === owner)?.color || COLORS.neutral;
  }

  function nameFor(owner, factions) {
    if (owner === NEUTRAL) return "Neutral Worlds";
    return factions.find((faction) => faction.id === owner)?.shortName || "Unknown Fleet";
  }

  function cssFor(owner, factions) {
    if (owner === NEUTRAL) return "#a7b6c8";
    return factions.find((faction) => faction.id === owner)?.css || "#a7b6c8";
  }

  function uniqLanes(lanes) {
    const seen = new Set();
    return lanes.filter(([a, b]) => {
      const key = [a, b].sort().join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function buildGalaxy(settings) {
    const normalized = { ...DEFAULT_SETTINGS, ...settings };
    const size = GALAXY_SIZES[normalized.galaxySize] || GALAXY_SIZES.medium;
    const layout = MAP_LAYOUTS[normalized.mapLayout] || MAP_LAYOUTS.classic;
    const activeSlots = normalized.aiCount + 1;
    let worlds = GALAXY_TEMPLATE.worlds.map((world) => ({ ...world }));
    let lanes = GALAXY_TEMPLATE.lanes.map((lane) => [...lane]);
    let sectors = SECTORS.map((sector) => ({ ...sector, worldIds: [...sector.worldIds] }));

    if (size.trim) {
      worlds = worlds.filter((world) => !SMALL_TRIM_WORLD_IDS.has(world.id) || (world.ownerSlot !== null && world.ownerSlot < activeSlots) || world.isCapital);
      const kept = new Set(worlds.map((world) => world.id));
      lanes = lanes.filter(([a, b]) => kept.has(a) && kept.has(b));
      sectors = sectors.map((sector) => ({ ...sector, worldIds: sector.worldIds.filter((id) => kept.has(id)) })).filter((sector) => sector.worldIds.length >= 2);
    }

    if (size.addFrontier) {
      worlds = worlds.concat(LARGE_FRONTIER_WORLDS.map((world) => ({ ...world })));
      lanes = lanes.concat(LARGE_FRONTIER_LANES.map((lane) => [...lane]));
      sectors = sectors.concat(LARGE_FRONTIER_SECTORS.map((sector) => ({ ...sector, worldIds: [...sector.worldIds] })));
    }

    const cx = MAP_WIDTH / 2;
    const cy = MAP_HEIGHT / 2;
    worlds = worlds.map((world) => transformGalaxyWorld(world, cx, cy, size, layout));
    const kept = new Set(worlds.map((world) => world.id));
    lanes = uniqLanes(lanes).filter(([a, b]) => kept.has(a) && kept.has(b));
    return { worlds, lanes, sectors };
  }

  function transformGalaxyWorld(world, cx, cy, size, layout) {
    if (layout === MAP_LAYOUTS.classic && size === GALAXY_SIZES.medium) return { ...world };
    const dx = world.x - cx;
    const dy = world.y - cy;
    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) + layout.twist * (distance / 1000);
    const ringDistance = distance * (1 - layout.ring) + (520 + (world.ownerSlot === null ? 80 : 0)) * layout.ring;
    const pull = 1 - layout.centerPull;
    return {
      ...world,
      x: Math.round(cx + Math.cos(angle) * ringDistance * layout.scaleX * size.spread * pull),
      y: Math.round(cy + Math.sin(angle) * ringDistance * layout.scaleY * size.spread * pull)
    };
  }

  class GameShell {
    constructor() {
      this.screen = "menu";
      this.settings = { ...DEFAULT_SETTINGS };
      this.simulation = new Simulation(this.settings);
      this.simulation.clear();
    }

    startGame(settings) {
      this.settings = { ...settings };
      this.screen = "playing";
      this.simulation.restart(this.settings);
    }

    restartMatch() {
      this.screen = "playing";
      this.simulation.restart(this.settings);
    }

    returnToMenu() {
      this.screen = "menu";
      this.simulation.clear();
    }
  }

  class Simulation {
    constructor(settings) {
      this.clear();
      this.restart(settings || { aiCount: 3, spectatorMode: false });
    }

    clear() {
      this.worlds = [];
      this.lanes = [];
      this.sectors = [];
      this.factions = [];
      this.fleets = [];
      this.paused = false;
      this.speed = 1;
      this.status = "idle";
      this.selectedWorldId = null;
      this.message = "Choose your galactic setup.";
      this.economyClock = 0;
      this.aiClocks = {};
      this.aiPlans = {};
      this.routeCooldowns = {};
      this.factionPressure = {};
      this.warSurges = {};
      this.sectorOwners = {};
      this.elapsed = 0;
      this.lastCapitalCaptureAt = 0;
      this.invaderSpawned = false;
      this.invaderDefeated = false;
      this.invaderWarningOneShown = false;
      this.invaderWarningTwoShown = false;
      this.invaderClock = 0;
      this.invaderScale = 0;
      this.priorityMessage = null;
      this.priorityMessageUntil = 0;
      this.mapRevision = 0;
      this.nextFleetId = 1;
      this.stats = {};
      this.settings = { ...DEFAULT_SETTINGS };
    }

    restart(settings) {
      this.settings = { ...DEFAULT_SETTINGS, ...settings };
      this.factions = activeFactionsFor(this.settings);
      const galaxy = buildGalaxy(this.settings);
      this.worlds = galaxy.worlds.map((world) => {
        const owner = world.ownerSlot === null || world.ownerSlot >= this.factions.length ? NEUTRAL : this.factions[world.ownerSlot].id;
        return { ...world, owner, level: 1 };
      });
      this.lanes = galaxy.lanes.map((lane) => [...lane]);
      this.sectors = galaxy.sectors.map((sector) => ({ ...sector, worldIds: [...sector.worldIds] }));
      this.fleets = [];
      this.paused = false;
      this.speed = 1;
      this.status = "playing";
      this.selectedWorldId = null;
      this.message = this.settings.spectatorMode
        ? "Spectator simulation live. Sector bonuses are active."
        : "Select an Alliance world, then choose a connected hyperspace target.";
      this.economyClock = 0;
      this.aiClocks = {};
      this.aiPlans = {};
      this.routeCooldowns = {};
      this.factionPressure = {};
      this.warSurges = {};
      this.elapsed = 0;
      this.lastCapitalCaptureAt = 0;
      this.invaderSpawned = false;
      this.invaderDefeated = false;
      this.invaderWarningOneShown = false;
      this.invaderWarningTwoShown = false;
      this.invaderClock = 0;
      this.invaderScale = 0;
      this.priorityMessage = null;
      this.priorityMessageUntil = 0;
      this.mapRevision = 0;
      this.nextFleetId = 1;
      this.stats = {};
      for (const faction of this.factions) {
        this.factionPressure[faction.id] = 0;
        this.warSurges[faction.id] = 0;
        this.ensureFactionStats(faction.id);
      }
      for (const faction of this.aiFactions()) this.aiClocks[faction.id] = Math.min(faction.aiDelay, AI_INTERVAL - 0.25);
      this.sectorOwners = this.captureSectorOwners();
    }

    setPaused(paused) {
      if (this.status !== "playing") return;
      this.paused = paused;
      this.message = paused ? "Simulation paused. Fleets are holding formation." : "Command channel restored.";
    }

    ensureFactionStats(owner) {
      if (!owner || owner === NEUTRAL) return null;
      if (!this.stats[owner]) {
        this.stats[owner] = {
          troopsCreated: 0,
          troopsLost: 0,
          troopsKilled: 0,
          fleetsLaunched: 0,
          planetsCaptured: 0,
          planetsUpgraded: 0
        };
      }
      return this.stats[owner];
    }

    addTroopsCreated(owner, amount) {
      const stats = this.ensureFactionStats(owner);
      if (stats && amount > 0) stats.troopsCreated += amount;
    }

    addCombatLoss(owner, amount, killerOwner) {
      if (!owner || owner === NEUTRAL || amount <= 0) return;
      this.ensureFactionStats(owner).troopsLost += amount;
      if (killerOwner && killerOwner !== NEUTRAL && killerOwner !== owner) this.ensureFactionStats(killerOwner).troopsKilled += amount;
    }

    addCapture(owner) {
      const stats = this.ensureFactionStats(owner);
      if (stats) stats.planetsCaptured++;
    }

    factionSnapshots() {
      return this.factions.map((faction) => {
        const worlds = this.worlds.filter((world) => world.owner === faction.id);
        const fleets = this.fleets.filter((fleet) => fleet.owner === faction.id);
        const stats = this.ensureFactionStats(faction.id);
        return {
          faction,
          planets: worlds.length,
          totalShips: worlds.reduce((sum, world) => sum + world.ships, 0) + fleets.reduce((sum, fleet) => sum + fleet.ships, 0),
          capitals: worlds.filter((world) => world.isCapital).length,
          sectors: this.ownedSectorsFor(faction.id).length,
          highestLevel: worlds.reduce((highest, world) => Math.max(highest, this.worldTier(world)), 0),
          surge: Math.ceil(this.warSurges[faction.id] || 0),
          ...stats
        };
      });
    }

    matchSummary() {
      const voidWorlds = this.worlds.filter((world) => this.isInvader(world.owner)).length;
      return {
        age: this.formattedAge(),
        worlds: this.worlds.length,
        fleets: this.fleets.length,
        layout: MAP_LAYOUTS[this.settings.mapLayout]?.label || "Classic Front",
        size: GALAXY_SIZES[this.settings.galaxySize]?.label || "Medium",
        voidStatus: this.invaderDefeated ? "Defeated" : this.invaderSpawned ? `${voidWorlds} worlds` : "Dormant"
      };
    }

    selectedWorldDetails() {
      const world = this.getWorld(this.selectedWorldId);
      if (!world) return null;
      const neighbors = this.getNeighbors(world.id).map((id) => this.getWorld(id)).filter(Boolean);
      const upgrade = this.nextUpgradeFor(world);
      const incomingFriendly = this.incomingShips(world.id, world.owner);
      const incomingEnemy = this.fleets
        .filter((fleet) => fleet.to === world.id && fleet.owner !== world.owner)
        .reduce((sum, fleet) => sum + fleet.ships, 0);
      return {
        world,
        ownerName: nameFor(world.owner, this.factions),
        tier: TIER_ROMAN[this.worldTier(world)],
        production: this.generationFor(world),
        upgrade,
        neighbors,
        incomingFriendly,
        incomingEnemy
      };
    }

    selectWorld(worldId) {
      if (this.status !== "playing") return;
      const human = this.humanFaction();
      if (!human) {
        const world = this.getWorld(worldId);
        if (world) this.message = `${world.name} is held by ${nameFor(world.owner, this.factions)}. Spectator mode is AI-only.`;
        return;
      }

      const world = this.getWorld(worldId);
      if (!world) return;

      if (world.owner === human.id) {
        if (this.selectedWorldId === worldId && this.tryUpgradeWorld(world, human.id)) return;
        if (this.selectedWorldId && this.selectedWorldId !== worldId && this.areConnected(this.selectedWorldId, worldId)) {
          this.sendFleet(this.selectedWorldId, worldId, human.id);
          return;
        }

        this.selectedWorldId = worldId;
        this.message = this.selectionMessage(world);
        return;
      }

      if (this.selectedWorldId) this.sendFleet(this.selectedWorldId, worldId, human.id);
    }

    sendFleet(fromId, toId, owner) {
      if (this.status !== "playing") return false;
      if (!this.areConnected(fromId, toId)) {
        if (this.isHuman(owner)) this.message = "No hyperspace lane links those worlds.";
        return false;
      }

      const from = this.getWorld(fromId);
      const to = this.getWorld(toId);
      if (!from || !to || from.owner !== owner) return false;

      const ships = this.launchShipsFor(from, owner);
      const tier = this.worldTier(from);
      if (ships < MIN_ATTACKING_SHIPS) {
        if (this.isHuman(owner)) this.message = `${from.name} needs more ships before launching a fleet.`;
        return false;
      }

      from.ships -= ships;
      this.fleets.push({
        id: `fleet-${this.nextFleetId++}`,
        owner,
        from: fromId,
        to: toId,
        ships,
        tier,
        attackMod: this.outgoingFleetModifier(from),
        progress: 0,
        duration: TRAVEL_SECONDS,
        holdTime: 0
      });
      this.ensureFactionStats(owner).fleetsLaunched++;

      if (this.isHuman(owner)) {
        this.selectedWorldId = null;
        this.message = `${ships} Tier ${TIER_ROMAN[tier]} ships jumped from ${from.name} toward ${to.name}.`;
      } else {
        this.routeCooldowns[this.routeKey(toId, fromId, owner)] = 8;
      }

      return true;
    }

    launchShipsFor(world, owner) {
      if (this.isInvader(owner)) {
        const pressure = Phaser.Math.Clamp(this.invaderScale / 900, 0, 1);
        const ratio = 0.55 + pressure * 0.1;
        return Math.floor(world.ships * ratio);
      }
      return Math.floor(world.ships / 2);
    }

    update(deltaSeconds) {
      if (this.paused || this.status !== "playing") return;
      const scaledDelta = deltaSeconds * this.speed;
      this.elapsed += scaledDelta;
      for (const faction of this.factions) this.factionPressure[faction.id] += scaledDelta;
      this.updateRouteCooldowns(scaledDelta);
      this.updateWarSurges(scaledDelta);
      this.updateGalaxyAgeEvents(scaledDelta);
      this.updateEconomy(scaledDelta);
      this.updateFleets(scaledDelta);
      this.resolveHyperspaceInterceptions();
      this.updateAi(scaledDelta);
      this.updateInvaderAi(scaledDelta);
      if (this.priorityMessage && this.elapsed < this.priorityMessageUntil) this.message = this.priorityMessage;
    }

    setPriorityMessage(message, holdSeconds = 5) {
      this.priorityMessage = message;
      this.priorityMessageUntil = this.elapsed + holdSeconds;
      this.message = message;
    }

    updateRouteCooldowns(deltaSeconds) {
      for (const key of Object.keys(this.routeCooldowns)) {
        this.routeCooldowns[key] -= deltaSeconds;
        if (this.routeCooldowns[key] <= 0) delete this.routeCooldowns[key];
      }
    }

    updateWarSurges(deltaSeconds) {
      for (const owner of Object.keys(this.warSurges)) {
        this.warSurges[owner] = Math.max(0, this.warSurges[owner] - deltaSeconds);
      }
    }

    updateGalaxyAgeEvents(_deltaSeconds) {
      if (!this.invaderWarningOneShown && this.elapsed >= INVADER_WARNING_ONE && !this.invaderSpawned) {
        this.invaderWarningOneShown = true;
        this.setPriorityMessage("Long-range sensors detect a rift forming beyond the galactic rim.", 5);
      }
      if (!this.invaderWarningTwoShown && this.elapsed >= INVADER_WARNING_TWO && !this.invaderSpawned) {
        this.invaderWarningTwoShown = true;
        this.setPriorityMessage("The rift is destabilizing. End-game threat arrival is imminent.", 6);
      }
      if (!this.invaderSpawned && !this.invaderDefeated && this.elapsed >= INVADER_SPAWN_SECONDS) {
        this.spawnInvader();
      }
    }

    spawnInvader() {
      if (this.invaderSpawned || this.invaderDefeated) return;
      const snapshot = this.universeStrengthSnapshot();
      const scaled = Math.max(360, snapshot.highestFactionShips * 0.85, snapshot.totalFactionShips * 0.28)
        + snapshot.upgradedWorlds * 20
        + Math.max(0, snapshot.activeFactions - 2) * 35;
      const startingShips = Phaser.Math.Clamp(Math.round(scaled), 360, 900);
      this.invaderScale = startingShips;
      this.invaderSpawned = true;
      if (!this.factions.some((faction) => faction.id === INVADER)) {
        this.factions.push({ ...INVADER_FACTION, isHuman: false });
      }
      this.ensureFactionStats(INVADER);
      this.addTroopsCreated(INVADER, startingShips);
      this.factionPressure[INVADER] = 0;
      this.warSurges[INVADER] = 0;
      this.aiClocks[INVADER] = 0;
      this.worlds.push({ ...INVADER_WORLD, owner: INVADER, ships: startingShips, level: 4 });
      this.lanes = uniqLanes(this.lanes.concat(INVADER_LANES));
      this.mapRevision++;
      this.setPriorityMessage(`The Void Ascendancy tears into the galaxy with ${startingShips} Tier IV ships.`, 7);
    }

    universeStrengthSnapshot() {
      const totals = {};
      let totalFactionShips = 0;
      let upgradedWorlds = 0;
      for (const world of this.worlds) {
        if (world.owner === NEUTRAL || this.isInvader(world.owner)) continue;
        totals[world.owner] = (totals[world.owner] || 0) + world.ships;
        totalFactionShips += world.ships;
        if (this.worldTier(world) > 1) upgradedWorlds++;
      }
      const values = Object.values(totals);
      return {
        totalFactionShips,
        highestFactionShips: values.length ? Math.max(...values) : 0,
        upgradedWorlds,
        activeFactions: values.length
      };
    }

    updateEconomy(deltaSeconds) {
      this.economyClock += deltaSeconds;
      while (this.economyClock >= ECONOMY_INTERVAL) {
        this.economyClock -= ECONOMY_INTERVAL;
        for (const world of this.worlds) {
          if (world.owner !== NEUTRAL) {
            const created = this.generationFor(world);
            world.ships += created;
            this.addTroopsCreated(world.owner, created);
          }
        }
      }
    }

    generationFor(world) {
      const sectorBonus = this.getSectorOwnerById(world.sectorId) === world.owner ? SECTOR_BONUS : 0;
      const surgeBonus = world.owner !== NEUTRAL && (this.warSurges[world.owner] || 0) > 0 ? WAR_SURGE_PRODUCTION_BONUS : 0;
      const invaderBonus = this.isInvader(world.owner) ? Math.min(3, Math.floor(Math.max(0, this.elapsed - INVADER_SPAWN_SECONDS) / 120)) : 0;
      return world.generationRate + sectorBonus + surgeBonus + this.levelProductionBonus(world) + invaderBonus;
    }

    levelProductionBonus(world) {
      return Math.max(0, this.worldTier(world) - 1);
    }

    worldTier(world) {
      return Phaser.Math.Clamp(world?.level || 1, 1, 4);
    }

    nextUpgradeFor(world) {
      if (this.isInvader(world?.owner)) return null;
      const nextLevel = this.worldTier(world) + 1;
      return PLANET_UPGRADES[nextLevel] ? { level: nextLevel, ...PLANET_UPGRADES[nextLevel] } : null;
    }

    canUpgradeWorld(world, owner = world?.owner) {
      const upgrade = this.nextUpgradeFor(world);
      if (!world || !upgrade || world.owner !== owner || owner === NEUTRAL) return false;
      return world.ships >= upgrade.threshold && world.ships - upgrade.cost >= this.reserveFor(world, owner);
    }

    tryUpgradeWorld(world, owner = world?.owner) {
      if (!this.canUpgradeWorld(world, owner)) return false;
      const upgrade = this.nextUpgradeFor(world);
      world.ships -= upgrade.cost;
      world.level = upgrade.level;
      this.ensureFactionStats(owner).planetsUpgraded++;
      this.message = `${world.name} upgraded to Level ${world.level}. It now launches Tier ${TIER_ROMAN[world.level]} fleets.`;
      return true;
    }

    selectionMessage(world) {
      const upgrade = this.nextUpgradeFor(world);
      const tier = TIER_ROMAN[this.worldTier(world)];
      if (!upgrade) return `${world.name} selected. Level ${world.level} / Tier ${tier}. Choose a connected world to send half its ships.`;
      if (this.canUpgradeWorld(world, world.owner)) {
        return `${world.name} selected. Level ${world.level} / Tier ${tier}. Click it again to spend ${upgrade.cost} ships and upgrade.`;
      }
      return `${world.name} selected. Level ${world.level} / Tier ${tier}. Upgrade at ${upgrade.threshold} ships, spending ${upgrade.cost}.`;
    }

    updateFleets(deltaSeconds) {
      for (const fleet of this.fleets) {
        if (fleet.holdTime > 0) {
          fleet.holdTime = Math.max(0, fleet.holdTime - deltaSeconds);
        } else {
          fleet.progress += deltaSeconds / fleet.duration;
        }
      }

      const arrived = this.fleets.filter((fleet) => fleet.progress >= 1);
      this.fleets = this.fleets.filter((fleet) => fleet.progress < 1);
      for (const fleet of arrived) {
        this.resolveArrival(fleet);
        if (this.status !== "playing") return;
      }
    }

    resolveHyperspaceInterceptions() {
      const removed = new Set();
      const additions = [];

      for (let i = 0; i < this.fleets.length; i++) {
        const first = this.fleets[i];
        if (removed.has(first.id)) continue;

        for (let j = i + 1; j < this.fleets.length; j++) {
          const second = this.fleets[j];
          if (removed.has(second.id)) continue;
          if (!this.areOpposingFleetsOnSameLane(first, second)) continue;

          const firstLaneProgress = first.progress;
          const secondLaneProgressFromFirstSide = 1 - second.progress;
          if (firstLaneProgress + 0.015 < secondLaneProgressFromFirstSide) continue;

          const contact = Phaser.Math.Clamp((firstLaneProgress + secondLaneProgressFromFirstSide) / 2, 0, 1);
          removed.add(first.id);
          removed.add(second.id);

          const outcome = this.resolveFleetClash(first, second);
          if (outcome.winner === first) {
            this.addCombatLoss(first.owner, first.ships - outcome.ships, second.owner);
            this.addCombatLoss(second.owner, second.ships, first.owner);
            additions.push({ ...first, id: `fleet-${this.nextFleetId++}`, ships: outcome.ships, progress: contact, holdTime: 1.15 });
            this.message = `${nameFor(first.owner, this.factions)} Tier ${TIER_ROMAN[first.tier || 1]} fleet intercepted ${nameFor(second.owner, this.factions)}${outcome.decisive ? " with a decisive strike" : ""}.`;
          } else if (outcome.winner === second) {
            this.addCombatLoss(second.owner, second.ships - outcome.ships, first.owner);
            this.addCombatLoss(first.owner, first.ships, second.owner);
            additions.push({ ...second, id: `fleet-${this.nextFleetId++}`, ships: outcome.ships, progress: 1 - contact, holdTime: 1.15 });
            this.message = `${nameFor(second.owner, this.factions)} Tier ${TIER_ROMAN[second.tier || 1]} fleet intercepted ${nameFor(first.owner, this.factions)}${outcome.decisive ? " with a decisive strike" : ""}.`;
          } else {
            this.addCombatLoss(first.owner, first.ships, second.owner);
            this.addCombatLoss(second.owner, second.ships, first.owner);
            this.message = "Two fleets collided in hyperspace and vanished from sensors.";
          }

          break;
        }
      }

      if (removed.size > 0) this.fleets = this.fleets.filter((fleet) => !removed.has(fleet.id)).concat(additions);
    }

    areOpposingFleetsOnSameLane(first, second) {
      return first.owner !== second.owner && first.from === second.to && first.to === second.from;
    }

    resolveFleetClash(first, second) {
      const firstPower = this.fleetPower(first);
      const secondPower = this.fleetPower(second);
      const decisive = this.isDecisiveStrike(firstPower, secondPower);
      const adjustedFirst = firstPower * (decisive === "attack" ? 1.08 : 1);
      const adjustedSecond = secondPower * (decisive === "defense" ? 1.08 : 1);
      const gap = Math.abs(adjustedFirst - adjustedSecond);
      const winner = adjustedFirst > adjustedSecond ? first : adjustedSecond > adjustedFirst ? second : null;
      if (!winner || gap < 1.2) return { winner: null, ships: 0, decisive: false };
      const winnerPower = winner === first ? adjustedFirst : adjustedSecond;
      const loserPower = winner === first ? adjustedSecond : adjustedFirst;
      const survivalBoost = (winner.tier || 1) === 3 ? 1.08 : 1;
      const ships = Math.max(1, Math.floor(winner.ships * Phaser.Math.Clamp((winnerPower - loserPower) / winnerPower, 0.12, 0.85) * survivalBoost));
      return { winner, ships, decisive: !!decisive };
    }

    resolveWorldBattle(fleet, target) {
      const attackPower = this.fleetPower(fleet);
      const defensePower = this.worldDefensePower(target);
      const decisive = this.isDecisiveStrike(attackPower, defensePower);
      const adjustedAttack = attackPower * (decisive === "attack" ? 1.08 : 1);
      const adjustedDefense = defensePower * (decisive === "defense" ? 1.08 : 1);
      const attackerWon = adjustedAttack > adjustedDefense;
      const winnerPower = attackerWon ? adjustedAttack : adjustedDefense;
      const loserPower = attackerWon ? adjustedDefense : adjustedAttack;
      const remainingRatio = Phaser.Math.Clamp((winnerPower - loserPower) / winnerPower, 0.08, 0.9);
      const tierSurvival = attackerWon && (fleet.tier || 1) === 3 ? 1.08 : 1;
      const remainingShips = Math.max(attackerWon ? 1 : 0, Math.floor((attackerWon ? fleet.ships : target.ships) * remainingRatio * tierSurvival));
      const tierText = `Tier ${TIER_ROMAN[fleet.tier || 1]}`;
      const defenseText = target.kind === "fortress" || target.isCapital ? " fortified defenses" : " defenses";
      const decisiveText = decisive ? " A decisive strike shifted the battle." : "";
      const attackerLosses = attackerWon ? Math.max(0, fleet.ships - remainingShips) : fleet.ships;
      const defenderLosses = attackerWon ? target.ships : Math.max(0, target.ships - remainingShips);
      const message = attackerWon
        ? `${tierText} fleet overran ${target.name}${defenseText}.${decisiveText}`
        : `${target.name}${defenseText} held against a ${tierText} assault.${decisiveText}`;
      return { attackerWon, remainingShips, message, attackerLosses, defenderLosses };
    }

    fleetPower(fleet) {
      return fleet.ships * (TIER_POWER[fleet.tier || 1] || 1) * (fleet.attackMod || 1) * this.combatVariance();
    }

    worldDefensePower(world) {
      return world.ships * (TIER_POWER[this.worldTier(world)] || 1) * this.worldDefenseModifier(world) * this.combatVariance();
    }

    outgoingFleetModifier(world) {
      if (world.kind === "shipyard") return 1.05;
      if (world.kind === "gate") return 1.03;
      return 1;
    }

    worldDefenseModifier(world) {
      let modifier = 1;
      if (world.kind === "fortress") modifier += 0.16;
      if (world.isCapital) modifier += 0.12;
      if (world.kind === "station") modifier += 0.05;
      return modifier;
    }

    combatVariance() {
      return Phaser.Math.FloatBetween(0.9, 1.12);
    }

    isDecisiveStrike(firstPower, secondPower) {
      const larger = Math.max(firstPower, secondPower);
      const smaller = Math.min(firstPower, secondPower);
      if (larger <= 0 || smaller / larger < 0.78 || Math.random() > 0.08) return null;
      return firstPower >= secondPower ? "attack" : "defense";
    }

    resolveArrival(fleet) {
      const target = this.getWorld(fleet.to);
      if (!target) return;

      if (target.owner === fleet.owner) {
        target.ships += fleet.ships;
        return;
      }

      const battle = this.resolveWorldBattle(fleet, target);
      const defenderOwner = target.owner;
      this.addCombatLoss(fleet.owner, battle.attackerLosses, defenderOwner);
      this.addCombatLoss(defenderOwner, battle.defenderLosses, fleet.owner);
      if (battle.attackerWon) {
        const previousOwner = target.owner;
        target.owner = fleet.owner;
        target.ships = battle.remainingShips;
        target.level = this.captureLevelFor(target, fleet);
        this.addCapture(fleet.owner);
        this.markFactionProgress(fleet.owner, target);
        this.rewardCapitalCapture(target, previousOwner);
        this.message = battle.message;
        if (target.isInvaderOrigin && previousOwner === INVADER && !this.isInvader(fleet.owner)) {
          this.defeatInvader(fleet.owner, target);
        }
        this.handleCapture(target, previousOwner);
        this.checkSectorChanges();
        return;
      }

      target.ships = battle.remainingShips;
      if (target.ships === 0) {
        const previousOwner = target.owner;
        target.owner = NEUTRAL;
        target.level = 1;
        this.message = battle.message;
        this.handleCapture(target, previousOwner);
        this.checkSectorChanges();
      } else {
        this.message = battle.message;
      }
    }

    captureLevelFor(target, fleet) {
      if (this.isInvader(fleet.owner)) return 4;
      if (target.level >= 4) return 3;
      return Math.max(1, Math.min(this.worldTier(target), fleet.tier || 1, 3));
    }

    markFactionProgress(owner, world) {
      this.factionPressure[owner] = 0;
      const plan = this.aiPlans[owner];
      if (plan) plan.lastProgressAt = this.elapsed;
      if (world.isCapital) this.lastCapitalCaptureAt = this.elapsed;
    }

    rewardCapitalCapture(world, previousOwner) {
      if (!world.isCapital || previousOwner === NEUTRAL || world.owner === NEUTRAL) return;
      world.ships += CAPITAL_CAPTURE_REWARD;
      this.addTroopsCreated(world.owner, CAPITAL_CAPTURE_REWARD);
      for (const ownedWorld of this.worlds) {
        if (ownedWorld.owner !== world.owner || ownedWorld.id === world.id) continue;
        const reward = CAPITAL_CAPTURE_WORLD_REWARD + (ownedWorld.kind === "shipyard" ? 2 : 0);
        ownedWorld.ships += reward;
        this.addTroopsCreated(ownedWorld.owner, reward);
      }
      this.warSurges[world.owner] = WAR_SURGE_SECONDS;
      this.factionPressure[world.owner] = 0;
      this.lastCapitalCaptureAt = this.elapsed;
      delete this.aiPlans[world.owner];
      delete this.aiPlans[previousOwner];
    }

    defeatInvader(capturingOwner, originWorld) {
      if (this.invaderDefeated) return;
      this.invaderDefeated = true;
      this.invaderSpawned = false;
      originWorld.owner = capturingOwner;
      originWorld.level = 3;
      const originReward = Math.max(0, 120 - originWorld.ships);
      originWorld.ships = Math.max(originWorld.ships, 120);
      this.addTroopsCreated(capturingOwner, originReward);
      for (const world of this.worlds) {
        if (world.owner === INVADER && world.id !== originWorld.id) {
          world.owner = NEUTRAL;
          world.level = 1;
          world.ships = Math.max(18, Math.floor(world.ships * 0.35));
        } else if (world.owner === capturingOwner) {
          const reward = 25 + (world.kind === "shipyard" ? 10 : 0);
          world.ships += reward;
          this.addTroopsCreated(capturingOwner, reward);
        }
      }
      this.fleets = this.fleets.filter((fleet) => !this.isInvader(fleet.owner));
      this.warSurges[capturingOwner] = Math.max(this.warSurges[capturingOwner] || 0, INVADER_REWARD_SURGE_SECONDS);
      delete this.aiPlans[INVADER];
      for (const faction of this.factions) delete this.aiPlans[faction.id];
      this.setPriorityMessage(`${nameFor(capturingOwner, this.factions)} shattered The Rift Crown. Void spoils trigger a massive war surge.`, 8);
    }

    handleCapture(world, previousOwner) {
      if (world.isInvaderOrigin) return;
      if (!world.isCapital) {
        if (this.isHuman(world.owner)) this.message = `${world.name} secured. The Alliance expands.`;
        return;
      }

      if (this.settings.spectatorMode) {
        this.message = `${world.name} has fallen to ${nameFor(world.owner, this.factions)}. War surge active: reserves and production spike across their worlds.`;
        this.checkSpectatorWinner();
        return;
      }

      const human = this.humanFaction();
      if (human && previousOwner !== human.id && world.owner === human.id) {
        const rivalCapitals = this.worlds.filter((candidate) => candidate.isCapital && candidate.owner !== human.id && candidate.owner !== NEUTRAL);
        if (rivalCapitals.length === 0) {
          this.status = "humanWon";
          this.message = "Victory. Every rival command world answers to the Alliance.";
          return;
        }

        this.message = `${world.name} captured. War surge active: Alliance reserves and production spike. ${rivalCapitals.length} rival command world${rivalCapitals.length === 1 ? "" : "s"} remain.`;
        return;
      }

      if (human && previousOwner === human.id && world.owner !== human.id) {
        this.status = "humanLost";
        this.message = "Defeat. Liberty Prime has fallen.";
      }
    }

    checkSpectatorWinner() {
      const capitalOwners = new Set(this.worlds.filter((world) => world.isCapital && world.owner !== NEUTRAL).map((world) => world.owner));
      if (capitalOwners.size === 1) {
        const [winner] = [...capitalOwners];
        this.status = "spectatorEnded";
        this.message = `${nameFor(winner, this.factions)} controls the last command world.`;
      }
    }

    checkSectorChanges() {
      const nextOwners = this.captureSectorOwners();
      for (const sector of this.sectors) {
        const before = this.sectorOwners[sector.id] || NEUTRAL;
        const after = nextOwners[sector.id] || NEUTRAL;
        if (before === after) continue;
        if (after !== NEUTRAL) {
          this.message = `${nameFor(after, this.factions)} controls ${sector.name}. Sector production boosted.`;
        } else if (before !== NEUTRAL) {
          this.message = `${sector.name} is contested. Sector production bonus lost.`;
        }
      }
      this.sectorOwners = nextOwners;
    }

    captureSectorOwners() {
      const owners = {};
      for (const sector of this.sectors) owners[sector.id] = this.getSectorOwner(sector) || NEUTRAL;
      return owners;
    }

    getSectorOwner(sector) {
      const worlds = sector.worldIds.map((id) => this.getWorld(id)).filter(Boolean);
      if (worlds.length === 0) return null;
      const owner = worlds[0].owner;
      if (owner === NEUTRAL) return null;
      return worlds.every((world) => world.owner === owner) ? owner : null;
    }

    getSectorOwnerById(sectorId) {
      const sector = this.sectors.find((candidate) => candidate.id === sectorId);
      return sector ? this.getSectorOwner(sector) : null;
    }

    getSectorMajorityOwner(sector) {
      const counts = {};
      for (const worldId of sector.worldIds) {
        const owner = this.getWorld(worldId)?.owner;
        if (!owner || owner === NEUTRAL) continue;
        counts[owner] = (counts[owner] || 0) + 1;
      }
      const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (entries.length === 0 || (entries[1] && entries[0][1] === entries[1][1])) return null;
      return entries[0][0];
    }

    ownedSectorsFor(owner) {
      return this.sectors.filter((sector) => this.getSectorOwner(sector) === owner);
    }

    updateAi(deltaSeconds) {
      for (const faction of this.aiFactions()) {
        if (this.isInvader(faction.id)) continue;
        this.aiClocks[faction.id] = (this.aiClocks[faction.id] || 0) + deltaSeconds;
        if (this.aiClocks[faction.id] < AI_INTERVAL) continue;
        this.aiClocks[faction.id] = 0;
        const plan = this.ensureAiPlan(faction.id);
        this.tryAiUpgrade(faction.id, plan);
        const maxLaunches = this.maxAiLaunchesFor(faction.id, plan);
        let launches = 0;
        let assaultTargetId = null;

        const aiWorlds = this.worlds
          .filter((world) => world.owner === faction.id && this.canSpareFleet(world, faction.id))
          .sort((a, b) => this.sourcePriority(b, faction.id, plan) - this.sourcePriority(a, faction.id, plan));

        for (const source of aiWorlds) {
          let target = this.chooseAiTarget(source, faction.id, plan, assaultTargetId);
          if (assaultTargetId) {
            const sharedTarget = this.getWorld(assaultTargetId);
            if (sharedTarget && this.areConnected(source.id, sharedTarget.id) && this.shouldAiJoinAssault(source, sharedTarget, faction.id, plan)) {
              target = sharedTarget;
            }
          }
          if (!target || !this.sendFleet(source.id, target.id, faction.id)) continue;
          launches++;
          if (target.owner !== faction.id) assaultTargetId = target.id;
          if (launches >= maxLaunches) break;
        }
      }
    }

    updateInvaderAi(deltaSeconds) {
      if (!this.invaderSpawned || this.invaderDefeated) return;
      this.invaderClock += deltaSeconds;
      const interval = Math.max(1.3, 2.55 - Math.min(0.75, Math.max(0, this.elapsed - INVADER_SPAWN_SECONDS) / 240));
      if (this.invaderClock < interval) return;
      this.invaderClock = 0;

      const sources = this.worlds
        .filter((world) => world.owner === INVADER && world.ships >= MIN_ATTACKING_SHIPS)
        .sort((a, b) => b.ships - a.ships);
      for (const source of sources) {
        if (source.ships < 180 && source.isInvaderOrigin) continue;
        const target = this.chooseInvaderTarget(source);
        if (target && this.sendFleet(source.id, target.id, INVADER)) return;
      }
    }

    chooseInvaderTarget(source) {
      return this.getNeighbors(source.id)
        .map((id) => this.getWorld(id))
        .filter((world) => world && world.owner !== INVADER)
        .sort((a, b) => this.invaderTargetScore(b, source) - this.invaderTargetScore(a, source))[0] || null;
    }

    invaderTargetScore(world, source) {
      let score = world.generationRate * 9 + world.ships * 0.08;
      if (world.isCapital) score += 150;
      if (world.level > 1) score += world.level * 20;
      if (world.kind === "shipyard" || world.kind === "gate") score += 34;
      if (world.owner !== NEUTRAL) score += 35;
      const nearestCapital = this.worlds
        .filter((candidate) => candidate.isCapital && candidate.owner !== INVADER && candidate.owner !== NEUTRAL)
        .map((capital) => this.graphDistance(world.id, capital.id))
        .sort((a, b) => a - b)[0];
      if (Number.isFinite(nearestCapital)) score += Math.max(0, 8 - nearestCapital) * 18;
      score += Math.max(0, 5 - this.graphDistance(source.id, world.id)) * 5;
      return score;
    }

    maxAiLaunchesFor(owner, plan) {
      if ((this.warSurges[owner] || 0) > 0) return 3;
      if (plan?.warPosture === "assault") return 3;
      if ((this.factionPressure[owner] || 0) > FACTION_STALEMATE_SECONDS) return 2;
      return 2;
    }

    tryAiUpgrade(owner, plan) {
      const candidates = this.worlds
        .filter((world) => world.owner === owner && this.canUpgradeWorld(world, owner))
        .filter((world) => this.shouldAiUpgradeWorld(world, owner, plan))
        .sort((a, b) => this.upgradePriority(b, owner, plan) - this.upgradePriority(a, owner, plan));
      const target = candidates[0];
      return target ? this.tryUpgradeWorld(target, owner) : false;
    }

    shouldAiUpgradeWorld(world, owner, plan) {
      const upgrade = this.nextUpgradeFor(world);
      if (!upgrade) return false;
      const useful = world.isCapital || world.kind === "shipyard" || plan?.stagingWorldIds?.includes(world.id) || this.frontlineScore(world, owner) > 8;
      if (!useful) return false;
      const afterSpend = world.ships - upgrade.cost;
      if (afterSpend < this.reserveFor(world, owner) + 18) return false;
      if (plan?.warPosture === "assault" && this.frontlineScore(world, owner) > 18 && afterSpend < 90) return false;
      return true;
    }

    upgradePriority(world, owner, plan) {
      let score = this.generationFor(world) * 8 + world.ships * 0.2;
      if (world.isCapital) score += 24;
      if (world.kind === "shipyard") score += 22;
      if (plan?.stagingWorldIds?.includes(world.id)) score += 28;
      if (this.frontlineScore(world, owner) > 8) score += 12;
      score += this.planMoveScore(world, world, owner, plan) * 0.4;
      return score;
    }

    chooseAiTarget(source, owner, plan, assaultTargetId = null) {
      const neighbors = this.getNeighbors(source.id).map((id) => this.getWorld(id)).filter(Boolean);
      const sharedTarget = assaultTargetId ? this.getWorld(assaultTargetId) : null;
      if (sharedTarget && this.areConnected(source.id, sharedTarget.id) && this.shouldAiJoinAssault(source, sharedTarget, owner, plan)) {
        return sharedTarget;
      }

      const attackTarget = neighbors
        .filter((world) => world.owner !== owner && this.shouldAiAttack(source, world, owner, plan))
        .sort((a, b) => this.aiTargetScore(b, owner, source, plan) - this.aiTargetScore(a, owner, source, plan))[0];
      if (attackTarget) return attackTarget;

      if ((this.factionPressure[owner] || 0) > 24 || source.ships >= 58 || plan?.warPosture !== "normal") {
        const raid = neighbors
          .filter((world) => world.owner !== owner && this.aiTargetScore(world, owner, source, plan) > 12)
          .sort((a, b) => this.aiTargetScore(b, owner, source, plan) - this.aiTargetScore(a, owner, source, plan))[0];
        if (raid) return raid;
      }

      return neighbors
        .filter((world) => world.owner === owner && this.shouldAiReinforce(source, world, owner, plan))
        .sort((a, b) => this.reinforcementScore(b, source, owner, plan) - this.reinforcementScore(a, source, owner, plan))[0] || null;
    }

    shouldAiJoinAssault(source, target, owner, plan) {
      if (!target || target.owner === owner || !this.canSpareFleet(source, owner)) return false;
      if (this.routeCooldowns[this.routeKey(source.id, target.id, owner)]) return false;
      const score = this.aiTargetScore(target, owner, source, plan);
      const attackShips = this.estimatedAttackPower(source) + this.incomingPower(target.id, owner);
      const defense = this.projectedDefense(target);
      return score > 10 && attackShips >= defense * 0.48;
    }

    aiTargetScore(world, owner, source, plan) {
      const personality = this.personalityFor(owner);
      let score = world.generationRate * 4 - world.ships;
      const sector = this.sectors.find((candidate) => candidate.id === world.sectorId);
      const sectorWorlds = sector ? sector.worldIds.map((id) => this.getWorld(id)).filter(Boolean) : [];
      const ownedInSector = sectorWorlds.filter((candidate) => candidate.owner === owner).length;
      const enemyHeldSector = sector ? this.getSectorOwner(sector) : null;
      const activeCapitals = this.worlds.filter((candidate) => candidate.isCapital && candidate.owner !== NEUTRAL).length;
      const attackShips = this.estimatedAttackPower(source) + this.incomingPower(world.id, owner);
      const defense = this.projectedDefense(world);

      if (this.isInvader(world.owner)) score += 115;
      if (world.owner === NEUTRAL) score += (activeCapitals > 3 ? 2 : 9) * personality.expansion;
      if (world.owner !== NEUTRAL && world.owner !== owner) score += 18 * personality.aggression;
      if (world.isCapital && world.owner !== owner) score += 72 * personality.capitalFocus;
      if (sector && world.owner !== owner && ownedInSector >= sector.worldIds.length - 1) score += 44 * personality.sectorFocus;
      if (enemyHeldSector && enemyHeldSector !== owner) score += 28 * personality.aggression;
      if (plan?.targetCapitalId && world.id === plan.targetCapitalId) score += 70 * personality.capitalFocus;
      if (plan?.targetSectorId && world.sectorId === plan.targetSectorId && world.owner !== owner) score += 30 * personality.sectorFocus;
      if (plan?.warPosture === "assault") score += world.owner === owner ? 0 : 16;
      if (plan?.warPosture === "surge") score += world.owner === owner ? 0 : 26;
      score += (this.worldTier(source) - 1) * 12;
      score -= (this.worldTier(world) - 1) * 10;
      if (this.isHuman(world.owner)) score += 12;
      if (source && source.ships >= 64) score += 18;
      if (plan) score += this.planMoveScore(source, world, owner, plan);
      score += Math.min(26, attackShips - defense);
      score += Math.min(28, (this.factionPressure[owner] || 0) * 0.75);
      return score;
    }

    frontlineScore(world, owner) {
      const hostileNeighbors = this.getNeighbors(world.id).map((id) => this.getWorld(id)).filter((candidate) => candidate && candidate.owner !== owner).length;
      return hostileNeighbors * 18 + this.generationFor(world) * 3 - world.ships;
    }

    reinforcementScore(world, source, owner, plan) {
      const stagingBonus = plan?.stagingWorldIds?.includes(world.id) ? 22 : 0;
      const capitalBonus = world.isCapital ? 18 : 0;
      return this.frontlineScore(world, owner) + this.planMoveScore(source, world, owner, plan) + stagingBonus + capitalBonus - this.incomingShips(world.id, owner) * 0.8;
    }

    shouldAiAttack(source, target, owner, plan) {
      const personality = this.personalityFor(owner);
      const attackShips = this.estimatedAttackPower(source) + this.incomingPower(target.id, owner);
      const defense = this.projectedDefense(target);
      const pressure = this.factionPressure[owner] || 0;
      const planGain = this.planMoveScore(source, target, owner, plan);
      const strategicPush = this.isInvader(target.owner) || target.isCapital || planGain >= 18 || target.id === plan?.targetCapitalId || target.sectorId === plan?.targetSectorId;
      let requiredRatio = target.owner === NEUTRAL ? 0.72 : 0.92;
      requiredRatio -= Math.min(0.28, pressure / 170);
      requiredRatio -= (personality.risk - 1) * 0.18;
      if (strategicPush) requiredRatio -= 0.18;
      if (plan?.warPosture === "assault") requiredRatio -= 0.16;
      if (plan?.warPosture === "surge") requiredRatio -= 0.24;
      if (this.isInvader(target.owner)) requiredRatio -= 0.22;
      if (this.capitalStalematePressure() > 0) requiredRatio -= 0.12;
      if (source.ships >= 58) requiredRatio -= 0.1;
      requiredRatio = Math.max(target.owner === NEUTRAL ? 0.42 : 0.52, requiredRatio);
      return attackShips >= Math.max(MIN_ATTACKING_SHIPS, defense * requiredRatio);
    }

    shouldAiReinforce(source, target, owner, plan) {
      if (!this.canSpareFleet(source, owner)) return false;
      if (this.routeCooldowns[this.routeKey(source.id, target.id, owner)]) return false;
      const sourceFront = this.frontlineScore(source, owner);
      const targetFront = this.frontlineScore(target, owner);
      const planGain = this.planMoveScore(source, target, owner, plan);
      const usefulTarget = target.isCapital || targetFront > 8 || plan?.stagingWorldIds?.includes(target.id);
      if (!usefulTarget) return false;
      if (planGain < 0 && !target.isCapital && targetFront < 20) return false;
      if (target.ships + this.incomingShips(target.id, owner) >= source.ships - 10) return false;
      if (targetFront <= sourceFront + 6 && planGain < 12 && !plan?.stagingWorldIds?.includes(target.id)) return false;
      return true;
    }

    canSpareFleet(world, owner) {
      const ships = Math.floor(world.ships / 2);
      if (ships < MIN_ATTACKING_SHIPS) return false;
      return world.ships - ships >= this.reserveFor(world, owner);
    }

    reserveFor(world, owner) {
      if (world.isCapital) return (this.warSurges[owner] || 0) > 0 ? 24 : 28;
      if (this.frontlineScore(world, owner) > 20) return 12;
      return 7;
    }

    sourcePriority(world, owner, plan) {
      const distance = plan ? this.distanceToPlan(world.id, plan) : 0;
      const stagingBonus = plan?.stagingWorldIds?.includes(world.id) ? 24 : 0;
      const surgeBonus = (this.warSurges[owner] || 0) > 0 ? 16 : 0;
      return world.ships + Math.max(0, 8 - distance) * 5 + this.frontlineScore(world, owner) * 0.35 + stagingBonus + surgeBonus;
    }

    projectedDefense(world) {
      return this.estimatedDefensePower(world) + this.incomingPower(world.id, world.owner);
    }

    incomingShips(worldId, owner) {
      return this.fleets
        .filter((fleet) => fleet.to === worldId && fleet.owner === owner)
        .reduce((sum, fleet) => sum + fleet.ships, 0);
    }

    incomingPower(worldId, owner) {
      return this.fleets
        .filter((fleet) => fleet.to === worldId && fleet.owner === owner)
        .reduce((sum, fleet) => sum + this.estimatedFleetPower(fleet), 0);
    }

    estimatedAttackPower(source) {
      const ships = this.launchShipsFor(source, source.owner);
      return ships * (TIER_POWER[this.worldTier(source)] || 1) * this.outgoingFleetModifier(source);
    }

    estimatedFleetPower(fleet) {
      return fleet.ships * (TIER_POWER[fleet.tier || 1] || 1) * (fleet.attackMod || 1);
    }

    estimatedDefensePower(world) {
      return world.ships * (TIER_POWER[this.worldTier(world)] || 1) * this.worldDefenseModifier(world);
    }

    ensureAiPlan(owner) {
      const plan = this.aiPlans[owner];
      if (plan && plan.expiresAt > this.elapsed && this.isPlanStillUseful(owner, plan)) {
        return this.refreshAiPlan(owner, plan);
      }
      const nextPlan = this.createAiPlan(owner);
      this.aiPlans[owner] = nextPlan;
      return nextPlan;
    }

    refreshAiPlan(owner, plan) {
      plan.targetSectorId = this.targetSectorForPlan(owner, plan);
      plan.stagingWorldIds = this.stagingWorldsFor(owner, plan);
      plan.warPosture = this.warPostureFor(owner, plan);
      if (typeof plan.lastProgressAt !== "number") plan.lastProgressAt = this.elapsed;
      return plan;
    }

    createAiPlan(owner) {
      const personality = this.personalityFor(owner);
      const capitalOptions = [];
      const options = [];
      if (!this.isInvader(owner)) {
        for (const world of this.worlds) {
          if (!this.isInvader(world.owner)) continue;
          const distance = this.nearestOwnedDistance(owner, world.id);
          if (!Number.isFinite(distance)) continue;
          capitalOptions.push({
            type: "capital",
            targetId: world.id,
            targetCapitalId: world.id,
            score: 180 - distance * 7 - world.ships * 0.08
          });
        }
      }
      for (const world of this.worlds) {
        if (!world.isCapital || world.owner === owner || world.owner === NEUTRAL) continue;
        const distance = this.nearestOwnedDistance(owner, world.id);
        if (!Number.isFinite(distance)) continue;
        capitalOptions.push({
          type: "capital",
          targetId: world.id,
          targetCapitalId: world.id,
          score: 120 * personality.capitalFocus - distance * 9 - world.ships + (this.isHuman(world.owner) ? 20 : 0)
        });
      }

      const bestCapital = capitalOptions.sort((a, b) => b.score - a.score)[0];
      if (bestCapital) {
        return this.refreshAiPlan(owner, {
          ...bestCapital,
          expiresAt: this.elapsed + AI_PLAN_SECONDS + Math.random() * 14,
          lastProgressAt: this.elapsed
        });
      }

      for (const sector of this.sectors) {
        if (this.getSectorOwner(sector) === owner) continue;
        const sectorWorlds = sector.worldIds.map((id) => this.getWorld(id)).filter(Boolean);
        const owned = sectorWorlds.filter((world) => world.owner === owner).length;
        const hostile = sectorWorlds.filter((world) => world.owner !== owner && world.owner !== NEUTRAL).length;
        const neutral = sectorWorlds.filter((world) => world.owner === NEUTRAL).length;
        const distance = Math.min(...sectorWorlds.map((world) => this.nearestOwnedDistance(owner, world.id)));
        if (!Number.isFinite(distance)) continue;
        options.push({
          type: "sector",
          sectorId: sector.id,
          targetSectorId: sector.id,
          score: 34 * personality.sectorFocus + owned * 16 + neutral * personality.expansion * 5 + hostile * personality.aggression * 8 - distance * 5
        });
      }

      const fallback = { type: "map", expiresAt: this.elapsed + AI_PLAN_SECONDS };
      const best = options.sort((a, b) => b.score - a.score)[0] || fallback;
      return this.refreshAiPlan(owner, {
        ...best,
        expiresAt: this.elapsed + AI_PLAN_SECONDS + Math.random() * 14,
        lastProgressAt: this.elapsed
      });
    }

    isPlanStillUseful(owner, plan) {
      if (plan.type === "capital") {
        const target = this.getWorld(plan.targetId);
        return !!target && target.owner !== owner && (target.owner !== NEUTRAL || target.isInvaderOrigin);
      }
      if (plan.type === "sector") {
        const sector = this.sectors.find((candidate) => candidate.id === plan.sectorId);
        return !!sector && this.getSectorOwner(sector) !== owner;
      }
      return this.worlds.some((world) => world.owner !== owner);
    }

    targetSectorForPlan(owner, plan) {
      if (plan.type === "sector") return plan.sectorId;
      if (plan.type === "capital" && plan.targetCapitalId) {
        const route = this.shortestOwnedRoute(owner, plan.targetCapitalId);
        const nextTarget = route
          .map((id) => this.getWorld(id))
          .find((world) => world && world.owner !== owner);
        if (nextTarget) return nextTarget.sectorId;
      }

      const contested = this.sectors
        .filter((sector) => this.getSectorOwner(sector) !== owner)
        .map((sector) => {
          const sectorWorlds = sector.worldIds.map((id) => this.getWorld(id)).filter(Boolean);
          const owned = sectorWorlds.filter((world) => world.owner === owner).length;
          const distance = Math.min(...sectorWorlds.map((world) => this.nearestOwnedDistance(owner, world.id)));
          return { sector, score: owned * 12 - distance * 4 };
        })
        .sort((a, b) => b.score - a.score)[0];
      return contested?.sector.id || null;
    }

    stagingWorldsFor(owner, plan) {
      return this.worlds
        .filter((world) => world.owner === owner)
        .filter((world) => {
          const distance = this.distanceToPlan(world.id, plan);
          return distance <= 3 || this.frontlineScore(world, owner) > 4 || world.isCapital;
        })
        .sort((a, b) => this.sourcePriorityRaw(b, owner, plan) - this.sourcePriorityRaw(a, owner, plan))
        .slice(0, 8)
        .map((world) => world.id);
    }

    warPostureFor(owner, plan) {
      if ((this.warSurges[owner] || 0) > 0) return "surge";
      if ((this.factionPressure[owner] || 0) > FACTION_STALEMATE_SECONDS) return "assault";
      if (this.capitalStalematePressure() > 0) return "assault";
      if (this.isFactionBoxedIn(owner)) return "assault";
      if (plan?.targetCapitalId) {
        const distance = this.nearestOwnedDistance(owner, plan.targetCapitalId);
        if (distance <= 2) return "assault";
      }
      return "normal";
    }

    capitalStalematePressure() {
      return this.elapsed - this.lastCapitalCaptureAt > CAPITAL_STALEMATE_SECONDS ? 1 : 0;
    }

    isFactionBoxedIn(owner) {
      const owned = this.worlds.filter((world) => world.owner === owner);
      const neutralNeighbor = owned.some((world) => this.getNeighbors(world.id).some((id) => this.getWorld(id)?.owner === NEUTRAL));
      const hostileNeighbor = owned.some((world) => this.getNeighbors(world.id).some((id) => {
        const neighbor = this.getWorld(id);
        return neighbor && neighbor.owner !== owner && neighbor.owner !== NEUTRAL;
      }));
      return hostileNeighbor && !neutralNeighbor;
    }

    sourcePriorityRaw(world, owner, plan) {
      const distance = plan ? this.distanceToPlan(world.id, plan) : 0;
      return world.ships + Math.max(0, 8 - distance) * 5 + this.frontlineScore(world, owner) * 0.35;
    }

    planMoveScore(source, target, owner, plan) {
      if (!plan) return 0;
      const sourceDistance = this.distanceToPlan(source.id, plan);
      const targetDistance = this.distanceToPlan(target.id, plan);
      let score = Number.isFinite(sourceDistance) && Number.isFinite(targetDistance) ? (sourceDistance - targetDistance) * 16 : 0;
      if (plan.type === "capital" && target.id === plan.targetCapitalId) score += 58;
      if (plan.targetSectorId && target.sectorId === plan.targetSectorId) score += target.owner === owner ? 10 : 28;
      if (plan.stagingWorldIds?.includes(target.id)) score += target.owner === owner ? 16 : 0;
      if (plan.warPosture === "assault" && target.owner !== owner) score += 12;
      if (plan.warPosture === "surge" && target.owner !== owner) score += 22;
      if (plan.type === "map" && target.owner !== owner) score += 12;
      return score;
    }

    distanceToPlan(worldId, plan) {
      if (!plan) return Infinity;
      if (plan.type === "capital") return this.graphDistance(worldId, plan.targetCapitalId || plan.targetId);
      if (plan.type === "sector") {
        const sector = this.sectors.find((candidate) => candidate.id === (plan.targetSectorId || plan.sectorId));
        if (!sector) return Infinity;
        return Math.min(...sector.worldIds.map((targetId) => this.graphDistance(worldId, targetId)));
      }
      if (plan.targetSectorId) {
        const sector = this.sectors.find((candidate) => candidate.id === plan.targetSectorId);
        if (sector) return Math.min(...sector.worldIds.map((targetId) => this.graphDistance(worldId, targetId)));
      }
      return 0;
    }

    shortestOwnedRoute(owner, targetId) {
      const starts = this.worlds.filter((world) => world.owner === owner);
      const queue = starts.map((world) => ({ id: world.id, path: [world.id] }));
      const visited = new Set(starts.map((world) => world.id));
      while (queue.length > 0) {
        const current = queue.shift();
        if (current.id === targetId) return current.path;
        for (const neighbor of this.getNeighbors(current.id)) {
          if (visited.has(neighbor)) continue;
          visited.add(neighbor);
          queue.push({ id: neighbor, path: current.path.concat(neighbor) });
        }
      }
      return [];
    }

    nearestOwnedDistance(owner, targetId) {
      const distances = this.worlds
        .filter((world) => world.owner === owner)
        .map((world) => this.graphDistance(world.id, targetId));
      return Math.min(...distances);
    }

    graphDistance(fromId, toId) {
      if (fromId === toId) return 0;
      const visited = new Set([fromId]);
      const queue = [{ id: fromId, distance: 0 }];
      while (queue.length > 0) {
        const current = queue.shift();
        for (const neighbor of this.getNeighbors(current.id)) {
          if (visited.has(neighbor)) continue;
          if (neighbor === toId) return current.distance + 1;
          visited.add(neighbor);
          queue.push({ id: neighbor, distance: current.distance + 1 });
        }
      }
      return Infinity;
    }

    personalityFor(owner) {
      return AI_PERSONALITIES[owner] || { aggression: 1, risk: 1, capitalFocus: 1, sectorFocus: 1, expansion: 1 };
    }

    routeKey(fromId, toId, owner) {
      return `${owner}:${fromId}>${toId}`;
    }

    humanFaction() {
      return this.factions.find((faction) => faction.isHuman) || null;
    }

    aiFactions() {
      return this.factions.filter((faction) => !faction.isHuman);
    }

    isInvader(owner) {
      return owner === INVADER;
    }

    formattedAge() {
      const totalSeconds = Math.floor(this.elapsed);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }

    isHuman(owner) {
      return this.humanFaction()?.id === owner;
    }

    areConnected(a, b) {
      return this.lanes.some(([from, to]) => (from === a && to === b) || (from === b && to === a));
    }

    getNeighbors(worldId) {
      return this.lanes.flatMap(([a, b]) => {
        if (a === worldId) return [b];
        if (b === worldId) return [a];
        return [];
      });
    }

    getWorld(worldId) {
      return this.worlds.find((world) => world.id === worldId);
    }
  }

  class Hud {
    constructor(shell, scene) {
      this.shell = shell;
      this.scene = scene;
      this.overlays = { planetLabels: true, fleetLabels: true, sectors: true, lanes: true, minimap: true };
      this.lastMessage = "";
      this.toasts = [];
      const root = document.getElementById("hud-root");
      root.innerHTML = "";
      this.root = root;
      this.buildBackground();
      this.buildMenu();
      this.buildHud();
      this.buildEndgame();
    }

    buildBackground() {
      // Animated parallax starfield + nebulae + shooting stars
      let bg = document.getElementById("space-bg");
      if (!bg) {
        bg = document.createElement("div");
        bg.id = "space-bg";
        bg.innerHTML = `
          <div class="nebula nebula-1"></div>
          <div class="nebula nebula-2"></div>
          <div class="nebula nebula-3"></div>
          <div class="star-layer layer-1"></div>
          <div class="star-layer layer-2"></div>
          <div class="star-layer layer-3"></div>
          <div class="shooting-star ss-1"></div>
          <div class="shooting-star ss-2"></div>
          <div class="shooting-star ss-3"></div>
        `;
        document.body.insertBefore(bg, document.body.firstChild);
      }
    }

    buildMenu() {
      this.menu = document.createElement("div");
      this.menu.className = "main-menu";

      const shell = document.createElement("div");
      shell.className = "menu-shell";
      shell.innerHTML = `
        <div class="plate">
          <div class="menu-crest">
            <div class="menu-emblem">${this.emblemSvg()}</div>
            <div>
              <div class="menu-kicker">Dank Arcade — Vol. I</div>
              <h1 class="menu-title">Starline Conquest</h1>
              <div class="menu-subtitle">A galactic numbers war</div>
            </div>
          </div>
          <p class="menu-tagline">Build fleets at your command worlds, push them down hyperspace lanes, take rival capitals. Hold sectors for production. Survive the Rift.</p>
          
          <div class="menu-section">
            <div class="menu-section-label">Command Mode</div>
            <div class="mode-grid">
              <button type="button" class="mode-card active" data-mode="human">
                <div class="mode-card-title">Commander</div>
                <div class="mode-card-desc">Lead the Free Star Alliance against rival AI</div>
              </button>
              <button type="button" class="mode-card" data-mode="spectator">
                <div class="mode-card-title">Observer</div>
                <div class="mode-card-desc">Watch AI factions fight for the galaxy</div>
              </button>
            </div>
          </div>

          <div class="menu-section">
            <div class="menu-section-label">Rival Houses</div>
            <div class="stepper-row">
              <div class="stepper">
                <button type="button" data-step="-1" aria-label="Decrease">−</button>
                <div class="stepper-value" data-value="ai">3</div>
                <button type="button" data-step="1" aria-label="Increase">+</button>
              </div>
              <div class="stepper-label">opposing AI factions <span style="color:var(--parchment-faint);font-size:11px">(1 – 5)</span></div>
            </div>
          </div>

          <div class="menu-section">
            <div class="menu-section-label">Galactic Survey</div>
            <div class="galaxy-row">
              <div>
                <span class="field-label">Layout</span>
                <select class="fancy-select" name="mapLayout">
                  <option value="classic" selected>Classic Front</option>
                  <option value="ring">Orbital Ring</option>
                  <option value="twin">Twin Fronts</option>
                  <option value="core">Dense Core</option>
                  <option value="frontier">Wide Frontier</option>
                </select>
              </div>
              <div>
                <span class="field-label">Scale</span>
                <select class="fancy-select" name="galaxySize">
                  <option value="small">Small Cluster</option>
                  <option value="medium" selected>Medium Reach</option>
                  <option value="large">Vast Frontier</option>
                </select>
              </div>
            </div>
          </div>

          <button type="button" class="start-button" data-action="start">
            <span>Begin Campaign</span>
            <span class="arrow">▸</span>
          </button>
        </div>
      `;

      // Wire up menu interactions
      let aiCount = 3;
      let mode = "human";
      const aiVal = shell.querySelector('[data-value="ai"]');
      const updateAi = () => {
        aiVal.textContent = String(aiCount);
        shell.querySelectorAll('[data-step]').forEach(b => {
          const dir = Number(b.dataset.step);
          b.disabled = (dir === -1 && aiCount <= 1) || (dir === 1 && aiCount >= 5);
        });
      };
      shell.querySelectorAll('[data-step]').forEach(b => {
        b.addEventListener('click', () => {
          aiCount = Math.max(1, Math.min(5, aiCount + Number(b.dataset.step)));
          updateAi();
        });
      });
      shell.querySelectorAll('.mode-card').forEach(c => {
        c.addEventListener('click', () => {
          shell.querySelectorAll('.mode-card').forEach(x => x.classList.remove('active'));
          c.classList.add('active');
          mode = c.dataset.mode;
        });
      });
      shell.querySelector('[data-action="start"]').addEventListener('click', () => {
        const layout = shell.querySelector('[name="mapLayout"]').value;
        const size = shell.querySelector('[name="galaxySize"]').value;
        this.shell.startGame({
          aiCount,
          spectatorMode: mode === "spectator",
          mapLayout: layout,
          galaxySize: size
        });
        this.scene.mapBounds = this.scene.computeMapBounds();
        this.scene.resetCamera();
      });
      updateAi();

      this.menu.append(shell);
      this.root.append(this.menu);
    }

    emblemSvg() {
      // Original brass radial sigil — not Star Wars
      return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="brass-grad" cx="50%" cy="40%">
            <stop offset="0%" stop-color="#e8c879"/>
            <stop offset="60%" stop-color="#c8a25b"/>
            <stop offset="100%" stop-color="#6f3d20"/>
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="28" fill="none" stroke="url(#brass-grad)" stroke-width="2"/>
        <circle cx="32" cy="32" r="22" fill="none" stroke="#c8a25b" stroke-width="0.5" opacity="0.6"/>
        <circle cx="32" cy="32" r="8" fill="url(#brass-grad)"/>
        <circle cx="32" cy="32" r="3" fill="#070912"/>
        <g stroke="#c8a25b" stroke-width="1.2">
          <line x1="32" y1="2" x2="32" y2="14"/>
          <line x1="32" y1="50" x2="32" y2="62"/>
          <line x1="2" y1="32" x2="14" y2="32"/>
          <line x1="50" y1="32" x2="62" y2="32"/>
          <line x1="11" y1="11" x2="20" y2="20" opacity="0.6"/>
          <line x1="44" y1="44" x2="53" y2="53" opacity="0.6"/>
          <line x1="53" y1="11" x2="44" y2="20" opacity="0.6"/>
          <line x1="11" y1="53" x2="20" y2="44" opacity="0.6"/>
        </g>
        <circle cx="32" cy="6" r="1.5" fill="#e8c879"/>
        <circle cx="32" cy="58" r="1.5" fill="#e8c879"/>
        <circle cx="6" cy="32" r="1.5" fill="#e8c879"/>
        <circle cx="58" cy="32" r="1.5" fill="#e8c879"/>
      </svg>`;
    }

    buildHud() {
      this.hud = document.createElement("div");
      this.hud.className = "hud";

      // === Top Command Rail ===
      this.hud.innerHTML = `
        <div class="command-rail">
          <div class="rail-section brand">
            <div class="rivet tl"></div><div class="rivet tr"></div>
            <div class="rivet bl"></div><div class="rivet br"></div>
            <div class="brand-emblem">${this.emblemSvg()}</div>
            <div class="brand-text">
              <div class="brand-name">STARLINE</div>
              <div class="brand-sub">CONQUEST · DK·I</div>
            </div>
          </div>

          <div class="rail-section status">
            <div class="age-display">
              <div class="age-label">Galactic Age</div>
              <div class="age-value mono" data-el="age">0:00</div>
            </div>
            <div class="rail-divider"></div>
            <div class="status-dot" data-el="dot"></div>
            <div class="status-message" data-el="msg">
              <span class="label">Channel</span><span data-el="msgtext">Standing by.</span>
            </div>
          </div>

          <div class="rail-section">
            <button class="rail-button" data-action="pause" data-el="pause">
              <svg class="icon" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="2" width="3" height="10"/><rect x="9" y="2" width="3" height="10"/></svg>
              <span data-el="pauseLabel">Pause</span>
            </button>
            <div class="speed-group">
              ${[0.75, 1, 1.5, 2, 3, 5].map(s => `<button class="speed-btn${s===1?' active':''}" data-speed="${s}">${s}×</button>`).join('')}
            </div>
            <div class="rail-divider"></div>
            <button class="rail-button" data-action="restart">⟲ Restart</button>
            <button class="rail-button danger" data-action="menu">⌂ Menu</button>
          </div>
        </div>

        <aside class="standings" data-draggable="standings">
          <div class="standings-plate">
            <div class="standings-header" data-drag-handle>
              <div class="standings-title">Faction Standings</div>
              <button class="standings-collapse" data-el="collapse">−</button>
            </div>
            <div class="standings-body" data-el="standingsBody"></div>
          </div>
        </aside>

        <aside class="dossier" data-el="dossier" data-draggable="dossier">
          <div class="dossier-plate" data-el="dossierContent"></div>
        </aside>

        <div class="zoom-stack">
          <button data-action="zoomIn" title="Zoom in">+</button>
          <button data-action="zoomOut" title="Zoom out">−</button>
          <button data-action="zoomFit" title="Fit galaxy">◇</button>
          <button data-action="toggleMap" title="Toggle tactical map">▦</button>
        </div>

        <div class="tactical-map" data-el="tacticalMap" data-draggable="tactical">
          <div class="tactical-header" data-drag-handle>
            <div class="tactical-title">Tactical Survey</div>
            <div class="tactical-coord mono" data-el="coord">SECTOR · GALACTIC</div>
          </div>
          <div class="minimap-container">
            <canvas class="minimap" width="280" height="180"></canvas>
            <div class="minimap-overlay"></div>
          </div>
        </div>

        <div class="holdings" data-el="holdings"></div>
        <div class="toast-rail" data-el="toastRail"></div>
      `;

      this.root.append(this.hud);

      // Cache DOM
      this.el = {};
      this.hud.querySelectorAll('[data-el]').forEach(n => this.el[n.dataset.el] = n);
      this.minimap = this.hud.querySelector('.minimap');
      this.initDraggable();

      // Wire actions
      this.hud.querySelector('[data-action="pause"]').addEventListener('click', () => {
        const sim = this.shell.simulation;
        sim.setPaused(!sim.paused);
      });
      this.hud.querySelector('[data-action="restart"]').addEventListener('click', () => {
        this.shell.restartMatch();
        this.scene.resetCamera();
        this.endgame.classList.remove('visible');
      });
      this.hud.querySelector('[data-action="menu"]').addEventListener('click', () => {
        this.shell.returnToMenu();
        this.endgame.classList.remove('visible');
      });
      this.hud.querySelector('[data-action="zoomIn"]').addEventListener('click', () => this.scene.adjustZoom(0.18));
      this.hud.querySelector('[data-action="zoomOut"]').addEventListener('click', () => this.scene.adjustZoom(-0.18));
      this.hud.querySelector('[data-action="zoomFit"]').addEventListener('click', () => this.scene.resetCamera());
      this.hud.querySelector('[data-action="toggleMap"]').addEventListener('click', () => {
        this.overlays.minimap = !this.overlays.minimap;
        this.el.tacticalMap.classList.toggle('hidden', !this.overlays.minimap);
      });
      this.hud.querySelectorAll('.speed-btn').forEach(b => {
        b.addEventListener('click', () => {
          this.shell.simulation.speed = Number(b.dataset.speed);
          this.hud.querySelectorAll('.speed-btn').forEach(x => x.classList.toggle('active', x === b));
        });
      });
      this.el.collapse.addEventListener('click', () => {
        this.el.standingsBody.classList.toggle('compact');
        this.el.collapse.textContent = this.el.standingsBody.classList.contains('compact') ? '+' : '−';
      });
      this.minimap.addEventListener('pointerdown', (event) => {
        if (this.shell.screen !== "playing") return;
        const rect = this.minimap.getBoundingClientRect();
        this.scene.jumpToMinimap((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
      });
    }

    buildEndgame() {
      this.endgame = document.createElement("div");
      this.endgame.className = "endgame";
      this.endgame.innerHTML = `
        <div class="endgame-card">
          <div class="endgame-result" data-el="endResult">VICTORY</div>
          <div class="endgame-msg" data-el="endMsg"></div>
          <div class="endgame-actions">
            <button class="rail-button" data-action="restart-end">Play Again</button>
            <button class="rail-button" data-action="menu-end">Main Menu</button>
          </div>
        </div>
      `;
      this.endgame.querySelector('[data-action="restart-end"]').addEventListener('click', () => {
        this.shell.restartMatch();
        this.scene.resetCamera();
        this.endgame.classList.remove('visible');
      });
      this.endgame.querySelector('[data-action="menu-end"]').addEventListener('click', () => {
        this.shell.returnToMenu();
        this.endgame.classList.remove('visible');
      });
      this.root.append(this.endgame);
    }

    factionSigilSvg(faction) {
      const c = faction.css;
      // Different sigils per faction would be ideal — using a generic heraldic disc with faction tint
      return `<svg viewBox="0 0 26 26">
        <circle cx="13" cy="13" r="12" fill="none" stroke="${c}" stroke-width="1.4"/>
        <circle cx="13" cy="13" r="8" fill="${c}" opacity="0.18"/>
        <circle cx="13" cy="13" r="3.5" fill="${c}"/>
        <line x1="13" y1="1" x2="13" y2="5" stroke="${c}" stroke-width="1"/>
        <line x1="13" y1="21" x2="13" y2="25" stroke="${c}" stroke-width="1"/>
        <line x1="1" y1="13" x2="5" y2="13" stroke="${c}" stroke-width="1"/>
        <line x1="21" y1="13" x2="25" y2="13" stroke="${c}" stroke-width="1"/>
      </svg>`;
    }

    pushToast(msg, level = "info") {
      const t = document.createElement("div");
      t.className = "toast" + (level !== "info" ? " " + level : "");
      t.textContent = msg;
      this.el.toastRail.append(t);
      setTimeout(() => t.remove(), 5200);
    }

    render() {
      const sim = this.shell.simulation;
      const isMenu = this.shell.screen === "menu";
      this.menu.classList.toggle("visible", isMenu);
      this.hud.classList.toggle("visible", !isMenu);
      if (isMenu) {
        this.endgame.classList.remove("visible");
        return;
      }

      // Age + status
      this.el.age.textContent = sim.formattedAge();
      const dot = this.el.dot;
      dot.classList.toggle('paused', sim.paused);
      dot.classList.toggle('ended', sim.status !== 'playing' && sim.status !== 'idle');

      // Pause label + icon
      this.hud.querySelector('[data-el="pauseLabel"]').textContent = sim.paused ? "Resume" : "Pause";

      // Speed sync
      this.hud.querySelectorAll('.speed-btn').forEach(b => {
        b.classList.toggle('active', Number(b.dataset.speed) === sim.speed);
      });

      // Status message + toast on change
      const selected = sim.worlds.find((w) => w.id === sim.selectedWorldId);
      let statusText;
      if (sim.status === "humanWon") statusText = "Victory secured. Every rival command world has fallen.";
      else if (sim.status === "humanLost") statusText = "Defeat. Your command world has been taken.";
      else if (sim.status === "spectatorEnded") statusText = sim.message;
      else if (selected) statusText = sim.message;
      else statusText = sim.message;
      this.el.msgtext.textContent = statusText;

      // Push toast for new priority messages only
      if (sim.priorityMessage && sim.priorityMessage !== this.lastMessage && this.elapsed_seen !== sim.priorityMessageUntil) {
        const lvl = /void|rift|invader|defeat|fall/i.test(sim.priorityMessage) ? 'danger' :
                    /surge|warning|imminent/i.test(sim.priorityMessage) ? 'warn' : 'info';
        this.pushToast(sim.priorityMessage, lvl);
        this.lastMessage = sim.priorityMessage;
        this.elapsed_seen = sim.priorityMessageUntil;
      }

      // End-game card
      const endStatuses = { humanWon: ['VICTORY', 'won', 'Every rival command world answers to your banner.'],
                            humanLost: ['DEFEAT', 'lost', 'Liberty Prime has fallen. The galaxy belongs to another.'],
                            spectatorEnded: ['CAMPAIGN END', 'draw', sim.message] };
      if (endStatuses[sim.status]) {
        const [title, cls, msg] = endStatuses[sim.status];
        this.endgame.classList.add('visible');
        this.endgame.querySelector('[data-el="endResult"]').textContent = title;
        this.endgame.querySelector('[data-el="endResult"]').className = 'endgame-result ' + cls;
        this.endgame.querySelector('[data-el="endMsg"]').textContent = msg;
      } else {
        this.endgame.classList.remove('visible');
      }

      this.renderStandings();
      this.renderDossier();
      this.renderHoldings();
      if (this.overlays.minimap) this.renderMinimap();
    }

    renderStandings() {
      const sim = this.shell.simulation;
      const rows = sim.factionSnapshots();
      const maxShips = Math.max(1, ...rows.map(r => r.totalShips));
      const body = this.el.standingsBody;
      body.innerHTML = "";
      // Sort: human first, then by total ships
      rows.sort((a, b) => {
        if (a.faction.isHuman) return -1;
        if (b.faction.isHuman) return 1;
        return b.totalShips - a.totalShips;
      });
      for (const r of rows) {
        const row = document.createElement('div');
        row.className = 'faction-row' + (r.faction.isHuman ? ' human' : '');
        row.style.setProperty('--owner-color', r.faction.css);
        const planets = r.planets;
        const widthPct = Math.round((r.totalShips / maxShips) * 100);
        row.innerHTML = `
          <div class="faction-sigil">${this.factionSigilSvg(r.faction)}</div>
          <div class="faction-info">
            <div class="faction-name${r.faction.isHuman ? ' human-tag' : ''}">${r.faction.shortName}${r.surge > 0 ? '<span class="surge-tag">SURGE \u00b7 ' + r.surge + 's</span>' : ''}</div>
            <div class="faction-stats">
              <span><span class="v">${planets}</span> worlds</span>
              <span><span class="v">${r.sectors}</span> sectors</span>
              <span><span class="v${r.capitals > 1 ? ' warn' : ''}">${r.capitals}</span> caps</span>
            </div>
          </div>
          <div>
            <div class="faction-power">${r.totalShips}</div>
            <span class="faction-power-label">ships</span>
          </div>
          <div class="faction-bar">
            <div class="faction-bar-fill" style="width:${widthPct}%;background:${r.faction.css};color:${r.faction.css}"></div>
          </div>
        `;
        body.append(row);
      }
    }

    renderDossier() {
      const sim = this.shell.simulation;
      const details = sim.selectedWorldDetails();
      if (!details) {
        this.el.dossier.classList.remove('visible');
        return;
      }
      this.el.dossier.classList.add('visible');
      const { world, ownerName, tier, production, upgrade, neighbors, incomingFriendly, incomingEnemy } = details;
      const ownerColor = cssFor(world.owner, sim.factions);
      const tierNum = sim.worldTier(world);
      const tierPips = [1,2,3,4].map(n => `<i class="${n <= tierNum ? 'on' : ''}"></i>`).join('');
      const upgradeBlock = upgrade
        ? (() => {
            const pct = Math.min(100, (world.ships / upgrade.threshold) * 100);
            const ready = world.ships >= upgrade.threshold;
            return `
              <div class="upgrade-row">
                <div class="label">Industrial Upgrade · L${upgrade.level}</div>
                <div class="upgrade-progress"><div class="upgrade-progress-fill${ready ? ' ready' : ''}" style="width:${pct}%"></div></div>
                <div class="upgrade-text">
                  <span>${world.ships} / ${upgrade.threshold}</span>
                  <span class="${ready ? 'ready' : ''}">${ready ? 'READY · costs ' + upgrade.cost : 'spend ' + upgrade.cost}</span>
                </div>
              </div>
            `;
          })()
        : `<div class="upgrade-row"><div class="label">Industrial Upgrade</div><div style="font-size:11px;color:var(--parchment-faint);font-style:italic;margin-top:4px">Maximum tier reached for this faction.</div></div>`;

      const neighborItems = neighbors.slice(0, 6).map(n => {
        const c = cssFor(n.owner, sim.factions);
        return `<div class="lane"><span style="color:${c}">${n.name}</span><span class="ships"><span class="arrow">⟶</span>${n.ships}</span></div>`;
      }).join('');

      const isHuman = sim.isHuman(world.owner);
      const hint = isHuman
        ? (upgrade && world.ships >= upgrade.threshold ? "Click again to spend " + upgrade.cost + " ships and upgrade." : "Click a connected world to send half this fleet.")
        : "Click your own world first to launch fleets toward this one.";

      this.el.dossierContent.innerHTML = `
        <div class="dossier-header" data-drag-handle style="--owner-color:${ownerColor}">
          <div class="dossier-kicker">${world.kind || 'World'}${world.isCapital ? ' · Capital' : ''}${world.isInvaderOrigin ? ' · Origin' : ''}</div>
          <div class="dossier-name">${world.name}</div>
          <div class="dossier-meta">
            <span class="kind">L${world.level} · Tier ${tier}</span>
            <span>·</span>
            <span class="owner" style="--owner-color:${ownerColor}">${ownerName}</span>
          </div>
        </div>
        <div class="dossier-body">
          <div class="dossier-grid">
            <div class="stat-block">
              <div class="label">Garrison</div>
              <div class="value">${world.ships}</div>
              <div class="sublabel">ships</div>
            </div>
            <div class="stat-block">
              <div class="label">Production</div>
              <div class="value">+${production}</div>
              <div class="sublabel">per cycle</div>
            </div>
            <div class="stat-block">
              <div class="label">Fleet Tier</div>
              <div class="value small">${tier}</div>
              <div class="sublabel"><span class="tier-pip">${tierPips}</span></div>
            </div>
            <div class="stat-block">
              <div class="label">Sector</div>
              <div class="value small">${(sim.sectors.find(s => s.id === world.sectorId) || {name:'—'}).name}</div>
              <div class="sublabel">${sim.getSectorOwnerById(world.sectorId) === world.owner ? 'controlled · +1 prod' : 'contested'}</div>
            </div>
          </div>
          ${upgradeBlock}
          <div class="dossier-flux">
            <div class="flux-item in">
              <div class="label">Inbound</div>
              <div class="value">+${incomingFriendly}</div>
            </div>
            <div class="flux-item out">
              <div class="label">Hostile</div>
              <div class="value">−${incomingEnemy}</div>
            </div>
          </div>
          <div class="lanes-list">
            <div class="label">Hyperspace Lanes</div>
            ${neighborItems || '<div style="font-size:11px;color:var(--parchment-faint);font-style:italic">No connections.</div>'}
          </div>
          <div class="dossier-hint">${hint}</div>
        </div>
      `;
    }

    renderHoldings() {
      const sim = this.shell.simulation;
      const human = sim.humanFaction();
      const heldSectors = sim.sectors.filter((s) => sim.getSectorOwner(s));
      const totalSectors = sim.sectors.length;
      const totalWorlds = sim.worlds.length;
      const playerWorlds = human ? sim.worlds.filter(w => w.owner === human.id).length : 0;

      const items = [];
      if (human) {
        items.push(`<div class="holdings-pill"><span class="num">${playerWorlds}</span><span class="label">Your Worlds</span></div>`);
      }
      items.push(`<div class="holdings-pill"><span class="num">${heldSectors.length}/${totalSectors}</span><span class="label">Sectors Held</span></div>`);
      items.push(`<div class="holdings-pill"><span class="num">${sim.fleets.length}</span><span class="label">Fleets in Transit</span></div>`);
      if (sim.invaderSpawned && !sim.invaderDefeated) {
        const v = sim.worlds.filter(w => sim.isInvader(w.owner)).length;
        items.push(`<div class="holdings-pill" style="border-color:#8d7ab8;color:#d8c8e8"><span class="num" style="color:#d8c8e8">${v}</span><span class="label" style="color:#a596c8">VOID HELD</span></div>`);
      } else if (!sim.invaderSpawned) {
        const remaining = Math.max(0, Math.ceil(600 - sim.elapsed));
        if (remaining > 0 && remaining < 600) {
          items.push(`<div class="holdings-pill" style="border-color:${remaining < 60 ? 'var(--danger)' : remaining < 150 ? 'var(--warn)' : 'var(--iron-edge)'}"><span class="num">${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}</span><span class="label">Until Rift</span></div>`);
        }
      }
      this.el.holdings.innerHTML = items.join('');
    }

    initDraggable() {
      const STORAGE_KEY = 'starline_panel_positions_v1';
      let saved = {};
      try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) {}
      const panels = this.hud.querySelectorAll('[data-draggable]');
      panels.forEach(panel => {
        const id = panel.dataset.draggable;
        // Apply saved position if present
        if (saved[id]) {
          panel.style.left = saved[id].left + 'px';
          panel.style.top = saved[id].top + 'px';
          panel.style.right = 'auto';
          panel.style.bottom = 'auto';
        }
        // Find drag handle (first [data-drag-handle] inside, or the panel itself)
        const attachHandle = (handle) => {
          if (!handle || handle.dataset.dragWired) return;
          handle.dataset.dragWired = '1';
          handle.style.cursor = 'grab';
          handle.addEventListener('pointerdown', (event) => {
            // Don't start drag on buttons or inputs
            if (event.target.closest('button, input, select, .standings-collapse')) return;
            event.preventDefault();
            const rect = panel.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const offsetY = event.clientY - rect.top;
            handle.style.cursor = 'grabbing';
            panel.classList.add('dragging');
            const onMove = (e) => {
              const x = Math.max(4, Math.min(window.innerWidth - rect.width - 4, e.clientX - offsetX));
              const y = Math.max(4, Math.min(window.innerHeight - rect.height - 4, e.clientY - offsetY));
              panel.style.left = x + 'px';
              panel.style.top = y + 'px';
              panel.style.right = 'auto';
              panel.style.bottom = 'auto';
            };
            const onUp = (e) => {
              window.removeEventListener('pointermove', onMove);
              window.removeEventListener('pointerup', onUp);
              handle.style.cursor = 'grab';
              panel.classList.remove('dragging');
              const finalRect = panel.getBoundingClientRect();
              saved[id] = { left: finalRect.left, top: finalRect.top };
              try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch (e) {}
            };
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
          });
        };
        // Wire existing handles + observe future ones (dossier-header is rendered later)
        panel.querySelectorAll('[data-drag-handle]').forEach(attachHandle);
        const observer = new MutationObserver(() => {
          panel.querySelectorAll('[data-drag-handle]').forEach(attachHandle);
        });
        observer.observe(panel, { childList: true, subtree: true });
      });
    }

    renderMinimap() {
      const ctx = this.minimap.getContext("2d");
      const sim = this.shell.simulation;
      const bounds = this.scene.mapBounds;
      const width = this.minimap.width;
      const height = this.minimap.height;
      ctx.clearRect(0, 0, width, height);
      // Dark void backdrop
      const grad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width*0.7);
      grad.addColorStop(0, 'rgba(20, 25, 45, 0.95)');
      grad.addColorStop(1, 'rgba(7, 9, 18, 0.98)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      if (!bounds) return;

      const toMini = (point) => ({
        x: ((point.x - bounds.left) / bounds.width) * width,
        y: ((point.y - bounds.top) / bounds.height) * height
      });

      // Organic territory influence — match the main-map rendering. No fixed polygons.
      for (const world of sim.worlds) {
        if (world.owner === NEUTRAL) continue;
        const p = toMini(projectPoint(world.x, world.y));
        const baseR = world.isCapital ? 22 : (world.kind === 'station' || world.kind === 'gate' ? 12 : 16);
        const shipBoost = Math.min(8, Math.sqrt(Math.max(1, world.ships)) * 0.7);
        const R = baseR + shipBoost;
        ctx.fillStyle = cssFor(world.owner, sim.factions) + '24';
        ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = cssFor(world.owner, sim.factions) + '18';
        ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.55, 0, Math.PI * 2); ctx.fill();
      }
      // Connective bands between same-owner adjacent worlds
      for (const [aId, bId] of sim.lanes) {
        const wa = sim.getWorld(aId), wb = sim.getWorld(bId);
        if (!wa || !wb || wa.owner === NEUTRAL || wa.owner !== wb.owner) continue;
        const pa = toMini(projectPoint(wa.x, wa.y));
        const pb = toMini(projectPoint(wb.x, wb.y));
        const dx = pb.x - pa.x, dy = pb.y - pa.y;
        const len = Math.hypot(dx, dy);
        if (len < 1) continue;
        const steps = Math.max(3, Math.floor(len / 12));
        ctx.fillStyle = cssFor(wa.owner, sim.factions) + '14';
        for (let i = 1; i < steps; i++) {
          const t = i / steps;
          const x = pa.x + dx * t;
          const y = pa.y + dy * t;
          const taper = Math.sin(t * Math.PI);
          ctx.beginPath(); ctx.arc(x, y, 4 + taper * 2, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Lanes (faint)
      ctx.strokeStyle = 'rgba(200, 162, 91, 0.15)';
      ctx.lineWidth = 0.5;
      for (const [a, b] of sim.lanes) {
        const wa = sim.getWorld(a), wb = sim.getWorld(b);
        if (!wa || !wb) continue;
        const pa = toMini(projectPoint(wa.x, wa.y));
        const pb = toMini(projectPoint(wb.x, wb.y));
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }

      // Worlds
      for (const world of sim.worlds) {
        const p = toMini(projectPoint(world.x, world.y));
        const r = world.isCapital ? 3.5 : world.isInvaderOrigin ? 4 : 2;
        if (world.isCapital) {
          ctx.fillStyle = cssFor(world.owner, sim.factions) + '40';
          ctx.beginPath(); ctx.arc(p.x, p.y, r + 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = cssFor(world.owner, sim.factions);
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
        if (world.isCapital) {
          ctx.strokeStyle = '#e8c879';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Fleets
      for (const fleet of sim.fleets) {
        const from = sim.getWorld(fleet.from);
        const to = sim.getWorld(fleet.to);
        if (!from || !to) continue;
        const p1 = projectPoint(from.x, from.y);
        const p2 = projectPoint(to.x, to.y);
        const p = toMini({
          x: Phaser.Math.Linear(p1.x, p2.x, Phaser.Math.Clamp(fleet.progress, 0, 1)),
          y: Phaser.Math.Linear(p1.y, p2.y, Phaser.Math.Clamp(fleet.progress, 0, 1))
        });
        ctx.fillStyle = cssFor(fleet.owner, sim.factions);
        ctx.fillRect(p.x - 1, p.y - 1, 2.5, 2.5);
      }

      // Camera viewport — brass frame
      const camera = this.scene.cameras.main;
      const view = {
        left: camera.scrollX,
        top: camera.scrollY,
        right: camera.scrollX + camera.width / camera.zoom,
        bottom: camera.scrollY + camera.height / camera.zoom
      };
      const a = toMini({ x: view.left, y: view.top });
      const b = toMini({ x: view.right, y: view.bottom });
      ctx.strokeStyle = '#e8c879';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
      // Corner brackets
      ctx.strokeStyle = '#c8a25b';
      ctx.lineWidth = 2;
      const bs = 6;
      [[a.x, a.y, 1, 1], [b.x, a.y, -1, 1], [a.x, b.y, 1, -1], [b.x, b.y, -1, -1]].forEach(([x, y, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(x, y + dy * bs);
        ctx.lineTo(x, y);
        ctx.lineTo(x + dx * bs, y);
        ctx.stroke();
      });
    }
  }

  class ConquestScene extends Phaser.Scene {
    constructor() {
      super("ConquestScene");
    }

    create() {
      this.shell = new GameShell();
      window.__conquestShell = this.shell;
      window.__conquestSimulation = this.shell.simulation;
      window.__conquestScene = this;
      this.graphics = this.add.graphics();
      this.labels = new Map();
      this.fleetLabels = new Map();
      this.pointerState = { dragging: false, moved: false, lastX: 0, lastY: 0 };
      this.pointerScreen = { x: 0, y: 0 };
      this.lastPointerDownAt = 0;
      this.lastMapRevision = 0;
      this.mapBounds = this.computeMapBounds();
      this.hud = new Hud(this.shell, this);
      this.cameras.main.setBackgroundColor(0x000000);
      this.cameras.main.transparent = true;
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keys = this.input.keyboard.addKeys("W,A,S,D");
      this.scale.on("resize", () => this.resize());
      this.game.canvas.addEventListener("pointerdown", (event) => this.handleNativePointerDown(event));
      this.game.canvas.addEventListener("mousedown", (event) => this.handleNativePointerDown(event));
      window.addEventListener("pointermove", (event) => this.handleNativePointerMove(event));
      window.addEventListener("mousemove", (event) => this.handleNativePointerMove(event));
      window.addEventListener("pointerup", (event) => this.handleNativePointerUp(event));
      window.addEventListener("mouseup", (event) => this.handleNativePointerUp(event));
      this.game.canvas.addEventListener("wheel", (event) => {
        event.preventDefault();
        const point = this.canvasPoint(event);
        this.pointerScreen = point;
        this.adjustZoom(event.deltaY > 0 ? -0.12 : 0.12);
      }, { passive: false });
      this.resize();
      this.resetCamera();
    }

    update(_time, delta) {
      if (this.shell.screen === "playing") {
        this.shell.simulation.update(delta / 1000);
        if (this.lastMapRevision !== this.shell.simulation.mapRevision) {
          this.lastMapRevision = this.shell.simulation.mapRevision;
          this.mapBounds = this.computeMapBounds();
          this.clampCamera();
        }
        this.updateCameraControls(delta / 1000);
      }
      this.draw();
      this.hud.render();
    }

    resize() {
      this.clampCamera();
    }

    resetCamera() {
      const camera = this.cameras.main;
      const fitZoom = Math.min(camera.width / this.mapBounds.width, camera.height / this.mapBounds.height) * 0.92;
      camera.setZoom(Phaser.Math.Clamp(fitZoom, 0.54, 1.05));
      camera.centerOn(this.mapBounds.centerX, this.mapBounds.centerY);
      this.clampCamera();
    }

    computeMapBounds() {
      const worlds = this.shell?.simulation?.worlds?.length ? this.shell.simulation.worlds : GALAXY_TEMPLATE.worlds;
      const projected = worlds.map((world) => projectPoint(world.x, world.y));
      const xs = projected.map((point) => point.x);
      const ys = projected.map((point) => point.y);
      const padding = 180;
      const left = Math.min(...xs) - padding;
      const right = Math.max(...xs) + padding;
      const top = Math.min(...ys) - padding;
      const bottom = Math.max(...ys) + padding;
      return { left, right, top, bottom, width: right - left, height: bottom - top, centerX: (left + right) / 2, centerY: (top + bottom) / 2 };
    }

    adjustZoom(amount) {
      if (this.shell.screen !== "playing") return;
      const camera = this.cameras.main;
      const focus = { x: this.pointerScreen.x || camera.width / 2, y: this.pointerScreen.y || camera.height / 2 };
      const before = this.screenToCameraWorld(focus.x, focus.y);
      camera.setZoom(Phaser.Math.Clamp(camera.zoom + amount, 0.48, 1.8));
      const after = this.screenToCameraWorld(focus.x, focus.y);
      camera.scrollX += before.x - after.x;
      camera.scrollY += before.y - after.y;
      this.clampCamera();
    }

    updateCameraControls(deltaSeconds) {
      const camera = this.cameras.main;
      const speed = KEY_PAN_SPEED * deltaSeconds / camera.zoom;
      let dx = 0;
      let dy = 0;
      if (this.cursors.left.isDown || this.keys.A.isDown) dx -= speed;
      if (this.cursors.right.isDown || this.keys.D.isDown) dx += speed;
      if (this.cursors.up.isDown || this.keys.W.isDown) dy -= speed;
      if (this.cursors.down.isDown || this.keys.S.isDown) dy += speed;

      if (this.pointerScreen.x <= EDGE_PAN_SIZE) dx -= EDGE_PAN_SPEED * deltaSeconds / camera.zoom;
      if (this.pointerScreen.x >= camera.width - EDGE_PAN_SIZE) dx += EDGE_PAN_SPEED * deltaSeconds / camera.zoom;
      if (this.pointerScreen.y <= EDGE_PAN_SIZE) dy -= EDGE_PAN_SPEED * deltaSeconds / camera.zoom;
      if (this.pointerScreen.y >= camera.height - EDGE_PAN_SIZE) dy += EDGE_PAN_SPEED * deltaSeconds / camera.zoom;

      if (dx || dy) {
        camera.scrollX += dx;
        camera.scrollY += dy;
        this.clampCamera();
      }
    }

    clampCamera() {
      const camera = this.cameras.main;
      const viewWidth = camera.width / camera.zoom;
      const viewHeight = camera.height / camera.zoom;
      if (viewWidth >= this.mapBounds.width) {
        camera.scrollX = this.mapBounds.centerX - viewWidth / 2;
      } else {
        camera.scrollX = Phaser.Math.Clamp(camera.scrollX, this.mapBounds.left, this.mapBounds.right - viewWidth);
      }
      if (viewHeight >= this.mapBounds.height) {
        camera.scrollY = this.mapBounds.centerY - viewHeight / 2;
      } else {
        camera.scrollY = Phaser.Math.Clamp(camera.scrollY, this.mapBounds.top, this.mapBounds.bottom - viewHeight);
      }
    }

    jumpToMinimap(nx, ny) {
      const camera = this.cameras.main;
      const x = this.mapBounds.left + this.mapBounds.width * nx;
      const y = this.mapBounds.top + this.mapBounds.height * ny;
      camera.centerOn(x, y);
      this.clampCamera();
    }

    isUiTarget(target) {
      return !!target.closest?.("#hud-root button, #hud-root select, #hud-root details, .main-menu, .minimap, .selected-panel");
    }

    canvasPoint(event) {
      const rect = this.game.canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    screenToCameraWorld(x, y) {
      const camera = this.cameras.main;
      return { x: x / camera.zoom + camera.scrollX, y: y / camera.zoom + camera.scrollY };
    }

    handleNativePointerDown(event) {
      if (event.type === "mousedown" && performance.now() - this.lastPointerDownAt < 80) return;
      if (event.type === "pointerdown") this.lastPointerDownAt = performance.now();
      const point = this.canvasPoint(event);
      this.pointerScreen = point;
      if (this.shell.screen !== "playing" || this.isUiTarget(event.target)) return;
      const projected = this.screenToCameraWorld(point.x, point.y);
      const clickedWorld = this.findWorldAt(projected.x, projected.y);
      if (clickedWorld) {
        this.shell.simulation.selectWorld(clickedWorld.id);
        this.pointerState = { dragging: false, moved: false, lastX: point.x, lastY: point.y };
        return;
      }
      this.pointerState = { dragging: true, moved: false, lastX: point.x, lastY: point.y };
    }

    handleNativePointerMove(event) {
      const point = this.canvasPoint(event);
      this.pointerScreen = point;
      if (!this.pointerState.dragging) return;
      const dx = point.x - this.pointerState.lastX;
      const dy = point.y - this.pointerState.lastY;
      if (Math.abs(dx) + Math.abs(dy) > 2) this.pointerState.moved = true;
      this.pointerState.lastX = point.x;
      this.pointerState.lastY = point.y;
      const camera = this.cameras.main;
      camera.scrollX -= dx / camera.zoom;
      camera.scrollY -= dy / camera.zoom;
      this.clampCamera();
    }

    handleNativePointerUp(event) {
      const point = this.canvasPoint(event);
      this.pointerScreen = point;
      this.pointerState.dragging = false;
    }

    draw() {
      this.graphics.clear();
      this.drawSpace();
      if (this.shell.screen === "menu") {
        this.hideLabels();
        return;
      }
      if (this.hud.overlays.sectors) this.drawTerritories();
      this.drawLanes();
      this.drawWorldsAndFleets();
      this.cleanupFleetLabels();
    }

    drawSpace() {
      // Deep-space starfield baked into world coordinates so it parallaxes naturally
      // when the camera moves — the CSS background underneath gives nebula glow.
      const camera = this.cameras.main;
      const left = camera.scrollX - 300;
      const top = camera.scrollY - 220;
      const width = camera.width / camera.zoom + 600;
      const height = camera.height / camera.zoom + 440;

      // Far stars — many, tiny, dim
      this.graphics.fillStyle(0xdcecff, 0.32);
      for (const star of FAR_STARS) {
        const sx = ((star.x - left) % 2400 + 2400) % 2400 + left;
        const sy = ((star.y - top) % 1600 + 1600) % 1600 + top;
        if (sx > left && sx < left + width && sy > top && sy < top + height) {
          this.graphics.fillCircle(sx, sy, star.r);
        }
      }
      // Mid stars — slightly bigger, brighter
      for (const star of MID_STARS) {
        const sx = ((star.x - left) % 2400 + 2400) % 2400 + left;
        const sy = ((star.y - top) % 1600 + 1600) % 1600 + top;
        if (sx > left && sx < left + width && sy > top && sy < top + height) {
          this.graphics.fillStyle(star.tint, star.alpha);
          this.graphics.fillCircle(sx, sy, star.r);
          // Subtle 4-point cross sparkle on the brightest
          if (star.r >= 1.7) {
            this.graphics.lineStyle(0.5, star.tint, star.alpha * 0.5);
            this.graphics.lineBetween(sx - star.r * 2.4, sy, sx + star.r * 2.4, sy);
            this.graphics.lineBetween(sx, sy - star.r * 2.4, sx, sy + star.r * 2.4);
          }
        }
      }
      // Faint cartographer's grid (very subtle)
      this.graphics.fillStyle(0xc8a25b, 0.018);
      for (let x = Math.floor(left / 320) * 320; x < left + width; x += 320) this.graphics.fillRect(x, top, 1, height);
      for (let y = Math.floor(top / 260) * 260; y < top + height; y += 260) this.graphics.fillRect(left, y, width, 1);
    }

    drawTerritories() {
      const sim = this.shell.simulation;
      const phase = sim.elapsed || 0;

      // Use additive-style blending so overlaps brighten subtly instead of stacking opacity.
      // We achieve this by drawing into a single graphics pass with very low alpha values,
      // and using a tighter falloff so the field stays clean.

      // 1. Single soft halo per owned world — one ring only, low alpha. No stacking.
      for (const world of sim.worlds) {
        if (world.owner === NEUTRAL) continue;
        const p = projectPoint(world.x, world.y);
        const color = colorFor(world.owner, sim.factions);
        const baseR = world.isCapital ? 110 : (world.kind === 'station' || world.kind === 'gate' ? 60 : 80);
        const shipBoost = Math.min(28, Math.sqrt(Math.max(1, world.ships)) * 3);
        const R = baseR + shipBoost;

        // Single soft fill, very low alpha — overlaps blend gently
        this.graphics.fillStyle(color, 0.07);
        this.graphics.fillCircle(p.x, p.y, R);
        // Tighter inner core for the 'home' feel
        this.graphics.fillStyle(color, 0.05);
        this.graphics.fillCircle(p.x, p.y, R * 0.55);
      }

      // 2. Connective band between same-owner adjacent worlds — single thin lozenge,
      //    lower alpha, fewer steps than before
      for (const [fromId, toId] of sim.lanes) {
        const a = sim.getWorld(fromId);
        const b = sim.getWorld(toId);
        if (!a || !b || a.owner === NEUTRAL || a.owner !== b.owner) continue;
        const p1 = projectPoint(a.x, a.y);
        const p2 = projectPoint(b.x, b.y);
        const color = colorFor(a.owner, sim.factions);
        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy);
        if (len < 1) continue;
        const steps = Math.max(4, Math.floor(len / 50));
        for (let i = 1; i < steps; i++) {
          const t = i / steps;
          const x = p1.x + dx * t;
          const y = p1.y + dy * t;
          const taper = Math.sin(t * Math.PI);
          this.graphics.fillStyle(color, 0.04);
          this.graphics.fillCircle(x, y, 18 + taper * 8);
        }
      }

      // 3. Capital — subtle pulse, single ring, no fill stacking
      for (const world of sim.worlds) {
        if (!world.isCapital || world.owner === NEUTRAL) continue;
        const p = projectPoint(world.x, world.y);
        const color = colorFor(world.owner, sim.factions);
        const pulse = 1 + Math.sin(phase * 1.2) * 0.05;
        this.graphics.lineStyle(0.6, color, 0.22);
        this.graphics.strokeCircle(p.x, p.y, 140 * pulse);
      }

      // 4. Sector heraldic dot — only at controlled sector centroid
      for (const sector of sim.sectors) {
        const owner = sim.getSectorOwner(sector);
        if (!owner) continue;
        const points = sector.worldIds.map((id) => {
          const world = sim.getWorld(id);
          return world ? projectPoint(world.x, world.y) : null;
        }).filter(Boolean);
        if (points.length < 2) continue;
        const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
        const cy = points.reduce((s, p) => s + p.y, 0) / points.length;
        const color = colorFor(owner, sim.factions);
        this.graphics.fillStyle(0x000000, 0.4);
        this.graphics.fillCircle(cx, cy, 4.5);
        this.graphics.fillStyle(color, 0.85);
        this.graphics.fillCircle(cx, cy, 3);
        this.graphics.lineStyle(0.8, 0xc8a25b, 0.6);
        this.graphics.strokeCircle(cx, cy, 5);
      }
    }

    drawLanes() {
      const sim = this.shell.simulation;
      const phase = (sim.elapsed || 0) % 4;
      for (const [fromId, toId] of sim.lanes) {
        const from = sim.getWorld(fromId);
        const to = sim.getWorld(toId);
        if (!from || !to) continue;
        const fromPoint = projectPoint(from.x, from.y);
        const toPoint = projectPoint(to.x, to.y);
        const selected = sim.selectedWorldId && (from.id === sim.selectedWorldId || to.id === sim.selectedWorldId);
        const sameOwner = from.owner !== NEUTRAL && from.owner === to.owner;
        const sharedColor = sameOwner ? colorFor(from.owner, sim.factions) : 0x000000;

        // Iron rail base
        this.graphics.lineStyle(selected ? 6 : 3, 0x1a1409, this.hud.overlays.lanes ? (selected ? 0.85 : 0.6) : 0.2);
        this.graphics.lineBetween(fromPoint.x, fromPoint.y, toPoint.x, toPoint.y);

        if (this.hud.overlays.lanes) {
          // Faction-tinted under-glow when both endpoints are same owner
          if (sameOwner) {
            this.graphics.lineStyle(selected ? 4 : 2, sharedColor, selected ? 0.55 : 0.28);
            this.graphics.lineBetween(fromPoint.x, fromPoint.y, toPoint.x, toPoint.y);
          }
          // Brass thread
          this.graphics.lineStyle(selected ? 1.6 : 0.8, selected ? 0xffe9b8 : 0xc8a25b, selected ? 1 : 0.42);
          this.graphics.lineBetween(fromPoint.x, fromPoint.y, toPoint.x, toPoint.y);

          // Animated traveling waypoint pulse — beacon drifting along the lane
          const dx = toPoint.x - fromPoint.x;
          const dy = toPoint.y - fromPoint.y;
          const t = ((phase + (fromId.length + toId.length) * 0.13) % 4) / 4;
          const px = fromPoint.x + dx * t;
          const py = fromPoint.y + dy * t;
          this.graphics.fillStyle(0xe8c879, selected ? 0.95 : 0.5);
          this.graphics.fillCircle(px, py, selected ? 2.6 : 1.6);
          if (selected) {
            this.graphics.lineStyle(1, 0xe8c879, 0.4);
            this.graphics.strokeCircle(px, py, 6);
          }
        }
      }
    }

    drawWorldsAndFleets() {
      const sim = this.shell.simulation;
      const renderItems = [];
      for (const world of sim.worlds) renderItems.push({ type: "world", world, depth: world.x + world.y });
      for (const fleet of sim.fleets) {
        const from = sim.getWorld(fleet.from);
        const to = sim.getWorld(fleet.to);
        if (!from || !to) continue;
        renderItems.push({ type: "fleet", fleet, from, to, depth: Phaser.Math.Linear(from.x + from.y, to.x + to.y, Phaser.Math.Clamp(fleet.progress, 0, 1)) + 2 });
      }
      renderItems.sort((a, b) => a.depth - b.depth);
      for (const item of renderItems) {
        if (item.type === "world") this.drawWorld(item.world);
        else this.drawFleet(item.fleet, item.from, item.to);
      }
    }

    drawWorld(world) {
      const sim = this.shell.simulation;
      const p = projectPoint(world.x, world.y);
      const baseRadius = world.isCapital ? 22 : (world.kind === "station" || world.kind === "gate" ? 14 : 18);
      const isSelected = world.id === sim.selectedWorldId;
      const color = colorFor(world.owner, sim.factions);
      const heldSector = sim.getSectorOwnerById(world.sectorId) === world.owner && world.owner !== NEUTRAL;
      const isStation = world.kind === "station" || world.kind === "shipyard" || world.kind === "gate" || world.kind === "fortress";
      const phase = (sim.elapsed || 0);

      // Owner halo — soft glow on owned worlds
      if (world.owner !== NEUTRAL) {
        this.graphics.fillStyle(color, heldSector ? 0.18 : 0.1);
        this.graphics.fillCircle(p.x, p.y, baseRadius * 2.4);
        this.graphics.fillStyle(color, heldSector ? 0.12 : 0.06);
        this.graphics.fillCircle(p.x, p.y, baseRadius * 3.2);
      }

      if (isStation) {
        this.drawStationGlyph(p, baseRadius, world, color, isSelected, phase);
      } else {
        this.drawPlanetGlyph(p, baseRadius, world, color, isSelected, phase);
      }

      // Capital ring — gold orbital ring
      if (world.isCapital) {
        this.graphics.lineStyle(1.6, 0xffd27a, 0.85);
        this.graphics.strokeCircle(p.x, p.y, baseRadius * 1.7);
        this.graphics.lineStyle(0.6, 0xffd27a, 0.45);
        this.graphics.strokeCircle(p.x, p.y, baseRadius * 2.05);
        // Gold spike crown — 4 short tick marks at compass points
        const tickR1 = baseRadius * 1.7;
        const tickR2 = baseRadius * 1.95;
        for (let i = 0; i < 4; i++) {
          const a = i * Math.PI / 2 + phase * 0.15;
          this.graphics.lineStyle(1.4, 0xffd27a, 0.9);
          this.graphics.lineBetween(
            p.x + Math.cos(a) * tickR1, p.y + Math.sin(a) * tickR1,
            p.x + Math.cos(a) * tickR2, p.y + Math.sin(a) * tickR2
          );
        }
      }

      // Invader corruption — pulsing violet rings
      if (world.isInvaderOrigin || sim.isInvader(world.owner)) {
        const pulse = 1 + Math.sin(phase * 2) * 0.08;
        this.graphics.lineStyle(world.isInvaderOrigin ? 2.4 : 1.4, INVADER_FACTION.color, world.isInvaderOrigin ? 0.95 : 0.7);
        this.graphics.strokeCircle(p.x, p.y, baseRadius * 2.2 * pulse);
        this.graphics.lineStyle(0.6, 0xffffff, 0.4);
        this.graphics.strokeCircle(p.x, p.y, baseRadius * 2.6 * pulse);
      }

      // Selection brass corner brackets
      if (isSelected) {
        const r = baseRadius * 1.85;
        const len = 7;
        this.graphics.lineStyle(2, 0xffe9b8, 1);
        // 4 corners with L-shaped brass brackets
        for (let i = 0; i < 4; i++) {
          const a = Math.PI / 4 + i * Math.PI / 2;
          const cx = p.x + Math.cos(a) * r;
          const cy = p.y + Math.sin(a) * r;
          // Two perpendicular short lines forming a corner bracket
          const ax = Math.cos(a + Math.PI / 4), ay = Math.sin(a + Math.PI / 4);
          const bx = Math.cos(a - Math.PI / 4), by = Math.sin(a - Math.PI / 4);
          this.graphics.lineBetween(cx, cy, cx - ax * len, cy - ay * len);
          this.graphics.lineBetween(cx, cy, cx - bx * len, cy - by * len);
        }
      }

      // Tier indicators — small chevrons stacked above the world (1=•, 2=ii, 3=iii, 4=skull)
      if (world.level > 1) {
        const tierColor = world.level === 4 ? INVADER_FACTION.color : world.level === 3 ? 0x9fe5ff : 0xffd27a;
        const cy = p.y - baseRadius - 10;
        const count = Math.min(world.level - 1, 3);
        for (let i = 0; i < count; i++) {
          const cx = p.x + (i - (count - 1) / 2) * 6;
          this.graphics.fillStyle(tierColor, 0.95);
          // Small diamond pip
          this.graphics.fillTriangle(cx, cy - 3, cx + 2.5, cy, cx, cy + 3);
          this.graphics.fillTriangle(cx, cy - 3, cx - 2.5, cy, cx, cy + 3);
        }
      }

      const label = this.getLabel(world.id);
      const yOffset = baseRadius + 18;
      label.setText(`${world.name}\n${world.ships}`);
      label.setPosition(p.x, p.y + yOffset);
      label.setColor(world.owner === NEUTRAL ? "#9fb0c8" : "#ffe9b8");
      label.setOrigin(0.5, 0);
      label.setVisible(this.hud.overlays.planetLabels);
    }

    drawPlanetGlyph(p, r, world, color, isSelected, phase) {
      // Outer iron-ring chassis
      this.graphics.lineStyle(1.5, 0x3a2e1c, 1);
      this.graphics.strokeCircle(p.x, p.y, r + 2);
      // Body fill
      const bodyColor = world.owner === NEUTRAL ? 0x2a3344 : color;
      this.graphics.fillStyle(bodyColor, world.owner === NEUTRAL ? 0.8 : 0.92);
      this.graphics.fillCircle(p.x, p.y, r);
      // Terminator shadow (right-bottom dark crescent)
      this.graphics.fillStyle(0x000000, 0.35);
      this.graphics.fillCircle(p.x + r * 0.28, p.y + r * 0.18, r * 0.85);
      // Highlight (top-left)
      this.graphics.fillStyle(0xffffff, 0.18);
      this.graphics.fillCircle(p.x - r * 0.32, p.y - r * 0.34, r * 0.4);
      // Surface texture — small dots like continents/craters
      const seed = (world.id || 'x').charCodeAt(0) + (world.id || 'x').length;
      for (let i = 0; i < 4; i++) {
        const a = (seed * 0.71 + i * 1.7) % (Math.PI * 2);
        const dr = r * (0.25 + ((seed + i) % 3) * 0.18);
        const sx = p.x + Math.cos(a) * dr;
        const sy = p.y + Math.sin(a) * dr;
        this.graphics.fillStyle(0x000000, 0.18);
        this.graphics.fillCircle(sx, sy, r * (0.08 + ((seed + i * 3) % 3) * 0.04));
      }
      // Owner ring — bright outer band
      if (world.owner !== NEUTRAL) {
        this.graphics.lineStyle(1.5, color, 0.95);
        this.graphics.strokeCircle(p.x, p.y, r + 0.5);
      }
      // Brass rivet at top
      this.graphics.fillStyle(0xc8a25b, 0.9);
      this.graphics.fillCircle(p.x, p.y - r - 2, 1.3);

      if (world.kind === "nebula") {
        // Wispy halo
        this.graphics.lineStyle(0.6, 0xb46cff, 0.5);
        this.graphics.strokeCircle(p.x, p.y, r + 6 + Math.sin(phase) * 1.2);
        this.graphics.strokeCircle(p.x - 2, p.y + 1, r + 4);
      }
    }

    drawStationGlyph(p, r, world, color, isSelected, phase) {
      const angle = phase * 0.4 + (world.id || '').length * 0.6;
      const bodyColor = world.owner === NEUTRAL ? 0x4a5566 : color;

      if (world.kind === "shipyard") {
        // Hexagonal shipyard — larger industrial frame
        this.drawHex(p.x, p.y, r + 3, 0x3a2e1c, 1.8, 1);
        this.drawHex(p.x, p.y, r, bodyColor, 0, 0.9, true);
        // Cross-bracing lines
        this.graphics.lineStyle(1, 0xc8a25b, 0.6);
        for (let i = 0; i < 3; i++) {
          const a = i * Math.PI / 3;
          this.graphics.lineBetween(p.x - Math.cos(a) * r, p.y - Math.sin(a) * r, p.x + Math.cos(a) * r, p.y + Math.sin(a) * r);
        }
        // Anchor rivet
        this.graphics.fillStyle(0xffd27a, 1);
        this.graphics.fillCircle(p.x, p.y, 2);
      } else if (world.kind === "gate") {
        // Hyperspace gate — rotating ring with inner gap
        this.graphics.lineStyle(2.5, 0x3a2e1c, 1);
        this.graphics.strokeCircle(p.x, p.y, r + 3);
        this.graphics.lineStyle(2, color, 0.95);
        this.graphics.strokeCircle(p.x, p.y, r + 3);
        // 4 rotating arc segments
        for (let i = 0; i < 4; i++) {
          const a = angle + i * Math.PI / 2;
          const x1 = p.x + Math.cos(a) * (r + 3);
          const y1 = p.y + Math.sin(a) * (r + 3);
          this.graphics.fillStyle(0xc8a25b, 1);
          this.graphics.fillCircle(x1, y1, 1.4);
        }
        // Inner glowing core
        this.graphics.fillStyle(0x9fe5ff, 0.6 + Math.sin(phase * 2) * 0.2);
        this.graphics.fillCircle(p.x, p.y, r * 0.5);
        this.graphics.fillStyle(0xffffff, 0.85);
        this.graphics.fillCircle(p.x, p.y, r * 0.22);
      } else if (world.kind === "fortress") {
        // Diamond-with-rivets fortress
        this.graphics.fillStyle(0x3a2e1c, 1);
        this.graphics.fillTriangle(p.x, p.y - r - 2, p.x + r + 2, p.y, p.x, p.y + r + 2);
        this.graphics.fillTriangle(p.x, p.y - r - 2, p.x - r - 2, p.y, p.x, p.y + r + 2);
        this.graphics.fillStyle(bodyColor, 0.92);
        this.graphics.fillTriangle(p.x, p.y - r, p.x + r, p.y, p.x, p.y + r);
        this.graphics.fillTriangle(p.x, p.y - r, p.x - r, p.y, p.x, p.y + r);
        // Center rivet + corner studs
        this.graphics.fillStyle(0xc8a25b, 1);
        this.graphics.fillCircle(p.x, p.y, 1.6);
        for (const [dx, dy] of [[0, -r * 0.7], [0, r * 0.7], [-r * 0.7, 0], [r * 0.7, 0]]) {
          this.graphics.fillCircle(p.x + dx, p.y + dy, 0.9);
        }
      } else {
        // Default station — square chassis with 4 antenna struts
        this.graphics.lineStyle(1.4, 0x3a2e1c, 1);
        this.graphics.strokeRect(p.x - r, p.y - r, r * 2, r * 2);
        this.graphics.fillStyle(bodyColor, 0.9);
        this.graphics.fillRect(p.x - r + 1, p.y - r + 1, r * 2 - 2, r * 2 - 2);
        // Inner cross
        this.graphics.lineStyle(0.7, 0xc8a25b, 0.7);
        this.graphics.lineBetween(p.x - r, p.y, p.x + r, p.y);
        this.graphics.lineBetween(p.x, p.y - r, p.x, p.y + r);
        // 4 antenna struts
        const sLen = 4;
        this.graphics.lineStyle(1, 0xc8a25b, 0.9);
        this.graphics.lineBetween(p.x - r, p.y - r, p.x - r - sLen, p.y - r - sLen);
        this.graphics.lineBetween(p.x + r, p.y - r, p.x + r + sLen, p.y - r - sLen);
        this.graphics.lineBetween(p.x - r, p.y + r, p.x - r - sLen, p.y + r + sLen);
        this.graphics.lineBetween(p.x + r, p.y + r, p.x + r + sLen, p.y + r + sLen);
        // Blinking comms light
        const blink = (Math.sin(phase * 3) + 1) * 0.5;
        this.graphics.fillStyle(0xff6c4a, 0.4 + blink * 0.6);
        this.graphics.fillCircle(p.x, p.y - r - sLen - 1, 1.4);
      }

      // Owner ring outside chassis
      if (world.owner !== NEUTRAL) {
        this.graphics.lineStyle(1, color, 0.7);
        this.graphics.strokeCircle(p.x, p.y, r + 5);
      }
    }

    drawHex(cx, cy, r, color, lineWidth, alpha, fillMode) {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 - Math.PI / 2;
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
      }
      if (fillMode) {
        this.graphics.fillStyle(color, alpha);
        this.graphics.beginPath();
        this.graphics.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < 6; i++) this.graphics.lineTo(pts[i].x, pts[i].y);
        this.graphics.closePath();
        this.graphics.fillPath();
      } else {
        this.graphics.lineStyle(lineWidth, color, alpha);
        this.graphics.beginPath();
        this.graphics.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < 6; i++) this.graphics.lineTo(pts[i].x, pts[i].y);
        this.graphics.closePath();
        this.graphics.strokePath();
      }
    }

    drawFleet(fleet, from, to) {
      const sim = this.shell.simulation;
      const fromPoint = projectPoint(from.x, from.y);
      const toPoint = projectPoint(to.x, to.y);
      const t = Phaser.Math.Clamp(fleet.progress, 0, 1);
      const x = Phaser.Math.Linear(fromPoint.x, toPoint.x, t);
      const y = Phaser.Math.Linear(fromPoint.y, toPoint.y, t);
      const color = colorFor(fleet.owner, sim.factions);
      const tier = fleet.tier || 1;
      const tierColor = tier === 4 ? INVADER_FACTION.color : tier === 3 ? 0x9fe5ff : tier === 2 ? COLORS.capital : 0xffffff;
      this.graphics.fillStyle(0x000000, 0.28);
      this.graphics.fillEllipse(x + 4, y + 13, 34, 10);
      this.graphics.lineStyle(8, tierColor, 0.12 + tier * 0.08);
      this.graphics.lineBetween(Phaser.Math.Linear(fromPoint.x, x, 0.78), Phaser.Math.Linear(fromPoint.y, y, 0.78), x, y);
      this.graphics.lineStyle(2, 0xffffff, 0.18 + tier * 0.08);
      this.graphics.lineBetween(Phaser.Math.Linear(fromPoint.x, x, 0.86), Phaser.Math.Linear(fromPoint.y, y, 0.86), x, y);
      this.graphics.fillStyle(color, 1);
      this.graphics.fillTriangle(x + 20, y, x - 13, y - 10, x - 8, y + 12);
      this.graphics.fillStyle(0xffffff, 0.35);
      this.graphics.fillTriangle(x + 10, y - 1, x - 8, y - 6, x - 5, y + 5);
      this.graphics.lineStyle(fleet.holdTime > 0 ? 4 : 2, fleet.holdTime > 0 ? COLORS.capital : tierColor, 0.9);
      this.graphics.strokeEllipse(x, y, 32, 20);

      const label = this.getFleetLabel(fleet.id);
      label.setText(`${fleet.ships} ${TIER_ROMAN[fleet.tier || 1]}`);
      label.setPosition(x, y - 8);
      label.setOrigin(0.5);
      label.setVisible(this.hud.overlays.fleetLabels);
    }

    hideLabels() {
      for (const label of this.labels.values()) label.setVisible(false);
      for (const label of this.fleetLabels.values()) label.setVisible(false);
    }

    findWorldAt(projectedX, projectedY) {
      return this.shell.simulation.worlds.find((world) => {
        const p = projectPoint(world.x, world.y);
        const rx = world.isCapital ? 48 : 40;
        const ry = world.isCapital ? 30 : 24;
        const dx = (projectedX - p.x) / rx;
        const dy = (projectedY - p.y) / ry;
        return dx * dx + dy * dy <= 1;
      }) || null;
    }

    getLabel(worldId) {
      if (this.labels.has(worldId)) return this.labels.get(worldId);
      const label = this.add.text(0, 0, "", {
        fontFamily: "'Share Tech Mono', 'JetBrains Mono', monospace",
        fontSize: "11px",
        fontStyle: "600",
        align: "center",
        lineSpacing: 3,
        stroke: "#000000",
        strokeThickness: 3
      }).setDepth(10);
      this.labels.set(worldId, label);
      return label;
    }

    getFleetLabel(fleetId) {
      if (this.fleetLabels.has(fleetId)) return this.fleetLabels.get(fleetId);
      const label = this.add.text(0, 0, "", {
        fontFamily: "'Share Tech Mono', 'JetBrains Mono', monospace",
        fontSize: "11px",
        fontStyle: "600",
        color: "#ffe9b8",
        stroke: "#000000",
        strokeThickness: 3
      }).setDepth(9);
      this.fleetLabels.set(fleetId, label);
      return label;
    }

    cleanupFleetLabels() {
      const activeIds = new Set(this.shell.simulation.fleets.map((fleet) => fleet.id));
      for (const [id, label] of this.fleetLabels) {
        if (!activeIds.has(id)) {
          label.destroy();
          this.fleetLabels.delete(id);
        }
      }
    }
  }

  window.addEventListener("load", () => {
    if (!window.Phaser) {
      document.getElementById("game-root").innerHTML = "<div class='load-error'>Phaser could not load. Check your internet connection and refresh.</div>";
      return;
    }

    new Phaser.Game({
      type: Phaser.AUTO,
      parent: "game-root",
      backgroundColor: "rgba(0,0,0,0)",
      transparent: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: window.innerWidth,
        height: window.innerHeight
      },
      scene: [ConquestScene]
    });
  });
})();
