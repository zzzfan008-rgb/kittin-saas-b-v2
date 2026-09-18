> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Anthropic ネイティブ設定

> OpenClaw を anthropic-messages API タイプで設定し、安定したツール呼び出しと Claude 専用機能を利用します

## Anthropic ネイティブモードを選ぶ理由

OpenClaw は Claude モデルを呼び出す方法を 2 つサポートしています。**tool 呼び出し (tool\_use)** やその他の高度な機能が必要な場合は、Anthropic ネイティブモード (`anthropic-messages`) を強く推奨します:

| シナリオ                | OpenAI 互換モード     | Anthropic ネイティブモード  |
| ------------------- | ---------------- | ------------------- |
| 基本チャット              | ✅ 動作します          | ✅ 動作します             |
| ツール呼び出し (tool loop) | ❌ 400 を返す場合があります | ✅ 安定                |
| プロンプトキャッシュ          | ❌ 非対応            | ✅ 対応                |
| マルチモデル切り替え          | ✅ 400+ モデル       | ⚠️ Claude series のみ |

<Info>
  `openai-completions` では、基本チャットは問題なく動作しますが、マルチターンのツール呼び出し (tool\_calls → tool\_result → tool loop) は 400 エラーで拒否される場合があります。`anthropic-messages` に切り替えると、`tool_use` + `tool_result` 形式が正しく動作します。
</Info>

## 推奨構成

`~/.openclaw/openclaw.json` を編集し、次のプロバイダー設定を追加してください:

```json theme={null}
{
  "models": {
    "providers": {
      "apiyi": {
        "baseUrl": "https://api.apiyi.com",
        "apiKey": "sk-your-apiyi-key",
        "api": "anthropic-messages",
        "headers": {
          "anthropic-version": "2023-06-01",
          "anthropic-beta": ""
        },
        "models": [
          {
            "id": "claude-sonnet-4-6",
            "name": "Claude Sonnet 4",
            "reasoning": false,
            "contextWindow": 200000,
            "maxTokens": 16384
          },
          {
            "id": "claude-opus-4-6",
            "name": "Claude Opus 4",
            "reasoning": false,
            "contextWindow": 200000,
            "maxTokens": 16384
          }
        ]
      }
    }
  }
}
```

### 重要な設定上の注意

<Warning>
  次の3点は**必ず**正しく設定してください。そうしないと、400エラーが発生します:

  1. **`baseUrl` の `/v1` なし**: `https://api.apiyi.com` にする必要があります。`/v1` を追加すると `.../v1/v1/messages` となり、リクエストが失敗します
  2. **`headers` に `anthropic-version` を含める必要があります**: `2023-06-01` に設定します
  3. **`anthropic-beta` を空文字列に設定**: ベータ機能のヘッダーを無効にし、未対応の機能をトリガーしないようにします
</Warning>

### `reasoning: false`について

<Warning>
  APIYI の Claude モデルは、リクエストに thinking 関連フィールド（`thinking` / `output_config`）が含まれていると **400エラーを返します**。

  モデルエントリで `"reasoning": false` を設定すると、OpenClaw が thinking フィールドを送信しなくなり、この問題を回避できます。
</Warning>

## モデルの許可リスト設定

モデルを`agents.defaults.models`に追加してください。そうしないと、OpenClaw がモデルを「未登録」と報告し、別のモデルへ黙ってフォールバックする場合があります:

```json theme={null}
{
  "agents": {
    "defaults": {
      "model": { "primary": "apiyi/claude-sonnet-4-6" },
      "models": {
        "apiyi/claude-sonnet-4-6": { "streaming": false },
        "apiyi/claude-opus-4-6": { "streaming": false }
      }
    }
  }
}
```

## OpenAI Compatible Mode との比較

| 機能         | OpenAI Compatible Mode     | Anthropic Native Mode        |
| ---------- | -------------------------- | ---------------------------- |
| API の種類    | `openai-completions`       | `anthropic-messages`         |
| baseUrl    | `https://api.apiyi.com/v1` | `https://api.apiyi.com`      |
| 対応モデル      | 全 400 以上のモデル               | Claude シリーズのみ                |
| ツール呼び出し    | 不安定（複数ターンでは 400 になる場合あり）   | 安定                           |
| プロンプトキャッシュ | 非対応                        | 対応                           |
| 拡張コンテキスト   | モデルに依存                     | 最大 200K tokens               |
| 最適な用途      | 複数モデルの切り替え、基本的なチャット        | Claude の高度な利用、Agent のツール呼び出し |

