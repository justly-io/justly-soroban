import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { beexoConnector } from "./beexoConnector";

export const beexoConfig = createConfig({
  chains: [base], // ONLY Base Mainnet
  transports: {
    [base.id]: http("https://mainnet.base.org"),
  },
  connectors: [
    beexoConnector(), // ONLY Beexo
  ],
  ssr: true,
});
