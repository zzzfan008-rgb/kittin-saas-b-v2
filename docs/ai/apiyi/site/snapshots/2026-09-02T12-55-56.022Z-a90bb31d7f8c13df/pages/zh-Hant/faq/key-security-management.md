> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何安全地管理 API Key？

> 從令牌權限設定到日常使用習慣，系統說明 API Key 的安全管理方法，包括 IP 白名單、模型白名單、額度限制和防洩漏排查

## 簡短回答

一個 KEY 的最大可用額度就是你的**賬戶餘額**——這意味著任何一個 KEY 洩漏，損失上限都是賬戶裡的全部餘額。

安全管理 KEY 的核心是四件事：**按用途分開發放、給每個 KEY 加上權限邊界、控制單個 KEY 的額度上限、不讓 KEY 出現在任何可能被別人看到的地方。**

<Warning>
  **最容易被忽略的一條**：給 KEY 開啟「無限額度」等於把賬戶餘額的全部風險敞口交給了這一個 KEY。測試用的 KEY 尤其要設額度上限。
</Warning>

## 一、給令牌加上權限邊界

建立令牌時勾選\*\*「啟用進階選項」\*\*，可以看到 IP 白名單和可用模型兩項設定。

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/FBHa7JBOo1YFoQia/images/token-security-advanced-options.png?fit=max&auto=format&n=FBHa7JBOo1YFoQia&q=85&s=7c84c17523049b5806fea2ebcff96ea8" alt="建立令牌的進階選項：可用模型與 IP 白名單" width="1246" height="1192" data-path="images/token-security-advanced-options.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/FBHa7JBOo1YFoQia/images/token-security-advanced-options.png?fit=max&auto=format&n=FBHa7JBOo1YFoQia&q=85&s=7c84c17523049b5806fea2ebcff96ea8" alt="建立令牌的進階選項：可用模型與 IP 白名單" width="1246" height="1192" data-path="images/token-security-advanced-options.png" />

### IP 白名單（推薦用於生產環境）

這是**防護效果最強的一項**。設定後，只有來自指定 IP 的請求才能使用該令牌，KEY 即使洩漏，別人在其它機器上也用不了。

| 填寫格式    | 示例               |
| ------- | ---------------- |
| 單個 IP   | `192.168.1.1`    |
| CIDR 網段 | `192.168.1.0/24` |
| 多個地址    | 可一併填寫多條          |

<Tip>
  生產環境的伺服器 IP 通常是固定的，非常適合開啟 IP 白名單。填寫你的**伺服器公網出口 IP**，不是內網 IP。
</Tip>

<Warning>
  **動態 IP 環境不要開**。家用寬頻、辦公網路的出口 IP 會變化，開啟後 IP 一變就會全部呼叫失敗。這類場景請改用額度限制來控制風險。
</Warning>

### 可用模型白名單（用於專用令牌）

「可用模型」**留空表示不限制**，可以呼叫全站模型；一旦填寫，該令牌就**只能**用你指定的這幾個模型。

這是一把雙刃劍：

<CardGroup cols={2}>
  <Card title="適合的場景" icon="circle-check">
    專款專用的令牌。比如只跑影像生成的服務、分享給外部協作方的令牌、按模型做預算隔離。
  </Card>

  <Card title="不適合的場景" icon="circle-x">
    日常自用和探索性測試。設定後換模型就要回控制台改配置，還容易因模型別名對不上而呼叫失敗。
  </Card>
</CardGroup>

<Note>
  一般情況下**不建議設定**可用模型。詳細的取捨分析見 [令牌需要設定可用模型嗎？](/zh-Hant/faq/token-model-whitelist)
</Note>

## 二、給令牌設定額度上限

這是**所有人都應該做**的一項，尤其是測試用的令牌。

建立令牌時關閉「無限額度」開關，在「授權額度」裡填一個數字，也可以直接點下方的快捷選項（\$5 / \$20 / \$50 / \$100 / \$200 / \$500）。

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/FBHa7JBOo1YFoQia/images/token-security-quota.png?fit=max&auto=format&n=FBHa7JBOo1YFoQia&q=85&s=2b37947ea48dc8503723b6fef3e67171" alt="令牌授權額度設定：關閉無限額度並指定金額" width="1256" height="1024" data-path="images/token-security-quota.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/FBHa7JBOo1YFoQia/images/token-security-quota.png?fit=max&auto=format&n=FBHa7JBOo1YFoQia&q=85&s=2b37947ea48dc8503723b6fef3e67171" alt="令牌授權額度設定：關閉無限額度並指定金額" width="1256" height="1024" data-path="images/token-security-quota.png" />

