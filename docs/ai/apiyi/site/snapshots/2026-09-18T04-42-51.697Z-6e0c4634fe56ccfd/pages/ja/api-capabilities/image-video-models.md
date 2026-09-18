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

| モデル名                                                                                           | ステータス           | 特長                                                                                                                                               | 解像度/仕様                                              | 価格                                            |
| ---------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | --------------------------------------------- |
| [**Nano Banana Pro**](/en/api-capabilities/nano-banana-image-edit) 🔥                          | ベストセラー          | 知識理解、優れた中国語テキスト、精密な編集                                                                                                                            | 1K/2K/4K、元の比率での編集をサポート                              | \$0.09/画像                                     |
| [**Nano Banana 2**](/en/api-capabilities/nano-banana-2-image) 🔥                               | 人気、高速           | Proと同等、使用量ベースの課金をサポート                                                                                                                            | 0.5K-4K、新しい1:8および8:1の比率（長尺画像）                       | \$0.055/画像（使用量ベース \$0.025-0.07）               |
| [**Nano Banana Lite**](/ja/api-capabilities/nano-banana-lite-image/overview) 🆕                | 新登場、最速かつ最安      | Google最速かつ最安、約4秒で出力、NB2より約2.7倍高速、1Kに特化                                                                                                           | 1K、14のアスペクト比                                        | \$0.025/画像（使用量ベース 約\$0.018）                   |
| [**gpt-image-2.5-flare**](/ja/api-capabilities/gpt-image-2/overview) 🆕                        | 2026年9月新登場、公式   | OpenAI GPT-Image 2.5の速度優先版：gpt-image-2より高品質で、最大50%低いレイテンシ、精密なサイズ/品質制御（`xhigh` / `max`を追加）、自動高忠実度参照、マスクインペインティング                                  | 1K/2K/**4K**（任意の有効なサイズ）                             | token課金、gpt-image-2と同価格。チャージプロモーション期間中は約15%オフ |
| [**gpt-image-2.5-sunburst**](/ja/api-capabilities/gpt-image-2/overview) 🆕                     | 2026年9月新登場、公式   | OpenAI GPT-Image 2.5の品質および編集精度優先版：より強力なマルチターン編集と被写体保持、flareと同じパラメータ                                                                              | 1K/2K/**4K**（任意の有効なサイズ）                             | token課金、gpt-image-2と同価格                       |
| [**gpt-image-2**](/ja/api-capabilities/gpt-image-2/overview)                                   | 公式、前世代          | OpenAI公式、精密なサイズ/品質制御（最大`high`）、自動高忠実度参照、マスクインペインティング                                                                                             | 1K/2K/**4K**（任意の有効なサイズ）                             | token課金、標準レート。チャージプロモーション期間中は約15%オフ           |
| [**gpt-image-2-all**](/ja/api-capabilities/gpt-image-2-all/overview) 🔥                        | 人気、リバース         | GPTリバースChatGPT-webライン、高いテキスト忠実度、ネイティブ中国語、より高速な出力（約30～60秒）、サイズはpromptで指定                                                                          | 1K-2K（prompt制御）                                     | \$0.03/画像（呼び出しごと）                             |
| [**gpt-image-2.5-flare-vip / sunburst-vip**](/ja/api-capabilities/gpt-image-2-vip/overview) 🆕 | 2026年9月新登場、リバース | GPT-Image 2.5のAdobeラインリバース版：-vipと同じ呼び出し形式、`size`で**4K**を含む30のプリセットを固定、さらに6つすべての`quality`階層（`xhigh` / `max`を含む）と透明背景に対応。エイリアスは`gpt-image-2.5-vip` | 1K/2K/**4K**（30サイズで一律）                              | \$0.03/画像（呼び出しごと）                             |
| [**gpt-image-2-vip**](/ja/api-capabilities/gpt-image-2-vip/overview)                           | リバース            | GPTリバースAdobeライン（Firefly）、-allと同一の呼び出し形式、`size`フィールドでサイズを固定、**4K**を含む30の明示的なサイズ、約90～150秒                                                          | 1K/2K/**4K**（30サイズ、均一価格）                            | \$0.03/画像（呼び出しごと、4K追加料金なし）                    |
| [**Nano Banana**](/en/api-capabilities/nano-banana-image)                                      | 利用可能            | 高速、優れた一貫性、EC編集                                                                                                                                   | 複数サイズ                                               | \$0.02/画像                                     |
| [**Seedream 5.0 Pro**](/ja/api-capabilities/seedream-image/overview) 🆕                        | 新登場、Pro階層       | ファミリー内で最高の画像品質と複雑な指示追従、インタラクティブ編集（座標 / 選択ボックス / 矢印）、最大10枚の参照画像、png出力。画像1枚あたり約2分、日常的な作業には引き続き5.0 Liteが最適                                          | 1K/2K（総ピクセル数 ≤ 4.19M、3K/4Kなし。バッチシーケンスおよびストリーミング非対応） | \$0.12/呼び出し                                   |
| [**Seedream 5.0 Lite**](/en/api-capabilities/seedream-image)                                   | 利用可能            | 価格面の優位性、高速、URL出力                                                                                                                                 | 2K/3K                                               | \$0.035/画像                                    |
| [**Seedream 4.5**](/en/api-capabilities/seedream-image)                                        | 利用可能            | 価格面の優位性、高速、URL出力                                                                                                                                 | 2K/4K                                               | \$0.04/画像                                     |
| [**Seedream 4.0**](/en/api-capabilities/seedream-image)                                        | 利用可能            | 価格面の優位性、高速、URL出力                                                                                                                                 | 2K                                                  | \$0.035/画像                                    |
| [**GPT Image 1.5**](/en/news/gpt-image-1-5-launch) 🔥                                          | 公式              | 精密な編集、4倍の高速化、強化されたテキストレンダリング                                                                                                                     | Low/Med/High品質                                      | 使用量ベース                                        |
| [**GPT Image 1**](/en/api-capabilities/gpt-image-1)                                            | 公式              | 精密な編集                                                                                                                                            | 複数サイズ                                               | 使用量ベース                                        |
| **GPT Image 1-Mini**                                                                           | 公式              | sora\_imageの代替                                                                                                                                   | 複数サイズ                                               | 使用量ベース                                        |
| [**flux-2-max**](/ja/api-capabilities/flux/overview) 🆕                                        | 最新世代（FLUX.2）    | FLUX.2フラッグシップ、高品質な出力                                                                                                                             | 複数サイズ                                               | \$0.07/呼び出し                                   |
| [**flux-2-pro**](/ja/api-capabilities/flux/overview) 🆕                                        | 最新世代（FLUX.2）    | FLUX.2 pro、品質と価格のバランス                                                                                                                            | 複数サイズ                                               | \$0.03/呼び出し                                   |
| [**flux-2-flex**](/ja/api-capabilities/flux/overview) 🆕                                       | 最新世代（FLUX.2）    | FLUX.2 flex、調整可能なパラメータ                                                                                                                           | 複数サイズ                                               | \$0.06/呼び出し                                   |
| [**Flux Kontext Pro**](/en/api-capabilities/flux-image-generation)                             | 利用可能            | 画像編集                                                                                                                                             | 複数サイズ                                               | ドキュメント参照                                      |
| [**Flux Kontext Max**](/en/api-capabilities/flux-image-generation)                             | 利用可能            | 高品質な画像編集                                                                                                                                         | 複数サイズ                                               | ドキュメント参照                                      |

<Info>
  **Nano Banana Pro 特別価格**: 1K～4Kの全解像度を一律 \$0.09/画像で提供します。公式の4K価格は \$0.24/画像であり、公式価格の約38%です！NanoBananaEnterpriseエンタープライズHAチャネルも1.4倍のレート（\$0.126/画像）で利用可能です。[詳細を見る](/en/news/nano-banana-pro-launch)
</Info>

<Tip>
  **画像生成テストツール**

  * 中国からのアクセス: <a href="https://image.apiyi.com" target="_blank" rel="noopener noreferrer">image.apiyi.com</a>
  * グローバルアクセス: <a href="https://imagen.apiyi.com" target="_blank" rel="noopener noreferrer">imagen.apiyi.com</a>

  詳細ドキュメント:

  * [Nano Banana Pro ドキュメント](/en/api-capabilities/nano-banana-image-edit) - プラットフォーム最高、知識理解 + 精密な編集
  * [Nano Banana 2 ドキュメント](/en/api-capabilities/nano-banana-2-image) - 使用量ベースの課金、新しい超ワイド比率
  * [gpt-image-2-all ドキュメント](/ja/api-capabilities/gpt-image-2-all/overview) - GPTリバースChatGPT-webライン、\$0.03/画像、約30～60秒の高速出力
  * [gpt-image-2-vip ドキュメント](/ja/api-capabilities/gpt-image-2-vip/overview) - GPTリバースAdobeライン（Firefly）、\$0.03/画像、4Kを含む30サイズ、約90～150秒
  * [GPT-Image-2.5 / 2 ドキュメント](/ja/api-capabilities/gpt-image-2/overview) - OpenAI公式トリオ（2.5-flare / 2.5-sunburst / 2）、ネイティブ4K、精密なサイズ/品質制御
  * [⚖️ 公式版とリバース版の比較](/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all) - gpt-image-2とリバース兄弟モデル-all / -vipの選択ガイド
  * [Nano Banana ドキュメント](/en/api-capabilities/nano-banana-image) - 高速、優れた一貫性
  * [Nano Banana Lite ドキュメント](/ja/api-capabilities/nano-banana-lite-image/overview) - 最速かつ最安、約4秒で出力、呼び出しごとに\$0.025/画像
  * [Seedream ドキュメント](/en/api-capabilities/seedream-image) - 価格面の優位性、高速。5.0 Pro階層（\$0.12/呼び出し、画像1枚あたり約2分）を含みます
  * [GPT Image 1.5 ドキュメント](/en/news/gpt-image-1-5-launch) - 4倍の高速化、精密な編集
  * [GPT Image 1 ドキュメント](/en/api-capabilities/gpt-image-1) - 公式画像生成
  * [Flux ドキュメント](/en/api-capabilities/flux-image-generation) - 画像編集
</Tip>

## 🎬 動画生成モデル

| モデル名                                                                      | ステータス                    | 機能                                                                                                                                                                           | 動画尺                                                            | 価格                                                                                      |
| ------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [**Seedance 2.5 / 2.0 シリーズ**](/ja/api-capabilities/seedance2/overview) 🔥 | 提供中、人気                   | ByteDance、Volcengine China公式リソース。**2.5** に加え、2.0 standard / `fast` / `mini` を並行提供 — テキストから動画、開始/終了フレーム、マルチモーダル参照（画像 + 動画 + 音声）、動画編集・延長、**音声はデフォルトで同期**、プライベートアセットライブラリを無料で付属 | 2.5は4～30秒、2.0ファミリーは4～15秒（480p/720p/1080p、1080pは2.5とstandardのみ） | token課金（面積 × 動画尺）。720p/5秒の実測値：\$0.45（mini）/ \$0.73（fast）/ \$0.91（standard）/ \$1.35（2.5） |
| [**Wan2.7 Video**](/ja/api-capabilities/wan/overview) 🆕                  | 新規、推奨                    | Alibaba Wanxiang、テキスト/画像/参照/動画編集による生成、i2vは音声駆動をサポート                                                                                                                          | 秒単位（最大12秒）                                                     | \$0.084～0.14/秒（公式の98%）                                                                  |
| [**Wan2.6 Video**](/ja/api-capabilities/wan/historical-versions)          | 利用可能                     | Wan2.7とエンドポイントを共有、`r2v-flash` 低レイテンシティアを含む                                                                                                                                   | 秒単位                                                            | コンソールを参照                                                                                |
| [**VEO 3.1 Official**](/ja/api-capabilities/veo-3-1-official/overview) 🔥 | 提供中、人気（Reverseの代替）       | Google AI Studio公式エンドポイントへのパススルー、音声・動画同期、実在人物、デフォルトグループから呼び出し可能                                                                                                              | 4/6/8秒                                                         | 呼び出しごとに\$0.3 / \$1.2（720p/1080p/4kは同価格）                                                 |
| **Veo 3.1 Reverse**                                                       | ⏸️ 一時停止（Googleリスクコントロール） | Google Flow Reverse。一時停止中は **VEO 3.1 Official** を使用してください                                                                                                                    | 固定8秒                                                           | 利用不可                                                                                    |
| **Sora 2 Official**                                                       | ⏸️ 提供終了                  | OpenAI公式リレー、プロフェッショナルな制作、高い安定性、sora-2-proをサポート、「キャラクター」参照は非対応                                                                                                                | 4/8/12秒                                                        | 利用不可                                                                                    |
| [**HappyHorse 1.1**](/ja/api-capabilities/happyhorse/overview) 🆕         | 新規                       | Alibaba、複数参照での被写体一貫性（最大9枚の画像）、Wanとグループを共有                                                                                                                                    | 秒単位（最大12秒）                                                     | \$0.126～0.224/秒（公式の98%）                                                                 |
| ~~**Sora 2 Reverse**~~                                                    | ❌ 提供終了                   | 以前はEC / アニメシナリオ向け。代わりにSora 2 Officialを使用してください                                                                                                                               | —                                                              | —                                                                                       |

<Info>
  **動画モデルの主な機能**:

  * **Seedance 2.5 / 2.0 シリーズ（ByteDance）**: `doubao-seedance-2-5-260628`（2.5 — 最大30秒、参照画像30枚、mov出力）/ `doubao-seedance-2-0-260128`（standard）/ `-fast-260128`（fast）/ `-mini-260615`（mini）— 価格と速度が異なります（mini \< fast \< standard \< 2.5、2.5はstandardの約1.5倍）。miniとfastは最大720pです。**4つのモデルはすべて`SeeDance2`グループ**（0.18x）で稼働するため、1つのtokenですべて利用できます。tokenの課金モードは「使用量優先」または「使用量ベース」である必要があります。`SD2Mini`（0.10x）および`SD2Fast`（0.15x）は期間限定の割引グループです — **miniは44.4%オフ、fastは16.7%オフ、2026-10-07 23:59（UTC+8）まで**。その後、レートは0.18xに戻り、グループは引き続き利用可能です
  * **VEO 3.1 Official**: Google AI Studio公式エンドポイントへのパススルーで、業界をリードする音声・動画同期を提供します。実在人物をサポートし、デフォルトグループ + 呼び出しごと/使用量優先tokenで呼び出し可能です。Veo 3.1 Reverseの一時停止中に推奨される代替手段です
  * **Veo 3.1 Reverse**: Googleリスクコントロールにより**一時停止中**です。復旧時期は未定ですので、当面はVEO 3.1 Officialを使用してください
  * **Sora 2 Official**: 提供終了しており、現在は利用できません
  * **Wan2.7 / Wan2.6（Alibaba Wanxiang）**: デフォルト価格は公式の約98%です。両シリーズはHappyHorseと`Wan&HappyHorse`グループを共有しており、1つのtokenですべて利用できます。Wan2.6とWan2.7は同じエンドポイントおよびスキーマを共有しているため、`model`名を変更するだけで移行できます
  * **HappyHorse 1.1（Alibaba）**: 複数参照での被写体一貫性に優れており、Wanと`Wan&HappyHorse`グループおよびエンドポイントを共有します
  * AI動画ツール（オンラインテスト）：<a href="https://icover.ai" target="_blank" rel="noopener noreferrer">icover.ai</a>
</Info>

<Note>
  **今後提供予定の動画モデル**:

  * Kling 3.0

  今後の情報にもご期待ください！最新の提供開始通知を受け取るには、フォローしてください。
</Note>

## 💰 料金情報

* **従量課金**: 実際の使用量に基づいて課金され、最低課金額はありません
* **残高の有効期限**: チャージ日から365日間有効で、次回のチャージ時に自動的にリセットされます（[チャージ特典](/ja/faq/recharge-promotions)をご覧ください）
* すべてのモデルの最新料金については、[APIYI コンソール料金ページ](https://www.apiyi.com/account/pricing)をご覧ください
