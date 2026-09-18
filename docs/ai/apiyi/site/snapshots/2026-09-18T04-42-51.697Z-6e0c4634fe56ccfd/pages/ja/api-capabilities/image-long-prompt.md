> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 長いプロンプトと2段階生成：32K制限の理由

> お客様から、ChatGPTには制限がないのに、なぜこちらのプロンプトには32Kの上限があるのかという質問がありました。32,000文字はOpenAIの画像APIにおける公式の上限で、token数ではなく文字数でカウントされます。Webアプリが長い素材を処理できるのは、まずチャットモデルが内容を要約・整理してから渡しているためです。このページでは、制限、コスト、長くしても必ずしも指示への忠実度が向上しない理由、そして「素材をテキストモデルに渡し、プロンプトを画像モデルに渡す」という2段階のパイプラインについて説明します。

「プロンプトの長さが ChatGPT と違って、32K に制限されているようです。」この 32K は APIYI が追加したものではありません。OpenAI Images API の公式制限であり、token ではなく**文字数**でカウントされます。しかし、本当の問題は「32K を送信できるか」ではなく、**32K 分の生データをそもそも画像モデルに渡すべきか**です。このページでは、この制限の由来、ウェブアプリが無制限に見える理由、長いプロンプトに伴う 2 つのコスト、そして広告クリエイティブのような要件の多い作業向けにプロンプトを整理する方法を説明します。

## お客様の質問：ChatGPTにはないのに、なぜAPIの上限は32Kなのですか？

やり取りの内容（匿名化済み）：

> お客様：あなたのpromptの長さはChatGPTとは異なります。32Kで制限されているようです。
> 当社：制限はあります。32Kのpromptで画像ジョブを実行する人がいるのでしょうか？
> お客様：たくさんいます。広告クリエイティブ、パッケージの寸法などです……。それなら自分でcodex cliを呼び出します。
> 当社：確認ですが、32,000 tokenのpromptですか？
> お客様：はい。英語で32,000文字は、まったく長くありません。

ここでは、3つの異なる概念が混同されています。まず、それぞれを分けて考えます。

| 概念              | 内容                          | 今回の場合                                                       |
| --------------- | --------------------------- | ----------------------------------------------------------- |
| **文字数**         | prompt文字列の長さ                | 画像APIの上限：**32,000文字**                                       |
| **token**       | モデルが課金および読み取りに使用する単位        | 英語32,000文字はおよそ8K tokenです。中国語では1文字あたりに使用するtoken数が多くなります      |
| **コンテキストウィンドウ** | テキストモデルが1回の呼び出しで保持できるすべての情報 | テキストモデルでは数十万tokenから100万tokenまで対応します。画像モデルのprompt上限とは関係ありません |

「英語で32,000文字は長くない」というのは文字数についての発言であり、その点は妥当です。しかし、お客様が比較しているChatGPTのWebアプリは、そもそも同じ経路を通っていません。

## 32K制限の由来

`prompt`フィールドに対する公式の OpenAI 画像 API の制限（`/v1/images/generations`および`/v1/images/edits`も同様）：

| モデル                                                                    | プロンプト上限    | 単位 |
| ---------------------------------------------------------------------- | ---------- | -- |
| gpt-image ファミリー（`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`を含む） | **32,000** | 文字 |
| DALL·E 3                                                               | 4,000      | 文字 |
| DALL·E 2                                                               | 1,000      | 文字 |

出典：OpenAI API リファレンス、`developers.openai.com/api/reference/resources/images/methods/generate`。

<Info>
  APIYI の公式リレーでは、この制限をさらに厳しくしていません。32,000文字を超えるとプロバイダーは 400 を返します。正確なエラーテキストはプロバイダーによるものであり、このページでは境界を1バイトずつ検証していません。正確な上限を知る必要がある場合は、ご自身のキーで1回呼び出せば確認できます。拒否されたリクエストは課金されません。
</Info>

**文字数は tokens ではありません。** 課金とモデルの理解はどちらも tokens 単位で行われ、`usage.input_tokens_details.text_tokens`は各呼び出しで実際に消費されたテキスト tokens を報告します。同じ32,000文字でも、英語では約8K tokens、中国語では各文字がより多くの tokens に対応し、より多くの情報も含むため、明らかに多くなります。そのため、「32Kの英語は短い」と「32Kの中国語は長い」は、どちらも成り立ちます。

## ChatGPTのウェブアプリが無制限に見える理由

[満足のいく画像を取得する方法](/ja/api-capabilities/image-generation-success-tips)や[安全性による拒否](/ja/api-capabilities/image-safety-troubleshooting)と同じポイントです。**ウェブアプリはエージェントであり、APIは単一のアトミックな呼び出しです**。

