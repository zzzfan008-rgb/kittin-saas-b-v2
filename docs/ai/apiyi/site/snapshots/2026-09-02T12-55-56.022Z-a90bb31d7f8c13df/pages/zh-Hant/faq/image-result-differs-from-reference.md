> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 接入模型後生成的圖片和參考圖相差很大怎麼辦？

> Gemini-3-Pro-Image 和香蕉系列模型參考圖上傳需要使用 base64 格式，不支援 OpenAI 格式，常見排查方法見正文。

## 簡短回答

如果使用 Gemini-3-Pro-Image、香蕉 Pro 或香蕉 2 模型生成圖片，結果和參考圖差異很大，通常是參考圖上傳方式不匹配導致的：

* 這些模型**不支援 OpenAI 格式上傳參考圖**
* 必須使用 **base64 格式**上傳參考圖
* 這個問題和接入方式有關，與模型本身無關

## 排查步驟

按以下順序逐項排查，可以快速定位問題：

<Steps>
  <Step title="先在網頁端測試模型">
    開啟 `imagen.apiyi.com` 網頁端，使用相同的參考圖測試一次。

    如果網頁端生成的圖片和參考圖一致，說明模型本身工作正常，問題出在你的接入方式；如果網頁端也存在差異，再進一步排查模型相關問題。
  </Step>

  <Step title="檢查令牌分組配置">
    登入 API易 控制台，確認你的令牌已正確勾選 `gemini-3-pro-image` 或香蕉系列模型所在的分組。

    模型未啟用時，呼叫會退回到預設行為，導致結果與預期不一致。
  </Step>

  <Step title="確認令牌計費模式">
    在令牌設定中檢查計費模式：

    * 選擇**按量優先**：可使用按量和包月兩種額度
    * 選擇**僅按量**：僅使用按量額度，包月額度不可用

    計費模式與模型分組不匹配時，可能導致呼叫失敗或結果異常。
  </Step>

  <Step title="參考正確接入方式">
    按目標模型的官方接入文件重新核對引數和參考圖上傳方式。

    以香蕉 2 模型為例：
    `docs.apiyi.com/api-capabilities/nano-banana-2-image/image-edit`

    重點關注：

    * 請求體中參考圖欄位是 **base64 字串**，不是 URL
    * MIME 型別需要與圖片實際格式一致
    * 多張參考圖時，引數結構是否匹配當前模型要求
  </Step>
</Steps>

## 常見原因總結

| 現象              | 可能原因           |
| --------------- | -------------- |
| 網頁端正常，API 呼叫差異大 | 接入方式不匹配（最常見）   |
| 所有呼叫結果都不一致      | 參考圖未上傳或上傳失敗    |
| 偶發性差異           | 提示詞描述不充分或參考圖過多 |
| 模型分組可見但呼叫失敗     | 計費模式不匹配        |

<Tip>
  **最常見的原因**：把圖片 URL 直接放到 OpenAI 相容格式的 `image_url` 欄位裡。對於不支援 OpenAI 格式的模型，參考圖必須先轉成 base64 字串，再放到對應欄位中。
</Tip>

## 相關問題

<CardGroup cols={2}>
  <Card title="Nano Banana 圖片失敗" icon="banana" href="/zh-Hant/faq/nano-banana-image-failure">
    Nano Banana 模型的常見問題與排查。
  </Card>

  <Card title="圖片非同步 API" icon="loader" href="/zh-Hant/faq/image-async-api">
    圖片非同步任務介面的使用方式。
  </Card>

  <Card title="Base URL 怎麼配置？" icon="link" href="/zh-Hant/faq/base-url-config">
    在各客戶端中接入 API易 的方法。
  </Card>

  <Card title="令牌管理與模型白名單" icon="key" href="/zh-Hant/faq/token-model-whitelist">
    配置令牌可用的模型分組。
  </Card>
</CardGroup>
