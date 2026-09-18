> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 模型调用报错怎么排查？

> 从参数错误、鉴权失败、429、5xx、超时、资源耗尽到分组不匹配，快速定位模型调用问题。

## 简短回答

不要只根据 HTTP 状态码判断原因。先保存完整错误信息、模型名、Base URL、令牌分组和 request ID，再区分这是**请求配置错误**还是**上游临时故障**：

* `400`、`401`、`403`、参数不支持、安全拦截和分组不匹配，通常需要修改请求或配置，重复重试不会解决问题。
* `429`、`503`、部分 `504` 和 `Upstream model timed out` 可能与上游负载、资源或长请求有关，应先检查日志，再使用有限次数的指数退避重试。
* 如果只有某个模型或分组异常，可以测试该模型的兜底分组；如果多个模型同时异常，应优先检查 API Key、Base URL 和网络链路。

## 先记录完整错误信息

截图往往会截掉最有用的字段。排查前请保留以下信息：

| 信息         | 示例                            | 用途           |
| ---------- | ----------------------------- | ------------ |
| HTTP 状态码   | `400`、`401`、`429`、`503`       | 判断错误的大类      |
| 错误消息与 code | `Unsupported parameter: stop` | 判断是否为确定性请求错误 |
| 模型与分组      | `gpt-5.6-luna`、`Default`      | 判断模型或通道范围    |
| Base URL   | `https://api.apiyi.com/v1`    | 排查地址和节点配置    |
| request ID | 响应中的请求标识                      | 方便后台定位       |
| 发生时间       | 建议注明时区                        | 对照上游和调用日志    |
| 日志记录       | 是否出现消费记录                      | 判断是否已经进入生成流程 |

<Warning>
  请勿在工单、截图或代码中公开完整 API Key。提交错误信息时，只保留错误消息、request ID 和脱敏后的配置。
</Warning>

## 按错误类型排查

| 错误现象                                       | 常见原因                           | 首要处理方式                                  |
| ------------------------------------------ | ------------------------------ | --------------------------------------- |
| `400` 或 `Unsupported parameter`            | 当前模型不支持请求参数，例如部分轻量模型不支持 `stop` | 删除不支持的参数，先用最小请求验证；不要重复重试                |
| `401 Invalid token` 或 `403`                | API Key、Base URL、令牌状态或分组权限不匹配  | 先核对 API Key 与 Base URL，再检查令牌分组和模型权限     |
| `429`                                      | 并发过高、上游负载饱和，也可能被错误消息掩盖了真实参数问题  | 查看完整错误消息，降低并发并指数退避；长期出现时检查配额和分组         |
| `503` 或 `Service unavailable`              | 服务暂时不可用、上游资源不足或当前分组没有可用渠道      | 等待片刻后有限次数重试，必要时切换已授权的兜底分组               |
| `504` 或 `Upstream model timed out`         | 上游处理时间过长、上游资源波动或请求链路超时         | 检查调用日志和客户端 timeout；确认没有使用不适合长请求的 CDN 节点 |
| `RESOURCE_EXHAUSTED`                       | 上游算力或并发资源暂时不足                  | 降低并发、等待资源恢复，或使用其他可用分组/模型                |
| `rejected by the safety system`、`NO_IMAGE` | 请求触发了上游内容安全策略                  | 修改提示词和输入内容；不要原样重复提交                     |
| 模型不可用或分组不匹配                                | 令牌未选择对应分组、模型白名单限制或模型名不正确       | 检查令牌的选择分组、兜底分组和可用模型设置                   |

<Info>
  同一个状态码可能对应不同原因。例如，`429` 既可能是上游负载饱和，也可能只是错误消息没有直接显示参数不兼容。最终判断应以完整响应和调用日志为准。
</Info>

## 标准排查步骤

<Steps>
  <Step title="第一步：复制最小请求">
    暂时移除可选参数、工具定义、复杂图片输入和超长提示词，只保留模型、必要消息和认证信息。这样可以判断问题来自请求参数，还是来自模型通道。
  </Step>

  <Step title="第二步：核对地址、令牌和分组">
    确认 API Key 与 `api.apiyi.com` 的 Base URL 配套使用，并在控制台检查令牌的选择分组、兜底分组和可用模型。不同模型可能需要不同的专属分组。
  </Step>

  <Step title="第三步：判断是否适合重试">
    对 `429`、`503` 和确认属于临时上游故障的错误，使用逐步增加间隔的重试策略。对参数错误、安全拦截、模型名错误和分组不匹配，先修改请求或配置，不要原样重试。
  </Step>

  <Step title="第四步：检查 timeout 和网络链路">
    图片生成、推理模型和长文本任务需要更长的 timeout。长请求建议使用 `api.apiyi.com` 或 `vip.apiyi.com`，不要使用有约 100 秒限制的 `api-cf.apiyi.com` CDN 节点。
  </Step>

  <Step title="第五步：查看调用日志后再决定是否补发">
    检查请求是否产生消费记录。客户端 timeout 或上游已经开始生成的请求，可能在客户端断开后仍然计费；确认状态前不要盲目重复提交。
  </Step>
