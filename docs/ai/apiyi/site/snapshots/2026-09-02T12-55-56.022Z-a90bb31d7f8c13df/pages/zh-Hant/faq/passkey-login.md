> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何使用 Passkey 登入？

> API易 已支援 Passkey（通行金鑰）登入：在個人中心一鍵繫結，之後用指紋、面容或裝置鎖屏密碼即可登入，無需記密碼，也不怕釣魚和撞庫。

## 簡短回答

API易 新增了 **Passkey（通行金鑰）** 登入方式。繫結後，在常用電腦上登入只需**指紋 / 面容 / 裝置鎖屏密碼**驗證一下，不用再輸入賬號密碼。

繫結入口：登入後進入 **個人中心 → 頁面底部「賬戶選項」→ 繫結 Passkey**，地址是 `https://api.apiyi.com/account/profile`。

<Info>
  **為什麼值得綁**：不用再記密碼（忘記密碼是最常見的登入求助），且 Passkey 天生防釣魚、防撞庫——私鑰只留在你的裝置或密碼管理器裡，伺服器上沒有可被盜取的密碼。
</Info>

## 什麼是 Passkey

Passkey 是基於 WebAuthn / FIDO2 標準的無密碼登入方式。繫結時裝置會生成一對金鑰：

* **私鑰**儲存在你的裝置安全晶片或密碼管理器裡，**永不上傳**；
* **公鑰**儲存在 API易 伺服器上，只能用於校驗，無法反推出私鑰。

登入時由裝置用私鑰完成一次簽名，你只需通過**指紋、面容或鎖屏密碼**授權本次簽名即可。

<CardGroup cols={3}>
  <Card title="不怕忘密碼" icon="face-slightly-smiling">
    有指紋裝置就能一鍵登入，不必再走郵箱重置流程
  </Card>

  <Card title="天生防釣魚" icon="shield">
    Passkey 與域名繫結，仿冒站點即使長得一模一樣也無法觸發驗證
  </Card>

  <Card title="不怕撞庫" icon="database">
    伺服器上沒有可被拖走的密碼，其他站點洩露也波及不到這裡
  </Card>
</CardGroup>

## 如何繫結

<Warning>
  **前提**：繫結操作必須在**已登入狀態**下進行。也就是說，Passkey 是給已有賬號增加一種登入方式，不能用來直接註冊新賬號。
</Warning>

<Steps>
  <Step title="進入個人中心">
    登入後開啟 `https://api.apiyi.com/account/profile`，或從左側導航點選\*\*「個人中心」\*\*。
  </Step>

  <Step title="滑到頁面底部，找到「賬戶選項」">
    在頁面最下方的\*\*「賬戶選項」\*\*卡片裡，點選 **「繫結 Passkey」** 按鈕。

    <img className="block dark:hidden" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-bind-entry.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=da1fed1a77375353d8c18757f1c97bb6" alt="個人中心底部的賬戶選項與繫結 Passkey 按鈕" width="1100" height="818" data-path="images/passkey-bind-entry.png" />

    <img className="hidden dark:block" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-bind-entry.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=da1fed1a77375353d8c18757f1c97bb6" alt="個人中心底部的賬戶選項與繫結 Passkey 按鈕" width="1100" height="818" data-path="images/passkey-bind-entry.png" />
  </Step>

  <Step title="在彈窗裡選擇儲存位置">
    瀏覽器會彈出系統對話方塊，詢問「選擇儲存 apiyi.com 通行金鑰的位置」。根據你的裝置和習慣選擇一種：

    <img className="block dark:hidden" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-save-location.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=e072625a14951e7bd893eac489745d79" alt="選擇儲存通行金鑰的位置" width="896" height="1010" data-path="images/passkey-save-location.png" />

    <img className="hidden dark:block" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-save-location.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=e072625a14951e7bd893eac489745d79" alt="選擇儲存通行金鑰的位置" width="896" height="1010" data-path="images/passkey-save-location.png" />

    | 儲存位置          | 適合誰                     | 特點                 |
    | ------------- | ----------------------- | ------------------ |
    | iCloud 鑰匙串    | Mac / iPhone / iPad 使用者 | 在自己的 Apple 裝置間自動同步 |
    | Google 密碼管理工具 | Chrome / Android 使用者    | 跨裝置同步，換電腦也能用       |
    | 手機、平板或安全金鑰    | 想在別人的電腦上臨時登入            | 電腦端掃碼，用手機完成驗證      |
    | 本機瀏覽器配置檔案     | 固定使用的常用電腦               | 只存在這臺機器上，不同步       |
  </Step>

  <Step title="完成驗證，繫結成功">
    按提示用**指紋、面容或鎖屏密碼**確認，即繫結完成。之後在登入頁選擇 Passkey 登入，驗證一下就能進入。
  </Step>
</Steps>

## 如何檢視與解綁

