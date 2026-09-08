> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Realtime Voice (WebSocket)

> 4つのリアルタイム音声モデル、1つのwssエンドポイント、1つのAPIYIキー: 双方向ストリーミング音声、バージイン、2つのターン検出モード、関数呼び出しと画像入力。プライベートベータ — 2つのプロトコルの全フィールドを項目ごとに比較した表と、無料のテキストのみ自己テスト経路を含みます。

## 概要

Realtime モデルは **長時間維持される WebSocket 接続** 上で動作します。音声が入り、音声が出力され、モデルは文の途中で中断できます。つまり、「録音、アップロード、待機、再生」というサイクルはありません。ASR + テキストモデル + TTS をつなぎ合わせる方式との違いは、こちらはエンドツーエンドである点です。モデルはトーン、間、感情を直接聞き取り、直接話します。レイテンシは 1 秒未満の範囲に収まります。

APIYI は現在、**2つのプロトコルにまたがる 4つのモデル** を提供しており、1つのエンドポイントと1つのキーを共有しています。

* `gpt-realtime-2.1` / `gpt-realtime-2.1-mini` — OpenAI リアルタイム GA プロトコル
* `qwen3.5-omni-plus-realtime` / `qwen3.5-omni-flash-realtime` — Alibaba Cloud Model Studio プロトコル

<Warning>
  **状態: プライベートベータ / 統合作業中。** Realtime 音声は供給数が限られており、**まだセルフサービスでは利用できません** — 有効化にはご連絡が必要です。上流のプロトコルと挙動は、ベータ期間中に変更される可能性があります。以下の「既知の制限事項」セクションの内容はすべて実測済みで、上流の変更に合わせて更新されます。フォールバック経路なしで本番環境にリリースしないでください。統合作業を予定している場合、またはより高い同時実行数が必要な場合は、[WeComサポート](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec) か [hi@apiyi.com](mailto:hi@apiyi.com) / [feedback@apiyi.com](mailto:feedback@apiyi.com) までご連絡ください。
</Warning>

<Note>
  **🎤 ハイライト**: 1つの接続で双方向ストリーミング音声、**いつでも barge-in 可能**、`server_vad` と `semantic_vad` のターン検出、完全な function-calling の往復（結果注入を含む）、画像入力、そしてモダリティごとに分かれた `usage`。上記は4モデルすべてで検証済み（2026-08-24, UTC+8）。
</Note>

<Info>
  **まず覚えておくべきこと**: 4つのモデルは **2種類の異なるリクエストプロトコル** を使用しており、フィールド名もイベント名も異なります。**リクエストボディを変更せずに `model` パラメータだけを変えても動作しません** — これは圧倒的に最も多い統合作業の失敗です。違いは合計 6 フィールドと 3 つのイベント名で、すべて下の「プロトコル比較」に記載しています。
</Info>

<CardGroup cols={2}>
  <Card title="ベータアクセスをリクエスト" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    アカウント情報と想定同時実行数を添えて WeComサポートにご連絡いただければ、キーにベータグループを有効化します。
  </Card>

  <Card title="API マニュアル" icon="book-open" href="/ja/api-manual">
    キー作成、base URL、課金モード、その他の一般的な規約。
  </Card>

  <Card title="キーとグループ" icon="key-round" href="/ja/api-capabilities/token-management">
    キーを作成し、グループを選択し、クォータを設定します。
  </Card>

  <Card title="呼び出しログ" icon="receipt-text" href="https://api.apiyi.com/log">
    コンソールで token 使用量と呼び出しごとの実際の課金額を確認します。
  </Card>
</CardGroup>

このページは長文です。必読のセクションは3つあります。**プロトコル比較**（モデルを切り替える前に読む）、**テキストから始める**（マイクなしで全体の流れを確認する）、および**既知の制限事項**（クライアントコードに影響する4つの実測差分）です。

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

## Realtime Voice に APIYI を使う理由

