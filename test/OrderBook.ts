import { expect } from "chai";
import { ethers } from "hardhat";

describe("OrderBook Contract", function () {


  it("match orders test", async function () {
    //init wallets
    const [admin, alice, bob] = await ethers.getSigners();

    //deploy tokens
    const Token = await ethers.getContractFactory("Erc20Token", admin);
    const btc = await Token.deploy("Bitcoin", "BTC", 8);
    const usdc = await Token.deploy("USD Coin", "USDC", 9);
    const [btcAddress, usdcAddress] = await Promise.all([btc.getAddress(), usdc.getAddress()]);

    //deploy orderbook (second asset id USDC by default)
    const OrderBook = await ethers.getContractFactory("OrderBook", admin);
    const orderBook = await OrderBook.deploy(usdcAddress);

    // market BTC/USDC creation
    await orderBook.createMarket(btcAddress, 8);

    const price = 45000 * 1e9;
    // Alice mints USDC and creates buy BTC order
    await usdc.mint(alice.address, 45000 * 1e6);
    await usdc.connect(alice).approve(orderBook.getAddress(), 45000 * 1e6);
    await orderBook.connect(alice).openOrder(btcAddress, 1 * 1e8, price);

    // Bob mints BTC nd creates sell BTC order
    await btc.mint(bob.address, 1 * 1e8);
    await btc.connect(bob).approve(orderBook.getAddress(), 1 * 1e8);
    await orderBook.connect(bob).openOrder(btcAddress, -1 * 1e8, price);

    //match orders
    let [aliceOrderId, bobOrderId] = await Promise.all([orderBook.ordersByTrader(alice.address, 0), orderBook.ordersByTrader(bob.address, 0)]);
    await orderBook.matchOrders(bobOrderId, aliceOrderId);

    //check if alice have 1 BTC
    expect(await btc.balanceOf(alice)).to.equal(1 * 1e8);
    //check if bob have 45000 USDC
    expect(await usdc.balanceOf(bob)).to.equal(45000 * 1e6);

  });

  it("cancel order test", async function () {
    // Инициализация кошельков
    const [admin, alice] = await ethers.getSigners();

    // Развёртывание токенов
    const Token = await ethers.getContractFactory("Erc20Token", admin);
    const btc = await Token.deploy("Bitcoin", "BTC", 8);
    const usdc = await Token.deploy("USD Coin", "USDC", 9);
    const [btcAddress, usdcAddress] = await Promise.all([btc.getAddress(), usdc.getAddress()]);

    // Развёртывание OrderBook
    const OrderBook = await ethers.getContractFactory("OrderBook", admin);
    const orderBook = await OrderBook.deploy(usdcAddress);

    // Создание рынка BTC/USDC
    await orderBook.createMarket(btcAddress, 8);

    // Alice минтит USDC и создаёт заказ на покупку BTC
    const price = 45000 * 1e9;
    await usdc.mint(alice.address, 45000 * 1e6);
    await usdc.connect(alice).approve(orderBook.getAddress(), 45000 * 1e6);
    await orderBook.connect(alice).openOrder(btcAddress, 1 * 1e8, price);

    // Alice отменяет заказ
    let aliceOrderId = await orderBook.ordersByTrader(alice.address, 0);
    await orderBook.connect(alice).removeOrder(aliceOrderId);

    // Проверка баланса Alice
    expect(await usdc.balanceOf(alice.address)).to.equal(45000 * 1e6);


    await usdc.connect(alice).approve(orderBook.getAddress(), 45000 * 1e6);
    await orderBook.connect(alice).openOrder(btcAddress, 0.5 * 1e8, price);
    await orderBook.connect(alice).openOrder(btcAddress, 0.5 * 1e8, price);

    // Alice отменяет заказ
    aliceOrderId = await orderBook.ordersByTrader(alice.address, 0);
    await orderBook.connect(alice).removeOrder(aliceOrderId);

    // Проверка баланса Alice
    expect(await usdc.balanceOf(alice.address)).to.equal(45000 * 1e6);


    await btc.mint(alice.address, 1 * 1e8);
    await usdc.connect(alice).approve(orderBook.getAddress(), 45000 * 1e6);
    await orderBook.connect(alice).openOrder(btcAddress, 1 * 1e8, price);
    await btc.connect(alice).approve(orderBook.getAddress(), 1 * 1e8);
    await orderBook.connect(alice).openOrder(btcAddress, -1 * 1e8, price);

    // Проверка баланса Alice
    expect(await btc.balanceOf(alice.address)).to.equal(1 * 1e8);
    expect(await usdc.balanceOf(alice.address)).to.equal(45000 * 1e6);
  });


  it("expand orders test", async function () {
    // Инициализация кошельков
    const [admin, alice] = await ethers.getSigners();

    // Развёртывание токенов
    const Token = await ethers.getContractFactory("Erc20Token", admin);
    const btc = await Token.deploy("Bitcoin", "BTC", 8);
    const usdc = await Token.deploy("USD Coin", "USDC", 9);
    const [btcAddress, usdcAddress] = await Promise.all([btc.getAddress(), usdc.getAddress()]);

    // Развёртывание OrderBook
    const OrderBook = await ethers.getContractFactory("OrderBook", admin);
    const orderBook = await OrderBook.deploy(usdcAddress);

    // Создание рынка BTC/USDC
    await orderBook.createMarket(btcAddress, 8);

    const price = 45000 * 1e9;

    await usdc.mint(alice.address, 45000 * 1e6);
    await usdc.connect(alice).approve(orderBook.getAddress(), 45000 * 1e6);
    await orderBook.connect(alice).openOrder(btcAddress, 0.5 * 1e8, price);
    await orderBook.connect(alice).openOrder(btcAddress, 0.5 * 1e8, price);


    expect((await orderBook.orders(await orderBook.ordersByTrader(alice.address, 0)))[3]).to.equal(1 * 1e8);

    await btc.mint(alice.address, 1 * 1e8);
    await btc.connect(alice).approve(orderBook.getAddress(), 1 * 1e8);
    await orderBook.connect(alice).openOrder(btcAddress, -0.5 * 1e8, price);
    expect((await orderBook.orders(await orderBook.ordersByTrader(alice.address, 0)))[3]).to.equal(0.5 * 1e8);

    await btc.connect(alice).approve(orderBook.getAddress(), 1 * 1e8);
    await orderBook.connect(alice).openOrder(btcAddress, -0.5 * 1e8, price);


    await btc.mint(alice.address, 1 * 1e8);
    await btc.connect(alice).approve(orderBook.getAddress(), 1 * 1e8);
    await orderBook.connect(alice).openOrder(btcAddress, -0.5 * 1e8, price);
    await orderBook.connect(alice).openOrder(btcAddress, -0.5 * 1e8, price);
    expect((await orderBook.orders(await orderBook.ordersByTrader(alice.address, 0)))[3]).to.equal(-1 * 1e8);


    await usdc.mint(alice.address, 45000 * 1e6);
    await usdc.connect(alice).approve(orderBook.getAddress(), 45000 * 1e6);

    await orderBook.connect(alice).openOrder(btcAddress, 0.5 * 1e8, price);
    expect((await orderBook.orders(await orderBook.ordersByTrader(alice.address, 0)))[3]).to.equal(-0.5 * 1e8);

  });
});

