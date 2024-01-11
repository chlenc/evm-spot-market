import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  // networks: {
  //   ArbitrumSepolia: {
  //     url: "https://sepolia-rollup.arbitrum.io/rpc",
  //     accounts: [process.env.PRIVATE_KEY!]
  //   }
  // }
};

export default config;
