> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 長提示詞與兩段式出圖：32K 上限從哪來，廣告圖資料怎麼進圖片模型

> 客戶問「你們 prompt 限了 32K，ChatGPT 沒有」。32,000 字元是 OpenAI Images API 的官方上限，按字元不按 token；網頁版能吃長資料是對話模型先替你提煉。講清上限、成本、為什麼長不等於遵循度高，以及資料先進文本模型提煉、再進圖片模型出圖的兩段式做法。

「你們的 prompt 長度和 ChatGPT 不一樣，好像限了 32K」。這個 32K 不是 API易 加的，是 OpenAI Images API 的官方上限，而且按**字元**計不按 token。但真正值得討論的不是「能不能塞 32K」，而是**該不該把 32K 資料原樣塞給圖片模型**。本文講清上限從哪來、網頁版為什麼看起來沒有限制、長提示詞的兩筆賬，以及廣告圖這類「要求很多」的場景該怎麼組織提示詞。

## 客戶的問題：為什麼 API 限 32K，ChatGPT 不限

對話原樣（已脫敏）：

> 客戶：你們的 prompt 長度和 ChatGPT 不一樣，好像限了 32K。
> 我們：是有限制的。誰會有 32K 輸入提示詞的出圖場景？
> 客戶：肯定有呀，廣告圖，包裝的尺寸……自己 call codex cli 算了。
> 我們：確認是 32000 個 tokens 的提示詞嗎？
> 客戶：是呀，32000 英文其實不長呀。

這幾句話裡混了三個概念，先拆開：

| 概念          | 是什麼            | 這個案例裡的值                                |
| ----------- | -------------- | -------------------------------------- |
| **字元數**     | 提示詞字串的長度       | Images API 上限 **32,000 字元**            |
| **token 數** | 模型實際計費與理解的單位   | 32,000 英文字元約 8K tokens；中文每字元消耗更多 token |
| **上下文視窗**   | 文本模型一次能裝下的全部內容 | 文本模型動輒幾十萬到上百萬 tokens，與圖片模型的提示詞上限是兩回事   |

客戶說「32000 英文其實不長」，說的是字元數，這個判斷本身沒錯。但他拿來對比的 ChatGPT 網頁版，走的根本不是同一條鏈路。

## 32K 上限從哪來

OpenAI Images API 對 `prompt` 欄位的官方上限（`/v1/images/generations` 與 `/v1/images/edits` 相同）：

| 模型                                                                 | prompt 上限  | 單位 |
| ------------------------------------------------------------------ | ---------- | -- |
| gpt-image 系列（含 `gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`） | **32,000** | 字元 |
| DALL·E 3                                                           | 4,000      | 字元 |
| DALL·E 2                                                           | 1,000      | 字元 |

出處：OpenAI API 參考 `developers.openai.com/api/reference/resources/images/methods/generate`。

<Info>
  API易 官轉鏈路不在這個上限之上再收緊。超過 32,000 字元由原廠返回 400，報錯原文以原廠為準，本頁未做逐位元組的邊界實測；要精確到哪一個字元開始報錯，用你自己的 Key 試一次即可，被拒的請求不計費。
</Info>

**字元不等於 token**。計費和模型理解都按 token 走，`usage.input_tokens_details.text_tokens` 是每次呼叫實際消耗的文本 token 數。同樣 32,000 字元，英文約 8K tokens，中文因為每個字元對應的 token 更多，會明顯高於這個數，裝的資訊量也更大。所以「32K 英文不長」和「32K 中文很長」可以同時成立。

## 為什麼 ChatGPT 網頁版「沒有限制」

和 [如何生成滿意的圖片](/zh-Hant/api-capabilities/image-generation-success-tips)、[內容安全排查篇](/zh-Hant/api-capabilities/image-safety-troubleshooting) 講的是同一件事：**網頁版是 Agent，API 是單次原子呼叫**。

* 在 ChatGPT 裡貼一份很長的資料，讀它的是對話模型，不是圖片模型。對話模型讀完後**自己寫一條短的出圖提示詞**去呼叫圖片工具，圖片模型拿到的從來不是那份原始資料。貼上超過 10,000 字元時網頁版還會自動轉成附件（OpenAI 幫助中心 `help.openai.com`），更說明那是給對話模型看的。
* API 是你直接對圖片模型說話，中間沒有人替你讀資料、做取捨。上限是圖片模型這一層的上限，網頁版從來沒有讓圖片模型直面這個上限。
* 客戶最後說「自己 call codex cli 算了」，這個直覺是對的：讓一個文本模型先讀資料，再產出出圖提示詞，正是網頁版在後臺做的事。下文把它寫成可以跑的兩段式。