額度的意義在於**把損失鎖死在一個可承受的數字上**：

* 設了 \$20 額度的 KEY 洩漏，最多損失 \$20
* 開著「無限額度」的 KEY 洩漏，損失上限是你的**全部賬戶餘額**

<Info>
  令牌的最大可用額度**受限於賬戶餘額**。給令牌設定 \$500 額度並不會預扣或凍結這筆錢，它只是這個令牌的消耗上限；實際能花多少仍取決於賬戶裡還有多少餘額。
</Info>

## 三、生產與測試環境的 KEY 分開管理

不要用同一個 KEY 同時跑線上業務和本地測試。分開之後，測試環境出問題時可以直接停用對應令牌，不影響線上。

|            | 生產環境 KEY        | 測試環境 KEY              |
| ---------- | --------------- | --------------------- |
| **IP 白名單** | 建議開啟（伺服器 IP 固定） | 一般不開（IP 會變）           |
| **授權額度**   | 按業務量預估，留出餘量     | **必須設定**，建議 \$5\~\$50 |
| **可用模型**   | 按需，穩定業務可鎖定      | 留空，方便切換模型             |
| **有效期**    | 可設永不過期          | 建議設定過期時間              |
| **數量**     | 按專案/服務拆分        | 按測試任務拆分，用完即停用         |

<Tip>
  在控制台給令牌起**有辨識度的名字**（如 `prod-影像服務`、`test-模型對比-0729`），比預設名稱更容易在出問題時快速定位和停用。相關操作見 [令牌與分組](/zh-Hant/faq/token-and-groups)。
</Tip>

## 四、不要讓 KEY 出現在這些地方

### 程式碼倉庫

這是最常見的洩漏渠道。KEY 一旦提交進 Git，**即使後來刪掉檔案，它仍然留在提交歷史裡**，任何能訪問倉庫的人都能翻出來。

正確做法是從環境變數讀取：

```python theme={null}
import os

api_key = os.environ["APIYI_API_KEY"]   # 正確
api_key = "sk-your-api-key"             # 錯誤：真 KEY 寫死在程式碼裡
```

把 `.env` 加進 `.gitignore`，並且**在提交前掃一遍**。可以用這條命令自查：

```bash theme={null}
grep -rnE '(^|[^A-Za-z0-9])sk-[A-Za-z0-9]{10,}' .
```

<Note>
  命令裡 `(^|[^A-Za-z0-9])` 這段是必要的。少了它，`task-`、`risk-`、`disk-` 這類單詞內部的 `sk-` 會產生大量誤報，淹沒真正的問題。
</Note>

### 對外文件、截圖、日誌

釋出對外文件或技術分享前，檢查一遍正文、程式碼示例和**截圖**。控制台截圖、終端錄屏、報錯日誌裡都可能帶著完整的 KEY。示例統一寫成 `sk-your-api-key` 這類佔位符。

<Warning>
  **公開的 GitHub 倉庫尤其危險**。公開倉庫會被自動化程式持續掃描，洩漏的 KEY 往往在幾分鐘內就被利用。釋出開源專案前務必確認程式碼和歷史提交裡都沒有真實 KEY。
</Warning>

### 與 AI / AI Agent 的對話

這是近兩年新增的一條風險路徑，也是最容易被低估的一條。

把 KEY 直接貼上進對話方塊看起來是"臨時"的，但實際上：

<CardGroup cols={2}>
  <Card title="會話記錄會落盤" icon="hard-drive">
    AI 編碼工具通常把完整對話以明文儲存在本機檔案裡，長期留存，不會自動清理。
  </Card>

  <Card title="恢復會話會重傳" icon="repeat">
    恢復歷史會話時，整段記錄會作為上下文重新發送一次，KEY 並非靜止不動。
  </Card>

  <Card title="檔案快照也有副本" icon="copy">
    工具在改動檔案前後往往會存快照，含 KEY 的指令碼會因此多出若干份複製。
  </Card>

  <Card title="本機程序都能讀" icon="folder-open">
    這些檔案對**任何以你的身份執行的程式**都可讀，防護面比程式碼倉庫還弱。
  </Card>
