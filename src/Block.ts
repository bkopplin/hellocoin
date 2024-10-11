import { SHA256 } from "crypto-js";
import { Transaction } from "Transaction";

export class Block {
  timestamp: string;
  transactions: Transaction[];
  previousHash!: string;
  hash: string;
  nonce: number;

  constructor(
    timestamp: string,
    transactions: Transaction[],
    previousHash?: string,
  ) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    if (previousHash) this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(
      this.timestamp +
        JSON.stringify(this.transactions) +
        this.previousHash +
        this.nonce,
    ).toString();
  }

  mine(difficulty: number) {
    const expectedHashSuffix = Array(difficulty + 1).join("0");
    while (this.hash.substring(0, difficulty) != expectedHashSuffix) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }

  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) return false;
    }
    return true;
  }
}
