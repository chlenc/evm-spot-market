// Import ethers from Hardhat package
import { ethers } from "hardhat";
/* 
OrderBook deployed to: 0x5124eE51275B9C5DaD5F583F7A3d52cfD69497Af
*/
const USDC_ADDRESS = "0x5a800d7e1e1C22C3a72b51AE8535B52ccBB72bC5";

async function main() {
  // This script expects the USDC address to be provided
  // For example purposes, this could be a dummy address

  // Fetch the Contract Factory for the OrderBook contract
  const OrderBook = await ethers.getContractFactory("OrderBook");

  // Deploy the contract
  const orderBook = await OrderBook.deploy(USDC_ADDRESS);

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
