import { Player } from "./game.js";

const player = new Player();

describe("Test Gameboard", () => {
  test("placeSkif([2, 2], 1, {name: 'Holly', length: 3})", () => {
    expect(
      player.board.placeSkif([2, 2], 1, { name: "Holly", length: 3 }),
    ).toBe(true);
  });
  test("receiveAttack(2, 4) + receiveAttack(2, 3) + receiveAttack(2, 2)", () => {
    expect(player.board.receiveAttack([2, 4])).toBe(true);
    expect(player.board.allSunk).toBe(false);
    expect(player.board.receiveAttack([2, 3])).toBe(true);
    expect(player.board.receiveAttack([2, 2])).toBe(true);
    expect(player.board.allSunk).toBe(true);
  });
});
