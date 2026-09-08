> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# モデル名の `-c` サフィックスは何を意味しますか?

> `gemini-3-pro-image-preview-c` のような `-c` サフィックス付きのモデル名の意味と、課金の違いを説明します

## Short Answer

<Info>
  **`-c` は「call」（1回ごとの課金）を表します。**

  `-c` サフィックスが付いたモデル名（例: `gemini-3-pro-image-preview-c`）と、付いていないモデル名（例: `gemini-3-pro-image-preview`）は、実質的に能力が同じ**同じモデル**です。違いは課金方式だけで、`-c` 版は特に**1回ごとの課金**向けです。
</Info>

## 公式説明

<img src="https://mintcdn.com/apiyillc/-8MuET9SQdeEzoC1/images/model-name-suffix-c-explain.png?fit=max&auto=format&n=-8MuET9SQdeEzoC1&q=85&s=892eb766d8a1d4f3ebd5a249d21b1d5a" alt="モデル名の -c サフィックスの説明" width="1062" height="476" data-path="images/model-name-suffix-c-explain.png" />

重要ポイント:

* `-c` は「呼び出し」を意味し、1回ごとの課金用の別モデル名です
* 実質的には、サフィックスなしの版と **同じモデル** です
* どちらも公式 API リレーであり、課金方法を区別するために異なるモデル名を使っているだけです
* 将来的には、課金は token 課金モードのみで区別される可能性があります

## 「-c」接尾辞はなぜあるのですか？

APIYI はトークンベースの課金を展開しており、一部のモデルはトークンベース課金と呼び出しごとの課金方法の両方をサポートしています。システムでは、異なる課金チャネルを区別するためにモデル名の接尾辞を使用しています。

| モデル名                           | 課金方法    | 説明              |
| ------------------------------ | ------- | --------------- |
| `gemini-3-pro-image-preview`   | トークンベース | token 使用量に応じて課金 |
| `gemini-3-pro-image-preview-c` | 呼び出しごと  | API 呼び出しごとの固定料金 |

<Note>
  どちらの名前も、公式リレーを通じて同じ公式モデルを呼び出しています。モデルの機能と出力品質は同一です。
</Note>

## どのように選びますか？

<CardGroup cols={2}>
  <Card title="トークンベース（サフィックスなし）" icon="chart-line">
    **最適な用途**:

    * 入出力 token が少ないリクエスト
    * 正確なコスト管理が必要な場合
    * 主にテキストの理解/分析タスク

    `-c`なしでモデル名を使用します
  </Card>

  <Card title="呼び出しごと（-c サフィックス）" icon="hand">
    **最適な用途**:

    * 画像生成および固定出力のシナリオ
    * 1回の呼び出しごとに透明で固定のコスト
    * token 消費量を計算する必要がない場合

    `-c`付きのモデル名を使用します
  </Card>
</CardGroup>

<Tip>
  **おすすめ**: token を作成するときは、「**Token優先**」課金モードを選択してください。システムが自動的に最適な課金方式を選択するため、モデル名のサフィックスを手動で区別する必要がなくなります。詳細は [token 課金モード](/ja/faq/token-billing-modes) を参照してください。
</Tip>

## 今後の予定

<Info>
  APIYI は課金システムを継続的に最適化しています。将来的には、課金は **token 課金モードのみ** で区別されるようになり、モデル名のサフィックスは不要になる可能性があります。更新についてはプラットフォームのお知らせをご確認ください。
</Info>

## よくある質問

<AccordionGroup>
  <Accordion title="-c モデルは、サフィックスのないものと同じですか？">
    **はい、まったく同じモデルです。**

    `-c` のサフィックスは課金チャネルを識別するだけで、モデルの機能には影響しません。どちらの名前も最終的には同じ公式 API に転送され、出力品質も同一です。
  </Accordion>

  <Accordion title="どのモデル名を使えばよいですか？">
    token の課金モードによって異なります。

    * **トークン優先 token**: サフィックスなしの名前を使います（例: `gemini-3-pro-image-preview`）。システムが自動的に処理します
    * **呼び出しごと token**: `-c` 付きの名前を使います（例: `gemini-3-pro-image-preview-c`）
    * **不明な場合**: 「トークン優先」 token + サフィックスなしのモデル名の使用をおすすめします
  </Accordion>

  <Accordion title="すべてのモデルに -c 版はありますか？">
    いいえ。token ベース課金と呼び出しごとの課金の両方に対応しているモデルにのみ、`-c` サフィックス版があります。純テキストモデル（GPT-4o、Claude など）は通常 token ベース課金のみに対応しており、`-c` 版はありません。
  </Accordion>

  <Accordion title="-c サフィックスは今後もずっと存在しますか？">
    APIYI は課金システムを調整中で、将来的にはモデル名のサフィックスで課金方式を区別する必要がなくなり、token 課金モードによる完全な制御に切り替わる可能性があります。将来の変更の影響を受けないように、「トークン優先」 token の使用をおすすめします。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Token 課金モードの解説" icon="calculator" href="/ja/faq/token-billing-modes">
    Token-first と Per-call を含む 5 つの課金モードの違いを学べます
  </Card>

  <Card title="API tokens の作成方法" icon="key" href="/ja/faq/token-management">
    API tokens の作成と管理に関する完全ガイド
  </Card>
</CardGroup>
