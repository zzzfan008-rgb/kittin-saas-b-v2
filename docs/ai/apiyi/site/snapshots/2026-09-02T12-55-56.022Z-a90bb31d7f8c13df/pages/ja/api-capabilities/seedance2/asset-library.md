> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 アセットライブラリ（キャラクター一貫動画）

> icover.ai アセットライブラリのオープンAPI（APIYIの製品）を使用して画像を取り込み、asset:// IDを取得し、その後 APIYI ゲートウェイ経由でキャラクター一貫動画を生成します。ゼロコードのWeb操作とREST APIのバッチ統合をサポートし、Seedance 2.0 APIでは無料で利用でき、年会費はかかりません。

<Info>
  **icover.ai** は APIYI のサブプロダクトで、AI動画生成のテスト用オンラインツールです。このアセットライブラリとその API は、開発者やお客様が「キャラクター一貫性のある動画」機能を提供するのに役立ちます。
</Info>

<Note>
  **アセットライブラリは APIYI で無料です — 年額料金はかかりません。** 公式には、この機能は別途購入するアドオンであり、フレームワーク契約のないお客様向けには年間6桁のCNYの契約となります（Volcengine でも直接販売しています）。私たちは長期利用のお客様を大切にしているため、[Seedance 2.0](/ja/api-capabilities/seedance2/overview) の API価格にはすでに含まれています。SD2 API を通常の用途でご利用のお客様には、通常のビジネス量では追加料金は発生しません。
</Note>

## アセットライブラリを利用する理由

キャラクターの一貫性を保った動画を生成する場合、Seedance 2.0 は**人間の顔を含む参照画像を直接受け付けません**（ディープフェイク対策フィルタリング）。まず画像を信頼済みアセットとして取り込み、`asset://xxx` アセット ID を取得して、その ID を動画生成リクエストで指定する必要があります。

このサービスが取り込み処理を代行します。**画像をアップロード → アセット ID を取得 → 動画を生成**するだけです。利用方法は 2 つあり、データは完全に共有されます。

| 方法         | おすすめの対象              | 要件               |
| ---------- | -------------------- | ---------------- |
| **Web UI** | すべてのユーザー、コード不要       | サインアップしてログインするだけ |
| **API**    | プログラムによるバッチ統合が必要な開発者 | 「アセットライブラリ KEY」  |

<Tip>
  **共有データ**: 同じアカウントでは、Web 経由と API 経由でアップロードしたアセットは同じライブラリに保存されます。API で作成したアセットは Web のアセット一覧 / アーカイブおよび動画ジェネレーターの参照画像選択画面に表示され、Web で作成したアセットは API 経由で一覧表示できます。

  **アセットライブラリは KEY ではなく icover.ai アカウントに紐づきます**: 同じアカウントで作成されたすべてのアセットライブラリ KEY は同等で、同じライブラリにアクセスします。KEY は単なる呼び出し認証情報であり、分離機能はありません。アセットはアカウントごとに分離され、自分のアセットのみ表示・操作できます。分離および複数チームでの共有オプションについては、以下の[よくある質問](#faq)をご覧ください。
</Tip>

<Warning>
  **2 種類の異なるキーがあります。混同しないでください**:

  * **アセットライブラリ KEY**（icover.ai で作成、`sk-...`）: このページのアセットライブラリ用エンドポイント（アップロード / 取り込み / クエリ / 削除）専用です。
  * **APIYI Seedance 動画トークン**（api.apiyi.com で作成、`sk-...`、`SeeDance2` グループを有効化。2.5 と 2.0 ファミリーで共有）: 動画生成エンドポイント専用です。
</Warning>

## 方法1: Web UI（初心者におすすめ）

<Steps>
  <Step title="サインアップしてログイン">
    [icover.ai アセットライブラリページ](https://icover.ai/en/seedance-official/asset-library)を開き、サインアップ / ログインします。
  </Step>

  <Step title="アップロードして取り込み">
    「Virtual Avatar Ingest」タブで、画像を選択し（複数選択に対応）→「Upload & Ingest」をクリックします。

    * アセットグループは任意です。システムが自動的にデフォルトグループを使用します。キャラクターごとにアセットを整理したい場合は、先にグループを作成してください。
    * 画像要件: jpeg / png / webp / bmp / tiff / gif / heic; アスペクト比 0.4–2.5; 辺の長さ 300–6000px; 各30MB未満。
  </Step>

  <Step title="アセット ID をコピー">
    10秒強ほど待ち、ステータスが「Active」に変わったら、`asset://xxx`アセット ID をコピーします。
  </Step>

  <Step title="動画を生成">
    [icover.ai video generator](https://icover.ai/en/seedance-official)に移動し、「Multimodal」モードに切り替え、参照画像タイプを「Asset」に設定してアセットを選択し、プロンプト内ではキャラクターを「Image 1」として参照します。
  </Step>
</Steps>

**実在人物アセット（Web版）**: 「Real-Person Verification」タブで3ステップです。1) 「Generate verification link」をクリックし、演者にQRコードをスキャン / スマホでリンクを開いてもらい、Volcengineアカウントにログインして、生体認証を完了してもらいます。2) 「Query verification result」をクリックして、演者専用の実在人物アセットグループを取得します。3) そのグループを選択してアセット（画像 / 動画 / 音声）をアップロードすると、顔の一貫性チェックに合格し、`asset://` IDs を取得できます。同じ演者が別のスタイリングでも同じグループを再利用でき、再認証は不要です。

