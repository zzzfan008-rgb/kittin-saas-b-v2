> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 公式版とリバースチャネル版の比較

> VEO 3.1 Official（このシリーズ）と既存の VEO 3.1（リバースチャネル）の全方位比較です。課金、機能、意思決定ツリー、シナリオ別の推奨事項を含みます。

<Info>
  APIYI は 2 つの Veo 3.1 チャネルを同時に提供しています。このページでは、**シナリオで選ぶ**のに役立ちます。公式品質 + 非同期ポーリングを受け入れられる → **公式**（このシリーズ）；コスト重視 + ストリーミング同期またはフレームから動画生成が必要 → **リバース**（[VEO 3.1](/en/api-capabilities/veo/overview)）。どちらのチャネルも、**同じアカウントで並行して使用**でき、競合しません。
</Info>

## 完全比較マトリクス

| 項目             | **公式**（このシリーズ）                                               | **リバース**（[既存の VEO 3.1](/en/api-capabilities/veo/overview)）       |
| -------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| **チャネルタイプ**    | Google AI Studio への透過的なパススルー                                 | Google Flow へのリバースエンジニアリングされたアクセス                                |
| **モデルID**      | `veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview` | `veo-3.1` / `veo-3.1-fast` / `-landscape` / `-fl` シリーズ（8バリエーション） |
| **課金モード**      | リクエストごとの課金（継続時間 / 解像度に依存しません）                                | リクエストごとの課金（継続時間 / 解像度に依存しません）                                    |
| **価格**         | \$0.3（fast）/ \$1.2（standard）                                 | \$0.15（fast）/ \$0.25（standard）— **50〜75%安い**                     |
| **エンドポイントパス**  | `POST /v1/videos` のみ（非同期）                                    | `POST /v1/chat/completions`（ストリーミング同期）+ `POST /v1/videos`（非同期）   |
| **ストリーミング同期**  | ❌ 非同期ポーリングのみ                                                 | ✅ ライブ進捗用の `stream: true` をサポート                                   |
| **継続時間**       | 4 / 6 / 8秒（文字列）                                              | 固定 8秒                                                            |
| **解像度**        | 720p / 1080p / 4k（3段階）                                       | HD 横向き（1280×720）/ 縦向き（720×1280）                                  |
| **参照画像**       | `input_reference` 経由で 1枚（multipart）                          | 1〜2枚（`-fl` シリーズで **フレームから動画への変換** をサポート）                         |
| **横向き / 縦向き**  | `aspectRatio` パラメータ経由                                        | モデルID（`-landscape` シリーズ）経由                                       |
| **グループ**       | `Default`                                                    | `Default`                                                        |
| **課金モデル**      | リクエストごとの課金 ✅ / Pay-as-you-go Priority ✅（純粋な従量課金 ❌）           | リクエストごとの課金 ✅ / Pay-as-you-go Priority ✅                          |
| **レスポンスフィールド** | `id` / `task_id` / `status` / `progress`（粗い 0/50/100）        | 同期: 完全な chat completion; 非同期: `task_id` / `status`               |
| **失敗時の課金**     | ❌ 課金されません                                                    | ❌ 課金されません                                                        |
| **音声**         | ネイティブな同期音声                                                   | ネイティブな同期音声                                                       |
| **使用シーン**      | 公式品質が必要で、非同期ポーリングを受け入れられる本番環境                                | コスト重視、同期UI進捗が必要、フレームから動画への変換が必要                                  |

## 3ステップの意思決定ツリー

