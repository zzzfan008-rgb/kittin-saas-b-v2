> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 100 RMB로 어느 정도 컴퓨팅 파워를 얻을 수 있습니까?

> APIYI는 모델 서비스와 과금만 제공합니다. RMB와 컴퓨팅 파워 간의 환산 비율은 귀하의 플랫폼에서 직접 정의합니다.

## 간단한 답변

APIYI는 “100 RMB로 얼마나 많은 컴퓨팅 파워를 얻을 수 있는지”에 대해 표준 답변을 제공할 수 없습니다.

“컴퓨팅 파워”는 일반적으로 귀하의 플랫폼 내부에서 정의되는 단위입니다. 환산 비율, 차감 규칙, 소모 로직은 모두 귀하가 설계하고 관리합니다. APIYI는 모델 서비스 제공자이며, 귀하의 내부 컴퓨팅 파워 규칙을 알지 못하고 제어하지도 않습니다.

## APIYI가 환율을 정의할 수 없는 이유

APIYI는 모델 호출 서비스와 해당 모델 가격을 제공합니다. 다음은 제공하지 않습니다.

* RMB와 계산 능력 사이의 환산 규칙
* 사용자의 플랫폼 내부 차감 로직
* 최종 사용자를 위한 과금 단위

1 RMB를 10 단위로 매핑할지, 100 단위로 매핑할지, 또는 다른 어떤 값으로 할지는 전적으로 사용자의 플랫폼 규칙과 비즈니스 전략에 달려 있습니다.

## 자체 컴퓨팅 파워 규칙을 구성하는 방법

자체 백엔드에서 컴퓨팅 파워 소비를 구성할 계획이라면 다음 사항을 참고할 수 있습니다.

* **참조 모델 요금**: APIYI 모델 요금을 사용하여 각 호출의 비용을 추정합니다
* **변환 비율 정의**: 각 RMB가 얼마의 컴퓨팅 파워에 해당하는지 결정합니다
* **차감 규칙 설계**: 모델별, 호출별, 또는 입력/출력 token별 소비량을 구성합니다
* **운영 방식과 정합**: 제품 포지셔닝과 마진에 따라 조정합니다

<Info>
  APIYI는 모델 요금 정보만 제공하며, 컴퓨팅 파워 변환 설계에 대해서는 조언하지 않습니다. 자체 제품 포지셔닝, 운영 비용, 가격 전략을 바탕으로 결정하시기 바랍니다.
</Info>

## 모델 가격 안내

APIYI 모델 가격은 일반적으로 다음 범주로 나뉩니다:

* **이미지 모델**: 일부 모델은 특별 가격이 적용됩니다
* **텍스트 모델**: 가격은 일반적으로 공식 모델 사이트와 동일합니다
* **충전 프로모션**: 현재 진행 중인 충전 캠페인을 통해 추가 할인을 받을 수 있습니다

로그인 후 정확한 가격은 APIYI 플랫폼에서 확인하시기 바랍니다.

## 관련 질문

<CardGroup cols={2}>
  <Card title="모델 요율 배수" icon="calculator" href="/ko/faq/model-multiplier">
    다양한 모델의 요율 배수와 token 변환을 이해합니다.
  </Card>

  <Card title="결제 수단" icon="dollar-sign" href="/ko/faq/payment-methods">
    APIYI에서 지원되는 결제 수단과 크레딧 도착 시간을 확인합니다.
  </Card>

  <Card title="충전 프로모션" icon="gift" href="/ko/faq/recharge-promotions">
    현재 충전 캠페인과 할인 규칙을 알아봅니다.
  </Card>

  <Card title="잔액 부족" icon="credit-card" href="/ko/faq/balance-insufficient">
    API 호출 중 잔액 부족 오류를 처리합니다.
  </Card>
</CardGroup>
