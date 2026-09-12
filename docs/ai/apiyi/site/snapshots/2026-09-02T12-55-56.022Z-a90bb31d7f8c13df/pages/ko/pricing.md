> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 가격

> APIYI와 AI 모델 가격 책정 로직과 장점을 이해하고, 공식 출처보다 더 유리한 가격을 누리십시오. 저희는 투명하고 우대적인 가격 체계를 제공하여, 더 낮은 비용으로 최고 수준의 AI 모델 서비스를 이용하실 수 있게 합니다.

## APIYI 가격 원칙

### 1. 모델 가격 일치

* **해외 모델**: 가격은 공식 웹사이트와 동일합니다(예: OpenAI, Claude, Gemini, Grok 등)
* **국내 모델**: 가격은 공식 웹사이트보다 낮습니다(예: DeepSeek, Qwen, Doubao, Kimi 등)
* **희귀 모델**: 새로 출시된 일부 해외 모델(예: o3-pro)이나 접근 문턱이 높은 모델은 약간의 할증이 있을 수 있습니다. 그러나 충전 보너스와 할인을 적용하면 가격은 공식 요금에 가깝습니다.

<CardGroup cols={2}>
  <Card title="투명한 과금, 20% 할인" icon="tags">
    대부분의 모델 가격은 공식 요금과 동일합니다. 과금은 완전히 투명해 안심하실 수 있습니다\~
  </Card>

  <Card title="모델 완비, 빠른 업데이트" icon="bell-dot">
    제조사가 새 모델을 출시할 때마다 APIYI는 신속하게 업데이트합니다. 속도는 강점입니다!
  </Card>
</CardGroup>

## 충전 혜택

### 2. 고정 환율

<CardGroup cols={2}>
  <Card title="고정 환율" icon="dollar-sign">
    **1:7** 고정 환율

    실시간 환율에 따라 변동되지 않으므로 과금이 더 간단하며, 충전 프로모션과 함께 적용되어 추가 절약이 가능합니다
  </Card>

  <Card title="낮은 시작 기준" icon="coins">
    **\$5** 최소

    RMB 35만 있으면 사용을 시작할 수 있습니다
  </Card>
</CardGroup>

### 3. 충전 보너스

<Note>
  **충전할수록 더 많이 절약됩니다**

  첫 충전 보너스 + 단계별 보너스(10%-20%), 전체 할인은 공식 가격 기준 최대 **20% 할인**입니다
</Note>

<Card title="충전 프로모션 정책 전체 보기" icon="gift" href="/ko/faq/recharge-promotions">
  자세한 첫 충전 보너스, 단계별 보너스 비율, 기업 서비스 등을 확인해 보십시오
</Card>

## 공식 웹사이트 대비 더 많은 장점

무엇보다 공식 단일 계정과 비교하면 APIYI는 더 포괄적인 서비스를 제공합니다:

<CardGroup cols={2}>
  <Card title="무제한 사용" icon="infinity">
    * 요청 제한 없음
    * 계정 차단 위험 없음
    * 사용량 기반 과금
  </Card>

  <Card title="완전한 모델 선택" icon="layers">
    * 400개 이상의 인기 모델
    * 원클릭 전환
    * 지속적인 업데이트
  </Card>

  <Card title="손쉬운 통합" icon="plug">
    * 통합 API 인터페이스
    * OpenAI 형식 호환
    * 마이그레이션 비용 0
  </Card>

  <Card title="엔터프라이즈급 서비스" icon="shield-check">
    * 전문 기술 지원
    * 안정적이고 신뢰할 수 있음
    * 데이터 보안 보장
  </Card>
</CardGroup>

## 과금 기본 사항

### '종량제'란 무엇입니까?

종량제는 월간 또는 연간 선결제 없이 실제로 사용한 서비스에 대해서만 비용을 지불하는 방식입니다.

<CardGroup cols={2}>
  <Card title="유연한 사용" icon="chart-line">
    * 사용한 만큼만 지불
    * 최소 사용량 없음
    * 언제든지 시작하거나 중지 가능
  </Card>

  <Card title="비용 제어" icon="gauge">
    * 실시간 사용량 확인
    * 쿼터 알림 설정
    * 각 호출 단위로 정확히 계산
  </Card>
</CardGroup>

### 과금 모드 우선순위

APIYI는 두 가지 과금 모드를 지원합니다. 모델이 두 가지를 모두 지원하는 경우:

