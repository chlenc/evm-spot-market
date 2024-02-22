import { expect } from "chai";
import { ethers } from "hardhat";
import { Erc20Token, OrderBook } from "../typechain-types";
import { Signer } from "ethers";

describe("Match orders fuzz", function () {
  let admin: Signer;
  let alice: Signer;
  let bob: Signer;
  let aliceAddress: string
  let bobAddress: string

  let btc: Erc20Token;
  let usdc: Erc20Token;
  let btcAddress: string
  let usdcAddress: string

  let orderBook: OrderBook;

  this.beforeEach(async () => {
    //init wallets
    [admin, alice, bob] = await ethers.getSigners();
    aliceAddress = await alice.getAddress()
    bobAddress = await bob.getAddress()
    //deploy tokens
    const Token = await ethers.getContractFactory("Erc20Token", admin);
    btc = await Token.deploy("Bitcoin", "BTC", 8);
    usdc = await Token.deploy("USD Coin", "USDC", 9);
    [btcAddress, usdcAddress] = await Promise.all([btc.getAddress(), usdc.getAddress()]);

    //deploy orderbook (second asset id USDC by default)
    const OrderBook = await ethers.getContractFactory("OrderBook", admin);
    orderBook = await OrderBook.deploy(usdcAddress);

    // market BTC/USDC creation
    await orderBook.createMarket(btcAddress, 8);

  })

  it("Match order fuzz", async function () {

    for (let i = 0; i < 500; i++) {
      console.log('\nTest #', i);
      await doMatch()
      await orderBook.ordersByTrader(aliceAddress, 0).then(id => orderBook.connect(alice).removeOrder(id)).catch(() => null)
      await orderBook.ordersByTrader(bobAddress, 0).then(id => orderBook.connect(bob).removeOrder(id)).catch(() => null)

      console.log("orderBook", await btc.balanceOf(orderBook).then(n => ethers.formatUnits(n, 8)), "btc");
      console.log("orderBook", await usdc.balanceOf(orderBook).then(n => ethers.formatUnits(n, 6)), "usdc")
    }
    ;
  });

  async function doMatch() {
    const prices = Array.from({ length: 2 }, () => Math.round(getRandom(40000, 50000, 9) * 1e9))
    const sellPrice = Math.min(...prices)
    const buyPrice = Math.max(...prices)

    const [sellSize, buySize] = Array.from({ length: 2 }, () => Math.round(getRandom(0, 5, 8) * 1e8))
    console.log({ buySize, buyPrice });
    console.log({ sellSize, sellPrice });

    const usdcMintSize = Math.ceil(buyPrice * buySize * 1e6 / 1e9 / 1e8);
    await usdc.mint(aliceAddress, usdcMintSize);
    await usdc.connect(alice).approve(orderBook.getAddress(), buyPrice);
    await orderBook.connect(alice).openOrder(btcAddress, buySize, buyPrice);

    await btc.mint(bobAddress, sellSize);
    await btc.connect(bob).approve(orderBook.getAddress(), sellSize);
    await orderBook.connect(bob).openOrder(btcAddress, -sellSize, sellPrice);

    let [aliceOrderId, bobOrderId] = await Promise.all([orderBook.ordersByTrader(aliceAddress, 0), orderBook.ordersByTrader(bobAddress, 0)]);

    let tx = await orderBook.matchOrders(bobOrderId, aliceOrderId);
    await tx.wait();
    printLogs(tx.hash, ["LogEvent"])


    //todo add result balance check
  }
  const printLogs = async (hash: string, events?: string[]) => {
    const receipt = await ethers.provider.getTransactionReceipt(hash);
    const iface = new ethers.Interface(orderBook.interface.format());
    for (const log of receipt!.logs) {
      try {
        const parsedLog = iface.parseLog(log as any);
        if (parsedLog == null) continue;
        if (events != null && !events.includes(parsedLog.name)) continue;
        const { name, args } = parsedLog
        console.log({ name, args });

      } catch (error) {
        console.error(`Error parsing log: ${log}`, error);
      }
    }

  }

});



function getRandom(min: number, max: number, decimals = 0): number {
  const factor = Math.pow(10, decimals);
  min = Math.ceil(min * factor);
  max = Math.floor(max * factor);
  return Math.floor(Math.random() * (max - min + 1) + min) / factor;
}