> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI GPT-Image 2 画像生成スキル

> コミュニティ提供のデュアルスキルパック: Codex CLI、Cursor、Gemini CLI、その他のAIコーディングツールから、1文で gpt-image-2（公式）と gpt-image-2-all（リバース）を呼び出せます。

## 概要

`apiyi-gpt-image-2-gen` と `apiyi-gpt-image-2-all-gen` は、コミュニティユーザーの wuchubuzai2018 氏によって提供された2つのオープンソース AI Agent Skill です。Codex CLI、OpenCode、Gemini CLI、GitHub Copilot、Cursor、Amp、および任意の Skills 互換ツールから直接、単一の自然言語 prompt で APIYI の2つの OpenAI GPT 画像モデル（**公式 `gpt-image-2`**（きめ細かな制御、token ベースの課金、4K）および **リバース `gpt-image-2-all`**（対話型、呼び出しごとの課金、ChatGPT と同等））を呼び出すことができます。

<Info>
  **プロジェクト情報**

  * 🔗 ソース: `github.com/wuchubuzai2018/expert-skills-hub`
  * 📦 Skill ID: `apiyi-gpt-image-2-gen`（公式）、`apiyi-gpt-image-2-all-gen`（リバース）
  * 👤 作成者: wuchubuzai2018
  * ⭐ コミュニティによる貢献。作者の [Nano Banana Pro 画像生成 Skill](/ja/scenarios/ecosystem/nano-banana-skill) と同じリポジトリを共有しています
</Info>

