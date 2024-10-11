import { Block } from "../src/Block";
import { Transaction } from "../src/Transaction";

describe("Block", () => {
  it("should mine a block", () => {
    const difficulty = 3;
    const block = new Block("10/08/2024", [new Transaction("max", "mia", 2)]);
    block.mine(difficulty);
    expect(block.hash.substring(0, difficulty)).toBe("000");
  });

  it.skip("should mine a block with a high difficulty", () => {
    const startTime = Date.now();
    const difficulty = 2;
    const block = new Block("10/08/2024", [new Transaction("max", "mia", 2)]);
    block.mine(difficulty);

    const elapsedTime = Date.now() - startTime;
    console.log(block);
    console.log(`elapsed time: ${elapsedTime} ms`);
    expect(block.hash.substring(0, difficulty)).toBe(
      Array(difficulty + 1).join("0"),
    );
  });
});
