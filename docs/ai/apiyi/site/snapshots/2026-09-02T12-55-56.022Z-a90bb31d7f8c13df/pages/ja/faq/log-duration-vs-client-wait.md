> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ログには呼び出しが完了して課金済みとありますが、クライアントにはレスポンスが届きませんでした。どうトラブルシューティングすればよいですか？

> コンソールログの継続時間は、ゲートウェイが処理を終えた時点までしか含まれず、クライアントは最後の byte と接続の終了シグナルを待ちます。このページでは、ギャップがどこで生じるかを測定する方法、2台のサーバー間のスループットをベンチマークする方法、そして計測で記録すべきフィールドを示します。

## 簡潔な答え

<Info>
  **コンソールログの継続時間と、クライアントのタイムアウトは、同じ時間区間を測定しているわけではありません。**

  * ログの継続時間は、**ゲートウェイが処理を完了する**時点までを示します。
  * クライアント側は、**レスポンス本文の最後のバイトが到着し、接続が完了したことが示される**まで終了しません。

  つまり、「ログでは280秒で完了したのに、600秒のタイムアウトでもデータがまったく届かなかった」ということは十分にあり得ます。**そして、そのリクエストは実際に成功しており、実際に課金もされています。** その差分は、ログがそもそも扱っていない区間にあります。

  このページでは、その差分を**測定**し、特定の区間に切り分け、適切な原因として扱う方法をご紹介します。
</Info>

このページは、**大きなレスポンスを伴う非ストリーミング呼び出し**について説明しています。base64 を返す画像エンドポイントが典型例で、レスポンス本文は数MBから数十MBに及びます。非ストリーミングの長文テキスト出力も同様です。ストリーミングの呼び出しと小さなレスポンスは、通常影響を受けません。

## ログの所要時間が実際に含む範囲

1 回の呼び出しの総レイテンシは 5 つの区間に分かれます:

```
client total = connect + request upload + upstream generation + response download + waiting for finish signal
                                    └─ the console log's duration covers only this ─┘
```

| 区間                  | 時間を消費しているもの                                    | コンソールログに含まれますか？      |
| ------------------- | ---------------------------------------------- | -------------------- |
| 接続（DNS / TCP / TLS） | お客様のネットワークが当社の入口に到達するまで                        | ❌                    |
| リクエストのアップロード        | お客様の **上り** 帯域幅。参照画像がある場合は、リクエストボディも数 MB になります | ❌                    |
| 上流での生成              | モデルが実際に生成している時間                                | ✅ **これが表示される所要時間です** |
| レスポンスのダウンロード        | お客様の **下り** 帯域幅。これは同時実行数に強く関係します               | ❌                    |
| 完了シグナルの待機           | HTTP chunked transfer の終了チャンク                  | ❌                    |

<Warning>
  **そのギャップはどのログフィールドにも現れません。**

  社内で raw-socket を使った比較検証を行ったところ、同じリクエストバッチに対してバックエンドは成功ステータス付きで 5 秒の所要時間を記録していた一方、クライアント側では完全なレスポンスを受け取るまで実際には 37〜40 秒待っていました。これらの 31〜35 秒は、ゲートウェイの処理が完了した後に発生しており、それらを記録する所要時間フィールドはありません。

  つまり、**「こちら側ではやたら時間がかかった」という主張を否定するためにログの所要時間を持ち出しても、何も証明できません** — その 2 つの数値はそもそも矛盾していませんでした。問題の特定には、クライアント側で区間ごとの計測が必要です。
</Warning>

コンソールと [ログクエリ API](/ja/api-capabilities/log-query) で利用できるフィールド: `duration_for_view`（呼び出し時間（秒））、`is_stream`、および `request_id`（問題報告時はこれを引用してください）。

## ステップ 1: 1 回の curl でギャップをセグメントに絞り込む

これは以下すべての入口です。まずこれを実行し、その後で該当するセクションを判断してください。

```bash theme={null}
curl -sS -o /dev/null --max-time 900 \
  -w 'connect=%{time_connect} pretransfer=%{time_pretransfer} ttfb=%{time_starttransfer} total=%{time_total} bytes=%{size_download} speed=%{speed_download}\n' \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST https://api.apiyi.com/v1/images/generations \
  -d '{"model":"gpt-image-2-vip","prompt":"a watercolor mountain village","size":"2048x2048"}'
```

3 つの派生メトリクスで、これらの生の数値を意味のあるセグメントに変換します。

