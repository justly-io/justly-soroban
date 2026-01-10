"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider as PrivyWagmiProvider } from "@privy-io/wagmi";
import {
  WagmiProvider as VanillaWagmiProvider,
  cookieToInitialState,
} from "wagmi";
import { PRIVY_APP_ID, PRIVY_CLIENT_ID, IS_EMBEDDED } from "@/config/app";
import { config } from "@/config";
import { TimerProvider } from "@/contexts/TimerContext";
import { AutoConnect } from "@/components/AutoConnect";
import { activeChains, defaultChain } from "@/config/chains";

import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";

const queryClient = new QueryClient();

export default function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies?: string | null;
}) {
  const initialState = cookieToInitialState(config, cookies);

  const ActiveWagmiProvider = IS_EMBEDDED
    ? VanillaWagmiProvider
    : PrivyWagmiProvider;

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      clientId={PRIVY_CLIENT_ID}
      config={{
        defaultChain: defaultChain,
        supportedChains: activeChains,
        appearance: {
          theme: "light",
          accentColor: "#1b1c23",
          logo: "/images/slice-logo-light.svg",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        loginMethods: ["email", "wallet"],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ActiveWagmiProvider config={config} initialState={initialState}>
          <SmartWalletsProvider>
            <TimerProvider>
              <AutoConnect />
              {children}
            </TimerProvider>
          </SmartWalletsProvider>
        </ActiveWagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
