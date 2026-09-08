> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Base URL을 어떻게 설정하나요? /v1, 루트 도메인, /v1beta의 차이

> API.YI Base URL 설정 완전 가이드: OpenAI에는 /v1, Claude에는 루트 도메인, Gemini에는 /v1beta

## 빠른 답변

<Info>
  **기억해 두십시오**: OpenAI 모델은 `/v1`가 필요하고, Claude는 루트 도메인만 사용하며, Gemini는 `/v1beta`가 필요합니다. 잘못된 Base URL은 가장 흔한 통합 문제입니다.
</Info>

| 모델 계열                           | 기본 URL                     | SDK                                           |
| ------------------------------- | -------------------------- | --------------------------------------------- |
| GPT / DeepSeek / Llama / Qwen 등 | `https://api.apiyi.com/v1` | OpenAI SDK                                    |
| Claude 시리즈                      | `https://api.apiyi.com`    | Anthropic SDK                                 |
| Gemini 시리즈                      | `https://api.apiyi.com`    | Google GenAI SDK (`api_version: "v1beta"` 설정) |

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

APIYI는 네트워크 라우팅과 배포 아키텍처만 다르고 기능은 동일한 4개의 도메인 노드를 제공합니다:

<CardGroup cols={2}>
  <Card title="🌏 해외용 권장 글로벌 직결" icon="globe">
    **`vip.apiyi.com`**

    백엔드로 직접 연결되어 지연 시간이 가장 짧습니다. **중국 본토가 아닌 모든 고객에게 권장됩니다**.
  </Card>

  <Card title="🇨🇳 중국 기본값 본토용 권장" icon="server">
    **`api.apiyi.com`**

    중국 본토 네트워크에 최적화되어 있습니다. **중국 본토 고객의 기본값입니다**.
  </Card>

  <Card title="🏢 중국 백업 / 비즈니스" icon="building">
    **`b.apiyi.com`**

    백업 노드와 Business 엔터프라이즈 라인입니다. 기본 노드를 사용할 수 없을 때 사용합니다.
  </Card>

  <Card title="⚡ Cloudflare CDN 글로벌 가속" icon="bolt">
    **`api-cf.apiyi.com`**

    Cloudflare 글로벌 CDN 가속입니다. **텍스트 전용 API 호출**에 사용합니다. 100초 타임아웃 제한이 있습니다.
  </Card>
</CardGroup>

| 노드                    | 도메인                | 권장 대상        | 참고                |
| --------------------- | ------------------ | ------------ | ----------------- |
| Global Direct         | `vip.apiyi.com`    | 중국 본토가 아닌 고객 | 백엔드 직결, 지연 시간 최저  |
| China Default         | `api.apiyi.com`    | 중국 본토 고객     | 국내 라우팅 최적화(기본값)   |
| China Backup/Business | `b.apiyi.com`      | 엔터프라이즈 / 백업  | 백업 + Business     |
| Cloudflare CDN        | `api-cf.apiyi.com` | 텍스트 전용 호출    | 글로벌 가속, 100초 타임아웃 |

<Warning>
  **Cloudflare CDN 노드 제한**: `api-cf.apiyi.com`은 Cloudflare Workers에 배포되어 있으며, 최대 요청 타임아웃은 **100초**입니다. 따라서:

  * ✅ **적합한 경우**: 일반 텍스트 채팅, 짧은 텍스트 생성 및 기타 빠른 응답 호출
  * ❌ **적합하지 않은 경우**: 100초를 초과하는 복잡한 장문 작업
  * ❌ **적합하지 않은 경우**: Nano Banana Pro 및 기타 이미지 생성 작업
  * ❌ **적합하지 않은 경우**: 동영상 생성 API 호출

  작업이 100초를 초과할 수 있다면, 대신 `vip.apiyi.com`(해외용) 또는 `api.apiyi.com`(중국 본토용)을 사용하십시오.
</Warning>

<Tip>
  서비스 가용성을 높이기 위해 코드에서 자동 전환용 대체 노드를 설정할 것을 권장합니다.
</Tip>

## 일반적인 오류 해결

| 오류                     | 가능한 원인                                               | 해결 방법                                                                                    |
| ---------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **404 Not Found**      | OpenAI SDK에서 `/v1`가 누락되었거나 Anthropic SDK에 `/v1`가 추가됨 | 경로가 SDK 사양과 일치하는지 확인합니다                                                                  |
| **400 Bad Request**    | Gemini SDK 경로 버전 불일치                                 | `/v1beta`를 사용하는지 확인합니다                                                                   |
| **Connection Timeout** | 도메인 노드가 잘못됨                                          | 중국에서는 `api.apiyi.com`을 사용하고, 해외에서는 `vip.apiyi.com`를 사용합니다. CF-CDN 노드는 100초 타임아웃 제한이 있습니다 |
| **SSL Error**          | `https://` 접두사가 누락됨                                  | 모든 노드는 HTTPS가 필요합니다                                                                      |
| **Double Slash Error** | base\_url 끝의 `/`                                     | 끝의 슬래시를 제거합니다                                                                            |

## 전체 설정 레퍼런스

### OpenAI 호환 모델

| 노드                         | 기본 URL                        |
| -------------------------- | ----------------------------- |
| Global Direct (Overseas)   | `https://vip.apiyi.com/v1`    |
| China Default (Mainland)   | `https://api.apiyi.com/v1`    |
| China Backup/Business      | `https://b.apiyi.com/v1`      |
| Cloudflare CDN (Text Only) | `https://api-cf.apiyi.com/v1` |

### Claude 모델 (Anthropic SDK)

| 노드                         | 기본 URL                     |
| -------------------------- | -------------------------- |
| Global Direct (Overseas)   | `https://vip.apiyi.com`    |
| China Default (Mainland)   | `https://api.apiyi.com`    |
| China Backup/Business      | `https://b.apiyi.com`      |
| Cloudflare CDN (Text Only) | `https://api-cf.apiyi.com` |

### Gemini 모델

| 노드                         | 기본 URL                     |
| -------------------------- | -------------------------- |
| Global Direct (Overseas)   | `https://vip.apiyi.com`    |
| China Default (Mainland)   | `https://api.apiyi.com`    |
| China Backup/Business      | `https://b.apiyi.com`      |
| Cloudflare CDN (Text Only) | `https://api-cf.apiyi.com` |

<Info>
  Google GenAI SDK를 Gemini에 사용할 때는 `base_url`를 루트 도메인으로 설정하고 `api_version: "v1beta"`를 설정하십시오 — SDK가 전체 경로를 자동으로 구성합니다.
</Info>
