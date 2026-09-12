> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 公式WebアプリとAPIで結果が異なるのはなぜですか？

> 同じモデルなのに、なぜClaude.aiやChatGPTのほうが賢く感じるのでしょうか？ Webアプリが追加するエンジニアリング層の説明と、APIでそれを再現する方法です

## 簡潔な回答

<Info>
  **同じ model です。違いは、web app の中に包まれているエンジニアリング層全体にあります。**

  たとえるなら、**web app は家具付きのアパートで、API はむき出しのスケルトンです。**

  * **家具付き（claude.ai / chatgpt.com）**: system prompt、web 検索、コード実行、ファイル解析、会話メモリ、コンテキスト管理がすべて事前に組み込まれており、あとは入居するだけです。
  * **むき出しのスケルトン（API）**: 中核の model 機能だけが提供されます（耐力壁、配管、配線）。Search、tools、memory、context は自分で設定します。

  つまり、「API が頭悪く感じる」のは、たいてい model がダウングレードされたり、偽物に差し替えられたりしたという意味ではありません — **単に家具のない版を受け取っただけです。**
</Info>

## Web アプリは実際に何を追加するのですか？

公式プロダクトは、モデルの上に大量の見えないエンジニアリングを重ねています。そのどれもモデルの重みには含まれておらず、API には初期状態では一切含まれていません。

<CardGroup cols={2}>
  <Card title="System prompt" icon="file-text">
    Web アプリは、各ターンごとに非表示の prompt を注入します。多くの場合、数千 tokens にもなります。内容は、アイデンティティ、トーン、回答の長さ、書式設定の好み、拒否の境界、Markdown ルールなどです。

    これが、Web アプリが「より人間らしく聞こえ、書式がより整い、自分が何者かを知っている」ように見える最大の理由です。
  </Card>

  <Card title="組み込みツール" icon="wrench">
    Web 検索、ページ取得、コードサンドボックス（計算機として使用）、ファイルと画像の解析、グラフ描画、Artifacts / Canvas などです。

    今日のニュースについて尋ねたり、何かを計算させたりすると、Web アプリは自動的にツールを呼び出します。ツールを設定していない場合、API は推測するしかありません。
  </Card>

  <Card title="メモリと履歴" icon="brain">
    Web アプリは、会話履歴、セッション横断のメモリ、プロジェクトのナレッジベースを保存します。

    API は **完全にステートレス** です。以前のターンを `messages` に入れなければ、モデルは何も覚えていません。
  </Card>

  <Card title="コンテキスト管理" icon="scissors">
    長い会話では、Web アプリが自動的に要約、切り詰め、過去の断片の取得を行い、制限内に収めます。

    API では、切り詰め、要約、または RAG を自分で実装します。
  </Card>

  <Card title="デフォルトパラメータと thinking budget" icon="settings">
    Web アプリは、temperature、max\_tokens、reasoning effort を自動で選びます。製品によっては、質問を別のモデルや thinking tier に **自動ルーティング** するものもあります。

    API はデフォルト値を使いますが、それは多くの場合 Web アプリの設定とは異なります。
  </Card>

  <Card title="後処理とレンダリング" icon="monitor">
    引用バッジ、シンタックスハイライト、表のレンダリング、折りたたみ式の reasoning は、すべてフロントエンド側の作業です。

    API はプレーンテキストまたは JSON を返すため、見た目は当然ながらより素っ気なくなります。
  </Card>
</CardGroup>

## 一目でわかる違い

| 機能                            | 公式ウェブアプリ            | 直接API呼び出し                    |
| ----------------------------- | ------------------- | ---------------------------- |
| モデル重み                         | 同じ                  | 同じ                           |
| システムprompt                    | ベンダーによって注入されます（非公開） | なし — 自分で記述します                |
| ウェブ検索                         | 内蔵、自動でトリガーされます      | ツールを有効にするか、検索を接続します          |
| 数学 / コード実行                    | 内蔵サンドボックス           | ツール呼び出しを自分で実装します             |
| ファイルと画像の解析                    | 内蔵                  | 自分でアップロードするか、Base64でエンコードします |
| 会話メモリ                         | 自動で保存されます           | ステートレス — 履歴は自分で渡します          |
| コンテキストオーバーフロー                 | 自動で圧縮されます           | 自分で切り詰めるか要約します               |
| パラメータ (temperature, thinking) | ベンダーによって調整済み        | デフォルト — 自分で合わせます             |
| 出力形式                          | フロントエンドでレンダリングされます  | プレーンテキスト / JSON              |

