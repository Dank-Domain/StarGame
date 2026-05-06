import { describe, expect, it } from "vitest";
import { ConquestSimulation } from "./ConquestSimulation";
import type { MapDefinition } from "./types";

const testMap: MapDefinition = {
  bases: [
    {
      id: "p",
      name: "Player Capital",
      x: 0,
      y: 0,
      owner: "player",
      soldiers: 20,
      generationRate: 3,
      isCapital: true
    },
    {
      id: "n",
      name: "Neutral",
      x: 10,
      y: 0,
      owner: "neutral",
      soldiers: 5,
      generationRate: 9
    },
    {
      id: "a",
      name: "AI Capital",
      x: 20,
      y: 0,
      owner: "ai",
      soldiers: 7,
      generationRate: 2,
      isCapital: true
    }
  ],
  routes: [
    ["p", "n"],
    ["n", "a"]
  ]
};

describe("ConquestSimulation", () => {
  it("generates troops only for owned bases", () => {
    const sim = new ConquestSimulation(testMap);
    sim.update(2.3);

    const state = sim.snapshot.state;
    expect(state.bases.find((base) => base.id === "p")?.soldiers).toBe(23);
    expect(state.bases.find((base) => base.id === "a")?.soldiers).toBe(9);
    expect(state.bases.find((base) => base.id === "n")?.soldiers).toBe(5);
  });

  it("sends troops only along valid connected routes", () => {
    const sim = new ConquestSimulation(testMap);

    expect(sim.sendArmy("p", "a", "player")).toBe(false);
    expect(sim.snapshot.state.armies).toHaveLength(0);

    expect(sim.sendArmy("p", "n", "player")).toBe(true);
    expect(sim.snapshot.state.armies).toHaveLength(1);
    expect(sim.snapshot.state.bases.find((base) => base.id === "p")?.soldiers).toBe(10);
  });

  it("captures bases through simple subtraction combat", () => {
    const sim = new ConquestSimulation(testMap);
    sim.sendArmy("p", "n", "player");
    sim.update(3.2);

    const neutral = sim.snapshot.state.bases.find((base) => base.id === "n");
    expect(neutral?.owner).toBe("player");
    expect(neutral?.soldiers).toBe(5);
  });

  it("pauses economy, movement, combat, and AI decisions", () => {
    const sim = new ConquestSimulation(testMap);
    sim.sendArmy("p", "n", "player");
    sim.setPaused(true);
    sim.update(10);

    const state = sim.snapshot.state;
    expect(state.armies).toHaveLength(1);
    expect(state.armies[0].progress).toBe(0);
    expect(state.bases.find((base) => base.id === "p")?.soldiers).toBe(10);
  });

  it("ends the match when a capital is captured", () => {
    const capitalMap: MapDefinition = {
      bases: [
        {
          id: "p",
          name: "Player Capital",
          x: 0,
          y: 0,
          owner: "player",
          soldiers: 30,
          generationRate: 0,
          isCapital: true
        },
        {
          id: "a",
          name: "AI Capital",
          x: 10,
          y: 0,
          owner: "ai",
          soldiers: 4,
          generationRate: 0,
          isCapital: true
        }
      ],
      routes: [["p", "a"]]
    };
    const sim = new ConquestSimulation(capitalMap);
    sim.sendArmy("p", "a", "player");
    sim.update(3.2);

    expect(sim.snapshot.state.status).toBe("playerWon");
  });
});
