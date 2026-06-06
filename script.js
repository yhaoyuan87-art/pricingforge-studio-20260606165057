const defaults = {
  visitors: 24000,
  conversion: 2.8,
  churn: 3.5,
  tiers: [
    {
      name: "Launch",
      price: 29,
      copy: "For early-stage products validating willingness to pay. Includes core workspace, three active experiments, and founder reporting.",
      mix: 48
    },
    {
      name: "Scale",
      price: 79,
      copy: "For growing SaaS teams that need packaging depth. Includes unlimited scenarios, cohort views, and board-ready revenue snapshots.",
      mix: 37
    },
    {
      name: "Command",
      price: 189,
      copy: "For operators managing premium plans and annual sales motions. Includes advanced segments, expansion signals, and executive exports.",
      mix: 15
    }
  ]
};

let state = structuredClone(defaults);

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const number = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const elements = {
  visitorsInput: document.querySelector("#visitorsInput"),
  conversionInput: document.querySelector("#conversionInput"),
  churnInput: document.querySelector("#churnInput"),
  visitorsValue: document.querySelector("#visitorsValue"),
  conversionValue: document.querySelector("#conversionValue"),
  churnValue: document.querySelector("#churnValue"),
  mrrMetric: document.querySelector("#mrrMetric"),
  arpaMetric: document.querySelector("#arpaMetric"),
  arrMetric: document.querySelector("#arrMetric"),
  signalMetric: document.querySelector("#signalMetric"),
  mrrSubcopy: document.querySelector("#mrrSubcopy"),
  signalSubcopy: document.querySelector("#signalSubcopy"),
  heroSignal: document.querySelector("#heroSignal"),
  heroSignalNote: document.querySelector("#heroSignalNote"),
  tierGrid: document.querySelector("#tierGrid"),
  distributionControls: document.querySelector("#distributionControls"),
  distributionTotal: document.querySelector("#distributionTotal"),
  distributionHelp: document.querySelector("#distributionHelp"),
  recommendationTitle: document.querySelector("#recommendationTitle"),
  recommendationCopy: document.querySelector("#recommendationCopy"),
  recommendationList: document.querySelector("#recommendationList"),
  paidCustomersCopy: document.querySelector("#paidCustomersCopy"),
  revenueBars: document.querySelector("#revenueBars"),
  resetButton: document.querySelector("#resetButton")
};

function getMixTotal() {
  return PricingForgeMath.mixTotal(state.tiers);
}

function normalizedMix(tier) {
  return PricingForgeMath.normalizedMix(state.tiers, tier);
}

function getModel() {
  const model = PricingForgeMath.calculatePricingModel(state);
  const highTierShare = normalizedMix(state.tiers[2]);

  return { ...model, highTierShare };
}