| メトリクス    | 式                                | 意味                                            |
| -------- | -------------------------------- | --------------------------------------------- |
| アップロード時間 | `pretransfer − connect`          | リクエスト本文の送信にかかった時間                             |
| 生成時間     | `ttfb − pretransfer`             | **≈ コンソールログに表示される継続時間**                       |
| ダウンロード時間 | `total − ttfb`                   | レスポンス本文の受信にかかった時間                             |
| 有効な下り速度  | `size_download / (total − ttfb)` | あるいは `speed_download`（bytes/sec）をそのまま確認してください |

### 結果の読み方

あなたの数値をこの表と照らし合わせてください — 次に何をするかが決まります。

| 観測した内容                                         | ギャップの位置                    | 次の手順                                                                               |
| ---------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------- |
| `ttfb` ≈ ログの継続時間、かつ `total` ≈ `ttfb`           | ギャップなし — モデル自体が単に遅い        | タイムアウトを延長してください。[API のタイムアウトを回避するにはどうすればよいですか？](/ja/faq/timeout-configuration) を参照 |
| `total − ttfb` が大きく、`speed_download` が低い       | **下り帯域幅**                  | このページのスループットとペイロードサイズのセクション                                                        |
| `total − ttfb` が大きいが、バイト数はかなり前に届いていて、その後何も続かない | **終了シグナルが届かなかった**          | [画像リクエストの終了停止](/ja/api-capabilities/image-tail-stall)                              |
| `pretransfer − connect` が大きい                   | **アップロードが遅い** — 参照画像が大きすぎる | 各入力画像を 1.5MB 未満に圧縮してください                                                           |
| `ECONNRESET` / SSL EOF が転送中に発生                 | **下り側の切断**                 | [画像 API の接続切断](/ja/api-capabilities/image-connection-drops)                        |
| curl は問題なく動くのに、アプリケーションコードだけがタイムアウトする          | **クライアント側**                | このページの「見落としやすいクライアント側の 3 つの原因」                                                     |

<Tip>
  1 回の実行では不十分です。この種の問題は時間帯ごとに発生します — ある時間帯の中では連続するすべての呼び出しが影響を受けますが、その外では何十回連続で呼び出してもまったく問題ありません。10 回実行し、分布を確認し、タイムゾーン付きで時刻を記録してください。
</Tip>

## ステップ 2: 「データは届いたのに、接続が最後まで完了しなかった」を測る

