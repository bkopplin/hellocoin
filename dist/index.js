"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Block: () => Block,
  Blockchain: () => Blockchain,
  NULL_ADDRESS: () => NULL_ADDRESS,
  Transaction: () => Transaction,
  _ec: () => _ec
});
module.exports = __toCommonJS(src_exports);

// src/Block.ts
var import_crypto_js = require("crypto-js");
var Block = class {
  constructor(timestamp, transactions, previousHash) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    if (previousHash) this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }
  calculateHash() {
    return (0, import_crypto_js.SHA256)(
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
var import_elliptic = require("elliptic");
var NULL_ADDRESS = "null_addr";
var _ec = new import_elliptic.ec("secp256k1");

// src/Transaction.ts
var import_crypto_js2 = require("crypto-js");
var Transaction = class {
  constructor(fromAddr, toAddr, amount) {
    this.fromAddr = fromAddr;
    this.toAddr = toAddr;
    this.amount = amount;
  }
  calculateHash() {
    return (0, import_crypto_js2.SHA256)(this.fromAddr + this.toAddr + this.amount).toString();
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Block,
  Blockchain,
  NULL_ADDRESS,
  Transaction,
  _ec
});