<CardGroup cols={2}>
  <Card title="1つのキー、4つのモデル" icon="key-round">
    同じ `wss` エンドポイント、同じ認証。モデルを切り替えるときは、`model` パラメータと対応するフィールドテンプレートを変更するだけです。2つ目のベンダーアカウントを管理する必要はありません。
  </Card>

  <Card title="海外設定不要の直接アクセス" icon="globe">
    中国本土のデータセンター、家庭用ブロードバンド、または海外ノードから `api.apiyi.com` にアクセスできます。上流ベンダーのアカウント、本人確認、前払いは不要です。
  </Card>

  <Card title="プロトコルの違いはすでに対応済み" icon="git-compare">
    フィールド比較、イベント名比較、サンプルレートの制限、そして4つの測定済みの制約はすべてここに記載されているため、改めて調べ直す必要はありません。
  </Card>

  <Card title="テキストによる無料セルフテスト" icon="terminal">
    マイクなしで、ハンドシェイク、認証、フィールド、ツール接続、同時実行数を検証できます — 音声プランはテキストより桁違いに高いため、統合時の実コスト削減につながります。
  </Card>

  <Card title="測定済みのレイテンシと同時実行数" icon="gauge">
    20件の同時セッションでは、ハンドシェイクの p50 は 0.65–1.08 s、最初のテキスト delta の p50 は 0.54–0.95 s です。テスト条件と日付は、Technical Specs に記載しています。
  </Card>

  <Card title="ベータ期間中の直接サポート" icon="handshake">
    ベータ版ユーザーは、統合に関する質問、同時実行数の増加、上流側の挙動変更について、直接の WeCom チャネルを利用できます。
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

## サポート対象モデル

| モデル                           | プロトコルファミリー   | デフォルト音声 | 入力サンプルレート | プロンプトキャッシュ | 位置づけ                           |
| ----------------------------- | ------------ | ------- | --------- | ---------- | ------------------------------ |
| `gpt-realtime-2.1`            | Realtime GA  | `marin` | ≥ 24 kHz  | ✅ 対応済み     | フラッグシップ；多言語対応と reasoning が最も強力 |
| `gpt-realtime-2.1-mini`       | Realtime GA  | `marin` | ≥ 24 kHz  | ✅ 対応済み     | コスト効率が高く、日常会話には十分です            |
| `qwen3.5-omni-plus-realtime`  | Model Studio | `Tina`  | 16 kHz    | ⏸ 未確認      | 中国語シナリオ向けのフラッグシップ              |
| `qwen3.5-omni-flash-realtime` | Model Studio | `Tina`  | 16 kHz    | ⏸ 未確認      | 中国語シナリオ向けでコスト効率が高い             |

出力音声は4つのモデルすべてで **PCM signed 16-bit / mono / 24 kHz** です。

<Warning>
  2つのプロトコルファミリーは **エンドポイントと認証方式だけを共有します**。リクエストフィールドとサーバーイベント名はいずれも異なります。モデルを切り替える際はフィールドテンプレートも切り替える必要があります — 下記の「プロトコル比較」を参照してください。
</Warning>

## 価格

<Info>
  **1文で言うと**: 課金は token ごとで、**audio は text より桁違いに高額です**（`gpt-realtime-2.1`の場合、audio input は \$32、text input は \$4、audio output は \$64、text output は \$24 です）。統合中は text のみで実行し、チェーンが検証できたら audio に切り替えてください — 下の「テキストから開始」をご覧ください。
</Info>

