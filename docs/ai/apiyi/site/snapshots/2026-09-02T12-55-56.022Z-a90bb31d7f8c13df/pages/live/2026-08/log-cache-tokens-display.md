> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 控制台日志新增缓存 tokens 明细，命中与写入一眼可见

> 日志列表的提示 tokens 一栏现在拆成三个数字：未走缓存的输入、绿色向下箭头为命中（读取缓存）、橙色向上箭头为写入缓存，鼠标悬停可看到精确数值。OpenAI、Claude 等支持缓存计费的模型，每一次调用命中了多少现在都能逐条核对。

**2026/8/21 11:39 (UTC+8)** · 服务通知 · OpenAI / Anthropic

📊 **控制台日志新增缓存 tokens 明细，命中与写入现在逐条可见**

日志列表原先只显示一个提示 tokens 总数，缓存命中要另外展开「缓存计费详情」才看得到。现在这一栏拆成三个数字：最上方是未走缓存的输入 tokens，绿色向下箭头是**命中（读取缓存）**的 tokens，橙色向上箭头是**写入缓存**的 tokens；鼠标悬停任一数字会显示精确值，例如「命中（读取缓存）：32,815 tokens」。

<Frame caption="日志列表新增的缓存 tokens 明细（绿色 ↓ 命中读取、橙色 ↑ 写入缓存）">
  <img src="https://mintcdn.com/apiyillc/ixpvMIHp9cVMdY-m/images/console-log-cache-tokens-column.png?fit=max&auto=format&n=ixpvMIHp9cVMdY-m&q=85&s=1c2a7ecfb9d884b7f63cc6969dd53144" alt="控制台日志列表：claude-sonnet-4-6 多条记录，提示 tokens 一栏显示未缓存输入、绿色向下 33.4K、橙色向上 542 三个数字" width="1754" height="1160" data-path="images/console-log-cache-tokens-column.png" />
</Frame>

<Frame caption="悬停显示精确数值：命中（读取缓存）：32,815 tokens">
  <img src="https://mintcdn.com/apiyillc/ixpvMIHp9cVMdY-m/images/console-log-cache-tokens-tooltip.png?fit=max&auto=format&n=ixpvMIHp9cVMdY-m&q=85&s=02a7c323427d0d381c6816e3a47be0db" alt="日志行悬停提示框，显示命中（读取缓存）：32,815 tokens" width="1218" height="358" data-path="images/console-log-cache-tokens-tooltip.png" />
</Frame>

对 OpenAI、Claude 这类按缓存分档计费的模型，这个改动让**计费口径可以逐条核对**：读取缓存的部分按缓存价计、写入缓存的部分按写入价计，两者与最右侧的实际扣费能直接对上。此前判断是否命中只能看「缓存计费详情」——API 响应里回显的 `usage` 缓存字段并不总是准确，现在列表页就能直接确认。

缓存本身的开启方式与命中条件不变，详见 [API易支持缓存计费吗？](/faq/cache-billing)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
