> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT Image の出力 token がなぜこんなに多いのですか?

> GPT Image が入力 token と出力 token を分けている仕組みと、解像度、品質、アスペクト比、画像枚数がコストに大きく影響する理由を説明します。

## 簡潔な回答

これは正常です。`high`品質の4K画像はGPT Imageでは本質的にコストが高く、出力画像が1枚だけでも大量の`output_tokens`を消費することがあります。

画像出力の tokens は、単に「1つの出力ファイル」や総ピクセル数に対する固定の線形比で計算されるわけではありません。主に影響するのは次の要素です。

1. `quality`: `low`、`medium`、`high`、または`auto`
2. 出力の寸法とアスペクト比
3. 生成回数 `n`
4. モデル内部のキャンバス分割と画像の複雑さ

<Info>
  `usage.output_tokens` は、**出力画像を生成するために使用された画像 tokens**を表しており、参照画像入力ではありません。参照画像は`usage.input_tokens_details.image_tokens`で別途報告されます。
</Info>

## なぜ 1 枚の画像でこれほど多くの token を使うのですか？

「1 枚の画像」は、返される結果の数を表しており、生成作業量を表しているわけではありません。モデルは内部の画像表現空間で、キャンバス全体を生成する必要があります。高品質で解像度が大きいほど、一般により多くの画像計算と出力 token が必要になります。

たとえば、次の 2 つのリクエストはいずれも 1 枚の画像を返します。

```json theme={null}
{
  "size": "1024x1024",
  "quality": "low",
  "n": 1
}
```

```json theme={null}
{
  "size": "3840x2160",
  "quality": "high",
  "n": 1
}
```

2 つ目のリクエストも返す画像は 1 枚だけですが、4K の横長キャンバスと高品質ティアを使用しています。はるかに大きな出力 token 数が想定されます。

## 4つの主なコスト要因

### 1. `quality` パラメータ

`quality` は通常、最も目に見えやすいコスト変動要因です:

| 値        | 典型的な用途              | 出力 token の傾向      |
| -------- | ------------------- | ----------------- |
| `low`    | 迅速なプレビューと下書き        | 最低                |
| `medium` | 品質とコストのバランス         | 中程度               |
| `high`   | 細かな質感、テキスト、複雑なディテール | 最高                |
| `auto`   | モデルが階層を選択します        | 呼び出しごとに変わる場合があります |

<Warning>
  `quality: "auto"` である場合、または明示的な `quality` がない場合、モデルは prompt に基づいて別の階層を選択することがあります。そのため、同一の寸法と参照画像を使った呼び出しでも、`output_tokens` が数倍異なることがあります。予測しやすい予算管理のためには、`low`、`medium`、または `high` を明示的に設定してください。
</Warning>

プロジェクトのドキュメントには実例があります。3 回のリクエストはいずれも 1061 の入力 token を使用しましたが、出力数はそれぞれ 1286、5146、1287 token でした。中央の呼び出しは自動的により高い品質レベルを選択し、他の 2 回の約 3.5 倍のコストになりました。

### 2. 出力サイズ

一般に、解像度が高いほど内部キャンバスは大きくなり、出力 token も増えます。4K `high` リクエストは、1K `low` リクエストよりもはるかに高コストになることがあります。

ただし、次の式では正確な結果を予測できません:

```text theme={null}
output tokens = width × height × fixed coefficient
```

ピクセル数は、おおまかな予算見積もりにしか役立ちません。モデルは生成中に実際の `output_tokens` を決定し、レスポンスの `usage.output_tokens` が正しい情報源です。

### 3. アスペクト比と内部キャンバスの分割

出力 token は、内部キャンバスがどのようにタイル分割され、スケーリングされ、カバーされるかにも依存します。そのため、token の使用量は最終的なピクセル数に対して必ずしも厳密に単調ではありません。

同じ品質階層では、より大きい非正方形の画像のほうが、より小さい画像やより正方形に近い画像よりも、出力 token を少なく消費することがあります。これは矛盾ではありません。モデルは最終的な各ピクセルを個別に課金するのではなく、離散的なキャンバスやタイル分割のルールを使用しているためです。

