import {
  LogMessage as LogMessageEvent,
  MarketCreateEvent as MarketCreateEventEvent,
  OrderChangeEvent as OrderChangeEventEvent,
  TradeEvent as TradeEventEvent
} from "../generated/OrderBook/OrderBook"
import {
  LogMessage,
  MarketCreateEvent,
  OrderChangeEvent,
  TradeEvent
} from "../generated/schema"

export function handleLogMessage(event: LogMessageEvent): void {
  let entity = new LogMessage(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.message = event.params.message

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMarketCreateEvent(event: MarketCreateEventEvent): void {
  let entity = new MarketCreateEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.assetId = event.params.assetId
  entity.decimal = event.params.decimal
  entity.timestamp = event.params.timestamp

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
  entity.timestamp = event.params.timestamp

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
  entity.seller = event.params.seller
  entity.buyer = event.params.buyer
  entity.tradeAmount = event.params.tradeAmount
  entity.price = event.params.price
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
