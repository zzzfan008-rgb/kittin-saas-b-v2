> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Oxygen 動画生成

> AZ8 Oxygen (oxygen-1.0) 動画生成ガイド：テキスト、先頭フレーム、先頭・最終フレーム、参照画像/動画/音声による動画生成に対応した OpenAI Videos 互換 API。320p〜768p、4〜15 秒、1 秒あたり $0.02 で課金されます。

## 概要

Oxygenは、シンガポールを拠点とするAI動画作成プラットフォームAZ8（旧Videoinu）が提供する動画生成モデルです。APIYIでは、**OpenAI Videos**互換API（送信には`POST /v1/videos`、照会には`GET /v1/videos/{id}`）経由でこれを`oxygen-1.0`として提供しており、320p / 480p / 768pの解像度で4〜15秒のクリップを生成可能で、**解像度に関係なく1秒あたり\$0.02で課金**されます。

<Note>
  **ハイライト**：1つのモデルで、テキストからの動画生成、先頭フレーム指定動画、最初と最後のフレーム指定動画、そして最大9枚の画像、3本の動画、3つの音声クリップによる参照生成までカバーします。出力にはオーディオトラックが付属します。**1秒あたり\$0.02**：5秒のクリップは\$0.10、15秒のクリップは\$0.30で、失敗したタスクは自動的に返金されます。大量かつ低コストな動画生成向けに設計されています。
</Note>

<CardGroup cols={2}>
  <Card title="動画生成 APIリファレンス" icon="video" href="/ja/api-capabilities/oxygen/video-generation">
    送信、ポーリング、ダウンロードの手順に加え、Python / cURL / Node.jsのサンプルコードとライブPlaygroundを用意しています
  </Card>

  <Card title="チャージ特典" icon="gift" href="/ja/faq/recharge-promotions">
    チャージ特典により、実質価格をさらに抑えることができます
  </Card>
</CardGroup>

## AIエージェントに統合を任せる

<Note>
  Codex / Claude Code / Cursor で開発している場合は、以下の prompt をそこにコピーしてください。エージェントはまずこのページのプレーンテキスト版を取得し（任意の docs URL の末尾に `.md` を追加）、お使いの技術スタックに応じたコードを作成します。よくあるミスはすでに明記されています：必ず `size` を渡すこと、高度なパラメータは `input_reference` の JSON エンベロープに入れること、そして長さを設定する際は `seconds` のみを使用することです。
</Note>

