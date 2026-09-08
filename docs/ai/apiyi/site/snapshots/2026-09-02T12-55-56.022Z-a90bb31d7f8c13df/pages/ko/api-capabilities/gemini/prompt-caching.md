> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 암시적 캐싱 과금 가이드

> Gemini의 암시적 캐싱은 자동으로 활성화되며, 캐시 적중분은 공식 할인율로 과금됩니다 — 하지만 적중률은 Claude/OpenAI보다 낮으므로, 캐시되지 않은 가격 기준으로 예산을 잡아야 합니다.

APIYI의 Gemini 채널은 **암묵적 컨텍스트 캐싱**을 자동으로 활성화합니다. 요청 접두사가 적중하면 일치한 부분은 공식 할인율로 과금되며 `cached_content_token_count` 필드는 변경되지 않은 채 반환됩니다. 코드 변경은 전혀 없습니다.

핵심부터 말하면: **Gemini 캐싱은 존재하지만, 의존해서는 안 됩니다.** 암묵적 캐시 동작은 상위에서 제어되며, 실제 적중률은 [OpenAI](/ko/api-capabilities/openai/prompt-caching)와 [Claude](/ko/api-capabilities/claude-prompt-caching)보다 분명히 낮습니다. 이를 있으면 좋은 보너스로 여기고, **비캐시 가격으로 항상 비용을 추정하십시오**.

이 페이지는 Google의 공식 문서(`ai.google.dev/gemini-api/docs/caching`, 2026년 6월 기준)를 바탕으로 작성되었습니다.

## 한 문장으로 보는 작동 방식

요청의 시작 구간(접두사)이 최근 요청과 일치하고 최소 길이를 충족하면, 상위 서비스가 자동으로 캐시를 재사용합니다: 일치한 부분은 공식 할인율로 과금되며(공식적으로 **최대 90% 할인**), 별도의 표시가 필요하지 않습니다.

## 트리거 조건

| 조건        | 요구 사항                                                           |
| --------- | --------------------------------------------------------------- |
| 최소 접두사 길이 | **Gemini 3 / 3.1 / 3.5 시리즈: 4096 tokens**; 2.5 시리즈: 2048 tokens |
| 안정적인 접두사  | 첫 글자부터 바이트 단위로 완전히 동일해야 합니다. 동적 콘텐츠(타임스탬프, 무작위 ID)는 일치가 깨집니다    |
| 시간 창      | 캐시는 유휴 시간이 지나면 만료됩니다. 연속 요청은 더 안정적으로 적중합니다                      |

참고로 Gemini의 캐싱 임계값(4096)은 OpenAI의 1024보다 훨씬 높습니다. 따라서 **짧은 system prompt는 Gemini에서 사실상 절대 적중하지 않으며**, 이것이 Gemini 캐싱이 기대에 못 미치는 느낌을 주는 이유 중 하나입니다.

## 캐시 적중 확인 방법

`usage_metadata.cached_content_token_count`를 확인합니다:

```python theme={null}
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[LONG_STABLE_PREFIX, question]
)

usage = response.usage_metadata
print(f"Input: {usage.prompt_token_count}")
print(f"Cache hits: {usage.cached_content_token_count}")  # > 0 means a hit
```

적중은 과금 대시보드에서 할인된 항목으로 표시되며, REST 응답에서는 필드가 `usageMetadata.cachedContentTokenCount`입니다.

## 적중률 높이기

운용 방식은 OpenAI의 것과 동일합니다(자세한 설명은 [OpenAI 캐시 과금 가이드](/ko/api-capabilities/openai/prompt-caching)에서 확인할 수 있습니다):

* **안정적인 콘텐츠를 먼저 배치합니다**: 긴 시스템 지침, 문서, few-shot 예시를 앞부분에 두고 사용자 입력과 타임스탬프는 뒤에 둡니다
* **프리픽스를 길게 만듭니다**: 4096 tokens 미만은( Gemini 3 시리즈) 절대 적중하지 않습니다
* **재사용을 시간적으로 묶습니다**: 배치 작업은 연달아 보내고, 간격을 너무 벌리지 않습니다
* 멀티턴 채팅은 본질적으로 추가만 되는 프리픽스이므로 더 쉽게 적중합니다

모든 것을 올바르게 해도 **적중이 보장되지는 않습니다** — 암시적 캐싱은 OpenAI/Claude의 결정적 동작과 달리 최선 노력 방식입니다.

## 명시적 캐싱 (cachedContents)

Google은 명시적 캐싱 API도 제공합니다(`cachedContents` — TTL이 적용된 캐시 객체를 생성하고 이를 참조합니다). 이는 **상태 저장형 서버 측 리소스이며 현재 APIYI 채널에서는 지원되지 않으므로** 암시적 캐싱을 사용하십시오.

## 다른 채널과의 비교

|        | Gemini                                  | OpenAI          | Claude                    |
| ------ | --------------------------------------- | --------------- | ------------------------- |
| 트리거    | 암시적, 자동                                 | 완전 자동           | 수동 마커                     |
| 최소 임계값 | **4096** (3 series) / 2048 (2.5 series) | 1024            | 1024–4096                 |
| 적중 할인  | 공식적으로 최대 90% 할인                         | 0.1×            | 0.1×                      |
| 적중 신뢰성 | ⚠️ 최선 노력 방식, 보통 수준                      | ✅ 안정적           | ✅ 안정적                     |
| 적중 필드  | `cached_content_token_count`            | `cached_tokens` | `cache_read_input_tokens` |

**긴 선행 프리픽스가 자주 반복되는 캐시 민감 워크로드(agents, RAG, batch documents)에는 OpenAI 또는 Claude 채널을 권장합니다.** 플랫폼 전체의 캐시 지원 개요는 [Cache Billing FAQ](/ko/faq/cache-billing)를 참고하십시오.

## 관련 링크

* 이 그룹: [네이티브 호출](/ko/api-capabilities/gemini/native) · [멀티모달 & 코드 실행](/ko/api-capabilities/gemini/multimodal) · [함수 호출](/ko/api-capabilities/gemini/function-calling)
* 다른 채널: [OpenAI 캐시 과금](/ko/api-capabilities/openai/prompt-caching) · [Claude 캐시 과금](/ko/api-capabilities/claude-prompt-caching)
* Google 공식 문서: `ai.google.dev/gemini-api/docs/caching`
