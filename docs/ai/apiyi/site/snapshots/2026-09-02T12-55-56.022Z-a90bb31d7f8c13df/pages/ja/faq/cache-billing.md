> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI はキャッシュ課金に対応していますか?

> はい。Claude、OpenAI、Gemini、DeepSeek、Qwen、Grok、その他の主要チャネルはすべてキャッシュ課金に対応しています。ヒットフィールドはそのまま返され、課金は公式の割引率に従います

## 簡潔な回答

**はい。** APIYI の **Claude、OpenAI、Gemini、DeepSeek、Qwen、Grok** チャネルはすべてキャッシュ課金をサポートしています。キャッシュ関連のリクエストパラメータはそのまま上流へ転送され、キャッシュヒットのフィールドは変更されずに返ってきます。また、課金ダッシュボードではキャッシュされた使用量が公式の割引率で別明細として表示されるため、コード側でミドルウェア固有の調整は不要です。

**Claude と OpenAI のキャッシュヒットは安定して信頼できます**（どちらもこのサイトに専用ガイドがあります。下にリンクがあります）。DeepSeek、Qwen、Grok はいずれも完全自動のプレフィックスキャッシュを使用しており、安定したプレフィックスがあれば通常どおりヒットします。ただし、**Grok の上流はヒットを明示的に保証していない**ため、キャッシュ未使用時の価格で予算を見積もってください。Gemini の暗黙的キャッシュもサポートされていますが、**ヒット率は平凡**です。Gemini のキャッシュを前提にコスト予算を組まないでください。

## 3つのチャネルを一覧で見る

|         | OpenAI (gpt-5 シリーズ)                                           | Claude                                                        | Gemini                                                        |
| ------- | ------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| トリガー    | **完全自動**、コード不要                                                | 手動の`cache_control`マーカー                                        | 暗黙的キャッシュ、自動有効化                                                |
| 最低しきい値  | 1024 tokens                                                   | モデルにより1024–4096 tokens                                        | 4096（3 シリーズ）/ 2048（2.5 シリーズ）                                  |
| 書き込み料金  | 無料                                                            | 1.25×（5 分）/ 2×（1 時間）                                          | 無料                                                            |
| ヒット価格   | 入力の0.1×                                                       | 入力の0.1×                                                       | Googleの公式割引による                                                |
| 実運用での体感 | ✅ 安定したヒット                                                     | ✅ 安定したヒット                                                     | ⚠️ ヒット率は平凡                                                    |
| 完全ガイド   | [OpenAI Cache 課金](/ja/api-capabilities/openai/prompt-caching) | [Claude Cache 課金](/ja/api-capabilities/claude-prompt-caching) | [Gemini Cache 課金](/ja/api-capabilities/gemini/prompt-caching) |

## チャンネルノート

### OpenAI: 完全自動、手間いらず

少なくとも 1024 tokens の安定したプレフィックスを維持するとヒットが自動的に発生します。マッチした部分は **入力価格の10%** で課金され、書き込み料金は不要なので、2回目のリクエストからすでに純粋な節約になります。どのようにリクエストを書けばヒットするのか、そして `prompt_cache_key` の使い方は、[OpenAI プロンプトキャッシュ課金ガイド](/ja/api-capabilities/openai/prompt-caching) をご覧ください。

### Claude: 手動マーカー、最大の節約

キャッシュしたいコンテンツブロックに `cache_control` を追加してください。ヒット時の課金は **0.1×** で、書き込みは 1.25× / 2× のコストです。Claude Code、Cline、Cursor、その他の高負荷ワークロードに必須です。これは **Anthropic のネイティブフォーマット（`/v1/messages`）でのみ動作する** ことに注意してください。OpenAI互換フォーマットで Claude を呼び出しても、キャッシュ割引は適用されません。[Claude プロンプトキャッシュ課金ガイド](/ja/api-capabilities/claude-prompt-caching) もご覧ください。

### Gemini: 対応済みですが、期待は控えめに

APIYI は Gemini のネイティブフォーマットに対して、暗黙的なコンテキストキャッシュを自動で有効化し、ヒット時の課金は Google の公式割引が適用されます。ただし実際には、**Gemini のキャッシュヒット率は Claude / OpenAI より明らかに低い** です（上流の暗黙的キャッシュの挙動は制御できません）。私たちのおすすめは次のとおりです。

* キャッシュ割引はあれば便利なボーナスとして扱い、**コストはキャッシュなしの価格で見積もる**
* 長くて頻繁に繰り返すプレフィックスがある、キャッシュに敏感なワークロードでは、OpenAI または Claude のチャネルを優先する

## その他のチャネル: DeepSeek / Qwen / Grok

これらのチャネルでのキャッシングは **完全自動** で、（マーカーは不要です）、APIYI 経由でも通常どおり動作し、実運用でも良好です。

