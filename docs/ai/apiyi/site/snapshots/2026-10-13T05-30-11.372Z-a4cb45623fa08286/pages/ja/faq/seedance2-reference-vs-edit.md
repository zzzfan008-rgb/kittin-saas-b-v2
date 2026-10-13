> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.5：参照から動画への変換と動画編集

> Seedance 2.5 がアセットと prompt に基づいて参照から動画への変換、動画編集、動画延長をどのように判別するか、タスクが編集として誤認される理由、および予測可能な動作をするリクエストの書き方。

## 短い回答

Seedance 2.5 には、専用の「参照から動画」スイッチは**ありません**。`content` に参照動画が含まれるとすぐに、モデルは**prompt の意図**を読み取り、タスクが参照から動画、動画編集、または動画拡張のどれであるかを判断します。

* prompt が**元動画を変更する**場合（追加、削除、修正、置換、何かを変更せずに維持）→ **動画編集**
* prompt が**元動画を前方または後方へ継続する**場合（拡張、継続）→ **動画拡張**
* prompt が、アセットからキャラクター、動き、またはスタイルを**借りて新しいクリップを撮影するだけ**の場合 → **参照から動画**

タスクが編集として分類されると、`ratio` は `adaptive` である必要があり、`duration` は `-1` である必要があります。特定のアスペクト比または長さを渡すと 400 が返され、通常は `TaskTypeConstraint` に言及されます。

<Info>
  このページは **Seedance 2.5**（`doubao-seedance-2-5-260628`）にのみ適用されます。Seedance 2.0 ファミリーには動画編集または動画拡張タスクがないため、そこでこの問題は発生しません。
</Info>

## 中核的な違い：アセットは出力に残るか？

| | 参照から動画 | 動画編集 |
| - | - | - |
| アセットの役割 | **意味的な参照**のみ：外見、動き、カメラワーク、スタイル、音声 | ソース動画**が出力のベース**となり、その上にモデルが要素を追加、削除、または変更します |
| 出力アスペクト比 | 選択可能（7つの`ratio`値のいずれか） | ソース動画に**固定**されます。`ratio`は`adaptive`である必要があります |
| 出力時間 | 選択可能（`duration`は4〜30） | ソース動画に**固定**されます。`duration`は`-1`である必要があります |
| ソース動画の要件 | なし | 長さは**4〜30秒**である必要があります。20秒未満が最適です |
| 代表的なprompt | 「ビーチで踊るダンサー、画像1のキャラクター、動画1を参照した振り付け」 | 「動画1の人物を画像1に置き換える」、「動画1から背景音楽を削除する」 |

簡単な判定方法：**出力内にソース動画そのものがまだ見えますか？** 見える場合は、編集（または拡張）です。その「雰囲気」だけが引き継がれる場合は、参照から動画です。

動画拡張は編集に似ています。アスペクト比はソース動画に固定されますが、時間は引き続き設定できます。

## モデルの判定方法

判定は2つのステップで行われます。まずアセット`role`、次にpromptです。

| タスクの種類 | アセットの条件 | promptのトリガーワード（プロバイダー公式ドキュメント） | `ratio` | `duration` |
| - | - | - | - | - |
| リファレンス動画生成 | `reference_image` / `reference_video` / `reference_audio`が少なくとも1つ | 編集または延長の意図がない | 任意 | 任意 |
| 動画編集 | `reference_video`が少なくとも1つ | edit video、add、remove / delete、modify / replace / change to | **`adaptive`必須** | **`-1`必須** |
| 動画延長 | `reference_video`が少なくとも1つ | extend forwards / backwards、continue | **`adaptive`必須** | 任意 |
| 開始フレーム / 開始・終了フレーム | `role`が`first_frame` / `last_frame` | promptに依存しない | **`adaptive`必須** | 任意 |

<Warning>
  トリガーワードのリストは**すべてを網羅しているわけではありません**。モデルは完全一致の単語ではなく、意味を判断します。「keep everything in the video unchanged」、「upscale video 1 to HD」、「keep the outfits the same」などのフレーズはリストにありませんが、いずれも元の映像を処理することを記述しているため、同様に動画編集として分類される可能性があります。
</Warning>

リファレンス画像を含み、リファレンス動画を含まないリクエストは、編集や延長として分類されることは決してありません。この点に注意する必要があるのは、`reference_video`が存在する場合のみです。

### キーワードの落とし穴リスト

以下の単語を使用すると、モデルによってタスクが動画編集として分類される可能性が高くなります。実際にリファレンス動画生成タスクを実行したい場合は、promptを書き直してください。

