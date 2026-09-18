> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 긴 prompt와 2단계 생성: 32K 제한은 어디에서 비롯되는가

> 한 고객이 ChatGPT에는 이러한 제한이 없는데 왜 저희 prompt는 32K로 제한되는지 문의했습니다. 32,000자는 token이 아니라 문자 수를 기준으로 계산되는 OpenAI Images API의 공식 제한입니다. 웹 앱이 긴 자료를 처리할 수 있는 이유는 먼저 채팅 모델이 이를 요약해 정제하기 때문입니다. 제한, 비용, 더 길다고 해서 지시 준수력이 향상되는 것은 아닌 이유, 그리고 자료를 텍스트 모델에 입력한 후 prompt를 이미지 모델에 입력하는 2단계 파이프라인을 설명합니다.

“프롬프트 길이가 ChatGPT와 다른 것 같고, 32K로 제한된 것 같습니다.” 이 32K는 APIYI가 추가한 제한이 아닙니다. 이는 공식 OpenAI 이미지 API의 제한이며, token이 아닌 **문자 수**로 계산됩니다. 그러나 진짜 질문은 “32K를 보낼 수 있는가”가 아니라, **원자료 32K를 애초에 이미지 모델에 전달해야 하는가**입니다. 이 페이지에서는 제한이 어디에서 비롯되는지, 웹 앱이 무제한처럼 보이는 이유, 긴 프롬프트로 인해 발생하는 두 가지 비용, 그리고 광고 소재처럼 요구사항이 많은 작업을 위한 프롬프트 구성 방법을 설명합니다.

## 고객의 질문: ChatGPT에는 제한이 없는데 API는 왜 32K로 제한됩니까?

익명화된 대화입니다.

> 고객: 귀사의 prompt 길이는 ChatGPT와 다릅니다. 32K로 제한된 것 같습니다.
> 당사: 제한이 있습니다. 32K prompt가 필요한 이미지 작업을 누가 하겠습니까?
> 고객: 많습니다. 광고 크리에이티브, 패키지 규격 등입니다... 그냥 Codex CLI를 직접 호출하겠습니다.
> 당사: 확인을 위해 묻겠습니다. 32,000 token prompt입니까?
> 고객: 네. 영어로 32,000자는 전혀 길지 않습니다.

여기에는 서로 다른 세 가지 개념이 뒤엉켜 있습니다. 먼저 분리해 보십시오.

| 개념           | 의미                              | 이 경우                                                         |
| ------------ | ------------------------------- | ------------------------------------------------------------ |
| **문자**       | prompt 문자열의 길이                  | 이미지 API 제한: **32,000자**                                      |
| **token**    | 모델이 과금하고 읽는 단위                  | 영어 32,000자는 대략 8K token이며, 중국어는 문자당 더 많은 token을 사용합니다        |
| **컨텍스트 윈도우** | 텍스트 모델이 한 번의 호출에서 담을 수 있는 모든 내용 | 텍스트 모델은 수십만에서 100만 token을 처리하며, 이미지 모델의 prompt 제한과는 관련이 없습니다 |

“영어로 32,000자는 길지 않다”는 말은 문자에 관한 주장으로, 타당합니다. 하지만 고객이 비교한 ChatGPT 웹 앱은 애초에 동일한 경로를 거치지 않습니다.

## 32K 제한의 출처

`prompt` 필드에 대한 공식 OpenAI Images API 제한(`/v1/images/generations` 및 `/v1/images/edits`에도 동일):

| 모델                                                                   | 프롬프트 제한    | 단위 |
| -------------------------------------------------------------------- | ---------- | -- |
| gpt-image 제품군(`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2` 포함) | **32,000** | 문자 |
| DALL·E 3                                                             | 4,000      | 문자 |
| DALL·E 2                                                             | 1,000      | 문자 |

출처: OpenAI API 레퍼런스, `developers.openai.com/api/reference/resources/images/methods/generate`.

<Info>
  APIYI의 공식 릴레이는 이 제한을 추가로 강화하지 않습니다. 32,000자를 초과하면 제공업체가 400을 반환합니다. 정확한 오류 문구는 제공업체의 문구이며, 이 페이지에서는 경계값을 바이트 단위로 하나씩 확인하지 않았습니다. 정확한 제한 지점이 필요하다면 직접 보유한 키로 한 번 호출해 확인할 수 있으며, 거부된 요청에는 과금되지 않습니다.
</Info>

