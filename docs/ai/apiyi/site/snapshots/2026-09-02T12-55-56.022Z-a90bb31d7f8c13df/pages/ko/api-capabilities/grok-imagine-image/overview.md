> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Imagine 2 이미지 생성 및 편집

> APIYI의 xAI 최신 세대 이미지 모델(grok-imagine-image / grok-imagine-image-quality)인 Grok Imagine 2에 대한 완전한 가이드입니다. 5가지 종횡비, 1K/2K 티어, 호출당 최대 10개 이미지, 진짜 참고 이미지 편집, 해상도와 관계없이 이미지당 고정 $0.02 / $0.045 — 2K에서는 목록 가격의 약 64%입니다.

## 개요

**Grok Imagine 2**는 xAI의 **최신 2세대** 이미지 모델로, 파라미터 제어와 편집 모두에서 첫 번째 출시판을 완전히 뛰어넘는 세대 도약입니다. 종횡비와 해상도가 실제로 반영되고, 2K 티어를 사용할 수 있으며, 한 번의 호출로 최대 10장의 이미지를 반환하고, 참조 편집은 원본 이미지를 실제로 보존합니다.

APIYI는 두 가지 변형을 제공합니다: `grok-imagine-image`(표준)과 `grok-imagine-image-quality`(고품질)입니다. 두 버전은 동일한 엔드포인트와 파라미터를 공유하며, 출력 충실도와 가격만 다릅니다.

<Note>
  **핵심 특징**: 해상도를 **무시하는** 요청당 고정 요금제입니다. xAI는 2K 품질 티어를 \$0.07로 책정하지만, 저희는 어느 쪽이든 \$0.045를 부과하며, 이는 대략 \*\*정가의 64%\*\*입니다. 또한 5개의 종횡비 x 2개의 해상도 티어가 **실제로 반영**되고, 한 번의 호출로 최대 10장의 이미지를 반환하며, 예술 스타일, 구도, 팔레트, 주제 식별성을 보존하는 고충실도 참조 편집을 제공합니다. 1K 이미지는 약 9초가 걸립니다.
</Note>

<Info>
  **모델 ID에는 `2`가 포함되지 않습니다.** 제품명은 Grok Imagine 2이지만, 호출하는 모델 이름은 \*\*`grok-imagine-image`\*\*와 \*\*`grok-imagine-image-quality`\*\*입니다. 존재하지 않는 모델이므로 `grok-imagine-2-image`를 입력하지 마십시오. 이는 503을 반환합니다.
</Info>

