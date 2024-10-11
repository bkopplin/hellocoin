import { ec } from "elliptic";
import { _ec, NULL_ADDRESS } from "./constants";
import { SHA256 } from "crypto-js";

export class Transaction {
  fromAddr: string;
  toAddr: string;
  amount: number;
  signature!: string;

  constructor(fromAddr: string, toAddr: string, amount: number) {
    this.fromAddr = fromAddr;
    this.toAddr = toAddr;
    this.amount = amount;
  }

  calculateHash() {
    return SHA256(this.fromAddr + this.toAddr + this.amount).toString();
  }

  signTransaction(key: ec.KeyPair) {
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
}
