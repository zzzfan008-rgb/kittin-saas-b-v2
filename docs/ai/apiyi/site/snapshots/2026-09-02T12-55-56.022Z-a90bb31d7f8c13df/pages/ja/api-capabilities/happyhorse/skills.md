> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse 動画エージェントスキル

> HappyHorse-1.1（品質重視の Alibaba 動画モデル）をエージェント内で使用できます。Wan2.7 と同じ wan スキルを共有しているため、--model happyhorse を設定するだけです。

<Note>
  **HappyHorse は独自のスキルを必要としません**。Wan2.7 と **wan video skill** を共有しており、両シリーズは同じエンドポイント、同じリクエスト構造、同じ `Wan&HappyHorse` token グループを使用します。異なるのはモデル ID だけです。完全なセットアップ、`SKILL.md`、およびスクリプトについては、[**Wan2.7 / HappyHorse 動画エージェントスキル**](/ja/api-capabilities/wan/skills) をご覧ください。
</Note>

## このモデルが得意なこと

<CardGroup cols={3}>
  <Card title="画質重視" icon="sparkles">
    Wan2.7と同じエンドポイントと使い方で、より洗練されたビジュアルの仕上がりです — 画質が最も重要なシーン向けです。
  </Card>

  <Card title="最大9枚の参照画像" icon="images">
    参照画像から動画への変換は最大9枚の参照画像を受け付けます（Wan2.7では、参照画像の合計は5枚までです）。
  </Card>

  <Card title="1つの共有 token" icon="key-round">
    1つの`Wan&HappyHorse`グループ tokenで両シリーズに対応します — 切り替えコストはかかりません。
  </Card>
</CardGroup>

## スキル内での使い方

[wan video skill](/ja/api-capabilities/wan/skills) をインストールしたら、`--model happyhorse` を設定するだけです:

```bash theme={null}
python3 wan/scripts/wan_video.py "Drone shot over an autumn valley, golden forest, cinematic" --model happyhorse -o valley.mp4
```

スクリプトは、渡したアセット（`happyhorse-1.1-t2v` / `-i2v` / `-r2v` / `happyhorse-1.0-video-edit`）から適切な model ID を選びます。名前を覚える必要はありません。

<Warning>
  **制約事項**: HappyHorse は参照動画や audio driving をサポートしていません —

  * `--ref-video` は Wan2.7 専用であり、スクリプトは happyhorse に対してこれを事前に拒否します;
  * 画像から動画への変換は最初のフレーム画像のみを使用し、Wan2.7 形式の `driving_audio` はありません;
  * 課金はおおむね Wan2.7 の 1.5 倍です（720P \$0.126/s、1080P \$0.224/s — 5秒の 720P クリップで約 \$0.63）ので、大量処理のワークロードではデフォルトの `wan` を使うのがよいです。

  スキルスクリプトがこれらの違いをすべて自動で制御します。`--model happyhorse` の通常利用では引っかかることはありません。
</Warning>

## 関連ドキュメント

* [Wan2.7 / HappyHorse 動画エージェントスキル（完全なスクリプトを含むメインページ）](/ja/api-capabilities/wan/skills)
* [HappyHorse 動画生成の概要](/ja/api-capabilities/happyhorse/overview)
* [Seedance 2.0 動画エージェントスキル](/ja/api-capabilities/seedance2/skills)
