> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# クイックスタート

> APIYI を統合する方法は 2 通りあります。ドキュメントを AI コーディングエージェントに渡して作業させるか、3 つのステップでご自身で接続することができます。

<Note>
  新規アカウントには試用クレジットとして **\$0.05** が付与されるため、最初の呼び出しはチャージなしで行えます。`gpt-5.4-mini`のような軽量モデルであれば、統合が正常に動作していることを確認するには十分です。
</Note>

## 2つの道、ひとつを選ぶ

<CardGroup cols={2}>
  <Card title="AIに任せる" icon="bot" href="#let-an-ai-do-it">
    Codex、Claude Code、またはCursorに1つのpromptをコピーします。すると、docsを読み、コードを書き、実行してくれます。すでにコーディングエージェントを使っているなら、これが最適です。
  </Card>

  <Card title="自分でやる" icon="wrench" href="#do-it-yourself">
    登録し、キーを作成し、最初の呼び出しを行います。3ステップ、5分です。各要素を理解したいなら、これが最適です。
  </Card>
</CardGroup>

<Info>
  **両方の道は同じところから始まります**: アカウントを登録し、キーを自分で作成します。AIに任せられるのは、その後のすべてです — モデルを選ぶこと、base URLを正しく設定すること、サンプルを書くこと、そしてデバッグすることです。
</Info>

## AIに任せる

### エージェントにこのプロンプトを送る

