> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 実践における RAG チューニング

> bge-reranker-v2-m3 から実際に価値を引き出す方法です。2段階の検索構成、再現する候補数、長いドキュメントのチャンク化方法、relevance_score のしきい値の設定、否定表現の扱い、さらに LangChain / LlamaIndex / Dify の統合コードまでを解説します。

[概要](/ja/api-capabilities/rerank/overview)では、このモデルが何であるかを説明しています。このページでは**正しく使う方法**を説明します。

各推奨事項は 2026-07-30 (UTC+8) に取得した APIYI の計測結果に基づいており、一般的なアドバイスではありません。

## 1. アーキテクチャを正しくする: 2段階リトリーバル

再ランキングは単独のリトリーバル手法ではありません。これはパイプラインの第2段階です。

<Steps>
  <Step title="候補抽出">
    **ベクター検索** または **BM25** を使って、コーパス全体から候補セットを取り出します。この段階は
    **高速** である必要があり、**オーバーフェッチ** すべきです。目的は「答えがこの中のどこかにある」ことであり、
    「答えが最初にある」ことではありません。
  </Step>

  <Step title="再ランキング">
    候補セットとクエリを `bge-reranker-v2-m3` に送ってスコアリングし、再ソートします。
    この段階は **高精度** である必要があります。目的は、正しい答えを上位に押し上げることです。
  </Step>

  <Step title="切り詰めて LLM に渡す">
    再ランキング後の上位 3–5 件を prompt に入れます。**これがより正確であるほど、モデルの幻覚は減り、必要なコンテキストも少なくなります。**
  </Step>
</Steps>

<Info>
  **なぜ recall と rerank をすべて省略できないのか**: クロスエンコーダーは、何かを計算する前にクエリを必要とするため、事前にオフラインで計算しておくことはできません。数百万件のドキュメントを1件ずつスコアリングするのは、コストとレイテンシの両面で現実的ではありません。候補抽出で数百万件を数百件に絞り込み、再ランキングでその数百件を正しく並べ替えます。
</Info>

### 完全な動作例

これは、最小構成ながら完全な2段階リトリーバーです — `text-embedding-3-small` による候補抽出、`bge-reranker-v2-m3` による再ランキングで、どちらも同じ APIYI token を使います:

```python theme={null}
import os
import numpy as np
import requests

BASE = "https://api.apiyi.com/v1"
HEADERS = {"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"}


def embed(texts):
    """Batch embed. In production, document vectors live in a vector DB."""
    r = requests.post(f"{BASE}/embeddings", headers=HEADERS, timeout=60,
                      json={"model": "text-embedding-3-small", "input": texts})
    r.raise_for_status()
    data = sorted(r.json()["data"], key=lambda x: x["index"])
    return np.array([d["embedding"] for d in data])


def rerank(query, documents, top_n=5):
    """Rerank. documents must be a plain string array."""
    r = requests.post(f"{BASE}/rerank", headers=HEADERS, timeout=120,
                      json={"model": "bge-reranker-v2-m3", "query": query,
                            "documents": documents, "top_n": top_n})
    r.raise_for_status()
    return r.json()["results"]


def search(query, corpus, recall_k=50, final_k=5):
    """corpus: [{'id':..., 'text':..., 'meta':...}, ...]"""
    # ---- Stage 1: vector recall ----
    doc_vecs = embed([c["text"] for c in corpus])          # from your vector DB in production
    q_vec = embed([query])[0]
    doc_vecs /= np.linalg.norm(doc_vecs, axis=1, keepdims=True)
    q_vec /= np.linalg.norm(q_vec)
    recalled_idx = np.argsort(-(doc_vecs @ q_vec))[:recall_k]
    candidates = [corpus[i] for i in recalled_idx]

    # ---- Stage 2: rerank ----
    results = rerank(query, [c["text"] for c in candidates], top_n=final_k)

    # Key step: map back by index so you keep ids and metadata
    return [{**candidates[r["index"]], "score": r["relevance_score"]}
            for r in results]


corpus = [
    {"id": "kb-001", "text": "A 429 means you hit a rate limit. Reduce concurrency, implement "
                             "exponential backoff on the client, or ask for a higher RPM quota."},
    {"id": "kb-002", "text": "HTTP 4xx status codes indicate client errors: 400 bad parameters, "
                             "401 unauthorized, 403 forbidden, 404 not found."},
    {"id": "kb-003", "text": "To check your balance, call /v1/dashboard/billing/subscription."},
]

for hit in search("My API requests keep returning 429 — how do I fix it?",
                  corpus, recall_k=3, final_k=2):
    print(f"{hit['score']:.4f}  [{hit['id']}]  {hit['text'][:40]}")
```

