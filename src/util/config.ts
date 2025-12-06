// 1. Define Types
type ChainDetail = {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: readonly string[];
  blockExplorerUrls: readonly string[];
  iconUrls: readonly string[];
};

type CeloConfig = {
  chainId: number;
  rpcUrls: { [key: number]: string };
  supportedChains: readonly [ChainDetail];
};

export type SettingsType = {
  apiDomain: string;
  environment: "development" | "staging" | "production";
  celo: CeloConfig;
};

// 2. Define Celo Sepolia (New Testnet)
// Chain ID: 11142220
const CELO_SEPOLIA: CeloConfig = {
  chainId: 11142220,
  // RPC URL from Celo Docs / Hardhat config
  rpcUrls: { 11142220: "https://forno.celo-sepolia.celo-testnet.org" },
  supportedChains: [
    {
      chainId: "0xaa044c", // Hex for 11142220
      chainName: "Celo Sepolia",
      nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
      rpcUrls: ["https://forno.celo-sepolia.celo-testnet.org"],
      blockExplorerUrls: ["https://celo-sepolia.blockscout.com"], // Celo's Blockscout
      iconUrls: ["https://cryptologos.cc/logos/celo-celo-logo.png"],
    },
  ],
} as const;

// 3. Define Celo Mainnet (No change needed here, retained for completeness)
const CELO_MAINNET: CeloConfig = {
  chainId: 42220,
  rpcUrls: { 42220: "https://forno.celo.org" },
  supportedChains: [
    {
      chainId: "0xa4ec", // Hex for 42220
      chainName: "Celo",
      nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
      rpcUrls: ["https://forno.celo.org"],
      blockExplorerUrls: ["https://celoscan.io"],
      iconUrls: ["https://cryptologos.cc/logos/celo-celo-logo.png"],
    },
  ],
} as const;

// 4. Update Environments to use CELO_SEPOLIA
const development: SettingsType = {
  apiDomain: "http://localhost:5001",
  environment: "development",
  celo: CELO_SEPOLIA, // Using the new testnet
};

const staging: SettingsType = {
  apiDomain: "https://staging-api.slicehub.com",
  environment: "staging",
  celo: CELO_SEPOLIA, // Using the new testnet
};

const production: SettingsType = {
  apiDomain: "https://api.slicehub.com",
  environment: "production",
  celo: CELO_MAINNET,
};

// 5. Export Config based on Environment Variable
const env = (process.env.NEXT_PUBLIC_APP_ENV ||
  process.env.NODE_ENV ||
  "development") as keyof typeof configs;

const configs = {
  development,
  staging,
  production,
};

export const settings: SettingsType = configs[env] || configs.development;
