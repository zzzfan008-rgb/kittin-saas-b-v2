> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse 影片 Agent 技能

> 在 Agent 裡用 HappyHorse-1.1（畫質取向的阿里系影片模型）出片——與 Wan2.7 共用同一個 wan 技能，只需把 --model 設為 happyhorse。

<Note>
  **HappyHorse 不需要單獨的技能**。它和 Wan2.7 共用同一個 **wan 影片技能**——兩個系列走同一個端點、同一套請求結構、同一個 `Wan&HappyHorse` 令牌分組，只是模型 ID 不同。完整的安裝、`SKILL.md` 與指令碼，見 [**Wan2.7 / HappyHorse 影片 Agent 技能**](/zh-Hant/api-capabilities/wan/skills)。
</Note>

## 這個模型適合什麼

<CardGroup cols={3}>
  <Card title="畫質取向" icon="sparkles">
    與 Wan2.7 同端點同用法，出片質感更強，適合對畫面要求高的場景。
  </Card>

  <Card title="參考圖最多 9 張" icon="images">
    參考圖生影片一次可掛 9 張參考圖（Wan2.7 參考素材合計 5 個）。
  </Card>

  <Card title="同一把令牌" icon="key-round">
    `Wan&HappyHorse` 分組令牌兩個系列通用，切換零成本。
  </Card>
</CardGroup>

## 在技能裡怎麼用

裝好 [wan 影片技能](/zh-Hant/api-capabilities/wan/skills) 後，把 `--model` 設為 `happyhorse` 即可：

```bash theme={null}
python3 wan/scripts/wan_video.py "無人機航拍秋天山谷，金黃色森林，電影感" --model happyhorse -o valley.mp4
```

指令碼會按你傳的素材自動選對模型 ID（`happyhorse-1.1-t2v` / `-i2v` / `-r2v` / `happyhorse-1.0-video-edit`），不用記這些名字。

<Warning>
  **紅線**：HappyHorse **不支援參考影片與音訊驅動**——

  * `--ref-video` 僅 Wan2.7 可用，對 happyhorse 傳會被指令碼直接攔下；
  * 圖生影片只認首幀圖，沒有 Wan2.7 的 `driving_audio` 音訊驅動；
  * 價格約為 Wan2.7 的 1.5 倍（720P \$0.126/秒、1080P \$0.224/秒，5 秒 720P 約 \$0.63），走量場景優先預設的 `wan`。

  技能指令碼已對這些差異自動門控，正常用 `--model happyhorse` 不會踩坑。
</Warning>

## 相關文件

* [Wan2.7 / HappyHorse 影片 Agent 技能（主頁 · 完整指令碼）](/zh-Hant/api-capabilities/wan/skills)
* [HappyHorse 影片生成總覽](/zh-Hant/api-capabilities/happyhorse/overview)
* [Seedance 2.0 影片 Agent 技能](/zh-Hant/api-capabilities/seedance2/skills)
