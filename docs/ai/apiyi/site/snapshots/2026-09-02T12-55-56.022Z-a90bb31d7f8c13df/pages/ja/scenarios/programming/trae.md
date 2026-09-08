> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Trae

> ByteDance の AI ネイティブ IDE で、Builder/Chat/Inline Chat モードを備えています。カスタムモデルエントリを通じて APIYI に接続し、OpenAI と Anthropic の両方のプロトコルを 400+ の主要モデルでカバーできます。

## 概要

**Trae** は ByteDance が 2025年1月にリリースした **AIネイティブIDE** で、プロの開発者向けの「Vibe Coding」生産性ツールとして位置付けられています。やりたいことを自然言語で伝えるだけで、AI が補完、バグ修正、プロジェクトの雛形作成、ワンクリックプレビューを担当します。Trae は 2 つのバージョンで提供されており、**TRAE CN**（`trae.cn`）と **国際版 TRAE**（`trae.ai`）があります。さらに、**SOLO** シリーズ（Desktop / App / Web）では、エージェントがタスクの全ライフサイクルを引き受けます。

Trae の「カスタムモデル」機能で APIYI を接続すると、次のメリットがあります。

<CardGroup cols={2}>
  <Card title="🔌 デュアルプロトコル対応" icon="plug">
    OpenAI と Anthropic の両方のプロバイダーを設定できます — 1つの token で2つのプロトコルに対応
  </Card>

  <Card title="🤖 400以上のモデル" icon="layers">
    GPT, Claude, Gemini, DeepSeek, Doubao, Qwen — すべて1つのゲートウェイの背後で利用できます
  </Card>

  <Card title="💰 Claude が5%オフ" icon="piggy-bank">
    token を作成する際に ClaudeCode グループを選ぶと、Claude が5%割引になり、チャージ特典と併用できます
  </Card>

  <Card title="🛡️ 安定したダイレクト接続" icon="shield">
    `api.apiyi.com` は中国本土から直接アクセスでき、追加のプロキシは不要です
  </Card>
</CardGroup>

<Info>
  **製品情報**

  * 🔗 国際版: `www.trae.ai`
  * 🔗 中国版: `www.trae.cn`
  * 👥 開発元: ByteDance
  * 📅 初回リリース: 2025年1月
  * 🧩 モード: Builder (agent) / Chat (サイドバー) / Inline Chat
  * 🌐 対応プロトコル: OpenAI, Anthropic, およびその他多数のサードパーティプロバイダー
</Info>

## 主な機能

### 3つの操作モード

* **Builder mode**: エージェントが引き継ぎ、ファイルの読み書き、コマンド実行、プロジェクトのスキャフォールドを行います
* **Chat mode**: Cursor Chat / Cline に似たサイドバーでの会話で、Q\&A やスニペットに最適です
* **Inline Chat**: `Cmd/Ctrl + I` はエディタ内でインライン会話を開き、完了とリファクタリングへの最短ルートです

### MCP とツール連携エコシステム

* 外部ツールと API 向けの組み込み **MCP (Model Context Protocol)** サポート
* **Remote-SSH** サポート — リモート開発もローカルと同じように使えます
* プロジェクトレベルの AI の振る舞いを定義する `.rules` ファイル

### カスタムモデル（このガイドの焦点）

国際版 Trae には **Anthropic, OpenAI, Gemini, xAI, OpenRouter, Ollama, DeepSeek, Volcano Engine, Aliyun, Tencent Cloud, SiliconFlow, PPIO, Novita, BytePlus** などのプリセットが付属しています。各プリセットでは、**カスタム model ID + API key + カスタム request URL** を入力できます。これが APIYI を組み込むための入口です。

<Tip>
  **APIYI 経由でルーティングする理由**: Trae の組み込みモデルはリージョンとバージョンに制限があり、複数の上流アカウント間で使用状況を共有する方法もありません。APIYI なら、**1つの token で OpenAI と Anthropic の両方をカバー**できます。GPT と Claude を切り替えるたびに設定へ戻る必要はなく、Trae の上部バーのドロップダウンからモデルを選ぶだけです。
</Tip>

