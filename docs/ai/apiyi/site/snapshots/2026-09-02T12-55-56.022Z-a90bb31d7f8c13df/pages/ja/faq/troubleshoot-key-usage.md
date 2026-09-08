> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 予期しない API キーの使用を調査するには？

> API キーに説明のつかない使用が見つかったときの明確な手順です。キーがどこで使われたかを追跡し、すぐに無効化して、アカウントを強化し、ログ内の実際の IP から真の呼び出し元を特定します。

## 簡潔な答え

ある token（API Key）に説明のつかない使用が見つかった場合、安全な進め方は次の 3 ステップです。

1. **まず追跡する**: KEY をコピーして、チャット履歴、コードリポジトリ、設定ファイル全体を検索し、誰が受け取り、どこで使っているかを確認します。
2. **追跡できないなら無効化する**: 本当に利用者を見つけられない場合は、その token を **無効化** してください。影響は通常最小限です。
3. **アカウントを強化する**: アカウントのパスワードを変更し、コンソール権限を厳しくします。不要な人はコンソールにログインすべきではありません。

以下では、詳細な手順に加えて、ログ内の **実際のリクエスト IP** を使って本当の送信元を特定する方法も説明します。

## 調査手順

<Steps>
  <Step title="手順 1: KEY の行き先を追跡する">
    token の KEY をコピーし、次の対象を横断して全体検索を実行し、誰に渡され、どこで設定されたのかを確認します:

    * **チャット履歴** 同僚 / 外注先 / 顧客とのやり取り（WeChat、Lark、email など）
    * **コードリポジトリ** と commit 履歴（削除済みブランチ、`.env`、設定ファイルを含む）
    * **環境変数 / シークレット** デプロイプラットフォーム、CI/CD、サードパーティツールに保存されているもの

    ほとんどの「謎の利用」は、どこかに残って動き続けている古い設定が原因です。KEY を 1 回検索するだけで特定できることが大半です。
  </Step>

  <Step title="手順 2: 追跡できないなら、その token を無効化するだけです">
    手順 1 の後でも誰が使っているのか分からない場合は、**その token を無効化する**のが、被害拡大を止める最短の方法です。

    token は互いに独立しています。1 つを無効化しても、アカウント内の他の token には**影響しません**。そのため、影響は通常最小限です。正当に使っている人がいないことを確認できたら無効化し、必要であれば代替の token を作成してください。
  </Step>

  <Step title="手順 3: アカウントと権限を強化する">
    被害を止めつつ、アカウントのセキュリティを強化します:

    * **アカウントのパスワードを変更する** 強力なものにする
    * **コンソール権限を厳格化する** — 必要のない人はコンソールにログインできないようにする
    * スタッフが KEY の使用状況を確認するのは、コンソールに入らず **クエリセクション** 経由のみにする
  </Step>
</Steps>

## ログから実際の呼び出し元を特定する方法

コンソールの **ログ** セクションでは、各呼び出しの **token、モデル、IP** を確認できます。ログ項目の IP にカーソルを合わせると、その呼び出しの IP 詳細が表示されます:

```text theme={null}
📍 Main IP:
   IP: 104.194.93.159          ← APIYI's traffic-distribution IP (not the caller)

🔁 Proxy IP:
   X-Forwarded-For: 18.163.84.xx
   X-Real-IP:       18.163.84.xx   ← your true request IP (the actual user)
```

<Info>
  **2 つの IP の見方は？**

  * **メイン IP**: APIYI の **トラフィック分散 IP** で、全顧客で共通です。呼び出し元は示しません。
  * **`X-Real-IP` (および `X-Forwarded-For`) のプロキシ IP**: これは **実際に呼び出しを行った IP**、つまり実ユーザーの IP です。

  調査時は `X-Real-IP` を頼りにしてください。マシン / ネットワークと照合して、誰が呼び出しているかを特定します。
</Info>

<Tip>
  **素早く絞り込むには token を照合します**: ログには使用された **token** と **モデル** も表示されます。まず怪しい token でログを絞り込み、その `X-Real-IP` がどのアドレスの周辺に集まっているかを確認してください。通常は特定の個人またはサービスに直接つながります。
</Tip>

## よくある質問

<AccordionGroup>
  <Accordion title="token を無効化すると他のワークロードに影響しますか？">
    いいえ。各 token は独立しており、1つを無効化しても、他の token やアカウント配下の通常のワークロードには影響しません。token に正当な用途がない限り、安全に無効化して、必要であれば代替を作成できます。
  </Accordion>

  <Accordion title="ログの Main IP が固定なのですが、攻撃を受けているのでしょうか？">
    いいえ。**Main IP**（例: `104.194.93.159`）は APIYI のトラフィック分散 IP で、すべての呼び出しで共通です。これは正常な挙動です。呼び出しの発信元を判断するには、Proxy IP の下にある `X-Real-IP` を確認してください。
  </Accordion>

  <Accordion title="スタッフは KEY の使用状況を確認するために console にログインする必要がありますか？">
    いいえ。スタッフには自己確認用として **Query セクション** だけを提供し、コンソールの管理者アクセスは必要最小限の人に限定することをおすすめします。これにより、アカウントとキーの悪用リスクを根本から下げられます。
  </Accordion>

  <Accordion title="そもそも KEY の悪用を防ぐにはどうすればよいですか？">
    いくつかの習慣があります。KEY をコードにハードコードせず、環境変数を使うこと。用途ごとに token を分け、個別に無効化できるようにすること。KEY を定期的にローテーションすること。そして、誰かが退職したときやプロジェクトが終了したときには、該当する token を回収することです。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Token Management" icon="key" href="/ja/faq/token-management">
    token の作成、無効化、割り当てに関する完全ガイド
  </Card>

  <Card title="Call Logs" icon="file-text" href="/ja/faq/call-logs">
    各呼び出しの token、モデル、IP を確認する方法
  </Card>

  <Card title="Logs & Privacy Control" icon="eye-off" href="/ja/faq/user-logs-control">
    ログの範囲とプライバシー設定
  </Card>

  <Card title="Data Security" icon="shield" href="/ja/faq/data-security">
    APIYI のデータセキュリティとアクセス制御の仕組み
  </Card>
</CardGroup>

## お問い合わせ

調査してもまだ疑問が残る場合は、テクニカルサポートまでご連絡ください:

<Card title="テクニカルサポート" icon="headphones">
  * [WeChat Workサポートに連絡する](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * メール: [hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
