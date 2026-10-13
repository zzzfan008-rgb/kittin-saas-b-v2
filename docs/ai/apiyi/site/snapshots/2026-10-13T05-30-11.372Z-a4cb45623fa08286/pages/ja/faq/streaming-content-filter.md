> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# コンテンツがフィルタリングされた際、ストリーミングと非ストリーミングリクエストはどう異なりますか？

> 非ストリーミングリクエストがコンテンツセーフティフィルタにかかった場合、プラットフォームは自動的に別のルートで再生成します。ストリーミングリクエストは出力が開始されると切り替えることができず、content_filter で終了します。テスト結果、レスポンス形式、および選択方法について解説します。

## 簡潔な回答

<Info>
  **コンテンツフィルターが作動した場合、同じ内容であってもストリーミングと非ストリーミングモードでは結果が大きく異なることがあります：**

  1. **非ストリーミング**：公式ルートでコンテンツセーフティフィルターが作動した場合、APIYI は**別の公式ルートで自動的にリクエストを再生成します**。クライアントは完全な結果を取得でき、**課金は1回のみ**行われます。
  2. **ストリーミング**：生成されるとすぐに出力がクライアントへ送信されるため、**ストリームの途中でルートを切り替えることはできません**。リクエストは `finish_reason: "content_filter"` で終了し、すでに生成された部分については**通常通り課金されます**。
  3. **選び方**：ユーザーに対して token ごとに逐次表示するコンテンツ（チャット、エージェントの返答など）にはストリーミングを使用し、完了後にプログラムが処理するコンテンツ（スクリプト、絵コンテ、翻訳、構造化データなど）には非ストリーミングを使用してください。
</Info>

## フィルタリングが行われる2つのポイント

プロバイダーのコンテンツセーフティフィルターは2つのポイントで介入する可能性があり、どちらもストリーミングモードで確認できます：

| タイミング | ストリームで確認できる内容 | 一般的な所要時間 |
| - | - | - |
| **リクエスト段階**（入力のスクリーニング時） | コンテンツは1文の `I'm sorry, but I cannot assist with that request.`（約15 tokens）となり、`finish_reason` に `content_filter` が設定されます | 数秒 |
| **生成段階**（出力のスクリーニング時） | モデルがコンテンツの一部を出力した後に途中で中断され、`finish_reason` に `content_filter` が設定されます | 生成された量によって異なります |

いずれの場合もHTTPステータスは `200` となり、ストリームは `data: [DONE]` で正常に終了します。**HTTPエラーログには何も出力されません**。何が発生したかは、ストリームの最後のイベントでのみ確認できます。

## ストリーミング vs 非ストリーミング

| | ストリーミング `stream: true` | 非ストリーミング `stream: false` |
| - | - | - |
| フィルタリング時のプラットフォームの動作 | 出力が開始されているため、ルートを切り替えることはできません | 別の公式ルートで自動的に再生成されます |
| クライアントが受信する内容 | 途中で途切れた部分的なレスポンス、または1行の拒否メッセージ | 完全な結果、`finish_reason: "stop"` |
| 課金 | 途切れたリクエストは実際の入力および出力 tokens に対して課金されます。継続またはリトライは別途課金されます | 成功した試行のみ課金されます |
| クライアント側の処理 | `content_filter` を検出し、テキストをクリーンアップしてから継続またはリトライします | 不要 |
| 最適な用途 | token ごとに表示されるコンテンツ | 完了後に使用されるコンテンツ |

<Note>
  非ストリーミングリクエストに対する自動フェイルオーバーは成功率を大幅に向上させますが、100%ではありません。プロバイダーの利用規約に明らかに違反しているコンテンツは、別のルートであってもモデル自体によって拒否される場合があります。そのレスポンス形式については、[OpenAI モデルの拒否はどのような形式ですか？](/ja/faq/openai-content-safety-refusal) をご覧ください。
</Note>

## テスト結果

2026-09-25 (UTC+8) に、`gpt-5.6-terra` に対して同一のパラメータ（`max_tokens=35000`、`temperature=0`、`reasoning_effort=high`）を使用し、両方のモードで同じ一連の映画絵コンテスクリプトを送信しました。