</CardGroup>

<Tip>
  **給 AI 和 Agent 用的 KEY，一律用臨時 KEY**：單獨建立、設一個小額度（如 \$5）、設定較短的有效期，任務結束後立刻在控制台刪除。絕不要把生產 KEY 交給 AI 工具。
</Tip>

## KEY 已經洩漏了怎麼辦

<Steps>
  <Step title="立刻刪除或停用該令牌">
    進入 [令牌頁面](https://api.apiyi.com/token)，找到對應令牌直接刪除或停用。這是唯一能立即止損的動作，**優先於任何排查工作**。
  </Step>

  <Step title="建立新令牌替換">
    重新建立令牌，這次按上文加上額度上限和必要的權限邊界，再更新到你的應用配置裡。
  </Step>

  <Step title="查呼叫日誌確認影響">
    在 [呼叫日誌](/zh-Hant/faq/call-logs) 裡核對洩漏期間是否有異常呼叫——陌生的模型、異常的呼叫量、不該出現的時間段。
  </Step>

  <Step title="清理洩漏源">
    找到 KEY 到底洩漏在哪裡（程式碼、文件、截圖、對話記錄），逐一清理乾淨，否則換了新 KEY 還會再洩一次。
  </Step>
</Steps>

## 常見問題

<AccordionGroup>
  <Accordion title="設定了 IP 白名單，呼叫全部失敗怎麼辦？">
    多半是填錯了 IP。要填的是伺服器的**公網出口 IP**，不是 `192.168.x.x` 這類內網地址。

    如果你在家用寬頻或辦公網路下呼叫，出口 IP 會隨運營商變動，這類環境不適合開 IP 白名單，建議改用額度限制來控制風險。

    臨時排查時可以先把 IP 白名單清空，確認呼叫恢復正常後再逐步補回正確的 IP。
  </Accordion>

  <Accordion title="給令牌設定額度會預先扣錢或凍結餘額嗎？">
    不會。授權額度只是這個令牌的**消耗上限**，不是預付或凍結。

    你可以給 5 個令牌各設 \$100 額度，而賬戶裡只有 \$50——它們共享這 \$50，誰先花完就都用不了了。令牌的最大可用額度始終受限於賬戶餘額。
  </Accordion>

  <Accordion title="一個賬戶可以建立多少個令牌？">
    沒有數量限制，按需建立即可。

    建議按**專案 + 環境**的維度拆分，例如 `prod-客服機器人`、`prod-影像服務`、`test-模型評測`。拆得細一點的好處是：出問題時可以精準停用某一個，不影響其它業務；每個令牌的消耗和日誌也能獨立檢視。
  </Accordion>

  <Accordion title="令牌額度用完了，是不是就廢了？">
    不是。額度用完後呼叫會被拒絕，但令牌本身還在，在控制台**編輯令牌、調高授權額度**即可繼續使用，不需要重新建立和更換配置。

    這也是設額度上限的好處之一：它是一道可恢復的剎車，而不是一次性的銷燬。
  </Accordion>

  <Accordion title="怎麼判斷某個 KEY 是不是正在被別人使用？">
    看呼叫日誌。重點關注三個訊號：**你沒用過的模型**、**不在你工作時間段的呼叫**、**與業務量明顯不符的請求數**。

    詳細的排查方法見 [如何排查 KEY 的異常消耗？](/zh-Hant/faq/troubleshoot-key-usage)
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="令牌與分組" icon="key" href="/zh-Hant/faq/token-and-groups">
    令牌的建立、編輯與分組設定的完整說明。
  </Card>

  <Card title="令牌模型白名單" icon="list" href="/zh-Hant/faq/token-model-whitelist">
    可用模型該不該設，以及設定後的注意事項。
  </Card>

  <Card title="排查 KEY 異常消耗" icon="search" href="/zh-Hant/faq/troubleshoot-key-usage">
    通過日誌鎖定真實呼叫方與異常來源。
  </Card>

  <Card title="平臺數據安全" icon="shield" href="/zh-Hant/faq/data-security">
    API易 平臺側的加密傳輸與資料保護機制。
  </Card>
</CardGroup>

<Info>
  安全無小事。以上設定都在 [令牌管理頁面](https://api.apiyi.com/token) 完成，花幾分鐘配置好，能擋掉絕大多數風險。
</Info>
