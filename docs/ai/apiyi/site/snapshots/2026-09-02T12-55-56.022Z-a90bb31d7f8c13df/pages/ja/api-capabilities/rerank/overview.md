> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# bge-reranker-v2-m3 テキスト再ランキング

> bge-reranker-v2-m3 は、多言語の再ランキングモデルで、取得した候補をクエリに対してスコアリングして並べ替えます。RAG の検索品質を向上させる最も手頃で実用的なアップグレードです。APIYI では /v1/rerank で利用でき、料金は 1M tokens あたり $0.01 です。

`bge-reranker-v2-m3` は、BAAI によるオープンソースの多言語リランキングモデルです。検索システムで最もよくある単一の失敗、つまり **ベクトル検索は正しいドキュメントを返したのに、上位のものが実際には質問に答えていない** という問題を解決します。

APIYI は標準の `/v1/rerank` エンドポイントを提供しています。1つの token で、他のすべてのモデルと同じキーを使います。

<Info>
  **モデル名**: `bge-reranker-v2-m3` (case-sensitive). **エンドポイント**: `POST /v1/rerank`.
  `default` と `svip` のグループで利用できます。
  このページのすべての数値は、2026-07-30 (UTC+8) における APIYI のテスト結果で、60+ 件のテストケースに基づいています。
</Info>

## それが何か、そしてどんなときに使うか

reranker は **cross-encoder** です。クエリと各候補ドキュメントを連結し、そのペアをモデルにそのまま通して、関連度スコアを直接出力します。

これは embedding モデルとは本質的に異なります:

|                  | 埋め込み（ベクトル検索）                         | Rerank                           |
| ---------------- | ------------------------------------ | -------------------------------- |
| どのように計算するか       | クエリとドキュメントを**別々に**エンコードし、その後距離で比較します | クエリとドキュメントを**一緒に**モデルへ通します       |
| 事前にインデックス化できますか? | ✅ ドキュメントベクトルはオフラインで計算してベクトルDBに保存します  | ❌ 計算にはクエリが必要です — 事前計算できるものはありません |
| 速度               | 高速。数百万件のドキュメントに対してもミリ秒単位です           | 低速。候補数に応じてスケールします                |
| 精度               | 中程度                                  | 高い                               |
| 役割               | **再現率**: 数百万件の中から数十件を拾い上げます          | **適合率**: 数十件の中から最良の数件を選びます       |

したがって、ベクトル検索の代わりになるわけではありません。**その後ろに置かれる第2段階**です。

<Warning>
  reranker は **インデックスを構築できず、検索もできません**。ベクトル出力がなく、クエリなしでは
  ドキュメントを処理できません。やりたいことが「ドキュメントをベクトルデータベースに入れる」
  であれば、このモデルではなく [テキスト埋め込み](/ja/api-capabilities/text-embedding) が必要です。
</Warning>

### 具体的な比較

候補ドキュメントは同じ10件、クエリも同じ（「My API requests keep returning 429 — how do I fix it?」）、変わるのはランキング手法だけです:

| ランキング手法                             | nDCG\@3  | P\@3     | 上位3件に入ったもの                                    |
| ----------------------------------- | -------- | -------- | --------------------------------------------- |
| ベクトル類似度のみ（`text-embedding-3-small`） | 0.53     | 0.33     | 直接回答、**4xxステータスコードの用語集**、**データセンターのメンテナンス告知** |
| さらに `bge-reranker-v2-m3` を追加        | **1.00** | **1.00** | 直接回答、直接回答、指数バックオフの解説                          |

ベクトル検索では、HTTP 4xx の用語集と「4月29日」に触れたメンテナンス告知が上位3件に入りました。どちらも話題としては近く、クエリと語彙も共有していますが、どちらも質問には答えていません。reranker はその両方を下げました。

それが価値のすべてです。**「同じ話題」と「実際に質問へ答えている」を分けることです。**