<Warning>
  **⚠️ モデル互換性 — セットアップ前にお読みください**

  1. **Trae は Responses プロトコルをサポートしていません**: カスタムモデルが使えるチャネルは 2 つだけで、`/v1/chat/completions`（OpenAI プロトコル）と `/v1/messages`（Anthropic プロトコル）です。GPT-5.4 シリーズ以降、OpenAI は "reasoning + tool calling" を `/v1/responses` エンドポイントに制限しているため、**`gpt-5.4` / `gpt-5.5` / `gpt-5.6` は Trae の Builder / Chat（tools あり）シナリオではすべて 400 を返し、実質的に使えません**。`gpt-5.4` でも同様です（詳細は下の FAQ を参照してください）。
  2. **OpenAI 互換の chat mode はエージェントには不向きです**: 制限のない GPT モデルでも、chat mode のエージェントワークフローと高度な tool 権限への対応は不完全で、Builder mode がしばしば停止し、体験が悪化します。
  3. **Trae では Claude ファミリーを推奨します**: Builder mode で完全かつ安定した tool 呼び出しを備えた Anthropic のネイティブ `/v1/messages` プロトコルで動作するため、最優先の推奨です。
  4. **Trae で動かせないモデル（最新の GPT シリーズ）は、[Codex app](/ja/scenarios/programming/codex-cli) に切り替えてください**: Codex は Responses プロトコルをネイティブに話せるため、`gpt-5.6-sol` / `gpt-5.5` がフル機能で動作します。
</Warning>

## クイックスタート

### ステップ 1: Trae をインストールする

<Tabs>
  <Tab title="国際版 (TRAE)">
    `www.trae.ai` からダウンロードできます — macOS、Windows、Linux をサポートしています。国際版には GPT / Claude / Gemini のプリセットがあらかじめ同梱されています。
  </Tab>

  <Tab title="中国版 (TRAE CN)">
    `www.trae.cn` からダウンロードできます — macOS と Windows をサポートしています。Doubao と DeepSeek のプリセットが同梱されており、アカウントログインは携帯電話で行います。
  </Tab>
</Tabs>

### ステップ 2: APIYI Token を取得する

1. APIYI token コンソールにアクセスします: `api.apiyi.com/token`
2. 「New Token」をクリックします
3. **Claude を多く使う場合**: **ClaudeCode グループ** を選択してください — Claude の呼び出しは **5% 割引** になり、10%-20% のチャージ特典と併用できます
4. **GPT/Gemini/DeepSeek を混在させて使う場合**: **Default グループ** で問題ありません
5. `sk-` が付いたキーをコピーします

### ステップ 3: Trae でカスタムモデルパネルを開く

* **IDE モード**: 右上の ⚙️ アイコンをクリック → 左ナビの **Models** → 「モデルを追加」 / 「カスタムモデル」
* **SOLO モード**: チャットパネル右上の ⚙️ をクリック → **Models** → Add

### ステップ 4: OpenAI プロトコルのエントリを追加する (GPT / Gemini / DeepSeek / Doubao など)

以下のように入力します。**カスタムリクエスト URL には、ドメインだけでなく完全な `/v1/chat/completions` パスを含める必要があります**:

<img src="https://mintcdn.com/apiyillc/vSACm1ThocKlKALW/images/trae-custom-model-openai.png?fit=max&auto=format&n=vSACm1ThocKlKALW&q=85&s=3b59889c3ae27a374a6da691beca2ffa" alt="Trae カスタムモデル — OpenAI プロトコルで APIYI に接続し、リクエスト URL は https://api.apiyi.com/v1/chat/completions です" width="477" height="521" data-path="images/trae-custom-model-openai.png" />

| Field                  | Value                                                     | Notes                                  |
| ---------------------- | --------------------------------------------------------- | -------------------------------------- |
| **Provider**           | `OpenAI`                                                  | OpenAI プリセットを選択します                     |
| **Model**              | `Custom Model`                                            | ドロップダウンの最後の項目です                        |
| **Model ID**           | 例: `gpt-5.1`, `deepseek-v4-flash`, `gemini-3-pro-preview` | 使いたいモデルの完全な ID です                      |
| **API Key**            | `sk-...`                                                  | ステップ 2 の APIYI token を貼り付けます           |
| **Custom Request URL** | `https://api.apiyi.com/v1/chat/completions`               | **`/v1/chat/completions` を含める必要があります** |

