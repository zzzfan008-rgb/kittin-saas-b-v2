> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 接口错误信息留存指南

> API易 的错误只在接口响应体里返回一次，后台日志只记成功计费的调用。本页讲为什么必须自己打印原始错误、Python / Node.js / cURL 的正确捕获写法、ComfyUI 等封装工具怎么拿到原文、必须留存的 7 个字段，以及可直接复制的报障信息模板。

<Warning>
  ### 先说结论：错误原文只在响应体里出现一次

  API易 的错误信息**只通过接口响应体返回给你**。后台日志是**计费账本**——它记录的是成功产生扣费的调用，报错请求既不扣费、也不会出现在日志里。

  所以「后台日志里查不到」并不等于「没发生」，而是意味着**那次错误的唯一记录就在你的客户端**。你没把它打印下来、落到盘上，它就永久消失了——连我们也找不回来。
</Warning>

<Info>
  **一句话结论**：把接口返回的**原始响应体**原样打出来，不要只留你程序包装过的那一句话。`400 Bad Request` 这种字符串对定位问题的贡献接近于零，真正的答案在它下面被丢掉的那个 JSON 里。
</Info>

## 一个真实案例：400 Bad Request 说明不了任何问题

一位客户上报的原文只有一行：

```text theme={null}
apiyi GPT Image 2 2k: 400 Bad Request from POST https://api.apiyi.com/v1/images/edits
```

这行字符串是**客户端框架包装后的产物**。它保留了模型名、HTTP 方法、URL 和状态码，唯独把最关键的**响应体丢掉了**。支持侧能给出的最好回答只能是：

> 400 一般是内容安全和参数问题，大概率是内容安全。

这是**猜测**，不是结论。因为同一次调用，接口真正返回的响应体可能是下面三种中的任意一种，而它们对应三种完全不同的处理动作：

| 响应体里的 `error.message`                            | 真实原因                                       | 你该做什么                                                                       |
| ------------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------------------- |
| `Your request was rejected by the safety system` | 上游内容审核拦截                                   | 改提示词或换参考图。**不要重试**，重试一样会被拦；见[内容安全](/faq/content-safety)                     |
| `Invalid value for 'size': expected one of ...`  | 参数枚举值写错                                    | 代码级 bug，改参数即可，重试毫无意义                                                        |
| `invalid_image_file` / `Invalid input image`     | 参考图文件本身不合法（例如部分安卓手机拍出的 `.jpg` 实为 MPO 多帧格式） | 用 Pillow 之类重编码一次再传；见[图片 API 必读](/api-capabilities/image-api-best-practices) |

<Warning>
  **同一个 400，三种完全不同的处理动作。** 丢掉响应体，就是把「三选一」变成「靠猜」——猜错的代价是一轮无效的来回沟通，外加一次本来可以避免的重试。

  更要紧的是：**这三种情况里有两种根本不该重试**。分不清是哪一种，就只能盲目重试，白白消耗时间和额度。
</Warning>

## 后台日志能查到什么，查不到什么

这是最需要先建立的认知：**后台日志是计费账本，不是错误日志。**