<Tip>
  サイズを比較する際は、`quality` とアスペクト比の両方を考慮してください。「4K」や「2K」の表記、または総ピクセル数だけを比較しないでください。
</Tip>

### 4. 生成回数 `n`

一般に、生成する画像が多いほど、合計の出力 token は増えます。N 枚の生成画像には、おおむね N セット分の出力コストが発生します。

ただし、現在の `gpt-image-2` エンドポイントは `n=1` のみをサポートしています。複数の画像を生成するには、独立したリクエストを複数送信してください。各リクエストは、入力 token と出力 token について個別に課金されます。別の画像モデルが `n>1` をサポートするかどうかは、そのモデルのドキュメントによります。

## どの token が参照画像の影響を受けますか？

参照画像の枚数が主に影響するのは、**入力画像token** であり、出力画像token ではありません。

| Field                                      | 意味                  |
| ------------------------------------------ | ------------------- |
| `usage.input_tokens_details.text_tokens`   | プロンプトテキスト入力         |
| `usage.input_tokens_details.image_tokens`  | 参照画像入力              |
| `usage.output_tokens_details.image_tokens` | 生成された画像出力           |
| `usage.output_tokens`                      | リクエスト全体の画像出力token合計 |

`gpt-image-2` は参照画像を高精細で処理します。参照画像が増えると入力画像token はおおむね線形に増加しますが、最終出力の `output_tokens` は、主に出力品質、寸法、アスペクト比、そしてモデル内部の生成プロセスによって決まります。

課金記録において大きな件数が明確に「画像出力」として割り当てられている場合、それを参照画像の枚数のせいにすべきではありません。参照画像のコストは、入力画像token 欄に別途表示されるはずです。

## 実際のコストの算出方法

現在の `gpt-image-2` 課金構造を使用すると:

```text theme={null}
total cost
= text input tokens × text input rate
+ reference-image input tokens × image input rate
+ output image tokens × image output rate
```

応答例:

```json theme={null}
{
  "usage": {
    "input_tokens": 1040,
    "input_tokens_details": {
      "text_tokens": 16,
      "image_tokens": 1024
    },
    "output_tokens": 5146,
    "output_tokens_details": {
      "text_tokens": 0,
      "image_tokens": 5146
    },
    "total_tokens": 6186
  }
}
```

これは次の意味です:

* 16 tokens は prompt テキストから来ました
* 1024 tokens は参照画像から来ました
* 5146 tokens は生成された画像から来ました
* 返された画像は1枚だけでしたが、その品質とキャンバスには 5146 の出力 image tokens が必要でした

<Info>
  2K または 4K 画像について、すべての寸法と内容に共通する固定 token 数はありません。見積もり表はあくまで推定値です。最終的な課金では、API から返された、またはコンソールログに表示された実際の `usage` 値を使用してください。
</Info>

## token 使用量を削減する方法

<Steps>
  <Step title="品質ティアを明示的に指定する">
    `auto`を避けてください。`low`、`medium`、または`high`を明示的に指定し、モデルが意図せずより高価なティアを選ばないようにします。
  </Step>

  <Step title="不要な解像度を避ける">
    プレビューと内部レビューには 1K または 2K を使用し、最終納品時にのみ 4K `high` を生成します。
  </Step>

  <Step title="必要なアスペクト比を選択する">
    見た目をより詳細にするためだけにサイズを大きくするのではなく、実際のワークロードに必要なキャンバスを使用してください。
  </Step>

  <Step title="出力数を制御する">
    複数の候補を生成すると、総出力コストはおおむね線形に増加します。スケールアップする前に、小さなバッチで prompt を検証してください。
  </Step>

  <Step title="使用量フィールドを記録する">
    各リクエストの `size`、`quality`、`output_tokens`、およびコストを保存し、実際の本番データからコストのベースラインを構築します。
  </Step>
</Steps>

## 関連ドキュメント

* [GPT-Image-2 の概要と課金](/ja/api-capabilities/gpt-image-2/overview)
* [GPT-Image-2 テキストから画像への API](/ja/api-capabilities/gpt-image-2/text-to-image)
* [GPT-Image-2 画像編集 API](/ja/api-capabilities/gpt-image-2/image-edit)
* [API ログを表示するには？](/ja/faq/call-logs)