<Prompt description="コーディングエージェントにAPIYIを自動で統合させます。Codex、Claude Code、Cursorなどのツールにコピーして貼り付けてください。" icon="bot" actions={["copy"]}>
  このプロジェクトにAPIYIを統合してください。

  1. まず統合ナレッジを読み込みます。`npx skills add https://docs.apiyi.com`
     を実行してAPIYIスキルをインストールしてください。このコマンドが動作しない場合は、
     [https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) を取得して全文を読んでください — 同じ内容です。
  2. さらに具体的な情報が必要な場合は、[https://docs.apiyi.com/llms.txt](https://docs.apiyi.com/llms.txt) でページを探してください。
     ドキュメントURLに`.md`を追加すると、HTMLをスクレイピングするよりはるかに少ないtokenでプレーンMarkdown版を取得できます。
  3. APIキーを尋ねてください（[https://api.apiyi.com/token](https://api.apiyi.com/token) からコピーします）。そしてAPIキーを`APIYI_API_KEY`環境変数に設定してください。**ハードコードしたり、gitにコミットしたりしないでください。**
  4. このプロジェクトで既に使用されているスタックを使い、最初はモデル`gpt-5.4-mini`で最小限の実行可能なサンプルを書いてください。ベースURLはSDKによって異なることに注意してください。OpenAI
     SDKでは`https://api.apiyi.com/v1`、Anthropic SDKではルートドメイン`https://api.apiyi.com`（/v1なし）、Google GenAI SDKではルート
     ドメインにapi\_versionとしてv1betaを設定します。
  5. 実際に実行してレスポンスを見せてください。動作したら、呼び出しにかかった費用と、実運用で切り替えるモデルを教えてください。
</Prompt>

### 実行される内容

<Steps>
  <Step title="スキルをインストールするか、skill.mdを直接読む">
    `https://docs.apiyi.com/skill.md`は、マシン向けに書かれた統合リファレンスです。エンドポイント、認証、モデル命名規則、既知の落とし穴、検証チェックリストが記載されています。これを読むことで、エージェントはAPIYIの統合に必要なすべての情報を得られます。
  </Step>

  <Step title="必要に応じてページを調べる">
    `llms.txt`は、このサイトにあるすべてのページのインデックスです。エージェントは関連するページを選び、`.md`を追加してプレーンテキストとして読み込みます。
  </Step>

  <Step title="コードを書いて実際に実行する">
    ドキュメントにあるPythonをそのままコピーするのではなく、プロジェクトで既に使用されている言語と依存関係でサンプルを書きます。呼び出しが成功するまで完了とはみなしません。
  </Step>
</Steps>

### AIに渡せる5つの入り口

| 入り口              | URL                                          | 使用するタイミング                                            |
| ---------------- | -------------------------------------------- | ---------------------------------------------------- |
| **スキル**          | `https://docs.apiyi.com/skill.md`            | 完全な統合リファレンスを一度にエージェントへ渡す場合。ここから始めてください。              |
| **ページインデックス**    | `https://docs.apiyi.com/llms.txt`            | エージェントに必要なページを選ばせる場合                                 |
| **テキスト形式の単一ページ** | ドキュメントURLに`.md`を追加                           | 1つのページだけが必要な場合 — HTMLより低コストです                        |
| **MCPサーバー**      | `https://docs.apiyi.com/mcp`                 | このドキュメントサイトをMCPサーバーとして接続し、エージェントがリアルタイムで検索できるようにする場合 |
| **モデルレジストリ**     | `https://docs.apiyi.com/model-registry.json` | 機械可読なモデルID、エンドポイント、グループ、定価を提供し、エージェントが推測するのを防ぐ場合     |

コーディングエージェント向けのスキル、CLI、コントラクト＋レジストリの方法は、[AI開発者キット](/ja/developer-kit)で説明しています。

<Tip>
  このページのプレーンテキスト版は、たとえば`https://docs.apiyi.com/en/getting-started.md`です。サイト上のすべてのページがこのサフィックスに対応しています。
</Tip>

### 任意のページをAIに直接送る

すべてのドキュメントページの右上には**ページをコピー**ボタンがあります。その横の矢印を開くと、さらに多くのオプションが表示されます。

<img src="https://mintcdn.com/apiyillc/pSJvB-WdRHZF62ww/images/contextual-menu-copy-page.png?fit=max&auto=format&n=pSJvB-WdRHZF62ww&q=85&s=34ae33d4f4555c0b9436364f12bab88b" alt="ドキュメントページ右上の「ページをコピー」メニュー。ページのコピー、Markdownとしての表示、ChatGPT、Claude、Perplexity、Google AI Studioで開くためのオプションがあります" width="648" height="694" data-path="images/contextual-menu-copy-page.png" />

| オプション                   | 内容                                                  |
| ----------------------- | --------------------------------------------------- |
| **ページをコピー**             | 現在のページをMarkdownとしてクリップボードにコピーします。任意のAIに貼り付ける準備が整います |
| **Markdownとして表示**       | ブラウザでプレーンテキスト版を開きます — リンクの確認や共有に便利です                |
| **ChatGPTで開く**          | このページをコンテキストとしてChatGPTを開きます                         |
| **Claudeで開く**           | Claudeで同様に開きます                                      |
| **Perplexityで開く**       | Perplexityで同様に開きます                                  |
| **Google AI Studioで開く** | Google AI Studioで同様に開きます                            |

特定のモデルで問題が発生した場合は、そのモデルのページを開いて**ページをコピー**を押し、エラーと一緒にAIへ送るのが最速の方法です。

## 自分で設定する

### ステップ1: 登録してキーを取得する

<Steps>
  <Step title="アカウントを作成する">
    [APIYI のウェブサイト](https://api.apiyi.com)にアクセスし、メールアドレスで登録して認証を完了してください（大学または企業のメールアドレスを推奨します）。その後、コンソールにサインインします。
  </Step>

  <Step title="APIキーを作成する">
    [tokenページ](https://api.apiyi.com/token)を開きます:

    1. **デフォルトの token** をコピーして、そのまま使用できます（右側のコピーアイコン）
    2. または右上の **新規** をクリックして作成し、名前を付け（たとえば `test-key`）、確認してください

    キーは `sk-` で始まります。詳細は [キーの作成方法](/ja/faq/token-management) をご覧ください。
  </Step>

  <Step title="残高が足りなくなったらチャージする">
    \$0.05 の試用クレジットがなくなったら、コンソールからチャージしてください。最低金額と精算ルールは決済方法によって異なります — [支払い方法](/ja/faq/payment-methods)をご覧ください — また、ボーナスポリシーは [チャージキャンペーン](/ja/faq/recharge-promotions) で案内しています。
  </Step>
</Steps>

### ステップ2: 接続情報を正しく設定する

**ベースURLはモデルではなくSDKに応じて選んでください。** これは最もよくある統合ミスです:

| お使いのSDK                        | ベースURL                     | 理由                                                                                |
| ------------------------------ | -------------------------- | --------------------------------------------------------------------------------- |
| OpenAI SDK（およびほとんどのクライアント）     | `https://api.apiyi.com/v1` | SDK が `/chat/completions` を自動で付加するため、`/v1` が必要です                                  |
| Anthropic SDK（Claude ネイティブ）    | `https://api.apiyi.com`    | SDK が `/v1/messages` を自動で付加します — **`/v1` を追加すると `/v1/v1/messages` になり、404 になります** |
| Google GenAI SDK（Gemini ネイティブ） | `https://api.apiyi.com`    | `api_version: "v1beta"` も設定してください                                                 |

<Warning>
  `base_url` の末尾にスラッシュを付けたままにしないでください — 二重スラッシュになり、404 になります。詳細とノード選択については [ベースURLの設定](/ja/faq/base-url-config) をご覧ください。
</Warning>

### ステップ3: 最初の呼び出しを行う

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.4-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import os
    from openai import OpenAI

    client = OpenAI(
        api_key=os.environ["APIYI_API_KEY"],
        base_url="https://api.apiyi.com/v1"
    )

    response = client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[
            {"role": "user", "content": "Hello!"}
        ]
    )

    print(response.choices[0].message.content)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    import OpenAI from 'openai';

    const openai = new OpenAI({
      apiKey: process.env.APIYI_API_KEY,
      baseURL: 'https://api.apiyi.com/v1'
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [{ role: 'user', content: 'Hello!' }]
    });

    console.log(response.choices[0].message.content);
    ```
  </Tab>

  <Tab title="Java">
    ```java theme={null}
    // Using the official OpenAI Java library
    OpenAiService service = new OpenAiService(
        System.getenv("APIYI_API_KEY"),
        Duration.ofSeconds(60),
        "https://api.apiyi.com/v1"
    );

    ChatCompletionRequest request = ChatCompletionRequest.builder()
        .model("gpt-5.4-mini")
        .messages(List.of(
            new ChatMessage(ChatMessageRole.USER, "Hello!")
        ))
        .build();

    ChatCompletionResult result = service.createChatCompletion(request);
    System.out.println(result.getChoices().get(0).getMessage().getContent());
    ```
  </Tab>
</Tabs>

<Warning>
  `gpt-5`シリーズ以上には、3つのパラメータ制限があります: `temperature`は1でなければならず、`max_completion_tokens`を`max_tokens`の代わりに使用し、`top_p`を送信しないでください。
</Warning>

## 次のステップ

<CardGroup cols={2}>
  <Card title="Claude Code を接続する" icon="terminal" href="/ja/scenarios/programming/claude-code">
    `ANTHROPIC_BASE_URL` を設定し、APIYI 経由で Claude Code を操作します
  </Card>

  <Card title="Codex を接続する" icon="square-terminal" href="/ja/scenarios/programming/codex-cli">
    1 つの `config.toml` で、デスクトップアプリ、IDE プラグイン、CLI をカバーします
  </Card>

  <Card title="モデル一覧を確認する" icon="bot" href="/ja/api-capabilities/model-info">
    対応しているすべてのモデルと、機能早見表です
  </Card>

  <Card title="API マニュアルを読む" icon="book" href="/ja/api-manual">
    エンドポイントの完全リファレンス、エラーコード、デバッグ
  </Card>
</CardGroup>

## よくある質問

### モデルを切り替えるにはどうすればよいですか？

リクエスト内の `model` パラメータを変更するだけです：

```json theme={null}
{
  "model": "gpt-5.6-sol",         // Use GPT-5.6 Sol
  "model": "claude-opus-5",       // Use Claude Opus 5
  "model": "gemini-3.6-flash"     // Use Gemini 3.6 Flash
}
```

<Warning>
  **モデル ID ではドットを使用し、ハイフンは使いません。** ドキュメント URL のハイフンは、URL の安全性のための置換です。実際のモデル ID ではドットがそのまま使われます。ページ `/models/qwen3-7-max` はモデル ID `qwen3.7-max` に対応します。`gpt-5-4-mini` と書くと 404 が返ります — 正しい形式は `gpt-5.4-mini` です。

  迷ったときは、一覧で確認してください: `GET https://api.apiyi.com/v1/models`。
</Warning>

### どのプログラミング言語がサポートされていますか？

APIYI は OpenAI API 標準と互換性があり、OpenAI SDK がサポートするすべての言語に対応しています：

* Python
* JavaScript/TypeScript
* Java
* C#/.NET
* Go
* Ruby
* PHP
* など...

### 残高を確認するにはどうすればよいですか？

[コンソール](https://api.apiyi.com/account/profile) にサインインして、以下を確認できます：

* アカウント残高
* 利用履歴
* 消費統計

API からプログラムで問い合わせることもできます：

* [残高照会 API](/ja/api-capabilities/balance-query): API でアカウント残高、有効期限などを取得できます
* [残高アラート設定](/ja/faq/balance-alerts): 残高が少なくなったら自動通知し、サービスの中断を防ぎます

### 問題が発生した場合はどうすればよいですか？

1. 問題のあるページを開き、右上の **Copy page** を押して、エラーと一緒に AI に送ってください
2. [API マニュアル](/ja/api-manual) を確認してください
3. [よくあるエラー](/ja/faq/invalid-api-key) を確認してください
4. サポートにお問い合わせください: [support@apiyi.com](mailto:support@apiyi.com)

<Info>
  ヒント: APIキーは安全に保管し、コンソールで使用ログを定期的に確認してください。各リクエストには、コスト最適化のためのメッセージ履歴があります。
  どうぞご利用ください！
</Info>
