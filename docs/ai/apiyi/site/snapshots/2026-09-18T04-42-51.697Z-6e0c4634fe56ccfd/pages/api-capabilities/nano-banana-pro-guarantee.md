> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro 出图失败包补计划

> API易 针对按次计费的 Nano Banana Pro 推出出图失败包补计划：因谷歌风控导致的非主观出图失败，按条数核算后补发额度。

## 计划简介

为了更好地服务客户，API易 推出 **Nano Banana Pro 出图失败包补计划**。

<Info>
  保障模型仅为**按次计费的 Nano Banana Pro**。Nano Banana 2 可选择**按量计费**的令牌，失败的调用计费极少、可忽略。
</Info>

当请求返回**状态码 200 但出图失败**时，这是谷歌侧的反馈，API易 透明代理只是直接转发结果——我们同样希望客户成功出图。本计划即针对这类**非主观原因**导致的失败进行额度补发。

## 什么情况下 Nano Banana Pro 不出图？

谷歌的内容风控策略在持续收紧，常见触发拒绝的情形：

* **内容安全**：NSFW、未成年人相关内容
* **去水印**：较为特殊的一类
* **知名 IP**（2026 年 1 月 23 日新增）：如迪士尼等——谷歌疑似调整了新的风控政策
* **更严格的安全机制**（2 月 27 日，Nano Banana 2 上线后）：知名人物、金融/订单信息修改、人物换装/换脸、隐性 Sex 等，均会返回文案报错，类似「我不能完成 xxx 的修改」

## 出图失败的表现特征

<CardGroup cols={2}>
  <Card title="日志输出 Tokens 少于 1000" icon="triangle-alert">
    谷歌返回一段文字，例如：「我无法协助完成这个工作」 / `I'm just a language model and can't help with that.`
  </Card>

  <Card title="日志输出 Tokens 为空" icon="ban">
    直接拒绝出图，报错为空。接口数据中关键指标为 `"candidatesTokenCount": 0`
  </Card>
</CardGroup>

<Frame caption="日志列表：「补全」（输出 Tokens）列出现 100~200 等极小值，即为出图失败的调用">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-pro-guarantee-failure-example.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=6cf66f9f67eeca2b89255d9287c4ae7c" alt="日志列表，gemini-3-pro-image-preview 模型的补全 Tokens 列出现 173、176 等极小值，标记为出图失败" width="938" height="860" data-path="images/nano-banana-pro-guarantee-failure-example.png" />
</Frame>

## 为什么失败仍会扣费？

* 谷歌会扣配额：不修改提示词反复请求，会浪费谷歌的 RPD 配额
* 系统暂时做不到「输出为空即不扣费」
* 违规内容请求更容易导致我们的官方 KEY 被封——这是不可挽回的损失

## 如何参与？

面向客户范围：

1. 每月消耗 **1000 美金起**（不限站内模型）——门槛定得很低，小额度测试、自用出现失败的概率也不高
2. 面向**工具服务商**：因为客户侧并不好控制用户的输入内容
3. 仅限**非主观原因**：恶意请求相同/相似的违规内容，拒绝补发
4. 时间范围：**5 月 1 日 (UTC+8) 起**
5. 陆续沟通，加入我们内部名单登记

## 如何补发？

进入**日志**栏目，点击右上角的【导出】，选择时间范围（比如上个月），选择【异步导出】；提交后在顶部导航菜单的【异步任务】中查看进度，并下载最终的 Excel 数据结果。

<Frame caption="日志栏目右上角的【导出】按钮">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-pro-guarantee-export-logs.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=233889ab4fdb3740a726f77ff2fc84bd" alt="日志栏目工具栏，右上角导出按钮被高亮标记" width="1284" height="296" data-path="images/nano-banana-pro-guarantee-export-logs.png" />
</Frame>

**补发额度**：统计出具体的失败条数，按 `条数 × 模型价格 / 折扣系数` 进行补发（例如充值赠送 15%，则除以 1.15）。

**补发时间**：每个月底统计上个月的数据，大概在**下月初的 5 个工作日内**补发到账。
