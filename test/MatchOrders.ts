import { expect } from "chai";
import { ethers } from "hardhat";
import { Erc20Token, OrderBook } from "../typechain-types";
import { Signer } from "ethers";

describe("Match orders Test", function () {
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

  it("✅ buyOrder.orderPrice > sellOrder.orderPrice & buyOrder.baseSize > sellOrder.baseSize", async function () {
    const buyPrice = 46000 * 1e9; // Higher buy price
    const sellPrice = 45000 * 1e9; // Lower sell price
    const buySize = 2 * 1e8; // Larger buy size
    const sellSize = 1 * 1e8; // Smaller sell size

    // Alice майнит USDC и создает ордер на покупку BTC
    await usdc.mint(aliceAddress, 46000 * 2 * 1e6); // Учитывая цену и размер покупки, Alice нужно 92,000 USDC
    await usdc.connect(alice).approve(orderBook.getAddress(), 46000 * 2 * 1e6);
    await orderBook.connect(alice).openOrder(btcAddress, buySize, buyPrice);

    // Bob майнит BTC и создает ордер на продажу BTC
    await btc.mint(bobAddress, sellSize); // Bob майнит только 1 BTC, так как хочет продать 1 BTC
    await btc.connect(bob).approve(orderBook.getAddress(), sellSize);
    await orderBook.connect(bob).openOrder(btcAddress, -sellSize, sellPrice);

    //match orders
    let [aliceOrderId, bobOrderId] = await Promise.all([orderBook.ordersByTrader(aliceAddress, 0), orderBook.ordersByTrader(bobAddress, 0)]);
    await orderBook.matchOrders(bobOrderId, aliceOrderId);

    // Проверяем, что у Alice есть 1 BTC после совершения сделки
    expect(await btc.balanceOf(aliceAddress)).to.equal(1 * 1e8);
    // Проверяем, что у Alice осталось 47,000 USDC после покупки 1 BTC по цене 45,000 USDC
    await orderBook.connect(alice).removeOrder(aliceOrderId);
    expect(await usdc.balanceOf(aliceAddress)).to.equal(47000 * 1e6);

    // Проверяем, что у Bob есть 0 BTC после продажи
    expect(await btc.balanceOf(bobAddress)).to.equal(0);
    // Проверяем, что у Bob есть 45,000 USDC после продажи своего BTC
    expect(await usdc.balanceOf(bobAddress)).to.equal(45000 * 1e6);


  });

  it("✅ buyOrder.orderPrice > sellOrder.orderPrice & buyOrder.baseSize < sellOrder.baseSize", async function () {
    const buyPrice = 46000 * 1e9; // Higher buy price
    const sellPrice = 45000 * 1e9; // Lower sell price
    const buySize = 1 * 1e8; // Smaller buy size
    const sellSize = 2 * 1e8; // Larger sell size

    // Alice майнит USDC и создает ордер на покупку BTC
    await usdc.mint(aliceAddress, buyPrice * 1e6 / 1e9); // Alice майнит 46,000 USDC для покупки 1 BTC
    await usdc.connect(alice).approve(orderBook.getAddress(), buyPrice);
    await orderBook.connect(alice).openOrder(btcAddress, buySize, buyPrice);

    // Bob майнит BTC и создает ордер на продажу BTC
    await btc.mint(bobAddress, sellSize); // Bob майнит 2 BTC, так как хочет продать 2 BTC
    await btc.connect(bob).approve(orderBook.getAddress(), sellSize);
    await orderBook.connect(bob).openOrder(btcAddress, -1 * sellSize, sellPrice);
    //match orders
    let [aliceOrderId, bobOrderId] = await Promise.all([orderBook.ordersByTrader(aliceAddress, 0), orderBook.ordersByTrader(bobAddress, 0)]);
    // console.log(await orderBook.orders(aliceOrderId))
    // console.log(await orderBook.orders(bobOrderId))
    await orderBook.matchOrders(bobOrderId, aliceOrderId);

    // Проверяем, что у Alice есть 1 BTC после совершения сделки
    expect(await btc.balanceOf(aliceAddress)).to.equal(1 * 1e8);
    // Проверяем, что у Alice осталось 1000 USDC сдачи после покупки 1 BTC по цене 46,000 USDC
    expect(await usdc.balanceOf(aliceAddress)).to.equal(1000 * 1e6);

    // Проверяем, что у Bob остался 1 BTC после продажи 1 BTC из 2
    await orderBook.connect(bob).removeOrder(bobOrderId);
    expect(await btc.balanceOf(bobAddress)).to.equal(1 * 1e8);
    // Проверяем, что у Bob есть 45,000 USDC после продажи своего BTC
    expect(await usdc.balanceOf(bobAddress)).to.equal(45000 * 1e6);

  })

  it("✅ buyOrder.orderPrice > sellOrder.orderPrice & buyOrder.baseSize = sellOrder.baseSize", async function () {
    const buyPrice = 46000 * 1e9; // Цена покупки выше
    const sellPrice = 45000 * 1e9; // Цена продажи ниже
    const buySize = 1 * 1e8; // Размер покупки
    const sellSize = 1 * 1e8; // Размер продажи равен размеру покупки

    // Alice майнит USDC и создает ордер на покупку BTC
    await usdc.mint(aliceAddress, buyPrice * 1e6 / 1e9); // Alice майнит 46,000 USDC для покупки 1 BTC
    await usdc.connect(alice).approve(orderBook.getAddress(), buyPrice);
    await orderBook.connect(alice).openOrder(btcAddress, buySize, buyPrice);

    // Bob майнит BTC и создает ордер на продажу BTC
    await btc.mint(bobAddress, sellSize); // Bob майнит 1 BTC, так как хочет продать 1 BTC
    await btc.connect(bob).approve(orderBook.getAddress(), sellSize);
    await orderBook.connect(bob).openOrder(btcAddress, -sellSize, sellPrice);
    expect(await usdc.balanceOf(aliceAddress)).to.equal(0);
    //match orders
    let [aliceOrderId, bobOrderId] = await Promise.all([orderBook.ordersByTrader(aliceAddress, 0), orderBook.ordersByTrader(bobAddress, 0)]);
    await orderBook.matchOrders(bobOrderId, aliceOrderId);

    // Проверяем, что у Alice есть 1 BTC после совершения сделки
    expect(await btc.balanceOf(aliceAddress)).to.equal(1 * 1e8);
    // Учитывая, что Alice изначально майнит 46,000 USDC для покупки и сделка прошла по цене 45,000 USDC,
    // у Alice должно остаться 1,000 USDC после покупки 1 BTC
    expect(await usdc.balanceOf(aliceAddress)).to.equal(1000 * 1e6);

    // Проверяем, что у Bob нет BTC после продажи его единственного BTC
    expect(await btc.balanceOf(bobAddress)).to.equal(0);
    // Проверяем, что у Bob есть 45,000 USDC после продажи своего BTC
    expect(await usdc.balanceOf(bobAddress)).to.equal(45000 * 1e6);

  })

  it("❌ buyOrder.orderPrice < sellOrder.orderPrice & buyOrder.baseSize > sellOrder.baseSize", async function () {
    const buyPrice = 44000 * 1e9; // Цена покупки ниже
    const sellPrice = 45000 * 1e9; // Цена продажи выше
    const buySize = 2 * 1e8; // Размер покупки больше
    const sellSize = 1 * 1e8; // Размер продажи меньше

    // Alice майнит USDC и создает ордер на покупку BTC
    await usdc.mint(aliceAddress, buyPrice * 2); // Alice майнит достаточно USDC для покупки 2 BTC по цене 44,000 USDC за каждый
    await usdc.connect(alice).approve(orderBook.getAddress(), buyPrice * 2);
    await orderBook.connect(alice).openOrder(btcAddress, buySize, buyPrice);

    // Bob майнит BTC и создает ордер на продажу BTC
    await btc.mint(bobAddress, sellSize); // Bob майнит 1 BTC, так как хочет продать 1 BTC
    await btc.connect(bob).approve(orderBook.getAddress(), sellSize);
    await orderBook.connect(bob).openOrder(btcAddress, -sellSize, sellPrice);

    //match orders
    let [aliceOrderId, bobOrderId] = await Promise.all([orderBook.ordersByTrader(aliceAddress, 0), orderBook.ordersByTrader(bobAddress, 0)]);
    expect(await orderBook.matchOrders(bobOrderId, aliceOrderId).then(() => false).catch(() => true)).true;
  })

  it("❌ buyOrder.orderPrice < sellOrder.orderPrice & buyOrder.baseSize < sellOrder.baseSize", async function () {
    const buyPrice = 44000 * 1e9; // Lower buy price
    const sellPrice = 45000 * 1e9; // Higher sell price
    const buySize = 1 * 1e8; // Smaller buy size
    const sellSize = 2 * 1e8; // Larger sell size

    // Alice майнит USDC и создает ордер на покупку BTC
    await usdc.mint(aliceAddress, buyPrice); // Alice майнит 44,000 USDC для покупки 1 BTC по своей цене
    await usdc.connect(alice).approve(orderBook.getAddress(), buyPrice);
    await orderBook.connect(alice).openOrder(btcAddress, buySize, buyPrice);

    // Bob майнит BTC и создает ордер на продажу BTC
    await btc.mint(bobAddress, sellSize); // Bob майнит 2 BTC, так как хочет продать 2 BTC по своей цене
    await btc.connect(bob).approve(orderBook.getAddress(), sellSize);
    await orderBook.connect(bob).openOrder(btcAddress, -sellSize, sellPrice);

    //match orders
    let [aliceOrderId, bobOrderId] = await Promise.all([orderBook.ordersByTrader(aliceAddress, 0), orderBook.ordersByTrader(bobAddress, 0)]);
    expect(await orderBook.matchOrders(bobOrderId, aliceOrderId).then(() => false).catch(() => true)).true;
  })

  it("❌ buyOrder.orderPrice < sellOrder.orderPrice & buyOrder.baseSize = sellOrder.baseSize", async function () {
    const buyPrice = 44000 * 1e9; // Lower buy price
    const sellPrice = 45000 * 1e9; // Higher sell price
    const buySize = 1 * 1e8; // Equal size
    const sellSize = 1 * 1e8; // Equal size

    // Alice майнит USDC и создает ордер на покупку BTC
    await usdc.mint(aliceAddress, buyPrice); // Alice майнит 44,000 USDC для покупки 1 BTC по цене ниже рыночной
    await usdc.connect(alice).approve(orderBook.getAddress(), buyPrice);
    await orderBook.connect(alice).openOrder(btcAddress, buySize, buyPrice);

    // Bob майнит BTC и создает ордер на продажу BTC
    await btc.mint(bobAddress, sellSize); // Bob майнит 1 BTC, так как хочет продать 1 BTC по цене выше рыночной
    await btc.connect(bob).approve(orderBook.getAddress(), sellSize);
    await orderBook.connect(bob).openOrder(btcAddress, -sellSize, sellPrice);


    //match orders
    let [aliceOrderId, bobOrderId] = await Promise.all([orderBook.ordersByTrader(aliceAddress, 0), orderBook.ordersByTrader(bobAddress, 0)]);
    expect(await orderBook.matchOrders(bobOrderId, aliceOrderId).then(() => false).catch(() => true)).true;
  })

  it("✅ buyOrder.orderPrice = sellOrder.orderPrice & buyOrder.baseSize > sellOrder.baseSize", async function () {
    // Параметры для минтинга и ордеров
    const price = 45000 * 1e9; // Цена покупки равна цене продажи
    const buySize = 2 * 1e8; // Размер покупки больше
    const sellSize = 1 * 1e8; // Размер продажи меньше

    // Alice майнит USDC для покупки BTC
    await usdc.mint(aliceAddress, price * 2); // Alice майнит достаточно USDC для покупки 2 BTC по равной цене
    await usdc.connect(alice).approve(orderBook.getAddress(), price * 2)
    await orderBook.connect(alice).openOrder(btcAddress, buySize, price);


    // Bob майнит BTC для продажи
    await btc.mint(bobAddress, sellSize); // Bob майнит 1 BTC для продажи
    await btc.connect(bob).approve(orderBook.getAddress(), sellSize)
    await orderBook.connect(bob).openOrder(btcAddress, -sellSize, price);


    //match orders
    let [aliceOrderId, bobOrderId] = await Promise.all([orderBook.ordersByTrader(aliceAddress, 0), orderBook.ordersByTrader(bobAddress, 0)]);
    await orderBook.matchOrders(bobOrderId, aliceOrderId);
  })

  it("✅ buyOrder.orderPrice = sellOrder.orderPrice & buyOrder.baseSize < sellOrder.baseSize", async function () {
    // Параметры для минтинга и ордеров
    const price = 45000 * 1e9; // Цена покупки равна цене продажи
    const buySize = 1 * 1e8; // Размер покупки меньше
    const sellSize = 2 * 1e8; // Размер продажи больше

    // Alice майнит USDC для покупки BTC
    await usdc.mint(aliceAddress, price * 1e6 / 1e9); // Alice майнит достаточно USDC для покупки 1 BTC по равной цене
    await usdc.connect(alice).approve(orderBook.getAddress(), price);
    await orderBook.connect(alice).openOrder(btcAddress, buySize, price);

    // Bob майнит BTC для продажи
    await btc.mint(bobAddress, sellSize); // Bob майнит 2 BTC для продажи
    await btc.connect(bob).approve(orderBook.getAddress(), sellSize);
    await orderBook.connect(bob).openOrder(btcAddress, -sellSize, price);

    //match orders
    let [aliceOrderId, bobOrderId] = await Promise.all([orderBook.ordersByTrader(aliceAddress, 0), orderBook.ordersByTrader(bobAddress, 0)]);
    await orderBook.matchOrders(bobOrderId, aliceOrderId);

    // Проверяем, что у Alice есть 1 BTC после совершения сделки
    expect(await btc.balanceOf(aliceAddress)).to.equal(1 * 1e8);
    expect(await usdc.balanceOf(aliceAddress)).to.equal(0);

    await orderBook.connect(bob).removeOrder(bobOrderId);

    // Проверяем, что у Bob 1 BTC
    expect(await btc.balanceOf(bobAddress)).to.equal(1 * 1e8);
    // Проверяем, что у Bob есть 45,000 USDC после продажи своего BTC
    expect(await usdc.balanceOf(bobAddress)).to.equal(45000 * 1e6);

  })

  it("✅ buyOrder.orderPrice = sellOrder.orderPrice & buyOrder.baseSize = sellOrder.baseSize", async function () {
    const price = 45000 * 1e9;
    // Alice mints USDC and creates buy BTC order
    await usdc.mint(aliceAddress, 45000 * 1e6);
    await usdc.connect(alice).approve(orderBook.getAddress(), 45000 * 1e6);
    await orderBook.connect(alice).openOrder(btcAddress, 1 * 1e8, price);

    // Bob mints BTC and creates sell BTC order
    await btc.mint(bobAddress, 1 * 1e8);
    await btc.connect(bob).approve(orderBook.getAddress(), 1 * 1e8);
    await orderBook.connect(bob).openOrder(btcAddress, -1 * 1e8, price);

    //match orders
    let [aliceOrderId, bobOrderId] = await Promise.all([orderBook.ordersByTrader(aliceAddress, 0), orderBook.ordersByTrader(bobAddress, 0)]);
    await orderBook.matchOrders(bobOrderId, aliceOrderId);

    //check if alice have 1 BTC
    expect(await btc.balanceOf(alice)).to.equal(1 * 1e8);
    //check if bob have 45000 USDC
    expect(await usdc.balanceOf(bob)).to.equal(45000 * 1e6);

    // Проверяем, что у Alice есть 1 BTC после совершения сделки
    expect(await btc.balanceOf(aliceAddress)).to.equal(1 * 1e8);
    // Проверяем, что у Alice не осталось USDC после покупки 1 BTC за 45,000 USDC
    expect(await usdc.balanceOf(aliceAddress)).to.equal(0);

    // Проверяем, что у Bob нет BTC после продажи его единственного BTC
    expect(await btc.balanceOf(bobAddress)).to.equal(0);
    // Проверяем, что у Bob есть 45,000 USDC после продажи своего BTC
    expect(await usdc.balanceOf(bobAddress)).to.equal(45000 * 1e6);

  });


});



const printLogs = async (tx: any, orderBook: any) => {
  const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
  const iface = new ethers.Interface(orderBook.interface.format());
  for (const log of receipt!.logs) {
    try {
      const parsedLog: any = iface.parseLog(log as any);
      console.log(parsedLog);
    } catch (error) {
      console.error(`Error parsing log: ${log}`, error);
    }
  }

}