> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Open WebUI

> Feature-rich self-hosted AI interface integration guide

Open WebUI is a feature-rich self-hosted AI platform that supports fully offline operation. Through APIYI, you can integrate various mainstream large language models in Open WebUI.

## Quick Deployment

### Docker Quick Start

```bash theme={null}
docker run -d -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

### Docker Compose Deployment

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
      - OPENAI_API_KEY=Your APIYI key
    restart: unless-stopped

volumes:
  open-webui:
```

## Configure APIYI

### Method 1: Environment Variable Configuration

Set environment variables during deployment:

```bash theme={null}
docker run -d -p 3000:8080 \
  -e OPENAI_API_BASE_URL=https://api.apiyi.com \
  -e OPENAI_API_KEY=Your APIYI key \
  -v open-webui:/app/backend/data \
  --name open-webui \
  ghcr.io/open-webui/open-webui:main
```

### Method 2: Interface Configuration

1. Access Open WebUI admin interface
2. Go to **Settings** > **Connections**
3. Configure in **OpenAI API** section:
   * **API Base URL**: `https://api.apiyi.com/v1`
   * **API Key**: Enter your APIYI key
4. Click save configuration

<Info>
  **Configuration Key Points**

  * API Base URL needs to include the `/v1` suffix
  * API Key can be obtained from [APIYI Console](https://api.apiyi.com)
  * Recommended to use environment variable method for easier management and updates
</Info>

## Supported Models

Open WebUI supports 400+ mainstream AI models through APIYI.

<Card title="See the models we recommend right now" icon="star" href="/en/api-capabilities/model-info">
  Latest model recommendations, performance comparisons, and scenario-based guidance — covering writing, programming, fast responses, image generation, video generation, and more.
</Card>

<Info>
  **Why don't we list specific models here?**

  AI models are updated at a rapid pace. To make sure you always get accurate recommendations, we maintain the model list, performance data, and usage guidance in one place: the [Model Recommendations page](/en/api-capabilities/model-info).
</Info>

## Core Features

### RAG (Retrieval-Augmented Generation)

Open WebUI supports document upload and knowledge base features:

1. **Document Upload**
   * Supports PDF, TXT, DOCX and other formats
   * Automatic vectorization storage
   * Supports multilingual documents

2. **Knowledge Base Management**
   * Create specialized knowledge bases
   * Document classification and tagging
   * Intelligent retrieval matching

### OpenAI Compatible API

Open WebUI provides a complete OpenAI compatible API:

```bash theme={null}
# Chat completion
curl -X POST "http://localhost:3000/api/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer Your APIYI key" \
  -d '{
    "model": "gpt-4-turbo",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

### Tool Integration

Supports external tools and plugins:

* Web search
* Code execution
* Image generation
* Document processing

## Advanced Configuration

### Multi-Model Configuration

Configure multiple model sources in `docker-compose.yml`:

```yaml theme={null}
environment:
  - OPENAI_API_BASE_URL=https://api.apiyi.com
  - OPENAI_API_KEY=Your APIYI key
  - ENABLE_OPENAI_API=true
  - ENABLE_OLLAMA_API=false
```

### User Permission Management

```yaml theme={null}
environment:
  - ENABLE_SIGNUP=false
  - DEFAULT_USER_ROLE=user
  - WEBHOOK_URL=Your webhook address
```

### Data Persistence

```yaml theme={null}
volumes:
  - open-webui:/app/backend/data
  - ./uploads:/app/backend/data/uploads
  - ./vector_db:/app/backend/data/vector_db
```

## API Integration Examples

### Python Integration

```python theme={null}
import requests

# Open WebUI API endpoint
api_url = "http://localhost:3000/api/chat/completions"

# Request configuration
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer Your APIYI key"
}

data = {
    "model": "gpt-4-turbo",
    "messages": [
        {"role": "user", "content": "Explain the basic principles of quantum computing"}
    ],
    "stream": False
}

# Send request
response = requests.post(api_url, headers=headers, json=data)
result = response.json()
print(result["choices"][0]["message"]["content"])
```

### JavaScript Integration

```javascript theme={null}
const apiUrl = 'http://localhost:3000/api/chat/completions';

const requestData = {
  model: 'gpt-4-turbo',
  messages: [
    { role: 'user', content: 'Write a simple Python function' }
  ]
};

fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer Your APIYI key'
  },
  body: JSON.stringify(requestData)
})
.then(response => response.json())
.then(data => {
  console.log(data.choices[0].message.content);
});
```

## Troubleshooting

### Common Issues

**Connection Failed**

* Check if API Base URL is correct: `https://api.apiyi.com/v1`
* Verify API Key validity
* Confirm firewall settings

**Model Unavailable**

* Check account balance
* Confirm model is within service scope
* Check APIYI service status

**Upload Failed**

* Check file format support
* Confirm sufficient storage space
* Verify file size limits

### Log Debugging

Enable debug mode:

```bash theme={null}
docker logs -f open-webui
```

View detailed logs:

```yaml theme={null}
environment:
  - LOG_LEVEL=DEBUG
  - WEBUI_DEBUG=true
```

## Best Practices

### Performance Optimization

1. **Model Selection**
   * Pick a model that matches the complexity of the task
   * See the [Model Recommendations page](/en/api-capabilities/model-info) for up-to-date guidance on choosing a model

2. **Caching Strategy**
   * Enable conversation caching
   * Set reasonable cache expiration time
   * Regularly clean unused cache

3. **Resource Management**
   * Monitor memory usage
   * Set reasonable concurrent limits
   * Regularly backup user data

### Security Configuration

```yaml theme={null}
environment:
  - ENABLE_ADMIN_EXPORT=false
  - ENABLE_ADMIN_CHAT_ACCESS=false
  - JWT_EXPIRES_IN=7d
```

### Monitoring Alerts

Integrate monitoring system:

```yaml theme={null}
environment:
  - ENABLE_WEBHOOKS=true
  - WEBHOOK_URL=https://your-monitoring-url
```

Need more help? Please check [Open WebUI Official Documentation](https://docs.openwebui.com) or visit [APIYI Official Website](https://api.apiyi.com).
