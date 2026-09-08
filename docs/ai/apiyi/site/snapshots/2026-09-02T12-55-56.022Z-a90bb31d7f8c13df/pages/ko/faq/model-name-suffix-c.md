> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 모델 이름의 -c 접미사는 무엇을 의미하나요?

> gemini-3-pro-image-preview-c 같은 -c 접미사가 붙은 모델 이름의 의미와 과금 차이를 설명합니다

## 간단 답변

<Info>
  **`-c`는 “호출”(건별 과금)을 의미합니다.**

  `-c` 접미사가 붙은 모델명(예: `gemini-3-pro-image-preview-c`)과 그렇지 않은 모델명(예: `gemini-3-pro-image-preview`)은 능력이 동일한 사실상 **동일한 모델**입니다. 유일한 차이는 과금 방식입니다. `-c` 버전은 특히 **건별 과금**용입니다.
</Info>

## 공식 설명

<img src="https://mintcdn.com/apiyillc/-8MuET9SQdeEzoC1/images/model-name-suffix-c-explain.png?fit=max&auto=format&n=-8MuET9SQdeEzoC1&q=85&s=892eb766d8a1d4f3ebd5a249d21b1d5a" alt="모델명 -c 접미사 설명" width="1062" height="476" data-path="images/model-name-suffix-c-explain.png" />

핵심 포인트:

* `-c`는 “call”을 뜻합니다 — 호출별 과금을 위한 별도의 모델 이름입니다
* 본질적으로 접미사가 없는 버전과 **동일한 모델**입니다
* 둘 다 공식 API 릴레이이며, 과금 방식을 구분하기 위해 서로 다른 모델 이름만 사용합니다
* 향후에는 과금이 오로지 token 과금 모드를 통해 구분될 수 있습니다

## 왜 -c 접미사인가?

APIYI는 토큰 기반 과금을 도입하고 있으며, 일부 모델은 토큰 기반 과금 방식과 호출당 과금 방식을 모두 지원합니다. 시스템은 서로 다른 과금 채널을 구분하기 위해 모델 이름 접미사를 사용합니다:

| Model Name                     | Billing Method | Description      |
| ------------------------------ | -------------- | ---------------- |
| `gemini-3-pro-image-preview`   | 토큰 기반          | 토큰 사용량에 따라 과금됩니다 |
| `gemini-3-pro-image-preview-c` | 호출당            | API 호출당 고정 요금    |

<Note>
  두 이름은 공식 API 포워딩을 통해 **완전히 동일한 공식 모델**을 호출합니다. 모델 기능과 출력 품질은 동일합니다.
</Note>

## 어떻게 선택합니까?

<CardGroup cols={2}>
  <Card title="Token 기반(접미사 없음)" icon="chart-line">
    **적합한 경우**:

    * 입력/출력 token 수가 적은 요청
    * 정밀한 비용 관리가 필요한 경우
    * 주로 텍스트 이해/분석 작업

    모델 이름에서 `-c`을 제외하고 사용합니다.
  </Card>

  <Card title="호출당(-c 접미사)" icon="hand">
    **적합한 경우**:

    * 이미지 생성 및 고정 출력 시나리오
    * 호출당 투명하고 고정된 비용
    * token 소비량을 계산할 필요가 없는 경우

    모델 이름에 `-c`을 붙여 사용합니다.
  </Card>
</CardGroup>

<Tip>
  **권장**: token을 생성할 때는 "**Token-first**" 과금 모드를 선택하십시오. 시스템이 자동으로 가장 적합한 과금 방식을 선택하므로, 모델 이름 접미사를 수동으로 구분할 필요가 없습니다. 자세한 내용은 [Token 과금 모드](/ko/faq/token-billing-modes)를 참조하십시오.
</Tip>

## 향후 계획

<Info>
  APIYI는 과금 시스템을 지속적으로 최적화하고 있습니다. 향후에는 과금이 **오직 token 과금 모드로만** 구분될 수 있으며, 모델 이름 접미사가 필요하지 않게 될 수 있습니다. 업데이트는 플랫폼 공지를 확인해 주시기 바랍니다.
</Info>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="-c 모델은 접미사가 없는 모델과 동일한가요?">
    **네, 완전히 동일한 모델입니다.**

    `-c` 접미사는 과금 채널만 식별하며 모델 기능에는 영향을 주지 않습니다. 두 이름은 결국 동일한 공식 API로 전달되며, 출력 품질도 같습니다.
  </Accordion>

  <Accordion title="어떤 모델 이름을 사용해야 하나요?">
    token의 과금 방식에 따라 다릅니다:

    * **토큰 우선 token**: 접미사 없는 이름을 사용하십시오(예: `gemini-3-pro-image-preview`). 시스템이 자동으로 처리합니다
    * **호출당 token**: `-c`가 포함된 이름을 사용하십시오(예: `gemini-3-pro-image-preview-c`)
    * **확실하지 않은 경우**: 접미사 없는 모델 이름과 함께 토큰 우선 token을 사용하는 것을 권장합니다
  </Accordion>

  <Accordion title="모든 모델에 -c 버전이 있나요?">
    아닙니다. token 기반 과금과 호출당 과금을 모두 지원하는 모델만 `-c` 접미사 버전이 있습니다. 순수 텍스트 모델(예: GPT-4o, Claude)은 일반적으로 token 기반 과금만 지원하며 `-c` 버전은 없습니다.
  </Accordion>

  <Accordion title="-c 접미사는 항상 존재하나요?">
    APIYI는 과금 시스템을 조정하고 있으며, 앞으로는 모델 이름 접미사 없이 과금 방식을 구분하지 않을 수도 있습니다. 대신 token 과금 모드를 통해 완전히 제어하는 방식으로 전환하고 있습니다. 향후 변경의 영향을 받지 않도록 토큰 우선 token을 사용하는 것을 권장합니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Token 과금 모드 설명" icon="calculator" href="/ko/faq/token-billing-modes">
    Token-first 및 Per-call을 포함한 5가지 과금 모드의 차이점을 알아봅니다
  </Card>

  <Card title="Token을 생성하는 방법?" icon="key" href="/ko/faq/token-management">
    API token을 생성하고 관리하는 완전한 가이드
  </Card>
</CardGroup>
