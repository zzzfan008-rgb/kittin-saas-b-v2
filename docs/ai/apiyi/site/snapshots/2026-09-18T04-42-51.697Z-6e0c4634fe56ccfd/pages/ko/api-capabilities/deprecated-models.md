> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 지원 종료된 모델

> 예정 및 지원 종료된 모델 목록을 확인하고, 권장 대안으로 제때 마이그레이션합니다.

## 개요

이 페이지는 폐기가 예정되어 있거나 이미 폐기된 모델을 나열하여, 미리 마이그레이션 계획을 세우는 데 도움을 줍니다.

<Warning>
  폐기가 예정된 모델을 사용 중이라면, 서비스 중단을 피하기 위해 가능한 한 빨리 권장 대체 모델로 마이그레이션하십시오.
</Warning>

## ⚠️ 예정된 사용 중단

다음 모델은 사용 중단이 예정되어 있습니다. 아래 날짜 이전에 마이그레이션을 완료하시기 바랍니다.

| 모델 이름                               | 모델 ID                                 | 예상 사용 중단 날짜           | 권장 대안                    | 비고                                                                                                                                                                                   |
| ----------------------------------- | ------------------------------------- | --------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Gemini 3 Pro Preview                | `gemini-3-pro-preview`                | 투명하게 별칭 처리됨 (2026-05) | `gemini-3.1-pro-preview` | **Google 공식과 동기화됨**: 고객이 이미 프로덕션에서 레거시 ID를 사용해 호출하고 있으므로, 실시간 작업에 영향을 주지 않도록 `gemini-3-pro-preview`에 대한 요청은 자동으로 `gemini-3.1-pro-preview`로 라우팅됩니다. 편한 시점에 새 ID로 마이그레이션하시기 바랍니다.      |
| Gemini 3.1 Flash Lite Preview       | `gemini-3.1-flash-lite-preview`       | 투명하게 별칭 처리됨 (2026-05) | `gemini-3.1-flash-lite`  | **Google 공식과 동기화됨**: Google은 2026-05-25에 이 프리뷰를 종료했습니다. 레거시 ID에 대한 요청은 **동일한 가격**으로 `gemini-3.1-flash-lite`에 자동으로 라우팅되며, 공식 요율을 따르므로 실시간 작업이 중단되지 않습니다. 편한 시점에 새 ID로 마이그레이션하시기 바랍니다. |
| Gemini 2.0 Flash Lite               | `gemini-2.0-flash-lite`               | 미정                    | `gemini-2.5-flash`       | Gemini 2.0 시리즈 종료                                                                                                                                                                    |
| Gemini 2.0 Flash Lite 001           | `gemini-2.0-flash-lite-001`           | 미정                    | `gemini-2.5-flash`       | Gemini 2.0 시리즈 종료                                                                                                                                                                    |
| Gemini 2.0 Flash                    | `gemini-2.0-flash`                    | 미정                    | `gemini-2.5-flash`       | Gemini 2.0 시리즈 종료                                                                                                                                                                    |
| Gemini 2.0 Flash 001                | `gemini-2.0-flash-001`                | 미정                    | `gemini-2.5-flash`       | Gemini 2.0 시리즈 종료                                                                                                                                                                    |
| Gemini 2.0 Flash Lite Preview 02-05 | `gemini-2.0-flash-lite-preview-02-05` | 미정                    | `gemini-2.5-flash`       | 프리뷰 버전                                                                                                                                                                               |

<Info>
  자세한 Gemini 모델 사용 중단 정보는 공식 문서를 참조하시기 바랍니다: `ai.google.dev/gemini-api/docs/deprecations`
</Info>

## 🚫 지원 종료된 모델

다음 모델들은 지원이 종료되어 더 이상 사용할 수 없습니다. 애플리케이션이 아직 이 모델들을 호출하고 있다면, 즉시 대체 모델로 전환하십시오.

