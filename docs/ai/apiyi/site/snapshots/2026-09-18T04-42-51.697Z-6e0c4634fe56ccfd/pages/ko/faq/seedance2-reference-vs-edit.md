> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.5: 참조-동영상 생성과 동영상 편집 비교

> Seedance 2.5가 에셋과 prompt를 기반으로 참조-동영상 생성, 동영상 편집, 동영상 확장 중 무엇을 선택하는지, 작업이 편집으로 잘못 해석되는 이유 및 예측 가능하게 작동하는 요청 작성 방법을 설명합니다.

## 간단한 답변

Seedance 2.5에는 전용 “참조-동영상” 전환 기능이 **없습니다**. `content`에 참조 동영상이 포함되는 즉시, 모델은 작업이 참조-동영상, 동영상 편집 또는 동영상 확장인지 결정하기 위해 **prompt의 의도**를 읽습니다.

* prompt가 **원본 동영상을 변경하는 경우**(추가, 제거, 수정, 교체, 일부를 변경하지 않고 유지) → **동영상 편집**
* prompt가 **원본 동영상을** 앞으로 또는 뒤로 **계속 이어가는 경우**(확장, 계속) → **동영상 확장**
* prompt가 새 클립을 촬영하기 위해 에셋의 **캐릭터, 동작 또는 스타일만 차용하는 경우** → **참조-동영상**

작업이 편집으로 분류되면 `ratio`는 반드시 `adaptive`이어야 하고, `duration`는 반드시 `-1`이어야 합니다. 특정 종횡비 또는 길이를 전달하면 400이 반환되며, 일반적으로 `TaskTypeConstraint`가 언급됩니다.

<Info>
  이 페이지는 **Seedance 2.5**(`doubao-seedance-2-5-260628`)에만 적용됩니다. Seedance 2.0 제품군에는 동영상 편집 또는 동영상 확장 작업이 없으므로 해당 문제가 발생하지 않습니다.
</Info>

## 핵심 차이점: 에셋이 출력 결과에 포함됩니까?

|              | 참조-동영상                                   | 동영상 편집                                             |
| ------------ | ---------------------------------------- | -------------------------------------------------- |
| 에셋의 역할       | **의미론적 참조**만 제공: 외형, 동작, 카메라 워크, 스타일, 음성 | 소스 동영상이 **출력의 기반**이며, 모델이 그 위에 요소를 추가, 제거 또는 변경합니다 |
| 출력 화면 비율     | 선택 가능(7가지 `ratio` 값 중 어느 것이든)            | 소스 동영상에 **고정**됨; `ratio`은(는) `adaptive`이어야 합니다     |
| 출력 길이        | 선택 가능(4부터 30까지의 `duration`)              | 소스 동영상에 **고정**됨; `duration`은(는) `-1`이어야 합니다        |
| 소스 동영상 요구 사항 | 없음                                       | 길이가 **4–30초**여야 하며, 20초 미만이 가장 잘 작동합니다             |
| 일반적인 prompt  | “해변의 댄서, 이미지 1의 캐릭터, 동영상 1을 참조한 안무”      | “동영상 1의 인물을 이미지 1로 교체”, “동영상 1에서 배경 음악 제거”         |

빠른 확인 방법: **출력 결과에서 소스 동영상 자체가 여전히 보입니까?** 그렇다면 편집(또는 확장)입니다. 그 동영상의 “느낌”만 이어진다면 참조-동영상입니다.

동영상 확장은 편집과 유사합니다. 화면 비율은 소스 동영상에 고정되지만, 길이는 여전히 설정할 수 있습니다.

## 모델의 판단 방식

판단은 두 단계로 이루어집니다. 먼저 에셋 `role`을 확인한 다음, prompt를 확인합니다.

| 작업 유형                  | 에셋 조건                                                             | prompt 트리거 단어(제공업체 문서)            | `ratio`               | `duration`      |
| ---------------------- | ----------------------------------------------------------------- | --------------------------------- | --------------------- | --------------- |
| 참조 기반 동영상              | `reference_image` / `reference_video` / `reference_audio` 중 하나 이상 | 편집 또는 확장 의도 없음                    | 모든 값                  | 모든 값            |
| 동영상 편집                 | `reference_video` 하나 이상                                           | 동영상 편집, 추가, 제거 / 삭제, 수정 / 교체 / 변경 | **`adaptive`이어야 합니다** | **`-1`이어야 합니다** |
| 동영상 확장                 | `reference_video` 하나 이상                                           | 앞으로 / 뒤로 확장, 계속                   | **`adaptive`이어야 합니다** | 모든 값            |
| 첫 프레임 / 첫 번째 및 마지막 프레임 | `role`이 `first_frame` / `last_frame`임                             | prompt와 무관                        | **`adaptive`이어야 합니다** | 모든 값            |

