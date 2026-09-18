> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 / 2.5 人臉素材為什麼被攔截？

> 說明 Seedance 2.0 與 2.5 的真人臉、虛擬人臉限制，以及素材入庫和真人認證的正確使用流程。

## 簡短回答

Seedance 2.0 與 2.5 通道自帶的“虛擬人臉白名單”是**平臺通道側的上游能力**，不需要也無法在您的 API易 令牌或賬號上手動開啟。但是，這不代表含人臉圖片可以直接通過公網 URL 或 Base64 作為首幀或參考圖提交。

如果 AI 生成的虛擬模特圖被識別為“可能含真人”，請先將圖片上傳到 [Seedance 2.0 / 2.5 素材庫](https://icover.ai/zh/seedance-official/asset-library)，等待入庫狀態變為“可用”，取得 `asset://xxx` 素材 ID，再用該素材 ID 建立影片任務。

<Info>
  **通道權限與素材可信狀態是兩件事**

  * **虛擬人臉白名單**：平臺通道已具備，不需要為單個賬號或令牌另行開通
  * **素材入庫**：將具體人臉圖片登記為可信素材，取得可用於影片生成的 `asset://` ID
</Info>

## Seedance 2.0 和 2.5 的人臉規則一樣嗎？

就人臉素材稽核而言，當前文件對 Seedance 2.0 和 2.5 給出的處理方式一致：兩代都不能直接提交寫實真人臉作為首幀或參考圖。這裡的“規則一致”僅針對人臉素材稽核，不代表兩代模型的全部能力和引數完全相同。

* AI 生成的寫實虛擬人像也可能被識別為疑似真人
* 虛擬人像應先走素材入庫，取得 `asset://xxx` 後再引用
* 真人人臉需要由本人完成活體認證，並使用對應的授權真人素材

<Note>
  `SeeDance2` 是模型呼叫分組，不是可以繞過人臉稽核的放行開關。Seedance 2.5 與 2.0 系列四個模型**同走 `SeeDance2` 分組**（0.18x），一把令牌即可同時呼叫兩代模型，無需單獨勾選其它分組。
</Note>

## 為什麼 AI 生成人臉仍可能被攔截

上游內容安全系統會根據圖片本身判斷是否含有人臉或疑似真人，而不是隻依據圖片由 AI 生成這一宣告。寫實度較高的虛擬模特可能被識別為“可能含真人”，因此直接傳公網 URL 或 Base64 時仍可能觸發防深偽攔截。

這類攔截通常不代表您的 API易 賬號缺少白名單，也不代表需要修改令牌權限。正確處理方式是讓圖片先通過素材入庫流程，成為可信素材。

<Warning>
  不要通過反覆更換 URL、轉存圖片、壓縮圖片或修改檔名來繞過人臉檢測。這些操作不會改變素材的人臉屬性，也不能替代素材入庫或真人認證。
</Warning>

## AI 虛擬模特用於首幀或參考圖的正確做法

<Steps>
  <Step title="登入素材庫">
    開啟 [icover.ai 素材庫](https://icover.ai/zh/seedance-official/asset-library)，註冊或登入您的 icover.ai 賬號。
  </Step>

  <Step title="上傳虛擬人像">
    在“虛擬人像入庫”中上傳 AI 生成的模特圖。支援 jpeg、png、webp、bmp、tiff、gif、heic；寬高比需為 0.4–2.5，邊長需為 300–6000px，單張少於 30MB。
  </Step>

  <Step title="等待素材可用">
    等待十幾秒，確認狀態變為“可用”或 `Active`，然後複製 `asset://xxx` 素材 ID。素材 ID 可重複使用，無需每次重新入庫。
  </Step>

  <Step title="選擇生成方式">
    在 [icover.ai 線上測試](https://icover.ai/zh/seedance-official) 中選擇“多模態”模式，並將參考圖型別設為“素材”；通過 API 呼叫時，則把 `asset://xxx` 填入 `image_url.url`。
  </Step>

  <Step title="設定圖片角色">
    用作首幀時設定 `role: "first_frame"`；用作人物或風格參考時設定 `role: "reference_image"`。提示詞中使用“圖片1”指代對應素材。
  </Step>
</Steps>

<Tip>
  為提高人物一致性，可以將同一虛擬人物的“全身正面圖”和“人臉正面無表情特寫”放入同一個素材組。
</Tip>

## 是否必須使用平臺預置素材或 Seedance 生成圖片

不必須。以下三種來源都可以使用，但含人臉素材應按對應流程處理：

| 素材來源                  | 是否可用  | 推薦處理方式                            |
| --------------------- | ----- | --------------------------------- |
| 自己生成的 AI 虛擬模特圖        | 可以    | 上傳素材庫，取得 `asset://` ID 後使用        |
| 平臺素材庫中已有的虛擬人素材        | 可以    | 直接選擇已有素材或引用其 `asset://` ID        |
| Seedance 或其他模型生成的含臉圖片 | 可以    | 如果再次作為人臉參考圖使用，仍建議先入庫；生成來源不會自動豁免檢測 |
| 真人人臉圖片                | 有條件可以 | 先完成真人活體認證，再上傳到對應真人素材組             |

因此，關鍵條件不是“圖片必須由哪個模型生成”，而是**含人臉圖片是否已成為可用的可信素材**。

## 能否為單個賬號或 2.5 額外開啟 AI 人臉白名單

無需單獨開啟，也不存在由使用者自行操作的“AI 人臉白名單”賬號開關。平臺通道已經具備虛擬人臉相關的上游權限；您需要完成的是素材入庫，而不是申請修改令牌。

如果虛擬人像入庫失敗，或已取得 `asset://` ID 仍被攔截，請聯絡客服並提供以下資訊，以便排查素材狀態或上游稽核結果：

* API易 賬號或註冊郵箱
* 使用的模型名稱
* 素材 ID（`asset://xxx`）
* 影片任務 ID 和完整錯誤資訊
* 素材入庫狀態截圖

呼叫 Seedance 2.5 或 2.0 系列時，都需要確認令牌已勾選 `SeeDance2` 分組。分組只決定模型呼叫入口和計費倍率，不會改變人臉稽核規則。

<Warning>
  如果圖片實際包含真人，或系統將其判定為需要真人授權的素材，平臺不能通過普通虛擬人入庫繞過上游保護政策。此時需要在素材庫的“真人認證”頁面完成藝人活體認證，並將素材上傳到該藝人的專屬真人素材組。
</Warning>

## Seedance 2.5 常見問題

<AccordionGroup>
  <Accordion title="Seedance 2.5 是否放寬了真人臉限制？">
    沒有。就人臉素材稽核而言，2.5 與 2.0 的處理方式一致，直接提交寫實真人臉仍可能被上游內容安全機制攔截。
  </Accordion>

  <Accordion title="SeeDance2 分組是人臉白名單嗎？">
    不是。`SeeDance2` 是 2.5 與 2.0 系列共用的模型呼叫分組，負責模型路由和計費。即使令牌已勾選該分組，仍需按素材型別完成素材入庫或真人認證。
  </Accordion>
</AccordionGroup>

## Seedance 2.0 / 2.5 定向開放說明

Seedance 系列採用原廠直轉並受平臺保護政策約束，目前主要面向有明確業務需求的定向客戶，因此文件中心可能不展示公開導航入口。頁面仍可通過以下地址直接訪問：

<CardGroup cols={2}>
  <Card title="Seedance 2.0 / 2.5 總覽" icon="film" href="/zh-Hant/api-capabilities/seedance2/overview">
    檢視模型能力、輸入限制、計費與常見問題。
  </Card>

  <Card title="影片生成 API" icon="video" href="/zh-Hant/api-capabilities/seedance2/video-generation">
    檢視首幀、首尾幀和多模態參考生影片的引數格式。
  </Card>

  <Card title="素材庫" icon="images" href="/zh-Hant/api-capabilities/seedance2/asset-library">
    檢視虛擬人入庫、真人認證、素材格式和 API 介面。
  </Card>

  <Card title="素材引用實戰" icon="code" href="/zh-Hant/api-capabilities/seedance2/asset-reference">
    檢視上傳、入庫、輪詢 `Active`、引用素材和下載影片的完整流程。
  </Card>
</CardGroup>

## 線上工具

* [Seedance 2.0 / 2.5 線上測試](https://icover.ai/zh/seedance-official)
* [虛擬人及真人人臉素材入庫](https://icover.ai/zh/seedance-official/asset-library)
