> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI GPT-Image 2 画像生成スキル

> コミュニティ提供のデュアルスキルパック: Codex CLI、Cursor、Gemini CLI、その他のAIコーディングツールから、1文で gpt-image-2（公式）と gpt-image-2-all（リバース）を呼び出せます。

## 概要

`apiyi-gpt-image-2-gen` と `apiyi-gpt-image-2-all-gen` は、コミュニティユーザー wuchubuzai2018 が提供した 2 つのオープンソース AI Agent スキルです。これらを使うと、APIYI の 2 つの OpenAI GPT 画像モデルである、**公式 `gpt-image-2`**（きめ細かな制御、token ベース課金、4K）と**リバース `gpt-image-2-all`**（会話型、呼び出しごとの課金、ChatGPT との同等性）を、**Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp** をはじめとする任意の Skills 対応ツールから、1 つの自然言語 prompt だけで直接呼び出せます。

<Info>
  **プロジェクト情報**

  * 🔗 ソース: `github.com/wuchubuzai2018/expert-skills-hub`
  * 📦 スキルID: `apiyi-gpt-image-2-gen`（公式）、`apiyi-gpt-image-2-all-gen`（リバース）
  * 👤 作者: wuchubuzai2018
  * ⭐ コミュニティによる貢献で、作者の [Nano Banana Pro Image-Gen Skill](/ja/scenarios/ecosystem/nano-banana-skill) と同じリポジトリを共有しています
</Info>

