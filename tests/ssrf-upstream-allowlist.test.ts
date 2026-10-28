/**
 * SSRF × 代理 fake-IP 白名单（用户 2026-10-28 拍板 P2）。
 *
 * 现象：Clash 等代理开 TUN 模式时，被代理域名解析成 fake-IP（198.18.0.0/15），
 * 我们回源下载上游产物（阿里 OSS / Google 图床 / 字节 TOS / 兔子）会被 SSRF 守卫
 * 判为非公网而失败 —— 只有「返回直链」的模型会中招（gpt-image 系走 base64 不受影响）。
 *
 * 放行边界（必须锁死）：
 *  - 仅固定后缀的上游产物域名 + 仅 fake-IP 段；
 *  - 私网/回环/链路本地/云元数据地址，即使是白名单域名也必须拒绝；
 *  - 非白名单域名的 fake-IP 仍然拒绝。
 */
import assert from "node:assert/strict";

const {
  isUpstreamArtifactHost,
  isAddressAllowedForHost,
  assertUrlAllowed,
  isGlobalIpAddress,
} = await import("../server/lib/fileStore");

console.log("SSRF × 代理 fake-IP 白名单");

let passed = 0;
function ok(name: string, fn: () => void | Promise<void>): void | Promise<void> {
  const result = fn();
  if (result instanceof Promise) {
    return result.then(() => {
      passed += 1;
      console.log(`  ✓ ${name}`);
    });
  }
  passed += 1;
  console.log(`  ✓ ${name}`);
}

ok("白名单命中：阿里 OSS / Google 图床 / 字节 TOS / 兔子网关", () => {
  for (const host of [
    "dashscope-a717.oss-accelerate.aliyuncs.com",
    "apioss0.sydney-ai.com",
    "ark-acg-cn-beijing.tos-cn-beijing.volces.com",
    "api.tu-zi.com",
    "aliyuncs.com",
  ]) {
    assert.equal(isUpstreamArtifactHost(host), true, `${host} 应在白名单内`);
  }
});

ok("后缀边界：伪装域名不得命中", () => {
  for (const host of [
    "evil.com",
    "notaliyuncs.com",
    "aliyuncs.com.evil.com",
    "sydney-ai.com.attacker.net",
    "tu-zi.com.cn",           // 注意：*.com.cn 不是 tu-zi.com 子域
  ]) {
    assert.equal(isUpstreamArtifactHost(host), false, `${host} 不应命中白名单`);
  }
});

ok("fake-IP 仅对白名单域名放行", () => {
  assert.equal(isAddressAllowedForHost("apioss0.sydney-ai.com", "198.18.0.47"), true);
  assert.equal(isAddressAllowedForHost("dashscope-a717.oss-accelerate.aliyuncs.com", "198.18.0.80"), true);
  assert.equal(isAddressAllowedForHost("api.tu-zi.com", "198.19.5.6"), true, "198.18.0.0/15 整段");
  assert.equal(isAddressAllowedForHost("evil.com", "198.18.0.47"), false, "非白名单域名不得放行 fake-IP");
});

ok("私网/回环/元数据地址：即使是白名单域名也拒绝", () => {
  for (const address of ["10.0.0.5", "127.0.0.1", "169.254.169.254", "192.168.1.10", "::1"]) {
    assert.equal(
      isAddressAllowedForHost("api.tu-zi.com", address),
      false,
      `${address} 不得因域名白名单被放行`,
    );
  }
});

ok("公网地址行为不变（任何域名都放行）", () => {
  assert.equal(isGlobalIpAddress("47.113.75.27"), true);
  assert.equal(isAddressAllowedForHost("api.tu-zi.com", "47.113.75.27"), true);
  assert.equal(isAddressAllowedForHost("evil.com", "47.113.75.27"), true, "公网地址本就允许，白名单只影响非公网");
});

await ok("assertUrlAllowed 端到端：白名单 fake-IP 通过，非白名单 fake-IP 拒绝", async () => {
  const fakeLookup = (hostname: string) => Promise.resolve(
    hostname === "apioss0.sydney-ai.com" ? ["198.18.0.47"]
      : hostname === "evil.com" ? ["198.18.0.99"]
        : ["10.1.2.3"],
  );
  const allowed = await assertUrlAllowed("https://apioss0.sydney-ai.com/ximg/a.png", fakeLookup);
  assert.equal(allowed.hostname, "apioss0.sydney-ai.com");

  await assert.rejects(
    () => assertUrlAllowed("https://evil.com/a.png", fakeLookup),
    /blocked non-global address for evil\.com: 198\.18\.0\.99/,
  );
  await assert.rejects(
    () => assertUrlAllowed("https://api.tu-zi.com/a.png", fakeLookup),
    /blocked non-global address for api\.tu-zi\.com: 10\.1\.2\.3/,
    "白名单域名解析到私网地址仍必须拒绝",
  );
});

console.log(`通过 ${passed} 项`);
