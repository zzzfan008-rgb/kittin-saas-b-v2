> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok マルチエージェントモデルガイド

> APIYI 上の grok-4.20-multi-agent-beta-0309 を、実機で検証しました。複雑なリサーチタスクに対して、並列のマルチエージェント協調を実現します — ただし課金の増幅については重要な説明があります（内部エージェント間トラフィックはすべて課金対象です）。

`grok-4.20-multi-agent-beta-0309` は xAI のマルチエージェント協調モデルです。1 回のリクエストで内部的に **複数のエージェントが並列に稼働** し、モデル自身は Oppie（「協調型AIチームリーダー」）と名乗り、リードエージェントが最終回答を統合します。複雑なリサーチや、多角的な比較分析に適しています。APIYI では、標準の OpenAI 互換形式で利用できます。

## 課金プロファイル（最初にお読みください）

<Warning>
  **すべての内部エージェント通信が請求対象になります。** これは通常のモデルとの最大の違いです。

  * 計測した約 40 tokens の通常の prompt は、実際には **39,263 prompt tokens + 9,997 completion tokens** として課金されます（すべての内部マルチエージェント往復を含む）
  * いちばんシンプルな 1 行リクエストでも、約 **3,900 prompt tokens** の固定オーバーヘッドがあります
  * 単価は grok-4.3（\$1.25 / \$2.50、1M tokens あたり）と同じですが、**1 回のリクエストで通常のモデルの何十倍もの費用がかかることがあります**

  このモデルは単純なタスクには使わないでください。通常の Q\&A には `grok-4.3` または `grok-4.20-0309-reasoning` を使ってください。
</Warning>

よい知らせとして、内部通信では高いキャッシュヒット率が得られます（計測した 39K prompt tokens のうち 26.8K が割引キャッシュレートにヒットしました。これは 1 回のリクエストのヒット数ではなく、複数の内部呼び出し全体の合計です）。そのため、実際のコストは単純な tokens 数換算より低くなりますが、それでも通常のモデルよりはるかに高いです。キャッシュの仕組みについては、[Grok キャッシュ課金ガイド](/ja/api-capabilities/grok/prompt-caching) をご覧ください。

## 呼び出し方

他のどのモデルとも同じです — 違うのは `model` フィールドだけです:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

resp = client.chat.completions.create(
    model="grok-4.20-multi-agent-beta-0309",
    messages=[{
        "role": "user",
        "content": "Compare Rust and Go for building highly concurrent network services: 3 points each, then a one-line verdict"
    }],
)
print(resp.choices[0].message.content)
print("Billed tokens:", resp.usage.total_tokens)
```

マルチエージェントのオーケストレーションは**完全にサーバー側**で行われます — 追加パラメータは不要です。ストリーミングと構造化出力（`json_schema`）も動作確認済みです。

## 測定特性 (2026-07-13)

| 項目                    | 測定値                                      |
| --------------------- | ---------------------------------------- |
| 中程度の複雑さのタスクのレイテンシ     | \~29 s                                   |
| シンプルな Q\&A のレイテンシ     | \~5 s                                    |
| シンプルな Q\&A の固定オーバーヘッド | \~3,900 prompt tokens                    |
| 中程度のタスクの token 消費量    | \~39K prompt + \~10K completion          |
| 内部キャッシュヒット            | prompt tokens の約 2/3 が割引キャッシュレートの対象      |
| Chain-of-thought の露出  | 表示されません (`reasoning_tokens` は引き続き課金対象です) |

## 使用するタイミング

<CardGroup cols={2}>
  <Card title="適合するケース" icon="check">
    複数の視点からの深い比較分析、複雑なリサーチ課題、複数の思考の流れが互いに検証し合うことで効果を発揮する自由度の高いタスク — 並列エージェント探索によって、回答の網羅性が大きく向上します。
  </Card>

  <Card title="不向きなケース" icon="ban">
    日常的な Q\&A、翻訳、要約、コード補完 — 出力品質は通常のモデルに近い一方で、コストが数十倍に膨らむ単一系統のタスクです。こうした用途には grok-4.3 / grok-4.5 を使ってください。
  </Card>
</CardGroup>

<Tip>
  本番公開前に、`grok-4.20-0309-reasoning` とマルチエージェントモデルの出力品質を実際のタスクをいくつか使って比較し、品質差が課金の増大に見合うかを判断してください — ほとんどのシナリオでは、推論版で十分です。
</Tip>

## よくある質問

<AccordionGroup>
  <Accordion title="モデルが自分を Oppie と呼ぶのはなぜですか？">
    それはモデルに組み込まれたペルソナ（マルチエージェントチームのリーダー役）であり、まったく正常です。リクエストとレスポンスの `model` フィールドでモデルの識別を確認してください。
  </Accordion>

  <Accordion title="内部エージェントの数を制御できますか？">
    いいえ。マルチエージェントのオーケストレーションは xAI のサーバー内で行われ、制御パラメータは公開されていません。
  </Accordion>

  <Accordion title="max_tokens に特別な設定はありますか？">
    十分大きめに設定してください（例: 8192） — モデルの内部推論は token を大量に消費するため、予算が少ないと最終回答が簡単に途中で切れてしまいます。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Grok 概要" icon="rocket" href="/ja/api-capabilities/grok/overview">
    モデルラインアップ全体と料金
  </Card>

  <Card title="Chat と推論" icon="message-square" href="/ja/api-capabilities/grok/chat">
    通常モデル向けの Chain-of-thought と課金
  </Card>
</CardGroup>