function sanitizePercent(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function renderTierCards() {
  elements.tierGrid.innerHTML = state.tiers
    .map(
      (tier, index) => `
        <article class="tier-card">
          <div class="field">
            <label for="tierName${index}">Tier name</label>
            <input class="text-input" id="tierName${index}" data-tier="${index}" data-field="name" value="${escapeHtml(tier.name)}" />
          </div>
          <div class="field">
            <label for="tierPrice${index}">Monthly price</label>
            <div class="price-wrap">
              <span>$</span>
              <input class="price-input" id="tierPrice${index}" data-tier="${index}" data-field="price" type="number" min="0" step="1" value="${tier.price}" />
            </div>
          </div>
          <div class="field">
            <label for="tierCopy${index}">Package copy</label>
            <textarea class="copy-input" id="tierCopy${index}" data-tier="${index}" data-field="copy">${escapeHtml(tier.copy)}</textarea>
          </div>
          <div class="tier-readout">
            <div>
              <span>Customers</span>
              <strong id="tierCustomers${index}">0</strong>
            </div>
            <div>
              <span>MRR</span>
              <strong id="tierRevenue${index}">$0</strong>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderDistributionControls() {
  elements.distributionControls.innerHTML = state.tiers
    .map(
      (tier, index) => `
        <label class="control">
          <span>
            ${escapeHtml(tier.name || `Tier ${index + 1}`)}
            <output id="mixValue${index}">${tier.mix}%</output>
          </span>
          <input data-tier="${index}" data-field="mix" type="range" min="0" max="100" step="1" value="${tier.mix}" />
        </label>
      `
    )
    .join("");
}

function getRecommendation(model) {
  const priceSpread = Number(state.tiers[2].price || 0) / Math.max(Number(state.tiers[0].price || 1), 1);
  const middleMix = normalizedMix(state.tiers[1]);
  const churn = state.churn;

  if (model.mrr < 10000) {
    return {
      title: "The model needs more pricing power.",
      copy: "MRR is still fragile. Raise the entry package or shift more buyers into the middle tier before investing in acquisition.",
      signal: "Needs work",
      note: "Current revenue does not yet support a strong paid growth motion.",
      items: [
        "Test a higher Launch price with clearer outcome-based packaging.",
        "Give Scale the strongest benefit stack so it becomes the default choice.",
        "Use annual prepay only after monthly conversion holds steady."
      ]
    };
  }

  if (churn > 7) {
    return {
      title: "Retention is the bottleneck.",
      copy: "Revenue looks promising, but churn is absorbing too much of the upside. Packaging should reduce buyer mismatch.",
      signal: "Churn risk",
      note: "Churn-adjusted revenue is materially below gross MRR.",
      items: [
        "Move advanced or support-heavy promises out of the entry tier.",
        "Add stronger onboarding language to the tier most customers choose.",
        "Use the premium tier for high-touch accounts that can sustain service cost."
      ]
    };
  }

  if (middleMix < 0.25) {
    return {
      title: "The middle package is not doing enough work.",
      copy: "A premium pricing page usually needs a confident middle offer. Your current mix leans too hard on the edges.",
      signal: "Rebalance",
      note: "Customer distribution is diluting the intended package ladder.",
      items: [
        "Make Scale the clearest default by moving a decisive feature there.",
        "Reduce Launch copy to buyer qualification instead of broad capability.",
        "Use Command as an anchor with executive or expansion language."
      ]
    };
  }

  if (priceSpread < 4) {
    return {
      title: "Create a stronger premium anchor.",
      copy: "The tiers are converting, but the top package may be too close to the entry point to reveal enterprise willingness to pay.",
      signal: "Upside",
      note: "The top-to-bottom price spread is conservative.",
      items: [
        "Increase Command or add premium-only value tied to revenue outcomes.",
        "Keep Launch focused so the jump to Scale feels rational.",
        "Watch whether ARPA rises without collapsing paid conversion."
      ]
    };
  }

  return {
    title: "Nudge buyers toward the middle package.",
    copy: "The current mix gives you a credible entry point, a healthy default tier, and a premium anchor worth testing.",
    signal: "Balanced",
    note: "Healthy ARPA spread with room to sharpen the top tier.",
    items: [
      "Keep Scale visually and commercially positioned as the default.",
      "Use Command to test expansion appetite with premium workflow language.",
      "If conversion rises, raise Launch before spending more on traffic."
    ]
  };
}

function renderModel() {
  const model = getModel();
  const totalMix = getMixTotal();
  const recommendation = getRecommendation(model);
  const maxRevenue = Math.max(...model.tierModels.map((tier) => tier.revenue), 1);

  elements.visitorsValue.value = number.format(state.visitors);
  elements.conversionValue.value = `${state.conversion.toFixed(1)}%`;
  elements.churnValue.value = `${state.churn.toFixed(1)}%`;
  elements.mrrMetric.textContent = currency.format(model.mrr);
  elements.arpaMetric.textContent = currency.format(model.arpa);
  elements.arrMetric.textContent = currency.format(model.annualized);
  elements.signalMetric.textContent = currency.format(model.churnAdjusted);
  elements.mrrSubcopy.textContent = `${number.format(model.paidCustomers)} projected paid customers`;
  elements.signalSubcopy.textContent = `${currency.format(model.mrr - model.churnAdjusted)} monthly churn drag`;
  elements.distributionTotal.textContent = `${totalMix}%`;
  elements.distributionHelp.textContent =
    totalMix === 100
      ? "Mix totals 100%. Revenue model uses these assumptions directly."
      : "Mix is normalized automatically for revenue modeling.";
  elements.heroSignal.textContent = recommendation.signal;
  elements.heroSignalNote.textContent = recommendation.note;
  elements.recommendationTitle.textContent = recommendation.title;
  elements.recommendationCopy.textContent = recommendation.copy;
  elements.recommendationList.innerHTML = recommendation.items
    .map((item) => `<div class="recommendation-item">${item}</div>`)
    .join("");
  elements.paidCustomersCopy.textContent = `${number.format(model.paidCustomers)} projected paid customers this month`;

  model.tierModels.forEach((tier, index) => {
    document.querySelector(`#tierCustomers${index}`).textContent = number.format(tier.customers);
    document.querySelector(`#tierRevenue${index}`).textContent = currency.format(tier.revenue);
    const mixOutput = document.querySelector(`#mixValue${index}`);
    if (mixOutput) mixOutput.value = `${state.tiers[index].mix}%`;
  });

  elements.revenueBars.innerHTML = model.tierModels
    .map((tier) => {
      const width = Math.max(4, (tier.revenue / maxRevenue) * 100);
      return `
        <div class="bar-row">
          <div class="bar-label">
            <strong>${escapeHtml(tier.name || "Untitled")}</strong>
            <span>${Math.round(normalizedMix(tier) * 100)}% of customers</span>
          </div>
          <div class="bar-track" aria-hidden="true">
            <div class="bar-fill" style="width: ${width}%"></div>
          </div>
          <div class="bar-value">
            <strong>${currency.format(tier.revenue)}</strong>
            <span>${number.format(tier.customers)} customers</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function syncControls() {
  elements.visitorsInput.value = state.visitors;
  elements.conversionInput.value = state.conversion;
  elements.churnInput.value = state.churn;
  renderTierCards();
  renderDistributionControls();
  renderModel();
}

elements.visitorsInput.addEventListener("input", (event) => {
  state.visitors = Number(event.target.value);
  renderModel();
});

elements.conversionInput.addEventListener("input", (event) => {
  state.conversion = Number(event.target.value);
  renderModel();
});

elements.churnInput.addEventListener("input", (event) => {
  state.churn = Number(event.target.value);
  renderModel();
});

elements.tierGrid.addEventListener("input", (event) => {
  const input = event.target.closest("[data-tier]");
  if (!input) return;

  const tier = state.tiers[Number(input.dataset.tier)];
  const field = input.dataset.field;
  tier[field] = field === "price" ? Math.max(0, Number(input.value) || 0) : input.value;

  if (field === "name") {
    renderDistributionControls();
  }

  renderModel();
});

elements.distributionControls.addEventListener("input", (event) => {
  const input = event.target.closest("[data-tier]");
  if (!input) return;

  state.tiers[Number(input.dataset.tier)].mix = sanitizePercent(input.value);
  renderModel();
});

elements.resetButton.addEventListener("click", () => {
  state = structuredClone(defaults);
  syncControls();
});

syncControls();
