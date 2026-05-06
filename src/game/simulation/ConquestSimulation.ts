import type {
  ArmyState,
  BaseState,
  GameState,
  MapDefinition,
  Owner,
  SimulationSnapshot
} from "./types";

const ECONOMY_INTERVAL = 2.25;
const AI_INTERVAL = 2.8;
const TRAVEL_SECONDS = 3.1;
const MIN_ATTACKING_SOLDIERS = 2;

export class ConquestSimulation {
  private state: GameState;
  private economyClock = 0;
  private aiClock = 1.2;
  private nextArmyId = 1;
  private message = "Select one of your bases, then choose a connected target.";

  constructor(private readonly map: MapDefinition) {
    this.state = this.createInitialState(map);
  }

  get snapshot(): SimulationSnapshot {
    return {
      state: this.cloneState(),
      message: this.message
    };
  }

  setPaused(paused: boolean): void {
    this.state.paused = paused;
    this.message = paused ? "Paused. Orders are held until play resumes." : "Command is live.";
  }

  setSpeed(speed: number): void {
    this.state.speed = speed;
  }

  restart(): void {
    this.state = this.createInitialState(this.map);
    this.economyClock = 0;
    this.aiClock = 1.2;
    this.nextArmyId = 1;
    this.message = "New battle. Secure the bridge and push toward the enemy capital.";
  }

  selectBase(baseId: string): void {
    if (this.state.status !== "playing") return;
    const base = this.getBase(baseId);
    if (!base) return;

    if (base.owner === "player") {
      const selected = this.state.selectedBaseId;
      if (selected && selected !== baseId && this.areConnected(selected, baseId)) {
        this.sendArmy(selected, baseId, "player");
        return;
      }

      this.state.selectedBaseId = baseId;
      this.message = `${base.name} selected. Choose a connected base to send half its troops.`;
      return;
    }

    const selected = this.state.selectedBaseId;
    if (selected) {
      this.sendArmy(selected, baseId, "player");
    }
  }

  sendArmy(fromId: string, toId: string, owner: Exclude<Owner, "neutral">): boolean {
    if (this.state.status !== "playing") return false;
    if (!this.areConnected(fromId, toId)) {
      if (owner === "player") this.message = "That target is not connected by a route.";
      return false;
    }

    const from = this.getBase(fromId);
    const to = this.getBase(toId);
    if (!from || !to || from.owner !== owner) return false;

    const soldiers = Math.floor(from.soldiers / 2);
    if (soldiers < MIN_ATTACKING_SOLDIERS) {
      if (owner === "player") this.message = `${from.name} needs more soldiers before it can attack.`;
      return false;
    }

    from.soldiers -= soldiers;
    this.state.armies.push({
      id: `army-${this.nextArmyId++}`,
      owner,
      from: fromId,
      to: toId,
      soldiers,
      progress: 0,
      duration: TRAVEL_SECONDS
    });

    if (owner === "player") {
      this.state.selectedBaseId = null;
      this.message = `${soldiers} soldiers marching from ${from.name} to ${to.name}.`;
    }

    return true;
  }

  update(deltaSeconds: number): void {
    if (this.state.paused || this.state.status !== "playing") return;

    const scaledDelta = deltaSeconds * this.state.speed;
    this.state.elapsed += scaledDelta;
    this.updateEconomy(scaledDelta);
    this.updateArmies(scaledDelta);
    this.updateAi(scaledDelta);
  }

  private updateEconomy(deltaSeconds: number): void {
    this.economyClock += deltaSeconds;
    while (this.economyClock >= ECONOMY_INTERVAL) {
      this.economyClock -= ECONOMY_INTERVAL;
      for (const base of this.state.bases) {
        if (base.owner !== "neutral") {
          base.soldiers += base.generationRate;
        }
      }
    }
  }

  private updateArmies(deltaSeconds: number): void {
    for (const army of this.state.armies) {
      army.progress += deltaSeconds / army.duration;
    }

    const arrived = this.state.armies.filter((army) => army.progress >= 1);
    this.state.armies = this.state.armies.filter((army) => army.progress < 1);

    for (const army of arrived) {
      this.resolveArrival(army);
      if (this.state.status !== "playing") return;
    }
  }

