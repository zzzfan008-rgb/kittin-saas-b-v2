> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Token 과금 모드의 차이점은 무엇입니까?

> API.YI token의 5가지 과금 모드에 대한 자세한 설명, 사용 시나리오 및 모범 사례

## 간단한 답변

<Info>
  **권장 설정**: 토큰을 생성할 때는 대부분의 시나리오에 적합한 **“사용량 우선”** 과금 모드를 선택합니다.
</Info>

시스템은 5가지 과금 유형을 제공하지만, **“사용량 우선”을 기본값으로 사용하면** 모든 모델 호출 요구를 충족합니다.

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/Cic_8J3gmaYuqnbs/images/token-billing-modes.png?fit=max&auto=format&n=Cic_8J3gmaYuqnbs&q=85&s=0648c415db25659d45c57f46fab8ceb2" alt="Token 과금 모드 선택" width="1272" height="888" data-path="images/token-billing-modes.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/Cic_8J3gmaYuqnbs/images/token-billing-modes.png?fit=max&auto=format&n=Cic_8J3gmaYuqnbs&q=85&s=0648c415db25659d45c57f46fab8ceb2" alt="Token 과금 모드 선택" width="1272" height="888" data-path="images/token-billing-modes.png" />

## 5가지 과금 방식 설명

### 1. 사용량 기반 과금(Token 기반)

**정의**: 입력과 출력에 대한 **토큰** 수를 기준으로 과금하며, 사용한 만큼 지불합니다.

**적용 가능한 모델**:

* **텍스트 생성 모델**: GPT-4, Claude, Gemini, DeepSeek 등
* **멀티모달 이해 모델**: 이미지/오디오 입력을 지원하는 모델
* **특수 이미지 모델**: `gpt-image-1` (토큰 기준 과금)

**과금 공식**:

```
Total Cost = (Input Tokens × Input Price) + (Output Tokens × Output Price)
```

**예시**:

* `gpt-4o`: 입력 \$5/백만 tokens, 출력 \$15/백만 tokens
* `claude-3-5-sonnet-20241022`: 입력 \$3/백만 tokens, 출력 \$15/백만 tokens

<Tip>
  **gpt-image-1 특별 참고**: 이미지 생성 모델이지만 토큰 기준으로 과금됩니다. 토큰에 영향을 주는 요소는 다음과 같습니다.

  * 이미지 해상도 (1024x1024, 1792x1024 등)
  * 이미지 품질 (standard, hd)

  OpenAI는 서로 다른 해상도와 품질에 따른 토큰 소모량을 자세히 정리한 과금 표를 제공합니다.
</Tip>

***

### 2. 호출당 과금

**정의**: 호출 1회당 **고정 요금**이 부과되며, 입력과 출력 토큰의 영향을 받지 않습니다.

**적용 가능한 모델**:

* **이미지 생성 모델**: DALL-E, Flux, Sora Image 등 (gpt-image-1 제외)
* **동영상 생성 모델**: Sora Video, VEO 등

**과금 공식**:

```
Total Cost = Number of Calls × Price per Call
```

**예시**:

* `gemini-3-pro-image-preview` (별칭 `nano-banana-pro`): \$0.09/호출
* `sora_video2`: \$0.15/호출 (10초 동영상)
* `flux-1.1-pro`: \$0.04/호출

<Note>
  **호출당 과금의 장점**:

  * 투명한 요금 체계, 생성 1회당 고정 비용
  * 토큰 소모량을 계산할 필요가 없음
  * 이미지/동영상처럼 고정 출력 시나리오에 적합함
</Note>

***

### 3. 하이브리드 과금

**정의**: 사용량 기반 과금과 호출당 과금을 모두 지원하며, 모델에 따라 자동으로 선택됩니다.

**상태**: ⚠️ **적용 불가**

<Warning>
  현재 API.YI 플랫폼은 과금 혼선을 일으킬 수 있으므로 “하이브리드 과금” 모드를 **사용하지 않는 것**을 권장합니다. 대신 “사용량 기반 우선 과금”을 사용하십시오.
</Warning>

***

### 4. 사용량 기반 우선 과금(권장)

**정의**: 모델이 두 방식을 모두 지원할 경우 **사용량 기반 과금을 우선 적용**하는 **스마트 과금 모드**이며, 모델이 호출당 과금만 지원하면 자동으로 전환됩니다.

**권장 이유**:

