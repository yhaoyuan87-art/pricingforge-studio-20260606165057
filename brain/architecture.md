# Architecture

## Overview

PricingForge Studio 是一个静态前端应用，由 `index.html`、`styles.css`、`script.js` 和 `revenue-math.js` 组成。核心目标是降低部署和 review 成本：直接打开 HTML 或用任意静态服务即可运行。

## System Boundaries

- 无后端服务。
- 无登录和用户系统。
- 无远程 API、AI 调用或支付系统。
- 所有计算在浏览器本地完成。
- 不持久化用户输入。

## Modules

- `index.html`：页面结构、中文产品说明、工作台区域和脚本引用。
- `styles.css`：商用中文 SaaS 工具视觉系统、响应式布局和组件样式。
- `script.js`：UI 状态、事件绑定、中文诊断建议、复制摘要。
- `revenue-math.js`：可测试的收入计算核心。
- `tests/revenue-math.test.js`：收入模型验证。
- `assets/visual-benchmark.svg`：视觉基准资产。

## Data Model

```text
Scenario
- visitors: 月访问量
- conversion: 访问到付费转化率
- churn: 月流失率
- tiers: PricingTier[]

PricingTier
- name: 套餐名称
- price: 月价格
- copy: 套餐卖点
- mix: 客户占比
```

## Execution Flow

用户调整输入 -> `script.js` 更新本地 state -> `revenue-math.js` 计算收入模型 -> UI 重新渲染指标、套餐读数、收入条和诊断建议。

## UI Direction

使用“浅色工作台 + 深色诊断面板 + 绿色增长信号 + 红色风险信号”的商业工具视觉语言。避免通用后台感和纯表单堆叠，首屏必须明确解释产品价值和使用路径。
