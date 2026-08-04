import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addCartLine,
  setCartLineQuantity,
  syncCartWithCatalog,
} from "./cartLogic";

describe("cartLogic", () => {
  it("adds a new line and blocks overselling", () => {
    const first = addCartLine([], "prod_1", 2, 1);
    assert.deepEqual(first.lines, [{ productId: "prod_1", quantity: 1 }]);
    assert.equal(first.error, null);

    const over = addCartLine(first.lines, "prod_1", 2, 5);
    assert.deepEqual(over.lines, [{ productId: "prod_1", quantity: 2 }]);
    assert.match(String(over.error), /Only 2 available/);
  });

  it("removes a line when quantity is set to 0", () => {
    const result = setCartLineQuantity(
      [{ productId: "prod_1", quantity: 2 }],
      "prod_1",
      0,
      5,
    );
    assert.deepEqual(result.lines, []);
    assert.equal(result.error, null);
  });

  it("syncs cart to live catalog inventory", () => {
    const synced = syncCartWithCatalog(
      [
        { productId: "a", quantity: 5 },
        { productId: "b", quantity: 1 },
        { productId: "c", quantity: 2 },
      ],
      [
        { id: "a", inventory: 2 },
        { id: "b", inventory: 0 },
      ],
    );
    assert.deepEqual(synced, [{ productId: "a", quantity: 2 }]);
  });
});
