> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 生圖 API 錯誤處理指南

> gemini-3-pro-image-preview（Nano Banana Pro）出圖失敗的三大判斷指標、谷歌內容稽核政策與 C 端友好提示方案，幫助開發者把技術錯誤轉化為可操作的使用者提示。

## 概述

`gemini-3-pro-image-preview`（即 Nano Banana Pro）對內容安全有嚴格控制，會在多個層級拒絕不合規的請求。簡單的「生成失敗」提示無法幫助使用者理解問題，一套好的錯誤處理需要做到：

* **精準識別拒絕原因** —— 區分內容違規、知識庫限制、技術錯誤
* **友好的使用者提示** —— 把技術錯誤轉化為可理解的說明
* **可操作的建議** —— 告訴使用者怎麼改才能成功
* **完整的技術資訊** —— 供開發者除錯排查

<Info>
  當請求返回 **HTTP 200 但沒有圖片** 時，這通常是谷歌側的安全判定。API易 透明代理只是如實轉發結果——我們同樣希望客戶成功出圖。判斷與文案處理需要在你的應用側完成。
</Info>

## 谷歌內容稽核政策（2026 更新）

谷歌的圖片生成採用**兩層安全機制**：

1. **可調節過濾器**：覆蓋騷擾、仇恨言論、露骨色情、危險內容等四類，可通過 `safetySettings` 調整
2. **內建保護**：針對核心危害（如兒童安全）始終生效，**無法通過引數關閉**

明確禁止的內容包括：兒童性虐待與剝削（CSAE）、暴力極端主義/恐怖主義、未經同意的私密影像（NCII）、自殘、露骨色情、仇恨言論、騷擾與霸凌。

<Warning>
  **2026 年 2 月，Nano Banana 2 上線後谷歌顯著收緊了人物與版權相關策略**，新增/強化了以下高頻拒絕場景（資料截至 2026 年 5 月 (UTC+8)）：

  * **公眾人物 / 名人**：照片級、可識別的真實人物
  * **換臉（faceswap）**
  * **真人換裝 / 改臉**
  * **金融、訂單資訊篡改**
  * **知名 IP**（如迪士尼，2026 年 1 月 23 日起）
  * **去水印**、**未成年人**相關內容

  仍然可以生成：虛構角色、風格化肖像、插畫類人物。
</Warning>

谷歌官方政策原文（請自行復制訪問）：

* 生成式 AI 禁止使用政策：`policies.google.com/terms/generative-ai/use-policy`
* 生成式內容常見錯誤說明：`ai.google.dev/api/generate-content`

## 三個核心判斷指標

按**優先順序從高到低**依次檢查：

### 1. candidatesTokenCount（最高優先順序）⭐

* **位置**：`response.usageMetadata.candidatesTokenCount`
* **含義**：API 生成的候選內容 token 數
* **規則**：等於 `0` 表示在**內容稽核階段就被直接拒絕**，連候選內容都沒生成，這是最嚴格的拒絕

```json theme={null}
{
  "candidates": null,
  "usageMetadata": {
    "promptTokenCount": 271,
    "candidatesTokenCount": 0,
    "totalTokenCount": 271
  }
}
```

### 2. finishReason（次優先順序）

* **位置**：`response.candidates[0].finishReason`
* **規則**：不等於 `STOP` 即為非正常結束，需要特殊處理

最新的圖片相關 `finishReason` 取值（注意 Nano Banana 系列新增了 `IMAGE_` 字首的圖片專用值）：

| finishReason                                      | 含義        | 使用者友好文案          |
| ------------------------------------------------- | --------- | ---------------- |
| `STOP`                                            | 正常結束      | -                |
| `IMAGE_SAFETY`                                    | 輸出側圖片安全過濾 | 內容觸發了圖片安全策略      |
| `PROHIBITED_CONTENT` / `IMAGE_PROHIBITED_CONTENT` | 違禁內容      | 內容違反安全策略，已被拒絕    |
| `SAFETY`                                          | 安全過濾      | 內容觸發了安全過濾器       |
| `RECITATION` / `IMAGE_RECITATION`                 | 引用/版權限制   | 內容可能涉及版權問題       |
| `IMAGE_OTHER` / `NO_IMAGE`                        | 未出圖/其他    | 未能生成圖片，請調整提示詞後重試 |
| `MAX_TOKENS`                                      | 長度超限      | 內容長度超出限制         |

### 3. 文本拒絕說明（重要）

* **位置**：`response.candidates[0].content.parts[].text`
* **規則**：`finishReason` 為 `STOP`，但 `parts` 裡只有 `text`、沒有圖片資料時，說明 API 返回的是**拒絕說明**而非圖片。文案可能是中文或英文，例如：