## 長提示詞的兩筆賬

先算錢，再算效果。

**錢**：gpt-image 系列的文本輸入按 token 計費（`gpt-image-2.5` 為 \$5.00 / 百萬 tokens，見 [概覽定價表](/zh-Hant/api-capabilities/gpt-image-2/overview)）。一條 32,000 英文字元的提示詞約 8K tokens，單次約 \$0.04；中文 token 更多，費用更高。這個數單看不大，量產要乘張數，而且每一次重試都會再付一遍。提示詞裡 90% 是原始資料而不是畫面描述時，這筆錢大部分是白花的。

**效果**：更多細節不等於更高遵循度。幾百條要求同時擺在圖片模型面前時會互相競爭，真正重要的硬約束（Logo 不變形、包裝文字準確、人物數量）反而容易被埋沒。OpenAI 自己對出圖提示詞的建議是 1～3 句清晰描述起步，再補必要的構圖、光線和硬性約束（`openai.com/academy/image-generation`）。圖片模型需要的是**優先順序明確的資訊密度**，不是字數。

所以「專業廣告要求多」是對的，但**細不等於長**。[出圖進階篇](/zh-Hant/api-capabilities/image-advanced-workflow) 的六要素和 [提示詞診斷技能](/zh-Hant/api-capabilities/image-prompt-doctor) 裡「不要堆形容詞把提示詞寫長」講的都是這一條。

## 兩段式：資料進文本模型，提示詞進圖片模型

真有 32K 的東西要交給出圖，它多半是品牌手冊、包裝規格、廣告 brief、角色設定庫。這類資料應該先進文本模型，由它提煉成一條高密度提示詞，再進圖片模型：

| 階段   | 輸入                          | 模型                       | 輸出                |
| ---- | --------------------------- | ------------------------ | ----------------- |
| ① 提煉 | 品牌手冊 / 包裝規格 / 廣告 brief，長度不限 | `gpt-5.6` 等文本模型          | 1K～3K 字元的結構化出圖提示詞 |
| ② 出圖 | 上一步的提示詞（遠在 32K 之內）          | `gpt-image-2.5-sunburst` | 圖片                |

提煉層的輸出模板，在六要素之外加上廣告圖特有的三項：

| 段落             | 要寫什麼                               |
| -------------- | ---------------------------------- |
| **硬約束（放最前）**   | Logo 不變形、包裝上的文字逐字給出、人物數量、畫面比例、背景色值 |
| **目的與投放位**     | 這是什麼廣告、放在哪裡、要讓消費者感受到什麼             |
| **主體與必須保留的元素** | 產品是什麼、包裝上哪些元素必須準確出現                |
| **構圖與留白**      | 產品位置、人物位置、景別、給文案留的空白區域             |
| **視覺**         | 場景、色調、光線、材質、攝影風格                   |
| **禁止項**        | 不要增加什麼、不要改變什麼                      |

<Steps>
  <Step title="把資料原樣交給文本模型">
    品牌手冊、規格表、brief 不用預處理，文本模型的上下文足夠大。system prompt 裡寫清輸出模板、字元上限（建議 2,500 字元以內）和「硬約束放最前」。
  </Step>

  <Step title="拿到提示詞先過長度閘門">
    檢查 `len(prompt)`，超過 32,000 就讓文本模型再壓縮一輪。正常情況下提煉結果只有一兩千字元，這一步是防禦。
  </Step>

  <Step title="提示詞落庫，再調圖片模型">
    提煉結果存下來，出圖只重放這條提示詞。重試、換尺寸、換模型都不需要重新讀資料，也不會再為資料付 token。
  </Step>

  <Step title="資料變了只重跑第一段">
    包裝改版、brief 更新時重跑提煉，出圖這一段的程式碼和引數不動。
  </Step>
</Steps>

最小實現（OpenAI SDK，兩段共用一個 Key）：

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1",
)

