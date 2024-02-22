
import { ethers, artifacts } from "hardhat";
import { BTC_ADDRESS, ORDERBOOK_ADDRESS, USDC_ADDRESS } from "./constants";

const RECIPIENT = ORDERBOOK_ADDRESS
const TOKEN = BTC_ADDRESS
const AMOUNT = 1000 * 1e8

async function main() {
    // Получаем подписывающего
    const [caller] = await ethers.getSigners();

    const artifact = await artifacts.readArtifact("Erc20Token");
    const token = new ethers.Contract(TOKEN, artifact.abi, caller);
    let mintTx = await token.mint(RECIPIENT, AMOUNT);
    await mintTx.wait();
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