<Prompt description="コーディングエージェントに Oxygen（oxygen-1.0）の動画生成を統合またはデバッグさせます。Codex、Claude Code、Cursor などにコピー＆ペーストしてください。" icon="bot" actions={["copy"]}>
  このプロジェクトで Oxygen（oxygen-1.0）の動画生成（テキストからの動画生成 / 最初のフレーム / 最初と最後のフレーム / 参照メディア）を統合またはデバッグしてください。

  コードを書く前にドキュメントを読んでください：このページのプレーンテキスト版を取得するには [https://docs.apiyi.com/en/api-capabilities/oxygen/overview.md](https://docs.apiyi.com/en/api-capabilities/oxygen/overview.md) をフェッチしてください。パラメータとコードサンプルは [https://docs.apiyi.com/en/api-capabilities/oxygen/video-generation.md](https://docs.apiyi.com/en/api-capabilities/oxygen/video-generation.md) にあります。

  要件：

  1. エンドポイント：OpenAI Videos 形式。`POST https://api.apiyi.com/v1/videos`（JSON）で送信し、`GET https://api.apiyi.com/v1/videos/{id}` でクエリします。送信するとすぐに `{"id": ..., "status": "queued"}` が返されるため、動画をポーリングします。

  2. ポーリングとステータス：全体のタイムアウトを15分とし、5秒ごとにクエリします。ステータスは `queued` / `in_progress` / `completed` / `failed` であり、**成功は `completed`** です。

  3. ファイルの取得：成功時は、レスポンスから直接 **`video_url`** をダウンロードします（認証ヘッダーは不要）。**`/v1/videos/{id}/content` に依存しないでください**：完了直後は 400 が返される場合があります。リンクは `expires_at`（約24時間）で有効期限が切れるため、すぐに独自のストレージにコピーしてください。

  4. 長さ：トップレベルの `seconds` が必須で、4から15までの整数（文字列の `"5"` も可）を指定し、**課金はそれに基づきます**。

  5. 解像度と向き：**常に `size` を明示的に渡してください**。指定がない場合、ゲートウェイが `720x1280` を補完し、縦向きの動画になります。`1280x720` / `720x1280` = 480p、`1792x1024` / `1024x1792` = 768p。

  6. 最初のフレームのみを使用した画像からの動画生成：`input_reference` に公開 https 画像 URL または data URI を設定します。出力は最初のフレームのアスペクト比に従います。

  7. 高度なパラメータ（最初と最後のフレーム、参照メディア、320p、1:1）：**`input_reference` 内の JSON 文字列（`{` で開始）に配置する必要があります**（例: `"input_reference": "{\"images\":[\"https://...first.png\"],\"last_image\":\"https://...last.png\"}"`）。使用可能なキー：`images`、`last_image`、`reference_images`（最大9件）、`reference_videos`（最大3件）、`reference_audios`（最大3件）、`resolution`（`320p` / `480p` / `768p`）、`aspect_ratio`（`16:9` / `9:16` / `1:1`）、`prompt`。**これらのフィールドをトップレベルに配置すると、エラーを出さずに暗黙的に無視（ドロップ）されます**。エンベロープ内に `duration` を含めることはできず（400エラー）、最初/最後のフレームを参照メディアと混在させることはできません。

  8. 課金と再試行：どの解像度でも1秒あたり \$0.02。送信時に課金され、タスクが `failed` で終了した場合は全額返金されます。送信時に 400 が返された場合は課金されません。まれに `upstream_error` が発生した場合は数分後に再送信してください。400 エラーの場合は再試行せずパラメータを修正してください。

  9. Token：**Pay-as-you-go Priority** 課金の `default` または `svip` グループ。キーは `APIYI_API_KEY` 環境変数から読み取り、決してハードコードしたり git にコミットしたりしないでください。

  10. 変更後、実際に `size: "1280x720"` を使用して4秒のテキストからの動画生成を1回実行し、`video_url` と呼び出しの費用（\$0.08 になるはずです）を提示してください。全体の処理フローには1〜3分かかります。サンドボックス環境ではコマンドのタイムアウトを600秒以上に設定するか、バックグラウンドで実行してください。
</Prompt>

<Accordion title="この prompt が防止する問題">
  | 要件 | 防止するミス |
  | - | - |
  | 常に `size` を渡す | 指定しない場合、ゲートウェイはデフォルトで縦向きサイズになるため、横向きのリクエストでも縦向きで返されます |
  | 高度なパラメータは `input_reference` エンベロープ内に配置 | トップレベルの `last_image`、`reference_images`、または `resolution` はエラーなしで暗黙的に無視（ドロップ）されます：最後のフレームは無視され、参照も無視され、解像度も不正になります |
  | 長さは `seconds` のみで指定 | エンベロープ内の `duration` は拒絶されます。課金とクリップの長さは両方とも `seconds` に従います |
  | `video_url` をダウンロード | ステータスが `completed` に変わった直後に `/content` を呼び出すと、400 が返されて失敗したように見える場合があります |
  | ファイルをすぐにコピー | リンクは約24時間後に期限切れになります |
</Accordion>

## なぜAPIYIのOxygenなのか？

<CardGroup cols={2}>
  <Card title="ボリューム価格" icon="receipt">
    解像度を問わず1秒あたり\$0.02、4秒で\$0.08。バッチ出力やA/Bテストのドラフト作成に最適です
  </Card>

  <Card title="自動返金" icon="shield-check">
    失敗したタスクは全額返金され、拒絶されたリクエストは無料となるため、実際に生成できた動画に対してのみ課金されます
  </Card>

  <Card title="OpenAI Videos互換" icon="plug">
    `/v1/videos`と同じ送信・照会パターンを採用しているため、既存のSoraスタイルのコードにほとんど変更を加える必要がありません
  </Card>

  <Card title="チャージボーナスの併用が可能" icon="gift">
    [チャージボーナス](/ja/faq/recharge-promotions)と組み合わせることで、実質コストをさらに抑えられます
  </Card>

  <Card title="充実した動画モデルラインナップ" icon="clapperboard">
    同じキーで[Seedance 2.0 / 2.5](/ja/api-capabilities/seedance2/overview)、[MiniMax-H3](/ja/api-capabilities/minimax-h3/overview)、[Wan2.7](/ja/api-capabilities/wan/overview)なども呼び出し可能です
  </Card>

  <Card title="グローバルアクセス" icon="globe">
    1つのAPIキーで`api.apiyi.com`に直接接続でき、海外アカウントを用意する必要はありません
  </Card>
</CardGroup>

## 主な機能

<CardGroup cols={2}>
  <Card title="4つの生成モード" icon="layers">
    テキスト、先頭フレーム、開始・終了フレーム、参照画像 / 動画 / 音声のすべてに1つのエンドポイントで対応
  </Card>

  <Card title="3つの解像度" icon="monitor">
    320p / 480p / 768pを同一料金で利用可能。必要に応じて速度と精細度のバランスを調整できます
  </Card>

  <Card title="4〜15秒の任意の整数秒" icon="timer">
    リクエストされた秒数単位で課金されるため、短いクリップほど低コストに抑えられます
  </Card>

  <Card title="オーディオ内蔵" icon="music">
    出力されるMP4に音声トラックが含まれるため、別途ダビングを行う必要はありません
  </Card>
</CardGroup>

## 料金

| 項目 | 料金 |
| - | - |
| 出力動画（320p / 480p / 768p、同一料金） | **\$0.02 / 秒** |
| 先頭フレーム、末尾フレーム、参照画像 / 動画 / 音声 | 追加料金なし |
| 例：4秒のクリップ | \$0.08 |
| 例：15秒のクリップ | \$0.30 |

<Note>価格は変更される場合があります。上記の表は参考用であり、トップナビゲーションの**モデル料金**タブの情報が正式なものとなります：[モデル料金](/en/models/index)。</Note>

<Info>
  **課金に関する注意事項**:

  * リクエストされた`seconds`に基づいて課金され、タスクが受け付けられた時点で請求されます。実際のクリップはわずかに長くなりますが（4秒のリクエストで約4.5秒）、追加料金はかかりません
  * 解像度、アスペクト比、および参照メディアは料金に影響しません
  * 失敗したタスク（プロバイダーのエラー、タイムアウトなど）は、**自動的に全額返金**されます
  * 400エラーが返されたリクエストは課金されません。照会およびダウンロードは無料です
</Info>

## グループ設定

`oxygen-1.0` は\*\*`default` グループで動作し\*\*、`svip` グループでも動作します。token の課金モードを**Pay-as-you-go Priority**に設定してください。呼び出し時に「no available channel in the current group」が返される場合、token のグループにこのモデルが含まれていないか、`model` 名に誤りがあります。

| 項目 | 要件 |
| - | - |
| グループ | `default` または `svip` |
| 課金モード | Pay-as-you-go Priority |
| モデル名 | `oxygen-1.0`（`-1.0` サフィックスが必須） |

## 技術仕様

| 項目 | 仕様 |
| - | - |
| モデルID | `oxygen-1.0` |
| 長さ | 4〜15秒の整数（トップレベルの`seconds`） |
| 解像度 | 320p / 480p（デフォルト）/ 768p |
| アスペクト比 | 横向き 16:9、縦向き 9:16、正方形 1:1。画像から動画（image-to-video）の場合は最初のフレームに準拠 |
| 出力サイズ（実測値） | 320p: 576×320、480p: 864×480 / 480×864 / 480×480、768p: 1344×768 / 768×1344 / 768×768 |
| 音声 | 出力にはオーディオトラックが含まれます |
| 画像入力 | 公開の https URL または画像 data URI |
| 参照メディア | 画像最大9件、動画最大3件、音声最大3件（動画および音声は https URL のみ） |
| 出力 | クエリレスポンス内の`video_url`経由でMP4を提供、有効期限は約24時間 |
| 生成時間 | 通常1〜3分、キューが混雑している場合は5分以上 |

## APIエンドポイント

| 用途 | メソッド | パス |
| - | - | - |
| タスク作成 | `POST` | `/v1/videos` |
| タスク照会 | `GET` | `/v1/videos/{id}` |
| ダウンロード（任意） | `GET` | `/v1/videos/{id}/content` |

<Tip>
  プライマリドメインは`https://api.apiyi.com`、バックアップドメインは`https://b.apiyi.com`で、パスは共通です。ダウンロードには、照会レスポンス内の`video_url`を直接使用してください。
</Tip>

## 生成モード

有効なトップレベルフィールドは、`model`、`prompt`、`seconds`、`size`、`input_reference`の5つのみです。最初と最後のフレーム、参照メディア、320p、および1:1は、**`input_reference` JSONエンベロープ（`{`で始まるJSON文字列）に含める高度なパラメータ**です。

| モード | 記述方法 | 解像度 / アスペクト比 |
| - | - | - |
| テキストからの動画生成 | `input_reference`を省略 | `size`によって設定 |
| 最初のフレームからの動画生成 | `input_reference` = 画像URLまたはdata URI | 解像度は`size`から取得、アスペクト比は最初のフレームに従う |
| 最初と最後のフレームからの動画生成 | エンベロープ `{"images":["first"],"last_image":"last"}` | 上記と同様 |
| 参照メディアからの動画生成 | エンベロープ `{"reference_images":[...],"reference_videos":[...],"reference_audios":[...]}` | `size`によって設定。`aspect_ratio`はエンベロープ内に配置可能 |
| 320p または 1:1 | エンベロープ `{"resolution":"320p","aspect_ratio":"1:1"}`（上記の任意のモードと組み合わせ可能） | エンベロープが`size`より優先 |

`size`の解像度へのマッピング:

| `size` | 解像度 | 向き |
| - | - | - |
| `1280x720` | 480p | 横向き 16:9 |
| `720x1280` | 480p | 縦向き 9:16 |
| `1792x1024` | 768p | 横向き 16:9 |
| `1024x1792` | 768p | 縦向き 9:16 |

エンベロープの例（最初と最後のフレーム）:

```json theme={null}
{
  "model": "oxygen-1.0",
  "prompt": "The glass sphere slowly dissolves into a deep blue abstract wave",
  "seconds": "5",
  "size": "1280x720",
  "input_reference": "{\"images\":[\"https://your-cdn.example.com/first.png\"],\"last_image\":\"https://your-cdn.example.com/last.png\"}"
}
```

<Warning>
  * `last_image`、`reference_images`、`resolution`、`aspect_ratio`、および同様のフィールドは、**トップレベルに配置された場合、通知なしに破棄されます**。エラーは発生せず通常の課金が行われますが、最後のフレームは無視され、参照も無視され、解像度は`size`に従います。これらは常に`input_reference`エンベロープ内に配置してください
  * **`duration`はエンベロープ内では許可されていません**。トップレベルの`seconds`を使用してください。無効なJSONやキーのスペルミスは、課金なしで400（`param: input_reference`）を返します
  * 最初/最後のフレームは、参照メディアと混在させることは**できません**
  * `input_reference`は**文字列**である必要があります。最初にエンベロープをシリアライズしてください（Pythonでは`json.dumps`、JSでは`JSON.stringify`）。オブジェクトまたは配列を直接渡すと拒否されます
</Warning>

## ベストプラクティス

<Steps>
  <Step title="まずは4秒でテストする">
    課金は秒単位で行われるため、10〜15秒の最終動画をレンダリングする前に、まずは4秒で構図やスタイルを確認してください
  </Step>

  <Step title="必ずsizeを設定する">
    横向きは`1280x720`、縦向きは`720x1280`。より詳細な描写には`1792x1024` / `1024x1792`（768p）を使用します
  </Step>

  <Step title="最初と最後のフレームには近いアスペクト比を使用する">
    出力は最初のフレームのアスペクト比に従います。最後のフレームの比率が大きく異なると、遷移時にトリミングされます
  </Step>

  <Step title="メディアは安定したパブリックストレージにホストする">
    直リンク防止（ホットリンク保護）や署名の有効期限切れによってダウンロードが失敗するのを防ぐため、独自のOSS / CDN直リンクを使用してください
  </Step>

  <Step title="15分のタイムアウトを設定し、5秒ごとにポーリングする">
    ほとんどのクリップは1〜3分で完了しますが、ピーク時にはさらに時間がかかる場合があります
  </Step>

  <Step title="video_urlをすぐに自身のストレージにコピーする">
    リンクは約24時間で期限切れになります。ダウンロードしてご自身のストレージから配信してください
  </Step>
</Steps>

## エラーコードと再試行

| ステージ | 症状 | 原因 | 対処法 |
| - | - | - | - |
| 送信 | 400、`invalid_params`、`param: input.duration` | `seconds` が 4〜15 の範囲外 | 長さを変更してください（課金されません） |
| 送信 | 400、`invalid_params`、`param: input_reference` | エンベロープの JSON が無効、不明なキー、またはエンベロープ内に `duration` が存在 | メッセージに従ってエンベロープを修正してください（課金されません） |
| 送信 | 400、`cannot unmarshal array ... input_reference` | `input_reference` が文字列ではなく配列またはオブジェクトとして送信された | `json.dumps` / `JSON.stringify` でシリアライズしてください |
| 送信 | 500、参照ファイルのダウンロードに失敗 | `input_reference` 内の画像 URL にアクセスできない | パブリックにアクセス可能な https URL を使用してください |
| 送信 | 503、利用可能なチャネルがありません | token グループにこのモデルが含まれていないか、モデル名のスペルが間違っています | グループと `oxygen-1.0` を確認してください |
| 実行 | `failed`、`upstream_error` | プロバイダー側での一時的なエラー | 数分後に再送信してください（返金済みです） |
| 実行 | `failed`、`upstream_timeout` | アップストリームでのキュー待機時間が長すぎ、制限時間に達した | 後で再送信してください（返金済みです） |

<Info>
  エラーの詳細はレスポンスの `message` フィールド内の JSON 文字列（例：`{"message":"{\"error\":{\"code\":\"invalid_params\",...}}","type":"task_error"}`）であるため、2回目のパースを行ってください。
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="横向きの動画を指定したのに縦向きで出力されたのはなぜですか？">
    `size` が渡されていませんでした。指定がない場合、ゲートウェイはデフォルトで `720x1280`（縦向き）になります。横向きにするには、明示的に `1280x720` または `1792x1024` を渡してください。
  </Accordion>

  <Accordion title="last_image や reference_images が反映されないのはなぜですか？">
    リクエストのトップレベルに配置されているためです。トップレベルで有効なのは `model`、`prompt`、`seconds`、`size`、および `input_reference` のみであり、それ以外は暗黙的に破棄されます。これらは `input_reference` の JSON エンベロープ内に配置してください。上記の「生成モード」を参照してください。
  </Accordion>

  <Accordion title="320p で出力するにはどうすればよいですか？resolution を渡しても反映されません。">
    トップレベルの `resolution` は破棄されます。エンベロープ内に配置してください：`"input_reference": "{\"resolution\":\"320p\"}"`。3 つの解像度はいずれも同じ料金です。
  </Accordion>

  <Accordion title="解像度によって料金は異なりますか？">
    いいえ、すべて 1 秒あたり \$0.02 です。320p はレンダリングが高速でファイルサイズが小さく、768p はより鮮明になります。
  </Accordion>

  <Accordion title="ステータスは completed なのに /content が 400 を返すのはなぜですか？">
    ステータスが `completed` に変わった直後は、`/v1/videos/{id}/content` の準備に数秒かかる場合があります。代わりにクエリレスポンスの `video_url` を使用してください。
  </Accordion>

  <Accordion title="動画リンクの有効期限はどのくらいですか？">
    約 24 時間です（クエリレスポンスの `expires_at` を参照してください）。速やかにダウンロードして保存してください。
  </Accordion>

  <Accordion title="失敗したタスクに対しても課金されますか？">
    いいえ。`failed` で終了したタスクは自動的に全額返金され、400 が返された送信には課金されません。
  </Accordion>

  <Accordion title="upstream_error がたまに発生した場合はどうすればよいですか？">
    これはプロバイダー側で時折発生する一時的なエラーであり、すでに返金されています。数分待ってから再送信すると通常は解決します。
  </Accordion>

  <Accordion title="クリップが指定した秒数（seconds）よりわずかに長くなるのはなぜですか？">
    出力はわずかに長くなります（4 秒の場合は約 4.5 秒、5 秒の場合は約 5.2 秒）。課金はリクエストされた `seconds` に基づいて行われるため、追加料金は発生しません。
  </Accordion>

  <Accordion title="最初のフレームに base64 は使用できますか？">
    はい。エンベロープ内の `input_reference` と `images` の両方で、画像データ URI（`data:image/jpeg;base64,...` など）を受け付けます。参照動画および音声は https URL のみ受け付けます。
  </Accordion>

  <Accordion title="画像から動画への生成（Image-to-Video）でアスペクト比を設定できますか？">
    いいえ。画像から動画への生成は最初のフレームのアスペクト比に従い、`aspect_ratio` は無視されます。解像度はエンベロープ内の `size` または `resolution` で選択可能です。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [Oxygen 動画生成 API リファレンス](/ja/api-capabilities/oxygen/video-generation)
* [MiniMax-H3 動画生成](/ja/api-capabilities/minimax-h3/overview)
* [Seedance 2.0 / 2.5 動画生成](/ja/api-capabilities/seedance2/overview)
* [Wan2.7 動画生成](/ja/api-capabilities/wan/overview)
* [チャージボーナス](/ja/faq/recharge-promotions)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.