**문자는 tokens가 아닙니다.** 과금과 모델의 이해는 모두 tokens를 기준으로 수행되며, `usage.input_tokens_details.text_tokens`는 호출마다 실제로 소비된 텍스트 tokens를 보고합니다. 동일한 32,000자는 영어에서는 약 8K tokens에 해당하지만, 각 문자가 더 많은 tokens에 매핑되고 더 많은 정보를 담는 중국어에서는 눈에 띄게 더 많습니다. 따라서 “영어 32K는 짧다”와 “중국어 32K는 길다”가 모두 참일 수 있습니다.

## ChatGPT 웹 앱이 무제한처럼 보이는 이유

[만족스러운 이미지를 얻는 방법](/ko/api-capabilities/image-generation-success-tips) 및 [안전 거부](/ko/api-capabilities/image-safety-troubleshooting)와 같은 핵심 내용입니다. **웹 앱은 에이전트이고, API는 단일 원자적 호출입니다.**

* ChatGPT에 긴 문서를 붙여 넣으면 이를 읽는 주체는 이미지 모델이 아니라 채팅 모델입니다. 채팅 모델은 문서를 읽은 후 **자체적으로 짧은 이미지 prompt를 작성하고** 해당 prompt로 이미지 도구를 호출합니다. 이미지 모델은 원본 자료를 전혀 보지 못합니다. 10,000자를 초과하는 붙여넣기 내용은 첨부 파일로 자동 변환되기도 하므로(OpenAI 도움말 센터, `help.openai.com`), 해당 텍스트가 채팅 모델을 위한 것임이 더욱 분명합니다.
* API를 사용하면 이미지 모델과 직접 통신합니다. 중간에서 누군가 자료를 읽고 사용자를 대신해 선택하지 않습니다. 제한은 이미지 모델 계층에 속하며, 웹 앱은 이미지 모델을 해당 자료에 노출하지 않습니다.
* 고객이 마지막에 남긴 “Codex CLI를 직접 호출하겠습니다”라는 말은 올바른 방향입니다. 텍스트 모델이 자료를 읽고 이미지 prompt를 생성하도록 하면 됩니다. 이것이 바로 웹 앱이 내부적으로 수행하는 작업이며, 아래의 2단계 파이프라인을 사용하면 실행할 수 있습니다.

## 긴 prompt의 두 가지 비용

먼저 비용, 그다음 결과입니다.

**비용**: gpt-image 제품군의 텍스트 입력은 token당 과금됩니다(\$5.00/백만 token, `gpt-image-2.5` 기준, [개요 과금 표](/ko/api-capabilities/gpt-image-2/overview) 참조). 32,000자 분량의 영어 prompt는 약 8K token으로, 호출당 대략 \$0.04가 듭니다. 중국어는 비용이 더 높습니다. 한 번만 보면 적은 금액이지만 이미지 수를 곱하면 커지고, 재시도할 때마다 다시 지불해야 합니다. prompt의 90%가 장면 설명이 아닌 원자료라면, 지출 대부분은 아무런 가치를 만들지 못합니다.

**결과**: 세부 정보가 많다고 해서 지시 준수도가 더 높아지는 것은 아닙니다. 수백 가지 요구 사항을 한 번에 이미지 모델 앞에 제시하면 서로 경쟁하게 되며, 실제로 중요한 엄격한 제약 조건(로고가 왜곡되지 않을 것, 패키지 문구가 정확할 것, 사람 수)이 묻히게 됩니다. OpenAI 자체 이미지 prompt 지침에서도 먼저 명확한 한 문장부터 세 문장으로 시작한 다음, 필요한 구성, 조명 및 엄격한 제약 조건을 추가하라고 안내합니다(`openai.com/academy/image-generation`). 이미지 모델에 필요한 것은 단어 수가 아니라 **명확한 우선순위를 갖춘 정보 밀도**입니다.

따라서 “전문 광고에는 요구 사항이 많다”는 말은 맞지만, **상세한 것과 긴 것은 같지 않습니다**. [고급 이미지 생성](/ko/api-capabilities/image-advanced-workflow)의 여섯 가지 요소와 [이미지 Prompt 닥터 스킬](/ko/api-capabilities/image-prompt-doctor)의 “prompt를 형용사로 채우지 말 것”이라는 규칙도 같은 내용을 말합니다.

## 두 단계: 자료를 텍스트 모델에 입력하고, 프롬프트를 이미지 모델에 입력합니다

