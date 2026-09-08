> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wanの過去バージョン (Wan2.6)

> Wan2.6シリーズ（wan2.6-r2v-flash を含む）のメモと移行ガイドです。Wan2.7 と同じエンドポイントとスキーマを共有しているため、呼び出すにはモデル名を変更するだけです。

このページは、**現在 Wan2.6 をご利用中のユーザー**向けで、各バージョンの違いと Wan2.7 への移行手順を説明しています。新規ユーザーは [Wan の概要](/ja/api-capabilities/wan/overview) から開始してください。

## バージョン概要

| バージョン      | ステータス     | エンドポイント / プロトコル                  | 推奨用途                                     |
| ---------- | --------- | -------------------------------- | ---------------------------------------- |
| **Wan2.7** | ✅ 現在推奨    | `/wan/api/v1/...video-synthesis` | 新規統合の第一候補、最も充実した機能セット（オーディオ駆動、複数被写体参照）   |
| **Wan2.6** | 🟡 メンテナンス | Wan2.7と同じ（モデル名のみ変更）              | 既存のWan2.6コード、または`r2v-flash`低レイテンシ層が必要な場合 |

<Info>
  Wan2.6とWan2.7は**同じDashScopeパススルーエンドポイントと同じリクエスト構造を共有しています**。移行するには、**`model`フィールドを`wan2.6-*`から`wan2.7-*`へ変更するだけで**、本文の他の部分はそのままにしてください。正確な提供開始日と最新の提供状況は、[APIYIコンソール](https://api.apiyi.com/token)のモデル一覧が正式です。
</Info>

## Wan2.6 モデル

| Model ID           | Capability     | Notes                                                  |
| ------------------ | -------------- | ------------------------------------------------------ |
| `wan2.6-t2v`       | テキストから動画       | `wan2.7-t2v` に対応します                                    |
| `wan2.6-i2v`       | 画像から動画         | `wan2.7-i2v` に対応します                                    |
| `wan2.6-r2v`       | 参照から動画         | `wan2.7-r2v` に対応します                                    |
| `wan2.6-r2v-flash` | 参照から動画（低遅延ティア） | Wan2.6 専用の高速ティアで、生成がより速く、単価も低く、反復作業、デバッグ、バッチプレビューに最適です |

<Tip>
  `wan2.6-r2v-flash` は、Wan2.6 シリーズにおける軽量な高速ティアで、2.7 に相当するものはありません。開発中に使用して prompt と参照画像の結果をすばやく検証し、確定後は最終レンダリングのために `wan2.7-r2v` に切り替えてください。
</Tip>

## 移行のヒント

<Steps>
  <Step title="差分を確認する">
    Wan2.7 は、マルチサブジェクト参照、ボイス参照（`reference_voice`）、音声駆動に強化されています。基本的な t2v / i2v / r2v だけを使うなら、移行コストはほぼゼロです。
  </Step>

  <Step title="並べて比較する">
    同じセットの prompt とメディアアセットを使って、`wan2.6-*` と `wan2.7-*` のタスクを個別に送信し、品質と一貫性を比較してから、切り替えるかどうかを判断します。
  </Step>

  <Step title="段階的に切り替える">
    変更するのは `model` フィールドだけです。endpoint、headers、`input` / `parameters` の構造、そしてポーリングとダウンロードのフローは同一で、破壊的変更はありません。
  </Step>
</Steps>

## レガシー呼び出し例

```python theme={null}
import requests

# Calling Wan2.6: the only difference from Wan2.7 is the model name
body = {
    "model": "wan2.6-r2v-flash",   # change to wan2.7-r2v to upgrade to 2.7
    "input": {
        "prompt": "The reference image: a girl walking slowly through a garden, cinematic lighting",
        "media": [{"type": "reference_image", "url": "https://your-cdn.com/girl.png"}],
    },
    "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
}
resp = requests.post(
    "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis",
    json=body,
    headers={"Authorization": "Bearer sk-your-api-key", "Content-Type": "application/json",
             "X-DashScope-Async": "enable"},
    timeout=30,
)
print(resp.json()["output"]["task_id"])
```

## 課金の違い

<Note>
  Wan2.6 と Wan2.7 の料金とグループ設定は近日公開予定で、このページに追加されます。一般的には、`r2v-flash` のような高速ティアは単価が低く、解像度が高い / 継続時間が長いほど料金は高くなります。最新の料金は [APIYI コンソール](https://api.apiyi.com/token) の課金ページが正となります。
</Note>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Wan の概要" icon="video" href="/ja/api-capabilities/wan/overview">
    非同期フロー、パラメータの詳細、ベストプラクティス
  </Card>

  <Card title="参照から動画へ" icon="users" href="/ja/api-capabilities/wan/reference-to-video">
    `wan2.7-r2v` ライブデバッグ
  </Card>
</CardGroup>