<Warning>
  **호출별 과금이 token별 과금보다 우선합니다**

  모델이 호출별 과금과 token별 과금을 모두 지원하면 시스템의 기본값은 호출별 과금입니다.
</Warning>

#### Token(API 키) 설정의 영향

과금 방식은 token 구성에도 영향을 받습니다:

<CardGroup cols={2}>
  <Card title="token 전용 과금" icon="sliders-horizontal">
    token이 "token 전용 과금"으로 설정되어 있으면 모델이 호출별 과금을 지원하더라도 token별 과금을 사용합니다
  </Card>

  <Card title="기본 설정" icon="circle-check">
    기본적으로 token은 모든 과금 모드를 지원하며, 시스템이 자동으로 선택합니다(호출별 과금 우선)
  </Card>
</CardGroup>

### '호출별 과금' 적용 사례

다음 유형의 모델은 일반적으로 호출별 과금을 사용합니다:

<Tabs>
  <Tab title="이미지 생성">
    **적용 가능한 모델**:

    * sora\_image 시리즈(역공학 모델)
    * flux-kontext-pro(공식 모델)
    * DALL-E 시리즈
    * Midjourney 관련 모델

    **과금 단위**: 이미지당
  </Tab>

  <Tab title="동영상 생성">
    **적용 가능한 모델**:

    * 동영상 생성 API
    * 애니메이션 모델

    **과금 단위**: 동영상당/초당
  </Tab>

  <Tab title="특수 모델">
    **식별 기준**:

    * `-all` 접미사가 있는 모델(역공학)
    * 특정 기능 모델

    **과금 단위**: 호출당
  </Tab>
</Tabs>