<Warning>
  **📌 먼저 읽으십시오**: **참조 이미지는 편집 엔드포인트 `/v1/images/edits`에서만 동작하며, 텍스트-이미지에서는 절대 동작하지 않습니다.**

  `image` / `image_url` / `images`를 `/v1/images/generations`에 전달하면 **200과 완전히 정상적인 이미지**가 반환되지만, 참조는 **조용히 폐기**되며 여전히 과금됩니다. 어떤 오류도 발생하지 않습니다. 아래의 [엔드포인트](#endpoints)를 참고하십시오.
</Warning>

<Info>
  모든 이미지 API는 **동기식**입니다. 비동기 task ID가 없으므로, 클라이언트가 연결을 끊으면 요청은 여전히 과금되지만 결과는 사라집니다. 충분히 넉넉한 타임아웃을 설정하십시오 — [이미지 API 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참고하십시오.
</Info>

<CardGroup cols={2}>
  <Card title="텍스트-이미지 API" icon="wand-sparkles" href="/ko/api-capabilities/grok-imagine-image/text-to-image">
    라이브 테스트를 위한 인터랙티브 플레이그라운드와 함께, 텍스트 prompt에서 이미지를 생성합니다.
  </Card>

  <Card title="이미지 편집 API" icon="image" href="/ko/api-capabilities/grok-imagine-image/image-edit">
    1-4개 이미지 융합과 플레이그라운드를 지원하며, 참조 이미지와 지시문을 업로드합니다.
  </Card>
</CardGroup>

## AI 에이전트에게 통합을 맡기십시오

<Note>
  Codex / Claude Code / Cursor로 작업하는 경우 아래 프롬프트를 복사하여 에이전트에게 넘기십시오. 에이전트는 먼저 이 페이지의 일반 텍스트 버전을 가져오고(임의의 docs URL 뒤에 `.md`를 추가하십시오), 그다음 프로젝트의 자체 스택에서 코드를 작성합니다 — 타임아웃, URL 결과의 즉시 재호스팅, **참조 이미지를 조용히 버리면서도 과금은 계속하는 엔드포인트**, 그리고 `size`가 아무 일도 하지 않는다는 사실은 이미 요구사항에 반영되어 있습니다.
</Note>

<Prompt description="코딩 에이전트가 Grok Imagine 2 텍스트-이미지 및 이미지 편집을 통합하거나 문제를 해결하게 하십시오. Codex, Claude Code, Cursor 및 유사 도구에 복사하여 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에서 Grok Imagine 2 텍스트-이미지 및 이미지 편집을 통합하거나 문제를 해결하십시오.

  코드를 건드리기 전에 문서를 읽으십시오: 이 페이지의 일반 텍스트 버전을 가져오려면 [https://docs.apiyi.com/en/api-capabilities/grok-imagine-image/overview.md를](https://docs.apiyi.com/en/api-capabilities/grok-imagine-image/overview.md를) 가져오십시오. 더 세밀한 매개변수 세부사항은 텍스트-이미지 및 이미지 편집 페이지 뒤에 같은 방식으로 `.md`를 추가하십시오.

  요구사항:

  1. 모델 이름: 표준 티어는 `grok-imagine-image`이고 고충실도 티어는 `grok-imagine-image-quality`입니다. **모델 ID에는 숫자 2가 포함되지 않습니다** — `grok-imagine-2-image`라고 쓰면 그런 모델이 없으므로 503을 반환합니다.

  2. 타임아웃: 클라이언트 타임아웃을 360초로 늘리십시오. 측정된 지연 시간은 1K에서 약 9초, 2K에서 약 15초이지만, 60초 타임아웃은 많은 가짜 실패를 유발하며, 그 요청은 여전히 과금됩니다. 이미지 API는 동기식입니다 — 작업 ID가 없으므로 클라이언트가 연결을 끊으면 결과가 사라집니다. 리버스 프록시, 게이트웨이 및 서버리스 실행 제한도 모두 늘려야 합니다.

  3. 엔드포인트 선택(**이 모델에서 가장 쉽게 틀리는 부분**): 텍스트-이미지는 `/v1/images/generations`로 JSON 형식으로 보내고, **참조 이미지를 포함한 모든 요청은 `/v1/images/edits`로 `multipart/form-data` 형식으로 보내야 합니다**. 양방향 모두 함정이 있습니다. 참조 이미지를 `/v1/images/generations`에 보내면 **200을 반환하고, 참조를 조용히 버린 뒤 관련 없는 텍스트 전용 이미지를 생성하며, 그에 대해 과금합니다**. 반대로 JSON을 `/v1/images/edits`로 보내면 항상 400을 반환합니다. 파일 필드는 `image` 또는 `image[]`로 이름을 지어야 하며, `images` 또는 `image_file`를 쓰면 415가 반환됩니다. 편집 엔드포인트는 참조 이미지 1\~4장을 받으며, 5장을 보내면 400을 반환합니다.

  4. 응답 처리: 기본값은 `url`이며, 대신 `response_format`를 `b64_json`로 설정하여 순수 base64를 사용할 수 있습니다(`data:` 접두사 없음). `data[]`의 각 항목에는 둘 중 하나만 들어 있습니다. URL을 선택한다면 즉시 다운로드하여 자신의 오브젝트 스토리지에 다시 호스팅하십시오. 또한 이 모델은 **`revised_prompt`를 반환하지 않으며**, `created`는 항상 0이고, `usage`는 자리 표시자입니다(`prompt_tokens`는 항상 n의 1000배입니다) — **비용 산정에 이를 사용하지 마십시오**. 대신 콘솔 과금 기록을 사용하십시오.

  5. 크기 매개변수: `aspect_ratio`(`1:1` / `16:9` / `9:16` / `4:3` / `3:4`, 기본값 `1:1`)와 `resolution`(`1k` / `2k`, **소문자**, 기본값 `1k`)를 함께 사용하십시오. **`size`를 보내지 마십시오** — 이는 조용히 무시되므로 1536 x 1024를 요청했다고 생각하지만 실제로는 1024 x 1024 정사각형을 받게 됩니다. `quality`와 `style`도 같은 방식으로 조용히 무시됩니다. 더 높은 충실도가 필요하면 매개변수를 보내지 말고 `-quality` 모델 이름으로 전환하십시오. `aspect_ratio` 또는 `resolution`의 열거형 범위를 벗어난 값은 조용히 기본값으로 되돌아가며, `resolution`를 `4k`로 설정하면 특히 503을 반환합니다 — 이는 장애가 아니라 매개변수 오류입니다. 한 가지 더: **편집 엔드포인트에서는 `resolution`도 `aspect_ratio`도 아무 영향이 없습니다**. 출력 프레임은 항상 첫 번째 참조 이미지의 크기를 따릅니다.

  6. 업로드 전에 압축하십시오: 각 참조 이미지를 먼저 압축하십시오 — 1.5MB를 초과하는 파일만 처리하고, 종횡비를 유지한 채 긴 변을 2048px로 줄이며(작은 이미지는 절대 업스케일하지 마십시오), 품질 0.9로 다시 인코딩하고 원본 형식을 유지하십시오. 다중 이미지 요청의 경우 전체 크기를 6MB 미만으로 유지하십시오. 한 이미지의 압축에 실패하면 원본으로 되돌려 계속 진행하십시오 — 압축 실패 때문에 전체 요청을 중단해서는 안 됩니다.

  7. 오류 처리: `400 invalid_request`는 형식이 잘못된 매개변수와 모더레이션 차단을 모두 포함하며, 응답 본문은 이를 구분하지 않으므로 양쪽을 모두 조사하십시오. `n`는 1에서 10까지이며, 0은 1로 처리되고 11 이상은 400을 반환합니다. `seed`는 허용되지만 효과가 없으므로 결과를 재현할 수 없습니다. 이 모델은 `mask`를 지원하지 않습니다.

  8. 키는 `APIYI_API_KEY` 환경 변수에서 읽고 [https://api.apiyi.com/v1을](https://api.apiyi.com/v1을) 기본 URL로 사용하십시오. 절대 하드코딩하지 말고, 절대 git에 커밋하지 마십시오.

  9. 작업이 끝나면 실제로 텍스트-이미지 호출 1회와 이미지 편집 호출 1회를 실행한 다음, 결과와 그 두 호출의 비용을 보여 주십시오.
</Prompt>

<Accordion title="이 프롬프트가 막아 주는 문제">
  | 요구사항                      | 방지하는 함정                                                                                                                                                                   |
  | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | 참조 이미지는 편집 엔드포인트에만 전달     | `/v1/images/generations`로 보내면 200을 반환하고 참조를 조용히 버린 뒤에도 과금됩니다 — 아무 오류도 나지 않기 때문에 여기서 가장 비용이 큰 함정입니다                                                                        |
  | `size`를 보내지 않음            | 이는 조용히 무시되므로 크기를 설정했다고 믿지만 실제로는 1024 x 1024 정사각형을 받게 됩니다                                                                                                                  |
  | 숫자 2가 없는 모델 ID            | `grok-imagine-2-image`는 503을 반환하며, 장애처럼 보이지만 실제로는 이름이 잘못된 것입니다                                                                                                            |
  | 더 높은 충실도는 매개변수가 아니라 모델입니다 | 이 모델에는 `quality` 매개변수가 없으며, 보내도 조용히 무시됩니다                                                                                                                                 |
  | `usage`에서 비용을 대조하지 않음     | 이는 `prompt_tokens`가 n의 1000배로 고정된 자리 표시자입니다. 콘솔 과금 기록을 사용하십시오                                                                                                             |
  | 타임아웃을 여전히 360초로 유지        | 약 15초의 지연 시간 때문에 타임아웃을 아주 작게 잡고 싶어지지만, 그러면 피크 시점에 바로 발동합니다 — 그리고 **연결이 끊긴 요청도 여전히 과금됩니다**. [이미지 API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참조하십시오 |
</Accordion>

## APIYI에서 Grok Imagine 2를 사용하는 이유

<CardGroup cols={2}>
  <Card title="OpenAI 호환 형식" icon="shield-check">
    표준 `/v1/images/generations` 및 `/v1/images/edits` 엔드포인트입니다. 요청 본문과 응답 필드는 OpenAI 이미지 API와 일치하므로 공식 OpenAI SDK를 바로 사용할 수 있습니다 — 이전 작업이 전혀 필요하지 않습니다.
  </Card>

  <Card title="동시 실행 수 제한 없음" icon="infinity">
    RPM/RPD 하드 제한이 없습니다. **100 RPM에서도 여유 있게 측정되었습니다**. 채널 용량도 충분하여 배치 워크로드는 선형적으로 확장되며 — 쿼터 요청이나 자체 스로틀링이 필요하지 않습니다.
  </Card>

  <Card title="정액 요금, 예측 가능한 비용" icon="percent">
    이미지당 고정 요금이며, **해상도와 무관합니다**: xAI는 1K에 \$0.05, 2K에 \$0.07의 품질 등급을 제시하지만, 저희는 일괄 \$0.045를 청구합니다 — **2K 기준 공시가의 약 64%입니다**. 정확한 이미지 수에 맞춰 예산을 책정하고, [충전 보너스](/ko/faq/recharge-promotions)를 함께 활용하면 더 낮출 수 있습니다.
  </Card>

  <Card title="글로벌 접근, 장벽 없음" icon="globe">
    **해외 서버나 프록시가 필요하지 않습니다.** 중국 본토 데이터 센터, 가정용 브로드밴드 및 해외 노드 모두 `api.apiyi.com`에 직접 연결됩니다.
  </Card>

  <Card title="완전한 모델 생태계" icon="layers">
    추가로 이용 가능합니다: [Nano Banana 2](/ko/api-capabilities/nano-banana-2-image/overview), [GPT-Image-2](/ko/api-capabilities/gpt-image-2/overview), [Seedream](/ko/api-capabilities/seedream-image/overview), [FLUX](/ko/api-capabilities/flux/overview), 그리고 [Grok 텍스트 모델](/ko/api-capabilities/grok/overview).
  </Card>

  <Card title="전문 지원" icon="handshake">
    저희 팀은 이미지 생성 워크로드에 깊이 있게 대응하며, PoC부터 프로덕션 롤아웃까지 기업 고객을 지원할 수 있습니다.
  </Card>
</CardGroup>

## 주요 기능

<CardGroup cols={2}>
  <Card title="두 가지 해상도 티어" icon="expand">
    `1k`는 대략 1메가픽셀, `2k`는 4.2-4.5메가픽셀(16:9 기준 2816x1584)입니다 — **가격은 같으므로 2K가 더 유리합니다**
  </Card>

  <Card title="5가지 화면 비율" icon="maximize">
    `1:1` / `16:9` / `9:16` / `4:3` / `3:4`, 측정된 픽셀 크기가 정확히 일치합니다
  </Card>

  <Card title="한 번의 호출당 최대 10개" icon="images">
    `n`은 1-10개를 허용하며, 한 요청으로 여러 이미지를 반환합니다 — 배치 선택에 이상적입니다
  </Card>

  <Card title="빠른 생성" icon="zap">
    1K에서는 약 9초, 2K에서는 15-17초가 걸리며, 부하가 걸려도 지연 시간이 안정적입니다 — 100 RPM으로도 무난히 운용됩니다
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="진정한 레퍼런스 편집" icon="wand">
    요청하신 부분만 변경합니다 — 아트 스타일, 구도, 팔레트, 피사체 정체성은 그대로 유지됩니다
  </Card>

  <Card title="다중 이미지 융합" icon="layers-2">
    편집 엔드포인트는 1-4개의 레퍼런스를 받습니다 — 테스트에서는 각 레퍼런스가 하나의 피사체를 추가하며, 첫 번째가 출력 크기를 결정합니다
  </Card>

  <Card title="두 가지 응답 형식" icon="braces">
    `url` 직접 링크 또는 `b64_json` 원시 base64를 지원하며, 두 엔드포인트 모두에서 사용할 수 있습니다
  </Card>

  <Card title="OpenAI SDK 바로 사용 가능" icon="plug">
    `client.images.generate()` 및 `client.images.edit()`은 바로 사용할 수 있습니다 — 수동 HTTP 연동이 필요 없습니다
  </Card>
</CardGroup>

## 요금

| 모델                               | 해상도         | APIYI 가격            | xAI 정가 | 할인율           |
| -------------------------------- | ----------- | ------------------- | ------ | ------------- |
| **`grok-imagine-image`**         | `1k` / `2k` | **\$0.02 / image**  | \$0.02 | 정가와 동일        |
| **`grok-imagine-image-quality`** | `1k`        | **\$0.045 / image** | \$0.05 | **정가의 90%**   |
| **`grok-imagine-image-quality`** | `2k`        | **\$0.045 / image** | \$0.07 | **정가의 약 64%** |

<Info>
  **과금 관련 참고사항**

  * **저희는 해상도를 무시하지만, xAI는 그렇지 않습니다.** xAI는 1K를 \$0.05, 2K를 \$0.07의 품질 등급으로 정가에 올려두는 반면, APIYI는 일률적으로 **\$0.045**를 청구합니다. 따라서 **해상도가 높을수록 절감액이 더 커지며**, 2K에서는 정가의 약 \*\*64%\*\*까지 내려갑니다.
  * **이미지당**: `n=4`은 prompt 길이와 관계없이 4개 이미지로 청구됩니다.
  * **편집 비용은 text-to-image와 동일합니다** — `/v1/images/edits`에는 추가 요금이 없습니다.
  * **`usage` 블록은 정산에 사용할 수 없습니다**: `prompt_tokens`는 항상 `1000 x n`이며, 자리표시자입니다. 대신 콘솔 과금 기록을 사용하십시오.
</Info>

### 충전 보너스 적용 시 실효 비용

이 할인은 [단계별 충전 보너스](/ko/faq/recharge-promotions)와 중복 적용됩니다(누적이 아니라 단일 충전 기준으로 계산됩니다). 품질 등급을 2K로 잡으면:

| 충전 등급               | 크레딧 배수 | 이미지당 실효 비용   | xAI의 \$0.07 대비 |
| ------------------- | ------ | ------------ | -------------- |
| 프로모션 없음(정가)         | 1.0x   | \$0.045      | **정가의 64%**    |
| \$100 단일 충전(+10%)   | 1.1x   | ≈ \$0.041    | **정가의 약 58%**  |
| \$1,000 단일 충전(+15%) | 1.15x  | ≈ \$0.039    | **정가의 약 56%**  |
| \$3,000 단일 충전(+20%) | 1.2x   | **\$0.0375** | **정가의 약 54%**  |

<Tip>
  **일반적인 경우(\$100 등급)에는 2K 이미지가 xAI 정가의 약 58% 수준이며, 최대 보너스에서는 약 54%까지 내려갑니다.** 표준 `grok-imagine-image`도 같은 방식으로 중복 적용되며 — 정가 \$0.02는 20% 보너스에서 이미지당 약 \$0.0167이 됩니다.
</Tip>

## 그룹 설정

Grok Imagine 2는 \*\*`Default` 그룹 (1.0x 요율)\*\*에서 실행되며, 위의 요금표와 동일합니다. **그룹 전환은 필요 없습니다.**

**권장 Token 과금 모델**: `Pay-as-you-go Priority`. 이 제품군은 요청당 과금되며, Pay-as-you-go Priority와 Pay-per-request 모두 올바르게 라우팅됩니다 — Pay-as-you-go Priority를 선택하면 단일 token으로 플랫폼의 다른 곳에 있는 token 과금 모델도 함께 커버할 수 있습니다.

<Tip>
  만약 보유한 token이 이미 다른 이미지 모델도 포함한다면, `Default`를 기본 그룹으로 그대로 유지하시면 됩니다. 이 제품군은 전용 그룹이나 추가 설정이 필요하지 않습니다.
</Tip>

## 기술 사양

| 항목                  | 사양                                                 |
| ------------------- | -------------------------------------------------- |
| 모델 ID               | `grok-imagine-image`, `grok-imagine-image-quality` |
| 화면 비율               | 5: `1:1` / `16:9` / `9:16` / `4:3` / `3:4`         |
| 해상도 단계              | `1k` (\~0.9-1.05 MP), `2k` (\~4.2-4.5 MP)          |
| 출력 형식               | **1K에서 JPEG (\~220-300 KB), 2K에서 PNG (\~5-6 MB)**  |
| 호출당 이미지 수           | `n` 1-10                                           |
| 참조 이미지              | 편집 엔드포인트에서 **1-4개**(`image[]` 반복; 다섯 번째는 400 반환)   |
| 마스크 인페인팅            | ❌ 지원되지 않음                                          |
| 재현 가능한 `seed`       | ❌ 지원되지 않음                                          |
| `revised_prompt` 에코 | ❌ 반환되지 않음                                          |
| 지연 시간               | 1K에서 약 9초, 2K에서 약 15-17초                           |
| 동시 실행 수 / 요청률       | 제한 없음; **100 RPM에서도 무난하게 측정됨**                     |
| 권장 클라이언트 타임아웃       | 360초 이상                                            |

## 엔드포인트

| 기능        | 메서드    | 경로                       | Content-Type              |
| --------- | ------ | ------------------------ | ------------------------- |
| 텍스트를 이미지로 | `POST` | `/v1/images/generations` | `application/json`        |
| 이미지 편집    | `POST` | `/v1/images/edits`       | **`multipart/form-data`** |
| 채팅형 생성    | `POST` | `/v1/chat/completions`   | `application/json`        |

<Warning>
  **✅ 편집 엔드포인트는 `multipart/form-data` 파일 업로드가 필요합니다**

  `/v1/images/edits`에 JSON을 전송하면 **항상 400이 반환됩니다**:

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  **이 점은 상위 공급업체의 문서에서 통합하는 경우 특히 중요합니다** — 그 문서에는 공개 이미지 URL이 포함된 JSON 본문이 설명되어 있지만, 이는 APIYI 게이트웨이를 통해서는 **작동하지 않습니다**. **대신 이 페이지를 따르십시오**: `-F "image=@photo.jpg"`로 파일을 업로드하십시오. 전체 예시는 [이미지 편집 API](/ko/api-capabilities/grok-imagine-image/image-edit)에서 확인할 수 있습니다.

  파일 필드 이름은 `image` 또는 `image[]`여야 하며, `images` / `image_file`는 415를 반환합니다.
</Warning>

<Warning>
  **⚠️ 참고 이미지는 절대로 텍스트를 이미지로 엔드포인트에 보내지 마십시오**

  `/v1/images/generations`가 `image` / `image_url` / `images`를 받으면, **오류를 발생시키지 않습니다**. 200을 반환하고 참고 이미지는 완전히 무시한 채 프롬프트만으로 새 이미지를 생성합니다. — **그리고 평소처럼 과금됩니다**.

  오류 신호가 없기 때문에, 보통은 결과가 입력과 전혀 관련이 없다는 사실을 누군가 알아차릴 때만 드러납니다. **참고 이미지를 사용하는 모든 워크플로는 `/v1/images/edits`를 사용해야 합니다.**
</Warning>

<Tip>
  기본 도메인은 `https://api.apiyi.com`이며, 백업은 `https://vip.apiyi.com`입니다. 채팅형 생성(`/v1/chat/completions`)도 동작하지만 **권장 경로는 아닙니다** — 아래 FAQ를 참조하십시오.
</Tip>

## GPT-Image-2에서 마이그레이션하기

이미 [GPT-Image-2](/ko/api-capabilities/gpt-image-2/overview)를 통합하고 있다면, **엔드포인트와 호출 방식은 동일합니다**(`/v1/images/generations` + `/v1/images/edits`, OpenAI SDK와 호환됨) — 하지만 **파라미터 체계는 다르므로**, 모델 이름만 바꾼다고 동작하지 않습니다. 변경해야 할 사항은 다음과 같습니다.

### 파라미터 매핑

| 항목         | GPT-Image-2                                           | **Grok Imagine 2**              | 마이그레이션 조치                                   |
| ---------- | ----------------------------------------------------- | ------------------------------- | ------------------------------------------- |
| 출력 크기      | `size`(`1536x1024`와 같은 명시적 픽셀)                        | `aspect_ratio` + `resolution`   | **반드시 다시 작성해야 합니다**; `size`는 오류를 발생시키지 않습니다 |
| 품질 등급      | `quality`(`low`/`medium`/`high`/`auto`)               | 해당 파라미터 없음 — **모델 이름을 사용하십시오**  | `quality`를 제거하고 `-quality` 변형으로 전환하십시오      |
| 출력 형식      | `output_format`(png/jpeg/webp) + `output_compression` | 해당 파라미터 없음 — **형식은 해상도에 따릅니다**  | 둘 다 제거하십시오. 1K는 항상 JPEG이고, 2K는 항상 PNG입니다    |
| 배경         | `background`(`opaque`/`auto`)                         | 해당 파라미터 없음                      | 제거하십시오                                      |
| 모더레이션 수준   | `moderation`(`auto`/`low`)                            | 해당 파라미터 없음                      | 제거하십시오                                      |
| 고충실도       | `input_fidelity`는 전송하면 안 됩니다                          | 해당 파라미터 없음                      | 제거하십시오                                      |
| 호출당 이미지 수  | `n` **1개만 지원**                                        | `n` **1-10개 지원**                | ✅ 클라이언트 측 fan-out 루프를 제거할 수 있습니다            |
| 참조 이미지(편집) | 최대 16개                                                | **최대 4개**                       | ⚠️ 4개를 초과해 보내는 흐름은 다시 구성하십시오                |
| 마스크 인페인팅   | ✅ 지원됨                                                 | ❌ **지원되지 않음**                   | ⚠️ 마스크에 의존하는 흐름은 마이그레이션할 수 없습니다             |
| 과금         | token당(\~\$0.21/이미지, high 기준)                         | **요청당 고정 요금**, \$0.02 / \$0.045 | 비용 산정 방식이 사용량 기반에서 이미지당 기준으로 바뀝니다           |

### 가장 흔히 하는 세 가지 실수

<Warning>
  **1. 기본 응답 형식이 반대로 되어 있습니다 — 가장 자주 놓치는 변경 사항입니다**

  GPT-Image-2는 **`b64_json`만 반환합니다**(`url`는 없습니다), 반면 Grok Imagine 2는 **기본적으로 `url`를 반환합니다**. 파서가 `resp.data[0].b64_json`를 읽으면, 마이그레이션 후 `None` / `undefined`를 받게 됩니다.

  다음 두 가지 수정 방법 중 하나를 선택하십시오:

  * **기존 코드를 유지하려면** → `"response_format": "b64_json"`를 명시적으로 전달하십시오
  * **직접 링크로 전환하려면** → `data[0].url`를 읽어 다운로드하십시오

  또한 GPT-Image-2의 `usage`에는 **실제 token 수**가 포함되지만, Grok Imagine 2의 `usage`는 **자리표시자**입니다(항상 `1000 x n`). `usage`을 기반으로 만든 모든 비용 보고 스크립트는 마이그레이션 후 잘못된 수치를 생성합니다.
</Warning>

<Warning>
  **2. `size`는 오류를 내지 않고 조용히 실패합니다**

  GPT-Image-2는 엄격하게 검증하며 잘못된 입력에는 보통 400을 반환합니다. **Grok Imagine 2는 느슨합니다**: OpenAI 스타일 필드인 `size`, `quality` 및 `style`는 **조용히 무시되며**, 잘못된 `aspect_ratio` / `resolution` 값은 **조용히 기본값으로 돌아갑니다**.

  따라서 `model`만 변경하고 `size: "1536x1024"`를 제거하는 것을 잊으면, 요청은 200과 함께 1024x1024 정사각형 이미지를 반환합니다 — 파라미터가 무시되었다는 것을 알려주는 아무 정보도 없습니다.

  마이그레이션 후에는 첫 호출에서 출력 픽셀 크기를 확인하여 `aspect_ratio` / `resolution`가 실제로 적용되었는지 확인하십시오.
</Warning>

<Warning>
  **3. 참조 이미지는 더 이상 텍스트-투-이미지 엔드포인트로 보낼 수 없습니다**

  이 함정은 이 모델에만 해당합니다: `/v1/images/generations`로 참조 이미지를 보내면 200을 반환하고, 참조를 조용히 버리면서도 과금됩니다. 모든 참조 이미지 호출은 `/v1/images/edits`와 `multipart/form-data`를 사용해야 합니다 — 위의 [엔드포인트](#endpoints)를 보십시오.
</Warning>

### 변경 전과 후

```python theme={null}
# Before: GPT-Image-2
resp = client.images.generate(
    model="gpt-image-2",
    prompt="Cyberpunk city on a rainy night",
    size="1536x1024",           # <- remove
    quality="high",             # <- remove
    output_format="jpeg"        # <- remove
)
img = base64.b64decode(resp.data[0].b64_json)

# After: Grok Imagine 2
resp = client.images.generate(
    model="grok-imagine-image",           # use grok-imagine-image-quality for higher fidelity
    prompt="Cyberpunk city on a rainy night",
    n=1,
    extra_body={
        "aspect_ratio": "16:9",           # <- replaces size
        "resolution": "1k",               # <- replaces the sizing role of quality
        "response_format": "b64_json"     # <- set explicitly to keep the parser unchanged
    }
)
img = base64.b64decode(resp.data[0].b64_json)
```

<Tip>
  **어느 것을 사용해야 합니까?** 마스크 인페인팅, 픽셀 단위로 정확한 사용자 지정 크기, 또는 최대 16개 참조에 걸친 융합이 필요하다면 [GPT-Image-2](/ko/api-capabilities/gpt-image-2/overview)를 계속 사용하십시오. Grok Imagine 2는 **예측 가능한 비용**(이미지당 정액, 2K 추가 요금 없음), **호출당 여러 이미지**(`n`, 최대 10개), 또는 **편집 시 높은 원본 충실도**가 필요할 때 선택하십시오. 두 모델은 공존합니다 — 동일한 token으로 둘 모두를 호출합니다.
</Tip>

## 핵심 매개변수

### `aspect_ratio` 및 `resolution` (출력 크기)

이 둘이 함께 실제 출력 픽셀을 결정합니다. 측정값은 요청과 정확히 일치합니다:

| `aspect_ratio` | `resolution: 1k` | `resolution: 2k` |
| -------------- | ---------------- | ---------------- |
| `1:1`          | 1024x1024        | 2048x2048        |
| `16:9`         | 1280x720         | 2816x1584        |
| `9:16`         | 720x1280         | 1584x2816        |
| `4:3`          | 1152x864         | 2368x1776        |
| `3:4`          | 864x1152         | 1776x2368        |

<Warning>
  **두 매개변수는 텍스트-투-이미지에만 적용됩니다.** `/v1/images/edits`에서는 오류 없이 허용되지만 **효과는 없습니다** — 편집된 출력은 항상 **첫 번째 참조 이미지의 크기**와 일치합니다(입력이 1280x720이면 출력도 1280x720이며, fusion 세트의 순서를 바꾸면 출력이 새 첫 번째 이미지를 따르도록 바뀝니다). 출력 크기를 변경하려면 업로드하기 전에 참조 이미지를 자르거나 크기를 조정하십시오.
</Warning>

<Info>
  **검증은 관대합니다 — 오타가 있어도 오류를 발생시키지 않습니다.** `aspect_ratio`의 열거형 밖 값(예: `5:7`, `21:9`)이나 `resolution`의 열거형 밖 값(예: `1K`, `1024x1024`)은 **조용히 기본값으로 되돌아가며** 여전히 이미지를 반환합니다. 잘못된 `response_format`도 마찬가지로 `url`로 되돌아갑니다. 따라서 출력이 예상과 다를 때는 **먼저 매개변수 철자를 확인하십시오**.

  유일한 예외는 `resolution: "4k"`이며, 이 경우 `503 model_service_unavailable`를 반환합니다. 이는 **티어가 지원되지 않는다**는 뜻이지 채널이 다운되었다는 뜻이 아닙니다 — `1k` / `2k`로 다시 전환하십시오.
</Info>

### `n` (호출당 이미지 수)

**1-10**을 허용합니다. 반환된 `data` 배열의 길이는 `n`와 같으며, 각 이미지는 과금됩니다. `0`은 조용히 `1`으로 처리되며, `11` 이상이면 400을 반환합니다.

## 권장 사항

<Steps>
  <Step title="미리 결정하십시오: 생성인가 편집인가?">
    참조 이미지가 없으면 → `/v1/images/generations`. 참조 이미지가 하나라도 있으면, 한 픽셀 수정하는 경우라도 → `/v1/images/edits`. 잘못된 엔드포인트를 선택해도 오류는 발생하지 않고, 예상과 다른 이미지가 나올 뿐입니다.
  </Step>

  <Step title="클라이언트 타임아웃을 360초로 설정하십시오">
    이미지 API는 동기식입니다. 2K는 15\~17초가 걸리며, 트래픽이 몰릴 때나 콜드 스타트 시에는 더 오래 걸릴 수 있습니다. 60초 타임아웃은 이미 과금되는 요청에서 불필요한 실패를 일으킵니다.
  </Step>

  <Step title="prompt가 아니라 aspect_ratio로 구도를 제어하십시오">
    이 매개변수는 실제로 작동하므로, `aspect_ratio: "16:9"`이 prompt에서 "가로형 구도"를 요청하는 것보다 훨씬 더 안정적입니다.
  </Step>

  <Step title="대역폭에 따라 해상도 등급을 선택하십시오">
    2K는 이미지당 5-6 MB의 무손실 PNG이며, 1K는 220-300 KB의 JPEG입니다 — 대략 20배 차이입니다. 모바일이나 대량 전송에는 1K를 권장합니다. 두 등급의 비용이 같으므로, 선택은 순전히 화질과 대역폭의 문제입니다.
  </Step>

  <Step title="편집할 때는 «나머지는 모두 그대로 두십시오»라고 말하십시오">
    "스카프를 빨간색으로 바꾸되, 나머지는 모두 정확히 그대로 두십시오"와 같은 지시는 매우 잘 작동합니다 — 모델이 이 제약을 매우 잘 따르고 이미지의 나머지 부분을 보존합니다.
  </Step>

  <Step title="합성할 때는 이미지를 명시적으로 참조하십시오">
    `image[]` 업로드 순서가 "image 1 / image 2 / image 3"의 의미입니다. "image 1의 주체를 image 2의 장면에 넣으십시오"라고 쓰는 것이 모델에게 추측하게 두는 것보다 훨씬 더 안정적입니다.
  </Step>

  <Step title="재현성을 위해 seed에 의존하지 마십시오">
    이 계열은 `seed`를 지원하지 않으므로; 같은 prompt라도 호출마다 다른 결과가 나옵니다. 다시 생성될 것을 기대하기보다, 유지할 이미지는 저장해 두십시오.
  </Step>

  <Step title="배치 작업은 그냥 동시 처리하십시오">
    동시 실행 수 제한은 없습니다 — **100 RPM이면 충분한 채널 용량으로도 여유 있게 처리됩니다**. 직렬 큐를 만들거나 추가 쿼터를 요청할 필요가 없습니다.
  </Step>
</Steps>

## 오류 코드 및 재시도

| HTTP  | 코드                          | 의미                                    | 권장 처리                                            |
| ----- | --------------------------- | ------------------------------------- | ------------------------------------------------ |
| `400` | `invalid_image_request`     | 편집 엔드포인트가 multipart 대신 JSON을 수신함      | `multipart/form-data` 업로드로 전환하십시오; 재시도하지 마십시오    |
| `400` | `invalid_request`           | 잘못된 매개변수 **또는** prompt가 모더레이션에 의해 차단됨 | 두 경우 모두 같은 코드입니다 — 먼저 매개변수를 확인한 뒤 prompt를 수정하십시오 |
| `415` | —                           | 편집 엔드포인트에서 지원되지 않는 파일 필드 이름           | 필드 이름을 `image` 또는 `image[]`로 바꾸십시오               |
| `429` | —                           | 요청 제한을 초과했거나 잔액이 부족함                  | 지수 백오프를 사용하고, 계정 잔액을 확인하십시오                      |
| `503` | `model_service_unavailable` | 지원되지 않는 매개변수 티어(예: `resolution: 4k`)  | **장애가 아닙니다** — `1k` / `2k`로 다시 전환하고, 재시도하지 마십시오  |
| `503` | —                           | 현재 그룹에 사용 가능한 채널이 없음                  | Token의 그룹 설정을 확인하십시오. 위의 그룹 설정을 참조하십시오           |

<Info>
  **클라이언트 안내**: `400`와 `415`은 결정적이므로 재시도는 무의미합니다. 대신 알림을 보내십시오. `429`과 네트워크 계층 타임아웃만 재시도할 가치가 있으며, 지수 백오프를 사용하고 최대 3회까지 시도하십시오.

  `400 invalid_request`은 “bad parameter”와 “content blocked”를 모두 포함하며, **응답 본문으로는 이 둘을 구분할 수 없습니다**. 실용적인 휴리스틱은 지연 시간입니다. 모더레이션 차단은 약 5\~6초에 반환되며 — 성공적인 생성(\~9초)보다 빠릅니다 — 이는 차단이 생성 시작 전에 발생하기 때문입니다.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="왜 벤더 문서에는 JSON이 표시되는데 /v1/images/edits에 JSON을 보내면 400이 반환됩니까?">
    이는 **APIYI 게이트웨이의 편집 엔드포인트가 `multipart/form-data`만 허용하기 때문**입니다. 반면 상위 벤더 문서는 공개 이미지 URL을 포함한 JSON 본문을 설명합니다. 둘은 다르므로, 이 사이트의 문서를 따르십시오.

    올바른 형식은 파일 업로드입니다:

    ```bash theme={null}
    curl -X POST "https://api.apiyi.com/v1/images/edits" \
      -H "Authorization: Bearer sk-your-api-key" \
      -F "model=grok-imagine-image" \
      -F "prompt=Change the scarf to red, keep everything else the same" \
      -F "image=@photo.jpg"
    ```

    장점은 **이미지 호스팅이 필요 없다는 점**입니다. 로컬 파일을 직접 업로드하면 되므로, 공개 URL을 준비하는 것보다 더 간단합니다. 전체 예제는 [이미지 편집 API](/ko/api-capabilities/grok-imagine-image/image-edit)를 참조하십시오.
  </Accordion>

  <Accordion title="참조 이미지를 text-to-image에 보냈는데 200이 반환되었지만 결과가 무관한 이유는 무엇입니까?">
    이는 예상되는 동작이며, 이 모델에서 **가장 흔한 함정**입니다: `/v1/images/generations` **조용히 무시하고** `image` / `image_url` / `images` 없이 오직 prompt만으로 생성한 뒤, **평소처럼 과금합니다**.

    오류 신호가 없으니 "편집이 고장났다"고 결론내리기 쉽습니다. **참조 이미지를 사용하는 모든 워크플로는 `/v1/images/edits`를 사용해야 합니다.**
  </Accordion>

  <Accordion title="왜 resolution / aspect_ratio가 편집 엔드포인트에서 효과가 없습니까?">
    편집된 출력 크기는 **입력 참조 이미지에 따릅니다**: 1280x720을 입력하면 1280x720이 출력되고, 1024x1024를 입력하면 1024x1024가 출력됩니다. 여기서 `resolution` 또는 `aspect_ratio`를 전달해도 오류는 발생하지 않지만 아무 효과도 없습니다.

    출력 크기를 변경하려면 업로드하기 전에 참조 이미지를 자르거나 크기를 조정하십시오.
  </Accordion>

  <Accordion title="응답에 revised_prompt가 없는 이유는 무엇입니까?">
    이 계열은 `revised_prompt`를 반환하지 않으며, `respect_moderation`나 `model` 같은 필드도 제공하지 않습니다. 각 `data[]` 항목에는 `response_format`에 따라 **`url` 또는 `b64_json`만** 들어 있으며, 둘 다 들어가지는 않습니다.

    응답을 파싱할 때 이러한 필드가 존재한다고 가정하지 마십시오.
  </Accordion>

  <Accordion title="usage의 token 수를 사용해 과금을 정산할 수 있습니까?">
    **아니요.** `usage.prompt_tokens`는 실제 prompt 길이와 무관하게 항상 `1000 x n`이며, 자리표시자일 뿐입니다.

    이 계열은 이미지당 고정 요율로 **요청당** 과금됩니다. 실제 과금 내역은 APIYI Console의 billing 기록을 사용하십시오.
  </Accordion>

  <Accordion title="왜 1K는 JPEG인데 2K는 PNG입니까? 크기가 많이 다릅니다">
    이는 상위 동작입니다: `resolution: 1k`는 JPEG(\~220-300 KB)를 반환하고 `resolution: 2k`는 무손실 PNG(\~5-6 MB)를 반환하며, 대략 20배 차이입니다.

    URL 확장자, HTTP `Content-Type`, 실제 바이트가 서로 일치하므로 `Content-Type`를 기준으로 안전하게 분기할 수 있습니다.

    대역폭에 민감한 시나리오(모바일, 대량 전송)에서는 `1k`를 선호하십시오. 두 등급의 비용은 같으므로, 선택 기준은 순전히 품질입니다. 반대로 품질이 중요할 때는 `2k`에 추가 요금이 없고, 목록가 대비 더 깊은 할인이 적용됩니다.
  </Accordion>

  <Accordion title="resolution: 4k가 503을 반환합니다 — 채널이 다운된 것입니까?">
    **아니요.** `4k`는 이 계열에서 지원되는 티어가 아니며, 게이트웨이는 `503 model_service_unavailable`를 반환합니다. 이 코드는 장애처럼 보이지만 실제로는 파라미터 문제이므로 **재시도해도 도움이 되지 않습니다** — `1k` 또는 `2k`로 되돌리십시오.

    지원되는 것은 `1k`와 `2k`뿐입니다.
  </Accordion>

  <Accordion title="왜 잘못된 파라미터가 오류 대신 잘못된 이미지를 생성합니까?">
    이 계열의 검증은 느슨합니다. 잘못된 `aspect_ratio`(예: `5:7`), `resolution`(예: `1K`, `1024x1024`), `response_format`(예: `base64`)는 모두 **오류 없이 기본값으로 조용히 되돌아가며**, 400 대신 이미지를 반환합니다.

    따라서 출력이 기대와 다를 때는 **먼저 파라미터 철자를 확인하십시오** — 특히 `resolution` 값은 소문자 `1k` / `2k`입니다.
  </Accordion>

  <Accordion title="한 번의 호출로 몇 장의 이미지를 생성할 수 있습니까?">
    `n`는 **1-10**을 허용하며, 반환되는 `data` 배열의 길이는 `n`와 같습니다. 각 이미지는 **과금됩니다**.

    `0`은 오류 없이 `1`로 처리됩니다. `11` 이상은 `400 invalid_request`를 반환합니다.
  </Accordion>

  <Accordion title="seed 기반 재현성이 지원됩니까?">
    **아니요.** `seed`를 전달해도 오류는 발생하지 않지만 효과가 없습니다. 같은 prompt에 같은 `seed`를 사용해도 호출할 때마다 서로 다른 이미지가 반환됩니다.

    다시 사용해야 하는 이미지는 재생성하려고 하지 말고 보관하십시오.
  </Accordion>

  <Accordion title="공식 OpenAI SDK로 이 기능을 호출할 수 있습니까?">
    네. 두 엔드포인트 모두 OpenAI Images API와 호환되므로, `base_url`를 `https://api.apiyi.com/v1`에 지정하기만 하면 됩니다:

    ```python theme={null}
    from openai import OpenAI
    client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

    resp = client.images.generate(
        model="grok-imagine-image",
        prompt="a red wooden boat on an alpine lake at dawn",
        extra_body={"aspect_ratio": "16:9", "resolution": "1k"}
    )
    ```

    `aspect_ratio`와 `resolution`는 표준 OpenAI SDK 필드가 아니므로, `extra_body`를 통해 전달해야 한다는 점에 유의하십시오.
  </Accordion>

  <Accordion title="동시 실행 수 제한이 있습니까? 배치 생성이 요청 제한에 걸리나요?">
    **동시 실행 수 제한은 없습니다.** 여유 있는 채널 용량을 바탕으로 429 없이, 큐 거부 없이 **100 RPM에서도 여유 있게 측정되었습니다**. 추가 quota를 요청하거나 직렬 큐를 만들지 말고 동시에 호출하십시오.

    실제로 중요한 것은 \*\*`timeout`\*\*입니다. image APIs는 동기식이므로, 정상적으로 처리 중이지만 아직 과금되는 요청이 끊기지 않도록 클라이언트 타임아웃을 **360초**로 설정하십시오.
  </Accordion>

  <Accordion title="콘텐츠 모더레이션은 어떻게 작동하며, 차단 여부는 어떻게 감지합니까?">
    이 계열에는 콘텐츠 모더레이션이 적용됩니다. 차단된 요청은 **파라미터 오류와 정확히 같은 error code와 message**를 사용해 `400 invalid_request`를 반환하므로, 응답 본문만으로는 구분할 수 없습니다.

    실용적인 휴리스틱은 **지연 시간**입니다. 모더레이션 차단은 약 5-6초 내에 반환되며(차단이 생성보다 먼저 발생함), 성공적인 이미지는 약 9초가 걸립니다. 모더레이션 결과에는 일정한 무작위성도 있으므로, 경계선에 있는 콘텐츠는 재시도마다 동일하게 동작하지 않을 수 있습니다. **한 번의 시도만으로 결론내리지 마십시오.**

    파라미터가 올바른 것으로 확인되었는데도 400이 계속되면, prompt가 모더레이션을 트리거했을 가능성이 큽니다. 표현을 수정하십시오.
  </Accordion>

  <Accordion title="/v1/chat/completions으로 이미지를 생성할 수 있습니까?">
    네, 하지만 **권장되는 경로는 아닙니다**. 이 엔드포인트는 표준 chat 구조를 반환하며, 그 `content`는 markdown 이미지 링크입니다:

    ```text theme={null}
    ![image](https://apac.ossforai.com/...)
    ```

    이는 Chatbox나 LobeChat 같은 대화형 클라이언트에 적합합니다. 프로그램 방식 연동에는 **이미지 API**(`/v1/images/generations` 및 `/v1/images/edits`)를 사용하십시오. 더 풍부한 파라미터, 더 안정적인 응답 형식, 그리고 이 문서와의 일관성을 제공합니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [Grok Imagine 2 텍스트-이미지 API](/ko/api-capabilities/grok-imagine-image/text-to-image) - Playground가 포함된 엔드포인트 레퍼런스
* [Grok Imagine 2 이미지 편집 API](/ko/api-capabilities/grok-imagine-image/image-edit) - 편집 및 다중 이미지 융합 레퍼런스
* [Grok 모델 가이드](/ko/api-capabilities/grok/overview) - xAI 텍스트 모델
* [이미지 API 모범 사례](/ko/api-capabilities/image-api-best-practices) - 제한 시간 초과, 연결 끊김, 압축
* [API 매뉴얼](/ko/api-manual)
* [충전 프로모션](/ko/faq/recharge-promotions)
