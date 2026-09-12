> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Anthropic 네이티브 설정

> 안정적인 도구 호출과 Claude 전용 기능을 위해 anthropic-messages API 유형으로 OpenClaw를 구성합니다

## Anthropic 네이티브 모드를 선택해야 하는 이유

OpenClaw는 Claude 모델을 호출하는 두 가지 방법을 지원합니다. **도구 호출(tool\_use)** 및 기타 고급 기능이 필요하다면 Anthropic 네이티브 모드(`anthropic-messages`)를 강력히 권장합니다:

| 시나리오         | OpenAI 호환 모드      | Anthropic 네이티브 모드 |
| ------------ | ----------------- | ----------------- |
| 기본 채팅        | ✅ 작동합니다           | ✅ 작동합니다           |
| 도구 호출(도구 루프) | ❌ 400을 반환할 수 있습니다 | ✅ 안정적입니다          |
| 프롬프트 캐싱      | ❌ 지원되지 않습니다       | ✅ 지원됩니다           |
| 멀티 모델 전환     | ✅ 400개 이상의 모델     | ⚠️ Claude 시리즈만    |

<Info>
  `openai-completions`를 사용하면 기본 채팅은 정상적으로 작동하지만, 다중 턴 도구 호출(tool\_calls → tool\_result → 도구 루프)은 400 오류로 거부될 수 있습니다. `anthropic-messages`로 전환하면 `tool_use` + `tool_result` 형식이 올바르게 작동합니다.
</Info>

## 권장 구성

`~/.openclaw/openclaw.json`를 편집하고 다음 제공자 구성을 추가하십시오:

```json theme={null}
{
  "models": {
    "providers": {
      "apiyi": {
        "baseUrl": "https://api.apiyi.com",
        "apiKey": "sk-your-apiyi-key",
        "api": "anthropic-messages",
        "headers": {
          "anthropic-version": "2023-06-01",
          "anthropic-beta": ""
        },
        "models": [
          {
            "id": "claude-sonnet-4-6",
            "name": "Claude Sonnet 4",
            "reasoning": false,
            "contextWindow": 200000,
            "maxTokens": 16384
          },
          {
            "id": "claude-opus-4-6",
            "name": "Claude Opus 4",
            "reasoning": false,
            "contextWindow": 200000,
            "maxTokens": 16384
          }
        ]
      }
    }
  }
}
```

### 중요 구성 참고사항

<Warning>
  다음 세 가지 항목은 **반드시** 올바르게 설정해야 하며, 그렇지 않으면 400 오류가 발생합니다:

  1. **`baseUrl` without `/v1`**: Must be `https://api.apiyi.com` — adding `/v1` would result in `.../v1/v1/messages` causing request failure
  2. **`headers` must include `anthropic-version`**: Set to `2023-06-01`
  3. **`anthropic-beta` set to empty string**: 지원되지 않는 기능을 트리거하지 않도록 베타 기능 헤더를 비활성화합니다
</Warning>

### `reasoning: false`에 관하여

<Warning>
  APIYI의 Claude 모델은 요청에 추론 관련 필드(`thinking` / `output_config`)가 포함되면 **400 오류를 반환합니다**.

  모델 항목에서 `"reasoning": false`를 설정하면 OpenClaw가 추론 필드를 보내지 않도록 하여 이 문제를 방지합니다.
</Warning>

## 모델 허용 목록 구성

모델을 `agents.defaults.models`에 추가하십시오. 그렇지 않으면 OpenClaw가 해당 모델을 “등록되지 않음”으로 보고 조용히 다른 모델로 대체할 수 있습니다:

```json theme={null}
{
  "agents": {
    "defaults": {
      "model": { "primary": "apiyi/claude-sonnet-4-6" },
      "models": {
        "apiyi/claude-sonnet-4-6": { "streaming": false },
        "apiyi/claude-opus-4-6": { "streaming": false }
      }
    }
  }
}
```

## OpenAI 호환 모드와의 비교

| 기능      | OpenAI 호환 모드               | Anthropic 네이티브 모드         |
| ------- | -------------------------- | ------------------------- |
| API 유형  | `openai-completions`       | `anthropic-messages`      |
| baseUrl | `https://api.apiyi.com/v1` | `https://api.apiyi.com`   |
| 지원되는 모델 | 모든 400개 이상의 모델             | Claude 시리즈만               |
| 도구 호출   | 불안정함(멀티턴에서는 400이 발생할 수 있음) | 안정적임                      |
| 프롬프트 캐싱 | 지원하지 않음                    | 지원됨                       |
| 확장 컨텍스트 | 모델에 따라 다름                  | 최대 200K tokens            |
| 적합한 용도  | 다중 모델 전환, 기본 채팅            | 심층 Claude 사용, Agent 도구 호출 |

