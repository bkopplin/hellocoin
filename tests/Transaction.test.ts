import { ec } from "elliptic";
import { _ec } from "../src/constants";
import { Transaction } from "../src/Transaction";

let keyMax: ec.KeyPair;
let keyMoritz: ec.KeyPair;
let keyBob: ec.KeyPair;
let transaction: Transaction;

describe("Transaction", () => {
  beforeEach(() => {
    keyMax = _ec.genKeyPair();
    keyMoritz = _ec.genKeyPair();
    keyBob = _ec.genKeyPair();

    transaction = new Transaction(
      keyMax.getPublic("hex"),
      keyMoritz.getPublic("hex"),
      50,
    );
  });

  it("should validate a signed transaction", () => {
    transaction.signTransaction(keyMax);

    expect(transaction.isValid()).toBeTruthy();
  });

  it("should not allow to sign a transaction for another wallet", () => {
    expect(() => {
      transaction.signTransaction(keyBob);
    }).toThrow(Error);
  });

  it("should detect if a transaction has been tampered with", () => {
    transaction.signTransaction(keyMax);

    transaction.fromAddr = keyBob.getPublic("hex");

    expect(transaction.isValid()).toBeFalsy();
  });
});
