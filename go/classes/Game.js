import Board from "./Board";
import Player from "./Player";

class Game {
  board;
  whitePlayer;
  blackPlayer;
  constructor(element) {
    this.board = new Board(13, this);
    this.board.renderBoard(element);
    this.blackPlayer = new Player("Player 1", "black");
    this.whitePlayer = new Player("Player 2", "white");
    this.deadStones = new Set();
    this.stones = new Set();
  }
  getPlayer(color) {
    if (color === "white") {
      return this.whitePlayer;
    } else return this.blackPlayer;
  }
}

export default Game;
