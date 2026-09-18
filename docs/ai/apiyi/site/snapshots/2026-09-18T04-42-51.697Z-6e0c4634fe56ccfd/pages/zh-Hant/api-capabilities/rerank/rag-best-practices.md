> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# RAG 實戰調優

> 怎麼用好 bge-reranker-v2-m3：兩段式檢索架構、召回條數怎麼定、長文件怎麼切塊、relevance_score 閾值怎麼設、否定語義怎麼兜底，以及 LangChain / LlamaIndex / Dify 的接入程式碼。

[概覽](/zh-Hant/api-capabilities/rerank/overview) 講了這個模型是什麼。這一頁講**怎麼把它用對**。

所有建議都對應 API易 2026 年 7 月 30 日 (UTC+8) 的實測資料，不是通用套話。

## 一、先把架構擺對：兩段式檢索

重排序不是獨立的檢索方案，它是檢索管線的第二級。

<Steps>
  <Step title="召回（Recall）">
    用**向量檢索**或 **BM25** 從全量文件裡撈出候選集。這一步要**快**、要**寧濫勿缺**，
    目標是"正確答案在這批裡"，而不是"正確答案排第一"。
  </Step>

  <Step title="精排（Rerank）">
    把候選集連同 query 一起送進 `bge-reranker-v2-m3`，逐條打分重排。
    這一步要**準**，目標是把正確答案頂到最前面。
  </Step>

  <Step title="截斷並送進大模型">
    取重排後的 Top-3 到 Top-5 拼進 prompt。
    這一步決定了最終答案品質——**送進去的越準，大模型幻覺越少、上下文成本越低**。
  </Step>
</Steps>

<Info>
  **為什麼不能跳過召回直接精排**：重排序是交叉編碼器，必須拿到 query 才能算分，無法離線預計算。
  百萬篇文件逐條打分，成本和延遲都不可接受。召回負責把規模從百萬降到百，精排負責把百排準。
</Info>

### 完整可執行示例

下面這段程式碼就是一個最小但完整的兩段式檢索，向量召回用 `text-embedding-3-small`，
精排用 `bge-reranker-v2-m3`，兩個模型同一個 API易 令牌：

```python theme={null}
import os
import numpy as np
import requests

BASE = "https://api.apiyi.com/v1"
HEADERS = {"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"}


def embed(texts):
    """批次向量化。真實專案裡文件向量應離線算好存進向量庫。"""
    r = requests.post(f"{BASE}/embeddings", headers=HEADERS, timeout=60,
                      json={"model": "text-embedding-3-small", "input": texts})
    r.raise_for_status()
    data = sorted(r.json()["data"], key=lambda x: x["index"])
    return np.array([d["embedding"] for d in data])


def rerank(query, documents, top_n=5):
    """精排。documents 只接受字串陣列。"""
    r = requests.post(f"{BASE}/rerank", headers=HEADERS, timeout=120,
                      json={"model": "bge-reranker-v2-m3", "query": query,
                            "documents": documents, "top_n": top_n})
    r.raise_for_status()
    return r.json()["results"]


def search(query, corpus, recall_k=50, final_k=5):
    """corpus: [{'id':..., 'text':..., 'meta':...}, ...]"""
    # ---- 第一級：向量召回 ----
    doc_vecs = embed([c["text"] for c in corpus])          # 生產環境應來自向量庫
    q_vec = embed([query])[0]
    doc_vecs /= np.linalg.norm(doc_vecs, axis=1, keepdims=True)
    q_vec /= np.linalg.norm(q_vec)
    recalled_idx = np.argsort(-(doc_vecs @ q_vec))[:recall_k]
    candidates = [corpus[i] for i in recalled_idx]

    # ---- 第二級：重排序精排 ----
    results = rerank(query, [c["text"] for c in candidates], top_n=final_k)

    # 關鍵：用 index 回填原始文件物件，保住 id 和 meta
    return [{**candidates[r["index"]], "score": r["relevance_score"]}
            for r in results]


corpus = [
    {"id": "kb-001", "text": "429 表示觸發了速率限制。解決辦法是降低併發、"
                             "在客戶端實現指數退避重試，或聯絡服務商提升賬號的 RPM 配額。"},
    {"id": "kb-002", "text": "HTTP 狀態碼 4xx 系列表示客戶端錯誤，常見的有 400 引數錯誤、"
                             "401 未授權、403 禁止訪問、404 資源不存在。"},
    {"id": "kb-003", "text": "要查詢賬戶餘額，請呼叫 /v1/dashboard/billing/subscription 介面。"},
]

for hit in search("API 請求一直返回 429 錯誤，怎麼解決？", corpus, recall_k=3, final_k=2):
    print(f"{hit['score']:.4f}  [{hit['id']}]  {hit['text'][:40]}")
```

