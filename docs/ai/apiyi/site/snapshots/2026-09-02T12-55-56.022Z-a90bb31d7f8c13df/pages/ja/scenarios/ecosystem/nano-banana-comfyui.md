> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana ComfyUI ノード

> APIYI 経由で Nano Banana Pro と Nano Banana 2 の画像生成モデルを呼び出すための、コミュニティによるオープンソースの ComfyUI カスタムノードです。テキストから画像、画像から画像、マルチターンのチャット機能を備えています。

## 概要

ComfyUI-Nano-Banana-apiyi は、APIYI ユーザー向けに特化して作られた、コミュニティ提供の ComfyUI カスタムノード集です。Google の最も強力な画像生成モデルである Nano Banana Pro と Nano Banana 2 を、Google Cloud アカウントなしで ComfyUI ワークフロー内から直接呼び出せます。始めるのに必要なのは APIYI の API キーだけです。

<Info>
  **プロジェクト情報**

  * 🔗 ソースコード: `github.com/pdmaker/ComfyUI-Nano-Banana-apiyi`
  * 📜 ライセンス: MIT
  * 👤 作者: コミュニティ提供（元のリポジトリは削除され、現在はバックアップミラーを使用しています）
  * ⭐ コミュニティ提供、APIYI 向けに改変
</Info>

## このノードを選ぶ理由

<CardGroup cols={2}>
  <Card title="導入障壁ゼロ" icon="key">
    Google Cloud アカウントは不要です — APIYI キーで Nano Banana Pro と Nano Banana 2 のモデルにアクセスできます
  </Card>

  <Card title="マルチモーダル生成" icon="images">
    テキストから画像、画像から画像、最大 14 枚の参照画像を使ったマルチ画像融合で、あらゆるクリエイティブなニーズに対応します
  </Card>

  <Card title="マルチターンのチャット編集" icon="messages-square">
    コンテキストメモリを備えた独自の会話型画像生成で、反復的な洗練が可能です
  </Card>

  <Card title="超高解像度" icon="expand">
    512px、1K、2K、4K の出力に対応し、14 種類のアスペクト比でポスター、壁紙、SNS などをカバーします
  </Card>
</CardGroup>

## APIYI 対応モデル

