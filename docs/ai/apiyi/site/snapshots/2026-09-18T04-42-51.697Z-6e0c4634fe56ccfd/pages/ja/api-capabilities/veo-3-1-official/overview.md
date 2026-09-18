> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 公式動画生成

> Google Veo 3.1 公式リレーチャンネルの完全ガイド: Google AI Studio への透過的なパススルー、リクエストごとの課金で $0.3 / $1.2、柔軟な 4 / 6 / 8 秒の長さ、720p / 1080p / 4k の階層、そして手間のないオンボーディング — グループや課金モードの切り替えは不要です。

## 概要

**VEO 3.1 Official** は、Google Veo 3.1 向けの APIYI の **公式リレーチャネル** です。Google AI Studio の `veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview` 非同期エンドポイントへの透過的なパススルーで、モデル ID、レスポンスフィールド、制約は上流と同一です。**リクエストごとの課金**、**`Default` グループで利用可能** で、現在利用できる中で最も導入しやすい公式品質の Veo 3.1 チャネルです。

<Note>
  **🎬 特長**: Google AI Studio への透過的なパススルー + ネイティブ同期音声 + 柔軟な 4 / 6 / 8 秒の長さ + 3 段階の解像度（720p / 1080p / 4k）+ 1 回あたり \$0.3 からの課金 + **`Default` グループ + リクエストごとの課金または従量課金の Priority Tokens**（専用グループは不要です。純粋な従量課金はサポートされません）。**広告用ショート、EC 素材、SNS コンテンツ、製品デモ** など、公式品質を最も簡単に導入したい用途に適しています。
</Note>