| スクリプトのテーマ | ストリーミング | 非ストリーミング |
| - | - | - |
| 武術・格闘（詳細な技、負傷、落下を伴う） | **5/5件が生成段階で中断**（約1,700 tokens） | **4/4件が完了** |
| 流血や死を伴うアクション・戦争シーン | **10/10件がリクエスト段階でブロック**（1行の定型拒絶） | **6/6件が完了** |
| 日常生活およびミステリーのテーマ | 8/8件が正常に終了 | — |

ストリーミングモードで同じ内容を再試行しても、結果は基本的に同じです。**フィルタリングがトリガーされるかどうかは、運ではなく主にコンテンツに依存します。**

## 中断されたストリーミングの例

`choices` を含む最後のイベントにはコンテンツがなく、終了理由のみが含まれます:

```text theme={null}
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","model":"gpt-5.6-terra","choices":[{"delta":{},"finish_reason":"content_filter","index":0}],"usage":null}
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","model":"gpt-5.6-terra","choices":[],"usage":{"prompt_tokens":27831,"completion_tokens":6966,"total_tokens":34797}}
data: [DONE]
```

<Warning>
  **生成段階で出力が中断されると、結合されたテキストの末尾に改行なしで英語の拒否メッセージが直接追加されます。** 例えば、中国語の絵コンテが文の途中で終了し、直後に `I'm sorry, but I cannot assist with that request.` が続きます。

  このテキストを変更せずに継続リクエストに渡すと、モデルはそのコンテキスト内の拒否メッセージを認識し、再びブロックされる可能性が高くなります。**続行する前にその文を削除してください。**
</Warning>

## 選び方

<CardGroup cols={2}>
  <Card title="ストリーミングを使用" icon="zap">
    * ユーザーが出力をすぐに確認する必要があるチャット、カスタマーサポート、エージェントの応答
    * ユーザーが生成を途中で停止できるシナリオ
    * 日常会話ではコンテンツフィルタリングがトリガーされることは稀であるため、ストリーミング体験の方が重要
  </Card>

  <Card title="非ストリーミングを使用" icon="package">
    * 台本、絵コンテ、小説の章などの長文のクリエイティブライティング
    * 一括翻訳、情報抽出、構造化JSON
    * ユーザーに表示する前に解析および保存を行う結果
    * **センシティブなプロットに触れやすいコンテンツ**（戦闘、負傷、犯罪）
  </Card>
</CardGroup>

1つのプロダクトで**両方を併用する**ことも可能です。チャットにはストリーミングを使用し、台本や絵コンテの生成には非ストリーミングを使用します。後者の場合は `stream` を `false` に設定するだけで、それ以外の設定は変更する必要はありません。

非ストリーミングリクエストは、レスポンス全体が生成された後にのみ返されます。推論モデルによる長い出力には30〜100秒以上かかる場合があるため、これらのリクエストに対するクライアントのタイムアウトは**少なくとも300秒**に設定してください。詳細は[APIのタイムアウトを回避するには？](/ja/faq/timeout-configuration)を参照してください。UIで進捗状況を示す必要がある場合は、「生成中」の状態を表示し、生成が完了した時点で結果を表示してください。

## どうしても stream を使用する必要がある場合

<Steps>
  <Step title="stream の読み取り中に finish_reason を記録する">
    `choices` を含む最後のイベントの `finish_reason` が `content_filter` である場合、レスポンスはフィルタリングされています。HTTP ステータスコードには依存しないでください。
  </Step>

  <Step title="末尾の拒否メッセージを削除する">
    生成段階で出力が中断された場合、テキストの末尾は英語の拒否メッセージで終わります。部分的な出力をどう処理するかを決定する前に、それを削除してください。
  </Step>

  <Step title="ストリーミングなしで再試行する">
    プラットフォームが自動的にルートを切り替えられるよう、中断された部分を非ストリーミングリクエストとして再送信します。これは、ストリーミングで継続するよりもはるかに高い確率で成功します。
  </Step>

  <Step title="ブロックされ続ける場合は言い換える">
    同じタスクに対して非ストリーミングリクエストでも失敗する場合は、センシティブな詳細をより一般的な表現に言い換えて再試行してください。同じ内容を変更せずにそのまま再送信しないでください。
  </Step>
