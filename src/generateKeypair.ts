import { _ec } from "./constants";
import { ec } from "elliptic";

const keypair: ec.KeyPair = _ec.genKeyPair();

console.log();
console.log("Private Key:", keypair.getPrivate("hex"));

console.log();
console.log("Public Key:", keypair.getPublic("hex"));