* 長いドキュメントをChatGPTに貼り付けると、それを読むのは画像モデルではなくチャットモデルです。チャットモデルは内容を読んだうえで、**独自の短い画像用promptを作成し**、それを使って画像ツールを呼び出します。画像モデルが元の素材を見ることはありません。10,000文字を超える貼り付けは自動的に添付ファイルにも変換されます（OpenAIヘルプセンター、`help.openai.com`）。このことからも、テキストがチャットモデル向けであることは明らかです。
* APIでは画像モデルに直接話しかけます。途中で誰かが素材を読んで、代わりに判断を下すことはありません。制限は画像モデル層に属しており、ウェブアプリは画像モデルをその制限にさらしていません。
* お客様の別れ際の言葉である「自分でcodex CLIを呼び出します」は、正しい直感です。テキストモデルに素材を読ませ、画像用promptを生成させます。これはまさにウェブアプリが裏側で行っていることであり、以下の2段階パイプラインによって実行可能になります。

## 長いpromptにかかる2つのコスト

まずコスト、次に結果です。

**コスト**: gpt-imageファミリーのテキスト入力はtoken単位で課金されます（`gpt-image-2.5`では100万tokenあたり\$5.00。[概要の料金表](/ja/api-capabilities/gpt-image-2/overview)を参照してください）。32,000文字の英語promptは約8K tokenで、1回の呼び出しあたりおよそ\$0.04です。中国語ではさらに高くなります。単体では小さな金額ですが、画像の枚数分だけ積み重なり、リトライするたびに再度支払うことになります。promptの90%がシーンの説明ではなく素材そのものである場合、その支出の大部分は何も生みません。

**結果**: 詳細を増やせば、指示への忠実度が高くなるとは限りません。何百もの要件を一度に画像モデルに提示すると、それらが競合します。本当に重要な厳格な制約（ロゴを歪めない、パッケージのテキストを正確にする、人物の人数など）ほど、埋もれてしまいます。画像promptに関するOpenAI独自のガイダンスでは、まず1〜3個の明確な文から始め、その後に必要な構図、ライティング、厳格な制約を追加するよう推奨しています（`openai.com/academy/image-generation`）。画像モデルに必要なのは、文字数ではなく、**優先順位が明確な情報密度**です。

したがって、「プロフェッショナルな広告には多くの要件がある」というのは正しいですが、**詳細であることは、長いことと同じではありません**。[高度な画像生成](/ja/api-capabilities/image-advanced-workflow)の6つの要素と、[画像promptドクタースキル](/ja/api-capabilities/image-prompt-doctor)にある「形容詞でpromptを水増ししない」というルールは、同じことを述べています。

## 2つのステージ：素材をテキストモデルに、プロンプトを画像モデルに

画像ジョブの背後に実際に32K分の素材がある場合、それは通常、ブランドブック、パッケージ仕様書、広告ブリーフ、またはキャラクターバイブルです。その素材はまずテキストモデルに渡し、画像モデル用の1つの凝縮されたプロンプトにまとめます。

| ステージ | 入力                                | モデル                      | 出力                    |
| ---- | --------------------------------- | ------------------------ | --------------------- |
| ① 凝縮 | ブランドブック / パッケージ仕様書 / 広告ブリーフ、長さは任意 | `gpt-5.6` などのテキストモデル     | 1K～3K文字の構造化された画像プロンプト |
| ② 生成 | ステージ①のプロンプト（32Kを大幅に下回る）           | `gpt-image-2.5-sunburst` | 画像                    |

凝縮出力のテンプレートでは、6つの要素に加えて、広告に特化した3つのセクションを追加します。

| セクション            | 内容                                                 |
| ---------------- | -------------------------------------------------- |
| **ハード制約（最初に記載）** | ロゴを歪めない、パッケージのテキストを一字一句そのまま表記する、人物の人数、アスペクト比、背景色の値 |
| **目的と掲載場所**      | どのような広告か、どこに掲載されるか、閲覧者にどのように感じてほしいか                |
| **被写体と必ず維持する要素** | 製品が何であるか、どのパッケージ要素を正確に表示する必要があるか                   |
| **構図とネガティブスペース** | 製品の位置、人物の位置、フレーミング、コピー用に確保する空白領域                   |
| **ビジュアル**        | 設定、カラーパレット、ライティング、素材、写真のスタイル                       |
| **禁止事項**         | 追加してはならないもの、変更してはならないもの                            |

<Steps>
  <Step title="素材をそのままテキストモデルに渡す">
    ブランドブック、仕様書、ブリーフは前処理不要です。テキストモデルのコンテキストは十分に大きいためです。システムプロンプトで、出力テンプレート、文字数上限（2,500文字以下を目標にすると適切です）、および「ハード制約を最初に記載すること」を明記します。
  </Step>

  <Step title="プロンプトを長さゲートに通す">
    `len(prompt)`を確認します。32,000を超える場合は、テキストモデルにもう一度圧縮させます。凝縮されたプロンプトは通常1～2千文字なので、このステップは安全策です。
  </Step>

  <Step title="プロンプトを保存してから、画像モデルを呼び出す">
    凝縮されたプロンプトを永続化し、生成時にはそれだけを再利用します。リトライ、サイズ変更、モデルの切り替えを行っても、素材を再度読み込んだり、素材分の tokens に対して再び料金を支払ったりする必要はありません。
  </Step>

  <Step title="素材が変更されたら、ステージ1だけを再実行する">
    パッケージのリデザインやブリーフの更新があった場合は、再度凝縮します。生成コードとパラメータは変更しません。
  </Step>
