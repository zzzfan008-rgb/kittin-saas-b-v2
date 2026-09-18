> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2.5-VIP 에이전트 스킬

> 에이전트에서 gpt-image-2.5-vip(리버스, Adobe 라인 — 크기/4K 잠금 가능, 이미지당 고정 $0.03)를 사용합니다. gpt-image-2-vip도 동일한 호출을 사용합니다. gpt-image-2 및 gpt-image-2-all과 하나의 gpt-image-2 스킬을 공유하므로 --model을 gpt-image-2.5-vip로 설정하면 됩니다.

<Note>
  **gpt-image-2-vip에는 자체 스킬이 필요하지 않습니다.** gpt-image-2 (official) 및 gpt-image-2-all과 단일한 **gpt-image-2 시리즈 스킬**을 공유하며, 이 세 가지는 모두 동일한 OpenAI Images API를 사용합니다. 단, `--model`만 다릅니다. 전체 설치, `SKILL.md`, 그리고 스크립트는 [**GPT-Image-2 Series Agent Skill**](/ko/api-capabilities/gpt-image-2/skills)을 참조하십시오.
</Note>

## 이 모델이 적합한 용도

<CardGroup cols={3}>
  <Card title="크기 지정 가능 / 4K" icon="expand">
    Adobe 라인(Firefly)을 역으로 구현하며, 30 `size`개 등급(3840×2160과 같은 4K 포함)을 지원합니다 — 크기를 제어할 수 있습니다.
  </Card>

  <Card title="최저가" icon="piggy-bank">
    이미지당 고정 \$0.03이며 모든 크기의 가격이 동일하고 4K 추가 요금이 없습니다.
  </Card>

  <Card title="T2I / 융합" icon="layers">
    텍스트-이미지 변환 및 최대 16개 이미지 융합을 지원합니다(품질 등급 / 마스크 없음).
  </Card>
</CardGroup>

## 스킬에서 사용하는 방법

[gpt-image-2 시리즈 스킬](/ko/api-capabilities/gpt-image-2/skills)을 설치한 후 `--model`을 `gpt-image-2.5-vip`(또는 `gpt-image-2.5-flare-vip` / `gpt-image-2-vip`)으로 설정하고 `--size`로 크기를 고정합니다:

```bash theme={null}
python3 gpt-image-2/scripts/gpt_image.py "Aerial city night view" -o city.png --model gpt-image-2.5-vip --size 3840x2160
```

기본 채널로 설정하려면 `gpt-image-2/.env`에 다음 줄을 추가합니다:

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2.5-vip
```

<Warning>
  **주의 사항**: `quality` 티어는 모델에 따라 다릅니다. 2.5 모델 2개는 6개를 모두 지원하고(`xhigh` / `max`는 2026-09-10에 활성화됨), `gpt-image-2-vip`은 `high`에서 중단되며 `xhigh` / `max`를 거부합니다. 2.5 `high`은 `gpt-image-2-vip` `medium`만 지원하고, 2.5 `max`은 해당 `high`과 동일합니다. **`n`는 절대 전송하지 마십시오**(`n>1`을 전달해도 이미지 1장이 반환되지만 수량에 따라 과금됩니다). 또한 **마스크는 전체 이미지 재생성**입니다(정밀한 인페인팅에는 공식 모델을 사용하십시오). 스킬 스크립트가 이를 자동으로 제한하므로 일반적인 `--model gpt-image-2.5-vip` 사용은 안전합니다.

  또한 `size`은 상위 서비스에서 간혹 비활성화되어 적응형 1K로 강제될 수 있습니다. 이 경우 대체 수단으로 크기/비율을 **프롬프트에** 함께 입력하십시오(예: “16:9”).
</Warning>

## 관련 문서

* [GPT-Image-2 시리즈 에이전트 스킬 (메인 페이지 · 전체 스크립트)](/ko/api-capabilities/gpt-image-2/skills)
* [GPT-Image-2-All 에이전트 스킬](/ko/api-capabilities/gpt-image-2-all/skills)
* [GPT-Image-2-VIP 이미지 생성 개요](/ko/api-capabilities/gpt-image-2-vip/overview)