<Frame caption="The asset library web UI: the ingest tab for manual uploads, the asset list / archive tab for browsing assets and copying asset:// IDs, and the real-person verification tab for verifying and uploading real-face assets">
  <img src="https://mintcdn.com/apiyillc/KMuJVpzJvYYPxQax/images/seedance2-asset-library-web-ui.jpg?fit=max&auto=format&n=KMuJVpzJvYYPxQax&q=85&s=1a1b0294e87aeba902589f59f22ca330" alt="SeeDance 2.0 アセットライブラリの Web UI: アセット一覧ページに、アクティブ状態のバッジ付きアセットカード、asset:// ID コピー ボタン、削除ボタンが表示されています" width="1600" height="1013" data-path="images/seedance2-asset-library-web-ui.jpg" />
</Frame>

<Tip>
  **キャラクターの一貫性のコツ**: 最良の結果を得るには、同じキャラクターの全身正面ショットと、無表情の正面顔アップを1つのアセットグループに入れてください。
</Tip>

## 方法2：API（開発者向け）

### ステップ 0: アセットライブラリ キーを作成する

icover.ai にログインしたら、設定 → アセットライブラリ キー（`icover.ai/en/settings/apikeys`）に移動し、`sk-...` 形式のキーを作成してください。

<Frame caption="Settings → Asset Library KEY: click the create button and copy the generated sk-... key (note this is separate from the APIYI Token entry in the sidebar)">
  <img src="https://mintcdn.com/apiyillc/KMuJVpzJvYYPxQax/images/seedance2-asset-library-key-create.png?fit=max&auto=format&n=KMuJVpzJvYYPxQax&q=85&s=b7aef248abd888990cc0890de84d93cc" alt="icover.ai の設定にあるアセットライブラリ キー管理ページ。作成ボタンと既存のキー一覧があります" width="1600" height="679" data-path="images/seedance2-asset-library-key-create.png" />
</Frame>

すべてのアセットライブラリ リクエストに含めてください:

```
Authorization: Bearer sk-your-asset-library-KEY
```

### ステップ 1: ファイルをアップロードして公開URLを取得する

アセットファイル（画像。実在人物のアセットは動画 / 音声もサポートします）は、まず公開URLから到達可能である必要があります。いずれかの方法を選んでください。

**A. すでに公開URLを持っている場合**（ご自身のCDN / ファイルホスト）→ ステップ 2 に進んでください。

**B. 当社のストレージにアップロードする場合**（2回の呼び出し: 署名付きアップロードURLをリクエスト → ファイルを PUT する）:

```bash theme={null}
# 1. Request a presigned upload URL
curl -X POST https://icover.ai/api/storage/presign \
  -H "Authorization: Bearer sk-your-asset-library-KEY" \
  -H "Content-Type: application/json" \
  -d '{"ext":"jpg","contentType":"image/jpeg"}'
# → { "code":0, "data": { "uploadUrl":"...", "publicUrl":"https://cdn.icover.ai/..." } }

# 2. PUT the file to uploadUrl (Content-Type must match the presign request)
curl -X PUT "the-uploadUrl-you-just-received" \
  -H "Content-Type: image/jpeg" \
  --data-binary @portrait.jpg
# Once it succeeds, publicUrl is your file's public address
# Same for video/audio: swap ext/contentType to mp4/video/mp4, mp3/audio/mpeg, etc.
```

