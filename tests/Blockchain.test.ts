import { ec } from "elliptic";
import { Blockchain } from "../src/Blockchain";
import { Transaction } from "../src/Transaction";
import { _ec } from "../src/constants";

let newcoin: Blockchain;
let frodoKeyPair: ec.KeyPair;
let bilboKeyPair: ec.KeyPair;
let gandalfKeyPair: ec.KeyPair;

let frodoWalletAddress: string;
let bilboWalletAddress: string;
let gandalfWalletAddress: string;

let tx1: Transaction;
let tx2: Transaction;

describe("Blockchain", () => {
  beforeEach(() => {
    frodoKeyPair = _ec.genKeyPair();
    bilboKeyPair = _ec.genKeyPair();
    gandalfKeyPair = _ec.genKeyPair();

    frodoWalletAddress = frodoKeyPair.getPublic("hex");
    bilboWalletAddress = bilboKeyPair.getPublic("hex");
    gandalfWalletAddress = gandalfKeyPair.getPublic("hex");

    newcoin = new Blockchain();

    tx1 = new Transaction(frodoWalletAddress, bilboWalletAddress, 50);
    tx1.signTransaction(frodoKeyPair);

    tx2 = new Transaction(frodoWalletAddress, gandalfWalletAddress, 100);
    tx2.signTransaction(frodoKeyPair);
  });

  it("should create a valid blockchain", () => {
    newcoin.addTransaction(tx1);
    newcoin.addTransaction(tx2);
    newcoin.minePendingTransactions(bilboWalletAddress);

    expect(newcoin.chain.length).toBe(2);
  });

  it("should approve a valid chain", () => {
    newcoin.addTransaction(tx1);
    newcoin.addTransaction(tx2);
    newcoin.minePendingTransactions(bilboWalletAddress);

    expect(newcoin.isValid()).toBeTruthy();
  });

  it("should detect an invalid chain", () => {
    newcoin.addTransaction(tx1);
    newcoin.addTransaction(tx2);
    newcoin.minePendingTransactions(bilboWalletAddress);

    newcoin.chain[1].transactions[0].amount = 5000;

    expect(newcoin.isValid()).toBeFalsy();
  });

  it("should reward the miner", () => {
    newcoin.addTransaction(tx1);
    newcoin.addTransaction(tx2);
    newcoin.minePendingTransactions(bilboWalletAddress);
    newcoin.minePendingTransactions("nowhere");

    expect(newcoin.getBalance(bilboWalletAddress)).toBe(150);
  });

  it("should reject adding a transaction that has been tempered with", () => {
    const txE = new Transaction(frodoWalletAddress, bilboWalletAddress, 50);
    txE.signTransaction(frodoKeyPair);
    txE.fromAddr = bilboWalletAddress;

    expect(() => {
      newcoin.addTransaction(txE);
    }).toThrow("Cannot add an invalid transaction");
  });

  it("should reject adding a transaction that misses addresses", () => {
    const txE = new Transaction(frodoWalletAddress, bilboWalletAddress, 50);
    txE.signTransaction(frodoKeyPair);
    txE.toAddr = "";

    expect(() => {
      newcoin.addTransaction(txE);
    }).toThrow("You cannot add a transaction that misses addresses");
  });
});
