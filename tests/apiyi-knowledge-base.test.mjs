import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { main as runCli } from "../scripts/apiyi-kb.mjs";
import {
  APIYI_DOCS_ORIGIN,
  APIYI_SITEMAP_URL,
  SNAPSHOT_RESOURCES,
  canonicalApiyiUrl,
  getApiyiRelevantPaths,
  guardApiyiChanges,
  loadCurrentSnapshot,
  localPathForPage,
  markdownUrlForPage,
  searchKnowledgeBase,
  syncKnowledgeBase,
  verifyCuratedSourceBindings,
  verifyKnowledgeBase,
  writeConsultationReceipt,
} from "../scripts/lib/apiyi-knowledge-base.mjs";

const FIXED_TIME = new Date("2026-09-02T12:34:56.000Z");
const SOURCE_REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PAGE_URLS = [
  `${APIYI_DOCS_ORIGIN}/api-capabilities/image-api-best-practices`,
  `${APIYI_DOCS_ORIGIN}/faq/html-only`,
];

function sitemapXml(urls = PAGE_URLS) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url, index) => `  <url><loc>${url}</loc><lastmod>2026-09-0${index + 1}T00:00:00Z</lastmod></url>`).join("\n")}
</urlset>\n`;
}

function textResponse(body, {
  status = 200,
  contentType = "text/plain; charset=utf-8",
  headers = {},
} = {}) {
  return new Response(body, {
    status,
    headers: { "content-type": contentType, ...headers },
  });
}

function createFakeFetch({
  initialSitemap = sitemapXml(),
  finalSitemap = initialSitemap,
  failPageUrl = null,
  overrides = new Map(),
} = {}) {
  const calls = [];
  let sitemapCalls = 0;
  const resourceBodies = new Map([
    [`${APIYI_DOCS_ORIGIN}/robots.txt`, "User-agent: *\nAllow: /\n"],
    [`${APIYI_DOCS_ORIGIN}/llms.txt`, "# API易 docs index\n"],
    [`${APIYI_DOCS_ORIGIN}/llms-full.txt`, "# API易 full docs\n\nTimeout and retry guidance.\n"],
    [`${APIYI_DOCS_ORIGIN}/skill.md`, "# API易 Skill\n\nReference data only.\n"],
    [`${APIYI_DOCS_ORIGIN}/.well-known/agent-card.json`, "{\"name\":\"API易\"}\n"],
  ]);
  const markdownBodies = new Map([
    [markdownUrlForPage(PAGE_URLS[0]), "# 图片 API 最佳实践\n\n为每个模型设置独立 timeout，不要在网关层静默重试。\n"],
    [markdownUrlForPage(PAGE_URLS[1]), null],
  ]);

  const fetchImpl = async (input) => {
    const url = String(input);
    calls.push(url);
    if (overrides.has(url)) {
      const override = overrides.get(url);
      return typeof override === "function" ? override({ url, calls }) : override;
    }
    if (url === APIYI_SITEMAP_URL) {
      sitemapCalls += 1;
      return textResponse(sitemapCalls === 1 ? initialSitemap : finalSitemap, {
        contentType: "application/xml; charset=utf-8",
      });
    }
    if (resourceBodies.has(url)) return textResponse(resourceBodies.get(url));
    if (url === failPageUrl) return textResponse("deliberate worker failure", { status: 400 });
    if (markdownBodies.has(url)) {
      const body = markdownBodies.get(url);
      return body === null
        ? textResponse("not found", { status: 404 })
        : textResponse(body, { contentType: "text/markdown; charset=utf-8" });
    }
    if (url === PAGE_URLS[1]) {
      return textResponse("<!doctype html><html><body><h1>HTML only FAQ</h1></body></html>", {
        contentType: "text/html; charset=utf-8",
      });
    }
    return textResponse("unexpected fake URL", { status: 404 });
  };

  return { fetchImpl, calls, get sitemapCalls() { return sitemapCalls; } };
}

async function tempDirectory(t, prefix) {
  const root = await mkdtemp(join(tmpdir(), prefix));
  t.after(async () => rm(root, { recursive: true, force: true }));
  return root;
}

async function createSnapshot(t, options = {}) {
  const root = await tempDirectory(t, "apiyi-kb-snapshot-");
  const siteRoot = resolve(root, "site");
  const fake = createFakeFetch(options);
  const synced = await syncKnowledgeBase({
    siteRoot,
    fetchImpl: fake.fetchImpl,
    concurrency: 2,
    timeoutMs: 1_000,
    now: () => FIXED_TIME,
  });
  return { root, siteRoot, fake, ...synced };
}

async function assertNoStaging(siteRoot) {
  const entries = await readdir(siteRoot).catch((error) => {
    if (error?.code === "ENOENT") return [];
    throw error;
  });
  assert.deepEqual(entries.filter((entry) => entry.startsWith(".staging-")), []);
}

function git(repoRoot, args, options = {}) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
  }).trim();
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

function curatedSourcesForManifest(manifest, overrides = {}) {
  const page = manifest.pages.find((item) => item.canonicalUrl === PAGE_URLS[0]);
  assert.ok(page, "fixture snapshot must contain the curated page");
  return {
    schemaVersion: 3,
    localKnowledgeBase: {
      rawSourcePagesStored: true,
      rawSnapshotPointer: "site/current.json",
      rawContentTrust: "untrusted_document_content",
    },
    sources: [{
      sourceId: "apiyi-image-api-best-practices",
      sourceLayer: "gatewayContract",
      url: page.canonicalUrl,
      markdownUrl: page.markdownUrl,
      sha256: page.sha256,
      localDocument: "models/image-api-best-practices.md",
      ...overrides,
    }],
  };
}

async function writeCuratedSources(repoRoot, manifest, overrides = {}) {
  const path = resolve(repoRoot, "docs/ai/apiyi/sources.json");
  const localDocumentPath = resolve(repoRoot, "docs/ai/apiyi/models/image-api-best-practices.md");
  await mkdir(dirname(localDocumentPath), { recursive: true });
  await writeFile(localDocumentPath, "# Curated image API contract fixture\n");
  await writeJson(path, curatedSourcesForManifest(manifest, overrides));
  return path;
}

async function installCliFixture(repoRoot) {
  const cliPath = resolve(repoRoot, "scripts/apiyi-kb.mjs");
  const helperPath = resolve(repoRoot, "scripts/lib/apiyi-knowledge-base.mjs");
  await mkdir(dirname(helperPath), { recursive: true });
  await writeFile(cliPath, await readFile(resolve(SOURCE_REPO_ROOT, "scripts/apiyi-kb.mjs")));
  await writeFile(helperPath, await readFile(resolve(SOURCE_REPO_ROOT, "scripts/lib/apiyi-knowledge-base.mjs")));

  const syncPreloadPath = resolve(repoRoot, "fake-docs-fetch.mjs");
  const pages = {
    [markdownUrlForPage(PAGE_URLS[0])]: {
      body: "# 图片 API 最佳实践\n\nUse an explicit timeout and no silent retry.\n",
      contentType: "text/markdown; charset=utf-8",
    },
  };
  const resources = Object.fromEntries(SNAPSHOT_RESOURCES.map((resource) => [
    resource.url,
    resource.key === "sitemap"
      ? sitemapXml([PAGE_URLS[0]])
      : resource.key === "agentCard"
        ? "{\"name\":\"API易\"}\n"
        : `# ${resource.key}\n`,
  ]));
  await writeFile(syncPreloadPath, `
const pages = ${JSON.stringify(pages)};
const resources = ${JSON.stringify(resources)};
globalThis.fetch = async (input) => {
  const url = String(input);
  if (Object.hasOwn(resources, url)) {
    const contentType = url.endsWith("sitemap.xml") ? "application/xml" : "text/plain";
    return new Response(resources[url], { status: 200, headers: { "content-type": contentType } });
  }
  if (Object.hasOwn(pages, url)) {
    return new Response(pages[url].body, { status: 200, headers: { "content-type": pages[url].contentType } });
  }
  throw new Error("unexpected network request in CLI fixture: " + url);
};
`);
  const offlinePreloadPath = resolve(repoRoot, "forbid-network.mjs");
  await writeFile(offlinePreloadPath, `
globalThis.fetch = async (input) => {
  throw new Error("network forbidden for offline CLI command: " + String(input));
};
`);
  return {
    cliPath: await realpath(cliPath),
    syncPreloadPath: await realpath(syncPreloadPath),
    offlinePreloadPath: await realpath(offlinePreloadPath),
  };
}

