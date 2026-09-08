> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 네이티브 Tool 이미지 생성

> OpenAI Responses API의 네이티브 image_generation 도구를 통해 모델이 자체적으로 이미지를 생성하도록 합니다. gpt-5.5가 트리거하며, base64로 반환되고, tool 호출 과금 참고 사항이 포함됩니다.

## 개요

독립형 [텍스트-투-이미지](/ko/api-capabilities/gpt-image-2/text-to-image) / [이미지 편집](/ko/api-capabilities/gpt-image-2/image-edit) 엔드포인트 외에도, APIYI는 **OpenAI Responses API의 기본 `image_generation` 도구**도 지원합니다: 주 모델 `gpt-5.5`이 언제 그릴지 스스로 판단하고, 내부적으로 GPT Image 모델을 선택한 뒤, 이미지를 응답 `output` 배열에 **base64**로 반환합니다.

<Note>
  **검증 완료(2026-06-17)**: `gpt-5.5` + `POST /v1/responses` + `tools: [{"type": "image_generation"}]`가 유효한 base64 PNG를 반환합니다. 두 이미지 경로는 모두 OpenAI의 공식 업스트림으로 직접 라우팅됩니다.
</Note>

<Info>
  **어떤 것을 사용해야 합니까?** "그냥 이미지가 필요할 뿐"인 경우가 대부분이라면, 독립형 [`/v1/images/generations`](/ko/api-capabilities/gpt-image-2/text-to-image) 엔드포인트를 선호하십시오 — 실제 사용량 기준으로만 과금되므로 더 저렴하고 제어하기 쉽습니다. **이 페이지의 기본 도구 방식을 사용하는 것은 파이프라인이 반드시 Responses를 거쳐야 할 때만 하십시오**(예: 에이전트 대화 안에서 `gpt-5.5`이 그릴지 여부를 자율적으로 결정하게 하는 경우). 이미지당 대략 \$0.20의 고정 도구 호출 수수료가 추가됩니다.
</Info>

## 두 방식의 비교

| 항목          | 네이티브 도구 방식(이 페이지)                                         | images API                                   |
| ----------- | --------------------------------------------------------- | -------------------------------------------- |
| **채널**      | OpenAI 공식 릴레이 직통                                          | OpenAI 공식 릴레이 직통                             |
| **엔드포인트**   | `/v1/responses`                                           | `/v1/images/generations`, `/v1/images/edits` |
| **도구**      | `image_generation`                                        | 없음(prompt를 직접 전달)                            |
| **과금**      | 사용량 기반 **+ 도구 호출 수수료**                                    | 사용량 기반                                       |
| **과금 세부사항** | 텍스트/이미지 입력-출력은 공식과 동일한 가격이며, **고정 도구 호출 수수료 ≈ \$0.20/호출** | 텍스트/이미지 입력-출력은 공식과 동일한 가격입니다                 |
| **적합한 경우**  | Responses가 필요한 경우(예: 에이전트 자율성)                            | **대부분의 이미지 시나리오** — 더 합리적인 과금                |

> 핵심 차이: **네이티브 도구 방식은 이미지당 고정 ≈\$0.20 도구 수수료가 추가되며**, images API는 실제 사용량에 따라만 과금됩니다 — 따라서 대부분의 경우 더 저렴합니다.

## 최소 요청

### cURL

```bash theme={null}
curl https://api.apiyi.com/v1/responses \
  -H "Authorization: Bearer $APIYI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "input": "Generate an image of a gray tabby cat hugging an otter with an orange scarf",
    "tools": [
      { "type": "image_generation" }
    ]
  }'
```

### 파이썬 (requests)

```python theme={null}
import base64, requests

resp = requests.post(
    "https://api.apiyi.com/v1/responses",
    headers={
        "Authorization": "Bearer $APIYI_KEY",
        "Content-Type": "application/json",
    },
    json={
        "model": "gpt-5.5",
        "input": "Generate an image of a gray tabby cat hugging an otter with an orange scarf",
        "tools": [{"type": "image_generation"}],
    },
    timeout=300,           # Generation is slow; allow plenty of timeout (~60-90s per image)
)
data = resp.json()

# Pull the image tool result out of the output array
for item in data["output"]:
    if item.get("type") == "image_generation_call":
        raw = base64.b64decode(item["result"])   # result field is a base64 image
        with open("output.png", "wb") as f:
            f.write(raw)
        print("Saved output.png,", len(raw), "bytes")
```

<Tip>
  선택적 매개변수는 `tools` 항목에 넣습니다: `{"type": "image_generation", "output_format": "png|jpeg|webp", "size": "1024x1024", ...}`. 생략하면 기본값(png)을 사용합니다.
</Tip>

## 응답 구조(핵심 필드)

성공 시(HTTP 200), 응답 본문에는 다음이 포함됩니다:

```jsonc theme={null}
{
  "id": "resp_...",
  "model": "gpt-5.5-2026-04-23",
  "status": "completed",
  "output": [
    {
      "type": "image_generation_call",   // <- key: the tool actually fired
      "result": "<a very long base64 PNG string>"  // <- the image itself, base64, png by default
    },
    { "type": "message", "content": [ /* may be empty; image responses don't always include text */ ] }
  ],
  "usage": { "input_tokens": 2347, "output_tokens": 74 }
}
```

이미지가 실제로 생성되었는지 확인하는 방법:

* ✅ **성공**: `output`에 `type="image_generation_call"`가 포함되어 있고, `result`가 `\x89PNG`로 시작하는 유효한 이미지로 디코딩됩니다.
* ⚠️ **조용히 제거됨**: HTTP 200이지만 `output`에 `image_generation_call`가 없고, 텍스트만 반환됩니다(채널이 이 도구를 지원하지 않을 때 흔합니다).
* ❌ **오류**: 200이 아니거나 `unknown tool` / `no available channels` 등을 반환합니다. 후자의 두 경우에는 `/v1/images/generations`으로 대체하십시오.

## 투명 배경

`image_generation` 도구는 `background: "transparent"`를 지원하며, `/v1/images/generations`와 동일합니다:

```json theme={null}
{
  "model": "gpt-5.5",
  "input": "Generate a cartoon fox sticker",
  "tools": [{
    "type": "image_generation",
    "model": "gpt-image-2",
    "background": "transparent",
    "output_format": "png"
  }]
}
```

반환된 `image_generation_call`는 `"background": "transparent"`를 그대로 반영하며, `result`는 실제 알파 채널이 있는 PNG로 디코딩됩니다. `output_format`는 `png` 또는 `webp`여야 합니다 — `jpeg`과 함께 사용하면 오류가 발생합니다. jpeg에는 알파 채널이 없기 때문입니다.

모델별 투명도 지원은 [투명 배경으로 이미지를 생성하려면 어떻게 해야 합니까](/ko/faq/image-transparent-background)를 참조하십시오.

## 💰 과금

하나의 실제 호출을 예시로 들면(입력 2347 token, 출력 74 token, 1122×1402 PNG 1개 생성), **최종 과금 = \$0.213954**이며, 이는 정확합니다. 세부 내역:

| 항목            | 쿼터 계산                                                                                        | USD                  |
| ------------- | -------------------------------------------------------------------------------------------- | -------------------- |
| 텍스트 부분        | `(input 2347 + output 74×completion multiplier 6) × input multiplier 2.5` = **6977.5 quota** | ≈ \$0.014            |
| **이미지 도구 부분** | **≈ 100,000 quota** (이미지당, token과 무관)                                                        | **≈ \$0.20 / image** |
| **총합**        | **106,977 quota**                                                                            | **\$0.213954**       |

> 환산: `500,000 quota = \$1` (`106977 quota = \$0.213954`에서 도출됨).

<Warning>
  **콘솔 상세 페이지의 표시상 특이점입니다(고객에게 사전에 설명하십시오)**

  APIYI의 "조건부 과금 상세" 페이지에서는:

  * 상단 섹션에는 계산의 **텍스트 부분**만 표시됩니다(`base cost = (2347 + 74×6) × 2.5 = 6977.50`);
  * **이미지 도구 호출 과금(≈100,000 quota / ≈\$0.20)은 상세 목록에서 빈 행으로 표시되며, 렌더링되지 않습니다**;
  * 하지만 하단의 "최종 quota 106977 / \$0.213954"에는 **정확하게 반영됩니다**.

  **결론: 과금은 정상이고 정확합니다** — 상세 UI가 "이미지 도구" 행을 표시하지 못할 뿐이므로, 각 항목의 합계가 최종 총액과 일치하지 않습니다. 고객에게 설명할 때는 **총액은 정확하며, 차이는 이 이미지의 도구 수수료(≈\$0.20/image)인데 별도로 항목화되지 않았을 뿐입니다**라고 강조하십시오.
</Warning>

### 비용 참고 사항

* 생성 비용은 **이미지당 고정**(≈\$0.20/image)이며 prompt 길이에 따라 달라지지 않습니다. 텍스트 token 비용은 이에 비해 작습니다.
* 각 이미지는 약 60-90초가 걸립니다. 클라이언트 timeout은 ≥300s로 설정하십시오.
* 이미지만 필요하고 모델이 자율적으로 판단할 필요가 없다면, 독립형 [`/v1/images/generations`](/ko/api-capabilities/gpt-image-2/text-to-image) 엔드포인트가 더 저렴하고 더 제어하기 쉽습니다.

## 문제 해결

| 증상                                | 가능한 원인                        | 해결 방법                                       |
| --------------------------------- | ----------------------------- | ------------------------------------------- |
| 200이지만 `image_generation_call` 없음 | 현재 채널이 도구를 지원하지 않습니다(조용히 제거됨) | 키/채널을 전환하거나 `/v1/images/generations`을 사용합니다 |
| `no available channels`           | 키의 그룹에 일치하는 채널이 없습니다          | GPT/이미지 채널이 있는 키 그룹으로 전환합니다                 |
| 요청 시간 초과                          | 생성이 느립니다                      | 클라이언트 timeout을 300s로 설정합니다                  |
| `result`이 PNG로 디코딩되지 않습니다         | 출력 형식이 변경되었거나 채널 이상입니다        | `output_format`을 확인하고 매직 바이트를 검증합니다         |

## 관련 문서

* [GPT-Image-2 개요](/ko/api-capabilities/gpt-image-2/overview) - 모델 개요 및 과금
* [텍스트-이미지 API 레퍼런스](/ko/api-capabilities/gpt-image-2/text-to-image) - `/v1/images/generations`, 대부분의 경우 기본 선택지
* [이미지 편집 API 레퍼런스](/ko/api-capabilities/gpt-image-2/image-edit) - `/v1/images/edits`, 참조 이미지 편집 / 다중 이미지 융합 / 마스크
