> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 向量檢索實戰調優

> 怎麼把 Embedding 用對：bge-m3 與 OpenAI 三款模型的實測對照、切塊多大、相似度閾值怎麼定、批次與併發開多少、成本怎麼算，以及 LangChain 接第三方 embedding 時那個會讓召回率從 80% 掉到 15% 的預設配置。

[文本向量化](/zh-Hant/api-capabilities/text-embedding) 講了怎麼把介面調通。這一頁講**怎麼把它用對**。

Embedding 的坑幾乎都不在「調不通」——介面返回 200、維度也對，但召回品質悄悄崩掉。
下面每一條建議都對應 API易 2026 年 8 月 25 日 (UTC+8) 的實測資料，不是通用套話。

<Note>
  **測試方法**：圍繞「大模型閘道接入」構造 20 篇中文文件 + 一一對應的 20 篇英文文件，
  20 條中文 query + 20 條英文 query 人工標註答案，同一批語料在同一時間窗內跑三個模型。
  語料規模有限，**小於 5 個百分點的差距不構成結論**，請按自己的語料復現。
</Note>

## 一、先選對模型

|                   | `bge-m3`             | `text-embedding-3-small` | `text-embedding-3-large` |
| ----------------- | -------------------- | ------------------------ | ------------------------ |
| 價格                | **\$0.01/1M tokens** | \$0.02/1M tokens         | \$0.13/1M tokens         |
| 向量維度              | **1024**             | 1536                     | 3072                     |
| 最大長度              | 8192 token           | 8191 token               | 8191 token               |
| 是否已歸一化            | 是                    | 是                        | 是                        |
| 支援降維 `dimensions` | ❌ 明確報錯               | ✅                        | ✅                        |
| 中文檢索 Recall\@1    | 80%                  | 80%                      | 85%                      |
| 英文檢索 Recall\@1    | 70%                  | 80%                      | 85%                      |
| 中英混合庫 Recall\@1   | 65%                  | 80%                      | 85%                      |
| 中文 token 密度       | **2.1 字/token**      | 0.9 字/token              | 0.9 字/token              |

<CardGroup cols={2}>
  <Card title="選 bge-m3 的場景" icon="check">
    * 語料**以中文為主**：檢索品質與 3-small 同檔，單價是它的一半，
      同一批中文文本的 token 數又只有它的 42% —— **實際花費約 1/5**
    * 想省儲存：1024 維比 1536 省 33%、比 3072 省 66%
    * 需要覆蓋冷門語種（100+ 語言）
    * 希望本地能跑同一個開源模型，保證線上線下向量一致
  </Card>

  <Card title="選 OpenAI 的場景" icon="check">
    * 語料**以英文或程式碼為主**：檢索品質高一檔。這類內容上 bge-m3 的 token 數反而多 15%–50%，
      但單價減半之後總花費仍然更低，所以**這裡該按品質選，不是按價格選**
    * 知識庫裡**中英文混排**、又只要返回一條答案
    * 需要 `dimensions` 降維來壓縮儲存
    * 已有大量按 OpenAI 分數帶標定的閾值，不想重標
  </Card>
</CardGroup>

<Warning>
  **中英混合庫是 bge-m3 的弱項**（Recall\@1 65%）。原因不是它跨語言不行，恰恰相反：
  它給「同一件事的中文版和英文版」打的分太接近（實測 0.75–0.87，OpenAI 只有 0.56–0.69），
  中文提問經常把英文版排到中文版前面。

  **只要一條答案的 RAG**，請按語種分庫，或在檢索時帶上語種過濾條件；
  **要跨語種把資料召齊**的場景，這反而是它的優點。
</Warning>

## 二、長文件一定要切塊

`bge-m3` 的視窗是 8192 token，一篇上萬字的手冊整篇塞得進去。**但不該這麼做。**