<Steps>
  <Step title="Q1: フレームから動画生成機能が必要ですか?">
    * **はい** → **[VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview)** `-fl` シリーズ（例: `veo-3.1-landscape-fast-fl`）を使用します; 公式はまだフレームから動画生成を公開していません
    * **いいえ** → Q2へ進みます
  </Step>

  <Step title="Q2: フロントエンドにストリーミング同期プログレスバーが必要ですか?">
    * **はい**（ユーザー向けUIを空白のままにできません）→ **[VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview)** `/v1/chat/completions` ストリーミング エンドポイントを使用します
    * **バックエンド担当**（キューコンシューマー、バッチ生成）→ Q3へ進みます
  </Step>

  <Step title="Q3: 予算と品質、どちらを優先しますか?">
    * **予算優先** (\$0.15 と \$0.3 の差が重要) → **[VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview)** を使用します。価格は 50% 低いです
    * **品質 / 安定性優先**（最終納品、4K、強い指示追従）→ **公式**（このシリーズ）を `veo-3.1-generate-preview` とともに使用します
    * **反復 / プレビュー** → **公式** `veo-3.1-fast-generate-preview`（\$0.3）または **Reverse** `-fast`（\$0.15）を使用します
  </Step>
</Steps>

## シナリオ別おすすめ

| ビジネスシーン                           | 推奨チャネル   | 推奨モデル                                        | 理由                             |
| --------------------------------- | -------- | -------------------------------------------- | ------------------------------ |
| 短尺動画のマトリクス一括制作（1日100本以上）          | **リバース** | `veo-3.1-landscape-fast`                     | 1単位あたり \$0.15、バッチコストを制御しやすい    |
| 最終クライアント向け広告納品                    | **公式**   | `veo-3.1-generate-preview`                   | 安定した公式品質 + 4Kオプションあり           |
| フロントエンドのライブ表示（ローディングアニメーションが必要）   | **リバース** | `veo-3.1-landscape-fast` + streaming同期       | 進捗が見えて、待ち時間の不安を避けられる           |
| 静止ポスター + フレームから動画への変換 → モーションクリップ | **リバース** | `veo-3.1-landscape-fast-fl`                  | フレームから動画への変換機能                 |
| 4Kシネマティッククリップ（主力アセット）             | **公式**   | `veo-3.1-generate-preview` + `resolution=4k` | 4Kをサポートするのは公式のみ                |
| 海外チームの導入（既存Keyはそのまま）              | **公式**   | `veo-3.1-fast-generate-preview`              | デフォルトグループ + リクエストごとの課金で、導入負担なし |
| 同一promptでのマルチシード・スタイル探索           | **公式**   | `veo-3.1-fast-generate-preview`              | 4～6秒も選択可能で、反復コストが低い            |
| 反復 + 最終納品ワークフロー                   | 混合       | リバースで高速反復 → 公式で標準納品                          | 低コストで反復でき、安定して納品できる            |

## 両方のチャネルを一緒に使えますか？

**もちろんです**。2つのチャネルはそれぞれ独立してルーティングされます。

* 同じアカウントでは、**単一の Token**（Default グループ上のもの）で両方のチャネルに同時に呼び出せます。課金は呼び出しごとに記録されます
* ビジネスコードでは、必要に応じて `model` フィールドを切り替えてください:
  * Official を使う場合 → `veo-3.1-fast-generate-preview` / `veo-3.1-generate-preview`
  * Reverse を使う場合 → `veo-3.1-fast` / `veo-3.1-landscape` / `veo-3.1-fl` など

<Tip>
  **推奨設定**: 「ビジネスクリティカルな配信」は Official にルーティングし、「イテレーション / バッチプレビュー / 同期 UI」は Reverse にルーティングします。アカウントは一元化され、課金は明瞭で、機能は補完し合います。
</Tip>

## 関連ドキュメント

* [VEO 3.1 公式概要](/ja/api-capabilities/veo-3-1-official/overview) — 公式チャネルの完全な紹介
* [VEO 3.1（リバース）概要](/en/api-capabilities/veo/overview) — 既存のリバースチャネルの完全な紹介
* [VEO 3.1 公式テキストから動画へのプレイグラウンド](/ja/api-capabilities/veo-3-1-official/text-to-video)
* [VEO 3.1 公式画像から動画へのプレイグラウンド](/ja/api-capabilities/veo-3-1-official/image-to-video)
* [VEO 3.1（リバース）クイックスタート](/en/api-capabilities/veo/quick-start) — ストリーミング同期の使い方
* [VEO 3.1（リバース）非同期 API](/en/api-capabilities/veo/async-api) — フレームから動画への使い方を含みます