## モデル情報

| Property          | Value                                                                  |
| ----------------- | ---------------------------------------------------------------------- |
| **Model name**    | `bge-reranker-v2-m3`（大文字・小文字を区別します。名前が異なると503が返ります）                    |
| **Architecture**  | クロスエンコーダー、XLM-RoBERTa-large バックボーン、bge-m3 からファインチューニング                 |
| **Parameters**    | 約568M（0.6B）                                                            |
| **Context limit** | **8192 tokens、クエリ-ドキュメントの各ペアにつき**（測定済み：これを超えると400が返り、サイレントな切り捨てはありません） |
| **Languages**     | 中国語、英語、日本語、韓国語、ロシア語、フランス語、アラビア語で正しい順序を確認済みです。クロスリンガル検索が機能します           |
| **Endpoint**      | `POST /v1/rerank`                                                      |
| **Groups**        | `default`, `svip`                                                      |
| **Upstream**      | Huawei Cloud ModelArts（公式パススルー）                                        |
| **License**       | Apache 2.0                                                             |

## 料金

| 項目 | 価格                          |
| -- | --------------------------- |
| 入力 | \$0.01 / 1M tokens          |
| 出力 | なし（このモデルは出力 tokens を生成しません） |

<Info>
  **無視できるほど安いです。** 100件の候補を再ランク付けするコスト（約2,700 tokens）は、およそ \$0.000027 です。
  100万回実行しても \$27 です。RAG システムでは、再ランク付けがコストのボトルネックになることはほとんどありません —
  **制約になるのはレイテンシであって、お金ではありません**。候補セットのサイズは、支出ではなくレイテンシに合わせて調整してください。
</Info>

**使用上の意味合い**（計測値）:

* `prompt_tokens` = クエリ（1回分としてカウント）に加えて、すべての候補ドキュメントです。実際には厳密に線形で、`≈ 26.9 × doc count + 7` です（当てはめ誤差 \< 0.31%）ので、クライアント側で予測できます
* `total_tokens` のほうが大きく、その差は候補数が増えるほど広がります。これは、クエリがクエリ-ドキュメントのペアごとに1回ずつカウントされることと一致します
* `input_tokens` / `output_tokens` はこのチャネルでは **常に 0** です。使わないでください
* `top_n` と `return_documents` は **usage を変えません** — どちらの場合でも各候補はスコアリングされます

<Warning>
  今回は、課金記録から charges が `prompt_tokens` なのか
  `total_tokens` なのかを確認できませんでした（テスト用 token ではアカウント残高のエンドポイントを読み取れません）。100件の候補では、
  2つの差は約45%あります。コストを重視する作業では、`usage` フィールドから支出を計算するのではなく、
  コンソールの請求書を正として扱ってください。
</Warning>

## 最小限の呼び出し

