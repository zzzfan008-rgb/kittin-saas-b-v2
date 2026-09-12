> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Roo Code (VS Code)

> VS Code 内のあなたの AI 開発チームです - マルチモード設定を備えたスマートなプログラミングアシスタントです

## 概要

Roo Code は、完全なAI開発チームを提供する強力な VS Code 向けAIプログラミングアシスタントです。最大の特徴は**マルチモード設定**で、開発タスクごとに異なるAIモデルを使い分けることで、最適な開発効率を実現できます。

<Card>
  **主な利点**

  * 🎯 **マルチモード設定**: アーキテクチャ、コーディング、デバッグなどのタスクに特化したモデルを割り当てられます
  * 🤖 **エージェントインテリジェンス**: 複雑な開発タスクを自動で計画・実行します
  * 🔄 **複数ファイル操作**: プロジェクト構造を理解し、複数のファイルを賢く変更します
  * 💰 **完全無料**: オープンソースで無料、AIモデルの利用分のみ課金されます
  * 🌐 **幅広い互換性**: 400以上の主要なAIモデルをサポートします
  * 🔌 **MCP サポート**: Model Context Protocol を介して外部ツールに接続できます
</Card>

<Info>
  **Roo Code と Cline の比較**

  Roo Code は Cline のフォークであり、Cline のコア機能を継承しつつ、独自のマルチモード設定システムを追加しています。異なる開発段階で異なるモデルを使い分ける必要がある場合は、Roo Code のほうが適しています。
</Info>

## メンテナンス状況と Responses エンドポイント対応

### 公式に終了済み（2026年）

Roo Code チームは **最終リリース** を出し、クラウドエージェントプラットフォーム Roomote への方針転換を発表しました。拡張機能は無期限に動作し続けますが、**これ以降はバグ修正、新機能、モデル更新はありません**。チームは、拡張機能の形態を使い続けたい方には、コミュニティ管理のフォーク `ZooCode`、または [Cline](/ja/scenarios/programming/cline) — Roo Code が元々フォークしたプロジェクトです — を推奨しています。

<img src="https://mintcdn.com/apiyillc/4Btanb2HSbrGHo5H/images/roo-code-final-version-notice.png?fit=max&auto=format&n=4Btanb2HSbrGHo5H&q=85&s=79f576a16c788e343200e409e1cfecf2" alt="Roo Code の最終リリースのお知らせ: 拡張機能は無期限に動作し続けますが、これ以降はバグ修正、機能、新機能、モデル更新はありません。ZooCode と Cline を推奨します" style={{maxWidth: "560px"}} width="860" height="706" data-path="images/roo-code-final-version-notice.png" />

<Warning>
  凍結の実際の影響: 「OpenAI」プロバイダーの **プリセットのモデル一覧は `gpt-5.4` で止まります** — gpt-5.5 / gpt-5.6 以降のモデルはドロップダウンに表示されません。既存の機能には影響しません。
</Warning>

### /v1/responses を話せる数少ない IDE プラグインの1つ（検証済み）

Roo Code の「OpenAI」プロバイダーは `/v1/responses` エンドポイントを使い（「OpenAI Compatible」プロバイダーが使う `/v1/chat/completions` とは別です）、カスタム Base URL を指定できます。これにより、IDE 内で **GPT-5.4 の「reasoning plus tool calling」** を実行できる数少ないプラグインの1つになります — chat/completions では、OpenAI は GPT-5.4 以降で tools と reasoning の同時利用をブロックします（[Responses API ネイティブガイド](/ja/api-capabilities/openai/native) を参照）、一方で Responses にはそのような制限がありません。

セットアップ: API Provider には **OpenAI** を選び（OpenAI Compatible ではありません）、Base URL を `https://api.apiyi.com/v1` に設定し、モデルとして `gpt-5.4` を選択します。

### Trae やその他の VS Code 系 IDE にインストールする

Trae のような VS Code ベースの IDE でも Roo Code プラグインをインストールできます。Roo Code を Trae にインストールし、上記のように OpenAI プロバイダーで設定すると、Responses エンドポイント経由でツール呼び出しとタスクを通常どおり実行できることを確認しました。これにより、独自のカスタムモデルが chat/completions のみをサポートし、同じ `gpt-5.4` モデル上限を持つ [Trae](/ja/scenarios/programming/trae) に、実質的に Responses チャネルが追加されます。