* ✅ **호출당 과금 포함**: 호출당 요금이 부과되는 이미지/동영상 모델을 호출할 수 있습니다
* ✅ **사용량 기반 과금 포함**: 사용량 기준으로 과금되는 텍스트/멀티모달 모델을 호출할 수 있습니다
* ✅ **자동 적응**: 시스템이 가장 적합한 과금 방식을 자동으로 선택합니다
* ✅ **모든 시나리오 커버**: 지원되는 400개 이상의 모든 모델을 포괄합니다

**과금 로직**:

```
If model supports pay-per-use → Use pay-per-use billing
If model only supports pay-per-call → Use pay-per-call billing
```

**예시 시나리오**:

| 모델                           | 과금 방식     | 설명                     |
| ---------------------------- | --------- | ---------------------- |
| `gpt-4o`                     | 사용량 기반 과금 | 텍스트 모델, 사용량 기반 과금 우선   |
| `gpt-image-1`                | 사용량 기반 과금 | 이미지 모델이지만 토큰 기준 과금     |
| `gemini-3-pro-image-preview` | 호출당 과금    | 이미지 모델, 호출당 과금으로 자동 전환 |
| `sora_video2`                | 호출당 과금    | 동영상 모델, 호출당 과금으로 자동 전환 |

<Info>
  **권장 이유**: “사용량 기반 우선 과금” 토큰을 사용하면, 서로 다른 과금 방식마다 별도의 토큰을 만들지 않고도 모든 모델을 호출할 수 있습니다.
</Info>

***

### 5. 호출당 우선 과금

**정의**: 모델이 두 방식을 모두 지원할 경우 **호출당 과금을 우선 적용**하며, 모델이 사용량 기반 과금만 지원하면 자동으로 전환됩니다.

**적용 시나리오**:

* 고정 비용이 필요한 시나리오
* 주로 이미지/동영상 생성 모델을 사용하는 경우

**과금 로직**:

```
If model supports pay-per-call → Use pay-per-call billing
If model only supports pay-per-use → Use pay-per-use billing
```

<Note>
  **사용 권장**: 명확한 비용 통제 요구가 없다면, 텍스트 모델은 일반적으로 사용량 기반 과금이 더 비용 효율적이므로 “사용량 기반 우선 과금”을 사용하십시오.
</Note>

***

## 과금 모드를 선택하는 방법은?

### 권장 솔루션(사용자 95％에 적합)

<Card title="사용량 기반 우선(기본 권장)" icon="star">
  **적용 시나리오**:

  * 텍스트, 이미지, 동영상 모델을 동시에 사용하는 경우
  * 모델마다 서로 다른 token을 만들고 싶지 않은 경우
  * 최대한의 유연성이 필요한 경우

  **장점**:

  * 400개 이상의 모든 모델을 지원합니다
  * 시스템이 최적의 과금 방식을 자동으로 선택합니다
  * 추가 설정이 필요하지 않습니다
</Card>

### 특수 시나리오

<Tabs>
  <Tab title="순수 텍스트 애플리케이션">
    **시나리오**: GPT, Claude, Gemini 및 기타 텍스트 모델만 사용하는 경우

    **권장 과금 모드**: 사용량 기반 우선 또는 사용량 기반

    **이유**: 텍스트 모델은 모두 사용량 기반 과금을 사용하므로 두 모드의 효과가 같습니다
  </Tab>

  <Tab title="순수 이미지/동영상 애플리케이션">
    **시나리오**: DALL-E, Flux, Sora 및 기타 생성 모델만 사용하는 경우

    **권장 과금 모드**: 사용량 기반 우선 또는 호출 기반 우선

    **이유**: 대부분의 이미지/동영상 모델은 호출 기반 과금을 사용하지만, "사용량 기반 우선"은 자동으로 적응할 수 있습니다

    **참고**: `gpt-image-1`을 사용하는 경우, "사용량 기반 우선" 또는 "사용량 기반"을 사용해야 합니다
  </Tab>

  <Tab title="비용 제어">
    **시나리오**: 예산을 엄격하게 관리하며, 호출당 고정 비용을 원하는 경우

    **권장 과금 모드**: 호출 기반 또는 호출 기반 우선

    **이유**: 호출 기반 과금은 가격이 고정되어 있어 비용 예측이 쉽습니다

    **제한**: 텍스트 모델(GPT-4, Claude 등)을 호출할 수 없습니다
  </Tab>
</Tabs>