<CodeGroup>
  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/rerank \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "bge-reranker-v2-m3",
      "query": "What are the must-see attractions in Hangzhou?",
      "documents": [
        "West Lake is Hangzhou'\''s most famous attraction, known for Broken Bridge and Leifeng Pagoda.",
        "The Bund in Shanghai sits along the Huangpu River and is the city'\''s signature landmark.",
        "Lingyin Temple, in Hangzhou'\''s West Lake district, is a well-known Buddhist temple."
      ],
      "top_n": 2
    }'
  ```

  ```python Python theme={null}
  import os, requests

  resp = requests.post(
      "https://api.apiyi.com/v1/rerank",
      headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
      json={
          "model": "bge-reranker-v2-m3",
          "query": "What are the must-see attractions in Hangzhou?",
          "documents": [
              "West Lake is Hangzhou's most famous attraction, known for Broken Bridge and Leifeng Pagoda.",
              "The Bund in Shanghai sits along the Huangpu River and is the city's signature landmark.",
              "Lingyin Temple, in Hangzhou's West Lake district, is a well-known Buddhist temple.",
          ],
          "top_n": 2,
      },
      timeout=60,
  ).json()

  for r in resp["results"]:
      print(f"{r['relevance_score']:.4f}  {r['document']['text']}")
  ```

  ```javascript Node.js theme={null}
  const resp = await fetch('https://api.apiyi.com/v1/rerank', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.APIYI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'bge-reranker-v2-m3',
      query: 'What are the must-see attractions in Hangzhou?',
      documents: [
        "West Lake is Hangzhou's most famous attraction, known for Broken Bridge and Leifeng Pagoda.",
        "The Bund in Shanghai sits along the Huangpu River and is the city's signature landmark.",
        "Lingyin Temple, in Hangzhou's West Lake district, is a well-known Buddhist temple.",
      ],
      top_n: 2,
    }),
  });

  const data = await resp.json();
  data.results.forEach((r) => console.log(r.relevance_score, r.document.text));
  ```
</CodeGroup>

レスポンス:

```json theme={null}
{
  "results": [
    { "document": { "text": "West Lake is Hangzhou's most famous attraction..." }, "index": 0, "relevance_score": 0.97265625 },
    { "document": { "text": "Lingyin Temple, in Hangzhou's West Lake district..." }, "index": 2, "relevance_score": 0.1181640625 }
  ],
  "usage": { "prompt_tokens": 70, "total_tokens": 91 }
}
```

<Tip>
  **`index` が重要なフィールドです。** これは、送信した
  `documents` 配列内における文書の **元の位置** です。これを使って、自分の文書オブジェクト（ID、URL、メタデータ）を参照してください —
  返された `text` で照合しようとしないでください。
</Tip>

## リクエストパラメータ

| パラメータ              | 型         | 必須 | 備考                                                |
| ------------------ | --------- | -- | ------------------------------------------------- |
| `model`            | string    | ✓  | 常に`bge-reranker-v2-m3`、**大文字小文字を区別します**           |
| `query`            | string    | ✓  | 検索クエリです。空文字列を指定すると 400 を返します                      |
| `documents`        | string\[] | ✓  | 候補です。**プレーンな文字列配列のみ**。空配列を指定すると 400 を返します         |
| `top_n`            | int       |    | 上位 N 件を返します。省略 / `0` / 負の値の場合はすべて返します。使用量には影響しません |
| `return_documents` | bool      |    | ⚠️ **このチャネルでは効果がありません** — 既知の問題は以下を参照してください       |

## 測定済み機能マトリクス

| 機能                          | 結果                                                              |
| --------------------------- | --------------------------------------------------------------- |
| 中国語の意味的ランキング                | ✅ nDCG\@3 = 1.00                                                |
| キーワードトラップ耐性                 | ✅ 上位2件は正解ですが、攪乱要因がまだかなり高得点になる場合があります（下記参照）                      |
| 多言語間（ZH ↔ EN）               | ✅ 順序は正しいですが、絶対スコアは1〜2桁低下します                                     |
| 多言語（JA / KO / RU / FR / AR） | ✅ 5つすべてが正しく順序付けされます                                             |
| **否定の理解**                   | ❌ **明確な弱点**、nDCG\@3 = 0.47（下記参照）                                |
| 決定性                         | ✅ リクエストを10回繰り返してもビット単位で同一です。候補をシャッフルしてもずれは 3.7e-4 のみです          |
| 重複ドキュメントの一貫性                | ✅ 同一のドキュメントにはビット単位で同一のスコアが付きます                                  |
| リクエストごとの最大候補数               | ✅ 実運用では2000でも動作しますが、**100以下に抑えてください**                           |
| 最大ドキュメント長                   | 1ペアあたり8192 tokens。それを超えると400が返されます（黙って切り捨てられることはありません）          |
| **上流のクォータ**                 | ⚠️ TPM 20,000 / RPM 120、同時スロットは約4〜5、100候補時は1分あたり約15件の検索です（下記参照） |
| `return_documents: false`   | ❌ パラメータは無視されます                                                  |

## 知っておくべき3つのこと

<AccordionGroup>
  <Accordion title="1. relevance_score は、クエリ間で比較できる信頼度ではありません" icon="triangle-alert">
    つい「0.5で単純にフィルタする」と考えがちですが、**計測データを見ると、それではうまくいきません:**

    | ケース                       | 本当に関連するドキュメントのスコア範囲          |
    | ------------------------- | ---------------------------- |
    | 中国語クエリ × 中国語ドキュメント        | 0.289 – 1.000（中央値 0.948）     |
    | 同一言語・非中国語（JA/KO/RU/FR/AR） | **0.005 – 0.998**（中央値 0.241） |
    | **クロスリンガル（ZH ↔ EN）**      | **0.0038 – 0.205**           |
    | キーワードの重なりが大きい無関係なノイズ文書    | **0.945** まで上昇               |

    0.5 のしきい値では、**正しいクロスリンガル結果をすべて捨ててしまい**、非中国語では2位のヒットの大半も
    捨てることになります。一方で、「Apple Inc. FY2024 revenue.」というクエリに対して、
    リンゴ栽培の価格に関するドキュメントを**受け入れてしまいます**。

    **代わりにどうするか**: これは信頼度ではなく、ソートキーとして扱ってください。どうしてもフィルタするなら、
    相対しきい値（`score >= top1_score × 0.3`）を使うか、Top-N を取るだけにして、自分の
    ラベル付きデータでキャリブレーションしてください。
  </Accordion>

  <Accordion title="2. 否定はこのモデルの明確な弱点です" icon="circle-x">
    クエリ: 「冬に訪れるのに良い観光地はどこですか？」 2件の候補は明確に逆のことを言っています:

    | 順位 | スコア   | ドキュメント                              | 実際に関連あり？ |
    | -- | ----- | ----------------------------------- | -------- |
    | #1 | 0.811 | Harbin Ice and Snow World… 冬のトップ観光地 | ✅        |
    | #2 | 0.769 | Beidaihe… **冬の旅行には適していない**          | ❌        |
    | #3 | 0.531 | Qinghai Lake… **冬にはおすすめではない**       | ❌        |
    | #4 | 0.375 | Wusong Island… 冬に必見                 | ✅        |
    | #5 | 0.289 | Sanya… 冬の定番避暑地                      | ✅        |

    モデルは「冬 + 観光地 + 旅行」というトピックに一致しただけで、**否定を処理しませんでした**。
    nDCG\@3 は 0.47 しかありませんでした。

    **対策**: 否定、除外、条件文を含むクエリ（「グルテンフリー」、「北京以外ならどこでも」、「未成年には適用外」など）では、リランキング後に LLM による検証パスを追加してください — Top-N をそのままユーザーに渡してはいけません。
  </Accordion>

  <Accordion title="3. 長いドキュメントは関連度を薄め、ノイズも増やします" icon="scissors">
    同じ一致文に、無関係なダミー文をさまざまな量だけ追加した場合:

    | 合計長        | 一致が**先頭**にある場合のスコア | 一致が**末尾**にある場合のスコア |
    | ---------- | ------------------ | ------------------ |
    | 528 chars  | 0.933              | 0.720              |
    | 1028 chars | 0.931              | 0.500              |
    | 4028 chars | 0.907              | 0.351              |
    | 8028 chars | 0.828              | 0.181              |

    さらに、**長さは無関係なドキュメントも膨らませます**: 同じ非一致ドキュメントは、短い場合は 0.029 でしたが、
    付け足すと 0.121 になり、4倍高くなりました。

    **対策**: リランキング前に長いドキュメントを 200〜500 文字にチャンク化し、最もスコアの高い
    チャンクをそのドキュメントのスコアとして採用してください。チャンク化は、このモデルで最も効果の大きい
    前処理です。
  </Accordion>
</AccordionGroup>

完全なチューニング手法 — チャンク化、しきい値、リコールのサイズ決定 — は [実践的なRAGチューニング](/ja/api-capabilities/rerank/rag-best-practices) にあります。

## 既知の問題

<Warning>
  **`return_documents` は効果がありません**（2026-07-30 時点で計測）。`true`、`false` を渡しても、あるいは
  完全に省略しても、`document.text` がそのまま返されます。帯域に敏感なワークロード（候補集合が大きく、
  ドキュメントが長い場合）では応答が想定よりはるかに大きくなります。フラグに頼らず、`index` で結果を自分で対応付けてください。
</Warning>

<Warning>
  **モデル名を誤ると 404 ではなく 503 が返ります。** メッセージは
  `Current group default has no available channels for model xxx` です。名前は **大文字と小文字を区別します** —
  `BGE-Reranker-v2-M3` は存在しないモデルとして扱われます。統合時に 503 が出たら、
  チャネル障害を疑う前にスペルを確認してください。
</Warning>

<Warning>
  **上流のクォータはこのモデルにとって最も厳しい制約です。統合する前に token を見積もってください。**

  上流（Huawei Cloud MaaS）では、このモデルに **TPM 20,000 / RPM 120** まで利用できます。 同じプラットフォーム上の BGE-M3
  埋め込みモデルでは TPM 1,200,000 が割り当てられます。**60倍多い** です。

  検証では、2つの **独立した** メカニズムが切り分けられました:

  | メカニズム                        | 計測された挙動                                                                                                             |
  | ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
  | **約4〜5の同時インフライトスロット**        | 10 同時 → 4 件成功; 20 同時 → 5 件成功（token は TPM の 3〜4% にすぎない）; **20 件の直列リクエスト → 20/20 件成功**                                |
  | **TPM 20,000 のスライディングウィンドウ** | **同時実行数ゼロ** でも発動します: 1.3K-token のリクエストを直列に送ると、8 件目で累計 16,093 token に達した時点で 429 が返り、9 件連続で失敗します。その後ウィンドウがスライドして回復します |

  スロット上限を超えたリクエストは **キューに積まれず、その場で拒否されます**。また、どちらの失敗でも同一の
  メッセージ `upstream load saturated` が返るため、レスポンスだけでは見分けられません。したがって、それらも見込んで設計する必要があります。

  **推奨事項**: 同時実行数を 4 に抑え、指数バックオフを追加し、下の表を基準にスループットを設計してください。
</Warning>

### 1分あたりの検索回数

計測された `≈26.9 tokens/document` を基に TPM 20,000 に照らすと:

| 1クエリあたりの候補数 | 1回あたりの token 数 | 理論上限           |
| ----------- | -------------- | -------------- |
| 50          | 673            | \~29 / min     |
| 100         | 1,325          | **\~15 / min** |
| 200         | 2,629          | \~7 / min      |

これにより、1 回のリクエストに候補を載せすぎられない理由も説明できます: 1000 candidates は
26,867 token で、**1 回のリクエストだけで 1 分間の予算全体の 134% を消費**するため、429 は確実です。2000 candidates では 269% になります。

<Info>
  **クォータ拡大は進行中です。** 上記の TPM 20,000 は上流の初期割り当てであり、
  APIYI はすでに引き上げを申請しています。ワークロードが表の許容量を超える場合は、
  現在の数値に合わせて設計を縮小するのではなく、**APIYI サポートに連絡して上流のクォータを見直してもらってください**。
</Info>

<Warning>
  **`/v1/rerank` だけが有効なパスです。** `/rerank` または `/v2/rerank`（Cohere v2 SDK の
  デフォルト）を要求すると、JSON の 404 ではなく **HTTP 200 でウェブサイトの HTML ホームページ** が返ります。クライアント側では
  紛らわしいパースエラーに見えるだけです。統合で "unparseable response" と報告されたら、まず `/v1` を確認してください。
</Warning>

## FAQ

<AccordionGroup>
  <Accordion title="ベクトル検索またはリランキングのどちらか一方だけを使えますか？">
    ベクトル検索のみ: 使えますが、Top-N の精度はかなり低下します（計測した nDCG\@3 は
    1.00 から 0.53 に低下）。

    リランキングのみ: **いいえ。** ベクトル出力がなく、候補セットが必要です。数百万件の
    文書を1件ずつスコアリングするのは、実用的でもコスト的にも現実的ではありません。

    標準的な形は2段階です。ベクトル検索/BM25 で 50〜100 件をリコールし → 3〜5 件まで
    リランキング → LLM に渡します。
  </Accordion>

  <Accordion title="何件の候補をリコールすべきですか？">
    計測したレイテンシは候補数にほぼ線形に比例します（短い文書の場合）。10 ≈ 2 s、
    100 ≈ 4 s、500 ≈ 15 s、1000 ≈ 33 s です。

    **50〜100 が最適です。** 20 未満では、リランカーが修正すべき誤順位があまり残りません。
    200 を超えると、レイテンシが対話性を損ない始める一方で、リコールリストの末尾に答えが
    含まれていることはめったにありません。

    予算も重要です。100 件の候補は約 1,325 tokens なので、TPM 20,000 では 1 分あたり
    約 15 回しか検索できません。候補数を2倍にするとスループットは半減します。
    **候補数は品質だけでなく、容量の判断でもあります。**
  </Accordion>

  <Accordion title="Cohere または Jina の SDK をそのまま向けられますか？">
    **`cohere` SDK v2 はそのままでは動作しません**: `/v2/rerank` を対象にしており、JSON ではなく
    HTML のホームページが返るため、SDK はパースエラーを出します。

    パラメータ名（`query` / `documents` / `top_n` / `return_documents`）は Cohere Rerank
    v1 と一致しますが、`documents` は **文字列配列しか受け付けず**（`[{"text": "..."}]` は 400 を返します）、
    レスポンスに `id` / `meta` フィールドはありません。**HTTP 呼び出しを自分でラップするのが
    最も簡単です** — [RAG tuning in practice](/ja/api-capabilities/rerank/rag-best-practices) には、すぐ使える
    LangChain と LlamaIndex のアダプターがあります。

    動作確認済みクライアント: 素の `requests` POST ✅ と、`openai` SDK のエスケープハッチ
    `client.post("/rerank", ...)` ✅。
  </Accordion>

  <Accordion title="結果をキャッシュできますか？">
    はい、とても安定しています。**同一リクエストを10回繰り返すとビット単位で完全一致**します（ずれはゼロ）。
    約 3.7e-4 のずれは、**候補の順序をシャッフルしたとき**（bf16 バッチ処理のジッター）にのみ
    現れ、順序付けには影響しません。

    キャッシュのキーは `normalised query + ordered hash of document contents` にしてください。順序がそのわずかなずれを生むため、
    **`relevance_score` 自体を冪等性キーとして扱わないでください。**
  </Accordion>

  <Accordion title="8192 tokens を超えるとどうなりますか？">
    `This model's maximum context length is 8192 tokens` 付きの 400 が返ります。これは**暗黙に切り詰められることはありません。**
    この上限はリクエスト全体ではなく、クエリと文書のペアごとに適用されます。たとえば、
    400 文書 × 1000 文字（合計 330K tokens）の1件のリクエストでも通常どおり返ります。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [Rerank API プレイグラウンド](/ja/api-capabilities/rerank/rerank-api)
* [RAG チューニングの実践](/ja/api-capabilities/rerank/rag-best-practices)
* [テキスト埋め込み](/ja/api-capabilities/text-embedding)
* [モデル料金](/en/models)