<img src="https://mintcdn.com/apiyillc/4Btanb2HSbrGHo5H/images/roo-code-in-trae-responses-test.png?fit=max&auto=format&n=4Btanb2HSbrGHo5H&q=85&s=19bcff9afd8acdb6f3e30b631b2da7a1" alt="Trae IDE 内でプラグインとして動作する Roo Code が、Responses エンドポイント経由でタスクを実行していることを示す検証済みのスクリーンショット" style={{maxWidth: "480px"}} width="800" height="1548" data-path="images/roo-code-in-trae-responses-test.png" />

## クイックインストール

### 方法 1: VS Code Marketplace（推奨）

<Steps>
  <Step title="拡張機能マーケットプレイスを開く">
    VS Code で `Ctrl+Shift+X`（Windows/Linux）または `Cmd+Shift+X`（macOS）を押します
  </Step>

  <Step title="検索してインストール">
    「Roo Code」を検索して、Install をクリックします

    **拡張機能 ID**: `RooVeterinaryInc.roo-cline`
  </Step>

  <Step title="プラグインを開く">
    インストール後、左側のアクティビティバーにある Roo Code アイコンをクリックします
  </Step>
</Steps>

### 方法 2: Open VSX レジストリ

[Open VSX レジストリ](https://open-vsx.org/) にアクセスし、Roo Code を検索してインストールします。

## APIYI の設定

### 基本設定

<Steps>
  <Step title="設定を開く">
    Roo Code サイドバーの **歯車アイコン**（設定ボタン）をクリックします
  </Step>

  <Step title="API プロバイダーを選択">
    API プロバイダーのドロップダウンから **OpenAI 互換** を選択します
  </Step>

  <Step title="接続パラメータを設定">
    **ベース URL**: `https://api.apiyi.com/v1`

    **API キー**: あなたの APIYI キー（形式: `sk-***`）

    **モデル名**: 使用するモデル名を入力します
  </Step>

  <Step title="設定を保存">
    保存をクリックすると、Roo Code が接続を自動的に検証します
  </Step>
</Steps>

<Warning>
  **Base URL の設定要件**:

  * `https://api.apiyi.com/v1` を使用する必要があります（`/v1` パスを含みます）
  * `https://api.apiyi.com` は使用しないでください（`/v1` がないと接続に失敗します）
</Warning>

### APIYI キーを取得

<Steps>
  <Step title="APIYI ダッシュボードにアクセス">
    `api.apiyi.com` にログインします
  </Step>

  <Step title="API キーを作成">
    「Token 管理」ページ（`api.apiyi.com/token`）に移動し、「新しい Token を作成」をクリックします
  </Step>

  <Step title="キーをコピー">
    生成された API キー（形式: `sk-***`）をコピーし、Roo Code の設定に貼り付けます
  </Step>
</Steps>

## マルチモード設定（コア機能）

Roo Code の独自機能は、異なる開発モードごとに異なる AI モデルを割り当て、専門的に役割分担できることです。

### 5つの開発モード

<Tabs>
  <Tab title="アーキテクトモード">
    **アーキテクチャモード** - システム設計とアーキテクチャ計画向け

    **推奨モデル**:

    * Claude Sonnet（強力な reasoning、アーキテクチャ設計が得意）
    * GPT-4o（包括的な技術知識）
    * DeepSeek V3（深い思考、コスト効率が高い）

    **典型的なタスク**:

    ```text theme={null}
    Design a microservices architecture for an e-commerce system:
    - User service
    - Product service
    - Order service
    - Payment service
    Deploy using Docker + Kubernetes
    ```
  </Tab>

  <Tab title="コードモード">
    **コーディングモード** - 実際のコード生成と記述向け

    **推奨モデル**:

    * Claude Sonnet（高いコード品質）
    * DeepSeek Coder（プロ向けのプログラミングモデル）
    * Qwen Coder（中国語にやさしいコメント）

    **典型的なタスク**:

    ```text theme={null}
    Implement user authentication module:
    - JWT token generation and validation
    - Password encryption (bcrypt)
    - Login/registration endpoints
    - Permission middleware
    ```
  </Tab>

  <Tab title="質問モード">
    **Q\&Aモード** - 技術相談と実装計画向け

    **推奨モデル**:

    * GPT-4o-mini（高速応答、低コスト）
    * Gemini Flash（高速）
    * DeepSeek Chat（コスト効率が高い）

    **典型的なタスク**:

    ```text theme={null}
    Q: How to optimize React component rendering performance?
    Q: What's the difference between Redux and Zustand?
    Q: How to handle memory leaks in Node.js?
    ```
  </Tab>

  <Tab title="デバッグモード">
    **デバッグモード** - エラーのトラブルシューティングとバグ修正向け

    **推奨モデル**:

    * GPT-4o（複雑なエラーを理解できる）
    * Claude Sonnet（強力なコード解析）
    * DeepSeek V3（深い解析）

    **典型的なタスク**:

    ```text theme={null}
    Debug this error:
    TypeError: Cannot read property 'map' of undefined

    Help me find the memory leak in this code
    Analyze why this async function isn't executing correctly
    ```
  </Tab>

  <Tab title="オーケストレーターモード">
    **オーケストレーションモード** - 複雑なタスクの分解と調整向け

    **推奨モデル**:

    * Claude Opus（複雑なタスクを処理できる）
    * GPT-4o（全体計画が得意）
    * DeepSeek V3（論理的推論）

    **典型的なタスク**:

    ```text theme={null}
    Migrate entire project from JavaScript to TypeScript:
    1. Analyze existing code structure
    2. Create type definition files
    3. Gradually convert modules
    4. Update configuration files
    5. Run tests for validation
    ```
  </Tab>
</Tabs>

### マルチモードの設定

<Steps>
  <Step title="モード設定を開く">
    Roo Code の設定で **モード設定** セクションを見つけます
  </Step>

  <Step title="各モードのモデルを選択する">
    各モードごとに個別に設定します:

    * API プロバイダー
    * モデル名
    * Temperature（創造性パラメータ）
    * 最大 token 数
  </Step>

  <Step title="モードを切り替える">
    Roo Code のインターフェースで、モードセレクターを使って現在のモードを切り替えます
  </Step>
</Steps>

<Tip>
  **推奨設定戦略**:

  * **アーキテクト/オーケストレーター** → 高品質モデルを使用する（Claude Sonnet、GPT-4o）
  * **コード** → プロ向けのプログラミングモデルを使用する（DeepSeek Coder、Claude Sonnet）
  * **質問** → 高速で経済的なモデルを使用する（GPT-4o-mini、Gemini Flash）
  * **デバッグ** → 解析能力の高いモデルを使用する（Claude Sonnet、GPT-4o）
</Tip>

## おすすめモデル

Roo Code は、APIYI を通じて OpenAI、Google Gemini、Claude、DeepSeek、国内モデルを含む 400 以上の主要な AI モデルをサポートしています。

<Card title="プログラミングモデルのおすすめを見る" icon="code" href="/ja/api-capabilities/model-info">
  最新のプログラミングモデルのおすすめ、性能比較、利用のおすすめを確認できます。高性能モデル、費用対効果の高いモデル、推論強化モデルなど、詳細な分類も含まれています。
</Card>

<Info>
  **ここで具体的なモデル名を一覧にしないのはなぜですか？**

  AIモデルは非常に速く更新・改良されます。最も正確なモデルのおすすめをお届けするため、最新のモデル一覧、性能データ、利用のおすすめは[モデルおすすめページ](/ja/api-capabilities/model-info)で管理しています。
</Info>

## コア機能

### エージェントインテリジェンスモード

Roo Code の最も強力な機能は **Agent Mode** で、AI が複雑なタスクを自律的に計画し、実行できます:

```text theme={null}
Task: Create a complete user authentication system

Roo Code will automatically:
1. Analyze requirements and create implementation plan
2. Create necessary file and directory structure
3. Write backend API code
4. Create frontend login/registration pages
5. Add error handling and validation
6. Generate unit tests
7. Update relevant documentation
```

### スマートな複数ファイル編集

プロジェクト構造を理解し、関連する複数のファイルを自動で変更します:

```text theme={null}
"Convert all API calls from axios to fetch and update error handling logic"

Roo Code will:
- Find all files using axios
- Convert to fetch API
- Unify error handling patterns
- Update type definitions (if using TypeScript)
```

### コード生成

<CodeGroup>
  ```python Python theme={null}
  # Input description
  """
  Create a FastAPI endpoint for user registration:
  - Accept email and password
  - Validate email format
  - Encrypt and store password
  - Return JWT token
  """

  # Roo Code auto-generates complete implementation
  from fastapi import APIRouter, HTTPException
  from passlib.hash import bcrypt
  import jwt
  # ... complete code implementation
  ```

  ```javascript JavaScript theme={null}
  // Input requirement
  // Create a React Hook for form state management
  // Support validation, error messages, submit handling

  // Roo Code generates
  import { useState, useCallback } from 'react';

  export function useForm(initialValues, validationRules) {
    // ... complete Hook implementation
  }
  ```

  ```go Go theme={null}
  // Requirement: Implement a concurrent-safe cache
  // Support Set, Get, Delete, clear expired data

  // Roo Code generates complete Go code
  package cache

  import (
      "sync"
      "time"
  )

  type Cache struct {
      // ... complete implementation
  }
  ```
</CodeGroup>

### コードレビューと最適化

```text theme={null}
Review this PR, focusing on:
- Code standards
- Performance issues
- Security vulnerabilities
- Potential bugs
- Readability improvements
```

Roo Code は、改善提案を含む詳細なレビュー レポートを提供します。

### スマートリファクタリング

```text theme={null}
Refactor this function, requirements:
- Improve readability
- Optimize performance
- Add error handling
- Improve type safety
```

### テスト生成

```text theme={null}
Generate comprehensive unit tests for UserService class, including:
- Normal flow tests
- Boundary condition tests
- Error handling tests
- Mock external dependencies
```

## よく使うコマンド

Roo Code では、充実したコマンドパレット用コマンドを利用できます:

| コマンド                    | ショートカット          | 機能           |
| ----------------------- | ---------------- | ------------ |
| Roo Code: New Task      | `Ctrl+Shift+L`   | 新しいタスクを開始します |
| Roo Code: Continue      | `Enter`          | 現在のタスクを続行します |
| Roo Code: Approve       | `Ctrl+Enter`     | AI の変更を承認します |
| Roo Code: Reject        | `Ctrl+Backspace` | 変更を拒否します     |
| Roo Code: Clear History | -                | チャット履歴を消去します |
| Roo Code: Switch Mode   | -                | 開発モードを切り替えます |

<Tip>
  **ショートカットのヒント**: VS Code のキーボード ショートカット設定で Roo Code のショートカットをカスタマイズできます。
</Tip>

## 高度な機能

### API設定プロファイル

異なるプロジェクトやチームごとに、異なるAPI設定プロファイルを作成できます。

```json theme={null}
{
  "roocode.apiProfiles": {
    "production": {
      "provider": "OpenAI Compatible",
      "baseUrl": "https://api.apiyi.com/v1",
      "apiKey": "sk-prod-key",
      "defaultModel": "claude-sonnet-4"
    },
    "development": {
      "provider": "OpenAI Compatible",
      "baseUrl": "https://api.apiyi.com/v1",
      "apiKey": "sk-dev-key",
      "defaultModel": "deepseek-chat"
    }
  }
}
```

### コードベースのインデックス作成

Roo Code は、プロジェクト構造を理解するためにコードベースを自動的にインデックス作成します。

* ファイル間の関係を自動検出
* コードの依存関係を把握
* インテリジェントなコンテキスト認識
* ファイル間参照の追跡

### MCP統合

Model Context Protocol を介して外部ツールに接続します。

* データベースクエリ
* API呼び出し
* ファイルシステム操作
* Git操作
* カスタムツール統合

### カスタム Prompt テンプレート

設定で共通の Prompt テンプレートを構成します。

```json theme={null}
{
  "roocode.customTemplates": {
    "codeReview": "Detailed code review, focus on performance, security, maintainability",
    "optimize": "Optimize code performance and readability, add necessary comments",
    "test": "Generate comprehensive unit tests, cover edge cases",
    "refactor": "Refactor code following SOLID principles and design patterns"
  }
}
```

## 使用のヒント

### 1. 明確なコンテキストを提供する

<CardGroup cols={2}>
  <Card title="❌ 曖昧な説明" icon="x">
    "この関数を最適化して"
  </Card>

  <Card title="✅ 明確な説明" icon="check">
    "この関数のパフォーマンスを最適化し、ループの効率とメモリ使用量に重点を置き、最適化のアプローチを説明する適切なコメントを追加してください"
  </Card>
</CardGroup>

### 2. 複雑なタスクを段階的に実行する

複雑なタスクでは、複数のステップに分けることをおすすめします:

<Steps>
  <Step title="ステップ1: アーキテクチャ設計">
    全体のアーキテクチャを設計するために **Architect Mode** を使用します
  </Step>

  <Step title="ステップ2: モジュール実装">
    モジュールを実装するために **Code Mode** に切り替えます
  </Step>

  <Step title="ステップ3: デバッグと最適化">
    問題を調査するために **Debug Mode** を使用します
  </Step>

  <Step title="ステップ4: 統合テスト">
    統合を調整するために **Orchestrator Mode** を使用します
  </Step>
</Steps>

### 3. モード切り替えを活用する

さまざまなタスクの種類に応じて、最適なモードに切り替えます:

* アーキテクチャ設計が必要ですか？ → Architect Mode
* コード実装を作成しますか？ → Code Mode
* すぐに相談したいですか？ → Ask Mode
* バグに遭遇しましたか？ → Debug Mode
* 複雑なリファクタリングですか？ → Orchestrator Mode

### 4. 変更をレビューして承認する

<Warning>
  **重要な習慣**:

  * AI が生成したコードは、承認する前に必ずレビューする
  * 各変更の目的を理解する
  * 変更した機能をテストする
  * コードベースの一貫性を維持する
</Warning>

## よくある質問

<AccordionGroup>
  <Accordion title="Roo Code と Cline の違いは何ですか？">
    **主な違い**:

    1. **マルチモード設定**: Roo Code の中核機能で、Cline ではサポートされていません
    2. **コードベース**: Roo Code は Cline のフォークですが、独自に開発されています
    3. **更新頻度**: Roo Code はより頻繁に更新され、機能の反復も速いです
    4. **コミュニティ**: どちらも活発なコミュニティがありますが、重視する点が異なります

    **選び方**:

    * マルチモードが必要ですか？ → Roo Code
    * 安定性が必要ですか？ → Cline
    * どちらも無料で試せるので、自分に最適なものを選んでください
  </Accordion>

  <Accordion title="接続に失敗したり、モデルが動作しなかったりするのはなぜですか？">
    **よくある原因と解決策**:

    1. **Base URL の誤り**:
       * ✅ 正しい: `https://api.apiyi.com/v1`
       * ❌ 誤り: `https://api.apiyi.com`

    2. **無効な API Key**:
       * Key が正しくコピーされているか確認してください（先頭/末尾のスペースに注意）
       * アカウント残高が十分か確認してください
       * key の状態が「Enabled」になっているか確認してください

    3. **モデル名の誤り**:
       * 正しいモデル名を使用しているか確認してください
       * [モデル一覧](/ja/api-capabilities/model-info)を参照してください

    4. **ネットワークの問題**:
       * ネットワーク接続を確認してください
       * VS Code を再起動してみてください
  </Accordion>

  <Accordion title="モードごとに異なるモデルを設定するにはどうすればよいですか？">
    **設定手順**:

    1. Roo Code の設定（歯車アイコン）を開きます
    2. **モード設定** セクションを見つけます
    3. 各モードごとに個別に設定します:
       * Architect モード → `claude-sonnet-4`
       * Code モード → `deepseek-coder`
       * Ask モード → `gpt-4o-mini`
       * Debug モード → `claude-sonnet-4`
       * Orchestrator モード → `gpt-4o`
    4. 設定を保存します

    使用時は、モードセレクターで切り替えます。
  </Accordion>

  <Accordion title="Roo Code は自動的にコードを変更しますか？">
    **自動変更はありません**。変更にはあなたの承認が必要です:

    1. Roo Code はまず提案された変更を表示します
    2. 次の操作ができます:
       * Diff を表示（比較）
       * 変更を承認（Apply）する
       * 変更を却下する
       * 修正してから承認する
    3. すべての変更はあなたの管理下にあります

    <Tip>
      満足できない変更をいつでも元に戻せるよう、バージョン管理（Git）を有効にすることをおすすめします。
    </Tip>
  </Accordion>

  <Accordion title="API 利用コストを節約するにはどうすればよいですか？">
    **コスト削減の戦略**:

    1. **賢いモデル選択**:
       * 単純なタスクには安価なモデルを使います（GPT-4o-mini、DeepSeek）
       * 複雑なタスクにのみ高性能モデルを使います（Claude Opus、GPT-4o）

    2. **マルチモード設定を活用する**:
       * Ask モード → 最も安価なモデルを使う
       * Code/Debug モード → 中価格帯のプロ向けモデルを使う
       * Architect モード → 必要なときだけ高性能モデルを使う

    3. **チャージ特典**:
       * APIYI ではチャージ特典（10%-20%）があります
       * [チャージキャンペーン](/ja/faq/recharge-promotions)を確認してください

    4. **コンテキスト長を管理する**:
       * 不要なチャット履歴を削除する
       * 現在のタスクに集中し、不要なコンテキストを減らす
  </Accordion>

  <Accordion title="Roo Code はどのプログラミング言語をサポートしていますか？">
    **ほぼすべての主要なプログラミング言語** をサポートしており、以下を含みますが、これらに限りません:

    * **Web**: JavaScript, TypeScript, HTML, CSS, React, Vue, Angular
    * **Backend**: Python, Java, Go, Rust, C++, C#, PHP, Ruby
    * **Mobile**: Swift, Kotlin, Dart (Flutter), React Native
    * **Data**: SQL, R, Julia
    * **Other**: Shell, YAML, JSON, Markdown

    効果は以下に左右されます:

    * 選択した AI モデル
    * モデルの学習データ
    * 言語の普及度
  </Accordion>
</AccordionGroup>

## 他のツールとの比較

| 機能              | Roo Code | Cline | Cursor | GitHub Copilot |
| --------------- | -------- | ----- | ------ | -------------- |
| **マルチモード設定**    | ✅        | ❌     | ❌      | ❌              |
| **エージェントモード**   | ✅        | ✅     | ❌      | ❌              |
| **複数ファイル編集**    | ✅        | ✅     | 一部対応   | ❌              |
| **カスタム API**    | ✅        | ✅     | ✅      | ❌              |
| **無料かつオープンソース** | ✅        | ✅     | ❌      | ❌              |
| **モデル選択**       | 400+     | 400+  | 制限あり   | GitHub限定       |
| **学習コスト**       | 中程度      | 中程度   | 低い     | 低い             |

<Tip>
  **選択ガイド**:

  * **マルチモード設定が必要** → Roo Code
  * **安定性と成熟度が必要** → Cline
  * **シンプルさが必要** → Cursor
  * **GitHubとの深い統合** → GitHub Copilot
</Tip>

## 料金

Roo Code プラグインは**完全無料**です。AIモデルの利用料金のみお支払いいただきます。

APIYI を通じて AI モデルを利用するコストは、選択するモデルと利用量によって異なります。

<Card title="詳細料金を見る" icon="dollar-sign" href="/ja/api-capabilities/model-info">
  すべてのモデルの詳細料金と費用対効果の比較を見る
</Card>

<Info>
  APIYI ではチャージ特典をご用意しています。チャージ額が大きいほど、特典も高くなります（10%-20%）。初回チャージには追加特典があります。[チャージプロモーションの詳細](/ja/faq/recharge-promotions)をご覧ください。
</Info>

## 関連リソース

* [Roo Code 公式サイト](https://roo-code.net/)
* [Roo Code 公式ドキュメント](https://docs.roocode.com/)
* [GitHub リポジトリ](https://github.com/RooCodeInc/Roo-Code)
* [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline)
* [APIYI クイックスタート](/ja/getting-started)
* [モデルの推奨事項と料金](/ja/api-capabilities/model-info)

## ヘルプを取得

<CardGroup cols={2}>
  <Card title="企業WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業WeChatのQRコード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QRコードをスキャンするか、[サポートに問い合わせるにはクリック](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    設定の問題、利用ガイダンス
  </Card>

  <Card title="メールでのお問い合わせ" icon="mail">
    **カスタマーサービス**: [support@apiyi.com](mailto:support@apiyi.com)

    **ビジネス**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>

<Tip>
  **クイックスタート**: 上記の「クイックインストール」と「APIYIの設定」セクションに従って、5分でRoo Codeを使ったAI支援のプログラミングを始めましょう!
</Tip>
