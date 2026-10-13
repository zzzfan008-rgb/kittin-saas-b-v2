> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ClaudeのInvalid Thinking Signatureエラーを修正するにはどうすればよいですか？

> Claude CodeまたはClaude Agentクライアントが429とともに「Invalid signature in thinking block」を報告する場合、これはレート制限ではありません。会話履歴内のthinkingブロックの署名が失われています。解決するには新しい会話を開始してください。

## 簡潔な回答

エラーは次のように表示されます:

```text theme={null}
API Error: Request rejected (429) · messages.1.content.0: Invalid `signature` in `thinking` block
```

429と表示されますが、**これはレート制限ではありません**。thinkingブロックを含む**会話履歴がプロバイダーの署名検証に失敗しました**。リトライのたびに同じ履歴が送信されるため、クライアント側の自動リトライは常に失敗します。

\*\*解決策: 新しい会話を開始してください。\*\*エージェント、モデル、またはキー設定を変更する必要はありません。

## 典型的な症状

Claude Code、Claude Agent SDK、またはCherry StudioなどのクライアントのClaude Agentモードで、thinkingを有効にしている場合：

* メインの会話で返答が一切生成されません。クライアントには「too many requests」や「retrying in 9 seconds (5/10)」などのメッセージが表示され、10回のリトライ後に処理が中断されます。
* コンソールのログには、このキーに対して**成功した課金リクエストが確かに表示されています**が、それらはすべてわずかなtokensのみの小規模なリクエストです。これらはクライアントがSmallモデルで送信する補助的なリクエスト（タイトル生成や意図判定など）です。履歴が含まれていないため、これらは成功します。
* 同じ会話内で「continue」をクリックしたり言い換えたりしても同じエラーが発生します。新しい会話を開始すると、すぐに正常に動作します。

## 発生原因

thinking を有効にすると、各 Claude の返答は `thinking` ブロックから始まり、このブロックには `signature` が含まれます。次のターンでは、クライアントは履歴内で直前の `thinking` ブロックを**署名を含め、受信した状態のまま**送り返す必要があります。プロバイダーは署名を検証し、thinking の内容が改ざんされていないことを確認します。

以下のいずれかに該当する場合、署名の検証に失敗します：

<CardGroup cols={2}>
  <Card title="署名の欠落または空の署名" icon="file-x">
    クライアントが会話を保存する際に署名を保存しなかったため、空の `signature` 文字列を送り返すか、フィールド自体を省略してしまいます。複数のクライアントでこのようなバグが確認されており、thinking とファイル読み取りなどのツール呼び出しを組み合わせた際によく発生します。
  </Card>

  <Card title="変更された thinking の内容" icon="pencil">
    履歴の手動編集、クライアント側での履歴の圧縮やトリミング、またはリクエストボディを再フォーマットするプロキシは、いずれも thinking の内容と署名の不一致を引き起こします。
  </Card>

  <Card title="会話途中のモデル切り替え" icon="shuffle">
    モデル A が thinking ブロックを生成し、同じ会話をモデル B で続行した場合、モデル B はモデル A が残した署名を受け付けない可能性があります。
  </Card>

  <Card title="会話途中のキーまたはグループの切り替え" icon="key">
    会話の途中でキーまたは token グループを切り替えた場合、以降のリクエストが別のルートで処理され、以前の署名がそこでの検証を通過できない可能性があります。
  </Card>
</CardGroup>

エラー内の `messages.1.content.0` は、履歴における**最初の assistant 返答の最初のコンテンツブロック**（最初のターンの thinking ブロック）を指しています。これが一度破損すると、その会話における以降のすべてのターンが失敗します。

## 解決方法

<Steps>
  <Step title="新しい会話を開始する">
    クライアントで新しい会話を作成し、ファイルを再度アップロードして、もう一度質問してください。同じエージェント、モデル、キーを維持します。これが最も迅速かつ確実な解決策です。
  </Step>

  <Step title="会話ごとに1つのモデルと1つのキーを使用する">
    別のモデルやキーが必要な場合は、新しい会話で切り替えてください。すでに思考履歴が含まれている会話内で切り替えないでください。
  </Step>

  <Step title="手動で履歴を編集しない">
    過去のアシスタントメッセージの思考内容を編集または削除しないでください。コンテキストを短縮するには、クライアントの内蔵圧縮機能を使用するか、新しい会話を開始してください。
  </Step>

  <Step title="クライアントをアップデートする">
    新しい会話で数ターン後にエラーが再発する場合、クライアントが履歴を保存する際に署名を欠落させている可能性が非常に高いです。最新バージョンにアップデートし、クライアントの開発者に再現手順を報告してください。
  </Step>
</Steps>

<Tip>
  **ご自身のコードからAPIを呼び出す場合**: 履歴をリプレイする際は、各`thinking`ブロックを（`signature`フィールドを含め）**完全にそのまま保持する**か、**ブロック全体を削除する**かのいずれかにしてください。思考テキストを残したまま署名を削除することは絶対に避けてください。公式SDKを使用する場合は、前回のレスポンスの`content`配列を変更せずにそのまま`messages`に戻してください。
</Tip>

## よくある質問

<AccordionGroup>
  <Accordion title="エラーに429と表示されています。リクエストレートを下げるべきですか？">
    いいえ。リクエスト内容が無効であるためであり、リクエストレートとは関係ありません。待機したり後で再試行したりしても解決しません。`Invalid signature in thinking block`が表示された場合は、新しい会話を開始してください。
  </Accordion>

  <Accordion title="失敗したリクエストに対しても課金されますか？">
    いいえ。モデルが何かを生成する前に署名検証が失敗するため、これらのリクエストに費用は発生せず、コンソールのログにも表示されません。表示されている課金済みのエントリーは成功したリクエストによるもので、通常はクライアントによる小さな補助的なリクエストです。
  </Accordion>

  <Accordion title="thinkingをオフにすることで回避できますか？">
    同じ会話内でthinkingをオフにしても解決しない可能性があります。履歴にすでに存在するthinkingブロックが引き続き送信されるためです。新しい会話を開始する方が確実です。タスクでthinkingが不要な場合は、新しい会話から開始して`-thinking`サフィックスのないモデルに切り替えることもできます。
  </Accordion>

  <Accordion title="新しい会話でも発生し続けます。どうすればよいですか？">
    エラーのおおよその発生時刻（タイムゾーン付き、例: `17:00 (UTC+8)`）、クライアントとそのバージョン、モデル名を添えてサポートまでお問い合わせください。時刻から会話のリクエストを特定し、調査をサポートいたします。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Claude Effort & Thinking ガイド" icon="brain" href="/ja/api-capabilities/claude-effort-thinking">
    Thinking のオン/オフ切り替え、ストリーミングイベント、シグネチャの受け渡し
  </Card>

  <Card title="Claude ネイティブ形式：ストリーミングおよび非ストリーミングレスポンス" icon="sparkles" href="/ja/api-capabilities/claude-response-handling">
    `thinking` ブロックと `signature_delta` の構造
  </Card>

  <Card title="Claude Code" icon="terminal" href="/ja/scenarios/programming/claude-code">
    Claude Code で APIYI を設定する
  </Card>

  <Card title="API の同時実行数制限とは？" icon="gauge" href="/ja/faq/api-concurrency">
    同時実行数とレート制限の解説
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.