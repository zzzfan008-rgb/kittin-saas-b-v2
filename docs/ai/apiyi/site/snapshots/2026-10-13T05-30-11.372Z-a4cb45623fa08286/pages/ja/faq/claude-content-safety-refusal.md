> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# なぜClaudeの拒否応答は空のコンテンツを返すのですか？

> Claudeがプロバイダーのセーフティポリシーに抵触した場合、エラーは発生せず、HTTP 200、空のコンテンツ、および拒否カテゴリを伴う stop_reason: refusal が返されます。本ページでは、各API形式の出力、課金ルール、およびその検出方法について説明します。

## 簡潔な回答

リクエストがプロバイダーの安全性ポリシーに抵触した場合、Claude は**エラーを返しません**。API は引き続き HTTP 200 を返しますが、以下のようになります。

* `content` は**空の配列** `[]` となり、`output_tokens` は `0` になります。
* `stop_reason` は `refusal` になります。
* `stop_details` には拒否**カテゴリ**（例えば `cyber`）が示され、短い英語の説明が含まれます。

これはモデルの挙動であり、API の障害ではありません。`message.content[0]` を直接読み取るコードは `IndexError` を発生させます。OpenAI 互換フォーマットでは空の文字列が返され、`finish_reason` は `refusal` になります。

拒否の応答は通常1〜2秒以内に返されます。課金されるかどうかはカテゴリによって異なります。**`cyber` カテゴリ（およびその他の一部のカテゴリ）では、出力が行われる前の拒否は課金されません** — 詳細は後述の「課金ルール」をご参照ください。

## 拒否（Refusal）時のレスポンス例

以下は、サイバー関連の拒否（cyber refusal）をトリガーする同一のリクエストを、4つの方法で呼び出した例です（2026-09-29測定、IDはマスク処理済み）：

<Tabs>
  <Tab title="ネイティブ · 非ストリーミング">
    `POST /v1/messages`、`stream: false`：

    ```json theme={null}
    {
      "id": "msg_xxxxxxxx",
      "type": "message",
      "role": "assistant",
      "model": "claude-sonnet-5",
      "content": [],
      "stop_reason": "refusal",
      "stop_sequence": null,
      "stop_details": {
        "type": "refusal",
        "category": "cyber",
        "explanation": "This request triggered cyber-related safeguards. To learn about the Cyber Verification Program and apply for access, visit our help center: ..."
      },
      "usage": {
        "input_tokens": 2863,
        "output_tokens": 0,
        "cache_creation_input_tokens": 0,
        "cache_read_input_tokens": 0
      }
    }
    ```
  </Tab>

  <Tab title="ネイティブ · ストリーミング">
    `POST /v1/messages`、`stream: true`。**`content_block_*`イベントは一切発生しません** — `message_start`の直後に拒否情報を含む`message_delta`が続きます：

    ```text theme={null}
    event: message_start
    data: {"type":"message_start","message":{"id":"msg_xxxxxxxx","content":[],"stop_reason":null,"stop_details":null,"usage":{"input_tokens":2863,"output_tokens":0}, ...}}

    event: message_delta
    data: {"type":"message_delta","delta":{"stop_reason":"refusal","stop_sequence":null,"stop_details":{"type":"refusal","category":"cyber","explanation":"This request triggered cyber-related safeguards. ..."}},"usage":{"input_tokens":2863,"output_tokens":0}}

    event: message_stop
    data: {"type":"message_stop"}
    ```
  </Tab>

  <Tab title="OpenAI互換 · 非ストリーミング">
    `POST /v1/chat/completions`。`content`は空文字列、`finish_reason`は`refusal`となり、**拒否カテゴリは存在しません**：

    ```json theme={null}
    {
      "id": "msg_xxxxxxxx",
      "object": "chat.completion",
      "model": "claude-sonnet-5",
      "choices": [
        {
          "index": 0,
          "message": { "role": "assistant", "content": "" },
          "finish_reason": "refusal"
        }
      ],
      "usage": { "prompt_tokens": 2863, "total_tokens": 2863 }
    }
    ```
  </Tab>

  <Tab title="OpenAI互換 · ストリーミング">
    `POST /v1/chat/completions`、`stream: true`。空の`delta`のみで、1つのチャンクで`finish_reason`が`refusal`に設定されています：

    ```text theme={null}
    data: {"object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":""}}]}

    data: {"object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"refusal"}]}

    data: [DONE]
    ```
  </Tab>
</Tabs>

| フィールド | 拒否時 |
| - | - |
| HTTPステータス | `200`、エラーではありません |
| `content` | ネイティブ形式では空の配列`[]`、OpenAI互換形式では空文字列`""` |
| `stop_reason` / `finish_reason` | `refusal` |
| `stop_details` | ネイティブ形式のみ：`type`、`category`（拒否カテゴリ）、`explanation`（英語テキスト） |
| `usage` | 入力tokensは通常通りカウントされ、`output_tokens`は0になります（カウントと課金は同一ではありません — 詳細は後述） |
| レイテンシ | 通常1〜2秒で、通常の回答よりも大幅に高速です |

