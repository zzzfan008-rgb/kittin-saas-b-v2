> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# max_tokens란 무엇입니까? 설정하지 않으면 어떻게 됩니까?

> max_tokens 매개변수, OpenAI의 매개변수 명명 변화, 설정하지 않았을 때의 기본 동작, 그리고 인기 모델의 최대 출력 token 한도에 대해 알아봅니다.

## 빠른 답변

`max_tokens`는 모델이 단일 응답에서 생성할 수 있는 최대 token 수를 제어합니다. **APIYI는 max\_tokens에 대해 추가 제한을 두지 않습니다** — 이 파라미터는 상위 모델로 직접 전달됩니다. 직접 설정할 수 있으며, 설정하지 않으면 모델의 기본값이 적용됩니다.

<Info>
  **APIYI의 방식**: 저희는 max\_tokens 제한을 강제하지 않습니다. 사용자가 전적으로 제어할 수 있습니다. 설정하지 않으면 각 모델은 고유한 기본 출력 동작을 사용합니다.
</Info>

## max\_tokens가 하는 일

`max_tokens`(최대 출력 token 수)는 LLM API를 호출할 때 가장 흔한 매개변수 중 하나입니다. 모델에게 다음과 같이 지시합니다: **응답에서 이만큼의 token을 넘지 않도록 생성하십시오**.

* **너무 낮게** 설정하면: 모델의 응답이 중간에 잘릴 수 있습니다(`finish_reason: "length"`를 반환함)
* **너무 높게** 설정하면: 모델이 그만큼 token을 생성하도록 강제되지는 않지만, 비용이 더 높아질 수 있습니다(일부 모델은 출력 token당 과금합니다)
* **설정하지 않으면**: 모델의 기본값을 사용합니다(제공자마다 다릅니다 — 아래 표를 참조하십시오)

<Tip>
  **Token ≠ 문자**. 영어에서는 대략 1단어 ≈ 1~~1.5 token입니다. 중국어에서는 대략 1자 ≈ 1~~2 token입니다. 4,096 token은 대략 영어 3,000단어에 해당합니다.
</Tip>

## OpenAI 매개변수 명명 변화

OpenAI는 서로 다른 API와 시기마다 다른 매개변수 이름을 사용해 왔기 때문에 혼동을 일으킬 수 있습니다:

| API 유형               | 매개변수 이름                 | 적용 가능한 모델                  | 도입 시기            |
| -------------------- | ----------------------- | -------------------------- | ---------------- |
| Chat Completions API | `max_tokens`            | GPT-3.5, GPT-4, GPT-4o 등   | 원래 버전            |
| Chat Completions API | `max_completion_tokens` | o1, o3, o4-mini 추론 모델      | 2024년 9월 (o1 출시) |
| Responses API        | `max_output_tokens`     | GPT-4o, GPT-5.4, o3, 모든 모델 | 2025             |

### 이름을 바꾼 이유

OpenAI가 2024년 9월 o1 추론 모델을 출시했을 때 "숨겨진 추론 tokens"를 도입했습니다. 이 모델은 응답에 **나타나지 않는** 방대한 내부 추론 tokens를 생성합니다.

원래의 `max_tokens`는 "생성된 tokens"와 "사용자가 받는 tokens"를 모두 의미했지만, 추론 모델에서는 이 둘이 더 이상 같지 않습니다. 그래서 OpenAI는 `max_completion_tokens`를 도입해 "**응답에서 받는 tokens의 상한**"을 명시적으로 의미하도록 했습니다.

이후 Responses API는 더 직관적인 이름 `max_output_tokens`로 통일했습니다.

<Warning>
  **중요**: Chat Completions API에서 OpenAI의 o-series 추론 모델(예: o3, o4-mini)을 사용할 때는 `max_completion_tokens`를 사용해야 하며 `max_tokens`를 사용하면 오류가 발생합니다.
</Warning>

## max\_tokens를 설정하지 않으면 어떻게 됩니까?

제공업체마다 다르게 처리합니다:

| 제공업체                    | 설정하지 않았을 때의 기본 동작              | 참고                                      |
| ----------------------- | ------------------------------ | --------------------------------------- |
| **OpenAI**              | 제한 없음(컨텍스트 윈도우가 소진될 때까지 출력)    | 모델이 출력 길이를 자연스럽게 결정합니다                  |
| **Anthropic Claude**    | ❌ **필수 파라미터 — 설정하지 않으면 오류 발생** | Claude API는 명시적인 `max_tokens`를 요구합니다    |
| **Google Gemini**       | 기본값은 8,192 tokens입니다           | 모델이 더 많은 양을 지원하더라도 8,192 tokens만 반환됩니다  |
| **DeepSeek (chat)**     | 기본값은 4,000 tokens입니다           | 수동으로 8,000까지 늘릴 수 있습니다                  |
| **DeepSeek (reasoner)** | 기본값은 32,000 tokens입니다          | chain-of-thought 출력을 포함하며, 최대 64,000입니다 |

<Warning>
  **특별 참고**: Anthropic Claude API의 `max_tokens`는 **필수 파라미터**입니다. 포함하지 않으면 API가 오류를 반환합니다. Claude 모델을 사용할 때는 항상 설정하십시오.