<Warning>
  **必ず `index` で元に戻してください; 返却されたテキストでドキュメントを検索しないでください。**
  ドキュメントの内容は重複することがあります — 同一の2つのドキュメントにはビット単位で同一のスコアが付き、区別できません — そのため、テキスト検索では誤った ID とメタデータが紐づきます。
</Warning>

## 2. 何件の候補を検索すべきですか？

測定レイテンシ（短い文書、各段で 5 回実行したときの P50）:

| 候補数  | P50    | P95    |
| ---- | ------ | ------ |
| 1    | 2.00 s | 2.58 s |
| 10   | 2.35 s | 2.68 s |
| 25   | 2.52 s | 2.81 s |
| 50   | 2.92 s | 3.39 s |
| 100  | 3.80 s | 4.32 s |
| 500  | \~15 s | —      |
| 1000 | \~33 s | —      |
| 2000 | \~68 s | —      |

重要なのは、**約 2 秒の固定オーバーヘッド**です。文書が 1 件でも 2 秒かかります。1 件から 100 件に増やしても追加は 1.8 秒だけで、検索品質の向上はそれをはるかに上回る価値があります。

**実際にレイテンシを左右するのは合計 tokens 数であって、文書数ではありません。** 同じ 50 件の候補でも:

| 50 candidates   | Input tokens | P50 latency |
| --------------- | ------------ | ----------- |
| 短い文書（各約 20 文字）  | 673          | 2.48 s      |
| 長い文書（各約 480 文字） | 20,606       | 11.74 s     |

件数は同じでも、レイテンシは 4.7 倍です。これが、次のセクションのチャンク分割が recall を遅くしない理由でもあります — チャンク分割は文書数を増やしますが、合計 tokens は増やしません。

<Tip>
  **推奨 `recall_k`: 50–100.**

  * 20 未満: すでに recall リストは短いので、修正すべき順位の誤りはあまり残っておらず、わずかな効果のために固定オーバーヘッドを払っているだけです
  * 200 を超える: レイテンシが対話性を損ない始め、recall リストの末尾に答えが入っていることはめったにないため、限界効果はゼロに近づきます
  * **1000 以上: 429 になるのが確定です。** 1000 件の候補は 26,867 tokens で、TPM 20,000 の1分あたり予算全体（134%）を超えるため、リトライしてもリクエストは失敗確定です
</Tip>

本当に大量の文書を順位付けする必要がある場合（たとえばオフラインのバッチ処理）は、**同時実行数を 4 に抑えたまま、複数の 100 文書以下のリクエストに分割**してください。分割しても合計 tokens は減らない点に注意してください。TPM 20,000 は依然として全体の上限なので、バッチジョブには分単位のスロットリングが必要です。そのクォータは拡張中です。大規模なバッチワークロードの場合は、まず APIYI サポートで現在使える余裕を確認してください。

## 3. 長い文書をチャンク化する

これは、最も効果の高い前処理ステップです。理由は2つの測定値で説明できます。

**まず、無関係な内容は関連度を薄めます。** 同じ一致文に、さまざまな量のダミー文を後ろへ追加した場合です。

| 全長         | 先頭に一致 | 末尾に一致 | 末尾 / 先頭 |
| ---------- | ----- | ----- | ------- |
| 528 chars  | 0.933 | 0.720 | 0.77    |
| 1028 chars | 0.931 | 0.500 | 0.54    |
| 2028 chars | 0.925 | 0.793 | 0.86    |
| 4028 chars | 0.907 | 0.351 | 0.39    |
| 8028 chars | 0.828 | 0.181 | 0.22    |

