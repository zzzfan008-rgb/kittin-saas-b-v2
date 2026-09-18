> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# なぜ白背景の画像に黒い斑点、汚れのような部分、またはぼやけた色ブロックが表示されるのですか？

> Google Aistudio API からの白背景画像では、しばしばアーティファクトが発生します。これを修正するには、prompt を薄い色合いに変更するか、Vertex チャネルに移行してください。

## 短い答え

これは Google Aistudio API で知られている問題です。計算負荷が高い場合、生成された画像の大きな純白領域には、黒い斑点、汚れた部分、またはぼやけた色ブロックが出やすくなります。2026年4月以降、繰り返し確認されています。対処法は2つです。

* **Option 1 (try this first)**: プロンプトを「白い背景」から、薄い色味（薄いグレー、ベージュ、やわらかな青）に変更します。設定変更は不要です。
* **Option 2**: サポートに連絡して`VertexGemini` グループを有効化し、そのグループに紐づけた token を作成します。Vertex チャネルは、きれいな純白の背景を生成します。

## 詳細な説明

高負荷時に、Aistudio の画像パイプラインは、特に純白のような大きな単色領域の圧縮と再構成をうまく処理できません。よく見られるアーティファクトは 3 つあります。

* **黒い斑点 / 汚れたパッチ**: 画像内に局所的な暗い点や不規則な斑点が現れます
* **ぼやけたカラーブロック**: 純白の代わりに、かすんだ灰色がかった領域や黄色がかった領域になります
* **色かぶり**: 白い背景が、プロンプトに対して暖色寄り（ベージュ）または寒色寄り（灰青色）にずれます

これは**モデルの能力の問題ではありません**。均一な背景で発生する Aistudio パイプラインのレンダリング不具合です。Nano Banana Pro や Nano Banana 2 などの Gemini 画像モデルは、Aistudio 経由でルーティングされるといずれも影響を受けます。

## 解決手順

### オプション 1: プロンプトレベルの回避策（最初に推奨）

プロンプト内の「white background / pure white background / #FFFFFF」を、薄い色味に置き換えます:

* **薄いグレー**: `light gray background` / `#F5F5F5`
* **ベージュ**: `beige background` / `#F5F0E5`
* **淡い青**: `light blue background` / `#E8F0F8`
* **透明**: `transparent background`（モデルが alpha 出力をサポートしている場合）

<Info>
  実際には、純白から薄いグレーやベージュに切り替えるだけで、黒い点や汚れのようなムラをほぼ完全に解消できます。被写体の色には影響せず、変わるのは背景の色味だけです。
</Info>

### オプション 2: Vertex チャネルに切り替える

ユースケースで純白の背景が厳密に必要な場合（例: eコマースの商品撮影）、Vertex 経由にすると根本原因を解消できます。

#### VertexGemini グループ参照

| Field                | Details                                                                      |
| -------------------- | ---------------------------------------------------------------------------- |
| **Identifier**       | `VertexGemini`                                                               |
| **Description**      | Vertex Gemini Models: Nano Banana Pro / 2 Series。Vertex チャネル経由の専用画像生成リソースです。 |
| **Supported models** | Nano Banana Pro, Nano Banana 2                                               |
| **Pros**             | ぼやけた純白背景の問題を解消します                                                            |
| **Cons**             | 同時実行数が限られます（約100 RPM）；招待制；Aistudio よりやや遅いです                                  |

#### 使い方

<Steps>
  <Step title="サポートにアクセスを依頼する">
    APIYI のサポート / 運用に連絡して、`VertexGemini` グループを有効化してもらってください。現在は招待制です。
  </Step>

  <Step title="専用 token を作成する">
    APIYI のコンソールにログイン → `Token management` → `Create token` → グループ **`VertexGemini`** を選択 → キーを保存します。
  </Step>

  <Step title="呼び出しを切り替える">
    新しい token で Nano Banana Pro / Nano Banana 2 を呼び出します。Base URL は同じままです（`https://api.apiyi.com/v1`）。
  </Step>
</Steps>

<Warning>
  `VertexGemini` グループは同時実行数が限られているため（約100 RPM）、高スループットの本番ワークロードには推奨されません。Aistudio を主チャネルのまま使い、純白背景のテスト時だけ Vertex に切り替えてください。
</Warning>

## よくある質問

<AccordionGroup>
  <Accordion title="背景色を変えるとなぜ問題が解決するのですか？">
    Aistudio の描画問題は、大きな単色領域を圧縮しようとすることで発生します。薄いグレーやベージュに切り替えると背景に少しテクスチャが加わり、アーティファクトを引き起こす「大きな単色領域を圧縮する」条件を避けられます。
  </Accordion>

  <Accordion title="Vertex は常に Aistudio より高画質ですか？">
    必ずしもそうではありません。Vertex は真っ白／単色背景ではより安定していますが、ほかのシーン（複雑な構図、ポートレート）では両者は同程度で、しかも Vertex のほうが遅いです。真っ白が原因だと確認できた場合にのみ切り替えてください。
  </Accordion>

  <Accordion title="VertexGemini グループはどうやって申請しますか？">
    招待制です — APIYI サポートまたはアカウントマネージャーにお問い合わせください。ほとんどのユーザーには、オプション 1（背景を薄い色に変更する）で十分です。
  </Accordion>

  <Accordion title="Vertex に切り替えるとリクエスト URL は変わりますか？">
    いいえ。Base URL は `https://api.apiyi.com/v1` のままです。変わるのは token のグループだけです。APIYI のバックエンドが Vertex グループのトラフィックを自動的に Vertex プラットフォームへルーティングします。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Nano Banana 画像の失敗" icon="banana" href="/ja/faq/nano-banana-image-failure">
    Nano Banana 画像モデルにおけるよくある問題とトラブルシューティングです。
  </Card>

  <Card title="Google Aistudio と Vertex チャネルの比較" icon="network" href="/ja/faq/google-upstream-aistudio-vertex">
    Aistudio と Vertex の Gemini 画像チャネルの違いと、選び方について説明します。
  </Card>

  <Card title="Enterprise Vertex フォールバック グループ" icon="building" href="/ja/faq/enterprise-group-vertex-fallback">
    エンタープライズのお客様が Vertex グループをフォールバック チャネルとして利用する方法です。
  </Card>

  <Card title="画像非同期 API" icon="loader" href="/ja/faq/image-async-api">
    非同期の画像生成エンドポイントの使い方です。
  </Card>
</CardGroup>
