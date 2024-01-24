import { ethers } from "hardhat";

const USDC_DECIMALS = 6;

async function main() {
    // Boilerplate contracts
    const [deployer] = await ethers.getSigners();

    // 1. Deploy BaseToken and QuoteToken
    const BaseToken = await ethers.getContractFactory("BaseToken");
    const baseToken = await BaseToken.deploy();
    await baseToken.waitForDeployment();

    const QuoteToken = await ethers.getContractFactory("QuoteToken");
    const quoteToken = await QuoteToken.deploy();
    await quoteToken.waitForDeployment();

    // 2. Deploy USDC Token
    const TestERC20 = await ethers.getContractFactory("TestERC20");
    const USDC = await TestERC20.deploy();
    await USDC.waitForDeployment();

    // 3. Deploy UniswapV3Factory and create a pool
    const UniswapV3Factory = await ethers.getContractFactory("UniswapV3Factory");
    const uniV3Factory = await UniswapV3Factory.deploy();
    await uniV3Factory.waitForDeployment();

    const uniFeeTier = 10000; // 1%
    await uniV3Factory.createPool(baseToken.getAddress(), quoteToken.getAddress(), uniFeeTier);

    // Protocol contracts
    // 1. ClearingHouseConfig
    const ClearingHouseConfig = await ethers.getContractFactory("ClearingHouseConfig");
    const clearingHouseConfig = await ClearingHouseConfig.deploy();
    await clearingHouseConfig.waitForDeployment();

    // 2. MarketRegistry
    const MarketRegistry = await ethers.getContractFactory("MarketRegistry");
    const marketRegistry = await MarketRegistry.deploy(uniV3Factory.getAddress(), quoteToken.getAddress());
    await marketRegistry.waitForDeployment();

    // 3. OrderBook
    const OrderBook = await ethers.getContractFactory("OrderBook");
    const orderBook = await OrderBook.deploy(marketRegistry.getAddress());
    await orderBook.waitForDeployment();

    // 4. InsuranceFund
    const InsuranceFund = await ethers.getContractFactory("InsuranceFund");
    const insuranceFund = await InsuranceFund.deploy(USDC.getAddress());
    await insuranceFund.waitForDeployment();

    // 5. Exchange
    const Exchange = await ethers.getContractFactory("Exchange");
    const exchange = await Exchange.deploy(
        marketRegistry.getAddress(), 
        orderBook.getAddress(), 
        clearingHouseConfig.getAddress()
    );
    await exchange.waitForDeployment();

    // 6. AccountBalance
    const AccountBalance = await ethers.getContractFactory("AccountBalance");
    const accountBalance = await AccountBalance.deploy(
        clearingHouseConfig.getAddress(), 
        orderBook.getAddress()
    );
    await accountBalance.waitForDeployment();

    // 7. Vault
    const Vault = await ethers.getContractFactory("Vault");
    const vault = await Vault.deploy(
        insuranceFund.getAddress(),
        clearingHouseConfig.getAddress(),
        accountBalance.getAddress(),
        exchange.getAddress(),
    );
    await vault.waitForDeployment();

    // 8. CollateralManager
    const CollateralManager = await ethers.getContractFactory("CollateralManager");
    const collateralManager = await CollateralManager.deploy(
        clearingHouseConfig.getAddress(),
        vault.getAddress(),
        5, // maxCollateralTokensPerAccount
        "750000", // debtNonSettlementTokenValueRatio
        "500000", // liquidationRatio
        "2000", // mmRatioBuffer
        "30000", // clInsuranceFundFeeRatio
        ethers.parseUnits("10000", USDC_DECIMALS), // debtThreshold
        ethers.parseUnits("500", USDC_DECIMALS), // collateralValueDust
    );
    await collateralManager.waitForDeployment();

    // 9. ClearingHouse
    const ClearingHouse = await ethers.getContractFactory("ClearingHouse");
    const clearingHouse = await ClearingHouse.deploy(
        clearingHouseConfig.getAddress(),
        vault.getAddress(),
        quoteToken.getAddress(),
        uniV3Factory.getAddress(),
        exchange.getAddress(),
        accountBalance.getAddress(),
        insuranceFund.getAddress()
    );
    await clearingHouse.waitForDeployment();

    console.log("Deployment completed successfully.");
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});