```text theme={null}
我不能為你建立帶有色情、不雅或冒犯性內容的影像。這違反了我們的安全政策。
I can't generate images that are sexually explicit.
```

## 錯誤場景速查

| 場景     | 檢測條件                                    | 典型原因               |
| ------ | --------------------------------------- | ------------------ |
| 內容稽核拒絕 | `candidatesTokenCount === 0`            | 提示詞/參考圖含敏感內容，最早期拒絕 |
| 生成過程拒絕 | `finishReason !== 'STOP'` 且 `parts` 為空  | 違禁內容、安全過濾          |
| 文本拒絕說明 | `finishReason === 'STOP'`，有 text 無圖片    | 露骨色情、違規請求          |
| 知識庫限制  | text 提到未來年份（2026+）或未釋出產品                | 知識庫更新至 2025 年 1 月  |
| 禁止功能   | text 含 `watermark`、`faceswap`、換裝、名人等關鍵詞 | 去水印/換臉/換裝/名人等被禁功能  |

## 處理流程（決策順序）

```text theme={null}
收到 API 響應
  ├─ ① candidatesTokenCount === 0 ─→ 內容稽核拒絕
  ├─ ② candidates 為空 ───────────→ API 格式錯誤（系統問題）
  ├─ ③ finishReason !== 'STOP' ───→ 生成過程拒絕（查對映表）
  ├─ ④ content.parts 為空 ────────→ 內容為空（同 finishReason 處理）
  ├─ ⑤ 遍歷 parts 收集 text 與圖片
  ├─ ⑥ 有圖片 ────────────────────→ ✅ 成功返回
  └─ ⑦ 無圖片但有 text ──────────→ 展示拒絕說明（可選關鍵詞識別）
        └─ 無 text ──────────────→ 通用錯誤 + 保留完整響應
```

## 程式碼實現（核心）

將上面的判斷順序整合為一個解析函式：

```javascript theme={null}
async function processGeminiResponse(data) {
  // ① 最高優先順序：內容稽核階段直接拒絕
  if (data.usageMetadata?.candidatesTokenCount === 0) {
    return {
      success: false,
      errorType: 'ZERO_CANDIDATES_TOKEN',
      userMessage: '您的請求在內容稽核階段被拒絕，請修改後重試',
      devMessage: 'candidatesTokenCount: 0 - 谷歌內容稽核拒絕',
      rawResponse: data,
    };
  }

  // ② candidates 為空 —— 通常是系統/格式問題
  if (!data.candidates || !data.candidates.length) {
    return {
      success: false,
      errorType: 'NO_CANDIDATES',
      userMessage: '系統出錯，請稍後重試',
      devMessage: 'candidates 為 null 或空陣列',
      rawResponse: data,
    };
  }

  const candidate = data.candidates[0];

  // ③ finishReason 非 STOP —— 生成過程被拒
  if (candidate.finishReason && candidate.finishReason !== 'STOP') {
    const reasonMessages = {
      PROHIBITED_CONTENT: '內容違反安全策略，已被拒絕處理',
      IMAGE_PROHIBITED_CONTENT: '內容違反安全策略，已被拒絕處理',
      SAFETY: '內容觸發了安全過濾器',
      IMAGE_SAFETY: '內容觸發了圖片安全策略',
      RECITATION: '內容可能涉及版權問題',
      IMAGE_RECITATION: '內容可能涉及版權問題',
      NO_IMAGE: '未能生成圖片，請調整提示詞後重試',
      IMAGE_OTHER: '未能生成圖片，請調整提示詞後重試',
      MAX_TOKENS: '內容長度超出限制',
    };
    return {
      success: false,
      errorType: 'FINISH_REASON',
      finishReason: candidate.finishReason,
      userMessage: reasonMessages[candidate.finishReason] || `請求被拒絕：${candidate.finishReason}`,
      devMessage: `finishReason: ${candidate.finishReason}`,
      rawResponse: data,
    };
  }

  // ④ content.parts 為空
  if (!candidate.content?.parts) {
    return {
      success: false,
      errorType: 'NO_PARTS',
      userMessage: '生成失敗，請重試',
      devMessage: 'candidate.content.parts 為空',
      rawResponse: data,
    };
  }

  // ⑤ 遍歷 parts：⚠️ 務必先收集 text，再判斷 thoughtSignature
  const images = [];
  const texts = [];
  for (const part of candidate.content.parts) {
    if (part.text && !part.text.startsWith('data:image/')) {
      texts.push(part.text);
    }
    if (part.inlineData?.data) {
      images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
    }
  }

  // ⑥ 有圖片即成功
  if (images.length > 0) {
    return { success: true, images, texts };
  }

  // ⑦ 無圖片但有文本 —— 展示拒絕說明
  if (texts.length > 0) {
    const textContent = texts.join('\n');
    return {
      success: false,
      errorType: 'TEXT_RESPONSE',
      userMessage: textContent,          // 直接使用 API 返回的文本
      detectedType: detectContentType(textContent),
      apiText: textContent,
      rawResponse: data,
    };
  }

  // ⑧ 兜底：永遠不要只說「未知錯誤」
  return {
    success: false,
    errorType: 'UNKNOWN',
    userMessage: '生成失敗，請檢查提示詞後重試',
    devMessage: '未找到圖片資料或文本響應',
    rawResponse: data,
  };
}
```