</Steps>

## 最小请求测试示例

下面的请求只用于验证地址、令牌和基本模型调用是否正常。请将 `YOUR_MODEL` 替换为令牌实际可用的模型，并不要额外添加未经确认支持的参数。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "YOUR_MODEL",
    "messages": [
      {"role": "user", "content": "请回复：测试成功"}
    ]
  }'
```

## 如何避免重复报错

* 先用最小请求跑通，再逐项加入 `stop`、工具调用、推理强度、图片和其他可选参数。
* 为不同模型维护参数兼容表，不要假设所有模型都支持同一组参数。
* 遇到 `429` 不要立即并发重发，使用指数退避并控制单模型并发。
* 图片和推理请求使用足够大的 timeout；SDK 自带重试时，避免与业务层重试叠加。
* 为重要模型配置经过实际验证的兜底分组，并定期用真实业务参数测试。

## 常见问题

<AccordionGroup>
  <Accordion title="429 一定代表并发超限吗？">
    不一定。`429` 可能来自并发或上游负载，也可能是某些模型的错误消息没有直接显示参数兼容性问题。请先查看完整的 `error.message`，再决定是降低并发还是修改请求。
  </Accordion>

  <Accordion title="遇到 401 就一定要重新生成令牌吗？">
    不一定。先确认请求使用的是 API易 的 Base URL，并检查令牌是否过期、是否选择了正确分组。如果只有某个模型出现 `Invalid token`，同时伴随 5xx 或超时，问题也可能来自该模型的上游通道。
  </Accordion>

  <Accordion title="请求超时后可以直接重试吗？">
    先查看调用日志。客户端 timeout 只代表客户端停止等待，不一定代表服务端停止处理；如果请求已经产生消费记录，直接重试可能造成重复调用。
  </Accordion>

  <Accordion title="错误请求会扣费吗？">
    不能只凭错误页面判断。没有进入模型生成阶段的参数校验、鉴权或安全拦截通常不会产生最终消费，但客户端主动断开、上游已开始处理或已返回结果的请求可能仍然计费，请以调用日志为准。
  </Accordion>
</AccordionGroup>

## 仍然无法解决？联系我们

如果按照上述步骤仍然无法恢复，请通过企业微信或邮件联系 API易 客服。为了加快定位，请一并提供：

* 模型名称、令牌分组和 Base URL
* 完整错误消息、HTTP 状态码和 request ID
* 问题发生时间（请注明 `UTC+8`）
* 最小化后的请求示例或脱敏后的请求体
* 调用日志中是否存在消费记录

<Warning>
  请勿发送完整 API Key。可以保留 Key 的前缀和后几位，其余内容请打码。
</Warning>

<CardGroup cols={2}>
  <Card title="企业微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    扫码添加，或点击本卡片直接联系客服。

    模型报错、超时、分组和计费排查
  </Card>

  <Card title="邮件咨询" icon="mail">
    **客服邮箱**：[support@apiyi.com](mailto:support@apiyi.com)

    邮件标题建议包含「模型报错 + 模型名称」。
  </Card>
</CardGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="为什么提示 API Key 无效？" icon="key" href="/faq/invalid-api-key">
    检查 Base URL、API Key 和基本鉴权配置
  </Card>

  <Card title="什么是分组？" icon="layers" href="/faq/groups-explained">
    了解令牌分组、上游通道和兜底分组
  </Card>

  <Card title="如何避免接口超时？" icon="timer" href="/faq/timeout-configuration">
    配置 timeout、节点和长请求排查方法
  </Card>

  <Card title="API 可以开多少并发？" icon="gauge" href="/faq/api-concurrency">
    查看模型并发限制和 429 处理建议
  </Card>

  <Card title="网站或接口返回 502 怎么办？" icon="server-crash" href="/faq/website-502-error">
    了解 5xx 错误、重试和计费判断
  </Card>

  <Card title="怎么看懂日志里的计费金额？" icon="file-text" href="/faq/log-billing-explained">
    通过调用日志确认请求是否计费
  </Card>
</CardGroup>
