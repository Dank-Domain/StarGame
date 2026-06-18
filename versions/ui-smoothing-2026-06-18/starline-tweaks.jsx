// Starline Conquest — Tweaks
// Lets the user customize fonts, accent colors, and visual feel.

const STARLINE_DEFAULTS = /*EDITMODE-BEGIN*/{
  "fontPair": "handoff",
  "accent": "#e8c879",
  "nebulaIntensity": 0.55,
  "starDensity": "regular",
  "showShootingStars": true,
  "uiDensity": "regular",
  "panelOpacity": 0.92
}/*EDITMODE-END*/;

const FONT_PAIRS = {
  handoff: {
    label: "Cinzel · Cormorant · JetBrains",
    googleHref: "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=JetBrains+Mono:wght@400;500;700&family=Share+Tech+Mono&display=swap",
    display: "'Cinzel', serif",
    body: "'Cormorant Garamond', serif",
    mono: "'JetBrains Mono', 'Share Tech Mono', monospace"
  },
  orbitron: {
    label: "Orbitron · Sci-Fi Geometric",
    googleHref: "https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800;900&family=Exo+2:ital,wght@0,400;0,500;0,600;1,400&family=Share+Tech+Mono&display=swap",
    display: "'Orbitron', sans-serif",
    body: "'Exo 2', sans-serif",
    mono: "'Share Tech Mono', monospace"
  },
  michroma: {
    label: "Michroma · Wide Tech",
    googleHref: "https://fonts.googleapis.com/css2?family=Michroma&family=Rajdhani:wght@400;500;600;700&family=VT323&display=swap",
    display: "'Michroma', sans-serif",
    body: "'Rajdhani', sans-serif",
    mono: "'VT323', monospace"
  },
  audiowide: {
    label: "Audiowide · Retro Arcade",
    googleHref: "https://fonts.googleapis.com/css2?family=Audiowide&family=Saira:wght@400;500;600;700&family=Major+Mono+Display&display=swap",
    display: "'Audiowide', sans-serif",
    body: "'Saira', sans-serif",
    mono: "'Major Mono Display', monospace"
  },
  syncopate: {
    label: "Syncopate · Imperial",
    googleHref: "https://fonts.googleapis.com/css2?family=Syncopate:wght@400;700&family=Titillium+Web:wght@300;400;600;700&family=Space+Mono:wght@400;700&display=swap",
    display: "'Syncopate', sans-serif",
    body: "'Titillium Web', sans-serif",
    mono: "'Space Mono', monospace"
  },
  jura: {
    label: "Jura · Soft Future",
    googleHref: "https://fonts.googleapis.com/css2?family=Jura:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Fira+Code&display=swap",
    display: "'Jura', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'Fira Code', monospace"
  }
};

const ACCENT_OPTIONS = [
  "#e8c879", // brass (default)
  "#6cb4d6", // imperial blue
  "#9f7ad8", // royal violet
  "#5fc0a0", // jade
  "#d75c4a", // crimson
];

const DENSITY_SCALE = {
  compact: 0.88,
  regular: 1.0,
  comfy: 1.12
};

function loadFontStylesheet(href, id) {
  const existingId = id || 'tweaks-font-link';
  let link = document.getElementById(existingId);
  if (!link) {
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.id = existingId;
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
}

function applyTweaks(t) {
  const root = document.documentElement;
  const pair = FONT_PAIRS[t.fontPair] || FONT_PAIRS.handoff;
  loadFontStylesheet(pair.googleHref);
  root.style.setProperty('--font-display', pair.display);
  root.style.setProperty('--font-body', pair.body);
  root.style.setProperty('--font-mono', pair.mono);

  // Accent — recompute brass-1/2/3 based on accent hue
  root.style.setProperty('--brass-1', t.accent);

  // Nebula
  root.style.setProperty('--nebula-opacity', t.nebulaIntensity);

  // Star density
  const layerOpacity = { sparse: 0.4, regular: 1, dense: 1.6 }[t.starDensity] || 1;
  root.style.setProperty('--star-opacity', layerOpacity);

  // UI density (scales padding/text via root font-size baseline)
  root.style.setProperty('--ui-scale', DENSITY_SCALE[t.uiDensity] || 1);

  // Panel opacity
  root.style.setProperty('--panel-opacity', t.panelOpacity);

  // Shooting stars
  document.querySelectorAll('.shooting-star').forEach(el => {
    el.style.display = t.showShootingStars ? '' : 'none';
  });
}

function StarlineTweaks() {
  const [t, setTweak] = useTweaks(STARLINE_DEFAULTS);

  React.useEffect(() => { applyTweaks(t); }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Typography" />
      <TweakSelect
        label="Font system"
        value={t.fontPair}
        options={Object.entries(FONT_PAIRS).map(([k, v]) => ({ value: k, label: v.label }))}
        onChange={(v) => setTweak('fontPair', v)}
      />

      <TweakSection label="Color" />
      <TweakColor
        label="Accent"
        value={t.accent}
        options={ACCENT_OPTIONS}
        onChange={(v) => setTweak('accent', v)}
      />

      <TweakSection label="Cosmos" />
      <TweakSlider
        label="Nebula intensity"
        value={t.nebulaIntensity}
        min={0} max={1} step={0.05}
        onChange={(v) => setTweak('nebulaIntensity', v)}
      />
      <TweakSelect
        label="Starfield"
        value={t.starDensity}
        options={[
          { value: 'sparse', label: 'Sparse' },
          { value: 'regular', label: 'Regular' },
          { value: 'dense', label: 'Dense' }
        ]}
        onChange={(v) => setTweak('starDensity', v)}
      />
      <TweakToggle
        label="Shooting stars"
        value={t.showShootingStars}
        onChange={(v) => setTweak('showShootingStars', v)}
      />

      <TweakSection label="Interface" />
      <TweakRadio
        label="Density"
        value={t.uiDensity}
        options={['compact', 'regular', 'comfy']}
        onChange={(v) => setTweak('uiDensity', v)}
      />
      <TweakSlider
        label="Panel opacity"
        value={t.panelOpacity}
        min={0.6} max={1} step={0.02}
        onChange={(v) => setTweak('panelOpacity', v)}
      />
    </TweaksPanel>
  );
}

const __tweaksRoot = document.createElement('div');
__tweaksRoot.id = 'starline-tweaks-root';
document.body.appendChild(__tweaksRoot);
ReactDOM.createRoot(__tweaksRoot).render(<StarlineTweaks />);