function executeCli(repoRoot, preloadPath, cliPath, args) {
  return execFileSync(process.execPath, ["--import", preloadPath, cliPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function defaultScope() {
  return {
    schemaVersion: 1,
    rules: [
      { kind: "prefix", value: "server/providers/" },
      { kind: "exact", value: "docs/ai/apiyi/change-scope.json" },
    ],
    exclusions: [
      { kind: "prefix", value: "docs/ai/apiyi/consultations/" },
    ],
  };
}

async function createGitFixture(t) {
  const repoRoot = await tempDirectory(t, "apiyi-kb-git-");
  const siteRoot = resolve(repoRoot, "docs/ai/apiyi/site");
  const fake = createFakeFetch();
  const synced = await syncKnowledgeBase({
    siteRoot,
    fetchImpl: fake.fetchImpl,
    concurrency: 2,
    timeoutMs: 1_000,
    now: () => FIXED_TIME,
  });
  await writeCuratedSources(repoRoot, synced.manifest);
  await writeJson(resolve(repoRoot, "docs/ai/apiyi/change-scope.json"), defaultScope());
  await mkdir(resolve(repoRoot, "docs/ai/apiyi/consultations"), { recursive: true });
  await writeFile(resolve(repoRoot, "docs/ai/apiyi/consultations/README.md"), "# Consultation receipts\n");
  await mkdir(resolve(repoRoot, "server/providers"), { recursive: true });
  await writeFile(resolve(repoRoot, "server/providers/example.ts"), "export const value = 1;\n");
  await writeFile(resolve(repoRoot, "server/providers/old.ts"), "export const oldValue = 1;\n");
  await writeFile(resolve(repoRoot, "README.md"), "# Fixture\n");
  git(repoRoot, ["init", "-b", "main"]);
  git(repoRoot, ["config", "user.name", "APIyi KB Test"]);
  git(repoRoot, ["config", "user.email", "apiyi-kb-test@example.invalid"]);
  git(repoRoot, ["add", "."]);
  git(repoRoot, ["commit", "-m", "fixture baseline"]);
  return { repoRoot, siteRoot, fake };
}

async function writeReceipt({ repoRoot, siteRoot, unresolvedChoices = [] }) {
  return writeConsultationReceipt({
    repoRoot,
    siteRoot,
    query: "图片 API timeout 重试",
    affectedPaths: ["server/providers/example.ts"],
    receiptPath: "docs/ai/apiyi/consultations/provider-change.json",
    decisionSummary: "根据当前本地快照保留分模型超时和 no-retry 语义。",
    unresolvedChoices,
    now: () => FIXED_TIME,
  });
}

test("URL canonicalization rejects traversal and local paths defang reserved instruction names", () => {
  assert.equal(canonicalApiyiUrl(`${APIYI_DOCS_ORIGIN}/faq/answer/`), `${APIYI_DOCS_ORIGIN}/faq/answer`);
  assert.equal(localPathForPage(APIYI_DOCS_ORIGIN), "pages/index.md");
  assert.equal(localPathForPage(`${APIYI_DOCS_ORIGIN}/AGENTS`), "pages/AGENTS.source.md");
  assert.equal(localPathForPage(`${APIYI_DOCS_ORIGIN}/nested/Claude`), "pages/nested/Claude.source.md");
  assert.equal(localPathForPage(`${APIYI_DOCS_ORIGIN}/collaboration`), "pages/collaboration.source.md");

  const unsafeUrls = [
    "http://docs.apiyi.com/faq",
    "https://example.com/faq",
    "https://user:password@docs.apiyi.com/faq",
    `${APIYI_DOCS_ORIGIN}/faq?next=1`,
    `${APIYI_DOCS_ORIGIN}/faq#fragment`,
    `${APIYI_DOCS_ORIGIN}/safe/../escaped`,
    `${APIYI_DOCS_ORIGIN}/safe/%2e%2e/escaped`,
    `${APIYI_DOCS_ORIGIN}/safe/%2Fescaped`,
    `${APIYI_DOCS_ORIGIN}/safe/%5Cescaped`,
    `${APIYI_DOCS_ORIGIN}/safe/%ZZ`,
  ];
  for (const url of unsafeUrls) {
    assert.throws(() => canonicalApiyiUrl(url), /API易|不安全|无效|只允许|不得/, url);
  }
});

test("a complete sync fetches the whole sitemap, re-fetches it at the end, and verifies offline", async (t) => {
  const { siteRoot, fake, pointer, manifest } = await createSnapshot(t);
  assert.equal(fake.sitemapCalls, 2, "sitemap must be fetched once before and once after page workers");
  assert.equal(manifest.pageCount, PAGE_URLS.length);
  assert.equal(manifest.markdownPageCount, 1);
  assert.equal(manifest.htmlFallbackCount, 1);
  assert.equal(manifest.paidProviderCalls, 0);
  assert.equal(pointer.pageCount, PAGE_URLS.length);
  assert.deepEqual((await verifyKnowledgeBase(siteRoot)).errors, []);
  await assertNoStaging(siteRoot);
});

test("a sitemap changed during sync rejects the mixed snapshot and leaves no staging directory", async (t) => {
  const root = await tempDirectory(t, "apiyi-kb-changing-sitemap-");
  const siteRoot = resolve(root, "site");
  const fake = createFakeFetch({
    finalSitemap: sitemapXml([...PAGE_URLS, `${APIYI_DOCS_ORIGIN}/new-page`]),
  });
  await assert.rejects(
    syncKnowledgeBase({
      siteRoot,
      fetchImpl: fake.fetchImpl,
      concurrency: 2,
      timeoutMs: 1_000,
      now: () => FIXED_TIME,
    }),
    /sitemap.*发生变化|mixed/i,
  );
  assert.equal(fake.sitemapCalls, 2);
  await assertNoStaging(siteRoot);
  await assert.rejects(readFile(resolve(siteRoot, "current.json")), /ENOENT/);
});

test("streaming byte limits are enforced without Content-Length", async (t) => {
  const root = await tempDirectory(t, "apiyi-kb-stream-limit-");
  const siteRoot = resolve(root, "site");
  const oversizedBody = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(256 * 1024));
      controller.enqueue(new Uint8Array(1));
      controller.close();
    },
  });
  const robotsUrl = SNAPSHOT_RESOURCES.find((resource) => resource.key === "robots").url;
  const oversizedResponse = new Response(oversizedBody, {
    status: 200,
    headers: { "content-type": "text/plain" },
  });
  assert.equal(oversizedResponse.headers.get("content-length"), null);
  const fake = createFakeFetch({ overrides: new Map([[robotsUrl, oversizedResponse]]) });
  await assert.rejects(
    syncKnowledgeBase({
      siteRoot,
      fetchImpl: fake.fetchImpl,
      concurrency: 2,
      timeoutMs: 1_000,
      now: () => FIXED_TIME,
    }),
    /单文件上限|response.*limit/i,
  );
  await assertNoStaging(siteRoot);
});

