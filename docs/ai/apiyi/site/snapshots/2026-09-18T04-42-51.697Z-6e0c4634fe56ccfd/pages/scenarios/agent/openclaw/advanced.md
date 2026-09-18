> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 进阶功能与故障排除

> OpenClaw 故障排除、自定义技能、记忆功能、多设备同步与安全提示

## 故障排除

<AccordionGroup>
  <Accordion title="Telegram 连不上">
    国内访问 Telegram 需要代理。设置终端代理后重启 Gateway：

    ```bash theme={null}
    export https_proxy=http://127.0.0.1:代理端口
    export http_proxy=http://127.0.0.1:代理端口
    openclaw gateway restart
    ```

    或直接使用 Web UI（不需要代理）。
  </Accordion>

  <Accordion title="配置文件格式错误">
    运行诊断命令自动修复：

    ```bash theme={null}
    openclaw doctor --fix
    ```
  </Accordion>

  <Accordion title="API 连接失败">
    1. 检查 API 密钥是否正确
    2. 确认 `baseUrl` 设置为 `https://api.apiyi.com/v1`
    3. 测试连通性：

    ```bash theme={null}
    curl -H "Authorization: Bearer 你的密钥" \
         https://api.apiyi.com/v1/models
    ```
  </Accordion>

  <Accordion title="如何查看运行日志">
    ```bash theme={null}
    openclaw logs --follow
    ```
  </Accordion>

  <Accordion title="如何更新 OpenClaw">
    ```bash theme={null}
    openclaw update
    ```
  </Accordion>

  <Accordion title="如何添加新的聊天渠道">
    ```bash theme={null}
    openclaw channels add --channel telegram
    ```
  </Accordion>
</AccordionGroup>

## 自定义技能

OpenClaw 支持自定义技能，可以在 `~/.openclaw/workspace/skills/` 目录下创建。

## 记忆功能

OpenClaw 会记住你的对话和偏好，可以用 `/memory` 查看和管理记忆。

## 多设备同步

可以在多台设备上运行 OpenClaw，通过 Tailscale 等工具实现远程访问。

## 安全提示

<Warning>
  * **API 密钥安全**：不要把配置文件分享给他人
  * **权限控制**：OpenClaw 可以执行终端命令，注意不要让它执行危险操作
  * **网络安全**：默认只监听本地地址，如需远程访问请配置好安全措施
</Warning>

## 相关资源

<CardGroup cols={2}>
  <Card title="API易控制台" icon="settings" href="https://api.apiyi.com">
    管理 API 密钥和查看使用量
  </Card>

  <Card title="模型推荐" icon="chart-bar" href="/api-capabilities/model-info">
    查看场景化模型推荐
  </Card>
</CardGroup>
