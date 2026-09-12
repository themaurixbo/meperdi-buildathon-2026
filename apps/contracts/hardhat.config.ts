import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? "";
const accounts = DEPLOYER_KEY ? [DEPLOYER_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    hardhat: {},
    hskTestnet: {
      url: process.env.HSK_RPC_URL ?? "https://testnet.hsk.xyz",
      chainId: 133,
      accounts,
    },
    hskMainnet: {
      url: "https://mainnet.hsk.xyz",
      chainId: 177,
      accounts,
    },
  },
  etherscan: {
    // Blockscout expone API compatible con Etherscan. URL exacta confirmada
    // contra https://testnet-explorer.hsk.xyz antes de configurar.
    apiKey: {
      hskTestnet: "empty",
    },
    customChains: [
      {
        network: "hskTestnet",
        chainId: 133,
        urls: {
          apiURL: "https://testnet-explorer.hsk.xyz/api",
          browserURL: "https://testnet-explorer.hsk.xyz",
        },
      },
    ],
  },
  sourcify: { enabled: false },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
