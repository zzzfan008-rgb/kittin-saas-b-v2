> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# UpdreamをAPIYIに接続

> Updreamの外部モデルコネクタを使用してAPIYIの画像モデルを呼び出し、AIクリエイティブタスクを実行します

<Tip>
  Updreamは、Bilibiliのクリエイター、プロフェッショナルクリエイター、コンテンツチーム向けのAI動画作成プラットフォームです。コネクターを介して外部モデルを接続すると、UpdreamのクリエイティブワークフローからAPIYIの画像モデルを呼び出せます。
</Tip>

## Updreamとは？

Updreamは、エージェントとの会話、ノードベースの無限キャンバス、スキルライブラリ、マルチモデル生成を組み合わせ、アイデアや脚本から絵コンテ、アセット、動画制作までのワークフローをサポートします。

1行のアイデア、ストーリー概要、既存の脚本、参考資料から始めて、エージェントとの対話でクリエイティブの方向性を洗練できます。プランを確認した後は、脚本、絵コンテ、キャラクター、シーン、小道具、その他のクリエイティブアセットの作成を続けられます。頻繁に使用するクリエイティブの手法は、スキルとして保存してプロジェクト間で再利用することもできます。

公式サイトでは、以下の主要機能が紹介されています。

* **エージェントによるアイデア創出支援**：自然言語での会話を通じて、クリエイティブの方向性やコンテンツ計画を洗練します。
* **脚本と絵コンテの生成**：アイデアを脚本、絵コンテテーブル、ショット単位のアセットに変換します。
* **無限キャンバスのワークフロー**：テキスト、画像、動画、その他のクリエイティブアセットをノードで整理します。
* **スキルライブラリ**：プロンプト最適化、キャラクターデザイン、スタイルの一貫性を保つ手法を、再利用可能なスキルとして保存します。
* **マルチモデル作成**：タスクごとに画像、動画、その他のモデル機能を選択します。

このガイドでは、Updreamの**外部モデルコネクター**を使用し、APIYIのOpenAI互換設定で画像を生成する方法を説明します。スクリーンショットの例では`gpt-image-2`を使用しています。正確なモデルIDとパラメーターについては、現在のAPIYIモデルドキュメントを確認してください。

## UpdreamをAPIYIに接続する理由

UpdreamをAPIYIに接続すると、次のことが可能になります。

* 1つのAPIキーで外部モデルを設定できます。
* Base URL、APIキー、モデルIDをUpdreamに直接入力できます。
* クリエイティブタスクに応じてAPIYIのモデルを切り替えられます。
* 生成した画像を、ストーリーボード、キャラクター、シーン、その他のクリエイティブアセットとして再利用できます。
* UpdreamのAgent、Skill、キャンバスワークフローを維持できます。

## 開始する前に

以下を準備してください：

* Updream をインストールし、ログイン済みにします。
* 有効な APIYI API キー。
* APIYI アカウントの利用可能な残高。
* 使用するモデル ID（例：`gpt-image-2`）。

<Warning>
  API キーは機密性の高い認証情報です。スクリーンショット、ドキュメント、公開チャットに実際のキーを掲載しないでください。タスク完了後に無効化できる一時キーまたは制限付きキーの使用を推奨します。
</Warning>

## ステップ 1：外部モデルコネクタを開く

1. Updreamを開き、左サイドバーで**スキル**を選択します。
2. **スキルマーケットプレイス**を開きます。
3. **外部モデルコネクタ**を検索します。
4. **外部モデルコネクタ**の検索結果を選択します。
5. **今すぐ使用**をクリックします。

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-skill-market.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=355bcaabca93495564c10abc477d82a4" alt="Updreamスキルマーケットプレイスの外部モデルコネクタ" width="1579" height="766" data-path="images/updream-skill-market.png" />

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-skill-detail.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=ed70b83ecbc1d7f043adcc459aaeb546" alt="Updream外部モデルコネクタの詳細" width="1456" height="804" data-path="images/updream-skill-detail.png" />

詳細ページには、テキストおよび画像入力のサポートと、画像、動画、テキストの出力オプションが表示されます。このガイドでは、スクリーンショットで確認できた画像生成フローのみを説明します。

## ステップ 2：接続プロトコルを選択する

**接続**ステップで、次を選択します。

> **OpenAI 互換（推奨）**

カスタムレスポンスに APIYI Base URL と API キーを入力します。スクリーンショットに表示されている APIYI Base URL は次のとおりです。

```text theme={null}
https://api.apiyi.com/v1
```

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-connection.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=066b622f4017d306ec63443122e7cbb5" alt="OpenAI 互換プロトコルを選択" width="805" height="466" data-path="images/updream-connection.png" />

