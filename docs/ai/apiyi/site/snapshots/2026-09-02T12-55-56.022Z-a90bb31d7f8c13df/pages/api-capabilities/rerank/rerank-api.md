> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 重排序 API 参考

> bge-reranker-v2-m3 重排序 API 参考与在线调试：/v1/rerank 端点参数说明、响应结构、错误码对照与调试要点。

<Info>
  右侧 Playground 可直接调试：在 **Authorization** 填 `Bearer sk-your-api-key`，
  默认示例已填好中文语料，点击发送即可看到排序结果。
</Info>

<Tip>
  模型能力、定价、实测数据与三个必踩的坑见 [概览](/api-capabilities/rerank/overview)；
  召回数量、切块、阈值等调参方法见 [RAG 实战调优](/api-capabilities/rerank/rag-best-practices)。
</Tip>

## 参数说明速查

| 参数                 | 类型        | 必填 | 说明                                                 |
| ------------------ | --------- | -- | -------------------------------------------------- |
| `model`            | string    | ✓  | 固定 `bge-reranker-v2-m3`，**大小写敏感**（写错返回 503，不是 404） |
| `query`            | string    | ✓  | 检索问题。传空字符串返回 400 `query is required`               |
| `documents`        | string\[] | ✓  | 候选文档。**只接受字符串数组**；空数组返回 400                        |
| `top_n`            | int       |    | 返回前 N 条。省略 / `0` / 负数均返回全部；传字符串返回 400              |
| `return_documents` | bool      |    | ⚠️ **当前通道不生效**，无论传什么都会回显原文                         |

未识别的参数（如 `max_chunks_per_doc`、`rank_fields`、`truncate`）会被静默忽略，不报错。

## 响应要点

```json theme={null}
{
  "results": [
    { "document": { "text": "..." }, "index": 0, "relevance_score": 0.97265625 }
  ],
  "usage": { "prompt_tokens": 70, "total_tokens": 91,
             "input_tokens": 0, "output_tokens": 0 }
}
```

* `index` —— 该文档在入参 `documents` 数组中的**原始下标**。用它回填你自己的文档对象，
  不要拿返回的 `text` 去反查原文。
* `relevance_score` —— 范围 0–1。**只在同一次请求内可比**，
  不同 query 之间不可比、跨语言场景会整体偏低，详见 [概览的阈值说明](/api-capabilities/rerank/overview)。
* `results` 恒按 `relevance_score` 降序排列；`index` 全覆盖且不重复。
* 用量看 `usage.prompt_tokens`（query 计一次 + 全部文档）与 `total_tokens`（query 按对重复计）；
  `input_tokens` / `output_tokens` 该通道**恒为 0**，不要用。
  本轮未能通过账单确认实际扣的是哪个字段，成本核算以控制台账单为准。

## 错误码对照

| HTTP | 错误信息                                                    | 原因与处理                                                                                                                                                          |
| ---- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400  | `query is required`                                     | 缺 `query`，或传了空字符串                                                                                                                                              |
| 400  | `documents is required`                                 | 缺 `documents`，或传了空数组                                                                                                                                           |
| 400  | `Input should be a valid string`                        | `documents` 里传了对象；改成纯字符串数组                                                                                                                                     |
| 400  | `cannot unmarshal string into ... top_n of type int`    | `top_n` 传了字符串；改成整数                                                                                                                                             |
| 400  | `This model's maximum context length is 8192 tokens`    | 单个「query + 文档」对超过 8192 tokens；切块后重试                                                                                                                            |
| 401  | `Invalid token.`                                        | API Key 无效或未带 `Authorization` 头                                                                                                                                |
| 429  | `当前分组上游负载已饱和，请稍后再试`                                     | 撞上游配额（**TPM 20,000 / RPM 120**）。两种成因错误信息相同：① 并发超过约 4–5 个在途请求；② 一分钟内累计 token 超 20,000（候选集 ≥ 1000 条时单请求即超）。并发降到 4 以内 + 退避重试，并核算 token 预算。该配额正在扩容中，业务量大可联系 API易客服 |
| 503  | `Current group ... has no available channels for model` | **模型名拼错**（大小写敏感）或该分组确实无可用渠道。先查拼写                                                                                                                               |

<Warning>
  **503 优先怀疑模型名**。请求体解析失败时（例如 `Content-Type` 写成 `text/plain`），
  网关读不到 `model` 字段，同样会返回这条 503 且模型名位置为空，很容易误判成"渠道故障"。
</Warning>

<Warning>
  **路径写错不会给 404**。实测 `/rerank`、`/v2/rerank`（Cohere SDK v2 默认路径）都返回
  **HTTP 200 + 网站 HTML 首页**，客户端表现为"响应无法解析"。
  只有 `https://api.apiyi.com/v1/rerank` 是有效路径。
</Warning>

## 调试要点

<AccordionGroup>
  <Accordion title="想看真实分布，别只放 3 篇候选">
    候选太少时分数差距会很夸张（第一名 0.97、第二名 0.12），看不出模型的判别边界。
    建议放 10–20 篇、其中混入 2–3 篇「主题相近但不回答问题」的干扰项，
    这样才能看出分数在你的语料上大致落在什么区间——这是后续定阈值的依据。
  </Accordion>

  <Accordion title="调试跨语言时别被低分吓到">
    中文 query 配英文文档，正确结果的得分可能只有 0.003–0.3，但**排序是对的**。
    这是模型的固有特性，不是调用出错。判断标准看排序，不看绝对值。
  </Accordion>

  <Accordion title="延迟基线约 2 秒">
    即使只传 1 篇候选，实测 P50 也在 2 秒左右——这部分是网关与上游的固定开销。
    候选数从 1 加到 100，P50 只从 2.0 秒涨到 3.8 秒。
    所以**不要为了压延迟把候选集砍得很小**，收益远小于预期。
  </Accordion>

  <Accordion title="调试时也会撞配额">
    上游 TPM 只有 20,000。用 100 篇候选反复调试，约 15 次就会把整分钟预算用光并开始 429。
    调试阶段建议用 10–20 篇候选，既够看分数分布，也不会因为配额中断。
    详见 [RAG 实战调优的配额章节](/api-capabilities/rerank/rag-best-practices)。
  </Accordion>