**次に、長さはノイズスコアを押し上げます。** 同じ無関係な文書は、短いときは 0.029 でしたが、450 文字のダミー文を追加すると 0.121 になり、4倍高くなりました。

合わせると、**答えが末尾にある長い文書は、完全に話題外の長い文書に負けます。**

<Tip>
  **チャンク化戦略**

  1. **200〜500文字**にチャンク化し、10〜20% のオーバーラップを持たせて、答えが境界で切れないようにします
  2. 各チャンクを、`documents` 配列の独立した要素として送ります
  3. **最も高いチャンクスコア** を文書のスコアとして採用し、その後文書単位で重複排除します
  4. プロンプトを作成するときは、マッチしたチャンクだけを送るか、全文書を送るかのどちらかにします。コンテキスト予算が許すほうを選んでください
</Tip>

```python theme={null}
def chunk(text, size=400, overlap=60):
    step = size - overlap
    return [text[i:i + size] for i in range(0, max(len(text) - overlap, 1), step)]


def rerank_long_docs(query, docs, top_n=5):
    """docs: [{'id':..., 'text':...}] — score by chunk, aggregate to best chunk per document."""
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
  **8192 tokens はハードリミット** で、クエリと文書のペアごとに適用されます。これを超えると 400
  (`This model's maximum context length is 8192 tokens`) が返されます。**暗黙に切り詰められることはありません**。

  この制限はリクエスト全体に対するものではありません。400 文書 × 1000 文字
  (330K tokens) の1回のリクエストは通常どおり返ります。つまり、チャンク化は品質を守るだけでなく、この 400 に対する保護にもなります。
</Warning>

## 4. 閾値の設定（0.5 をそのまま選ばないでください）

`relevance_score` はシグモイドで 0–1 の範囲に写像されるため、信頼度のように見えます。**しかし、そうではありません。**

すべての品質テストケースで測定した分布は次のとおりです:

| グループ                      | 真に関連する文書のスコア範囲     | 中央値   |
| ------------------------- | ------------------ | ----- |
| 中国語クエリ × 中国語文書            | 0.289 – 1.000      | 0.948 |
| 同一言語・非中国語（JA/KO/RU/FR/AR） | 0.005 – 0.998      | 0.241 |
| **クロスリンガル（ZH ↔ EN）**      | **0.0038 – 0.205** | 0.008 |
| 無関係なディストラクタ（中国語）          | **0.945** でピーク     | 0.029 |

固定の 0.5 閾値では、**正しいクロスリンガルの結果はすべて除外され**、非中国語では 2 位のヒットの大半も落ちます。一方で、キーワードの重なりが大きいディストラクタは**通してしまいます**（「Apple Inc. FY2024 revenue」の場合、りんご栽培の価格に関する文書が 0.945 を獲得して 3 位になりました）。

最後の行に注目してください。最も高スコアの*無関係な*文書（0.945）が、最も低スコアの*関連する*文書（0.289）を上回っています。2つの分布は重なっており、まさにそれが **「安全な」絶対閾値が存在しない** 理由です。

<Tip>
  **実用的なフィルタリング戦略は、推奨順に次の 3 つです:**

  1. **フィルタしない — Top-N を取る**（N = 3–5）。最も簡単で、失敗しにくい方法です。LLM は少しのノイズなら許容します
  2. **相対閾値**: `score >= top1_score × α` となる結果を残します。α は 0.2–0.3 程度です。これなら低いクロスリンガルのベースラインに自動で合わせつつ、長いテールも削れます
  3. **絶対閾値**: **自分のサンプルにラベルを付け、自分のコーパスで分布を測定した後** に限って使ってください。さらに、その後は言語ごと、クエリタイプごとに個別に設定します。ほかの人の閾値を使い回してはいけません
</Tip>

```python theme={null}
def filter_by_relative_threshold(results, alpha=0.25, max_n=5):
    if not results:
        return []
    top = results[0]["relevance_score"]
    return [r for r in results if r["relevance_score"] >= top * alpha][:max_n]
```

## 5. 否定には安全策が必要です

