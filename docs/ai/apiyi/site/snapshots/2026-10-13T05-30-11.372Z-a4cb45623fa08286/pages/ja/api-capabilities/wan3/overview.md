> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan3.0 動画生成 (Alibaba Tongyi Wanxiang)

> Alibaba Tongyi Wanxiang Wan3.0 動画生成の完全ガイド：1つのモデルIDでテキストから動画生成、画像から動画生成、リファレンスから動画生成、動画編集に対応。最大30秒、480P〜1080P、ネイティブ音声トラック、StandardおよびPrimeのティア別料金体系。デフォルトで公式の98%、チャージボーナス適用で最安81.7%（480Pで$0.0245/秒）。

## 概要

**Wan3.0は、通義万相（Tongyi Wanxiang）のオールインワン動画モデルです。** 4つのモデルID（`t2v` / `i2v` / `r2v` / `videoedit`）の切り替えが必要だったWan2.7とは異なり、Wan3.0は**単一のモデルIDですべてのモードを処理**します。送信するメディアに応じて動作が決定されます。テキストからの動画生成、画像からの動画生成、リファレンス動画生成、動画編集のすべてが1つのリクエストボディを共有します。

機能は同一で、速度と価格が異なる2つのバリアントがあります：

| モデルID | 位置づけ | 相対速度 | 720PでのAPIYI価格 | **20%のチャージボーナス適用時、最安で** |
| - | - | - | - | - |
| `wan3.0-video` | 標準 | ベースライン | \$0.0588/秒 | **\$0.049/秒** (≈ ¥0.34/秒) |
| `wan3.0-video-prime` | **Prime（高速）** | より高速な配信 | \$0.126/秒 | **\$0.105/秒** (≈ ¥0.74/秒) |

<Info>
  両バリアントとも**パラメータ、エンドポイント、メディアの仕様は完全に共通**しており、異なるのは速度と単価のみです。まずは`wan3.0-video`で構築を行い、レイテンシが重視される本番トラフィックを`wan3.0-video-prime`へと切り替えてください。
</Info>

## AIエージェントに統合を任せる

<Note>
  Codex / Claude Code / Cursor で開発している場合は、以下のプロンプトをコピーしてエージェントに渡してください。まずこのページのプレーンテキスト版を取得し（任意のドキュメントURLの末尾に `.md` を追加）、その上でプロジェクト独自のスタックに合わせてコードを記述します。**なぜ `/v1/videos` を使用してはならないのか**、`X-DashScope-Async` の欠落エラー、`completed`（`SUCCEEDED` ではない）完了状態、および参照動画の秒数が課金対象となる事実があらかじめ要件に組み込まれています。
</Note>