<Info>
  このガイドでは、スクリーンショットに示されている OpenAI 互換構成を使用します。Google GenAI、Gemini REST、Seedance、汎用 JSON は、この検証済み構成の対象外です。各プロトコルの要件を確認せずに、このページのパラメーターをそれらのプロトコルで再利用しないでください。
</Info>

## ステップ 3：タスクタイプを選択する

**タスク**ステップで、次を選択します。

> **画像生成（推奨）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-task.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=c3d9b5efe007777b45306d8a8da30479" alt="画像生成タスクを選択" width="806" height="462" data-path="images/updream-task.png" />

このオプションでは、prompt から画像を直接生成します。External Model Connector には、画像編集、テキスト生成、動画送信、タスクのポーリングのオプションも表示されます。これらのタスクには、実際のモデル、プロトコル、エンドポイントに基づく個別の設定が必要です。このガイドでは、動画タスクに画像設定を再利用しません。

## ステップ 4：モデルの提供方法を選択する

**モデル**ステップで、次を選択します。

> **モデル名をインターフェース ID として**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-model.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=8d0a577cd0eb88c74b283a691580fd9c" alt="モデル ID オプションを選択" width="839" height="462" data-path="images/updream-model.png" />

このオプションでは、モデルの実際のインターフェース ID が必要です。スクリーンショットの例では、次を使用しています。

```text theme={null}
gpt-image-2
```

APIYI のモデルドキュメントに記載されている正確なモデル ID を使用してください。表示名、カスタムエイリアス、または別のプラットフォームのモデル名は入力しないでください。

## ステップ 5：パラメータの提供方法を選択する

**パラメータ**ステップで、次を選択します。

> **完全なパラメータを自分で指定する（推奨）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-parameters.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=403ba71983675aa653c9a5f708d98044" alt="完全なパラメータのオプションを選択" width="817" height="447" data-path="images/updream-parameters.png" />

このオプションでは、以降のレスポンスで画像プロンプト、アスペクト比、サイズ、品質、画像数を指定します。Updream には **プロンプトを自動で最適化する** と **一般的なデフォルト値を使用する** オプションもありますが、このガイドではスクリーンショットで確認できる手順の対象外です。

## ステップ 6：API認証情報を入力する

**認証情報**のステップで、次を選択します。

> **今すぐ入力（推奨）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-credentials.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=9843e1ab900d327b7c7feace9dd5bc12" alt="今すぐAPI認証情報を入力することを選択" width="842" height="525" data-path="images/updream-credentials.png" />

Updreamの指示に従って、APIYIのベースURLとAPIキーを入力します。ご自身のAPIYIキーを使用し、スクリーンショットに表示されているサンプル値は使用しないでください。

## ステップ 7：モデル名を入力する

**モデル名**のステップで、次を選択します：

> **今すぐ入力（推奨）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-model-name.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=c3fb10101ce86c1a8998a2d2e8330098" alt="モデル名を入力" width="872" height="534" data-path="images/updream-model-name.png" />

使用するモデル ID を入力します：

```text theme={null}
gpt-image-2
```

モデルを切り替えるには、この値を APIYI で現在サポートされている別の画像モデル ID に置き換え、選択したタスクとの互換性を確認します。

## ステップ 8：画像プロンプトを入力する

**プロンプト**ステップで、次を選択します。

> **元のテキストを使用（推奨）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-prompt.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=32769dbb70cc23e32466328c6f136142" alt="元のプロンプトを使用することを選択" width="860" height="535" data-path="images/updream-prompt.png" />

次に、画像プロンプトを入力します。例：

```text theme={null}
Wind blowing through a wheat field
```

対象、構図、カメラ、照明、視覚的な制約などの詳細をUpdreamに追加させたい場合は、代わりに**最適化を許可**を選択します。**元のテキストを使用**では、入力した内容のままプロンプトが送信されます。

## ステップ 9：出力パラメータを選択する

**出力**ステップで、次を選択します。

> **1:1 · 1K · シングル（推奨）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-output.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=cc4352948846b67a69431fe804aed3f2" alt="画像の出力パラメータを選択" width="850" height="534" data-path="images/updream-output.png" />

スクリーンショットには、次の設定が表示されています。

| パラメータ  | 設定  |
| ------ | --- |
| アスペクト比 | 1:1 |
| 解像度    | 1K  |
| 画像数    | 1枚  |
| 品質     | 中品質 |

Updream には、`16:9 · 2K · Single`、`9:16 · 2K · Single`、および**カスタム完全パラメータ**も表示されます。利用できるサイズ、品質、画像数は、選択したモデルによって異なります。モデルのドキュメントと、インターフェースで現在利用できるオプションに従ってください。

## ステップ10：APIYIの設定を送信する

前の選択を完了すると、Updreamから指定された形式で設定を送信するよう求められます。スクリーンショットには、次の形式の例が示されています。