<Warning>
  트리거 단어 목록은 **완전하지 않습니다**. 모델은 정확한 단어가 아니라 의미를 판단합니다. ‘동영상의 모든 내용을 변경하지 않고 유지’, ‘동영상 1을 HD로 업스케일’, 또는 ‘의상을 동일하게 유지’와 같은 문구는 목록에 없지만, 모두 원본 영상을 처리하는 작업을 설명하므로 동영상 편집으로 분류될 수도 있습니다.
</Warning>

참조 이미지는 있지만 참조 동영상이 없는 요청은 편집 또는 확장으로 분류되지 않습니다. `reference_video`이 있는 경우에만 이를 확인하면 됩니다.

## 실제 사례

이 요청은 4:3 및 15초를 설정하면서 동시에 “동영상을 업스케일”하려고 했습니다:

```json theme={null}
{
  "model": "doubao-seedance-2-5-260628",
  "ratio": "4:3",
  "duration": 15,
  "resolution": "1080p",
  "content": [
    { "type": "text", "text": "Upscale reference video 1 to HD, keep all elements in the video unchanged, keep the outfits unchanged" },
    { "type": "video_url", "role": "reference_video", "video_url": { "url": "asset://asset-xxxx" } }
  ]
}
```

이 요청은 즉시 400과 함께 거부되었습니다:

```text theme={null}
The parameters `ratio` and `duration` specified in the request are not valid.
Seedance identified your task as video editing based on your prompt. ...
Issues: [0] `ratio` must be `adaptive`. [1] `duration` must be -1.
```

“업스케일”과 “변경 없이 유지”를 함께 사용하면 원본 영상에 대해 작업한다는 의미이므로, 모델은 이를 편집으로 분류했습니다. 편집 작업은 사용자 지정 화면비 또는 길이를 허용하지 않습니다. 이 요청은 실제로 편집이므로, 올바른 수정 방법은 다음과 같습니다:

```json theme={null}
"ratio": "adaptive",
"duration": -1
```

변경 후 출력은 원본 동영상의 화면비와 길이를 따릅니다.

## 파라미터로 레퍼런스-투-비디오를 강제할 수 있나요?

**아니요.** 2.5에서 `omni_reference_task_type`는 세 가지 값만 허용합니다:

| 값            | 효과                                 |
| ------------ | ---------------------------------- |
| `auto` (기본값) | 모델이 에셋과 prompt를 기반으로 결정합니다         |
| `edit`       | 동영상 편집을 선언하며, 편집 제약 조건은 제출 시 검증됩니다 |
| `extend`     | 동영상 확장을 선언하며, 확장 제약 조건은 제출 시 검증됩니다 |

"레퍼런스-투-비디오" 값은 없습니다. 또한 `edit` / `extend`는 단지 **더 일찍 검증할 뿐**이며, 작업 유형을 강제하지는 않습니다. 선언된 유형이 모델이 prompt에서 추론한 내용과 다르면, 작업은 여전히 `InvalidParameter.TaskTypeMismatch` 오류로 실패합니다.

요약하면, **prompt**가 작업 유형을 결정합니다. 파라미터는 이에 맞춰서만 사용할 수 있습니다.

## 신뢰할 수 있는 세 가지 접근 방식