<Warning>
  **務必用 `index` 回填，不要用返回的文本去反查。**
  文件內容可能重複（實測兩篇完全相同的文件得分逐位一致，無法區分），
  按文本反查會張冠李戴，丟掉 `id` 和後設資料。
</Warning>

## 二、召回多少條送進精排？

實測延遲（短文件，每檔 5 次取 P50）：

| 候選條數 | P50 延遲 | P95 延遲 |
| ---- | ------ | ------ |
| 1    | 2.00 s | 2.58 s |
| 10   | 2.35 s | 2.68 s |
| 25   | 2.52 s | 2.81 s |
| 50   | 2.92 s | 3.39 s |
| 100  | 3.80 s | 4.32 s |
| 500  | 約 15 s | —      |
| 1000 | 約 33 s | —      |
| 2000 | 約 68 s | —      |

關鍵在於**存在約 2 秒的固定開銷**：只送 1 篇也要 2 秒。所以候選從 1 加到 100，延遲只多 1.8 秒，
而檢索品質的提升遠大於這 1.8 秒的代價。

**真正決定延遲的是 token 總量，不是文件條數。** 同樣 50 條候選：

| 50 條候選         | 輸入 tokens | P50 延遲  |
| -------------- | --------- | ------- |
| 短文件（約 20 字/條）  | 673       | 2.48 s  |
| 長文件（約 480 字/條） | 20,606    | 11.74 s |

條數相同、延遲差 4.7 倍。這也是下一節「切塊」不會拖慢檢索的原因——
切塊只增加條數，不增加總 token 量。

<Tip>
  **推薦 `recall_k` = 50–100。**

  * 低於 20：召回列表本來就短，精排能挽回的漏排有限，浪費了這次呼叫的固定開銷
  * 超過 200：延遲開始明顯影響互動，而召回列表尾部極少含正確答案，邊際收益趨近於零
  * **≥ 1000：必然 429**。1000 條候選 = 26,867 tokens，超過 TPM 20,000 的整分鐘預算（134%），
    單個請求就註定失敗，與重試無關
</Tip>

如果確實要排大量文件（比如離線批處理），**拆成多個 ≤100 條的請求**，併發控制在 4 以內。
注意拆分不會降低 token 總量，TPM 20,000 依然是總閘門——離線批處理要按分鐘節流。
該配額正在擴容中，有大批次需求可先聯絡 API易客服確認可用額度。

## 三、長文件必須切塊

這是收益最大的一步預處理。實測資料說明了兩件事：

**其一，無關內容會稀釋相關性。** 同一句命中內容，後面接不同長度的無關填充：

| 文件總長    | 命中句在開頭 | 命中句在結尾 | 結尾/開頭 |
| ------- | ------ | ------ | ----- |
| 528 字元  | 0.933  | 0.720  | 0.77  |
| 1028 字元 | 0.931  | 0.500  | 0.54  |
| 2028 字元 | 0.925  | 0.793  | 0.86  |
| 4028 字元 | 0.907  | 0.351  | 0.39  |
| 8028 字元 | 0.828  | 0.181  | 0.22  |

**其二，長文件會抬高噪聲得分。** 同一篇不相關文件，短版得分 0.029，接上 450 字無關內容後
漲到 0.121——翻了 4 倍。長噪聲文件更容易擠進 Top-N。

兩者疊加的後果：**一篇把答案寫在文末的長文件，會輸給一篇通篇跑題的長文件。**

<Tip>
  **切塊策略**

  1. 切成 **200–500 字**的塊，塊之間留 10–20% 重疊，避免答案正好被切斷在邊界
  2. 每個塊**獨立送進重排序**（它們只是 `documents` 數組裡的不同元素）
  3. 用「該文件所有塊的最高分」作為文件得分，再按文件去重
  4. 送給大模型時，可以只送命中的塊，也可以回溯取整篇——取決於你的上下文預算
