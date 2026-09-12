> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Codex 接入配置方法升级

> Codex 接入文档改用 experimental_bearer_token 写法：Key 直接写进 config.toml 供应商块，桌面客户端、IDE 插件、CLI 三端一份配置即生效，解决 Missing environment variable 报错，排障章节同步收录自查修法。

**2026/7/13 22:50 (UTC+8)** · 文档更新 · OpenAI

📚 **Codex 接入配置方法升级：一行 `experimental_bearer_token`，三端通用更稳更简单**

旧写法在供应商块用 `env_key = "OPENAI_API_KEY"`——它只读启动进程的环境变量、不读 `auth.json`，桌面客户端 / IDE 插件从 Dock 启动时读不到终端里 export 的变量，容易报 `Missing environment variable: OPENAI_API_KEY`。文档已改为在 `config.toml` 供应商块直接写 `experimental_bearer_token = "sk-..."`，桌面客户端 / IDE 插件 / CLI 三端一份配置即生效；该报错的成因与修法已收录进排障章节第 1 条，详见 [Codex 接入指南](/scenarios/programming/codex-cli)。

已按旧文档配置的用户按新写法迁移即可，一次改好、三端长期省心。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
