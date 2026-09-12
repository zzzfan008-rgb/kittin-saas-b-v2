> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 重排序 API 參考

> bge-reranker-v2-m3 重排序 API 參考與線上除錯：/v1/rerank 端點引數說明、響應結構、錯誤碼對照與除錯要點。

<Info>
  右側 Playground 可直接除錯：在 **Authorization** 填 `Bearer sk-your-api-key`，
  預設示例已填好中文語料，點擊發送即可看到排序結果。
</Info>

<Tip>
  模型能力、定價、實測資料與三個必踩的坑見 [概覽](/zh-Hant/api-capabilities/rerank/overview)；
  召回數量、切塊、閾值等調參方法見 [RAG 實戰調優](/zh-Hant/api-capabilities/rerank/rag-best-practices)。
</Tip>

## 引數說明速查

| 引數                 | 型別        | 必填 | 說明                                                 |
| ------------------ | --------- | -- | -------------------------------------------------- |
| `model`            | string    | ✓  | 固定 `bge-reranker-v2-m3`，**大小寫敏感**（寫錯返回 503，不是 404） |
| `query`            | string    | ✓  | 檢索問題。傳空字串返回 400 `query is required`                |
| `documents`        | string\[] | ✓  | 候選文件。**只接受字串陣列**；空陣列返回 400                         |
| `top_n`            | int       |    | 返回前 N 條。省略 / `0` / 負數均返回全部；傳字串返回 400               |
| `return_documents` | bool      |    | ⚠️ **當前通道不生效**，無論傳什麼都會回顯原文                         |

未識別的引數（如 `max_chunks_per_doc`、`rank_fields`、`truncate`）會被靜默忽略，不報錯。

## 響應要點

```json theme={null}
{
  "results": [
    { "document": { "text": "..." }, "index": 0, "relevance_score": 0.97265625 }
  ],
  "usage": { "prompt_tokens": 70, "total_tokens": 91,
             "input_tokens": 0, "output_tokens": 0 }
}
```

* `index` —— 該文件在入參 `documents` 陣列中的**原始下標**。用它回填你自己的文件物件，
  不要拿返回的 `text` 去反查原文。
* `relevance_score` —— 範圍 0–1。**只在同一次請求內可比**，
  不同 query 之間不可比、跨語言場景會整體偏低，詳見 [概覽的閾值說明](/zh-Hant/api-capabilities/rerank/overview)。
* `results` 恆按 `relevance_score` 降序排列；`index` 全覆蓋且不重複。
* 用量看 `usage.prompt_tokens`（query 計一次 + 全部文件）與 `total_tokens`（query 按對重複計）；
  `input_tokens` / `output_tokens` 該通道**恆為 0**，不要用。
  本輪未能通過賬單確認實際扣的是哪個欄位，成本核算以控制台賬單為準。

## 錯誤碼對照

| HTTP | 錯誤資訊                                                    | 原因與處理                                                                                                                                                          |
| ---- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400  | `query is required`                                     | 缺 `query`，或傳了空字串                                                                                                                                               |
| 400  | `documents is required`                                 | 缺 `documents`，或傳了空陣列                                                                                                                                           |
| 400  | `Input should be a valid string`                        | `documents` 裡傳了物件；改成純字串陣列                                                                                                                                      |
| 400  | `cannot unmarshal string into ... top_n of type int`    | `top_n` 傳了字串；改成整數                                                                                                                                              |
| 400  | `This model's maximum context length is 8192 tokens`    | 單個「query + 文件」對超過 8192 tokens；切塊後重試                                                                                                                            |
| 401  | `Invalid token.`                                        | API Key 無效或未帶 `Authorization` 頭                                                                                                                                |
| 429  | `當前分組上游負載已飽和，請稍後再試`                                     | 撞上游配額（**TPM 20,000 / RPM 120**）。兩種成因錯誤資訊相同：① 併發超過約 4–5 個在途請求；② 一分鐘內累計 token 超 20,000（候選集 ≥ 1000 條時單請求即超）。併發降到 4 以內 + 退避重試，並核算 token 預算。該配額正在擴容中，業務量大可聯絡 API易客服 |
| 503  | `Current group ... has no available channels for model` | **模型名拼錯**（大小寫敏感）或該分組確實無可用渠道。先查拼寫                                                                                                                               |

<Warning>
  **503 優先懷疑模型名**。請求體解析失敗時（例如 `Content-Type` 寫成 `text/plain`），
  閘道讀不到 `model` 欄位，同樣會返回這條 503 且模型名位置為空，很容易誤判成"渠道故障"。
</Warning>

<Warning>
  **路徑寫錯不會給 404**。實測 `/rerank`、`/v2/rerank`（Cohere SDK v2 預設路徑）都返回
  **HTTP 200 + 網站 HTML 首頁**，客戶端表現為"響應無法解析"。
  只有 `https://api.apiyi.com/v1/rerank` 是有效路徑。
</Warning>

## 除錯要點

<AccordionGroup>
  <Accordion title="想看真實分佈，別隻放 3 篇候選">
    候選太少時分數差距會很誇張（第一名 0.97、第二名 0.12），看不出模型的判別邊界。
    建議放 10–20 篇、其中混入 2–3 篇「主題相近但不回答問題」的干擾項，
    這樣才能看出分數在你的語料上大致落在什麼區間——這是後續定閾值的依據。
  </Accordion>

  <Accordion title="除錯跨語言時別被低分嚇到">
    中文 query 配英文文件，正確結果的得分可能只有 0.003–0.3，但**排序是對的**。
    這是模型的固有特性，不是調用出錯。判斷標準看排序，不看絕對值。
  </Accordion>

  <Accordion title="延遲基線約 2 秒">
    即使只傳 1 篇候選，實測 P50 也在 2 秒左右——這部分是閘道與上游的固定開銷。
    候選數從 1 加到 100，P50 只從 2.0 秒漲到 3.8 秒。
    所以**不要為了壓延遲把候選集砍得很小**，收益遠小於預期。
  </Accordion>

  <Accordion title="除錯時也會撞配額">
    上游 TPM 只有 20,000。用 100 篇候選反覆除錯，約 15 次就會把整分鐘預算用光並開始 429。
    除錯階段建議用 10–20 篇候選，既夠看分數分佈，也不會因為配額中斷。
    詳見 [RAG 實戰調優的配額章節](/zh-Hant/api-capabilities/rerank/rag-best-practices)。
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