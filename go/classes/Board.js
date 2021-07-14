import Position from "./Position";
import _ from "lodash";

class Board {
  size;
  gutter = 50;
  positions;
  stones;
  groups;
  capturedStones = [];
  deltas = [
    new Position(1, 0),
    new Position(0, 1),
    new Position(-1, 0),
    new Position(0, -1),
  ];
  nextDeltas = [new Position(1, 0), new Position(0, 1)];
  anchorPositions;
  consecutivePasses = 0;
  game;
  turn;
  history = [];

  constructor(size, game) {
    this.size = size;
    this.anchorPositions = [
      new Position(3, 3),
      new Position(3, size - 4),
      new Position(Math.ceil(size / 2) - 1, Math.ceil(size / 2) - 1),
      new Position(size - 4, 3),
      new Position(size - 4, size - 4),
    ];
    console.log(this.anchorPositions);
    this.game = game;
    this.turn = "black";
    this.stones = Array.from({ length: size }).map((_) =>
      Array.from({ length: size })
    );
    const range = Array.from({ length: size }).map((_, i) => i);
    this.positions = [];
    range.forEach((x) =>
      range.forEach((y) => this.positions.push(new Position(x, y)))
    );
  }

  switchTurns() {
    this.turn = this.turn === "black" ? "white" : "black";
  }

  addPositions(a, b) {
    return new Position(a.x + b.x, a.y + b.y);
  }

