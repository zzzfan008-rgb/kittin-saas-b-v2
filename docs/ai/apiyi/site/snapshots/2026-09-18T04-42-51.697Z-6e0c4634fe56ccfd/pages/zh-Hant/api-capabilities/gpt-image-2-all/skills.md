> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2.5-All Agent 技能

> 在 Agent 裡用 gpt-image-2.5-all（官逆·ChatGPT 線，最快、flat $0.03/張；gpt-image-2-all 同調用）出圖——與 gpt-image-2、gpt-image-2-vip 共用同一個 gpt-image-2 技能，只需把 --model 設為 gpt-image-2.5-all。

<Note>
  **gpt-image-2-all 不需要單獨的技能**。它和 gpt-image-2（官轉）、gpt-image-2-vip 共用同一個 **gpt-image-2 系列技能**——三者都走同一套 OpenAI Images API，只是 `--model` 不同。完整的安裝、`SKILL.md` 與指令碼，見 [**GPT-Image-2 系列 Agent 技能**](/zh-Hant/api-capabilities/gpt-image-2/skills)。
</Note>

## 這個模型適合什麼

<CardGroup cols={3}>
  <Card title="最快出圖" icon="bolt">
    官逆 ChatGPT 線，約 30–60 秒，是三條通道里最快的。
  </Card>

  <Card title="價格最省" icon="piggy-bank">
    flat \$0.03/張，不分尺寸/畫質檔，走量友好。
  </Card>

  <Card title="文生圖 / 多圖融合" icon="layers">
    支援文生圖與最多 16 張的多圖融合（不支援掩碼局部重繪）。
  </Card>
</CardGroup>

## 在技能裡怎麼用

裝好 [gpt-image-2 系列技能](/zh-Hant/api-capabilities/gpt-image-2/skills) 後，把 `--model` 設為 `gpt-image-2.5-all`（或 `gpt-image-2-all`，兩者同價同行為）即可：

```bash theme={null}
python3 gpt-image-2/scripts/gpt_image.py "扁平插畫風節日海報，豎版 2:3" -o poster.png --model gpt-image-2.5-all
```

想把它設成預設通道（不必每次加 `--model`），在 `gpt-image-2/.env` 里加一行：

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2.5-all
```

<Warning>
  **紅線**：gpt-image-2-all **不接受 `size` / `quality` / `n`**——

  * 尺寸/比例請**寫進提示詞**（如「豎版 2:3」「16:9 橫幅」），傳 `size` 會被忽略或報錯；
  * 傳 `n>1` **仍只出 1 張但會按張數扣費**。

  技能指令碼已對本模型自動「不傳 size/quality/n」，所以正常用 `--model gpt-image-2-all` 不會踩坑；只有你繞過指令碼手搓請求時需要注意。需要鎖尺寸/4K 請改用 [`gpt-image-2-vip`](/zh-Hant/api-capabilities/gpt-image-2-vip/skills)，需要畫質檔/掩碼請用官轉 `gpt-image-2`。
</Warning>

## 相關文件

* [GPT-Image-2 系列 Agent 技能（主頁 · 完整指令碼）](/zh-Hant/api-capabilities/gpt-image-2/skills)
* [GPT-Image-2-VIP Agent 技能](/zh-Hant/api-capabilities/gpt-image-2-vip/skills)
* [GPT-Image-2-All 圖片生成總覽](/zh-Hant/api-capabilities/gpt-image-2-all/overview)