表が3行目を指しているなら、より細かい観測が必要です。レスポンスをチャンクごとに読み取り、各チャンクの到着時刻と、その間のギャップを記録します。答えるべき問いは — **最後の byte が届いてから、接続はどれくらい動き続けていたか?**

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import json, os, time, urllib.request

    body = json.dumps({
        "model": "gpt-image-2-vip",
        "prompt": "a watercolor mountain village",
        "size": "2048x2048",
    }).encode()

    req = urllib.request.Request(
        "https://api.apiyi.com/v1/images/generations",
        data=body,
        headers={
            "Authorization": "Bearer " + os.environ["APIYI_API_KEY"],
            "Content-Type": "application/json",
        },
    )

    t0 = time.monotonic()
    resp = urllib.request.urlopen(req, timeout=900)
    ttfb = time.monotonic() - t0            # headers arrived ≈ generation finished

    chunks, total, last = [], 0, time.monotonic()
    while True:
        buf = resp.read(65536)
        now = time.monotonic()
        if not buf:
            break
        total += len(buf)
        chunks.append((round(now - t0, 3), round(now - last, 3), total))
        last = now
    t_end = time.monotonic() - t0

    transfer = t_end - ttfb
    max_gap = max((gap for _, gap, _ in chunks), default=0)
    p99_at = next((t for t, _, cum in chunks if cum >= total * 0.99), ttfb)

    print(json.dumps({
        "ttfb_s": round(ttfb, 2),                 # ≈ the console log duration
        "transfer_s": round(transfer, 2),         # download
        "total_s": round(t_end, 2),               # what you actually experienced
        "body_bytes": total,
        "down_KBps": round(total / 1024 / transfer, 1) if transfer > 0.001 else None,
        "max_gap_s": max_gap,                     # largest silence between chunks
        "tail_99_s": round(t_end - p99_at, 2),    # how long the last 1% took
    }))
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    const t0 = Date.now();
    const resp = await fetch("https://api.apiyi.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.APIYI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-2-vip",
        prompt: "a watercolor mountain village",
        size: "2048x2048",
      }),
    });
    const ttfb = (Date.now() - t0) / 1000;

    const reader = resp.body.getReader();
    const curve = [];
    let total = 0, maxGap = 0, last = Date.now();
    while (true) {
      const { done, value } = await reader.read();
      const now = Date.now();
      if (done) break;
      total += value.length;
      maxGap = Math.max(maxGap, (now - last) / 1000);
      curve.push([(now - t0) / 1000, total]);
      last = now;
    }
    const totalS = (Date.now() - t0) / 1000;
    const p99At = (curve.find(([, cum]) => cum >= total * 0.99) || [ttfb])[0];

    console.log({
      ttfb_s: ttfb,
      transfer_s: totalS - ttfb,
      total_s: totalS,
      body_bytes: total,
      down_KBps: total / 1024 / (totalS - ttfb),
      max_gap_s: maxGap,
      tail_99_s: totalS - p99At,
    });
    ```
  </Tab>
</Tabs>

**検出しきい値**: 30秒を超える `tail_99`、または 30秒を超える `max_gap` は、1つの「tail stall」と見なします。特徴は、バイト数がすでに 100% に達した時点で発生する `max_gap` です — すべての byte が届き、そのあとで初めて待機が始まったことを示します。

<Warning>
  **3つのフェーズを1つの timeout 値でまとめて扱わないでください。**

  これは最も簡単にハマる落とし穴です。「最初の byte を待つ」と「転送を待つ」に同じ timeout を使うと、根本原因がまったく異なる2つの問題が、見分けのつかない1つの失敗に潰れてしまいます。

  | フェーズ            | 意味                                    | 推奨値       |
  | --------------- | ------------------------------------- | --------- |
  | 最初の byte を待つ    | 上流が生成中です — **遅いからといって壊れているわけではありません** | 120–180 s |
  | チャンク間の無音        | 転送は始まったが、その後止まって動かなくなった               | 20–30 s   |
  | データ完了後の終了シグナル待ち | 猶予期間です。それを過ぎたら先回りして終了します              | 3–5 s     |

  分けておけば、ログはそれが「生成が遅い」のか「配信はされたが最後まで完了しなかった」のかを直接教えてくれます — 推測は不要です。
</Warning>

## ステップ 3: 2 台のサーバー間でスループットをベンチマークする

### ご自身で管理している 2 台のマシン間

実測のスループットを測るには `iperf3` を使ってください。これが最も正確な方法です:

```bash theme={null}
# Server side (the machine being measured)
iperf3 -s

# Client side: forward direction, 30 seconds, 4 parallel streams
iperf3 -c <server-ip> -t 30 -P 4

# Add -R for the reverse direction — check both; image bottlenecks are downstream
iperf3 -c <server-ip> -t 30 -P 4 -R
```

### あなたのサーバーから当社の API へ

**この区間では `iperf3` は使えません** — こちらでは iperf サーバーを運用していません。代わりに、実際の呼び出しから実効レートを測定してください:

```bash theme={null}
# 10 runs; take the median speed_download as your effective downstream bandwidth (bytes/sec)
for i in $(seq 1 10); do
  curl -sS -o /dev/null --max-time 900 \
    -w '%{time_starttransfer} %{time_total} %{size_download} %{speed_download}\n' \
    -H "Authorization: Bearer $APIYI_API_KEY" -H "Content-Type: application/json" \
    -X POST https://api.apiyi.com/v1/images/generations \
    -d '{"model":"gpt-image-2-vip","prompt":"test","size":"1024x1024"}'