實測：把 20 個小節串成一篇長手冊，候選集裡另放 20 篇「每篇正好對應其中一節」的強幹擾短文，
再用 20 條問題去檢索——

| 做法     | 結果                                     |
| ------ | -------------------------------------- |
| 整篇一條向量 | 長手冊排第 1 的比例 **10%**                    |
| 按小節切塊  | Top1 落在本手冊的比例 **75%**，精確命中正確小節 **65%** |

同一個問題，對「整篇」和「正確那一小節」的相似度平均相差 **+0.10**：

| 問題                | 整篇    | 正確小節  | 差          |
| ----------------- | ----- | ----- | ---------- |
| 美元和人民幣是怎麼換算的      | 0.487 | 0.684 | **+0.198** |
| 怎樣保證模型輸出的是合法 JSON | 0.487 | 0.650 | **+0.163** |
| 提示 401 未授權怎麼辦     | 0.485 | 0.612 | +0.127     |

一篇長文的單一向量是全文語義的**平均值**，會被任何一段精準的短文本壓過去。

<Tip>
  **切塊建議**

  * 按語義段落切 **200–500 token**，塊間重疊 10%–15%
  * 中文約 2.1 字一個 token，所以 200–500 token ≈ **420–1050 個漢字**
  * **不要切成幾十 token 的碎塊**：每條輸入固定附帶 2 個特殊 token，
    500 token 的塊裡佔 0.4%，16 token 的碎塊裡就是 12.5% 的純浪費
  * 把標題拼進每個塊的開頭，能明顯改善「這段在講什麼」的可辨識度
</Tip>

## 三、相似度閾值必須按模型重標

這是從 OpenAI 遷到 `bge-m3` 時最容易翻車的地方。**兩者的分數帶完全不同。**

同一批人工標註的語義對，三個模型給出的分：

| 語義關係                         | `bge-m3`  | `3-small` | `3-large` |
| ---------------------------- | --------- | --------- | --------- |
| 完全無關（「如何開啟流式輸出」↔「今天北京天氣」）    | **0.417** | 0.094     | 0.108     |
| 同義改寫（「返回 429」↔「提示觸發限流」）      | 0.552     | 0.420     | 0.360     |
| 跨語言同義                        | 0.753     | 0.557     | 0.681     |
| 主客體互換（「使用者給模型發圖」↔「模型給使用者發圖」） | 0.975     | 0.908     | 0.895     |

<Warning>
  `bge-m3` 的**地板在 0.42**，OpenAI 在 0.09。
  照抄「低於 0.3 就丟掉」這類經驗值，在 `bge-m3` 上等於完全不設防；
  照抄「0.8 以上才算相關」，則會把絕大多數正確結果一起扔掉。
</Warning>

實測出的最佳單一閾值（`bge-m3`）：

| 場景         | 建議起步閾值    | 該閾值下的準確率 |
| ---------- | --------- | -------- |
| 中文庫 / 中文提問 | **0.53**  | 75%      |
| 英文庫 / 英文提問 | 0.51      | 80%      |
| 跨語言檢索      | 0.53–0.55 | 75%–82%  |
| 中英混合庫      | 0.62      | 68%      |

作為對照，`text-embedding-3-small` 中文場景的最佳閾值是 **0.45**，`3-large` 是 **0.33**。

<Tip>
  **落地做法**：起步取 **0.5**，把 **0.45–0.60** 當成需要人工確認的灰區，
  上線前用自己語料的 50–100 條標註樣本重標一次。
</Tip>

## 四、相似度不能用來判斷「說得對不對」

這一條對**所有** embedding 模型都成立，不是某個模型的缺陷，但必須提前知道：