關鍵詞智慧識別（可選，用於給出更具體的提示）：

```javascript theme={null}
function detectContentType(text) {
  const t = text.toLowerCase();
  const isRejection =
    t.includes("i can't generate") || t.includes('i cannot create') ||
    t.includes("i'm just a language model") || t.includes('我不能') || t.includes('無法生成');
  if (!isRejection) return null;

  if (t.includes('watermark')) return 'watermark_removal';
  if (t.includes('faceswap') || t.includes('face swap')) return 'faceswap';
  if (t.includes('sexually') || t.includes('explicit') || t.includes('色情') || t.includes('不雅')) return 'nsfw';
  return 'general_rejection';
}
```

<Warning>
  **最易踩的坑**：帶 `thoughtSignature` 的 part 仍可能包含重要的 `text`。一定要**先收集 text，再決定是否跳過**——否則拒絕說明會丟失，使用者只能看到「生成失敗」。
</Warning>

## C 端友好提示文案

設計原則：**簡潔明瞭、正面引導、可操作、避免指責**。推薦模板：

```text theme={null}
❌ 內容不符合要求
您的請求包含不適當內容，無法生成圖片。
💡 建議：使用健康、正面的描述；避免敏感話題；重新調整提示詞後再試。

❌ 功能暫不支援
該功能（如去水印/換臉）暫不支援，請嘗試其他編輯方式。

❌ 內容超出範圍
您提到的內容可能超出了 AI 的知識範圍（更新至 2025 年 1 月）。
💡 建議：使用常見物品/概念，避免引用未來的產品。
```

展示分層建議：

* **C 端使用者**：預設只顯示友好說明 + 修改建議
* **B 端 / 工具服務商**：預設展開技術詳情（`finishReason`、`candidatesTokenCount` 等）
* **開發者**：提供「展開/收起」檢視完整 JSON 響應

## 最佳實踐

1. **嚴格按優先順序檢測**：`candidatesTokenCount` → `finishReason` → `parts` → 提取資料 → 關鍵詞識別
2. **先收集 text 再判斷 thoughtSignature**，避免拒絕說明丟失
3. **保留完整響應**：開發/測試工具務必儲存原始 JSON，便於排查
4. **支援中英文拒絕文案**：谷歌可能返回中文或英文，關鍵詞匹配兩者都要覆蓋
5. **友好降級**：能智慧識別就給具體提示，否則直接展示 API 文本，再否則用 `finishReason` 友好名稱，最後才是通用提示
6. **永不顯示「未知錯誤」**：始終帶上可操作建議或完整響應

## 常見問題 FAQ

<AccordionGroup>
  <Accordion title="為什麼同一個提示詞有時能生成有時不能？">
    谷歌的安全過濾存在隨機性和上下文相關性：參考圖內容、提示詞組合方式都會影響判斷。建議調整描述方式、使用更委婉的表達。
  </Accordion>

  <Accordion title="如何區分是內容問題還是技術問題？">
    `candidatesTokenCount: 0` 或 `finishReason: PROHIBITED_CONTENT` → 內容問題；`Failed to fetch` 或 HTTP 錯誤 → 技術問題；有 API 文本說明 → 通常是內容問題。
  </Accordion>

  <Accordion title="C 端使用者應該看到多少技術資訊？">
    分層展示：預設顯示友好說明 + 修改建議；可選展開技術詳情；開發模式下顯示完整 JSON 響應。
  </Accordion>

  <Accordion title="是否需要為每個 finishReason 單獨寫處理？">
    不需要。用對映表 + 通用兜底即可：`reasonMessages[finishReason] || ` + 顯示原始值。
  </Accordion>
</AccordionGroup>

## 相關閱讀

* [Nano Banana 系列價格總覽](/zh-Hant/api-capabilities/nano-banana-pricing)
* [Nano Banana Pro 出圖失敗包補計劃](/zh-Hant/api-capabilities/nano-banana-pro-guarantee)
* [Nano Banana OSS 分組](/zh-Hant/api-capabilities/nano-banana-oss-group)
