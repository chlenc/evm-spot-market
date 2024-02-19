// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt,
} from "@graphprotocol/graph-ts";

export class MarketCreateEvent extends ethereum.Event {
  get params(): MarketCreateEvent__Params {
    return new MarketCreateEvent__Params(this);
  }
}

export class MarketCreateEvent__Params {
  _event: MarketCreateEvent;

  constructor(event: MarketCreateEvent) {
    this._event = event;
  }

  get assetId(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get decimal(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get timestamp(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class OrderChangeEvent extends ethereum.Event {
  get params(): OrderChangeEvent__Params {
    return new OrderChangeEvent__Params(this);
  }
}

export class OrderChangeEvent__Params {
  _event: OrderChangeEvent;

  constructor(event: OrderChangeEvent) {
    this._event = event;
  }

  get id(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get trader(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get baseToken(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get baseSize(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }

  get orderPrice(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }

  get timestamp(): BigInt {
    return this._event.parameters[5].value.toBigInt();
  }
}

export class TradeEvent extends ethereum.Event {
  get params(): TradeEvent__Params {
    return new TradeEvent__Params(this);
  }
}

export class TradeEvent__Params {
  _event: TradeEvent;

  constructor(event: TradeEvent) {
    this._event = event;
  }

  get baseToken(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get matcher(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get tradeAmount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get price(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }

  get timestamp(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }
}

export class OrderBook__marketsResult {
  value0: Address;
  value1: BigInt;

  constructor(value0: Address, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromAddress(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    return map;
  }

  getAssetId(): Address {
    return this.value0;
  }

  getDecimal(): BigInt {
    return this.value1;
  }
}

export class OrderBook__ordersResult {
  value0: Bytes;
  value1: Address;
  value2: Address;
  value3: BigInt;
  value4: BigInt;

  constructor(
    value0: Bytes,
    value1: Address,
    value2: Address,
    value3: BigInt,
    value4: BigInt,
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromFixedBytes(this.value0));
    map.set("value1", ethereum.Value.fromAddress(this.value1));
    map.set("value2", ethereum.Value.fromAddress(this.value2));
    map.set("value3", ethereum.Value.fromSignedBigInt(this.value3));
    map.set("value4", ethereum.Value.fromUnsignedBigInt(this.value4));
    return map;
  }

  getId(): Bytes {
    return this.value0;
  }

  getTrader(): Address {
    return this.value1;
  }

  getBaseToken(): Address {
    return this.value2;
  }

  getBaseSize(): BigInt {
    return this.value3;
  }

  getOrderPrice(): BigInt {
    return this.value4;
  }
}

export class OrderBook extends ethereum.SmartContract {
  static bind(address: Address): OrderBook {
    return new OrderBook("OrderBook", address);
  }

  USDC_ADDRESS(): Address {
    let result = super.call("USDC_ADDRESS", "USDC_ADDRESS():(address)", []);

    return result[0].toAddress();
  }

  try_USDC_ADDRESS(): ethereum.CallResult<Address> {
    let result = super.tryCall("USDC_ADDRESS", "USDC_ADDRESS():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  markets(param0: Address): OrderBook__marketsResult {
    let result = super.call("markets", "markets(address):(address,uint32)", [
      ethereum.Value.fromAddress(param0),
    ]);

    return new OrderBook__marketsResult(
      result[0].toAddress(),
      result[1].toBigInt(),
    );
  }

  try_markets(param0: Address): ethereum.CallResult<OrderBook__marketsResult> {
    let result = super.tryCall("markets", "markets(address):(address,uint32)", [
      ethereum.Value.fromAddress(param0),
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new OrderBook__marketsResult(value[0].toAddress(), value[1].toBigInt()),
    );
  }

  orders(param0: Bytes): OrderBook__ordersResult {
    let result = super.call(
      "orders",
      "orders(bytes32):(bytes32,address,address,int256,uint256)",
      [ethereum.Value.fromFixedBytes(param0)],
    );

    return new OrderBook__ordersResult(
      result[0].toBytes(),
      result[1].toAddress(),
      result[2].toAddress(),
      result[3].toBigInt(),
      result[4].toBigInt(),
    );
  }

  try_orders(param0: Bytes): ethereum.CallResult<OrderBook__ordersResult> {
    let result = super.tryCall(
      "orders",
      "orders(bytes32):(bytes32,address,address,int256,uint256)",
      [ethereum.Value.fromFixedBytes(param0)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new OrderBook__ordersResult(
        value[0].toBytes(),
        value[1].toAddress(),
        value[2].toAddress(),
        value[3].toBigInt(),
        value[4].toBigInt(),
      ),
    );
  }

  ordersByTrader(param0: Address, param1: BigInt): Bytes {
    let result = super.call(
      "ordersByTrader",
      "ordersByTrader(address,uint256):(bytes32)",
      [
        ethereum.Value.fromAddress(param0),
        ethereum.Value.fromUnsignedBigInt(param1),
      ],
    );

    return result[0].toBytes();
  }

  try_ordersByTrader(
    param0: Address,
    param1: BigInt,
  ): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "ordersByTrader",
      "ordersByTrader(address,uint256):(bytes32)",
      [
        ethereum.Value.fromAddress(param0),
        ethereum.Value.fromUnsignedBigInt(param1),
      ],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _usdcAddress(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class CreateMarketCall extends ethereum.Call {
  get inputs(): CreateMarketCall__Inputs {
    return new CreateMarketCall__Inputs(this);
  }

  get outputs(): CreateMarketCall__Outputs {
    return new CreateMarketCall__Outputs(this);
  }
}

export class CreateMarketCall__Inputs {
  _call: CreateMarketCall;

  constructor(call: CreateMarketCall) {
    this._call = call;
  }

  get assetId(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get decimal(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class CreateMarketCall__Outputs {
  _call: CreateMarketCall;

  constructor(call: CreateMarketCall) {
    this._call = call;
  }
}

export class MatchOrdersCall extends ethereum.Call {
  get inputs(): MatchOrdersCall__Inputs {
    return new MatchOrdersCall__Inputs(this);
  }

  get outputs(): MatchOrdersCall__Outputs {
    return new MatchOrdersCall__Outputs(this);
  }
}

export class MatchOrdersCall__Inputs {
  _call: MatchOrdersCall;

  constructor(call: MatchOrdersCall) {
    this._call = call;
  }

  get orderSellId(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get orderBuyId(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }
}

export class MatchOrdersCall__Outputs {
  _call: MatchOrdersCall;

  constructor(call: MatchOrdersCall) {
    this._call = call;
  }
}

export class OpenOrderCall extends ethereum.Call {
  get inputs(): OpenOrderCall__Inputs {
    return new OpenOrderCall__Inputs(this);
  }

  get outputs(): OpenOrderCall__Outputs {
    return new OpenOrderCall__Outputs(this);
  }
}

export class OpenOrderCall__Inputs {
  _call: OpenOrderCall;

  constructor(call: OpenOrderCall) {
    this._call = call;
  }

  get baseToken(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get baseSize(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get orderPrice(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class OpenOrderCall__Outputs {
  _call: OpenOrderCall;

  constructor(call: OpenOrderCall) {
    this._call = call;
  }
}

export class RemoveOrderCall extends ethereum.Call {
  get inputs(): RemoveOrderCall__Inputs {
    return new RemoveOrderCall__Inputs(this);
  }

  get outputs(): RemoveOrderCall__Outputs {
    return new RemoveOrderCall__Outputs(this);
  }
}

export class RemoveOrderCall__Inputs {
  _call: RemoveOrderCall;

  constructor(call: RemoveOrderCall) {
    this._call = call;
  }

  get orderId(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }
}

export class RemoveOrderCall__Outputs {
  _call: RemoveOrderCall;

  constructor(call: RemoveOrderCall) {
    this._call = call;
  }
}
