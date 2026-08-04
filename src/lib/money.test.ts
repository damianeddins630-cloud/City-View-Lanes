import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { centsToInputValue, formatUsd, parseUsdToCents } from "./money";

describe("money helpers", () => {
  it("formats cents as USD", () => {
    assert.equal(formatUsd(2499), "$24.99");
    assert.equal(formatUsd(0), "$0.00");
  });

  it("parses dollars to cents", () => {
    assert.equal(parseUsdToCents("24.99"), 2499);
    assert.equal(parseUsdToCents("$1,234.50"), 123450);
    assert.equal(parseUsdToCents(-1), null);
    assert.equal(parseUsdToCents("abc"), null);
  });

  it("formats cents for form inputs", () => {
    assert.equal(centsToInputValue(2499), "24.99");
    assert.equal(centsToInputValue(100), "1.00");
  });
});
