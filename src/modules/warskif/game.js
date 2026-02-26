class Skif {
  #length;
  #hits;
  #name;

  constructor(length = 1, name = "Skif") {
    this.#length = length;
    this.#hits = 0;
    this.#name = name;
  }

  hit() {
    this.#hits++;
  }

  get sunk() {
    return this.#hits >= this.#length;
  }
}

class Gameboard {
  #size;
  #board;
  #skifs;

  constructor(size = 10) {
    this.size = size;
    this.#skifs = 0;
  }

  #outOfBnds(coords) {
    if (coords[0] < 0) return true;
    if (coords[1] < 0) return true;
    if (coords[0] >= this.#size) return true;
    if (coords[1] >= this.#size) return true;
    return false;
  }

  placeSkif(coords, direction = 0, skifData = { name: "Skif", length: 1 }) {
    let safe = [];
    for (let i = 0; i < skifData.length; i++) {
      let x = direction === 1 ? coords[0] : coords[0] + i;
      let y = direction === 1 ? coords[1] + i : coords[1];
      if (
        this.#board[x][y] instanceof Skif ||
        x < 0 ||
        y < 0 ||
        x > this.#size - 1 ||
        y > this.#size - 1
      ) {
        return false;
      } else safe.push([x, y]);
    }
    const newSkif = new Skif(skifData.length, skifData.name);
    safe.forEach((coord) => {
      this.#board[coord[0]][coord[1]] = newSkif;
    });
    this.#skifs++;
    return true;
  }

  receiveAttack(coords) {
    if (this.#outOfBnds(coords)) return;
    const square = this.#board[coords[0]][coords[1]];
    if (square instanceof Skif) {
      square.hit();
      if (square.sunk) this.#skifs--;
      return true;
    } else {
      this.#board[coords[0]][coords[1]] = 1;
      return false;
    }
  }

  get allSunk() {
    return this.#skifs <= 0;
  }

  clearBoard(newSize = this.#size) {
    this.#skifs = 0;
    this.#size = newSize;
    this.#board = Array.from({ length: this.#size }, () =>
      Array.from({ length: this.#size }, () => 0),
    );
  }

  get size() {
    return this.#size;
  }

  set size(val) {
    if (val < 6 || val > 20) val = 10;
    this.#size = val;
    this.#board = Array.from({ length: this.#size }, () =>
      Array.from({ length: this.#size }, () => 0),
    );
  }

  get data() {
    return this.#board.map((col) => col.slice(0));
  }
}

class Player {
  #board;
  #type;

  /**
   *
   * @param {number} type - 0 == AI (default), 1 == Human
   * @param {number} boardSize - Length of one side of board. Must be 6 - 20 (default == 10).
   */
  constructor(type = 0, boardSize = 10) {
    this.#board = new Gameboard(boardSize);
    this.#type = type;
  }

  get board() {
    return this.#board;
  }
}

export { Player };
