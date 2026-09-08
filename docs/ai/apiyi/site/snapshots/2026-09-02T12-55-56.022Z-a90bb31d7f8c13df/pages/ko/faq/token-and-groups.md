> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# token 및 그룹

> APIYI token(API 키)이 하는 일, 생성 및 편집 방법, 그리고 기본 그룹과 폴백 그룹을 포함해 그룹이 작동하는 방식을 알아봅니다.

## token이란 무엇입니까(API 키)

token은 APIYI를 호출할 때 사용하는 `sk-`로 시작하는 **API 키**입니다. 이는 귀하의 신원과 권한을 위한 인증 정보입니다. 주요 역할은 다음과 같습니다:

<CardGroup cols={2}>
  <Card title="인증" icon="shield">
    모든 API 호출에는 신원과 계정을 확인하기 위한 token이 포함되어야 합니다.
  </Card>

  <Card title="쿼터 및 권한 제어" icon="sliders-horizontal">
    token별로 전용 쿼터, 만료일, 허용 모델 및 그룹을 설정할 수 있습니다.
  </Card>

  <Card title="사용 통계" icon="chart-line">
    각 token의 지출, 남은 쿼터, 호출 로그를 독립적으로 추적합니다.
  </Card>

  <Card title="유연한 할당" icon="users">
    서로 다른 프로젝트나 팀원별로 별도의 token을 생성할 수 있습니다.
  </Card>
</CardGroup>

<Info>
  등록 후 시스템은 별도 설정 없이 바로 사용할 수 있는 **기본 token**을 자동으로 생성합니다. 필요에 따라 추가 token도 생성할 수 있습니다.
</Info>

## 토큰을 만드는 방법

