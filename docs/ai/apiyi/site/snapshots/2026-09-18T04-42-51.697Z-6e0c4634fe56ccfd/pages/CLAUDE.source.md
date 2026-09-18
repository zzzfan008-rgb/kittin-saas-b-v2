> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# CLAUDE

# 项目配置 - API易文档中心

## 项目概述

这是一个基于 Mintlify 的文档网站项目，为 API易 提供技术文档和FAQ支持。Mintlify官网 [https://mintlify.com/](https://mintlify.com/) APIYI 文档中心 [https://docs.apiyi.com](https://docs.apiyi.com)
在项目里会存在 code-test 文件夹的大量 AI 大模型的API 接口测试，测试结果经过分析后最终会把可对外的内容展示在 APIYI 文档中心。
思考过程不限制语言，Claude 之间的对话语言为简体中文。

## 文档编写规范

### MDX文件格式要求

* **重要**：Mintlify会自动从frontmatter的`title`字段生成H1标题
* **禁止**：在MDX文件内容中使用H1标题（`# 标题`）
* **原因**：会导致页面出现重复的H1标题，影响SEO和用户体验

### 正确的文件结构

```mdx theme={null}
---
title: "页面标题"
description: "页面描述"
icon: "图标名称"
---

## 第一个章节标题
内容从H2开始...

### 子标题
使用H3及以下级别的标题
```

### 错误的文件结构（避免）

```mdx theme={null}
---
title: "页面标题"
---

# 页面标题  ← 不要这样做！会重复显示

## 第一个章节标题
```

## 文档系统说明

* 使用Mintlify文档框架
* 支持MDX格式（Markdown + JSX组件）
* 导航结构在`docs.json`中定义
* 图片资源存放在`images/`目录

## 多语言体系（重要）

本站是多语种站点。**人工只维护中文和英文两版，其余语种由 `scripts/i18n/` 管线生成。**

| 语种             | 目录         | 产出方式        | 翻译源 | 覆盖范围     |
| -------------- | ---------- | ----------- | --- | -------- |
| 简体中文 `zh`      | 仓库根目录      | **人工**      | —   | 全部       |
| English `en`   | `en/`      | **人工**      | zh  | 全部       |
| 繁體中文 `zh-Hant` | `zh-Hant/` | OpenCC 本地转换 | zh  | 核心 4 Tab |
| 日本語 `ja`       | `ja/`      | 翻译 API      | en  | 核心 4 Tab |
| 한국어 `ko`       | `ko/`      | 翻译 API      | en  | 核心 4 Tab |
| Русский `ru`   | `ru/`      | 翻译 API      | en  | 核心 4 Tab |

「核心 4 Tab」= 首页 / 使用场景 / 常见问题 / 充值活动 + 模型价格，定义在 `scripts/i18n/config.mjs`。
不含 AI风向标（时效性强）、实时动态（每日更新）、wiki 百科（尚未进导航）。

### 铁律

1. **`zh-Hant/` `ja/` `ko/` `ru/` 是构建产物，任何情况下都不要手工编辑 mdx**。
   下一次跑管线会整目录重建，手改必然丢失。
2. **译文有问题不要改 mdx**：繁体改 `scripts/i18n/overrides/zh-Hant.json`，
   日韩俄改 `scripts/i18n/glossary/<lang>.json`，导航标签改 `scripts/i18n/labels.json`，
   然后重跑管线。日韩俄的译文文件带篡改检测，手改过的页会被告警并跳过，
   不加 `--force` 不会被覆盖 —— 但下次改术语表触发重翻时一样会丢。
3. **`docs.json` 里只手工维护 `zh` 和 `en` 两个 language 块**，其余语种的块由
   `sync-nav.mjs` 整块重建，手改会被覆盖。
4. **整个 `models/` 目录都是脚本生成产物**，六个语种全部不要手工编辑。两个生成器：

   * `models/index.mdx`（价格总表）← `scripts/build-model-catalog.mjs`，**直接出 zh / en / ja / ko / ru
     五版**，不进翻译管线（`isGeneratedPage()` 只排除这一页）。改页面文案改生成器里的 `I18N`，
     改厂商译名改 `VENDOR_L10N`。
   * `models/<slug>.mdx`（模型详情页）← `scripts/build-model-details.mjs`，**只出 zh / en 两版**，
     **ja / ko / ru 走 i18n 翻译管线从英文版翻译**。规格数据改 `models/data/model-details.json`，
     页面文案改生成器里的 `I18N`。

   繁体那版两个生成器都不出，是 `hant.mjs` 对中文页做 OpenCC 转换的结果。

   * **仓库根目录的 `model-registry.json` 也是 `build-model-catalog.mjs` 的产物**（`npm run models:catalog`），
     是对外稳定的机器可读模型注册表（URL `/model-registry.json`，已写进 `skill.md`、首页提示词与 CLI）。
     勿手改；改结构只能加字段不能改名，破坏性变更升 `schema_version`。

   **新增详情页的完整顺序（不可交换）**：

   ```bash theme={null}
   npm run models                       # 出 catalog + zh/en 详情页
   # 手工把新页加进 docs.json 的 zh / en 两块（npm run models:details -- --nav 打印片段）
   npm run i18n                         # hant → tr（日韩俄）→ nav → check
   npm run links
   ```

   `docs.json` 必须在跑 `i18n` **之前**改好：`hant.mjs` 只处理挂在导航里的页，
   漏了繁体版不会生成；`sync-nav.mjs` 又只挂磁盘上已存在的页。

   **成本提醒**：详情页进了翻译管线，价格真变了的页会 dirty 定价那个 H2 块；
   叠加新增详情页时实测到过 174 块。**详情页模板不输出模型总数与数据更新时间**
   （2026-09-09 去掉的，此前每次刷价都会把 32 页 × 6 语种全部 dirty），
   别再往模板里加这类每次构建都变的字段。成本闸门默认
   **1000 块**，以上量级都在闸门之下，**不需要 `--force`**。想先看规模用
   `npm run i18n:plan`。

   **价格总表由云端 routine 每天自动刷新并直推 main**（2026-09-14 起，claude.ai/code/routines，
   名称「模型价格总表每日刷新」，每天 06:00 (UTC+8) 在隔离 checkout 里跑 `models:catalog` + `i18n:hant`
   后 push，提交标题以「模型总表自动刷新」开头）。它只动总表六语种 + `model-registry.json` + `models/data/`，
   不碰详情页、docs.json 和翻译管线。本机 push 被拒时 `git pull --rebase` 即可，产物文件不会与手写页冲突。
   接口把按量模型误标成按次时它照样会推（提交正文首行带 ⚠️ 提示），纠正仍要人工加进
   `models/data/model-overrides.json`；**本机改了 overrides 要当天 push，否则次日会被它按接口原样覆盖**。
   云环境的 Network access 必须是 Custom 且放行 `api.apiyi.com`（默认 Trusted 级别会让沙箱出网代理直接回 403，
   源站和边缘日志里根本看不到请求，别去那边排查）。

   一条命令跑完两个生成器：`npm run models`。不想重新拉取实时定价时用
   `npm run models:catalog -- --offline`，走 `models/data/` 下的快照。
   两个生成器共用 `scripts/lib/model-format.mjs`（厂商归类、端点排序、价格格式化、阶梯折算）。

### 写完新页面之后

中文页 + 英文页 + `docs.json` 的 zh/en 两块都改完后，跑：

```bash theme={null}
npm run i18n      # = i18n:hant + i18n:tr + i18n:nav + i18n:check
npm run links     # 全仓坏链检查
```

在本机手动执行，不走 CI、不设定时任务。完整操作手册见 `scripts/i18n/README.md`。

### 增量：改一页不会全量重写

日/韩/俄按 **H2 块**做增量。改一个小节只重翻那一块，其余从已有译文原样复用；
只改 `description` 则完全不碰正文。实测改一个小节 = 1 次模型调用、726 字符，
译文里只有对应那段产生 diff。所以**放心跑 `npm run i18n`，它不会把已定稿的译文洗一遍**。

会触发大范围重翻的只有一种情况：改了 `scripts/i18n/glossary/`、换了模型、
或动了分块规则。这时管线会撞上成本闸门并要求 `--force`。

**翻译成本不是本项目的约束**（2026-08-13 拍板）。成本闸门默认 **1000 块**
（`I18N_GATE_BLOCKS` 可调，2026-08-13 由 500 翻倍而来），它**不是省钱开关**，
只用来兜住「术语表 / 模型 / 分块规则变了导致全量失效」这类意外——全站约 600 页 × 3 语种，
真出全量失效时量级远超 1000，照样会被拦下。所以：

* 日常改页、价格刷新、新增详情页，都不会撞闸门，**别习惯性加 `--force`**
* 真撞上了，先想清楚是不是动了术语表 / 模型 / 分块规则，而不是直接 `--force` 冲过去
* 调闸门只改变「什么时候停下来问一句」，**不改变实际花费**——花多少由待翻块数决定，
  而块数由增量缓存决定

先看规模：`npm run i18n:plan`。

几个容易混的开关（完整说明见 `scripts/i18n/README.md`）：

* `--force` 越过**成本闸门**和**篡改保护**，但**不越过增量缓存**
* `--redo` 才是越过增量缓存强制重翻，配合 `--only` 用来修个别页
* `--repair` 对已有译文重跑确定性修复，**完全不调 API**

**不要并发跑 `translate.mjs`**，会互相覆盖 manifest。管线已带进程锁，会直接拒绝。

### 日韩俄以英文为源 —— 英文别落下

`ja/ko/ru` 是从 `en/` 翻的。只改中文不改英文，这三个语种会继承过时内容。
管线每次会比对中英页的最后修改时间并告警，但**不阻断**，别依赖它兜底。

## FAQ页面组织

* 所有FAQ页面位于`faq/`目录
* 作为独立的顶级标签页展示
* 每个问题一个独立的MDX文件
* **每新增一个 FAQ，顺带发一条实时动态**（2026-09-17 定）：FAQ 中英页写完后走 `/live-writer`，
  分类为「文档更新」，正文链到该 FAQ；slug 与 FAQ 文件名保持一致（如 `live/2026-09/seedance2-reference-vs-edit`）
* **FAQ 挂进文档侧栏分组时不要平铺**（2026-09-17 定）：收进该分组末尾的一个折叠子分组，
  `{"group": "<简称>常见问题", "icon": "circle-help", "pages": [...]}`，英文块叫 `<简称> FAQ`，
  新 FAQ 放子分组最前。现有：`SD常见问题`（Seedance）、`NB常见问题`（NanoBanana）、`图片常见问题`（图片API调用须知）、`GPT-Image常见问题`。
  新子分组名要同步补进 `scripts/i18n/labels.json` 的 ja/ko/ru，否则 `i18n:nav` 告警缺译。
  FAQ Tab 里的原有注册保持不动（两处职责独立）

## 编写新内容时的注意事项

1. 遵循上述MDX格式规范
2. 使用适当的Mintlify组件（Info, Warning, Tip, Card等）
3. 保持中文内容的专业性和友好性
4. 引用图片时使用相对路径`/images/文件名`
5. **时间必须标注时区**：文档中涉及具体时间时，必须附加时区说明（如 `18:30 (UTC+8)`），因为我们有全球客户
   * ✅ 正确：`18:30 (UTC+8)`、`6:30 PM (UTC+8)`
   * ❌ 错误：`18:30`、`今晚六点半`（缺少时区，全球客户无法判断）
6. **非中文内容品牌名用 APIYI**：英文页面（`en/` 目录）及其余外语页面中品牌名一律写 `APIYI`，不要写 `API易`；中文页面（简体、繁体）仍用 `API易`
   * ✅ 正确（英文）：`the APIYI gateway`、`paste your APIYI key`
   * ❌ 错误（英文）：`the API易 gateway`
   * 域名、代码示例不受影响：`api.apiyi.com`、`APIYI_API_KEY` 等保持原样
   * 代码围栏内逐字保留的源码（如社区贡献插件的中文注释/中文运行时字符串）豁免，
     与翻译管线「反引号内容原样保留」同一口径；校验器只扫 frontmatter + 掩码后的正文
7. **新建页面必须中英双语同步**：每次创建一个新页面时，必须同时产出中文版（根目录）和英文版（`en/` 目录），两份内容对应、文件名一致，并在 `docs.json` 的中文版和英文版导航中**同时**注册（位置一致）。不允许只建一个语言版本。
   * 中文页内部链接用 `/api-capabilities/...`，英文页内部链接用 `/en/api-capabilities/...`
   * 英文版品牌名遵循第 6 条（APIYI）
   * **人工只产出中文和英文这两版**。繁体中文、日语、韩语、俄语由 i18n 管线自动生成，见「多语言体系」章节
8. **页面标题不要中英混排**：`title` / `sidebarTitle` 只用单一语言。中文页只写中文（如 `原生工具出图`），英文页只写英文（如 `Native Tool Image Generation`），不要写成 `原生工具出图（Responses image_generation）` 这种括号混排。

## 大模型百科写作规范

### 词条页面结构

```mdx theme={null}
---
title: "词条名称"
description: "简短描述(1-2句话，80字以内)"
icon: "相关图标"
tags: ["标签1", "标签2", "标签3"]
difficulty: "basic|intermediate|advanced"
related: ["相关词条1", "相关词条2"]
---

## 概念定义
[30-50字的核心定义，适合小白理解]

## 详细解释 
[200-400字的详细说明，专业但易懂]

## 工作原理
[配图解说明，解释核心机制]

## 实际应用
[具体应用场景和案例]

## 相关概念
[链接到其他相关词条]

## 延伸阅读
[权威参考资源]
```

### 写作风格指南

* **专业性**：确保技术准确性，引用权威来源
* **易懂性**：用类比和实例帮助理解复杂概念
* **简洁性**：避免冗长，重点突出
* **交互性**：善用图解说明和交叉引用
* **更新性**：及时反映最新技术发展

### 联网搜索要求

* **必须联网**：创建每个词条前必须进行联网搜索
* **信息时效**：确保引用最新的技术发展、模型更新、研究成果
* **多源验证**：交叉验证多个权威来源的信息
* **版本更新**：特别注意模型版本、API更新、性能指标等时效性信息
* **标注日期**：对于快速变化的信息，标注数据获取时间

### 难度分级标准

* **basic**：面向初学者，无需预备知识
* **intermediate**：需要基础概念理解
* **advanced**：需要深度技术背景

### 图片格式要求

#### 推荐格式

* **PNG**：用于图解、流程图、架构图等需要高质量显示的图片
* **JPEG**：用于照片类图像，文件较大但压缩率高
* **外部托管SVG**：如需使用SVG，建议外部托管并通过URL引用

#### 格式使用指南

* **图解说明**：优先使用PNG格式，确保清晰度和兼容性
* **图标**：使用Font Awesome或Lucide内置图标，避免自定义SVG
* **浅色/深色主题**：为不同主题准备两个版本的PNG图片
  ```html theme={null}
  <img className="block dark:hidden" src="/images/diagram-light.png" alt="浅色主题图解" />
  <img className="hidden dark:block" src="/images/diagram-dark.png" alt="深色主题图解" />
  ```

#### 注意事项

* **避免内联SVG**：Mintlify对内联SVG支持存在问题，可能导致渲染错误
* **文件大小**：PNG文件控制在200KB以内，JPEG控制在500KB以内
* **命名规范**：使用描述性文件名，如 `transformer-architecture-light.png`
* **测试环境**：本地预览正常不代表生产环境正常，务必在部署后检查

### 其他要求

* 注意：不使用 HTML 注释语法，需要使用JSX注释语法
* **价格符号转义**：`$` 符号的处理方式取决于所在语境，正文和 frontmatter 规则相反，不要混用
  * **MDX 正文**（含表格）：必须转义为 `\$`，避免被 LaTeX 数学模式吞掉
    * ✅ 正确：`\$2.00 / 百万 tokens`
    * ❌ 错误：`$2.00 / 百万 tokens`（会触发 LaTeX 解析错误）
  * **Frontmatter（YAML）**：直接写 `$`，不要转义
    * ✅ 正确：`description: "价格 $0.42/$2.52 每 1M tokens"`
    * ❌ 错误：`description: "价格 \$0.42/\$2.52 每 1M tokens"`
    * 原因：YAML 双引号字符串里 `\$` 不是合法转义序列（YAML 只认 `\n` `\t` `\"` `\\` 等），会触发 frontmatter 解析错误
    * 备选：若一定要转义，写 `\\$`（YAML 把 `\\` 解析为字面 `\`，最终值为 `\$`），但通常没必要
* **外部链接限制**：禁止使用非第一方域名的超链接，改为纯文本 + 反引号代码格式
  * 第一方白名单（允许超链接）：`apiyi.com` 全系子域、`icover.ai`（API易 旗下子产品）、
    `work.weixin.qq.com`（官方企微客服入口）。白名单维护在 `scripts/check-docs.mjs` 的 `FIRST_PARTY_HOSTS`
  * ✅ 正确：`` 谷歌官方博客：`blog.google/technology/ai/...` ``
  * ❌ 错误：`谷歌官方博客：[链接](https://blog.google/...)`
  * 原因：避免用户直接跳转到第三方网站，让用户主动复制链接访问
* **小于号转义**：在 MDX/JSX 组件内使用小于号 `<` 时需要注意
  * ✅ 正确：`建议少于20字` 或 `建议 &lt; 20字`
  * ❌ 错误：`建议<20字`（`<` 会被误认为 HTML 标签开始）
  * 原因：MDX 会将 `<` 后面的内容当作标签解析，导致解析错误
* **JSX 属性内的引号**：JSX 属性值用 `"..."` 包裹时，里面禁止再出现 ASCII 双引号 `"`
  * ✅ 正确：`<Step title="prompt 聚焦「动作」而不是「画面」">`（用中文引号 `「」`）
  * ✅ 正确：`<Step title='prompt 聚焦"动作"而不是"画面"'>`（外层换单引号）
  * ❌ 错误：`<Step title="prompt 聚焦"动作"而不是"画面"">`（第二个 `"` 提前闭合属性，后面的中文被当作 attribute name 解析报错）
  * 原因：MDX/JSX 不会自动识别"嵌套引号"，第二个 `"` 一定结束属性。中文场景优先用 `「」`，最直观无歧义
  * 同样适用于：解析失败时常常**级联**触发 docs.json 报告"file does not exist"，定位时优先排查最近一次编辑的 JSX 属性

## 站外配套：CLI 与 Skills 仓库（每月至少发一版）

`skill.md`（本仓根目录）是 APIYI 技能的唯一源，Mintlify 把它暴露在 `/skill.md` 与 `/.well-known/agent-skills`。
另有两个站外仓库，本机路径与线上位置：

| 件      | 线上                                                              | 本机                                |
| ------ | --------------------------------------------------------------- | --------------------------------- |
| Skills | `github.com/apiyi-com/skills`（根目录 SKILL.md + 自检脚本）              | `~/Documents/GitHub/apiyi-skills` |
| CLI    | npm 包 `apiyi`（`npx apiyi@latest`），源码 `github.com/apiyi-com/cli` | `~/Documents/GitHub/apiyi-cli`    |

* 改完 `skill.md` 必须 `npm run skill:sync`（逐字节同步到 skills 仓的 SKILL.md）再去那边 commit + push；`npm run skill:check` 只比对不写
* **两个仓库至少每月更新一次版本**（2026-09-03 定），哪怕只是月度核对也发个 patch 并写进 CHANGELOG
* CLI 发版：`npm version patch` → `git push --follow-tags` → 在 Terminal.app 里 `npm publish --access public`（npm 账号是 passkey 2FA，非交互 shell 会 EOTP）；配好仓库 Secret `NPM_TOKEN` 后打 tag 会自动发
* 改默认模型要四处同步：`skill.md` 的 hello-world、`developer-kit.mdx`（zh/en）、首页三段提示词、CLI 的 `DEFAULT_MODEL`
* 文档里一律写 `npx apiyi@latest`，不写具体版本号

## Changelog（网站公告）—— 数据驱动，页面是产物

### 铁律：四份 mdx 都不要手工编辑

```
changelog/data/entries.json   ← 唯一数据源，改这里
        │  npm run changelog
        ├─→ changelog.mdx              首页：最近 N 条 <Update>
        ├─→ en/changelog.mdx
        ├─→ changelog/archive.mdx      归档：按月 / 分类 / 厂商三维索引
        └─→ en/changelog/archive.mdx
```

生成器 `scripts/build-changelog.mjs`，四份产物顶部都有「请勿手工编辑」注释。
`npm run changelog:check` 只比对不写盘，产物与数据不一致时退出码 1。

`scripts/migrate-changelog-to-data.mjs` 是**一次性**迁移工具（已跑完，2026-08-14），
它读 `changelog.mdx` 写 `entries.json` —— 与生成器方向相反，再跑一次会把已生成的页
当成手写源解析出 0 条。脚本自带产物检测会拒绝执行，别去绕过它。

### 条目怎么写

日常走 `/changelog-writer`，它自己写 `entries.json` 并跑生成器。手工加条目时：

```json theme={null}
{
  "id": "gemini-3-7-flash-launch",
  "date": "2026-08-14",
  "category": "new-model",
  "vendors": ["Google"],
  "zh": { "title": "…", "summary": "…", "links": [{ "icon": "📖", "text": "查看详情", "href": "/news/…" }] },
  "en": { "title": "…", "summary": "…", "links": [{ "icon": "📖", "text": "Read details", "href": "/en/news/…" }] }
}
```

* `entries` 按 `date` 倒序，最新在最前；`id` 全局唯一，优先复用 news / live 的 slug
* `category` 六选一：`new-model` / `price` / `feature` / `service-notice` / `docs` / `industry`
* **`title` 用 `·` 分成两段**：前段是条目标题，**同时出现在正文的 `###` 标题（视觉焦点）
  和 `<Update label>`（右侧 TOC 那一行）**；后段作为正文标题下的加粗导语。
  例：`Gemini 3.7 Flash 上线 · 官方同价，限时优惠期比上一代便宜一半`

  标题为什么两处都放：`<Update label>` 那一栏是给 `March 2025` 这类短标签设计的，
  渲染成左侧窄列里的蓝色小胶囊——标题只放那里会变成整页最不起眼的元素。所以标题进正文当 H3。
  但 **changelog 页的右侧 TOC 只收 `<Update label>`，正文 H2/H3 一律不进**（2026-09-02
  于 mint dev 4.2.715 实测），label 只剩日期的话 TOC 就成了一列光秃秃的日期。两处都放是折中，
  开关在 `build-changelog.mjs` 的 `LABEL_KEEPS_HEAD`，那里写了复验方法。
* **`summary` ≤ 120 字、2-3 句**。指标只留最有说服力的 1-2 个，其余留给 news 详情页
* **JSON 里存语义文本，不要写 MDX 转义**。`$` 直接写 —— 转义由生成器按落点决定：
  markdown 正文出 `\$`，JSX 属性出 `$`（属性里写 `\$` 会渲染出一个字面反斜杠）
* 英文链接漏了 `/en/` 前缀生成器会自动补，但别依赖它兜底

### changelog 不建自己的详情页

一次上线在本仓已经有 `news/`（深度长文）、`live/{YYYY-MM}/`（实时动态子页）两处正文，
再加一层 changelog 子页就是第四份拷贝，且必然逐渐不同步。**changelog 只做索引层**：
`links` 指向已有的 `/news/` 或 `/live/` 页；实在没有详情页的老条目，归档行保持纯文本即可。

### 三个栏目的分工

| 栏目          | 定位                    | 频率 |
| ----------- | --------------------- | -- |
| `changelog` | 重要里程碑的索引，一条一两句        | 低  |
| `live/`     | 模型状态、故障、负载播报 + 每条独立子页 | 高  |
| `news/`     | 800-2000 字深度解读        | 中  |

### 不要给 changelog 页加 `mode`

Mintlify 官方一边说「Use center mode for changelogs」，一边在 `create/changelogs`
里明确提示 `custom` / `center` / `wide` **会隐藏 TOC 和 changelog 筛选器**。
当前无 `mode`（= default）是对的。

同理 **`<Update>` 不要加 `tags`** —— 一旦有 tags，右侧 TOC 就被 tag 筛选器整个取代，
按月份/条目导航的能力就没了。`description` 已经用来承载「分类 · 厂商」。

## AI风向标（News）书写规范

### 栏目定位

AI风向标是独立的顶级导航栏目，用于发布：

* **本站更新**：新模型上线、价格调整、功能更新的深度解读
* **行业动态**：AI 领域重要事件、技术突破、趋势分析
* **使用指南**：模型对比、最佳实践、应用案例

### 文章页面结构

```mdx theme={null}
---
title: "文章标题（20字以内，吸引眼球）"
description: "一句话摘要（50-80字，适合搜索引擎和社交分享）"
date: "2025-11-20"
author: "API易团队"
category: "site-update | industry-news | tutorial | model-release"
tags: ["标签1", "标签2", "标签3"]
icon: "newspaper"
featured: true  # 是否在首页展示
---

## 核心要点
[3-5个要点，用 bullet points 列出，让读者快速了解文章内容]

## 背景介绍
[为什么要关注这个话题？有什么背景信息？]

## 详细解析
[深入分析，包含技术细节、性能对比、使用场景等]

## 实际应用
[如何使用？代码示例、最佳实践]

## 价格与可用性
[定价信息、购买渠道、优惠活动]

## 总结与建议
[总结核心观点，给出使用建议]
```

### 写作风格指南

* **专业度**：引用官方数据、权威评测、性能指标
* **易读性**：使用副标题、要点列表、代码示例、对比表格
* **时效性**：标注发布日期、版本号、数据来源日期
* **可操作性**：提供具体的使用方法、代码示例、配置指南
* **视觉化**：使用 Card、Info、Warning 等 Mintlify 组件增强可读性

### 联网搜索要求（必须）

* **创作前搜索**：撰写每篇 News 文章前必须进行联网搜索
* **验证信息**：核实模型发布日期、性能指标、官方公告
* **引用来源**：标注信息来源（官方博客、技术报告、评测网站）
* **时效性检查**：确保使用最新的版本号、API 端点、定价信息

### 分类标签系统（Tags）

* **类型标签**：`site-update`（本站更新）、`industry-news`（行业动态）、`tutorial`（教程指南）、`model-release`（模型发布）
* **厂商标签**：`openai`、`google`、`anthropic`、`deepseek`、`zhipu` 等
* **能力标签**：`text-generation`、`image-generation`、`video-generation`、`code`、`reasoning` 等
* **使用场景**：`programming`、`translation`、`creative-writing`、`data-analysis` 等

### 文件命名规范

* **格式**：`模型名-发布类型-日期.mdx`
* **示例**：
  * `gemini-3-pro-preview-launch.mdx`（模型发布）
  * `gpt-5-price-update.mdx`（价格更新）
  * `ai-trends-2025-q4.mdx`（行业趋势）
* **要求**：小写字母、连字符分隔、简洁明了

### 目录组织

* **路径**：`/news/` 和 `/en/news/`（中英双语）
* **结构**：扁平结构，所有文章在根目录
* **排序**：通过 frontmatter 的 `date` 字段自动排序
* **分类**：通过 `tags` 和 `category` 字段分类

### 与 Changelog 的关系

* **Changelog**：简短摘要（≤120 字、2-3 句）+ 链接到 News
* **News**：完整的深度文章（800-2000字）
* **链接**：Changelog 条目必须链接到对应的 News 文章
* **同步更新**：发布 News 文章时，同步更新 Changelog ——
  改 `changelog/data/entries.json` 后跑 `npm run changelog`，**不要直接编辑 `changelog.mdx`**（它是产物）

### Mintlify 组件使用

````mdx theme={null}
{/* 重要信息 */}
<Info>
  这里是重要提示信息
</Info>

{/* 警告提醒 */}
<Warning>
  注意事项和限制
</Warning>

{/* 要点卡片 */}
<Card title="核心特性" icon="star">
  特性说明
</Card>

{/* 多列布局 */}
<CardGroup cols={2}>
  <Card title="优势" icon="check">内容</Card>
  <Card title="限制" icon="ban">内容</Card>
</CardGroup>

{/* 代码示例 */}
```python
# Python 代码示例
import openai
````

| 模型 | 性能  | 价格    |
| -- | --- | ----- |
| A  | 90% | \$1   |
| B  | 85% | \$0.5 |

````

### 图片使用规范
- 遵循"图片格式要求"章节的规范
- 优先使用 PNG 格式
- 支持浅色/深色主题切换
- 文件大小控制在 200KB 以内

### 质量检查清单
发布前检查：
- ✅ 已进行联网搜索验证信息
- ✅ Frontmatter 字段完整（title、description、date、tags 等）
- ✅ 无 H1 标题（使用 H2 起始）
- ✅ 代码示例可运行
- ✅ 链接有效（内部链接和外部链接）
- ✅ 图片正常显示
- ✅ 中英文版本同步
- ✅ Changelog 已更新对应链接（改 `changelog/data/entries.json` + `npm run changelog`）
- ✅ **docs.json 导航配置已更新**（中英双版本，见下方说明）
- ✅ **价格符号已转义**（`$` → `\$`）
- ✅ **无外部超链接**（非 apiyi.com 域名改为纯文本 + 反引号）
- ✅ **小于号已处理**（`<数字` 改为 `少于数字` 或 `&lt;数字`）
- ✅ **多语言管线已同步**（改动落在核心 4 Tab 时跑 `npm run i18n`；News 不在多语种覆盖范围内，可跳过）
- ✅ **坏链检查通过**（`npm run links`，坏链数不高于改动前）

### docs.json 导航更新（重要）
**每次创建新的 News 文章后必须更新 `docs.json`，否则用户无法在网站导航中找到新文章。**

#### 需要更新的位置
> 不要按行号找。`docs.json` 已含多个语种的 language 块，行号会随语种增减而变化，
> 一律按 `navigation.languages[].language` 的值定位。

1. **中文版导航**：
   - 路径：`navigation.languages[]` 里 `"language": "zh"` 的那一块 → 找到公告相关的 `tab` → `groups[0].pages`
   - 在 `pages` 数组**最前面**添加：`"news/文章文件名"`（不含 `.mdx`）

2. **英文版导航**：
   - 路径：`navigation.languages[]` 里 `"language": "en"` 的那一块 → 找到对应的公告 `tab` → `groups[0].pages`
   - 在 `pages` 数组**最前面**添加：`"en/news/文章文件名"`（不含 `.mdx`）

3. **其余语种（`zh-Hant` / `ja` / `ko` / `ru`）不要手改**——由 `npm run i18n:nav` 整块重建。
   News 不在多语种覆盖范围内，所以发 News 文章时这些块不会有变化。

#### 示例
```json
{
  "pages": [
    "news/你的新文章-slug",  // 新文章置顶
    "news/seedream-4-5-launch",
    "news/claude-opus-4-5-launch"
  ]
}
````

#### 注意事项

* 新文章必须放在数组最前面（最新的在最上面）
* 注意 JSON 逗号语法
* 中英文版本必须同时更新
* 路径不包含 `.mdx` 扩展名
* `docs.json` 用 2 空格缩进、不转义非 ASCII 字符（`sync-nav.mjs` 按此格式回写，手改请保持一致）

## 双人协作流程

本仓两个人都在提交：主干由仓库拥有者维护，协作者在自己的分支上写页，再由主干侧合入。
规范不靠记忆和口头传达，靠 `pre-commit` 钩子强制。

### 协作者侧

1. 动手前先把主干合进自己分支，别攒太久（攒得越久，合入时要人工判断的东西越多）。
   **解决冲突默认吃掉主干版本**（`git checkout --theirs`），自己的新内容合并后重改一遍；
   把主干新改动整体丢弃会被 `check-merge-guard` 在提交时拦下（2026-08-12 内容回退事故的防线）
2. **只写简体中文（根目录）和英文（`en/`）两版**，永远不碰 `zh-Hant/` `ja/` `ko/` `ru/` `models/`
3. `docs.json` 只改 `zh` 和 `en` 两个 language 块
4. **写新 FAQ / 新页面前先搜主干**，防主题撞车（同一主题两个文件名程序判不出来，
   实测撞车对文本相似度仅 0.05；intake 列标题兜底，但先搜一步两边省事）
5. 提交时钩子自动校验，报错就地修
6. push 自己的分支，**不直接推 main**

### 主干侧

```bash theme={null}
npm run intake <分支名>          # 分类 / 剔除产物 / 回归检查 / 冲突干跑 / 规范校验
npm run intake <分支名> -- --dry # 只报告不落盘
```

脚本做完会停在暂存区，接着人工走：

1. **过一遍 `git diff --cached`** —— 脚本只挡机械错误，挡不住内容口径问题
   （定价话术、写死的折扣数字、竞品措辞这些必须人眼看）
2. `docs.json` 由**人工**合并 —— 两边都可能在改，脚本不碰
3. `npm run i18n:plan` 看成本 → `npm run i18n` 出繁日韩俄
4. `npm run links` 确认坏链数不升，然后提交

`intake` 会自动剔除协作者误改的构建产物（`zh-Hant/` `models/` 等），并做一次**回归检查**：
比对对方分支与主干，报出他合并主干时是否弄丢过文件 —— 这是真发生过的事故。
另外三道防线（2026-08-12 复盘后加）：与主干同名的「新增」不自动取回（防覆盖，列为撞车待人工比对）；
新增 mdx 列出 frontmatter 标题（人眼识别主题撞车）；主干在基点后也改过的 M 文件标回退警告。

### 为什么不上 PR / 不转组织

本地钩子零成本、即时反馈，已经覆盖机械性规范问题。PR 的额外价值在服务端硬拦
（校验不过就不能合），私有仓要这个需要付费计划。等真出现「绕过钩子提交了坏内容」
再升级不迟。

### 工作区有未提交改动时，禁用 `git reset --hard` 和 `git stash`

`--hard` 会连**未暂存的已跟踪文件修改**一起抹掉，作用范围远超你想回滚的那个提交，
且这些改动从未进过 git 对象库，reflog 也救不回来。回滚提交但保留工作区改动用
`git reset --soft HEAD~1`（保留暂存）或 `--mixed`（退回工作区）。
这条是拿一次真实事故换来的：一次 `--hard` 抹掉了 20 个文件的未提交改动。

**`git stash` 是同一类风险，一并禁用**（`--keep-index` 也不行）。它把**所有已跟踪文件的
修改**一次性挪走，只留未跟踪的新文件——看上去就像改动全没了。2026-09-02 一天之内踩了两次：
一次为对比 `broken-links.json` 基线，25 个文件（含 i18n 刚产出的六语种产物）瞬间消失；
一次为对比 changelog 改动前的版本。两次都 `stash pop` 救回来了，但那是运气。

**要「改动前的基线」就用 `git show HEAD:<path>`**，只读、零副作用，还能直接管道给 grep/diff。
需要临时干净树就先 commit 到临时分支，不要 stash。

**本仓可能有多个会话/人同时在同一棵工作树上写东西**（`.mdx`、`docs.json`、i18n 产物都是
大批量整体重写）。所以任何**作用于整棵树**的 git 操作（`stash` / `reset` / `checkout .` /
`clean`）动手前先 `git status --short` 看一眼：出现了你没碰过的文件，就说明别人正在飞，
这类命令一律别用。回退自己的改动只按路径来：`git checkout -- <你改的那几个文件>`。

## 文档规范校验（pre-commit 拦截）

`scripts/check-docs.mjs` 把上面的写作规范变成可执行检查，与 Key 扫描一同挂在钩子上。

```bash theme={null}
npm run check                         # 全仓体检
npm run check -- --files a.mdx b.mdx  # 指定文件
SKIP_DOC_CHECK=1 git commit           # 临时跳过
```

### 拦截级规则

构建产物被手改、页面没注册进 `docs.json`、导航指向不存在的页、中英配对缺失、
UTF-8 BOM、正文 H1、JSX 标签不配平、JSX 属性值内嵌 ASCII 双引号、
正文未转义 `$数字`、frontmatter 写了非法的 `\$`、英文页出现 `API易`/`APIEasy`、
英文页内链缺 `/en/` 前缀、非 apiyi.com 超链接、图片引用不存在。

### 告警级规则（不拦截，需人眼判断）

英文页用反引号包散文（反引号是代码片段，翻译器原样保留，英文散句会漏进日韩俄，
但字面提示词和 UI 标签保留原文是对的）、时间缺时区、`<` 后紧跟数字。

### 三个设计要点，改规则时别退回去

1. **`--staged` 下行级规则只在本次新增的行上生效**。全仓有 500 多处历史遗留外链、
   100 多处未转义 `$`、60 多处正文 H1，若按整文件判定，改个错别字都会被存量问题拦下，
   钩子很快就会被 `--no-verify` 绕过。结构性规则（配平、注册、配对、BOM）不受此限 ——
   它们全仓当前为 0，且破坏后果是页面级故障，不是可以慢慢还的债。
2. **JSX 配平必须按多行匹配开标签**。`<Card\n  title="…"\n>` 这种写法很常见，
   用 `/<Card[ >]/` 这类朴素规则会把配平的页面误报成不配平。校验器误报一次就没人信了。
3. **`generated-lang` 判的是「内容与生成器产出不符」，不是「文件有改动」**。
   产物目录每跑一次管线就整体重写，而产物本来就要提交 —— 按「有改动」判定会把
   每一次正常的 `npm run i18n` 提交都挡在门外（这条规则刚上线时就是这样，第一次
   带管线产物的提交直接被自己的钩子拦死）。判定分三路：`zh-Hant` 用 `hantConvert()`
   就地重算比对（OpenCC 是确定性的，所以可复算）；`ja/ko/ru` 比对
   `scripts/i18n/manifest.json` 的 `outSha`，与 `translate.mjs` 的篡改检测同源；
   `models/index` 由 catalog 生成器直接出五语种，走 `isGeneratedPage()` 豁免。
   繁体的判定复用 `hant.mjs` 导出的同一个函数，**不要另写一份近似实现** —— 会漂移成误报。

规则的分级依据是实测：`faq/` `scenarios/` `news/` 当前 100% 已注册导航、100% 中英配对，
所以这两条能做成拦截；`api-capabilities/` 有 9 个有意为之的隐藏页，只能告警；
`live/`（289 页）和 `wiki/`（104 页）本就不在导航，两条规则都不适用。

## API Key 不入库（pre-commit 拦截）

**任何真实 API Key 都不许写进仓库**，测试脚本一律从环境变量读：

```python theme={null}
API_KEY = os.environ["APIYI_API_KEY"]   # ✅
API_KEY = "sk-your-api-key"             # ❌ 真 Key 写死在这里会被 pre-commit 拦下
```

### 启用（每个克隆执行一次，两个人都要做）

```bash theme={null}
npm run hooks:install     # = git config core.hooksPath .githooks
```

这一条命令同时启用 Key 扫描和文档规范校验 —— 是整套协作流程里唯一需要协作者配合的动作。

钩子只扫**本次暂存的新增行**，所以历史遗留 Key 不会卡住无关改动。
全量体检：`npm run secrets`。

### 判定规则

`scripts/check-secrets.mjs`，命中即拦：

| 规则                  | 模式                                 |
| ------------------- | ---------------------------------- |
| OpenAI / 兼容网关       | 左边界非字母数字 + `sk-` + **10 位以上纯字母数字** |
| Anthropic           | `sk-ant-` + 16 位以上                 |
| OpenAI 项目 Key       | `sk-proj-` + 16 位以上                |
| OpenRouter          | `sk-or-v1-` + 16 位以上               |
| Emergent 平台 LLM Key | `sk-emergent-` + 12 位以上纯字母数字       |

两个设计要点，改规则时别退回去：

1. **必须有左边界 `(?<![A-Za-z0-9])`**。否则 `task-page-...`、`risk-management-...`、
   `disk-...` 里的 `sk-` 全部误报——实测全仓 1587 处。
2. **主规则不许出现连字符**。这是区分真 Key 和占位符的关键：真 Key 是连续字母数字串，
   `sk-your-api-key` / `sk-your-apiyi-key` 这类占位符带连字符，天然被排除。

   带固定厂商前缀的规则（`sk-ant-` / `sk-emergent-` 等）里，连字符是**字面量前缀的一部分**，
   其后的随机段仍要求连续字母数字，所以 `sk-emergent-your-key` 照样被排除，与主规则同一口径。
   `sk-emergent-` 是 2026-08-21 补的：主规则抓不到它 —— `sk-` 之后是 `emergent`（8 位）
   就撞上连字符，够不到 10 位门槛，实测一把真 Key 能大摇大摆走过扫描器。

另有占位符启发式：纯 `x`/`*`、去重后字符数 ≤ 4（如 `sk-0000000000`）、
以 `your`/`test`/`example` 等词开头**且整体单一大小写**的，放过。
最后这条必须带「单一大小写」限定——真 Key 是随机串，开头撞上短词的概率很高。

### 占位符怎么写

统一写成带连字符的形式，规则不会拦：`sk-your-api-key`、`sk-your-apiyi-key`。

### 放行

* 单行：行尾加注释 `allow-secret`
* 字面量：写进 `.secretsallow`（每行一条，`re:` 前缀按正则处理）
* 整次提交：`git commit --no-verify` 或 `SKIP_SECRET_SCAN=1 git commit`

## 供应商内容不入库（2026-09-03 起，pre-commit 拦截）

与上游供应商相关的材料**只限仓库拥有者本人可见，不进 GitHub**——同事能看到仓库，
但不该看到我们和哪家上游在谈什么、给对方发了什么。只约束此后新增的内容，**历史上已入库的不回溯**。

### 什么算供应商内容

* 给供应商的反馈报告、对外沟通草稿（中英文都算），例如 `report-en-for-nbhub.md`
* 点名上游（渠道 host / 供应商名）的归因报告、渠道对比结论
* 排查记录里带客户用户名 + 上游归属的那类（哪个客户在哪家上游慢）

渠道测试的**脚本**本身不含上游身份时可以照常入库；拿不准就整个专题目录进 private/。

### 放哪里

任意层级的 `private/` 目录，`.gitignore` 已整体忽略。惯例是放在专题所属的分类下：

```
code-test/ShellAPI/private/0903-bananahub慢请求归因/   ✅
code-test/ShellAPI/0903-bananahub慢请求归因/           ❌ 会进 GitHub
```

写这类材料时**默认就落在 private/ 里**，不要先写在外面再挪。

### 钩子怎么拦（`scripts/check-private.mjs`）

只看本次**新增 / 改名**的路径，不看正文（正文里「供应商」三个字到处都是，按正文判必误报）：

1. 路径含 `private/` 段 —— 本该被忽略却出现在暂存区，说明有人 `git add -f`，拒绝
2. 文件名命中 `供应商` / `vendor` / `上游反馈` / `给上游` / `report|draft|feedback…-for-<对方>.md` —— 没放进 private/，拒绝

已追踪的旧文件改内容不拦。命中后把文件挪进 `private/` 再提交；确认不是供应商内容用
`SKIP_PRIVATE_CHECK=1 git commit` 跳过。全仓盘点（只报告）：`npm run private`。

注意 `private/` 里的东西**只存在于本机**，没有 git 备份——重要材料自己另行备份。

## 选题雷达（content-ops/）

把本仓的改动自动提炼成**博客选题卡**，供另一个博客项目消费。
管线在 `scripts/topics/`，产物在 `content-ops/`，完整手册见 `scripts/topics/README.md`。

```bash theme={null}
npm run topics            # 增量跑一次，出选题卡
npm run topics:plan       # 干跑：只打印信号与分数，不写盘、不调模型
npm run topics:selftest   # 纯函数自测
npm run topics:done <id> -- --url https://…   # 博客发完后回标
```

### 铁律

1. **`content-ops/` 除 `editorial-stance.md` 外全是产物**，不要手改，下次运行整份重写。
   唯一例外是卡片 frontmatter 里的 `status` / `published_url`（也可用 `topics:done` 改）。
2. **口径约束改 `content-ops/editorial-stance.md`，不要改提示词**。
   这份文件整份注入模型，管着「1:7 是固定汇率不是优惠」「不写死折扣数字」
   「限制少不作卖点」这类话术红线，改完下次跑即生效。
3. **只采集简中源目录和 `code-test/`**。一次改动在 `en/ ja/ ko/ ru/ zh-Hant/ models/`
   里有 5\~6 份镜像，采进来信号量 ×6、同一件事出六条重复选题。
4. **`content-ops/` 已加进 `.mintignore`**，不参与站点构建；用 `.md` 而非 `.mdx`
   所以 `check-docs.mjs` 也扫不到它，不需要为它改校验器。

### 触发方式

* **本机 launchd（主路径）**：`sh scripts/topics/launchd/install.sh`，每天 09:30 (UTC+8)。
  用 launchd 不用 cron 是因为合盖休眠时 cron 会直接跳过，launchd 唤醒后补跑。
* **GitHub Actions（只读兜底）**：`.github/workflows/topics.yml`，每周一跑一次，
  **不写回仓库**，把候选开成 Issue。这是本仓唯一的 CI，刻意做成只读 ——
  Mintlify 由 push 触发部署，CI 写回 commit 会和本机编辑打架。

### 成本闸门

默认 30 个簇（`TOPICS_GATE_CLUSTERS`）。与 `I18N_GATE_BLOCKS` 同定位：
不是省钱开关，是兜住「权重表/聚簇规则/模型变了导致全量重算」和「首次回填」。
撞上了先想清楚是不是动了规则，别习惯性 `--force`。

## code-test/ 目录规范（测试产物不入库）

`code-test/` 存放各类渠道/模型的实测记录。**只提交「结论与可复现的东西」，不提交「跑出来的产物」。**

| 提交 ✅                          | 不提交 ❌                                        |
| ----------------------------- | -------------------------------------------- |
| `测试计划.md`、`测试报告.md`、`分析结果.md` | `logs/` — 每次调用的响应记录                          |
| `summary.csv` 等结构化汇总          | `previews/`、`compare/` — 缩略图与对比图             |
| `scripts/` — 能重跑出全部产物的脚本      | `outputs/`、`results/` — 出图、视频等原件             |
| 少量必要的输入素材（参考图）                | `*.mp4` / `*.mov` / `*.webm` / `*.body.json` |

规则写在根目录 `.gitignore` 的 `code-test/` 段落里，按目录名匹配（`code-test/**/logs*/` 等，末尾 `*` 覆盖 `logs-0711/`、`outputs-0711/`、`results-image/` 这类带后缀的变体），新建测试目录**沿用这几个目录名即可自动生效**，不需要每个测试目录再放一个局部 `.gitignore`。

### 为什么

产物体积比结论大几个数量级，且**可以由 `scripts/` 完整重新生成**。此前没有这条规则时，单个 `logs/*.body.json`（内含 base64 响应体）达 35MB、`results/*.mp4` 达 48MB，是 `.git` 膨胀到数 GB 的直接原因。

### 写报告时怎么办

* 报告里要放图，就**放少量缩略图**，并在「产物清单」里说明原件如何重跑生成；
* 注意缩略图目录若叫 `previews/` / `compare/` 同样不入库，需要随报告一起看的图请另起目录名并控制体积；
* 确有个别文件必须入库，用 `git add -f <file>` 单独豁免，并在报告里说明原因。

### 新建测试目录的推荐结构

```
code-test/<厂商>/<模型或专题>/<日期-主题>/
├── 测试计划.md          ✅ 入库
├── 测试报告.md          ✅ 入库
├── 分析结果.md          ✅ 入库（脚本生成的数据表）
├── summary.csv         ✅ 入库
├── scripts/            ✅ 入库（runner / analyze / probe）
├── assets/             ✅ 入库（输入素材，控制体积）
├── logs/               ❌ 自动忽略
└── outputs/            ❌ 自动忽略
```
