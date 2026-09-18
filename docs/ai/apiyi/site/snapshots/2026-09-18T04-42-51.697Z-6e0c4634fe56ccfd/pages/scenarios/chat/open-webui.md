> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Open WebUI

> 功能丰富的自托管 AI 界面集成指南

Open WebUI 是一个功能丰富的自托管 AI 平台，支持完全离线运行。通过 API易，您可以在 Open WebUI 中集成各种主流大语言模型。

## 快速部署

### Docker 快速启动

```bash theme={null}
docker run -d -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

### Docker Compose 部署

```yaml theme={null}
version: '3.6'

services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "3000:8080"
    volumes:
      - open-webui:/app/backend/data
    environment:
      - OPENAI_API_BASE_URL=https://api.apiyi.com
      - OPENAI_API_KEY=您的API易密钥
    restart: unless-stopped

volumes:
  open-webui:
```

## 配置 API易

### 方法一：环境变量配置

在部署时设置环境变量：

```bash theme={null}
docker run -d -p 3000:8080 \
  -e OPENAI_API_BASE_URL=https://api.apiyi.com \
  -e OPENAI_API_KEY=您的API易密钥 \
  -v open-webui:/app/backend/data \
  --name open-webui \
  ghcr.io/open-webui/open-webui:main
```

### 方法二：界面配置

1. 访问 Open WebUI 管理界面
2. 进入 **Settings** > **Connections**
3. 在 **OpenAI API** 部分配置：
   * **API Base URL**: `https://api.apiyi.com/v1`
   * **API Key**: 输入您的 API易 密钥
4. 点击保存配置

<Info>
  **配置要点**

  * API Base URL 需要包含 `/v1` 后缀
  * API Key 可在 [API易控制台](https://api.apiyi.com) 获取
  * 建议使用环境变量方式，便于管理和更新
</Info>

## 支持的模型

Open WebUI 通过 API易 支持 400+ 主流 AI 模型。

<Card title="查看当下热门模型推荐" icon="star" href="/api-capabilities/model-info">
  查看最新的模型推荐、性能对比和场景化使用建议。涵盖文本创作、编程开发、快速响应、图像生成、视频生成等全场景。
</Card>

<Info>
  **为什么不在此列出具体模型？**

  AI 模型更新迭代速度非常快，为了确保您获取最准确的模型推荐信息，我们统一在 [模型推荐页面](/api-capabilities/model-info) 维护最新的模型列表、性能数据和使用建议。
</Info>

## 核心功能

### RAG (检索增强生成)

Open WebUI 支持文档上传和知识库功能：

1. **文档上传**
   * 支持 PDF、TXT、DOCX 等格式
   * 自动向量化存储
   * 支持多语言文档

2. **知识库管理**
   * 创建专项知识库
   * 文档分类和标签
   * 智能检索匹配

### OpenAI 兼容 API

Open WebUI 提供完整的 OpenAI 兼容 API：

```bash theme={null}
# 聊天完成
curl -X POST "http://localhost:3000/api/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 您的API易密钥" \
  -d '{
    "model": "gpt-4-turbo",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

### 工具集成

支持外部工具和插件：

* 网络搜索
* 代码执行
* 图像生成
* 文档处理

## 高级配置

### 多模型配置

在 `docker-compose.yml` 中配置多个模型源：

```yaml theme={null}
environment:
  - OPENAI_API_BASE_URL=https://api.apiyi.com
  - OPENAI_API_KEY=您的API易密钥
  - ENABLE_OPENAI_API=true
  - ENABLE_OLLAMA_API=false
```

### 用户权限管理

```yaml theme={null}
environment:
  - ENABLE_SIGNUP=false
  - DEFAULT_USER_ROLE=user
  - WEBHOOK_URL=您的webhook地址
```

### 数据持久化

```yaml theme={null}
volumes:
  - open-webui:/app/backend/data
  - ./uploads:/app/backend/data/uploads
  - ./vector_db:/app/backend/data/vector_db
```

## API 集成示例

### Python 集成

```python theme={null}
import requests

# Open WebUI API 端点
api_url = "http://localhost:3000/api/chat/completions"

# 请求配置
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer 您的API易密钥"
}

data = {
    "model": "gpt-4-turbo",
    "messages": [
        {"role": "user", "content": "解释量子计算的基本原理"}
    ],
    "stream": False
}

# 发送请求
response = requests.post(api_url, headers=headers, json=data)
result = response.json()
print(result["choices"][0]["message"]["content"])
```

### JavaScript 集成

```javascript theme={null}
const apiUrl = 'http://localhost:3000/api/chat/completions';

const requestData = {
  model: 'gpt-4-turbo',
  messages: [
    { role: 'user', content: '写一个简单的 Python 函数' }
  ]
};

fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 您的API易密钥'
  },
  body: JSON.stringify(requestData)
})
.then(response => response.json())
.then(data => {
  console.log(data.choices[0].message.content);
});
```

## 故障排除

### 常见问题

**连接失败**

* 检查 API Base URL 是否正确：`https://api.apiyi.com/v1`
* 验证 API Key 有效性
* 确认防火墙设置

**模型不可用**

* 检查账户余额
* 确认模型在服务范围内
* 查看 API易 服务状态

**上传失败**

* 检查文件格式支持
* 确认存储空间充足
* 验证文件大小限制

### 日志调试

启用调试模式：

```bash theme={null}
docker logs -f open-webui
```

查看详细日志：

```yaml theme={null}
environment:
  - LOG_LEVEL=DEBUG
  - WEBUI_DEBUG=true
```

## 最佳实践

### 性能优化

1. **模型选择**
   * 根据任务复杂度选择合适的模型
   * 查看 [模型推荐页面](/api-capabilities/model-info) 获取最新的模型选择建议

2. **缓存策略**
   * 启用对话缓存
   * 设置合理的缓存过期时间
   * 定期清理无用缓存

3. **资源管理**
   * 监控内存使用
   * 设置合理的并发限制
   * 定期备份用户数据

### 安全配置

```yaml theme={null}
environment:
  - ENABLE_ADMIN_EXPORT=false
  - ENABLE_ADMIN_CHAT_ACCESS=false
  - JWT_EXPIRES_IN=7d
```

### 监控告警

集成监控系统：

```yaml theme={null}
environment:
  - ENABLE_WEBHOOKS=true
  - WEBHOOK_URL=https://your-monitoring-url
```

需要更多帮助？请查看 [Open WebUI 官方文档](https://docs.openwebui.com) 或访问 [API易官网](https://api.apiyi.com)。
