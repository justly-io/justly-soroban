/**
 * Blockchain Abstraction Layer
 * 
 * This module provides a blockchain-agnostic interface for the Slice Protocol.
 * Specific blockchain implementations (EVM, Stellar, etc.) are loaded as plugins.
 */

export * from "./types";
export * from "./registry";
export * from "./context";
export * from "./hooks";