  positionInBounds(position) {
    const x = position.x;
    const y = position.y;
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  calculateStoneLiberties(stone) {
    stone.liberties = [];
    const neighbors = this.getNeighbors(stone.position);
    neighbors.forEach((position) => {
      if (!this.stones[position.x][position.y]) {
        stone.addLiberty(position);
      }
    });
  }

  calculateBoardLiberties() {
    this.stones.forEach((col) => {
      col.forEach((stone) => {
        if (stone) {
          if (stone) {
            this.calculateStoneLiberties(stone);
          }
        }
      });
    });
  }

  checkAndCapturedStones() {
    this.stones.forEach((col) => {
      col.forEach((stone) => {
        if (stone) {
          if (stone.group) {
            if (stone.group.liberties.length === 0) {
              this.captureStone(stone.position);
              return;
            }
          } else if (stone.liberties.length === 0) {
            this.captureStone(stone.position);
          }
        }
      });
    });
    this.positions.forEach((position) => {});
  }

  captureStone(position) {
    let capturedStone = this.stones[position.x][position.y];
    console.log(position);
    console.log(capturedStone);
    this.capturedStones.push(capturedStone);
    this.stones[position.x][position.y] = undefined;
  }

  checkIfMoveLegal(position) {
    let legal = true;
    const neighbours = this.getNeighbors(position);
    if (this.stones[position.x][position.y]) {
      return false;
    }
    legal &= !neighbours.every((pos) => {
      return (
        this.stones[pos.x][pos.y]?.color === this.getOppositeColor(this.turn)
      );
    });
    return legal;
  }

  getStoneUI(position, color, ghost) {
    let stone = document.createElementNS("http://www.w3.org/2000/svg", "image");
    stone.id = ghost
      ? `${position.x}-${position.y}-ghost`
      : `${position.x}-${position.y}-stone`;
    stone.setAttributeNS(null, "x", `${position.x * this.gutter}`);
    stone.setAttributeNS(null, "y", `${position.y * this.gutter}`);
    stone.setAttributeNS(null, "height", `${this.gutter}`);
    stone.setAttributeNS(null, "width", `${this.gutter}`);
    if (color === "black") {
      stone.setAttribute("href", "../assets/balck.png");
    } else {
      stone.setAttribute("href", "../assets/white.png");
    }
    let opacity = ghost ? 0.75 : 1;
    stone.setAttributeNS(null, "opacity", `${opacity}`);
    stone.addEventListener("click", (e) => {
      if (!ghost) {
        alert("You can't place stone here!");
      }
    });
    return stone;
  }

  showStonePlacement(position, moved = false) {
    if (this.stones[position.x][position.y]) {
      if (moved) {
        alert("You can't place stone here!");
      }
      return false;
    } else {
      if (!this.checkIfMoveLegal(position)) {
        return false;
      }
    }
    let stone = this.getStoneUI(position, this.turn, !moved);
    if (moved) {
      document.getElementById("board").appendChild(stone);
    } else {
      document
        .getElementById("background")
        .insertAdjacentElement("afterend", stone);
    }
    return true;
  }

  hideStonePlacement(position) {
    document.getElementById(`${position.x}-${position.y}-ghost`)?.remove?.();
  }

  getNeighbors(position) {
    return this.deltas
      .map((d) => this.addPositions(position, d))
      .filter((p) => this.positionInBounds(p));
  }

  getNextNeighbors(position) {
    return this.nextDeltas
      .map((d) => this.addPositions(position, d))
      .filter((p) => this.positionInBounds(p));
  }

  handleClick(position, e) {
    if (!this.showStonePlacement(position, true)) return;
    let stonePlayed = this.game.getPlayer(this.turn).placeStone();
    stonePlayed.position = position;
    this.stones[position.x][position.y] = stonePlayed;
    let { history, game, positions, ...historyItem } = this;
    this.calculateBoardLiberties();
    this.checkAndCapturedStones();
    this.history.push(_.cloneDeep(historyItem));
    e.target.setAttributeNS(null, "cursor", "no-drop");
    this.switchTurns();
    this.renderBoard();
  }

  renderCell(position, board) {
    let neighbours = this.getNextNeighbors(position);
    let offset = this.gutter * 0.5;
    neighbours.forEach((pos) => {
      let xOffset = position.x === pos.x ? 0 : 0.5;
      let yOffset = position.y === pos.y ? 0 : 0.5;
      let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.id = `line:${position.x}-${position.y}:${pos.x}-${pos.y}`;
      line.setAttributeNS(
        null,
        "x1",
        position.x * this.gutter + offset - xOffset
      );
      line.setAttributeNS(
        null,
        "y1",
        position.y * this.gutter + offset - yOffset
      );
      line.setAttributeNS(null, "x2", pos.x * this.gutter + offset + xOffset);
      line.setAttributeNS(null, "y2", pos.y * this.gutter + offset + yOffset);
      line.setAttributeNS(null, "stroke", "rgb(0,0,0)");
      line.setAttributeNS(null, "stroke-width", 3);
      board.appendChild(line);
    });
    let square = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    square.id = `x:${position.x};y:${position.y}`;
    square.setAttributeNS(null, "width", this.gutter);
    square.setAttributeNS(null, "height", this.gutter);
    square.setAttributeNS(null, "x", position.x * this.gutter);
    square.setAttributeNS(null, "y", position.y * this.gutter);
    square.setAttributeNS(null, "fill", "rgba(0,0,0,0)");
    square.addEventListener("mouseenter", (e) => {
      this.showStonePlacement(position);
    });
    square.addEventListener("mouseleave", (e) => {
      this.hideStonePlacement(position);
    });

    square.addEventListener("click", (e) => {
      this.handleClick(position, e);
    });

    board.appendChild(square);
    if (this.stones?.[position.x]?.[position.y]) {
      let stone = this.getStoneUI(
        position,
        this.stones[position.x][position.y].color,
        false
      );
      board.appendChild(stone);
    }
  }

  renderBoard() {
    const element = document.getElementById("app");
    document.getElementById("board")?.remove?.();
    let board = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    board.id = "board";
    board.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    board.setAttributeNS(null, "width", this.size * this.gutter);
    board.setAttributeNS(null, "height", this.size * this.gutter);
    board.setAttributeNS(
      null,
      "background-size",
      `${this.size * this.gutter}px ${this.size * this.gutter}px`
    );
    board.setAttributeNS(
      null,
      "viewBox",
      `0 0 ${this.size * this.gutter} ${this.size * this.gutter}`
    );
    board.innerHTML = `<image id="background" width="2400" height="1600" xlink:href="../assets/wood-2.jpeg" style="filter: blur(2px); -webkit-filter: blur(2px);" />`;
    element.appendChild(board);
    this.anchorPositions.forEach((position) => {
      let offset = this.gutter * 0.5;
      board.innerHTML += `<circle cx="${
        position.x * this.gutter + offset
      }" cy="${position.y * this.gutter + offset}" r="5" fill="black" />`;
    });
    this.positions.forEach((position) => this.renderCell(position, board));
  }

  getScore() {
    return 0;
  }

  isPreviousBoardState() {
    return this.history.some((board) => compareBoardStates(board.stones));
  }

  compareBoardStates(stones) {
    return this.positions.some((position) =>
      this.stones[position.x][position.y].equals(stones[position.x][position.y])
    );
  }

  getOppositeColor(color) {
    if (color === "white") {
      return "black";
    } else {
      return "white";
    }
  }
}

export default Board;
