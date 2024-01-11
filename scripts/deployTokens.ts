// Import ethers from Hardhat package
import { ethers } from "hardhat";

/* 
BTC deployed to: 0xe766A515745ea143DF03536b5aC3c6af9E61bd29
USDC deployed to: 0x5a800d7e1e1C22C3a72b51AE8535B52ccBB72bC5
*/

async function main() {
    // Fetch the Contract Factory for the Erc20Token contract
    const Token = await ethers.getContractFactory("Erc20Token");

    // Deploy the BTC token
    const btc = await Token.deploy("Bitcoin", "BTC");
    await btc.waitForDeployment();
    const btcAddress = await btc.getAddress();
    console.log("BTC deployed to:", btcAddress);

    // Deploy the USDC token
    const usdc = await Token.deploy("USD Coin", "USDC");
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();
    console.log("USDC deployed to:", usdcAddress);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
