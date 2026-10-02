import test from "node:test";
import assert from "node:assert/strict";

import {
  PHOTO_CREDITS,
  PRODUCTS,
  calculateTotals,
  countBasketItems,
  filterProducts,
  formatPrice,
  validateCardDetails,
  validateDeliveryDetails,
} from "./shop-data";
import { PRODUCT_DETAILS, getAverageRating } from "./product-details";

const validCard = { nameOnCard: "SAM TAYLOR", cardNumber: "4532 0123 4567 8901", expiry: "12/35", cvv: "321" };

test("formats pence as pounds", () => {
  assert.equal(formatPrice(90), "£0.90");
  assert.equal(formatPrice(3500), "£35.00");
});

test("search filters by keyword, ignoring case", () => {
  const names = filterProducts(PRODUCTS, { query: "TEA" }).map((product) => product.name);
  assert.deepEqual(names, ["Box of 80 Tea Bags"]);
});

test("category filters include Under £5", () => {
  assert.equal(filterProducts(PRODUCTS, { category: "household" }).length, 8);
  assert.equal(filterProducts(PRODUCTS, { category: "groceries" }).length, 16);
  const underFive = filterProducts(PRODUCTS, { category: "under-5" });
  assert.ok(underFive.every((product) => product.pricePence < 500));
  assert.ok(!underFive.some((product) => product.id === "laundry-detergent"));
});

test("sorts by price in both directions", () => {
  const lowToHigh = filterProducts(PRODUCTS, { sort: "price-asc" });
  const highToLow = filterProducts(PRODUCTS, { sort: "price-desc" });
  assert.equal(lowToHigh[0].id, "carrots");
  assert.equal(highToLow[0].id, "laundry-detergent");
});

test("charges £3.99 delivery under £35", () => {
  const totals = calculateTotals({ "tea-bags": 2 });
  assert.equal(totals.subtotalPence, 500);
  assert.equal(totals.deliveryPence, 399);
  assert.equal(totals.totalPence, 899);
  assert.equal(totals.remainingForFreeDeliveryPence, 3000);
  assert.equal(Math.round(totals.freeDeliveryProgressPercent), 14);
  assert.equal(totals.qualifiesForFreeDelivery, false);
});

test("delivery is free at exactly £35", () => {
  const totals = calculateTotals({ "laundry-detergent": 5, "tea-bags": 1 });
  assert.equal(totals.subtotalPence, 3500);
  assert.equal(totals.deliveryPence, 0);
  assert.equal(totals.qualifiesForFreeDelivery, true);
  assert.equal(totals.freeDeliveryProgressPercent, 100);
});

test("progress stays at 100% above the threshold", () => {
  const totals = calculateTotals({ "laundry-detergent": 10 });
  assert.equal(totals.freeDeliveryProgressPercent, 100);
  assert.equal(totals.remainingForFreeDeliveryPence, 0);
});

test("every product has a photo credit", () => {
  const credited = new Set(PHOTO_CREDITS.map((credit) => credit.productId));
  assert.deepEqual(PRODUCTS.filter((product) => !credited.has(product.id)).map((product) => product.id), []);
});

test("every product has a details page with reviews", () => {
  for (const product of PRODUCTS) {
    const details = PRODUCT_DETAILS[product.id];
    assert.ok(details, `${product.id} is missing details`);
    assert.ok(details.reviews.length > 0, `${product.id} has no reviews`);
    if (product.category === "groceries") assert.ok(details.nutrition, `${product.id} is missing nutrition`);
  }
});

test("average rating is rounded to one decimal place", () => {
  assert.equal(getAverageRating([{ rating: 5 }, { rating: 4 }, { rating: 4 }].map((r) => ({ ...r, author: "", date: "", title: "", body: "" }))), 4.3);
});

test("counts items across lines and ignores unknown products", () => {
  assert.equal(countBasketItems({ "tea-bags": 2, "fresh-milk": 3, "not-a-product": 4 }), 5);
});

test("accepts the practice card, with or without spaces", () => {
  assert.deepEqual(validateCardDetails(validCard), {});
  assert.deepEqual(validateCardDetails({ ...validCard, cardNumber: "4532012345678901" }), {});
  assert.deepEqual(validateCardDetails({ ...validCard, nameOnCard: " sam  taylor " }), {});
  assert.deepEqual(validateCardDetails({ ...validCard, expiry: "1235" }), {});
});

test("rejects details that do not match the practice card", () => {
  const errors = validateCardDetails({ nameOnCard: "YAMA STUDENT", cardNumber: "4532 0123 4567 8900", expiry: "12/28", cvv: "123" });
  assert.ok(errors.nameOnCard);
  assert.ok(errors.cardNumber);
  assert.ok(errors.expiry);
  assert.ok(errors.cvv);
});

test("explains badly formatted card numbers", () => {
  assert.match(validateCardDetails({ ...validCard, cardNumber: "4532 0123" }).cardNumber ?? "", /16 digits/);
});

test("requires delivery fields except address line 2", () => {
  const errors = validateDeliveryDetails({ fullName: "", addressLine1: "", addressLine2: "", townOrCity: "", postcode: "" });
  assert.deepEqual(Object.keys(errors).sort(), ["addressLine1", "fullName", "postcode", "townOrCity"]);
});
