"use client";

import { useActivePlugin } from "./context";
import type {
  BlockchainAccount,
  BlockchainBalance,
  BlockchainContracts,
  VoteParams,
  RevealParams,
} from "./types";

/**
 * Proxy hooks that delegate to the active blockchain plugin
 * 
 * These hooks provide a blockchain-agnostic interface for the UI layer.
 * The actual implementation is provided by the active plugin (e.g., @evm)
 */

// ===========================
// Core Hooks
// ===========================

export function useAccount(): BlockchainAccount {
  const plugin = useActivePlugin();
  return plugin.hooks.useAccount();
}

export function useBalance(): BlockchainBalance {
  const plugin = useActivePlugin();
  return plugin.hooks.useBalance();
}

export function useContracts(): BlockchainContracts {
  const plugin = useActivePlugin();
  return plugin.hooks.useContracts();
}

export function useConnect() {
  const plugin = useActivePlugin();
  return plugin.hooks.useConnect();
}

export function useTokenBalance(): BlockchainBalance {
  const plugin = useActivePlugin();
  return plugin.hooks.useTokenBalance();
}

export function useStakingToken() {
  const plugin = useActivePlugin();
  return plugin.hooks.useStakingToken();
}

// ===========================
// Action Hooks
// ===========================

export function useCreateDispute() {
  const plugin = useActivePlugin();
  return plugin.hooks.useCreateDispute();
}

export function usePayDispute() {
  const plugin = useActivePlugin();
  return plugin.hooks.usePayDispute();
}

export function useExecuteRuling() {
  const plugin = useActivePlugin();
  return plugin.hooks.useExecuteRuling();
}

export function useAssignDispute() {
  const plugin = useActivePlugin();
  return plugin.hooks.useAssignDispute();
}

export function useSendFunds() {
  const plugin = useActivePlugin();
  return plugin.hooks.useSendFunds();
}

export function useWithdraw() {
  const plugin = useActivePlugin();
  return plugin.hooks.useWithdraw();
}

export function useFaucet() {
  const plugin = useActivePlugin();
  if (!plugin.hooks.useFaucet) {
    throw new Error("useFaucet not supported by active blockchain plugin");
  }
  return plugin.hooks.useFaucet();
}

// ===========================
// Voting Hooks
// ===========================

export function useVote() {
  const plugin = useActivePlugin();
  return plugin.hooks.useVote();
}

export function useReveal() {
  const plugin = useActivePlugin();
  return plugin.hooks.useReveal();
}

export function useSliceVoting() {
  const plugin = useActivePlugin();
  return plugin.hooks.useSliceVoting();
}

export function useJurorStats(address?: string) {
  const plugin = useActivePlugin();
  return plugin.hooks.useJurorStats(address);
}

// ===========================
// Dispute Query Hooks
// ===========================

export function useGetDispute(disputeId: any) {
  const plugin = useActivePlugin();
  return plugin.hooks.useGetDispute(disputeId);
}

export function useDisputeList() {
  const plugin = useActivePlugin();
  return plugin.hooks.useDisputeList();
}

export function useMyDisputes() {
  const plugin = useActivePlugin();
  return plugin.hooks.useMyDisputes();
}

export function useAllDisputes() {
  const plugin = useActivePlugin();
  return plugin.hooks.useAllDisputes();
}

// ===========================
// User Hooks
// ===========================

export function useUserProfile(address?: string) {
  const plugin = useActivePlugin();
  return plugin.hooks.useUserProfile(address);
}
