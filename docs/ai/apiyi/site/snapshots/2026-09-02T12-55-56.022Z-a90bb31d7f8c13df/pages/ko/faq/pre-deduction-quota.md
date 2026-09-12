> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API 호출의 사전 차감 메커니즘은 무엇인가요?

> APIYI의 사전 차감(사전 소모 쿼터) 방식은 무엇입니까: 요청 전에 모델 가격과 입력을 바탕으로 보류 금액을 추정한 뒤, 실제 사용량으로 정산합니다 — 또한 insufficient_user_quota 오류를 읽는 방법도 설명합니다.

## 빠른 답변

요청이 **실제로 실행되기 전**에 APIYI는 **사전 차감**(“모델 가격 × 예상 token” — 가능한 최대 비용)을 계산하고, 그 금액을 일시적으로 잔액에서 보류합니다. 요청이 끝나면 **실제 사용된 token 기준으로 정산하고 차액을 환불**합니다. 즉, 사전 차감은 최종 청구액이 아니라 추정치입니다.

<Info>
  **핵심 두 줄**

  * **사전 차감**: 요청 전에 하는 추정으로, “이 호출을 감당할 수 있는가”를 판단하는 데 사용됩니다.
  * **실제 과금**: 요청 완료 후 실제 token 기준으로 정산되며, 이것이 진짜로 청구되는 금액입니다.
</Info>

**사전 차감 추정치 > 현재 잔액**이면, 요청은 실행되기 전에 거부되며 `insufficient_user_quota`가 반환됩니다. 이것이 “분명 잔액이 있는데도 왜 안 되지?”의 근본 원인입니다.

## 사전 차감이 작동하는 방식

<Steps>
  <Step title="요청 전: 추정 후 보류">
    시스템은 사용자의 **입력**(prompt, 이미지, 대화 기록 등)을 읽고, 모델의 현재 가격과 **추정 출력 길이**를 바탕으로 **최대 가능 비용**을 계산한 뒤, 이를 잔액에서 임시로 보류합니다.

    추정값은 대략 다음과 같습니다.

    `pre-deduction ≈ model price × (input tokens + estimated output tokens)`
  </Step>

  <Step title="사전 확인: 잔액이 충분한지">
    **사전 차감**과 **현재 잔액**을 비교합니다.

    * 잔액 ≥ 사전 차감 → 허용되어 요청이 전송됩니다
    * 잔액 \< 사전 차감 → `insufficient_user_quota`로 거부되며, **실제로는 호출이 이루어지지 않습니다**
  </Step>

  <Step title="요청 후: 실제 사용량으로 정산하고 차액을 환불">
    완료되면 시스템은 실제 input/output token 사용량을 기준으로 다시 과금합니다.

    * 실제 비용이 **보통 사전 차감보다 적습니다** → 초과로 보류된 쿼터가 잔액으로 **환불됩니다**
    * 실패/중단된 요청 → 일반적으로 과금되지 않으며, 보류된 쿼터가 해제됩니다
  </Step>
</Steps>

<Tip>
  **큰 사전 차감이 있었다고 해서 실제로 그만큼 사용했다는 뜻은 아닙니다** — 이는 "최악의 경우를 대비한 준비금" 추정치입니다. 실제로 청구되는 것은 요청 완료 후의 실제 tokens입니다.
</Tip>

## insufficient\_user\_quota 오류 읽기

사전 차감이 잔액을 초과하면 다음과 같은 내용이 표시됩니다:

```json theme={null}
{
  "error": {
    "message": "user [25359] quota [50264897] preConsumedQuota [154753475] is not enough",
    "localized_message": "Insufficient user quota",
    "type": "shell_api_error",
    "param": "",
    "code": "insufficient_user_quota"
  }
}
```

항목별로 보면:

| 필드                              | 의미                                      |
| ------------------------------- | --------------------------------------- |
| `quota [50264897]`              | 현재 **사용 가능한 잔액**(내부 쿼터 단위)              |
| `preConsumedQuota [154753475]`  | 이 요청이 **사전 차감하려는 쿼터**                   |
| `is not enough`                 | 사전 차감 > 잔액이므로 보유하기에 부족하여, **요청이 거부됩니다** |
| `code: insufficient_user_quota` | 오류 코드: insufficient user quota          |

중요한 것은 두 숫자의 **비율**입니다. 여기서는 사전 차감 `154753475`이 잔액 `50264897`의 약 **3배**이므로 차단됩니다.

<Note>
  이 숫자들은 APIYI의 **내부 쿼터 단위**이며 서로 직접 비교할 수 있습니다. USD 기준으로는: 잔액 ≈ \$100, 이 요청의 사전 차감 추정치는 ≈ \$310(내부적으로 약 500,000단위 ≈ \$1)입니다. 다시 말해, 이 요청 하나가 계정에 \$100밖에 없는데도 \$300이 넘는 금액을 보유하려 했기 때문에 실행될 수 없었습니다.
</Note>

## “잔액은 있는데 실행되지 않는 이유”

대부분의 경우, **문제는 잔액 자체가 아니라 과도하게 큰 입력**입니다.

