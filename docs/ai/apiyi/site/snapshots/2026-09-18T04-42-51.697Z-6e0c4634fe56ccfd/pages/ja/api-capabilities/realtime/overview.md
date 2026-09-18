> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# リアルタイム音声（WebSocket）

> 4つのリアルタイム音声モデル、1つのwssエンドポイント、1つのAPIYIキーで、双方向ストリーミング音声、割り込み発話、2つのターン検出モード、関数呼び出し、画像入力に対応します。4つのモデルはすべてデフォルトグループで利用できます。2つのプロトコルの全フィールド比較と、コストのかからないテキスト専用セルフテストパスも含まれています。

## 概要

Realtimeモデルは**長時間維持されるWebSocket接続**上で動作します。音声をストリーミングで入力し、音声をストリーミングで出力し、モデルは発話の途中でも割り込まれることがあります。「録音、アップロード、待機、再生」というサイクルは必要ありません。ASR + テキストモデル + TTSをつなぎ合わせる場合との違いは、これがエンドツーエンドであることです。モデルは声のトーン、間、感情を直接聞き取り、直接発話します。レイテンシーはサブ秒の範囲に収まります。

APIYIでは現在、**2つのプロトコルにまたがる4モデル**を提供しており、1つのエンドポイントと1つのキーを共有します。

* `gpt-realtime-2.1` / `gpt-realtime-2.1-mini` — OpenAI Realtime GAプロトコル
* `qwen3.5-omni-plus-realtime` / `qwen3.5-omni-flash-realtime` — Alibaba Cloud Model Studioプロトコル

<Warning>
  **ステータス（2026-09-14更新、UTC+8）**：4モデルすべてが**利用可能です。キーでデフォルトのグループを選択すれば、申請なしで直接呼び出せます**。VIPおよびSVIPグループにも対応しています。ぜひテスト、検証、統合をお試しください。このページに不足している情報がある場合や、実測結果と異なる場合はお知らせください。上流のプロトコルや動作は今後も変更される可能性があります。以下の「既知の制限事項」に記載されている内容はすべて実測に基づいており、上流の変更に応じて更新されます。本番環境にリリースする前に、再接続とグレースフルデグラデーションを実装してください。より高い同時実行数が必要な場合は、[WeComサポート](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)または [hi@apiyi.com](mailto:hi@apiyi.com) / [feedback@apiyi.com](mailto:feedback@apiyi.com) までご連絡ください。
</Warning>

<Note>
  **🎤 ハイライト**：1つの接続を介した双方向ストリーミング音声、**いつでも割り込み可能なバージイン**、`server_vad`および`semantic_vad`によるターン検出、結果の注入を含む完全なファンクションコールのラウンドトリップ、画像入力、そしてモダリティごとに分離された`usage`。上記すべては4モデルで検証済みです（初回検証：2026-08-24、再検証：2026-09-14、UTC+8）。
</Note>

<Info>
  **まず覚えておくべきこと**：4モデルは**2つの異なるリクエストプロトコル**を使用しており、フィールド名とイベント名も異なります。**リクエストボディを変更せずに`model`パラメータだけを変更しても動作しません**。これは、統合時に最もよく発生する失敗です。違いは6つのフィールドと3つのイベント名に集約されており、すべて以下の「プロトコル比較」に一覧されています。
</Info>

<CardGroup cols={2}>
  <Card title="WeComサポート" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    統合に関する質問、同時実行数の増加、ドキュメントの不足について、担当者に直接ご相談いただけます。
  </Card>

  <Card title="APIマニュアル" icon="book-open" href="/ja/api-manual">
    キーの作成、ベースURL、課金モード、その他の一般的な規則について説明します。
  </Card>

  <Card title="キーとグループ" icon="key-round" href="/ja/api-capabilities/token-management">
    キーを作成し、グループを選択してクォータを設定します。
  </Card>

  <Card title="呼び出しログ" icon="receipt-text" href="https://api.apiyi.com/log">
    コンソールで、呼び出しごとのtoken使用量と実際の料金を確認します。
  </Card>
</CardGroup>

このページは長いため、次の3つのセクションを必ずお読みください：**プロトコル比較**（モデルを切り替える前にお読みください）、**テキストから始める**（マイクを使わずにチェーン全体を検証します）、**既知の制限事項**（クライアントコードに影響する、実測に基づく4つの違いを説明します）。

## AIエージェントに統合作業を任せる

<Note>
  Codex / Claude Code / Cursor で開発している場合は、下のプロンプトをそこに貼り付けてください。まずこのページのプレーンテキスト版を取得します（任意の docs URL の末尾に `.md` を付けてください）。その後、あなたのスタック向けのコードを書きます。**2つのフィールドファミリー**、サンプルレートの厳格な下限、キャンセルの挙動、アイドル切断はすべて要件に組み込まれています。
</Note>