<Tabs>
  <Tab title="출력 크기는 중요하지 않음">
    제공업체 문서에서 권장하는 범용 설정입니다. 참조 에셋이 있는 경우에는 항상 다음을 전송합니다. 모델이 어떤 하위 작업을 선택하든 요청은 파라미터 제약으로 실패하지 않습니다.

    ```json theme={null}
    "omni_reference_task_type": "auto",
    "ratio": "adaptive",
    "duration": -1
    ```

    절충안은 작업이 참조-동영상으로 분류되면 **모델이 지속 시간을 선택한다는 점**입니다(테스트에서는 10초 이상). 비용도 이에 따라 달라집니다. 비용에 민감한 워크로드에는 권장하지 않습니다.
  </Tab>

  <Tab title="고정된 화면비 및 지속 시간">
    `ratio` 및 `duration`을 직접 설정하려면 모델이 작업을 참조-동영상으로 분류해야 합니다. 이는 prompt에 따라 결정됩니다.

    * 에셋을 **참조하거나, 차용하거나, 모방할** 대상으로 설명하고 무엇을 참조하는지(동작, 카메라 워크, 스타일, 캐릭터 외형)를 명시합니다.
    * 소스 동영상에 무엇을 할지가 아니라 **원하는 새 장면**에 집중합니다.
    * 추가 / 제거 / 수정 / 교체 / 변경, “...을 변경하지 않고 유지”, “업스케일 / 복원” 또는 “확장 / 계속”과 같은 표현은 피합니다.

    | 편집으로 해석될 가능성이 높음             | 참조-동영상으로 재작성                                 |
    | ---------------------------- | -------------------------------------------- |
    | 동영상 1의 인물을 이미지 1의 소녀로 교체     | 이미지 1의 소녀가 해변을 따라 달리며, 동작과 카메라 워크는 동영상 1을 참조 |
    | 동영상 1의 장면은 유지하고 고양이 추가       | 동영상 1의 거리 스타일로, 고양이가 길모퉁이를 지나감               |
    | 동영상 1을 업스케일하고 의상은 변경하지 않고 유지 | 동영상 1의 캐릭터 외형과 의상을 특징으로 하는 새로운 런웨이 촬영        |
  </Tab>

  <Tab title="코드에서 재시도">
    prompt가 최종 사용자에게서 오고 이를 제어할 수 없는 경우, 이 400 오류를 포착한 후 한 번 다시 제출합니다. 오류는 제출 시 반환되므로 작업이 생성되지 않으며, 400 파라미터 오류에는 과금되지 않습니다.

    ```python theme={null}
    import os
    import requests

    URL = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
    HEADERS = {
        "Authorization": f"Bearer {os.environ['APIYI_API_KEY']}",
        "Content-Type": "application/json",
        "Accept-Encoding": "identity",
    }

    def submit(payload: dict) -> str:
        resp = requests.post(URL, headers=HEADERS, json=payload, timeout=300)
        if resp.status_code == 400 and "TaskTypeConstraint" in resp.text:
            # Classified as edit / extend / first-frame: release ratio and duration, then resubmit
            payload = {**payload, "ratio": "adaptive", "duration": -1}
            resp = requests.post(URL, headers=HEADERS, json=payload, timeout=300)
        resp.raise_for_status()
        return resp.json()["id"]
    ```

    재시도 후에는 더 이상 화면비나 지속 시간을 제어할 수 없습니다. 제품에서 출력 사양을 보장해야 한다면 조용히 재시도하는 대신 사용자에게 오류를 반환하고 다시 표현하도록 요청합니다.
  </Tab>
</Tabs>

## 오류가 발생하는 경우

| 시나리오                                               | 실패 시점                                                               | 오류 코드                                 |
| -------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------- |
| `edit` / `extend`을 명시적으로 선언했고, 파라미터가 제약 조건을 위반한 경우 | 제출 시 400                                                            | `InvalidParameter.TaskTypeConstraint` |
| 생략했거나 `auto`이며, 모델이 편집으로 분류했고 파라미터가 제약 조건을 위반한 경우  | 제공업체 문서에서는 작업이 비동기적으로 실패한다고 설명하지만, **위 사례처럼 제출 시 400을 반환할 수도 있습니다** | `InvalidParameter.TaskTypeConstraint` |
| 선언한 유형이 모델의 분류와 다른 경우                              | 작업 실행이 시작된 후 실패                                                     | `InvalidParameter.TaskTypeMismatch`   |

두 오류에는 서로 다른 수정 방법이 필요합니다. `TaskTypeConstraint`의 경우 파라미터를 변경하고, `TaskTypeMismatch`의 경우 prompt를 변경하거나 `omni_reference_task_type`을 `auto`로 다시 설정하십시오.

## 비용 참고 사항

* **동영상 편집 출력물의 길이는 원하는 길이가 아니라 원본 동영상의 길이와 같습니다**. 25초 원본은 약 25초 기준으로 과금됩니다.
* **참조 동영상이 있는 작업의 경우 입력 동영상의 프레임도 과금 대상 tokens으로 변환됩니다**. 더 길고 해상도가 높은 원본일수록 비용이 더 많이 듭니다.
* 참조-동영상 작업에서 `duration: -1`를 사용하면 모델이 길이를 선택하며, 예상보다 길어질 수 있습니다.

제출하기 전에 원본 동영상의 길이를 확인하면 대부분의 예상치 못한 상황을 피할 수 있습니다. 작업의 실제 과금액을 확인하려면 [task\_id로 Seedance 동영상의 실제 비용을 조회하려면 어떻게 해야 하나요?](/ko/faq/seedance-task-cost-lookup)를 참조하십시오.

## 관련 문서

<CardGroup cols={2}>
  <Card title="동영상 생성 API" icon="video" href="/ko/api-capabilities/seedance2/video-generation">
    작업 유형과 파라미터 제약 조건, 전체 요청 파라미터
  </Card>

  <Card title="Seedance 2.0 / 2.5 개요" icon="film" href="/ko/api-capabilities/seedance2/overview">
    2.5와 2.0의 차이점, 전체 편집 및 확장 사용법
  </Card>
</CardGroup>
