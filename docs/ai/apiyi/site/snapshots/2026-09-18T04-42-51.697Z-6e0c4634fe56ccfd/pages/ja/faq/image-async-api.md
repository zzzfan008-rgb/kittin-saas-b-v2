> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 非同期の画像APIはありますか？タスクIDで結果を照会できますか？

> APIYIの画像生成は同期のみで、タスクIDによる非同期照会には対応していません。本記事では、その理由と推奨される方法を説明します。

## 簡単な回答

APIYI では現在、画像生成向けの非同期タスクID照会インターフェースは**提供していません**。すべての画像モデルは**同期型**で、リクエストが長時間の接続を開き → 生成完了を待機し → 画像を直接返します。

当社は**上流パススルー**として動作しており、ユーザーの業務データを**保存しません**。そのため、「ID を使って再接続し、以前に生成された結果を取得する」機能は提供できません。クライアント側で適切なタイムアウトを設定し、接続を維持しつつ、リクエスト／レスポンスを自社バックエンドに記録することをおすすめします。

<Info>
  **要するに**: 同期呼び出し + 適切なタイムアウト + クライアント側のタスク記録 = 実質的に自分で制御する軽量な非同期キューです。エンドユーザーの体験はほぼ同じです。
</Info>

## なぜ Task-ID の非同期クエリがないのですか？

<CardGroup cols={3}>
  <Card title="上流パススルー" icon="forward">
    当社の画像エンドポイントは、上流の公式APIの同期動作を完全にそのまま反映しており、不整合や遅延を生みうる追加のキュー層はありません
  </Card>

  <Card title="プライバシーとセキュリティを最優先" icon="shield">
    ユーザーのプライバシーとデータセキュリティのため、私たちは**いかなるビジネスコンテンツも記録しません**（prompt、生成画像）。そのため、ID で過去の結果を取得することは設計上できません
  </Card>

  <Card title="同期でほとんどのケースをカバー" icon="check">
    適切に調整された timeout と keep-alive 接続があれば、画像生成リクエストの大半は 1 回の呼び出しで正常に完了します
  </Card>
</CardGroup>

## 推奨アプローチ

<Steps>
  <Step title="クライアントでは長時間接続 + 適切なタイムアウトを使用する">
    HTTPクライアントのタイムアウトを、モデルの生成時間に対して安全な上限に設定し（通常はモデルに応じて60〜300秒です）、keep-aliveを有効にして、中間のネットワーク層が接続を早期に切断しないようにします。

    生成時間はモデルごとに大きく異なります — **モデル別の推奨タイムアウト表** についてはサポートまでお問い合わせください。
  </Step>

  <Step title="タスクとレスポンスを自社バックエンドに記録する">
    当社では業務データを永続化しないため、各リクエストごとに業務側のタスクIDを生成し、prompt、パラメータ、最終結果（またはエラー）をデータベースに保存してください。フロントエンドが切断されても、バックエンドには完全な記録が残ります。
  </Step>

  <Step title="独自の非同期ラッパーを実装する">
    製品が非同期である必要がある場合（たとえば、フロントエンドが長時間実行される呼び出しを待てない場合）、バックエンドに薄い非同期レイヤーを追加します:

    * フロントエンドがタスクを POST する → バックエンドがキューに投入する → 業務用タスク ID を返す
    * バックエンドのワーカーが APIYI を同期的に呼び出す → 結果をデータベースに書き戻す
    * フロントエンドがそのタスク ID を使ってポーリングするか、WebSocket 経由でサブスクライブする

    これは機能的にはプラットフォームネイティブの非同期 API と同等であり、すべてのデータを自社で管理できます。
  </Step>
</Steps>

## クライアント側の非同期ラッパー（参考）

