> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Paper2Any 论文多模态工作流

> 社区开源的论文转换工具，支持将学术论文一键转换为模型架构图、技术路线图、PPT演示文稿、Rebuttal等多种格式，通过 API易 调用 GPT、Claude 等大模型。

## 概述

Paper2Any 是一个开源的论文多模态工作流平台，专注于学术论文的格式转换与可视化。支持从论文 PDF/截图/文本出发，一键生成模型架构图、技术路线图、实验图表、PPT 演示文稿等多种输出格式。

<Info>
  **项目信息**

  * 🔗 开源地址：`github.com/OpenDCAI/Paper2Any`
  * 📜 许可证：开源
  * 👤 组织：OpenDCAI
  * ⭐ 该项目由社区贡献，支持通过 API易 调用多种大模型
</Info>

## 为什么选择 Paper2Any

<CardGroup cols={2}>
  <Card title="多种输出格式" icon="layers">
    支持论文转架构图、路线图、PPT、Rebuttal 等，一个工具覆盖科研全流程
  </Card>

  <Card title="灵活模型选择" icon="sliders-horizontal">
    支持动态切换 GPT-4o、Claude Sonnet、Qwen-VL 等模型，无需硬编码，通过 API 参数即可指定
  </Card>

  <Card title="CLI + Web 双模式" icon="terminal">
    提供命令行脚本和 Web 界面两种使用方式，适合不同场景需求
  </Card>

  <Card title="OpenAI 兼容接口" icon="plug">
    原生支持 OpenAI 兼容 API 格式，只需配置 API易 的 Base URL 即可接入 400+ 模型
  </Card>
</CardGroup>

## 核心功能模块

| 功能模块               | 说明                         | 输出格式                         |
| ------------------ | -------------------------- | ---------------------------- |
| **Paper2Figure**   | 论文生成科研可视化图                 | 模型架构图、技术路线图（PPTX + SVG）、实验图表 |
| **Paper2Diagram**  | 论文/文本/图片生成流程图              | draw\.io / PNG / SVG         |
| **Paper2PPT**      | 论文转 PPT 演示文稿               | PPTX（支持 40+ 页长文档）            |
| **Paper2Rebuttal** | 生成结构化审稿回复                  | 带证据引用的 Rebuttal 文档           |
| **PDF2PPT**        | PDF 保留排版转可编辑 PPT           | PPTX                         |
| **Image2PPT**      | 图片/截图转结构化幻灯片               | PPTX                         |
| **PPTPolish**      | AI 驱动的 PPT 排版优化            | PPTX                         |
| **知识库**            | 文件导入、语义搜索，驱动 PPT/播客/思维导图生成 | 多种格式                         |

## 通过 API易 接入大模型

Paper2Any 支持 OpenAI 兼容 API 格式，配置 API易 作为 LLM 服务端点后，即可使用 GPT、Claude、Gemini、DeepSeek 等 400+ 模型。

### Docker 部署配置