이미지 작업에 실제로 32K 분량의 자료가 포함되어 있다면, 대개 브랜드 북, 패키징 사양서, 광고 브리프 또는 캐릭터 바이블입니다. 이러한 자료는 먼저 텍스트 모델에 입력해야 하며, 텍스트 모델이 이를 이미지 모델용의 조밀한 프롬프트 하나로 요약합니다.

| 단계   | 입력                                 | 모델                       | 출력                     |
| ---- | ---------------------------------- | ------------------------ | ---------------------- |
| ① 요약 | 브랜드 북 / 패키징 사양서 / 광고 브리프, 길이 제한 없음 | `gpt-5.6`와 같은 텍스트 모델     | 1K\~3K자의 구조화된 이미지 프롬프트 |
| ② 생성 | ①단계의 프롬프트(32K보다 훨씬 짧음)             | `gpt-image-2.5-sunburst` | 이미지                    |

요약 출력 템플릿에는 6가지 요소에 더해 광고에 특화된 세 가지 섹션이 추가됩니다.

| 섹션                  | 포함할 내용                                                |
| ------------------- | ----------------------------------------------------- |
| **하드 제약 조건(최우선)**   | 로고를 왜곡하지 않음, 패키징 텍스트를 원문 그대로 표기, 사람 수, 화면 비율, 배경 색상 값 |
| **목적 및 배치**         | 어떤 종류의 광고인지, 어디에 게재되는지, 시청자가 어떤 감정을 느껴야 하는지           |
| **주제 및 반드시 유지할 요소** | 제품이 무엇인지, 어떤 패키징 요소가 정확히 나타나야 하는지                     |
| **구도 및 네거티브 스페이스**  | 제품 위치, 사람 위치, 프레이밍, 카피를 위해 확보할 빈 공간                   |
| **시각 요소**           | 배경, 팔레트, 조명, 소재, 사진 스타일                               |
| **하지 말아야 할 것**      | 추가해서는 안 되는 것, 변경해서는 안 되는 것                            |

<Steps>
  <Step title="자료를 있는 그대로 텍스트 모델에 전달합니다">
    브랜드 북, 사양서, 브리프는 전처리할 필요가 없습니다. 텍스트 모델의 컨텍스트가 충분히 크기 때문입니다. 시스템 프롬프트에 출력 템플릿, 문자 수 예산(2,500자 이하를 권장 목표로 설정) 및 “하드 제약 조건 우선”을 명시합니다.
  </Step>

  <Step title="길이 게이트를 통해 프롬프트를 확인합니다">
    `len(prompt)`을 확인하고, 32,000을 초과하면 텍스트 모델을 사용해 한 번 더 압축합니다. 요약된 프롬프트는 일반적으로 1\~2천 자이므로 이 단계는 안전장치 역할을 합니다.
  </Step>

  <Step title="프롬프트를 저장한 다음 이미지 모델을 호출합니다">
    요약된 프롬프트를 저장하고 생성 시에는 해당 프롬프트만 다시 사용합니다. 재시도, 크기 변경 및 모델 교체 시에도 자료를 다시 읽거나 자료에 대한 token을 다시 지불하지 않습니다.
  </Step>

  <Step title="자료가 변경되면 1단계만 다시 실행합니다">
    패키징을 다시 디자인하거나 브리프를 업데이트하는 경우 다시 요약합니다. 생성 코드와 매개변수는 그대로 유지됩니다.
  </Step>
</Steps>

최소 구현(OpenAI SDK, 두 단계에서 하나의 키를 공유):

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1",
)

DISTILL_SYSTEM = """You are an ad-creative prompt engineer. Read all the material the user provides and output one prompt that can be sent directly to an image model.

Write in this order, one line per section:
1 Hard constraints: logo not distorted, packaging text verbatim, number of people, aspect ratio, background colour value
2 Purpose and placement
3 Subject and packaging elements that must be kept
4 Composition and negative space: product position, people position, framing, area reserved for copy
5 Visual: setting, palette, one identifiable key light, materials, photographic style
6 Do not

Rules:
- At most 2500 characters. Output only the prompt body, no explanation, no headings
- Do not invent anything absent from the material, especially brand names and packaging text
- Do not use vague quality words such as 8K, ultra HD, masterpiece, perfect
- Keep anything the material specifies explicitly, do not rewrite it"""

PROMPT_LIMIT = 32000  # OpenAI Images API prompt limit, in characters


