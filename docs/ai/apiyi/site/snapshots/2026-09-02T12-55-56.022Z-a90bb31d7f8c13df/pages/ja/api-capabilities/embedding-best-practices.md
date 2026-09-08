> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 実践的なEmbeddingチューニング

> Embeddingから実際に価値を引き出す方法: bge-m3と3つのOpenAIモデルの実測比較、どれくらい大きくチャンク化するか、類似度しきい値をどう設定するか、バッチ処理と同時実行数をどの程度使うか、コストの本当の仕組み、そしてLangChainのデフォルト設定が再現率を80%から15%へ静かに下げてしまう点。

[テキスト埋め込み](/ja/api-capabilities/text-embedding)では、API の呼び出し方法を説明します。このページでは、**正しく使う方法**を説明します。

埋め込みの問題は、失敗した呼び出しとして現れることがほとんどありません。エンドポイントは 200 を返し、次元も正しいのに、
検索品質が静かに低下します。以下の推奨事項はすべて、2026-08-25 (UTC+8) に APIYI ゲートウェイで取得した測定値に基づいています — 一般的な助言ではありません。

<Note>
  **方法**: LLM ゲートウェイ統合に関する中国語文書 20 件と、それに対応する英語文書 20 件、
  人手でラベル付けした回答を持つ中国語クエリ 20 件と英語クエリ 20 件、3 つのモデルすべてを同じコーパスに対して同じ時間帯に実行しました。コーパスは小さいため、**5 ポイント未満の差は決定的ではありません** — いずれも最終的な結論として扱う前に、ご自身のデータで再現してください。
</Note>

## 1. まず適切なモデルを選びます

|                         | `bge-m3`             | `text-embedding-3-small` | `text-embedding-3-large` |
| ----------------------- | -------------------- | ------------------------ | ------------------------ |
| 価格                      | **\$0.01/1M tokens** | \$0.02/1M tokens         | \$0.13/1M tokens         |
| 次元数                     | **1024**             | 1536                     | 3072                     |
| 最大長                     | 8192 tokens          | 8191 tokens              | 8191 tokens              |
| 事前正規化済み                 | はい                   | はい                       | はい                       |
| `dimensions`パラメータ       | ❌ 明示的な 400           | ✅                        | ✅                        |
| 中国語 Recall\@1           | 80%                  | 80%                      | 85%                      |
| 英語 Recall\@1            | 70%                  | 80%                      | 85%                      |
| 混在 zh+en コーパス Recall\@1 | 65%                  | 80%                      | 85%                      |
| 中国語の token 密度           | **2.1 文字/token**     | 0.9 文字/token             | 0.9 文字/token             |

<CardGroup cols={2}>
  <Card title="bge-m3 を選ぶのは次の場合です" icon="check">
    * コーパスの大半が**中国語**（または日本語 / ロシア語）である場合: 検索品質は 3-small と同等で、定価は半額、同じテキストに必要な token は 42% だけです。**実際の支出は約 1/5** になります
    * より小さいストレージを求めている場合: 1024 次元は 1536 より 33%、3072 より 66% 小さいです
    * 長尾言語（100 以上対応）をカバーする必要がある場合
    * 同じオープンソースモデルをローカルで実行して、オフラインとオンラインのベクトルを一致させたい場合
  </Card>

  <Card title="OpenAI を選ぶのは次の場合です" icon="check">
    * コーパスの大半が**英語またはコード**である場合: 品質は 1 段上です。bge-m3 はこの種の内容で token を 15%〜50% 多く消費しますが、単価が半額なので総額ではなお安くなります。**ここでは価格ではなく品質で判断してください**
    * ナレッジベースが**複数言語を混在**しており、1 つの回答だけ返したい場合
    * `dimensions` ストレージを縮小したい場合
    * すでに OpenAI のスコア範囲に合わせてしきい値を調整済みで、やり直したくない場合
  </Card>
</CardGroup>

<Warning>
  **多言語混在コーパスは bge-m3 の弱点です**（Recall\@1 65%）。クロスリンガル検索が弱いからではなく、むしろ逆です。同じ事実の中国語版と英語版をほぼ同じ評価（0.75〜0.87、OpenAI では 0.56〜0.69）にするため、中国語クエリでは英語版が中国語版より上位に来ることがよくあります。

  **RAG が 1 つの回答しか返さない場合**は、インデックスを言語ごとに分けるか、クエリ時に言語フィルターを追加してください。**言語をまたいで資料を集める必要がある場合**は、これは欠点ではなく機能です。
