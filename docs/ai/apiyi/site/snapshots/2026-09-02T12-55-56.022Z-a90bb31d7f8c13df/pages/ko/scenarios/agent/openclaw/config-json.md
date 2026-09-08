> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# JSON 구성

> openclaw.json 설정 파일을 편집하여 APIYI 서비스 및 멀티모델 지원을 구성합니다

## 구성 파일 위치

OpenClaw는 `~/.openclaw/openclaw.json`에 있는 JSON 구성 파일을 사용합니다.

## 기본 설정

구성 파일 `~/.openclaw/openclaw.json`을 생성하거나 편집합니다:

```json theme={null}
{
  "agents": {
    "defaults": {
      "model": { "primary": "apiyi/gpt-5.4" }
    }
  },
  "models": {
    "providers": {
      "apiyi": {
        "baseUrl": "https://api.apiyi.com/v1",
        "apiKey": "sk-your-apiyi-key",
        "api": "openai-completions",
        "models": [
          { "id": "gpt-5.4", "name": "GPT-5.4" },
          { "id": "claude-sonnet-4-6", "name": "Claude Sonnet 4" },
          { "id": "deepseek-v3.2", "name": "DeepSeek V3.2" },
          { "id": "gemini-3.1-pro-preview", "name": "Gemini 3.1 Pro" }
        ]
      }
    }
  }
}
```

## 설정 참조

| 필드                              | 설명                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `agents.defaults.model.primary` | 기본 모델, 형식: `provider/model-name`                                              |
| `models.providers`              | 사용자 지정 모델 제공자 설정                                                              |
| `baseUrl`                       | API 엔드포인트, `https://api.apiyi.com/v1` 사용                                      |
| `apiKey`                        | APIYI 키                                                                       |
| `api`                           | API 유형: OpenAI 호환용은 `openai-completions`, Anthropic 호환용은 `anthropic-messages` |

## 다중 모델 설정

채팅에서 `/model <id>`을 사용해 여러 모델을 설정하고 서로 전환합니다:

```json theme={null}
{
  "models": {
    "providers": {
      "apiyi": {
        "baseUrl": "https://api.apiyi.com/v1",
        "apiKey": "sk-your-key",
        "api": "openai-completions",
        "models": [
          { "id": "gpt-5.4", "name": "GPT-5.4" },
          { "id": "claude-sonnet-4-6", "name": "Claude Sonnet 4" },
          { "id": "deepseek-v3.2", "name": "DeepSeek V3.2" }
        ]
      }
    }
  }
}
```

## 전체 구성 예시

모델 구성과 Telegram 채널이 포함된 전체 예시입니다:

```json theme={null}
{
  "agents": {
    "defaults": {
      "model": { "primary": "apiyi/gpt-5.4" }
    }
  },
  "models": {
    "providers": {
      "apiyi": {
        "baseUrl": "https://api.apiyi.com/v1",
        "apiKey": "sk-your-apiyi-key",
        "api": "openai-completions",
        "models": [
          { "id": "gpt-5.4", "name": "GPT-5.4" },
          { "id": "claude-sonnet-4-6", "name": "Claude Sonnet 4" },
          { "id": "deepseek-v3.2", "name": "DeepSeek V3.2" }
        ]
      }
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "accounts": {
        "default": {
          "token": "your-telegram-bot-token"
        }
      }
    }
  }
}
```

<Tip>
  구성 파일을 수정한 후 변경 사항을 적용하려면 Gateway 서비스를 다시 시작합니다:

  ```bash theme={null}
  openclaw gateway restart
  ```
</Tip>
