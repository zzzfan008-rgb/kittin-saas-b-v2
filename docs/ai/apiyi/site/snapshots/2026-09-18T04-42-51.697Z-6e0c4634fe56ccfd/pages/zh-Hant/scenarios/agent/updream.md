> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Updream 接入 API易

> 在 Updream 中通過外部模型直連器呼叫 API易 圖片模型，完成 AI 創作任務

<Tip>
  Updream 是面向 B 站 UP 主、專業創作者和內容團隊的 AI 影片創作平臺。通過外部模型直連器接入 API易 後，你可以在 Updream 的創作流程中呼叫 API易 圖片模型。
</Tip>

## Updream 是什麼？

Updream 將 Agent 對話、節點化無限畫布、Skill 技能庫和多模型生成能力結合起來，幫助創作者完成從靈感構思、指令碼和分鏡，到素材與影片生成的創作流程。

你可以從一句話創意、故事梗概、已有指令碼或參考素材開始，讓 Agent 協助梳理創作方向。確定方案後，可以繼續生成指令碼、分鏡、角色、場景、道具和其他創作素材。常用的創作經驗還可以沉澱為 Skill，在不同專案中重複使用。

官方站點介紹的核心能力包括：

* **Agent 創作引導**：通過自然語言對話完善創作方向和內容方案。
* **指令碼與分鏡生成**：將創意整理為指令碼、分鏡表和鏡頭級素材。
* **無限畫布工作流**：通過節點組織文本、圖片、影片和其他創作資產。
* **Skill 技能庫**：將提示詞最佳化、角色設定和風格統一等經驗沉澱為可複用技能。
* **多模型創作**：根據任務需要選擇圖片生成、影片生成或其他模型能力。

本文以 Updream 的「外部模型直連器」為例，介紹如何使用 API易 的 OpenAI 相容配置生成圖片。截圖中的示例模型為 `gpt-image-2`，具體模型 ID 和引數請以 API易 當前模型文件為準。

## 為什麼在 Updream 中接入 API易？

通過 API易 接入 Updream，你可以：

* 使用統一的 API Key 配置外部模型。
* 在 Updream 中填寫 Base URL、API Key 和模型 ID。
* 根據創作任務切換 API易 支援的模型。
* 將生成的圖片繼續用於分鏡、角色、場景或其他創作資產。
* 保留 Updream 的 Agent、Skill 和畫布工作流。

## 前置準備

開始前，請準備：

* 已安裝並登入 Updream。
* 一個有效的 API易 API Key。
* API易 賬戶中有可用餘額。
* 需要使用的模型 ID，例如 `gpt-image-2`。

<Warning>
  API Key 屬於敏感憑證。請勿將真實金鑰釋出到截圖、文件或公共聊天中。建議使用臨時或權限受限的金鑰，任務完成後及時撤銷。
</Warning>

## 第一步：開啟外部模型直連器

1. 開啟 Updream，進入左側的「技能」。
2. 進入「技能廣場」。
3. 在搜尋框中輸入「外部模型直連器」。
4. 點選搜尋結果中的「外部模型直連器」。
5. 點選「立即使用」。

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-skill-market.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=355bcaabca93495564c10abc477d82a4" alt="Updream 技能廣場中的外部模型直連器" width="1579" height="766" data-path="images/updream-skill-market.png" />

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-skill-detail.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=ed70b83ecbc1d7f043adcc459aaeb546" alt="Updream 外部模型直連器詳情頁" width="1456" height="804" data-path="images/updream-skill-detail.png" />

從詳情頁可以看到，該技能支援文本和圖片輸入，並提供圖片、影片和文本輸出選項。本文只驗證並介紹其中的圖片生成流程。

## 第二步：選擇連線協議

在「連線」步驟中選擇：

> **OpenAI 相容（推薦）**

在自定義回答中填寫 API易 的 Base URL 和 API Key。截圖中的 API易 Base URL 為：

```text theme={null}
https://api.apiyi.com/v1
```

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-connection.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=066b622f4017d306ec63443122e7cbb5" alt="選擇 OpenAI 相容協議" width="805" height="466" data-path="images/updream-connection.png" />