</Warning>

## 2. 長いドキュメントは常にチャンクに分割する

`bge-m3` は 8192-token のコンテキストウィンドウを持っているため、長いマニュアルでも1回の呼び出しに収まります。**しかし、それが良い考えだという意味ではありません。**

測定結果: 20のセクションを1つの長いマニュアルに連結し、各セクションに対応する20の短いドキュメントを強力な撹乱要因として追加し、20の質問で照会すると —

| アプローチ               | 結果                                               |
| ------------------- | ------------------------------------------------ |
| ドキュメント全体を1つのベクトルにする | マニュアルが1位になるのは **10%** の場合                        |
| セクションごとにチャンク化する     | Top1 がマニュアル内に入るのは **75%**、正しいセクションに当たるのは **65%** |

同じ質問では、正しいセクションのスコアはドキュメント全体より平均で **+0.10** 高くなります。

| 質問                           | 全体ドキュメント | 正しいセクション | 差分         |
| ---------------------------- | -------- | -------- | ---------- |
| RMB はどのように USD に変換されますか      | 0.487    | 0.684    | **+0.198** |
| 有効な JSON 出力を保証するにはどうすればよいですか | 0.487    | 0.650    | **+0.163** |
| 401 が返ってきたら、どうすればよいですか       | 0.485    | 0.612    | +0.127     |

長いドキュメントの単一ベクトルは、その中身すべての **平均** なので、正確に書かれた短い
一節ならどれでもそれを上回ります。

<Tip>
  **チャンク化の指針**

  * 意味的な境界で **200〜500 tokens** ごとに分割し、10%〜15% のオーバーラップを持たせる
  * 中国語は1 tokenあたり約2.1文字なので、200〜500 tokens はおおよそ **420〜1050中国語文字**
  * **細かく切り刻みすぎないでください**: すべての入力には2個の固定特別 token が含まれるため、500-token のチャンクでは 0.4% のオーバーヘッドですが、16-token のチャンクでは 12.5% が純粋な無駄になります
  * 各チャンクの先頭にセクション見出しを付けると、チャンクの識別しやすさが目に見えて向上します
</Tip>

## 3. 閾値はモデルごとに再調整する必要があります

OpenAI から `bge-m3` への移行で最も失敗しやすいのが、ここです。**この2つのスコア範囲はまったく異なります。**

同じ手作業でラベル付けしたペアを、3つのモデルすべてで採点した結果です:

| 関係                                                 | `bge-m3`  | `3-small` | `3-large` |
| -------------------------------------------------- | --------- | --------- | --------- |
| 無関係（「ストリーミングを有効にする方法」 ↔ 「今日の北京の天気」）                | **0.417** | 0.094     | 0.108     |
| 言い換え（「429 が返った」 ↔ 「API はレート制限されていると言っています」）        | 0.552     | 0.420     | 0.360     |
| 異言語間の言い換え                                          | 0.753     | 0.557     | 0.681     |
| 主語/目的語が入れ替わった（「ユーザーがモデルに画像を送る」 ↔ 「モデルがユーザーに画像を送る」） | 0.975     | 0.908     | 0.895     |

<Warning>
  `bge-m3`の**下限は0.42**で、OpenAI の下限は0.09です。
  「0.3未満はすべて除外する」といったルールをそのまま流用すると、`bge-m3`ではまったくフィルタリングされません；
  「0.8以上だけを関連ありと見なす」と流用すると、正しい結果のほとんどが捨てられてしまいます。
</Warning>

`bge-m3`で測定された最適な単一閾値:

| シナリオ             | 推奨開始閾値    | その閾値での正解率 |
| ---------------- | --------- | --------- |
| 中国語コーパス / 中国語クエリ | **0.53**  | 75%       |
| 英語コーパス / 英語クエリ   | 0.51      | 80%       |
| クロスリンガル検索        | 0.53–0.55 | 75%–82%   |
| 多言語混在コーパス        | 0.62      | 68%       |

参考までに、中国語シナリオでの最適閾値は、`text-embedding-3-small`で **0.45**、`3-large`で **0.33** です。

