import assert from "node:assert/strict";
import fs from "node:fs";

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(
    fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8"),
  ) as Record<string, unknown>;
}

console.log("依赖安全锁定契约测试");

const packageJson = readJson("package.json") as {
  overrides?: Record<string, string>;
};
assert.deepEqual(packageJson.overrides, {
  "fast-uri": "3.1.7",
  qs: "6.16.0",
});

const packageLock = readJson("package-lock.json") as {
  packages?: Record<string, { version?: string }>;
};
assert.equal(packageLock.packages?.["node_modules/fast-uri"]?.version, "3.1.7");
assert.equal(packageLock.packages?.["node_modules/qs"]?.version, "6.16.0");

console.log("  ✓ qs 与 fast-uri 安全版本已由 package overrides 和 lockfile 双重固定");
