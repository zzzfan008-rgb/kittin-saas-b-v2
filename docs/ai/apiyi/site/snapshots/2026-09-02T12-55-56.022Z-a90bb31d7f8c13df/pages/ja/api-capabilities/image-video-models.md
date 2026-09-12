> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 画像・動画生成モデル

> 対応している画像生成および動画生成の AI モデルを、料金と使用方法とともに確認できます。

APIYIは、複数の画像生成モデルと動画生成モデルをサポートしています。このページでは、モデルの詳細情報、価格、利用方法をご案内します。

<Tip>
  テキストモデルとマルチモーダルモデルについては、[人気モデル](/ja/api-capabilities/model-info)をご覧ください。
</Tip>

## 🎨 画像生成モデル

| モデル名                                                                            | ステータス        | 特徴                                                                                                        | 解像度/仕様                                                | 価格                                |
| ------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------- |
| [**Nano Banana Pro**](/en/api-capabilities/nano-banana-image-edit) 🔥           | ベストセラー       | 知識理解、優れた中国語テキスト、精密編集                                                                                      | 1K/2K/4K、元の比率での編集をサポート                                | \$0.09/image                      |
| [**Nano Banana 2**](/en/api-capabilities/nano-banana-2-image) 🔥                | 人気, 高速       | Pro と同等、従量課金に対応                                                                                           | 0.5K-4K、新しい 1:8 と 8:1 比率（横長画像）                        | \$0.055/image（従量課金 \$0.025-0.07）  |
| [**Nano Banana Lite**](/ja/api-capabilities/nano-banana-lite-image/overview) 🆕 | 新登場, 最速 & 最安 | Google の最速 & 最安、出力約 4 秒、NB2 より約 2.7 倍高速、1K 重視                                                             | 1K、14 種類のアスペクト比                                       | \$0.025/image（従量課金 約 \$0.018）     |
| [**gpt-image-2**](/ja/api-capabilities/gpt-image-2/overview) 🆕                 | 新登場, 公式      | OpenAI の旗艦公式、正確なサイズ/品質制御、自動高忠実度参照、mask inpainting                                                         | 1K/2K/**4K**（有効な任意サイズ）                                | token 課金、標準レート；チャージ特典期間中は約 15% オフ |
| [**gpt-image-2-all**](/ja/api-capabilities/gpt-image-2-all/overview) 🔥         | 人気, リバース     | GPT リバースの ChatGPT-web 系統、強いテキスト忠実度、中国語ネイティブ、より高速な出力（約 30–60 秒）、サイズは prompt で指定                            | 1K-2K（prompt 制御）                                      | \$0.03/image（呼び出しごと）              |
| [**gpt-image-2-vip**](/ja/api-capabilities/gpt-image-2-vip/overview) 🆕         | 新登場, リバース    | GPT リバースの Codex 系統、-all と同一の呼び出し形式、`size` フィールドで寸法を固定、4K を含む明示サイズ 30 種類、約 90–150 秒                        | 1K/2K/**4K**（30 種類のサイズ、定額）                            | \$0.03/image（呼び出しごと、4K 追加料金なし）    |
| [**Nano Banana**](/en/api-capabilities/nano-banana-image)                       | 利用可能         | 高速、優れた一貫性、EC 編集                                                                                           | 複数サイズ                                                 | \$0.02/image                      |
| [**Seedream 5.0 Pro**](/ja/api-capabilities/seedream-image/overview) 🆕         | 新登場, Pro ティア | ファミリー内で最高の画質と複雑な指示への追従、インタラクティブ編集（座標 / 選択ボックス / 矢印）、最大 10 枚の参照画像、png 出力；画像あたり約 2 分、5.0 Lite は日常作業では引き続き最適 | 1K/2K（総ピクセル数 ≤ 4.19M、3K/4K なし；バッチシーケンスや streaming なし） | \$0.12/call                       |
| [**Seedream 5.0 Lite**](/en/api-capabilities/seedream-image)                    | 利用可能         | 価格優位、高速、URL 出力                                                                                            | 2K/3K                                                 | \$0.035/image                     |
| [**Seedream 4.5**](/en/api-capabilities/seedream-image)                         | 利用可能         | 価格優位、高速、URL 出力                                                                                            | 2K/4K                                                 | \$0.04/image                      |
| [**Seedream 4.0**](/en/api-capabilities/seedream-image)                         | 利用可能         | 価格優位、高速、URL 出力                                                                                            | 2K                                                    | \$0.035/image                     |
| [**GPT Image 1.5**](/en/news/gpt-image-1-5-launch) 🔥                           | 公式           | 精密編集、4 倍の速度向上、強化されたテキスト描画                                                                                 | 低/中/高品質                                               | 従量課金                              |
| [**GPT Image 1**](/en/api-capabilities/gpt-image-1)                             | 公式           | 精密編集                                                                                                      | 複数サイズ                                                 | 従量課金                              |
| **GPT Image 1-Mini**                                                            | 公式           | sora\_image の代替                                                                                           | 複数サイズ                                                 | 従量課金                              |
| [**flux-2-max**](/ja/api-capabilities/flux/overview) 🆕                         | 最新世代（FLUX.2） | FLUX.2 の旗艦、高品質出力                                                                                          | 複数サイズ                                                 | \$0.07/call                       |
| [**flux-2-pro**](/ja/api-capabilities/flux/overview) 🆕                         | 最新世代（FLUX.2） | FLUX.2 pro、品質/価格のバランス                                                                                     | 複数サイズ                                                 | \$0.03/call                       |
| [**flux-2-flex**](/ja/api-capabilities/flux/overview) 🆕                        | 最新世代（FLUX.2） | FLUX.2 flex、調整可能なパラメータ                                                                                    | 複数サイズ                                                 | \$0.06/call                       |
| [**Flux Kontext Pro**](/en/api-capabilities/flux-image-generation)              | 利用可能         | 画像編集                                                                                                      | 複数サイズ                                                 | ドキュメント参照                          |
| [**Flux Kontext Max**](/en/api-capabilities/flux-image-generation)              | 利用可能         | 高品質な画像編集                                                                                                  | 複数サイズ                                                 | ドキュメント参照                          |

<Info>
  **Nano Banana Pro 特別価格**: 1K-4K の全解像度が一律 \$0.09/image です。公式の 4K 価格は \$0.24/image — 公式価格の約 38% です！ NanoBananaEnterprise のエンタープライズ HA チャネルも 1.4 倍レート（\$0.126/image）で利用可能です。[詳細を見る](/en/news/nano-banana-pro-launch)
</Info>

<Tip>
  **画像生成テストツール**

  * 中国からのアクセス: <a href="https://image.apiyi.com" target="_blank" rel="noopener noreferrer">image.apiyi.com</a>
  * グローバルアクセス: <a href="https://imagen.apiyi.com" target="_blank" rel="noopener noreferrer">imagen.apiyi.com</a>

  詳細ドキュメント:

  * [Nano Banana Pro ドキュメント](/en/api-capabilities/nano-banana-image-edit) - プラットフォーム最強、知識理解 + 精密編集
  * [Nano Banana 2 ドキュメント](/en/api-capabilities/nano-banana-2-image) - 従量課金、新しい超横長比率
  * [gpt-image-2-all ドキュメント](/ja/api-capabilities/gpt-image-2-all/overview) - GPT リバースの ChatGPT-web 系統、\$0.03/image、約 30–60 秒高速出力
  * [gpt-image-2-vip ドキュメント](/ja/api-capabilities/gpt-image-2-vip/overview) - GPT リバースの Codex 系統、\$0.03/image、4K を含む 30 種類のサイズ、約 90–150 秒
  * [gpt-image-2 ドキュメント](/ja/api-capabilities/gpt-image-2/overview) - OpenAI 公式、ネイティブ 4K、正確なサイズ/品質制御
  * [⚖️ 公式 vs リバース比較](/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all) - gpt-image-2 とリバース兄弟 -all / -vip の選択ガイド
  * [Nano Banana ドキュメント](/en/api-capabilities/nano-banana-image) - 高速、優れた一貫性
  * [Nano Banana Lite ドキュメント](/ja/api-capabilities/nano-banana-lite-image/overview) - 最速 & 最安、出力約 4 秒、\$0.025/image の呼び出しごと
  * [Seedream ドキュメント](/en/api-capabilities/seedream-image) - 価格優位、高速；5.0 Pro ティア（\$0.12/call、画像あたり約 2 分）を含む
  * [GPT Image 1.5 ドキュメント](/en/news/gpt-image-1-5-launch) - 4 倍の速度向上、精密編集
  * [GPT Image 1 ドキュメント](/en/api-capabilities/gpt-image-1) - 公式画像生成
  * [Flux ドキュメント](/en/api-capabilities/flux-image-generation) - 画像編集
</Tip>

## 🎬 動画生成モデル

| モデル名                                                                      | ステータス                   | 特徴                                                                                                                                                                          | 期間                                                                      | 価格                                                                                         |
| ------------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [**Seedance 2.5 / 2.0 シリーズ**](/ja/api-capabilities/seedance2/overview) 🔥 | 稼働中、注目                  | ByteDance、公式 Volcengine 中国リソース；**2.5** に加えて 2.0 standard / `fast` / `mini` を並列提供 — テキストから動画、最初／最後のフレーム、マルチモーダル参照（画像 + 動画 + 音声）、動画編集と延長、**デフォルトで音声同期**、プライベートアセットライブラリを無料で含む | 2.5 は 4～30秒、2.0 ファミリーは 4～15秒（480p/720p/1080p；1080p は 2.5 と standard のみ） | token 課金（面積 × 期間）；720p/5秒の実測値：\$0.45（mini） / \$0.73（fast） / \$0.91（standard） / \$1.35（2.5） |
| [**Wan2.7 動画**](/ja/api-capabilities/wan/overview) 🆕                     | 新登場、おすすめ                | Alibaba Wanxiang、テキスト／画像／参照／動画編集による生成、i2v は音声駆動に対応                                                                                                                          | 秒単位（最大 12秒）                                                             | \$0.084-0.14/秒（公式の 98%）                                                                    |
| [**Wan2.6 動画**](/ja/api-capabilities/wan/historical-versions)             | 利用可能                    | Wan2.7 とエンドポイントを共有し、`r2v-flash` 低レイテンシー層を含む                                                                                                                                 | 秒単位                                                                     | コンソールを参照                                                                                   |
| [**VEO 3.1 公式**](/ja/api-capabilities/veo-3-1-official/overview) 🔥       | 稼働中、注目（リバースの代替）         | Google AI Studio の公式エンドポイントへのパススルー、音声と動画の同期、実在人物、デフォルトグループから呼び出し可能                                                                                                          | 4/6/8秒                                                                  | 1回あたり \$0.3 / \$1.2（720p/1080p/4k は同一価格）                                                   |
| **Veo 3.1 リバース**                                                          | ⏸️ 一時停止中（Google のリスク管理） | Google Flow のリバース；一時停止中は **VEO 3.1 公式** を使用                                                                                                                                 | 固定 8秒                                                                   | 利用不可                                                                                       |
| **Sora 2 公式**                                                             | ⏸️ 終了                   | OpenAI 公式リレー、プロフェッショナルな制作、高い安定性、sora-2-pro に対応、「キャラクター」参照なし                                                                                                                 | 4/8/12秒                                                                 | 利用不可                                                                                       |
| [**HappyHorse 1.1**](/ja/api-capabilities/happyhorse/overview) 🆕         | 新登場                     | Alibaba、複数参照による被写体の一貫性（最大 9枚の画像）、Wan とグループを共有                                                                                                                               | 秒単位（最大 12秒）                                                             | \$0.126-0.224/秒（公式の 98%）                                                                   |
| ~~**Sora 2 リバース**~~                                                       | ❌ 終了                    | 以前は e コマース／アニメのシナリオ向け、代わりに Sora 2 公式を使用                                                                                                                                     | —                                                                       | —                                                                                          |

<Info>
  **動画モデルの主な機能**:

  * **Seedance 2.5 / 2.0 シリーズ（ByteDance）**: `doubao-seedance-2-5-260628`（2.5 — 最大 30秒、30枚の参照画像、mov 出力） / `doubao-seedance-2-0-260128`（standard） / `-fast-260128`（fast） / `-mini-260615`（mini） — 価格と速度は異なります（mini \< fast \< standard \< 2.5、2.5 は standard の約 1.5倍）；mini と fast は最大 720p です。**4つすべてのモデルが `SeeDance2` グループ上で動作**するため、1つの token ですべてを利用できます。token の課金モードは「usage-first」または「usage-based」である必要があります。`SD2Mini`（0.10x）と `SD2Fast`（0.15x）は期間限定の割引グループです — **mini は 44.4% オフ、fast は 16.7% オフ、2026-09-07 23:59 (UTC+8) まで**；その後はレートが 0.18x に戻り、グループは引き続き利用可能です
  * **VEO 3.1 公式**: Google AI Studio の公式エンドポイントへのパススルー、業界をリードする音声と動画の同期、実在人物に対応、デフォルトグループ + 1回ごとの課金／usage-first token で呼び出し可能、Veo 3.1 リバースが一時停止中の推奨代替手段です
  * **Veo 3.1 リバース**: Google のリスク管理により**一時停止中**、復旧時期は未定です。それまでは VEO 3.1 公式を使用してください
  * **Sora 2 公式**: 終了、現在は利用できません
  * **Wan2.7 / Wan2.6（Alibaba Wanxiang）**: デフォルト価格は公式の約 98%、両シリーズが HappyHorse と `Wan&HappyHorse` グループを共有し、1つの token ですべてを利用可能です。Wan2.6 と Wan2.7 は同じエンドポイントとスキーマを共有しており、`model` 名を変更するだけで移行できます
  * **HappyHorse 1.1（Alibaba）**: 複数参照による被写体の一貫性に優れ、Wan と `Wan&HappyHorse` グループおよびエンドポイントを共有します
  * AI 動画ツール（オンラインテスト）: <a href="https://icover.ai" target="_blank" rel="noopener noreferrer">icover.ai</a>
</Info>

<Note>
  **近日公開予定の動画モデル**:

  * Kling 3.0

  今後の発表にもご注目ください。最新のローンチ通知を受け取るには、ぜひフォローしてください。
</Note>

## 💰 料金情報

* **従量課金**: 実際の使用量に基づいて課金され、最低課金額はありません
* **残高の有効期限**: チャージ日から365日間有効で、次回のチャージ時に自動的にリセットされます（[チャージ特典](/ja/faq/recharge-promotions)をご覧ください）
* すべてのモデルの最新料金については、[APIYI コンソール料金ページ](https://www.apiyi.com/account/pricing)をご覧ください
