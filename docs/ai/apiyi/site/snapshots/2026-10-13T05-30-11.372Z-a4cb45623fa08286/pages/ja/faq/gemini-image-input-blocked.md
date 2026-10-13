> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# なぜGemini画像モデルはblockReason: OTHERを返すのか？

> Gemini画像モデルが数秒以内にcandidatesなしでpromptFeedback.blockReasonを返した際に、手動およびコードのワークフローの両方で、ブロックされた参照画像を特定して参照画像を前処理する方法について説明します。

## 簡潔な回答

Gemini の画像 API が HTTP 200 を返しても、レスポンスに **`candidates` がなく** `promptFeedback.blockReason`（多くは `OTHER`）のみが含まれている場合、そのリクエストは**生成が開始される前**にプロバイダーの入力チェックによってブロックされています。

* この種のブロックは通常数秒以内に返され、通常の画像よりもはるかに高速です
* `OTHER` には理由が記載されておらず、`safetyRatings` は空であることがよくあります
* これは**必ずしも prompt の書き方に関連しているとは限らず**、多くの場合、1枚の参照画像が原因でトリガーされます
* gemini-3-pro-image（Nano Banana Pro）は gemini-3.1-flash-image よりも厳格に入力をチェックするため、同じリクエストでも Pro ではブロックされ、Flash では成功することがあります

対処法は次のとおりです。**まずどの画像がブロックの引き金になっているかを特定し、その後すべての参照画像を一貫して前処理します**。

## 識別方法

典型的なレスポンスは以下のようになります。

```json theme={null}
{
  "promptFeedback": {
    "blockReason": "OTHER",
    "safetyRatings": []
  },
  "usageMetadata": {
    "promptTokenCount": 1919,
    "candidatesTokenCount": 0
  },
  "modelVersion": "gemini-3-pro-image",
  "responseId": "..."
}
```

| 特徴 | blockReason ブロック | NO\_IMAGE |
| - | - | - |
| エラー情報を含むフィールド | `promptFeedback.blockReason` | `candidates[0].finishReason` |
| `candidates` | なし | 存在しますが、`parts` は `null` |
| レスポンス時間 | 数秒以内 | 通常の生成と同等 |
| 主な原因 | 入力（通常は参照画像）がブロックされた | prompt 内の画像意図が不明確 |
| 対処方法 | 参照画像を特定して前処理を行う | prompt を修正。[NO\_IMAGE トラブルシューティング](/ja/faq/gemini-no-image) を参照 |

## テスト検証事例

2026年9月 (UTC+8) に、あるファッションカタログのリクエストを再実行しました。1つの prompt と6枚の参照画像（ポーズ、人物、シーン、衣装、靴と靴下のコラージュ、帽子）、アスペクト比 2:3、解像度 2K、`responseModalities: ["IMAGE"]` という構成です。

* gemini-3-pro-image は3回連続で `blockReason: OTHER` を返しましたが、同じリクエストが gemini-3.1-flash-image では成功しました
* 画像を繰り返し二分割して検証した結果、**トリガーとなっていたのは人物の参照画像のみであること**が判明しました。これは正面、背面、側面、顔のアップパネルを含む AI 生成のキャラクター設定シートでした
* その画像は、「背景を薄いグレーに変更してください」といった無関係な指示を含め、どのような prompt を指定してもブロックされました
* 最も疑っていた2枚の画像（ウォーターマーク入りの実在人物のポーズ写真と、ロゴ入りの帽子の写真）は、いずれも単体では通過しました

主な発見：

| 人物参照画像の送信方法 | 結果 |
| - | - |
| 元画像 | 13/13 ブロック |
| 異なるファイル形式の同一ピクセル（例：PNG として保存） | 2/2 ブロック |
| JPEG として再エクスポート（品質95、視覚的な差異なし） | 6/6 通過 |
| 再エクスポートした画像に差し替えた全6枚構成のリクエスト | 2/2 生成成功（正しい人物、ポーズ、衣装で生成） |

言い換えれば、このチェックは特定の画像の厳密なピクセルに対して非常に敏感である可能性があり、画像を一度再エクスポートするだけでリクエストが通るようになります。プロバイダーは `OTHER` が何に基づいているかを公開していないため、これ以上原因を特定することはできません。

