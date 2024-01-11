import { ethers } from "hardhat";

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;

  const lockedAmount = ethers.parseEther("0.001");

  const orderBook = await ethers.deployContract("OrderBook", [unlockTime], {
    value: lockedAmount,
  });

  await orderBook.waitForDeployment();

  console.log(
    `Lock with ${ethers.formatEther(
      lockedAmount
    )}ETH and unlock timestamp ${unlockTime} deployed to ${orderBook.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
