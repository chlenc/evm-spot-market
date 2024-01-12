import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  MarketCreateEvent,
  OrderChangeEvent,
  OrderCreateEvent,
  OrderRemoveEvent,
  TradeEvent
} from "../generated/Orderbook/Orderbook"

export function createMarketCreateEventEvent(
  assetId: Address,
  decimal: BigInt
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

  return marketCreateEventEvent
}

export function createOrderChangeEventEvent(
  id: Bytes,
  baseSize: BigInt
): OrderChangeEvent {
  let orderChangeEventEvent = changetype<OrderChangeEvent>(newMockEvent())

  orderChangeEventEvent.parameters = new Array()

  orderChangeEventEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )
  orderChangeEventEvent.parameters.push(
    new ethereum.EventParam(
      "baseSize",
      ethereum.Value.fromSignedBigInt(baseSize)
    )
  )

  return orderChangeEventEvent
}

export function createOrderCreateEventEvent(
  id: Bytes,
  trader: Address,
  baseToken: Address,
  baseSize: BigInt,
  orderPrice: BigInt
): OrderCreateEvent {
  let orderCreateEventEvent = changetype<OrderCreateEvent>(newMockEvent())

  orderCreateEventEvent.parameters = new Array()

  orderCreateEventEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )
  orderCreateEventEvent.parameters.push(
    new ethereum.EventParam("trader", ethereum.Value.fromAddress(trader))
  )
  orderCreateEventEvent.parameters.push(
    new ethereum.EventParam("baseToken", ethereum.Value.fromAddress(baseToken))
  )
  orderCreateEventEvent.parameters.push(
    new ethereum.EventParam(
      "baseSize",
      ethereum.Value.fromSignedBigInt(baseSize)
    )
  )
  orderCreateEventEvent.parameters.push(
    new ethereum.EventParam(
      "orderPrice",
      ethereum.Value.fromUnsignedBigInt(orderPrice)
    )
  )

  return orderCreateEventEvent
}

export function createOrderRemoveEventEvent(id: Bytes): OrderRemoveEvent {
  let orderRemoveEventEvent = changetype<OrderRemoveEvent>(newMockEvent())

  orderRemoveEventEvent.parameters = new Array()

  orderRemoveEventEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )

  return orderRemoveEventEvent
}

export function createTradeEventEvent(
  baseToken: Address,
  matcher: Address,
  tradeAmount: BigInt,
  price: BigInt
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

  return tradeEventEvent
}