## 各具体的な違いの原因は何ですか？

<AccordionGroup>
  <Accordion title="API は最近のニュースや出来事を把握していません">
    モデルの知識は学習カットオフで止まっています。ウェブアプリは **内蔵ウェブ検索** でその差分を埋めています。

    API はデフォルトではブラウズしません。修正方法: 対応する検索ツール（`web_search`、`google_search`）を呼び出すか、独自の検索 API を接続して結果をコンテキストに入れてください。

    <Warning>
      検索ツールは **呼び出しごとの有料機能** で、モデルの tokens とは別に課金されます。料金は [モデル倍率](/ja/faq/model-multiplier) を参照してください。
    </Warning>
  </Accordion>

  <Accordion title="API の計算や単語数カウントが間違っています">
    ウェブアプリは計算のために、サンドボックス内でコードを書いて実行しています。素のモデルは頭の中で計算しているだけなので、誤りが出るのは想定内です。

    修正方法: 電卓ツールまたはコード実行ツールを接続するか、モデルにプロンプトで手順を示すよう依頼してください。
  </Accordion>

  <Accordion title="API の応答がかなり短く、洗練されていません">
    ウェブアプリのシステムプロンプトには、構成、長さ、Markdown 書式に関する詳細なルールが含まれています。

    修正方法: 欲しいスタイルを自分のシステムプロンプトに入れてください — 「セクション見出しを使う」「結論を先に、詳細は後に」「コードには必ずコメントを付ける」。
  </Accordion>

  <Accordion title="API 上ではモデルが自分を認識していないか、誤ったバージョンを名乗ります">
    「自分は誰か」はモデルの重みに保存されていません。ウェブアプリはシステムプロンプトでアイデンティティを固定しています。

    参照: [LLM はなぜ自分のバージョン番号を知らないのですか？](/ja/faq/model-version-identity) と [Claude はなぜ自分を Qwen や DeepSeek と呼ぶのですか？](/ja/faq/claude-identity-confusion)
  </Accordion>

  <Accordion title="API が前に言ったことを忘れます">
    API はステートレスです — 各リクエストはまったく新しい会話です。ウェブアプリは履歴を自動で付けてくれます。

    修正方法: それ以前のやり取りをすべて `messages` 配列に含めてください。これで入力 tokens が増えるため、コストを抑えるには [プロンプトキャッシュ](/ja/faq/cache-billing) と組み合わせてください。
  </Accordion>

  <Accordion title="同じ質問でも毎回違う答えになります">
    それは不具合ではなく、サンプリングのランダム性です。ウェブアプリも同じように動きますが、同じ質問を二度投げることはあまりありません。

    修正方法: `temperature` を下げる（例: 0.2）か、プロンプトで出力形式を明示的に制約してください。
  </Accordion>

  <Accordion title="API の reasoning が浅く感じます">
    多くのウェブアプリはデフォルトで高い thinking budget で動作しますが、API のデフォルトは通常それより低いか、無効です。

    修正方法: `reasoning_effort` / `thinking` を明示的に高く設定し、最大出力長を増やしてください。[max\_tokens](/ja/faq/max-tokens) を参照してください。
  </Accordion>
</AccordionGroup>

## APIでWebアプリの体験を再現する方法