| 你想查的信息        | 后台[日志页面](https://api.apiyi.com/log) | 接口响应                  |
| ------------- | ----------------------------------- | --------------------- |
| 本次调用的计费金额     | 有                                   | 无（`usage` 只给 token 数） |
| token 用量      | 有                                   | 有（`usage` 字段）         |
| 模型名、调用时间      | 有（仅成功调用）                            | 需要你自己记                |
| `request_id`  | 有（仅成功调用）                            | 响应头 `x-request-id`    |
| **错误码与错误原文**  | **没有**                              | **唯一来源**              |
| **上游拒绝的具体理由** | **没有**                              | **唯一来源**              |
| 失败的调用本身       | **不出现**（没扣费就不入账本）                   | —                     |

<Tip>
  **反过来用，这是排查断连类问题最有力的判据**：如果日志里**有**这条计费记录，说明请求确实到达了上游并产生了消耗；如果**没有**，那问题多半发生在到达上游之前（网络、鉴权、参数校验）。完整口径见[怎么看懂日志里的计费金额](/faq/log-billing-explained)。
</Tip>

## 必须留存的 7 个字段

排查一次报错需要的信息就这些。缺任何一项都会让排查退化成猜测：

| 字段                     | 怎么拿                                      | 缺了它会怎样                                                        |
| ---------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| **HTTP 状态码**           | `resp.status_code` / `err.status`        | 分不清是请求被拒（4xx）、服务端异常（5xx）还是压根没建连（无状态码）                         |
| **响应体全文**              | `resp.text` / `await resp.text()`        | **最致命的一项**——错误的真正原因全在这里，丢了就只能猜                                |
| **`x-request-id` 响应头** | `resp.headers.get("x-request-id")`       | 客服无法精确定位到那一次调用，只能按时间段模糊查                                      |
| **调用时间（带时区）**          | 客户端自己打，格式如 `2026-08-03 15:44 (UTC+8)`    | 我们的客户遍布全球，不写时区的时间点无法对齐日志                                      |
| **模型名 + 端点路径**         | 你自己的请求参数                                 | 同一个模型走不同端点（`/v1/images/edits` 与 `/v1/chat/completions`）行为并不相同 |
| **关键请求参数**             | `size`、`quality`、参考图张数与体积、`max_tokens` 等 | 参数类问题无法复现；图片类问题无法判断是不是素材本身的问题                                 |
| **客户端异常原文 + 已重试次数**    | `repr(e)`，以及每次尝试单独记一条                    | 客户端重试成功后日志里只剩一条漂亮的 200，你会永远看不到底层到底断了多少次                       |

<Note>
  **响应体不要截断。** 常规业务日志里截断到 200 字符是合理的，但排障场景下错误详情经常出现在末尾。至少保留前 2000 字符；图片类接口若担心 base64 刷屏，只在 `status_code >= 400` 时全量打印即可——错误响应体本来就不长。
</Note>

## 正确的错误捕获写法

核心原则只有一条：**分两层捕获，并且在任何一层都不要丢弃原始信息。**

* **传输层异常**：连接被重置、TLS 握手失败、超时、DNS 失败。此时**根本没有 HTTP 响应**，能留的只有异常原文。
* **HTTP 层错误**：服务端返回了 4xx / 5xx。此时**一定有响应体**，必须读出来。

### Python / requests

```python theme={null}
import time
import requests

BASE_URL = "https://api.apiyi.com/v1"
API_KEY = "sk-your-api-key"          # 生产环境请从环境变量读取


def call_and_log(path, payload, timeout=300):
    started = time.strftime("%Y-%m-%d %H:%M:%S %z")      # 带时区
    try:
        resp = requests.post(
            f"{BASE_URL}{path}",
            headers={"Authorization": f"Bearer {API_KEY}"},
            json=payload,
            timeout=timeout,
        )
    except requests.exceptions.Timeout as exc:
        # 传输层：超时，没有 HTTP 响应可读
        raise RuntimeError(f"[{started}] 请求超时 {timeout}s：{exc!r}") from exc
    except requests.exceptions.RequestException as exc:
        # 传输层：连接重置、SSL 错误、DNS 失败……同样没有响应体
        raise RuntimeError(f"[{started}] 传输层失败：{exc!r}") from exc

    if resp.status_code >= 400:
        # 关键：响应体原样带出，不要在这里改写成自己的措辞
        raise RuntimeError(
            f"[{started}] HTTP {resp.status_code} {path} "
            f"model={payload.get('model')}\n"
            f"x-request-id: {resp.headers.get('x-request-id')}\n"
            f"{resp.text}"
        )
    return resp.json()
```

<Warning>
  **不要在读响应体之前就 `raise_for_status()`。** 它抛出的 `HTTPError` 只带一句 `400 Client Error: Bad Request for url: ...`，正文原封不动地留在 `resp.text` 里没人去读——这正是本页开头那个案例的成因之一。要用它，也请先把 `resp.text` 取出来。
</Warning>

### Python / OpenAI SDK

官方 SDK 已经把三样东西都挂在异常对象上了，只是很多人只 `print` 了一句自己的中文提示：

```python theme={null}
from openai import OpenAI, APIStatusError, APIConnectionError

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    max_retries=3,      # SDK 内建指数退避，针对 429 / 5xx / 连接错误
    timeout=60.0,
)

try:
    resp = client.chat.completions.create(
        model="gpt-5.4",
        messages=[{"role": "user", "content": "Hello"}],
    )
except APIStatusError as e:
    # 服务端返回了 4xx/5xx：状态码、request-id、响应体三样都在这里
    print("HTTP 状态码 :", e.status_code)
    print("request-id  :", e.request_id)
    print("响应体原文  :", e.response.text)
    raise
except APIConnectionError as e:
    # 没拿到 HTTP 响应：连接被重置、超时、本地代理故障
    print("传输层失败  :", repr(e), "|", repr(e.__cause__))
    raise
```

<Tip>
  即便只写一行，也请写 `print(f"API 错误：{e}")` 而不是 `print("调用失败")`——SDK 异常的 `str(e)` 里**已经包含服务端返回的 message**。真正会丢信息的是把异常对象整个扔掉的那种写法。
</Tip>

### Node.js

用 SDK 时：

```javascript theme={null}
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-your-api-key',
  baseURL: 'https://api.apiyi.com/v1',
});

try {
  const resp = await client.images.edit({ /* ... */ });
} catch (err) {
  if (err instanceof OpenAI.APIError) {
    // 服务端返回了 4xx/5xx
    console.error('HTTP 状态码 :', err.status);
    console.error('request-id  :', err.requestID);
    console.error('响应体原文  :', JSON.stringify(err.error));
  } else {
    // 传输层：ECONNRESET、UND_ERR_* 等，此时没有 HTTP 响应
    console.error('传输层失败  :', err.code, err.message, err.cause);
  }
  throw err;
}
```

直接用 `fetch` 时，**这一步是最容易出事的地方**：

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
  method: 'POST',
  headers: { Authorization: 'Bearer sk-your-api-key' },
  body: form,
});