</Tip>

```python theme={null}
def chunk(text, size=400, overlap=60):
    step = size - overlap
    return [text[i:i + size] for i in range(0, max(len(text) - overlap, 1), step)]


def rerank_long_docs(query, docs, top_n=5):
    """docs: [{'id':..., 'text':...}]，按塊打分後按文件聚合取最高分。"""
    flat, owner = [], []
    for d in docs:
        for c in chunk(d["text"]):
            flat.append(c)
            owner.append(d)

    best = {}
    for r in rerank(query, flat, top_n=len(flat)):
        d = owner[r["index"]]
        if r["relevance_score"] > best.get(d["id"], (0, None))[0]:
            best[d["id"]] = (r["relevance_score"], flat[r["index"]], d)

    ranked = sorted(best.values(), key=lambda x: -x[0])[:top_n]
    return [{**d, "score": s, "best_chunk": c} for s, c, d in ranked]
```

<Warning>
  **8192 tokens 是硬上限**，按「query + 單篇文件」這一對計算，超了直接返回 400
  （`This model's maximum context length is 8192 tokens`），**不會靜默截斷**。

  這個上限**不是**整個請求的總量——實測單請求 400 篇 × 1000 字元（合計 33 萬 tokens）正常返回。
  所以切塊既是為了品質，也是為了不撞這個 400。
</Warning>

## 四、閾值怎麼定（別拍腦袋設 0.5）

`relevance_score` 經 sigmoid 對映到 0–1 區間，看起來很像一個置信度。**它不是。**

實測跨全部品質用例的得分分佈：

| 分組                | 真正相關文件的得分割槽間       | 中位數   |
| ----------------- | ------------------ | ----- |
| 中文 query × 中文文件   | 0.289 – 1.000      | 0.948 |
| 非中文同語言（日/韓/俄/法/阿） | 0.005 – 0.998      | 0.241 |
| **跨語言（中↔英）**      | **0.0038 – 0.205** | 0.008 |
| 不相關的干擾項（中文）       | 最高衝到 **0.945**     | 0.029 |

一個 0.5 的固定閾值會：**濾掉全部跨語言正確結果**、濾掉多數非中文場景的第二名，
同時**放行**那篇關鍵詞高度重合的干擾文件
（查詢"蘋果公司 2024 財年營業收入"，一篇講蘋果種植收購價的文件拿到了 0.945，排第三）。

注意最後一行：不相關文件的最高分（0.945）**高於**相關文件的最低分（0.289）。
兩個分佈是重疊的——這從根本上決定了**不存在一個"安全"的絕對閾值**。

<Tip>
  **三種可用的過濾策略，按推薦順序：**

  1. **不過濾，直接取 Top-N**（N = 3\~5）。最簡單，也最不容易出錯。大模型對少量噪聲有容忍度
  2. **相對閾值**：只保留 `score >= top1_score × α`，α 取 0.2–0.3。
     它自動適配了跨語言整體偏低的情況，也能砍掉長尾
  3. **絕對閾值**：只有在**你自己標註了一批樣本、在自己的語料上量過分佈之後**才可以用，
     而且必須按語言、按查詢型別分別定。不要跨場景複用別人的閾值
</Tip>

```python theme={null}
def filter_by_relative_threshold(results, alpha=0.25, max_n=5):
    if not results:
        return []
    top = results[0]["relevance_score"]
    return [r for r in results if r["relevance_score"] >= top * alpha][:max_n]
```

## 五、否定語義要額外兜底

這是模型的明確弱項。查詢"哪些景點適合冬天去？"，兩篇**明確說不適合冬天**的文件排到了第 2、第 3，
把真正相關的擠到第 4、第 5，nDCG\@3 只有 0.47。

模型匹配的是"冬天 + 景點 + 旅遊"這個話題，**沒有理解那個"不"字**。

<Warning>
  凡是包含**否定、排除、條件限定**的查詢——"不含麩質的食譜"、"除了北京以外的分公司"、
  "未成年人不適用的條款"、"哪些區域**不**支援配送"——重排序的 Top-N **不能直接交給使用者**。
</Warning>

**兜底做法**：重排序後加一道輕量大模型判斷。用便宜的小模型即可，成本可控：