<Info>
  この事例は、1つのリクエストで多数の参照画像を送信することや、複数のステップを単一の生成処理に統合すること自体が問題ではないことを示しています。`OTHER` が発生した場合は、prompt を書き直したりワークフローを分割したりする前に、まず原因となっている画像を特定してください。
</Info>

## 対象の画像を特定する方法

<Steps>
  <Step title="ステップ1：再現性を確認する">
    変更を加えずにリクエストを2〜3回再送信します。`blockReason`のブロックは通常、一貫して再現します。たまにしか失敗しない場合は、[NO\_IMAGE](/ja/faq/gemini-no-image)の類いである可能性が高くなります。
  </Step>

  <Step title="ステップ2：promptを除外する">
    すべての画像はそのまま残し、promptを「背景を薄いグレーに変更する」などの無関係でシンプルな指示に置き換えます。それでもブロックされる場合、原因は画像にあります。
  </Step>

  <Step title="ステップ3：画像を半分に分割する">
    それぞれの半分を個別に送信し、ブロックされ続けている半分のみを1枚の画像になるまで分割し続けます。6枚の画像であれば、最大でも3ラウンドで済みます。
  </Step>

  <Step title="ステップ4：その画像を修正する">
    後述の「推奨事項」に記載されている通りに画像を再エクスポートし、完全なリクエストを再度送信して確認します。
  </Step>
</Steps>

<Tip>
  絞り込みを行う際、1枚の画像が生成されればそのグループを「合格」とするのに十分であるため、繰り返す必要はありません。2回連続でブロックされれば、「ブロック」と判定するのに十分です。検索全体でも、通常は十数回程度の呼び出ししかかかりません。
</Tip>

## 推奨事項

### シナリオ1：手動作業（キャンバスやツールでの生成）

1. **アップロード前に参照画像を再エクスポートする**：任意の画像エディタ（内蔵のプレビューアプリや Photoshop など）を使用して、長辺を2048px以下、品質90〜95のJPEGとしてエクスポートします。
2. **大きな画像を縮小する**：長辺が3000〜4000pxの元画像は、結果に影響を与えることなく2048pxに縮小でき、アップロードも高速になります。
3. **リクエストが数秒以内に失敗した場合は、まず参照画像を疑う**：直近に追加した画像を再エクスポートして再試行してください。それでも解決しない場合は、上記のように画像を1枚ずつ確認します。
4. **人物の参照には全身画像を優先する**：上記のケースでは、キャラクターシートを分割したところ、正面の全身パネル単体で通過しました。キャラクターシートがブロックされ続ける場合は、その全身ビューのみを使用してみてください。
5. **一時的な代替手段**：Pro で画像が通過できない場合は、そのステップで gemini-3.1-flash-image を使用してください。

### シナリオ2：コード（自動処理）

**1. 個別の画像に対処するのではなく、送信前にすべての参照画像を前処理する**：sRGBに変換 → EXIFの向きを適用 → 長辺を2048pxに制限 → JPEGとして再エンコード（品質90〜95） → メタデータを削除。

主なメリットは、リクエストボディが大幅に小さくなり、アップロードが高速化されることです（上記のケースにおける元のリクエストは約4.6 MBでした）。また、このような `OTHER` によるブロックも削減できます。Node.js の例：

```javascript theme={null}
import sharp from "sharp";

async function normalizeReference(buffer) {
  return sharp(buffer, { failOn: "none" })
    .rotate()                       // apply the EXIF orientation
    .toColorspace("srgb")
    .resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();                    // metadata is dropped by default
}

// parts.push({ inlineData: { mimeType: "image/jpeg", data: (await normalizeReference(buf)).toString("base64") } });
```

Pillow を使用した Python での同様のパイプライン：

```python theme={null}
from io import BytesIO
from PIL import Image, ImageOps

def normalize_reference(raw: bytes) -> bytes:
    im = ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert("RGB")
    im.thumbnail((2048, 2048))
    out = BytesIO()
    im.save(out, "JPEG", quality=92)
    return out.getvalue()
```

**2. 失敗のタイプごとに異なる対応を行う**：