<Steps>
  <Step title="第一步：获取 API易 密钥">
    1. 访问 [API易控制台](https://api.apiyi.com) 注册/登录
    2. 进入【令牌】栏目
    3. 点击生成新的 API 密钥
    4. 复制密钥（以 `sk-` 开头）备用
  </Step>

  <Step title="第二步：克隆项目并配置后端环境变量">
    克隆仓库后，编辑 `fastapi_app/.env` 文件，配置 API易 作为 LLM 端点：

    ```bash theme={null}
    # fastapi_app/.env
    DEFAULT_LLM_API_URL=https://api.apiyi.com/v1
    BACKEND_API_KEY=sk-你的API易密钥
    ```

    可选：为不同工作流指定默认模型：

    ```bash theme={null}
    PAPER2PPT_DEFAULT_MODEL=gpt-4o
    PDF2PPT_DEFAULT_MODEL=gpt-4o
    ```
  </Step>

  <Step title="第三步：配置前端环境变量">
    编辑 `frontend-workflow/.env` 文件，让 Web 界面默认使用 API易：

    ```bash theme={null}
    # frontend-workflow/.env
    VITE_DEFAULT_LLM_API_URL=https://api.apiyi.com/v1
    VITE_LLM_API_URLS=https://api.apiyi.com/v1
    ```
  </Step>

  <Step title="第四步：启动服务">
    使用 Docker Compose 一键启动：

    ```bash theme={null}
    docker compose up -d --build
    ```

    启动完成后，访问前端页面即可开始使用。
  </Step>
</Steps>

### CLI 命令行使用

Paper2Any 提供独立的命令行脚本，支持通过 `--api-url` 和 `--api-key` 参数直接指定 API易：

```bash theme={null}
# 论文转 PPT
python script/run_paper2ppt_cli.py \
  --input paper.pdf \
  --api-url https://api.apiyi.com/v1 \
  --api-key sk-你的API易密钥 \
  --model gpt-4o

# 论文转科研图
python script/run_paper2figure_cli.py \
  --input paper.pdf \
  --api-url https://api.apiyi.com/v1 \
  --api-key sk-你的API易密钥 \
  --graph-type model_arch
```

<Tip>
  **模型推荐**：论文转 PPT 推荐使用 GPT-4o 或 Claude Sonnet 4.5，它们在长文档理解和结构化输出方面表现出色。图表生成任务也可尝试 Qwen-VL 等视觉模型。
</Tip>

## 部署方式

| 部署方式           | 说明                                        | 适合场景      |
| -------------- | ----------------------------------------- | --------- |
| **Docker（推荐）** | 一键启动前后端服务                                 | 快速体验、生产部署 |
| **Linux 原生**   | 需 Python 3.11+、LaTeX、Inkscape、LibreOffice | 开发调试、定制需求 |
| **Windows**    | 需 Python 3.12、Inkscape                    | 本地使用      |

<Warning>
  PDF2PPT 和 Image2PPT 等功能依赖 GPU，需要额外部署 SAM3 模型服务器。详见项目 README 的 GPU 部署说明。
</Warning>

## 常见问题

<AccordionGroup>
  <Accordion title="如何让 Paper2Any 使用 API易 的模型？">
    在环境变量中将 `DEFAULT_LLM_API_URL` 设置为 `https://api.apiyi.com/v1`，并将 `BACKEND_API_KEY` 设置为你的 API易 密钥即可。CLI 模式下使用 `--api-url` 和 `--api-key` 参数。
  </Accordion>

  <Accordion title="支持哪些大模型？">
    通过 API易 接入后，支持 400+ 模型，包括 GPT-4o、Claude Sonnet 4.5、Gemini、DeepSeek、Qwen 等。可在 Web 界面动态切换模型，无需修改代码。
  </Accordion>

  <Accordion title="Docker 启动失败怎么办？">
    请检查：

    1. Docker 和 Docker Compose 是否已正确安装
    2. `.env` 文件是否已正确配置
    3. 端口是否被占用
    4. 查看 `docker compose logs` 获取详细错误信息
  </Accordion>

  <Accordion title="生成 PPT 时报错或内容不完整？">
    * 确保 API易 账户余额充足
    * 长论文建议使用上下文窗口更大的模型（如 GPT-4o 128K）
    * 检查论文 PDF 是否为可搜索文本格式（扫描版 PDF 效果可能较差）
  </Accordion>

  <Accordion title="如何获取 API易 密钥？">
    访问 [API易控制台](https://api.apiyi.com/token)，注册账号后在【令牌】栏目生成新的密钥。新用户有免费测试额度。
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="API易 模型列表" icon="list" href="/api-capabilities/model-info">
    查看 API易 支持的 400+ 模型完整列表
  </Card>

  <Card title="Base URL 配置指南" icon="settings" href="/faq/base-url-config">
    了解如何在各类工具中配置 API易 Base URL
  </Card>

  <Card title="API易-令牌管理" icon="key" href="https://api.apiyi.com/token">
    管理 API 密钥、查看用量和余额
  </Card>

  <Card title="API易 价格页面" icon="banknote" href="https://api.apiyi.com/account/pricing">
    查看各模型定价和充值优惠
  </Card>
</CardGroup>
