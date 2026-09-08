> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# COLLABORATION

# 协作指南

本仓两人协作：**主干维护者**（直接提交 main）与**协作者**（自己的分支写页，由主干侧合入）。
规范尽量不靠自觉——能程序化的都挂在 pre-commit 钩子和 intake 脚本上，本文说明"程序挡什么、人看什么"。

**协作模型是单向流**：内容从协作者分支流向 main，**不回流**。协作者不合并主干、
不解冲突；主干侧只取"纯新增"，存量页的修改默认不取。这条是 2026-08-14 定的，
替代了此前"勤合并 + 冲突吃主干"的做法（为什么改见下节）。

## 一次性准备（每个克隆都要做）

```bash theme={null}
npm run hooks:install     # 启用 pre-commit：Key 扫描 + 文档规范校验 + 合并回归防护
```

**这是整套流程里唯一需要你配合的动作。没装钩子，下面所有"程序拦截"都不存在。**

## 铁律（程序拦截，违反无法提交）

| # | 规则                                                         | 拦截者                               |
| - | ---------------------------------------------------------- | --------------------------------- |
| 1 | `zh-Hant/` `ja/` `ko/` `ru/` `models/` 是构建产物，禁止手改          | `check-docs` generated-lang       |
| 2 | 协作者不改 `docs.json`（主干侧人工注册）；主干侧只改 `zh` / `en` 两个 language 块 | 人工（intake 时核对）                    |
| 3 | 新页面必须中英成对（`faq/x.mdx` + `en/faq/x.mdx`），且都注册进 docs.json    | `check-docs` no-pair / not-in-nav |
| 4 | 站点内容不放仓库根目录——写成 mdx 放进 `faq/` `scenarios/` 等目录             | `check-docs` stray-root-md        |
| 5 | 真实 API Key 不入库，测试脚本从环境变量读                                  | `check-secrets`                   |
| 6 | 英文页品牌名写 `APIYI`（代码围栏内逐字保留的源码除外）                            | `check-docs` brand                |
| 7 | 万一还是合并了 main，不许把 main 的新改动整体丢弃（详见下节）                       | `check-merge-guard`               |

行级规则（外链、`$` 转义、正文 H1 等）只检查**本次新增的行**，历史遗留不会卡你。

铁律 3 对协作者的实际含义是"**中英两份内容都要写**"——注册进 docs.json 由主干侧做。
协作者本地跑 `npm run check` 时会因为没注册而报 not-in-nav，属预期，push 不受影响。

## 不要合并主干（单向流的核心规则）

**背景**：2026-08-12 首次发现协作分支合并 main 时冲突全选了"自己的版本"，静默回退了
主干的修复；当时的对策是"勤合并 + 冲突吃主干"。2026-08-14 复查同一分支，**回退再次发生
且规模更大**——21 个 M 文件里没有一个是协作者的新内容，全部是回退：BOM 加回来、
外链还原成超链接、写死的折扣数字回来了、`one-click-integration` 整页退回旧版、
`lobehub` 模型名退回 `gpt-4o`、`docs.json` 里主干新注册的两页被删掉。

结论：**靠"记得选对冲突方向"防不住**，改成从流程上取消这个动作。

### 协作者：三条规则

1. **从 main 切分支后就一直在上面写，不要再 `git merge origin/main`**，也不用关心主干更新了什么。
   分支越写越旧没关系——新增页面不依赖主干的最新状态。
2. **只写简体中文（根目录）+ 英文（`en/`）两版**，不碰 `zh-Hant/` `ja/` `ko/` `ru/` `models/`，
   **也不碰 `docs.json`**。
3. 写完 push 自己的分支，**告诉主干侧页面路径**（例如"新增 `faq/xxx.mdx` 中英两版"）。

**要改主干已有的页怎么办**：单独说一句"我改了 X 页的 Y 处、原因是 Z"。
主干侧会手动对那一处——不要指望它在分支 diff 里被自动发现，因为 M 文件默认丢弃（见下）。

### merge-guard 仍在，作为兜底

如果还是合并了主干（比如误操作，或工具自动合并），pre-commit 的 `check-merge-guard`
会在发现"main 改过的文件被整体退回旧版"时拒绝提交，并列出文件清单和修复命令。
真有理由保留自己版本（极少见），用 `SKIP_MERGE_GUARD=1 git commit` 并在提交说明里写明原因。

## 写新页面之前：先搜主干，防主题撞车

