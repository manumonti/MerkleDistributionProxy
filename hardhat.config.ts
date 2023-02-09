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
        version: "0.8.17"
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
        // forking is enabled only if MAINNET_RPC_ENDPOINT env is provided
        // RPC node must be an archive node (Alchemy recommended)
        enabled: !!process.env.MAINNET_RPC_ENDPOINT,
        url: process.env.MAINNET_RPC_ENDPOINT || "",
        blockNumber: 16582928,
      }
    },
    goerli: {
      url: process.env.GOERLI_RPC_ENDPOINT || "",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY || ""],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // take the first default hardhat account as deployer
      goerli: 0, // take the first account in networks.goerli.accounts
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY || "",
  }
};

export default config;
