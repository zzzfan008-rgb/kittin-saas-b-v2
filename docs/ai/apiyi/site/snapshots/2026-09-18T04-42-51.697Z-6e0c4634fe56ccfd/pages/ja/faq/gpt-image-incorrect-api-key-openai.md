> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image の Codex 統合が誤った API キーで失敗する

> Codex が OpenAI にアクセスする gpt-image-2.5 のコードを記述するため、APIYI のキーが拒否されます。Skills、モデルページのプロンプト、またはウェブ画像ツールを使って修正できます。

## エラー

```text theme={null}
Authentication failed
Incorrect API key provided: sk-xxxx****************************A6Af.
You can find your API key at https://platform.openai.com/account/api-keys.
(Request ID: req_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
```

<Info>
  **一言で言うと**：このエラーはAPIYIではなく、**OpenAI独自のサーバー**によって返されています。現在、コードは`api.openai.com`を呼び出しているため、OpenAIがAPIYIキーを拒否しています。**キーは問題ありません。リクエストアドレスが間違っています。**
</Info>

## リクエストがAPIYIに到達していないことを見分ける方法

次の2つの兆候のいずれかがあれば、結論は明確です。

| 兆候                                                 | 意味                                                                          |
| -------------------------------------------------- | --------------------------------------------------------------------------- |
| エラーで `platform.openai.com/account/api-keys` に誘導される | これはOpenAIの標準的な`invalid_api_key`テキストです。APIYIのエラーでOpenAIのウェブサイトに誘導されることはありません |
| リクエストIDが `req_` で始まる32文字の文字列である                    | OpenAIのリクエストID形式です。リクエストはAPIYIに到達していないため、APIYIのログには表示されません                  |

<Note>
  これは、AIコーディングアシスタントに統合コードの作成を依頼した場合に特によく起こります。Codex、Cursor、Claude Codeなどはモデル名 `gpt-image-2.5` を確認すると、デフォルトで公式のOpenAI SDKパターンを使用し、`base_url` をSDKのデフォルト値 `https://api.openai.com/v1` のままにします。貼り付けたキーはAPIYIのものです。この2つは一致しません。
</Note>

## 状況に応じて選べる3つの解決策

<Tabs>
  <Tab title="① Codex / コーディングエージェントを使用する場合：スキルをインストールする">
    最も手間がかからない方法は、コードを書く前にエージェントにAPIYIを「学習」させることです。スキルパックは2段階で利用できます。

    <Steps>
      <Step title="サイト全体用スキルパック（最初にインストール）">
        エージェントに以下のコマンドを実行させて、APIYIスキルパックをインストールします。失敗した場合は、`https://docs.apiyi.com/skill.md`を直接読むよう指示してください。

        ```bash theme={null}
        npx skills add https://docs.apiyi.com
        ```

        このファイルはAI向けに作成されており、ベースURL、認証、モデルの命名規則、よくある落とし穴が記載されています。インストールすると、エージェントが作成するコードは自動的に`base_url`を`https://api.apiyi.com/v1`に向けるようになります。
      </Step>

      <Step title="GPT-Image専用スキル">
        [GPT-Image-2.5 / 2 シリーズ・エージェントスキル](/ja/api-capabilities/gpt-image-2/skills)のページには、すぐに使えるスキルが用意されています。2つのファイルと1つのスクリプトで、`gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2`を含む6つのモデルに対応し、`--model`で切り替えられます。テキストから画像への変換、複数画像の融合、インペインティングがすべて含まれています。

        これをCodex、OpenClaw、Claude Code、またはシェルコマンドを実行できる任意のコーディングエージェントに配置し、「…の画像を生成して」と言うだけです。ベースURLを自分で変更する必要はありません。
      </Step>
    </Steps>

    <Tip>
      その他の画像モデルや動画モデルにも、それぞれの「エージェントスキル」ページがあります。各モデルのドキュメントフォルダーに掲載されています。左側のナビゲーションでモデルを見つけ、「エージェントスキル」という名前のサブページを探してください。
    </Tip>
  </Tab>

  <Tab title="② コーダーではない場合：プロンプトをAIに渡す">
    スキルとは何かを学びたくない場合は、すぐに使える**統合プロンプト**をCodex、Claude Code、Cursor、または任意のAIアシスタントにコピーしてください。

    1. [GPT-Image-2.5 / 2 概要](/ja/api-capabilities/gpt-image-2/overview)を開きます
    2. 「AIエージェントに統合を任せる」セクションを見つけ、プロンプトのコピーボタンをクリックします
    3. そのままAIコーディングアシスタントに貼り付けます

    このプロンプトには`base_url`が`https://api.apiyi.com/v1`としてあらかじめ設定されており、`APIYI_API_KEY`環境変数からキーを読み込みます。また、タイムアウト、base64の表示、アップロード時の圧縮、品質パラメーターに関する一般的な落とし穴にもあらかじめ対処しています。AIはまずドキュメントページのプレーンテキスト版を取得し（任意のドキュメントURLに`.md`を追加します）、その後、プロジェクトの技術スタック向けにコードを作成します。

    <Note>
      GPT-Imageだけでなく、すべての画像モデルおよび動画モデルの概要ページに、このようなプロンプトが用意されています。より一般的な3つの方法（チャットエージェント、CLI、コーディングエージェント）については、[AI開発キット](/ja/developer-kit)を参照してください。
    </Note>
  </Tab>

  <Tab title="③ 統合が不要な場合：ウェブ上で生成する">
    画像だけが必要で、まだ自分のプログラム内で使用する必要がない場合は、コードを完全に省略できます。

    1. APIYIコンソールの「Tokens」ページからキーをコピーします
    2. `imagen.apiyi.com`を開き、キーを貼り付けます
    3. `gpt-image-2.5-flare`（テキストから画像への変換）または`gpt-image-2.5-sunburst`（編集）を選択して生成します

    ウェブツールでは同じキーと同じAPIが使用され、同じアカウントの残高に対して課金されます。後でアプリ内で使用する必要が生じたら、最初の2つの方法に戻ってください。
  </Tab>
