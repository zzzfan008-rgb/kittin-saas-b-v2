> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API 동시 실행 수 제한은 무엇입니까?

> 다양한 모델 유형의 동시 실행 수 제한과 더 높은 쿼터를 요청하는 방법을 알아봅니다

## 간단 답변

**동시 실행 수 제한은 모델 유형에 따라 다릅니다** - 텍스트 모델은 동시 실행 수가 가장 높고, 이미지 모델은 중간 수준의 제어가 있습니다.

<Info>
  **중요한 참고 사항**

  동시 실행 수 제한은 **개별 모델**에 적용되며, 전체 계정에는 적용되지 않습니다. 예를 들어, Nano Banana Pro는 동시 요청 30개를 허용하며, 이는 다른 모델의 동시 실행 수에는 영향을 주지 않습니다.
</Info>

## 모델 유형별 동시 실행 수 제한

<CardGroup cols={3}>
  <Card title="텍스트 모델" icon="file-text">
    **기본값: 50 req/sec**

    * ✅ 높은 동시 실행 수 지원
    * ✅ 배치 처리에 적합
    * 🔓 더 높은 쿼터를 이용할 수 있습니다
  </Card>

  <Card title="비동기 동영상 모델" icon="video">
    **기본값: 높은 동시 실행 수**

    * ✅ 비동기 처리
    * ✅ 대규모 호출 지원
    * 📊 배치 동영상 생성에 적합
  </Card>

  <Card title="이미지 모델" icon="image">
    **기본값: 30 req/sec**

    * ⚠️ 동시 실행 수가 제어됩니다
    * 📦 Base64 대용량 데이터 전송
    * 🔓 요청 시 조정 가능합니다
  </Card>
</CardGroup>

## 이미지 모델에 동시 실행 수 제어가 필요한 이유는 무엇입니까?

<Warning>
  **기술적 이유**

  이미지 생성 API는 **Base64 인코딩**을 사용해 이미지 데이터를 전송하므로, 요청 페이로드가 커집니다(요청당 일반적으로 500KB-5MB). 서비스 안정성과 응답 속도를 보장하기 위해 적절한 동시 실행 수 제어가 필요합니다.

  **예시**: Nano Banana Pro는 기본 동시 요청 수가 30개이며, 대부분의 사용 사례에 충분합니다.
</Warning>

## 동시 실행 수 계산 방식

### 개별 모델별

동시 실행 수 제한은 **계정 전체**가 아니라 **각 특정 모델**에 적용됩니다:

| 시나리오        | 동시 실행 수 계산                                |
| ----------- | ----------------------------------------- |
| 동일한 모델 호출   | 해당 모델의 제한을 따릅니다. (예: Nano Banana Pro: 30) |
| 서로 다른 모델 호출 | 각 모델이 독립적으로 계산됩니다                         |
| 여러 token    | 각 token은 독립적인 동시 실행 수를 가집니다               |

<Tip>
  **실제 예시**

  다음을 동시에 사용하면:

  * Nano Banana Pro(이미지): 동시 30개
  * GPT-4o mini(텍스트): 동시 50개
  * FLUX.1 Pro(이미지): 동시 30개

  **사용 가능한 총 동시 실행 수**: 110개 이상 요청(모델별로 독립적임)
</Tip>

## 더 높은 동시 실행 수를 요청하는 방법?

### 개인 사용자

<Steps>
  <Step title="필요 사항 평가">
    필요한 동시 실행 수 수준과 사용 사례를 정하십시오
  </Step>

  <Step title="지원팀 문의">
    [기업 위챗으로 문의해 주십시오](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)하여 필요 사항을 설명하십시오
  </Step>

  <Step title="기술 검토">
    사용 사례와 기존 데이터를 바탕으로 평가하겠습니다
  </Step>

  <Step title="쿼터 조정">
    승인되면 token의 동시 실행 수 제한을 조정하겠습니다
  </Step>
</Steps>

### 기업 고객

<Info>
  **전용 회선 서비스**

  기업 고객은 다음과 같은 전용 회선 서비스를 신청할 수 있습니다:

  * 🚀 **더 높은 동시 실행 수 쿼터**: 비즈니스 요구에 맞춰 맞춤 설정됩니다
  * 🔒 **격리된 리소스 풀**: 공용 트래픽의 영향을 받지 않습니다
  * ⚡ **우선 스케줄링**: 보장된 응답 속도
  * 📞 **전담 지원**: 일대일 서비스

  기업 서비스 플랜에 대해 알아보시려면 문의해 주십시오.