<Tip>
  **実際には**: **0.50** から始め、**0.45–0.60** を確認が必要なグレーゾーンとして扱い、本番稼働する前に自分のコーパスから 50–100 件のラベル付きサンプルを使って再調整してください。
</Tip>

## 4. 類似性だけでは、何かが *正しい* かどうかは分かりません

これは **すべての** エンベディングモデルに当てはまります — どれか1つの欠陥ではありませんが、事前に知っておく必要があります:

| ペア                                                                             | `bge-m3` | `3-small` | `3-large` |
| ------------------------------------------------------------------------------ | -------- | --------- | --------- |
| "関数呼び出しをサポートする" ↔ "関数呼び出しをサポート**しない**"                                         | 0.891    | 0.851     | 0.805     |
| "\$**2** / 100万 tokens" ↔ "\$**20** / 100万 tokens"                             | 0.965    | 0.954     | 0.902     |
| "base\_url を api.**apiyi**.com に設定する" ↔ "base\_url を api.**openai**.com に設定する" | 0.873    | 0.878     | 0.738     |
| "ユーザーがモデルに画像を送る" ↔ "モデルがユーザーに画像を送る"                                            | 0.975    | 0.908     | 0.895     |

3つとも失敗します。**コサイン類似度は、2つのテキストが同じ内容についているかどうかを測るものであり、互いに一致しているかどうかを測るものではありません。**

否定、価格、バージョン番号、エンティティ名は、検索段階では切り分けられません。正しい
フォールバックは次のとおりです:

<Steps>
  <Step title="ベクトル検索、上位 50–100">
    `bge-m3` を使って素早く候補を絞り込みます。しきい値は、明らかに無関係なものを除外するだけです。
  </Step>

  <Step title="再ランク付けして上位 3–5 に絞る">
    候補を [`bge-reranker-v2-m3`](/ja/api-capabilities/rerank/overview) に送ります。これは、クエリとドキュメントをモデルに一緒に通すクロスエンコーダーで、**こうした細かな違いを見分けるのにまさに最適なツールです** — しかも、`bge-m3` と同じモデルファミリーです。
  </Step>

  <Step title="生成時に LLM に判定させる">
    上位 3–5 件を元の質問と一緒に渡し、検索した内容が質問と一致しない場合は、何も見つからなかったと prompt に明示的に書いてください。
  </Step>
</Steps>

## 5. バッチサイズと同時実行数

### バッチ処理: 変曲点は64–128です

| バッチ     | 経過時間  | 1件あたり    |
| ------- | ----- | -------- |
| 16      | 1.67s | 105ms    |
| 64      | 5.04s | 79ms     |
| **128** | 7.45s | **58ms** |
| 256     | 14.6s | 57ms     |
| 1024    | 54.4s | 53ms     |

128を超えると、1件あたりのコストはほとんど改善せず（58ms → 53ms）、一方で1回のリクエストは7倍に増えます。
リクエストの所要時間は、クライアントのタイムアウトリスクと、1つの失敗で失われる作業量に直接影響します。

### 同時実行数: オンラインでは8、バルクのインデックス作成では32–48

| 同時実行数       | 成功率       | 総スループット         | 最も遅いリクエスト |
| ----------- | --------- | --------------- | --------- |
| 8（200リクエスト） | **100%**  | 55 items/s      | 5.6s      |
| 48          | 99.3%     | **133 items/s** | 10.2s     |
| 96          | **88.2%** | 65 items/s      | 59.8s     |

* **ライブ取得では同時実行数8を使ってください**: 200リクエストで失敗はゼロです
* **バルクのインデックス作成は32–48まで上げられます**: スループットは最大になりますが、429が出始めるため、指数バックオフが必要です
* **64を超えないでください**: 96では失敗率が11.8%になり、リクエストが約60秒ハングし始めます

<Warning>
  **クライアントは必ず再試行できるようにしてください。** 低い同時実行数でも、約0.8%のリクエストが切断された接続に当たります
  (`Connection aborted / Remote end closed connection`)。
  1回の再試行で解消します。再試行しないと、インデックスに抜けが生じます。

  バルクのインデックス作成では、クライアントのタイムアウトを数百秒ではなく**60〜90秒**に設定してください。ハングしたリクエストは、失敗したリクエストより対処が難しいです。
