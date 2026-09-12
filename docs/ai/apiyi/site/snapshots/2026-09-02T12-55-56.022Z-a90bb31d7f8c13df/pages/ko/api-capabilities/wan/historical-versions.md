> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan Historical Versions (Wan2.6)

> Wan2.6 시리즈( wan2.6-r2v-flash 포함 )에 대한 안내 및 마이그레이션 가이드입니다. Wan2.7과 동일한 엔드포인트와 스키마를 공유하므로, 호출할 때 모델 이름만 변경하면 됩니다.

이 페이지는 **현재 Wan2.6을 사용 중인 사용자**를 대상으로 하며, 버전 간 차이점과 Wan2.7로 마이그레이션하는 경로를 설명합니다. 새 사용자는 [Wan 개요](/ko/api-capabilities/wan/overview)에서 시작해야 합니다.

## 버전 개요

| Version    | Status     | Endpoint / protocol              | Recommended for                                             |
| ---------- | ---------- | -------------------------------- | ----------------------------------------------------------- |
| **Wan2.7** | ✅ 현재 권장됩니다 | `/wan/api/v1/...video-synthesis` | 새 통합을 위한 첫 번째 선택이며, 가장 완전한 기능 세트(오디오 드라이브, 다중 주제 참조)를 제공합니다 |
| **Wan2.6** | 🟡 유지보수 중  | Wan2.7과 동일함(모델 이름만 변경함)          | 기존 Wan2.6 코드, 또는 `r2v-flash` 저지연 티어가 필요한 경우                 |

<Info>
  Wan2.6과 Wan2.7은 **같은 DashScope 패스스루 엔드포인트와 같은 요청 구조를 공유합니다**. 마이그레이션하려면 **`model` 필드를 `wan2.6-*`에서 `wan2.7-*`로만 변경하고 나머지 본문은 그대로 두면 됩니다**. 정확한 출시 날짜와 최신 이용 가능 여부는 [APIYI 콘솔](https://api.apiyi.com/token)의 모델 목록이 기준입니다.
</Info>

## Wan2.6 모델

| Model ID           | 기능             | 비고                                                                  |
| ------------------ | -------------- | ------------------------------------------------------------------- |
| `wan2.6-t2v`       | 텍스트-동영상        | `wan2.7-t2v`에 해당합니다                                                 |
| `wan2.6-i2v`       | 이미지-동영상        | `wan2.7-i2v`에 해당합니다                                                 |
| `wan2.6-r2v`       | 참조-동영상         | `wan2.7-r2v`에 해당합니다                                                 |
| `wan2.6-r2v-flash` | 참조-동영상(저지연 티어) | Wan2.6 전용 고속 티어로, 더 빠른 생성과 더 낮은 단가를 제공하며 반복 작업, 디버깅, 배치 미리보기에 적합합니다 |

<Tip>
  `wan2.6-r2v-flash`는 Wan2.6 시리즈의 경량 고속 티어이며, 2.7에 대응하는 항목은 없습니다. 개발 중에는 prompt와 참조 이미지 결과를 빠르게 검증하는 데 사용한 뒤, 최종 확정 후에는 최종 렌더링을 위해 `wan2.7-r2v`로 전환하십시오.
</Tip>

## 마이그레이션 팁

<Steps>
  <Step title="차이점을 살펴보십시오">
    Wan2.7은 다중 주체 참조, 음성 참조(`reference_voice`), 그리고 오디오 드라이브에서 더 강력합니다. 기본적인 t2v / i2v / r2v만 사용하신다면 마이그레이션 비용은 거의 없습니다.
  </Step>

  <Step title="나란히 비교해 보십시오">
    동일한 프롬프트와 미디어 자산을 사용하여 `wan2.6-*` 및 `wan2.7-*` 작업을 각각 제출한 뒤, 품질과 일관성을 비교하고 전환 여부를 결정하십시오.
  </Step>

  <Step title="점진적으로 전환하십시오">
    `model` 필드만 변경하면 됩니다. 엔드포인트, 헤더, `input` / `parameters` 구조, 그리고 폴링 및 다운로드 흐름은 동일하며, breaking change는 없습니다.
  </Step>
</Steps>

## 레거시 호출 예시

```python theme={null}
import requests

# Calling Wan2.6: the only difference from Wan2.7 is the model name
body = {
    "model": "wan2.6-r2v-flash",   # change to wan2.7-r2v to upgrade to 2.7
    "input": {
        "prompt": "The reference image: a girl walking slowly through a garden, cinematic lighting",
        "media": [{"type": "reference_image", "url": "https://your-cdn.com/girl.png"}],
    },
    "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
}
resp = requests.post(
    "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis",
    json=body,
    headers={"Authorization": "Bearer sk-your-api-key", "Content-Type": "application/json",
             "X-DashScope-Async": "enable"},
    timeout=30,
)
print(resp.json()["output"]["task_id"])
```

## 과금 차이

<Note>
  Wan2.6와 Wan2.7의 가격과 그룹 설정은 곧 제공되며 이 페이지에 추가될 예정입니다. 일반적으로 `r2v-flash` 같은 빠른 티어는 더 낮은 단가를 가지며, 더 높은 해상도 / 더 긴 지속 시간은 더 많은 비용이 듭니다. 최신 가격은 [APIYI 콘솔](https://api.apiyi.com/token)의 과금 페이지에 있는 내용이 기준입니다.
</Note>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Wan 개요" icon="video" href="/ko/api-capabilities/wan/overview">
    비동기 흐름, 매개변수 세부 정보, 모범 사례
  </Card>

  <Card title="참조-비디오" icon="users" href="/ko/api-capabilities/wan/reference-to-video">
    `wan2.7-r2v` 실시간 디버깅
  </Card>
</CardGroup>