<Prompt description="コーディングエージェントに Wan3.0 のテキストから動画生成、画像から動画生成、参照から動画生成、および動画編集の統合やトラブルシューティングを実行させます。Codex、Claude Code、Cursor などのツールにコピー＆ペーストしてください。" icon="bot" actions={["copy"]}>
  このプロジェクトに Wan3.0 の動画生成（テキストから動画生成、画像から動画生成、参照から動画生成、動画編集）を統合 / トラブルシューティングしてください。

  コードに触れる前にドキュメントをお読みください：このページのプレーンテキスト版として [https://docs.apiyi.com/en/api-capabilities/wan3/overview.md](https://docs.apiyi.com/en/api-capabilities/wan3/overview.md) を取得してください。APIリファレンスページは [https://docs.apiyi.com/en/api-capabilities/wan3/video-generation.md](https://docs.apiyi.com/en/api-capabilities/wan3/video-generation.md) です。

  要件：

  1. エンドポイントと非同期ヘッダー（**最も即座に問題が発生しやすい2点**）：リクエストは `POST /wan/api/v1/services/aigc/video-generation/video-synthesis` に送信する必要があり、**必ずヘッダー `X-DashScope-Async: enable` を含める必要があります**。**絶対に `/v1/videos` を使用しないでください**。このルートは `media` フィールドを破棄し、解像度と時間のパラメータを無視し、不当に高額な課金が発生します。ポーリングには**異なるプレフィックス** `GET /v1/tasks/{task_id}` を使用します（ポーリング時に非同期ヘッダーは不要です）。

  2. ポーリングとステータス：タスクIDは送信レスポンスの **`output.task_id`** にあります。ポーリングは5〜10秒ごとに行い、**絶対に3秒より短い間隔にしないでください**。クライアント全体の上限時間は20分に設定してください（5秒のクリップの実測値は 480P で約100秒、720P で120秒、1080P で170秒でした）。ステータスは `submitted`、`in_progress`、`completed`、`failed` であり、**成功は DashScope ネイティブの `SUCCEEDED` ではなく `completed` です**。ネイティブの enum をチェックすると無限にポーリングし続けることになります。`progress` の値が長時間30パーセントで止まるのは正常であり、ハングではありません。**パラメータやメディアのエラーも最初は HTTP 200 を返し、その後非同期で失敗します**。そのため、送信ステータスコードだけでは成否を判断できません。

  3. 動画の取得：アドレスはトップレベルの **`result_url`** にあり、これは **24時間で失効する** Aliyun OSS の署名付きリンクです。**直ちにサーバー側でダウンロードし、独自のオブジェクトストレージまたはCDNに再ホストしてください**。長期的なアドレスとして保持してはなりません。ダウンロード時には `Authorization` ヘッダーを**送信しないでください**。送信すると403が返されます。

  4. リクエストボディの構造と型：ボディはフラットなオブジェクトではなく、DashScope のネスト形式 `{ model, input: { prompt, media[] }, parameters: { ... } }` です。**`duration` は文字列の `"5"` ではなく整数の `5` でなければならず**、**`resolution` は大文字の `480P`、`720P`、または `1080P` でなければなりません**。

  5. モデルとモード：Wan3.0 には**単一のモデルID**があります。テキストから動画生成、画像から動画生成、参照から動画生成、動画編集は、`input.media[]` 内の各エントリの `type` だけで判別されます。**Wan2.7 の4つのモデルID（`t2v`、`i2v`、`r2v`、`videoedit`）をコピーしないでください**。これらも動作はしますが、Wan3.0 ではなく前世代を呼び出してしまいます。`wan3.0-video`（Standard）と `wan3.0-video-prime`（Prime、より高速）はまったく同一のパラメータを取り、速度と単価のみが異なるため、モデルは設定値として外出ししてください。各 `media` エントリは `{"type": ..., "url": ...}` の形式になります：`media` なしはテキストから動画生成、`first_frame`（任意で `last_frame` を併用）は画像から動画生成、`reference_image`、`reference_video`、`reference_audio` は参照から動画生成、`file` と `link` はドキュメントやWebページを動画に変換します。**`first_frame` / `last_frame` は `reference_*`、`file`、`link` と混在させることはできません**。混在させるとアップストリームによって拒否されます。各 `url` は、**タスクが完了するまでアクセス可能な状態を維持する**、公開GET可能な https リンクである必要があります。複数の入力がある場合は、`media` の順序に従い、プロンプト内で image 1、video 1 などのように参照してください。

  6. 主要パラメータ：**必ず明示的に `resolution` を設定してください**。これにより単価が決まり、480P のコストは 1080P の4分の1です。`duration` を省略すると5秒になります。**参照動画の長さと出力の `duration` の合計は30秒を超えてはなりません**。これを超えた場合も送信時は 200 が返され、その後 `failed` タスクになります。`ratio` には `16:9`、`9:16`、`1:1`、`4:3`、`3:4`、または `adaptive` を指定でき、**先頭フレーム画像が提供されている場合は常に自動的に無視されます**。`prompt_extend` のデフォルトは `true` であり、有効のままにしておくべきです。`audio` のデフォルトは `true` のため、出力にはネイティブの音声トラックが含まれます。

  7. 課金と冪等性：**課金は秒単位で、出力解像度によって価格設定され、課金秒数 = 参照動画の長さ + 出力の長さ** となります。10秒の参照動画で2秒の出力の場合は12秒分課金されます。参照画像、音声、ファイルは無料です。コストを抑えるには、先に取り込み元の参照動画をトリミングしてください。`duration` を短くしても入力秒数を削減することはできません。**参照動画を含むタスクは送信時に上限の30秒分が事前引き落としされ**、完了時に差額が自動返金されます（請求明細に個別のマイナス行として表示）。そのため残高に余裕を持たせておいてください。`failed` となったタスクは**全額返金されます**が、**同一タスクを再送信すると再度課金されます**。むやみに自動リトライするのではなく、冪等性を保つためにビジネスIDから `task_id` へのマッピングを保持してください。モデレーション失敗後はプロンプトを変更し、メディア失敗後は URL のアクセス性を確認してください。5xx やネットワークエラーには指数バックオフ（1秒、4秒、16秒）を使用してください。

  8. token 要件：このモデルには、**従量課金または従量課金優先**の課金モードを持つ `Wan&HappyHorse` グループを含む token が必要です。**呼び出し回数制の token ではルーティングできず**、利用可能なチャネルがない旨のエラーが発生します。

  9. キーは `APIYI_API_KEY` 環境変数から読み取ってください。絶対にハードコードせず、git にコミットしないでください。

  10. 完了したら、実際に 480P のテキストから動画生成と画像から動画生成を1回ずつ実行し、生成された動画とそれら2回の呼び出しにかかったコストを提示してください。フロー全体で数分かかるため、制約のある実行環境で実行する場合は、コマンドのタイムアウトを600秒以上に設定するかバックグラウンドで実行してください。
</Prompt>

<Accordion title="このプロンプトによって回避できる落とし穴">
  | 要件 | 回避できる落とし穴 |
  | - | - |
  | 決して `/v1/videos` を使用しない | そのルートは `media` を破棄し、解像度と時間を無視して過剰請求します。実際にはエンドポイントの間違いであるにもかかわらず、パラメータのバグのように見えます |
  | `X-DashScope-Async` ヘッダー | これがない場合、呼び出しは同期リクエストとして扱われ、即座に拒否されます |
  | 成功ステータスは `completed` | DashScope ネイティブの `SUCCEEDED` をチェックすると、ポーリングループが永久に終了しなくなります |
  | 単一のモデルIDのみ | Wan2.7 の4つのモデルIDをコピーしても動作自体はしますが、制限や価格が異なる前世代のモデルが暗黙的に呼び出されます |
  | 先頭フレームと参照メディアは排他 | `first_frame` と `reference_*` を混在させると拒否され、非同期で `failed` タスクになります |
  | 参照動画の秒数は課金対象 | `duration` を短くしても入力秒数を削ることはできず、参照動画タスクは上限の30秒分が事前引き落としされます |
  | ダウンロード時に `Authorization` を含めない | OSS の署名付きリンクは認証情報を送信すると 403 を返します |
</Accordion>

## Wan2.7からの変更点

| 項目 | Wan2.7 | **Wan3.0** |
| - | - | - |
| モデルID | 4 (t2v / i2v / r2v / videoedit) | **1**（メディアに応じてモードを自動判定） |
| 最大生成時間 | 15秒（参照動画ありの場合は10秒） | **30秒**（入力と出力を合わせた合計） |
| 解像度 | 720P / 1080P | **480P** / 720P / 1080P |
| 音声 | リップシンクには`driving_audio`が必要 | **デフォルトでネイティブオーディオトラックに対応** |
| 720P価格 | \$0.084/秒 | **\$0.0588/秒**（約30%安価） |
| 1080P価格 | \$0.14/秒 | **\$0.1176/秒**（約16%安価） |

Wan2.7も引き続き完全に利用可能です。[Wan2.7 動画生成](/ja/api-capabilities/wan/overview)をご参照ください。

## 主な機能

<CardGroup cols={2}>
  <Card title="4つのモードを1つのモデルで" icon="list-check">
    テキストからの動画生成、画像からの動画生成（最初/最後のフレーム）、リファレンスからの動画生成（画像、動画、音声）、および動画編集は、1つのモデルIDと1つのエンドポイントを共有しており、`type`（`input.media[]` 内）によって区別されます。
  </Card>

  <Card title="最大30秒" icon="clock">
    1リクエストあたり最大30秒（入力リファレンス動画と出力の合計）に対応 — Wan2.7の15秒の2倍であり、完全なナレーションセグメントやショートドラマの1カットに十分な長さです。
  </Card>

  <Card title="ネイティブオーディオ" icon="volume-2">
    出力にはデフォルトで `soun` トラックが含まれており、駆動用音声は不要です。特定の声質が必要な場合は `reference_audio` を使用してください。
  </Card>

  <Card title="3つの解像度ティア" icon="expand">
    新しい480Pティアは1080Pの4分の1のコストです — 低コストで下書きを作成し、最終レンダリングに向けてアップスケールできます。
  </Card>
</CardGroup>

## グループの設定

Wan3.0 は Wan2.7 および [HappyHorse](/ja/api-capabilities/happyhorse/overview) と **`Wan&HappyHorse` グループ**を共有しており、1つのキーですべてを呼び出すことができます。動画は**秒単位**で課金されるため、正常にルーティングするにはキーが次の2つの条件を満たしている必要があります。

1. **課金モード**：「従量課金優先（Pay-as-you-go priority）」または「従量課金（Pay-as-you-go）」を選択してください。秒単位の動画は**呼び出し単位のキーではルーティングできません**
2. **グループ**：`Wan&HappyHorse` を含める

<Frame caption="Create a key: set billing mode to pay-as-you-go priority and select the Wan&HappyHorse group (0.14x) to call every Wan3.0 / Wan2.7 / HappyHorse video model (the screenshot shows the old group name Wan)">
  <img src="https://mintcdn.com/apiyillc/5-SttsT0c5VQwgVz/images/wan-token-group-setup-20260523.png?fit=max&auto=format&n=5-SttsT0c5VQwgVz&q=85&s=f46887cb88777eb34d70837983f1fc49" alt="token 作成画面：課金モードが従量課金優先に設定され、グループドロップダウンが Wan&HappyHorse (0.14x) に設定されている状態" width="1286" height="988" data-path="images/wan-token-group-setup-20260523.png" />
</Frame>

## 料金

<Info>
  **デフォルトでAlibaba公式価格の98% — 最高額のチャージボーナス適用で最安81.7%。**
  これにより、`wan3.0-video`では480Pが\*\*\$0.0245/秒\*\*（≈ ¥0.17/秒）、720Pが\*\*\$0.049/秒\*\*（≈ ¥0.34/秒）となります。
</Info>

### レート算出方法：デフォルトで0.98倍、ボーナス適用で最安0.817倍

コンソール上では、`Wan&HappyHorse`グループは**CNY**建てで**0.14倍**の倍率が表示されています。APIYIは**1:7の固定為替レートによるUSD**で決済されます：

```
0.14 (CNY-denominated unit) × 7 (fixed rate) = 0.98
```

したがって、**APIYIの1秒あたりの価格（USD）= Alibaba公式の1秒あたりのCNY価格 × 0.14**となり、これは公式レートの98%に相当します。

### 表1：APIYIの詳細料金（秒単位の課金）

| モデル | 解像度 | デフォルト | 10%ボーナス適用時 | **20%ボーナス適用時** | 20%ボーナス適用時のCNY価格 |
| - | - | - | - | - | - |
| `wan3.0-video` | 480P | \$0.0294/秒 | \$0.0267/秒 | **\$0.0245/秒** | ¥0.1715/秒 |
| `wan3.0-video` | 720P | \$0.0588/秒 | \$0.0535/秒 | **\$0.049/秒** | ¥0.343/秒 |
| `wan3.0-video` | 1080P | \$0.1176/秒 | \$0.1069/秒 | **\$0.098/秒** | ¥0.686/秒 |
| `wan3.0-video-prime` | 480P | \$0.063/秒 | \$0.0573/秒 | **\$0.0525/秒** | ¥0.3675/秒 |
| `wan3.0-video-prime` | 720P | \$0.126/秒 | \$0.1145/秒 | **\$0.105/秒** | ¥0.735/秒 |
| `wan3.0-video-prime` | 1080P | \$0.252/秒 | \$0.2291/秒 | **\$0.21/秒** | ¥1.47/秒 |

| ティア | Alibaba公式価格に対する割合 | 計算式 |
| - | - | - |
| デフォルト | **98%** | 0.14倍の倍率 × 固定レート7 |
| 10%チャージボーナス（標準） | **約89.1%** | 0.98 ÷ 1.1 |
| 20%チャージボーナス（大口アカウント） | **約81.7%** | 0.98 ÷ 1.2 |

「10% / 20%ボーナス適用時」は、[チャージボーナス](/ja/faq/recharge-promotions)によって付与残高が増額された後の**実質単価**です。各呼び出し時に差し引かれる金額自体はデフォルト価格のままとなります。

### 表2：Alibaba公式価格とのティア別比較

| モデル | 解像度 | 公式定価 | 公式現行価格 | APIYIデフォルト（CNY） | 対公式比 | **20%ボーナス適用時** |
| - | - | - | - | - | - | - |
| `wan3.0-video` | 480P | ¥0.30/秒 | **¥0.21/秒** | ¥0.2058/秒 | 98% | **¥0.1715/秒 · 81.7%** |
| `wan3.0-video` | 720P | ¥0.60/秒 | **¥0.42/秒** | ¥0.4116/秒 | 98% | **¥0.343/秒 · 81.7%** |
| `wan3.0-video` | 1080P | ¥1.20/秒 | **¥0.84/秒** | ¥0.8232/秒 | 98% | **¥0.686/秒 · 81.7%** |
| `wan3.0-video-prime` | 480P | ¥0.45/秒 | ¥0.45/秒 | ¥0.441/秒 | 98% | **¥0.3675/秒 · 81.7%** |
| `wan3.0-video-prime` | 720P | ¥0.90/秒 | ¥0.90/秒 | ¥0.882/秒 | 98% | **¥0.735/秒 · 81.7%** |
| `wan3.0-video-prime` | 1080P | ¥1.80/秒 | ¥1.80/秒 | ¥1.764/秒 | 98% | **¥1.47/秒 · 81.7%** |

<Info>
  `wan3.0-video`には現在、公式の**期間限定30%割引**が適用されており（すべてのユーザーにデフォルトで適用）、APIYIの料金もこの割引レートに連動しています。`wan3.0-video-prime`には割引はありません。プロモーション終了時にはAPIYIの料金も調整されます。
</Info>

### 表3：一般的な動画の長さにおける合計費用

| モデル | 解像度 | 5秒 | 10秒 | 30秒（最大） |
| - | - | - | - | - |
| `wan3.0-video` | 480P | \$0.147 | \$0.294 | \$0.882 |
| `wan3.0-video` | 720P | \$0.294 | \$0.588 | \$1.764 |
| `wan3.0-video` | 1080P | \$0.588 | \$1.176 | \$3.528 |
| `wan3.0-video-prime` | 480P | \$0.315 | \$0.63 | \$1.89 |
| `wan3.0-video-prime` | 720P | \$0.63 | \$1.26 | \$3.78 |
| `wan3.0-video-prime` | 1080P | \$1.26 | \$2.52 | \$7.56 |

### チャージボーナスの併用

[チャージボーナス](/ja/faq/recharge-promotions)を利用すると、付与残高が最大約1.2倍になり、実質レートがさらに低くなります：

```
0.98 ÷ 1.2 ≈ 0.816
```

| ティア | 実質価格（Alibaba公式比） | 計算式 |
| - | - | - |
| デフォルト | **98%** | 0.14倍の倍率 × 固定レート7 |
| 10%チャージボーナス（標準） | **約89.1%** | 0.98 ÷ 1.1 |
| 20%チャージボーナス（大口アカウント、最高ティア） | **約81.7%** | 0.98 ÷ 1.2 |

1:7は**固定決済レート**であり（プロモーションレートではありません）、すべてのUSDチャージに適用されます。

<Note>価格はプロバイダーの公式レートに準拠しており、それに伴い変動する場合があります。上記の表は参考用であり、トップナビゲーションの**モデル料金**タブの内容が正式なものとなります：[モデル料金](/en/models/index)。</Note>

## ⚠️ 課金ルール（他の動画モデルとは異なります）

<Warning>
  **課金対象秒数 = 入力参照動画の長さ + 出力動画の長さ。** Alibabaによると：「入力動画と出力動画の両方が再生時間に応じて課金され、単価は出力解像度によって決定されます。」
</Warning>

| ルール | 詳細 |
| - | - |
| 参照**動画**の秒数が課金対象 | 10秒の`reference_video`で2秒の出力の場合、**12秒分**が課金されます |
| 参照**画像 / 音声 / ファイル**は無料 | 課金対象時間としてカウントされるのは動画素材のみです |
| 単価は**出力**解像度に従う | 720Pの入力で1080Pの出力の場合、全体が1080Pのレートで課金されます |
| 合計30秒の上限 | 入力と出力の合計が30秒を超える場合、アップストリームで拒絶されます |
| `duration`の指定なし | デフォルトで5秒の出力となり、5秒分として課金されます |
| 失敗したタスク | **全額返金**されます。サポートへの問い合わせは不要です |

<Tip>
  コストを削減するには、**参照動画をトリミングしてください** — `duration`を短くしても入力秒数は変わりません。例：10秒の参照動画と2秒の出力では12秒分が課金されますが、参照動画を3秒にトリミングすると5秒分のみの課金になります。
</Tip>

### 事前承認と決済

* **参照動画がない場合**: リクエストされた`duration`が前払いで請求され、それが最終金額となります — 追加の精算エントリーはありません。
* **参照動画がある場合**: 送信時点ではゲートウェイは入力動画の長さを把握できないため、**30秒の上限**で事前承認を行い、その後実際の課金対象秒数に基づいて再計算され、差額が返金されます（請求明細にマイナスのエントリーとして個別に記録されます）。

<Info>
  上限に基づく保留により、一時的により多くの金額が凍結されます：480Pで\$0.147、720Pで\$0.294、1080Pで\$0.588（`wan3.0-video`、30秒）。十分な残高を維持してください。返金はタスク完了後数秒以内に行われます。
</Info>

## ⚠️ エンドポイントの選択（最重要）

APIYIは2つのパスを公開していますが、**Wan3.0で完全に動作するのはDashScopeパススルーエンドポイントのみです**：

| パス | プロトコル形式 | 利用可否 | 判定 |
| - | - | - | - |
| `/v1/videos` | OpenAIフラット形式 | ❌ メディアフィールドが欠落し、**課金が不正確になります** | **使用しないでください** |
| `/wan/api/v1/services/aigc/video-generation/video-synthesis` | ネイティブDashScopeパススルー | ✅ 完全にサポート | **常にこちらを使用してください** |

<Warning>
  Wanの動画ジョブを`/v1/videos`に送信するドキュメントやサンプルは無視してください。そのパスでは`media`フィールドがドロップされ、**解像度および再生時間のパラメータが無視され、過大に課金されます**。Wan3.0のリクエストはすべて`/wan/api/v1/...video-synthesis`に送信してください。
</Warning>

## 非同期ワークフロー

<Steps>
  <Step title="タスクの作成">
    `X-DashScope-Async: enable`ヘッダーを付けて`POST /wan/api/v1/services/aigc/video-generation/video-synthesis`を実行します。即座に`task_id`が返されます。
  </Step>

  <Step title="ステータスのポーリング">
    `status`が`completed`になるまで、5〜10秒ごと（**絶対に3秒未満にしないでください**）に`GET /v1/tasks/{task_id}`（`Authorization`付き）を実行します。
  </Step>

  <Step title="動画のダウンロード">
    レスポンスの`result_url`を直接GETします — **`Authorization`ヘッダーは含めないでください**（署名付きOSSリンクであるため、認証情報を送信すると403が返されます）。有効期限は24時間です。
  </Step>
</Steps>

### タスクステータス

| ステータス | 意味 | 次のステップ |
| - | - | - |
| `submitted` | キュー待機中 | ポーリングを継続 |
| `in_progress` | 生成中 | ポーリングを継続（進行状況が30%で留まることがよくありますが、これは上流の詳細度が粗いレポートによるもので、処理の中断ではありません） |
| `completed` | 完了 | `result_url`からダウンロード |
| `failed` | 失敗 | `error.message` / `fail_reason`を確認。**課金は発生しません** |

<Warning>
  終了状態の値は\*\*`completed` / `failed`\*\*であり、DashScopeネイティブの`SUCCEEDED` / `FAILED`ではありません。ネイティブの列挙型に合わせて書かれたコードは無限にポーリングし続けることになります。
</Warning>

<Tip>
  **無効なパラメータも最初はHTTP 200を返し、非同期に失敗します** — 同期的な400ではありません。アクセスできないメディアURLや、入力と出力の合計が30秒を超える場合などは、終了状態までポーリングして初めて判明します。リクエスト送信時のステータスコードだけを信頼しないでください。
</Tip>

### 完全なPythonクライアント

```python theme={null}
import json, time, urllib.request

BASE = "https://api.apiyi.com"
KEY  = "sk-your-api-key"   # your APIYI key

def post(path, body):
    h = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
         "X-DashScope-Async": "enable"}
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers=h, method="POST")
    return json.loads(urllib.request.urlopen(req).read())

def get(path):
    req = urllib.request.Request(BASE + path, headers={"Authorization": f"Bearer {KEY}"})
    return json.loads(urllib.request.urlopen(req).read())

# 1. Create the task (switch modes by changing input.media only — model ID stays the same)
r = post("/wan/api/v1/services/aigc/video-generation/video-synthesis", {
    "model": "wan3.0-video",
    "input": {"prompt": "A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks, seagulls"},
    "parameters": {"resolution": "720P", "ratio": "16:9", "duration": 5, "prompt_extend": True}
})
task_id = r["output"]["task_id"]
print("task_id:", task_id)

# 2. Poll every 5–10 seconds
while True:
    info = get(f"/v1/tasks/{task_id}")
    status = info["status"]
    print("status:", status, "progress:", info.get("progress"))
    if status == "completed":
        url = info["result_url"]
        break
    if status == "failed":
        raise RuntimeError(info.get("error") or info.get("fail_reason"))
    time.sleep(10)

# 3. Download (no Authorization header! result_url is a signed OSS link)
urllib.request.urlretrieve(url, "out.mp4")
print("saved out.mp4")
```

## パラメーターリファレンス

リクエストボディはネストされたDashScope構造を使用します：`{ model, input: { prompt, media[] }, parameters: {...} }`。

### `input` フィールド

| フィールド | 型 | 必須 | 説明 |
| - | - | - | - |
| `prompt` | string | ✓ | 自然言語による説明。複数のアセットがある場合は、prompt内で「image 1 / video 1」のように参照してください |
| `negative_prompt` | string | | ネガティブprompt |
| `media` | array | テキストから動画生成以外では必須 | メディアアセット配列（詳細は以下を参照） |

### `media[]` のタイプと選択されるモード

| `type` | モード | 備考 |
| - | - | - |
| `media` なし | **テキストから動画生成** | promptのみ |
| `first_frame` | **画像から動画生成** | この画像を最初のフレームとして使用 |
| `last_frame` | 最初/最後のフレーム動画 | `first_frame` とペアで使用 |
| `reference_image` | **リファレンスから動画生成** | 被写体 / 衣装 / シーンの一貫性を維持 |
| `reference_video` | リファレンスから動画生成 / 編集 | **この動画の再生時間は課金対象です** |
| `reference_audio` | 音声 / リズムのリファレンス | 課金対象外 |
| `file` / `link` | ドキュメントまたはウェブページから動画生成 | 課金対象外 |

<Warning>
  **`first_frame` / `last_frame` は `reference_*` / `file` / `link` と混在させることはできません** — 2つのアセットファミリーは相互に排他的であり、混在させるとアップストリームで拒絶されます。
</Warning>

すべてのメディアオブジェクトには少なくとも `type` と `url` が必要です。`url` は一般にアクセス可能な https リンクである必要があります（ローカルファイルを事前にOSS / CDNにアップロードし、**タスクが完了するまでアクセス可能な状態を維持してください**）。

### `parameters` フィールド

| フィールド | 型 | 値 | 説明 |
| - | - | - | - |
| `resolution` | string | `480P` / `720P` / `1080P` | 大文字。**明示的に設定してください** — 単価を決定します |
| `ratio` | string | `16:9` / `9:16` / `1:1` / `4:3` / `3:4` / `adaptive` | アスペクト比。最初のフレームが指定されている場合は無視されます |
| `duration` | int | 整数の秒数 | 出力の長さ。デフォルトは5です。**入力 + 出力の合計は ≤ 30 である必要があります** |
| `prompt_extend` | bool | `true` / `false` | promptのリライト。デフォルトは `true` — **有効のままにしておくことを推奨します** |
| `audio` | bool | `true` / `false` | 音声トラックを出力するかどうか。デフォルトは `true` |
| `watermark` | bool | `true` / `false` | 右下の「AI generated」透かし |
| `seed` | int | 0–2147483647 | 固定すると再現性が向上します |

<Tip>
  `duration` は**整数**（`"5"` ではなく `5`）である必要があり、`resolution` は**大文字**（`720P`）で指定する方が確実です。
</Tip>

## 選び方：Wan3.0 / Wan2.7 / HappyHorse

| シナリオ | 推奨 |
| - | - |
| 30秒の動画クリップ、安価な480Pプラン、またはネイティブ音声が必要な場合 | **Wan3.0** |
| 音声駆動のリップシンク（`driving_audio`）が必要な場合 | [Wan2.7 `i2v`](/ja/api-capabilities/wan/overview) |
| レイテンシを重視する本番環境トラフィック | **`wan3.0-video-prime`** |
| 同等の機能でより低い単価を希望する場合 | [HappyHorse](/ja/api-capabilities/happyhorse/overview) |

## ベストプラクティス

<AccordionGroup>
  <Accordion title="480Pでイテレーションを行い、最終版を1080Pでレンダリングする" icon="wallet">
    480Pのコストは1080Pの4分の1です。promptとカメラワークを低コストで確定させましょう。5秒の1080Pレンダリング1回分の料金で、4回の下書きを作成できます。
  </Accordion>

  <Accordion title="アップロード前にリファレンス動画をトリミングする" icon="scissors">
    入力動画の秒数に応じて課金されます。クリップのうち3秒しか必要ない場合は、30秒の元動画をアップロードしないでください。これはWan3.0において最も陥りやすいコストの罠です。
  </Accordion>

  <Accordion title="静止画の描写だけでなく、動きを記述する" icon="pen-line">
    動画モデルは「誰が何をし、カメラがどのように動くか」に反応します。「窓辺で伸びをする茶トラ猫、ゆっくりドリーイン」のほうが、「かわいい茶トラ猫、日光、高解像度」よりも優れた結果を生みます。
  </Accordion>

  <Accordion title="3秒未満の間隔でポーリングを行わない" icon="timer">
    5秒のクリップの実測配信時間：480Pで約100秒、720Pで約120秒、1080Pで約170秒です。5〜10秒ごとのポーリングで十分です。
  </Accordion>

  <Accordion title="失敗時に同じpromptを自動再試行しない" icon="repeat">
    失敗したタスクは全額返金されますが、再送信すると**再度課金されます**。モデレーション失敗の場合はpromptを変更し、アセットエラーの場合はまずURLへのアクセス可能性を確認してください。
  </Accordion>
</AccordionGroup>

## よくある質問

<AccordionGroup>
  <Accordion title="出力動画よりも課金秒数が長くなっているのはなぜですか？">
    課金秒数 = **入力参照動画の長さ + 出力の長さ**です。10秒の参照動画で2秒の出力の場合、12秒分が課金されます。参照画像、音声、ファイルは無料です。
  </Accordion>

  <Accordion title="送信時に高額が課金され、その後に返金されたのはなぜですか？">
    参照動画を含むタスクは上限である30秒分で事前承認され、その後実際の課金秒数に基づいて精算され、差額が返金されます。請求明細にマイナスの調整項目が表示されます。
  </Accordion>

  <Accordion title="タスクが in_progress のまま進捗が30%で停止していますか？">
    これはアップストリーム側のおおまかな進捗レポートであり、停止しているわけではありません。1080Pや長尺のクリップは3〜5分かかる場合があります。ポーリングを続けてください。
  </Accordion>

  <Accordion title="ダウンロード時に result_url が403を返しますか？">
    `Authorization` ヘッダーは**送信しないで**ください — これは署名付きOSSリンクです。リンクは24時間後に期限切れとなるため、速やかに再ホストしてください。
  </Accordion>

  <Accordion title="送信時に200が返されたのにタスクが失敗しましたか？">
    パラメータやアセットのエラーは同期的な400ではなく、非同期に失敗します。一般的な原因：アクセスできないメディアURL（期限切れの署名付きリンクを含む）、入力 + 出力が30秒を超えている、コンテンツモデレーション。失敗したタスクは全額返金されます。
  </Accordion>

  <Accordion title="Getting &#x22;no available channel for this model&#x22;?">
    APIキーの**課金モード**が従量課金制（pay-as-you-go）（呼び出し回数単位のキーでは動画モデルをルーティングできません）になっていること、およびその**グループ**に `Wan&HappyHorse` が含まれていることを確認してください。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="動画生成 API リファレンス" icon="code" href="/ja/api-capabilities/wan3/video-generation">
    ライブPlaygroundに加え、cURL / Python / Nodeのサンプルを提供
  </Card>

  <Card title="Wan2.7 動画生成" icon="video" href="/ja/api-capabilities/wan/overview">
    音声駆動によるリップシンクに対応した、前世代の4モデル
  </Card>

  <Card title="HappyHorse 動画生成" icon="horse" href="/ja/api-capabilities/happyhorse/overview">
    同グループ内のもうひとつの動画シリーズ
  </Card>

  <Card title="モデル料金" icon="dollar-sign" href="/en/models/index">
    サイト全体の公式料金表
  </Card>
</CardGroup>

公式リファレンス: `help.aliyun.com/zh/model-studio/wan3-video-generation-guide`、`help.aliyun.com/zh/model-studio/wan3-video-generation-api-reference`


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.