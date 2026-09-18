> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude API 호출 기본

> APIYI는 AWS Claude + Claude Official API에 대한 듀얼 채널 공식 릴레이 액세스를 정가의 약 85% 수준으로 제공하며, 안정적이고 사용량 기반 과금입니다.

채널 및 과금 핵심 사항:

* **기본 채널: AWS Claude** (AWS Bedrock 공식) — 높은 안정성, 강력한 캐시 적중률.
* **백업 채널: Claude Official** (공식 키를 사용하는 Anthropic API 직결) — AWS 채널에 문제가 생기면 자동 페일오버됩니다.
* **두 채널 모두 순수 공식 패스스루입니다.** 사용량 기반 과금, 요청 제한 없음, 총비용은 정가의 약 \*\*85%\*\*입니다(보증금 보너스를 중첩 적용한 뒤 79%–86% 범위).

<Info>
  우리는 저가 역공학 기반 접근은 제공하지 않습니다 — **오직 신뢰할 수 있고 안정적인 품질과 서비스**만 제공합니다.

  Claude 접근 시장은 다소 혼란스럽고, 가격이 쌀수록 보통 더 불투명해집니다: 그런 저가 채널에는 무엇이 섞여 있는지 알 수 없습니다 — 역공학 해킹, 공유 계정, 성능을 낮춘 모델 또는 조용히 교체된 모델. 더 심한 경우, 대화 데이터가 재판매되어도 알 길이 없습니다. APIYI는 순수 공식 패스스루만 제공합니다(AWS Bedrock + 공식 Anthropic 키): 추적 가능한 채널, 데이터 보관 없음. 우리는 조금 더 비용을 지불하더라도 안정적이고 깨끗한 상태를 유지하겠습니다.
</Info>

## API Key 받기

대시보드에서 tokens를 생성하거나 관리합니다:

`https://api.apiyi.com/token`

* **default token**은 바로 사용할 수 있습니다.
* **ClaudeCode 그룹** 아래에 새 token을 만들면 **5% 할인**을 받습니다(정가의 95%).
* 해당 그룹 할인은 10%–20%의 충전 보너스와 **중복 적용**되며, 총 비용은 대략 정가의 \*\*79%–86%\*\*까지 내려갑니다("≈ 85%" 헤드라인).
* 요청 제한이 없고, 공식 사이트보다 저렴하며, 사용하기 쉽습니다.

<Info>
  API는 사용량 기준으로 과금됩니다(월 구독 아님) — 수수료는 선불 잔액에서 실시간으로 차감됩니다.
</Info>

## 엔드포인트

| 항목                       | 값                                           |
| ------------------------ | ------------------------------------------- |
| **기본 URL**               | `https://api.apiyi.com`                     |
| **Anthropic 네이티브 엔드포인트** | `https://api.apiyi.com/v1/messages`         |
| **OpenAI 호환 엔드포인트**      | `https://api.apiyi.com/v1/chat/completions` |

## 사용 가능한 모델

이 세 모델은 각 계열의 최신 모델이며, 직접 사용을 권장합니다:

| 계열         | 모델                          | 적합한 용도            |
| ---------- | --------------------------- | ----------------- |
| **Opus**   | `claude-opus-4-8`           | 복잡한 코딩, 심층 추론     |
| **Sonnet** | `claude-sonnet-4-6`         | 범용 지능, 일상적인 코딩    |
| **Haiku**  | `claude-haiku-4-5-20251001` | 빠른 응답, 높은 동시 실행 수 |

## 호출 형식: 네이티브 vs OpenAI 호환

Anthropic 네이티브 형식과 OpenAI 호환 형식 **둘 다** 지원합니다 — 하지만 사용 사례에 맞는 형식을 선택하십시오:

<CardGroup cols={2}>
  <Card title="✅ 강력히 권장: Anthropic 네이티브" icon="star">
    엔드포인트: `/v1/messages`

    **Claude Code, Cline, Cursor 또는 Claude 중심 클라이언트를 사용한다면 네이티브 형식을 사용해야 합니다.**

    네이티브 형식에서만 \*\*Prompt Cache(캐시 과금)\*\*가 제대로 적용되며, 긴 컨텍스트 / 반복되는 시스템 prompt의 비용을 크게 낮춥니다.
  </Card>

  <Card title="⚙️ 범용: OpenAI 호환" icon="plug">
    엔드포인트: `/v1/chat/completions`

    프로젝트가 이미 OpenAI SDK를 사용 중이고 **캐시 과금은 신경 쓰지 않는다면**, 거의 마이그레이션 비용 없이 Claude로 전환할 수 있습니다.

    일회성 스크립트, 가벼운 워크로드, OpenAI SDK에 묶인 레거시 프로젝트에 가장 적합합니다.
  </Card>
</CardGroup>

