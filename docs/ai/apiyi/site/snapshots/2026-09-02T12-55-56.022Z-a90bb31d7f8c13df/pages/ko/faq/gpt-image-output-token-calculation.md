> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT 이미지 출력 token 수가 왜 이렇게 높은가요?

> GPT Image가 입력 token과 출력 token을 분리하는 방식과, 해상도, 품질, 종횡비, 이미지 수가 비용에 상당한 영향을 줄 수 있는 이유를 설명합니다.

## 간단한 답변

이는 정상입니다. `high` 품질의 4K 이미지는 GPT 이미지에서 본질적으로 비용이 많이 들며, 출력 이미지가 하나뿐이어도 많은 수의 `output_tokens`를 소모할 수 있습니다.

이미지 출력 token은 단순히 “출력 파일 하나”를 기준으로 계산되거나 전체 픽셀 수에 대한 고정된 선형 비율로 산정되지 않습니다. 주로 다음의 영향을 받습니다.

1. `quality`: `low`, `medium`, `high`, 또는 `auto`
2. 출력 크기와 종횡비
3. `n`에 따른 생성 횟수
4. 모델 내부의 캔버스 분할과 이미지 복잡도

<Info>
  `usage.output_tokens`는 **출력 이미지를 생성하는 데 사용된 image tokens**를 의미하며, 참조 이미지 입력이 아닙니다. 참조 이미지는 `usage.input_tokens_details.image_tokens` 아래에 별도로 보고됩니다.
</Info>

## 왜 한 이미지가 이렇게 많은 tokens를 사용할 수 있습니까?

“하나의 이미지”는 생성된 결과 수를 의미할 뿐, 생성 작업량을 의미하지는 않습니다. 모델은 내부 이미지 표현 공간에서 전체 캔버스를 생성해야 합니다. 더 높은 품질과 더 큰 해상도는 일반적으로 더 많은 이미지 연산과 output tokens를 필요로 합니다.

예를 들어, 두 요청 모두 하나의 이미지를 반환합니다:

```json theme={null}
{
  "size": "1024x1024",
  "quality": "low",
  "n": 1
}
```

```json theme={null}
{
  "size": "3840x2160",
  "quality": "high",
  "n": 1
}
```

두 번째 요청도 여전히 이미지는 하나만 반환하지만, 4K 가로형 캔버스와 고품질 티어를 사용합니다. 훨씬 더 큰 output-token 수가 예상됩니다.

## 네 가지 주요 비용 요인

### 1. `quality` 매개변수

`quality`은 보통 가장 눈에 띄는 비용 변수입니다:

| 값        | 일반적인 사용                | 출력-token 경향   |
| -------- | ---------------------- | ------------- |
| `low`    | 빠른 미리보기와 초안            | 가장 낮음         |
| `medium` | 품질과 비용의 균형             | 중간            |
| `high`   | 세밀한 질감, 텍스트, 복잡한 세부 사항 | 가장 높음         |
| `auto`   | 모델이 등급을 선택함            | 호출마다 달라질 수 있음 |

<Warning>
  `quality: "auto"`가 있거나 명시적인 `quality`가 없으면, 모델은 prompt에 따라 다른 등급을 선택할 수 있습니다. 따라서 크기와 참조 이미지가 동일한 호출이라도 `output_tokens`에서 몇 배 차이가 날 수 있습니다. 예산을 예측 가능하게 하려면 `low`, `medium`, 또는 `high`를 명시적으로 설정하십시오.
</Warning>

프로젝트 문서에는 실제 예시가 포함되어 있습니다. 세 번의 요청은 각각 1061개 입력 token을 사용했으며, 출력 token 수는 1286개, 5146개, 1287개였습니다. 가운데 호출은 자동으로 더 높은 품질 등급을 선택했고, 다른 두 호출보다 비용이 약 3.5배 더 들었습니다.

### 2. 출력 크기

해상도가 높을수록 일반적으로 내부 캔버스가 더 커지고 출력 token도 더 많아집니다. 4K `high` 요청은 1K `low` 요청보다 훨씬 더 많은 비용이 들 수 있습니다.

그러나 다음 공식은 정확한 결과를 예측할 수 없습니다:

```text theme={null}
output tokens = width × height × fixed coefficient
```

픽셀 수는 대략적인 예산 산정에만 유용합니다. 모델은 생성 중 실제 `output_tokens`를 결정하며, 응답의 `usage.output_tokens`가 기준입니다.

### 3. 종횡비와 내부 캔버스 분할

출력 token은 내부 캔버스가 어떻게 타일링되고, 스케일 조정되고, 덮이는지에도 좌우됩니다. 따라서 token 사용량은 최종 픽셀 수에 대해 항상 엄격하게 단조 증가하지는 않습니다.

같은 품질 등급에서는 더 큰 비정사각형 이미지가 더 작거나 더 정사각형에 가까운 이미지보다 때때로 더 적은 출력 token을 사용할 수 있습니다. 이는 모순이 아닙니다. 모델은 최종 픽셀을 개별적으로 청구하는 대신 이산적인 캔버스 또는 타일링 규칙을 사용하기 때문입니다.