<Note>
  拒否は**ストリーミングの途中**にも発生する可能性があります。テキストの一部が先にストリーミングされ、その後レスポンスが`stop_reason: "refusal"`で終了します。この部分的な出力は不完全であるため、破棄する必要があります。
</Note>

## 拒否カテゴリ

`stop_details.category` には現在、5つの値があります：

| カテゴリ | 意味 |
| - | - |
| `cyber` | マルウェアやエクスプロイトの開発など、サイバー上の危害を可能にする恐れがあります。善意のセキュリティ業務でもトリガーされることがあります |
| `bio` | 生物学的な危害を可能にする恐れがあります。有益な生命科学の取り組みでもトリガーされることがあります |
| `frontier_llm` | 競合するAIモデルの開発を支援する恐れがあります（プロバイダーの商用利用規約によって制限されています） |
| `reasoning_extraction` | 回答内でモデル自身の内部推論を再現するよう要求しています |
| `general_harms` | 上記の4つのカテゴリ以外の利用ポリシー領域 |

拒否が名前付きカテゴリにマッピングされない場合、`category` と `explanation` の両方が `null` になります — これは正常な値です。`explanation` のテキストは随時変更される可能性があるため、表示のみを行い、**文字列マッチングには使用しないでください**。

## よくあるトリガー

`category: "cyber"` は、開発者が最も頻繁に遭遇するものです。Claude にはサイバーセキュリティのリクエストに対するリアルタイムのセーフガードが備わっており、以下のタスクはすべてこれをトリガーする可能性があります:

* コード内のバグの検出、コードに「脆弱性がある」かどうかの判定、または脆弱性の種類（CWE）の特定をモデルに依頼すること
* エクスプロイトコードの作成や補完、またはペネトレーションテストの手順の作成
* 悪意のあるコードの解析や書き換え

<Warning>
  **バッチ評価とデータセットの蒸留が最も影響を受けます。** 脆弱性データセット全体をモデルで1件ずつ処理すると、かなりの割合のサンプルが拒否されることがよくあります。`content[0]` が常に存在することを前提としたスクリプトは、拒否された項目でクラッシュするため、「API が時々しか動作しない」ように見えてしまいます。
</Warning>

## 課金ルール

プロバイダーの規則に基づきます（2026年9月現在。プロバイダーが誤検知率を測定しながら調整する可能性があります）：

| 拒絶が発生したタイミングとそのカテゴリ | 課金 |
| - | - |
| 出力前、カテゴリ`cyber`、`general_harms`、または`null` | **課金なし** |
| 出力前、カテゴリ`bio`、`frontier_llm`、または`reasoning_extraction` | 入力 token は課金対象 |
| ストリーミング途中（任意のカテゴリ） | 入力 token と、すでにストリーミングされた出力が課金対象 |

課金の有無にかかわらず、拒絶されたリクエストもレート制限にカウントされます。`usage`には引き続き token 数が表示されますが、これはカウントであり、必ずしも課金されるとは限りません。

## 検知と処理の方法

<Steps>
  <Step title="コンテンツを読み取る前に stop_reason を確認する">
    ネイティブ形式では `stop_reason == "refusal"` を確認し、OpenAI 互換形式では `finish_reason == "refusal"` を確認します。拒絶を除外した後にのみ `content` を読み取ります。
  </Step>

  <Step title="拒絶を結果タイプとして記録する">
    拒絶は呼び出しの成功であり、ネットワークエラーではありません。評価作業では、リトライ対象の失敗としてカウントするのではなく、`stop_details.category` とともに「refused」として個別に記録します。
  </Step>

  <Step title="同じコンテンツをリトライしない">
    同じコンテンツを再送信しても通常は同じ拒絶が発生し、レート制限を消費し続け、一部のカテゴリでは毎回課金されます。
  </Step>

  <Step title="マルチターン会話でコンテキストをリセットする">
    ターンが拒絶された後は、続行する前にそのターンを削除または書き直すか、履歴をクリアしてください。リセットしないと、以降のリクエストも拒絶され続けます。
  </Step>

  <Step title="どのコンテンツが拒絶されたかを確認する">
    拒絶を `category` ごとにグループ化してどのタスクが拒絶をトリガーしたかを確認し、そのコンテンツを別のモデルに送信するかどうかを決定します。
  </Step>
</Steps>

<Tabs>
  <Tab title="Anthropic SDK">
    ```python theme={null}
    import os
    import anthropic

    client = anthropic.Anthropic(
        api_key=os.environ["APIYI_API_KEY"],
        base_url="https://api.apiyi.com",
    )

    def ask(prompt, model="claude-sonnet-5"):
        message = client.messages.create(
            model=model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        if message.stop_reason == "refusal":
            details = getattr(message, "stop_details", None)
            category = getattr(details, "category", None) if details else None
            return {"refused": True, "category": category, "request_id": message.id}

        text = "".join(b.text for b in message.content if b.type == "text")
        return {"refused": False, "text": text}
    ```
  </Tab>

  <Tab title="OpenAI SDK">
    ```python theme={null}
    import os
    from openai import OpenAI

    client = OpenAI(
        api_key=os.environ["APIYI_API_KEY"],
        base_url="https://api.apiyi.com/v1",
    )

    def ask(prompt, model="claude-sonnet-5"):
        resp = client.chat.completions.create(
            model=model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        choice = resp.choices[0]
        if choice.finish_reason == "refusal" or not choice.message.content:
            return {"refused": True, "request_id": resp.id}
        return {"refused": False, "text": choice.message.content}
    ```
  </Tab>
