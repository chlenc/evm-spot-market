import { expect } from "chai";
import { ethers } from "hardhat";

describe("OrderBook Contract", function () {

  it("test", async function () {
    const [admin, alice, bob] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Erc20Token", admin);
    const [btc, usdc] = await Promise.all([Token.deploy("Bitcoin", "BTC"), Token.deploy("USD Coin", "USDC")]);
    const [btcAddress, usdcAddress] = await Promise.all([btc.getAddress(), usdc.getAddress()]);

    // console.log({ btcAddress, usdcAddress });

    const OrderBook = await ethers.getContractFactory("OrderBook", admin);
    const orderBook = await OrderBook.deploy(usdcAddress);

    // Создайте маркет BTC/USDC
    await orderBook.createMarket(btcAddress, 8);

    const price = 45000 * 1e9;
    // Alice минтит USDC и создает заказ на покупку BTC
    await usdc.mint(alice.address, 45000 * 1e6);
    await usdc.connect(alice).approve(orderBook.getAddress(), 45000 * 1e6);
    await orderBook.connect(alice).openOrder(btcAddress, 1 * 1e8, price);

    // Bob минтит BTC и создает заказ на продажу BTC
    await btc.mint(bob.address, 1 * 1e8);
    await btc.connect(bob).approve(orderBook.getAddress(), 1 * 1e8);
    await orderBook.connect(bob).openOrder(btcAddress, -1 * 1e8, price);

    let [aliceOrderId, bobOrderId] = await Promise.all([orderBook.ordersByTrader(alice.address, 0), orderBook.ordersByTrader(bob.address, 0)]);

    await orderBook.matchOrders(bobOrderId, aliceOrderId);


    expect(await btc.balanceOf(alice)).to.equal(1 * 1e8);
    expect(await usdc.balanceOf(bob)).to.equal(45000 * 1e6);

  });


});

