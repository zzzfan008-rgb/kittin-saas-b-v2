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

| モデル名 | ステータス | 特徴 | 解像度/仕様 | 価格 |
| - | - | - | - | - |
| [**Nano Banana Pro**](/en/api-capabilities/nano-banana-image-edit) 🔥 | ベストセラー | 知識理解、優れた中国語テキスト、高精度な編集 | 1K/2K/4K、元のアスペクト比での編集に対応 | \$0.09/枚 |
| [**Nano Banana 2**](/en/api-capabilities/nano-banana-2-image) 🔥 | 人気・高速 | Proと同等、従量課金に対応 | 0.5K〜4K、新対応の1:8および8:1アスペクト比（長尺画像） | \$0.055/枚（従量課金 \$0.025〜0.07） |
| [**Nano Banana Lite**](/ja/api-capabilities/nano-banana-lite-image/overview) 🆕 | 新登場・最速・最安 | Google最速・最安、約4秒で出力、NB2より約2.7倍高速、1K特化 | 1K、14種類のアスペクト比 | \$0.025/枚（従量課金 約\$0.018） |
| [**gpt-image-2.5-flare**](/ja/api-capabilities/gpt-image-2/overview) 🆕 | 2026年9月新登場・公式 | OpenAI GPT-Image 2.5 速度重視：gpt-image-2より高品質でありながらレイテンシを最大50%削減、高精度なサイズ/画質制御（`xhigh` / `max` を追加）、自動高忠実度リファレンス、マスクインペインティング | 1K/2K/**4K**（有効な任意のサイズ） | token課金、gpt-image-2と同価格、チャージキャンペーン中は約15%割引 |
| [**gpt-image-2.5-sunburst**](/ja/api-capabilities/gpt-image-2/overview) 🆕 | 2026年9月新登場・公式 | OpenAI GPT-Image 2.5 画質および編集精度重視：マルチターンの編集と被写体維持を強化、flareと同等のパラメータ | 1K/2K/**4K**（有効な任意のサイズ） | token課金、gpt-image-2と同価格 |
| [**gpt-image-2**](/ja/api-capabilities/gpt-image-2/overview) | 公式・前世代 | OpenAI公式、高精度なサイズ/画質制御（最大 `high`）、自動高忠実度リファレンス、マスクインペインティング | 1K/2K/**4K**（有効な任意のサイズ） | token課金、標準レート、チャージキャンペーン中は約15%割引 |
| [**gpt-image-2.5-all / 2-all**](/ja/api-capabilities/gpt-image-2-all/overview) 🔥 | 人気・リバース | ChatGPT-web回線のGPTリバース、現在はImages 2.5に対応。両名称で価格および動作は共通、新規プロジェクトには `gpt-image-2.5-all` の使用を推奨。高いテキスト再現性、ネイティブ中国語対応、高速出力（約30〜60秒）、prompt内でサイズ指定 | 1K〜1.5K（prompt制御） | \$0.025/枚（呼び出しごと） |
| [**gpt-image-2.5-flare-vip / sunburst-vip**](/ja/api-capabilities/gpt-image-2-vip/overview) 🆕 | 2026年9月新登場・リバース | GPT-Image 2.5のAdobe回線リバース：-vipと同じ呼び出し形式、`size` で **4K** を含む30種のプリセットを固定、全6段階の `quality` ティア（`xhigh` / `max` を含む）および透過背景に対応。エイリアス `gpt-image-2.5-vip` | 1K/2K/**4K**（30サイズ一律価格） | \$0.03/枚（呼び出しごと） |
| [**gpt-image-2-vip**](/ja/api-capabilities/gpt-image-2-vip/overview) | リバース | Adobe回線（Firefly）のGPTリバース、-allと同一の呼び出し形式、`size` フィールドでサイズを固定、**4K** を含む30種の明確なサイズ、約90〜150秒 | 1K/2K/**4K**（30サイズ一律価格） | \$0.03/枚（呼び出しごと、4K追加料金なし） |
| [**Nano Banana**](/en/api-capabilities/nano-banana-image) | 利用可能 | 高速、高い一貫性、EC向け編集 | 複数サイズ | \$0.02/枚 |
| [**Seedream 5.0 Pro**](/ja/api-capabilities/seedream-image/overview) 🆕 | 新登場・Proティア | シリーズ最高峰の画質と複雑な指示への追従性、インタラクティブ編集（座標/選択ボックス/矢印）、最大10枚のリファレンス画像、png出力。1枚あたり約2分、日常的な業務には引き続き5.0 Liteがおすすめ | 1K/2K（総ピクセル数 ≤ 419万、3K/4K非対応、バッチシーケンスまたはストリーミング非対応） | \$0.12/回 |
| [**Seedream 5.0 Flash**](/ja/api-capabilities/seedream-image/overview) 🆕 | 2026年9月新登場・シリーズ最安 | BytePlus高速ティア、1枚あたり約15〜20秒、正確な中国語タイポグラフィ、リファレンス画像無料。バッチシーケンスまたはストリーミング非対応、デフォルトで透かし入り（オフにするには `watermark: false` を渡してください） | 複数サイズ | \$0.018/枚 |
| [**Seedream 5.0 Lite**](/en/api-capabilities/seedream-image) | 利用可能 | 価格優位性、高速、URL出力 | 2K/3K | \$0.035/枚 |
| [**Seedream 4.5**](/en/api-capabilities/seedream-image) | 利用可能 | 価格優位性、高速、URL出力 | 2K/4K | \$0.04/枚 |
| [**Seedream 4.0**](/en/api-capabilities/seedream-image) | 利用可能 | 価格優位性、高速、URL出力 | 2K | \$0.035/枚 |
| [**GPT Image 1.5**](/en/news/gpt-image-1-5-launch) 🔥 | 公式 | 高精度な編集、4倍の速度向上、テキスト描画の強化 | 低/中/高画質 | 従量課金 |
| [**GPT Image 1**](/en/api-capabilities/gpt-image-1) | 公式 | 高精度な編集 | 複数サイズ | 従量課金 |
| **GPT Image 1-Mini** | 公式 | sora\_imageの代替 | 複数サイズ | 従量課金 |
| [**Grok Imagine 2**](/ja/api-capabilities/grok-imagine-image/overview) 🆕 | 新登場・🔒申請制 | xAIの第2世代画像モデル、標準 `grok-imagine-image` / 高画質 `grok-imagine-image-quality`。5種のアスペクト比、1回の呼び出しで最大10枚、本格的なリファレンス編集に対応。専用の `Grok_imagine` グループが必要 | 1K/2K（同価格） | 1枚あたり \$0.02 / \$0.045 |
| [**flux-2-max**](/ja/api-capabilities/flux/overview) 🆕 | 最新世代（FLUX.2） | FLUX.2フラッグシップ、高品質出力 | 複数サイズ | \$0.07/回 |
| [**flux-2-pro**](/ja/api-capabilities/flux/overview) 🆕 | 最新世代（FLUX.2） | FLUX.2 Pro、画質と価格のバランス | 複数サイズ | \$0.03/回 |
| [**flux-2-flex**](/ja/api-capabilities/flux/overview) 🆕 | 最新世代（FLUX.2） | FLUX.2 Flex、パラメータ調整可能 | 複数サイズ | \$0.06/回 |
| [**flux-2-klein-4b / 9b**](/ja/api-capabilities/flux/overview) | 最新世代（FLUX.2） | FLUX.2軽量版、1秒未満の高速出力、最大4枚のリファレンス画像 | 複数サイズ | \$0.01/回 |
| [**Flux Kontext Pro**](/en/api-capabilities/flux-image-generation) | 利用可能 | 画像編集 | 複数サイズ | ドキュメント参照 |
| [**Flux Kontext Max**](/en/api-capabilities/flux-image-generation) | 利用可能 | 高品質な画像編集 | 複数サイズ | ドキュメント参照 |

<Note>モデル価格は公式サイトに連動しており、変更される場合があります。上記の表は参考情報であり、上部ナビゲーションの**モデル価格**タブが正式な情報源となります：[モデル価格](/en/models/index)。</Note>

<Info>
  **Nano Banana Pro 特典**：1K〜4Kのすべての解像度が一律 \$0.09/枚。公式の4K価格は \$0.24/枚のため、公式価格の約38%です！1.4倍のレート（\$0.126/枚）で NanoBananaEnterprise エンタープライズ高可用性（HA）チャネルも利用可能です。[詳細を見る](/en/news/nano-banana-pro-launch)
</Info>

<Tip>
  **画像生成テストツール**

  * 中国国内アクセス：<a href="https://image.apiyi.com" target="_blank" rel="noopener noreferrer">image.apiyi.com</a>
  * グローバルアクセス：<a href="https://imagen.apiyi.com" target="_blank" rel="noopener noreferrer">imagen.apiyi.com</a>

  詳細ドキュメント：

  * [Nano Banana Pro ドキュメント](/en/api-capabilities/nano-banana-image-edit) - プラットフォーム最高峰、知識理解＋高精度な編集
  * [Nano Banana 2 ドキュメント](/en/api-capabilities/nano-banana-2-image) - 従量課金、新しい超ワイドアスペクト比
  * [gpt-image-2.5-all / 2-all ドキュメント](/ja/api-capabilities/gpt-image-2-all/overview) - GPTリバース ChatGPT-web回線（現在はImages 2.5に対応）、\$0.025/枚、約30〜60秒の高速出力
  * [gpt-image-2-vip ドキュメント](/ja/api-capabilities/gpt-image-2-vip/overview) - GPTリバース Adobe回線（Firefly）、\$0.03/枚、4Kを含む30サイズ、約90〜150秒
  * [GPT-Image-2.5 / 2 ドキュメント](/ja/api-capabilities/gpt-image-2/overview) - OpenAI公式トリオ（2.5-flare / 2.5-sunburst / 2）、ネイティブ4K、高精度なサイズ/画質制御
  * [⚖️ 公式 vs リバース比較](/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all) - gpt-image-2 vs リバース版 -all / -vip 選択ガイド
  * [Nano Banana ドキュメント](/en/api-capabilities/nano-banana-image) - 高速、優れた一貫性
  * [Nano Banana Lite ドキュメント](/ja/api-capabilities/nano-banana-lite-image/overview) - 最速・最安、約4秒で出力、呼び出しごと \$0.025/枚
  * [Seedream ドキュメント](/en/api-capabilities/seedream-image) - 価格優位性、高速。5.0 Flash（\$0.018/枚、約15〜20秒）および5.0 Proティア（\$0.12/回、1枚あたり約2分）を含む
  * [Grok Imagine 2 ドキュメント](/ja/api-capabilities/grok-imagine-image/overview) - xAIの第2世代画像モデル、1枚あたり \$0.02 / \$0.045、申請制の専用グループ
  * [GPT Image 1.5 ドキュメント](/en/news/gpt-image-1-5-launch) - 4倍の速度向上、高精度な編集
  * [GPT Image 1 ドキュメント](/en/api-capabilities/gpt-image-1) - 公式画像生成
  * [FLUX.2 ドキュメント](/ja/api-capabilities/flux/overview) - klein / pro / flex / max の全ラインナップ、テキストからの画像生成および複数画像の融合
  * [Flux Kontext ドキュメント](/en/api-capabilities/flux-image-generation) - 画像編集
</Tip>

## 🎬 動画生成モデル

| モデル名 | ステータス | 機能・特徴 | 生成時間 | 価格 |
| - | - | - | - | - |
| [**Seedance 2.5 / 2.0シリーズ**](/ja/api-capabilities/seedance2/overview) 🔥 | 提供中・人気 | ByteDance、公式の中国Volcengineリソース。**2.5**に加え、2.0 standard / `fast` / `mini` を並行提供 — テキストからの動画生成、先頭/末尾フレーム、マルチモーダルリファレンス（画像＋動画＋音声）、動画編集および延長、**デフォルトで音声同期**、プライベートアセットライブラリを無料で同梱 | 2.5は4〜30秒、2.0ファミリーは4〜15秒（480p/720p/1080p。1080pは2.5およびstandardのみ） | token課金（面積 × 再生時間）。実測720p/5秒：\$0.45（mini）/ \$0.73（fast）/ \$0.91（standard）/ \$1.35（2.5） |
| [**Wan2.7 Video**](/ja/api-capabilities/wan/overview) 🆕 | 新規・おすすめ | Alibaba Wanxiang、テキスト/画像/リファレンス/動画編集の生成、i2vは音声駆動に対応 | 秒単位（最大12秒） | \$0.084-0.14/秒（公式の98%） |
| [**Wan2.6 Video**](/ja/api-capabilities/wan/historical-versions) | 利用可能 | Wan2.7とエンドポイントを共有、`r2v-flash` 低遅延ティアを含む | 秒単位 | コンソールを参照 |
| [**VEO 3.1 Official**](/ja/api-capabilities/veo-3-1-official/overview) 🔥 | 提供中・人気（リバースの代替） | Google AI Studio公式エンドポイントへのパススルー、映像と音声の同期、実在人物に対応、デフォルトグループから呼び出し可能 | 4/6/8秒 | コール単位 \$0.3 / \$1.2（720p/1080p/4K 同一価格） |
| **Veo 3.1 Reverse** | ⏸️ 一時停止中（Googleのリスク制御） | Google Flowリバース。停止中は**VEO 3.1 Official**をご利用ください | 固定8秒 | 利用不可 |
| **Sora 2 Official** | ⏸️ 提供終了 | OpenAI公式リレー、プロフェッショナルな制作、高い安定性、sora-2-pro対応、「キャラクター」リファレンス非対応 | 4/8/12秒 | 利用不可 |
| [**HappyHorse 1.1**](/ja/api-capabilities/happyhorse/overview) 🆕 | 新規 | Alibaba、複数リファレンスによる被写体の一貫性（最大9枚の画像）、Wanとグループを共有 | 秒単位（最大12秒） | \$0.126-0.224/秒（公式の98%） |
| [**MiniMax H3**](/ja/api-capabilities/minimax-h3/overview) 🆕 | 2026年9月新規、オープンウェイトの自社ホスト | オープンウェイトを独自デプロイしたHailuo 3.0。テキスト、先頭/末尾フレーム、画像・動画・音声の混合リファレンスに対応した単一エンドポイント、ステレオサウンド、768P。リファレンスメディアは無料、デフォルトグループ | 4〜15秒 | \$0.03/秒 |
| [**Oxygen**](/ja/api-capabilities/oxygen/overview) 🆕 | 2026年10月新規、大量生成向け | AZ8自社開発のオールラウンド動画モデル、OpenAI Videos互換：テキスト、先頭フレーム、先頭・末尾フレーム、および画像＋動画＋音声のリファレンス、内蔵オーディオ、320p〜768pが同一価格。デフォルトグループ | 4〜15秒 | \$0.02/秒 |
| ~~**Sora 2 Reverse**~~ | ❌ 提供終了 | 以前のEC／アニメ向けシナリオ。代わりにSora 2 Officialをご利用ください | — | — |

<Note>モデルの価格は公式サイトに準拠しており、公式サイトの改定に伴い変更される場合があります。上記の表は参考用であり、上部ナビゲーションの**モデル価格**タブが正式な情報となります: [モデル価格](/en/models/index)。</Note>

<Info>
  **動画モデルの主な特徴**:

  * **Seedance 2.5 / 2.0シリーズ（ByteDance）**: `doubao-seedance-2-5-260628`（2.5 — 最大30秒、リファレンス画像30枚、mov出力）/ `doubao-seedance-2-0-260128`（standard）/ `-fast-260128`（fast）/ `-mini-260615`（mini）— 価格と速度が異なります（mini \< fast \< standard \< 2.5。2.5はstandardの約1.5倍）。miniとfastの解像度は最大720pです。**4つのモデルはすべて`SeeDance2`グループ**（0.18倍）で動作するため、1つのtokenで全てカバーできます。tokenの課金モードは「usage-first」または「usage-based」である必要があります。
  * **VEO 3.1 Official**: Google AI Studio公式エンドポイントへのパススルー、業界をリードする映像と音声の同期、実在人物に対応、デフォルトグループ ＋ 回数課金/usage-first tokenで呼び出し可能。Veo 3.1 Reverseの一時停止中に推奨される代替モデルです
  * **Veo 3.1 Reverse**: Googleのリスク制御により**一時停止中**、復旧時期は未定。その間はVEO 3.1 Officialをご利用ください
  * **Sora 2 Official**: 提供終了、現在は利用不可
  * **Wan2.7 / Wan2.6（Alibaba Wanxiang）**: デフォルト価格は公式の約98%、両シリーズともHappyHorseと`Wan&HappyHorse`グループを共有し、1つのtokenで共通利用可能。Wan2.6とWan2.7は同じエンドポイントとスキーマを共有しているため、移行時は`model`名を変更するだけです
  * **HappyHorse 1.1（Alibaba）**: 複数リファレンスによる被写体の一貫性に優れ、Wanと`Wan&HappyHorse`グループおよびエンドポイントを共有
  * **MiniMax H3（オープンウェイトの自社ホスト）**: `POST /hailuo/v2/video_generation`上の`MiniMax-H3`、最大9枚のリファレンス画像 ＋ 3本の動画 ＋ 3つの音声クリップに対応、リクエストされた再生時間に基づいて課金。2Kは現在未対応で、`Idempotency-Key`ヘッダーは無効なため、アプリケーション側で冪等性を処理してください
  * **Oxygen（AZ8）**: `POST /v1/videos`上の`oxygen-1.0`。必ず`size`を渡してください（指定しない場合は縦向きがデフォルトになります）。また、先頭・末尾フレーム、リファレンスメディア、320pなどの高度なオプションは`input_reference`のJSONエンベロープ内に配置してください。失敗したタスクは自動的に全額返金されます
  * AI動画ツール（オンラインテスト）: <a href="https://icover.ai" target="_blank" rel="noopener noreferrer">icover.ai</a>
</Info>

<Note>
  **近日対応予定の動画モデル**:

  * Kling 3.0

  ご期待ください！最新のローンチ情報をお見逃しなく。
</Note>

## 💰 料金情報

* **従量課金**: 実際の使用量に基づいて課金され、最低課金額はありません
* **残高の有効期限**: チャージ日から365日間有効で、次回のチャージ時に自動的にリセットされます（[チャージ特典](/ja/faq/recharge-promotions)をご覧ください）
* すべてのモデルの最新料金については、[APIYI コンソール料金ページ](https://www.apiyi.com/account/pricing)をご覧ください


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.