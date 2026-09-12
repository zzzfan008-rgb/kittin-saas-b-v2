> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 이미지 생성에 더 빠르거나 엔터프라이즈 경로가 있습니까?

> 기본 그룹과 엔터프라이즈 그룹이 이미지 생성 속도와 어떻게 관련되는지, 그리고 지연 시간이 우선일 때 어떤 모델을 테스트해야 하는지 설명합니다.

## 간단한 답변

기본 그룹은 이미 일반적인 이미지 생성에 권장되는 경로이며, 보통 충분히 빠릅니다. 엔터프라이즈 그룹은 주로 기본 경로에 장애가 발생했을 때 사용하는 대체 수단이며, 이미지 생성 시간을 줄이기 위한 전용 가속 경로는 아닙니다.

## 엔터프라이즈 그룹이 더 빠르지 않을 수 있는 이유

APIYI는 이미 China Telecom, China Unicom, China Mobile 전반에 걸쳐 최적화된 반환 경로를 사용합니다. 이미지 생성 지연의 주된 원인은 보통 APIYI의 네트워크 라우팅이 아니라 상위 모델 추론입니다. 따라서 엔터프라이즈 그룹으로 전환해도 일반적으로 모델의 고유 생성 시간을 줄일 수는 없습니다.

<Info>
  **그룹 간의 주요 차이는 라우팅과 장애 조치이며, 더 빠른 모델 추론이 아닙니다.**

  * **기본 그룹**: 최적화된 속도와 안정성을 갖춘 일반 요청에 권장됩니다
  * **엔터프라이즈 그룹**: 기본 라우트 장애 발생 시 대체 수단으로 사용되며, 가용성에 중점을 둡니다
</Info>

## 생성 속도가 우선이라면 어떻게 해야 합니까?

워크로드에서 더 빠른 이미지 출력을 우선한다면 [Nano Banana 이미지 모델](/ko/api-capabilities/nano-banana-image/overview)을 먼저 테스트한 다음, 이미지 품질, 비용, 측정된 생성 시간을 기준으로 결정하십시오.

<Warning>
  모델 속도는 이미지 크기, 출력 개수, prompt 복잡도, 상위 계층 부하에 따라 달라집니다. 어떤 경로도 어떤 그룹도 고정된 이미지 생성 시간을 보장할 수 없습니다. 실제 요청 파라미터와 프로덕션과 유사한 동시 실행 수로 테스트하십시오.
</Warning>

## 관련 문서

* [이미지 API 지연 시간을 어떻게 줄일 수 있습니까?](/ko/faq/image-api-network-latency-optimization)
* [Nano Banana 이미지 생성](/ko/api-capabilities/nano-banana-image/overview)
