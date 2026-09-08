> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 進階功能與故障排除

> OpenClaw 故障排除、自定義技能、記憶功能、多裝置同步與安全提示

## 故障排除

<AccordionGroup>
  <Accordion title="Telegram 連不上">
    國內訪問 Telegram 需要代理。設定終端代理後重啟 Gateway：

    ```bash theme={null}
    export https_proxy=http://127.0.0.1:代理埠
    export http_proxy=http://127.0.0.1:代理埠
    openclaw gateway restart
    ```

    或直接使用 Web UI（不需要代理）。
  </Accordion>

  <Accordion title="配置檔案格式錯誤">
    執行診斷命令自動修復：

    ```bash theme={null}
    openclaw doctor --fix
    ```
  </Accordion>

  <Accordion title="API 連線失敗">
    1. 檢查 API 金鑰是否正確
    2. 確認 `baseUrl` 設定為 `https://api.apiyi.com/v1`
    3. 測試連通性：

    ```bash theme={null}
    curl -H "Authorization: Bearer 你的金鑰" \
         https://api.apiyi.com/v1/models
    ```
  </Accordion>

  <Accordion title="如何檢視執行日誌">
    ```bash theme={null}
    openclaw logs --follow
    ```
  </Accordion>

  <Accordion title="如何更新 OpenClaw">
    ```bash theme={null}
    openclaw update
    ```
  </Accordion>

  <Accordion title="如何新增新的聊天渠道">
    ```bash theme={null}
    openclaw channels add --channel telegram
    ```
  </Accordion>
</AccordionGroup>

## 自定義技能

OpenClaw 支援自定義技能，可以在 `~/.openclaw/workspace/skills/` 目錄下建立。

## 記憶功能

OpenClaw 會記住你的對話和偏好，可以用 `/memory` 檢視和管理記憶。

## 多裝置同步

可以在多臺裝置上執行 OpenClaw，通過 Tailscale 等工具實現遠端訪問。

## 安全提示

<Warning>
  * **API 金鑰安全**：不要把配置檔案分享給他人
  * **權限控制**：OpenClaw 可以執行終端命令，注意不要讓它執行危險操作
  * **網路安全**：預設只監聽本地地址，如需遠端訪問請配置好安全措施
</Warning>

## 相關資源

<CardGroup cols={2}>
  <Card title="API易控制台" icon="settings" href="https://api.apiyi.com">
    管理 API 金鑰和檢視使用量
  </Card>

  <Card title="模型推薦" icon="chart-bar" href="/zh-Hant/api-capabilities/model-info">
    檢視場景化模型推薦
  </Card>
</CardGroup>
