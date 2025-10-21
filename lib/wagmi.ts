import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

export function getConfig() {
  return createConfig({
    chains: [base],
    connectors: [
      coinbaseWallet({
        appName: "TipBase",
        preference: "all",
      }),
    ],
    transports: {
      [base.id]: http(),
    },
  });
}