  private resolveArrival(army: ArmyState): void {
    const target = this.getBase(army.to);
    if (!target) return;

    if (target.owner === army.owner) {
      target.soldiers += army.soldiers;
      return;
    }

    if (army.soldiers > target.soldiers) {
      const remaining = army.soldiers - target.soldiers;
      const previousOwner = target.owner;
      target.owner = army.owner;
      target.soldiers = remaining;
      this.handleCapture(target, previousOwner);
      return;
    }

    target.soldiers -= army.soldiers;
    if (target.soldiers === 0) {
      target.owner = "neutral";
    }
  }

  private handleCapture(base: BaseState, previousOwner: Owner): void {
    if (base.isCapital && previousOwner === "ai" && base.owner === "player") {
      this.state.status = "playerWon";
      this.message = "Victory. You captured Citadel Ember.";
      return;
    }

    if (base.isCapital && previousOwner === "player" && base.owner === "ai") {
      this.state.status = "aiWon";
      this.message = "Defeat. Fort Dawn has fallen.";
      return;
    }

    if (base.owner === "player") {
      this.message = `${base.name} captured. Keep the pressure on.`;
    }
  }

  private updateAi(deltaSeconds: number): void {
    this.aiClock += deltaSeconds;
    if (this.aiClock < AI_INTERVAL) return;
    this.aiClock = 0;

    const aiBases = this.state.bases
      .filter((base) => base.owner === "ai" && base.soldiers >= 10)
      .sort((a, b) => b.soldiers - a.soldiers);

    for (const source of aiBases) {
      const target = this.chooseAiTarget(source);
      if (target && this.sendArmy(source.id, target.id, "ai")) {
        return;
      }
    }
  }

  private chooseAiTarget(source: BaseState): BaseState | null {
    const neighbors = this.getNeighbors(source.id)
      .map((id) => this.getBase(id))
      .filter((base): base is BaseState => Boolean(base));

    const playerCapital = neighbors.find((base) => base.owner === "player" && base.isCapital);
    if (playerCapital && source.soldiers > playerCapital.soldiers + 8) {
      return playerCapital;
    }

    const weakEnemy = neighbors
      .filter((base) => base.owner !== "ai" && source.soldiers > base.soldiers + 4)
      .sort((a, b) => this.aiTargetScore(b) - this.aiTargetScore(a))[0];

    if (weakEnemy) return weakEnemy;

    const weakestAiNeighbor = neighbors
      .filter((base) => base.owner === "ai" && base.soldiers < source.soldiers - 12)
      .sort((a, b) => a.soldiers - b.soldiers)[0];

    return weakestAiNeighbor ?? null;
  }

  private aiTargetScore(base: BaseState): number {
    let score = base.generationRate * 3 - base.soldiers;
    if (base.owner === "player") score += 12;
    if (base.isCapital) score += 40;
    return score;
  }

  private createInitialState(map: MapDefinition): GameState {
    return {
      bases: map.bases.map((base) => ({
        ...base,
        isCapital: Boolean(base.isCapital)
      })),
      routes: map.routes.map(([a, b]) => [a, b] as [string, string]),
      armies: [],
      paused: false,
      speed: 1,
      status: "playing",
      selectedBaseId: null,
      elapsed: 0
    };
  }

  private areConnected(a: string, b: string): boolean {
    return this.state.routes.some(([from, to]) => (from === a && to === b) || (from === b && to === a));
  }

  private getNeighbors(baseId: string): string[] {
    return this.state.routes.flatMap(([a, b]) => {
      if (a === baseId) return [b];
      if (b === baseId) return [a];
      return [];
    });
  }

  private getBase(baseId: string): BaseState | undefined {
    return this.state.bases.find((base) => base.id === baseId);
  }

  private cloneState(): GameState {
    return {
      ...this.state,
      bases: this.state.bases.map((base) => ({ ...base })),
      routes: this.state.routes.map(([a, b]) => [a, b] as [string, string]),
      armies: this.state.armies.map((army) => ({ ...army }))
    };
  }
}