<Steps>
  <Step title="토큰 페이지 열기">
    상단 내비게이션에서 “Token” 페이지를 엽니다: [https://api.apiyi.com/token](https://api.apiyi.com/token)
  </Step>

  <Step title="‘New’ 클릭">
    오른쪽 상단의 “New” 버튼을 클릭하여 토큰 생성 대화상자를 엽니다.
  </Step>

  <Step title="토큰 세부정보 입력">
    토큰 이름, 쿼터(무제한 선택 가능), 만료(만료 없음 선택 가능), 과금 방식, 그룹(아래 참조)을 설정합니다.
  </Step>

  <Step title="저장하고 KEY 복사">
    저장한 후 토큰 오른쪽의 복사 아이콘을 클릭하여 전체 `sk-` KEY를 복사합니다.
  </Step>
</Steps>

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="새 토큰 생성" width="1284" height="1158" data-path="images/key-add-new.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="새 토큰 생성" width="1284" height="1158" data-path="images/key-add-new.png" />

<Tip>
  토큰을 생성할 때 **허용할 모델을 설정할 필요는 없습니다**. 허용 목록 방식이 적용됩니다: 비워 두면 토큰이 400개 이상의 모든 모델을 사용할 수 있고, 설정하면 해당 모델로 제한됩니다. [토큰 모델 허용 목록](/ko/faq/token-model-whitelist)을 참조하세요.
</Tip>

## 토큰 편집 및 코드 예제 보기

모든 작업을 펼치려면 “작업” 열의 \*\*관리 메뉴(렌치 아이콘)\*\*를 클릭합니다:

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/apiyi-token-simple-code.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=067d8d551cd1d8aaebb833932e6632a5" alt="토큰 관리 메뉴 및 요청 예시" width="1496" height="902" data-path="images/apiyi-token-simple-code.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/apiyi-token-simple-code.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=067d8d551cd1d8aaebb833932e6632a5" alt="토큰 관리 메뉴 및 요청 예시" width="1496" height="902" data-path="images/apiyi-token-simple-code.png" />

| 작업                 | 설명                                                                      |
| ------------------ | ----------------------------------------------------------------------- |
| **토큰 비활성화**        | 토큰을 일시적으로 비활성화하며, 호출은 거부됩니다                                             |
| **토큰 편집**          | 이름, 쿼터, 만료일, 과금 방식, 그룹 등을 변경합니다                                         |
| **요청 예시**          | **코드 예제 보기** — 이 토큰에 대해 바로 실행할 수 있는 호출 코드를 여러 언어(curl, Python 등)로 제공합니다 |
| **토큰 로그**          | 이 토큰의 호출 기록을 봅니다                                                        |
| **토큰 공유 / 원클릭 설정** | 서드파티 도구와 빠르게 공유하거나 연동합니다                                                |

<Note>
  “요청 예시”는 **코드 예제** 진입점입니다. 현재 토큰이 미리 채워진 실행 가능한 호출 코드를 생성하므로, KEY와 엔드포인트를 직접 조합할 필요가 없습니다. 빠른 테스트와 연동에 적합합니다.
</Note>

## 여러 사람이 하나의 token을 함께 사용하면 요청 제한이 걸리나요?

고객들이 자주 묻는 질문입니다: **“하나의 token을 여러 사람이 공유하면 요청 제한이 걸리나요?”**

답은 **token 자체에는 요청 제한이 없습니다**입니다. 요청 제한은 보유한 token 수나 사용하는 사람 수와 관계없이 **계정**을 따릅니다. 즉, 10명이 하나의 token을 공유하든 1명이 token 10개를 각각 사용하든, 동작은 정확히 동일합니다.

<CardGroup cols={2}>
  <Card title="RPM (분당 요청 수)" icon="gauge">
    일반적으로 **100 RPM**까지 사용하는 단일 계정이면 충분합니다. 대부분의 팀과 애플리케이션에 넉넉한 수준입니다.
  </Card>

  <Card title="TPM (분당 token 수)" icon="infinity">
    **TPM은 적용되지 않으므로**, 긴 컨텍스트나 높은 동시 token 사용량 때문에 제한이 걸릴 걱정을 하지 않으셔도 됩니다.
  </Card>
</CardGroup>

<Tip>
  token을 공유해도 요청 제한에는 영향을 주지 않지만, **관리** 측면에서는 구성원이나 프로젝트마다 별도의 token을 사용하는 것을 여전히 권장합니다. 그러면 각자 고유의 quota, 호출 로그, 지출 통계를 갖게 됩니다.
</Tip>

## 그룹이란

**그룹은 token에 대해 선택할 수 있는 “리소스 채널”입니다.** 서로 다른 그룹은 서로 다른 상위 리소스, 사용 가능한 모델 범위, 그리고 과금 요율 배수에 매핑되며, **사용자가 선택할 수 있도록 열려 있습니다**.

요약하면: 동일한 모델이 여러 상위 채널로 제공될 수 있으며, 그룹은 사용할 채널을 선택하게 합니다. **서로 다른 모델은 서로 다른 그룹이 필요할 수 있습니다**, 따라서 올바른 그룹을 선택하면 호출이 정상적으로 작동하고 해당 할인도 적용됩니다.

<Info>
  대부분의 경우, **기본 그룹(Default)** 만으로 충분합니다 — 텍스트 모델, NanoBanana 시리즈, Veo 3.1, 그리고 대부분의 다른 모델을 포함한 전체 모델 커버리지를 제공합니다.
</Info>

## 기본 그룹 및 대체 그룹

하나의 token에는 최대 **3개 그룹**: **기본 그룹 1개 + 대체 그룹 2개**.

<CardGroup cols={2}>
  <Card title="기본 그룹(주)" icon="circle-check">
    token이 가장 먼저 사용하는 그룹이며, 대부분의 모델을 지원합니다. 모든 token에는 기본 그룹 1개가 있어야 합니다.
  </Card>

  <Card title="대체 그룹(백업)" icon="life-buoy">
    기본 그룹이 요청을 처리할 수 없을 때 자동으로 활성화되는 백업 채널입니다. 최대 2개까지 추가할 수 있으며, 호출 성공률을 높입니다.
  </Card>
</CardGroup>

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/UCijFWltmtlBUyvg/images/nano-banana-token-fallback-setup.png?fit=max&auto=format&n=UCijFWltmtlBUyvg&q=85&s=60e569c034776ae83d9866fcfac343c0" alt="그룹 및 대체 그룹 선택" width="1276" height="1176" data-path="images/nano-banana-token-fallback-setup.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/UCijFWltmtlBUyvg/images/nano-banana-token-fallback-setup.png?fit=max&auto=format&n=UCijFWltmtlBUyvg&q=85&s=60e569c034776ae83d9866fcfac343c0" alt="그룹 및 대체 그룹 선택" width="1276" height="1176" data-path="images/nano-banana-token-fallback-setup.png" />

token 생성/편집 대화상자에서:

* **그룹 선택**: 기본(주) 그룹을 설정합니다, 기본적으로 `Default`입니다
* **대체 그룹**: 주 그룹을 사용할 수 없을 때 대신할 1–2개의 백업 그룹을 추가합니다

<Tip>
  **그룹은 token의 과금 요율 배수와 사용 가능한 모델에 영향을 미칩니다.** 실제로 사용하는 모델을 기준으로 선택하십시오. 잘 모르겠다면 기본 `Default` 그대로 유지하십시오.
</Tip>

## 서로 다른 모델에는 서로 다른 그룹이 필요합니다

기본 그룹은 대부분의 모델을 지원하지만, 일부 모델(특히 **동영상 모델**)에는 전용 그룹이 필요합니다:

| 모델 / 시나리오                                | 선택할 그룹              |
| ---------------------------------------- | ------------------- |
| 텍스트, 멀티모달, NanoBanana, Veo 3.1 및 대부분의 모델 | **Default**         |
| Sora 2 공식 동영상                            | **Sora2Official**   |
| Alibaba Wan & HappyHorse 동영상 시리즈         | **Wan\&HappyHorse** |

<Warning>
  Sora 2 공식, Wan\&HappyHorse 및 기타 전용 그룹 모델을 호출할 때, token에 일치하는 그룹이 없으면 해당 모델을 사용할 수 없습니다. 자주 사용하는 전용 그룹을 대체용으로 추가하거나, 이러한 모델용으로 별도의 token을 생성하는 것을 고려하십시오.
</Warning>

## 그룹 개요

아래는 시스템이 제공한 그룹과 설명입니다(콘솔 표기가 기준입니다):

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/token-groups-overview-20260527.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=5a8d30f9f468b01afda6aeb52ae98912" alt="APIYI token group overview" width="1200" height="844" data-path="images/token-groups-overview-20260527.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/token-groups-overview-20260527.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=5a8d30f9f468b01afda6aeb52ae98912" alt="APIYI token group overview" width="1200" height="844" data-path="images/token-groups-overview-20260527.png" />

<Note>
  “그룹 요율 배수” 열은 RMB로 책정된 상대 값입니다 — 이는 **USD에 대한 직접 할인 비율이 아니므로**, 너무 깊게 해석할 필요는 없습니다. 모델에 맞는 그룹을 선택하시면 됩니다. 배수와 가격 환산을 이해하려면 [모델의 배수란 무엇입니까?](/ko/faq/model-multiplier)를 참조하십시오.
</Note>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Token 과금 모드" icon="calculator" href="/ko/faq/token-billing-modes">
    사용량별 과금 모드와 호출당 과금 모드의 차이를 이해합니다.
  </Card>

  <Card title="Token 모델 허용 목록" icon="list" href="/ko/faq/token-model-whitelist">
    단일 token이 사용할 수 있는 모델을 제한하는 방법입니다.
  </Card>

  <Card title="모델 요율 배수" icon="percent" href="/ko/faq/model-multiplier">
    요율 배수의 의미와 가격 계산을 이해합니다.
  </Card>

  <Card title="호출 로그" icon="file-text" href="/ko/faq/call-logs">
    token별 호출 기록과 지출 내역을 확인합니다.
  </Card>
</CardGroup>
