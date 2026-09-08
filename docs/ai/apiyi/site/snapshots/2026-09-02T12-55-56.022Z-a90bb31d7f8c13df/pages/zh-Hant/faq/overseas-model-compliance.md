> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 國內產品呼叫海外模型，合規備案怎麼辦？

> 國內產品通過 API 呼叫海外大模型時的合規要點：產品資質、大模型備案現狀、內容安全要求與行業常見做法。

## 簡短回答

產品可以做。合規問題要拆成兩層看：

* **產品本身的常規資質**（ICP 備案、應用商店稽核等）照常辦理，與後端用什麼模型無關
* **大模型備案層面**，目前國內監管認可的是國產模型（各大雲平臺提供的資質），海外模型無法取得境內備案

另外，只要產品面向國內使用者，就必須自建內容安全稽核機制——這一條是底線，與模型選擇無關。

## 第一層：產品形態決定的常規資質

<CardGroup cols={2}>
  <Card title="網站類產品" icon="globe">
    需要 ICP 備案；如涉及經營性業務，還需辦理增值電信業務許可（如 ICP 許可證）。這些是網站上線的通用要求。
  </Card>

  <Card title="小程式 / App" icon="smartphone">
    按微信等平臺與各應用商店的類目要求填寫資質材料。AI 類目上架時，平臺通常會要求提供模型備案相關資訊。
  </Card>
</CardGroup>

這一層與「用哪家模型」基本無關，按平臺規則正常準備即可。

## 第二層：大模型備案的現狀

生成式 AI 服務相關的備案，目前國內監管認可的是**已完成備案的國產模型**，也就是各大雲平臺能夠提供備案資質的那些模型。海外模型（GPT、Claude、Gemini 等）無法取得境內備案。

也就是說：如果上架流程要求填寫模型備案資訊，海外模型本身給不出這個資質。

具體的備案辦理流程可以參考 [智慧體小程式演算法備案](/zh-Hant/faq/agent-miniapp-algorithm-filing)。

## 行業常見做法與風險

實際操作中，不少國內產品仍在使用海外大模型。常見的做法是：

* 上架、備案時選用**已備案的國產模型資質**提交材料
* 後端實際呼叫的模型不對外暴露，前臺只呈現產品化的功能名稱（別名）
* 使用者看到的是「某某助手」「某某修圖」這類產品功能名，而不是底層模型名

<Warning>
  **風險提示**：上述做法屬於灰色地帶——填報資質與實際呼叫不一致，存在被平臺或監管認定為違規的風險。我們在此僅客觀陳述行業現象，不構成任何建議；相關風險由產品方自行承擔。對重要產品，建議諮詢專業法律意見後再做決策。
</Warning>

## 內容安全是底線

無論後端用什麼模型，面向國內使用者的產品都需要**自建內容安全稽核機制**：

* **輸入側**：攔截敏感資訊、違規訴求，避免其進入模型
* **輸出側**：對生成結果做稽核，防止違規內容觸達使用者

大模型自帶的安全機制不能替代業務合規——模型側的攔截標準與國內監管要求並不一致。業務平臺在自己這一層再接入內容安全稽核，才是更穩妥的合規姿勢。

<Tip>
  各大雲廠商都提供成熟的內容安全稽核服務（文本稽核、影像稽核等 API），接入成本不高，建議在產品設計階段就納入。
</Tip>

內容合規的更多說明見 [內容安全政策](/zh-Hant/faq/content-safety)。

## 常見問題

<AccordionGroup>
  <Accordion title="通過 API易 中轉呼叫，備案主體是誰？">
    備案主體是**面向使用者提供服務的產品運營方**，也就是你。API易 提供的是 API 技術通道，不能替代產品自身的資質與備案義務。
  </Accordion>

  <Accordion title="演算法備案和生成式 AI 服務備案是一回事嗎？">
    不是。演算法備案針對的是推薦、生成合成等演算法服務本身，由服務提供方（產品方）辦理；生成式 AI 服務備案（俗稱大模型備案）針對的是大模型服務，通常由模型廠商完成。產品方常見的義務是前者，辦理流程見 [智慧體小程式演算法備案](/zh-Hant/faq/agent-miniapp-algorithm-filing)。
  </Accordion>

  <Accordion title="產品只面向海外使用者，還需要這些嗎?">
    如果產品不面向境內使用者提供服務，一般不涉及上述境內備案要求，可以直接使用海外模型。但仍需遵守目標市場當地的法律法規（如歐盟的資料保護要求等）。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="智慧體小程式演算法備案" icon="file-check" href="/zh-Hant/faq/agent-miniapp-algorithm-filing">
    演算法備案的一般流程與辦理經驗。
  </Card>

  <Card title="內容安全政策" icon="shield-check" href="/zh-Hant/faq/content-safety">
    呼叫大模型時涉及的內容合規說明。
  </Card>

  <Card title="資料安全保障" icon="shield" href="/zh-Hant/faq/data-security">
    資料加密傳輸與最小化儲存機制。
  </Card>

  <Card title="伺服器與線路說明" icon="server" href="/zh-Hant/faq/server-location">
    API易 的伺服器位置與網路線路。
  </Card>
</CardGroup>

<Note>
  本文為經驗分享，不構成法律意見。相關政策仍在演進中，請以監管部門與各平臺的最新要求為準。
</Note>
