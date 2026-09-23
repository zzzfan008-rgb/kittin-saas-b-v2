/**
 * VIS-05 回归：网格吸附开关（默认关、localStorage 持久化、订阅通知）。
 * 纯逻辑 + 假 window/localStorage，运行：
 *   node node_modules/tsx/dist/cli.mjs tests/grid-snap.test.ts
 */
import assert from "node:assert/strict";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

let passed = 0;
let sequence: Promise<void> = Promise.resolve();
function ok(name: string, fn: () => Promise<void> | void): void {
  sequence = sequence
    .then(fn)
    .then(() => {
      passed += 1;
      console.log(`  ✓ ${name}`);
    })
    .catch((error) => {
      console.error(`  ✗ ${name}`);
      console.error(error);
      process.exitCode = 1;
    });
}

function fakeWindow(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  return {
    store,
    localStorage: {
      getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    },
  };
}

/* tsx 忽略 import URL 的 query 串，无法用 ?t= 击穿模块缓存；
   每个场景把源码复制成唯一临时文件再导入（放在仓库内以便解析 react）。 */
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempDir = path.join(repoRoot, ".tmp-gridsnap");
const sourceText = await readFile(
  path.join(repoRoot, "src/lib/gridSnap.ts"),
  "utf8",
);
let copySeq = 0;
async function freshModule(windowObj: ReturnType<typeof fakeWindow>) {
  (globalThis as { window?: unknown }).window = windowObj;
  await mkdir(tempDir, { recursive: true });
  copySeq += 1;
  const file = path.join(tempDir, `gridSnap-${copySeq}.ts`);
  await writeFile(file, sourceText);
  const module = await import(pathToFileURL(file).href);
  return { module, store: windowObj.store };
}

console.log("VIS-05 网格吸附开关");

ok("无持久化值时默认关（D-4），snapGrid=[24,24]", async () => {
  const { module } = await freshModule(fakeWindow());
  assert.equal(module.getGridSnapEnabled(), false);
  assert.deepEqual(module.SNAP_GRID, [24, 24]);
});

ok("持久化为 '0' 时仍为关", async () => {
  const { module } = await freshModule(fakeWindow({ "gc.grid-snap": "0" }));
  assert.equal(module.getGridSnapEnabled(), false);
});

ok("持久化为 '1' 时开启", async () => {
  const { module } = await freshModule(fakeWindow({ "gc.grid-snap": "1" }));
  assert.equal(module.getGridSnapEnabled(), true);
});

ok("setGridSnapEnabled 写 localStorage 并通知订阅者", async () => {
  const { module, store } = await freshModule(fakeWindow());
  const seen: boolean[] = [];
  const unsubscribe = module.subscribeGridSnap(() => {
    seen.push(module.getGridSnapEnabled());
  });
  module.setGridSnapEnabled(true);
  assert.equal(store.get("gc.grid-snap"), "1");
  assert.deepEqual(seen, [true]);
  module.setGridSnapEnabled(false);
  assert.equal(store.get("gc.grid-snap"), "0");
  assert.deepEqual(seen, [true, false]);
  unsubscribe();
  module.setGridSnapEnabled(true);
  assert.deepEqual(seen, [true, false], "退订后不再通知");
});

ok("相同值不重复通知 / 写盘", async () => {
  const { module, store } = await freshModule(fakeWindow());
  let calls = 0;
  module.subscribeGridSnap(() => {
    calls += 1;
  });
  module.setGridSnapEnabled(false);
  assert.equal(calls, 0);
  assert.equal(store.has("gc.grid-snap"), false, "无状态变化不写盘");
});

ok("无 window（SSR）时安全回退为关且不抛错", async () => {
  delete (globalThis as { window?: unknown }).window;
  const file = path.join(tempDir, `gridSnap-${++copySeq}.ts`);
  await writeFile(file, sourceText);
  const module = await import(pathToFileURL(file).href);
  assert.equal(module.getGridSnapEnabled(), false);
  assert.doesNotThrow(() => module.setGridSnapEnabled(true));
  assert.equal(module.getGridSnapEnabled(), true);
});

await sequence;
await rm(tempDir, { recursive: true, force: true });
if (!process.exitCode) console.log(`\n${passed} 项通过`);
