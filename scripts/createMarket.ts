import { ethers, artifacts } from "hardhat";
import { BTC_ADDRESS } from "./deployTokens";
import { ORDERBOOK_ADDRESS } from "./deploy";

const BASE_ASSET_ADDRESS = BTC_ADDRESS;
const BASE_ASSET_DECIMALS = 8;

async function main() {
  // Получаем первый аккаунт из списка доступных аккаунтов
  const [deployer] = await ethers.getSigners();

  // Получаем ABI контракта
  const contractArtifact = await artifacts.readArtifact("OrderBook");

  // Создаём экземпляр контракта с подписывающим (signer)
  const orderBook = new ethers.Contract(ORDERBOOK_ADDRESS, contractArtifact.abi, deployer);

  // Выполняем транзакцию
  const createMarketTx = await orderBook.createMarket(BASE_ASSET_ADDRESS, BASE_ASSET_DECIMALS);
  await createMarketTx.wait();

  // Получаем и выводим информацию о рынке
  console.log(await orderBook.markets(BASE_ASSET_ADDRESS));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
