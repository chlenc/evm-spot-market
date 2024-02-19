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

    struct Market {
        address assetId;
        uint32 decimal;
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

    event MarketCreateEvent(
        address indexed assetId,
        uint32 decimal,
        uint256 timestamp
    );
    event OrderChangeEvent(
        bytes32 indexed id,
        address indexed trader,
        address indexed baseToken,
        int256 baseSize,
        uint256 orderPrice,
        uint256 timestamp
    );
    event TradeEvent(
        address indexed baseToken,
        address matcher,
        address indexed seller,
        address indexed buyer,
        uint256 tradeAmount,
        uint256 price,
        uint256 timestamp
    );
    event LogMessage(int256 message);

    bool private locked;

    modifier noReentrant() {
        require(!locked, "No reentrancy");
        locked = true;
        _;
        locked = false;
    }

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

    function min(int256 a, int256 b) private pure returns (int256) {
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
    ) public noReentrant {
        require(orderPrice > 0, "Invalid order price");

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
            if (existingOrder.baseSize * baseSize < 0) {
                require(
                    IERC20(baseToken).transfer(
                        msg.sender,
                        uint256(abs(baseSize))
                    ),
                    "Transfer failed"
                );
                uint256 scale = 10 **
                    uint256(markets[baseToken].decimal + 9 - 6);
                uint256 value = (uint256(abs(baseSize)) * orderPrice) / scale;
                require(
                    IERC20(USDC_ADDRESS).transfer(msg.sender, value),
                    "Transfer failed"
                );
            }

            existingOrder.baseSize += baseSize;
            if (existingOrder.baseSize != 0) {
                orders[id] = existingOrder;
            } else {
                removeOrderInternal(id);
            }
            emit OrderChangeEvent(
                id,
                msg.sender,
                baseToken,
                existingOrder.baseSize,
                orderPrice,
                block.timestamp
            );
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
            emit OrderChangeEvent(
                id,
                msg.sender,
                baseToken,
                baseSize,
                orderPrice,
                block.timestamp
            );
        }
    }

    function removeOrder(bytes32 orderId) public noReentrant {
        Order storage order = orders[orderId];
        require(order.trader == msg.sender, "Access Denied");
        uint256 baseAbs = uint256(abs(order.baseSize));
        if (order.baseSize < 0) {
            require(
                IERC20(order.baseToken).transfer(order.trader, baseAbs),
                "Transfer failed"
            );
        } else {
            uint256 scale = 10 **
                uint256(markets[order.baseToken].decimal + 9 - 6);
            uint256 tradeValue = (baseAbs * order.orderPrice) / scale;
            require(
                IERC20(USDC_ADDRESS).transfer(order.trader, tradeValue),
                "Transfer failed"
            );
        }
        removeOrderInternal(orderId);
        emit OrderChangeEvent(
            orderId,
            order.trader,
            order.baseToken,
            order.baseSize,
            order.orderPrice,
            block.timestamp
        );
    }

    // function removeAllOrders() public {
    //     address trader = msg.sender;

    //     bytes32[] storage traderOrders = ordersByTrader[trader];
    //     for (uint i = 0; i < traderOrders.length; i++) {
    //         removeOrderInternal(traderOrders[i]);
    //         //todo отправлять обратно деньги
    //     }
    // }

    function modifyOrder(bytes32 orderId, int256 deltaBaseSize) private {
        Order storage order = orders[orderId];

        int256 newOrderSize = order.baseSize + deltaBaseSize;
        if (abs(newOrderSize) < DUST) {
            newOrderSize = 0;
            removeOrderInternal(orderId);
        } else {
            order.baseSize = newOrderSize;
        }
        emit OrderChangeEvent(
            orderId,
            order.trader,
            order.baseToken,
            newOrderSize,
            order.orderPrice,
            block.timestamp
        );
    }

    function matchOrders(
        bytes32 orderSellId,
        bytes32 orderBuyId
    ) public noReentrant {
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

        uint256 price = orderSell.orderPrice;
        uint256 scale = 10 ** uint256(markets[baseToken].decimal + 9 - 6);
        uint256 tradeValue = (uint256(abs(tradeAmount)) * price) / scale;

        require(
            IERC20(baseToken).transfer(orderBuy.trader, uint256(tradeAmount)),
            "Transfer failed"
        );
        if (orderBuy.orderPrice > orderSell.orderPrice) {
            uint256 diff = (uint256(abs(tradeAmount)) * orderBuy.orderPrice) /
                scale -
                tradeValue;
            require(
                IERC20(USDC_ADDRESS).transfer(orderBuy.trader, diff),
                "Transfer failed"
            );
        }
        modifyOrder(orderBuyId, -tradeAmount);

        require(
            IERC20(USDC_ADDRESS).transfer(orderSell.trader, tradeValue),
            "Transfer failed"
        );
        modifyOrder(orderSellId, tradeAmount);

        // int256 matcherFee = (tradeValue * int256(FEE_RATE)) / int256(HUNDRED_PERCENT);
        // transferToAddress(msg.sender, matcherFee, USDC_ASSET_ID);

        emit TradeEvent(
            baseToken,
            msg.sender,
            orderSell.trader,
            orderBuy.trader,
            uint256(abs(tradeAmount)),
            price,
            block.timestamp
        );
    }

    function createMarket(address assetId, uint32 decimal) public {
        require(
            markets[assetId].assetId == address(0) ||
                markets[assetId].decimal != 0,
            "Market already exists or uninitialized"
        );

        Market memory newMarket = Market({
            assetId: assetId,
            decimal: decimal
            // status: MarketStatus.Opened
        });

        markets[assetId] = newMarket;

        emit MarketCreateEvent(
            newMarket.assetId,
            newMarket.decimal,
            block.timestamp
        );
    }

    // function pauseMarket(bytes32 baseToken) public {
    //     // Implement logic to pause a market
    // }

    // function unpauseMarket(bytes32 baseToken) public {
    //     // Implement logic to unpause a market
    // }
}