繫結後再回到**個人中心 → 賬戶選項**，按鈕會變成 **「解綁 Passkey」**，並在旁邊顯示**最後使用時間**——可以用它確認自己的 Passkey 是否被使用過、什麼時候用的。

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-unbind-status.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=8837d8cccc7975fc3cf6c1443975753a" alt="已繫結狀態下顯示解綁 Passkey 與最後使用時間" width="1642" height="300" data-path="images/passkey-unbind-status.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-unbind-status.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=8837d8cccc7975fc3cf6c1443975753a" alt="已繫結狀態下顯示解綁 Passkey 與最後使用時間" width="1642" height="300" data-path="images/passkey-unbind-status.png" />

需要解綁時點選 **「解綁 Passkey」** 即可。解綁後賬號回到原有的登入方式，不影響餘額、令牌和呼叫記錄。

<Tip>
  **建議換裝置前先解綁或補綁**：如果 Passkey 只儲存在某臺機器的瀏覽器配置檔案裡（不同步），換電腦或重灌系統後這把鑰匙就沒了。用 iCloud 鑰匙串或 Google 密碼管理工具儲存則不受影響。
</Tip>

## 注意事項

<Warning>
  **務必保留一種備用登入方式**。Passkey 是新增的登入方式，不是替代品——請確保你的密碼仍然可用、註冊郵箱仍能收信，或已繫結 GitHub 登入。裝置丟失且沒有備用方式時，找回流程會麻煩得多。
</Warning>

* **不要在公用電腦上繫結**：Passkey 存在裝置上，公用或他人電腦繫結後等於把登入能力留在了那臺機器。臨時登入請用「手機、平板電腦或安全金鑰」方式，掃碼後在自己手機上驗證。
* **認準域名再驗證**：正常繫結和登入時，彈窗裡顯示的域名應為 `apiyi.com`。域名不對就不要繼續——這也正是 Passkey 防釣魚的機制所在。
* **同步範圍看儲存位置**：iCloud 鑰匙串在 Apple 裝置間同步，Google 密碼管理工具跨裝置同步，瀏覽器本地配置檔案則不同步。選哪種取決於你是否需要在多臺裝置上登入。
* **Passkey 與 API Key 是兩回事**：Passkey 只用於登入網站後臺，不影響 API 呼叫；API 呼叫的金鑰安全另見 [如何安全地管理 API Key](/zh-Hant/faq/key-security-management)。
* **瀏覽器要求**：需要較新版本的 Chrome、Edge、Safari 或 Firefox，且裝置支援指紋 / 面容 / 鎖屏密碼驗證。老舊瀏覽器可能不顯示繫結入口。

## 常見問題

<AccordionGroup>
  <Accordion title="繫結 Passkey 後還能用密碼登入嗎？">
    可以。Passkey 是**增加**一種登入方式，原有的密碼登入、GitHub 登入都照常可用。建議至少保留一種備用方式。
  </Accordion>

  <Accordion title="換了電腦，Passkey 還能用嗎？">
    取決於繫結時選的儲存位置：存在 **iCloud 鑰匙串**或 **Google 密碼管理工具**裡的會跨裝置同步，新電腦登入同一賬戶後即可使用；只存在**本機瀏覽器配置檔案**裡的則不會同步，需要在新裝置上重新繫結。
  </Accordion>

  <Accordion title="手機丟了 / 裝置壞了怎麼辦？">
    用備用方式登入（密碼或 GitHub），進入個人中心解綁舊的 Passkey，再在新裝置上重新繫結。這也是我們強調要保留備用登入方式的原因。
  </Accordion>

  <Accordion title="可以繫結多個裝置嗎？">
    如果儲存在 iCloud 鑰匙串或 Google 密碼管理工具中，同一把 Passkey 會自動同步到你的其他裝置，通常無需重複繫結。若需要在互不同步的體系間使用（例如既有 Mac 又有 Android），可在解綁後於另一體系重新繫結，或用「手機、平板電腦或安全金鑰」的掃碼方式臨時登入。
  </Accordion>

  <Accordion title="Passkey 會洩露我的指紋資訊嗎？">
    不會。指紋和麵容資料**只在你的裝置本地校驗**，從不上傳給網站。API易 伺服器上儲存的只是一段無法反推私鑰的公鑰。
  </Accordion>

  <Accordion title="點了繫結卻沒有彈窗？">
    常見原因：瀏覽器版本過舊、裝置未設定鎖屏密碼或生物識別、瀏覽器停用了相關權限、或使用了不支援 WebAuthn 的內嵌瀏覽器（如部分 App 內建瀏覽器）。請換用最新版 Chrome / Edge / Safari 並在系統裡開啟鎖屏驗證後重試。
  </Accordion>
</AccordionGroup>

## 相關文件

* [忘記密碼了怎麼辦？](/zh-Hant/faq/forgot-password)
* [GitHub 登入提示「該賬戶已繫結」怎麼辦？](/zh-Hant/faq/github-bindng-bindng-error)
* [如何安全地管理 API Key？](/zh-Hant/faq/key-security-management)
* [API易 支援哪些郵箱註冊？](/zh-Hant/faq/email-registration)
* [API易 如何保障資料安全？](/zh-Hant/faq/data-security)