| 모델명                    | 모델 ID                                                                                     | 지원 종료일     | 대체 모델                                   | 비고                                                                                                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------- | ---------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kimi K2                | `kimi-k2`                                                                                 | 2026-05-28 | `kimi-k2.6`                             | 레거시 Kimi K2 — 최신 K2.6으로 마이그레이션하십시오                                                                                                                                                                                |
| Kimi K2 128K           | `kimi-k2-128k`                                                                            | 2026-05-28 | `kimi-k2.6`                             | 레거시 장문 컨텍스트 K2입니다. K2.6은 기본으로 256K 컨텍스트를 제공합니다                                                                                                                                                                    |
| Kimi K2 Instruct       | `kimi-k2-instruct`                                                                        | 2026-05-28 | `kimi-k2.6`                             | 레거시 지시 튜닝된 K2 — K2.6으로 마이그레이션하십시오                                                                                                                                                                                 |
| DeepSeek V3.1          | `deepseek-v3-1-250821`                                                                    | 2026-05-28 | `deepseek-v4-pro` / `deepseek-v4-flash` | DeepSeek V3 시리즈는 종료되었습니다 — V4로 마이그레이션하십시오: 강한 reasoning에는 Pro를, 높은 처리량/비용 민감 워크로드에는 Flash를 선택하십시오                                                                                                                 |
| DeepSeek V3.1 Terminus | `deepseek-v3.1-terminus`                                                                  | 2026-05-28 | `deepseek-v4-pro` / `deepseek-v4-flash` | DeepSeek V3 시리즈는 종료되었습니다 — V4로 마이그레이션하십시오                                                                                                                                                                         |
| DeepSeek R1 (250528)   | `deepseek-r1-250528`                                                                      | 2026-05-28 | `deepseek-v4-pro` / `deepseek-v4-flash` | R1 추론 모델은 V4로 대체되었습니다 — 추론 워크로드에는 V4 Pro를 사용하십시오                                                                                                                                                                  |
| GPT-4                  | `gpt-4`                                                                                   | 2026-02-27 | `gpt-5.2`                               | 레거시 모델, 지원이 종료되었습니다                                                                                                                                                                                               |
| GPT-4 (32K)            | `gpt-4-32k`                                                                               | 2026-02-27 | `gpt-5.2`                               | 레거시 모델, 지원이 종료되었습니다                                                                                                                                                                                               |
| Grok 4                 | `grok-4`                                                                                  | 2026-03-12 | `grok-4-1-fast-reasoning`               | 종료됨 — 최신 릴리스로 마이그레이션하십시오                                                                                                                                                                                          |
| Grok 4 0709            | `grok-4-0709`                                                                             | 2026-03-12 | `grok-4-1-fast-reasoning`               | 종료됨 — 최신 릴리스로 마이그레이션하십시오                                                                                                                                                                                          |
| Sora 2 Video (공식 릴레이)  | `sora-2` / `sora-2-pro` / `sora-2-remix`                                                  | 2026-07-01 | `doubao-seedance-2-0` / `wan2.7-t2v`    | **Sora 2 전체 라인은 종료되었습니다.** OpenAI의 용량 재배분으로 심각한 타임아웃이 발생했습니다. 공식 종료 시점은 9월로 정해졌으며, 우리는 `Sora2Official` 그룹을 예정보다 앞당겨 7월 1일에 종료했습니다. 해당 그룹은 이제 비활성화되었습니다. [서비스 공지](/en/live/2026-07/sora2-official-offline)를 확인하십시오 |
| Sora 2 Video (역방향)     | `sora_video2` / `sora_video2-landscape` / `sora_video2-15s` / `sora_video2-landscape-15s` | 2026-04-26 | `doubao-seedance-2-0` / `wan2.7-t2v`    | 역방향 채널은 종료되었습니다. 후속인 공식 릴레이 Sora 2도 2026-07-01에 종료되었습니다 — [SeeDance 2.0](/ko/api-capabilities/seedance2/overview) 또는 [Wan2.7](/ko/api-capabilities/wan/overview)으로 바로 마이그레이션하십시오                                  |
| Sora 2 캐릭터 생성          | `sora-character`                                                                          | 2026-04-26 | `doubao-seedance-2-0`                   | 역방향 채널은 종료되었습니다. 캐릭터 일관성 워크로드에는 대신 [Seedance Asset Library](/ko/api-capabilities/seedance2/asset-library)를 사용하십시오                                                                                                 |
| Sora 이미지 생성/편집 (역방향)   | `sora_image`                                                                              | 2026-04-26 | `gpt-image-2-all` (새 역방향)               | 역방향 채널은 종료되었습니다 — [GPT-Image-2-All](/ko/api-capabilities/gpt-image-2-all/overview)로 마이그레이션하십시오                                                                                                                    |
| GPT-4o 이미지 생성/편집 (역방향) | `gpt-4o-image`                                                                            | 2026-04-26 | `gpt-image-2-all` (새 역방향)               | 역방향 채널은 종료되었습니다 — [GPT-Image-2-All](/ko/api-capabilities/gpt-image-2-all/overview)로 마이그레이션하십시오                                                                                                                    |

## 🔗 제공업체별 공식 지원 종료 페이지

각 제공업체의 공식 모델 수명 주기 및 지원 종료 페이지로 바로 이동할 수 있는 링크입니다. 최신 일정을 원문에서 직접 대조할 수 있습니다.

<CardGroup cols={2}>
  <Card title="OpenAI" icon="square-terminal" href="https://platform.openai.com/docs/deprecations">
    GPT 모델 지원 종료 목록과 권장 대체안
  </Card>

  <Card title="Anthropic Claude" icon="brain" href="https://platform.claude.com/docs/en/about-claude/model-deprecations">
    Claude 모델 지원 종료 일정(공식 문서)
  </Card>

  <Card title="Google Gemini" icon="gem" href="https://ai.google.dev/gemini-api/docs/deprecations">
    Gemini 모델 서비스 종료 일정 및 마이그레이션 안내
  </Card>

  <Card title="xAI Grok" icon="bolt" href="https://docs.x.ai/developers/migration/models">
    Grok 모델 마이그레이션 노트 및 종료 공지
  </Card>

  <Card title="알리바바 Qwen" icon="cloud" href="https://www.alibabacloud.com/help/en/model-studio/newly-released-models">
    Bailian(Model Studio) Qwen 모델 수명 주기 및 업데이트
  </Card>

  <Card title="DeepSeek" icon="fish" href="https://api-docs.deepseek.com/updates">
    DeepSeek API 변경 로그 및 모델 마이그레이션 노트
  </Card>
</CardGroup>

<Info>
  위 링크는 각 공급업체의 공식 문서로 이동합니다. 모델 종료 일정을 최신 상태로 확인할 수 있도록 즐겨찾기에 추가하고 주기적으로 확인하시는 것을 권장합니다.
</Info>

<Info>
  이 페이지는 정기적으로 업데이트됩니다. 최신 지원 종료 정보를 확인하려면 주기적으로 다시 방문하시기 바랍니다.
</Info>