</Tabs>

<Tip>
  拒絶の**カテゴリ**が必要な場合は、ネイティブの `/v1/messages` 形式を呼び出してください。OpenAI 互換形式では `finish_reason: "refusal"` のみが保持され、`stop_details` はありません。
</Tip>

## 正当なセキュリティ研究についてはどうですか？

拒否テキストに記載されている **Cyber Verification Program（サイバー検証プログラム）** は、正当なセキュリティ業務を対象としたプロバイダーの無料申請プログラムです。本人確認後、エクスプロイトや攻撃ツールの開発などの「高リスクなデュアルユース」タスクの制限が緩和される場合があります。ランサムウェアの開発や大量のデータ持ち出しなどの「禁止された用途」は、いかなる場合でもブロックされます。

本プログラムは、**組織の管理者がプロバイダーのファーストパーティアカウントから申請します**。サードパーティプラットフォームについて、プロバイダーは「すべてのプラットフォームが参加しているわけではない」と明記しており、現在 APIYI では本プログラムへのアクセスを提供していません。

そのため、APIYI を経由して呼び出す際、拒否されたサンプルについては以下のように対応してください。

* 評価結果にカテゴリ別に分類し、ありのまま「拒否」として記録する。
* または、そのコンテンツを別のモデルで処理する。

APIYI はプロバイダーのセーフティポリシーを調整することはできず、また調整することもありません。

## OpenAIの拒否との違い

| | Claude | OpenAI（GPTシリーズ） |
| - | - | - |
| HTTPステータス | 200 | 200 |
| ボディ | 空（`content: []`） | `I can't help with that…`などの1行の拒否 |
| 終了理由 | `refusal` | `stop`（通常の回答と同じ） |
| 拒否カテゴリ | あり、`stop_details.category` | なし |
| 課金 | `cyber`およびその他一部のカテゴリにおける出力前の拒否は課金されません | 拒否テキストに対して通常どおり課金されます |
| 検出 | `stop_reason`を確認するだけ | テキスト自体からのみ |

OpenAIの拒否がどのようなものかについては、[OpenAIモデルの拒否はどのようなものですか？](/ja/faq/openai-content-safety-refusal) を参照してください。

## よくある質問

<AccordionGroup>
  <Accordion title="拒否された場合、課金されますか？">
    カテゴリとタイミングによって異なります。`cyber`、`general_harms`、または`null`における出力前の拒否は課金されません。`bio`、`frontier_llm`、および`reasoning_extraction`では入力分が課金されます。ストリーミング途中の拒否では、入力分に加えてすでにストリーミングされた出力分が課金されます。詳細は上記の「課金ルール」を参照してください。
  </Accordion>

  <Accordion title="拒否を無効にすることはできますか？">
    いいえ、できません。拒否はプロバイダーのモデルが自身の安全ポリシーに基づいて判断するため、APIYIが無効化したり、その厳格さを変更したりすることはできません。拒否されたコンテンツは拒否結果として記録するか、別のモデルで処理してください。
  </Accordion>

  <Accordion title="同じデータセット内で一部のサンプルが拒否され、他が拒否されないのはなぜですか？">
    セーフガードは各リクエストの内容を個別に判定します。コードスニペット自体やpromptの言い回しの双方が結果に影響を与えるため、通常はデータセットの一部のみが拒否されます。弊社のテストでは、拒否された同一のサンプルを再送信した場合でも一貫した結果が得られました。
  </Accordion>

  <Accordion title="拒否された際、usageのoutput_tokensが0になるのはなぜですか？">
    モデルが生成を開始する前に停止したため、出力は0となり、入力のみがカウントされます。これは拒否と`max_tokens`による中断を区別する方法でもあります。後者では`stop_reason: "max_tokens"`となり、出力tokensが設定した制限値と一致します。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Claude のレスポンス処理" icon="braces" href="/ja/api-capabilities/claude-response-handling">
    ストリーミングおよび非ストリーミングのレスポンス構造、stop\_reason の値
  </Card>

  <Card title="OpenAI モデルの拒否とはどのようなものですか？" icon="message-square-x" href="/ja/faq/openai-content-safety-refusal">
    GPT による拒否の挙動とその検出方法
  </Card>

  <Card title="コンテンツの安全性とコンプライアンスはどのように確保されていますか？" icon="shield-check" href="/ja/faq/content-safety">
    プラットフォームのコンテンツ安全性とコンプライアンスポリシー
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.