```python theme={null}
from openai import OpenAI

client = OpenAI(api_key=os.environ["APIYI_API_KEY"],
                base_url="https://api.apiyi.com/v1")

NEG_HINT = ("不", "別", "除了", "無需", "禁止", "except", "not ", "without")


def verify_if_negated(query, hits):
    """query 含否定語義時，逐條讓小模型確認是否真的滿足條件。"""
    if not any(k in query for k in NEG_HINT):
        return hits
    kept = []
    for h in hits:
        resp = client.chat.completions.create(
            model="gemini-3.5-flash-lite",
            messages=[{"role": "user", "content":
                       f"問題：{query}\n文件：{h['text']}\n"
                       f"這份文件是否**正面滿足**問題的條件？只回答 是 或 否。"}],
            max_tokens=4,
        )
        if "是" in resp.choices[0].message.content:
            kept.append(h)
    return kept
```

## 六、多語言與跨語言

實測中 / 英 / 日 / 韓 / 俄 / 法 / 阿拉伯語，以及中↔英跨語言檢索，**排序全部正確**。
單一模型就能覆蓋多語言知識庫，不需要按語言分別部署。

但要注意**分數量級差異**：

| 場景                  | Top-1 得分（實測） |
| ------------------- | ------------ |
| 中文 query × 中文文件     | 0.97         |
| 韓文 query × 韓文文件     | 0.87         |
| 阿拉伯文 query × 阿拉伯文文件 | 1.00         |
| **中文 query × 英文文件** | **0.20**     |
| **英文 query × 中文文件** | **0.011**    |

跨語言場景下正確答案的絕對分低 1–2 個數量級，但**排序依然正確**。

<Tip>
  多語言庫的兩條建議：

  * **優先用排序，不用分數**。跨語言時相對閾值（策略 2）比絕對閾值可靠得多
  * 若必須用絕對閾值，**按「query 語言 × 文件語言」組合分別標定**，不要一個閾值走天下
</Tip>

## 七、併發、快取與冪等

### 先算配額預算，再談併發

上游（華為雲 MaaS）給本模型的配額是 **TPM 20,000 / RPM 120**。
這是接入這個模型時最容易低估的約束——同平臺 BGE-M3 向量化模型是 1,200,000 TPM，**差 60 倍**。

實測（每組前靜默 70 秒讓配額視窗歸零）分離出兩個**互相獨立**的機制：

| 用例 | 場景                            | 成功率       | token 佔 TPM | 說明             |
| -- | ----------------------------- | --------- | ----------- | -------------- |
| R1 | 併發 10 × 10 請求（極小）             | 4/10      | 4%          | token 可忽略仍失敗   |
| R2 | 併發 20 × 20 請求（極小）             | 5/20      | 3%          | 併發翻倍，成功數仍是 4–5 |
| R4 | **完全序列** 20 請求（1.3K tokens/個） | 11/20     | 97%         | **零併發也 429**   |
| R5 | **完全序列** 20 個極小請求             | **20/20** | 0%          | 序列不受影響         |

**結論一：併發槽位約 4–5 個在途請求。** R1/R2 的 token 消耗只佔 3–4% TPM 卻大面積失敗，
且併發從 10 提到 20 後成功數仍停在 4–5；而 R5 序列 20 次全過。超出槽位的請求**直接 429、不排隊**。

**結論二：TPM 20,000 獨立生效，與併發無關。** R4 完全序列，第 8 個請求在累計 16,093 tokens 時
開始 429，連掛 9 個後窗口滑動恢復：

```
#1–#7   [200]  累計 tokens 遞增到 16,093
#8      [429]  ← 首次拒絕（配額 20,000）
#9–#16  [429]  連續 9 個被拒
#17–#20 [200]  ← 視窗滑動，恢復
```

<Warning>
  兩種失敗的錯誤資訊**完全一樣**（`當前分組上游負載已飽和`），無法從響應區分撞的是槽位還是 TPM。
  只能自己按預算推算，所以下面這張表要在設計階段就用上。
</Warning>

### 每分鐘能跑多少次檢索

按實測 `≈26.9 tokens/文件` 折算：

| 每次查詢的候選數 | 單次 tokens | TPM 20,000 下的理論上限 |
| -------- | --------- | ----------------- |
| 50 條     | 673       | 約 29 次/分鐘         |
| 100 條    | 1,325     | **約 15 次/分鐘**     |
| 200 條    | 2,629     | 約 7 次/分鐘          |

