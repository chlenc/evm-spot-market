import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  MarketCreateEvent,
  OrderChangeEvent,
  TradeEvent
} from "../generated/OrderBook/OrderBook"

export function createMarketCreateEventEvent(
  assetId: Address,
  decimal: BigInt,
  timestamp: BigInt
): MarketCreateEvent {
  let marketCreateEventEvent = changetype<MarketCreateEvent>(newMockEvent())

  marketCreateEventEvent.parameters = new Array()

  marketCreateEventEvent.parameters.push(
    new ethereum.EventParam("assetId", ethereum.Value.fromAddress(assetId))
  )
  marketCreateEventEvent.parameters.push(
    new ethereum.EventParam(
      "decimal",
      ethereum.Value.fromUnsignedBigInt(decimal)
    )
  )
  marketCreateEventEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return marketCreateEventEvent
}

export function createOrderChangeEventEvent(
  id: Bytes,
  trader: Address,
  baseToken: Address,
  baseSize: BigInt,
  orderPrice: BigInt,
  timestamp: BigInt
): OrderChangeEvent {
  let orderChangeEventEvent = changetype<OrderChangeEvent>(newMockEvent())

  orderChangeEventEvent.parameters = new Array()

  orderChangeEventEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )
  orderChangeEventEvent.parameters.push(
    new ethereum.EventParam("trader", ethereum.Value.fromAddress(trader))
  )
  orderChangeEventEvent.parameters.push(
    new ethereum.EventParam("baseToken", ethereum.Value.fromAddress(baseToken))
  )
  orderChangeEventEvent.parameters.push(
    new ethereum.EventParam(
      "baseSize",
      ethereum.Value.fromSignedBigInt(baseSize)
    )
  )
  orderChangeEventEvent.parameters.push(
    new ethereum.EventParam(
      "orderPrice",
      ethereum.Value.fromUnsignedBigInt(orderPrice)
    )
  )
  orderChangeEventEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return orderChangeEventEvent
}

export function createTradeEventEvent(
  baseToken: Address,
  matcher: Address,
  tradeAmount: BigInt,
  price: BigInt,
  timestamp: BigInt
): TradeEvent {
  let tradeEventEvent = changetype<TradeEvent>(newMockEvent())

  tradeEventEvent.parameters = new Array()

  tradeEventEvent.parameters.push(
    new ethereum.EventParam("baseToken", ethereum.Value.fromAddress(baseToken))
  )
  tradeEventEvent.parameters.push(
    new ethereum.EventParam("matcher", ethereum.Value.fromAddress(matcher))
  )
  tradeEventEvent.parameters.push(
    new ethereum.EventParam(
      "tradeAmount",
      ethereum.Value.fromUnsignedBigInt(tradeAmount)
    )
  )
  tradeEventEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )
  tradeEventEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return tradeEventEvent
}