| 文本對                                            | `bge-m3` | `3-small` | `3-large` |
| ---------------------------------------------- | -------- | --------- | --------- |
| 「支援函式呼叫」↔「**不**支援函式呼叫」                         | 0.891    | 0.851     | 0.805     |
| 「每百萬 token **2** 美元」↔「每百萬 token **20** 美元」     | 0.965    | 0.954     | 0.902     |
| 「改成 api.**apiyi**.com」↔「改成 api.**openai**.com」 | 0.873    | 0.878     | 0.738     |
| 「使用者給模型發圖片」↔「模型給使用者發圖片」                        | 0.975    | 0.908     | 0.895     |

三個模型全部失守。**餘弦相似度衡量的是「在不在談同一件事」，不是「說法是否一致」。**

所以否定、價格數字、版本號、實體名這類關鍵差異，**檢索階段一定分不開**。正確的兜底是：

<Steps>
  <Step title="向量召回 Top 50–100">
    用 `bge-m3` 把候選範圍快速縮小，閾值只用來擋掉明顯無關的。
  </Step>

  <Step title="重排序精排 Top 3–5">
    用 [`bge-reranker-v2-m3`](/zh-Hant/api-capabilities/rerank/overview) 對候選逐條打分。
    它是 query 和文件拼在一起過一遍模型的 Cross-Encoder，**恰好擅長區分這類細微差異**，
    而且和 `bge-m3` 出自同一個模型家族。
  </Step>

  <Step title="生成階段讓大模型自己判斷">
    把 Top 3–5 連同原始問題一起交給大模型，在提示詞裡明確要求「若檢索內容與問題不符，直接說沒有找到」。
  </Step>
</Steps>

## 五、批次與併發怎麼開

### 批次：64–128 是拐點

| 批次      | 單次耗時  | 每條攤薄     |
| ------- | ----- | -------- |
| 16      | 1.67s | 105ms    |
| 64      | 5.04s | 79ms     |
| **128** | 7.45s | **58ms** |
| 256     | 14.6s | 57ms     |
| 1024    | 54.4s | 53ms     |

128 條以後每條攤薄成本幾乎不再下降（58ms → 53ms），單次耗時卻漲了 7 倍。
單次耗時直接決定客戶端超時風險，以及一次失敗要重做多少工作。

### 併發：線上 8，灌庫 32–48

| 併發       | 成功率       | 整體吞吐        | 最慢請求  |
| -------- | --------- | ----------- | ----- |
| 8（200 次） | **100%**  | 55 條/秒      | 5.6s  |
| 48       | 99.3%     | **133 條/秒** | 10.2s |
| 96       | **88.2%** | 65 條/秒      | 59.8s |

* **線上即時檢索走併發 8**：實測 200 次零失敗
* **離線灌庫可以開到 32–48**：吞吐最高，但已經開始出現 429，必須帶指數退避
* **不要超過 64**：96 併發失敗率 11.8%，且出現 59 秒級的掛起請求

<Warning>
  **客戶端必須帶重試。** 即使在低併發下也觀測到約 0.8% 的連線被中斷
  （`Connection aborted / Remote end closed connection`）。
  這類失敗重試一次就能過，但不重試就是灌庫中間斷一條。

  離線灌庫的客戶端超時建議設 **60–90 秒**，不要設幾百秒等著 —— 掛起比失敗更難處理。
</Warning>

```python theme={null}
import time
from openai import OpenAI

client = OpenAI(api_key="sk-your-apiyi-key", base_url="https://api.apiyi.com/v1", timeout=90.0)

def embed_batch(texts, model="bge-m3", retries=3):
    """帶退避重試的批次向量化。批次控制在 64-128 條。"""
    for attempt in range(retries):
        try:
            resp = client.embeddings.create(model=model, input=texts)
            return [d.embedding for d in sorted(resp.data, key=lambda x: x.index)]
        except Exception as e:
            if attempt == retries - 1:
                raise
            time.sleep(2 ** attempt)          # 1s, 2s, 4s
```

## 六、成本怎麼算

成本由兩件事相乘決定：**單價**和**同一段文本被切成多少 token**。兩者在這裡都不一樣。