</Warning>

## 최대 출력 token 참고

아래는 인기 있는 모델의 최대 출력 token 한도입니다. **최신 값은 항상 공식 문서를 확인하십시오**, 모델은 자주 업데이트되기 때문입니다.

| 모델                | 모델 ID                | 최대 출력 token | 컨텍스트 윈도우  |
| ----------------- | -------------------- | ----------- | --------- |
| GPT-5.4           | `gpt-5.4-2026-03-05` | 128,000     | 1,047,576 |
| GPT-4o            | `gpt-4o`             | 16,384      | 128,000   |
| o3                | `o3`                 | 100,000     | 200,000   |
| Claude Opus 4.6   | `claude-opus-4-6`    | 128,000     | 1,000,000 |
| Claude Sonnet 4.6 | `claude-sonnet-4-6`  | 64,000      | 1,000,000 |
| Gemini 3.1 Pro    | `gemini-3.1-pro`     | 65,536      | 2,000,000 |
| DeepSeek V3       | `deepseek-chat`      | 8,000       | 64,000    |
| DeepSeek R1       | `deepseek-reasoner`  | 64,000      | 64,000    |

<Info>
  **공식 문서**(최신 값을 확인하려면):

  * OpenAI: `platform.openai.com/docs/models`
  * Anthropic Claude: `docs.anthropic.com/en/docs/about-claude/models`
  * Google Gemini: `ai.google.dev/gemini-api/docs/models`
  * DeepSeek: `api-docs.deepseek.com/api/create-chat-completion`
</Info>

## 권장 사항

<Tip>
  **권장 사항**: 모든 API 호출에서 `max_tokens`를 **명시적으로 설정하는 것**을 권장합니다. 그 이유는 다음과 같습니다:

  * 모델/제공자마다 기본값이 달라 예기치 않은 잘림이 발생할 수 있습니다
  * 출력 길이를 제어하고 불필요한 token 소모를 방지합니다
  * Claude API에서는 필수이므로, 일관된 습관을 들이면 오류를 줄일 수 있습니다
  * 일반적인 설정 예시: 일반 채팅 `2048-4096`, 긴 형식 생성 `8192-16384`, 코드 생성 `4096-8192`
</Tip>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="APIYI는 max_tokens 제한을 두고 있습니까?">
    **아니요**. APIYI는 `max_tokens` 매개변수를 추가 제한 없이 상위 모델로 직접 전달합니다. 설정한 값이 그대로 상위 모델에 전달됩니다. 유일한 제한은 모델 자체의 최대 출력 token 상한입니다.
  </Accordion>

  <Accordion title="max_tokens를 모델의 최대값보다 높게 설정하면 어떻게 됩니까?">
    오류는 발생하지 않습니다 — 모델은 단지 자체 최대치까지 생성합니다. 예를 들어, GPT-4o의 최대 출력은 16,384 tokens입니다. `max_tokens: 100000`를 설정하더라도 최대 16,384 tokens만 출력합니다.
  </Accordion>

  <Accordion title="max_tokens와 max_completion_tokens의 차이는 무엇입니까?">
    둘은 같은 목적을 가집니다 — 출력 token 수를 제한하는 것입니다. 차이는 명칭입니다:

    * `max_tokens`: OpenAI의 원래 매개변수 이름으로, GPT 시리즈의 추론이 아닌 모델에 사용됩니다
    * `max_completion_tokens`: 2024년 9월부터 OpenAI의 o-series 추론 모델에 사용됩니다
    * `max_output_tokens`: OpenAI Responses API의 통합 매개변수 이름입니다

    APIYI를 통해 호출할 때는 사용하는 모델과 API 형식에 따라 적절한 매개변수 이름을 사용하십시오.
  </Accordion>

  <Accordion title="출력이 잘렸습니다(finish_reason가 'length'입니다) — 어떻게 해결합니까?">
    이는 모델의 출력이 `max_tokens` 한도에 도달했음을 의미합니다. 해결 방법:

    1. `max_tokens` 값을 늘리십시오
    2. 더 간결한 응답을 얻도록 prompt를 최적화하십시오
    3. 올바른 매개변수 이름을 사용하고 있는지 확인하십시오(o-series 모델은 `max_completion_tokens`가 필요합니다)
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="올바른 AI 모델을 선택하는 방법?" icon="compass" href="/ko/faq/model-selection-guide">
    사용 사례에 가장 적합한 모델을 선택하십시오
  </Card>

  <Card title="API 동시 실행 수 제한" icon="gauge" href="/ko/faq/api-concurrency">
    다양한 모델의 동시 실행 수 제한에 대해 알아보십시오
  </Card>

  <Card title="Base URL 구성 가이드" icon="settings" href="/ko/faq/base-url-config">
    다양한 도구에서 APIYI Base URL을 구성하는 방법
  </Card>

  <Card title="APIYI token 관리" icon="key" href="https://api.apiyi.com/token">
    API 키를 관리하고 사용량과 잔액을 확인합니다
  </Card>
</CardGroup>
