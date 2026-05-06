import type { GameState } from "../game/simulation/types";

interface HudCallbacks {
  onPauseToggle: () => void;
  onSpeedChange: (speed: number) => void;
  onRestart: () => void;
}

export class HudController {
  private readonly root: HTMLElement;
  private readonly playButton: HTMLButtonElement;
  private readonly restartButton: HTMLButtonElement;
  private readonly speedSelect: HTMLSelectElement;
  private readonly statusText: HTMLDivElement;
  private readonly hud: HTMLDivElement;

  constructor(callbacks: HudCallbacks) {
    const hudRoot = document.getElementById("hud-root");
    if (!hudRoot) {
      throw new Error("Missing #hud-root element.");
    }

    this.root = hudRoot;
    this.root.innerHTML = "";
    this.hud = document.createElement("div");
    this.hud.className = "hud";

    const controls = document.createElement("div");
    controls.className = "hud-panel";

    this.playButton = document.createElement("button");
    this.playButton.type = "button";
    this.playButton.textContent = "Pause";
    this.playButton.addEventListener("click", callbacks.onPauseToggle);

    this.restartButton = document.createElement("button");
    this.restartButton.type = "button";
    this.restartButton.className = "restart";
    this.restartButton.textContent = "Restart";
    this.restartButton.addEventListener("click", callbacks.onRestart);

    this.speedSelect = document.createElement("select");
    for (const speed of [0.75, 1, 1.5, 2]) {
      const option = document.createElement("option");
      option.value = String(speed);
      option.textContent = `${speed}x`;
      if (speed === 1) option.selected = true;
      this.speedSelect.append(option);
    }
    this.speedSelect.addEventListener("change", () => callbacks.onSpeedChange(Number(this.speedSelect.value)));

    controls.append(this.playButton, this.speedSelect, this.restartButton);

    this.statusText = document.createElement("div");
    this.statusText.className = "hud-panel hud-status";

    this.hud.append(controls, this.statusText);
    this.root.append(this.hud, this.createLegend());
  }

  render(state: GameState, message: string): void {
    this.playButton.textContent = state.paused ? "Play" : "Pause";
    this.speedSelect.value = String(state.speed);
    this.hud.classList.toggle("ended", state.status !== "playing");

    const selected = state.bases.find((base) => base.id === state.selectedBaseId);
    const status =
      state.status === "playerWon"
        ? "Victory secured."
        : state.status === "aiWon"
          ? "Capital lost."
          : selected
            ? `Selected: ${selected.name} (${selected.soldiers})`
            : "No base selected";

    this.statusText.textContent = `${status} ${message}`;
  }

  destroy(): void {
    this.root.innerHTML = "";
  }

  private createLegend(): HTMLElement {
    const legend = document.createElement("div");
    legend.className = "legend";
    const items = [
      ["#4db5ff", "Player"],
      ["#e75b63", "AI"],
      ["#a5b1bd", "Neutral"],
      ["#f0b35a", "Capital"]
    ];

    for (const [color, label] of items) {
      const item = document.createElement("span");
      const swatch = document.createElement("i");
      swatch.style.background = color;
      item.append(swatch, label);
      legend.append(item);
    }

    return legend;
  }
}