<Warning>
  **캐시 과금은 Anthropic 네이티브 형식에서만 작동합니다.** Claude Code 스타일의 고빈도, 장 컨텍스트 사용에서는 OpenAI 호환 형식이 실제로 더 높은 과금으로 이어질 수 있습니다 — 이는 상위 프로토콜의 제한이며, APIYI의 문제가 아닙니다.
</Warning>

프롬프트 캐싱이 어떻게 작동하는지와 이를 확인하는 방법은 [Claude Prompt Caching Guide](/ko/api-capabilities/claude-prompt-caching)를 참조하십시오.

## 예시

### Anthropic 네이티브 형식(권장)

```bash theme={null}
curl https://api.apiyi.com/v1/messages \
  -H "x-api-key: your-apiyi-key" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello, please introduce yourself."}
    ]
  }'
```

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Write a Python quicksort example."}
    ]
)

print(message.content[0].text)
```

### OpenAI 호환 형식(일반 마이그레이션용)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-6",
    messages=[
        {"role": "user", "content": "Hello, please introduce yourself."}
    ]
)

print(response.choices[0].message.content)
```

## Opus 가격에 대한 참고 사항

<Warning>
  **Opus는 비교적 비쌉니다.** 일상적인 채팅 사용량은 적은 편이지만, 토큰 입력/출력이 많은 코딩 시나리오에서는 청구액이 빠르게 늘어납니다. 실제 사용량을 가늠해 보기 위해 본격적으로 사용하기 전에 **\$10 테스트 예산**부터 시작하실 것을 권장합니다.
</Warning>

일상 사용 안내:

* **대부분의 시나리오**: `claude-sonnet-4-6`를 선호하십시오 — 가격 대비 성능이 가장 좋습니다.
* **간단한 / 대량 작업**: `claude-haiku-4-5-20251001`를 사용하십시오 — 빠르고 저렴합니다.
* **어려운 코딩 / 추론**: `claude-opus-4-8`로 상향하십시오.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="APIYI는 왜 더 저렴한 '저가 리버스 엔지니어링' 채널을 제공하지 않습니까?">
    "저렴함"의 실제 비용은 보이지 않는 부분에 있습니다. 리버스 엔지니어링한 꼼수, 공유 계정, 축소되거나 몰래 교체된 모델은 모두 가격을 낮출 수 있지만, 채널에 무엇이 섞여 있는지는 알 수 없습니다. 출력 품질은 들쭉날쭉해지고, 서비스는 하룻밤 사이 사라질 수 있으며, 대화 데이터가 재판매되어도 알아차리지 못합니다.

    저희는 **순수한 공식 패스스루**만 제공합니다: 기본 채널은 AWS Bedrock 공식 액세스이며, 백업은 공식 키를 사용하는 Anthropic 직접 연결입니다. 둘 다 추적 가능하고 사용량 기반 과금이며, 데이터는 보관하지 않습니다. 총비용은 대략 정가의 **85%** 수준이며, 저희는 이것이 "안정적이고 신뢰할 수 있는 것"과 "합리적인 가격" 사이에서 지켜야 할 적절한 선이라고 생각합니다. 저희는 수상하고 추적 불가능한 저가 공급을 건드리느니 차라리 조금 더 비용이 들기를 택합니다.
  </Accordion>

  <Accordion title="‘thinking.type.enabled is not supported for this model’ 오류가 발생합니까?">
    이는 AWS (Bedrock) 경로로 Opus 4.7 / 4.8을 호출할 때 가장 흔한 400 오류입니다. 전체 메시지는 다음과 같습니다:

    ```
    ValidationException: "thinking.type.enabled" is not supported for this model.
    Use "thinking.type.adaptive" and "output_config.effort" to control thinking behavior.
    ```

    **원인**: 요청 본문이 여전히 이전의 고정 예산 추론 형식 `thinking: { "type": "enabled", "budget_tokens": N }`을 사용하고 있습니다. Opus 4.7 / 4.8에서는 이를 제거했으며 적응형 추론만 지원합니다.

    **해결 방법**: `type: "enabled"`과 `budget_tokens`을 제거하고, `thinking: { "type": "adaptive" }` + `output_config.effort`를 사용하여 추론 깊이를 제어하십시오. 마찬가지로 이 모델들에서는 `temperature` / `top_p` / `top_k`가 제거되어 있으며, 전송하면 400이 발생합니다. [Claude Effort & Thinking Guide](/ko/api-capabilities/claude-effort-thinking)를 참조하십시오.
  </Accordion>
</AccordionGroup>

## 관련 링크

* 토큰 조회/관리: `https://api.apiyi.com/token`
* 입금 및 프로모션: `https://api.apiyi.com`
* [Claude 프롬프트 캐싱 가이드](/ko/api-capabilities/claude-prompt-caching)
