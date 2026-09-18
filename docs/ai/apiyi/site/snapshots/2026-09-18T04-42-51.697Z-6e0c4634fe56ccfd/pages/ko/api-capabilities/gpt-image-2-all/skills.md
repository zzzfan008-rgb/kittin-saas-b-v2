> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2.5-All 에이전트 스킬

> 에이전트에서 gpt-image-2.5-all(리버스, ChatGPT 라인 — 가장 빠르며 이미지당 고정 $0.03, gpt-image-2-all도 동일한 호출 사용)을 사용합니다. gpt-image-2 및 gpt-image-2-vip와 하나의 gpt-image-2 스킬을 공유하며, `--model`을 gpt-image-2.5-all로 설정하면 됩니다.

<Note>
  **gpt-image-2-all은 자체 스킬이 필요하지 않습니다.** gpt-image-2 (official) 및 gpt-image-2-vip와 하나의 **gpt-image-2 series 스킬**을 공유하며, 세 가지 모두 동일한 OpenAI Images API를 사용합니다. 차이는 `--model`뿐입니다. 전체 설치 방법, `SKILL.md`, 스크립트는 [**GPT-Image-2 Series Agent Skill**](/ko/api-capabilities/gpt-image-2/skills)을 참조하십시오.
</Note>

## 이 모델의 용도

<CardGroup cols={3}>
  <Card title="가장 빠름" icon="bolt">
    ChatGPT 역방향 라인, 약 30–60초 — 세 채널 중 가장 빠릅니다.
  </Card>

  <Card title="가장 저렴함" icon="piggy-bank">
    크기/품질과 무관하게 이미지당 고정 \$0.03 — 대량 처리에 적합합니다.
  </Card>

  <Card title="T2I / 융합" icon="layers">
    텍스트-투-이미지와 최대 16장 이미지 융합(마스크 인페인팅 없음).
  </Card>
</CardGroup>

## 스킬에서 사용하는 방법

[gpt-image-2 시리즈 스킬](/ko/api-capabilities/gpt-image-2/skills)을 설치한 후 `--model`을 `gpt-image-2.5-all`(또는 `gpt-image-2-all`, 가격과 동작은 동일함)으로 설정합니다.

```bash theme={null}
python3 gpt-image-2/scripts/gpt_image.py "Flat-illustration festival poster, portrait 2:3" -o poster.png --model gpt-image-2.5-all
```

기본 채널로 설정하려면(매번 `--model`을 지정하지 않도록) `gpt-image-2/.env`에 다음 줄을 추가합니다.

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2.5-all
```

<Warning>
  **금지 사항**: gpt-image-2-all은 **`size` / `quality` / `n`을 허용하지 않습니다** —

  * 크기/비율은 **프롬프트에** 입력합니다(예: “세로 2:3”, “16:9 배너”). 전달된 `size`은 무시되거나 오류가 발생합니다.
  * `n>1`을 전달해도 **이미지는 1개만 반환되지만 개수에 따라 과금됩니다**.

  이 모델에서는 스킬 스크립트가 이미 `size`/`quality`/`n`을 생략하므로 `--model gpt-image-2-all`을 일반적으로 사용하는 것은 안전합니다. 스크립트 외부에서 직접 요청을 작성하는 경우에만 주의하면 됩니다. 고정된 크기/4K를 사용하려면 [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/skills)을 사용하고, 품질 단계/마스크에는 공식 `gpt-image-2`을 사용합니다.
</Warning>

## 관련 문서

* [GPT-Image-2 시리즈 에이전트 스킬 (메인 페이지 · 전체 스크립트)](/ko/api-capabilities/gpt-image-2/skills)
* [GPT-Image-2-VIP 에이전트 스킬](/ko/api-capabilities/gpt-image-2-vip/skills)
* [GPT-Image-2-All 이미지 생성 개요](/ko/api-capabilities/gpt-image-2-all/overview)