```text theme={null}
Base URL: https://api.apiyi.com/v1
API Key: YOUR_API_KEY
Model: gpt-image-2
Prompt: Wind blowing through a wheat field
```

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-submit-reference.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=be4bba305fc22f776216498ff601a2f3" alt="外部モデル設定の送信形式の例" width="865" height="630" data-path="images/updream-submit-reference.png" />

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-submit-example.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=ff8094bb573b32a8021091244755a5b5" alt="入力済みの外部モデル設定の例" width="575" height="125" data-path="images/updream-submit-example.png" />

送信する前に、以下を確認してください。

* ベースURLが`https://api.apiyi.com/v1`であること。
* APIキーが自身のAPIYIキーに置き換えられていること。
* モデルIDが正しいこと。
* promptに画像要件がすべて含まれていること。
* 出力サイズ、品質、数が、選択したモデルの能力の範囲内であること。

## ステップ 11：生成結果を確認する

送信後、Updreamに生成結果が表示されます。スクリーンショットの例では、次のようになっています。

* モデル：`gpt-image-2`
* プロンプト：`Wind blowing through a wheat field`
* フォーマット：1:1
* 解像度：1024 × 1024
* 枚数：1枚

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-task-complete.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=3a5996a5b0c90c1225194834c23a534a" alt="Updreamで生成された画像の結果" width="514" height="489" data-path="images/updream-task-complete.png" />

生成された画像は、Updreamのクリエイティブワークフローで引き続き参照素材として使用できます。特定のノードやタスクに接続できるかどうかは、そのタスクの入力タイプと、選択したモデルの機能によって異なります。

## 最新のモデル推奨を見る

<Card title="最新のモデル推奨を見る" icon="star" href="/ja/api-capabilities/model-info">
  現在のモデル推奨、機能比較、利用ガイダンスをご確認いただけます。リストは継続的に更新されています。
</Card>

<Info>
  モデル ID とインターフェースパラメータは時間の経過とともに変更されます。現在の ID、画像サイズ、品質オプション、タスク制限については、APIYI のモデル推奨と選択したモデルのドキュメントをご確認ください。
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="使用するベース URLはどれですか？">
    このガイドで検証しているOpenAI互換フローでは、`https://api.apiyi.com/v1`を使用してください。その他のプロトコルでは異なるアドレスとパラメータを使用するため、この設定と混在させないでください。
  </Accordion>

  <Accordion title="モデル名には何を入力すればよいですか？">
    APIYIのドキュメントに記載されている正確なモデルIDを入力してください。たとえば、スクリーンショットに示されている`gpt-image-2`などです。モデルIDのスペルを間違えると、モデルが見つからないエラーやリクエストエラーが発生する場合があります。
  </Accordion>

  <Accordion title="APIキーを恒久的に設定したままにできますか？">
    推奨されません。可能な場合は一時的なキーまたは権限を制限したキーを使用し、タスクの完了後に使用していない認証情報を失効または削除してください。
  </Accordion>

  <Accordion title="この設定をそのまま使用して動画を生成できますか？">
    できると考えないでください。外部モデルコネクタのインターフェースには動画の送信とタスクのポーリングが表示されますが、動画タスクには実際のモデル、プロトコル、パラメータに基づく個別の設定が必要です。このガイドでは画像生成のみを検証しています。
  </Accordion>

  <Accordion title="タスクから結果が返されなかったのはなぜですか？">
    APIキーが有効か、ベース URLが`https://api.apiyi.com/v1`か、モデルIDが正しいか、モデルが選択した画像タスクに対応しているか、そしてAPIYIアカウントの残高が十分かを確認してください。問題が続く場合は、Updreamのタスクメッセージと、APIYIから返されたエラーの両方を確認してください。
  </Accordion>

  <Accordion title="結果がpromptと完全には一致しないのはなぜですか？">
    画像モデルはpromptを解釈し、そこから画像を生成します。関係のない詳細を削除する、被写体と構図を明確にする、重要な要件をpromptの前半に配置する、または**最適化を許可**をオフにして元のpromptを送信する、といった方法を試してください。
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="Updream公式ウェブサイト" icon="globe">
    `www.updream.cn`
  </Card>

  <Card title="APIYIモデルのおすすめ" icon="star" href="/ja/api-capabilities/model-info">
    現在のモデル、機能、利用ガイダンスをご確認いただけます。
  </Card>

  <Card title="APIYI APIキー管理" icon="key" href="/ja/faq/token-management">
    APIキーを取得・管理できます。
  </Card>

  <Card title="APIYI APIドキュメント" icon="book" href="/ja/getting-started">
    APIの統合とAPI呼び出しについて説明します。
  </Card>
</CardGroup>