<Warning>
  **ベース URL には完全なパスが必要です**: v3.3.51 以降、Trae の custom-model の baseURL フィールドは **そのままの文字列** として使われます — `/chat/completions` を自動で付け足さなくなりました。`https://api.apiyi.com` や `https://api.apiyi.com/v1` だけを入れるとエラーになります。
</Warning>

<Note>
  **このエントリの対象モデル**: `gpt-5.1` / `gpt-5.2`、Gemini、DeepSeek、Doubao、Qwen など、chat プロトコルで制限なく使えるモデルです。**`gpt-5.4` およびそれ以降の GPT モデル (5.5 / 5.6 系) はここでは動作しません** — 上の「モデル互換性」を参照してください。これらには [Codex app](/ja/scenarios/programming/codex-cli) を使ってください。
</Note>

### ステップ 5: Anthropic プロトコルのエントリを追加する (Claude ファミリー)

Claude Opus 4.6 / Sonnet 4.6 / Haiku 4.5 も使いたい場合は、2 つ目の provider エントリを追加します:

<img src="https://mintcdn.com/apiyillc/vSACm1ThocKlKALW/images/trae-custom-model-anthropic.png?fit=max&auto=format&n=vSACm1ThocKlKALW&q=85&s=18c4c41f103b88df7402ab92a99aa059" alt="Trae カスタムモデル — Anthropic プロトコルで APIYI に接続し、リクエスト URL は https://api.apiyi.com/v1/messages です" width="476" height="440" data-path="images/trae-custom-model-anthropic.png" />

| Field                  | Value                                             | Notes                                                                       |
| ---------------------- | ------------------------------------------------- | --------------------------------------------------------------------------- |
| **Provider**           | `Anthropic`                                       | Anthropic プリセットを選択します                                                       |
| **Model**              | `Claude-Sonnet-4.6` (またはドロップダウン内の別の Claude バージョン) | 公式プリセットを使用してください — 「Custom model」に行く必要はありません                                |
| **API Key**            | `sk-...`                                          | APIYI token を貼り付けます (できれば ClaudeCode グループのものを使ってください)                       |
| **Custom Request URL** | `https://api.apiyi.com/v1/messages`               | **`/v1/messages` を含める必要があります** — これは `/v1/chat/completions` ではないことに注意してください |

<Info>
  **2 つのプロトコル、2 つのパス**: OpenAI プロトコルは `/v1/chat/completions` を通り、Anthropic プロトコルは `/v1/messages` を通ります。APIYI は両方の endpoint をホストしているため、同じ token を 2 つの Trae provider エントリに同時に割り当てても競合しません。
</Info>

### ステップ 6: モデルを切り替えてコーディングを始める

エディタに戻り、上部のモデルのドロップダウンをクリックします — provider とそのすべてのモデルが表示されます。1 つ選んで、チャットを始めるか Builder モードに入ってください。

## おすすめのモデル構成

<CardGroup cols={2}>
  <Card title="毎日のコーディング（最もお得）" icon="code">
    **Claude Sonnet 4.6** (Anthropic) + **GPT-5.1** (OpenAI)

    Sonnet 4.6 は非常に高いコーディング能力を優れた価格で提供し、GPT-5.1 は気軽なチャットではより高速です
  </Card>

  <Card title="複雑なアーキテクチャ（フラッグシップ）" icon="crown">
    **Claude Opus 4.6** (Anthropic)

    大規模なリファクタリング、ファイル横断の分析、アーキテクチャ上の意思決定に最適です — Builder モードと組み合わせてください
  </Card>

  <Card title="高度な reasoning" icon="brain">
    **Claude Sonnet 4.6 Thinking** / **GPT-5.1 Thinking**

    思考の連鎖を強制します — アルゴリズム、論理パズル、セキュリティレビューに最適です
  </Card>

  <Card title="コスト最適化（CNモデル）" icon="banknote">
    **DeepSeek V4** / **Doubao 1.5 Pro** / **Qwen3 Coder**

    OpenAI プロトコル経由でルーティングします — token あたりのコストが低く、自然な中国語出力になります
  </Card>
