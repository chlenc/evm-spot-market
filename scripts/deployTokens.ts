// Import ethers from Hardhat package
import { ethers } from "hardhat";

async function main() {
    // Fetch the Contract Factory for the Erc20Token contract
    const Token = await ethers.getContractFactory("Erc20Token");

    const uni = await Token.deploy("Uniswap", "UNI", 9);
    await uni.waitForDeployment();
    const uniAddress = await uni.getAddress();
    console.log("uni deployed to:", uniAddress);

    // const btc = await Token.deploy("Bitcoin", "BTC", 8);
    // await btc.waitForDeployment();
    // const btcAddress = await btc.getAddress();
    // console.log("BTC deployed to:", btcAddress);

    // const usdc = await Token.deploy("USD Coin", "USDC", 6);
    // await usdc.waitForDeployment();
    // const usdcAddress = await usdc.getAddress();
    // console.log("USDC deployed to:", usdcAddress);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