**背景**：协作分支写了 `faq/log-export-timezone-utc.mdx`，而主干四天后已有同主题的
`faq/log-timezone-and-export.mdx`——文件名不同、措辞不同、内容重复，两篇对"汇总导出用哪个时区"
的说法还互相矛盾，合入时必须人工判定谁对、再决定合并还是弃掉一篇。
这种撞车程序判不了（实测两篇的文本相似度只有 0.05），只能靠动手前先查：

```bash theme={null}
git fetch origin
git grep -il '时区\|导出' origin/main -- 'faq/'      # 按主题关键词搜
git ls-tree origin/main --name-only faq/              # 或直接过一遍文件名
```

intake 时脚本会把每个新增 mdx 的**标题**列出来，主干侧扫一眼也能兜住——但你先搜一步，两边都省事。

## 协作者提交前自查

```bash theme={null}
npm run check -- --files <你改的文件>   # 规范校验（提交时钩子也会跑）
```

* 只产出简体中文（根目录）+ 英文（`en/`）两版，其余语种是主干侧跑管线生成的
* 时间标注时区：`18:30 (UTC+8)`
* 正文 `$` 转义为 `\$`，frontmatter 里直接写 `$`
* 外链只允许第一方域名（`apiyi.com` 全系、`icover.ai`、企微客服 `work.weixin.qq.com`），
  其它域名写成纯文本 + 反引号
* JSX 属性值里不要再出现 ASCII 双引号，中文用 `「」`：
  `<Step title="严格按「自然日」分桶">`，写成 `<Step title="严格按"自然日"分桶">` 会 MDX 解析失败
* push 自己的分支，**不推 main**、**不合并 main**

## 主干侧合入流程

```bash theme={null}
npm run intake <分支名> -- --dry   # 先看报告
npm run intake <分支名>            # 执行取回，停在暂存区
```

intake 会自动：剔除构建产物、**跳过与主干同名的"新增"**（防覆盖，列为"撞车"待人工比对）、
列出新增 mdx 的标题（人眼查主题撞车）、给"主干也改过"的 M 文件标回退警告、跑规范校验。

### 只取 A，M 默认丢弃

单向流下，分支上的 M 文件绝大多数是合并回退产生的伪增量，不是协作者的新内容
（2026-08-14 实测：21 个 M 文件里回退占 100%）。所以：

* **`A` 类逐个过**——这才是要取的东西
* **`M` 类默认全部丢弃**。协作者真改了存量页，会另行说明是哪页哪处，届时手动对那一处
* **`D` 类忽略**——是协作者剥离的构建产物加上主干新页

看分支到底有什么，**用两点 diff 比对当前主干，不要用三点**：

```bash theme={null}
git diff --name-status origin/main origin/<分支名>     # ✅ 两点：对比当前主干实际状态
git diff --name-status origin/main...origin/<分支名>   # ❌ 三点：按合并基点算，主干后来已有的页会被误报成新增
```

按合并基点算出来的"新增"，据此改 `docs.json` 会加出重复导航。

新增的图片记得比对 blob sha——协作者常把主干已有的图换个文件名重新提交
（`git ls-tree -r origin/<分支名> -- images/` 对照主干，sha 相同即重复，不要取）。

脚本停下后人工接手：

1. `git diff --cached` 过内容口径（定价话术、折扣数字、竞品措辞——脚本挡不了这些）
2. **人工把新页注册进 `docs.json`**（只动 zh / en 两块）——协作者不改这个文件
3. `npm run check -- --files <新页>` 过规范
4. `npm run i18n:plan` 看成本 → `npm run i18n` 出繁日韩俄
5. `npm run links` 确认坏链不升 → 提交

## 事故档案（规则为什么长这样）

| 日期         | 事故                                                           | 对应防线                            |
| ---------- | ------------------------------------------------------------ | ------------------------------- |
| 2026-08-14 | 同一分支再次整体回退主干修订（21 个 M 文件回退占 100%），证明"冲突选对方向"防不住              | 改为单向流：协作者不合并 main、主干侧只取 A       |
| 2026-08-12 | 协作分支合并 main 时保留旧版，回退主干的品牌名/BOM/内容重写                          | `check-merge-guard`（pre-commit） |
| 2026-08-12 | `log-export-timezone-utc` 与主干 `log-timezone-and-export` 主题撞车 | intake 列标题 + 本文"先搜主干"           |
| 2026-08-12 | `coze-gptimage2-plugin.md` / `workbuddy.md` 躺根目录三周无人可见       | `check-docs` stray-root-md      |
| 2026-07-30 | 合并 main 时弄丢文件                                                | intake 回归检查                     |
| 更早         | `git reset --hard` 抹掉 20 个文件未提交改动                            | CLAUDE.md 禁令：工作区有改动时禁用 `--hard` |