### ステップ 2: アセットを取り込みます

```bash theme={null}
curl -X POST https://icover.ai/api/asset-library/assets \
  -H "Authorization: Bearer sk-your-asset-library-KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://cdn.icover.ai/uploads/seedance/xxx.jpg",
    "label": "actor-A-front"
  }'
# → Raw Volcengine response: { ..., "Result": { "Id": "asset-20260702xxxx-xxxxx" } }
```

* `groupId` は任意です。デフォルトのグループが自動的に使用 / 作成されます。キャラクターごとに整理するには、まず `POST /api/asset-library/groups {"name":"actor-A"}` してグループIDを取得し、次にここに `"groupId":"group-xxx"` を含めます。
* `label` は任意です。ウェブUIでアセットを識別しやすくなります。

### ステップ 3: アクティブになるまでポーリングする

Ingest は非同期です（画像1枚あたり約13秒、SLA なし）。返された ID を使ってポーリングしてください:

```bash theme={null}
curl https://icover.ai/api/asset-library/assets/asset-20260702xxxx-xxxxx \
  -H "Authorization: Bearer sk-your-asset-library-KEY"
# → Result.Status == "Active" means ready; "Failed" means re-upload
```

3秒ごとのポーリングを推奨します。`Active` なしで90秒経過した場合は、調査が必要なタイムアウトとして扱ってください。

### ステップ 4：アセット ID を使用して動画を生成する（APIYI 経由）

アセット ID を `asset://<Id>` として記述し、**ご自身の APIYI Seedance 動画 token**（アセットライブラリのキーではありません）を使用して APIYI を呼び出します。

```bash theme={null}
curl -X POST https://api.apiyi.com/seedance/api/v3/contents/generations/tasks \
  -H "Authorization: Bearer sk-your-APIYI-token" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "doubao-seedance-2-0-260128",
    "content": [
      {"type":"text","text":"The character in Image 1 smiles at the camera, slow push-in, natural light"},
      {"type":"image_url","image_url":{"url":"asset://asset-20260702xxxx-xxxxx"},"role":"reference_image"}
    ],
    "ratio":"16:9","duration":5,"resolution":"720p"
  }'
# Returns a task id; poll GET .../tasks/{id} until status=succeeded, then read content.video_url
```

<Warning>
  prompt 内ではアセットを「画像 1」として参照してください — **prompt にアセット ID の生の値を記述しないでください**。
</Warning>

モデルの選択、料金、解像度の表については [Seedance 2.0 概要](/ja/api-capabilities/seedance2/overview) を、完全な生成パラメータについては [動画生成 API](/ja/api-capabilities/seedance2/video-generation) を参照してください。実行可能なエンドツーエンドスクリプト（アップロード → 取り込み → 生成 → ダウンロード）については、[アセット参照ガイド](/ja/api-capabilities/seedance2/asset-reference) を参照してください。

### エンドポイント全一覧

