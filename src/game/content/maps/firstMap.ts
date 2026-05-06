import type { MapDefinition } from "../../simulation/types";

export const firstMap: MapDefinition = {
  bases: [
    {
      id: "player-capital",
      name: "Fort Dawn",
      x: 110,
      y: 330,
      owner: "player",
      soldiers: 34,
      generationRate: 4,
      isCapital: true
    },
    {
      id: "west-mine",
      name: "Iron Mine",
      x: 235,
      y: 210,
      owner: "player",
      soldiers: 18,
      generationRate: 3
    },
    {
      id: "river-watch",
      name: "River Watch",
      x: 300,
      y: 430,
      owner: "neutral",
      soldiers: 16,
      generationRate: 2
    },
    {
      id: "central-bridge",
      name: "Central Bridge",
      x: 450,
      y: 320,
      owner: "neutral",
      soldiers: 24,
      generationRate: 5
    },
    {
      id: "north-pass",
      name: "North Pass",
      x: 545,
      y: 170,
      owner: "neutral",
      soldiers: 20,
      generationRate: 3
    },
    {
      id: "south-depot",
      name: "South Depot",
      x: 600,
      y: 475,
      owner: "neutral",
      soldiers: 22,
      generationRate: 4
    },
    {
      id: "east-foundry",
      name: "East Foundry",
      x: 745,
      y: 250,
      owner: "ai",
      soldiers: 20,
      generationRate: 3
    },
    {
      id: "ai-capital",
      name: "Citadel Ember",
      x: 865,
      y: 360,
      owner: "ai",
      soldiers: 36,
      generationRate: 4,
      isCapital: true
    }
  ],
  routes: [
    ["player-capital", "west-mine"],
    ["player-capital", "river-watch"],
    ["west-mine", "central-bridge"],
    ["west-mine", "north-pass"],
    ["river-watch", "central-bridge"],
    ["river-watch", "south-depot"],
    ["central-bridge", "north-pass"],
    ["central-bridge", "south-depot"],
    ["central-bridge", "east-foundry"],
    ["north-pass", "east-foundry"],
    ["south-depot", "ai-capital"],
    ["east-foundry", "ai-capital"]
  ]
};