| チャネル           | トリガー                                       | ヒット時の割引（公式）                                                                                                               | ヒットの信頼性                    |
| -------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| **DeepSeek**   | 自動、プレフィックス一致                               | ヒットで **90%超** を節約 — この中で最も割引率が高いです                                                                                        | 安定                         |
| **Qwen**       | 暗黙的キャッシング、自動有効化、少なくとも 1024 tokens のプレフィックス | ヒットは公式の割引レートで課金されます                                                                                                       | 安定                         |
| **Grok (xAI)** | 自動、プレフィックス一致                               | ヒットで約 **75%** 節約できます（`grok-4.6`; モデルのティアによって異なります）— [Grok キャッシュ課金ガイド](/ja/api-capabilities/grok/prompt-caching) を参照してください | 発生した場合は決定的ですが、上流での保証はありません |

ヒット率を高める方法は OpenAI の場合と同じです。**安定した内容を先に、変動しやすい内容を最後に** 配置してください。タイムスタンプやランダム ID は prompt の先頭に置かないでください。[OpenAI Cache Billing Guide](/ja/api-capabilities/openai/prompt-caching) にある「stable prefix」の手順をそのまま適用できます。

## ヒットの確認方法

レスポンス `usage` のキャッシュフィールドを確認します:

| チャネル                               | ヒットフィールド                                                     |
| ---------------------------------- | ------------------------------------------------------------ |
| OpenAI `/v1/chat/completions`      | `usage.prompt_tokens_details.cached_tokens`                  |
| OpenAI `/v1/responses`             | `usage.input_tokens_details.cached_tokens`                   |
| Claude `/v1/messages`              | `usage.cache_read_input_tokens`                              |
| Gemini ネイティブ形式                     | `usageMetadata.cachedContentTokenCount`                      |
| DeepSeek                           | `usage.prompt_cache_hit_tokens` / `prompt_cache_miss_tokens` |
| Qwen / Grok `/v1/chat/completions` | `usage.prompt_tokens_details.cached_tokens`                  |
| Grok `/v1/responses`               | `usage.input_tokens_details.cached_tokens`                   |

0より大きい値はヒットを意味します。ダッシュボードの呼び出しログでは、キャッシュ済みの使用分が割引された個別の明細として表示され、直接確認できます。

## 注意事項

<Warning>
  **キャッシュは呼び出し形式に従います**: ClaudeモデルをOpenAI互換形式（`/v1/chat/completions`）で呼び出すと、Claudeのキャッシュ割引は適用されません。Claudeを大量に使う場合は、ネイティブな`/v1/messages`形式を使用してください。
</Warning>

* キャッシュは**モデルごとに分離**されています: モデルを切り替えても（同じシリーズ内であっても）何も共有されません
* 上記に記載のないベンダー（Kimi など）については、呼び出しログに実際に返ってきたキャッシュフィールドに従ってください
* 公式メカニズムの詳細: `platform.openai.com/docs/guides/prompt-caching`, `docs.claude.com/en/docs/build-with-claude/prompt-caching`, `ai.google.dev/gemini-api/docs/caching`, `api-docs.deepseek.com/quick_start/pricing`, `docs.x.ai/developers/advanced-api-usage/prompt-caching`

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="OpenAI キャッシュ課金ガイド" icon="database" href="/ja/api-capabilities/openai/prompt-caching">
    自動キャッシュ: 1024-token のしきい値、ヒット時90%オフ、prompt\_cache\_key ルーティング
  </Card>

  <Card title="Grok キャッシュ課金ガイド" icon="database" href="/ja/api-capabilities/grok/prompt-caching">
    ヒット時75%オフ、128-token ブロック粒度、そして長い会話にどの エンドポイント が適しているか
  </Card>

  <Card title="Gemini キャッシュ課金ガイド" icon="database" href="/ja/api-capabilities/gemini/prompt-caching">
    暗黙的なキャッシュのしきい値と、期待すべき内容
  </Card>

  <Card title="Claude キャッシュ課金ガイド" icon="database" href="/ja/api-capabilities/claude-prompt-caching">
    cache\_control をどこに置くか、損益分岐点の計算、マルチターンのテクニック
  </Card>

  <Card title="モデル倍率" icon="calculator" href="/ja/faq/model-multiplier">
    コンソールのグループ倍率が USD 価格にどう換算されるか
  </Card>

  <Card title="コールログ" icon="file-text" href="/ja/faq/call-logs">
    リクエストごとの token 使用量とキャッシュ課金の詳細を確認する
  </Card>
</CardGroup>

## お問い合わせ

<CardGroup cols={2}>
  <Card title="WeComサポート" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeComサポートのQRコード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    スキャンして追加するか、[サポートに連絡](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    Cacheの課金に関する質問と技術サポート
  </Card>

  <Card title="メール" icon="mail">
    **サポート**: [support@apiyi.com](mailto:support@apiyi.com)

    **営業**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