これはこのモデルの明らかな弱点です。「冬に訪れるのに良い観光地はどこですか？」では、**明示的に該当しないと述べている** 2つの文書が2位と3位になり、本当に関連性の高い結果が4位と5位に押し下げられました。nDCG\@3 は 0.47 でした。

モデルは「冬 + 観光地 + 旅行」というトピックに一致しましたが、**否定をまったく処理しませんでした**。

<Warning>
  **否定、除外、または条件文** を含むクエリ — 「グルテンフリーのレシピ」「北京の外にある
  オフィス」「未成年には適用されない条項」「配送を**サポートしない**地域はどこか」 —
  では、再ランキングされた Top-N をそのままユーザーに渡しては**いけません**。
</Warning>

**対策**: 再ランキングの後に、軽量な LLM の検証パスを追加します。安価な小型モデルで十分です:

```python theme={null}
from openai import OpenAI

client = OpenAI(api_key=os.environ["APIYI_API_KEY"],
                base_url="https://api.apiyi.com/v1")

NEG_HINT = ("not ", "n't", "without", "except", "exclude", "free of", "non-")


def verify_if_negated(query, hits):
    """When the query carries negation, confirm each hit actually satisfies it."""
    q = query.lower()
    if not any(k in q for k in NEG_HINT):
        return hits
    kept = []
    for h in hits:
        resp = client.chat.completions.create(
            model="gemini-3.5-flash-lite",
            messages=[{"role": "user", "content":
                       f"Question: {query}\nDocument: {h['text']}\n"
                       f"Does this document positively satisfy the question's condition? "
                       f"Answer only YES or NO."}],
            max_tokens=4,
        )
        if "YES" in resp.choices[0].message.content.upper():
            kept.append(h)
    return kept
```

## 6. 多言語およびクロスリンガルの利用

中国語、英語、日本語、韓国語、ロシア語、フランス語、アラビア語、さらに ZH↔EN のクロスリンガル検索も、テストではすべて**正しい順序で**並びます。1つのモデルで多言語ナレッジベースをカバーできるため、言語ごとのデプロイは不要です。

ただし、**スコアの大きさ**には注意してください。

| ケース                    | 測定されたトップ1スコア |
| ---------------------- | ------------ |
| 中国語クエリ × 中国語ドキュメント     | 0.97         |
| 韓国語クエリ × 韓国語ドキュメント     | 0.87         |
| アラビア語クエリ × アラビア語ドキュメント | 1.00         |
| **中国語クエリ × 英語ドキュメント**  | **0.20**     |
| **英語クエリ × 中国語ドキュメント**  | **0.011**    |

クロスリンガルの正解スコアは 1〜2 桁ほど低くなりますが、それでも**順序は維持されます**。

<Tip>
  多言語コーパスには 2 つのルールがあります。

  * **スコアより順序を優先してください。** ここでは、絶対値のしきい値よりも相対しきい値（戦略 2）の方がはるかに安全です
  * どうしても絶対しきい値を使う必要がある場合は、全体で共通にするのではなく、**クエリ言語 × ドキュメント言語の組み合わせごとに調整**してください
</Tip>

## 7. 同時実行数、キャッシュ、冪等性

### まずクォータを見積もり、それから同時実行数を考える

上流側（Huawei Cloud MaaS）は、このモデルに対して **TPM 20,000 / RPM 120** を許可しています。これは最も過小評価されがちな制約です。同じプラットフォーム上の BGE-M3 embedding モデルは 1,200,000 TPM で、**60倍** です。

テストでは、各ケースの前に 70 秒間何も送らずにクォータのウィンドウをリセットし、2つの**独立した**メカニズムを切り分けました。

| ケース | シナリオ                              | 成功        | TPM に対する token の割合 | 備考                   |
| --- | --------------------------------- | --------- | ------------------ | -------------------- |
| R1  | 10 同時実行 × 10 リクエスト（小さい）           | 4/10      | 4%                 | token がほとんどないのに失敗    |
| R2  | 20 同時実行 × 20 リクエスト（小さい）           | 5/20      | 3%                 | 同時実行数を2倍にしても 4〜5 のまま |
| R4  | **完全シリアル** 20 リクエスト（各 1.3K token） | 11/20     | 97%                | **同時実行数ゼロでも 429**    |
| R5  | **完全シリアル** 20 の小さいリクエスト           | **20/20** | 0%                 | シリアル実行には影響なし         |