| リスクのあるキーワード | 編集をトリガーする理由 | より安全な言い回し |
| - | - | - |
| replace、swap、change to | 「元の動画から何かを入れ替える」ことを直接的に表現しているため | 新しいシーンで誰が何をしているかを説明した上で、リファレンス動画は動きやスタイルのみを提供することを明記する |
| add、append | 「元の動画の上に何かを追加する」ことを表現しているため | 新しいカットのシーン説明の中に新しい要素を記述する |
| remove、delete | 「元の動画から何かを取り除く」ことを表現しているため | 新しいシーンに含まれないものではなく、含まれるものを説明する |
| modify、change to、adjust to | 「元の動画に変更を加える」ことを表現しているため | 新しいシーンがどのように見えるべきかを直接説明する |
| keep ... unchanged、retain | 「edit」という単語がなくても、元の映像を処理することを示唆しているため | 「元の動画の…を参照し、新しい…を撮影する」のように書き直す |
| upscale、restore、enhance、denoise | 本質的に元の動画を処理するものであり、通常は編集タスクとして送信すべきであるため | 実際に元のクリップを処理する必要がある場合は`ratio: adaptive`および`duration: -1`を使用し、新しいクリップが必要な場合は新しいカットを明示的に説明する |
| extend、continue、continue shooting | 動画延長の意図に合致するため | 独立した新しいクリップの場合は、時間的な連続性を取り除き、新しいシーンを直接説明する |

中国語の対応表現（替换、换成、增加、删除、修改、保持……不变、高清化、延长など）でも同様の分類がトリガーされます。

ビジネスシナリオで実際に元の動画の置き換えや変更が必要な場合は、それは編集タスクです。分類を回避しようとするのではなく、`ratio: adaptive`および`duration: -1`を指定して送信してください。

## 実例

このリクエストでは、4:3と15秒も設定しながら「動画をアップスケール」しようとしていました。

```json theme={null}
{
  "model": "doubao-seedance-2-5-260628",
  "ratio": "4:3",
  "duration": 15,
  "resolution": "1080p",
  "content": [
    { "type": "text", "text": "Upscale reference video 1 to HD, keep all elements in the video unchanged, keep the outfits unchanged" },
    { "type": "video_url", "role": "reference_video", "video_url": { "url": "asset://asset-xxxx" } }
  ]
}
```

このリクエストは直ちに400で拒否されました。

```text theme={null}
The parameters `ratio` and `duration` specified in the request are not valid.
Seedance identified your task as video editing based on your prompt. ...
Issues: [0] `ratio` must be `adaptive`. [1] `duration` must be -1.
```

「アップスケール」と「変更せずに維持」の組み合わせは元の映像を処理することを意味するため、モデルはこれを編集として分類しました。編集タスクでは、カスタムのアスペクト比や尺を指定できません。このリクエストは実際に編集であるため、正しい修正は次のとおりです。

```json theme={null}
"ratio": "adaptive",
"duration": -1
```

変更後、出力は元動画のアスペクト比と尺に従います。

## パラメータで参照から動画への変換を強制できますか？

**いいえ。** 2.5 では、`omni_reference_task_type` は次の 3 つの値のみを受け付けます。

| 値 | 効果 |
| - | - |
| `auto`（デフォルト） | モデルがアセットと prompt から判断します |
| `edit` | 動画編集を宣言します。編集制約は送信時に検証されます |
| `extend` | 動画拡張を宣言します。拡張制約は送信時に検証されます |

「参照から動画への変換」という値はありません。また、`edit` / `extend` は **早期に検証する** のみであり、タスクタイプを強制しません。宣言したタイプが、モデルが prompt から推論する内容と異なる場合でも、タスクは `InvalidParameter.TaskTypeMismatch` で失敗します。

要するに、タスクタイプを決定するのは **prompt** です。パラメータはそれに合わせることしかできません。

## 信頼性の高い3つのアプローチ

