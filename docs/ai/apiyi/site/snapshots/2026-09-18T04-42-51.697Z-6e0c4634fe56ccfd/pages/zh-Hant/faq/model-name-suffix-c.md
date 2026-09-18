> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 模型名稱字尾 -c 是什麼意思？

> 解釋 gemini-3-pro-image-preview-c 等帶 -c 字尾模型名稱的含義和計費區別

## 簡短回答

<Info>
  **`-c` 代表 "call"（按次計費）。**

  帶 `-c` 字尾的模型名稱（如 `gemini-3-pro-image-preview-c`）和不帶字尾的版本（如 `gemini-3-pro-image-preview`）本質上是**同一個模型**，能力完全一致。區別僅在於計費方式：`-c` 版本專門用於**按次計費**。而目前 Nano Banana Pro 也僅支援按次計費。
</Info>

## 官方解釋

<img src="https://mintcdn.com/apiyillc/-8MuET9SQdeEzoC1/images/model-name-suffix-c-explain.png?fit=max&auto=format&n=-8MuET9SQdeEzoC1&q=85&s=892eb766d8a1d4f3ebd5a249d21b1d5a" alt="模型名稱 -c 字尾解釋" width="1062" height="476" data-path="images/model-name-suffix-c-explain.png" />

核心要點：

* `-c` 是按次計費（call）的單獨模型名稱
* 本質上和不帶字尾的版本是**同一個模型**
* 都是官方轉發，只是用不同模型名來區分計費方式
* 未來可能只用令牌計費模式區分

## 為什麼會有 -c 字尾？

API易 正在推出按量計費模式，部分模型同時支援按量和按次兩種計費方式。為了區分不同計費通道，系統使用模型名稱字尾來標識：

| 模型名稱                           | 計費方式 | 說明            |
| ------------------------------ | ---- | ------------- |
| `gemini-3-pro-image-preview`   | 按量計費 | 根據 Token 用量計費 |
| `gemini-3-pro-image-preview-c` | 按次計費 | 每次呼叫固定價格      |

<Note>
  兩個名稱呼叫的是**完全相同的官方模型**，都是官方轉發，模型能力和輸出品質沒有任何區別。
</Note>

## 如何選擇？

<CardGroup cols={2}>
  <Card title="按量計費（無後綴）" icon="chart-line">
    **適合場景**：

    * 輸入輸出 Token 數量較少的請求
    * 需要精確控制成本
    * 主要做文本理解/分析任務

    使用不帶 `-c` 的模型名稱
  </Card>

  <Card title="按次計費（-c 字尾）" icon="hand">
    **適合場景**：

    * 圖片生成等固定輸出場景
    * 希望每次呼叫成本透明固定
    * 不想計算 Token 消耗

    使用帶 `-c` 的模型名稱
  </Card>
</CardGroup>

<Tip>
  **推薦做法**：建立令牌時選擇"**按量優先**"計費模式，系統會自動為您選擇最合適的計費方式，無需手動區分模型名稱字尾。詳見 [令牌計費模式說明](/zh-Hant/faq/token-billing-modes)。
</Tip>

## 未來計劃

<Info>
  API易 正在持續最佳化計費體系。未來可能**僅通過令牌的計費模式**來區分按量/按次計費，屆時無需再關注模型名稱字尾。具體調整請關注平臺公告。
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="帶 -c 字尾的模型和不帶字尾的是同一個模型嗎？">
    **是的，完全是同一個模型。**

    `-c` 只是計費通道的標識，不影響模型能力。兩個名稱最終都會轉發到相同的官方 API，輸出品質完全一致。
  </Accordion>

  <Accordion title="我應該用哪個模型名稱？">
    取決於您的令牌計費模式：

    * **按量優先令牌**：使用不帶字尾的名稱（如 `gemini-3-pro-image-preview`），系統自動處理
    * **按次計費令牌**：使用帶 `-c` 的名稱（如 `gemini-3-pro-image-preview-c`）
    * **不確定**：推薦使用"按量優先"令牌 + 不帶字尾的模型名稱
  </Accordion>

  <Accordion title="所有模型都有 -c 版本嗎？">
    不是。只有同時支援按量和按次兩種計費方式的模型才會有 `-c` 字尾版本。純文本模型（如 GPT-4o、Claude）通常只支援按量計費，不會有 `-c` 版本。
  </Accordion>

  <Accordion title="-c 字尾會一直存在嗎？">
    API易 正在調整計費體系，未來可能不再需要通過模型名稱字尾區分計費方式，改為完全通過令牌計費模式來控制。建議使用"按量優先"令牌，這樣無論後續如何調整都不受影響。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="令牌計費模式詳解" icon="calculator" href="/zh-Hant/faq/token-billing-modes">
    瞭解按量優先、按次計費等 5 種計費模式的區別
  </Card>

  <Card title="如何建立令牌？" icon="key" href="/zh-Hant/faq/token-management">
    建立和管理 API 令牌的完整指南
  </Card>
</CardGroup>