<Warning>
  **⚠️ CDN URL は返されません — MP4 ストリームは自分でダウンロードする必要があります**: このチャネルは現在、配布可能な公開 / CDN URL を**返しません**。`status: "completed"`したら、**`GET /v1/videos/{task_id}/content` を呼び出して MP4 バイナリを取得し**、エンドユーザーに配信する前に自分の OSS / CDN に保存してください。ブラウザからは `/content` に直接アクセスできません（認証ヘッダーが必要です）。以下の [API エンドポイント](#api-endpoints) を参照してください。
</Warning>

<CardGroup cols={2}>
  <Card title="テキストから動画への API" icon="wand-sparkles" href="/ja/api-capabilities/veo-3-1-official/text-to-video">
    `POST /v1/videos`、テキストのみから動画を生成します — JSON リクエストボディ、最もシンプルな入口です。
  </Card>

  <Card title="画像から動画への API" icon="image" href="/ja/api-capabilities/veo-3-1-official/image-to-video">
    `POST /v1/videos` + `input_reference` の multipart アップロードで、静止画をクリップにアニメーション化します。
  </Card>

  <Card title="公式 vs リバース" icon="scale" href="/ja/api-capabilities/veo-3-1-official/vs-veo-reverse">
    既存の [VEO 3.1 (リバースチャネル)](/en/api-capabilities/veo/overview) に対する比較マトリクスです。
  </Card>

  <Card title="ビジュアル API テスト" icon="flask-conical" href="https://icover.ai/veo-official">
    このエンドポイントを iCover のビジュアルテストツールで直接デバッグできます — コードは不要です。
  </Card>

  <Card title="非同期タスクの検索 / ダウンロード" icon="list-checks" href="https://api.apiyi.com/task">
    送信済みの動画タスクを表示し、APIYI コンソールで動画リンクをダウンロードします — API の外にある参照エントリです。
  </Card>
</CardGroup>

## AI エージェントに統合を任せる

<Note>
  Codex / Claude Code / Cursor で作業するなら、下のプロンプトをコピーしてエージェントに渡してください。まずこのページのプレーンテキスト版を取得し（任意の docs URL の末尾に `.md` を付けます）、その後はプロジェクト固有のスタックでコードを書きます。非同期ポーリング、**MP4 を自分でダウンロードしなければならないこと**、段階的なタイムアウト、そして厳しい 4K 制約は、要件にすでに織り込まれています。
</Note>

<Prompt description="VEO 3.1 の公式テキストから動画と画像から動画の統合やトラブルシューティングを、コーディングエージェントに任せましょう。Codex、Claude Code、Cursor などのツールにコピー＆ペーストしてください。" icon="bot" actions={["copy"]}>
  このプロジェクトに VEO 3.1 の公式テキストから動画と画像から動画を統合／トラブルシューティングします。

  コードを触る前にドキュメントを読んでください。このページのプレーンテキスト版は [https://docs.apiyi.com/en/api-capabilities/veo-3-1-official/overview.md](https://docs.apiyi.com/en/api-capabilities/veo-3-1-official/overview.md) で取得できます。より細かいパラメータの詳細については、テキストから動画と画像から動画のページにも同じように `.md` を付けてください。

  要件:

  1. 同期待ちではなく、3段階の非同期フローを使ってください。このチャネルは **非同期のみ** です: `POST /v1/videos` がジョブを送信して `task_id` を返し、その後 `GET /v1/videos/{task_id}` を **8〜10秒** ごとにポーリングして `status` が `completed` になるまで待ち、最後に `GET /v1/videos/{task_id}/content` から MP4 をダウンロードします。**webhook はなく、ポーリングのみです**。callback 設定を探さないでください。

  2. 動画の取得（**このモデルで最も重要な項目です**）: レスポンスには **CDN も公開 URL も一切ありません**。`video_url` も `data.url` もありません。動画は `/content` エンドポイントから MP4 のバイナリストリームとしてのみ取得でき、そのリクエストには **`Authorization` ヘッダーを必ず付ける必要があります**。したがってフロントエンドは、そのエンドポイント URL を video タグの `src` に入れることは **できません**。認証ヘッダーなしのブラウザーリクエストは 401 になります。正しい方法は、**ステータスが `completed` になったらすぐにサーバー側で MP4 をダウンロードし、自前のオブジェクトストレージまたは CDN に再ホストすること**です。そのうえで、エンドユーザーには自分の URL を返してください。リモート動画の保持期間は公式には明示されていないため、**`task_id` を長期的なアドレスとして頼らないでください**。`/content` からダウンロードするときは、4秒間隔で 3〜5 回リトライしてください。`status` が `completed` に切り替わった直後の一瞬で 400 が出ることがあります。

  3. 段階的なタイムアウト: POST 送信には 30 秒を許容してください（multipart の参照画像アップロードは遅くなることがあります）。ポーリングの待機上限は解像度ごとに設定します — **720p と 1080p は 3分**、**4K は 10分**です。これらは 1つの固定値にハードコードせず、設定で管理してください。

  4. モデルとパラメータ: モデル名は `veo-3.1-fast-generate-preview`（安価で、日常利用に十分）または `veo-3.1-generate-preview`（標準ティア）のどちらかです。duration フィールドは **`seconds` であり、`duration` ではありません**。しかも **文字列である必要があります**（`"4"` / `"6"` / `"8"`） — 数値はサーバーに拒否されます。**フィールド名を `duration` にするとエラーは出ませんが、黙って無視され、duration は 4秒にフォールバックします**。これがまさに「8秒を指定したのに4秒になった」の原因です。**duration と resolution は連動しています**。`1080p` と `4k` は **`seconds` of `"8"` のみ** を受け付け、`"4"` や `"6"` を渡すとエラーになります。3つすべての duration を許可するのは `720p` だけです。したがって UI で resolution と duration を同時に選ばせるなら、あり得ない組み合わせを出すのではなく、そのペアを制約してください。4K にはさらにモデル `veo-3.1-generate-preview` と 10分のタイムアウトが必要です。4K は 1080p より 4〜6倍遅く、ファイルサイズも約10倍大きくなりますが、**1回あたりの課金は duration と解像度の両方に依存しません（4K は追加料金なしで、節約もありません）**。そのため、デフォルトは 1080p にし、4K は明示的なユーザー選択にしてください。

  5. image-to-video には3つの厳しい制約があります。リクエストは **`multipart/form-data`** でなければならず、JSON ではありません。image フィールド名は **必ず `input_reference`** でなければならず（`image`、`reference`、`input_image` はすべて無視されます）、さらに **1枚の画像しか受け付けません**。追加の画像は黙って捨てられます。リモート URL は **受け付けられない** ため、ファイルか Base64 をアップロードしてください。受け付ける形式は `image/jpeg`、`image/png`、`image/webp` です。このチャネルには **先頭/末尾フレーム機能もマルチ参照機能もありません** ので、その点については Google の公式 Veo 3.1 ドキュメントに合わせて実装しないでください。multipart モードでは、`metadata.*` フィールドは `resolution`、`aspectRatio`、`seed` という名前の通常のフォームフィールドに平坦化されます。

  6. **`generateAudio` は送らないでください。** Veo 3.1 は音声をネイティブに生成しますが、そのパラメータを渡すと上流が `INVALID_ARGUMENT` を返します。効果音、音声、アンビエンスを調整したい場合は、意図をプロンプトに書いてください。このチャネルには audio フィールド自体がありません。

  7. 課金とエラー: **課金は 1回ごと、モデル名ベースで行われ、duration、解像度、参照画像を渡したかどうかには依存しません**。非同期モードでは、**生成失敗、モデレーションブロック、過負荷エラーはいずれも課金されません。課金されるのは `completed` ステータスだけです**。そのため、自動リトライで二重請求のリスクはありません。エラーハンドリングについては、`PUBLIC_` プレフィックスの付いたエラーは上流のモデレーションブロックで、課金対象ではなく、プロンプトを調整したうえでそのまま再試行できます。`5xx` または `INTERNAL` は一時的な上流エラーで、同じ seed のまま 1〜2 回リトライする価値があります。`failed` に変わるタスクは通常モデレーションか上流キャパシティの問題で、これも課金されません。

  8. 注意すべき token 設定が1つあります。このモデルは token が **呼び出しごとの課金** または **従量課金優先** に設定されている必要があります。**通常の従量課金はサポートされていません**。課金モードを理由に失敗する場合は、コンソールで token を切り替えてください。

  9. キーは `APIYI_API_KEY` 環境変数から読み取り、ベース URL は [https://api.apiyi.com/v1](https://api.apiyi.com/v1) を使ってください。ハードコードも git へのコミットも禁止です。

  10. 終わったら、実際にテキストから動画の呼び出しを1回、画像から動画の呼び出しを1回実行し、その動画と2回分の料金を見せてください。
</Prompt>

<Accordion title="このプロンプトで避けられること">
  | 要件                                        | 防げる落とし穴                                                                                                 |
  | ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
  | MP4 をすぐダウンロードして再ホストする                     | レスポンスには配布可能な URL がなく、リモートの保持期間も不明なので、`task_id` を永続的なアドレスとして扱うと、いずれ破綻します                                 |
  | フロントエンドから `/content` に直接アクセスできない          | そのエンドポイントには認証ヘッダーが必要なので、ブラウザーリクエストは 401 になり、video 要素は真っ黒になります                                           |
  | 同期待ちではなくポーリングする                           | 公式リレーは非同期エンドポイントのみを公開しており、webhook もないため、1回のブロッキング HTTP 呼び出しでは動作しません                                     |
  | duration は解像度と連動する                        | `1080p` と `4k` は `seconds` of `"8"` のみを受け付けるため、1080p に `"4"` をデフォルト指定するとエラーになります。3つすべてを許可するのは 720p だけです |
  | `seconds` は数値ではなく文字列                      | フィールド名も `duration` ではありません。どちらを間違えてもサーバーに拒否されます                                                         |
  | 失敗は課金されない                                 | 課金されるのは `completed` だけなので、自動リトライは安全です                                                                   |
  | token は per-call か PAYG-priority である必要がある | 通常の従量課金ではそもそも動かず、エラーはコードとは無関係です                                                                         |
</Accordion>

## APIYI の VEO 3.1 公式版を使う理由

Google 公式 / Vertex AI チャネルのドロップイン代替で、**導入時の手間**, **安定性**, **コスト** にまたがる本番シナリオ向けに最適化されています:

<CardGroup cols={2}>
  <Card title="公式パススルー · 同一の Model IDs" icon="shield-check">
    Google AI Studio の Veo 3.1 非同期エンドポイントへの透過的なパススルーです。**Model IDs（`veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview`）は上流と完全に一致し**、リクエストとレスポンスのフィールドおよび制約も 1 対 1 で対応しています。
  </Card>

  <Card title="手間のない導入 · グループ切り替え不要" icon="plug">
    呼び出しは **`Default` グループ** で動作し、**Pay-per-request または Pay-as-you-go Priority Tokens** を利用できます（純粋な Pay-as-you-go はサポートされません）。**専用のグループ切り替えは不要**で、既存の Pay-per-request Tokens をそのまま使えます。Veo 3.1 における、最も手間の少ない公式品質チャネルです。
  </Card>

  <Card title="無制限の同時実行数 · 本番スケール" icon="infinity">
    透過プロキシ付きの集約アカウントプールで、バッチ撮影、広告パイプライン、大規模本番を線形にスケールできます。**Google のアカウントごとのティア上限はありません**。
  </Card>

  <Card title="リクエスト単位の料金 · Google より 60%以上安い" icon="percent">
    `veo-3.1-fast-generate-preview` \$0.3/req、`veo-3.1-generate-preview` \$1.2/req で、4/6/8 秒および 720p/1080p/4k で一律です。**Google の公式 8秒 1080p と比べて 62～68% 節約**でき、[チャージ特典](/ja/faq/recharge-promotions) を組み合わせるとさらにお得になります。失敗したタスクは課金されません。
  </Card>

  <Card title="グローバルな手間なしアクセス" icon="globe">
    **海外サーバーやプロキシは不要**です — 中国本土のデータセンター、住宅回線、または海外ノードから `api.apiyi.com` に直接接続できます。Google AI Studio / Vertex AI の越境設定は一切不要です。
  </Card>

  <Card title="専門サポート · エンタープライズ導入" icon="handshake">
    当社チームは動画生成に深い知見があります: prompt engineering、解像度選定、バッチ制作、後処理まで対応します。企業のお客様向けに、PoC から本番までの技術サポートをフルで提供します。
  </Card>
</CardGroup>

## 主な機能

<CardGroup cols={2}>
  <Card title="ネイティブ同期オーディオ" icon="volume-2">
    Veo 3.1 は **同期オーディオ付きの動画**（環境音、会話、音楽）をネイティブに出力します。別途オーディオのポストプロダクションは不要です。プロンプトで音声の意図を指定してください。
  </Card>

  <Card title="4 / 6 / 8 秒の柔軟な長さ" icon="clock">
    `seconds` 文字列 enum: `"4"` / `"6"` / `"8"`. **1リクエストごとの課金で、長さは価格に影響しません**。1080p / 4k ティアには `"8"` が必要です。
  </Card>

  <Card title="3 つの解像度ティア" icon="expand">
    `720p` / `1080p` / `4k`、**1リクエストごとの一律料金**。横向き（`16:9`）と縦向き（`9:16`）を自由に切り替えられます。
  </Card>

  <Card title="正確な指示追従" icon="target">
    Veo 3.1 は、カメラの動き、物体物理、キャラクター表現の忠実度でこのティアをリードします。豊富なカメラ言語キーワード（push/pull/pan/dolly、low/high angles）に対応しています。
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="画像から動画へ (input_reference)" icon="image">
    1 枚の画像を視覚的なアンカーとしてアップロードし、静止コンテンツをアニメーション化します。[画像から動画へ](/ja/api-capabilities/veo-3-1-official/image-to-video) を参照してください。
  </Card>

  <Card title="非同期タスクモデル" icon="list-check">
    submit はすぐに `task_id` を返します。ステータスは個別にポーリングし、最終動画をダウンロードできます。バッチ管理や失敗時の再開フローに最適です。
  </Card>

  <Card title="OpenAI互換プロトコル" icon="plug">
    `base_url=https://api.apiyi.com/v1` + `Bearer` 認証。生の HTTP または OpenAI SDK の低レベル `client.post()` で動作します。
  </Card>

  <Card title="失敗は無料" icon="circle-check">
    非同期モードでは、失敗した生成、コンテンツポリシーによる拒否、パラメータエラーは **課金されません**。**`status=completed` のタスクのみ課金対象です**。
  </Card>
</CardGroup>

## 料金

APIYIは**リクエストごとの従量課金**です — サポート対象の継続時間/解像度の組み合わせ内では定額で、**長時間出力や高解像度出力でも追加料金はありません**。`ai.google.dev/gemini-api/docs/pricing`の公開料金によると、Googleの公式Veo 3.1は秒単位で課金されます。以下の割引は**8秒動画**で計算しています。

| モデル                             | APIYI価格         | Google公式 8s 1080p       | Google公式 8s 4K          |
| ------------------------------- | --------------- | ----------------------- | ----------------------- |
| `veo-3.1-fast-generate-preview` | **\$0.3 / req** | \$0.96<br />**68.8%オフ** | \$2.40<br />**87.5%オフ** |
| `veo-3.1-generate-preview`      | **\$1.2 / req** | \$3.20<br />**62.5%オフ** | \$4.80<br />**75.0%オフ** |

<Info>
  **課金に関する注意**:

  * モデル名ごとに**リクエスト単位**で課金され、継続時間（4/6/8秒）、解像度（720p/1080p/4k）、または`input_reference`の有無に関係ありません — **4Kを選んでも720pと同じ料金です**
  * 非同期モードでは、生成失敗 / コンテンツポリシーによる拒否 / 容量エラーのいずれも**課金されません**
  * [Top-Up Promotions](/ja/faq/recharge-promotions) のチャージ特典ティアにより、実質コストはさらに下がります
  * 4Kはレンダリングが4〜6倍遅く、ファイルは約10倍大きくなります — 日常利用では**1080pをデフォルト**にしてください
  * Googleの公式4K料金は \$0.30/sec（fast）/ \$0.60/sec（standard）で、8秒あたり \$2.40 / \$4.80 です（出典: `ai.google.dev/gemini-api/docs/pricing`）
</Info>

## グループ設定

VEO 3.1 Official は `Default` グループで動作し（1x）、**専用グループへの切り替えは不要**です。Token の課金モードは **Pay-per-request** または **Pay-as-you-go Priority** である必要があります。**純粋な Pay-as-you-go はサポートされていません**（必要に応じて [console](https://api.apiyi.com/token) で Token モードを切り替えてください）。

<Tip>
  **導入時の手間が少ない**: VEO 3.1 Official は Default グループで動作し、Pay-per-request と Pay-as-you-go Priority の両方を受け付けます。専用グループの設定も不要です — **既存の Pay-per-request Token をそのまま使い、`base_url` を変更するだけの「ゼロ設定」導入に最適です**。
</Tip>

| 項目       | VEO 3.1 Official                                                   | 備考                           |
| -------- | ------------------------------------------------------------------ | ---------------------------- |
| グループ     | `Default` (1x)                                                     | 切り替え不要                       |
| 課金方式     | Pay-per-request ✅ / Pay-as-you-go Priority ✅ / 純粋な Pay-as-you-go ❌ | 純粋な Pay-as-you-go は切り替えが必要です |
| Token 要件 | Pay-per-request または Pay-as-you-go Priority + Default グループ          | 専用の Token は不要です              |
| レート / 倍率 | 1.0x                                                               | 上記価格で直接精算されます                |

## 技術仕様

| 項目                                   | `veo-3.1-fast-generate-preview`                         | `veo-3.1-generate-preview` |
| ------------------------------------ | ------------------------------------------------------- | -------------------------- |
| **価格**                               | \$0.3 / リクエスト                                           | \$1.2 / リクエスト              |
| **対応再生時間（秒、文字列）**                    | `"4"` / `"6"` / `"8"`                                   | `"4"` / `"6"` / `"8"`      |
| **対応解像度（`metadata.resolution`）**     | `720p` / `1080p` / `4k`                                 | `720p` / `1080p` / `4k`    |
| **対応アスペクト比（`metadata.aspectRatio`）** | `16:9` / `9:16`                                         | `16:9` / `9:16`            |
| **音声**                               | ✅ 同期された音声 + 動画                                          | ✅                          |
| **画像から動画（input\_reference）**         | ✅（参照画像 1 枚）                                             | ✅（参照画像 1 枚）                |
| **一般的な生成時間**                         | 720p 60〜90秒 · 1080p 80〜120秒 · 4K 5〜6分                   | 同じ                         |
| **動画の保持期間**                          | 公式には文書化されていません — すぐにダウンロードしてください                        | 同じ                         |
| **レスポンスフィールド**                       | `id` / `task_id` / `status` / `progress` / `created_at` | 同じ                         |

<Warning>
  **1080p / 4k 解像度では、`seconds` は `"8"` でなければなりません** — `"4"` または `"6"` は上流側で拒否されます。720p では 3 つの再生時間すべてがサポートされています。
</Warning>

## API エンドポイント

| Endpoint                       | Method | Purpose                                                | Content-Type                                |
| ------------------------------ | ------ | ------------------------------------------------------ | ------------------------------------------- |
| `/v1/videos`                   | POST   | 動画生成タスクを送信する（text-to-video / image-to-video、統一エンドポイント） | `application/json` or `multipart/form-data` |
| `/v1/videos/{task_id}`         | GET    | タスクのステータスと進捗を問い合わせる                                    | —                                           |
| `/v1/videos/{task_id}/content` | GET    | **生成された MP4（バイナリストリーム）をダウンロードする**                      | —                                           |

<Warning>
  **⚠️ MP4 バイナリダウンロードのみ — CDN URL は返されません**

  このチャネルは現在、レスポンス内に **CDN / 公開 URL を一切出力しません** — 動画ファイルは **`GET /v1/videos/{task_id}/content` 経由の MP4 バイナリストリーム** としてのみ取得できます（`Authorization: Bearer` ヘッダーが必要です）。

  影響:

  * レスポンスには **`video_url` / `data.url` / その他の直接配布可能なリンクは返されません**
  * フロントエンドはエンドポイント URL を `<video>` タグに直接入れることはできません — auth ヘッダーなしのブラウザーリクエストは 401 になります
  * **`status: "completed"` したらすぐに、MP4 をダウンロードして自前の OSS / CDN に保存し、ユーザーにはその URL を配信してください**
  * 動画の保持期間は公式には文書化されていません — 遠隔の `task_id` に動画取得を長期依存しないでください
</Warning>

<Tip>
  **エンドポイントの選択**: 主要 `api.apiyi.com`; バックアップ ゲートウェイ `vip.apiyi.com` / `b.apiyi.com` は同じ動作です。
</Tip>

## 主要パラメータ

<Tip>
  **⚡ パラメータの完全リファレンス**: `model` / `prompt` / `seconds` / `size` / `metadata.*` の型、デフォルト値、制約を含む完全な表は、[テキストから動画 - パラメータリファレンス](/ja/api-capabilities/veo-3-1-official/text-to-video#parameter-reference) へ移動してください。このセクションでは、特に落とし穴になりやすい **3 つのパラメータ** のみを解説します。
</Tip>

### `seconds`（動画の長さ）

長さフィールドの名前は **`seconds`** であり（`duration` ではありません）、**文字列でなければなりません**（`"4"` / `"6"` / `"8"`）。数値を渡すと、次のようになります:

```
parse_request_failed: cannot unmarshal number into Go struct field ... duration of type string
```

| 値     | 720p      | 1080p  | 4k     |
| ----- | --------- | ------ | ------ |
| `"4"` | ✅         | ❌      | ❌      |
| `"6"` | ✅         | ❌      | ❌      |
| `"8"` | ✅ (デフォルト) | ✅ (必須) | ✅ (必須) |

<Warning>
  **よくある落とし穴: フィールド名を `duration` にしても、黙って無視されます。** `duration` はこのチャンネルでは認識されないため → 破棄されるため → 長さはデフォルトの **4 秒** にフォールバックします:

  * 720p（および 4 秒を許可する他のティア）では: **エラーにはなりませんが、4 秒しか取得できません**（これがまさに「8s を送ったのに 4s になった」ケースです）
  * 1080p / 4k では: 4 秒は不正なので、`Resolution 1080p requires duration seconds to be 8 seconds, but got 4` でエラーになります

  **正しい使い方: 値 `"8"`（文字列）を持つ `seconds` フィールドを送信してください。**
</Warning>

パラメータの優先順位: `metadata.durationSeconds > seconds > 8`

### `metadata.resolution`（解像度ティア）

| 値              | ピクセル（横向き）   | ピクセル（縦向き）   | 備考                                       |
| -------------- | ----------- | ----------- | ---------------------------------------- |
| `720p` (デフォルト) | `1280x720`  | `720x1280`  | 3 つの長さすべて                                |
| `1080p`        | `1920x1080` | `1080x1920` | **`seconds="8"` のみ**                     |
| `4k`           | `3840x2160` | `2160x3840` | **`seconds="8"` のみ**、レンダリングは 4〜6 倍遅くなります |

パラメータの優先順位: `metadata.resolution > size > 720p`

### ⚠️ `generateAudio` を渡さないでください

Veo 3 / 3.1 は**標準で音声対応**ですが、`generateAudio` パラメータは**渡してはいけません**。上流側で `INVALID_ARGUMENT` によって拒否されます。音声を制御するには、**意図を prompt に書き込んでください**:

> 「海岸の灯台、夕暮れ時。波、遠くの海鳥、弱い風の音、映画のような雰囲気」

## Best Practices

<Steps>
  <Step title="用途に応じてモデルを選ぶ">
    * **イテレーション / バッチプレビュー** → `veo-3.1-fast-generate-preview` (\$0.3/request)
    * **最終納品 / 4K** → `veo-3.1-generate-preview` (\$1.2/request)
    * 同じ prompt + シードで両方を実行し、見た目で選びます
  </Step>

  <Step title="まず4秒で検証する">
    新しい prompt ごとに、`seconds: "4"`から始めてカメラの方向とスタイルを検証します（60–90秒のレンダリング、\$0.3）。見た目が固まったら、8秒または1080pにスケールアップしてください。
  </Step>

  <Step title="同期待機ではなく、非同期ポーリングを使う">
    公式チャンネルは **非同期のみ** です。POST で送信して `task_id` を受け取り → `GET /v1/videos/{task_id}` を8〜10秒ごとにポーリングして `status: "completed"` になるまで待機 → `/content` からダウンロードします。**webhook はありません。ポーリングのみです**。
  </Step>

  <Step title="ティアごとにクライアントのタイムアウトを設定する">
    * 720p / 1080p: 3分のハードタイムアウト
    * 4K: 10分のハードタイムアウト
    * POST 送信（multipart）: 30秒の最小タイムアウト
  </Step>

  <Step title="完了したらすぐにダウンロードする">
    `status` が `completed` に変わったら、**自前の OSS / CDN にすぐダウンロードしてください** — リモートの `task_id` に長期依存しないでください。`/content` エンドポイントは、`status` が切り替わった直後に **400 を返すことがあります**。4秒後に再試行してください（サンプルクライアントにはこれが組み込み済みです）。
  </Step>

  <Step title="音声の意図を prompt に埋め込む">
    **`generateAudio` は渡さないでください**（`INVALID_ARGUMENT` が返ります）。環境音、セリフ、BGM を指定する場合は、prompt に「波、遠くの海鳥、弱い風の音」と書いてください。
  </Step>

  <Step title="そちら側でレート制限をかける">
    同時実行数の上限は公開されていませんが、実際には 10 件の同時送信はすべて正常にキューイングされました。**本番側では in-flight を 10 以下に制限することを推奨します**。429 / 5xx には指数バックオフを使ってください。
  </Step>
</Steps>

## エラーコードと再試行

| ステータス / 症状                     | 意味                                            | 推奨アクション                                                    |
| ------------------------------ | --------------------------------------------- | ---------------------------------------------------------- |
| `400` + `parse_request_failed` | `seconds` が数値でした                              | 文字列 `"4"` / `"6"` / `"8"` を使用してください                        |
| 4秒のみ / `... but got 4`         | フィールド名が `duration` でした（黙って無視され、4秒にフォールバックします） | `seconds` を値 `"8"`（文字列）で使用してください                           |
| `INVALID_ARGUMENT`             | `generateAudio` を指定したか、1080p/4k で 8秒以外を指定しました | `generateAudio` を外し、HD/4K では `seconds="8"` を設定してください       |
| `401`                          | 無効な token                                     | `Authorization: Bearer <key>` を確認してください（余分な空白なし）、キーはまだ有効です |
| `429`                          | レート制限 / 残高不足                                  | 指数バックオフで再試行してください。チャージしてから再試行してください                        |
| `5xx` / `INTERNAL`             | 上流の一時的なエラー                                    | 同じ seed で 1～2回再試行してください（課金されません）                           |
| `GET /content` で時々 400         | `status` がちょうど `completed` に切り替わった            | 4秒待って再試行してください（クライアントは 3～5回再試行すべきです）                       |
| タスク `failed`                   | 生成に失敗しました（通常はコンテンツレビューまたは上流のキャパシティが原因です）      | prompt を調整して再試行してください。**タスクは課金されません**                      |

<Info>
  **推奨クライアント設定**:

  * POST送信タイムアウト: **30秒**（multipart アップロードではさらに長く必要になる場合があります）
  * ポーリング間隔: **8～10秒**; 最大待機時間 720p/1080p **3分**, 4K **10分**
  * 5xx と `failed` に対して指数バックオフで再試行（1～2回の試行を推奨）
  * `/content` を 4秒間隔で 3～5回再試行してください
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Official と Reverse チャネルの違いは何ですか？ Reverse チャネルはまだ使えますか？">
    **Official（このページ）**: Google AI Studio の上流エンドポイントへの透過パススルーです。Model IDs は Google upstream（`veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview`）と一致し、リクエストごとに \$0.3 / \$1.2、非同期エンドポイントのみです。

    **Reverse**（既存の [VEO 3.1](/en/api-capabilities/veo/overview)）: Google Flow へのリバースエンジニアリングされたアクセスです。Model IDs は `veo-3.1-fast` / `veo-3.1` / `-fl` 系で、リクエストごとに \$0.15 からと安価です。**ストリーミング同期** と非同期モードの両方に対応し、さらに **フレームから動画**（先頭/末尾フレーム）も使えます。

    完全版の [Official と Reverse の判断マトリクス](/ja/api-capabilities/veo-3-1-official/vs-veo-reverse) をご覧ください。両チャネルは共存しているため、ビジネス要件で選んでください。
  </Accordion>

  <Accordion title="length フィールドは秒数ですか、それとも継続時間ですか？ それと、なぜ文字列でなければならないのですか？">
    **リクエストフィールドは `seconds` です**（string `"4"` / `"6"` / `"8"`）。`duration` と名付けても認識されず、静かに破棄されて length はデフォルトの 4 秒にフォールバックします。これが「8s を送ったのに 4s しか返らない」問題の根本原因です。

    なぜ文字列でなければならないかというと、バックエンドの Go 構造体では、このフィールド（内部名 `duration`）を `string` と定義しているため、数値はデコーダ層で `parse_request_failed: cannot unmarshal number into Go struct field ... duration of type string` により拒否されます（そのエラー内の `duration` はバックエンド内部のフィールド名で、リクエスト自体はまだ `seconds` を送っています）。**覚えておいてください: `seconds` を送り、値は引用符で囲んでください: `"4"` / `"6"` / `"8"`**。
  </Accordion>

  <Accordion title="ダイアログ / 環境音 / BGM を追加するにはどうすればよいですか？ generateAudio を渡せますか？">
    Veo 3 / 3.1 は **ネイティブで音声対応の** 動画モデルですが、`generateAudio` パラメータは**渡してはいけません**（上流は `INVALID_ARGUMENT` を返します）。音を制御したい場合は、**意図を prompt に書き込んでください**:

    > 「海岸の灯台の夕景。波音、遠くの海鳥、弱い風の音、映画のような雰囲気」
  </Accordion>

  <Accordion title="fast と standard はどちらを選ぶべきですか？ fast は本当に速いのですか？">
    * 同等のパラメータでは、**レンダリング時間はほぼ同じ**です（720p 8 秒の実測: fast 83 秒、standard 78 秒）。**fast は速いのではなく、安いだけです**（\$0.3 対 \$1.2）
    * デフォルトは `veo-3.1-fast-generate-preview` にしてください
    * 最終納品時や、ディテールの忠実度 / 物理的一貫性が重要なときは `veo-3.1-generate-preview` に切り替えてください
    * 本番で A/B テストする場合は、同じ prompt + seed で両方を実行し、見た目で選んでください
  </Accordion>

  <Accordion title="4K は使う価値がありますか？">
    **多くのケースではおすすめしません**:

    * リクエストあたりの価格が同じなので魅力的に見えます
    * しかしレンダリングは **4〜6 倍遅い** です（720p 80 秒 → 4K 350 秒）
    * ファイルサイズは約 10 倍大きくなります（720p 4MB → 4K 40MB）— 帯域とストレージのコストも倍増します
    * 1080p であれば、ほとんどの再生シナリオで見た目は十分です

    **それでも 4K が必要な場合**: `veo-3.1-generate-preview` を使い、`seconds="8"` を設定し（必須）、client timeout を 10 分以上にし、バックグラウンドの非同期タスクとして実行してください。
  </Accordion>

  <Accordion title="タスクはいつ完了しますか？ webhook はありますか？">
    * **webhook はありません**。`GET /v1/videos/{task_id}` のポーリングのみです
    * 推奨ポーリング間隔: **8 秒**（実測で十分で、レート制限には触れません）
    * 実測時間: 720p / 1080p で 60〜115 秒、4K で 5〜6 分
    * client timeout: 720p/1080p は 3 分、4K は 10 分
  </Accordion>

  <Accordion title="なぜ GET /content が 400 を返すのですか？">
    `status` が `completed` に切り替わった直後は、上流 CDN の同期遅延のため、`/v1/videos/{task_id}/content` を呼ぶと 400 が返ることがあります。**4 秒待って 1 回再試行**すると、たいてい解消します（サンプルクライアントは 4 秒間隔で 3〜5 回リトライします）。
  </Accordion>

  <Accordion title="動画の CDN URL を取得できますか？ フロントエンドからエンドポイントを直接叩けますか？">
    **現時点ではできません**。このチャネルはレスポンスで CDN / 公開 URL を返しません。`video_url` / `data.url` / その他の直接配布可能なリンクもありません。

    **動画を取得する唯一の方法**: `status: "completed"` の後に `GET /v1/videos/{task_id}/content` を呼び出して、**MP4 バイナリストリーム** を取得します（`Authorization: Bearer` ヘッダーが必要です）。

    **標準的な本番運用パターン**:

    1. バックエンドがタスク完了後すぐに MP4 をダウンロード → 自前の OSS / CDN に送信
    2. エンドユーザーには自分の CDN URL を返す
    3. **フロントエンドの `<video>` タグは `/content` を直接指してはいけません** — ブラウザは認証ヘッダーを付けられないため、リクエストは 401 になります

    上流が CDN URL を公開したら、このページも更新します。
  </Accordion>

  <Accordion title="動画はサーバーにどのくらい保持されますか？ すぐにダウンロードする必要がありますか？">
    保持期間は**公式にはドキュメント化されていません**。**完了後はすぐにダウンロードしてローカルに保存することを強く推奨します**。リモートの `task_id` を長期的に当てにしないでください。`/content` は期限切れ後、いずれ 404 になります。
  </Accordion>

  <Accordion title="なぜ進捗が 50% のままなのですか？">
    `progress` フィールドは粗い粒度で、**0 / 50 / 100 の間しか動きません**。パーセンテージの進捗バーには使わないでください。スピナーを使うか、「経過 / 想定」を自分で計算してください。
  </Accordion>

  <Accordion title="失敗した生成も課金されますか？">
    **いいえ**。**課金対象は `status=completed` のタスクのみです**。`failed` / キャンセル済み / content-policy による拒否 / パラメータエラーはすべて無料です。**実際の動画出力がなければ課金なし**です。
  </Accordion>

  <Accordion title="seed で完全に同じ動画を再現できますか？">
    **バイト単位で完全一致はしません**。実測では、同じ prompt + 同じ seed（`88888`）+ 同じパラメータで fast を 2 回実行すると、ファイルサイズは 9.81 MB と 9.25 MB、md5 も完全に異なり、レンダリング時間も異なりました。

    **ただし seed は飾りではありません**。同じ seed の出力は**まとまりやすく**（5 回テストで、同一グループ内のファイルサイズ差は 6% のみ）、異なる seed は**体系的にずれます**（グループ間の差は +36.8%）。含意は次のとおりです:

    * 「安定した見た目」にしたい → seed を固定する
    * 「バリエーションを探りたい」 → prompt をいじるより seed を変える
    * 「完全再生」をしたい → 諦めて mp4 を保存する
  </Accordion>

  <Accordion title="複数の参照画像を渡せますか？ 先頭/末尾フレームはどうですか？">
    **どちらも現時点では未対応です**。Image-to-video は 1 枚の画像のみ受け付け、フィールド名は `input_reference` で固定、さらに **file または Base64 のみで、リモート URL は使えません**。

    Google upstream の Veo 3.1 は multi-reference / first-last-frame / video extension に対応していますが、このチャネルは対応していません。**先頭/末尾フレームが必要なら、[VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview) `-fl` 系列を使ってください**。
  </Accordion>

  <Accordion title="同時実行数の制限はありますか？ QPS の上限は？">
    10 件の同時送信を実測しましたが、すべて正常にキューへ入り、拒否はありませんでした。正確な上限は公開されていません。**運用側では in-flight を 10 以下に制限し、429 / 5xx では指数バックオフを推奨します**。
  </Accordion>

  <Accordion title="動画には透かしや provenance メタデータが入りますか？">
    * 目に見える透かしはありません
    * ただし、MP4 メタデータ内に **Google C2PA Content Credentials**（Google C2PA Media Services により発行、形式 `urn:c2pa:...`）が埋め込まれています。エンドユーザーには見えませんが、**C2PA ツール（例: Adobe Content Authenticity）で「Veo によって生成された」ことを検証できます**
    * 再配布シナリオでは留意してください。通常は再生に影響しません
  </Accordion>

  <Accordion title="公式 OpenAI SDK を直接使えますか？">
    一部は可能です。インターフェースは OpenAI の慣例（`Bearer` 認証 + `/v1/...`）に従っていますが、OpenAI 公式 SDK には `videos.create` メソッドがありません（`/v1/videos` はカスタムパスです）。OpenAI SDK の低レベルな `client.post()` か、生の HTTP を使ってください。**生の HTTP が最も簡単です**。コード例は [テキストから動画の Playground](/ja/api-capabilities/veo-3-1-official/text-to-video) を参照してください。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [Text-to-Video Playground](/ja/api-capabilities/veo-3-1-official/text-to-video) — `POST /v1/videos` (JSON) インタラクティブなデバッガー + 5言語のコードサンプル
* [Image-to-Video Playground](/ja/api-capabilities/veo-3-1-official/image-to-video) — `POST /v1/videos` (multipart) + `input_reference` の利用方法
* [Official vs Reverse の判断マトリクス](/ja/api-capabilities/veo-3-1-official/vs-veo-reverse) — [VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview) との違い
* [チャージ特典](/ja/faq/recharge-promotions) — ボーナス階層と対象チャネル
* [API マニュアル](/ja/api-manual) — 一般的な呼び出し規約、タイムアウトと再試行のガイダンス
* Google 公式モデルページ: `ai.google.dev/gemini-api/docs/models/veo-3.1-generate-preview`
* Google の動画生成ドキュメント: `ai.google.dev/gemini-api/docs/video`

<Info>
  VEO 3.1 Official は APIYI の安定した公式リレーサービスであり、Google AI Studio への透過的なパススルーです。モデル ID、レスポンスフィールド、制約は Google の上流と完全に一致し、**また、このチャネルは Default グループで従量課金に対応しています** — 利用できる公式品質チャネルの中で最も導入しやすいものです。フィードバックはコンソールのサポートパネルから送信してください。
</Info>
