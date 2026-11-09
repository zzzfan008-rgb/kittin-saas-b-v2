/**
 * 余额自查：直接调用面板接口，把原始 quota 与换算后的金额都打出来。
 *
 * 用途：首次配置面板账号后，用它和兔子API 后台显示的余额对照，
 * 确认换算系数（custom_currency_exchange_rate）是否与面板一致。
 *
 * 用法：npx tsx scripts/check-balance.ts
 */
import { config } from "../server/config";
import { fetchPanelUserSelf } from "../server/lib/panelSession";
import { loadCurrencyMeta, toAmount } from "../server/routes/billing";

async function main(): Promise<void> {
  if (!config.panelUsername() || !config.panelPassword()) {
    console.error("未配置面板账号：请在 .env 填写 GATEWAY_PANEL_USERNAME / GATEWAY_PANEL_PASSWORD");
    process.exit(1);
  }

  const meta = await loadCurrencyMeta();
  const self = await fetchPanelUserSelf();

  console.log("网关        :", config.gatewayBaseUrl());
  console.log("面板账号    :", config.panelUsername());
  console.log("原始 quota  :", self.quota);
  console.log("累计消耗    :", self.usedQuota);
  console.log("换算参数    :", `quota_per_unit=${meta.quotaPerUnit}  rate=${meta.rate}  symbol=${meta.symbol}`);
  console.log("换算余额    :", `${meta.symbol}${toAmount(self.quota, meta).toFixed(2)}`);
  console.log("");
  console.log("请对照兔子API 后台显示的余额：若不一致，在 .env 设置 BALANCE_CURRENCY_RATE 覆盖 rate 后重跑。");
}

main().catch((error) => {
  // 只输出错误类型与码，避免把凭据带进终端记录
  const name = error instanceof Error ? error.name : "Error";
  const code = (error as { code?: string }).code;
  console.error(`余额自查失败：${name}${code ? ` (${code})` : ""}`);
  process.exit(1);
});