</AccordionGroup>


## OpenAPI

````yaml api-reference/bge-reranker-v2-m3-rerank-openapi.yaml POST /v1/rerank
openapi: 3.1.0
info:
  title: bge-reranker-v2-m3 重排序 API
  description: >
    `bge-reranker-v2-m3` —— 多语言重排序（Rerank）模型，对「一个 query +
    一批候选文档」逐条打相关性分并按分数降序返回。


    - 交叉编码器，直接输出相关性分数，**不产生向量、不能建索引**，只用于对已召回的候选做精排

    - 多语言，中英日韩俄法阿实测排序均正确

    - 按**输入 token** 计费，无输出 token

    - 上游配额 TPM 20,000 / RPM 120，并发槽位约 4–5：100 篇候选约 15 次检索/分钟

    - 单请求候选集建议 ≤ 100 条（1000 条 = 26,867 tokens，超整分钟 TPM 预算，必然 429）


    **认证方式**：请求头 `Authorization: Bearer YOUR_API_KEY`


    **获取 API Key**：访问 API易控制台 `api.apiyi.com/token` 创建令牌
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: 主要端点
  - url: https://vip.apiyi.com
    description: 备用端点
security:
  - bearerAuth: []
paths:
  /v1/rerank:
    post:
      tags:
        - 重排序
      summary: 文档重排序：bge-reranker-v2-m3
      description: |
        传入一个 `query` 和一组 `documents`，返回按相关性降序排列的结果。

        响应中的 `index` 是**该文档在入参 `documents` 数组中的原始下标**，
        用它回填你自己的文档对象（ID、元数据、原文），不要依赖返回的文本顺序。
      operationId: rerankBgeRerankerV2M3
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RerankRequest'
            example:
              model: bge-reranker-v2-m3
              query: 杭州有哪些适合旅游的景点？
              documents:
                - 西湖是杭州著名的旅游景点，拥有断桥、苏堤和雷峰塔等景观。
                - 上海外滩位于黄浦江畔，是上海的标志性景点。
                - 灵隐寺位于杭州西湖区，是中国著名的佛教寺院。
              top_n: 2
              return_documents: true
      responses:
        '200':
          description: 重排序成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RerankResponse'
              example:
                results:
                  - document:
                      text: 西湖是杭州著名的旅游景点，拥有断桥、苏堤和雷峰塔等景观。
                    index: 0
                    relevance_score: 0.97265625
                  - document:
                      text: 灵隐寺位于杭州西湖区，是中国著名的佛教寺院。
                    index: 2
                    relevance_score: 0.1181640625
                usage:
                  prompt_tokens: 70
                  total_tokens: 91
        '400':
          description: 参数错误：缺少 query / documents，或字段类型不符
        '401':
          description: API Key 无效
        '429':
          description: >-
            撞上游配额（TPM 20,000 / RPM 120）：并发超约 4–5 个在途请求，或一分钟内累计 token 超
            20,000。候选集 ≥1000 条时单请求即超
        '503':
          description: 模型名拼写错误或该分组无可用渠道
      security:
        - bearerAuth: []
components:
  schemas:
    RerankRequest:
      type: object
      required:
        - model
        - query
        - documents
      properties:
        model:
          type: string
          description: 固定 bge-reranker-v2-m3（大小写敏感，写错返回 503）
          example: bge-reranker-v2-m3
        query:
          type: string
          description: 检索问题。不可为空字符串，否则返回 400
        documents:
          type: array
          description: |
            候选文档，**只接受字符串数组**（传 `[{"text": "..."}]` 对象数组会返回 400）。
            不可为空数组。建议单请求 ≤ 100 条。
          items:
            type: string
        top_n:
          type: integer
          description: |
            返回前 N 条。省略、传 0 或负数都返回全部。
            必须是整数，传字符串返回 400。
            **不影响用量** —— 所有候选文档都会过一遍模型。
          example: 2
        return_documents:
          type: boolean
          description: |
            是否在结果中回显文档原文。
            **注意：当前通道该参数不生效，无论传什么都会回显 `document.text`。**
            对带宽敏感的场景请自行按 `index` 回填，不要依赖此开关裁剪响应体。
          example: true
    RerankResponse:
      type: object
      properties:
        results:
          type: array
          description: 按 relevance_score 降序排列
          items:
            type: object
            properties:
              index:
                type: integer
                description: 该文档在入参 documents 数组中的原始下标
              relevance_score:
                type: number
                description: |
                  相关性分数，范围 0–1（sigmoid 后的值）。
                  **是同一 query 内的相对排序依据，不是跨 query 可比的绝对置信度**，
                  不要用一个固定阈值套所有场景。
              document:
                type: object
                properties:
                  text:
                    type: string
        usage:
          type: object
          description: 用量统计。本模型只有输入侧消耗
          properties:
            prompt_tokens:
              type: integer
              description: query（计一次）与全部候选文档的输入 token 总量。实测 ≈ 26.9 × 文档数 + 7
            total_tokens:
              type: integer
            input_tokens:
              type: integer
              description: 该通道恒为 0，请以 prompt_tokens 为准
            output_tokens:
              type: integer
              description: 该通道恒为 0
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: '在请求头中添加 Authorization: Bearer YOUR_API_KEY'

````