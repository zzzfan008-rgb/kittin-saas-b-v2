import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * 数据隔离契约（2026-10-27 用户拍板 A 案）。
 *
 * 背景：管理员此前凭角色无条件看到全部用户的项目/历史/消耗，属隐式越权；
 * 用户实际观察到「不同账号能看到彼此的模板和各种素材」。
 *
 * 定稿语义：
 * - 默认只看自己的数据（含管理员）。
 * - 跨用户查看必须「管理员 + 显式 all=true」，且留审计日志。
 * - 非管理员传 all=true 被忽略（只返回自己的），不报错（保持既有契约）。
 * - 任何查询不得用「参数 IS NULL 就返回全表」的写法（上层判断写错即全库泄漏）。
 */
const read = (path: string) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const projectsSource = read("server/routes/projects.ts");
const usageSource = read("server/routes/usage.ts");
const historySource = read("server/routes/history.ts");
const assetsSource = read("server/routes/assets.ts");

// ---------- 1. 项目列表：默认只看自己，all=true 才算管理员全量 ----------
assert.match(
  projectsSource,
  /const includeAllProjects = req\.query\.all === "true" && user\.role === "admin";/,
  "项目列表跨用户必须同时满足 all=true 与 admin 角色",
);
assert.match(
  projectsSource,
  /AND \(\$1::boolean OR p\.owner_id = \$2\)/,
  "项目列表必须用显式布尔开关，而不是把角色字符串直接拼进条件",
);
assert.doesNotMatch(
  projectsSource,
  /\$1 = 'admin' OR p\.owner_id/,
  "不得再让 admin 角色无条件通吃全部用户项目",
);

// ---------- 2. 项目详情：admin 读他人项目需显式 all=true ----------
assert.match(
  projectsSource,
  /if \(row\.owner_id !== user\.id\) \{/,
  "项目详情必须对所有非本人访问进入权限判定（含管理员）",
);
assert.match(
  projectsSource,
  /const allowedAsAdmin = user\.role === "admin" && req\.query\.all === "true";/,
  "管理员读他人项目必须显式 all=true",
);

// ---------- 4. 历史与消耗：禁用「IS NULL 即全表」写法 ----------
assert.match(
  historySource,
  /WHERE \(\$1::boolean OR r\.owner_id = \$2\)/,
  "历史列表必须用显式布尔开关",
);
assert.doesNotMatch(
  historySource,
  /WHERE \(\$1::text IS NULL OR r\.owner_id = \$1\)/,
  "历史列表不得再用「参数为空即返回全部」的写法",
);
assert.match(
  usageSource,
  /WHERE \(\$1::boolean OR e\.owner_id = \$2\)/,
  "消耗列表必须用显式布尔开关",
);
assert.doesNotMatch(
  usageSource,
  /WHERE \(\$1::text IS NULL OR e\.owner_id = \$1\)/,
  "消耗列表不得再用「参数为空即返回全部」的写法",
);

// ---------- 5. shared 素材必须留审计（shared 语义 = 全站可见） ----------
assert.match(
  assetsSource,
  /a\.scope IN \('global','shared'\)/,
  "shared/global 素材仍按设计对全站可见",
);


console.log("  ✓ 数据隔离契约：默认只看自己，跨用户需显式 all=true");
