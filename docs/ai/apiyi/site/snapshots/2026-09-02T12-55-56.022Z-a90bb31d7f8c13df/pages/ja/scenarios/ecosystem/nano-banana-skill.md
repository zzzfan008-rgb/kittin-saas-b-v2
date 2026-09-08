> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro 画像生成スキル

> APIYI 経由の Nano Banana Pro を活用し、Codex CLI、OpenCode、Gemini CLI、Cursor などで自然言語を使って画像を生成・編集するための、コミュニティ製オープンソース AI Agent スキルです。

## 概要

nano-banana-pro-image-gen は、コミュニティ提供のオープンソース AI Agent スキルで、**Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp** などで、1回の自然言語コマンドだけで画像を生成・編集できます。APIYI 経由で Nano Banana Pro モデルを呼び出します。複雑なセットアップは不要で、インストールするだけですぐ使えます。

<Info>
  **プロジェクト情報**

  * 🔗 ソースコード: `github.com/wuchubuzai2018/expert-skills-hub`
  * 🌐 スキルページ: `skills.sh/wuchubuzai2018/expert-skills-hub/nano-banana-pro-image-gen`
  * 👤 作者: wuchubuzai2018
  * ⭐ コミュニティ提供
</Info>

## このスキルが優れている理由

<CardGroup cols={2}>
  <Card title="1行で画像生成" icon="wand-sparkles">
    AIコーディングアシスタント内で自然言語で説明するだけで、エディタを離れずに高品質な画像を即座に生成できます
  </Card>

  <Card title="画像編集" icon="square-pen">
    既存の画像を編集用に渡したり、最大14枚の参照画像を使用したりできるため、スタイル転送や内容の変更が可能です
  </Card>

  <Card title="マルチプラットフォーム" icon="puzzle">
    Codex CLI、OpenCode、Gemini CLI、GitHub Copilot、Cursor、Amp などで動作します
  </Card>

  <Card title="柔軟な出力" icon="sliders-horizontal">
    10種類のアスペクト比 + 3段階の解像度（1K/2K/4K）に対応し、簡易プレビューから高解像度ポスターまで幅広くカバーします
  </Card>
</CardGroup>

## 対応 APIYI モデル

| モデル名            | モデル ID                       | 用途              | API ドキュメント                                          |
| --------------- | ---------------------------- | --------------- | --------------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview` | テキストから画像、画像から画像 | [ドキュメントを見る](/en/api-capabilities/nano-banana-image) |

<Tip>
  このスキルは Nano Banana Pro モデルを使用します。Nano Banana 2 でより高速かつ低コストにしたい場合は、[Nano Banana ComfyUI Nodes](/ja/scenarios/ecosystem/nano-banana-comfyui) をご覧ください。こちらは両方のモデルに対応しています。
</Tip>

## クイックスタート: 画像生成の3ステップ

<Steps>
  <Step title="ステップ 1: APIYI キーを取得する">
    1. [APIYI コンソール](https://api.apiyi.com) にアクセスして登録/ログインします
    2. トークンセクションに移動し、新しい API キーを生成します
    3. キーをコピーします（`sk-` で始まります）

    <Info>
      新規ユーザーには無料トライアルクレジットが付与され、Nano Banana の画像生成を体験できます。
    </Info>
  </Step>

  <Step title="ステップ 2: スキルをインストールする">
    以下のコマンドをターミナルで実行します。

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill nano-banana-pro-image-gen
    ```

    <Warning>
      Node.js が必要です。未インストールの場合は、ダウンロードするために `nodejs.org` を参照してください。Python はフォールバックのランタイムとして使用できます。
    </Warning>
  </Step>

  <Step title="ステップ 3: API キーを設定する">
    環境変数を設定します。

    ```bash theme={null}
    export APIYI_API_KEY="sk-your-apiyi-key"
    ```

    Windows PowerShell を使用している場合:

    ```powershell theme={null}
    $env:APIYI_API_KEY="sk-your-apiyi-key"
    ```

    <Tip>
      毎回設定しなくて済むように、環境変数を `~/.zshrc` または `~/.bashrc` に追加してください。
    </Tip>
  </Step>
</Steps>

設定は完了です。これで、Skills 対応の任意の AI コーディングツールで、画像生成を直接使用できます。

## 実践チュートリアル

### 使い方 1: コマンドラインでのテキストから画像生成

最も直接的な方法です — ターミナルに説明を入力して画像を生成します。

<CodeGroup>
  ```bash Node.js (推奨) theme={null}
  node scripts/generate_image.js \
    -p "An astronaut cat floating in space, Earth in the background, digital art style" \
    -f "astronaut-cat.png" \
    -a 16:9 \
    -r 2K
  ```

  ```bash Python theme={null}
  python scripts/generate_image.py \
    -p "An astronaut cat floating in space, Earth in the background, digital art style" \
    -f "astronaut-cat.png" \
    -a 16:9 \
    -r 2K
  ```
</CodeGroup>

### 使い方 2: 既存の画像を編集する

1つ以上の参照画像を渡し、望む変更内容を自然言語で説明します。

```bash theme={null}
node scripts/generate_image.js \
  -p "Convert this photo to Studio Ghibli animation style, keep the character composition" \
  -i "photo.jpg" \
  -f "ghibli-style.png" \
  -r 2K
```