以下の表は、ベンダーの**公式リスト価格**で、1M token あたりの USD です。**APIYI での実際の課金額は [call logs](https://api.apiyi.com/log) に表示される内容そのものです**。 [recharge bonus](/ja/faq/recharge-promotions) により、実効コストはさらに下がります。

### Realtime GAプロトコル

| モデル                     | text入力 | text出力 | キャッシュ読み取り | 画像入力  | audio入力 | audio出力 |
| ----------------------- | ------ | ------ | --------- | ----- | ------- | ------- |
| `gpt-realtime-2.1`      | \$4    | \$24   | \$0.4     | \$5   | \$32    | \$64    |
| `gpt-realtime-2.1-mini` | \$0.6  | \$2.4  | \$0.06    | \$0.8 | \$10    | \$30    |

### Model Studioプロトコル

課金の単位が異なります。image input は text の料金帯に含まれ、output は「text のみ」と「text + audio」に分かれます（後者のレートが適用されるのは audio 部分のみです）。

| モデル                           | text / image入力 | audio入力 | text出力 | text + audio出力 |
| ----------------------------- | -------------- | ------- | ------ | -------------- |
| `qwen3.5-omni-plus-realtime`  | \$1.38         | \$11    | \$8.25 | \$41.26        |
| `qwen3.5-omni-flash-realtime` | \$0.45         | \$3.71  | \$2.75 | \$14.71        |

<Note>
  **ベータ版の注意**: Realtime voice は供給が限られており、課金はまだ上流側と調整中です。実際の課金額が上の表と大きく異なる場合は、整合を取るためにサポートへご連絡ください。価格はベンダーの方針や供給状況によって変更される場合があります。この機能は**供給を確保し、お客様に提供するため**のものであり、利益目的の掲載ではありません。
</Note>

## アクセスグループ

<Note>
  **ベータ期間中に有効化する方法**: まだセルフサービスでのグループ選択は利用できません。アクセスは申請に基づいて付与されます。アカウント、ユースケース、想定される同時実行数を添えて[WeCom サポート](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)にお問い合わせください。こちらでキーにベータグループを有効化し、現在の注意点をご案内します。一般提供開始は[変更履歴](/en/changelog)で告知します。その時点では、キーやコードの変更は不要です。
</Note>

## 技術仕様

| 項目                    | 値                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| **Transport**         | WebSocket (`wss://`)、1本の接続での双方向ストリーミング                                                            |
| **Auth**              | `Authorization: Bearer <key>` ヘッダー                                                                |
| **Event format**      | OpenAI Realtime イベントモデル（client events / server events）と互換                                         |
| **Input audio**       | PCM 符号付き 16-bit、mono、Base64。**Model Studio 16 kHz; Realtime GA ≥ 24 kHz**                         |
| **Output audio**      | PCM 符号付き 16-bit、mono、24 kHz                                                                       |
| **Output modalities** | テキスト / audio（テキストのみも可）                                                                            |
| **Turn detection**    | `server_vad`、`semantic_vad`、または手動 `commit` 用に無効化                                                  |
| **Function calling**  | `function_call_output` の結果注入を含め、サポートされています                                                        |
| **Image input**       | サポートされています（構文はファミリーごとに異なります。以下を参照してください）                                                          |
| **Session lifetime**  | Realtime GA: セッションは `expires_at` を保持し、接続からおおよそ 30 分で測定されます。Model Studio: アイドル状態での切断は 300 秒で測定されます |

### 測定されたレイテンシと同時実行数

2026-08-24 (UTC+8) に、公開 `api.apiyi.com` 経路上で、20 個の同時セッション × 2 モデル、単一ターンのテキストのみのやり取りとして測定しました:

| 指標                | 測定値                         |
| ----------------- | --------------------------- |
| WebSocket ハンドシェイク | p50 0.65–1.08 s             |
| 最初の text delta    | p50 0.54–0.95 s             |
| 単一ターン全体           | p50 \< 1 s                  |
| セッション成功率          | 99.6%（ハンドシェイク失敗 1 回、再接続で回復） |

<Warning>
  これらは特定の同時実行数レベルでの時点測定であり、性能保証ではありません。**ベータ期間中は可用性SLAは提供されません** — クライアント側で再接続と適切な縮退を実装してください。
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

## 既知の制限（ベータ）

以下の4項目はいずれも確認済みで、すべてクライアントコードに影響します。統合する前にお読みください。

| 挙動                                                               | 影響を受けるファミリー             | クライアント側の回避策                                                                                        |
| ---------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------- |
| `response.done` は `response.cancel` の後に配信されないため、ターンが終了しません       | モデルスタジオ（6回のテスト実行すべてで再現） | ターン終了シグナルとして `response.output_item.done` を使い、5秒のタイムアウトを追加してください。セッション自体には影響がなく、中断後も会話は通常どおり続行されます  |
| アイドル接続は300秒で切断されます。WebSocket ping/pong は **アクティビティとしてカウントされません** | モデルスタジオ                 | アイドル中はアプリケーションレベルのイベントを定期的に送信するか、切断を受け入れて自動的に再接続してください。再接続後に `session.update` を再送してください            |
| セッションが音声を生成した後は、Voice を変更できません。`cannot_update_voice` で失敗します      | 両方のファミリー                | 最初の `session.update` で `voice` を固定し、切り替えるには新しいセッションを開いてください                                        |
| 入力文字起こしの完了イベントは手動 `commit` モードでは配信されません                          | モデルスタジオ上の `flash` モデル   | `server_vad` / `semantic_vad` に切り替えてください。そこでは文字起こしが通常どおり動作します。会話自体には影響はありません — モデルは音声を正しく理解し、応答します |

<Warning>
  これらの挙動は、ベータ期間中に上流が進化するにつれて変更される可能性があります。このページは常に最新の内容に保ちます。ここに記載のない問題に遭遇した場合は、[WeComサポート](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec) または [feedback@apiyi.com](mailto:feedback@apiyi.com) まで、タイムスタンプと `session.id` を添えてご報告ください。追跡できるようにします。
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

## エラーと再試行

| 症状                                        | 意味                                      | 対処法                                                          |
| ----------------------------------------- | --------------------------------------- | ------------------------------------------------------------ |
| ハンドシェイクが 401 を返す                          | 無効なキー、または `Authorization` ヘッダーが送信されていない | キー自体を確認し、`https://` を誤って使っていないか、ヘッダーが存在するかを確認してください          |
| ハンドシェイクが使用可能なチャネルなしで 503 を返す              | キーがベータグループで有効になっていないか、モデル名が間違っている       | サポートに連絡してグループが有効か確認し、`model` パラメータを確認してください                  |
| ハンドシェイクが 400 を返す                          | `model` クエリパラメータがありません                  | エンドポイントに `?model=<model-name>` を含める必要があります                   |
| 未知のフィールドでの `invalid_request_error`        | **プロトコルファミリーが間違っています**                  | 上の比較表を使って、そのモデルのフィールドテンプレートに切り替えてください                        |
| `integer_below_min_value`                 | Realtime GA で入力サンプルレートが 24000 未満        | クライアント側で 24 kHz 以上にリサンプリングしてください                             |
| `cannot_update_voice`                     | セッションが音声を生成した後にボイスが変わった                 | 最初のフレームでボイスを固定し、切り替えるには新しいセッションを開いてください                      |
| `Error append image before append audio.` | モデルスタジオで、音声より先に画像が追加された                 | まず `input_audio_buffer.append` 経由で音声を追加し、その後に画像フレームを追加してください |
| WebSocket 1006 / 1011                     | ネットワークの不安定さ、または上流の切断                    | 指数バックオフ（1 s / 4 s / 16 s）で再接続し、`session.update` を再生してください    |
| 約 5 分間無音の後に接続が切れる                         | モデルスタジオのアイドル制限                          | 既知の制限事項の下にあるキープアライブの方法を参照してください                              |

<Info>
  トラブルシューティングのヒント: 各イベントの `event_id` とセッションの `session.id` を記録し、問題を報告する際に含めてください。診断時間を大幅に短縮できます。なお、**Realtime GA のエラーオブジェクトには `code` と `param` が含まれます**（正確なフィールド名とその許容値を示します）が、Model Studio のエラーメッセージはより大まかです。デバッグ時は、まず前者でフィールド構文を検証してください。
</Info>

## よくある質問

<AccordionGroup>
  <Accordion title="このページにインタラクティブなプレイグラウンドがないのはなぜですか?">
    インタラクティブなプレイグラウンドは OpenAPI 仕様によって動作し、HTTP 経由で1つのリクエストと1つのレスポンスを記述します。Realtime は、1本の長寿命接続を通じて両方向に流れる多数のイベントタイプであり、このモデルには当てはまりません。代替手段は「テキストから始める」セクションのテキストのスモークテストです。数十行程度で、マイクは不要で、チェーンが動作することを確認できます。
  </Accordion>

  <Accordion title="モデル名だけを変えて4つのモデルを切り替えられますか?">
    **いいえ。** エンドポイントと認証は同じですが、リクエストフィールドとイベント名は2つのプロトコルに属しています。少なくとも次を変更する必要があります: `modalities` ↔ `output_modalities`, `voice` ↔ `audio.output.voice`, `input_audio_format` ↔ `audio.input.format`, `turn_detection` ↔ `audio.input.turn_detection`, `input_audio_transcription` ↔ `audio.input.transcription`, さらにイベント名の `response.text.delta` ↔ `response.output_text.delta` と `response.audio.delta` ↔ `response.output_audio.delta` です。完全な対応表は Protocol Comparison セクションを参照してください。
  </Accordion>

  <Accordion title="ハンドシェイクが完全に失敗します。どうデバッグすればよいですか?">
    順に5点確認してください: 1. スキームが `wss://` で、`https://` ではないこと; 2. エンドポイントに `?model=<model-name>` が含まれていること; 3. `Authorization: Bearer <key>` ヘッダーがあること; 4. キーがベータグループで有効になっていること（そうでない場合は「no available channel」で 503 になります）; 5. 間にあるリバースプロキシが `Upgrade` ヘッダーを削除していないこと — これは自前のゲートウェイ経由でリレーする場合によくある問題です。
  </Accordion>

  <Accordion title="ブラウザから接続できますか? キーは漏えいしますか?">
    技術的には可能です — エンドポイントは `Sec-WebSocket-Protocol` サブプロトコル経由の認証を受け付けるため、ブラウザの `WebSocket` は直接接続できます。ただし、それでは**キーをブラウザに渡してしまう**ことになり、訪問者なら誰でもネットワークパネルから読めるため、**ローカル検証にのみ適しています**。本番環境ではバックエンドリレーを実装してください。バックエンドがキーを保持して APIYI への接続を開き、フロントエンドは自前のサービスとだけやり取りします。
  </Accordion>

  <Accordion title="gpt-realtime-2.1 に 16 kHz の音声を送ると失敗します。なぜですか?">
    Realtime GA プロトコルでは入力サンプルレートとして **少なくとも 24000** が必要です。16000 では `integer_below_min_value` が返ります。正しい形式は `"audio": {"input": {"format": {"type": "audio/pcm", "rate": 24000}}}` です。2つの Model Studio モデルは代わりに 16 kHz が必要で、両者は互換ではありません。
  </Accordion>

  <Accordion title="マイクがありません / 音声のテストが難しいです。どうすればよいですか?">
    「テキストから始める」セクションの3ステップのセルフテストに従ってください。まずテキストだけでチェーンを検証し（audio tokens は生成されません）、次にローカルの wav ファイルを再生して音声パイプラインを検証し、そのあとでライブマイクを接続します。テスト用音声は macOS の標準機能 `say` と `afconvert` を使えば1行で生成できます — コマンドはそのセクションにあります。
  </Accordion>

  <Accordion title="response.cancel を送っても response.done を受け取れません。">
    これは2つの Model Studio モデルで既知の挙動です（6回のテスト実行すべてで再現済み）: 中断後に `response.text.done`、`response.content_part.done`、`response.output_item.done` は受け取れますが、`response.done` は配信されません。**`response.output_item.done` をターン終了シグナルとして使い、保険としてタイムアウトも追加してください。** セッション自体には影響せず、会話は通常どおり継続します。2つの Realtime GA モデルではここは正しく動作します。
  </Accordion>

  <Accordion title="接続が約5分後に切れます。">
    Model Studio プロトコルでは、300秒の非アクティブ状態のあとに接続が切断され、WebSocketレベルの ping/pong はアクティビティとしてカウントされません — ハートビートではこのタイマーは延長されません。アイドル中は定期的にアプリケーションレベルのイベント（たとえば `session.update`）を送るか、切断を受け入れて自動的に再接続してください。再接続後は `session.update` と必要なコンテキストを再送するのを忘れないでください。
  </Accordion>

  <Accordion title="1つのセッションはどれくらい開いたままにできますか?">
    Realtime GA プロトコルでは、`session.created` イベントが `expires_at` を運び、接続からおよそ30分でその制限に達するため、その後は再接続が必要です。Model Studio プロトコルで主に確認された制約は、300秒のアイドル切断です。長い会話はセッションが期限切れになる前提で設計し、コンテキストをセッション間でどう引き継ぐかを計画してください。
  </Accordion>

  <Accordion title="音声はどう設定しますか? また、変更すると cannot_update_voice が返るのはなぜですか?">
    `session.update` で音声を設定します: Model Studio ではトップレベルの `voice`、Realtime GA では `audio.output.voice` です。**セッションが音声出力を生成したあとでは voice は変更できません** — これは両方のプロトコルに当てはまり、`cannot_update_voice` が返ります。最初のフレームで固定し、切り替えるには新しいセッションを開いてください。また、Model Studio では voice に空文字列を送らないでください。400 が返ります。
  </Accordion>

  <Accordion title="手動コミットモードで入力の文字起こしが取得できません。">
    Model Studio 上の `flash` モデルは、手動 `commit` モードでは文字起こし完了イベントを返しません（実行ごとに一貫して再現されています）。`plus` モデルは返しますし、どちらも VAD モードでは動作します。**`server_vad` または `semantic_vad` に切り替えてください。** テストでは、この場合 transcript テキストは delta イベント上のドキュメント化されていないフィールドに入ることが確認されていますが、そのフィールドはいつでも変更される可能性があり、**依存すべきではありません。** なお、これは UI でユーザーの発話を表示する部分にのみ影響し、会話には影響しません。モデルは音声を正しく理解して回答します。
  </Accordion>

  <Accordion title="画像入力はサポートされていますか? なぜ「Error append image before append audio.」が出るのですか?">
    4つのモデルすべてが画像入力をサポートしていますが、構文は異なります。Realtime GA ではメッセージ内に `input_image` を直接置きます。Model Studio では画像は**動画フレーム**として扱われるため、最初の画像の前に音声を追加する必要があり、それがそのエラーを引き起こします。テストでは、画像フレームを音声 stream におよそ1秒あたり1フレームの割合で挟み込む方法がうまくいきました。
  </Accordion>

  <Accordion title="プロンプトキャッシュはありますか? ヒットをどう確認しますか?">
    2つの Realtime GA モデルはこれをサポートしており、自動的に適用されます — テストでは、セッション内の2回目のターンですでに cache hit があり、`usage.input_token_details.cached_tokens` に値がありました。2つの Model Studio モデルでは cache hit は確認されませんでした。
  </Accordion>

  <Accordion title="コストはどう見積もりますか? テキストと音声は別々に課金されますか?">
    `usage` オブジェクトが `response.done` 上でモダリティごとの tokens（入力と出力でそれぞれ text / audio / image）を報告するため、コストを按分できます。音声の料金帯はテキストよりかなり高いので、統合作業中はテキストのみが推奨されます。**実際の課金については、[通話ログ](https://api.apiyi.com/log)を参照してください。**
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="API マニュアル" icon="book-open" href="/ja/api-manual">
    キーの作成、base URL、課金モード、その他の一般的な規約。
  </Card>

  <Card title="キーとグループ" icon="key-round" href="/ja/api-capabilities/token-management">
    キーを作成し、グループを選択してクォータを設定します。
  </Card>

  <Card title="テキスト生成" icon="file-text" href="/ja/api-capabilities/text-generation">
    通常のチャットモデル — テキストのみの会話により適しています。
  </Card>

  <Card title="モデル料金" icon="table" href="/en/models">
    プラットフォーム上のすべてのモデルのリアルタイム料金、エンドポイント、グループ。
  </Card>

  <Card title="チャージボーナス" icon="percent" href="/ja/faq/recharge-promotions">
    実質コストをさらに下げます。
  </Card>

  <Card title="ベータアクセスをリクエスト" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    アカウントと予想される同時実行数を添えて WeCom サポートにお問い合わせください。
  </Card>
</CardGroup>

<Info>
  Realtime voice は現在 **プライベートベータ** です。このページのすべての測定結果は 2026-08-24 (UTC+8) 時点のもので、上流側の変更に応じて更新されます。統合を予定している場合、このページで扱っていない事項に該当する場合、またはより高い同時実行数が必要な場合は、[hi@apiyi.com](mailto:hi@apiyi.com) / [feedback@apiyi.com](mailto:feedback@apiyi.com) までご連絡ください。
</Info>