**候選數的選擇同時是品質決策和容量決策**：候選翻倍，檢索品質提升有限，但吞吐直接減半。

這也解釋了為什麼單請求候選集不能太大——1000 條候選 = 26,867 tokens，
**一個請求就吃掉整分鐘預算的 134%**，必然 429；2000 條是 269%。

<Tip>
  **接入清單**：併發上限設 4；實現指數退避重試；按上表核算峰值 QPS 是否夠用；
  高頻查詢接快取（下一節）直接省掉配額。
</Tip>

<Info>
  **配額正在擴容中**：上述 TPM 20,000 是上游給到的初始配額，API易 已在向平臺申請擴容。
  如果你的業務量超出上表的測算，**請直接聯絡 API易客服評估提升上游配額**，
  不必按當前數字自行降級方案。
</Info>

### 快取

實測**同一請求重複 10 次，得分逐位一致**（漂移 0）。
只有打亂候選順序重發時才出現 3.7e-4 量級的漂移（bf16 批處理抖動），排序不受影響。

所以結果**可以放心快取**：

* 快取 key 用 `query 歸一化 + 候選文件內容雜湊（有序）`
* **不要把 `relevance_score` 本身當冪等標識或去重 key**——換個候選順序它就會變最後幾位
* 高頻重複查詢（FAQ、熱門搜尋）快取命中率通常很高，能同時省掉延遲和上游壓力

## 八、接入現成框架

引數名與 Cohere Rerank v1 一致（`query` / `documents` / `top_n` / `return_documents`），
但 **`documents` 只接受字串陣列**，傳 `[{"text": "..."}]` 會返回 400，響應體也沒有 Cohere 的
`id` / `meta` 欄位。

<Warning>
  **`cohere` SDK v2 實測直接用不了**：它請求的是 `/v2/rerank`，
  而該路徑返回的是網站 HTML 首頁（HTTP 200），SDK 拋解析錯誤。自己包一層 HTTP 呼叫最省事。
</Warning>

<CodeGroup>
  ```python LangChain theme={null}
  from typing import Sequence
  import os, requests
  from langchain_core.documents import Document
  from langchain_core.callbacks import Callbacks
  from langchain.retrievers.document_compressors.base import BaseDocumentCompressor


  class ApiyiRerank(BaseDocumentCompressor):
      model: str = "bge-reranker-v2-m3"
      top_n: int = 5
      base_url: str = "https://api.apiyi.com/v1"

      def compress_documents(self, documents: Sequence[Document], query: str,
                             callbacks: Callbacks = None) -> Sequence[Document]:
          docs = list(documents)
          if not docs:
              return []
          r = requests.post(
              f"{self.base_url}/rerank", timeout=120,
              headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
              json={"model": self.model, "query": query,
                    "documents": [d.page_content for d in docs], "top_n": self.top_n},
          )
          r.raise_for_status()
          out = []
          for item in r.json()["results"]:
              d = docs[item["index"]]                    # 按 index 回填，保住 metadata
              d.metadata["relevance_score"] = item["relevance_score"]
              out.append(d)
          return out
  ```

  ```python LlamaIndex theme={null}
  from typing import List, Optional
  import os, requests
  from llama_index.core.postprocessor.types import BaseNodePostprocessor
  from llama_index.core.schema import NodeWithScore, QueryBundle


  class ApiyiRerank(BaseNodePostprocessor):
      model: str = "bge-reranker-v2-m3"
      top_n: int = 5
      base_url: str = "https://api.apiyi.com/v1"

      def _postprocess_nodes(self, nodes: List[NodeWithScore],
                             query_bundle: Optional[QueryBundle] = None
                             ) -> List[NodeWithScore]:
          if not nodes or query_bundle is None:
              return nodes
          r = requests.post(
              f"{self.base_url}/rerank", timeout=120,
              headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
              json={"model": self.model, "query": query_bundle.query_str,
                    "documents": [n.node.get_content() for n in nodes],
                    "top_n": self.top_n},
          )
          r.raise_for_status()
          out = []
          for item in r.json()["results"]:
              n = nodes[item["index"]]
              n.score = item["relevance_score"]
              out.append(n)
          return out
  ```

  ```python 通用封裝（含重試） theme={null}
  import os, time, requests

  BASE = "https://api.apiyi.com/v1"


  def rerank(query, documents, top_n=5, tries=4):
      """帶退避重試的重排序呼叫。429 是上游擁塞，退避後通常能成功。"""
      delay = 5
      for attempt in range(tries):
          r = requests.post(
              f"{BASE}/rerank", timeout=120,
              headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
              json={"model": "bge-reranker-v2-m3", "query": query,
                    "documents": documents, "top_n": top_n},
          )
          if r.status_code == 429 and attempt < tries - 1:
              time.sleep(delay)
              delay *= 2
              continue
          r.raise_for_status()
          return r.json()["results"]
  ```
