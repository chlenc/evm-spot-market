import {
  MarketCreateEvent as MarketCreateEventEvent,
  OrderChangeEvent as OrderChangeEventEvent,
  OrderCreateEvent as OrderCreateEventEvent,
  OrderRemoveEvent as OrderRemoveEventEvent,
  TradeEvent as TradeEventEvent
} from "../generated/Orderbook/Orderbook"
import {
  MarketCreateEvent,
  OrderChangeEvent,
  OrderCreateEvent,
  OrderRemoveEvent,
  TradeEvent
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
  entity.Orderbook_id = event.params.id
  entity.baseSize = event.params.baseSize

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOrderCreateEvent(event: OrderCreateEventEvent): void {
  let entity = new OrderCreateEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.Orderbook_id = event.params.id
  entity.trader = event.params.trader
  entity.baseToken = event.params.baseToken
  entity.baseSize = event.params.baseSize
  entity.orderPrice = event.params.orderPrice

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOrderRemoveEvent(event: OrderRemoveEventEvent): void {
  let entity = new OrderRemoveEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.Orderbook_id = event.params.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
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
