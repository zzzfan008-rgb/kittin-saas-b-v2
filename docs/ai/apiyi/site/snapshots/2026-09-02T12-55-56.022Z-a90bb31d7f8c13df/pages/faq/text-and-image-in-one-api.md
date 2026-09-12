> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 有没有既能输出文本、又能生成图片的对话式 API？

> 「能看图」和「能出图」是两回事；哪些模型吃图片输入、哪些模型才能出图、真正一个接口同时返回文本和图片的只有哪一类，以及四条出图路线怎么选。

## 简短回答

<Info>
  **三句话讲完：**

  1. **「能看图」和「能出图」是两件事**。绝大多数新对话模型都能**读**图片（这就是通常说的「多模态」），但它们**不能生成**图片；能出图的是另一类专门的图片模型。
  2. **真正「一个接口同时返回文本和图片」的，只有 Gemini 出图系**——`gemini-3-pro-image`（Nano Banana Pro）、`gemini-3.1-flash-image`（Nano Banana 2）等，响应里文本段和图片段是混排的。
  3. **其余场景都是编排**：对话模型 + 独立出图接口两个 API 协作，或者用 `gpt-5.5` + Responses 原生 `image_generation` 工具，让模型自己决定什么时候画。
</Info>

## 先分清两件事：图片「进」和图片「出」

大部分困惑来自「多模态」这个词——它在 API 语境里**默认指输入侧**，也就是「你能给模型喂图片」，
而不是「模型能给你产出图片」。这两件事的模型池、端点、计费方式完全不同：

| 维度   | 图片输入（识图 / vision）                                          | 图片输出（出图 / 生成）                                                             |
| ---- | ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| 谁具备  | **绝大多数新对话模型**——GPT-5 系、Claude 系、Gemini 文本系、Grok 系等         | **少数专门的图片模型**，全站近 300 个模型里只有 30 多个                                        |
| 典型端点 | `POST /v1/chat/completions`、`/v1/responses`、`/v1/messages` | `POST /v1/images/generations`、`POST /v1/images/edits`                     |
| 图片在哪 | **请求**里：`content` 数组放 `image_url` 或 base64                 | **响应**里：`data[0].url` / `data[0].b64_json`，Gemini 系在 `parts[].inlineData` |
| 计费口径 | 图片折算成 token，按对话价计                                          | 按张计费，或按输出 token 计费                                                        |
| 怎么查  | 模型详情页「**输入模态**」那一行含「图片」                                    | 不在详情页体系里，见[图像与视频生成模型](/api-capabilities/image-video-models)               |

<Note>
  所以客户问「有没有多模态对话 API」时，如果他要的是**上传图片让模型分析**，答案是「几乎全都支持」；
  如果他要的是**让模型画一张图**，那是完全另一批模型。问清楚这一句，能省掉后面一大半沟通成本。
</Note>

## 想拿到图片，一共四条路

| 路线                    | 怎么调                                                 | 同一次响应里有文本吗                 | 适合谁           |
| --------------------- | --------------------------------------------------- | -------------------------- | ------------- |
| **A. 独立出图接口**（主推）     | 图片模型 + `POST /v1/images/generations`                | ❌ 只有图                      | 「我就是要一张图」     |
| **B. Gemini 出图系原生**   | `POST /v1beta/models/{model}:generateContent`       | ✅ **可能有**，但不保证             | 要文字说明和图一起拿    |
| **C. Responses 原生工具** | `gpt-5.5` + `tools: [{"type": "image_generation"}]` | ✅ 有                        | Agent 自主决定画不画 |
| **D. 图片模型的对话端点**      | `gpt-image-2-all` / `-vip` + `/v1/chat/completions` | 图以 Markdown 塞在 `content` 里 | 存量兼容，**不再主推** |