| モデル名            | モデル ID                           | 特徴                  | API ドキュメント                                            |
| --------------- | -------------------------------- | ------------------- | ----------------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview`     | 旗艦級の品質、フル機能         | [ドキュメントを見る](/en/api-capabilities/nano-banana-image)   |
| Nano Banana 2   | `gemini-3.1-flash-image-preview` | Pro級の品質 + Flash級の速度 | [ドキュメントを見る](/en/api-capabilities/nano-banana-2-image) |

<Tip>
  **どのモデルを選ぶべきですか？** 最高品質を求めるなら Nano Banana Pro を選んでください。コストパフォーマンスを重視するなら Nano Banana 2 を選んでください（最安 \$0.025/画像）。どちらのモデルも同じ ComfyUI ワークフローで使用できます。
</Tip>

## 4つのコアノード

このプラグインは、異なるユースケースをカバーする4つの機能ノードを提供します。

| ノード名                         | モデル   | コア機能                                       | 最適用途     |
| ---------------------------- | ----- | ------------------------------------------ | -------- |
| **Nano Banana AIO**          | Pro   | テキストから画像生成 + 画像から画像生成（1〜6件の参照）+ 検索グラウンディング | 高品質な作成   |
| **Nano Banana マルチターンチャット**   | Pro   | 会話形式の画像編集                                  | 反復的な微調整  |
| **Nano Banana 2 AIO**        | Flash | テキストから画像生成 + 画像から画像生成（最大14件の参照）+ 画像検索      | 高速なバッチ生成 |
| **Nano Banana 2 マルチターンチャット** | Flash | 会話形式の編集 + 極端なアスペクト比                        | 素早い反復作業  |

## はじめに: インストールとセットアップ

<Steps>
  <Step title="ステップ 1: 前提条件の確認">
    次のものがインストールされていることを確認してください:

    * **ComfyUI**（最新バージョン）— 未インストールの場合は、こちらを参照してください: `github.com/comfyanonymous/ComfyUI`
    * **Python 3.12+**
    * **Git**

    <Warning>
      Python のバージョンは 3.12 以上である必要があります。より低いバージョンでは、依存関係のインストールに失敗する場合があります。
    </Warning>
  </Step>

  <Step title="ステップ 2: ノードコードのダウンロード">
    ターミナルを開き、ComfyUI の custom nodes ディレクトリに移動して、リポジトリを clone します:

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/pdmaker/ComfyUI-Nano-Banana-apiyi.git
    ```
  </Step>

  <Step title="ステップ 3: 依存関係のインストール">
    プラグインディレクトリに入り、必要な依存関係をインストールします:

    ```bash theme={null}
    cd ComfyUI-Nano-Banana-apiyi
    pip3 install -r requirements.txt
    ```

    Nano Banana 2 ノードのサポートも必要な場合は、こちらもインストールしてください:

    ```bash theme={null}
    pip3 install google-genai --upgrade
    ```
  </Step>

  <Step title="ステップ 4: APIYI キーを取得する">
    1. 登録/ログインするために [APIYI コンソール](https://api.apiyi.com) にアクセスします
    2. Token セクションに移動します
    3. 新しい API key を生成します
    4. キーをコピーします（`sk-` で始まります）

    <Info>
      新規ユーザーには無料トライアルクレジットが付与され、Nano Banana の画像生成を試すのに十分です。
    </Info>
  </Step>

  <Step title="ステップ 5: 環境変数を設定する">
    プラグインディレクトリでテンプレートファイルをコピーし、認証情報を入力してください:

    ```bash theme={null}
    cp .env.api.template .env
    ```

    `.env` ファイルを開き、APIYI キーと ベースURL を入力します:

    ```bash theme={null}
    GOOGLE_API_KEY=sk-your-apiyi-key
    CUSTOM_BASE_URL=https://api.apiyi.com
    ```

    <Tip>
      **重要な設定**: すべてのリクエストが APIYI 経由でルーティングされるように、`CUSTOM_BASE_URL` は `https://api.apiyi.com` に設定する必要があります。これにより Google Cloud アカウントは不要になります。コードは正しい API バージョンのパスを自動的に追加します。
    </Tip>
  </Step>

  <Step title="ステップ 6: ComfyUI を再起動して確認する">
    ComfyUI を再起動した後、ノード一覧で `Nano Banana` を検索してください。次の 4 つの新しいノードが表示されるはずです:

    * Nano Banana AIO
    * Nano Banana Multi-Turn Chat
    * Nano Banana 2 AIO
    * Nano Banana 2 Multi-Turn Chat

    これらのノードが表示されれば、インストールは成功です！
  </Step>
</Steps>

## テキストから画像への実践チュートリアル

### シナリオ 1: テキストから画像へ（基本）

最もシンプルな使い方です。テキストの説明を入力して、画像を生成します。

<Steps>
  <Step title="ノードを追加">
    ComfyUI のキャンバスを右クリックし、**Nano Banana AIO** ノード（または Nano Banana 2 AIO）を検索して追加します。
  </Step>

  <Step title="prompt を入力">
    `prompt` フィールドに希望する画像の説明を入力します。たとえば:

    ```
    An orange tabby cat sitting on a windowsill, Tokyo nightscape outside, cyberpunk style, neon lights, high detail, cinematic quality
    ```
  </Step>

  <Step title="パラメータを設定">
    * **image\_count**: 生成する画像数（1-10）
    * **aspect\_ratio**: 比率を選択します。たとえば、`16:9`（横長の壁紙）または `9:16`（スマホ用壁紙）
    * **image\_size**: 解像度 — `2K` または `4K` を推奨します
    * **temperature**: 創造性のレベル。0.0 が最も保守的で、2.0 が最も創造的です
  </Step>

  <Step title="ワークフローを実行">
    ComfyUI の **Queue Prompt** ボタンをクリックし、数秒待つと生成された画像が表示されます。
  </Step>
</Steps>

### シナリオ 2: 画像編集と融合

参考画像を使って生成を誘導します。スタイル変換、要素の融合などに最適です。

1. 参考画像を **Nano Banana AIO** ノードの `image_1` から `image_6` までの入力に接続します
2. `prompt` に希望する効果を記述します。たとえば、「この写真を水彩画風に変換してください」
3. モデルが参考画像とテキスト説明を組み合わせて、新しい画像を生成します

<Tip>
  **Nano Banana 2 AIO 専用**: 最大 14 枚の参考画像（10 objects + 4 キャラクター一貫性参照）に対応しており、見た目の一貫したキャラクターが必要なクリエイティブ制作に最適です。
</Tip>

### シナリオ 3: 複数ターンの会話型編集

最もユニークな機能です。チャットするように、画像を段階的に調整できます。

1. **Nano Banana Multi-Turn Chat** ノードを追加します
2. 1回目: 初期説明を入力して、ベース画像を生成します
3. 2回目: 変更内容を入力します。たとえば、「背景をビーチに変更してください」
4. 3回目: さらに調整を続けます。たとえば、「夕焼けの光を追加してください」
5. 各ラウンドは会話のメモリを引き継いで進みます

会話履歴をクリアして新しく始めるには、`reset_chat` を切り替えます。

## ノードパラメーターリファレンス

### Nano Banana AIO / Nano Banana 2 AIO

| パラメーター                    | 型       | 必須  | 説明                          |
| ------------------------- | ------- | --- | --------------------------- |
| `prompt`                  | string  | Yes | 画像説明テキスト                    |
| `image_count`             | integer | No  | 画像数（1-10）、デフォルト 1           |
| `aspect_ratio`            | enum    | No  | アスペクト比（11種類 / NB2 は 14種類）   |
| `image_size`              | enum    | No  | 解像度: 512px（NB2 のみ）、1K、2K、4K |
| `temperature`             | float   | No  | 創造性 0.0-2.0                 |
| `use_search`              | boolean | No  | Google 検索の grounding を有効化   |
| `image_1` \~ `image_6/14` | image   | No  | 参照画像入力                      |

### 対応アスペクト比

| 標準（両ノード共通）              | Nano Banana 2 専用 |
| ----------------------- | ---------------- |
| 1:1, 2:3, 3:2, 3:4, 4:3 | 1:4（超縦長）         |
| 4:5, 5:4, 9:16, 16:9    | 4:1（超横長）         |
| 21:9, Auto（AI による自動選択）  | 1:8, 8:1（極端な比率）  |

## よくある質問

<AccordionGroup>
  <Accordion title="インストール後にノードが見つかりませんか？">
    次の点を確認してください。

    1. プラグインフォルダは `ComfyUI/custom_nodes/` ディレクトリにあります
    2. `pip3 install -r requirements.txt` を実行しました
    3. Nano Banana 2 ノードの場合は、`pip install google-genai --upgrade` も実行してください
    4. ComfyUI を**再起動**しました（ブラウザを更新しただけではだめです — バックエンドを再起動してください）
  </Accordion>

  <Accordion title="API Key が無効というエラーですか？">
    次の点を確認してください。

    1. `GOOGLE_API_KEY` in `.env` ファイルの内容が APIYI のキーであること（`sk-` で始まる）
    2. `CUSTOM_BASE_URL` が `https://api.apiyi.com` に設定されていること
    3. APIYI アカウントの残高が十分であること（コンソールで確認してください）
  </Accordion>

  <Accordion title="生成が遅い、またはタイムアウトしますか？">
    * 4K 解像度は時間がかかります — テストではまず 1K をお試しください
    * 複数の画像（image\_count が 1 より大きい）は処理時間が長くなります
    * タイムアウトが頻発する場合は、解像度を下げるか画像枚数を減らしてください
  </Accordion>

  <Accordion title="Nano Banana Pro と Nano Banana 2 — どちらを選ぶべきですか？">
    * **Nano Banana Pro** (`gemini-3-pro-image-preview`): より繊細な品質で、高品質な作品作成に最適です
    * **Nano Banana 2** (`gemini-3.1-flash-image-preview`): より高速で安価（\$0.025/image から）、参照画像数が多く、極端な比率にも対応します
    * 日常的な作成には Nano Banana 2 を推奨します。最高品質を求めるなら Pro を選んでください
  </Accordion>

  <Accordion title="APIYI の API key を取得するには？">
    [APIYI コンソール](https://api.apiyi.com/token) にアクセスし、アカウントを登録して、Token セクションで新しいキーを生成してください。新規ユーザーには無料トライアルクレジットが付与されます。
  </Accordion>

  <Accordion title="コンテンツ安全性のために画像生成に失敗しましたか？">
    Nano Banana モデルにはコンテンツ安全性チェックが組み込まれています。説明内容によっては制限が発動する場合があります。対処法:

    1. 敏感な内容を避けるように prompt を調整してください
    2. さらに詳しくは [Nano Banana Image Failure Troubleshooting](/ja/faq/nano-banana-image-failure) をご覧ください
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="Nano Banana Pro ドキュメント" icon="banana" href="/en/api-capabilities/nano-banana-image">
    Nano Banana Pro の完全な API ドキュメントと料金を確認できます
  </Card>

  <Card title="Nano Banana 2 ドキュメント" icon="banana" href="/en/api-capabilities/nano-banana-2-image">
    Nano Banana 2 の完全な API ドキュメントと料金を確認できます
  </Card>

  <Card title="画像生成失敗のトラブルシューティング" icon="circle-question-mark" href="/ja/faq/nano-banana-image-failure">
    Nano Banana の画像生成トラブルシューティングガイド
  </Card>

  <Card title="APIYI - Token 管理" icon="settings" href="https://api.apiyi.com/token">
    APIキーを管理し、使用状況と残高を確認できます
  </Card>
</CardGroup>