`bge-m3` 是 **\$0.01 / 1M tokens**，`text-embedding-3-small` 是 **\$0.02**，單價先差一半。
再疊上分詞效率——`bge-m3` 用 XLM-R 的 SentencePiece，中文約 **2.1 字/token**，
OpenAI 的 cl100k 中文只有約 **0.9 字/token**：

| 語料             | `bge-m3` token 數 | OpenAI token 數 | token 倍數 | **實際花費**  |
| -------------- | ---------------- | -------------- | -------- | --------- |
| 中文技術文件（492 字）  | **231**          | 552            | 0.42×    | **0.21×** |
| 日文（456 字）      | **231**          | 480            | 0.48×    | **0.24×** |
| 俄文（810 字）      | **213**          | 411            | 0.52×    | **0.26×** |
| 中英混排（760 字）    | 413              | 360            | 1.15×    | 0.57×     |
| 英文技術文件（1053 字） | 210              | 182            | 1.15×    | 0.58×     |
| 程式碼片段（1200 字）  | 453              | 300            | 1.51×    | 0.76×     |

**中文語料的實際花費約為 `text-embedding-3-small` 的 1/5。**
英文和程式碼上 `bge-m3` 消耗的 token 更多，但單價減半之後總花費仍然更低——
所以這兩類語料該不該用它，**看的是檢索品質（英文 Recall\@1 70% vs 80%），不是價格**。

儲存側同樣有差距。向量已 L2 歸一化、返回值本身就是 fp16 精度，
所以**用 float16 存 `bge-m3` 的向量是零精度損失的**：

| 方案                                      | 每條       | 100 萬條   |
| --------------------------------------- | -------- | -------- |
| `bge-m3` 1024 維 float16                 | **2 KB** | **2 GB** |
| `bge-m3` 1024 維 float32                 | 4 KB     | 4 GB     |
| `text-embedding-3-small` 1536 維 float32 | 6 KB     | 6 GB     |
| `text-embedding-3-large` 3072 維 float32 | 12 KB    | 12 GB    |

<Tip>
  向量已經歸一化（實測 L2 範數 0.99992–1.00029），所以**點積就等於餘弦相似度**。
  向量庫裡索引選 `IP`（內積）和 `COSINE` 結果等價，選 `IP` 還能省一次歸一化開銷。
</Tip>

## 七、幾個會靜默出錯的坑

### 7.1 LangChain 的預設配置會讓召回率從 80％ 掉到 15％

<Warning>
  `langchain_openai.OpenAIEmbeddings` 預設 `check_embedding_ctx_length=True`，
  它會**先用 tiktoken 把文本編碼成 token id**，再把整數陣列發給 `/v1/embeddings`。

  這在 OpenAI 自家模型上沒問題，因為分詞器就是 tiktoken。
  但 `bge-m3` 用的是 XLM-R 分詞器，兩套 id 空間完全不同。

  **介面照樣返回 200、維度照樣是 1024、`usage` 也正常，只有召回品質悄悄崩掉。**
</Warning>

實測代價：

| 檢查項                                     | 結果            |
| --------------------------------------- | ------------- |
| 同一句話「文本輸入」與「tiktoken token-id 輸入」的向量相似度 | **0.282**     |
| 中文庫檢索 Recall\@1                         | **80% → 15%** |

修復方式：

```python theme={null}
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(
    model="bge-m3",
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1",
    check_embedding_ctx_length=False,   # 必須關掉，否則發出去的是 tiktoken 的 token id
    chunk_size=64,                      # 每批 64 條
)
```

同類風險存在於**任何「客戶端先分詞再發 id」的封裝**。接第三方 embedding 模型時，
先確認 SDK 發出去的是原始文本還是 token id。

### 7.2 空字串會被當成有效輸入

`input: ""` 在 `bge-m3` 上返回 **200**（OpenAI 官方此處是 400），會得到一條 1024 維向量並計費 2 token。

