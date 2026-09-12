> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Cherry Studio

> OpenAI, Anthropic, Gemini 채널 유형을 지원하는 강력한 AI 대화 클라이언트 통합 가이드

Cherry Studio는 여러 대규모 언어 모델을 지원하는 강력한 AI 대화 클라이언트입니다. APIYI를 통해 Cherry Studio에서 다양한 주요 AI 모델을 사용할 수 있으며, 최적의 사용 경험과 비용 최적화를 위해 다양한 채널 유형을 선택할 수 있습니다.

## 빠른 통합 (OpenAI 호환 형식)

이 방법은 가장 범용적인 통합 방식으로, APIYI의 400개 이상의 모든 모델을 지원합니다.

### 1. API Key 가져오기

API key를 가져오려면 [API Key 관리 튜토리얼](/ko/faq/token-management)을 참고하십시오.

### 2. 구성 단계

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/cherry-studio-config.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=697ce7c87d0a7ddadbc2a4ae4eeca322" alt="Cherry Studio OpenAI 호환 구성 인터페이스" width="2400" height="1668" data-path="images/cherry-studio-config.png" />

위 이미지를 참고하여 다음 구성 단계를 완료하십시오.

1. Cherry Studio 애플리케이션을 엽니다
2. 왼쪽의 설정 아이콘을 클릭하여 설정 페이지로 들어갑니다
3. “Model Service” 옵션을 선택합니다
4. 모델 공급자 목록에서 사용자 지정 채널 \[APIYI]를 생성합니다
5. 구성 정보를 입력합니다:
   * **API Address**: `https://api.apiyi.com`
   * **API Key**: APIYI key를 입력합니다 ([가져오는 방법](/ko/faq/token-management))
6. 하단의 “➕ Add” 버튼을 클릭하여 구성을 저장합니다

<Info>
  **구성 핵심 포인트**

  * API 주소는 반드시 `https://api.apiyi.com`를 사용해야 합니다
  * API key 설정은 [API Key 관리 튜토리얼](/ko/faq/token-management)을 참고하십시오
  * 올바른 구성을 위해 먼저 연결 테스트를 해보는 것이 좋습니다
</Info>

## 세 가지 채널 유형 비교

Cherry Studio는 여러 채널 유형을 지원하며, 모두 APIYI를 통해 접근할 수 있습니다. 사용 사례에 가장 적합한 방법을 선택하십시오:

| 기능          | OpenAI 호환                         | Anthropic 형식       | Gemini 형식      |
| ----------- | --------------------------------- | ------------------ | -------------- |
| **API 주소**  | 모두 `https://api.apiyi.com`를 사용합니다 |                    |                |
| **지원되는 모델** | 400개 이상의 모든 모델                    | Claude 모델만         | Gemini 모델만     |
| **핵심 장점**   | 범용 호환성                            | 캐시 비용 절감           | 기본 기능 + 이미지 생성 |
| **캐시 과금**   | 해당 없음                             | 캐시된 token 약 10% 가격 | 해당 없음          |
| **특수 기능**   | 가장 넓은 모델 지원                       | 채팅 비용 최적화          | 텍스트-이미지, 코드 실행 |
| **적합한 경우**  | 일반 사용, 다중 모델                      | Claude를 많이 사용하는 경우 | Gemini 전용 기능   |

<Tip>
  **선택 방법은?**

  * 여러 모델을 사용한다면 **OpenAI 호환 형식**을 선택하십시오(권장 기본값)
  * 주로 Claude를 사용하고 대화가 잦으며(5분 이내), 비용을 절감하고 싶다면 **Anthropic 형식**을 선택하십시오
  * Gemini의 텍스트-이미지 또는 기타 기본 기능이 필요하다면 **Gemini 형식**을 선택하십시오
</Tip>

## Anthropic 채널 유형

Anthropic 기본 형식은 \*\*[프롬프트 캐싱](/ko/api-capabilities/claude-prompt-caching)\*\*을 지원합니다. 5분 이내의 연속 대화에서는 캐시된 입력 token의 비용이 일반 가격의 약 10%에 불과하여 사용 비용을 크게 줄일 수 있습니다.

### 설정 단계

<img src="https://mintcdn.com/apiyillc/7TkKa5JmqO5PH0BI/images/cherry-studio-anthropic-provider.png?fit=max&auto=format&n=7TkKa5JmqO5PH0BI&q=85&s=2f3eeb3f3536cbe6cb0ec1f2bd2478f8" alt="Cherry Studio Anthropic 공급자 추가 대화상자" width="1570" height="1020" data-path="images/cherry-studio-anthropic-provider.png" />

1. Cherry Studio 설정 → 모델 서비스를 엽니다.
2. 하단의 “➕ 추가” 버튼을 클릭한 뒤 대화상자에 다음을 입력합니다.
   * **공급자 이름**: 사용자 지정 이름(예: `APIYI-CLAUDE`, 쉽게 식별하기 위해)
   * **공급자 유형**: **Anthropic** 선택
3. “확인”을 클릭해 생성한 후, 새 채널에서 구성을 입력합니다.
   * **API 주소**: `https://api.apiyi.com`
   * **API 키**: APIYI 키를 입력합니다.
4. 원하는 Claude 모델을 추가합니다(예: `claude-sonnet-4-5-20250929`, `claude-opus-4-5-20251101`)

<Warning>
  **참고**: Anthropic 채널은 Claude 시리즈 모델만 지원합니다. 다른 모델은 OpenAI 호환 형식 채널을 사용합니다.