def distill(brief: str, model: str = "gpt-5.6") -> str:
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": DISTILL_SYSTEM},
            {"role": "user", "content": brief},
        ],
    )
    prompt = resp.choices[0].message.content.strip()
    if len(prompt) > PROMPT_LIMIT:
        # rare; compress one more round if it happens
        prompt = distill(f"Compress the following prompt to under 2500 characters, keeping every hard constraint:\n\n{prompt}", model)
    return prompt


def generate(prompt: str, size: str = "1536x1024", quality: str = "high") -> bytes:
    import base64
    resp = client.images.generate(
        model="gpt-image-2.5-sunburst",
        prompt=prompt,
        size=size,
        quality=quality,
        timeout=600,
    )
    return base64.b64decode(resp.data[0].b64_json)


if __name__ == "__main__":
    brief = open("brief.md", encoding="utf-8").read()   # brand book + packaging spec + ad requirements, any length
    prompt = distill(brief)
    open("prompt.txt", "w", encoding="utf-8").write(prompt)   # persist; generation replays only this
    open("ad.png", "wb").write(generate(prompt))
```

<Tip>
  생성 매개변수와 함께 요약된 프롬프트를 보관하는 것이 이 제품군에서 결과를 재현할 수 있는 **유일하게 신뢰할 수 있는 방법**입니다(GPT-Image 제품군은 seed를 제공하지 않습니다). [고급 이미지 생성](/ko/api-capabilities/image-advanced-workflow)의 5절을 참조하십시오.
</Tip>

## 긴 프롬프트가 실제로 필요한 경우

몇 가지 경우에는 프롬프트가 더 길어지기도 하지만, 어느 경우도 32K에 가까워지지는 않습니다.

* **여러 이미지 편집**: 참조 이미지를 “이미지 1 / 이미지 2 / 이미지 3”으로 지칭하고 각 이미지에서 무엇을 가져올지 설명합니다. 수백 자 정도입니다.
* **이미지 안의 텍스트**: 간판, 포스터, 패키지 문구는 모델에 맡기지 말고 그대로 제공해야 합니다. 수십 자에서 수백 자 정도입니다.
* **시리즈에 공통으로 사용하는 접두사**: 한 배치에 공통으로 적용되는 스타일, 조명 및 구도 블록입니다. 1,000자 이내입니다.

이 요소들을 모두 합쳐도 대개 2,000\~3,000자 정도입니다. 프롬프트가 32K에 가까워진다면 원자료가 그대로 붙여넣어졌는지 의심해야 합니다.

## 빠른 참조

* **32,000자는 공식 OpenAI 이미지 API의 제한입니다.** token이 아닌 문자 수로 계산되며 `/generations` 및 `/edits`에 동일하게 적용됩니다. APIYI의 공식 릴레이에서는 이 제한을 더 엄격하게 적용하지 않습니다.
* **문자, token, 컨텍스트 윈도우는 서로 다른 개념입니다.** 영어 32K자는 약 8K token에 해당하고, 중국어는 더 많습니다. 텍스트 모델의 컨텍스트 윈도우는 이미지 모델의 프롬프트 제한과 아무런 관련이 없습니다.
* **웹 앱의 “제한 없음”은 착시입니다.** 채팅 모델이 자료를 읽고 이미지 도구를 위한 자체적인 짧은 프롬프트를 작성하므로, 이미지 모델은 32K 제한에 직면하지 않습니다.
* **상세함은 길다는 의미가 아닙니다.** 텍스트 입력은 token 단위로 과금되며 재시도할 때마다 다시 비용이 발생합니다. 서로 충돌하는 요구 사항을 수백 개 제시하면 핵심 제약 조건이 묻히게 됩니다.
* **두 단계로 진행합니다.** 먼저 텍스트 모델을 사용하여 자료를 1K\~3K자의 구조화된 프롬프트로 요약하고, 핵심 제약 조건을 앞에 배치한 뒤 이를 저장합니다. 그런 다음 생성 시에는 프롬프트만 다시 사용합니다.

## 관련 문서

* [만족스러운 이미지를 얻는 방법](/ko/api-capabilities/image-generation-success-tips)
* [안전 거부](/ko/api-capabilities/image-safety-troubleshooting)
* [고급 이미지 생성: 워크플로 및 사실성](/ko/api-capabilities/image-advanced-workflow)
* [이미지 프롬프트 닥터 스킬](/ko/api-capabilities/image-prompt-doctor)
* [텍스트-이미지 API 레퍼런스](/ko/api-capabilities/gpt-image-2/text-to-image)