if (!resp.ok) {
  const raw = await resp.text();        // 必须先读 body，再抛错
  throw new Error(
    `HTTP ${resp.status} ${resp.url}\n` +
    `x-request-id: ${resp.headers.get('x-request-id')}\n${raw}`
  );
}
```

<Warning>
  本页开头那个 `400 Bad Request from POST https://api.apiyi.com/v1/images/edits`，字面上就等于 `${resp.status} ${resp.statusText} from ${resp.method} ${resp.url}` ——**响应体从头到尾没有被读取过**。

  `fetch` 在 HTTP 层面出错时**不会 reject**，`resp.ok` 为 `false` 而已；如果这时直接抛 `resp.statusText`，body 就随着响应对象一起被丢弃了。**在抛错之前先 `await resp.text()`**，这一行的差别就是能不能定位问题。
</Warning>

### cURL 复现

请客户复现时，给这条命令最省事——它把状态码、响应头、响应体、耗时一次性全带出来：

```bash theme={null}
curl -i -sS -X POST https://api.apiyi.com/v1/images/edits \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2" \
  -F "image=@input.png" \
  -F "prompt=把背景换成纯白" \
  -w '\n---\nHTTP %{http_code}  耗时 %{time_total}s\n'
```

* `-i` 打印响应头，`x-request-id` 就在里面；
* `-sS` 关掉进度条但保留错误输出；
* `-w` 在末尾附加状态码与总耗时，方便和超时配置对照。

## 封装工具与自研中台怎么办

### 一个正面例子

下面这条报错来自某位客户的 ComfyUI 节点：

```text theme={null}
上游 HTTP 0：OpenSSL SSL_read: Connection was reset, errno 10054
```

它比 `400 Bad Request` 难看得多，但**信息是完整的**，几秒钟就能定死方向：

| 片段                               | 含义                                                               |
| -------------------------------- | ---------------------------------------------------------------- |
| `HTTP 0`                         | 根本没拿到 HTTP 响应。`0` 是伪状态码，代表连响应行都没读到，不是 400/500 那种业务错误             |
| `SSL_read: Connection was reset` | 在 TLS 读阶段连接被对端或中间设备掐断                                            |
| `errno 10054`                    | Windows 的 `WSAECONNRESET`，等价于 Linux 的 `ECONNRESET`，表示收到了 TCP RST |

结论直接就出来了：这是**传输层**问题，与内容安全、与参数统统无关，也不会产生计费（请求根本没完成）。排查路径见[图片 API 连接中断排查](/api-capabilities/image-connection-drops)。

<Info>
  **对比一下**：一个是包装得很干净但什么也说明不了的 `400 Bad Request`，一个是又长又丑但直接指向根因的 `errno 10054`。**排障场景下，原始、难看、完整的错误远胜于友好、简洁、被改写过的错误。**
</Info>

### 常见工具去哪里找原文

| 工具                     | 原始错误在哪                                                         |
| ---------------------- | -------------------------------------------------------------- |
| ComfyUI                | 节点上的红字通常是截断版；完整堆栈在**启动 ComfyUI 的那个终端窗口**，或安装目录下的 `comfyui.log` |
| Dify / Coze / n8n      | 工作流运行记录里展开该节点的「运行详情 / 输出」，看原始 HTTP 响应而不是节点的错误摘要                |
| LangChain / LlamaIndex | 捕获 `openai.APIStatusError` 而不是笼统的 `Exception`，参见上面的 SDK 写法     |
| 各类桌面客户端                | 打开设置里的调试 / 开发者日志开关，或用 `curl` 复现一次                              |

### 自研中台的三条原则

