> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 廃止予定のモデル

> 今後廃止予定および非推奨のモデル一覧を確認し、適切な時期に推奨の代替モデルへ移行してください。

## 概要

このページでは、廃止予定または既に廃止されたモデルを一覧表示しており、事前に移行計画を立てるのに役立ちます。

<Warning>
  廃止予定のモデルを使用している場合は、サービス中断を避けるため、できるだけ早く推奨される代替手段へ移行してください。
</Warning>

## ⚠️ 今後の非推奨予定

以下のモデルは非推奨化が予定されています。記載日までに移行を完了してください。

| モデル名                              | モデル ID                                | 予定非推奨日                  | 推奨代替                     | 備考                                                                                                                                                                         |
| --------------------------------- | ------------------------------------- | ----------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gemini 3 Pro プレビュー                | `gemini-3-pro-preview`                | 透過的にエイリアス化されます（2026-05） | `gemini-3.1-pro-preview` | **Google公式と同期**: すでにお客様が本番環境で旧IDを呼び出しているため、本番ワークロードへの影響を避けるよう、`gemini-3-pro-preview` へのリクエストは自動的に `gemini-3.1-pro-preview` にルーティングされます。都合のよいタイミングで新しいIDに移行してください。          |
| Gemini 3.1 Flash Lite プレビュー       | `gemini-3.1-flash-lite-preview`       | 透過的にエイリアス化されます（2026-05） | `gemini-3.1-flash-lite`  | **Google公式と同期**: Google は 2026-05-25 にこのプレビューを廃止しました。旧IDへのリクエストは、自動的に `gemini-3.1-flash-lite` にルーティングされ、**同一価格** で公式レートに追随するため、本番ワークロードは中断されません。都合のよいタイミングで新しいIDに移行してください。 |
| Gemini 2.0 Flash Lite             | `gemini-2.0-flash-lite`               | 未定                      | `gemini-2.5-flash`       | Gemini 2.0 シリーズの終了                                                                                                                                                         |
| Gemini 2.0 Flash Lite 001         | `gemini-2.0-flash-lite-001`           | 未定                      | `gemini-2.5-flash`       | Gemini 2.0 シリーズの終了                                                                                                                                                         |
| Gemini 2.0 Flash                  | `gemini-2.0-flash`                    | 未定                      | `gemini-2.5-flash`       | Gemini 2.0 シリーズの終了                                                                                                                                                         |
| Gemini 2.0 Flash 001              | `gemini-2.0-flash-001`                | 未定                      | `gemini-2.5-flash`       | Gemini 2.0 シリーズの終了                                                                                                                                                         |
| Gemini 2.0 Flash Lite プレビュー 02-05 | `gemini-2.0-flash-lite-preview-02-05` | 未定                      | `gemini-2.5-flash`       | プレビュー版                                                                                                                                                                     |

<Info>
  Gemini モデルの非推奨に関する詳細は、公式ドキュメントをご参照ください: `ai.google.dev/gemini-api/docs/deprecations`
</Info>

## 🚫 廃止済みモデル

以下のモデルは廃止され、現在は利用できません。アプリケーションがまだこれらのモデルを呼び出している場合は、直ちに代替モデルへ切り替えてください。

