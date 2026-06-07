(function (root) {
  function mixTotal(tiers) {
    return tiers.reduce((sum, tier) => sum + Number(tier.mix || 0), 0);
  }

  function normalizedMix(tiers, tier) {
    const total = mixTotal(tiers);
    return total > 0 ? Number(tier.mix || 0) / total : 0;
  }

  function calculatePricingModel(input) {
    const tiers = input.tiers || [];
    const visitors = Number(input.visitors || 0);
    const conversion = Number(input.conversion || 0);
    const churn = Number(input.churn || 0);
    const paidCustomers = visitors * (conversion / 100);
    const tierModels = tiers.map((tier) => {
      const customers = paidCustomers * normalizedMix(tiers, tier);
      const revenue = customers * Number(tier.price || 0);
      return { ...tier, customers, revenue };
    });
    const mrr = tierModels.reduce((sum, tier) => sum + tier.revenue, 0);
    const arpa = paidCustomers > 0 ? mrr / paidCustomers : 0;
    const annualized = mrr * 12;
    const retention = Math.max(0, 1 - churn / 100);
    const churnAdjusted = mrr * retention;

    return { paidCustomers, tierModels, mrr, arpa, annualized, churnAdjusted };
  }

  const api = { calculatePricingModel, mixTotal, normalizedMix };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.PricingForgeMath = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