<Tip>
  **どのスキルを選べばよいですか？**

  * **`apiyi-gpt-image-2-gen`（公式、推奨）**: 制御しやすい `size / quality / output-format / compression`、4K（3840×2160）、カスタムサイズ、セマンティック編集をサポートします。token ベース課金で、品質やサイズに明確な要件がある場合に最適です
  * **`apiyi-gpt-image-2-all-gen`（リバース）**: 必要なのは `prompt` と、任意の `response-format` だけです。サイズ/比率は prompt 内で指定します。呼び出しごとの課金（\$0.03/call）で、ChatGPT の Web 体験と同等です。自然言語でそのまま出力したい場合、強いテキスト描画、反復編集に最適です
  * 並べて比較: [公式 vs リバースの比較](/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
</Tip>

## 主な機能

<CardGroup cols={2}>
  <Card title="一文での画像生成" icon="wand-sparkles">
    AI コーディングアシスタント内で中国語または英語でそのまま記述すると、画像が返ってきます
  </Card>

  <Card title="デュアルモデル対応" icon="layers">
    公式 `gpt-image-2` とリバース `gpt-image-2-all` の両方が利用可能です — シナリオに応じて選べます
  </Card>

  <Card title="4K + カスタムサイズ（公式）" icon="image">
    公式 Skill は 1024²、1536×1024、2048²、**3840×2160** のプリセットとカスタム寸法に対応しています
  </Card>

  <Card title="品質 / 形式制御（公式）" icon="sliders-horizontal">
    `quality`（low / medium / high / auto）+ 出力形式（png / jpeg / webp）+ 圧縮 0-100
  </Card>

  <Card title="参照画像は最大5枚" icon="images">
    両方の Skill は、マルチ画像融合とスタイル転送のために、最大5枚の重ねた参照画像に対応しています
  </Card>

  <Card title="マルチツール対応" icon="puzzle">
    Codex CLI、OpenCode、Gemini CLI、GitHub Copilot、Cursor、Amp で動作します
  </Card>

  <Card title="Node.js + Python ランタイム" icon="terminal">
    `generate_image.js` と `generate_image.py` の両方を同梱しています
  </Card>

  <Card title="手間いらずのセットアップ" icon="key">
    `APIYI_API_KEY` を一度設定すれば、`-k` で一時的に上書きできます
  </Card>
</CardGroup>

## 対応APIYIモデル

| モデル                   | モデルID             | 機能                          | 課金           | APIドキュメント                                           |
| --------------------- | ----------------- | --------------------------- | ------------ | --------------------------------------------------- |
| GPT-Image 2（公式、推奨）    | `gpt-image-2`     | `apiyi-gpt-image-2-gen`     | tokenごとの従量課金 | [表示](/ja/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 All（リバース） | `gpt-image-2-all` | `apiyi-gpt-image-2-all-gen` | \$0.03/回     | [表示](/ja/api-capabilities/gpt-image-2-all/overview) |

## クイックスタート: 3ステップ

<Steps>
  <Step title="ステップ1: APIYIキーを取得する">
    1. [APIYIコンソール](https://api.apiyi.com)にアクセスしてサインインする
    2. **トークン**の下で、新しいキーを生成します（`sk-`で始まります）
    3. 推奨: 使用上限付きの専用キーを作成します

    <Info>
      新規ユーザーには無料トライアル残高が付与されます — 2つのGPT画像モデルを試すのに十分です。
    </Info>
  </Step>

  <Step title="ステップ2: スキルをインストールする — どちらか一方を選ぶか、両方をインストールします">
    **公式 `gpt-image-2`（推奨）**:

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill apiyi-gpt-image-2-gen
    ```

    **リバース `gpt-image-2-all`**:

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill apiyi-gpt-image-2-all-gen
    ```

    <Warning>
      Node.js が必要です。Python スクリプトはバックアップ実行環境として使えます。Node.js がインストールされていない場合は、`nodejs.org` から入手してください。
    </Warning>
  </Step>

  <Step title="ステップ3: APIキーを設定する">
    環境変数を設定します（`~/.zshrc` / `~/.bashrc` に永続化することを推奨します）:

    ```bash theme={null}
    export APIYI_API_KEY="sk-your-apiyi-key"
    ```

    Windows PowerShell:

    ```powershell theme={null}
    $env:APIYI_API_KEY="sk-your-apiyi-key"
    ```
  </Step>
</Steps>

完了です！Skills対応のAIコーディングツールなら、自然言語でこの2つのスキルを起動できるようになりました。

## コマンドラインパラメータ

### `apiyi-gpt-image-2-gen`（公式）

| Parameter              | Short | Required | Description                                                                                                   | Example                    |
| ---------------------- | ----- | -------- | ------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `--prompt`             | `-p`  | Yes      | 生成 prompt または編集指示                                                                                             | `"An orange cat on grass"` |
| `--filename`           | `-f`  | No       | 出力パス（省略時は自動でタイムスタンプ付き）                                                                                        | `"cat.png"`                |
| `--size`               | `-s`  | No       | プリセット（`1024x1024` / `1536x1024` / `1024x1536` / `2048x2048` / `2048x1152` / `3840x2160` / `2160x3840`）またはカスタム | `"2048x1152"`              |
| `--quality`            | `-q`  | No       | `low` / `medium` / `high` / `auto`                                                                            | `"high"`                   |
| `--output-format`      | `-o`  | No       | `png`（デフォルト）/ `jpeg` / `webp`                                                                                 | `"webp"`                   |
| `--output-compression` | `-c`  | No       | 0-100（jpeg / webp のみ）                                                                                         | `80`                       |
| `--input-image`        | `-i`  | No       | 参照画像、最大 5 枚                                                                                                   | `"portrait.png"`           |
| `--api-key`            | `-k`  | No       | 1 回分の環境変数を上書き                                                                                                 | `"sk-xxx"`                 |

**対応アスペクト比**: `1:1`, `3:2`, `2:3`, `16:9`, `9:16`, および 3:1 以内の任意のカスタム比率。

**カスタムサイズの制約**: 各辺は 3840px 以下、両方の寸法は 16 で割り切れること、総ピクセル数は 655,360 から 8,294,400 の間であること。

**通常のレイテンシ**: 1 リクエストあたり 120〜150 秒（複雑な 4K シーンではさらに長くなります）。

### `apiyi-gpt-image-2-all-gen`（逆）

| Parameter           | Short | Required | Description                                  | Example                            |
| ------------------- | ----- | -------- | -------------------------------------------- | ---------------------------------- |
| `--prompt`          | `-p`  | Yes      | 会話形式の prompt（サイズ/比率は prompt 内で記述）            | `"widescreen 16:9 cyberpunk city"` |
| `--filename`        | `-f`  | No       | 出力パス（省略時は自動でタイムスタンプ付き PNG）                   | `"city.png"`                       |
| `--response-format` | `-r`  | No       | `url`（デフォルト、R2 CDN で約 24 時間有効）または `b64_json` | `"b64_json"`                       |
| `--input-image`     | `-i`  | No       | 参照画像、最大 5 枚                                  | `"ref.png"`                        |
| `--api-key`         | `-k`  | No       | 1 回分の環境変数を上書き                                | `"sk-xxx"`                         |

<Info>
  reverse スキルは `size` / `quality` / `aspect_ratio` の CLI フラグを**受け付けません**。それらはすべて prompt に記述してください（例: `"vertical 9:16 mobile poster"`, `"1024x1024 square"`）。レイテンシ: 60〜300 秒。
</Info>

## 使用例

### 例1: 公式の text-to-image を精密に制御

```bash theme={null}
node scripts/generate_image.js \
  -p "Cinematic product shot of a minimalist ceramic teacup, soft morning light, 35mm lens" \
  -f "teacup.png" \
  -s "3840x2160" \
  -q "high" \
  -o "png"
```

### 例2: 公式の画像編集（参照画像）

```bash theme={null}
node scripts/generate_image.js \
  -p "replace the background with a sunset beach, keep the subject intact" \
  -i "portrait.png" \
  -f "portrait-beach.jpg" \
  -s "2048x1152" \
  -q "high" \
  -o "jpeg" \
  -c 85
```

### 例3: 公式の複数画像融合

```bash theme={null}
node scripts/generate_image.js \
  -p "put the person from img 1 into the scene from img 2, lighting style from img 3" \
  -i person.png scene.png light.png \
  -f merged.png \
  -q high
```

### 例4: 逆会話式（サイズは prompt で指定）

```bash theme={null}
node scripts/generate_image.js \
  -p "widescreen 16:9 cinematic frame: a girl in hanfu under cherry blossoms, watercolor style, soft light" \
  -f "sakura.png" \
  -r url
```

### 例5: AIコーディングツールから呼び出す

インストール後は、Cursor / Codex CLI などでアシスタントにそのまま依頼するだけです。

* 「apiyi-gpt-image-2-gen を使って 3840x2160 の高品質なサイバーパンク都市の壁紙を生成して」
* 「apiyi-gpt-image-2-all-gen を呼び出して photo.jpg をスタジオジブリ風に変換して」
* 「公式スキルを使って 1:1 のロゴを高品質、webp 形式で作成して」

アシスタントが適切なスキルを選び、CLI のフラグを組み立ててくれます。

## FAQ

<AccordionGroup>
  <Accordion title="どのスキルを選べばよいですか？">
    * **正確なサイズ**（例: 3840×2160）、**品質段階**（low/medium/high）、または**特定の出力フォーマット**（webp / compression）が必要な場合 → **公式 `apiyi-gpt-image-2-gen`** を選んでください
    * **ChatGPT と同等の会話フロー**、**1回ごとの一律料金**（\$0.03）、**強力なテキスト描画**を重視し、サイズを自然言語で表現しても問題ない場合 → **リバース `apiyi-gpt-image-2-all-gen`** を選んでください
    * 完全な比較: [公式版とリバース版の比較](/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="`npx skills` のインストールに失敗する">
    1. Node.js がインストールされていることを確認してください（`node -v`）
    2. GitHub へのネットワークアクセスを確認してください
    3. `npx skills` が利用できない場合は、手動でクローンしてください:

    ```bash theme={null}
    git clone https://github.com/wuchubuzai2018/expert-skills-hub.git
    ```

    その後、`skills/apiyi-gpt-image-2-gen` または `skills/apiyi-gpt-image-2-all-gen` のどちらかをローカルの Skills ディレクトリにコピーしてください。
  </Accordion>

  <Accordion title="API key が無効というエラー">
    1. `APIYI_API_KEY` が正しく設定されていることを確認してください（`sk-` で始まります）
    2. 残高 — [残高は十分に見えるのに呼び出しに失敗する](/ja/faq/balance-insufficient) を参照してください
    3. 簡単なテストとして、`-k "sk-xxx"` をインラインで渡してください
  </Accordion>

  <Accordion title="公式スキルがカスタムサイズを拒否する">
    カスタム `size` は次を満たす必要があります:

    * 各辺は 3840px 以下
    * 両方の寸法が 16 で割り切れること
    * 総ピクセル数が 655,360 から 8,294,400 の間であること
      たとえば、`2048x3072` は有効です。`3000x2000` は 3000 が 16 で割り切れないため拒否されます。
  </Accordion>

  <Accordion title="リバーススキルの URL はどれくらい有効ですか？">
    リバーススキルのデフォルトの R2 CDN URL は、おおよそ **24時間** 有効です。本番では、Base64 を受け取ってローカルに保存するために `-r b64_json` を渡すか、すぐにアセットをダウンロードしてください。
  </Accordion>

  <Accordion title="どの AI コーディングツールがサポートされていますか？">
    確認済み: Codex CLI、OpenCode、Gemini CLI、GitHub Copilot、Cursor、Amp。Skills に対応したツールであれば、どれでも動作するはずです。
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="gpt-image-2（公式）ドキュメント" icon="book" href="/ja/api-capabilities/gpt-image-2/overview">
    ネイティブな2K/4K画像生成、tokenごとの課金
  </Card>

  <Card title="gpt-image-2-all（リバース）ドキュメント" icon="book" href="/ja/api-capabilities/gpt-image-2-all/overview">
    ChatGPTとの同等性、\$0.03/回
  </Card>

  <Card title="公式版 vs リバース版の比較" icon="scale" href="/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    17項目の並列比較
  </Card>

  <Card title="Nano Banana Pro スキル（同じ作者）" icon="puzzle" href="/ja/scenarios/ecosystem/nano-banana-skill">
    同じリポジトリの姉妹スキル — Gemini 画像生成
  </Card>

  <Card title="Luck GPT-Image 2 ComfyUI Nodes" icon="workflow" href="/ja/scenarios/ecosystem/luckgpt2-comfyui">
    同じモデル、ComfyUIノード風
  </Card>

  <Card title="APIYI コンソール" icon="settings" href="https://www.apiyi.com">
    キー、利用状況、チャネルを管理
  </Card>
</CardGroup>