| エンドポイント                                        | メソッド                  | 説明                                                                                                                                                                                                                        |
| ---------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/storage/presign`                         | POST                  | 署名付きファイルアップロード URL `{ext?, contentType?}` をリクエストします                                                                                                                                                                       |
| `/api/asset-library/groups`                    | POST / GET            | グループ `{name, description?}` を作成 / グループ一覧（本人確認グループを含む）を取得します                                                                                                                                                               |
| `/api/asset-library/assets`                    | POST / GET            | `{groupId?, imageUrl, label?, assetType?}` を取り込み（assetType は任意: `Image` / `Video` / `Audio`、デフォルトは Image）/ アセット一覧を取得します（`?groupId=`、`?pageNumber=`、`?pageSize=` はすべて任意。デフォルトは 1 ページ目、1 ページあたり 100 件、pageSize は 100 に上限あり） |
| `/api/asset-library/assets/{id}`               | GET / DELETE / PATCH  | ステータス確認 / 削除 / ラベル `{label}` を更新します                                                                                                                                                                                       |
| `/api/asset-library/real-person/sessions`      | POST / GET            | 本人確認 `{name?}` を開始 → H5 確認リンクと照会用資格情報を返します / 本人確認セッション一覧を取得します                                                                                                                                                            |
| `/api/asset-library/real-person/sessions/{id}` | POST / PATCH / DELETE | 確認結果を照会（成功時は本人確認アセットグループの GroupId を返します） / `{name}` の名前を変更 / レコードを削除します                                                                                                                                                   |
| `/api/asset-library/records`                   | GET                   | あなたのアセット + 本人確認アーカイブ（Web UI のデータソース）                                                                                                                                                                                      |

**レスポンス規約**:

* **単一項目エンドポイント**（グループ作成 / 取り込み / ステータス取得 / 削除）は、成功・失敗のいずれでも **生の Volcengine JSON** をそのまま返します。
* **リスト系エンドポイント**（`GET` on `groups` / `assets`）はマージされ、ご自身のアセットにフィルタリングされるため、**上流の出力と1バイト単位で一致するものではありません**。元の Volcengine フィールドはすべて保持され、さらに `_` をプレフィックスに持つ独自のメタデータフィールドがいくつか追加されます（例: `_library`）。**解析時は未知の `_` プレフィックス付きフィールドを無視してください** — それらが増えても破壊的変更ではありません。
* 当方独自のエラーは `[client] ` を先頭に付けたプレーンテキストです（400/401/403/404/502）。
* `records`、`real-person/sessions` の GET/PATCH/DELETE、およびアセット `PATCH` は `{code, message, data}` JSON を返します（code 0 = 成功）。

## 実在人物アセット（完全自動 API）

実在人物のポートレートでは、撮影される本人（アクター）が一度だけ **生体認証** を完了し、ポートレート権利の所有をソースで固定する必要があります。全体のフローは現在すべて API 駆動で、web UI の「実在人物認証」タブは、インターフェースを備えた同じフローです。

### ステップ 1: 認証セッションを開始して H5 リンクを取得する

```bash theme={null}
curl -X POST https://icover.ai/api/asset-library/real-person/sessions \
  -H "Authorization: Bearer sk-your-asset-library-KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"actor-A"}'
# → Raw Volcengine response: { "Result": { "BytedToken":"2026...", "H5Link":"https://ark.volcengine.com/..." } }
```

* `H5Link` をアクターに送って **スマートフォンで開いてもらいます**（または QR コードにしてスキャンしてもらいます）。アクターは個人の Volcengine アカウントにログインし、生体認証を完了します。照明やカメラアングルによって失敗することがあるため、その場合は再試行してください。
* `BytedToken` は照会用資格情報です。セッションと一緒に保存されます。`GET /api/asset-library/real-person/sessions` で、いつでもセッション一覧（id / status / h5Link を含む）を確認できます。

### ステップ 2: アクターが完了したら結果を照会する

```bash theme={null}
curl -X POST https://icover.ai/api/asset-library/real-person/sessions/{session-id} \
  -H "Authorization: Bearer sk-your-asset-library-KEY"
# Verified → { "Result": { "GroupId": "group-xxxx" } }  ← the actor's dedicated real-person asset group
# Not yet  → 404 NotFound.<token> (raw Volcengine text; this is normal — query again after verification)
```

`GroupId` を取得すると、セッションの status は `authorized` に変わり、実在人物アセットグループは自動的にアカウントへアーカイブされます（web UI のアセットグループにも表示されます）。**注**: 保留中の認証は、期限切れの資格情報と同じ `NotFound` を返します。両者を見分けることはできません。長時間使用されなかったリンクは期限切れになることがあります。その場合は、新しいセッションを開始してください。

### ステップ 3: 実在人物グループにアセットを送信する

仮想アバターと同じ ingest エンドポイントです。実在人物グループの `groupId` を渡すだけです。画像、動画、音声に対応しています。

```bash theme={null}
curl -X POST https://icover.ai/api/asset-library/assets \
  -H "Authorization: Bearer sk-your-asset-library-KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "group-xxxx",
    "imageUrl": "https://cdn.icover.ai/uploads/seedance/xxx.jpg",
    "label": "actor-A-front-full-body",
    "assetType": "Image"
  }'
