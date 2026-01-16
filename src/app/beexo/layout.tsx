"use client";

import React from "react";
import { WagmiProvider } from "wagmi";
import { beexoConfig } from "@/config/beexoConfig";

// We can reuse the global QueryClient or create a local one.
// Reusing the context from app/providers.tsx is usually fine,
// but wrapping WagmiProvider here overrides the PrivyWagmiProvider from root.

export default function BeexoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // This Provider overrides the global PrivyWagmiProvider for all children
    <WagmiProvider config={beexoConfig}>{children}</WagmiProvider>
  );
}
