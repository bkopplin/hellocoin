import { ec } from 'elliptic';

declare class Transaction {
    fromAddr: string;
    toAddr: string;
    amount: number;
    signature: string;
    constructor(fromAddr: string, toAddr: string, amount: number);
    calculateHash(): string;
    signTransaction(key: ec.KeyPair): void;
    isValid(): boolean;
}

declare class Block {
    timestamp: string;
    transactions: Transaction[];
    previousHash: string;
    hash: string;
    nonce: number;
    constructor(timestamp: string, transactions: Transaction[], previousHash?: string);
    calculateHash(): string;
    mine(difficulty: number): void;
    hasValidTransactions(): boolean;
}

declare class Blockchain {
    chain: Block[];
    difficulty: number;
    pendingTransactions: Transaction[];
    constructor();
    generateFirstBlock(): Block;
    addBlock(newBlock: Block): void;
    minePendingTransactions(miningRewardAddress: string): void;
    addTransaction(pendingTransaction: Transaction): void;
    getBalance(address: string): number;
    isValid(): boolean | undefined;
}

declare const NULL_ADDRESS = "null_addr";
declare const _ec: ec;

export { Block, Blockchain, NULL_ADDRESS, Transaction, _ec };
