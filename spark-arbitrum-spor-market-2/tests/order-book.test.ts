import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { LogMessage } from "../generated/schema"
import { LogMessage as LogMessageEvent } from "../generated/OrderBook/OrderBook"
import { handleLogMessage } from "../src/order-book"
import { createLogMessageEvent } from "./order-book-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let message = BigInt.fromI32(234)
    let newLogMessageEvent = createLogMessageEvent(message)
    handleLogMessage(newLogMessageEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("LogMessage created and stored", () => {
    assert.entityCount("LogMessage", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "LogMessage",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "message",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