<Info>
  전체 모델 가격 목록 보기: [APIYI 가격](https://api.apiyi.com/account/pricing)
</Info>

### token이란 무엇입니까?

token은 AI 모델이 텍스트를 처리하는 기본 단위입니다. token을 이해하면 비용을 추정하고 통제하는 데 도움이 됩니다.

<Info>
  **token 계산 참고**

  * 중국어: 1자 ≈ 1-2 tokens
  * 영어: 1단어 ≈ 1-2 tokens
  * 1000 tokens ≈ 영어 750단어 ≈ 중국어 500자
</Info>

#### token 계산 예시

```
Input text: "Hello, please help me write a Python function"
Token count: About 12-15 tokens

Output text: "def hello_world():\n    print('Hello, World!')"
Token count: About 15-20 tokens

Total consumption: Input + Output ≈ 30-35 tokens
```

### Prompts와 completions

각 API 호출의 비용은 두 부분으로 구성됩니다:

<Steps>
  <Step title="Prompt - 입력 Tokens">
    모델에 보내는 모든 내용에는 다음이 포함됩니다:

    * 시스템 prompt
    * 사용자 질문
    * 컨텍스트 정보
    * 대화 기록(있는 경우)
  </Step>

  <Step title="Completion - 출력 Tokens">
    모델이 생성한 내용에는 다음이 포함됩니다:

    * 텍스트 응답
    * 코드 생성
    * 구조화된 데이터
  </Step>
</Steps>

<Warning>
  모델마다 입력 및 출력 가격이 다를 수 있습니다. 일반적으로 출력 tokens는 입력 tokens보다 비용이 더 높습니다.
</Warning>

## 올바른 모델을 선택하는 방법은?

### 모델 선택 전략

<Tabs>
  <Tab title="비용 우선">
    **적합한 사용 사례**: 배치 처리, 간단한 작업, 테스트 및 개발

    **추천 모델**:

    * gemini-2.5-flash (빠르고 우수함)
    * gpt-4.1 (gpt-4.5의 공식 대체)
    * deepseek-v3 (국내 강점, 높은 가성비)

    **예상 비용**: \$0.1-1/million tokens
  </Tab>

  <Tab title="성능 우선">
    **적합한 사용 사례**: 복잡한 추론, 전문 콘텐츠, 고품질 출력

    **추천 모델**:

    * gemini-2.5-pro (강력한 멀티모달)
    * claude-sonnet-4-20250514-thinking (긴 텍스트 처리)
    * o3 (OpenAI의 주요 추론 모델, 멀티모달)
    * deepseek-r1-0528 (R1 최적화 버전)

    **예상 비용**: \$3-15/million tokens
  </Tab>

  <Tab title="균형 잡힌 선택">
    **적합한 사용 사례**: 일상적인 사용, 중간 난이도 작업

    **추천 모델**:

    * gpt-4.1 (균형 잡힌 가성비)
    * claude-3-5-haiku-20241022 (빠른 응답)
    * qwen-max (중국어 최적화)

    **예상 비용**: \$0.5-3/million tokens
  </Tab>
</Tabs>

왼쪽의 “인기 모델” 페이지에서 자세한 내용을 확인하십시오.

### 비용 추정 방법

<Steps>
  <Step title="소량 샘플 테스트">
    소수의 샘플(5-10)로 테스트합니다.
  </Step>

  <Step title="사용량 로그 확인">
    APIYI 콘솔에서 각 호출의 상세 token 사용량을 확인합니다.
  </Step>

  <Step title="평균 계산">
    호출당 평균 token 수를 계산합니다.
  </Step>

  <Step title="총 비용 추정">
    평균 tokens × 예상 호출 수 × 모델 단가
  </Step>
</Steps>

<Card title="실용적인 조언" icon="lightbulb">
  1. 먼저 저렴한 모델로 테스트하여 실현 가능성을 검증합니다.
  2. APIYI 백엔드 로그를 통해 실제 소비량을 분석합니다.
  3. 작업 복잡도에 따라 적절한 모델을 선택합니다.
  4. 불필요한 token 소비를 줄이도록 prompt를 최적화합니다.
</Card>

## 실시간 가격 조회

<CardGroup cols={2}>
  <Card title="모델 가격 목록" icon="table" href="https://api.apiyi.com/account/pricing">
    모든 모델의 실시간 가격을 확인합니다

    * 토큰당 과금 가격
    * 호출당 과금 가격
    * 할인 비교
  </Card>

  <Card title="비용 계산기(개발 중)" icon="calculator" href="https://api.apiyi.com">
    사용 비용을 빠르게 추산합니다

    * 예상 사용량 입력
    * 모델 선택
    * 비용 자동 계산
  </Card>
</CardGroup>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="실시간 가격은 어떻게 확인하나요?">
    [APIYI 콘솔](https://api.apiyi.com)에 로그인하여 모델 목록 페이지에서 모든 모델의 실시간 가격을 확인할 수 있습니다.
  </Accordion>

  <Accordion title="충전은 얼마나 걸리나요?">
    충전은 즉시 반영되며, 결제 성공 후 바로 사용할 수 있습니다.
  </Accordion>

  <Accordion title="세금계산서를 지원하나요?">
    예, 공식 인보이스를 지원합니다. 콘솔에서 인보이스 신청을 제출해 주십시오.
  </Accordion>

  <Accordion title="대량 구매 할인은 있나요?">
    기업 대량 충전은 더 많은 할인을 받을 수 있습니다. 고객센터로 문의해 주십시오.
  </Accordion>
</AccordionGroup>

## 인보이스 정보

### 인보이스 발급 절차

온라인 충전 또는 법인 이체가 성공적으로 완료되면, 인보이스는 실제 결제 금액을 기준으로 발행됩니다(모든 가격에는 세금이 포함됩니다). 고객은 회사명 또는 대학명, 세금 ID 등 상세한 인보이스 정보를 제공해야 합니다.

<Steps>
  <Step title="인보이스 정보 제출">
    웹사이트 백엔드 상단 내비게이션 - 인보이스 발급, 인보이스 신청서 직접 제출

    [인보이스 신청서 제출 →](https://xinqikeji.feishu.cn/share/base/form/shrcns8TS3alZTN2Av1JfkOvmqh)
  </Step>

  <Step title="인보이스 유형">
    * VAT 일반 인보이스 발급 가능(특수 인보이스는 별도 세금 시점 협의 필요)
    * 인보이스 분류: **정보기술 서비스비** 또는 **데이터 수집비**
    * 제공 가능: 공식 직인이 찍힌 구매 목록
  </Step>

  <Step title="전달 시기">
    영업일 기준 약 1일이며, WeChat 또는 이메일로 전자 인보이스로 발송됩니다
  </Step>
</Steps>

<Info>
  저희는 대학 및 기업 고객이 많으며, 다양한 합리적인 비용 정산 요구를 수용할 수 있습니다.
</Info>

***

<Card title="시작하기" icon="rocket" href="https://api.apiyi.com">
  계정을 등록하고, 충전하여 할인 혜택을 누리며, 400개 이상의 AI 모델을 체험하세요
</Card>
