
import { ethers, artifacts } from "hardhat";
import { ORDERBOOK_ADDRESS } from "./constants";



const ORDERS = ["", ""]

async function main() {
    // Получаем подписывающего
    const [admin] = await ethers.getSigners();

    // Получаем ABI контракта OrderBook
    const contractArtifact = await artifacts.readArtifact("OrderBook");

    // Создаём экземпляр контракта OrderBook с подписывающим
    const orderBook = new ethers.Contract(ORDERBOOK_ADDRESS, contractArtifact.abi, admin);
    const tx = await orderBook.matchOrders(...ORDERS);
    await tx.wait();

    console.log("Orders matched successfully");

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
