# Spot Market Contract on Solidity with Hardhat

## Project Overview

This project aimed to explore the complexities and differences in building with Solidity and Hardhat compared to Sway and Fuelup. A Spot Market contract was developed and tested to evaluate these technologies.

## Contract Documentation

The Spot Market contract, built on Solidity, facilitates trading between different asset pairs. It includes features like order creation, order matching, and market management. This contract allows to work with spot markets of any erc20 aset to usdc.

### Documentation for Public Functions and Getters of the OrderBook Contract

#### Constructor
```solidity
constructor(address _usdcAddress)
```
- Initializes the contract with the USDC token address.
- `_usdcAddress`: Address of the USDC token.

#### Public Functions

```solidity
function openOrder(address baseToken, int256 baseSize, uint256 orderPrice) public
```
- Opens a new order for trading.
- `baseToken`: Address of the base token for the order.
- `baseSize`: Size of the order. Negative values indicate a sell order, and positive values indicate a buy order.
- `orderPrice`: Price at which the order is placed.

```solidity
function removeOrder(bytes32 orderId) public
```
- Removes an existing order from the order book.
- `orderId`: Unique identifier of the order to be removed.

```solidity
function removeAllOrders() public
```
- Removes all orders placed by the sender from the order book.

```solidity
function matchOrders(bytes32 orderSellId, bytes32 orderBuyId) public payable
```
- Matches a sell order with a buy order and executes the trade.
- `orderSellId`: Identifier of the sell order.
- `orderBuyId`: Identifier of the buy order.

```solidity
function createMarket(address assetId, uint32 decimal) public
```
- Creates a new market for a specific asset.
- `assetId`: Address of the asset for which the market is created.
- `decimal`: Number of decimal places for the asset.

#### Getters

```solidity
function USDC_ADDRESS() public view returns (address)
```
- Returns the address of the USDC token used in the contract.

```solidity
function orders(bytes32) public view returns (Order memory)
```
- Returns details of an order by its identifier.

```solidity
function markets(address) public view returns (Market memory)
```
- Returns details of a market by the asset address.

```solidity
function ordersByTrader(address) public view returns (bytes32[] memory)
```
- Returns a list of order identifiers placed by a specific trader.

---

Note: The contract's public interface provides functionalities for trading in a spot market, including order management, market creation, and order execution. The internal functions support the public interface by handling order modifications and removals.

### Solidity and Hardhat: Advantages

- **VS Code Plugin Stability**: The Solidity VS Code plugin operates seamlessly, without glitches, providing a smooth development experience.
- **Automatic Getter Generation**: Hardhat automatically generates getters for public state variables, simplifying contract interaction.
- **Build and Test Speed**: Hardhat compiles Solidity code and runs tests faster, leading to more efficient development cycles.
- **Cleaner Test Code in JavaScript**: Tests written in JavaScript are more readable and maintainable than those in Rust. This code can also be reused in frontend development.
- **Error Reporting**: Hardhat accurately pinpoints the lines where errors occur in Solidity code, facilitating faster debugging.
- **ChatGPT Compatibility**: ChatGPT works exceptionally well with Solidity and Hardhat, offering significant development assistance.

### Solidity and Hardhat: Disadvantages

- **Language Capability**: Compared to Sway, Solidity appears to be a less powerful language, lacking some advanced features and expressiveness.
- **Blockchain Features Utilization**: Sway enables developers to leverage unique features of the Fuel blockchain, such as native assets and parallelization, which are not as accessible in Solidity.

### Conclusion

The exploration revealed that while Solidity with Hardhat offers an efficient and developer-friendly environment, especially in terms of tooling and testing, it lacks some of the advanced language features and native blockchain capabilities that Sway and Fuelup provide. 