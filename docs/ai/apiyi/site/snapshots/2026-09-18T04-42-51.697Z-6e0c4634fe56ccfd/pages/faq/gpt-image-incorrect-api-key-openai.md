> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 用 Codex 接 GPT-Image 出图，报密钥认证失败怎么办？

> Codex 接 gpt-image-2.5 出图报 Incorrect API key：错来自 OpenAI，请求没到 API易。三条解法：装 Skills、丢提示词、网页出图。

## 典型报错

```text theme={null}
秘钥认证失败
Incorrect API key provided: sk-xxxx****************************A6Af.
You can find your API key at https://platform.openai.com/account/api-keys.
（请求 ID：req_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx）
```

<Info>
  **一句话结论**：这条错是 **OpenAI 官方服务器**返回的，不是 API易 返回的。你的代码目前请求的是 `api.openai.com`，API易 的 Key 自然会被 OpenAI 拒绝。**Key 没坏，是请求地址没改。**
</Info>

## 怎么判断请求没到 API易

两个特征，看到任意一个就能确定：

| 特征                                                  | 说明                                                          |
| --------------------------------------------------- | ----------------------------------------------------------- |
| 报错里让你去 `platform.openai.com/account/api-keys` 找 Key | 这是 OpenAI 的标准 `invalid_api_key` 文案，API易 的报错不会引导你去 OpenAI 官网 |
| 请求 ID 是 `req_` 开头的 32 位串                            | OpenAI 的请求 ID 格式。API易 的日志里查不到这条记录，因为请求从未到达                  |

<Note>
  这个问题在「让 AI 编程助手写接入代码」时格外常见：Codex、Cursor、Claude Code 等看到 `gpt-image-2.5` 这个模型名，默认会按 OpenAI 官方 SDK 的写法生成代码，`base_url` 用的是 SDK 的默认值 `https://api.openai.com/v1`。你填进去的 Key 是 API易 的，两边对不上。
</Note>

## 三条解法，按你的情况选

<Tabs>
  <Tab title="① 会用 Codex / 编程 Agent：装 Skills 让它接">
    最省事的做法是让 Agent 先「学会」API易 再写代码，有两个层级的技能包可选：

    <Steps>
      <Step title="整站技能包（推荐先装）">
        让你的 Agent 运行下面这条命令安装 API易 技能包；跑不通就让它直接读 `https://docs.apiyi.com/skill.md`：

        ```bash theme={null}
        npx skills add https://docs.apiyi.com
        ```

        这份文件专门写给 AI 看：Base URL、认证方式、模型命名规则、常见坑一应俱全。装完再让它写代码，`base_url` 就会自动指向 `https://api.apiyi.com/v1`。
      </Step>

      <Step title="GPT-Image 专用出图技能">
        [GPT-Image-2.5 / 2 系列 Agent 技能](/api-capabilities/gpt-image-2/skills) 页提供一个开箱即用的 Skill：两个文件、一个脚本，覆盖 `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2` 等六个模型，用 `--model` 切换，文生图、多图融合、局部重绘都能做。

        放进 Codex、OpenClaw、Claude Code 等任意能执行命令行的编码 Agent，对它说一句「帮我出一张……」即可，不需要你自己碰 Base URL。
      </Step>
    </Steps>

    <Tip>
      其它出图 / 视频模型也各有一页「Agent 技能」，都挂在对应模型的文档目录下。文档站左侧导航里找到模型，看有没有名为「Agent 技能」的子页即可。
    </Tip>
  </Tab>

  <Tab title="② 不会写代码：把提示词丢给 AI">
    不想理解 Skill 是什么，也可以直接把我们写好的**接入提示词**复制给 Codex、Claude Code、Cursor 等 AI：

    1. 打开 [GPT-Image-2.5 / 2 系列总览](/api-capabilities/gpt-image-2/overview)
    2. 找到「让 AI Agent 帮你接入」一节，点提示词右上角的复制按钮
    3. 原样粘贴给你的 AI 编程助手

    这段提示词里已经写死了 `base_url` 用 `https://api.apiyi.com/v1`、Key 从环境变量 `APIYI_API_KEY` 读，还预先挡掉了超时、base64 渲染、上传压缩、质量参数几个高频坑。AI 会先抓文档页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码。

    <Note>
      每个出图 / 视频模型的总览页都有这样一段提示词，不止 GPT-Image。更通用的三条路（聊天 Agent、命令行、编程 Agent）见 [AI 开发者套件](/developer-kit)。
    </Note>
  </Tab>

  <Tab title="③ 不想接入：直接网页出图">
    只是想出图、暂时不需要接进自己的程序，可以完全绕开代码：

    1. 在 API易 后台「令牌」页复制一个 Key
    2. 打开 `imagen.apiyi.com`，填入这个 Key
    3. 选择 `gpt-image-2.5-flare`（文生图）或 `gpt-image-2.5-sunburst`（改图）直接出图

    网页端用的就是同一个 Key、同一套接口，费用也从同一个账户余额扣。等后续要接进程序，再回到前两条路。
  </Tab>
