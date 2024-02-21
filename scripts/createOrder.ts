
import { ethers, artifacts } from "hardhat";
import { BTC_ADDRESS, ORDERBOOK_ADDRESS, USDC_ADDRESS } from "./constants";

const BASE_SIZE = 0.5 * 1e8; // Количество базового актива (например, 1 BTC)
const ORDER_PRICE = 52000 * 1e9; // Цена за единицу базового актива (например, 45000 USDC)

async function main() {
    // Получаем подписывающего
    const [caller] = await ethers.getSigners();

    // Получаем ABI контракта OrderBook
    const contractArtifact = await artifacts.readArtifact("OrderBook");

    // Создаём экземпляр контракта OrderBook с подписывающим
    const orderBook = new ethers.Contract(ORDERBOOK_ADDRESS, contractArtifact.abi, caller);

    // Создание экземпляра токена USDC
    const usdcArtifact = await artifacts.readArtifact("Erc20Token");
    const usdc = new ethers.Contract(USDC_ADDRESS, usdcArtifact.abi, caller);
    const btc = new ethers.Contract(BTC_ADDRESS, usdcArtifact.abi, caller);

    // Создаём ордер на покупку или продажу
    if (BASE_SIZE > 0) {
        let mintTx = await usdc.mint(caller.address, ORDER_PRICE / 1e9 * 1e6);
        await mintTx.wait();
        await (usdc.connect(caller) as any).approve(orderBook.getAddress(), ORDER_PRICE / 1e9 * 1e6);
        const createOrderTx = await orderBook.openOrder(BTC_ADDRESS, BASE_SIZE, ORDER_PRICE);
        await createOrderTx.wait();
    } else {
        let mintTx = await btc.mint(caller.address, BASE_SIZE * -1);
        await mintTx.wait();
        await (btc.connect(caller) as any).approve(orderBook.getAddress(), BASE_SIZE * -1);
        const createOrderTx = await orderBook.openOrder(BTC_ADDRESS, BASE_SIZE, ORDER_PRICE);
        await createOrderTx.wait();
    }

    console.log("Order created successfully");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
