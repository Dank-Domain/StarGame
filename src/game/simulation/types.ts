export type Owner = "player" | "ai" | "neutral";
export type GameStatus = "playing" | "playerWon" | "aiWon";

export interface BaseDefinition {
  id: string;
  name: string;
  x: number;
  y: number;
  owner: Owner;
  soldiers: number;
  generationRate: number;
  isCapital?: boolean;
}

export interface MapDefinition {
  bases: BaseDefinition[];
  routes: [string, string][];
}

export interface BaseState extends BaseDefinition {
  isCapital: boolean;
}

export interface ArmyState {
  id: string;
  owner: Exclude<Owner, "neutral">;
  from: string;
  to: string;
  soldiers: number;
  progress: number;
  duration: number;
}

export interface GameState {
  bases: BaseState[];
  routes: [string, string][];
  armies: ArmyState[];
  paused: boolean;
  speed: number;
  status: GameStatus;
  selectedBaseId: string | null;
  elapsed: number;
}

export interface SimulationSnapshot {
  state: GameState;
  message: string;
}