</Tabs>

## 自己改代码：只改一行

如果你已经有一段 Codex 生成的代码，最小改动是给客户端加上 `base_url`，其它一律不动：

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="sk-your-apiyi-key",
      base_url="https://api.apiyi.com/v1",  # ← 加上这一行
  )

  result = client.images.generate(
      model="gpt-image-2.5-flare",
      prompt="一只戴着宇航员头盔的柴犬，赛博朋克风格",
      size="1024x1024",
      quality="medium",
  )
  ```

  ```javascript Node.js theme={null}
  import OpenAI from "openai";

  const client = new OpenAI({
    apiKey: "sk-your-apiyi-key",
    baseURL: "https://api.apiyi.com/v1", // ← 加上这一行
  });

  const result = await client.images.generate({
    model: "gpt-image-2.5-flare",
    prompt: "一只戴着宇航员头盔的柴犬，赛博朋克风格",
    size: "1024x1024",
    quality: "medium",
  });
  ```

  ```bash 环境变量 theme={null}
  # 不改代码，用环境变量覆盖 SDK 默认地址
  export OPENAI_API_KEY="sk-your-apiyi-key"
  export OPENAI_BASE_URL="https://api.apiyi.com/v1"
  ```
</CodeGroup>

改完用这条命令验证请求确实到了 API易，能返回模型列表就对了：

```bash theme={null}
curl https://api.apiyi.com/v1/models \
  -H "Authorization: Bearer sk-your-apiyi-key"
```

## 常见追问

<AccordionGroup>
  <Accordion title="我明明改了 base_url，为什么还报同样的错？">
    按顺序排查：

    1. **多处配置**：Codex 生成的项目常常同时有 `.env`、配置文件、代码初始化三处地方，只改了一处，另一处仍是默认值
    2. **环境变量优先**：`OPENAI_BASE_URL` 若在系统里已经设成了别的值，会覆盖代码里没写的那一项；用 `echo $OPENAI_BASE_URL` 看一眼
    3. **改完没重启**：进程仍在跑旧配置
    4. **拼写**：`apiyi`，不是 `apiyii` 或 `apiyl`

    最简单的自证方法：看报错。只要还出现 `platform.openai.com`，请求就还在打 OpenAI。
  </Accordion>

  <Accordion title="Codex 说它已经按 API易 写了，但报错没变，怎么回事？">
    把报错原文连同这一页一起发给它。每个文档页右上角都有「复制页面」按钮，把页面内容 + 报错一起贴给 AI，它就能对照着定位是哪一处配置没生效。这是最快的排错路径。
  </Accordion>

  <Accordion title="到了 API易 之后如果再报 Key 无效呢？">
    那才轮到查 Key 本身：登录后台「令牌」页确认该 Key 状态为「启用」、余额充足、没有限制模型白名单。完整排查见 [为什么提示 API Key 无效？](/faq/invalid-api-key)。
  </Accordion>

  <Accordion title="gpt-image-2.5 该用哪个模型名？">
    文生图默认 `gpt-image-2.5-flare`，改图 / 局部重绘用 `gpt-image-2.5-sunburst`，两款同价同参数。走量要便宜可以用官逆 `gpt-image-2.5-all`。六个模型的取舍见 [GPT-Image 系列 Agent 技能](/api-capabilities/gpt-image-2/skills) 页的对比表。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="为什么提示 API Key 无效？" icon="key" href="/faq/invalid-api-key">
    Base URL 与 Key 一一对应的完整原理与各语言示例。
  </Card>

  <Card title="Base URL 怎么填？" icon="link" href="/faq/base-url-config">
    OpenAI 加 /v1、Claude 填根域名、Gemini 加 /v1beta。
  </Card>

  <Card title="有没有一键对接功能？" icon="plug" href="/faq/one-click-integration">
    把文档交给 AI 编程助手，让它替你完成对接。
  </Card>

  <Card title="GPT-Image-2.5 / 2 系列总览" icon="sparkles" href="/api-capabilities/gpt-image-2/overview">
    参数、价格、接入提示词与常见报错。
  </Card>
</CardGroup>