실제 예를 들면: `gpt-5.5`은 최대 1,050,000 token까지의 컨텍스트 윈도우를 제공합니다. 여기에 **거대한 코드 저장소 전체**를 통째로 넣으면 입력 token 수가 엄청나게 커지고 사전 차감 금액도 크게 불어납니다. \$100 잔액이 있어도 \$300으로 예상되면 요청이 실행되기 전에 여전히 거절됩니다.

<Warning>
  **입력이 클수록 사전 차감도 커집니다**

  과도하게 큰 입력은 사전 차감을 키워 `insufficient_user_quota`를 쉽게 유발할 뿐만 아니라, 다음과 같은 문제도 만듭니다.

  * 통과하더라도 **실제 비용이 높습니다**(실제 token 기준으로 과금됩니다).
  * 너무 많은 불필요한 내용을 넣으면 모델이 **평범한 결과를 반환할 수 있습니다**. 돈은 쓰고 결과는 좋지 않습니다.
</Warning>

## 해결하고 예방하는 방법

<CardGroup cols={2}>
  <Card title="입력을 줄이기" icon="scissors">
    관련된 **코드/문서**만 보내십시오 — 전체 저장소나 긴 문서를 한꺼번에 보내지 마십시오. 이것이 가장 효과적인 해결책입니다.
  </Card>

  <Card title="max_tokens 설정하기" icon="ruler">
    출력 길이를 명시적으로 제한하여 “예상 출력 tokens”를 낮추고, 그에 따라 사전 차감을 줄이십시오. [max\_tokens 가이드](/ko/faq/max-tokens)를 참조하십시오.
  </Card>

  <Card title="잔액을 충전하기" icon="credit-card">
    정말로 큰 입력이 필요하다면 잔액 > 사전 차감을 충족하도록 하십시오. [결제 방법](/ko/faq/payment-methods)을 참조하십시오.
  </Card>

  <Card title="먼저 작은 모델로 테스트하기" icon="flask-conical">
    저렴한 모델에서 입력이 적절한지 검증한 다음, 고급 모델로 전환하십시오 — “감당할 수 있는 것보다 더 많이 소모하는” 일은 피하십시오.
  </Card>
</CardGroup>

<Tip>
  **큰 입력에 주의하십시오**: 고컨텍스트 모델(예: `gpt-5.5`'s 1.05M tokens)은 많은 양을 담을 수 있지만, “담을 수 있다”가 “담아야 한다”는 뜻은 아닙니다. 전체 저장소를 통째로 넣는 것은 종종 비용도 많이 들고 품질도 평범합니다 — 먼저 실제로 어떤 컨텍스트가 필요한지 생각하십시오.
</Tip>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="사전 차감이 실제로 그렇게 많이 청구됩니까?">
    아닙니다. 사전 차감은 **요청 전에 잠시 보류되는 금액**일 뿐이며, 최종 청구는 요청 완료 후의 **실제 token 사용량**으로 정산되고 초과 보류분은 환불됩니다. 눈에 보이는 `preConsumedQuota`는 실제 청구액이 아니라 '최악의 경우 예비분' 추정치입니다.
  </Accordion>

  <Accordion title="요청이 실패해도 청구됩니까?">
    대체로 아닙니다. `insufficient_user_quota` 오류는 **실행 전에** 차단되므로 모델이 실제로 호출되지 않고, 실제 비용도 발생하지 않으며, 보류된 쿼터는 해제됩니다.
  </Accordion>

  <Accordion title="잔액은 분명히 충분한데 — 왜 쿼터 오류가 발생합니까?">
    이 오류는 잔액과 **사전 차감**을 비교할 뿐, 잔액과 '실제 비용'을 비교하지 않습니다. 입력이 너무 크면 사전 차감 추정치가 잔액을 훨씬 초과하므로 거부됩니다. 먼저 입력을 줄이거나, 예상 출력을 낮추도록 `max_tokens`을 설정한 뒤, 그래도 필요하면 충전하십시오.
  </Accordion>

  <Accordion title="대용량 컨텍스트 모델은 항상 더 비쌉니까?">
    모델의 단가는 모델 자체에서 정해집니다 — **더 큰 컨텍스트 윈도우 ≠ 더 높은 단가**입니다. 하지만 더 큰 컨텍스트 윈도우는 더 많은 입력을 넣을 수 있다는 뜻이며, 실제로 그만큼 채우면 입력 token이 급증하고 사전 차감과 실제 비용이 모두 커집니다. 비용이 많이 드는 것은 '얼마나 많이 넣느냐'이지 컨텍스트 윈도우 자체가 아닙니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="잔액이 있는데도 왜 실행되지 않습니까?" icon="credit-card" href="/ko/faq/balance-insufficient">
    잔액 부족에 대한 전체 문제 해결 및 해결 방법입니다.
  </Card>

  <Card title="max_tokens를 어떻게 설정합니까?" icon="ruler" href="/ko/faq/max-tokens">
    출력 길이를 제어하며, 이는 사전 차감 예상액에 영향을 줍니다.
  </Card>

  <Card title="token 과금 방식" icon="coins" href="/ko/faq/token-billing-modes">
    사용량 기반 정산이 어떻게 작동하는지 이해합니다.
  </Card>

  <Card title="결제 방법" icon="credit-card" href="/ko/faq/payment-methods">
    잔액이 부족할 때 빠르게 충전하는 방법입니다.
  </Card>
</CardGroup>
