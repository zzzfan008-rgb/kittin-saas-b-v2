> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI モデルの拒否応答はどのようなものですか？

> GPT モデルがプロバイダーの利用ポリシーに違反するリクエストを拒否する場合、エラーやカテゴリ情報は返されず、短い拒否メッセージとともに 200 が返されます。レスポンスボディの内容とその検出方法をご確認ください。

## 簡潔な回答

GPTモデルがプロバイダーの利用ポリシーに違反するリクエストを受け取った場合、**エラーは返されません**。APIはHTTP 200で応答し、`finish_reason`は`stop`となり、コンテンツには「I can't help with that…」のようにモデル自身によって記述された拒絶文が含まれます。

このレスポンスには**エラーコードはなく、拒絶のカテゴリや重大度もありません**。通常の回答とまったく同じ構造を持ち、通常通りに課金されます。ステータスコードと`finish_reason`だけを見ても、リクエストが拒絶されたかどうかを判別することはできません。

## 拒否レスポンスボディ

以下は、`/v1/chat/completions` からの実際の非ストリーミングの拒否レスポンスです（内容は中立的な例に置き換えられています）：

```json theme={null}
{
  "model": "gpt-5.6-terra",
  "object": "chat.completion",
  "created": 1789712872,
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I can't help with that request. I can, however, help with a related topic or a rewritten version that stays within the usage policy."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 35,
    "completion_tokens": 54,
    "total_tokens": 89
  }
}
```

| フィールド | 拒否レスポンスの内容 |
| - | - |
| HTTPステータス | `200` |
| `finish_reason` | `stop`、通常の回答と同じです |
| `message` | `role` および `content` のみ。独立した `refusal` フィールドは**ありません** |
| 冒頭の文言 | 通常は `I can't…` または `Sorry, I can't…`、中国語では `抱歉，我不能…` |
| 言語 | prompt に従います：中国語の prompt には通常、中国語の拒否レスポンスが返されます |
| 長さ | 主に 50〜120 tokens。個人のウェルビーイングに関連するトピックには支援の提案が添えられ、約 400 tokens に達することがあります |
| 課金 | 実際の入力および出力 tokens に対して通常どおり課金されます |

## カテゴリが存在しない理由

ポリシーに違反するリクエストに対して、OpenAI chat APIはエラーを返す代わりに、**モデルに回答しない判断をさせます**。どのカテゴリに抵触したか（例えば成人向けコンテンツ、過激な暴力、自傷行為など）は通知されず、深刻度も提供されません。

これはエラーとは異なります。エラーの場合は200以外のステータスと`error`オブジェクトが返されます。一方、拒否の場合は、単に求めていた内容ではないコンテンツを含む**呼び出し成功**となります。

## 翻訳と構造化出力

バッチ翻訳や抽出タスクでは、通常、JSON 配列などの固定フォーマットをモデルに要求します。バッチが拒絶をトリガーした場合、モデルは平文の文章を返すため、JSON としてパースすると `Unrecognized token 'I'` や `Expecting value` のようなエラーで失敗します。

**これは API のフォーマットの問題ではありません。** そのバッチのコンテンツが拒絶されたためです。同じバッチを変更せずに再試行しても、通常は同じ結果になります。

<Info>
  APIYI では、**非ストリーミングリクエスト**に対してコンテンツセーフティの自動フェイルオーバーを有効にしています。prompt または生成された出力のいずれかで、ある公式ルートがコンテンツフィルターをトリガーした場合、リクエストは別の公式ルートで自動的に再試行されるため、お客様側での再試行は不要です。フェイルオーバー後は大半のリクエストが通常の結果を返しますが、モデル自体によって拒絶されるリクエストもごくわずかに存在し、それが本ページで説明しているケースです。
</Info>

## 検知と対処の方法

<Steps>
  <Step title="まず出力フォーマットを検証する">
    JSONを要求した場合はJSONとしてパースし、固定数の項目を要求した場合は項目数を確認します。フォーマットが一致しない場合は、その呼び出しを「結果なし」として扱い、そのコンテンツを出力として使用しないでください。
  </Step>

  <Step title="次に拒否であるか確認する">
    フォーマットが一致しない場合は、コンテンツが`I can't`や`Sorry`などで始まる短い文であるかどうかを確認します。そうである場合、モデルがフォーマットから外れたというよりは、ほぼ確実に拒否です。
  </Step>

  <Step title="変更を加えずに再試行しない">
    同じコンテンツを変更せずに再試行しても、ほとんどの場合同じ拒否が発生し、試行ごとに課金されます。
  </Step>

  <Step title="バッチを分割して特定の項目を特定する">
    失敗したバッチをより小さなバッチに分割して再送信し、どの項目が拒否を引き起こしているかを特定します。通常、残りの項目は正常に完了します。拒否を引き起こした項目については、言い回しを調整して再試行してください。
  </Step>

  <Step title="失敗事例をアーカイブし、モデルの切り替えを判断する">
    失敗事例（入力、リクエスト時刻、リクエストID、返却されたコンテンツ）の社内アーカイブを保持し、どのようなコンテンツに拒否が集中しているかを確認した上で、別のモデルでそのコンテンツを再試行するかどうかを検討します。
  </Step>