</Steps>

最小実装（OpenAI SDK、両ステージで1つのキーを共有）：

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1",
)

DISTILL_SYSTEM = """You are an ad-creative prompt engineer. Read all the material the user provides and output one prompt that can be sent directly to an image model.

Write in this order, one line per section:
1 Hard constraints: logo not distorted, packaging text verbatim, number of people, aspect ratio, background colour value
2 Purpose and placement
3 Subject and packaging elements that must be kept
4 Composition and negative space: product position, people position, framing, area reserved for copy
5 Visual: setting, palette, one identifiable key light, materials, photographic style
6 Do not

Rules:
- At most 2500 characters. Output only the prompt body, no explanation, no headings
- Do not invent anything absent from the material, especially brand names and packaging text
- Do not use vague quality words such as 8K, ultra HD, masterpiece, perfect
- Keep anything the material specifies explicitly, do not rewrite it"""

PROMPT_LIMIT = 32000  # OpenAI Images API prompt limit, in characters


def distill(brief: str, model: str = "gpt-5.6") -> str:
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": DISTILL_SYSTEM},
            {"role": "user", "content": brief},
        ],
    )
    prompt = resp.choices[0].message.content.strip()
    if len(prompt) > PROMPT_LIMIT:
        # rare; compress one more round if it happens
        prompt = distill(f"Compress the following prompt to under 2500 characters, keeping every hard constraint:\n\n{prompt}", model)
    return prompt


def generate(prompt: str, size: str = "1536x1024", quality: str = "high") -> bytes:
    import base64
    resp = client.images.generate(
        model="gpt-image-2.5-sunburst",
        prompt=prompt,
        size=size,
        quality=quality,
        timeout=600,
    )
    return base64.b64decode(resp.data[0].b64_json)


if __name__ == "__main__":
    brief = open("brief.md", encoding="utf-8").read()   # brand book + packaging spec + ad requirements, any length
    prompt = distill(brief)
    open("prompt.txt", "w", encoding="utf-8").write(prompt)   # persist; generation replays only this
    open("ad.png", "wb").write(generate(prompt))
```

<Tip>
  凝縮されたプロンプトを生成パラメータとともにアーカイブすることが、この製品ラインで結果を再現するための**唯一の信頼できる方法**です（GPT-Image ファミリーにはシードがありません）。[高度な画像生成](/ja/api-capabilities/image-advanced-workflow)のセクション5を参照してください。
</Tip>

## 長いプロンプトが本当に必要な場合

プロンプトが長くなるケースはいくつかありますが、いずれも32Kには到底及びません。

* **複数画像の編集**：「画像 1 / 画像 2 / 画像 3」のように参照画像を示し、それぞれから何を取り入れるかを記述します。数百文字程度です。
* **画像内のテキスト**：看板、ポスター、パッケージの文言はモデル任せにせず、そのまま正確に指定する必要があります。数十〜数百文字程度です。
* **シリーズで共有する先頭部分**：一括処理する画像に共通するスタイル、ライティング、構図のブロックです。1,000文字未満です。

これらを合わせても、通常は2,000〜3,000文字程度です。プロンプトが32Kに近づいている場合は、元の素材がそのまま貼り付けられていないか疑ってください。

## クイックリファレンス

* **32,000文字は公式のOpenAI Images APIの上限です**。tokenではなく文字数でカウントされ、`/generations`と`/edits`で同一です。APIYIの公式リレーがこの上限を厳しくすることはありません。
* **文字数、token、コンテキストウィンドウはそれぞれ異なるものです**。英語の32K文字は約8K tokenで、中国語ではそれ以上になります。テキストモデルのコンテキストウィンドウは、画像モデルのprompt上限とは無関係です。
* **ウェブアプリの「無制限」は錯覚です**。チャットモデルが素材を読み取り、画像ツール用の短いpromptを独自に作成します。画像モデルが32Kの制限に直面することはありません。
* **詳細であることと長いことは別です**。テキスト入力はtoken単位で課金され、再試行するたびに再度支払いが発生します。互いに競合する要件を何百個も含めると、厳密な制約が埋もれてしまいます。
* **2段階で進めます**。まずテキストモデルで素材を1K〜3K文字の構造化promptに要約し、厳密な制約を先頭に配置して保存します。その後、生成時にはpromptだけを再利用します。

## 関連ドキュメント

* [満足のいく画像を得る方法](/ja/api-capabilities/image-generation-success-tips)
* [安全性による拒否](/ja/api-capabilities/image-safety-troubleshooting)
* [高度な画像生成：ワークフローとリアリズム](/ja/api-capabilities/image-advanced-workflow)
* [画像プロンプトドクタースキル](/ja/api-capabilities/image-prompt-doctor)
* [テキストから画像への API リファレンス](/ja/api-capabilities/gpt-image-2/text-to-image)