done
```

これに回線品質チェックを組み合わせてください:

```bash theme={null}
mtr -rwzbc 100 api.apiyi.com        # per-hop packet loss and latency
ss -tin state established           # TCP retransmits, RTT, congestion window
```

<Warning>
  **計測表が「終了シグナルが一度も来なかった」を示しているなら、`mtr` と `ping` はここでは役に立ちません。** その場合、1 バイトも失われておらず回線品質も問題ないので、これらのツールでは異常は見つかりません — つまり、見当違いの原因を追ってしまうことになります。ネットワークを調べる前に、上のスクリプトでどちらのケースに当てはまるかを確認してください。
</Warning>

### 帯域幅が十分かどうかを確認する

画像のレスポンス本文は、base64 の 1 つの大きな塊です。実測値は次のとおりです:

| ケース                          | レスポンス本文  |
| ---------------------------- | -------- |
| `gpt-image-2` ファミリー、デフォルトサイズ | 約 2.6 MB |
| Gemini ファミリー、2K              | 約 13 MB  |
| Gemini ファミリー、4K              | 約 35 MB  |

base64 エンコードそのものにより、ペイロードはおよそ 33% 増えます。自分自身へのリンクでのダウンロード時間は次のとおりです:

| 下り帯域幅    | 2.6 MB | 13 MB  | 35 MB |
| -------- | ------ | ------ | ----- |
| 100 Mbps | 0.2 秒  | 1.0 秒  | 2.8 秒 |
| 10 Mbps  | 2.1 秒  | 10.4 秒 | 28 秒  |
| 2 Mbps   | 10.4 秒 | 52 秒   | 140 秒 |

**ただし、この表は自分自身へのリンクがあることを前提としています。** 実際には:

```
bandwidth per request = egress bandwidth ÷ requests in flight
```

たとえば、下り帯域幅が 10 Mbps、画像リクエストが同時に 30 件、レスポンス 1 件あたり 2.6 MB の場合、各リクエストが使えるのはおおよそ 0.04 MB/s だけなので、**ダウンロードだけで 62 秒かかります**。しかも、その 62 秒のうち 1 秒たりともコンソールログには現れません。同時実行数を 2 倍にすれば、その時間も 2 倍になります。

<Tip>
  これは、「日中の混雑時だけタイムアウトするのに、同じコードが夜は問題ない」理由です。モデルが遅くなったのではありません。より多くのリクエストで帯域幅が分け合われているだけです。
</Tip>

## Step 4: 計測で記録すべきフィールド

症状を正確に説明するために — 自分で分析する場合でも、私たちに送る場合でも — 各呼び出しごとに少なくとも次の項目を記録してください。

| フィールド               | 取得方法                                                                  | 重要な理由                                 |
| ------------------- | --------------------------------------------------------------------- | ------------------------------------- |
| リクエスト ID            | レスポンスヘッダー。モデルによって名前が異なります（`request-id` または `x-request-id`）。両方確認してください | バックエンドログで検索する際に使う値です                  |
| 開始時刻                | クライアントのローカル時刻、**タイムゾーン付き**                                            | バックエンドログとインシデントの時間帯を合わせるため            |
| 最初のバイトまでの時間         | `ttfb`                                                                | バックエンドの所要時間と比較するため                    |
| 最後のバイト時刻            | 最終チャンクが到着した時刻                                                         | これと総時間の差が、終了シグナルを待っていたアイドル待機時間です      |
| 総時間                 | 完全なレスポンスを受け取るまでの時間                                                    | 実際に体験した時間です                           |
| レスポンス本文の bytes      | 読み取った合計 bytes                                                         | レートを算出し、完全性を確認するため                    |
| ダウンストリーム速度          | bytes ÷ ダウンロード時間                                                      | 低い値は帯域幅が原因であることを意味します                 |
| **その時点での進行中リクエスト数** | 独自の同時実行カウンター                                                          | **最も重要な列** — これがないと、遅さと同時実行数の相関を取れません |

最後の列は多くの人が省きがちですが、結論そのものになることがよくあります。速度を同時実行数に対してプロットし、同時実行数の増加に比例して速度が低下するなら、ボトルネックは帯域幅であり、それ以上探すものはありません。

**表の使い方**: コンソールログの `duration_for_view` と並べて確認してください —

* 近い → 問題はダウンストリーム転送です。帯域幅と同時実行数を確認してください;
* 離れている → 問題は終了シグナルか、クライアント側です。

## リスクをすぐに下げる4つの方法

<Steps>
  <Step title="URL出力に切り替える — 最も効果の高い変更">
    `gpt-image-2-vip` と `gpt-image-2-all` は `response_format: "url"` を受け付け、base64 ではなく画像リンクを返します。**レスポンスボディは約 2.6 MB から約 0.3 KB に減ります** — 小さなレスポンスには `Content-Length` が含まれるため、ダウンロードと終了シグナルの問題を同時に解消できます。クライアント側が自分で完了を判断できるからです。

    ビジネスが URL 出力に依存しているなら、token のグループを `image2_OSS` に切り替えてください: リソース逼迫時でも base64 に劣化しない決定論的な URL 出力で、**上乗せなしの 1x 倍率**です。

    <Warning>
      公式リレー `gpt-image-2` はこのパラメータを**サポートしておらず**、送信すると 400 `unknown_parameter` を返します。現在の出力経路は base64 のみです。
    </Warning>
  </Step>

  <Step title="レスポンスボディを小さくする">
    base64 のままにする必要がある場合は、`output_format=jpeg` を `output_compression` と組み合わせると PNG と比べてサイズを半分以上削減できます。`size` と `quality` は、デフォルトの 4K にせず実際に必要な値まで下げてください。入力の参照画像を 1.5MB 未満に圧縮することも、アップロード側の助けになります。
  </Step>

  <Step title="帯域幅が支えられる範囲で同時実行数を上限にする">
    上の式を逆にすると、許容できるダウンロード時間 × アウトバウンド帯域幅 ÷ 画像1枚あたりのサイズ が同時実行数の上限です。これを超えても、各リクエストが遅くなるだけで総スループットは上がりません。モデルごとの上限は [同時実行数はどれくらい使えますか？](/ja/faq/api-concurrency) にあります。
  </Step>

  <Step title="タイムアウトを3つに分け、データ完了時には能動的に終了する">
    最初のバイト、チャンク間、終了猶予のタイムアウトをそれぞれ前述のとおりに設定してください。データが完了しているのに終了シグナルが届かない場合は、すでに受け取っているレスポンスをアプリケーションに渡してください — 完全な互換コードは [画像リクエストの完了待ち停止](/ja/api-capabilities/image-tail-stall) にあります。
  </Step>
</Steps>

## よくある質問

<AccordionGroup>
  <Accordion title="結果を受け取れなかったのに、なぜまだ課金されたのですか？">
    課金は**ゲートウェイの処理が完了した時点で**発生し、その時点までに上流では実際に結果が生成されて返却されています。その後にクライアントが受け取るかどうかは、すでに発生した課金額には影響しません。計測した比較では、5秒で切断したクライアントは、最後まで実行したクライアントと**まったく同じ**だけ課金されます。

    見方を変えると、これが最も強力な切り分け材料です。**課金記録があるということは、リクエストが本当に上流に到達して成功した**ということなので、問題はゲートウェイの処理完了後にあるか、あるいはリクエストが本当に送信される前にあるはずです。上流を疑う必要はありません。

    画像エンドポイントには非同期タスク ID がないため、切断すると結果は失われます。[非同期画像 API はありますか？](/ja/faq/image-async-api)をご覧ください。
  </Accordion>

  <Accordion title="600秒から1200秒にタイムアウトを延ばせば改善しますか？">
    場合によります。だからこそ、何かを変える前に計測するのです。

    * **ダウンロードが遅い**（レートが低く、バイト数がまだ増え続けている）：はい、延ばせば結果を取得できます。
    * **完了シグナルが一度も来ない**（バイトはずいぶん前に完了し、最後に何も新しいものがない）：**いいえ**。この状態でさらに330秒待ち続けることを計測しましたが、新しいバイトは1つも増えませんでした。タイムアウトを長くしても、気づくタイミングが遅れるだけです。ここではクライアント側で先回りして完了させる必要があります。
  </Accordion>

  <Accordion title="これは私の問題ですか、それともゲートウェイの問題ですか？">
    どちらでもあり得るので、まず計測します。両側の判定基準は次のとおりです。

    * **あなた側を示すもの**: 明らかに低い `speed_download`、同時実行数が増えるにつれてレートが下がる、`mtr`でのパケット損失、または curl は問題ないのにアプリケーションコードだけがタイムアウトする場合です。
    * **こちら側を示すもの**: バイトはずいぶん前に完了していて、末尾で長い間まったく新しいデータが増えていない状態です。ゲートウェイには「完了シグナルの遅延」問題がありましたが、その根本原因は画像経路の課金処理がリクエスト処理を妨げていたことでした。これは**2026年8月13日**の上流リリースで修正され、確認済みです。完全に正常な期間でも、リクエストの約4%はデータがすでに完全に配信済みであるにもかかわらず、完了シグナルをさらに10〜79秒待ちます。

    セグメントごとの計測値がそろったら送ってください。「遅い」というより、はるかに実用的です。含める項目は次のセクションにあります。
  </Accordion>

  <Accordion title="非同期 API はありますか？ 接続を開いたままにしたくありません">
    画像生成は現在、全体として同期方式であり、タスク ID を照会するエンドポイントはありません。非同期オプションはロードマップにあり、リリースされた際には別途お知らせします。

    それまでは、そちら側で非同期ラッパーを用意することをおすすめします（送信時にローカルのタスク ID を返し、バックグラウンドワーカーに同期呼び出しを行わせる）；[独自の非同期キューの構築](/ja/api-capabilities/image-async-queue)をご覧ください。
  </Accordion>

  <Accordion title="エンドポイントやマシンを変えて回避できますか？">
    どの種類に該当するかによります。帯域不足は送信側の特性なので、こちらの入口アドレスを変えても何も変わりません。必要なのは、帯域を増やすこと、ペイロードを小さくすること、または同時実行数を下げることです。完了シグナル系は、ある時間帯内の複数の入口で同時に発生し、同時に回復したため、ドメインを変えても迂回はできません。

    避けるべきアドレスは CDN ノードです。`api-cf.apiyi.com` は Cloudflare 経由で処理され、約100秒で `524` を返すため、長時間の画像リクエストには不向きです。
  </Accordion>
</AccordionGroup>

## 見落としやすいクライアント側の原因 3 つ

curl では問題がなく、アプリケーションコードだけがタイムアウトする場合は、ここを確認してください。

1. **タイムアウトの意味を取り違えている。** 600 秒は総合タイムアウトですか、それとも read timeout だけですか？ Node の`undici`には、`headersTimeout`、`bodyTimeout`、`connect.timeout`という 3 つの独立したタイムアウトがあり、いずれもデフォルト値は外側のレイヤーで設定した値よりはるかに短いです。外側の設定だけを変更しても効果はありません。
2. **接続プールのキューイング。** プールが飽和すると、リクエストが実際に送信される前に時計が進み始めます。その待ち時間は私たちからは完全に見えません。リクエストが本当に送られるまでは、バックエンドログに記録が残らないからです。診断: 対応するログ記録がない場合、通常はこの分類です。
3. **途中に別のレイヤーがある。** セルフホストの nginx では `proxy_read_timeout` のデフォルトが 60 秒で、ロードバランサー、API ゲートウェイ、サーバーレスプラットフォームもそれぞれ独自の上限を課します。各ホップのタイムアウトを列挙してください。最小のものが実際のタイムアウトです。

## 報告時に含める内容

セルフチェックの後でもまだサポートが必要な場合は、やり取りの回数を減らすため、次の内容をまとめて送ってください。

* **Request IDs**（全件でなく、いくつかで十分です）
* **セグメントごとの所要時間**: 最初の byte までの時間 / 最後の byte までの時間 / 合計時間 / レスポンス本文の byte 数
* **発生時刻**（タイムゾーン付き。例: `2026-08-13 15:57 (UTC+8)`）
* その時点の**同時実行数**と、送信側の帯域幅
* 使用していた**モデル**と**token グループ**

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="API タイムアウトを回避するには？" icon="timer" href="/ja/faq/timeout-configuration">
    シナリオ別の推奨タイムアウトと、エンドポイントの選択
  </Card>

  <Card title="画像リクエストの終了待ち" icon="hourglass" href="/ja/api-capabilities/image-tail-stall">
    データは完了しているのに接続が終了しない場合のクライアント側の処理
  </Card>

  <Card title="画像 API の接続切断" icon="unplug" href="/ja/api-capabilities/image-connection-drops">
    ECONNRESET や SSL EOF 風の下流側切断の診断
  </Card>

  <Card title="どれくらいの同時実行数を使えますか？" icon="gauge" href="/ja/faq/api-concurrency">
    モデル別の同時実行数制限とクォータ申請
  </Card>

  <Card title="画像 API のベストプラクティス" icon="image" href="/ja/api-capabilities/image-api-best-practices">
    モデル別タイムアウト早見表と出力形式の比較
  </Card>

  <Card title="ログで課金額を確認する" icon="receipt" href="/ja/faq/log-billing-explained">
    各コンソールログ列の意味と課金の記録方法
  </Card>
</CardGroup>

## お問い合わせ

<CardGroup cols={2}>
  <Card title="WeComサポート" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeComサポートのQRコード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QRコードをスキャンするか、[サポートにお問い合わせ](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    画像タイムアウトと低速ダウンロードの診断
  </Card>

  <Card title="メール" icon="mail">
    **サポート**: [support@apiyi.com](mailto:support@apiyi.com)

    **ビジネス**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