</CardGroup>

<Info>
  **最新のGPTモデル（5.4以降）がこのリストにない理由**: Trae は Responses プロトコルをサポートしていないため、`gpt-5.4` / `gpt-5.5` / `gpt-5.6` はすべて Builder / チャットのツール呼び出しシナリオで 400 になります（上記の「モデルの互換性」を参照してください）。それらには [Codex アプリ](/ja/scenarios/programming/codex-cli) を使ってください。Trae 内のエージェントタスクでは、Claude ファミリー（ネイティブな Anthropic プロトコル）が最も信頼できる選択肢です。
</Info>

<Card title="完全なモデル一覧とコーディングのおすすめを見る" icon="star" href="/ja/api-capabilities/model-info">
  APIYI は、統合されたゲートウェイの背後で 400 以上のモデルを提供しています。モデルのおすすめページは、最新の性能および料金比較を反映するよう随時更新されています。
</Card>

## プロのヒント

<Steps>
  <Step title="プロバイダーのエントリは両方残してください">
    OpenAI と Anthropic の両方のエントリを追加しておけば、GPT/Gemini ↔ Claude を切り替えても baseURL を編集する必要がなくなります。
  </Step>

  <Step title="最新のモデルがドロップダウンに見つかりませんか？">
    Trae の組み込みモデルプリセットは、APIYI の実際の供給状況より遅れています。**「カスタムモデル」を選んで ID を手入力してください** — APIYI コンソールまたはモデル推奨ページで正しい ID を確認してください。
  </Step>

  <Step title="Builder モードでは Claude を優先してください">
    Claude（とくに Sonnet 4.6 / Opus 4.6）は、エージェントのワークフローにおける指示追従と複数ターンのツール呼び出しで、かなり信頼性が高いです。
  </Step>

  <Step title="難しいタスクには -thinking サフィックスを付けてください">
    モデル ID の末尾に `-thinking` を追加すると（例: `claude-sonnet-4-6-thinking`）、chain-of-thought を強制できます。Builder モードでのアーキテクチャ判断やセキュリティ監査におけるハルシネーションを大幅に減らせます。
  </Step>

  <Step title="グループごとに token を分けてください">
    Anthropic のエントリ専用に **ClaudeCode-group token**（95%の料金）を 1 つ作り、GPT/Gemini/DeepSeek 用には **Default-group token** を用意してください。課金とクォータの可視性が向上します。
  </Step>
</Steps>

## FAQ

