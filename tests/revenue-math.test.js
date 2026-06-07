const assert = require("node:assert/strict");
const { calculatePricingModel, mixTotal, normalizedMix } = require("../revenue-math.js");

const scenario = {
  visitors: 10000,
  conversion: 5,
  churn: 4,
  tiers: [
    { name: "Starter", price: 20, mix: 50 },
    { name: "Pro", price: 80, mix: 30 },
    { name: "Scale", price: 200, mix: 20 }
  ]
};

const model = calculatePricingModel(scenario);

assert.equal(mixTotal(scenario.tiers), 100);
assert.equal(normalizedMix(scenario.tiers, scenario.tiers[1]), 0.3);
assert.equal(model.paidCustomers, 500);
assert.equal(model.tierModels[0].customers, 250);
assert.equal(model.tierModels[1].customers, 150);
assert.equal(model.tierModels[2].customers, 100);
assert.equal(model.mrr, 37000);
assert.equal(model.arpa, 74);
assert.equal(model.annualized, 444000);
assert.equal(model.churnAdjusted, 35520);

const normalizedScenario = {
  visitors: 1000,
  conversion: 10,
  churn: 150,
  tiers: [
    { name: "Low", price: 10, mix: 1 },
    { name: "High", price: 30, mix: 3 }
  ]
};

const normalizedModel = calculatePricingModel(normalizedScenario);

assert.equal(mixTotal(normalizedScenario.tiers), 4);
assert.equal(normalizedMix(normalizedScenario.tiers, normalizedScenario.tiers[0]), 0.25);
assert.equal(normalizedModel.paidCustomers, 100);
assert.equal(normalizedModel.mrr, 2500);
assert.equal(normalizedModel.churnAdjusted, 0);

console.log("Revenue math verification passed.");
