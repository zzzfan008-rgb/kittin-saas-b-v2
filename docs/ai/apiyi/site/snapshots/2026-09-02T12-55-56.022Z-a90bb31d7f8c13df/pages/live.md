> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 实时动态

> API易模型状态、行业快讯、服务动态实时更新

<Update label="2026/9/2 20:37" description="服务通知" tags={["ByteDance", "服务通知"]}>
  🚀 **iCover AI 视频测试工具已更新，模型下拉里可以直接选 SeeDance 2.5** —— `icover.ai/zh/seedance-official` 现在 SeeDance 2.5（`doubao-seedance-2-5-260628`）与 2.0 并列，文生视频 / 首帧 / 首尾帧 / 多模态四种任务与比例、分辨率、时长都能零代码试跑。参考素材推荐先入素材库拿 `asset://` 素材 ID 再引用，请求体只剩几十字节、创建任务即刻返回，素材还能跨任务复用保持人物一致。

  📖 [查看详情](/live/2026-09/icover-seedance-2-5-online)
</Update>

<Update label="2026/9/2 19:45" description="文档更新" tags={["OpenAI", "文档更新"]}>
  📖 **GPT-5.4+ 在 chat 端点上「工具调用 + 显式推理档位」可能被直接拒绝** —— 请求带 `tools` 又显式传了非 `none` 的 `reasoning_effort` 时，上游返回 400 `Function tools with reasoning_effort are not supported ...`。实测四个档位都会触发、不传则不触发，且是否触发取决于落到哪条上游链路，所以「我这次没报错」不能当作安全依据。出路是把带工具的请求改走 `/v1/responses`，或显式设 `reasoning_effort="none"`。新增一页迁移指南。

  📖 [查看详情](/live/2026-09/gpt-5-6-tools-responses-migration)
</Update>

<Update label="2026/9/2 11:54" description="文档更新" tags={["ByteDance", "文档更新"]}>
  📊 **带图带视频调用 Seedance，慢的是提交不是生成** —— 素材要先从你的机器上行到 API易、再转发到火山引擎完成解码校验，这一整段走完才返回任务 ID；内联 Base64 会把秒级提交拖到几十秒，有客户把读超时调到 300 秒仍拿不到任务 ID。先入素材库拿 `asset://` 素材 ID 再引用，请求体只剩几十字节，提交即刻返回，合规校验也提前到入库那一步。新增一页使用技巧文档。

  📖 [查看详情](/live/2026-09/seedance2-asset-first-workflow)
</Update>

<Update label="2026/9/2 11:16" description="新模型" tags={["Anthropic", "新模型"]}>
  🚀 **`claude-fable-5-1` 已上线，缓存读取从 \$1.00 降到 \$0.25，我们已同步下调** —— Anthropic 9 月 1 日发布的 Mythos 级新旗舰，同时上线 `claude-fable-5-1-thinking`。这一代最显著的变化就是缓存读取价格，输入 \$10 / 输出 \$50 每百万 tokens 不变；**我们的定价与官网逐项一致**。100 万 token 上下文、12.8 万 token 最大输出，`default` / `svip` / `ClaudeCode` 三个分组与双端点均可用。迁移前请核对三项破坏性变更：强制工具调用返回 400、思考块与模型绑定、编辑历史会让思考块失效。

  📖 [查看详情](/live/2026-09/claude-fable-5-1-launch)
</Update>

<Update label="2026/8/31 11:20" description="价格变动" tags={["ByteDance", "价格变动"]}>
  🗂️ **Seedance 2.5 与 2.0 系统一走 `SeeDance2` 分组（0.18x），一把令牌通吃四个模型** —— 四个模型收在同一个分组下统一管理，不必为 2.5 单独建令牌，模型名、端点、代码都不用改。实测单价分两档：输入不含视频 \$12.60 / 百万 tokens（480p / 720p / 1080p 同价），输入含视频（多模态参考、视频编辑 / 延长）走更低的 \$7.56。

  📖 [查看详情](/live/2026-08/seedance-2-5-group-merge)
</Update>

