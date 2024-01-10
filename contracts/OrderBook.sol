// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
}

contract OrderBook {
    address public USDC_ADDRESS;
    int constant DUST = 10;
    uint constant FEE_RATE = 500;
    uint constant HUNDRED_PERCENT = 1000000;

    enum MarketStatus {
        Opened,
        Paused,
        Closed
    }

    struct Market {
        address assetId;
        uint32 decimal;
        MarketStatus status;
    }

    struct Order {
        bytes32 id;
        address trader;
        address baseToken;
        int256 baseSize;
        uint256 orderPrice;
    }

    mapping(bytes32 => Order) public orders;
    mapping(address => Market) public markets;
    mapping(address => bytes32[]) public ordersByTrader;

    constructor(address _usdcAddress) {
        USDC_ADDRESS = _usdcAddress;
    }

    function calcOrderId(
        address trader,
        address baseToken,
        uint256 price
    ) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(trader, baseToken, price));
    }

    function abs(int256 x) private pure returns (int256) {
        if (x < 0) {
            return -x;
        }
        return x;
    }

    function min(int256 a, int256 b) public pure returns (int256) {
        if (a < b) {
            return a;
        } else {
            return b;
        }
    }

    function removeOrderInternal(bytes32 orderId) internal {
        Order storage order = orders[orderId];

        require(order.trader != address(0), "Order does not exist");

        bytes32[] storage traderOrders = ordersByTrader[order.trader];
        for (uint i = 0; i < traderOrders.length; i++) {
            if (traderOrders[i] == orderId) {
                traderOrders[i] = traderOrders[traderOrders.length - 1];
                traderOrders.pop();
                break;
            }
        }

        delete orders[orderId];
    }

    function openOrder(
        address baseToken,
        int256 baseSize,
        uint256 orderPrice
    ) public {
        if (baseSize < 0) {
            uint256 size = uint256(abs(baseSize));
            require(
                IERC20(baseToken).transferFrom(msg.sender, address(this), size),
                "Transfer failed"
            );
        } else {
            uint256 scale = 10 ** uint256(markets[baseToken].decimal + 9 - 6);
            uint256 tradeValue = (uint256(abs(baseSize)) * orderPrice) / scale;
            require(
                IERC20(USDC_ADDRESS).transferFrom(
                    msg.sender,
                    address(this),
                    tradeValue
                ),
                "Transfer failed"
            );
        }

        bytes32 id = calcOrderId(msg.sender, baseToken, orderPrice);
        Order storage existingOrder = orders[id];

        if (existingOrder.trader != address(0)) {
            existingOrder.baseSize += baseSize;
            if (existingOrder.baseSize != 0) {
                orders[id] = existingOrder;
            } else {
                removeOrderInternal(id);
            }
        } else {
            Order memory newOrder = Order({
                id: id,
                trader: msg.sender,
                baseToken: baseToken,
                baseSize: baseSize,
                orderPrice: orderPrice
            });
            orders[id] = newOrder;
            ordersByTrader[msg.sender].push(id);
        }
    }

    function removeOrder(bytes32 orderId) public {
        Order storage order = orders[orderId];
        require(order.trader == msg.sender, "Access Denied");

        removeOrderInternal(orderId);
    }

    function removeAllOrders() public {
        address trader = msg.sender;

        bytes32[] storage traderOrders = ordersByTrader[trader];
        for (uint i = 0; i < traderOrders.length; i++) {
            removeOrderInternal(traderOrders[i]);
        }
    }

    function modifyOrder(bytes32 orderId, int256 deltaBaseSize) private {
        Order storage order = orders[orderId];

        int256 newOrderSize = order.baseSize + deltaBaseSize;
        if (newOrderSize < DUST) {
            removeOrderInternal(orderId);
        } else {
            order.baseSize = newOrderSize;
        }
    }

    function matchOrders(
        bytes32 orderSellId,
        bytes32 orderBuyId
    ) public payable {
        Order storage orderSell = orders[orderSellId];
        Order storage orderBuy = orders[orderBuyId];

        require(
            orderSell.baseSize < 0 && orderBuy.baseSize >= 0,
            "First argument should be orderSell, second orderBuy"
        );
        require(
            orderSell.baseToken == orderBuy.baseToken &&
                orderSell.orderPrice <= orderBuy.orderPrice,
            "Orders can't be matched"
        );

        int256 tradeAmount = min(
            abs(orderSell.baseSize),
            abs(orderBuy.baseSize)
        );

        address baseToken = orderSell.baseToken;

        uint256 scale = 10 ** uint256(markets[baseToken].decimal + 9 - 6);
        uint256 tradeValue = (uint256(abs(tradeAmount)) *
            orderSell.orderPrice) / scale;

        require(
            IERC20(baseToken).transfer(orderBuy.trader, uint256(tradeAmount)),
            "Transfer failed"
        );
        modifyOrder(orderBuyId, -tradeAmount);

        require(
            IERC20(USDC_ADDRESS).transfer(orderSell.trader, tradeValue),
            "Transfer failed"
        );
        modifyOrder(orderSellId, tradeAmount);

        // int256 matcherFee = (tradeValue * int256(FEE_RATE)) / int256(HUNDRED_PERCENT);
        // transferToAddress(msg.sender, matcherFee, USDC_ASSET_ID);
    }

    function createMarket(address assetId, uint32 decimal) public {
        require(
            markets[assetId].assetId == address(0),
            "Market already exists"
        );

        Market memory newMarket = Market({
            assetId: assetId,
            decimal: decimal,
            status: MarketStatus.Opened
        });

        markets[assetId] = newMarket;
    }

    function pauseMarket(bytes32 baseToken) public {
        // Implement logic to pause a market
    }

    function unpauseMarket(bytes32 baseToken) public {
        // Implement logic to unpause a market
    }
}
