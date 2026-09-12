> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# tokens と グループ

> APIYI の token（APIキー）が何をするのか、作成・編集方法、そしてデフォルトグループとフォールバックグループを含むグループの仕組みを学びます。

## token とは何ですか（API KEY）

token は、APIYI を呼び出す際に使用する **API KEY** で、`sk-` から始まります。これは、あなたの本人確認と権限のための認証情報です。主な役割は次のとおりです。

<CardGroup cols={2}>
  <Card title="認証" icon="shield">
    すべての API 呼び出しには、本人確認とアカウント確認のために token を含める必要があります。
  </Card>

  <Card title="クォータと権限制御" icon="sliders-horizontal">
    token ごとに、専用のクォータ、有効期限、許可されたモデル、グループを設定できます。
  </Card>

  <Card title="利用統計" icon="chart-line">
    各 token の利用額、残りのクォータ、呼び出しログを個別に追跡します。
  </Card>

  <Card title="柔軟な割り当て" icon="users">
    プロジェクトやチームメンバーごとに個別の token を作成できます。
  </Card>
</CardGroup>

<Info>
  登録後、システムは自動的に **デフォルト token** を生成し、そのまま使えます。必要に応じて追加の tokens も作成できます。
</Info>

## token の作成方法

<Steps>
  <Step title="Token ページを開く">
    上部ナビゲーションから「Token」ページを開きます: [https://api.apiyi.com/token](https://api.apiyi.com/token)
  </Step>

  <Step title="「New」をクリック">
    右上の「New」ボタンをクリックして、token 作成ダイアログを開きます。
  </Step>

  <Step title="token の詳細を入力する">
    token 名、クォータ（無制限は任意）、有効期限（無期限は任意）、課金モード、グループを設定します（下記参照）。
  </Step>

  <Step title="保存して KEY をコピーする">
    保存後、token の右側にあるコピーアイコンをクリックして、`sk-` KEY 全体をコピーします。
  </Step>
</Steps>

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="新しい token を作成" width="1284" height="1158" data-path="images/key-add-new.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="新しい token を作成" width="1284" height="1158" data-path="images/key-add-new.png" />

<Tip>
  token を作成するときに、**利用可能なモデルを設定する必要はありません**。ホワイトリスト方式が適用されます。空のままにすると token は 400 以上のすべてのモデルを使用でき、設定するとそのモデルに限定されます。[Token モデルのホワイトリスト](/ja/faq/token-model-whitelist) をご覧ください。
</Tip>

## トークンの編集とコード例の表示

「操作」列の\*\*管理メニュー（レンチアイコン）\*\*をクリックすると、すべての操作を展開できます:

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/apiyi-token-simple-code.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=067d8d551cd1d8aaebb833932e6632a5" alt="Token management menu and request example" width="1496" height="902" data-path="images/apiyi-token-simple-code.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/apiyi-token-simple-code.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=067d8d551cd1d8aaebb833932e6632a5" alt="Token management menu and request example" width="1496" height="902" data-path="images/apiyi-token-simple-code.png" />

| 操作                     | 説明                                                       |
| ---------------------- | -------------------------------------------------------- |
| **トークンを無効化**           | トークンを一時的に無効化します。呼び出しは拒否されます                              |
| **トークンを編集**            | 名前、クォータ、有効期限、課金モード、グループなどを変更します。                         |
| **リクエスト例**             | **コード例を表示** — このトークン用に、curl、Python など複数言語のすぐ実行できる呼び出しコード |
| **トークンのログ**            | このトークンの呼び出し履歴を表示します                                      |
| **トークンを共有 / ワンクリック設定** | サードパーティツールとすばやく共有または連携できます                               |

<Note>
  「リクエスト例」は**コード例**のエントリーポイントです。現在のトークンが事前入力された実行可能な呼び出しコードを生成するため、KEY と endpoint を手動で組み立てる必要がありません。クイックテストや統合に最適です。
</Note>

## 複数人で 1 つの token を共有するとレート制限されますか？

お客様からよくある質問です: **「1 つの token を複数人で共有した場合、レート制限されますか？」**

答えは、**token 自体にレート制限はありません**。レート制限は **アカウント** に基づいて適用されるため、所有している token の数や利用する人数にかかわらず、1 つの token を 10 人で共有しても、1 人につき 10 個の token を使っても、挙動はまったく同じです。

<CardGroup cols={2}>
  <Card title="RPM（リクエスト/分）" icon="gauge">
    一般的には、1 つのアカウントで最大 **100 RPM** までならまったく問題ありません。ほとんどのチームやアプリケーションには十分です。
  </Card>

  <Card title="TPM（毎分 token 数）" icon="infinity">
    **TPM は適用されません**。そのため、長いコンテキストや高い同時 token 量で制限が発動する心配はありません。
  </Card>
</CardGroup>

<Tip>
  token の共有はレート制限に影響しませんが、**管理** の観点からは、メンバーごとまたはプロジェクトごとに個別の token を用意することを引き続きおすすめします。そうすれば、各自に固有のクォータ、呼び出しログ、利用額統計が割り当てられます。
</Tip>

## グループとは

**グループは、token に対して選択できる「リソースチャネル」です。** 異なるグループは、異なる上流リソース、利用可能なモデル範囲、課金倍率に対応しており、ユーザーが選択できるように公開されています。

要するに、同じモデルでも複数の上流チャネルから提供されることがあり、グループを使うことでどのチャネルを使うかを選べます。**モデルによっては異なるグループが必要になるため、適切なグループを選ぶことで呼び出しが正常に動作し、対応する割引も適用されます。**

<Info>
  大半の場合、**デフォルトグループ（Default）** だけで十分です — テキストモデル、NanoBanana シリーズ、Veo 3.1 を含む、ほとんどすべてのモデルをカバーしています。
</Info>

## デフォルトグループとフォールバックグループ

1つの token には最大で **3つのグループ** を設定できます: **デフォルトグループ1つ + フォールバックグループ2つ**。

<CardGroup cols={2}>
  <Card title="デフォルトグループ（プライマリ）" icon="circle-check">
    このグループを token が最初に使用します。ほとんどのモデルをカバーします。すべての token にはデフォルトグループが1つ必要です。
  </Card>

  <Card title="フォールバックグループ（バックアップ）" icon="life-buoy">
    デフォルトグループでリクエストを処理できない場合に自動的に有効になるバックアップチャネルです。最大2つまで設定でき、呼び出し成功率を向上させます。
  </Card>
</CardGroup>

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/UCijFWltmtlBUyvg/images/nano-banana-token-fallback-setup.png?fit=max&auto=format&n=UCijFWltmtlBUyvg&q=85&s=60e569c034776ae83d9866fcfac343c0" alt="グループとフォールバックグループの選択" width="1276" height="1176" data-path="images/nano-banana-token-fallback-setup.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/UCijFWltmtlBUyvg/images/nano-banana-token-fallback-setup.png?fit=max&auto=format&n=UCijFWltmtlBUyvg&q=85&s=60e569c034776ae83d9866fcfac343c0" alt="グループとフォールバックグループの選択" width="1276" height="1176" data-path="images/nano-banana-token-fallback-setup.png" />

token の作成・編集ダイアログでは:

* **グループを選択**: デフォルト（プライマリ）グループを設定します。`Default` 既定で
* **フォールバックグループ**: プライマリが利用できないときに引き継ぐバックアップグループを1〜2つ追加します

<Tip>
  **グループは token の課金倍率と利用可能なモデルに影響します。** 実際に使うモデルに基づいて選択してください。迷ったら、デフォルトの `Default` をそのままにしてください。
</Tip>

## モデルごとに異なるグループが必要です

デフォルトのグループでほとんどのモデルをカバーできますが、一部のモデル、特に**動画モデル**は専用グループが必要です。

| モデル / シナリオ                                  | 選択するグループ            |
| ------------------------------------------- | ------------------- |
| テキスト、マルチモーダル、NanoBanana、Veo 3.1、およびほとんどのモデル | **デフォルト**           |
| Sora 2 公式動画                                 | **Sora2Official**   |
| Alibaba Wan & HappyHorse 動画シリーズ             | **Wan\&HappyHorse** |

<Warning>
  Sora 2 公式、Wan\&HappyHorse、その他の専用グループのモデルを呼び出す場合、トークンに対応するグループが含まれていないとそのモデルは利用できません。よく使う専用グループをフォールバックとして追加するか、これらのモデル用に別のトークンを作成することを検討してください。
</Warning>

## グループの概要

以下は、システムによって提供されるグループと説明です（コンソール表示が正です）:

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/token-groups-overview-20260527.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=5a8d30f9f468b01afda6aeb52ae98912" alt="APIYI token グループの概要" width="1200" height="844" data-path="images/token-groups-overview-20260527.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/token-groups-overview-20260527.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=5a8d30f9f468b01afda6aeb52ae98912" alt="APIYI token グループの概要" width="1200" height="844" data-path="images/token-groups-overview-20260527.png" />

<Note>
  「グループ倍率」列は RMB 建ての相対値です。これは**USD の直接的な割引率ではない**ため、深く考えすぎる必要はありません。モデルに合うグループを選ぶだけで十分です。倍率と価格変換については、[モデルの倍率とは何ですか？](/ja/faq/model-multiplier) をご覧ください。
</Note>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Token 課金モード" icon="calculator" href="/ja/faq/token-billing-modes">
    従量課金とコールごとの課金の違いを理解します。
  </Card>

  <Card title="Token モデルの許可リスト" icon="list" href="/ja/faq/token-model-whitelist">
    1つの token で使用できるモデルを制限する方法です。
  </Card>

  <Card title="モデル倍率" icon="percent" href="/ja/faq/model-multiplier">
    倍率の意味と料金計算を理解します。
  </Card>

  <Card title="呼び出しログ" icon="file-text" href="/ja/faq/call-logs">
    token ごとの呼び出し記録と利用額の詳細を確認します。
  </Card>
</CardGroup>