<Tabs>
  <Tab title="出力サイズを問わない">
    プロバイダのドキュメントで推奨されている汎用的な設定です。参照アセットがある場合は、常に以下を送信してください。モデルがどのサブタスクを選択しても、パラメータ制約によってリクエストが失敗することはありません。

    ```json theme={null}
    "omni_reference_task_type": "auto",
    "ratio": "adaptive",
    "duration": -1
    ```

    トレードオフとして、タスクがリファレンスから動画として分類される場合、**モデルが長さを選択します**（テストでは10秒以上）。そのため、コストは長さに応じて変動します。コスト重視のワークロードには推奨されません。
  </Tab>

  <Tab title="アスペクト比と長さを固定する">
    `ratio` と `duration` を自分で設定するには、モデルがタスクをリファレンスから動画として分類する必要があります。これは prompt によって決まります。

    * アセットを**参照、借用、または模倣**する対象として説明し、何を参照するか（動き、カメラワーク、スタイル、キャラクターの見た目）を明示します
    * 元動画に何をするかではなく、**作成したい新しいシーン**に焦点を当てます
    * 追加 / 削除 / 修正 / 置換 / 変更、 「…を変更せず維持」、 「アップスケール / 復元」、または「延長 / 続き」といった表現は避けます

    | 編集として解釈されやすい表現 | リファレンスから動画として書き換えた表現 |
    | - | - |
    | 動画1の人物を画像1の女の子に置き換える | 画像1の女の子がビーチ沿いを走る。動きとカメラワークは動画1を参照する |
    | 動画1のシーンを維持して猫を追加する | 猫が街角を通り過ぎる。街のスタイルは動画1のものにする |
    | 動画1をアップスケールし、衣装は変更しない | 動画1のキャラクターの見た目と衣装を取り入れた新しいランウェイ映像 |
  </Tab>

  <Tab title="コードで再試行する">
    prompt がエンドユーザーから渡され、制御できない場合は、この400をキャッチして一度だけ再送信してください。エラーは送信時に返されるため、タスクは作成されず、400のパラメータエラーには課金されません。

    ```python theme={null}
    import os
    import requests

    URL = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
    HEADERS = {
        "Authorization": f"Bearer {os.environ['APIYI_API_KEY']}",
        "Content-Type": "application/json",
        "Accept-Encoding": "identity",
    }

    def submit(payload: dict) -> str:
        resp = requests.post(URL, headers=HEADERS, json=payload, timeout=300)
        if resp.status_code == 400 and "TaskTypeConstraint" in resp.text:
            # Classified as edit / extend / first-frame: release ratio and duration, then resubmit
            payload = {**payload, "ratio": "adaptive", "duration": -1}
            resp = requests.post(URL, headers=HEADERS, json=payload, timeout=300)
        resp.raise_for_status()
        return resp.json()["id"]
    ```

    再試行後は、アスペクト比や長さを制御できなくなります。製品で出力仕様を保証する必要がある場合は、サイレントに再試行するのではなく、エラーをユーザーに返して言い換えを依頼してください。
  </Tab>
</Tabs>

## エラーが発生するタイミング

| シナリオ | 失敗するタイミング | エラーコード |
| - | - | - |
| `edit` / `extend` を明示的に指定し、パラメータが制約に違反している場合 | 送信時に400 | `InvalidParameter.TaskTypeConstraint` |
| 省略した場合、または `auto` で、モデルが編集として分類し、パラメータが制約に違反している場合 | プロバイダーのドキュメントではタスクは非同期で失敗するとされていますが、**送信時に400が返ることもあります**（上記のケースのように） | `InvalidParameter.TaskTypeConstraint` |
| 指定したタイプがモデルの分類と異なる場合 | タスクの実行開始後に失敗します | `InvalidParameter.TaskTypeMismatch` |

この2つのエラーには異なる修正が必要です。`TaskTypeConstraint` の場合はパラメータを変更し、`TaskTypeMismatch` の場合は prompt を変更します（または `omni_reference_task_type` を `auto` に戻します）。

## コストに関する注意事項

* **動画編集の出力は、希望した長さではなく元動画と同じ長さになります**。25秒の元動画は、およそ25秒分として課金されます。
* **参照動画を使用するタスクでは、入力動画のフレームも課金対象のtokensに変換されます**。より長く、高解像度の元動画ほどコストが高くなります。
* 参照から動画へのタスクで`duration: -1`を使用すると、モデルが長さを選択するため、想定より長くなる場合があります。

送信前に元動画の長さを確認すると、ほとんどの想定外を回避できます。タスクの実際の料金を確認するには、[task\_idでSeedance動画の実際のコストを調べる方法は？](/ja/faq/seedance-task-cost-lookup)を参照してください。

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="動画生成 API" icon="video" href="/ja/api-capabilities/seedance2/video-generation">
    タスクタイプとパラメータ制約の比較、完全なリクエストパラメータ
  </Card>

  <Card title="Seedance 2.0 / 2.5 概要" icon="film" href="/ja/api-capabilities/seedance2/overview">
    2.5 と 2.0 の違い、完全な編集および拡張の使用方法
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.