複数の参照画像（最大14枚）に対応しており、自動的に Base64 に変換されます。

```bash theme={null}
node scripts/generate_image.js \
  -p "Merge these elements into a poster" \
  -i "bg.jpg" -i "logo.png" -i "text.png" \
  -f "poster.png" \
  -a 3:4 \
  -r 4K
```

### 使い方 3: AI コーディングアシスタント内で使う

Skill をインストールしたあと、対応する AI コーディングツールで自然言語コマンドを使用します。

* **Codex CLI / OpenCode**: 「4K で 16:9 のサイバーパンクな街並みの壁紙を生成して」
* **Cursor**: 「商品ロゴを生成して、ミニマルなスタイル、1:1 比率で」
* **Gemini CLI**: 「input.jpg を編集して、背景を夕焼けのビーチに変更して」

AI アシスタントが Skill を自動的に呼び出して画像を生成します。

## コマンドパラメータ

| パラメータ            | 短縮   | 必須  | 説明                        | 例                |
| ---------------- | ---- | --- | ------------------------- | ---------------- |
| `--prompt`       | `-p` | はい  | 画像の説明または編集指示              | `"a cat"`        |
| `--filename`     | `-f` | いいえ | 出力ファイルのパス（省略時は自動生成）       | `"output.png"`   |
| `--aspect-ratio` | `-a` | いいえ | アスペクト比                    | `16:9`           |
| `--resolution`   | `-r` | いいえ | 解像度（大文字である必要があります）        | `1K`, `2K`, `4K` |
| `--input-image`  | `-i` | いいえ | 入力画像のパス（複数指定可、最大14件）      | `"photo.jpg"`    |
| `--key`          | `-k` | いいえ | インライン API Key（環境変数の使用を推奨） | `"sk-xxx"`       |

### 対応アスペクト比

`1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `5:4`, `4:5`, `21:9`

### 解像度と処理時間

| 解像度       | 目安時間 | 適した用途         |
| --------- | ---- | ------------- |
| 1K        | 約30秒 | クイックプレビュー、テスト |
| 2K（デフォルト） | 1〜4分 | 日常利用、SNS      |
| 4K        | 長め   | HDポスター、印刷物    |

## よくある質問

<AccordionGroup>
  <Accordion title="インストールエラーですか？">
    以下を確認してください：

    1. Node.js がインストールされていること（確認するには `node -v` を実行してください）
    2. ネットワーク接続が正常に動作していること
    3. npx が利用できない場合は、リポジトリを手動でクローンしてください：

    ```bash theme={null}
    git clone https://github.com/wuchubuzai2018/expert-skills-hub.git
    ```

    その後、`skills/nano-banana-pro-image-gen` ディレクトリを Skills フォルダにコピーしてください。
  </Accordion>

  <Accordion title="API Key が無効ですか？">
    以下を確認してください：

    1. `APIYI_API_KEY` 環境変数が正しく設定されていること（`sk-` で始まること）
    2. APIYI アカウントの残高が十分にあること
    3. `-k` パラメータを使って、キーを直接渡してテストすることもできます
  </Accordion>

  <Accordion title="解像度パラメータが機能しませんか？">
    解像度は**大文字**で指定してください：`1K`、`2K`、`4K`。小文字の `1k`、`2k` は認識されません。
  </Accordion>

  <Accordion title="画像生成が遅いですか？">
    * 4K 解像度は本質的により長い処理時間が必要です（5分を超える場合があります）
    * まず 1K 解像度で prompt と構図を確認してください
    * 満足できたら、最終版は 2K または 4K に切り替えてください
  </Accordion>

  <Accordion title="APIYI API key を取得するには？">
    [APIYI コンソール](https://api.apiyi.com/token) にアクセスし、アカウントを登録して、Token セクションで新しいキーを生成してください。新規ユーザーには無料トライアルクレジットが付与されます。
  </Accordion>

  <Accordion title="どの AI コーディングツールが対応していますか？">
    現在対応しているのは、Codex CLI、OpenCode、Gemini CLI、GitHub Copilot、Cursor、Amp です。Skills プロトコルをサポートするツールなら、どれでも使用できます。
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="Nano Banana Pro ドキュメント" icon="banana" href="/en/api-capabilities/nano-banana-image">
    Nano Banana Pro の完全な API ドキュメントと料金を確認できます
  </Card>

  <Card title="APIYI GPT-Image 2 スキル（同じ作者）" icon="puzzle" href="/ja/scenarios/ecosystem/apiyi-gpt-image-skills">
    wuchubuzai2018 の `gpt-image-2` / `gpt-image-2-all` 向けの姉妹スキル
  </Card>

  <Card title="Nano Banana ComfyUI ノード" icon="workflow" href="/ja/scenarios/ecosystem/nano-banana-comfyui">
    ComfyUI で Nano Banana の画像生成を使用できます
  </Card>

  <Card title="画像生成失敗のトラブルシューティング" icon="circle-question-mark" href="/ja/faq/nano-banana-image-failure">
    Nano Banana 画像生成のトラブルシューティングガイド
  </Card>

  <Card title="APIYI - Token 管理" icon="settings" href="https://api.apiyi.com/token">
    APIキーを管理し、使用状況と残高を確認できます
  </Card>
</CardGroup>
