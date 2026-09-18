> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI는 캐시 과금을 지원합니까?

> 예. Claude, OpenAI, Gemini, DeepSeek, Qwen, Grok 및 기타 주요 채널은 모두 캐시 과금을 지원합니다. hit 필드는 그대로 반환되며, 과금은 공식 할인율을 따릅니다.

## 간단한 답변

**그렇습니다.** APIYI의 **Claude, OpenAI, Gemini, DeepSeek, Qwen, 그리고 Grok** 채널은 모두 캐시 과금을 지원합니다. 캐시 관련 요청 파라미터는 상위로 그대로 전달되고, 캐시 적중 필드는 변경 없이 그대로 반환되며, 과금 대시보드에는 공식 할인율이 적용된 캐시 사용량이 별도의 항목으로 표시됩니다 — 코드에서 미들웨어 전용 조정은 필요하지 않습니다.

**Claude와 OpenAI의 캐시 적중은 안정적이고 신뢰할 수 있습니다**(둘 다 이 사이트에 전용 가이드가 있으며 — 아래에 링크되어 있습니다). DeepSeek, Qwen, 그리고 Grok는 모두 완전 자동 프리픽스 캐싱을 사용하며, 안정적인 프리픽스가 있으면 정상적으로 적중합니다. 다만 **Grok의 상위 시스템은 명시적으로 적중을 보장하지 않으므로**, 캐시되지 않은 가격 기준으로 예산을 잡으시기 바랍니다. Gemini의 암시적 캐싱도 지원되지만, **적중률은 평범한 수준입니다** — Gemini 캐싱을 기준으로 비용 예산을 세우지 마십시오.

## 세 채널 한눈에 보기

|          | OpenAI (gpt-5 시리즈)                                         | Claude                                                     | Gemini                                                     |
| -------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| 트리거      | **완전 자동**, 코드 없이                                           | 수동 `cache_control` 마커                                      | 암묵적 캐싱, 자동 활성화                                             |
| 최소 임계값   | 1024 token                                                 | 모델별 1024–4096 token                                        | 4096 (3 시리즈) / 2048 (2.5 시리즈)                              |
| 쓰기 요금    | 무료                                                         | 1.25× (5분) / 2× (1시간)                                      | 무료                                                         |
| 적중 가격    | 입력값의 0.1배                                                  | 입력값의 0.1배                                                  | Google의 공식 할인 적용                                           |
| 실제 사용 경험 | ✅ 안정적인 적중                                                  | ✅ 안정적인 적중                                                  | ⚠️ 보통 수준의 적중률                                              |
| 전체 가이드   | [OpenAI 캐시 과금](/ko/api-capabilities/openai/prompt-caching) | [Claude 캐시 과금](/ko/api-capabilities/claude-prompt-caching) | [Gemini 캐시 과금](/ko/api-capabilities/gemini/prompt-caching) |

## 채널 참고 사항

### OpenAI: 완전 자동, 손이 가지 않음

최소 1024 token의 안정적인 접두사를 유지하면 적중이 자동으로 발생합니다. 일치한 부분은 \*\*입력 가격의 10%\*\*로 과금되며, 쓰기 수수료가 없으므로 2번째 요청부터는 이미 순수한 절감입니다. 어떤 요청이 적중하는지 작성하는 방법과 `prompt_cache_key`의 사용 방법은 [OpenAI Prompt Caching Billing Guide](/ko/api-capabilities/openai/prompt-caching)를 참조하십시오.

### Claude: 수동 마커, 가장 큰 절감

캐시하려는 콘텐츠 블록에 `cache_control`를 추가하십시오. 적중은 \*\*0.1×\*\*로 과금되며(쓰기 비용은 1.25× / 2×입니다). Claude Code, Cline, Cursor 및 기타 고부하 작업에 필수입니다. 이것은 **Anthropic 네이티브 형식(`/v1/messages`)에서만 작동합니다** — OpenAI 호환 형식으로 Claude를 호출하면 캐시 할인을 받을 수 없습니다. [Claude Prompt Caching Billing Guide](/ko/api-capabilities/claude-prompt-caching)를 참조하십시오.

### Gemini: 지원되지만, 기대치는 낮게 유지하십시오

APIYI는 Gemini 네이티브 형식에 대해 암묵적 컨텍스트 캐싱을 자동으로 활성화하며, 적중은 Google의 공식 할인율로 과금됩니다. 그러나 실제로는 **Gemini의 캐시 적중률이 Claude / OpenAI보다 분명히 낮습니다**(상위단의 암묵적 캐싱 동작은 제어할 수 없습니다). 권장 사항은 다음과 같습니다.

* 캐시 할인은 있으면 좋은 보너스로 취급하십시오. **비용은 캐시가 없는 가격으로 추정하십시오**
* 길고 자주 반복되는 접두사가 있는 캐시 민감 워크로드에서는 OpenAI 또는 Claude 채널을 선호하십시오

## 기타 채널: DeepSeek / Qwen / Grok

이 채널의 캐싱은 **완전히 자동**으로 동작하며(마커가 필요하지 않음), APIYI를 통해 정상적으로 작동하고, 실무에서도 성능이 좋습니다.