```

その後は通常どおり `Active` までポーリングし、`asset://<Id>` で動画を生成します（ステップ 4 は変更ありません）。

**実在人物アセットのルールとフォーマット**:

* 1 つの実在人物グループに含められるのは **1 人のみ** です。同じアクターでスタイルが違っても同じグループを再利用でき、再認証は不要です。
* すべてのアップロードは **顔一致チェック** を通ります（動画は 1 秒ごとにサンプリングされ、サンプリングされたすべてのフレームが通過する必要があります）。横顔、複数人、ぼやけた素材は失敗します。鮮明な正面素材を使用してください。
* 画像は 30MB 未満、動画は mp4 / mov、2〜15 秒、50MB 以下、アスペクト比 0.4〜2.5、音声は mp3 / wav、2〜15 秒、15MB 以下です。

## Notes

<Warning>
  **asset:// ID は秘密情報として扱ってください**: アセットはこのサービスレイヤーで分離されており（一覧表示と削除から保護されています）が、Volcengine は ID による認可ができません。ID が漏えいすると、同じチャネル上の他の呼び出し元が生成リクエストでそれを参照できてしまいます。完全な所有権と分離モデルについては、以下の [よくある質問](#faq) をご覧ください。
</Warning>

* **画像 URL の有効期間**: query / list エンドポイントが返すプレビュー URL は、約12時間有効な一時アドレスです。長期保存のためにキャッシュしないでください。アセット ID 自体は永続です。
* **レート制限**（Volcengine アカウントレベル）: ステータス照会は 100 QPS、取り込みとその他の操作は約 10 QPS です。失敗時は同時実行数を制御し、再試行してください。
* **Web UI の状態同期**: API 経由で取り込み後、状態が一度も照会されていない場合、Web アーカイブには「processing」と表示されることがあります。実際の状態を同期するには、アセット一覧ページを開いて「Refresh List」をクリックしてください。

Volcengine の公式リファレンス（ブラウザにコピーしてください）: プライベートアセットライブラリガイド `volcengine.com/docs/82379/2333565`、実人物アセットのオンボーディング `volcengine.com/docs/82379/2315856`.

## FAQ