</Steps>

<Tip>
  「失敗事例のアーカイブ → 分析 → 別のモデルでの再試行」を標準プロセスにすることをお勧めします。拒否は特定の種類のコンテンツに集中する傾向があるため、アーカイブを作成することでパターンを把握しやすくなります。これにより、繰り返しの手動調査の手間が省け、同じコンテンツに対して何度も課金されるのを防ぐことができます。
</Tip>

以下は最小限の例です。JSONを検証し、一致しないものをローカルの失敗ログに記録します。

```python theme={null}
import json
import os
import time
from openai import OpenAI

client = OpenAI(api_key=os.environ["APIYI_API_KEY"], base_url="https://api.apiyi.com/v1")

REFUSAL_PREFIXES = ("I can't", "I can’t", "Sorry", "I'm sorry", "I’m sorry", "抱歉")

def translate_batch(lines):
    prompt = "Translate each subtitle line below into English. Output a JSON array only:\n" + json.dumps(lines, ensure_ascii=False)
    resp = client.chat.completions.create(
        model="gpt-5.6-terra",
        messages=[{"role": "user", "content": prompt}],
    )
    text = resp.choices[0].message.content or ""
    try:
        result = json.loads(text)
        if isinstance(result, list) and len(result) == len(lines):
            return result
    except json.JSONDecodeError:
        pass

    # No usable result: record it for later analysis or a retry with another model
    with open("failed_cases.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps({
            "time": time.strftime("%Y-%m-%d %H:%M:%S %z"),
            "request_id": resp.id,
            "is_refusal": text.strip().startswith(REFUSAL_PREFIXES),
            "input": lines,
            "output": text,
        }, ensure_ascii=False) + "\n")
    return None
```

## ストリーミングリクエスト

ストリーミングレスポンスが開始されると、別のルートへ切り替えることはできなくなるため、**コンテンツ安全性の自動フェイルオーバーは非ストリーミングリクエストにのみ適用されます**。ストリーミングでは、以下のような事象が発生する場合があります：

* 最後のイベントで `finish_reason` が `content_filter` に設定された短い拒否応答、または
* コンテンツの一部が既に配信され、末尾が `finish_reason: "content_filter"` で終了するケース。

token単位で表示する必要がない一括翻訳などのタスクには、非ストリーミング呼び出しをお勧めします。テスト結果を含む完全な比較については、[コンテンツがフィルタリングされた場合、ストリーミングと非ストリーミングのリクエストはどう異なりますか？](/ja/faq/streaming-content-filter) を参照してください。

## よくある質問

<AccordionGroup>
  <Accordion title="拒絶された場合でも課金されますか？">
    はい。拒絶は呼び出しとしては成功しており、実際の入力および出力 tokens に基づいて課金されるため、同じコンテンツで繰り返し再試行することは避けてください。
  </Accordion>

  <Accordion title="拒絶を無効にすることはできますか？">
    いいえ。拒絶はプロバイダーの利用規約に基づいてモデルによって判断されます。APIYI 側で無効にしたり、その厳格さを調整したりすることはできません。
  </Accordion>

  <Accordion title="同じコンテンツなのに通過するときと拒絶されるときがあるのはなぜですか？">
    モデルの判断にはある程度のランダム性があり、異なる公式ルート間でもフィルタリングがわずかに異なるため、ボーダーライン上のコンテンツはある時は通過し、別の時には拒絶されることがあります。利用規約に明確に違反しているコンテンツは、一貫して拒絶されます。
  </Accordion>

  <Accordion title="拒絶のカテゴリを取得するにはどうすればよいですか？">
    OpenAI の chat API はカテゴリを返しません。ワークフローでカテゴリが必要な場合は、リクエストを送信する前にご自身でコンテンツを分類するか、アーカイブされた失敗事例を手動で仕分けてください。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="レスポンス処理" icon="braces" href="/ja/api-capabilities/openai/response-handling">
    ストリーミングおよび非ストリーミングレスポンスに対する単一のパース手法
  </Card>

  <Card title="コンテンツの安全性とコンプライアンスはどのように確保されていますか？" icon="shield-check" href="/ja/faq/content-safety">
    プラットフォームのコンテンツ安全性およびコンプライアンスポリシー
  </Card>

  <Card title="Claudeの拒否が空のコンテンツを返すのはなぜですか？" icon="message-square-x" href="/ja/faq/claude-content-safety-refusal">
    Claudeの拒否がどのような挙動を示し、それをどのように検出するか
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.