<AccordionGroup>
  <Accordion title="TRAE CN と国際版 TRAE — APIYI 統合に違いはありますか？">
    **違いはありません** — どちらのバージョンもカスタムモデルに対応しており、OpenAI と Anthropic のプロバイダーエントリを同時に追加できます。実際の違いは組み込みプリセットモデルだけです（CN 版は Doubao/DeepSeek を重視し、国際版は GPT/Claude/Gemini を重視します）。

    推奨事項：中国本土にいる場合は TRAE CN（`trae.cn`）を、グローバルチームで利用する場合や海外向けプリセットモデルが必要な場合は国際版 TRAE（`trae.ai`）を選択してください。
  </Accordion>

  <Accordion title="baseURL はなぜ /v1/chat/completions まで指定する必要があるのですか？">
    **v3.3.51** 以降、Trae はカスタムモデルの baseURL の解析方法を変更しました。現在はリクエスト時に自動的に `/chat/completions` を付加せず、指定した値をそのまま使用します。

    正しい設定：

    * OpenAI プロトコル：`https://api.apiyi.com/v1/chat/completions`
    * Anthropic プロトコル：`https://api.apiyi.com/v1/messages`

    間違った設定（404 またはルートエラーになります）：

    * ❌ `https://api.apiyi.com`
    * ❌ `https://api.apiyi.com/v1`
  </Accordion>

  <Accordion title="Anthropic プロバイダーの「カスタムモデル」に任意のモデル ID を入力できますか？">
    はい。Anthropic プロバイダーエントリにも「カスタムモデル」オプションがあり、`claude-opus-4-6` / `claude-sonnet-4-6-thinking` / `claude-haiku-4-5-20251001` のような ID を直接入力できます。APIYI の `/v1/messages` エンドポイントは、公式のモデル ID と完全互換です。
  </Accordion>

  <Accordion title="Claude の 5% 割引を受けるにはどうすればよいですか？">
    `api.apiyi.com/token` で token を作成するとき、**ClaudeCode グループを選択してください** — Claude の呼び出しが自動的に **5% 割引** になり、10%〜20% のチャージボーナスとも併用できます。

    この ClaudeCode グループの token を Trae の Anthropic プロバイダーエントリに貼り付けると、割引が自動的に適用されます。
  </Accordion>

  <Accordion title="Trae に GPT-5.1 / Claude 4.6 / 最新モデルが表示されないのはなぜですか？">
    Trae のプリセットリストは、実際の上流側の提供状況に遅れています。**ベストプラクティスは「カスタムモデル」を選択し、ID を手動で入力することです** — APIYI のバックエンドがサポートしているモデルであれば動作するため、Trae クライアントがプリセットを更新するのを待つ必要はありません。
  </Accordion>

  <Accordion title="Builder モードがハングし続ける／ツール呼び出しに失敗する">
    1. **Claude Sonnet 4.6 または Opus 4.6 を優先してください**：ツール呼び出しワークフローで特に安定しています
    2. **小規模な非推論モデルは避けてください**：DeepSeek-Chat や一部の小型 Qwen バリアントは Builder モードでループすることがあります。`thinking` バリアントに切り替えてください
    3. **コンテキスト長に注意してください**：大規模な複数ファイル変更では Opus 4.6（200K コンテキスト）に切り替えてください
    4. **APIYI のライブステータスを確認してください**：一時的な上流側の不安定さはすべてのクライアントに影響します。チャネルの問題でないことを確認してください
  </Accordion>

  <Accordion title="gpt-5.6 / gpt-5.5 / gpt-5.4 が 400 エラー「reasoning_effort を使用した Function tools はサポートされていません」で失敗する">
    完全なエラーは通常、次のようになります：`Function tools with reasoning_effort are not supported for gpt-5.6-sol in /v1/chat/completions. To use function tools, use /v1/responses or set reasoning_effort to 'none'.`（400、`invalid_request_error`）。

    これは **GPT-5.4 シリーズで導入された OpenAI の公式制限** であり、APIYI のチャネルの問題ではありません。`/v1/chat/completions` エンドポイントでは、Function tools と `reasoning_effort` を `none` 以外の値にして併用することはできません。OpenAI には 2 つの回避方法があります。`/v1/responses` エンドポイントに切り替えるか、`reasoning_effort` を `none` に明示的に設定してください（推論は無効になります）。詳しい診断と移行手順については、[エンドポイントと移行](/ja/api-capabilities/openai/responses-migration) を参照してください。

    Trae はどちらの方法にも対応していません。カスタムモデルがサポートするのは `/v1/chat/completions`（OpenAI プロトコル）と `/v1/messages`（Anthropic プロトコル）のみで、Responses API には対応しておらず、`reasoning_effort` の設定もありません。Builder / Chat モードは常にツール定義を送信するため、**クライアント側での回避策はありません**。JetBrains AI Assistant、opencode、その他のクライアントでも GPT-5.4 以降では同じ問題が発生します。

    対処方法：

    1. **Trae で影響を受けないモデルに切り替える**：`gpt-5.1` / `gpt-5.2`（OpenAI プロトコル）、または Claude ファミリー（`/v1/messages` 経由の Anthropic プロトコル）、Gemini / DeepSeek などを使用してください。
    2. **Trae 内で使い続ける**：Trae に [Roo Code](/ja/scenarios/programming/roo-code) プラグインをインストールしてください。Roo Code の「OpenAI」プロバイダーは `/v1/responses` を使用し、Trae 内でツール呼び出しが動作することを確認しています。これにより、実質的に Responses チャネルが追加されます。なお、Roo Code は提供終了しており、プリセットモデルリストは `gpt-5.4` で止まっています
    3. **ツール呼び出しと組み合わせて gpt-5.5 / 5.6 の推論を使用する必要がある場合**：Responses API に対応したクライアントを使用してください。[Codex アプリ / CLI](/ja/scenarios/programming/codex-cli) または [opencode](/ja/scenarios/programming/opencode) が利用できます。完全なクライアント対応表については、[OpenAI Responses API ネイティブガイド](/ja/api-capabilities/openai/native) を参照してください
  </Accordion>

  <Accordion title="Trae のテレメトリ／データアップロードについて教えてください">
    Trae は ByteDance のクライアントであり、公式プライバシーポリシーに従ってテレメトリと会話データをアップロードします。クライアント側のテレメトリを懸念する場合は、次の対策を検討してください：

    * 企業の外部接続出口で許可リストを設定する
    * Builder モードに入力する前に機密性の高い断片を編集・削除する
    * 代替手段として、[Claude Code](/ja/scenarios/programming/claude-code) や [Cline](/ja/scenarios/programming/cline) などのオープンソース／監査可能なクライアントを選択する
  </Accordion>

  <Accordion title="Trae と Cursor / Cline / Claude Code の違い — どれを選べばよいですか？">
    | ツール             | 種類            | エージェントモード  | APIYI 統合                  | 最適な用途                       |
    | --------------- | ------------- | ---------- | ------------------------- | --------------------------- |
    | **Trae**        | スタンドアロン IDE   | ✅ Builder  | 中程度（デュアルプロトコル用に 2 つのエントリ） | 中国語サポートに優れた Cursor スタイルの UX |
    | **Cursor**      | スタンドアロン IDE   | ❌（Chat のみ） | 簡単（OpenAI プロトコルのみ）        | クラス最高水準のコード補完と差分プレビュー       |
    | **Cline**       | VS Code プラグイン | ✅          | 簡単                        | すでに VS Code を頻繁に使用している場合    |
    | **Claude Code** | CLI           | ✅          | 簡単                        | ターミナルワークフロー、CI、リモート開発       |

    各統合ガイドを参照してください：[Cursor](/ja/scenarios/programming/cursor) · [Cline](/ja/scenarios/programming/cline) · [Claude Code](/ja/scenarios/programming/claude-code) · [Codex CLI](/ja/scenarios/programming/codex-cli)
  </Accordion>

  <Accordion title="401 / 403 エラーをデバッグするにはどうすればよいですか？">
    1. API キーが `sk-` で始まり、余分な空白が含まれていないことを確認する
    2. baseURL が正しいことを確認する — 特に末尾のパス（`/v1/chat/completions` と `/v1/messages` の違い）に注意する
    3. APIYI コンソールで、token が有効になっており、対象モデルが token のグループに紐付けられていることを確認する
    4. 残高不足が 401 として現れる場合もあるため、アカウント残高を再確認する
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="モデル推奨" icon="star" href="/ja/api-capabilities/model-info">
    400以上のモデルにわたる性能比較とコーディングシナリオ向けの推奨
  </Card>

  <Card title="APIYIコンソール" icon="settings" href="https://api.apiyi.com">
    tokenの作成、使用状況の確認、グループの管理
  </Card>

  <Card title="Cursor連携" icon="mouse-pointer-click" href="/ja/scenarios/programming/cursor">
    もう一つの主要なAI IDE向けセットアップガイド
  </Card>

  <Card title="Clineプラグイン" icon="puzzle" href="/ja/scenarios/programming/cline">
    VS Code内のフル機能エージェント
  </Card>

  <Card title="Codexアプリ連携" icon="code" href="/ja/scenarios/programming/codex-cli">
    ネイティブなResponsesプロトコル — 最新のGPTシリーズ（5.4+）に最適な場所
  </Card>
</CardGroup>

<Info>
  **さらにサポートが必要ですか？** `api.apiyi.com`をご覧いただくか、公式コミュニティに参加して技術サポートを受けてください。
</Info>
