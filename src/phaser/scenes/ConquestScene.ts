import Phaser from "phaser";
import { firstMap } from "../../game/content/maps/firstMap";
import { ConquestSimulation } from "../../game/simulation/ConquestSimulation";
import type { ArmyState, BaseState, Owner, SimulationSnapshot } from "../../game/simulation/types";
import { HudController } from "../../ui/HudController";

const WORLD_WIDTH = 980;
const WORLD_HEIGHT = 620;
const COLORS: Record<Owner, number> = {
  player: 0x4db5ff,
  ai: 0xe75b63,
  neutral: 0xa5b1bd
};

export class ConquestScene extends Phaser.Scene {
  private simulation!: ConquestSimulation;
  private hud!: HudController;
  private graphics!: Phaser.GameObjects.Graphics;
  private labels = new Map<string, Phaser.GameObjects.Text>();
  private armyLabels = new Map<string, Phaser.GameObjects.Text>();
  private lastSnapshot!: SimulationSnapshot;

  constructor() {
    super("ConquestScene");
  }

  create(): void {
    this.simulation = new ConquestSimulation(firstMap);
    this.graphics = this.add.graphics();
    this.cameras.main.setBackgroundColor(0x101820);
    this.scale.on("resize", this.resize, this);
    this.input.on("pointerdown", this.handlePointerDown, this);

    this.hud = new HudController({
      onPauseToggle: () => {
        const { state } = this.simulation.snapshot;
        this.simulation.setPaused(!state.paused);
      },
      onSpeedChange: (speed) => this.simulation.setSpeed(speed),
      onRestart: () => {
        this.simulation.restart();
        this.labels.clear();
        this.armyLabels.clear();
        this.children.removeAll(true);
        this.graphics = this.add.graphics();
      }
    });

    this.resize();
  }

  update(_time: number, delta: number): void {
    this.simulation.update(delta / 1000);
    this.lastSnapshot = this.simulation.snapshot;
    this.draw(this.lastSnapshot);
    this.hud.render(this.lastSnapshot.state, this.lastSnapshot.message);
  }

  destroy(): void {
    this.hud.destroy();
  }

  private resize(): void {
    const camera = this.cameras.main;
    const scale = Math.min(camera.width / WORLD_WIDTH, camera.height / WORLD_HEIGHT);
    camera.setZoom(scale);
    camera.centerOn(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.lastSnapshot) return;
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const clickedBase = this.findBaseAt(worldPoint.x, worldPoint.y, this.lastSnapshot.state.bases);
    if (clickedBase) {
      this.simulation.selectBase(clickedBase.id);
    }
  }

  private draw(snapshot: SimulationSnapshot): void {
    const { state } = snapshot;
    this.graphics.clear();
    this.drawRoutes(state.bases, state.routes);
    this.drawArmies(state.armies, state.bases);
    this.drawBases(state.bases, state.selectedBaseId);
    this.cleanupArmyLabels(state.armies);
  }

  private drawRoutes(bases: BaseState[], routes: [string, string][]): void {
    this.graphics.lineStyle(8, 0x263849, 0.85);
    for (const [fromId, toId] of routes) {
      const from = bases.find((base) => base.id === fromId);
      const to = bases.find((base) => base.id === toId);
      if (!from || !to) continue;
      this.graphics.lineBetween(from.x, from.y, to.x, to.y);
    }

    this.graphics.lineStyle(2, 0xdce8f6, 0.16);
    for (const [fromId, toId] of routes) {
      const from = bases.find((base) => base.id === fromId);
      const to = bases.find((base) => base.id === toId);
      if (!from || !to) continue;
      this.graphics.lineBetween(from.x, from.y, to.x, to.y);
    }
  }

  private drawBases(bases: BaseState[], selectedBaseId: string | null): void {
    for (const base of bases) {
      const radius = base.isCapital ? 36 : 30;
      const isSelected = base.id === selectedBaseId;

      this.graphics.fillStyle(0x000000, 0.24);
      this.graphics.fillCircle(base.x + 4, base.y + 6, radius + 4);
      this.graphics.fillStyle(COLORS[base.owner], 1);
      this.graphics.fillCircle(base.x, base.y, radius);
      this.graphics.lineStyle(isSelected ? 5 : 3, base.isCapital ? 0xf0b35a : 0xf4f7fb, isSelected ? 1 : 0.65);
      this.graphics.strokeCircle(base.x, base.y, radius);

      if (base.isCapital) {
        this.graphics.lineStyle(2, 0xf0b35a, 0.9);
        this.graphics.strokeCircle(base.x, base.y, radius + 8);
      }

      const label = this.getLabel(base.id);
      label.setText(`${base.soldiers}\n${base.name}`);
      label.setPosition(base.x, base.y - 12);
      label.setColor(base.owner === "neutral" ? "#16202b" : "#ffffff");
      label.setOrigin(0.5);
    }
  }

  private drawArmies(armies: ArmyState[], bases: BaseState[]): void {
    for (const army of armies) {
      const from = bases.find((base) => base.id === army.from);
      const to = bases.find((base) => base.id === army.to);
      if (!from || !to) continue;

      const t = Phaser.Math.Clamp(army.progress, 0, 1);
      const x = Phaser.Math.Linear(from.x, to.x, t);
      const y = Phaser.Math.Linear(from.y, to.y, t);

      this.graphics.fillStyle(COLORS[army.owner], 1);
      this.graphics.fillCircle(x, y, 16);
      this.graphics.lineStyle(2, 0xffffff, 0.8);
      this.graphics.strokeCircle(x, y, 16);

      const label = this.getArmyLabel(army.id);
      label.setText(String(army.soldiers));
      label.setPosition(x, y - 8);
      label.setOrigin(0.5);
    }
  }

  private findBaseAt(x: number, y: number, bases: BaseState[]): BaseState | null {
    return (
      bases.find((base) => Phaser.Math.Distance.Between(x, y, base.x, base.y) <= (base.isCapital ? 42 : 36)) ?? null
    );
  }

  private getLabel(baseId: string): Phaser.GameObjects.Text {
    const existing = this.labels.get(baseId);
    if (existing) return existing;

    const label = this.add
      .text(0, 0, "", {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "14px",
        fontStyle: "700",
        align: "center",
        lineSpacing: 4
      })
      .setDepth(10);
    this.labels.set(baseId, label);
    return label;
  }

  private getArmyLabel(armyId: string): Phaser.GameObjects.Text {
    const existing = this.armyLabels.get(armyId);
    if (existing) return existing;

    const label = this.add
      .text(0, 0, "", {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "13px",
        fontStyle: "800",
        color: "#ffffff"
      })
      .setDepth(9);
    this.armyLabels.set(armyId, label);
    return label;
  }

  private cleanupArmyLabels(armies: ArmyState[]): void {
    const activeIds = new Set(armies.map((army) => army.id));
    for (const [id, label] of this.armyLabels) {
      if (!activeIds.has(id)) {
        label.destroy();
        this.armyLabels.delete(id);
      }
    }
  }
}