| モデル名                                | モデル ID                                                                                    | 廃止日        | 代替モデル                                   | 備考                                                                                                                                                                                                           |
| ----------------------------------- | ----------------------------------------------------------------------------------------- | ---------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Kimi K2                             | `kimi-k2`                                                                                 | 2026-05-28 | `kimi-k2.6`                             | レガシーな Kimi K2 — 最新の K2.6 に移行してください                                                                                                                                                                           |
| Kimi K2 128K                        | `kimi-k2-128k`                                                                            | 2026-05-28 | `kimi-k2.6`                             | レガシーな長文脈 K2; K2.6 はデフォルトで 256K のコンテキストを備えています                                                                                                                                                                |
| Kimi K2 Instruct                    | `kimi-k2-instruct`                                                                        | 2026-05-28 | `kimi-k2.6`                             | レガシーな命令チューニング済み K2 — K2.6 に移行してください                                                                                                                                                                          |
| DeepSeek V3.1                       | `deepseek-v3-1-250821`                                                                    | 2026-05-28 | `deepseek-v4-pro` / `deepseek-v4-flash` | DeepSeek V3シリーズは廃止されました — V4 に移行してください: 重い推論には Pro を、高スループット / コスト重視のワークロードには Flash を選択してください                                                                                                                |
| DeepSeek V3.1 Terminus              | `deepseek-v3.1-terminus`                                                                  | 2026-05-28 | `deepseek-v4-pro` / `deepseek-v4-flash` | DeepSeek V3シリーズは廃止されました — V4 に移行してください                                                                                                                                                                       |
| DeepSeek R1 (250528)                | `deepseek-r1-250528`                                                                      | 2026-05-28 | `deepseek-v4-pro` / `deepseek-v4-flash` | R1 の推論モデルは V4 に置き換えられました — 推論ワークロードには V4 Pro を使用してください                                                                                                                                                       |
| GPT-4                               | `gpt-4`                                                                                   | 2026-02-27 | `gpt-5.2`                               | レガシーモデルです。提供は終了しています                                                                                                                                                                                         |
| GPT-4 (32K)                         | `gpt-4-32k`                                                                               | 2026-02-27 | `gpt-5.2`                               | レガシーモデルです。提供は終了しています                                                                                                                                                                                         |
| Grok 4                              | `grok-4`                                                                                  | 2026-03-12 | `grok-4-1-fast-reasoning`               | 廃止済み — 新しいリリースに移行してください                                                                                                                                                                                      |
| Grok 4 0709                         | `grok-4-0709`                                                                             | 2026-03-12 | `grok-4-1-fast-reasoning`               | 廃止済み — 新しいリリースに移行してください                                                                                                                                                                                      |
| Sora 2 Video (公式リレー)                | `sora-2` / `sora-2-pro` / `sora-2-remix`                                                  | 2026-07-01 | `doubao-seedance-2-0` / `wan2.7-t2v`    | **Sora 2 系列はすべて廃止されました。** OpenAI のキャパシティ再配分により深刻なタイムアウトが発生したため、公式の終了時期は 9 月に設定されていましたが、`Sora2Official` グループは 7 月 1 日に前倒しで廃止しました。このグループは現在無効化されています。[サービス通知](/en/live/2026-07/sora2-official-offline) をご覧ください |
| Sora 2 Video (リバース)                 | `sora_video2` / `sora_video2-landscape` / `sora_video2-15s` / `sora_video2-landscape-15s` | 2026-04-26 | `doubao-seedance-2-0` / `wan2.7-t2v`    | リバースチャネルは廃止されました。その後継である公式リレーの Sora 2 も 2026-07-01 に廃止されました — [SeeDance 2.0](/ja/api-capabilities/seedance2/overview) または [Wan2.7](/ja/api-capabilities/wan/overview) に直接移行してください                            |
| Sora 2 Character Generation         | `sora-character`                                                                          | 2026-04-26 | `doubao-seedance-2-0`                   | リバースチャネルは廃止されました。キャラクターの一貫性が重要なワークロードでは、代わりに [Seedance Asset Library](/ja/api-capabilities/seedance2/asset-library) を使用してください                                                                                |
| Sora Image Generation/Edit (リバース)   | `sora_image`                                                                              | 2026-04-26 | `gpt-image-2-all` (新しいリバース)             | リバースチャネルは廃止されました — [GPT-Image-2-All](/ja/api-capabilities/gpt-image-2-all/overview) に移行してください                                                                                                                |
| GPT-4o Image Generation/Edit (リバース) | `gpt-4o-image`                                                                            | 2026-04-26 | `gpt-image-2-all` (新しいリバース)             | リバースチャネルは廃止されました — [GPT-Image-2-All](/ja/api-capabilities/gpt-image-2-all/overview) に移行してください                                                                                                                |

## 🔗 提供元別の公式廃止ページ

各提供元の公式なモデルライフサイクルおよび廃止ページへのクイックリンクです。最新のスケジュールをソースで直接照合できます。

<CardGroup cols={2}>
  <Card title="OpenAI" icon="square-terminal" href="https://platform.openai.com/docs/deprecations">
    GPTモデルの廃止一覧と推奨代替
  </Card>

  <Card title="Anthropic Claude" icon="brain" href="https://platform.claude.com/docs/en/about-claude/model-deprecations">
    Claudeモデルの廃止スケジュール（公式ドキュメント）
  </Card>

  <Card title="Google Gemini" icon="gem" href="https://ai.google.dev/gemini-api/docs/deprecations">
    Geminiモデルのサンセット時期と移行ガイダンス
  </Card>

  <Card title="xAI Grok" icon="bolt" href="https://docs.x.ai/developers/migration/models">
    Grokモデルの移行メモと提供終了のお知らせ
  </Card>

  <Card title="Alibaba Qwen" icon="cloud" href="https://www.alibabacloud.com/help/en/model-studio/newly-released-models">
    Bailian（Model Studio）のQwenモデルライフサイクルと更新情報
  </Card>

  <Card title="DeepSeek" icon="fish" href="https://api-docs.deepseek.com/updates">
    DeepSeek APIの変更履歴とモデル移行メモ
  </Card>
</CardGroup>

<Info>
  上記のリンクは各ベンダーの公式ドキュメントにリダイレクトされます。モデルの提供終了スケジュールを最新の状態で把握できるよう、ブックマークして定期的に確認することをおすすめします。
</Info>

<Info>
  このページは定期的に更新されます。最新の廃止情報については、定期的に再確認することをおすすめします。
</Info>