<AccordionGroup>
  <Accordion title="アセットライブラリは、参照画像を直接渡す場合と何が違いますか？">
    直接渡す参照画像には、写実的な人間の顔を含めることができません（ディープフェイク対策フィルターによって拒否されます）。ポートレートを信頼済みアセットとして取り込むと、その`asset://` IDを任意の数の生成タスクで再利用でき、エピソードやショットをまたいでキャラクターの顔と衣装の一貫性を保てます。アニメーションドラマ、ショートドラマ、IPキャラクターなど、連続性のあるコンテンツに最適です。実在人物をカメラに登場させることもできます。その場合は、上記で説明した実在人物認証フローを完了してください。
  </Accordion>

  <Accordion title="アセットライブラリには追加料金がかかりますか？自分で公式に有効化する場合とは何が違いますか？">
    APIYIでは**無料**です。Seedance 2.0 APIでそのままご利用ください。年間料金も、個別の契約も必要ありません。

    公式では、フレームワーク契約のない顧客の場合、プライベートアセットライブラリには**別途料金がかかります**。年間で中国人民元6桁規模の購入が必要です（Volcengineから直接購入することもできます）。つまり、自分で有効化する場合は、モデルの利用料金に加えて年間料金が発生し、通常は企業資格の確認や調達手続きも伴います。APIYI経由なら、Seedanceの動画tokenが1つあれば十分で、アセットライブラリをすぐに利用できます。

    長期利用のお客様を重視しているため、この費用はすでに当社のAPI料金に含まれています。SD2 APIを通常どおり利用するお客様であれば、通常の業務規模において追加料金はありません。
  </Accordion>

  <Accordion title="アセットライブラリはアカウントとKEYのどちらに紐づきますか？アセットの分離はどのように実装されていますか？">
    一言で言えば、**icover.aiがアセットを分離し、APIYIが統一された呼び出しを処理します。生成側が確認するのはアセットIDだけで、IDを持っていれば参照できます。**

    紐づくのは**アカウント**です。基盤アーキテクチャとしては、icover.aiの全ユーザーが1つの統合されたAPIYI Volcengineアカウントを共有し、アセットライブラリはそのアカウントに属します。icover.aiはサービスレベルで**アカウント単位の分離**を追加しており、各アカウントは自身のアセットのみを一覧表示・照会・削除でき、他のユーザーのアセットIDを見ることはできません。

    KEYによる分離はありません。同じアカウント配下にある複数のアセットライブラリKEYは同等で、同じライブラリにアクセスします。アセットを分離する必要がある場合（たとえば顧客間や事業部門間でデータを分ける場合）は、**関係者ごとに別のicover.aiアカウントを登録**し、それぞれのアカウントでKEYを作成してください。同じアカウントで新しいKEYを作成しても、何も分離されません。

    セキュリティ境界に注意してください。この分離で対象となるのは一覧表示・照会・削除です。VolcengineはIDによる認可には対応していないため、`asset://` IDが漏洩すると、同じチャネル上の他の呼び出し元が生成リクエストでそのIDを参照できます。アセットIDは秘密情報として扱ってください。
  </Accordion>

  <Accordion title="アセットはAPIYI / icover.aiの独自サーバーに保存されますか？">
    ファイルの渡し方によって異なります。

    * **公開URLを指定する場合**（独自のCDN / 画像ホスト）：元のファイルが**当社を経由することはありません**。そのURLをVolcengineに転送するだけです。
    * **`/api/storage/presign`経由でアップロードする場合**：公開URLを取得するため、ファイルはまず当社のオブジェクトストレージ（`cdn.icover.ai`）に保存され、その後Volcengineに転送されます。**元のファイルは当社のストレージに残ります。**

    いずれの場合も、アセット自体は最終的にVolcengine側で処理され、Volcengineから`asset://` IDが返されます。**当社独自のデータベースに保存するのは、そのIDとアカウント所有情報だけです**（上記で説明したアカウント単位の分離に使用します）。アセットのコンテンツ自体は記録しません。

    実在人物の顔を含むアセットには、追加の必須要件があります。撮影対象の人物本人が、対面で**ライブネス認証**を完了する必要があります（自身のVolcengineアカウントにログインして顔認証を実行します）。これにより、肖像権の所有者を元の認証時点で確実に確認できます。この認証を本人に代わって完了することは、他の人にはできません。完全なフローについては、上記の「実在人物の顔を含むアセット」を参照してください。
  </Accordion>

  <Accordion title="会社内の複数の部署 / チームで、アセットライブラリを共有または分離するにはどうすればよいですか？">
    **1つのライブラリを共有する（推奨、最も簡単）**：1つのアカウントと1つのKEYで十分です。独自システムでアセットIDを一元管理し、各部署に`asset://` IDを配布してください。動画生成リクエストで参照するにはIDを持っているだけで十分です（動画生成では各部署自身のAPIYI Seedance動画tokenを使用し、アセットライブラリKEYとは関係ありません）。同じアカウント配下に複数のKEYを作成し、それぞれを異なる部署に渡すこともできます（認証情報のローテーション / 失効に便利です）。ただし、これらのKEYは引き続き同じライブラリにアクセスします。

    **部署間で分離する**：部署ごとに別のicover.aiアカウントを登録し、それぞれのアカウントで独自のKEYを作成してください。分離の対象は一覧表示・照会・削除である点に注意してください。アセットIDが漏洩すると参照できるため、部署間であってもIDを不用意に共有しないでください。
  </Accordion>

  <Accordion title="これは完全な機能を備えたSeeDance 2.0ですか？">
    はい。APIYIのSeedanceチャネルでは、公式の完全機能版`doubao-seedance-2-5-260628`と`doubao-seedance-2-0-260128`を提供しています。モデルパラメータ、解像度、再生時間は公式サービスと同一で、機能を削減していません。モデルの詳細と料金については、[Seedance 2.0 / 2.5の概要](/ja/api-capabilities/seedance2/overview)を参照してください。
  </Accordion>

  <Accordion title="AI生成の写実的なポートレートは実在人物として扱われますか？アップロードするだけで認証済みになりますか？">
    いいえ、実在人物としては扱われません。現実世界に対応する人物が存在しないAI生成の写実的なポートレート（たとえばNano Bananaのようなモデルで生成されたキャラクター）は**バーチャルアバター**です。バーチャルアバターの取り込みフローをそのまま利用でき、認証手続きは必要ありません。実際に存在する**実在人物**の写真だけが実在人物の顔として扱われます。実在人物の場合、アップロードだけでは認証済みになりません。バーチャルアバターの取り込みチャネルでは拒否され、撮影対象の本人がライブネス認証を完了する必要があります（上記の実在人物の顔に関するセクションを参照してください）。

    キャラクター素材は次の3種類です。

    | 素材の種類                      | 例                          | 使用方法                                                        |
    | -------------------------- | -------------------------- | ----------------------------------------------------------- |
    | アニメ / スタイライズドキャラクター        | アニメ、漫画、3D漫画のキャラクター         | 写実的な顔を含まず、通常はブロックされません。公開URL / Base64の参照画像を直接使用でき、取り込みは不要です |
    | バーチャルアバター（AI生成の写実的なポートレート） | モデルで生成された、実在しない人物（下記の例を参照） | このページのバーチャルアバター取り込みを使用し、`asset://` IDを参照します                 |
    | 実在人物の顔                     | 著名人、モデル、またはユーザー本人の写真       | 完全自動の実在人物認証APIフローを使用します。本人がライブネス認証を完了すると利用できます              |

    <Frame caption="Virtual-avatar example: an AI-generated photorealistic portrait with no real-world counterpart. Put the frontal face close-up plus full-body front / side / back views into one asset group for the best character consistency">
      <img src="https://mintcdn.com/apiyillc/KMuJVpzJvYYPxQax/images/seedance2-virtual-avatar-example.jpg?fit=max&auto=format&n=KMuJVpzJvYYPxQax&q=85&s=64f656c3a49a8c678bf439d2d9b66552" alt="バーチャルアバターの例：伝統衣装を着た同じAI生成女性について、顔のクローズアップと、正面・側面・背面の全身ビュー" width="1600" height="900" data-path="images/seedance2-virtual-avatar-example.jpg" />
    </Frame>
  </Accordion>

  <Accordion title="生身のようなデジタルヒューマン（バーチャルアバター）には審査が必要ですか？">
    いいえ。バーチャルアバターの取り込みは完全自動です。手動審査も認証手続きも必要ありません。アップロード後、システムが画像を自動的に前処理し、約13秒でステータスがActiveに変わり、`asset://` IDをすぐに動画生成で使用できます。撮影対象の本人によるライブネス認証が必要なのは、**実在人物の顔**を含むアセットだけです（上記の実在人物の顔に関するセクションを参照してください）。
  </Accordion>

  <Accordion title="他のプロバイダーですでに取り込み / 認証済みのアセットを移行できますか？">
    そのまま再利用することはできません。Volcengineのアセットライブラリと実在人物認証はどちらも**基盤となるアカウントに紐づいている**ためです。他のプロバイダー経由で取得した`asset://` IDは、そのプロバイダーのVolcengineアカウントに属しており、APIYIチャネル経由で参照すると`asset not found`が返されます。アセットはこのサービスで再度取り込む必要があります。

    * **バーチャルアバターのアセット**：プログラムで一括移行できます。このページのAPI経由で元の画像を再アップロードするスクリプトを作成し、システム内の古いIDを新しい`asset://` IDに更新してください。独自システムにアセットIDのマッピングレイヤーを設けることを推奨します。業務データには内部IDだけを保存するため、後でプロバイダーを切り替える場合もマッピングを更新するだけで済みます。
    * **実在人物認証済みのアセット**：実在人物認証もアカウントに紐づいており、**移行できません。再認証が必要です**。撮影対象の本人が再度ライブネス認証を完了する必要があります（上記の実在人物の顔に関するセクションを参照してください）。
    * **消費者向けプロダクトへのアドバイス**：既存アセットを大量に保有している場合は、バックエンドジョブでバーチャルアセットをユーザーに気づかれない形で移行してください。ユーザーには通知されません。実在人物認証済みのアセットについては、システムのアップグレードや新バージョンのリリース時に再認証を促すと、より自然に受け入れられます。
  </Accordion>
</AccordionGroup>

## お問い合わせ

統合時に何らかの問題が発生した場合（取り込み失敗、本人確認、バッチ連携、本番 token の申請など）は、お気軽にお問い合わせください。連絡先は [api.apiyi.com](https://api.apiyi.com) のホームページにあります。
