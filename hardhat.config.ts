import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import {config as dotEnvConfig} from "dotenv";
import "hardhat-deploy";

dotEnvConfig();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.5.5"
      },
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      }
    ],
    overrides: {
      "contracts/ds-proxy/proxy.sol": {
        version: "0.5.5",
      },
      "contracts/ds-proxy/ds-note/note.sol": {
        version: "0.5.5",
      },
      "contracts/ds-proxy/ds-auth/auth.sol": {
        version: "0.5.5",
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        // Forking is enabled only if MAINNET_RPC_ENDPOINT env is provided
        // RPC node must be an archive node (Alchemy recommended)
        enabled: !!process.env.MAINNET_RPC_ENDPOINT,
        url: process.env.MAINNET_RPC_ENDPOINT || "",
        blockNumber: 16582928,
      }
    },
    goerli: {
      url: process.env.GOERLI_RPC_ENDPOINT || "",
      accounts: [process.env.GOERLI_DEPLOYER_PRIV_KEY || ""],
    },
    mainnet: {
      url: process.env.MAINNET_RPC_ENDPOINT || "",
      accounts: [process.env.MAINNET_DEPLOYER_PRIV_KEY || ""],
    }
  },
  namedAccounts: {
    deployer: {
      default: 0, // take the first default hardhat account as deployer
      goerli: 0, // take the first account in networks.goerli.accounts
      mainnet: 0, // take the first account in networks.mainnet.accounts
    },
    council: {
      default: "0x9F6e831c8F8939DC0C830C6e492e7cEf4f9C2F5f",
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY || "",
  }
};

export default config;
