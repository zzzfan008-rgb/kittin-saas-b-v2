> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2-VIP 에이전트 스킬

> gpt-image-2-vip(역방향, Codex 라인 — 고정 가능한 크기/4K, 이미지당 정액 $0.03)를 에이전트 안에서 사용합니다. 이는 gpt-image-2와 gpt-image-2-all과 하나의 gpt-image-2 스킬을 공유하므로, --model을 gpt-image-2-vip로 설정하면 됩니다.

<Note>
  **gpt-image-2-vip에는 자체 스킬이 필요하지 않습니다.** gpt-image-2 (official) 및 gpt-image-2-all과 단일한 **gpt-image-2 시리즈 스킬**을 공유하며, 이 세 가지는 모두 동일한 OpenAI Images API를 사용합니다. 단, `--model`만 다릅니다. 전체 설치, `SKILL.md`, 그리고 스크립트는 [**GPT-Image-2 Series Agent Skill**](/ko/api-capabilities/gpt-image-2/skills)을 참조하십시오.
</Note>

## 이 모델이 적합한 용도

<CardGroup cols={3}>
  <Card title="고정 가능한 크기 / 4K" icon="expand">
    Reverse Codex 라인, 30 `size` 티어를 지원합니다(3840×2160 같은 4K 포함) — 크기를 제어할 수 있습니다.
  </Card>

  <Card title="가장 저렴함" icon="piggy-bank">
    정액 \$0.03/image, 모든 크기가 동일 가격이며 4K 추가 요금이 없습니다.
  </Card>

  <Card title="텍스트-투-이미지 / 퓨전" icon="layers">
    텍스트-투-이미지와 최대 16장 이미지 퓨전(품질 티어 / 마스크 없음).
  </Card>
</CardGroup>

## 스킬에서 사용하는 방법

[gpt-image-2 시리즈 스킬](/ko/api-capabilities/gpt-image-2/skills)을 설치한 후, `--model`를 `gpt-image-2-vip`로 설정하고 `--size`로 크기를 고정합니다:

```bash theme={null}
python3 gpt-image-2/scripts/gpt_image.py "Aerial city night view" -o city.png --model gpt-image-2-vip --size 3840x2160
```

기본 채널로 사용하려면 `gpt-image-2/.env`에 한 줄을 추가합니다:

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2-vip
```

<Warning>
  **레드 라인**: gpt-image-2-vip는 **`quality` / `n`을 허용하지 않으며** **마스크 인페인팅도 지원하지 않습니다** (마스크에는 공식 `gpt-image-2`를 사용하십시오). `n>1`을 전달해도 이미지 1개가 반환되지만 수량 기준으로 과금됩니다. 스킬 스크립트가 이를 자동으로 제어하므로, 일반적인 `--model gpt-image-2-vip` 사용은 안전합니다.

  또한: `size`는 상위에서 때때로 비활성화되어 adaptive 1K로 강제됩니다. 그런 경우에는 크기/비율도 **prompt에** 넣어 대체 수단으로 사용하십시오(예: 16:9).
</Warning>

## 관련 문서

* [GPT-Image-2 시리즈 에이전트 스킬 (메인 페이지 · 전체 스크립트)](/ko/api-capabilities/gpt-image-2/skills)
* [GPT-Image-2-All 에이전트 스킬](/ko/api-capabilities/gpt-image-2-all/skills)
* [GPT-Image-2-VIP 이미지 생성 개요](/ko/api-capabilities/gpt-image-2-vip/overview)