<Steps>
  <Step title="透传，不要改写">
    中间层可以**追加**上下文（哪个业务、哪个租户、第几次重试），但不能**替换**上游返回的 `error.message`。一旦改写，原文就没有第二个地方可以找回。
  </Step>

  <Step title="面向用户的提示和面向开发的原文分开存">
    参考 [Gemini 图片错误处理](/api-capabilities/gemini-image-error-handling) 里的三分结构：`userMessage`（给终端用户看的友好文案）、`devMessage`（给开发看的判定结论）、`rawResponse`（原始响应体，一字不改）。前两个可以随便润色，第三个必须原样入库。
  </Step>

  <Step title="永远不要出现「未知错误」">
    走到兜底分支时，把 `status`、`x-request-id` 和响应体前 2000 字符一并记下来。一个带着原文的「未分类错误」是可排查的；一句干净的「未知错误」不是。
  </Step>
</Steps>

## 反面清单：这些写法会让问题无法排查

* `except Exception as e: print("调用失败")` —— 异常对象整个被丢掉，连是哪一层的问题都不知道；
* 只记 HTTP 状态码，不记响应体 —— 就是本页开头那个案例；
* `raise_for_status()` 之前不读 `resp.text` —— 正文还在内存里，就是没人取；
* `fetch` 里 `if (!resp.ok) throw new Error(resp.statusText)` —— body 随响应对象一起被扔了；
* 客户端重试成功后只留一条漂亮的 200 —— **把每次尝试单独记一条**，否则你永远看不到底层断了多少次，还容易把自己的重试误读成渠道行为；
* 日志只打屏不落盘、或按天覆盖 —— 等客户反馈到你这里时，原始记录往往已经滚没了；
* 报障时只发一张手机拍的屏幕照片 —— 请直接复制**文本**，截图里的错误经常正好被裁掉半行。

## 什么时候找客服

先自己走完上面的留存与判读，如果满足下面**任一条**，就带着材料找客服核查：

* 拿到了完整响应体，但 `error.message` 指向上游方向（`upstream_error`、上游 5xx 原文、渠道明确报错）；
* 同一份请求参数**换个模型或换个时间段就正常**，只有某个特定模型稳定失败；
* 报错是 `500` + `write_response_body_failed` 这类下行链路问题，且**稳定复现**（这类不计费，排查方法见[连接中断排查](/api-capabilities/image-connection-drops)）；
* 你怀疑计费与实际调用对不上——这时 `request_id` 是唯一能精确对账的锚点。

### 报障信息模板（可直接复制）

```text theme={null}
【问题描述】调用 gpt-image-2 图片编辑接口稳定返回 400
【接口端点】POST https://api.apiyi.com/v1/images/edits
【模型名称】gpt-image-2
【调用时间】2026-08-03 15:44 (UTC+8)
【request-id】从响应头 x-request-id 复制
【HTTP 状态码】400
【响应体原文】
{"error":{"message":"...","type":"...","code":"..."}}
【关键参数】size=2048x2048, quality=high, 参考图 1 张 / 3.2 MB / PNG
【复现情况】连续 5 次调用 5 次失败；换一张参考图后恢复正常
【已排查】Key 有效、余额充足、同一个 Key 调用文本模型正常
```

<Card title="企业微信客服" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

  扫码添加，或点击本卡片联系企业微信客服。

  也可通过 Telegram `@apiyi001` 或邮箱 `hi@apiyi.com` 联系我们。
</Card>

<Tip>
  把上面模板里的内容**以文本形式**发过来，比任何描述都高效。有 `request_id` 时我们能直接定位到那一次调用的完整链路，不必再问「大概几点调用的什么模型」。`request_id` 的查询方法见[如何查看我的调用记录](/faq/call-logs)。
</Tip>

## 相关文档

<CardGroup cols={3}>
  <Card title="API 手册" icon="book" href="/api-manual">
    常见错误码对照表、认证方式与速率限制
  </Card>

  <Card title="连接中断排查" icon="unplug" href="/api-capabilities/image-connection-drops">
    `ECONNRESET`、`errno 10054`、SSL EOF 这类传输层报错的完整排查路径
  </Card>

  <Card title="查看调用记录" icon="file-text" href="/faq/call-logs">
    在控制台日志页查每次调用，`request_id` 怎么找、怎么对账
  </Card>

  <Card title="看懂日志计费金额" icon="receipt" href="/faq/log-billing-explained">
    为什么失败调用不进日志，以及「有无计费记录」这条判据怎么用
  </Card>

  <Card title="超时怎么配置" icon="hourglass" href="/faq/timeout-configuration">
    各类模型的 timeout 分档、已调大仍超时的逐层排查
  </Card>

  <Card title="图片 API 必读" icon="book-check" href="/api-capabilities/image-api-best-practices">
    同步调用、base64 前缀差异、`400 invalid_image_file` 的图片预处理
  </Card>
</CardGroup>