**発見1: 同時進行中スロットはおおむね 4〜5 個です。** R1/R2 は TPM の 3〜4% しか消費しないのに広く失敗し、同時実行数を 10 から 20 に増やしても成功数は 4〜5 に上限がかかります。一方で、R5 の 20 件のシリアルリクエストはすべて通ります。スロット上限を超えたリクエストは**キューに入らず、そのまま拒否**されます。

**発見2: TPM 20,000 は同時実行数とは独立して適用されます。** R4 は完全シリアルであり、8 件目のリクエストが累積 16,093 token で 429 になり、ウィンドウがずれる前に 9 回連続で失敗します。

```
#1–#7   [200]  cumulative tokens climbing to 16,093
#8      [429]  ← first rejection (quota 20,000)
#9–#16  [429]  nine consecutive failures
#17–#20 [200]  ← window slides, recovers
```

<Warning>
  Both failure modes return the **identical** message (`upstream load saturated`), so the response
  gives you no way to tell which limit you hit. You have to budget for them — which is what the
  table below is for, at design time.
</Warning>

### 1分あたりの検索回数

計測した `≈26.9 tokens/document` を使うと:

| クエリあたりの候補数 | 1回あたりの token 数 | TPM 20,000 における理論上限 |
| ---------- | -------------- | ------------------- |
| 50         | 673            | \~29 / 分            |
| 100        | 1,325          | **\~15 / 分**        |
| 200        | 2,629          | \~7 / 分             |

**候補数は品質だけでなく容量の判断でもあります**: 候補数を2倍にしても品質向上は限定的ですが、スループットは半分になります。

また、1回のリクエストに候補数を載せすぎられない理由もこれで説明できます。1000 候補は 26,867 token で、**1分の予算全体の 134% を1回で使う**ため、429 は確実です。2000 では 269% です。

<Tip>
  **統合チェックリスト**: 同時実行数を 4 に制限する; 指数バックオフを実装する; ピーク QPS を
  上の表と照合する; 頻繁なクエリはキャッシュする（次節）ことでクォータを完全に回避する。
</Tip>

<Info>
  **クォータ拡張は進行中です。** 上記の TPM 20,000 は上流側の初期割り当てであり、
  APIYI はすでに引き上げ申請を行っています。ワークロードが表で許容される範囲を超える場合は、
  **現在の数に合わせて設計を縮小するのではなく、APIYI サポートに連絡して上流クォータの見直しを依頼してください**。
</Info>

### キャッシュ

**同一のリクエストを10回繰り返すと、bit 単位で同一**です（ドリフトはゼロ）。約 3.7e-4 のドリフトが出るのは、候補の**順序**をシャッフルした場合だけです（bf16 バッチ処理のジッターによる）で、順序自体は影響を受けません。

そのため、結果は**安全にキャッシュできます**:

* `normalised query + ordered hash of document contents` をキーにする
* **`relevance_score` 自体を冪等性キーや重複排除キーとして使わない** — 候補の順序を変えると末尾の数字が変わります
* 繰り返しのクエリ（FAQ、人気検索）はたいていキャッシュに向いており、レイテンシと上流側への負荷の両方を減らせます

## 8. 既存フレームワークとの統合

パラメータ名は Cohere Rerank v1（`query` / `documents` / `top_n` / `return_documents`）と一致しますが、**`documents` は文字列配列しか受け付けません** — `[{"text": "..."}]` は 400 を返します — そしてレスポンスには `id` / `meta` フィールドがありません。

