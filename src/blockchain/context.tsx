"use client";

import { createContext, useContext, ReactNode } from "react";
import { BlockchainPlugin } from "./types";

interface BlockchainContextValue {
  plugin: BlockchainPlugin | null;
}

const BlockchainContext = createContext<BlockchainContextValue | undefined>(
  undefined
);

interface BlockchainContextProviderProps {
  plugin: BlockchainPlugin;
  children: ReactNode;
}

export function BlockchainContextProvider({
  plugin,
  children,
}: BlockchainContextProviderProps) {
  return (
    <BlockchainContext.Provider value={{ plugin }}>
      {children}
    </BlockchainContext.Provider>
  );
}

/**
 * Hook to access the active blockchain plugin
 */
export function useActivePlugin(): BlockchainPlugin {
  const context = useContext(BlockchainContext);
  
  if (!context) {
    throw new Error(
      "useActivePlugin must be used within a BlockchainContextProvider"
    );
  }
  
  if (!context.plugin) {
    throw new Error("No blockchain plugin is active");
  }
  
  return context.plugin;
}