切塊指令碼如果沒過濾空塊，知識庫裡就會混進一批無意義向量，還會在檢索時隨機冒出來。
**入庫前自己過濾空白文本。**

### 7.3 `dimensions` 引數不能用

```json theme={null}
{ "model": "bge-m3", "input": "...", "dimensions": 512 }
```

返回 400：`Model "bge-m3" does not support matryoshka representation, changing output dimensions will lead to poor results.`

`bge-m3` 沒有做 Matryoshka 訓練，**截斷向量會顯著掉點**。要壓縮儲存請用 float16，不要自己截斷維度。

### 7.4 模型名大小寫敏感、沒有別名

只有 `bge-m3` 可用。`BAAI/bge-m3`、`BGE-M3` 都會返回 503「無可用渠道」。

### 7.5 8192 是「每條輸入」的上限

單條超過 8192 token 直接返回 400，**不會靜默截斷**（這是好事：不會拿到一個丟了後半段卻看著正常的向量）。

但這個上限是**逐條**判定的，不是整次請求：實測單次請求塞進 **1024 條 / 102560 token** 仍然正常返回。
批次裡只要有一條超限，整個請求就 400，報錯裡的 token 數是**那一條**的，不是總和。

## 八、一份可以直接抄的最小實現

```python theme={null}
"""bge-m3 灌庫 + 檢索的最小可用實現。"""
import time
import numpy as np
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1",
    timeout=90.0,
)

MODEL = "bge-m3"
BATCH = 96          # 64-128 之間
THRESHOLD = 0.50    # 起步值，上線前用自己的樣本重標


def embed(texts, retries=3):
    """批次向量化，帶退避重試。返回 float32 陣列。"""
    texts = [t.strip() for t in texts if t and t.strip()]   # 過濾空塊，見 7.2
    out = []
    for i in range(0, len(texts), BATCH):
        chunk = texts[i:i + BATCH]
        for attempt in range(retries):
            try:
                resp = client.embeddings.create(model=MODEL, input=chunk)
                out += [d.embedding for d in sorted(resp.data, key=lambda x: x.index)]
                break
            except Exception:
                if attempt == retries - 1:
                    raise
                time.sleep(2 ** attempt)
    # 向量已歸一化，直接存 float16 無精度損失，見第六節
    return np.array(out, dtype=np.float16)


def search(query, doc_vectors, docs, top_k=50):
    """向量已歸一化，點積即餘弦相似度。"""
    qv = embed([query])[0].astype(np.float32)
    scores = doc_vectors.astype(np.float32) @ qv
    order = np.argsort(-scores)[:top_k]
    return [(docs[i], float(scores[i])) for i in order if scores[i] >= THRESHOLD]


if __name__ == "__main__":
    docs = ["……你的切塊結果，每塊 200-500 token……"]
    dv = embed(docs)
    for text, score in search("使用者的問題", dv, docs):
        print(f"{score:.4f}  {text[:60]}")
    # 生產環境請把這裡的 Top 50 交給 bge-reranker-v2-m3 精排，見第四節
```

## 相關文件

<CardGroup cols={2}>
  <Card title="文本向量化 API" icon="vector-square" href="/zh-Hant/api-capabilities/text-embedding">
    介面引數、返回格式、快速上手
  </Card>

  <Card title="重排序模型" icon="list-ordered" href="/zh-Hant/api-capabilities/rerank/overview">
    `bge-reranker-v2-m3`，精排環節的正確解法
  </Card>

  <Card title="RAG 實戰調優" icon="sliders-horizontal" href="/zh-Hant/api-capabilities/rerank/rag-best-practices">
    兩段式檢索架構、召回條數怎麼定
  </Card>

  <Card title="模型價格" icon="tags" href="/models">
    全部 embedding 模型的即時價格
  </Card>
</CardGroup>