</Warning>

```python theme={null}
import time
from openai import OpenAI

client = OpenAI(api_key="sk-your-apiyi-key", base_url="https://api.apiyi.com/v1", timeout=90.0)

def embed_batch(texts, model="bge-m3", retries=3):
    """Batch embedding with backoff. Keep batches between 64 and 128."""
    for attempt in range(retries):
        try:
            resp = client.embeddings.create(model=model, input=texts)
            return [d.embedding for d in sorted(resp.data, key=lambda x: x.index)]
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(2 ** attempt)          # 1s, 2s, 4s
```

## 6. コストが実際にどう決まるか

コストは、2つの要素の積です。**単価**と、**あるテキストが何 token になるか**です。
この2つがここでは異なります。

`bge-m3` は **\$0.01 / 1M tokens** で、`text-embedding-3-small` の **\$0.02** と比べて、まず単価が半分です。
さらに、トークナイザ効率もあります。`bge-m3` は XLM-R SentencePiece を使用し、**1 tokenあたり約2.1中国語文字** になりますが、OpenAI の cl100k は約 **0.9** です:

| コーパス             | `bge-m3` tokens | OpenAI tokens | token比率 | **実コスト**  |
| ---------------- | --------------- | ------------- | ------- | --------- |
| 中国語の技術文書（492文字）  | **231**         | 552           | 0.42×   | **0.21×** |
| 日本語（456文字）       | **231**         | 480           | 0.48×   | **0.24×** |
| ロシア語（810文字）      | **213**         | 411           | 0.52×   | **0.26×** |
| 中国語+英語の混在（760文字） | 413             | 360           | 1.15×   | 0.57×     |
| 英語の技術文書（1053文字）  | 210             | 182           | 1.15×   | 0.58×     |
| コードスニペット（1200文字） | 453             | 300           | 1.51×   | 0.76×     |

**中国語コーパスのコストは、`text-embedding-3-small` のおよそ5分の1です。**
英語とコードでは `bge-m3` でより多くの token を消費しますが、単価が半分であるため、総支出でも OpenAI を下回ります。したがって、この2つのコーパスでは判断基準は **検索品質（English Recall\@1 70% vs 80%）であり、価格ではありません**。

ストレージも異なります。ベクトルはすでに L2 正規化されており、返される値は fp16 精度なので、**`bge-m3` ベクトルを float16 で保存しても精度への影響はありません**:

| レイアウト                                   | ベクトルあたり  | 100万ベクトル |
| --------------------------------------- | -------- | -------- |
| `bge-m3` 1024-d float16                 | **2 KB** | **2 GB** |
| `bge-m3` 1024-d float32                 | 4 KB     | 4 GB     |
| `text-embedding-3-small` 1536-d float32 | 6 KB     | 6 GB     |
| `text-embedding-3-large` 3072-d float32 | 12 KB    | 12 GB    |

<Tip>
  ベクトルは正規化された状態で返ってきます（測定された L2 ノルムは 0.99992–1.00029）ので、**内積がそのまま cosine similarity です**。`IP` と `COSINE` のインデックスタイプは、ベクトルデータベース内で同一の結果を返し、`IP` は 1 回分の正規化処理を省けます。
</Tip>

## 7. ひそかに失敗するモード

### 7.1 LangChain のデフォルトは再現率を 80％ から 15％ に落とします

<Warning>
  `langchain_openai.OpenAIEmbeddings` のデフォルトは `check_embedding_ctx_length=True` で、これが **最初にテキストを tiktoken の token id にエンコードし**、整数配列を `/v1/embeddings` に送ります。

  これは、トークナイザーが *tiktoken そのもの* である OpenAI のモデルに対しては問題ありません。`bge-m3` は XLM-R のトークナイザーを使っており、両者の id 空間には共通点がありません。

  **呼び出しは引き続き 200 を返し、ベクトルも 1024 次元のまま、`usage` も正常に見えます。— ただし検索品質だけが静かに崩壊します。**
</Warning>

計測結果:

| チェック                                                | 結果            |
| --------------------------------------------------- | ------------- |
| 同じ文を text として送った場合と tiktoken token ids として送った場合の類似度 | **0.282**     |
| 中国語コーパスの Recall\@1                                  | **80% → 15%** |