DISTILL_SYSTEM = """你是廣告圖提示詞工程師。讀完使用者給的全部資料，輸出一條可以直接交給圖片模型的中文提示詞。

按這個順序寫，每段一行：
1 硬約束：Logo 不變形、包裝文字逐字給出、人物數量、畫面比例、背景色值
2 目的與投放位
3 主體與必須保留的包裝元素
4 構圖與留白：產品位置、人物位置、景別、文案留白區域
5 視覺：場景、色調、單一可指認的主光、材質、攝影風格
6 禁止項

規則：
- 總長不超過 2500 字元，只輸出提示詞正文，不要解釋、不要標題
- 資料裡沒有的資訊不要編造，尤其是品牌名和包裝文字
- 不要使用 8K、超高畫質、傑作、完美 這類空泛的品質詞
- 資料明確規定的內容原樣保留，不要改寫"""

PROMPT_LIMIT = 32000  # OpenAI Images API 的 prompt 上限，按字元計


def distill(brief: str, model: str = "gpt-5.6") -> str:
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": DISTILL_SYSTEM},
            {"role": "user", "content": brief},
        ],
    )
    prompt = resp.choices[0].message.content.strip()
    if len(prompt) > PROMPT_LIMIT:
        # 極少發生，發生了就再壓一輪
        prompt = distill(f"把下面這條提示詞壓縮到 2500 字元以內，保留全部硬約束：\n\n{prompt}", model)
    return prompt


def generate(prompt: str, size: str = "1536x1024", quality: str = "high") -> bytes:
    import base64
    resp = client.images.generate(
        model="gpt-image-2.5-sunburst",
        prompt=prompt,
        size=size,
        quality=quality,
        timeout=600,
    )
    return base64.b64decode(resp.data[0].b64_json)


if __name__ == "__main__":
    brief = open("brief.md", encoding="utf-8").read()   # 品牌手冊 + 包裝規格 + 廣告需求，多長都行
    prompt = distill(brief)
    open("prompt.txt", "w", encoding="utf-8").write(prompt)   # 落庫，出圖只重放這條
    open("ad.png", "wb").write(generate(prompt))
```

<Tip>
  提煉結果和出圖引數一起存檔，是這條產品線上**唯一可靠的復現方式**（GPT-Image 系列不暴露 seed），詳見 [出圖進階篇](/zh-Hant/api-capabilities/image-advanced-workflow) 第五節。
</Tip>

## 什麼時候真的需要長提示詞

有幾類場景提示詞確實會長一些，但都遠夠不到 32K：

* **多圖編輯**：用「圖1 / 圖2 / 圖3」逐一指代參考圖，說明各取什麼，幾百字。
* **畫面內文字**：招牌、海報、包裝上的文字要逐字給出，別讓模型編，幾十到幾百字。
* **系列圖的固定字首**：同一批圖共用的風格、光線、構圖段落，一千字以內。

這些加起來通常也就兩三千字元。提示詞真的逼近 32K，先懷疑是不是把資料塞進去了。

## 速查總結

* **32,000 字元是 OpenAI Images API 的官方上限**，按字元不按 token，`/generations` 與 `/edits` 相同，API易 官轉不額外收緊。
* **字元、token、上下文視窗是三件事**：32K 英文約 8K tokens，中文更多；文本模型的上下文視窗和圖片模型的提示詞上限無關。
* **網頁版沒有限制是錯覺**：對話模型先讀資料、再自己寫短提示詞調圖片工具，圖片模型從沒直面那 32K。
* **細不等於長**：文本輸入按 token 計費且每次重試再付一遍；幾百條要求互相競爭，硬約束反而被埋。
* **兩段式**：資料進文本模型提煉成 1K～3K 字元的結構化提示詞，硬約束放最前，落庫後只重放提示詞出圖。

## 相關文件

* [如何生成滿意的圖片](/zh-Hant/api-capabilities/image-generation-success-tips)
* [內容安全排查篇](/zh-Hant/api-capabilities/image-safety-troubleshooting)
* [出圖進階：工作流編排與去 AI 味](/zh-Hant/api-capabilities/image-advanced-workflow)
* [出圖提示詞診斷技能](/zh-Hant/api-capabilities/image-prompt-doctor)
* [文生圖 API 參考](/zh-Hant/api-capabilities/gpt-image-2/text-to-image)