<Tip>
  크기를 비교할 때는 `quality`와 종횡비를 함께 고려하십시오. “4K”나 “2K” 레이블, 또는 총 픽셀 수만 비교하지 마십시오.
</Tip>

### 4. 생성 횟수 `n`

일반적으로 이미지를 더 많이 생성할수록 총 출력 token이 증가합니다. 생성된 N개의 이미지는 대략 N세트의 출력 비용을 발생시킵니다.

그러나 현재 `gpt-image-2` 엔드포인트는 `n=1`만 지원합니다. 여러 이미지를 생성하려면 독립적인 요청을 여러 번 보내야 하며, 각 요청은 입력 및 출력 token에 대해 별도로 과금됩니다. 다른 이미지 모델이 `n>1`을 지원하는지는 해당 모델의 문서에 따라 다릅니다.

## 참고 이미지의 영향을 받는 token은 무엇입니까?

참고 이미지 개수는 주로 **입력 이미지 token**에 영향을 주며, 출력 이미지 token에는 영향을 주지 않습니다:

| 필드                                         | 의미                  |
| ------------------------------------------ | ------------------- |
| `usage.input_tokens_details.text_tokens`   | Prompt 텍스트 입력       |
| `usage.input_tokens_details.image_tokens`  | 참고 이미지 입력           |
| `usage.output_tokens_details.image_tokens` | 생성된 이미지 출력          |
| `usage.output_tokens`                      | 요청의 총 이미지 출력 tokens |

`gpt-image-2`는 참고 이미지를 고정밀로 처리합니다. 참고 이미지가 많아질수록 입력 이미지 token은 대략 선형적으로 증가하지만, 최종 출력의 `output_tokens`는 여전히 주로 출력 품질, 크기, 가로세로 비율, 그리고 모델의 내부 생성 과정에 의해 결정됩니다.

과금 기록이 큰 수치를 명시적으로 “image output”에 귀속한다면, 이를 참고 이미지 개수 탓으로 돌리면 안 됩니다. 참고 이미지 비용은 입력 이미지 token 필드에 별도로 표시되어야 합니다.

## 실제 비용을 계산하는 방법

현재 `gpt-image-2` 과금 구조를 기준으로:

```text theme={null}
total cost
= text input tokens × text input rate
+ reference-image input tokens × image input rate
+ output image tokens × image output rate
```

예시 응답:

```json theme={null}
{
  "usage": {
    "input_tokens": 1040,
    "input_tokens_details": {
      "text_tokens": 16,
      "image_tokens": 1024
    },
    "output_tokens": 5146,
    "output_tokens_details": {
      "text_tokens": 0,
      "image_tokens": 5146
    },
    "total_tokens": 6186
  }
}
```

이는 다음을 의미합니다:

* 16 tokens는 prompt 텍스트에서 나왔습니다
* 1024 tokens는 참조 이미지에서 나왔습니다
* 5146 tokens는 생성된 이미지에서 나왔습니다
* 이미지는 하나만 반환되었지만, 품질과 캔버스 때문에 5146 output image tokens가 필요했습니다

<Info>
  모든 크기와 콘텐츠에 걸쳐 2K 또는 4K 이미지당 보편적으로 고정된 token 수는 없습니다. 예산 표는 추정치일 뿐입니다. 최종 과금은 API에서 반환되거나 콘솔 로그에 표시된 실제 `usage` 값을 사용해야 합니다.
</Info>

## token 사용량을 줄이는 방법

<Steps>
  <Step title="명시적인 품질 등급을 설정하십시오">
    `auto`를 피하십시오. 모델이 예상치 않게 더 비싼 등급을 선택하지 않도록 `low`, `medium`, 또는 `high`를 명시적으로 전달하십시오.
  </Step>

  <Step title="불필요한 해상도를 피하십시오">
    미리보기와 내부 검토에는 1K 또는 2K를 사용하고, 최종 전달용으로만 4K `high`를 생성하십시오.
  </Step>

  <Step title="필요한 종횡비를 선택하십시오">
    더 자세해 보이기 위해 크기만 키우지 말고, 실제 작업에 필요한 캔버스를 사용하십시오.
  </Step>

  <Step title="출력 개수를 제어하십시오">
    여러 후보를 생성하면 총 출력 비용이 대략 선형적으로 증가합니다. 확장하기 전에 작은 배치로 prompt를 검증하십시오.
  </Step>

  <Step title="사용량 필드를 기록하십시오">
    각 요청의 `size`, `quality`, `output_tokens`, 그리고 비용을 저장하여 실제 운영 데이터로 비용 기준선을 구축하십시오.
  </Step>
</Steps>

## 관련 문서

* [GPT-Image-2 개요 및 과금](/ko/api-capabilities/gpt-image-2/overview)
* [GPT-Image-2 텍스트-이미지 API](/ko/api-capabilities/gpt-image-2/text-to-image)
* [GPT-Image-2 이미지 편집 API](/ko/api-capabilities/gpt-image-2/image-edit)
* [API 로그는 어떻게 확인하나요?](/ko/faq/call-logs)