## Claude モデル ID 一覧

| モデル ID                      | 名前               | 説明                           |
| --------------------------- | ---------------- | ---------------------------- |
| `claude-sonnet-4-6`         | Claude Sonnet 4  | バランスの取れたパフォーマンスで、日常利用におすすめです |
| `claude-opus-4-6`           | Claude Opus 4    | 最も強力な推論能力                    |
| `claude-haiku-4-5-20251001` | Claude Haiku 4.5 | 高速な応答、コスト効率に優れています           |

## 混合設定（推奨）

OpenAI互換とAnthropicネイティブの両方のプロバイダーを設定し、必要に応じて切り替えます:

```json theme={null}
{
  "agents": {
    "defaults": {
      "model": { "primary": "apiyi-claude/claude-sonnet-4-6" },
      "models": {
        "apiyi-claude/claude-sonnet-4-6": { "streaming": false },
        "apiyi-claude/claude-opus-4-6": { "streaming": false }
      }
    }
  },
  "models": {
    "providers": {
      "apiyi": {
        "baseUrl": "https://api.apiyi.com/v1",
        "apiKey": "sk-your-apiyi-key",
        "api": "openai-completions",
        "models": [
          { "id": "gpt-5.4", "name": "GPT-5.4" },
          { "id": "deepseek-v3.2", "name": "DeepSeek V3.2" }
        ]
      },
      "apiyi-claude": {
        "baseUrl": "https://api.apiyi.com",
        "apiKey": "sk-your-apiyi-key",
        "api": "anthropic-messages",
        "headers": {
          "anthropic-version": "2023-06-01",
          "anthropic-beta": ""
        },
        "models": [
          {
            "id": "claude-sonnet-4-6",
            "name": "Claude Sonnet 4",
            "reasoning": false,
            "contextWindow": 200000,
            "maxTokens": 16384
          },
          {
            "id": "claude-opus-4-6",
            "name": "Claude Opus 4",
            "reasoning": false,
            "contextWindow": 200000,
            "maxTokens": 16384
          }
        ]
      }
    }
  }
}
```

チャットでは `/model apiyi/gpt-5.4` または `/model apiyi-claude/claude-sonnet-4-6` を使ってモデルを切り替えます。

## 設定を確認する

セットアップ後、設定が正しく動作していることを確認します。

```bash theme={null}
{/* Check model status */}
openclaw models status

{/* Send a test message and check the returned provider/model */}
openclaw agent --message "just reply pong" --json
```

返された JSON で、`meta.agentMeta.provider` と `meta.agentMeta.model` が設定と一致していることを確認してください。

## トラブルシューティング

<AccordionGroup>
  <Accordion title="400 ValidationException: 操作は許可されていません">
    これは通常、リクエスト内の推論関連フィールドが原因です。次を確認してください:

    * モデルエントリに `"reasoning": false` が設定されている
    * ヘッダーに `"anthropic-beta": ""` が正しく設定されている
  </Accordion>

  <Accordion title="設定は変更されたのに反映されない">
    既存のチャットセッションが古いモデル設定をキャッシュしている可能性があります。対処法は 2 つあります:

    セッションのモデルをパッチする:

    ```bash theme={null}
    openclaw gateway call sessions.patch \
      --params '{"key":"your-session-key","model":"apiyi-claude/claude-sonnet-4-6"}'
    ```

    または、セッションをリセットする:

    ```bash theme={null}
    openclaw gateway call sessions.reset \
      --params '{"key":"your-session-key","reason":"reset"}'
    ```
  </Accordion>

  <Accordion title="モデルが別のモデルに黙ってフォールバックされる">
    モデルが `agents.defaults.models` の許可リストに追加されているか確認してください。未登録のモデルは OpenClaw によって自動的にフォールバックされます。
  </Accordion>

  <Accordion title="baseUrl のパス重複エラー">
    Anthropic のネイティブモード `baseUrl` には `/v1` を含めてはいけません。`https://api.apiyi.com/v1` を使用すると `.../v1/v1/messages` となり、404 エラーの原因になります。
  </Accordion>
</AccordionGroup>