<AccordionGroup>
  <Accordion title="A. 独立出图接口 —— 绝大多数场景选这条">
    最标准、最便宜、最好排查的一条路。GPT-Image、FLUX、Seedream、Grok Imagine 都走这里。

    ```bash theme={null}
    curl https://api.apiyi.com/v1/images/generations \
      -H "Authorization: Bearer sk-your-api-key" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-image-2",
        "prompt": "一只橙色的猫坐在蓝色沙发上，简笔画风格",
        "size": "1024x1024"
      }'
    ```

    响应里 FLUX / Seedream 一般回 `data[0].url`，GPT-Image 系回 `data[0].b64_json`。
    **这条路不返回任何对话文本**——它就不是对话接口。

    模型全表见[图像与视频生成模型](/api-capabilities/image-video-models)，
    各模型的端点、超时、输出格式差异见[图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)。
  </Accordion>

  <Accordion title="B. Gemini 出图系 —— 唯一原生「文本 + 图片」同出的一类">
    Nano Banana 系列（`gemini-3-pro-image` / `gemini-3.1-flash-image` 等）走 Gemini 原生端点，
    响应的 `candidates[0].content.parts` 是一个**异构数组**：里面可能只有图片段，
    也可能文本段和图片段混排。这就是「一个接口既给文字又给图」的那一类。

    但有个坑必须提前知道：**段数和顺序都不做保证**。实测出现过三种排列：

    | parts 结构              | 长度 | 图片下标    |
    | --------------------- | -- | ------- |
    | `inlineData`          | 1  | `0`     |
    | `text` + `inlineData` | 2  | **`1`** |
    | `inlineData` + `text` | 2  | **`0`** |

    所以 `parts[0]` / `parts[1]` 这类写死下标的取法**一定会间歇性失败**。正确写法是按字段特征筛选，
    并取**最后一个** `inlineData`（复杂任务下模型会返回多张图，最后一张才是最终稿）：

    ```python theme={null}
    cand = (resp.get("candidates") or [{}])[0]
    parts = (cand.get("content") or {}).get("parts") or []
    images = [p["inlineData"] for p in parts if "inlineData" in p]
    texts  = [p["text"] for p in parts if "text" in p]          # 文字说明在这里
    if not images:
        raise RuntimeError(f"未返回图片，finishReason={cand.get('finishReason')}")
    final = images[-1]                                          # 多图时最后一张为最终稿
    ```

    完整说明见 [Nano Banana 系列开发指南](/api-capabilities/nano-banana-dev-guide)。
  </Accordion>

  <Accordion title="C. Responses 原生 image_generation 工具 —— 让 Agent 自己决定画不画">
    调 `POST /v1/responses`，模型用 `gpt-5.5`，请求里挂上原生出图工具：

    ```json theme={null}
    {
      "model": "gpt-5.5",
      "input": "帮我画一张产品发布会的主视觉海报",
      "tools": [{ "type": "image_generation" }]
    }
    ```

    模型自己判断要不要画，图片以 base64 放在响应 `output` 数组的 `image_generation_call` 项里，
    和正常的文本输出并列。**这是 OpenAI 侧最接近「会画画的聊天模型」的形态。**

    <Warning>
      **代价**：这条路每次出图会**额外固定收一笔约 \$0.20 的工具调用费**，叠加在按量计费之上；
      而路线 A 的 `/v1/images/generations` 只按用量计费。所以只在「流程必须走 Responses」
      （比如 Agent 要自主决定画/不画）时才用它，单纯想要一张图请走 A。
    </Warning>

    详见[原生工具出图](/api-capabilities/gpt-image-2/responses-image-tool)。
  </Accordion>

  <Accordion title="D. 图片模型的对话端点 —— 形似对话，本质仍是图片模型">
    `gpt-image-2-all` / `gpt-image-2-vip` 支持用 `/v1/chat/completions` 调用，图片以 Markdown
    链接的形式塞在 `choices[0].message.content` 里。

    看起来像「一个对话接口既回文字又出图」，但**它并不是会画画的聊天模型**——底下仍然是图片模型
    套了一层对话 schema，没有通用对话能力。另外它**只读最后一条 `user` 消息里的 `image_url` 作底图**，
    assistant 历史里的图会被忽略。

    这条路**不再主推**，新接入请走 A。
  </Accordion>
</AccordionGroup>

## 想做「边聊边出图」的产品，推荐怎么搭

大多数 Agent / 产品要的其实不是「一个万能接口」，而是一条清晰的编排链。推荐这样搭：

<Steps>
  <Step title="对话模型判断意图">
    用你本来就在用的对话模型（`gpt-5.5`、`claude-opus-5`、`gemini-3-pro` 等）处理用户输入，
    判断这一轮到底是「聊天」还是「要出图」。需要的话让它以结构化输出返回一个标志位。
  </Step>

  <Step title="让对话模型写出图提示词">
    这一步价值很高：用户说的是「给我搞个海报」，而出图模型需要的是完整的画面描述。
    让对话模型把口语需求改写成规范的英文/中文提示词，出图质量会明显更稳。
  </Step>

  <Step title="调出图接口拿图">
    走路线 A 的 `/v1/images/generations`。拿到 `url` 或 `b64_json` 后落到你自己的对象存储。
  </Step>

  <Step title="把图回填进对话">
    把图片链接以 assistant 消息的形式接回对话历史，用户体验上就是「边聊边出图」。
  </Step>
</Steps>

<Tip>
  这样拆的好处很实在：两个模型可以各自独立替换（换出图模型不用动对话逻辑）、
  计费在日志里分得清清楚楚、**任一环失败可以单独重试**，而不是整轮重来。
