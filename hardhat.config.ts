import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import {config as dotEnvConfig} from "dotenv";

dotEnvConfig();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      forking: {
        // forking is enabled only if RPC_ENDPOINT env is provided
        // RPC node must be an archive node (Alchemy recommended)
        enabled: !!process.env.RPC_ENDPOINT,
        url: process.env.RPC_ENDPOINT || "",
        blockNumber: 16582928,
      }
    }
  }
};

export default config;