test("one failed page worker aborts publication and removes all staging artifacts", async (t) => {
  const root = await tempDirectory(t, "apiyi-kb-worker-failure-");
  const siteRoot = resolve(root, "site");
  const fake = createFakeFetch({ failPageUrl: markdownUrlForPage(PAGE_URLS[0]) });
  await assert.rejects(
    syncKnowledgeBase({
      siteRoot,
      fetchImpl: fake.fetchImpl,
      concurrency: 2,
      timeoutMs: 1_000,
      now: () => FIXED_TIME,
    }),
    /HTTP 400|worker failure/,
  );
  await assertNoStaging(siteRoot);
  await assert.rejects(readFile(resolve(siteRoot, "current.json")), /ENOENT/);
});

test("verification fails closed on tampering, missing files, path escape, and symlinks", async (t) => {
  await t.test("tampered page", async (subtest) => {
    const { siteRoot, snapshotPath, manifest } = await createSnapshot(subtest);
    await writeFile(resolve(snapshotPath, manifest.pages[0].localPath), "tampered\n");
    const checked = await verifyKnowledgeBase(siteRoot);
    assert.match(checked.errors.join("\n"), /SHA-256|字节数/);
  });

  await t.test("missing page", async (subtest) => {
    const { siteRoot, snapshotPath, manifest } = await createSnapshot(subtest);
    await unlink(resolve(snapshotPath, manifest.pages[0].localPath));
    const checked = await verifyKnowledgeBase(siteRoot);
    assert.match(checked.errors.join("\n"), /无法读取|缺少清单文件/);
  });

  await t.test("manifest omits a sitemap page", async (subtest) => {
    const { siteRoot, snapshotPath } = await createSnapshot(subtest);
    const manifestPath = resolve(snapshotPath, "manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    const [omitted] = manifest.pages.splice(0, 1);
    manifest.pageCount = manifest.pages.length;
    manifest.markdownPageCount = manifest.pages.filter((page) => page.format === "markdown").length;
    manifest.htmlFallbackCount = manifest.pages.filter((page) => page.format === "html").length;
    manifest.totalBytes -= omitted.bytes;
    await writeJson(manifestPath, manifest);
    const checked = await verifyKnowledgeBase(siteRoot);
    assert.match(checked.errors.join("\n"), /stored sitemap 与 manifest 页面(?:数量)?不一致/);
  });

  await t.test("manifest entry path escape", async (subtest) => {
    const { siteRoot, snapshotPath } = await createSnapshot(subtest);
    const manifestPath = resolve(snapshotPath, "manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.pages[0].localPath = "../outside.md";
    await writeJson(manifestPath, manifest);
    const checked = await verifyKnowledgeBase(siteRoot);
    assert.match(checked.errors.join("\n"), /路径越界/);
  });

  await t.test("current manifestPath escape", async (subtest) => {
    const { siteRoot, pointer } = await createSnapshot(subtest);
    pointer.manifestPath = "../outside/manifest.json";
    await writeJson(resolve(siteRoot, "current.json"), pointer);
    await assert.rejects(loadCurrentSnapshot(siteRoot), /manifestPath.*(?:越界|snapshotId 不一致)/);
  });

  await t.test("symlinked page is rejected even when target bytes match", async (subtest) => {
    const { root, siteRoot, snapshotPath, manifest } = await createSnapshot(subtest);
    const pagePath = resolve(snapshotPath, manifest.pages[0].localPath);
    const outsidePath = resolve(root, "outside-page.md");
    await writeFile(outsidePath, await readFile(pagePath));
    await unlink(pagePath);
    await symlink(outsidePath, pagePath);
    const checked = await verifyKnowledgeBase(siteRoot);
    assert.match(checked.errors.join("\n"), /符号链接|symlink/i);
  });
});

test("search is offline and refuses to read before full snapshot verification", async (t) => {
  const { siteRoot, snapshotPath, manifest, fake } = await createSnapshot(t);
  const callsAfterSync = fake.calls.length;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("network access is forbidden during local search");
  };
  try {
    const result = await searchKnowledgeBase(siteRoot, "timeout 重试");
    assert.equal(result.results[0].canonicalUrl, PAGE_URLS[0]);
    assert.equal(fake.calls.length, callsAfterSync);
    await writeFile(resolve(snapshotPath, manifest.pages[0].localPath), "# tampered timeout page\n");
    await assert.rejects(
      searchKnowledgeBase(siteRoot, "timeout"),
      /知识库校验失败|SHA-256|字节数/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("curated docs.apiyi.com sources are bound to the current snapshot URL, Markdown URL, and SHA", async (t) => {
  const { repoRoot, siteRoot } = await createGitFixture(t);
  const verified = await verifyKnowledgeBase(siteRoot);
  assert.deepEqual(verified.errors, []);
  const valid = await verifyCuratedSourceBindings(repoRoot, verified);
  assert.deepEqual(valid.errors, []);

  await writeCuratedSources(repoRoot, verified.manifest, { sha256: "0".repeat(64) });
  const hashTampered = await verifyCuratedSourceBindings(repoRoot, verified);
  assert.match(hashTampered.errors.join("\n"), /精选来源|SHA-256|sha256/i);

  await writeCuratedSources(repoRoot, verified.manifest, {
    url: `${APIYI_DOCS_ORIGIN}/missing-curated-page`,
    markdownUrl: `${APIYI_DOCS_ORIGIN}/missing-curated-page.md`,
  });
  const missing = await verifyCuratedSourceBindings(repoRoot, verified);
  assert.match(missing.errors.join("\n"), /精选来源|不存在|缺少|missing/i);
});

test("curated source hash tampering and missing snapshot sources both block guard", async (t) => {
  await t.test("hash tamper", async (subtest) => {
    const { repoRoot, siteRoot } = await createGitFixture(subtest);
    const verified = await verifyKnowledgeBase(siteRoot);
    await writeFile(resolve(repoRoot, "server/providers/example.ts"), "export const value = 2;\n");
    await writeReceipt({ repoRoot, siteRoot });
    await writeCuratedSources(repoRoot, verified.manifest, { sha256: "f".repeat(64) });
    await assert.rejects(
      guardApiyiChanges({ repoRoot, siteRoot, selection: { uncommitted: true } }),
      /精选来源|SHA-256|sha256/i,
    );
  });

  await t.test("listed source missing from snapshot", async (subtest) => {
    const { repoRoot, siteRoot } = await createGitFixture(subtest);
    const verified = await verifyKnowledgeBase(siteRoot);
    await writeFile(resolve(repoRoot, "server/providers/example.ts"), "export const value = 2;\n");
    await writeReceipt({ repoRoot, siteRoot });
    await writeCuratedSources(repoRoot, verified.manifest, {
      url: `${APIYI_DOCS_ORIGIN}/missing-curated-page`,
      markdownUrl: `${APIYI_DOCS_ORIGIN}/missing-curated-page.md`,
    });
    await assert.rejects(
      guardApiyiChanges({ repoRoot, siteRoot, selection: { uncommitted: true } }),
      /精选来源|不存在|缺少|missing/i,
    );
  });
});

test("consultation receipts are bound to the exact diff fingerprint", async (t) => {
  const { repoRoot, siteRoot } = await createGitFixture(t);
  const providerPath = resolve(repoRoot, "server/providers/example.ts");
  await writeFile(providerPath, "export const value = 2;\n");
  await writeReceipt({ repoRoot, siteRoot });
  const first = await guardApiyiChanges({ repoRoot, siteRoot, selection: { uncommitted: true } });
  assert.deepEqual(first.relevant, ["server/providers/example.ts"]);

  await writeFile(providerPath, "export const value = 3;\n");
  await assert.rejects(
    guardApiyiChanges({ repoRoot, siteRoot, selection: { uncommitted: true } }),
    /差异指纹|diff fingerprint|有效咨询凭证/i,
    "a receipt for earlier bytes must not authorize a later diff on the same path",
  );
});

test("a receipt with unresolved material choices cannot authorize a relevant change", async (t) => {
  const { repoRoot, siteRoot } = await createGitFixture(t);
  await writeFile(resolve(repoRoot, "server/providers/example.ts"), "export const value = 2;\n");
  await writeReceipt({
    repoRoot,
    siteRoot,
    unresolvedChoices: ["是否启用独立 Undici Agent 仍待用户选择"],
  });
  await assert.rejects(
    guardApiyiChanges({ repoRoot, siteRoot, selection: { uncommitted: true } }),
    /有效咨询凭证|未解决选择/,
  );
});

test("change-scope.json cannot remove its own protection", async (t) => {
  const { repoRoot, siteRoot } = await createGitFixture(t);
  await writeJson(resolve(repoRoot, "docs/ai/apiyi/change-scope.json"), {
    schemaVersion: 1,
    rules: [],
    exclusions: [],
  });
  await assert.rejects(
    guardApiyiChanges({ repoRoot, siteRoot, selection: { uncommitted: true } }),
    /change-scope|API易相关差异|有效咨询凭证/,
  );
});

test("rename analysis includes both the old protected path and the new path", async (t) => {
  const { repoRoot, siteRoot } = await createGitFixture(t);
  await mkdir(resolve(repoRoot, "docs/unrelated"), { recursive: true });
  git(repoRoot, ["mv", "server/providers/old.ts", "docs/unrelated/new.ts"]);
  await assert.rejects(
    guardApiyiChanges({ repoRoot, siteRoot, selection: { uncommitted: true } }),
    (error) => {
      assert.match(String(error), /server\/providers\/old\.ts/);
      return true;
    },
  );
});

test("guard skips local knowledge-base verification when the diff is not APIyi-related", async (t) => {
  const { repoRoot, siteRoot } = await createGitFixture(t);
  const { snapshotRoot, manifest } = await loadCurrentSnapshot(siteRoot);
  await writeFile(resolve(snapshotRoot, manifest.pages[0].localPath), "tampered\n");
  await writeFile(resolve(repoRoot, "README.md"), "# Unrelated fixture change\n");
  const relevant = await getApiyiRelevantPaths({ repoRoot, selection: { uncommitted: true } });
  assert.deepEqual(relevant, []);
  const result = await guardApiyiChanges({ repoRoot, siteRoot, selection: { uncommitted: true } });
  assert.deepEqual(result, { relevant: [], receipts: [], message: "没有 API易相关差异" });
});

test("ordinary dependency, project-rule and UI-only changes are outside the APIyi knowledge scope", async (t) => {
  const { repoRoot } = await createGitFixture(t);
  await mkdir(resolve(repoRoot, "src/components/nodes"), { recursive: true });
  await writeFile(resolve(repoRoot, "package.json"), '{"private":true}\n');
  await writeFile(resolve(repoRoot, "AGENTS.md"), "# Unrelated project rule\n");
  await writeFile(resolve(repoRoot, "src/components/nodes/UiOnly.tsx"), "export const UiOnly = () => null;\n");
  const relevant = await getApiyiRelevantPaths({ repoRoot, selection: { uncommitted: true } });
  assert.deepEqual(relevant, []);
});

test("CLI rejects ambiguous or unsupported arguments before any I/O", async () => {
  await assert.rejects(runCli(["guard"]), /必须且只能选择/);
  await assert.rejects(runCli(["guard", "--uncommitted", "--base", "HEAD~1", "--head", "HEAD"]), /必须且只能选择/);
  await assert.rejects(runCli(["search", "--query", "timeout", "--network"]), /缺少参数值|不支持参数/);
  await assert.rejects(runCli(["sync", "--concurrency", "0"]), /并发必须在 1\.\.12/);
});

test("CLI sync, check, search, lookup, and guard run in a temporary repository with fake or forbidden network", async (t) => {
  const repoRoot = await tempDirectory(t, "apiyi-kb-cli-");
  const { cliPath, syncPreloadPath, offlinePreloadPath } = await installCliFixture(repoRoot);

  const syncOutput = executeCli(repoRoot, syncPreloadPath, cliPath, [
    "sync",
    "--concurrency", "2",
    "--timeout-ms", "1000",
  ]);
  assert.match(syncOutput, /API易全站快照已原子切换/);
  assert.match(syncOutput, /页面数：1/);

  const cliSiteRoot = resolve(repoRoot, "docs/ai/apiyi/site");
  const cliSnapshot = await loadCurrentSnapshot(cliSiteRoot);
  await writeCuratedSources(repoRoot, cliSnapshot.manifest);

  const checkOutput = executeCli(repoRoot, offlinePreloadPath, cliPath, ["check"]);
  assert.match(checkOutput, /API易本地知识库校验通过/);

  const searchOutput = executeCli(repoRoot, offlinePreloadPath, cliPath, [
    "search", "--query", "timeout", "--json",
  ]);
  const searchResult = JSON.parse(searchOutput);
  assert.equal(searchResult.results.length, 1);
  assert.equal(searchResult.results[0].canonicalUrl, PAGE_URLS[0]);

  await writeJson(resolve(repoRoot, "docs/ai/apiyi/change-scope.json"), defaultScope());
  await mkdir(resolve(repoRoot, "docs/ai/apiyi/consultations"), { recursive: true });
  await writeFile(resolve(repoRoot, "docs/ai/apiyi/consultations/README.md"), "# Receipts\n");
  await mkdir(resolve(repoRoot, "server/providers"), { recursive: true });
  await writeFile(resolve(repoRoot, "server/providers/example.ts"), "export const value = 1;\n");
  git(repoRoot, ["init", "-b", "main"]);
  git(repoRoot, ["config", "user.name", "APIyi CLI Test"]);
  git(repoRoot, ["config", "user.email", "apiyi-cli-test@example.invalid"]);
  git(repoRoot, ["add", "."]);
  git(repoRoot, ["commit", "-m", "CLI fixture baseline"]);
  await writeFile(resolve(repoRoot, "server/providers/example.ts"), "export const value = 2;\n");

  const lookupOutput = executeCli(repoRoot, offlinePreloadPath, cliPath, [
    "lookup",
    "--query", "timeout",
    "--paths", "server/providers/example.ts",
    "--receipt", "docs/ai/apiyi/consultations/cli-provider-change.json",
    "--decision", "Use the locally documented explicit timeout without silent retry.",
  ]);
  assert.match(lookupOutput, /咨询凭证：docs\/ai\/apiyi\/consultations\/cli-provider-change\.json/);

  const guardOutput = executeCli(repoRoot, offlinePreloadPath, cliPath, ["guard", "--uncommitted"]);
  assert.match(guardOutput, /API易本地知识库咨询门禁通过/);

  const assertCliBindingFailure = (command, pattern) => {
    assert.throws(
      () => executeCli(repoRoot, offlinePreloadPath, cliPath, command),
      (error) => {
        const diagnostic = `${error?.message ?? error}\n${error?.stderr?.toString?.() ?? ""}`;
        assert.match(diagnostic, pattern);
        return true;
      },
    );
  };

  await writeCuratedSources(repoRoot, cliSnapshot.manifest, { sha256: "0".repeat(64) });
  assertCliBindingFailure(["check"], /精选来源|SHA-256|sha256/i);
  assertCliBindingFailure(["guard", "--uncommitted"], /精选来源|SHA-256|sha256/i);

  await writeCuratedSources(repoRoot, cliSnapshot.manifest, {
    url: `${APIYI_DOCS_ORIGIN}/missing-curated-page`,
    markdownUrl: `${APIYI_DOCS_ORIGIN}/missing-curated-page.md`,
  });
  assertCliBindingFailure(["check"], /精选来源|不存在|缺少|missing/i);
  assertCliBindingFailure(["guard", "--uncommitted"], /精选来源|不存在|缺少|missing/i);
});
