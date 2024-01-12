import { ethers, artifacts } from "hardhat";

const ORDERBOOK_ADDRESS = "0x5124eE51275B9C5DaD5F583F7A3d52cfD69497Af";
const BASE_ASSET_ADDRESS = "0xe766A515745ea143DF03536b5aC3c6af9E61bd29";
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