</Tabs>

## 自分で修正する：1行

すでに Codex で生成されたコードがある場合、最小限の変更はクライアントに `base_url` を追加することです。それ以外はすべてそのままにしてください：

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="sk-your-apiyi-key",
      base_url="https://api.apiyi.com/v1",  # ← add this line
  )

  result = client.images.generate(
      model="gpt-image-2.5-flare",
      prompt="A shiba inu wearing an astronaut helmet, cyberpunk style",
      size="1024x1024",
      quality="medium",
  )
  ```

  ```javascript Node.js theme={null}
  import OpenAI from "openai";

  const client = new OpenAI({
    apiKey: "sk-your-apiyi-key",
    baseURL: "https://api.apiyi.com/v1", // ← add this line
  });

  const result = await client.images.generate({
    model: "gpt-image-2.5-flare",
    prompt: "A shiba inu wearing an astronaut helmet, cyberpunk style",
    size: "1024x1024",
    quality: "medium",
  });
  ```

  ```bash 環境変数 theme={null}
  # Override the SDK default without touching code
  export OPENAI_API_KEY="sk-your-apiyi-key"
  export OPENAI_BASE_URL="https://api.apiyi.com/v1"
  ```
</CodeGroup>

次に、リクエストが実際に APIYI に到達していることを確認します。レスポンスにモデル一覧が含まれていれば完了です：

```bash theme={null}
curl https://api.apiyi.com/v1/models \
  -H "Authorization: Bearer sk-your-apiyi-key"
```

## フォローアップの質問

<AccordionGroup>
  <Accordion title="base_url を変更したのに同じエラーが発生します。なぜですか？">
    次の順番で確認してください。

    1. **複数の設定場所**: Codex が生成したプロジェクトでは、URL が `.env`、設定ファイル、クライアントコンストラクターに設定されていることがよくあります。1か所を変更しても、他の場所はデフォルトのままです
    2. **環境変数の優先順位**: システム上ですでに `OPENAI_BASE_URL` が別の値に設定されている場合、コードで省略した設定よりも優先されます。確認するには `echo $OPENAI_BASE_URL` を実行してください
    3. **再起動していない**: 実行中のプロセスには古い設定が保持されたままです
    4. **スペル**: `apiyi` であり、`apiyii` や `apiyl` ではありません

    最も簡単な証明は、エラーテキストそのものです。`platform.openai.com` が表示され続ける限り、リクエストは引き続き OpenAI に送信されています。
  </Accordion>

  <Accordion title="Codex はすでに APIYI に切り替えたと言っていますが、エラーが変わりません。">
    このページと一緒に、正確なエラーを送信してください。すべてのドキュメントページの右上には「ページをコピー」ボタンがあります。ページの内容とエラーを AI に貼り付ければ、どの設定が反映されていないのかを特定できます。これが最も迅速なトラブルシューティング方法です。
  </Accordion>

  <Accordion title="リクエストが APIYI に到達した後もキーが拒否される場合はどうすればよいですか？">
    その場合に限り、キー自体を確認してください。コンソールで「Tokens」ページを開き、キーが有効になっていること、残高が十分であること、モデルの許可リストによるブロックがないことを確認します。完全なチェックリストは [API Key が無効なのはなぜですか？](/ja/faq/invalid-api-key) にあります。
  </Accordion>

  <Accordion title="gpt-image-2.5 にはどのモデル名を使用すればよいですか？">
    テキストから画像への変換には `gpt-image-2.5-flare`、編集とインペインティングには `gpt-image-2.5-sunburst` をデフォルトで使用してください。どちらも同じ価格とパラメータを共有しています。大量かつ低コストの処理には、逆方向のチャネルである `gpt-image-2.5-all` を使用してください。[GPT-Image シリーズ Agent Skill](/ja/api-capabilities/gpt-image-2/skills) ページの比較表に、6つすべてがまとめられています。
  </Accordion>
</AccordionGroup>

## 関連

<CardGroup cols={2}>
  <Card title="API Keyが無効なのはなぜですか？" icon="key" href="/ja/faq/invalid-api-key">
    ベースURLとキーを一致させる必要がある理由を、各言語の例とともに説明します。
  </Card>

  <Card title="ベースURLの設定方法" icon="link" href="/ja/faq/base-url-config">
    OpenAIの場合は/v1、Claudeの場合はルートドメイン、Geminiの場合は/v1betaです。
  </Card>

  <Card title="ワンクリック統合に対応していますか？" icon="plug" href="/ja/faq/one-click-integration">
    ドキュメントをAIコーディングアシスタントに渡すだけで、統合を任せられます。
  </Card>

  <Card title="GPT-Image-2.5 / 2の概要" icon="sparkles" href="/ja/api-capabilities/gpt-image-2/overview">
    パラメータ、料金、統合用プロンプト、よくあるエラーについて説明します。
  </Card>
</CardGroup>