</Tip>

## 怎么确认某个模型吃不吃图片

<Steps>
  <Step title="① 查模型详情页">
    打开 `/models/<模型名>`，看顶部规格表里「**输入模态**」那一行——含「图片」就支持识图。
    这是最快的判断方式。
  </Step>

  <Step title="② 拿不准就实测一条">
    发一条最小的带图请求，看返回：

    ```bash theme={null}
    curl https://api.apiyi.com/v1/chat/completions \
      -H "Authorization: Bearer sk-your-api-key" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "要测的模型名",
        "messages": [{
          "role": "user",
          "content": [
            {"type": "text", "text": "这张图里是什么？"},
            {"type": "image_url", "image_url": {"url": "https://example.com/test.jpg"}}
          ]
        }]
      }'
    ```
  </Step>

  <Step title="③ 认报错原文">
    纯文本模型会明确报错，上游原文是 `Model do not support image input`
    （语法就是这样，不是笔误）。看到这一句就说明该模型不吃图片，换模型即可。
  </Step>
</Steps>

<Warning>
  **已知的纯文本例外（截至 2026-08-20）**：`deepseek-v4-pro`、`deepseek-v4-flash`、`glm-5.2`。

  这几个是「新模型但不支持图片输入」的少数派，容易踩。
  **这份名单会随模型库变化**——同一厂商不同代际的能力也不一致，
  请始终以模型详情页的「输入模态」和实测结果为准，不要把这里的名单当成长期清单。
</Warning>

## 五个常见误区

<AccordionGroup>
  <Accordion title="误区一：多模态模型 = 能生成图片">
    **不成立。** 多模态在 API 语境里默认指**输入侧**能力。`gpt-5.5` 能看懂你发的设计稿，
    但它自己吐不出一张图——想让它出图，得靠工具调用（路线 C）或另外调出图接口（路线 A）。
  </Accordion>

  <Accordion title="误区二：出图模型也能当聊天模型用">
    **不成立。** 图片模型没有通用对话能力，别拿 `gpt-image-2` 去做客服问答。
    即便是支持对话端点的 `-all` / `-vip`（路线 D），底下也仍然是图片模型。
  </Accordion>

  <Accordion title="误区三：responseModalities 带上 TEXT 就一定会返回文本段">
    **反向不成立。** 声明 `responseModalities: ["TEXT", "IMAGE"]` **不保证**响应里一定有文本段，
    模型也可能只给图片。反过来倒是有用：显式声明 `["IMAGE"]` 可以减少多余的文本段。
  </Accordion>

  <Accordion title="误区四：在 parts[0] 和 parts[1] 之间来回改能修好取图">
    **修不好。** 写死下标的两种写法是**互补**的——图片必落在 `[0]` 或 `[1]`，
    无论选哪个，都存在拿不到图的请求。改下标只是把失败的请求换了一批，
    **只有按字段特征遍历筛选才稳定**。
  </Accordion>

  <Accordion title="误区五：给 /v1/images/generations 传参考图就能做图片编辑">
    **不成立，而且是静默失败。** 以 Grok Imagine 为例：向生成端点传 `image` / `image_url` / `images`，
    实测会**返回 200 并正常出一张图，但参考图被静默丢弃、并照常计费**——你拿到的是纯文生图结果。

    图片编辑必须走 `/v1/images/edits`（Grok Imagine 侧还要求 `multipart/form-data`，传 JSON 会硬报 400）。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="图像理解（识图）API" icon="eye" href="/api-capabilities/vision-understanding">
    图片输入侧的完整指南：支持的模型、URL / base64 两种传法、多图输入、常见报错
  </Card>

  <Card title="图像与视频生成模型" icon="palette" href="/api-capabilities/image-video-models">
    图片输出侧的模型全表与价格，判断「哪些模型能出图」看这里
  </Card>

  <Card title="Nano Banana 系列开发指南" icon="banana" href="/api-capabilities/nano-banana-dev-guide">
    Gemini 出图系的正确接法，含 parts 遍历取图、多图输出、mimeType 处理
  </Card>

  <Card title="原生工具出图" icon="wand-sparkles" href="/api-capabilities/gpt-image-2/responses-image-tool">
    用 Responses API 的 image\_generation 工具让模型自主出图，含额外工具调用费说明
  </Card>

  <Card title="图片 API 调用须知与最佳实践" icon="list-checks" href="/api-capabilities/image-api-best-practices">
    各出图模型的端点、超时、输出格式对照矩阵
  </Card>

  <Card title="如何选择合适的 AI 模型？" icon="compass" href="/faq/model-selection-guide">
    按场景、成本、速度三个维度的选型指南
  </Card>
</CardGroup>