<Prompt description="コーディングエージェントに Realtime 音声の統合またはトラブルシューティングをさせてください。Codex、Claude Code、Cursor などのツールにコピー＆ペーストしてください。" icon="bot" actions={["copy"]}>
  このプロジェクトで APIYI Realtime 音声（WebSocket 上の双方向ストリーミング）を統合／トラブルシューティングしたいです。

  コードを書く前にドキュメントを読んでください: このページのプレーンテキスト版として [https://docs.apiyi.com/en/api-capabilities/realtime/overview.md](https://docs.apiyi.com/en/api-capabilities/realtime/overview.md) を取得し、「Protocol Comparison」と「Known Limitations」の各セクションを確認してください。

  要件:

  1. これは HTTP リクエストではなく、**WebSocket の長時間接続**です。エンドポイントは `wss://api.apiyi.com/v1/realtime?model=<model-name>` で、認証は `Authorization: Bearer <key>` ヘッダーです。**HTTP POST として書かないでください。また、`/v1/audio/speech` や `/v1/audio/transcriptions` の URL を組み立てようとしないでください** — それらは別の API です。

  2. **どのフィールドを書き始める前にも、モデルがどちらのプロトコルファミリーに属するかを判定してください。** `gpt-realtime-2.1` と `gpt-realtime-2.1-mini` は Realtime GA プロトコルを使い、`qwen3.5-omni-plus-realtime` と `qwen3.5-omni-flash-realtime` は Alibaba Cloud Model Studio プロトコルを使います。共有されるのはエンドポイントと認証だけで、リクエストボディとイベント名は全体で異なります: output modality `modalities` vs `output_modalities`; トップレベルの voice `voice` vs `audio.output.voice`; `input_audio_format` vs `audio.input.format`; トップレベルの `turn_detection` vs `audio.input.turn_detection`; `input_audio_transcription` vs `audio.input.transcription`。イベント名: `response.text.delta` vs `response.output_text.delta`、`response.audio.delta` vs `response.output_audio.delta`。**これらは 2 つの設定テンプレートとして書き、コード全体に if 分岐を散らさないでください。**

  3. 音声フォーマットの厳格な条件: 常に PCM の符号付き 16 ビット、モノラルで、Base64 エンコードして `input_audio_buffer.append` に入れてください。**サンプルレートは 2 つで異なります** — Model Studio は 16000 を使い、Realtime GA は少なくとも 24000 を要求し、16000 は `integer_below_min_value` で拒否します。クライアント側でリサンプリングしてください。サーバーに修正を期待しないでください。

  4. バージインを終わらせるために `response.done` を待ってブロックしないでください。`response.cancel` を送った後、**現在の 2 つの Model Studio モデルは `response.done` を返しません**（テストでも一貫して再現しています）。`response.output_item.done` をターン終了シグナルとして使い、保険として 5 秒のタイムアウトを追加してください。2 つの Realtime GA モデルは正しく動作しますが、同じロジックを両方に適用できます。

  5. 長時間接続には keepalive と再接続が必要です。**Model Studio はアイドル接続を 300 秒後に切断し、WebSocket レベルの ping/pong はアクティビティとしてカウントされません** — そのタイマーは延長されません。アイドル中はアプリケーションレベルのイベントを定期的に送るか、切断を受け入れて自動的に再接続してください。Realtime GA セッションには `expires_at` があり（接続からおよそ 30 分で測定されます）、再接続も必要です。**再接続後は `session.update` と必要なコンテキストを再送しなければなりません**。そうしないと、新しいセッションはデフォルトで動作します。

  6. ボイスは **最初の `session.update`** で固定してください。セッションが一度音声出力を生成した後は、ボイスを変更しようとしても `cannot_update_voice` になります。ボイスを切り替えるには新しいセッションを開いてください。

  7. キーは `APIYI_API_KEY` 環境変数から読み取り、ハードコードせず、コミットもしないでください。**フロントエンドから接続しないでください** — キーを保持し、音声フレームを転送するバックエンドのリレーを実装してください。

  8. マイクに触る前に、テキストのみのスモークテストを実行してください: `output_modalities` をテキストのみへ設定し、`input_text` を 1 つ送信して、テキスト差分と `response.done` 内の `usage` オブジェクトを受け取れることを確認します。その後、音声に進んでください。完了したら、各プロトコルファミリーに対して実際に 1 回ずつ呼び出しを実行し、両方の `usage` オブジェクトを私に貼り付けてください。
</Prompt>

<Accordion title="このプロンプトで回避できること">
  | 要件                            | 回避できる落とし穴                                                      |
  | ----------------------------- | -------------------------------------------------------------- |
  | 最初にプロトコルファミリーを識別する            | `model` だけを変更するとハンドシェイクは通るが、その後 `session.update` が拒否される        |
  | ファミリーごとにサンプルレートを固定する          | Realtime GA に 16 kHz を送ると `integer_below_min_value` で失敗する      |
  | output-modality フィールドがリネームされた | GA プロトコルで `modalities` を書くと、単なる未知のフィールドになる                     |
  | イベント名も変更された                   | GA プロトコルで `response.text.delta` を待ち受けても一度も発火しない                |
  | `output_item.done` で終了する      | Model Studio は cancel 後に `response.done` を返さないため、それを待つとターンが止まる |
  | keepalive が必要で、ping はカウントされない | ハートビートが 300 秒のアイドル切断を防ぐと考えてしまう                                 |
  | ボイスを最初のフレームで固定する              | 音声が生成された後に変更すると `cannot_update_voice` で失敗する                    |
  | バックエンドのリレー、ブラウザからの直接接続なし      | ブラウザから接続すると、キーをすべての訪問者に渡してしまう                                  |
</Accordion>

## リアルタイム音声に APIYI を選ぶ理由

<CardGroup cols={2}>
  <Card title="1つのキー、4つのモデル" icon="key-round">
    同じ `wss` エンドポイント、同じ認証です。モデルの切り替えは `model` パラメータと対応するフィールドテンプレートを変更するだけで、2つ目のベンダーアカウントを管理する必要はありません。
  </Card>

  <Card title="直接アクセス、海外でのセットアップ不要" icon="globe">
    中国本土のデータセンター、自宅のブロードバンド、または海外ノードから `api.apiyi.com` にアクセスできます。上流ベンダーのアカウント、本人確認、事前入金は必要ありません。
  </Card>

  <Card title="プロトコルの違いをあらかじめ整理済み" icon="git-compare">
    フィールド比較、イベント名の比較、サンプルレートの制限、4つの実測制限をすべてここで説明しているため、自分で再調査する必要はありません。
  </Card>

  <Card title="テキストによる無料のセルフテスト" icon="terminal">
    マイクなしでハンドシェイク、認証、フィールド、ツール連携、同時実行数を検証できます。音声プランはテキストより1桁多くの費用がかかるため、これは統合時の実質的なコスト削減になります。
  </Card>

  <Card title="実測レイテンシーと同時実行数" icon="gauge">
    40の同時セッションで、ハンドシェイクのp50は約1秒、最初のテキストデルタのp50も約1秒でした。120セッション中120セッションが成功しており、テスト条件と実施日は「技術仕様」に記載しています。
  </Card>

  <Card title="エンジニアによる直接サポート" icon="handshake">
    統合に関する質問、同時実行数の増加、上流サービスの動作変更に対応するWeComの直接連絡チャネルを提供しています。
  </Card>
</CardGroup>

## コア機能

<CardGroup cols={2}>
  <Card title="双方向ストリーミング、割り込み可能" icon="radio">
    音声は生成されるそばからストリーミングされ、クライアントは`response.cancel`をいつでも送信できます。セッションは維持され、コンテキストは保持されます。4つのモデルすべてで検証済みです。
  </Card>

  <Card title="2つのターン検出モード" icon="scissors">
    `server_vad`は無音時間で分割し、`semantic_vad`は意図で分割します（「uh-huh」のようなフィラーワードを無視するのがより得意です）。どちらも4つのモデルすべてで検証済みです。
  </Card>

  <Card title="完全な関数呼び出しループ" icon="wrench">
    モデルがツールを起動し、クライアントがそれを実行し、`function_call_output`が結果を注入し、モデルは会話を続けます。4つのモデルすべてでエンドツーエンドに検証済みです。
  </Card>

  <Card title="画像入力、モダリティごとの使用量" icon="image">
    セッション中に画像を送信して、モデルに読み取らせます；`usage`は text / audio / image tokens を個別に返すため、コストを割り当てられます。4つのモデルすべてで検証済みです。
  </Card>
</CardGroup>

## 対応モデル

| モデル                           | プロトコルファミリー   | 利用可能性       | デフォルト音声 | 入力サンプルレート | プロンプトキャッシュ | 位置付け                                            |
| ----------------------------- | ------------ | ----------- | ------- | --------- | ---------- | ----------------------------------------------- |
| `gpt-realtime-2.1`            | Realtime GA  | ✅ デフォルトグループ | `marin` | 24 kHz 以上 | ✅ 対応       | フラッグシップ。多言語対応と推論性能に最も優れ、`reasoning.effort`をサポート |
| `gpt-realtime-2.1-mini`       | Realtime GA  | ✅ デフォルトグループ | `marin` | 24 kHz 以上 | ✅ 対応       | コストパフォーマンスに優れ、日常会話に十分対応                         |
| `qwen3.5-omni-plus-realtime`  | Model Studio | ✅ デフォルトグループ | `Tina`  | 16 kHz    | ⏸ 未確認      | 中国語シナリオ向けのフラッグシップ                               |
| `qwen3.5-omni-flash-realtime` | Model Studio | ✅ デフォルトグループ | `Tina`  | 16 kHz    | ⏸ 未確認      | 中国語シナリオ向けのコストパフォーマンスに優れたモデル                     |

4つのモデルすべてで、出力音声は**PCM 符号付き16ビット／モノラル／24 kHz**です。

<Warning>
  2つのプロトコルファミリーで**共有されるのはエンドポイントと認証方式のみ**です。リクエストフィールドとサーバーイベント名はどちらも異なります。モデルを切り替える場合は、フィールドテンプレートも切り替える必要があります。詳しくは以下の「プロトコル比較」を参照してください。
</Warning>

## 料金

<Info>
  **料金を一文で言うと**: token ごとの課金で、**音声はテキストの約10倍のコスト**です（`gpt-realtime-2.1` では、音声入力は \$32、テキスト入力は \$4、音声出力は \$64、テキスト出力は \$24）。統合時はテキストのみで実行し、チェーンの検証後に音声へ切り替えてください。以下の「テキストから開始」を参照してください。
</Info>

以下の表は、1M tokens あたりの USD 建ての**ベンダー公式リスト価格**です。APIYI は同一レートで token ごとに課金します（2026-09-14、UTC+8 にモダリティごとに照合）。**APIYI での実際の請求額は、[呼び出しログ](https://api.apiyi.com/log)に表示される内容に従います**。[チャージボーナス](/ja/faq/recharge-promotions)により、実効コストはさらに下がります。

### Realtime GA プロトコル

| モデル                     | テキスト入力 | テキスト出力 | キャッシュ読み取り                    | 画像入力  | 音声入力 | 音声出力 |
| ----------------------- | ------ | ------ | ---------------------------- | ----- | ---- | ---- |
| `gpt-realtime-2.1`      | \$4    | \$24   | \$0.4（APIYI では現在 \$4 で課金）    | \$5   | \$32 | \$64 |
| `gpt-realtime-2.1-mini` | \$0.6  | \$2.4  | \$0.06（APIYI では現在 \$0.6 で課金） | \$0.8 | \$10 | \$20 |

### Model Studio プロトコル

課金ディメンションが異なります。画像入力はテキスト階層に含まれ、出力は「テキストのみ」と「テキスト + 音声」に分かれます（後者のレートで課金されるのは音声部分のみです）。

| モデル                           | テキスト / 画像入力 | 音声入力   | テキスト出力 | テキスト + 音声出力 |
| ----------------------------- | ----------- | ------ | ------ | ----------- |
| `qwen3.5-omni-plus-realtime`  | \$1.38      | \$11   | \$8.25 | \$41.26     |
| `qwen3.5-omni-flash-realtime` | \$0.45      | \$3.71 | \$2.75 | \$14.71     |

<Note>
  **課金に関する注記**: テキスト、音声、画像の tokens は、上記リスト価格に基づき token ごとに課金されます。中断されたターン（`response.cancel`）は実際に生成された分のみが課金され、空のセッションは課金されません。**キャッシュ済み入力はまだ割引されません**: キャッシュヒットは `usage.cached_tokens` に正確に報告されますが、APIYI では現在、対応するテキスト入力レートで課金しています。課金経路が修正され次第、公式キャッシュレートが自動的に適用され、[変更履歴](/en/changelog)でお知らせします。料金はベンダーのポリシーおよび供給状況により変更される場合があります。この機能は、**供給を確保し顧客にサービスを提供する**ために提供しており、利益目的の掲載ではありません。
</Note>

## アクセスグループ

| グループ       | モデル   | 備考                                                           |
| ---------- | ----- | ------------------------------------------------------------ |
| **デフォルト**  | 4つすべて | キーでデフォルトグループを選択してください — リクエストは不要です。グループ倍率は1で、ベンダーのリストと同じ価格です |
| VIP / SVIP | 4つすべて | 利用可能です。料金は、キーが所属するグループの倍率に従います                               |

<Note>
  4つのモデルは、1つのエンドポイントと1つのキーを共有します。[キー管理](/ja/api-capabilities/token-management)の下でチェックボックスを変更してグループを切り替えられます。コードの変更は不要です。
</Note>

## 技術仕様

| 項目               | 値                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **トランスポート**      | WebSocket（`wss://`）、1つの接続上での双方向ストリーミング                                                                                                                  |
| **認証**           | `Authorization: Bearer <key>` ヘッダー                                                                                                                      |
| **イベント形式**       | OpenAI Realtime イベントモデル（クライアントイベント／サーバーイベント）と互換                                                                                                         |
| **入力音声**         | PCM 符号付き 16ビット、モノラル、Base64。**Model Studio は 16 kHz、Realtime GA は 24 kHz 以上**                                                                            |
| **出力音声**         | PCM 符号付き 16ビット、モノラル、24 kHz                                                                                                                              |
| **出力モダリティ**      | テキスト／音声（テキストのみも利用可能）                                                                                                                                    |
| **ターン検出**        | `server_vad`、`semantic_vad`、または手動 `commit` 用に無効化                                                                                                        |
| **ファンクションコーリング** | `function_call_output` の結果注入を含め、サポート                                                                                                                    |
| **画像入力**         | サポート（構文はファミリーごとに異なります。以下を参照してください）                                                                                                                      |
| **セッション有効期間**    | Realtime GA：セッションは `expires_at` を保持します。2回のテストパスでは、接続時点からおよそ30分および60分が測定されたため、`session.created` のエコーを正式な値として扱ってください。Model Studio：アイドル状態での切断は300秒で測定されました |

### 測定済みのレイテンシーと同時実行数

2026-09-14（UTC+8）に、公開 `api.apiyi.com` パス上で、`gpt-realtime-2.1` と `-mini` をそれぞれ20および40同時セッションで測定しました。1ターンのテキストのみのやり取りです。

| 指標                | 測定値（40セッション × 2モデル）                        |
| ----------------- | ------------------------------------------ |
| WebSocket ハンドシェイク | p50 0.96～1.03秒、最大1.40秒                     |
| 最初のテキスト差分         | p50 0.99～1.08秒、最大1.67秒                     |
| 1ターン全体            | p50 1.30～1.44秒、最大2.11秒                     |
| セッション成功率          | 100%（20および40セッションのティアで合計120セッション、429s はゼロ） |
| アイドルキープアライブ       | 5分間無音の後も会話可能。ping/pong は約200ミリ秒            |

<Warning>
  これらは特定の同時実行数における特定時点の測定値であり、パフォーマンスを保証するものではありません。**可用性 SLA は提供されません** — クライアント側で再接続と適切な縮退処理を実装してください。
</Warning>

## エンドポイント

| エンドポイント                                              | 目的               | 認証                            |
| ---------------------------------------------------- | ---------------- | ----------------------------- |
| `wss://api.apiyi.com/v1/realtime?model=<model-name>` | リアルタイム音声セッションを開く | `Authorization: Bearer <key>` |

4つのモデルはすべてこのエンドポイントを共有します; `model` クエリパラメータで接続先のモデルを選択します。

<Warning>
  **ブラウザから接続する場合**: このエンドポイントは `Sec-WebSocket-Protocol` サブプロトコル（`realtime, openai-insecure-api-key.<key>, openai-beta.realtime-v1`）による認証も受け付けるため、ブラウザ`WebSocket`は直接接続できます — ただし、それでは **キーをブラウザに渡してしまい**、訪問者なら誰でもネットワークパネルから確認できてしまいます。**ローカルでの検証にのみ使用してください。** 本番環境では、バックエンドのリレーを作成します。バックエンドがキーを保持して APIYI への接続を開き、フロントエンドは自分のサービスとのみ通信します。
</Warning>

## ⚠️ プロトコル比較（モデルを切り替える前にお読みください）

この2つのファミリーは、endpoint、auth scheme、そして全体のイベントフローを共有しています。違いは `session.update` フィールド構造と、いくつかのサーバーイベント名に集中しています。

### リクエストフィールドの比較

| 目的       | Model Studioプロトコル                  | Realtime GAプロトコル                                         |
| -------- | ---------------------------------- | -------------------------------------------------------- |
| 出力モダリティ  | `modalities: ["text","audio"]`     | `output_modalities: ["audio"]`                           |
| 音声       | `voice`（トップレベル）                    | `audio.output.voice`                                     |
| 速度       | 非対応                                | `audio.output.speed`（0.7 / 1.0 / 1.5 は線形として計測）           |
| 入力音声形式   | `input_audio_format: "pcm"`、16 kHz | `audio.input.format: {"type":"audio/pcm","rate":24000}`  |
| 出力音声形式   | `output_audio_format: "pcm"`       | `audio.output.format: {"type":"audio/pcm","rate":24000}` |
| ターン検出    | `turn_detection`（トップレベル）           | `audio.input.turn_detection`                             |
| 入力の文字起こし | `input_audio_transcription`        | `audio.input.transcription`                              |

### サーバーイベントの比較

| 内容         | Model Studioプロトコル                 | Realtime GAプロトコル                         |
| ---------- | --------------------------------- | ---------------------------------------- |
| テキストの差分    | `response.text.delta`             | `response.output_text.delta`             |
| 音声の差分      | `response.audio.delta`            | `response.output_audio.delta`            |
| 音声文字起こしの差分 | `response.audio_transcript.delta` | `response.output_audio_transcript.delta` |

その他のすべてのイベント — `session.created`, `session.updated`, `conversation.item.create`, `input_audio_buffer.append`, `input_audio_buffer.commit`, `response.create`, `response.cancel`, `response.done` — は、両方で同一の名前です。

### session.update ペイロードの最小例を2つ

同じ内容を2回書いたものです。そのままコピーしてください。**Model Studioプロトコル**:

```json theme={null}
{
  "type": "session.update",
  "session": {
    "modalities": ["text", "audio"],
    "voice": "Ethan",
    "input_audio_format": "pcm",
    "output_audio_format": "pcm",
    "input_audio_transcription": { "model": "qwen3-asr-flash-realtime" },
    "turn_detection": { "type": "semantic_vad" }
  }
}
```

**Realtime GAプロトコル**:

```json theme={null}
{
  "type": "session.update",
  "session": {
    "type": "realtime",
    "output_modalities": ["audio"],
    "audio": {
      "input": {
        "format": { "type": "audio/pcm", "rate": 24000 },
        "transcription": { "model": "whisper-1" },
        "turn_detection": { "type": "semantic_vad" }
      },
      "output": {
        "format": { "type": "audio/pcm", "rate": 24000 },
        "voice": "alloy",
        "speed": 1.0
      }
    }
  }
}
```

<Warning>
  **サンプルレートは厳格な制約です**: Realtime GAプロトコルでは `audio.input.format.rate` は **≥ 24000** である必要があります。16000 を送ると、`integer_below_min_value: Expected a value >= 24000` で即座に失敗します。Model Studioプロトコルでは 16 kHz 入力が必要です。クライアント側で再サンプリングしてください。
</Warning>

## テキストから始める: テキストチャネルの役割と3段階のセルフテスト

オーディオパイプラインには、マイクの取り込み、リサンプリング、チャンク分割、ターン検出が含まれます。どこか1か所でも壊れると、「何も起きない」として現れ、原因特定が難しくなります。ですので、**マイクから始めないでください**。

### テキストは制御プレーンであり、フォールバック入力ではありません

リアルタイム音声モデルにおいて、テキストは「入力を送る別の方法」ではなく、**音声ストリーム以外の、制御チャネルのすべて**です。

| 組み合わせ         | 一般的な用途                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------ |
| テキスト → 制御プレーン | `instructions`のシステムプロンプト、`function_call_output`のツール結果、取得したコンテキスト — すべてテキストで、マイク経由では到達できません |
| テキスト → 音声     | 実質的には**会話コンテキストをすべて備えたTTS**です。通常のモデルにまず考えさせ、その後リアルタイムモデルにそれを話させます。アナウンスやプロンプトに適しています       |
| テキスト → テキスト   | **最も安価なデバッグチャネルです。** プレーンテキストのチャットは通常のチャットモデルのほうが適していますが、ここでの価値は、コストをかけずに経路を検証できることです      |

### 3段階のセルフテスト

<Steps>
  <Step title="ステップ1: テキストのみ、マイクなし">
    `output_modalities`をテキストのみに設定し、ターン検出を無効化して、`input_text`を1回送信します。これだけで、ハンドシェイク、キーとグループ、**正しいフィールドテンプレートを選んだかどうか**、`session.update`が反映されたかどうか、ツールが正しく注入されるかどうか、複数ターンのコンテキストが保持されるかどうか、そして同時実行数の挙動を確認できます。**音声tokenはまったく生成されません。**
  </Step>

  <Step title="ステップ2: ローカルのwavファイルを再生する">
    マイクの代わりに固定のローカル音声ファイルを使い、100 msのチャンクで`input_audio_buffer.append`に流し込みます。これにより、**オーディオパイプライン**（フォーマット、サンプルレート、チャンク分割、`commit`、VADトリガー）を業務ロジックから切り離せて、再現可能になります — 同じファイルなら2回とも同じ結果になるはずです。
  </Step>

  <Step title="ステップ3: ライブマイクを接続する">
    最初の2段階を通過したら、残るのは取り込みと再生だけです。ここで何か壊れていても、探索範囲はすでに狭くなっています。
  </Step>
</Steps>

<Tip>
  **テスト用音声が手元にありませんか？** macOSでは、標準搭載ツールで要件を満たすファイルを1行で生成できます:

  ```bash theme={null}
  say -v Samantha -o /tmp/ask.aiff "What is the weather in Beijing today? Answer in one sentence."

  # Realtime GA protocol uses 24000
  afconvert -f WAVE -d LEI16@24000 -c 1 /tmp/ask.aiff ask_24k.wav
  # Model Studio protocol uses 16000
  afconvert -f WAVE -d LEI16@16000 -c 1 /tmp/ask.aiff ask_16k.wav
  ```

  ステップ2で最もよくある失敗は、サンプルレートの選択ミスです — 2つのプロトコルは異なるため、混同しないでください。
</Tip>

### 実行可能なテキストのスモークテスト

`websockets`（`pip install websockets`）だけに依存します。1つの変数を切り替えるだけでプロトコルを変更できます:

```python theme={null}
import asyncio, json, os, websockets

FAMILY = "ga"           # ga = gpt-realtime-2.1 series; omni = qwen3.5-omni series
MODEL = "gpt-realtime-2.1" if FAMILY == "ga" else "qwen3.5-omni-plus-realtime"
URL = f"wss://api.apiyi.com/v1/realtime?model={MODEL}"
HEADERS = {"Authorization": "Bearer " + os.environ["APIYI_API_KEY"]}

# The two protocols diverge only here: session structure and the text-delta event name.
SESSION = ({"type": "realtime", "output_modalities": ["text"],
            "audio": {"input": {"turn_detection": None}}}
           if FAMILY == "ga" else
           {"modalities": ["text"], "turn_detection": None})
TEXT_DELTA = "response.output_text.delta" if FAMILY == "ga" else "response.text.delta"

async def main():
    async with websockets.connect(URL, additional_headers=HEADERS) as ws:
        while json.loads(await ws.recv())["type"] != "session.created":
            pass
        await ws.send(json.dumps({"type": "session.update", "session": SESSION}))
        await ws.send(json.dumps({"type": "conversation.item.create", "item": {
            "type": "message", "role": "user",
            "content": [{"type": "input_text", "text": "Explain WebSocket in one sentence."}]}}))
        await ws.send(json.dumps({"type": "response.create"}))
        while True:
            e = json.loads(await ws.recv())
            if e["type"] == TEXT_DELTA:
                print(e["delta"], end="", flush=True)
            elif e["type"] == "response.done":
                print("\n\nusage =", json.dumps(e["response"]["usage"]))
                return
            elif e["type"] == "error":
                print("\nERROR:", json.dumps(e))
                return

asyncio.run(main())
```

これが動作すれば、エンドポイント、キー、グループ、フィールドテンプレートはすべて正しいので、ステップ2へ進んでください。

## セッション機能: ボイス、ターン検出、tools、画像

### ボイス

| 項目     | Model Studio プロトコル              | Realtime GA プロトコル                                               |
| ------ | ------------------------------- | --------------------------------------------------------------- |
| 既定のボイス | `Tina`                          | `marin`                                                         |
| 動作確認済み | `Tina`、`Ethan`、その他              | `alloy`、`marin`、`cedar`、`shimmer`、`verse`                       |
| 速度制御   | 対応していません                        | `audio.output.speed`; duration は 0.7 / 1.0 / 1.5 で線形にスケーリングされます |
| 無効なボイス | `Voice 'xxx' is not supported.` | `invalid_value`                                                 |

<Warning>
  **最初の`session.update`でボイスを固定してください。** セッションが一度音声出力を生成した後は、ボイスの変更は `cannot_update_voice` で失敗します。これは両方のプロトコルに適用されます。ボイスを切り替えるには新しいセッションを開いてください。また、Model Studio プロトコルでは **ボイスとして空文字列を送信しないでください**。サポートされていないボイスにフォールバックし、400 を返します。設定が不要な場合は、そのフィールドを単に省略してください。
</Warning>

### ターン検出: server\_vad と semantic\_vad

* `server_vad` — 無音の継続時間で分割し、パラメータはシンプルです（`threshold`、`silence_duration_ms`、`prefix_padding_ms`）。
* `semantic_vad` — 会話の意図で分割し、フィラー語や意味のない背景ノイズを無視します。複数話者環境でより堅牢です。
* ターン検出（`null` または `none`）を無効化して、**手動モード**で実行することもできます。`input_audio_buffer.commit` を自分で送信し、その後 `response.create` を送ります。これは、UI がターンを制御するプッシュトゥトークのインターフェースに適しています。

<Tip>
  VAD モードでは **ストリーミングを継続する必要があります**。発話が終わったら、サーバーが発話終了を検出できるように、短い無音区間を送り続けてください（テストでは 2 秒あれば十分です）。音声区間だけを送って停止すると、`speech_stopped` は一度も発火せず、応答は生成されません。
</Tip>

### 関数呼び出し

イベント順序: モデルは `response.output_item.done` を `function_call` 型で出力し（`call_id` と `arguments` を含む）→ クライアントがそれを実行 → 結果が注入される → 別の `response.create` によりモデルが続行します。

```json theme={null}
{
  "type": "conversation.item.create",
  "item": {
    "type": "function_call_output",
    "call_id": "call_xxx",
    "output": "{\"city\":\"Beijing\",\"weather\":\"light rain\",\"temp_c\":21}"
  }
}
```

完全なループは 4 つのモデルすべてで検証済みです。注入後、モデルはツールが返した内容を正しく復唱します。

### 画像入力

**Realtime GA プロトコル**: `input_image` をメッセージに直接入れてください。値にはデータ URI を指定できます。

```json theme={null}
{
  "type": "conversation.item.create",
  "item": {
    "type": "message",
    "role": "user",
    "content": [
      { "type": "input_image", "image_url": "data:image/jpeg;base64,..." },
      { "type": "input_text", "text": "What does the image say?" }
    ]
  }
}
```

**Model Studio プロトコル**: 画像は **動画フレーム** として扱われるため、先に音声を追加する必要があります。そうしないと `Error append image before append audio.` になります。テストでは、`input_image_buffer.append` を `input_audio_buffer.append` ストリームに 1 秒あたり約 1 フレームの割合で交互に挿入する方法が機能しました。

## 既知の制限事項

以下の各項目は測定済みであり、すべてクライアントコードに影響します。統合する前にお読みください。

| 動作                                                                                       | 影響を受けるファミリー           | クライアント側の回避策                                                                                                                    |
| ---------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `response.done` は `response.cancel` の後に配信されないため、ターンが完了しない                                | モデルスタジオ（全6回のテスト実行で再現） | ターン終了シグナルとして `response.output_item.done` を使用し、5秒のタイムアウトを追加してください。セッション自体は影響を受けず、中断後も会話は通常どおり継続します                              |
| アイドル接続は300秒で切断される。WebSocket の ping/pong は**アクティビティとしてカウントされません**                         | モデルスタジオ               | アイドル中は定期的にアプリケーションレベルのイベントを送信するか、切断を受け入れて自動的に再接続してください。再接続後に `session.update` を再送してください                                        |
| セッションが音声を生成した後は音声を変更できず、`cannot_update_voice` で失敗する                                      | 両方のファミリー              | 最初の `session.update` で `voice` を固定してください。切り替えるには新しいセッションを開始してください                                                              |
| 手動 `commit` モードでは、入力文字起こしの完了イベントが配信されない                                                  | モデルスタジオの `flash` モデル  | 文字起こしが正常に機能する `server_vad` / `semantic_vad` に切り替えてください。会話自体は影響を受けません。モデルは音声を正しく理解し、応答します                                       |
| `POST /v1/realtime/client_secrets`（エフェメラルキー）および `POST /v1/realtime/calls`（WebRTC）は404を返す | すべて                   | APIYI では直接 WebSocket のみサポートされています。WebRTC、SIP、エフェメラル token は利用できません。ブラウザおよびモバイルクライアントでは、キーを保持して WebSocket を開くバックエンドリレーを実行してください |
| カスタム音声オブジェクト（`audio.output.voice: {id: …}`）はアップストリームの500を返す                              | Realtime GA           | 組み込み音声名のみを使用してください（`marin` / `cedar` / `alloy` など、文字列として指定）                                                                    |

<Warning>
  これらの動作はアップストリームの変更に伴って変わる可能性があります。このページは最新の状態に保たれます。ここに記載されていない問題が発生した場合は、追跡できるようタイムスタンプと `session.id` を添えて、[WeCom サポート](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec) または [feedback@apiyi.com](mailto:feedback@apiyi.com) からご報告ください。
</Warning>

## ベストプラクティス

<Steps>
  <Step title="まずプロトコルファミリーごとにフィールドテンプレートを選ぶ">
    2つの `session.update` ペイロードは、if 分岐を散らすのではなく、モデル名で選択する2つの設定定数として記述してください。これは、6か月後の保守時に最も壊れやすい部分です。
  </Step>

  <Step title="最初のフレームでセッションパラメータを固定する">
    `output_modalities`、`voice`、`speed`、`turn_detection`、`transcription` を、最初の `session.update` で必ず設定してください。音声は特に重要です。いったんオーディオが生成されたら手遅れです。
  </Step>

  <Step title="オーディオを追加する前にテキストのスモークテストを通す">
    このページでテキストのスモークテストを実行し、エンドポイント、キー、グループ、フィールドテンプレートがすべて正しいことを確認してから、オーディオに進んでください。オーディオのティアはテキストより桁違いに高額なので、これで統合予算の大半を節約できます。
  </Step>

  <Step title="サンプルレートとチャネルはクライアント側で変換する">
    PCM 符号付き 16 ビット、モノラル。Model Studio では 16 kHz、Realtime GA では 24 kHz 以上です。サーバー側での補正は期待しないでください。フォーマットが間違っていると、明示的なエラーではなく無音として現れることがほとんどです。
  </Step>

  <Step title="タイムアウト付きで output_item.done で完了処理する">
    `response.done` だけを待たないでください。この方法は両方のファミリーで正しく、ユーザーが中断したときにターンがハングするのを防げます。
  </Step>

  <Step title="長いセッションには keepalive と再接続を追加する">
    Model Studio の 300 秒のアイドル制限と、Realtime GA の `expires_at` に注意してください。**再接続後は、`session.update` と必要なコンテキストを再送してください**。そうしないと、新しいセッションはデフォルト設定で動作します。
  </Step>

  <Step title="本番環境ではバックエンドリレーを使う">
    キーはバックエンドに保持し、フロントエンドは自分のサービスにのみ通信させてください。ブラウザからの直接接続は技術的には動作しますが、キーが露出します。
  </Step>
</Steps>

## エラーとリトライ

| 症状                                        | 意味                                                       | 対処方法                                                     |
| ----------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| ハンドシェイクが401を返す                            | 無効なキー、または`Authorization`ヘッダーが送信されていません                   | キー自体、誤って`https://`を使用していないか、ヘッダーが存在するかを確認してください          |
| 使用可能なチャネルがない状態でハンドシェイクが503を返す             | キーのグループにモデルが含まれていない（4つすべてがデフォルトグループにあります）か、モデル名が正しくありません | キーのグループと`model`パラメータを確認してください                            |
| ハンドシェイクが400を返す                            | `model`クエリパラメータがありません                                    | エンドポイントには`?model=<model-name>`を含める必要があります                |
| 未知のフィールドで`invalid_request_error`          | **プロトコルファミリーが正しくありません**                                  | 上記の比較表を使用し、そのモデルのフィールドテンプレートに切り替えてください                   |
| `integer_below_min_value`                 | Realtime GAで入力サンプルレートが24000未満です                          | クライアント側で24 kHz以上にリサンプリングしてください                           |
| `cannot_update_voice`                     | セッションで音声が生成された後に音声が変更されました                               | 最初のフレームで音声を固定してください。切り替えるには新しいセッションを開始してください             |
| `Error append image before append audio.` | Model Studioで音声が追加される前に画像が追加されました                        | まず`input_audio_buffer.append`で音声を追加し、その後に画像フレームを追加してください |
| WebSocket 1006 / 1011                     | ネットワークが不安定であるか、上流との接続が切断されました                            | 指数バックオフ（1秒 / 4秒 / 16秒）で再接続し、`session.update`を再生してください    |
| 無音状態が約5分続いた後に接続が切断される                     | Model Studioのアイドル制限です                                    | 「既知の制限事項」のキープアライブの方法を参照してください                            |

<Info>
  トラブルシューティングのヒント：各イベントの`event_id`とセッションの`session.id`を記録し、問題を報告する際に含めてください。診断時間を大幅に短縮できます。また、**Realtime GAのエラーオブジェクトには`code`と`param`が含まれます**（正確なフィールドと、そのフィールドで受け付けられる値が示されます）。一方、Model Studioのエラーメッセージはより大まかな内容です。デバッグ時は、まず前者でフィールド構文を検証してください。
</Info>

## よくある質問

<AccordionGroup>
  <Accordion title="このページにインタラクティブなプレイグラウンドがないのはなぜですか？">
    インタラクティブなプレイグラウンドは、HTTP 経由の単一のリクエストと単一のレスポンスを記述する OpenAPI 仕様によって動作します。Realtime は、1 つの長時間接続上で数十種類のイベントが双方向に流れるため、このモデルには当てはまりません。代わりに、「テキストから開始」セクションのテキストスモークテストを使用できます。数十行程度で、マイクも不要であり、チェーンが機能することを確認できます。
  </Accordion>

  <Accordion title="モデル名だけを変更して、4 つのモデルを切り替えられますか？">
    **いいえ。** エンドポイントと認証は同じですが、リクエストフィールドとイベント名は 2 つのプロトコルに属します。最低限、次を変更する必要があります：`modalities` ↔ `output_modalities`、`voice` ↔ `audio.output.voice`、`input_audio_format` ↔ `audio.input.format`、`turn_detection` ↔ `audio.input.turn_detection`、`input_audio_transcription` ↔ `audio.input.transcription`、さらにイベント名の `response.text.delta` ↔ `response.output_text.delta` と `response.audio.delta` ↔ `response.output_audio.delta` です。完全な対応関係については、プロトコル比較セクションを参照してください。
  </Accordion>

  <Accordion title="ハンドシェイクが完全に失敗します。どのようにデバッグすればよいですか？">
    次の 5 点を順番に確認してください：1. スキームが `wss://` であり、`https://` ではないこと。2. エンドポイントに `?model=<model-name>` が含まれていること。3. `Authorization: Bearer <key>` ヘッダーが存在すること。4. キーのグループにモデルが含まれていること（4 つすべてデフォルトグループに含まれます。不一致の場合は「利用可能なチャネルがありません」というメッセージとともに 503 が返されます）。5. 中間のリバースプロキシが `Upgrade` ヘッダーを削除していないこと。これは独自のゲートウェイ経由でリレーする場合によくある問題です。
  </Accordion>

  <Accordion title="ブラウザから接続できますか？キーが漏洩することはありませんか？">
    技術的には可能です。エンドポイントは `Sec-WebSocket-Protocol` サブプロトコル経由の認証を受け付けるため、ブラウザ `WebSocket` から直接接続できます。ただし、**キーをブラウザに渡すことになります**。その場合、すべての訪問者がネットワークパネルからキーを読み取れるため、**ローカルでの検証にのみ適しています**。本番環境ではバックエンドリレーを作成してください。バックエンドがキーを保持して APIYI への接続を開き、フロントエンドは独自のサービスとのみ通信する構成にします。
  </Accordion>

  <Accordion title="gpt-realtime-2.1 に 16 kHz の音声を送信すると失敗します。なぜですか？">
    Realtime GA プロトコルでは、入力サンプルレートに **少なくとも 24000** が必要です。16000 の場合は `integer_below_min_value` が返されます。正しい形式は `"audio": {"input": {"format": {"type": "audio/pcm", "rate": 24000}}}` です。2 つの Model Studio モデルでは 16 kHz が必要であり、この 2 つは互換性がありません。
  </Accordion>

  <Accordion title="マイクがない、または音声のテストが難しい場合はどうすればよいですか？">
    「テキストから開始」セクションの 3 段階のセルフテストに従ってください。まずテキストでチェーンを検証し（音声 token は生成されません）、次にローカルの wav ファイルを再生して音声パイプラインを検証し、その後でライブマイクに接続します。テスト音声は macOS の組み込み機能 `say` と `afconvert` を使って 1 行で生成できます。コマンドはそのセクションに記載されています。
  </Accordion>

  <Accordion title="response.cancel を送信した後、response.done をまったく受信しません。">
    これは 2 つの Model Studio モデルで確認されている既知の動作です（6 回のテストすべてで再現）。割り込み後は `response.text.done`、`response.content_part.done`、`response.output_item.done` を受信しますが、`response.done` は配信されません。**ターン終了シグナルとして `response.output_item.done` を使用し、バックストップとしてタイムアウトを追加してください。** セッション自体には影響がなく、会話は通常どおり続行されます。2 つの Realtime GA モデルでは、この動作は正常です。
  </Accordion>

  <Accordion title="接続が約 5 分後に切断されます。">
    Model Studio プロトコルでは、**300 秒間アクティビティがないと**接続が切断され、**WebSocket レベルの ping/pong はアクティビティとしてカウントされません**。そのため、ハートビートではタイマーを延長できません。アイドル中にアプリケーションレベルのイベント（たとえば `session.update`）を定期的に送信するか、切断を受け入れて自動的に再接続してください。再接続後は、`session.update` と必要なコンテキストを再送することを忘れないでください。
  </Accordion>

  <Accordion title="1 つのセッションをどのくらい長く開いたままにできますか？">
    Realtime GA プロトコルでは、`session.created` イベントに `expires_at` が含まれます。接続からおよそ 30 分後にこの値に達し、その後は再接続が必要です。Model Studio プロトコルで主に確認された制約は、300 秒間のアイドル切断です。長い会話はセッションが期限切れになる前提で設計し、セッション間でコンテキストを引き継ぐ方法を計画してください。
  </Accordion>

  <Accordion title="音声をどのように設定すればよいですか？また、変更すると cannot_update_voice が返されるのはなぜですか？">
    音声は `session.update` で設定します。Model Studio ではトップレベルの `voice`、Realtime GA では `audio.output.voice` です。**セッションで音声出力が生成された後は、音声を変更できません**。これは両方のプロトコルに適用され、`cannot_update_voice` が返されます。最初のフレームで音声を固定し、切り替える場合は新しいセッションを開始してください。また、Model Studio では音声に空文字列を送信しないでください。400 が返されます。
  </Accordion>

  <Accordion title="手動コミットモードで入力文字起こしが取得できません。">
    Model Studio の `flash` モデルは、手動 `commit` モードで文字起こし完了イベントを配信しません（複数回の実行で一貫して再現）。`plus` モデルでは配信され、どちらのモデルも VAD モードでは動作します。**`server_vad` または `semantic_vad` に切り替えてください。** テストでは、この場合、文字起こしテキストが delta イベントの未文書化フィールドに格納されることが確認されています。ただし、そのフィールドはいつでも変更される可能性があり、**依存すべきではありません**。これは UI にユーザーの発話内容を表示する場合にのみ影響します。会話には影響せず、モデルは音声を正しく理解して回答します。
  </Accordion>

  <Accordion title="画像入力はサポートされていますか？Error append image before append audio. が表示されるのはなぜですか？">
    4 つのモデルはすべて画像入力をサポートしていますが、構文が異なります。Realtime GA では、`input_image` をメッセージ内に直接配置します。Model Studio では画像を**ビデオフレーム**として扱うため、画像より前に音声を追加する必要があり、それがこのエラーの原因です。テストで動作した方法は、音声ストリームに画像フレームを 1 秒あたりおよそ 1 フレームの割合でインターリーブすることです。
  </Accordion>

  <Accordion title="プロンプトキャッシュはありますか？キャッシュヒットをどのように確認できますか？">
    2 つの Realtime GA モデルがサポートしており、自動的に適用されます。テストでは、セッション内の 2 回目のターンですでにヒットし、`usage.input_token_details.cached_tokens` に値が入りました（少なくとも 1024 token のプレフィックス、128 token 単位）。**現在、APIYI はキャッシュされた token をテキスト入力の通常料金で課金していることに注意してください**。割引が提供開始され次第、変更履歴で告知されます。2 つの Model Studio モデルではキャッシュヒットは確認されませんでした。
  </Accordion>

  <Accordion title="WebRTC、SIP、またはエフェメラルキー（client_secrets）はサポートされていますか？">
    **いいえ。** `POST /v1/realtime/client_secrets` と `POST /v1/realtime/calls` はどちらも APIYI で 404 を返し、SIP も利用できません。単一の `wss://api.apiyi.com/v1/realtime` WebSocket エンドポイントのみがエントリーポイントです。ブラウザまたはモバイルクライアントでは、バックエンドリレーを作成してください。バックエンドがキーを保持して WebSocket を開き、フロントエンドは独自のサービスとのみ通信する構成にします。
  </Accordion>

  <Accordion title="reasoning.effort や noise_reduction などの GA セッションフィールドは、gpt-realtime-2.1 で機能しますか？">
    はい。テストではすべてのフィールドが変更されずに通過し、`session.updated` にエコーバックされました：`reasoning.effort`（`minimal` / `low` / `medium` / `high` / `xhigh`、両方のモデルで受け付けられます）、`audio.input.noise_reduction`、`audio.input.turn_detection.idle_timeout_ms`、`audio.input.transcription.model`（`gpt-realtime-whisper` を含む）、`truncation`、`tracing`、`max_output_tokens`、`parallel_tool_calls` です。フィールドのセマンティクスは OpenAI のリファレンスに従い、ゲートウェイによる書き換えはありません。
  </Accordion>

  <Accordion title="コストをどのように見積もればよいですか？テキストと音声は別々に課金されますか？">
    `response.done` 上の `usage` オブジェクトは、モダリティごとの token（テキスト / 音声 / 画像を入力と出力で個別に集計）を報告するため、コストを割り当てられます。通話ログの詳細ビューにも、完了した `response.done` ごとに 1 レコードとして、同じモダリティ別の `usage` が表示されます。音声の料金階層はテキストより大幅に高いため、統合時にはテキストのみの利用を推奨します。**実際の請求額については、[通話ログ](https://api.apiyi.com/log)を参照してください。**
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="APIマニュアル" icon="book-open" href="/ja/api-manual">
    キーの作成、ベースURL、課金モード、その他の一般的な規則。
  </Card>

  <Card title="キーとグループ" icon="key-round" href="/ja/api-capabilities/token-management">
    キーを作成し、グループを選択してクォータを設定します。
  </Card>

  <Card title="テキスト生成" icon="file-text" href="/ja/api-capabilities/text-generation">
    通常のチャットモデル — テキストのみの会話により適しています。
  </Card>

  <Card title="モデルの料金" icon="table" href="/en/models">
    プラットフォーム上のすべてのモデルについて、最新の料金、エンドポイント、グループを確認できます。
  </Card>

  <Card title="チャージボーナス" icon="percent" href="/ja/faq/recharge-promotions">
    実質的なコストをさらに削減します。
  </Card>

  <Card title="WeComサポート" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    統合に関する質問、同時実行数の増加、ドキュメントの不足に対応します。
  </Card>
</CardGroup>

<Info>
  4つすべてのリアルタイムモデルがデフォルトグループで利用可能です。このページの測定結果は、2026-08-24の初回テストおよび2026-09-14の再テスト（UTC+8）に基づいており、上流の変更に応じて更新されます。統合を予定している場合、このページで扱っていない問題が発生した場合、またはより高い同時実行数が必要な場合は、[hi@apiyi.com](mailto:hi@apiyi.com) / [feedback@apiyi.com](mailto:feedback@apiyi.com) までご連絡ください。
</Info>
