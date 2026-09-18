> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2.5-VIP Agent 技能

> 在 Agent 裡用 gpt-image-2.5-vip（官逆·Adobe 線，可鎖尺寸/4K，flat $0.03/張；gpt-image-2-vip 同調用）出圖——與 gpt-image-2、gpt-image-2-all 共用同一個 gpt-image-2 技能，只需把 --model 設為 gpt-image-2.5-vip。

<Note>
  **gpt-image-2-vip 不需要單獨的技能**。它和 gpt-image-2（官轉）、gpt-image-2-all 共用同一個 **gpt-image-2 系列技能**——三者都走同一套 OpenAI Images API，只是 `--model` 不同。完整的安裝、`SKILL.md` 與指令碼，見 [**GPT-Image-2 系列 Agent 技能**](/zh-Hant/api-capabilities/gpt-image-2/skills)。
</Note>

## 這個模型適合什麼

<CardGroup cols={3}>
  <Card title="能鎖尺寸 / 4K" icon="expand">
    官逆 Adobe 線，支援 30 檔 `size`（含 3840×2160 等 4K），尺寸可控。
  </Card>

  <Card title="價格最省" icon="piggy-bank">
    flat \$0.03/張，所有尺寸同價，4K 也不加價。
  </Card>

  <Card title="文生圖 / 多圖融合" icon="layers">
    支援文生圖與最多 16 張的多圖融合（不支援畫質檔/掩碼）。
  </Card>
</CardGroup>

## 在技能裡怎麼用

裝好 [gpt-image-2 系列技能](/zh-Hant/api-capabilities/gpt-image-2/skills) 後，把 `--model` 設為 `gpt-image-2.5-vip`（或 `gpt-image-2.5-flare-vip` / `gpt-image-2-vip`），並用 `--size` 鎖定尺寸：

```bash theme={null}
python3 gpt-image-2/scripts/gpt_image.py "城市夜景航拍" -o city.png --model gpt-image-2.5-vip --size 3840x2160
```

想把它設成預設通道，在 `gpt-image-2/.env` 里加一行：

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2.5-vip
```

<Warning>
  **紅線**：`quality` 按模型選檔——2.5 兩款六檔全開（`xhigh` / `max` 2026-09-10 放開），`gpt-image-2-vip` 只到 `high`，傳 `xhigh` / `max` 會被拒；2.5 的 `high` 只等於 `gpt-image-2-vip` 的 `medium`、2.5 的 `max` 才等於它的 `high`。**不要傳 `n`**（傳 `n>1` 仍只出 1 張但會按張數扣費），**掩碼只是整圖重繪**（要精確局部重繪請用官轉）。技能指令碼已對本模型自動門控，正常 `--model gpt-image-2.5-vip` 不會踩坑。

  另：`size` 偶有上游臨時停用、被強制自適應 1K 的情況；此時把尺寸/比例**也寫進提示詞**（如「16:9」）兜底即可。
</Warning>

## 相關文件

* [GPT-Image-2 系列 Agent 技能（主頁 · 完整指令碼）](/zh-Hant/api-capabilities/gpt-image-2/skills)
* [GPT-Image-2-All Agent 技能](/zh-Hant/api-capabilities/gpt-image-2-all/skills)
* [GPT-Image-2-VIP 圖片生成總覽](/zh-Hant/api-capabilities/gpt-image-2-vip/overview)
