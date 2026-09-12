> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0이 얼굴 자산을 차단하는 이유는 무엇입니까?

> 가상 얼굴 채널 접근, 자산 수집, 계정 권한의 차이와 AI 모델을 첫 프레임 또는 참고 이미지로 사용하는 방법을 설명합니다.

## 간단한 답변

Seedance 2.0 채널에 포함된 “virtual-face whitelist”는 **플랫폼 채널 수준에서 활성화되는 상위 스트림 기능**입니다. APIYI token이나 계정에서 수동으로 활성화할 필요도 없고, 그렇게 할 수도 없습니다. 그러나 그렇다고 해서 얼굴이 포함된 이미지를 항상 public URL 또는 Base64 첫 프레임이나 참조 이미지로 바로 제출할 수 있다는 뜻은 아닙니다.

AI가 생성한 가상 모델이 “실제 인물을 포함할 가능성이 있음”으로 분류되면, [Seedance 2.0 자산 라이브러리](https://icover.ai/en/seedance-official/asset-library)에 업로드한 뒤 상태가 `Active`가 될 때까지 기다린 다음, 해당 `asset://xxx` ID를 받아 동영상 생성 작업에서 그 자산 ID를 사용하십시오.

<Info>
  **채널 접근과 신뢰된 자산 상태는 서로 다른 개념입니다**

  * **Virtual-face whitelist**: 이미 플랫폼 채널에서 사용할 수 있으며, 별도의 계정 또는 token 활성화가 필요하지 않습니다
  * **자산 수집**: 특정 얼굴 이미지를 신뢰된 자산으로 등록하고, 동영상 생성에 사용할 수 있는 `asset://` ID를 반환합니다
</Info>

## AI로 생성된 얼굴도 여전히 차단될 수 있는 이유

상위 콘텐츠 안전 시스템은 이미지 자체에서 얼굴이나 실제 인물일 가능성이 있는 콘텐츠를 검사합니다. 이미지가 AI로 생성되었다는 설명만을 근거로 삼지 않습니다. 따라서 매우 사실적인 가상 모델은 “실제 인물이 포함되어 있을 가능성이 있음”으로 분류될 수 있으며, 직접 URL 또는 Base64 입력은 여전히 딥페이크 방지 필터링을 트리거할 수 있습니다.

이는 보통 APIYI 계정에 허용 목록이 누락되었다거나 token 권한을 변경해야 한다는 뜻이 아닙니다. 올바른 해결책은 먼저 이미지를 수집하여 신뢰된 자산이 되도록 하는 것입니다.

<Warning>
  얼굴 감지를 우회하려고 URL을 반복해서 바꾸거나, 이미지를 재호스팅하거나 압축하거나, 파일 이름을 변경하지 마십시오. 이러한 작업은 자산의 얼굴 특성을 바꾸지 못하며, 자산 수집이나 실제 인물 검증을 대체할 수 없습니다.
</Warning>

## AI 가상 모델을 위한 올바른 작업 흐름

<Steps>
  <Step title="자산 라이브러리에 로그인">
    [icover.ai 자산 라이브러리](https://icover.ai/en/seedance-official/asset-library)를 연 다음, icover.ai 계정을 등록하거나 로그인합니다.
  </Step>

  <Step title="가상 초상 업로드">
    AI가 생성한 모델을 “Virtual Portrait Ingestion”에 업로드합니다. 지원 형식에는 jpeg, png, webp, bmp, tiff, gif, heic가 포함됩니다. 종횡비는 0.4–2.5여야 하며, 각 변은 300–6000px이어야 하고, 각 파일은 30MB 미만이어야 합니다.
  </Step>

  <Step title="자산이 활성화될 때까지 기다리기">
    약 10초가 지난 뒤 상태가 `Active`가 될 때까지 기다린 다음, `asset://xxx` ID를 복사합니다. 자산 ID는 재사용할 수 있으며, 매 작업마다 다시 생성할 필요가 없습니다.
  </Step>

  <Step title="생성 방법 선택">
    [icover.ai 온라인 생성기](https://icover.ai/en/seedance-official)에서 멀티모달 모드를 선택하고 참조 이미지 유형을 Asset으로 설정합니다. API 요청의 경우 `asset://xxx`를 `image_url.url`에 넣습니다.
  </Step>

  <Step title="이미지 역할 설정">
    자산이 첫 프레임인 경우에는 `role: "first_frame"`를 사용하고, 캐릭터 또는 스타일 참조인 경우에는 `role: "reference_image"`를 사용합니다. 프롬프트에서는 해당 자산을 “Image 1”으로 지칭합니다.
  </Step>
</Steps>

<Tip>
  캐릭터 일관성을 높이려면 동일한 가상 캐릭터의 전신 정면 이미지와 중립적인 정면 얼굴 클로즈업 이미지를 하나의 자산 그룹에 넣습니다.
</Tip>

## 사전 설정된 자산 또는 Seedance로 생성된 이미지를 반드시 사용해야 합니까?

아니요. 아래의 모든 출처를 사용할 수 있지만, 얼굴 자산은 적절한 워크플로를 따라야 합니다.

| 자산 출처                         | 지원 여부 | 권장 처리                                                         |
| ----------------------------- | ----- | ------------------------------------------------------------- |
| 사용자가 직접 생성한 AI 가상 모델          | 예     | 자산 라이브러리에 수집한 뒤 생성된 `asset://` ID를 사용합니다                      |
| 플랫폼 라이브러리의 기존 가상 캐릭터          | 예     | 기존 자산을 선택하거나 해당 `asset://` ID를 직접 참조합니다                       |
| Seedance 또는 다른 모델로 생성된 얼굴 이미지 | 예     | 얼굴 참조로 재사용하는 경우 먼저 수집해야 하며, 생성 출처 때문에 자동으로 탐지 대상에서 제외되지는 않습니다 |
| 실존 인물의 얼굴 이미지                 | 조건부   | 실존 인물 실재성 검증을 완료한 뒤 해당 인물의 인증된 자산 그룹에 업로드합니다                  |

핵심 요구사항은 어떤 모델이 이미지를 생성했는지가 아니라, **해당 얼굴 이미지가 활성 신뢰 자산이 되었는지 여부**입니다.

## AI 얼굴 화이트리스트를 내 계정에서 활성화할 수 있습니까?

별도의 활성화는 필요하지 않으며, 계정에는 사용자용 “AI face whitelist” 스위치가 없습니다. 플랫폼 채널에는 관련 상위 가상 얼굴 기능이 이미 포함되어 있습니다. 필요한 작업은 token 권한 변경이 아니라 자산 수집입니다.

가상 인물 사진의 수집에 실패하거나 활성 `asset://` ID가 계속 차단되는 경우, 지원팀에 연락하여 자산 상태 또는 상위 검토 결과를 조사할 수 있도록 다음 정보를 제공하십시오.

* APIYI 계정 또는 등록된 이메일
* 사용한 모델 이름
* 자산 ID (`asset://xxx`)
* 동영상 작업 ID와 전체 오류 메시지
* 자산 수집 상태 스크린샷

<Warning>
  이미지에 실제 인물이 포함되어 있거나 시스템이 실제 인물 승인이 필요하다고 판단하는 경우, 일반적인 가상 인물 수집으로는 상위 보호 정책을 우회할 수 없습니다. 실제 인물 검증 페이지에서 출연자의 생체 인증을 완료한 다음, 해당 출연자의 전용 검증 자산 그룹에 자산을 업로드하십시오.
</Warning>

## Seedance 2.0 직접 접근 안내

Seedance 시리즈는 직접 공식 업스트림 리소스를 사용하며 플랫폼 보호 정책의 적용을 받으므로, 현재는 특정 비즈니스 요구가 있는 선별된 고객을 주 대상으로 합니다. 따라서 해당 페이지는 공개 문서 내비게이션에서 숨겨질 수 있지만, 다음 직접 링크를 통해서는 계속 이용할 수 있습니다:

<CardGroup cols={2}>
  <Card title="Seedance 2.0 개요" icon="film" href="/ko/api-capabilities/seedance2/overview">
    모델 기능, 입력 제한, 과금 및 자주 묻는 질문을 확인합니다.
  </Card>

  <Card title="동영상 생성 API" icon="video" href="/ko/api-capabilities/seedance2/video-generation">
    첫 프레임, 첫 프레임 및 마지막 프레임, 멀티모달 참조 생성을 위한 요청 형식을 확인합니다.
  </Card>

  <Card title="자산 라이브러리" icon="images" href="/ko/api-capabilities/seedance2/asset-library">
    가상 인물 인제스트, 실제 인물 검증, 자산 요구 사항 및 API 엔드포인트를 확인합니다.
  </Card>

  <Card title="자산 참조 가이드" icon="code" href="/ko/api-capabilities/seedance2/asset-reference">
    업로드, 인제스트, `Active` 폴링, 자산 참조 및 동영상 다운로드 전체 워크플로를 따릅니다.
  </Card>
</CardGroup>

## 온라인 도구

* [Seedance 2.0 온라인 생성기](https://icover.ai/en/seedance-official)
* [가상 및 실물 인물 에셋 수집](https://icover.ai/en/seedance-official/asset-library)