<Update label="2026/8/28 11:21" description="新模型" tags={["ByteDance", "新模型"]}>
  🚀 **Seedance 2.5 上线，`doubao-seedance-2-5-260628`** —— 端点与请求结构和 2.0 完全一致，只改 `model` 一个字段即可。时长上限 15 秒提到 **30 秒**、参考图 9 张提到 **30 张**，音频可单独作参考，新增 `mov` 输出与视频编辑 / 延长的显式任务类型；分辨率 480p / 720p / 1080p，不支持 4k。注意 `duration` 缺省是 `-1`，不显式传时长费用可能翻倍。**分组与定价已于 8/30 调整，见上一条。**

  📖 [查看详情](/live/2026-08/seedance-2-5-launch)
</Update>

<Update label="2026/8/26 13:15" description="模型状态" tags={["OpenAI", "模型状态"]}>
  ✅ **`gpt-image-2-vip` 已恢复正常速度，并发可以放开跑** —— 昨天下午起的饱和已经过去，今天 13:13–13:14 (UTC+8) 的实测日志里非流式首字节耗时集中在 37–55 秒，个别 66–71 秒，相比昨天 82–190 秒回到日常水平，此前「压低并发」的临时建议不必再刻意保持。原厂侧同时确认 4K 输出与 `quality`（`low` / `medium` / `high`）恢复支持，出图与编辑两个端点均可用，按次计费 \$0.03 / 请求。

  📖 [查看详情](/live/2026-08/gpt-image-2-vip-speed-recovered)
</Update>

<Update label="2026/8/25 18:45" description="新模型" tags={["新模型"]}>
  🚀 **`bge-m3` 重新上线，\$0.01 / 1M tokens，同步发布一份实测调优文档** —— 智源开源的多语言向量模型，1024 维、8192 上下文、100+ 语种，单价是 `text-embedding-3-small` 的一半；实测中文检索质量同档、tokens 只用约 42%，两项叠加后同一批中文语料的实际花费约为 1/5。两个坑：相似度分数带比 OpenAI 整体高约 0.13，旧阈值必须重标；LangChain 接入要设 `check_embedding_ctx_length=False`，否则中文召回率会从 80% 掉到 15%。

  📖 [查看详情](/live/2026-08/bge-m3-relaunch)
</Update>

<Update label="2026/8/25 15:49" description="模型状态" tags={["OpenAI", "模型状态"]}>
  ⚠️ **`gpt-image-2-vip` 存在一定程度的饱和：429 请自行重试，内容安全拦截无需重试** —— 今天下午请求量偏高，非流式调用首字节耗时实测 82–190 秒；为避免客户被动等待过久，我们下调了网关侧的内部重试次数，把重试的选择权交回给你：429 属瞬时拥挤、重试通常即可通过，内容安全拦截是原厂内容策略判定、重试结果不会改变。重试时可继续用 `-vip`，也可用运行正常的官转 `gpt-image-2`。

  📖 [查看详情](/live/2026-08/gpt-image-2-vip-429-retry)
</Update>

<Update label="2026/8/25 00:45" description="模型状态" tags={["OpenAI", "模型状态"]}>
  ✅ **`gpt-image-2-vip` 已于 8 月 25 日 00:45 (UTC+8) 恢复正常** —— 昨晚 20:30 (UTC+8) 起的原厂侧风控与限速影响已结束，失败率与出图耗时回到日常水平，2K / 4K 与 `size` 精准控制均正常可用；对以 `-vip` 为主力的客户，我们一贯建议同时接上官转 `gpt-image-2` 作为备用通道做双通道切换，C 端产品也可把两个通道透出前台交由用户选择。

  📖 [查看详情](/live/2026-08/gpt-image-2-vip-recovered)
</Update>

***

> 📖 查看更早的动态请访问 [实时动态归档](/live/archive)，按月份、分类、厂商浏览历史动态。

<CardGroup cols={3}>
  <Card title="深度解读" icon="newspaper" href="/news/gemini-3-1-flash-lite-launch" horizontal>
    查看 AI风向标栏目
  </Card>

  <Card title="Telegram 频道" icon="telegram" iconType="brands" href="https://t.me/apiyinews" horizontal>
    适合全球用户
  </Card>

  <Card title="图片/视频模型" icon="images" href="/api-capabilities/image-video-models" horizontal>
    陆续上新
  </Card>
</CardGroup>