## Claude 모델 ID 목록

| 모델 ID                       | 이름               | 설명                     |
| --------------------------- | ---------------- | ---------------------- |
| `claude-sonnet-4-6`         | Claude Sonnet 4  | 균형 잡힌 성능, 일상 사용에 권장됩니다 |
| `claude-opus-4-6`           | Claude Opus 4    | 가장 강력한 추론 성능           |
| `claude-haiku-4-5-20251001` | Claude Haiku 4.5 | 빠른 응답, 비용 효율적          |

## 혼합 구성(권장)

필요에 따라 전환하면서 OpenAI 호환 및 Anthropic 네이티브 제공자를 둘 다 구성합니다:

```json theme={null}
{
  "agents": {
    "defaults": {
      "model": { "primary": "apiyi-claude/claude-sonnet-4-6" },
      "models": {
        "apiyi-claude/claude-sonnet-4-6": { "streaming": false },
        "apiyi-claude/claude-opus-4-6": { "streaming": false }
      }
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
          { "id": "deepseek-v3.2", "name": "DeepSeek V3.2" }
        ]
      },
      "apiyi-claude": {
        "baseUrl": "https://api.apiyi.com",
        "apiKey": "sk-your-apiyi-key",
        "api": "anthropic-messages",
        "headers": {
          "anthropic-version": "2023-06-01",
          "anthropic-beta": ""
        },
        "models": [
          {
            "id": "claude-sonnet-4-6",
            "name": "Claude Sonnet 4",
            "reasoning": false,
            "contextWindow": 200000,
            "maxTokens": 16384
          },
          {
            "id": "claude-opus-4-6",
            "name": "Claude Opus 4",
            "reasoning": false,
            "contextWindow": 200000,
            "maxTokens": 16384
          }
        ]
      }
    }
  }
}
```

채팅에서 `/model apiyi/gpt-5.4` 또는 `/model apiyi-claude/claude-sonnet-4-6`를 사용하여 모델을 전환합니다.

## 설정 확인

설정 후에는 구성이 정상적으로 동작하는지 확인합니다:

```bash theme={null}
{/* Check model status */}
openclaw models status

{/* Send a test message and check the returned provider/model */}
openclaw agent --message "just reply pong" --json
```

반환된 JSON에서 `meta.agentMeta.provider`과 `meta.agentMeta.model`가 설정과 일치하는지 확인합니다.

## Troubleshooting

<AccordionGroup>
  <Accordion title="400 ValidationException: 작업이 허용되지 않습니다">
    이는 일반적으로 요청의 추론 관련 필드 때문에 발생합니다. 다음을 확인하십시오:

    * Model 항목에 `"reasoning": false`가 설정되어 있어야 합니다
    * Headers에 `"anthropic-beta": ""`가 올바르게 구성되어 있어야 합니다
  </Accordion>

  <Accordion title="구성이 변경되었지만 적용되지 않음">
    기존 채팅 세션이 이전 모델 구성을 캐시했을 수 있습니다. 두 가지 해결 방법이 있습니다.

    세션 모델을 패치합니다:

    ```bash theme={null}
    openclaw gateway call sessions.patch \
      --params '{"key":"your-session-key","model":"apiyi-claude/claude-sonnet-4-6"}'
    ```

    또는 세션을 초기화합니다:

    ```bash theme={null}
    openclaw gateway call sessions.reset \
      --params '{"key":"your-session-key","reason":"reset"}'
    ```
  </Accordion>

  <Accordion title="모델이 조용히 다른 모델로 폴백됨">
    모델이 `agents.defaults.models` 허용 목록에 추가되었는지 확인하십시오. 등록되지 않은 모델은 OpenClaw에 의해 자동으로 폴백됩니다.
  </Accordion>

  <Accordion title="baseUrl 경로 중복 오류">
    Anthropic 네이티브 모드 `baseUrl`는 `/v1`를 **포함해서는 안 됩니다**. `https://api.apiyi.com/v1`를 사용하면 `.../v1/v1/messages`가 발생하여 404 오류가 발생합니다.
  </Accordion>
</AccordionGroup>