</CodeGroup>

**Dify / RAGFlow / FastGPT 等平臺**：在「模型供應商 → Rerank 模型」裡選擇相容 Cohere/Jina 介面的
自定義供應商，填入：

| 配置項             | 值                          |
| --------------- | -------------------------- |
| API Base / 介面地址 | `https://api.apiyi.com/v1` |
| API Key         | 你的 API易 令牌（`sk-` 開頭）       |
| 模型名稱            | `bge-reranker-v2-m3`       |

<Warning>
  **地址一定要帶 `/v1`。** 實測 `/rerank` 與 `/v2/rerank` 都會返回 **HTTP 200 + 網站 HTML 首頁**，
  而不是 JSON 404——平臺上表現為"返回內容無法解析"或"模型不可用"，很難定位。
  排查順序：先確認最終請求路徑是 `https://api.apiyi.com/v1/rerank`，再懷疑別的。

  如果平臺會自動追加 `/v1`（填 base 後它拼成 `{base}/v1/rerank`），那就把 API Base 填成
  `https://api.apiyi.com`，避免出現雙 `/v1`。用 `curl` 打一次確認路徑最快。
</Warning>

## 九、上線前的檢查清單

<AccordionGroup>
  <Accordion title="正確性">
    * [ ] 用 `results[].index` 回填原始文件物件，而不是按文本反查
    * [ ] 長文件已切塊（200–500 字），並按文件聚合取最高分
    * [ ] 單個「query + 文件」對不超過 8192 tokens，否則會 400
    * [ ] 含否定/排除語義的查詢有大模型兜底
  </Accordion>

  <Accordion title="穩定性">
    * [ ] 候選集控制在 100 條以內
    * [ ] **併發上限設到 4 以內**（實測上游槽位約 4–5 個在途請求，超出直接 429 不排隊）
    * [ ] **按 TPM 20,000 核算過峰值吞吐**（100 篇候選約 15 次/分鐘），確認夠業務用
    * [ ] 實現了 429 退避重試（上游擁塞是瞬時狀態）
    * [ ] 超時設定 ≥ 60 秒（100 條短文件 P95 約 4.3 秒，但長文件或大候選集會到幾十秒）
    * [ ] 請求路徑確認是 `/v1/rerank`——路徑寫錯返回的是 200 + HTML，不是 404
    * [ ] 模型名拼寫正確且全小寫——寫錯返回的是 503，容易誤判為渠道故障
  </Accordion>

  <Accordion title="效果">
    * [ ] 閾值策略用的是 Top-N 或相對閾值，不是拍腦袋的固定值
    * [ ] 多語言/跨語言場景驗證過分數量級，沒有被低分誤傷
    * [ ] 標註了一小批真實 query 做過 A/B（開/關重排序），確認指標真的漲了
  </Accordion>

  <Accordion title="成本與快取">
    * [ ] 知道 `usage.input_tokens` / `output_tokens` 恆為 0，用量看 `prompt_tokens` / `total_tokens`
    * [ ] 知道 `top_n` 和 `return_documents` 都不影響用量，所有候選都會過一遍模型
    * [ ] 成本核算以控制台賬單為準（`prompt_tokens` 與 `total_tokens` 在 100 篇候選時相差約 45%，
      本輪測試未能確認實際扣的是哪個）
    * [ ] 高頻查詢接了結果快取
  </Accordion>
</AccordionGroup>

## 相關文件

* [bge-reranker-v2-m3 概覽](/zh-Hant/api-capabilities/rerank/overview)
* [重排序 API 線上除錯](/zh-Hant/api-capabilities/rerank/rerank-api)
* [文本向量化](/zh-Hant/api-capabilities/text-embedding)