<Info>
  本文使用截圖中顯示的 OpenAI 相容配置。Google GenAI、Gemini REST、Seedance 和通用 JSON 等其他協議不屬於本文的驗證範圍，請不要直接套用本頁的引數。
</Info>

## 第三步：選擇任務型別

在「任務」步驟中選擇：

> **生成圖片（推薦）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-task.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=c3d9b5efe007777b45306d8a8da30479" alt="選擇生成圖片任務" width="806" height="462" data-path="images/updream-task.png" />

該選項用於根據提示詞直接生成圖片。Updream 的外部模型直連器還顯示了編輯圖片、生成文本、提交影片和輪詢任務等選項；這些任務需要根據實際模型、協議和介面要求單獨配置，本文不將圖片配置當作影片配置使用。

## 第四步：選擇模型填寫方式

在「模型」步驟中選擇：

> **模型名即介面 ID**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-model.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=8d0a577cd0eb88c74b283a691580fd9c" alt="選擇模型名即介面 ID" width="839" height="462" data-path="images/updream-model.png" />

這種方式要求填寫模型的實際介面 ID。截圖示例使用：

```text theme={null}
gpt-image-2
```

請使用 API易 模型文件中的準確模型 ID，不要填寫展示名稱、自定義別名或其他平臺中的模型名稱。

## 第五步：選擇引數填寫方式

在「引數」步驟中選擇：

> **我提供完整引數（推薦）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-parameters.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=403ba71983675aa653c9a5f708d98044" alt="選擇完整引數填寫方式" width="817" height="447" data-path="images/updream-parameters.png" />

選擇該方式後，需要在後續回答中提供圖片提示詞、比例、尺寸、品質和數量等引數。Updream 也提供「你幫我最佳化提示詞」和「使用常規預設值」等選項，但它們不屬於本文截圖驗證的配置路徑。

## 第六步：填寫 API 憑證

在「憑證」步驟中選擇：

> **現在填寫（推薦）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-credentials.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=9843e1ab900d327b7c7feace9dd5bc12" alt="選擇現在填寫 API 憑證" width="842" height="525" data-path="images/updream-credentials.png" />

隨後按 Updream 提示填寫 API易 的 Base URL 和 API Key。請使用你自己的 API Key，不要使用截圖中的示例內容。

## 第七步：填寫模型名稱

在「模型名」步驟中選擇：

> **現在填寫（推薦）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-model-name.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=c3fb10101ce86c1a8998a2d2e8330098" alt="填寫模型名稱" width="872" height="534" data-path="images/updream-model-name.png" />

填寫實際使用的模型 ID：

```text theme={null}
gpt-image-2
```

如果要更換模型，只需要替換為 API易 當前支援的其他圖片模型 ID，並確認該模型與當前任務型別相容。

## 第八步：填寫圖片提示詞

在「提示詞」步驟中選擇：

> **直接使用原文（推薦）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-prompt.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=32769dbb70cc23e32466328c6f136142" alt="選擇直接使用原文" width="860" height="535" data-path="images/updream-prompt.png" />

然後填寫圖片提示詞。例如：

```text theme={null}
風吹麥浪
```

如果希望 Updream 自動補充主體、構圖、鏡頭、光影和畫面約束，可以改用「允許最佳化」。選擇「直接使用原文」時，提示詞會按你填寫的內容提交。

## 第九步：選擇輸出引數

在「輸出」步驟中選擇：

> **1:1 · 1K · 單張（推薦）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-output.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=cc4352948846b67a69431fe804aed3f2" alt="選擇圖片輸出引數" width="850" height="534" data-path="images/updream-output.png" />

截圖中的示例配置如下：

| 引數   | 設定   |
| ---- | ---- |
| 寬高比  | 1:1  |
| 解析度  | 1K   |
| 圖片數量 | 1 張  |
| 品質   | 中等品質 |

Updream 同時顯示了 `16:9 · 2K · 單張`、`9:16 · 2K · 單張` 和「自定義完整引數」選項。實際可用的尺寸、品質和數量取決於所選模型，請以模型文件和介面可選項為準。

## 第十步：提交 API易 配置