| レスポンス | 意味 | 推奨される対処法 |
| - | - | - |
| `promptFeedback.blockReason` が `OTHER` で、数秒以内に返却された場合 | プロバイダーのチェックにより入力がブロックされた。理由は非公開 | 異なるエンコード設定（例：品質88、長辺を1%縮小など）で自動的に1回再送信します。それでも失敗する場合は、Flash に切り替えるか、ユーザーに別の参照画像を要求してください |
| `blockReason` が `SAFETY` / `PROHIBITED_CONTENT`、または `finishReason` が `IMAGE_SAFETY` もしくは同等の場合 | 明示的なコンテンツ安全性ブロック | **再試行しないでください**。ユーザーに素材や説明文の変更を依頼してください |
| `finishReason` が `NO_IMAGE` かつ出力 tokens が0の場合 | prompt 内の画像意図が不明確 | prompt に「output the final image only, no text」を追加して再送信してください。[NO\_IMAGE トラブルシューティング](/ja/faq/gemini-no-image) を参照してください |

<Warning>
  自動再試行は、理由が不明な `OTHER` にのみ適用されます。明示的な安全性の理由である場合、画像の再エンコードによって結果を変更することはできませんし、変更すべきではありません。代わりにユーザーにコンテンツの調整を依頼してください。
</Warning>

**3. トラブルシューティングの詳細を記録する**：失敗するたびに、`responseId` および各参照画像のハッシュと寸法を記録します。これにより画像を迅速に特定できるようになり、サポートにお問い合わせいただく際に必要な情報を提供できます。

## よくある質問

<AccordionGroup>
  <Accordion title="なぜ flash では画像が生成されるのに、Pro ではブロックされるのですか？">
    2つのモデルでは異なる入力チェックが使用されており、Pro のほうがより厳格です。flash で通過した参照画像が Pro でブロックされるのは想定通りの挙動であり、リクエスト自体に誤りがあることを意味するわけではありません。
  </Accordion>

  <Accordion title="AIによって生成された参照画像もブロックされることがありますか？">
    はい。上記の事例でブロックされた画像は、ユーザー自身の写真から再生成されたキャラクターシートでした。画像がブロックされるかどうかは、その出所だけで単純に決まるわけではありません。本ページの説明に従って該当画像を特定し、前処理を行ってください。
  </Accordion>

  <Accordion title="1つのリクエストに6枚の参照画像を含めるのは多すぎますか？">
    上記の事例では、6枚の画像自体が問題だったわけではありません。該当する1枚の人物画像を差し替えた後は、6枚すべての画像を含んだリクエストでも正常に生成されました。
  </Accordion>

  <Accordion title="ブロックされたリクエストに対しても課金されますか？">
    そのリクエストに対して課金記録が作成されたかどうかについては、APIYI の呼び出しログをご確認ください。
  </Accordion>
</AccordionGroup>

## まだ解決しない場合はサポートにお問い合わせください

スムーズに対応できるよう、以下の情報を含めてご連絡ください：

* モデル名と token グループ；
* 完全なレスポンス（少なくとも `promptFeedback` および `responseId`）と `request ID`；
* 発生時刻（タイムゾーンを含む）；
* 特定した参照画像（共有可能な場合）。

<Warning>
  完全な API キーは絶対に送信しないでください。スクリーンショットやログを共有する前に、キーをマスキングしてください。
</Warning>

<CardGroup cols={2}>
  <Card title="WeCom サポート" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom サポートの QR コード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QR コードをスキャンするか、このカードをクリックしてサポートに直接お問い合わせください。
  </Card>

  <Card title="メールサポート" icon="mail">
    **サポート**: [support@apiyi.com](mailto:support@apiyi.com)

    件名に「blockReason」とモデル名を含めることを推奨します。
  </Card>
</CardGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Gemini 画像 API が NO_IMAGE を返す理由" icon="image-off" href="/ja/faq/gemini-no-image">
    不鮮明な prompt の意図によって画像が生成されない原因とその修正方法
  </Card>

  <Card title="Nano Banana 画像生成の失敗" icon="image-off" href="/ja/faq/nano-banana-image-failure">
    安全性、透かし除去、著名なIP、未成年者などの一般的な原因
  </Card>

  <Card title="Gemini 画像 API のエラーハンドリング" icon="triangle-alert" href="/ja/api-capabilities/gemini-image-error-handling">
    完全なレスポンス確認手順とユーザーフレンドリーなエラーメッセージ
  </Card>

  <Card title="ログ内の課金額はどのように確認すればよいですか？" icon="file-text" href="/ja/faq/log-billing-explained">
    呼び出しログを使用して、リクエストが成功し課金されたかを確認します
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.