</Warning>

### 사용 시점

* **연속 대화**: 5분 이내의 빈번한 채팅은 캐시 적중률이 높아 비용을 크게 절약합니다.
* **긴 컨텍스트 대화**: 컨텍스트가 길수록 캐싱으로 더 많이 절약합니다.
* **가끔 하는 채팅**: 드물게만 채팅한다면 OpenAI 호환 형식도 충분히 잘 작동합니다.

<CardGroup cols={2}>
  <Card title="Claude API 문서" icon="book" href="/ko/api-capabilities/claude">
    스트리밍, 확장 추론 및 기타 고급 기능을 포함한 전체 Anthropic 기본 형식 API 문서를 확인합니다.
  </Card>

  <Card title="프롬프트 캐싱 심층 분석" icon="database" href="/ko/api-capabilities/claude-prompt-caching">
    프롬프트 캐시가 과금을 10%로 줄이는 방법을 알아봅니다. 트리거 조건, 최소 예제, 흔한 함정도 함께 다룹니다.
  </Card>
</CardGroup>

## Gemini 채널 유형

Gemini 네이티브 형식은 `gemini-3-pro-image-preview`를 사용한 **텍스트-이미지 생성**, 코드 실행, 네이티브 추론 제어 등 Gemini 전용 기능을 모두 지원합니다.

### 구성 단계

1. Cherry Studio 설정 → Model Service를 엽니다.
2. 새 채널을 생성하고, **채널 유형으로 Google Gemini를 선택합니다**
3. 구성을 입력합니다:
   * **API 주소**: `https://api.apiyi.com`
   * **API 키**: APIYI 키를 입력합니다
4. 원하는 Gemini 모델을 추가합니다(예: `gemini-2.5-flash`, `gemini-3-pro-preview`, `gemini-3-pro-image-preview`)

<Warning>
  **참고**: Gemini 채널은 Gemini 시리즈 모델만 지원합니다. 다른 모델의 경우 OpenAI 호환 형식 채널을 사용하십시오.
</Warning>

### 특수 기능

* **텍스트-이미지**: `gemini-3-pro-image-preview` 모델을 사용하여 대화 중에 이미지를 직접 생성합니다
* **코드 실행**: 모델은 데이터 분석을 위해 Python 코드를 자동으로 실행할 수 있습니다
* **추론 제어**: `thinking_budget`을 통해 추론 깊이를 세밀하게 조정합니다
* **멀티모달 지원**: 이미지, 오디오, 비디오 및 기타 미디어 입력을 완벽하게 지원합니다

<Card title="Gemini 네이티브 형식 문서" icon="sparkles" href="/ko/api-capabilities/gemini/native">
  멀티모달 처리, 추론 제어, 코드 실행 등을 포함한 완전한 Gemini 네이티브 형식 API 문서를 확인합니다.
</Card>

## 모델 추가

채널을 구성한 후 해당 채널에서 필요한 모델을 추가합니다:

1. 모델 검색창에서 모델을 검색합니다
2. 모델 이름 옆 아이콘을 클릭하여 선택하거나 구성합니다
3. 필요에 따라 다양한 모델 변형을 활성화하거나 비활성화합니다

<Card title="최신 모델 추천 보기" icon="star" href="/ko/api-capabilities/model-info">
  최신 모델 추천, 성능 비교, 사용 권장 사항을 확인합니다. 최신이면서 가장 강력한 AI 모델을 사용하실 수 있도록 모델은 지속적으로 업데이트됩니다.
</Card>

<Info>
  **왜 여기에는 특정 모델을 나열하지 않습니까?**

  AI 모델은 매우 자주 업데이트됩니다. 가장 정확한 모델 추천을 제공하기 위해 최신 모델 목록, 성능 데이터, 사용 권장 사항을 [모델 추천 페이지](/ko/api-capabilities/model-info)에서 관리합니다.
</Info>

## 고급 기능

### 이미지 지원

이미지를 지원하는 모델(예: GPT-4V)을 사용하는 경우:

1. 설정에서 “이미지” 옵션을 활성화합니다
2. 비전 기능을 지원하는 모델을 선택합니다
3. 대화에서 이미지를 업로드합니다

### 스트리밍 출력

Cherry Studio는 기본적으로 스트리밍 출력을 지원하여 더 나은 사용 경험을 제공합니다.

## 문제 해결

### 연결 실패

* API 키가 올바른지 확인합니다.
* API 주소를 확인합니다: `https://api.apiyi.com`
* 네트워크 연결 상태를 확인합니다.

### 모델을 사용할 수 없음

* 계정 잔액이 충분한지 확인합니다.
* 모델이 올바른 채널 유형에 있는지 확인합니다(예: Claude 모델은 OpenAI 또는 Anthropic 채널에 있어야 합니다).
* 다른 모델을 시도합니다.

## 사용 팁

1. **채널을 신중하게 선택합니다**: 주요 모델에 따라 적절한 채널 유형을 선택하십시오 — 여러 채널을 동시에 설정할 수 있습니다
2. **모델을 신중하게 선택합니다**: 작업 요구사항에 따라 적절한 모델을 선택하십시오
3. **정기적으로 업데이트합니다**: 새로운 모델 출시를 확인하십시오
4. **사용량을 모니터링합니다**: APIYI를 통해 사용량을 확인하십시오

도움이 더 필요하신가요? [APIYI 공식 웹사이트](https://api.apiyi.com)를 방문해 주십시오.