修正方法:

```python theme={null}
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(
    model="bge-m3",
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1",
    check_embedding_ctx_length=False,   # required, otherwise tiktoken ids go out instead of text
    chunk_size=64,
)
```

同じリスクは、**送信前にクライアント側で token 化するあらゆるラッパー**にも当てはまります。サードパーティの埋め込みモデルを組み込むときは、SDK が生のテキストを送るのか、それとも token id を送るのかを確認してください。

### 7.2 空文字列が有効な入力として受け入れられる

`input: ""` は `bge-m3` に対して **200** を返し（ここで OpenAI は 400 を返します）、1024 次元のベクトルを生成し、2 tokens 課金されます。

空のチャンクを除外しないチャンク分割スクリプトは、検索時にランダムに現れる意味のないベクトルでインデックスを埋めてしまいます。**インデックス作成前に空白のテキストを除外してください。**

### 7.3 `dimensions` パラメータは拒否されます

```json theme={null}
{ "model": "bge-m3", "input": "...", "dimensions": 512 }
```

400 を返します: `Model "bge-m3" does not support matryoshka representation, changing output dimensions will lead to poor results.`

`bge-m3` は Matryoshka representation で学習されていないため、**ベクトルを切り詰めると品質が測定可能なほど低下します**。次元を自分で削るのではなく、ストレージを小さくするには float16 を使ってください。

### 7.4 モデル名は大文字小文字を区別し、別名はありません

`bge-m3` だけが機能します。`BAAI/bge-m3` と `BGE-M3` はどちらも 503 「利用可能なチャネルがありません」を返します。

### 7.5 8192 は入力ごとの上限です

8192 tokens を超える単一入力は 400 を返し、**決して黙って切り詰められることはありません**。こちらのほうが安全な挙動です。見た目は正常なベクトルなのに、テキストの後半をひそかに失ったものを受け取ることはありません。

この上限は **リクエストごとではなく、アイテムごと** に適用されます。テストでは、**1024 items / 102560 tokens** を含む 1 回の呼び出しが正常に返りました。いずれか 1 つのアイテムが上限を超えるとリクエスト全体が失敗し、エラー内の token 数は**合計ではなく、そのアイテム**を指します。

## 8. そのままコピーできる最小実装

```python theme={null}
"""Minimal working bge-m3 indexing + retrieval."""
import time
import numpy as np
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1",
    timeout=90.0,
)

MODEL = "bge-m3"
BATCH = 96          # keep between 64 and 128
THRESHOLD = 0.50    # starting point; recalibrate on your own samples before launch


def embed(texts, retries=3):
    """Batch embedding with backoff. Returns float16 vectors."""
    texts = [t.strip() for t in texts if t and t.strip()]   # drop blanks, see 7.2
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
    # already normalized, so float16 storage is lossless here, see section 6
    return np.array(out, dtype=np.float16)


def search(query, doc_vectors, docs, top_k=50):
    """Vectors are normalized, so the dot product is cosine similarity."""
    qv = embed([query])[0].astype(np.float32)
    scores = doc_vectors.astype(np.float32) @ qv
    order = np.argsort(-scores)[:top_k]
    return [(docs[i], float(scores[i])) for i in order if scores[i] >= THRESHOLD]


if __name__ == "__main__":
    docs = ["...your chunks, 200-500 tokens each..."]
    dv = embed(docs)
    for text, score in search("your question", dv, docs):
        print(f"{score:.4f}  {text[:60]}")
    # In production, hand this Top 50 to bge-reranker-v2-m3, see section 4
```

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="テキスト埋め込み API" icon="vector-square" href="/ja/api-capabilities/text-embedding">
    パラメータ、レスポンス形式、クイックスタート
  </Card>

  <Card title="リランク" icon="list-ordered" href="/ja/api-capabilities/rerank/overview">
    `bge-reranker-v2-m3`、精度段階に適したツール
  </Card>

  <Card title="RAG チューニング" icon="sliders-horizontal" href="/ja/api-capabilities/rerank/rag-best-practices">
    2段階検索、どれだけの候補をリコールするか
  </Card>

  <Card title="モデル料金" icon="tags" href="/en/models">
    各埋め込みモデルの最新料金
  </Card>
</CardGroup>