</Steps>

以下は最小限の例です。stream を読み取り、フィルタリングされた場合は拒否メッセージを削除して、ストリーミングなしで再試行します。

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(api_key=os.environ["APIYI_API_KEY"], base_url="https://api.apiyi.com/v1")

REFUSAL = "I'm sorry, but I cannot assist with that request."

def generate(messages, model="gpt-5.6-terra"):
    stream = client.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
        stream_options={"include_usage": True},
    )
    parts, finish = [], None
    for chunk in stream:
        if not chunk.choices:
            continue
        choice = chunk.choices[0]
        if choice.delta and choice.delta.content:
            parts.append(choice.delta.content)
            print(choice.delta.content, end="", flush=True)
        if choice.finish_reason:
            finish = choice.finish_reason

    text = "".join(parts)
    if finish != "content_filter":
        return text

    # Filtered: strip the trailing refusal and retry without streaming so the platform can switch routes
    partial = text.removesuffix(REFUSAL)
    print(f"\n[Cut off by content filter after {len(partial)} characters; retrying without streaming]")
    resp = client.chat.completions.create(model=model, messages=messages, timeout=600)
    return resp.choices[0].message.content
```

<Tip>
  この例では、最も簡単なアプローチとして、ストリーミングなしでレスポンス全体を単純に再生成しています。ワークフローで部分的な出力を保持する必要がある場合は、`partial` をコンテキストとして渡してモデルに継続を依頼しますが、その継続リクエストもストリーミングなしで送信してください。
</Tip>

## よくある質問

<AccordionGroup>
  <Accordion title="途中で切断されたストリーミングリクエストは課金されますか？">
    はい、課金されます。プロバイダーが実際にそのコンテンツを生成したため、実際の入力および出力 tokens に対して課金されます。フィルタリングをトリガーしやすいコンテンツの場合は非ストリーミングの方が安価です。成功した試行のみが課金されます。
  </Accordion>

  <Accordion title="コンテンツフィルタリングを無効にできますか？">
    いいえ、できません。フィルタリングはプロバイダーによって強制されており、APIYI が無効化したり厳しさを変更したりすることはできません。プラットフォームができることは、フィルタリングされた非ストリーミングリクエストを別の公式ルートで再試行することです。
  </Accordion>

  <Accordion title="同じコンテンツが通ることもあれば、途中で遮断されることもあるのはなぜですか？">
    フィルタリングの厳しさは公式ルートによって多少異なり、またモデルは毎回出力の言い回しを変えるため、ボーダーライン上のコンテンツは一度通過しても次回は遮断される可能性があります。明らかにセンシティブなコンテンツは一貫してブロックされます。
  </Accordion>

  <Accordion title="プラットフォームがストリーミングリクエストを自動的に再試行しないのはなぜですか？">
    生成段階での中断はコンテンツがすでに送信された後に発生するため、クライアントはすでに前半を受信して表示しています。その時点で別のルートで最初から再生成しても、すでに表示された内容と整合しなくなります。そのため、ストリーミングリクエストはクライアント側で `content_filter` を確認した際に対処する必要があります。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="OpenAI モデルの拒絶とはどのようなものですか？" icon="message-square-x" href="/ja/faq/openai-content-safety-refusal">
    モデル自体が拒絶した場合のレスポンス形式と検出方法
  </Card>

  <Card title="ストリーミング呼び出し vs 非ストリーミング呼び出し" icon="audio-lines" href="/ja/faq/streaming-vs-non-streaming">
    両モードにおける統合、課金、およびよくある誤解
  </Card>

  <Card title="API タイムアウトを回避するにはどうすればよいですか？" icon="timer" href="/ja/faq/timeout-configuration">
    長時間の非ストリーミング出力に対するタイムアウト設定
  </Card>

  <Card title="コンテンツの安全性とコンプライアンス" icon="shield-check" href="/ja/faq/content-safety">
    プラットフォームのコンテンツ安全性とコンプライアンスポリシー
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.