<Tip>
  **どちらの Skill を選ぶべきですか？**

  * **`apiyi-gpt-image-2-gen`（公式、推奨）**: 制御可能な `size / quality / output-format / compression`、4K（3840×2160）、カスタムサイズ、およびセマンティック編集をサポート。token ベースの課金 — 特定の品質やサイズの要件がある場合に最適です
  * **`apiyi-gpt-image-2-all-gen`（リバース）**: 必要なのは `prompt` と任意の `response-format` のみ。サイズ/比率は prompt 内で記述。呼び出しごとの課金（\$0.025/呼び出し）。ChatGPT Web 体験と同等 — 自然言語による直接出力、強力なテキスト描画、反復的な編集に最適です
  * 完全な比較: [公式版とリバース版の比較](/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
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

## APIYI 対応モデル

| モデル | モデルID | スキル | 課金 | APIドキュメント |
| - | - | - | - | - |
| GPT-Image 2（公式、推奨） | `gpt-image-2` | `apiyi-gpt-image-2-gen` | token単位の従量課金 | [表示](/ja/api-capabilities/gpt-image-2/overview) |
| GPT-Image 2 All（リバース） | `gpt-image-2-all` | `apiyi-gpt-image-2-all-gen` | 1回あたり \$0.025 | [表示](/ja/api-capabilities/gpt-image-2-all/overview) |

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

| Parameter | Short | Required | Description | Example |
| - | - | - | - | - |
| `--prompt` | `-p` | Yes | 生成 prompt または編集指示 | `"An orange cat on grass"` |
| `--filename` | `-f` | No | 出力パス（省略時は自動でタイムスタンプ付き） | `"cat.png"` |
| `--size` | `-s` | No | プリセット（`1024x1024` / `1536x1024` / `1024x1536` / `2048x2048` / `2048x1152` / `3840x2160` / `2160x3840`）またはカスタム | `"2048x1152"` |
| `--quality` | `-q` | No | `low` / `medium` / `high` / `auto` | `"high"` |
| `--output-format` | `-o` | No | `png`（デフォルト）/ `jpeg` / `webp` | `"webp"` |
| `--output-compression` | `-c` | No | 0-100（jpeg / webp のみ） | `80` |
| `--input-image` | `-i` | No | 参照画像、最大 5 枚 | `"portrait.png"` |
| `--api-key` | `-k` | No | 1 回分の環境変数を上書き | `"sk-xxx"` |

**対応アスペクト比**: `1:1`, `3:2`, `2:3`, `16:9`, `9:16`, および 3:1 以内の任意のカスタム比率。

**カスタムサイズの制約**: 各辺は 3840px 以下、両方の寸法は 16 で割り切れること、総ピクセル数は 655,360 から 8,294,400 の間であること。

**通常のレイテンシ**: 1 リクエストあたり 120〜150 秒（複雑な 4K シーンではさらに長くなります）。

### `apiyi-gpt-image-2-all-gen`（逆）

| Parameter | Short | Required | Description | Example |
| - | - | - | - | - |
| `--prompt` | `-p` | Yes | 会話形式の prompt（サイズ/比率は prompt 内で記述） | `"widescreen 16:9 cyberpunk city"` |
| `--filename` | `-f` | No | 出力パス（省略時は自動でタイムスタンプ付き PNG） | `"city.png"` |
| `--response-format` | `-r` | No | `url`（デフォルト、R2 CDN で約 24 時間有効）または `b64_json` | `"b64_json"` |
| `--input-image` | `-i` | No | 参照画像、最大 5 枚 | `"ref.png"` |
| `--api-key` | `-k` | No | 1 回分の環境変数を上書き | `"sk-xxx"` |

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

## よくある質問

<AccordionGroup>
  <Accordion title="どちらのスキルを選ぶべきですか？">
    * **正確なサイズ**（例: 3840×2160）、**品質ティア**（低/中/高）、または**特定の出力フォーマット**（webp / 圧縮）が必要な場合 → **公式 `apiyi-gpt-image-2-gen`** を選択してください
    * **ChatGPTと同等の対話フロー**、**呼び出しごとの定額料金**（\$0.025）、**強力なテキスト描画**を重視し、サイズを自然言語で指定しても問題ない場合 → **リバース `apiyi-gpt-image-2-all-gen`** を選択してください
    * 詳細な比較一覧: [公式とリバースの比較](/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="`npx skills` のインストールに失敗します">
    1. Node.js がインストールされていることを確認します（`node -v`）
    2. GitHub へのネットワークアクセスを確認します
    3. `npx skills` が利用できない場合は、手動でクローンします:

    ```bash theme={null}
    git clone https://github.com/wuchubuzai2018/expert-skills-hub.git
    ```

    その後、`skills/apiyi-gpt-image-2-gen` または `skills/apiyi-gpt-image-2-all-gen` のいずれかをローカルの Skills ディレクトリにコピーします。
  </Accordion>

  <Accordion title="API キーの無効エラー">
    1. `APIYI_API_KEY` が正しく設定されていることを確認します（`sk-` で始まります）
    2. 残高 — [残高は十分にあるように見えるが呼び出しが失敗する](/ja/faq/balance-insufficient) を参照してください
    3. 簡単なテストを行うには、`-k "sk-xxx"` をインラインで渡します
  </Accordion>

  <Accordion title="公式スキルでカスタムサイズが拒否されます">
    カスタム `size` は以下の条件を満たす必要があります:

    * 各辺 ≤ 3840px
    * 両方の寸法が 16 で割り切れること
    * 総ピクセル数が 655,360 から 8,294,400 の間であること
      例えば、`2048x3072` は有効ですが、`3000x2000` は 3000 が 16 で割り切れないため拒否されます。
  </Accordion>

  <Accordion title="リバーススキルの URL の有効期限はどのくらいですか？">
    リバーススキルのデフォルトの R2 CDN URL は、約 **24 時間** 有効です。本番環境では、`-r b64_json` を渡して Base64 を受け取りローカルに保存するか、アセットを直ちにダウンロードしてください。
  </Accordion>

  <Accordion title="どの AI コーディングツールがサポートされていますか？">
    動作確認済み: Codex CLI、OpenCode、Gemini CLI、GitHub Copilot、Cursor、Amp。Skills と互換性のあるツールであれば動作するはずです。
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="gpt-image-2（公式）ドキュメント" icon="book" href="/ja/api-capabilities/gpt-image-2/overview">
    ネイティブ2K/4K生成、token単位の課金
  </Card>

  <Card title="gpt-image-2-all（リバース）ドキュメント" icon="book" href="/ja/api-capabilities/gpt-image-2-all/overview">
    ChatGPTと同等、1回あたり\$0.025
  </Card>

  <Card title="公式 vs リバースの比較" icon="scale" href="/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    17項目による横並び比較
  </Card>

  <Card title="Nano Banana Pro Skill（同一作者）" icon="puzzle" href="/ja/scenarios/ecosystem/nano-banana-skill">
    同じリポジトリの姉妹Skill — Gemini画像生成
  </Card>

  <Card title="Luck GPT-Image 2 ComfyUI ノード" icon="workflow" href="/ja/scenarios/ecosystem/luckgpt2-comfyui">
    同一モデルのComfyUIノード版
  </Card>

  <Card title="APIYI コンソール" icon="settings" href="https://www.apiyi.com">
    キー、使用量、チャネルの管理
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.