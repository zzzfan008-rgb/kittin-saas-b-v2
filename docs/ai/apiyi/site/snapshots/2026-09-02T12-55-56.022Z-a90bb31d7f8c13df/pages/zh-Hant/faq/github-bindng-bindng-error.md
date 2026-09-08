> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GitHub 登入提示「該賬戶已繫結」怎麼辦？

> 解決使用 GitHub 一鍵登入 API易 時提示「該 GitHub 賬戶已繫結」的問題

## 簡短回答

您需要在**同一個瀏覽器**中先登入 `github.com`，然後再到 API易 網站使用 GitHub 一鍵登入。**務必使用 Chrome 瀏覽器**操作。

## 問題現象

使用 GitHub 賬號登入 API易 時，頁面提示：

> 該 GitHub 賬戶已繫結

導致無法正常登入。

## 解決步驟

<Steps>
  <Step title="開啟 Chrome 瀏覽器">
    請務必使用 **Chrome 瀏覽器**進行操作，避免使用其他瀏覽器（如 Safari、Firefox 等），以確保登入流程正常。
  </Step>

  <Step title="登入 GitHub">
    在 Chrome 瀏覽器中開啟 `github.com`，確認您已登入到正確的 GitHub 賬號。

    如果之前登入了其他 GitHub 賬號，請先退出，再登入您繫結 API易 的那個賬號。
  </Step>

  <Step title="登入 API易">
    在**同一個 Chrome 瀏覽器**中，開啟 API易 網站，點選「GitHub 一鍵登入」按鈕完成登入。

    <Warning>
      必須在同一個瀏覽器中完成以上兩步操作，不能在不同瀏覽器中分別登入。
    </Warning>
  </Step>
</Steps>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼必須用 Chrome 瀏覽器？">
    Chrome 瀏覽器對 GitHub OAuth 登入流程的相容性最好，其他瀏覽器可能會出現 Cookie 或會話同步問題，導致登入異常。
  </Accordion>

  <Accordion title="我用了 Chrome 但還是不行怎麼辦？">
    請嘗試以下操作：

    * 清除 Chrome 瀏覽器的快取和 Cookie
    * 確認 Chrome 沒有使用無痕模式
    * 檢查是否有瀏覽器外掛阻止了第三方 Cookie
    * 退出 GitHub 後重新登入，再嘗試一鍵登入 API易
  </Accordion>

  <Accordion title="我想換一個 GitHub 賬號繫結怎麼辦？">
    如需更換繫結的 GitHub 賬號，請聯絡客服協助處理。
  </Accordion>
</AccordionGroup>

## 聯絡我們

<Card title="聯絡客服" icon="message-circle">
  如果按照上述步驟操作後仍無法解決，請聯絡客服獲取幫助。
</Card>