```python theme={null}
# Pseudocode: implement an async shell in your own backend
def submit_image_task(prompt):
    task_id = uuid4()
    db.save(task_id, status="pending", prompt=prompt)
    queue.push({"task_id": task_id, "prompt": prompt})
    return task_id

def worker(job):
    try:
        # Synchronous call to APIYI, timeout sized for the model
        result = apiyi_client.images.generate(
            prompt=job["prompt"],
            timeout=180,
        )
        db.update(job["task_id"], status="done", url=result.url)
    except TimeoutError:
        db.update(job["task_id"], status="failed", error="timeout")

def query_image_task(task_id):
    return db.get(task_id)  # frontend polls your own backend by task_id
```

<Tip>
  **要点**: ビジネスタスクIDは **あなたのコード** で生成し、**あなたのデータベース** に保存します。APIYI は「同期的に生成する」ステップのみを担当します。
</Tip>

## FAQ

<AccordionGroup>
  <Accordion title="同期呼び出しがすぐタイムアウトしてしまいます。どうすればよいですか？">
    タイムアウトの多くは、**クライアントのタイムアウトが短すぎること**、または**中間のネットワーク層（リバースプロキシ、ゲートウェイなど）が長い接続を早期に切断していること**が原因です。

    トラブルシューティングの順序:

    1. HTTP クライアントの read timeout を 60～300 秒に引き上げていることを確認します
    2. 中間層（nginx、API gateway、CDN）でも timeout が引き上げられていることを確認します
    3. 強制切断を防ぐために keep-alive を有効にします
    4. ご利用の特定モデルに推奨される timeout について support にお問い合わせください
  </Accordion>

  <Accordion title="呼び出しはタイムアウトしましたが、画像は実際には生成されていたかもしれません。復元できますか？">
    残念ながら、できません。私たちは上流のパススルーであり、生成結果を保持していません。sync 呼び出しが timeout によって中断された場合、**結果は失われ**、client は再試行する必要があります。

    対策は、あらかじめ timeout を十分長く設定し、成功直前の request が途中で切れないようにすることです。
  </Accordion>

  <Accordion title="今後、async の task-ID エンドポイントは追加されますか？">
    一部の upstream プラットフォームは遅いことがあり、そのようなケースでは async のほうが使いやすいことは認識しています。**今後 async 機能を追加する可能性はあります**が、現時点では時期は未定です。約束はできません。それまでは、上記の「client-side async wrapper」方式に従ってください。
  </Accordion>

  <Accordion title="動画生成のエンドポイント（Sora / VEO など）は async ですか？">
    **はい — 動画生成は本質的に非同期です**（upstream の設計によります）。task\_id が返され、client は最終動画を取得するために task の status をポーリングします。これは同期の画像エンドポイントとは異なります。モデルごとのドキュメントに従ってください。
  </Accordion>

  <Accordion title="異なる画像モデルに対する推奨 timeout は何ですか？">
    生成時間はモデルによって大きく異なります（数秒で終わるものもあれば、30 秒以上、あるいは 3～5 分かかるものもあります）。[Image API Essentials & Best Practices](/ja/api-capabilities/image-api-best-practices) の **モデル別 timeout 早見表**をご覧いただくか、特別なケースについては support にお問い合わせください。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Image API の基礎とベストプラクティス" icon="book-check" href="/ja/api-capabilities/image-api-best-practices">
    モデル別のタイムアウト表、base64 の扱い、URL 出力のリファレンス
  </Card>

  <Card title="独自の非同期キューを構築する" icon="list-checks" href="/ja/api-capabilities/image-async-queue">
    同期 API をタスクキューにラップするためのエンジニアリングガイド
  </Card>

  <Card title="モデル選定ガイド" icon="cpu" href="/ja/faq/model-selection-guide">
    各画像モデルの機能とユースケース
  </Card>

  <Card title="API 同時実行数とレート" icon="gauge" href="/ja/faq/api-concurrency">
    同時実行数の上限、レート制限、ベストプラクティス
  </Card>

  <Card title="コールログとデータ" icon="file-text" href="/ja/faq/user-logs-control">
    当社のデータ保持ポリシーとログ制御
  </Card>

  <Card title="サポートにお問い合わせ" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    モデル別のタイムアウト表、またはさらにご相談ください
  </Card>
</CardGroup>
