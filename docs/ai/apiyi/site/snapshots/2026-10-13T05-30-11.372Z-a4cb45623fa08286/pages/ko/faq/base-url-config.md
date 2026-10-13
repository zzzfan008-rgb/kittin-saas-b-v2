> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Base URL을 어떻게 설정하나요? /v1, 루트 도메인, /v1beta의 차이

> API.YI Base URL 설정 완전 가이드: OpenAI에는 /v1, Claude에는 루트 도메인, Gemini에는 /v1beta

## 빠른 답변

<Info>
  **기억해 두십시오**: OpenAI 모델은 `/v1`가 필요하고, Claude는 루트 도메인만 사용하며, Gemini는 `/v1beta`가 필요합니다. 잘못된 Base URL은 가장 흔한 통합 문제입니다.
</Info>

| 모델 계열 | 기본 URL | SDK |
| - | - | - |
| GPT / DeepSeek / Llama / Qwen 등 | `https://api.apiyi.com/v1` | OpenAI SDK |
| Claude 시리즈 | `https://api.apiyi.com` | Anthropic SDK |
| Gemini 시리즈 | `https://api.apiyi.com` | Google GenAI SDK (`api_version: "v1beta"` 설정) |

## 왜 모델마다 기본 URL이 다른가요?

이는 각 벤더의 SDK 구현 방식에 따라 결정됩니다.

* **OpenAI SDK**: `base_url` 뒤에 리소스 경로를 추가하므로 `/v1`이 포함되어야 합니다
* **Anthropic SDK**: 내부적으로 `/v1/messages`를 덧붙입니다. 따라서 `/v1`를 직접 추가하면 `/v1/v1/messages`(404 오류)가 발생합니다
* **Google GenAI SDK**: `/v1beta` 경로를 사용하며, SDK가 연결을 자동으로 처리합니다

## 코드 예제

### OpenAI 호환 모델 (GPT / DeepSeek / Llama 등)

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"  # Domain + /v1
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

### Claude 모델 (Anthropic SDK)

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com"  # Root domain only, NO /v1
)

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
print(message.content[0].text)
```

### Gemini 모델 (Google GenAI SDK)

```python theme={null}
from google import genai

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"api_version": "v1beta", "base_url": "https://api.apiyi.com"}
)

response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents="Hello!"
)
print(response.text)
```

<Warning>
  **Claude 사용자의 흔한 실수**: 공식 Anthropic SDK를 사용할 때는 Base URL이 `https://api.apiyi.com`이어야 하며, `/v1`를 추가하면 안 됩니다. 다만 OpenAI SDK의 호환 모드로 Claude를 호출하는 경우에는 `/v1`이 필요합니다.
</Warning>

## 도메인 노드 선택

APIYI는 기능은 동일하지만 네트워크 라우팅 및 배포 아키텍처가 다른 3개의 도메인 노드를 제공합니다:

<CardGroup cols={3}>
  <Card title="🌏 기본 (권장)" icon="server">
    **`api.apiyi.com`**

    기본 메인 회선입니다. **중국 본토 내외의 모든 고객에게 권장됩니다**.
  </Card>

  <Card title="🏢 중국 백업 / 비즈니스" icon="building">
    **`b.apiyi.com`**

    백업 노드 및 비즈니스 엔터프라이즈 전용 회선입니다. 기본 노드를 사용할 수 없을 때 사용합니다.
  </Card>

  <Card title="⚡ Cloudflare CDN 글로벌 가속" icon="bolt">
    **`api-cf.apiyi.com`**

    Cloudflare 글로벌 CDN 가속입니다. **텍스트 전용 API 호출**을 위한 노드입니다. 100초의 타임아웃 제한이 있습니다.
  </Card>
</CardGroup>

| 노드 | 도메인 | 권장 대상 | 비고 |
| - | - | - | - |
| 기본 | `api.apiyi.com` | 모든 고객 (권장) | 기본 메인 회선 |
| 중국 백업/비즈니스 | `b.apiyi.com` | 엔터프라이즈 / 백업 | 백업 + 비즈니스 |
| Cloudflare CDN | `api-cf.apiyi.com` | 텍스트 전용 호출 | 글로벌 가속, 100초 타임아웃 |

<Warning>
  **Cloudflare CDN 노드 제한 사항**: `api-cf.apiyi.com`은(는) 최대 요청 타임아웃이 **100초**인 Cloudflare Workers에 배포되어 있습니다. 따라서:

  * ✅ **적합한 용도**: 일반 텍스트 대화, 단문 텍스트 생성 및 기타 빠른 응답 호출
  * ❌ **부적합한 용도**: 100초를 초과하는 복잡한 장문 텍스트 작업
  * ❌ **부적합한 용도**: Nano Banana Pro 및 기타 이미지 생성 작업
  * ❌ **부적합한 용도**: 동영상 생성 API 호출

  작업 시간이 100초를 초과할 수 있는 경우 대신 `api.apiyi.com`(또는 백업 노드 `b.apiyi.com`)을 사용하십시오.
</Warning>

<Tip>
  서비스 가용성을 향상시키기 위해 코드에 폴백 노드를 구성하여 자동 전환되도록 설정하는 것을 권장합니다.
</Tip>

## 자주 발생하는 오류 해결

| 오류 | 가능한 원인 | 해결 방법 |
| - | - | - |
| **404 Not Found** | OpenAI SDK에서 `/v1` 누락 또는 Anthropic SDK에 불필요한 `/v1` 추가 | 경로가 SDK 사양과 일치하는지 확인하십시오. |
| **400 Bad Request** | Gemini SDK 경로 버전 불일치 | `/v1beta`을(를) 사용하고 있는지 확인하십시오. |
| **연결 시간 초과** | 잘못된 도메인 노드 | 장시간 소요되는 요청에는 `api.apiyi.com` 또는 `b.apiyi.com`을(를) 사용하십시오. CF-CDN 노드에는 100초의 타임아웃 제한이 있습니다. |
| **SSL 오류** | `https://` 접두사 누락 | 모든 노드는 HTTPS를 사용해야 합니다. |
| **이중 슬래시 오류** | base\_url 끝에 `/` 포함 | 후행 슬래시를 제거하십시오. |

## 전체 설정 참조

### OpenAI 호환 모델

| 노드 | Base URL |
| - | - |
| 기본 (권장) | `https://api.apiyi.com/v1` |
| 중국 백업/비즈니스 | `https://b.apiyi.com/v1` |
| Cloudflare CDN (텍스트 전용) | `https://api-cf.apiyi.com/v1` |

### Claude 모델 (Anthropic SDK)

| 노드 | Base URL |
| - | - |
| 기본 (권장) | `https://api.apiyi.com` |
| 중국 백업/비즈니스 | `https://b.apiyi.com` |
| Cloudflare CDN (텍스트 전용) | `https://api-cf.apiyi.com` |

### Gemini 모델

| 노드 | Base URL |
| - | - |
| 기본 (권장) | `https://api.apiyi.com` |
| 중국 백업/비즈니스 | `https://b.apiyi.com` |
| Cloudflare CDN (텍스트 전용) | `https://api-cf.apiyi.com` |

<Info>
  Gemini용 Google GenAI SDK를 사용할 때는 `base_url`을 루트 도메인 및 `api_version: "v1beta"`로 설정하십시오 — SDK가 자동으로 전체 경로를 구성합니다.
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.