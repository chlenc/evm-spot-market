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

    // Result(5)[
    //   '0x532e7c698f5213025673ce80f3a84b9f4a793880aaa98049d774130bd9800ca9',
    //   '0x8538B9F22FE51bD16Fa6Eab6a840FA8bf12dd227',
    //   '0x42D0d50EE2A447bb63fe4E43eb06d38D742377Ba',
    //   -39513463n,
    //   51275000000000n
    // ]
    // Result(5)[
    //   '0x5e734c3c8be036b31be53461ada4629680d4d45c241d61af43285fb597df2e31',
    //   '0x3e0c8C7588f6CC08a1a3e8Ce9b025d39e9DFBE14',
    //   '0x42D0d50EE2A447bb63fe4E43eb06d38D742377Ba',
    //   13114416n,
    //   51276000000000n
    // ]

    // Alice mints USDC and creates buy BTC order
    const buyPrice = 51276 * 1e9;
    const buyUsdcAmount = buyPrice / 1e9 * 1e6;
    const buyBtcAmount = (0.13114416 * 1e8).toFixed(0);
    await usdc.mint(alice.address, buyUsdcAmount);
    await usdc.connect(alice).approve(orderBook.getAddress(), buyUsdcAmount);
    await orderBook.connect(alice).openOrder(btcAddress, buyBtcAmount, buyPrice);

    // Bob mints BTC and creates sell BTC order
    const sellPrice = 51275 * 1e9;
    const sellBtcAmount = 0.39513463 * 1e8;
    await btc.mint(bob.address, sellBtcAmount);
    await btc.connect(bob).approve(orderBook.getAddress(), sellBtcAmount);
    await orderBook.connect(bob).openOrder(btcAddress, -1 * sellBtcAmount, sellPrice);

    //match orders
    let [aliceOrderId, bobOrderId] = await Promise.all([orderBook.ordersByTrader(alice.address, 0), orderBook.ordersByTrader(bob.address, 0)]);
    await orderBook.matchOrders(bobOrderId, aliceOrderId);

    await orderBook.connect(bob).removeOrder(bobOrderId);

    // console.log("alice", await btc.balanceOf(alice).then(n => ethers.formatUnits(n, 8)), "btc");
    // console.log("alice", await usdc.balanceOf(alice).then(n => ethers.formatUnits(n, 6)), "usdc");
    // console.log('');
    // console.log("bob", await btc.balanceOf(bob).then(n => ethers.formatUnits(n, 8)), "btc");
    // console.log("bob", await usdc.balanceOf(bob).then(n => ethers.formatUnits(n, 6)), "usdc");
    // console.log('');
    // console.log("orderBook", await btc.balanceOf(orderBook).then(n => ethers.formatUnits(n, 8)), "btc");
    // console.log("orderBook", await usdc.balanceOf(orderBook).then(n => ethers.formatUnits(n, 6)), "usdc");

    // expect(await btc.balanceOf(alice)).to.equal(buyBtcAmount);
    // expect(await usdc.balanceOf(bob)).to.equal(buyUsdcAmount);

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