<Warning>
  **`cohere` SDK v2 はそのままでは動作しません**: `/v2/rerank` を対象にしており、そのパスは HTTP 200 でサイトの HTML ホームページを返すため、SDK はパースエラーを投げます。HTTP 呼び出しを自前でラップするのが最も簡単です。
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
              d = docs[item["index"]]                    # map back by index, keeping metadata
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

  ```python 汎用ラッパー（再試行付き） theme={null}
  import os, time, requests

  BASE = "https://api.apiyi.com/v1"


  def rerank(query, documents, top_n=5, tries=4):
      """Rerank with backoff. A 429 means upstream congestion and usually clears on retry."""
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

**Dify / RAGFlow / FastGPT の場合**: Model Provider → 再ランキングモデル で、Cohere/Jina インターフェースに対応したカスタムプロバイダーを選び、次を入力します:

| 設定         | 値                           |
| ---------- | --------------------------- |
| API Base   | `https://api.apiyi.com/v1`  |
| API Key    | APIYI の token（`sk-` で始まります） |
| Model name | `bge-reranker-v2-m3`        |

<Warning>
  **パスには `/v1` を含める必要があります。** `/rerank` と `/v2/rerank` はどちらも JSON の 404 ではなく **HTTP 200 でサイトの HTML ホームページ** を返します。これはプラットフォーム上では「解析できないレスポンス」や「モデルを利用できません」として表れ、原因の特定が難しいです。ほかを疑う前に、最終的なリクエスト URL が `https://api.apiyi.com/v1/rerank` になっていることを確認してください。

  プラットフォームが自動で `/v1` を追加する場合（`{base}/v1/rerank` を構成する場合）は、API Base を `https://api.apiyi.com` に設定し、`/v1` が二重にならないようにしてください。単発の `curl` でパスを最も早く確認できます。
</Warning>

## 9. リリース前チェックリスト

<AccordionGroup>
  <Accordion title="正確性">
    * [ ] `results[].index`を使って逆参照し、テキスト一致では行わない
    * [ ] 長いドキュメントは 200〜500 文字でチャンク化し、最良チャンクスコアで集約する
    * [ ] 単一のクエリとドキュメントの組み合わせが 8192 tokens を超えない
    * [ ] 否定や除外を含むクエリには LLM の検証パスを用意する
  </Accordion>

  <Accordion title="信頼性">
    * [ ] 候補セットは 100 件上限にする
    * [ ] **同時実行数は 4 に制限**（計測では、上流は約 4〜5 件の in-flight リクエストを許容し、それ以上はキューイングされず即座に拒否される）
    * [ ] **ピークスループットが TPM 20,000 に対して十分か確認**し（候補 100 件で約 15 検索/分）、問題ないことを確認する
    * [ ] 429 に対するバックオフ付き再試行を実装する（上流の混雑は一時的）
    * [ ] タイムアウトは 60 秒以上に設定する（短いドキュメント 100 件なら P95 で約 4.3 秒だが、長いドキュメントや大きなセットでは数十秒に達する）
    * [ ] リクエストパスが `/v1/rerank` であることを確認する — 間違ったパスでは 404 ではなく 200 + HTML が返る
    * [ ] モデル名は正しく小文字で記載する — টাইポは 503 を返し、障害と見間違えやすい
  </Accordion>

  <Accordion title="品質">
    * [ ] フィルタリングは、推測した固定値ではなく Top-N か相対しきい値を使う
    * [ ] 多言語およびクロスリンガルのスコアの大きさを確認し、低いスコアが除外されないようにする
    * [ ] 小さなラベル付きクエリセットで A/B テストを行い（rerank を有効/無効で比較）、メトリクスが実際に動いたことを確認する
  </Accordion>

  <Accordion title="コストとキャッシュ">
    * [ ] `usage.input_tokens` / `output_tokens` は常に 0 であることを理解し、`prompt_tokens` / `total_tokens` を読む
    * [ ] `top_n` も `return_documents` も使用量を減らさないことを理解する — すべての候補がスコア付けされる
    * [ ] コスト計上はコンソールの請求書に基づいて行う（`prompt_tokens` と `total_tokens` は候補 100 件で約 45% 異なり、今回のラウンドではどちらが課金されるか確認できなかった）
    * [ ] 高頻度のクエリに対する結果キャッシュを用意する
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [bge-reranker-v2-m3 の概要](/ja/api-capabilities/rerank/overview)
* [Rerank API プレイグラウンド](/ja/api-capabilities/rerank/rerank-api)
* [テキスト埋め込み](/ja/api-capabilities/text-embedding)
