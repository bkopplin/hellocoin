// src/Block.ts
import { SHA256 } from "crypto-js";
var Block = class {
  constructor(timestamp, transactions, previousHash) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    if (previousHash) this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }
  calculateHash() {
    return SHA256(
      this.timestamp + JSON.stringify(this.transactions) + this.previousHash + this.nonce
    ).toString();
  }
  mine(difficulty) {
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
};

// src/constants.ts
import { ec } from "elliptic";
var NULL_ADDRESS = "null_addr";
var _ec = new ec("secp256k1");

// src/Transaction.ts
import { SHA256 as SHA2562 } from "crypto-js";
var Transaction = class {
  constructor(fromAddr, toAddr, amount) {
    this.fromAddr = fromAddr;
    this.toAddr = toAddr;
    this.amount = amount;
  }
  calculateHash() {
    return SHA2562(this.fromAddr + this.toAddr + this.amount).toString();
  }
  signTransaction(key) {
    if (key.getPublic("hex") !== this.fromAddr) {
      throw new Error("You cannot sign transactions for other wallets");
    }
    const hash = this.calculateHash();
    this.signature = key.sign(hash, "base64").toDER("hex");
  }
  isValid() {
    if (this.fromAddr === NULL_ADDRESS) return true;
    if (!this.signature || this.signature.length === 0) return false;
    const publicKey = _ec.keyFromPublic(this.fromAddr, "hex");
    return publicKey.verify(this.calculateHash(), this.signature);
  }
};

// src/Blockchain.ts
var Blockchain = class {
  constructor() {
    this.chain = [this.generateFirstBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
  }
  generateFirstBlock() {
    return new Block("08/10/2024", [], "0");
  }
  addBlock(newBlock) {
    newBlock.previousHash = this.chain[this.chain.length - 1].hash;
    newBlock.mine(this.difficulty);
    this.chain.push(newBlock);
  }
  minePendingTransactions(miningRewardAddress) {
    const block = new Block(
      Date.now().toLocaleString(),
      this.pendingTransactions
    );
    block.previousHash = this.chain[this.chain.length - 1].hash;
    block.mine(this.difficulty);
    this.chain.push(block);
    this.pendingTransactions = [
      new Transaction(NULL_ADDRESS, miningRewardAddress, 100)
    ];
  }
  addTransaction(pendingTransaction) {
    if (!pendingTransaction.fromAddr || !pendingTransaction.toAddr)
      throw new Error("You cannot add a transaction that misses addresses");
    if (!pendingTransaction.isValid())
      throw new Error("Cannot add an invalid transaction");
    this.pendingTransactions.push(pendingTransaction);
  }
  getBalance(address) {
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
};
export {
  Block,
  Blockchain,
  NULL_ADDRESS,
  Transaction,
  _ec
};
