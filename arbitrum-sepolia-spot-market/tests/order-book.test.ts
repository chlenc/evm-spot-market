import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { MarketCreateEvent } from "../generated/schema"
import { MarketCreateEvent as MarketCreateEventEvent } from "../generated/OrderBook/OrderBook"
import { handleMarketCreateEvent } from "../src/order-book"
import { createMarketCreateEventEvent } from "./order-book-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let assetId = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let decimal = BigInt.fromI32(234)
    let newMarketCreateEventEvent = createMarketCreateEventEvent(
      assetId,
      decimal
    )
    handleMarketCreateEvent(newMarketCreateEventEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("MarketCreateEvent created and stored", () => {
    assert.entityCount("MarketCreateEvent", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "MarketCreateEvent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "assetId",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "MarketCreateEvent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "decimal",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
