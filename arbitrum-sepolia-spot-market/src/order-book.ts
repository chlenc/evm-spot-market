import { BigInt } from "@graphprotocol/graph-ts"
import {
  MarketCreateEvent as MarketCreateEventEvent,
  OrderChangeEvent as OrderChangeEventEvent,
  TradeEvent as TradeEventEvent
} from "../generated/OrderBook/OrderBook"
import {
  MarketCreateEvent,
  OrderChangeEvent,
  TradeEvent,
  Order
} from "../generated/schema"

export function handleMarketCreateEvent(event: MarketCreateEventEvent): void {
  let entity = new MarketCreateEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.assetId = event.params.assetId
  entity.decimal = event.params.decimal

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOrderChangeEvent(event: OrderChangeEventEvent): void {
  let entity = new OrderChangeEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.OrderBook_id = event.params.id
  entity.trader = event.params.trader
  entity.baseToken = event.params.baseToken
  entity.baseSize = event.params.baseSize
  entity.orderPrice = event.params.orderPrice

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let orderId = event.params.id.toHex();
  let order = Order.load(orderId);

  if (!order) {
    order = new Order(orderId);
  }

  order.trader = event.params.trader;
  order.baseToken = event.params.baseToken;
  order.baseSize = event.params.baseSize;
  order.orderPrice = event.params.orderPrice;
  order.isActive = event.params.baseSize != BigInt.zero(); // Проверка на активность

  order.save();
}

export function handleTradeEvent(event: TradeEventEvent): void {
  let entity = new TradeEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.baseToken = event.params.baseToken
  entity.matcher = event.params.matcher
  entity.tradeAmount = event.params.tradeAmount
  entity.price = event.params.price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
