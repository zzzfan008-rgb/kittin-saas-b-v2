> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Multi-Agent 多智慧體模型指南

> grok-4.20-multi-agent-beta-0309 多智慧體協作模型在 API易 的實測：多 agent 並行解題、適合複雜研究任務，重點說明其內部 agent 流量全額計費的成本放大特性。

`grok-4.20-multi-agent-beta-0309` 是 xAI 的多智慧體協作模型：一次請求內部會啟動**多個 agent 並行工作**（模型自稱 Oppie，「協作型 AI 團隊領導者」），由領導 agent 彙總產出最終回答。適合複雜研究、多角度對比分析類任務。API易 已上架，OpenAI 相容格式直接呼叫。

## 計費特性（務必先讀）

<Warning>
  **內部 agent 的全部流量都計入你的賬單**。這是該模型與普通模型最大的差異：

  * 實測一個約 40 tokens 的普通提問，實際計費 **39,263 prompt tokens + 9,997 completion tokens**（內部多 agent 的往返流量全部計入）
  * 即使最簡單的一句話請求，也有約 **3,900 prompt tokens 起步**的固定開銷
  * 單價雖與 grok-4.3 相同（\$1.25 / \$2.50 每 1M tokens），**單次請求實際成本可達普通模型的幾十倍**

  簡單任務請勿使用該模型——普通問答用 `grok-4.3` 或 `grok-4.20-0309-reasoning` 即可。
</Warning>

好訊息是內部流量的快取命中率很高（實測 39K prompt tokens 中 26.8K 命中緩存摺扣價 —— 這是多次內部調用匯總後的口徑，不是單次請求的命中量），實際成本低於名義 token 數的直接換算，但仍顯著高於普通模型。快取本身的規則見 [Grok 快取計費指南](/zh-Hant/api-capabilities/grok/prompt-caching)。

## 呼叫方式

與普通模型完全一致，僅 `model` 欄位不同：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

resp = client.chat.completions.create(
    model="grok-4.20-multi-agent-beta-0309",
    messages=[{
        "role": "user",
        "content": "比較 Rust 和 Go 在構建高併發網路服務時的優劣，各給3點，最後給一句結論"
    }],
)
print(resp.choices[0].message.content)
print("實際計費 tokens:", resp.usage.total_tokens)
```

多智慧體協作是**服務端內部行為**，無需任何額外引數；流式輸出、結構化輸出（`json_schema`）實測同樣支援。

## 實測特徵（2026-07-13）

| 維度            | 實測值                             |
| ------------- | ------------------------------- |
| 中等複雜度任務延遲     | \~29 秒                          |
| 簡單問答延遲        | \~5 秒                           |
| 簡單問答固定開銷      | \~3,900 prompt tokens           |
| 中等任務 token 消耗 | \~39K prompt + \~10K completion |
| 內部快取命中        | 約 2/3 的 prompt tokens 命中緩存摺扣    |
| 思維鏈外露         | 不外露（`reasoning_tokens` 照常計費）    |

## 選型建議

<CardGroup cols={2}>
  <Card title="適合的場景" icon="check">
    多角度深度對比分析、複雜研究類問題、需要多條思路交叉驗證的開放性任務——多 agent 並行探索能明顯提升答案的全面性。
  </Card>

  <Card title="不適合的場景" icon="ban">
    日常問答、翻譯、摘要、程式碼補全等單線任務——效果與普通模型接近，成本卻放大幾十倍。這些場景用 grok-4.3 / grok-4.5 即可。
  </Card>
</CardGroup>

<Tip>
  上線前建議先用少量真實任務對比 `grok-4.20-0309-reasoning` 與 multi-agent 模型的輸出品質差異，再決定是否為品質增量支付成本放大——多數場景下推理變體已經夠用。
</Tip>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼響應裡模型自稱 Oppie？">
    這是該模型的內建人設（多 agent 團隊的領導者角色），屬正常現象。驗證模型身份以請求與響應的 `model` 欄位為準。
  </Accordion>

  <Accordion title="能控制內部 agent 數量嗎？">
    不能。多智慧體編排是 xAI 服務端內部行為，對外不暴露任何控制引數。
  </Accordion>

  <Accordion title="max_tokens 需要特殊設定嗎？">
    建議放寬（如 8192），該模型內部推理消耗大，配額過小容易截斷最終回答。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="Grok 概覽" icon="rocket" href="/zh-Hant/api-capabilities/grok/overview">
    全系模型陣容與定價
  </Card>

  <Card title="對話與推理" icon="message-square" href="/zh-Hant/api-capabilities/grok/chat">
    普通模型的思維鏈與計費說明
  </Card>
</CardGroup>