***

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="왜 gpt-image-1은 pay-per-use token을 요구합니까?">
    `gpt-image-1`은 OpenAI의 공식 이미지 생성 모델입니다. 이미지를 생성하지만, 과금 방식은 텍스트 모델과 비슷하며, **Tokens 기준으로 과금됩니다**.

    **과금 요인**:

    * 이미지 해상도 (1024x1024는 약 5000 token을 소비하며, 1792x1024는 약 8500 token을 소비합니다)
    * 이미지 품질 (HD 품질은 Token 소모를 증가시킵니다)

    **해결 방법**:

    * "Pay-per-Use Priority" 또는 "Pay-per-Use" token을 사용합니다
    * "Pay-per-Call" token을 사용하면 `gpt-image-1` 호출이 불가능합니다
  </Accordion>

  <Accordion title="이미 pay-per-call token을 만들었는데, pay-per-use priority로 변경할 수 있습니까?">
    **네, 수정할 수 있습니다**. 절차는 다음과 같습니다:

    1. [API.YI 토큰 관리 페이지](https://api.apiyi.com/token)에 로그인합니다
    2. 해당 token을 찾아 오른쪽의 "Edit" 버튼을 클릭합니다
    3. "Billing Mode" 드롭다운 메뉴에서 "Pay-per-Use Priority"를 선택합니다
    4. 구성을 저장합니다

    **참고**: 변경 사항은 기존 잔액에 영향을 주지 않고 즉시 적용됩니다.
  </Accordion>

  <Accordion title="pay-per-use priority와 pay-per-call priority의 차이는 무엇입니까?">
    **우선순위가 다릅니다**:

    | 과금 방식                 | 모델이 pay-per-use와 pay-per-call을 모두 지원할 때 | 적용 시나리오               |
    | --------------------- | --------------------------------------- | --------------------- |
    | Pay-per-Use Priority  | pay-per-use 과금을 우선 적용합니다                | 주로 텍스트 모델, 가끔 이미지/동영상 |
    | Pay-per-Call Priority | pay-per-call 과금을 우선 적용합니다               | 주로 이미지/동영상, 가끔 텍스트 모델 |

    **권장 사항**: 대부분의 경우 "Pay-per-Use Priority"를 사용합니다.
  </Accordion>

  <Accordion title="잘못된 과금 방식을 선택하면 호출에 실패합니까?">
    **즉시 실패하지는 않지만, 일부 모델은 호출할 수 없을 수 있습니다**.

    **예시 시나리오**:

    * token이 "Pay-per-Call"인 경우, `gpt-4o` 호출은 실패합니다 (gpt-4o는 pay-per-use 과금만 지원하기 때문입니다)
    * token이 "Pay-per-Use"인 경우, `gemini-3-pro-image-preview` 호출은 실패할 수 있습니다 (이 모델은 pay-per-call 과금만 지원하기 때문입니다)

    **해결 방법**: 이 문제를 피하려면 "Pay-per-Use Priority"를 사용합니다.
  </Accordion>

  <Accordion title="하이브리드 과금은 왜 적용되지 않습니까?">
    **하이브리드 과금은 이론적으로 pay-per-use와 pay-per-call을 모두 지원하지만, 실제로는 다음과 같은 문제가 생길 수 있습니다**:

    * 과금 로직이 불명확해집니다
    * 비용 예측이 어렵습니다
    * 시스템 호환성 문제가 발생할 수 있습니다

    **대안**: 더 나은 안정성과 신뢰성으로 동일한 효과를 얻으려면 "Pay-per-Use Priority"를 사용합니다.
  </Accordion>
</AccordionGroup>

## 요약 권장 사항

| 과금 모드         | 권장 사항 | 적용 가능한 시나리오        | 모델 범위                      |
| ------------- | ----- | ------------------ | -------------------------- |
| **사용량 기반 우선** | ⭐⭐⭐⭐⭐ | 모든 시나리오(기본 권장)     | 400개 이상의 모든 모델             |
| 사용량 기반        | ⭐⭐⭐   | 순수 텍스트/멀티모달 애플리케이션 | 텍스트 모델 + gpt-image-1       |
| 호출 기반         | ⭐⭐⭐   | 순수 이미지/동영상 애플리케이션  | 이미지/동영상 모델(gpt-image-1 제외) |
| 호출 기반 우선      | ⭐⭐    | 주로 이미지/동영상 사용      | 400개 이상의 모든 모델             |
| 하이브리드 과금      | ❌     | 권장하지 않음            | 과금 혼선을 일으킬 수 있음            |

<Info>
  **모범 사례**: token을 생성할 때는 모든 사용 시나리오를 포괄하면서 모델별로 서로 다른 token을 만들 필요가 없도록 “사용량 기반 우선” 과금 모드를 선택하십시오.
</Info>

## 관련 문서

* [KEY 생성 방법](/ko/faq/token-management)
* [Tokens에 사용 가능한 모델을 설정해야 합니까?](/ko/faq/token-model-whitelist)
* [가격](/ko/pricing)
* [모델 목록](/ko/api-capabilities/model-info)