| 채널             | 트리거                                 | 적중 할인(공식)                                                                                                            | 적중 신뢰성                           |
| -------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **DeepSeek**   | 자동, 접두사 일치                          | 적중 시 **90% 이상** 절감 — 이들 중 할인 폭이 가장 큽니다                                                                               | 안정적                              |
| **Qwen**       | 암시적 캐싱, 자동 활성화, 최소 1024 tokens의 접두사 | 적중분은 공식 할인 요율로 과금됩니다                                                                                                 | 안정적                              |
| **Grok (xAI)** | 자동, 접두사 일치                          | 적중 시 대략 **75%** 절감합니다(`grok-4.6`; 모델 등급에 따라 다름) — [Grok 캐시 과금 가이드](/ko/api-capabilities/grok/prompt-caching)를 참조하십시오 | 발생하면 결정적이지만, 상위 제공자 수준의 보장은 없습니다 |

적중률을 높이는 방법은 OpenAI와 동일합니다. **안정적인 내용을 먼저, 변동이 큰 내용을 나중에** 배치하십시오 — 타임스탬프와 랜덤 ID는 prompt의 앞부분에서 제외하십시오. [OpenAI Cache Billing Guide](/ko/api-capabilities/openai/prompt-caching)의 “stable prefix” 플레이북을 그대로 적용할 수 있습니다.

## 적중 여부 확인 방법

응답 `usage`에서 캐시 필드를 확인합니다:

| 채널                                 | 적중 필드                                                        |
| ---------------------------------- | ------------------------------------------------------------ |
| OpenAI `/v1/chat/completions`      | `usage.prompt_tokens_details.cached_tokens`                  |
| OpenAI `/v1/responses`             | `usage.input_tokens_details.cached_tokens`                   |
| Claude `/v1/messages`              | `usage.cache_read_input_tokens`                              |
| Gemini native format               | `usageMetadata.cachedContentTokenCount`                      |
| DeepSeek                           | `usage.prompt_cache_hit_tokens` / `prompt_cache_miss_tokens` |
| Qwen / Grok `/v1/chat/completions` | `usage.prompt_tokens_details.cached_tokens`                  |
| Grok `/v1/responses`               | `usage.input_tokens_details.cached_tokens`                   |

0보다 큰 값이면 적중입니다. 대시보드 호출 로그에서는 캐시 사용량이 별도의 할인된 라인 항목으로 표시되므로, 이를 직접 확인할 수 있습니다.

## 주의할 사항

<Warning>
  **캐시는 호출 형식을 따릅니다**: Claude 모델을 OpenAI 호환 형식(`/v1/chat/completions`)으로 호출하면 Claude의 캐시 할인을 받을 수 없습니다. Claude를 많이 사용하는 경우에는 네이티브 `/v1/messages` 형식을 사용하십시오.
</Warning>

* 캐시는 **모델별로 분리됩니다**: 모델을 바꾸면(같은 시리즈 안에서도) 아무것도 공유되지 않습니다
* 위에 나열되지 않은 공급업체(Kimi 등)는 호출 로그에 실제로 반환된 캐시 필드를 기준으로 하십시오
* 공식 메커니즘 세부 정보: `platform.openai.com/docs/guides/prompt-caching`, `docs.claude.com/en/docs/build-with-claude/prompt-caching`, `ai.google.dev/gemini-api/docs/caching`, `api-docs.deepseek.com/quick_start/pricing`, `docs.x.ai/developers/advanced-api-usage/prompt-caching`

## 관련 문서

<CardGroup cols={2}>
  <Card title="OpenAI 캐시 과금 가이드" icon="database" href="/ko/api-capabilities/openai/prompt-caching">
    자동 캐싱: 1024-token 임계값, 적중 시 90% 할인, prompt\_cache\_key 라우팅
  </Card>

  <Card title="Grok 캐시 과금 가이드" icon="database" href="/ko/api-capabilities/grok/prompt-caching">
    적중 시 75% 할인, 128-token 블록 단위, 그리고 긴 대화에 적합한 엔드포인트
  </Card>

  <Card title="Gemini 캐시 과금 가이드" icon="database" href="/ko/api-capabilities/gemini/prompt-caching">
    암시적 캐싱 임계값과 예상할 수 있는 사항
  </Card>

  <Card title="Claude 캐시 과금 가이드" icon="database" href="/ko/api-capabilities/claude-prompt-caching">
    cache\_control을 어디에 배치할지, 손익분기점 계산, 멀티턴 기법
  </Card>

  <Card title="모델 요율 배수" icon="calculator" href="/ko/faq/model-multiplier">
    콘솔 그룹 요율 배수가 USD 가격으로 어떻게 변환되는지
  </Card>

  <Card title="호출 로그" icon="file-text" href="/ko/faq/call-logs">
    요청별 token 사용량과 캐시 과금 세부 정보를 확인합니다
  </Card>
</CardGroup>

## 문의하기

<CardGroup cols={2}>
  <Card title="WeCom 지원" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom 지원 QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    추가하려면 스캔하거나 [지원팀에 문의](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)하십시오

    캐시 과금 문의 및 기술 지원
  </Card>

  <Card title="이메일" icon="mail">
    **지원**: [support@apiyi.com](mailto:support@apiyi.com)

    **비즈니스**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
