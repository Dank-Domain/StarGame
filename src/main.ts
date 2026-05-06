import Phaser from "phaser";
import { ConquestScene } from "./phaser/scenes/ConquestScene";
import "./style.css";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-root",
  backgroundColor: "#101820",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight
  },
  scene: [ConquestScene]
};

new Phaser.Game(config);
