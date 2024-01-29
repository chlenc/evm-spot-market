import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv';
dotenv.config();

if (process.env.ADMIN_PRIVATE_KEY == null) {
  throw new Error("No ADMIN_PRIVATE_KEY in .env file")
}

if (process.env.ALICE_PRIVATE_KEY == null) {
  throw new Error("No ALICE_PRIVATE_KEY in .env file")
}

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    arbitrumSepolia: {
      // url: 'https://sepolia-rollup.arbitrum.io/rpc',
      url: 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
      chainId: 421614,
      accounts: [process.env.ADMIN_PRIVATE_KEY!, process.env.ALICE_PRIVATE_KEY!]
    },
  },

};

export default config;