</Info>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="텍스트 모델의 동시 실행 수가 이미지 모델보다 높은 이유는 무엇입니까?">
    텍스트 모델은 요청/응답 payload가 더 작고(일반적으로 몇 KB 수준), 반면 이미지 모델은 Base64로 인코딩된 이미지 데이터를 전송합니다(일반적으로 500KB-5MB). 동시 실행 수 제어는 전체 서비스 품질을 보장합니다.
  </Accordion>

  <Accordion title="현재 동시 실행 수 쿼터는 어떻게 확인합니까?">
    다음 방법으로 확인할 수 있습니다:

    * 백엔드 콘솔 token 설정
    * API 응답 헤더의 요청 제한 정보
    * 구체적인 쿼터는 고객 서비스에 문의
  </Accordion>

  <Accordion title="동시 실행 수 제한을 초과하면 어떻게 됩니까?">
    제한을 초과하면 API는 `429 Too Many Requests`를 반환합니다. 권장 사항:

    * 요청 큐 관리 구현
    * 재시도 메커니즘 추가(지수 백오프)
    * 더 높은 동시 실행 수 쿼터 신청
  </Accordion>

  <Accordion title="다른 token 간에 동시 실행 수 제한이 공유됩니까?">
    아닙니다. 각 token은 간섭 없이 독립적인 동시 실행 수 쿼터를 가집니다. 총 동시 실행 수를 높이려면 여러 token을 생성하여 요청을 분산하십시오.
  </Accordion>

  <Accordion title="동시 실행 수 쿼터 조정에 추가 비용이 있습니까?">
    일반적으로 합리적인 동시 실행 수 조정은 **무료입니다**. 다만 매우 높은 동시 실행 수나 전용 회선 서비스는 기업 맞춤형 플랜이 필요할 수 있으므로, 자세한 내용은 고객 서비스에 문의하십시오.
  </Accordion>
</AccordionGroup>

## 동시 실행 수 최적화 팁

<CardGroup cols={2}>
  <Card title="요청 큐 사용" icon="list">
    로컬 큐 관리를 구현하여 동시 요청을 제어하고 제한을 피합니다
  </Card>

  <Card title="오류 재시도 메커니즘" icon="refresh-cw">
    429 오류가 발생하면 지수 백오프 재시도 전략을 사용합니다
  </Card>

  <Card title="여러 token 분산" icon="key">
    여러 token을 생성하여 요청을 서로 다른 token에 분산하고 전체 동시 실행 수를 늘립니다
  </Card>

  <Card title="비동기 처리 우선" icon="clock">
    실시간이 아닌 시나리오에서는 비동기 API(예: 동영상 생성)를 우선 사용합니다
  </Card>
</CardGroup>

## 문의하기

더 높은 동시 실행 수 쿼터를 요청하거나 기업 전용 회선 서비스에 대해 문의하려면:

<CardGroup cols={3}>
  <Card title="이메일 지원" icon="mail">
    [feedback@apiyi.com](mailto:feedback@apiyi.com)

    동시 실행 수 요구 사항을 자세히 설명해 주십시오
  </Card>

  <Card title="기업용 WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="기업용 WeChat QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QR 코드를 스캔하거나 [눌러 지원팀에 문의](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)하십시오.

    빠른 응답, 실시간 소통
  </Card>

  <Card title="Telegram" icon="send">
    @apiyi001

    즉시 메시지로 효율적인 답변
  </Card>
</CardGroup>

<Tip>
  **요청 시 다음 정보를 제공해 주십시오**:

  * 📊 **사용 사례**: 구체적인 적용 사례(예: 전자상거래 대량 이미지 생성, 콘텐츠 검토)
  * 📈 **예상 동시 실행 수**: 필요한 동시 실행 수 수준
  * 🕐 **피크 시간대**: 주된 사용 시간대
  * 📜 **과거 데이터**: 현재 호출량과 빈도

  이 정보는 가장 적합한 동시 실행 수 쿼터 플랜을 제공하는 데 도움이 됩니다.
</Tip>
