> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Codex、ClaudeCode、Default グループの違いは何ですか？

> CodexReverse、ClaudeCode、および Default token グループの上流ソース、プロトコル、推奨される開発ユースケースについて説明します。

## 簡単な回答

3つのグループは主に **上流ソース、リクエストプロトコル、想定されるツール** が異なります。

* **CodexReverse**: 日常的な Codex 開発向けのリバースエンジニアリングされた Codex リソースチャネルで、通常の使いやすさと高いキャッシュヒット率を備えています
* **ClaudeCode**: Claude Code および Anthropic のネイティブな `/v1/messages` プロトコルを使用する環境向けの専用グループです
* **Default**: GPT、Claude、Gemini、DeepSeek、その他のモデルへの混在アクセス向けの一般的な公式リレーグループです

## どのグループを使うべきですか？

| グループ           | 主な特徴                                                           | 推奨用途                                                              |
| -------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| `CodexReverse` | 公式 API リレーリソースとは異なるソースを使う、コスト効率の高いリバースエンジニアリングされた Codex チャネルです | Codex CLI、Codex のコーディングタスク、コスト重視の開発                               |
| `ClaudeCode`   | Anthropic のネイティブ `/v1/messages` プロトコルと互換性のあるモデルを集約しています        | Claude Code、Anthropic ネイティブクライアント、そして Claude Code 内で使う互換コーディングモデル |
| `Default`      | 幅広いモデルをカバーする一般的な公式リレーリソースです                                    | 混在開発、安定性を重視する本番ワークロード、そして 1 つの token で複数のモデルファミリーを利用したい場合         |

<Info>
  **「公式リレー」と「リバースエンジニアリングされたもの」は、異なる上流のリソース元を示します。** `Default` は公式 API リレーリソースを使用し、`CodexReverse` はリバースエンジニアリングされた Codex リソースを使用します。どちらも通常どおり動作しますが、本番運用の安定性、料金、キャッシュ挙動、およびモデルの利用可否は異なる場合があります。
</Info>

## 日常開発におすすめの構成

Codex と Claude Code の両方を使う場合は、2 つの token を分けて持つ構成が合理的です：

* Codex では `CodexReverse` token を使います
* Claude Code では `ClaudeCode` token を使います
* ほかのアプリケーションが複数のモデルプロバイダーへ混在アクセスする必要がある場合は、追加で `Default` token も用意しておきます

これにより、プロトコルとルートの混在を避けつつ、利用ログとコストを確認しやすくできます。

<Warning>
  グループはモデルの利用可否、ルーティング、課金倍率に影響します。`CodexReverse` は公式 API リレーのリソースとは同じではありません。安定性や出所コンプライアンス要件が厳しい本番ワークロードでは、`Default` の公式リレーグループを優先し、実際のワークロードで検証してください。
</Warning>

## 関連ドキュメント

* [グループとは？](/ja/faq/groups-explained)
* [tokenとグループ](/ja/faq/token-and-groups)
* [Codex CLI 統合ガイド](/ja/scenarios/programming/codex-cli)
* [Claude Code 統合ガイド](/ja/scenarios/programming/claude-code)
