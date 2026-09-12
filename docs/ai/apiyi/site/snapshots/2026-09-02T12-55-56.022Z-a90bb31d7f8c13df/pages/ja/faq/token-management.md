> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# KEY の作成方法は？

> APIYI の token 管理ガイドです。デフォルト token の取得方法と、新しい KEY の作成方法を含む完全な手順を説明します

## 既存のデフォルトトークンを取得する

1. 上部ナビゲーションの「トークン」ページに移動します: [https://api.apiyi.com/token](https://api.apiyi.com/token)

2. ページ上でデフォルトトークンを見つけ、右端の管理メニューをクリックします

3. 管理メニュー内のコピーアイコンを見つけてクリックし、コピーします

4. `sk-`で始まる形式の、完全な KEY をコピーします

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=6ca82bbb014b12b285048e6b50a00461" alt="APIキーをコピー" width="1466" height="1006" data-path="images/key-manage.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=6ca82bbb014b12b285048e6b50a00461" alt="APIキーをコピー" width="1466" height="1006" data-path="images/key-manage.png" />

## 新しいKEYの作成

デフォルトの token に加えて、新しいKEYを作成して使用権限をより正確に制御することもできます:

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="新しいAPI Keyを追加" width="1284" height="1158" data-path="images/key-add-new.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="新しいAPI Keyを追加" width="1284" height="1158" data-path="images/key-add-new.png" />

### 新しいKEYを作成する利点

* **残高の管理**: 各KEYごとに専用の残高上限を設定できます
* **有効期限の管理**: KEYの有効期限を設定できます
* **柔軟な割り当て**: チーム利用やプロジェクトの分離に適しています

<Warning>
  **重要な注意**: 新しいKEYを作成する際は、**利用可能なモデルを設定する必要はありません**。

  ここではホワイトリスト方式を使用します:

  * **利用可能なモデルを設定した場合**: KEYは指定したモデルのみ使用できます
  * **利用可能なモデルを設定しない場合**: KEYはサイト上の400+のすべてのモデルを使用できます

  利用可能なモデルは設定しないことをおすすめします。そうすると、すべてのモデルにアクセスできます。
</Warning>

## KEY 形式の説明

* すべての API KEY は `sk-` で始まります
* KEY の長さは通常 48-64 文字です
* KEY は安全に保管し、公開の場で共有しないでください

## 利用の推奨事項

1. **開発テスト**: 既定の token を使って、開発やテストを手早く行います
2. **本番環境**: 本番プロジェクト向けに専用の KEY を作成し、管理と監視をしやすくします
3. **チームでの共同作業**: メンバーごとに独立した KEY を作成し、権限管理を便利にします
