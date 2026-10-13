> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# AGENTS

# Repository Guidelines

APIYI 文档中心（`docs.apiyi.com`），基于 Mintlify。
在项目里会存在 code-test 文件夹的大量 AI 大模型的API 接口测试，测试结果经过分析后最终会把可对外的内容展示在 APIYI 文档中心。
思考过程不限制语言，用户和 Agent 之间的对话语言为简体中文。

本文件是给 Codex 等 Agent 的精简版。**完整规范以 `CLAUDE.md` 为准**，双人协作手册见 `COLLABORATION.md`，
i18n 管线手册见 `scripts/i18n/README.md`。两者冲突时按 `CLAUDE.md` 执行。

## 目录结构

* 内容是 `.mdx`，导航在 `docs.json`。主要目录：`api-capabilities/`、`api-reference/`（OpenAPI + Playground）、
  `scenarios/`、`faq/`、`news/`、`live/`、`changelog/`、`compare/`、`wall-of-love/`、`wiki/`、`images/`、`public/`
* 简体中文在仓库根目录，英文在 `en/` 下同路径同文件名
* `code-test/`：渠道/模型实测记录，只提交结论与脚本，不提交产物（见下文）
* 站点内容不要放仓库根目录的 `.md`，写成 mdx 放进对应目录

## 铁律：这些是构建产物，不要手工编辑

| 产物 | 生成方式 |
| - | - |
| `zh-Hant/` `ja/` `ko/` `ru/` 全部 | `npm run i18n`（繁体 OpenCC；日韩俄从 `en/` 翻译） |
| `models/` 全部、根目录 `model-registry.json` | `npm run models`（数据改 `models/data/`） |
| `changelog.mdx`、`changelog/archive.mdx` 及 `en/` 两份 | `npm run changelog`（数据改 `changelog/data/entries.json`） |
| `docs.json` 中 `zh` / `en` 以外的 language 块 | `npm run i18n:nav` |
| `content-ops/`（`editorial-stance.md` 除外） | `npm run topics` |

译文有问题：繁体改 `scripts/i18n/overrides/zh-Hant.json`，日韩俄改 `scripts/i18n/glossary/<lang>.json`，
导航标签改 `scripts/i18n/labels.json`，然后重跑管线。

## 写页面的规范

* **人工只写中文 + 英文两版**，新建页面必须中英成对，并在 `docs.json` 的 `zh` / `en` 两块同一位置注册
* 日韩俄以英文为源：改了中文就要同步改英文
* frontmatter 必须有 `title`；**正文不许出现 H1**（Mintlify 用 title 生成 H1），正文从 `##` 开始
* `title` / `sidebarTitle` 不中英混排
* 英文及其它外语页品牌名写 `APIYI`，不写 `API易`；英文页内链带 `/en/` 前缀
* 时间必须带时区：`18:30 (UTC+8)`
* 手写的模型价格表后必须加备注：价格与官网对齐、可能调整，以顶部「模型价格」栏目（`/models/index`，英文 `/en/models/index`）为准；写表前以 `model-registry.json` 核价
* 正文里的 `$` 转义为 `\$`；frontmatter（YAML）里直接写 `$`，不要写 `\$`
* 只允许第一方域名超链接（`apiyi.com` 全系、`icover.ai`、`work.weixin.qq.com`），其它写成纯文本 + 反引号
* `<` 后跟数字写成「少于 20」或 `&lt;20`；JSX 属性值里不要嵌 ASCII 双引号，中文用 `「」`
* 注释用 JSX 注释 `{/* */}`，不用 HTML 注释；图片用 `/images/文件名` 绝对路径，避免内联 SVG
* `docs.json` 的 `icon` 用 Lucide 图标名；2 空格缩进、不转义非 ASCII
* 标题里不要用半角 `%`（会导致 SSR 500），用全角 `％`

## 常用命令

```bash theme={null}
npm run hooks:install   # 每个克隆执行一次：启用 pre-commit
npm run check -- --files a.mdx b.mdx   # 文档规范校验
npm run i18n:plan       # 看翻译规模
npm run i18n            # 出繁日韩俄（中英页 + docs.json 都改完后再跑）
npm run links           # 全仓坏链检查，坏链数不得高于改动前
npm run faq:check       # FAQ 落地页收录与计数校验
mintlify dev            # 本地预览
```

不要并发跑 `translate.mjs`；别习惯性加 `--force`（成本闸门只拦全量失效这类意外）。

## 提交与协作

* pre-commit 依次跑：Key 扫描 → 文档规范 → 供应商内容 → 合并回归防护。报错就地修，别用 `--no-verify` 绕过
* **真实 API Key 不入库**：脚本从环境变量读 `os.environ["APIYI_API_KEY"]`，占位符写 `sk-your-api-key`
* **供应商相关材料只放 `private/` 目录**（已被 gitignore），不进 GitHub
* `code-test/` 下 `logs/` `outputs/` `results/` `previews/` `compare/` 及视频、`*.body.json` 不入库
* 协作者：在自己的分支上写，**不合并 main、不推 main、不改 `docs.json`**，写新页前先在主干搜同主题
* 主干侧用 `npm run intake <分支名>` 合入，不走 PR
* **禁用 `git stash` 和 `git reset --hard`**，本仓常有多个会话同写一棵工作树；
  整树 git 操作前先 `git status --short`，回退只按路径 `git checkout -- <文件>`；
  要改动前的基线用 `git show HEAD:<path>`


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.