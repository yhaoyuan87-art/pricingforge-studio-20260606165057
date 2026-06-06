const defaults = {
  visitors: 18000,
  conversion: 2.6,
  churn: 3.2,
  tiers: [
    {
      name: "入门版",
      price: 99,
      copy: "给刚开始验证付费意愿的个人开发者。包含核心工作台、3 个定价场景和基础收入预测。",
      mix: 46
    },
    {
      name: "增长版",
      price: 299,
      copy: "给已经有稳定线索的小团队。包含无限场景、套餐对比、客户结构分析和汇报摘要。",
      mix: 39
    },
    {
      name: "旗舰版",
      price: 899,
      copy: "给正在测试高客单价的团队。包含高端套餐锚点、年度合同假设和管理层决策视图。",
      mix: 15
    }
  ]
};

let state = structuredClone(defaults);

const currency = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0
});

const number = new Intl.NumberFormat("zh-CN", {
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
  tierGrid: document.querySelector("#tierGrid"),
  distributionControls: document.querySelector("#distributionControls"),
  distributionTotal: document.querySelector("#distributionTotal"),
  distributionHelp: document.querySelector("#distributionHelp"),
  recommendationTitle: document.querySelector("#recommendationTitle"),
  recommendationCopy: document.querySelector("#recommendationCopy"),
  recommendationList: document.querySelector("#recommendationList"),
  paidCustomersCopy: document.querySelector("#paidCustomersCopy"),
  revenueBars: document.querySelector("#revenueBars"),
  resetButton: document.querySelector("#resetButton"),
  copySummaryButton: document.querySelector("#copySummaryButton"),
  copyState: document.querySelector("#copyState")
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
          <div class="tier-card__top">
            <span>套餐 ${index + 1}</span>
            ${index === 1 ? '<strong>推荐主推</strong>' : ""}
          </div>
          <div class="field">
            <label for="tierName${index}">套餐名称</label>
            <input class="text-input" id="tierName${index}" data-tier="${index}" data-field="name" value="${escapeHtml(tier.name)}" />
          </div>
          <div class="field">
            <label for="tierPrice${index}">月价格</label>
            <div class="price-wrap">
              <span>¥</span>
              <input class="price-input" id="tierPrice${index}" data-tier="${index}" data-field="price" type="number" min="0" step="1" value="${tier.price}" />
            </div>
          </div>
          <div class="field">
            <label for="tierCopy${index}">套餐卖点</label>
            <textarea class="copy-input" id="tierCopy${index}" data-tier="${index}" data-field="copy">${escapeHtml(tier.copy)}</textarea>
          </div>
          <div class="tier-readout">
            <div>
              <span>预计客户</span>
              <strong id="tierCustomers${index}">0</strong>
            </div>
            <div>
              <span>贡献 MRR</span>
              <strong id="tierRevenue${index}">¥0</strong>
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
            ${escapeHtml(tier.name || `套餐 ${index + 1}`)}
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

  if (model.mrr < 30000) {
    return {
      title: "收入底盘还不够硬，先别急着投放。",
      copy: "当前 MRR 偏薄，说明价格、转化或客户结构里至少有一个环节不够强。先把主推套餐价值说清楚，再扩大流量。",
      signal: "需要打磨",
      items: [
        "把入门版压缩成明确的低风险入口，不要承诺太多。",
        "提高增长版价格或卖点，让它成为最自然的选择。",
        "在转化率稳定前，不要把增长问题简单归因于流量不够。"
      ]
    };
  }

  if (churn > 7) {
    return {
      title: "流失率正在吞掉增长，套餐可能卖错人了。",
      copy: "表面收入不错，但高流失会让增长质量变差。你需要用套餐边界过滤不匹配客户。",
      signal: "流失风险",
      items: [
        "把高服务成本功能从入门版移出，避免吸引低质量客户。",
        "在增长版中加入更明确的成功路径，降低购买后的落差。",
        "旗舰版只承诺高客单价客户真正愿意为之付费的结果。"
      ]
    };
  }

  if (middleMix < 0.28) {
    return {
      title: "中间档太弱，价格页会失去主心骨。",
      copy: "健康的 SaaS 定价通常需要一个强主推档。现在客户分布太偏两端，会让收入结构不稳定。",
      signal: "需要重排",
      items: [
        "把最有业务结果感的能力放进增长版。",
        "入门版只保留验证价值，不要让它看起来过于划算。",
        "旗舰版负责树立价格锚点，不要抢走增长版的核心定位。"
      ]
    };
  }

  if (priceSpread < 5) {
    return {
      title: "高端锚点不够强，ARPA 还有上升空间。",
      copy: "三档价格差距偏保守，用户不容易意识到旗舰版代表更高价值场景。",
      signal: "有上升空间",
      items: [
        "提高旗舰版价格，或者加入明显的管理层/年度合同价值。",
        "保持入门版克制，让增长版成为最容易成交的主推项。",
        "观察提价后 ARPA 是否上升，同时转化率是否保持健康。"
      ]
    };
  }

  return {
    title: "结构健康，可以围绕增长版继续测试。",
    copy: "当前模型具备清晰入口、主推套餐和高端锚点。下一步应该围绕增长版文案和转化率做 A/B 测试。",
    signal: "健康",
    items: [
      "让增长版在视觉和文案上成为默认选择。",
      "用旗舰版测试更高支付意愿，不要害怕拉开价格差。",
      "如果转化率上升，优先提高入门版价格，而不是继续加功能。"
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
  elements.mrrSubcopy.textContent = `预计 ${number.format(model.paidCustomers)} 位月付费客户`;
  elements.signalSubcopy.textContent = `每月流失拖累约 ${currency.format(model.mrr - model.churnAdjusted)}`;
  elements.distributionTotal.textContent = `${totalMix}%`;
  elements.distributionHelp.textContent =
    totalMix === 100
      ? "客户占比正好 100%，当前模型可直接用于汇报。"
      : "客户占比会自动归一化，适合快速试算。";
  elements.heroSignal.textContent = recommendation.signal;
  elements.recommendationTitle.textContent = recommendation.title;
  elements.recommendationCopy.textContent = recommendation.copy;
  elements.recommendationList.innerHTML = recommendation.items
    .map((item) => `<div class="recommendation-item">${item}</div>`)
    .join("");
  elements.paidCustomersCopy.textContent = `预计 ${number.format(model.paidCustomers)} 位月付费客户`;

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
            <strong>${escapeHtml(tier.name || "未命名套餐")}</strong>
            <span>${Math.round(normalizedMix(tier) * 100)}% 客户占比</span>
          </div>
          <div class="bar-track" aria-hidden="true">
            <div class="bar-fill" style="width: ${width}%"></div>
          </div>
          <div class="bar-value">
            <strong>${currency.format(tier.revenue)}</strong>
            <span>${number.format(tier.customers)} 位客户</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function buildSummary() {
  const model = getModel();
  const recommendation = getRecommendation(model);

  return [
    "PricingForge 定价摘要",
    `预计 MRR：${currency.format(model.mrr)}`,
    `ARPA：${currency.format(model.arpa)}`,
    `年化收入：${currency.format(model.annualized)}`,
    `流失调整后收入：${currency.format(model.churnAdjusted)}`,
    `诊断：${recommendation.signal} - ${recommendation.title}`,
    `建议：${recommendation.items.join("；")}`
  ].join("\n");
}

async function copySummary() {
  const summary = buildSummary();

  try {
    await navigator.clipboard.writeText(summary);
    elements.copyState.textContent = "已复制，可直接粘贴到团队群或会议纪要。";
  } catch {
    elements.copyState.textContent = summary;
  }
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
  elements.copyState.textContent = "";
  syncControls();
});

elements.copySummaryButton.addEventListener("click", copySummary);

syncControls();