完成前面的選項後，Updream 會要求按照指定格式提交配置。截圖中的示例格式為：

```text theme={null}
Base URL: https://api.apiyi.com/v1
API Key: YOUR_API_KEY
Model: gpt-image-2
Prompt: 風吹麥浪
```

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-submit-reference.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=be4bba305fc22f776216498ff601a2f3" alt="提交外部模型配置的格式示例" width="865" height="630" data-path="images/updream-submit-reference.png" />

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-submit-example.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=ff8094bb573b32a8021091244755a5b5" alt="提交外部模型配置的填寫示例" width="575" height="125" data-path="images/updream-submit-example.png" />

提交前請確認：

* Base URL 為 `https://api.apiyi.com/v1`。
* API Key 已替換為你自己的 API易 金鑰。
* Model 使用準確的模型 ID。
* Prompt 包含完整的圖片要求。
* 輸出尺寸、品質和數量符合當前模型的能力範圍。

## 第十一步：檢視生成結果

提交後，Updream 會顯示生成結果。截圖中的示例結果為：

* 模型：`gpt-image-2`
* 提示詞：風吹麥浪
* 規格：1:1
* 解析度：1024 × 1024
* 數量：單張

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-task-complete.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=3a5996a5b0c90c1225194834c23a534a" alt="Updream 圖片生成結果" width="514" height="489" data-path="images/updream-task-complete.png" />

生成的圖片可以繼續作為 Updream 創作流程中的參考素材。具體能否繼續用於某個節點或任務，取決於該任務在 Updream 中的輸入型別和所選模型能力。

## 檢視最新模型推薦

<Card title="檢視最新模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
  檢視最新的模型推薦、效能對比和使用建議。模型列表持續更新，確保您使用最新的 AI 模型。
</Card>

<Info>
  AI 模型和介面引數會持續更新。具體模型 ID、圖片尺寸、品質選項和任務限制，請以 API易 模型推薦頁面及對應模型文件為準。
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="Base URL 應該填寫什麼？">
    按本文截圖驗證的 OpenAI 相容流程，填寫 `https://api.apiyi.com/v1`。其他協議對應的地址和引數不屬於本文範圍，請不要混用。
  </Accordion>

  <Accordion title="模型名稱應該填寫什麼？">
    填寫 API易 文件中的準確模型 ID，例如截圖使用的 `gpt-image-2`。如果模型 ID 拼寫錯誤，可能導致模型不存在或請求失敗。
  </Accordion>

  <Accordion title="API Key 是否可以長期保留？">
    不建議。建議使用臨時金鑰或權限受限的金鑰，並在任務完成後及時撤銷或刪除不再使用的配置。
  </Accordion>

  <Accordion title="可以直接用這套配置生成影片嗎？">
    不可以直接這樣推斷。外部模型直連器介面顯示支援提交影片和輪詢任務，但影片任務需要根據實際模型、協議和引數單獨配置。本文只驗證圖片生成流程。
  </Accordion>

  <Accordion title="為什麼任務提交後沒有結果？">
    依次檢查 API Key 是否有效、Base URL 是否為 `https://api.apiyi.com/v1`、模型 ID 是否準確、模型是否支援當前圖片任務，以及 API易 賬戶餘額是否充足。若仍失敗，請同時檢視 Updream 的任務提示和 API易 返回的錯誤資訊。
  </Accordion>

  <Accordion title="為什麼生成結果與提示詞不完全一致？">
    圖片模型會對提示詞進行理解和生成。可以嘗試減少無關描述、明確主體和構圖、把關鍵要求放在提示詞前面，或關閉「允許最佳化」後直接提交原始提示詞。
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="Updream 官方網站" icon="globe">
    `www.updream.cn`
  </Card>

  <Card title="API易 模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
    檢視最新模型、能力和使用建議。
  </Card>

  <Card title="API易 API 金鑰管理" icon="key" href="/zh-Hant/faq/token-management">
    獲取和管理 API Key。
  </Card>

  <Card title="API易 API 文件" icon="book" href="/zh-Hant/getting-started">
    檢視 API 接入和呼叫說明。
  </Card>
</CardGroup>
