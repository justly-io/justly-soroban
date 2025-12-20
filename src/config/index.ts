import { createConfig, http } from "wagmi";
import { activeChains } from "./chains";

const transports = Object.fromEntries(
  activeChains.map((chain) => [chain.id, http()]),
);

export const config = createConfig({
  chains: activeChains,
  transports,
  ssr: true,
});