<Steps>
  <Step title="手順1: 独自のシステムプロンプトを書く">
    これが最も効果の高い施策です。アイデンティティ、トーン、出力形式、回答の長さ、境界条件を定義します。

    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1"
    )

    SYSTEM_PROMPT = """You are a professional technical assistant.
    - Lead with the conclusion, then the reasoning
    - Use Markdown headings to structure the answer
    - Code must be runnable and include key comments
    - Flag anything uncertain; never fabricate"""
    ```
  </Step>

  <Step title="手順2: 会話履歴を自分で保持する">
    各ユーザーメッセージとモデルの返信をすべて`messages`に追加して、Webアプリのメモリを再現します。

    ```python theme={null}
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    def chat(user_input):
        messages.append({"role": "user", "content": user_input})
        resp = client.chat.completions.create(
            model="claude-opus-5",
            messages=messages,
        )
        reply = resp.choices[0].message.content
        messages.append({"role": "assistant", "content": reply})
        return reply
    ```
  </Step>

  <Step title="手順3: 必要なツールを接続する">
    最新情報の検索、正確な計算のためのコード実行、社内ドキュメント向けの RAG を組み込みます。[関数呼び出し](/ja/api-capabilities/openai/function-calling) と [Web検索](/ja/api-capabilities/openai/web-search) を参照してください。
  </Step>

  <Step title="手順4: パラメータを揃える">
    デフォルトに頼らず、`temperature`、`max_tokens`、および推論ティアを明示的に設定します。Webアプリと同じ深さに合わせるには、通常は推論強度を上げる必要があります。
  </Step>

  <Step title="手順5: 長いコンテキストを扱う">
    会話が長くなったら、要約するか、最後の N ターンと重要な事実だけを残して、コンテキストウィンドウ内に収めます。キャッシュを有効にすると、繰り返しのプレフィックスにかかるコストを大幅に削減できます。
  </Step>
</Steps>

<Tip>
  **ゼロから作りたくないですか？** その代わりに成熟したクライアントを使ってください — Cherry Studio、ChatWise、LobeChat、Cursor、Claude Code などは、すでにシステムプロンプト、履歴管理、ツール呼び出しをまとめて備えています。APIYI のベース URL とキーを入力すれば、Webアプリに近い体験が得られます。[Base URL の設定](/ja/faq/base-url-config) を参照してください。
</Tip>

## 知っておくべき境界

<Warning>
  **APIはWebアプリを100%再現できません。これらの制約は現実です:**

  1. **ベンダーはシステムプロンプトを公開していません。** コミュニティ版はリバースエンジニアリングによる推測であり、リリースごとに変わります。
  2. **一部のWeb機能にはAPIがありません。** いくつかのメモリシステムや、Artifacts / Canvas の完全なインタラクションは公開されていません。
  3. **Webアプリは継続的にA/Bテストを行います。** 同じ日でも、2人のユーザーに異なるプロンプトやルーティングポリシーが適用されることがあります。
  4. **Webアプリはモデルを自動的に切り替える場合があります。** 一部の製品は簡単な質問をより小さく高速なモデルに振り分けますが、APIでは指定したモデルがそのまま使われます。そのため、結果が異なるもう1つの要因になります。

  その一方で、APIは**制御性**を提供します。プロンプト、パラメータ、tools、コンテキストはすべてあなたのものなので、結果は再現可能でバージョン管理もできます。これはプロダクトを出荷するうえで必要な要件です。
</Warning>

<Info>
  **APIYIがどこに当てはまるか**: APIYIは純粋なAPIゲートウェイです。リクエストは**そのまま通過し、プロンプト注入も書き換えもありません。** APIYI経由の挙動は、公式APIへ直接呼び出した場合と一致します。むき出しの殻はむき出しの殻のままであり、私たちはそれを補ったり、裏で壁を壊したりはしません。
</Info>

## 関連する質問

<CardGroup cols={2}>
  <Card title="LLMはなぜ自分のバージョン番号を知らないのでしょうか?" icon="circle-question-mark" href="/ja/faq/model-version-identity">
    モデルのアイデンティティの基本原理
  </Card>

  <Card title="Claudeが自分をQwenやDeepSeekと呼ぶのはなぜですか?" icon="venetian-mask" href="/ja/faq/claude-identity-confusion">
    アイデンティティの混同についての詳しい解説
  </Card>

  <Card title="適切なモデルをどのように選べばよいですか?" icon="compass" href="/ja/faq/model-selection-guide">
    各モデルの強みとユースケース
  </Card>

  <Card title="ベースURLをどのように設定しますか?" icon="link" href="/ja/faq/base-url-config">
    さまざまなクライアントでAPIYIに接続する
  </Card>
</CardGroup>

## お問い合わせ

<CardGroup cols={2}>
  <Card title="WeComサポート" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeComサポートのQRコード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QRコードをスキャンするか、[サポートに連絡するにはクリックしてください](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    連携に関するご質問と技術サポート
  </Card>

  <Card title="メール" icon="mail">
    **サポート**: [support@apiyi.com](mailto:support@apiyi.com)

    **ビジネス**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
