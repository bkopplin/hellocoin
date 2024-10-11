import { Transaction } from "./Transaction";
import { Block } from "./Block";
import { NULL_ADDRESS } from "./constants";

export class Blockchain {
  chain: Block[];
  difficulty: number;
  pendingTransactions: Transaction[];

  constructor() {
    this.chain = [this.generateFirstBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
  }

  generateFirstBlock() {
    return new Block("08/10/2024", [], "0");
  }

  addBlock(newBlock: Block) {
    newBlock.previousHash = this.chain[this.chain.length - 1].hash;
    newBlock.mine(this.difficulty);
    this.chain.push(newBlock);
  }

  minePendingTransactions(miningRewardAddress: string) {
    const block = new Block(
      Date.now().toLocaleString(),
      this.pendingTransactions,
    );
    block.previousHash = this.chain[this.chain.length - 1].hash;
    block.mine(this.difficulty);
    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(NULL_ADDRESS, miningRewardAddress, 100),
    ];
  }

  addTransaction(pendingTransaction: Transaction) {
    if (!pendingTransaction.fromAddr || !pendingTransaction.toAddr)
      throw new Error("You cannot add a transaction that misses addresses");

    if (!pendingTransaction.isValid())
      throw new Error("Cannot add an invalid transaction");

    this.pendingTransactions.push(pendingTransaction);
  }

  getBalance(address: string) {
    let balance = 0;
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddr === address) balance -= transaction.amount;
        if (transaction.toAddr === address) balance += transaction.amount;
      }
    }
    return balance;
  }

  isValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const previous = this.chain[i - 1];
      const current = this.chain[i];

      if (current.calculateHash() != current.hash) return false;

      if (previous.hash != current.previousHash) return false;

      if (!current.hasValidTransactions()) return false;

      return true;
    }
  }
}
