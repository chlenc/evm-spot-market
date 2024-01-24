// Import ethers from Hardhat package
import { ethers } from "hardhat";
import { USDC_ADDRESS } from "./constants";

async function main() {
  // This script expects the USDC address to be provided
  // For example purposes, this could be a dummy address

  // Fetch the Contract Factory for the OrderBook contract
  const OrderBookFactory = await ethers.getContractFactory("OrderBook");

  // Deploy the contract
  const orderBook = await OrderBookFactory.deploy(USDC_ADDRESS);

  // Wait for the deployment to be mined
  await orderBook.waitForDeployment();

  // Log the address of the deployed contract
  console.log("OrderBook deployed to:", await orderBook.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
