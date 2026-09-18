> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 实时动态

> API易模型状态、行业快讯、服务动态实时更新

<Update label="2026/9/18 11:19" description="文档更新" tags={["ByteDance", "文档更新"]}>
  📚 **Seedance 图片链接浏览器能打开，提交却报 `invalid image format`？问题在链接，不在图片** —— 限次下载、不支持 `Range`、有效期短的业务接口链接，原厂抓图时拿到的是报错而不是图片。新 FAQ 说明三种传法怎么选（公网直链优先），并附 curl 自查方法，见 [图片链接能打开却报格式错误](/faq/seedance-image-url-invalid-format)。

  📖 [查看详情](/live/2026-09/seedance-image-url-invalid-format)
</Update>

<Update label="2026/9/17 19:47" description="文档更新" tags={["ByteDance", "文档更新"]}>
  📚 **Seedance 2.5 传了具体画幅和时长却报 400？多半是任务被判成了视频编辑** —— 带参考视频时，2.5 按提示词意图判定参考生视频 / 视频编辑 / 视频延长，编辑任务要求 `ratio` 为 `adaptive`、`duration` 为 `-1`，且没有参数能锁定为参考生视频。新 FAQ 给出判定规则与三种稳妥写法，见 [参考生视频和视频编辑怎么区分？](/faq/seedance2-reference-vs-edit)。

  📖 [查看详情](/live/2026-09/seedance2-reference-vs-edit)
</Update>

<Update label="2026/9/17 18:00" description="模型状态" tags={["OpenAI", "模型状态"]}>
  ✅ **`gpt-image-2.5-sunburst` / `gpt-image-2.5-flare` 于 9/17 15:30–16:00 (UTC+8) 的出图失败已恢复正常** —— 这段时间部分请求返回 `Upstream model service error. Try again later.`，原因是后端资源波动，不是参数错误，也不是内容安全拦截；无需修改代码或提示词，当时失败的任务直接重新提交即可。

  📖 [查看详情](/live/2026-09/gpt-image-2-5-upstream-error-recovered)
</Update>

<Update label="2026/9/16 01:10" description="服务通知" tags={["xAI", "服务通知"]}>
  🔒 **Grok Imagine 图片模型已完成接入，但默认不对外开放，需申请开通 `Grok_imagine` 专属分组** —— `grok-imagine-image` / `grok-imagine-image-quality` 的内容安全策略与平台其它模型差异较大、部分类别不作过滤，为避免合规风险改为定向开放：累计消费满 \$1,000 的存量客户联系客服说明用途即可开通，其他客户通过[企业微信客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)提交申请，说明使用场景与内容管控措施。令牌未开通时调用固定返回 `503`，是权限问题不是故障。

  📖 [查看详情](/live/2026-09/grok-imagine-image-restricted-access)
</Update>

<Update label="2026/9/15 17:09" description="模型状态" tags={["OpenAI", "模型状态"]}>
  ⚠️ **`gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip` 两款逆向仍缺资源、暂不可用；`gpt-image-2-vip` 正常服役、运行稳定** —— 需要 GPT Image 2.5 请走官转 `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`（不带 `-vip`），官转按 token 用量计费而非按次，按 [文档](/api-capabilities/gpt-image-2/overview) 接入即可；对 `size` 与 2K / 4K 没有强控需求时，ChatGPT 网页版逆向 `gpt-image-2.5-all` 也正常可用。

  📖 [查看详情](/live/2026-09/gpt-image-2-5-vip-supply-gap)
</Update>

<Update label="2026/9/15 01:11" description="文档更新" tags={["OpenAI", "文档更新"]}>
  🧩 **社区 ComfyUI 节点 `Comfyui-Luck-gpt2.0` 已支持 `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`，本站文档页已同步重写** —— 作者 luckdvr 9/10 更新：官转节点 `model (模型)` 下拉新增两款 2.5 与日期快照，`quality` 扩到六档（新增 `xhigh` / `max`），支持 16 张参考图与 mask 重绘；节点名与默认模型不变，已有工作流不会自动切换，切 2.5 别照搬 `quality`（2.5 `high` ≈ 旧 `medium`）。文档页补齐 `gpt-image-2-vip` 节点、三个提示词控制节点与五模型对照表，见 [Luck GPT-Image 2 - ComfyUI 节点](/scenarios/ecosystem/luckgpt2-comfyui)。

  📖 [查看详情](/live/2026-09/luck-gpt-image-2-comfyui-gpt-image-2-5)
</Update>

<Update label="2026/9/14 23:56" description="文档更新" tags={["OpenAI", "文档更新"]}>
  📚 **出图报 400 `safety_violations=[sexual]` 但提示词并不色情？多数是成图被输出侧分类器拦下，不是提示词违规** —— 实测 `gpt-image-2.5-sunburst` 失败耗时与成功一样长，同一提示词时过时不过，`moderation: low` 对它无效；网页版能过是因为对话模型先替你改写补全了服装、场景。用分词消融法 20 次调用定位到触发词，原句只加一句服装描述即 3/3 通过。完整案例与排查清单见新页 [内容安全排查篇](/api-capabilities/image-safety-troubleshooting)。

  📖 [查看详情](/live/2026-09/image-safety-troubleshooting)
</Update>

<Update label="2026/9/14 13:30" description="新模型" tags={["OpenAI", "Alibaba", "新模型"]}>
  🚀 **4 款 Realtime 实时语音模型结束内测正式上架，令牌勾选默认分组即可直接调用，欢迎测试、体验与对接** —— `gpt-realtime-2.1` / `-mini`（OpenAI GA 协议）与 `qwen3.5-omni-plus-realtime` / `-flash-realtime`（百炼协议）共用 `wss://api.apiyi.com/v1/realtime` 一条端点，default / VIP / SVIP 分组均已挂载，按厂商官方价逐 token 计费，9/14 复测 40 路并发 120/120 成功。缓存读暂按全价、只支持 WebSocket，字段对照与已知限制见 [Realtime 语音概览](/api-capabilities/realtime/overview)，文档缺漏欢迎反馈。

  📖 [查看详情](/live/2026-09/realtime-models-launch)
</Update>

<Update label="2026/9/12 16:25" description="文档更新" tags={["Anthropic", "文档更新"]}>
  📚 **长文输出（漫剧脚本、万字创作）用流式，别用非流式** —— 大模型出万字长文真实生成 10～20 分钟是常态，非流式要整段攒齐才回写、客户端 read timeout 与之竞速容易拿不到结果；改用流式后每隔几十秒必有数据事件（实测思考阶段最大静默约 42 秒且有 keepalive），read timeout 按事件间隔设 90～120 秒即可，`max_tokens` 给足并以 `stop_reason=end_turn` 为准。

  📖 [查看详情](/live/2026-09/long-form-output-practices)
</Update>

<Update label="2026/9/12 14:32" description="服务通知" tags={["服务通知"]}>
  ⚠️ **个人中心新增「登录设备」功能，升级前已登录的用户可能看到 403 提示，退出重新登录即可** —— 9/12 系统升级后，旧的登录会话在新功能下校验失败，打开个人中心会弹出 `错误：AxiosError: Request failed with status code 403`。这只影响个人中心页面，不影响 API 调用、Key 与余额。在当前浏览器退出账号再重新登录，提示即消失。

  📖 [查看详情](/live/2026-09/console-login-devices-403)
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
