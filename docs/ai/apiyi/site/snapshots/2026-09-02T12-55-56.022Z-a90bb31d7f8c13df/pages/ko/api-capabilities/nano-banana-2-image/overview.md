> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2 이미지 생성/편집

> Google의 최신 이미지 생성 모델 Nano Banana 2 (gemini-3.1-flash-image-preview) - Flash급 속도로 Pro 수준의 품질, 4K 출력, 14개 종횡비, Image Search Grounding, 호출당 $0.055/image, token 기반으로 이미지당 $0.025부터입니다.

## 개요

**Nano Banana 2** (코드명)은 2026년 2월 26일에 출시된 Google의 최신 이미지 생성 모델이며, 모델 ID는 `gemini-3.1-flash-image-preview`입니다. 이 모델은 **Pro 수준의 품질을 Flash급 속도와 비용으로 제공**하여 이미지 생성의 비용 효율성을 새롭게 정의하며, Nano Banana 시리즈의 최신 플래그십입니다.

<Note>
  **🔥 2026년 2월 26일 출시**: Nano Banana 2가 출시되었습니다! Pro 수준의 품질, Flash급 속도, token 기반 과금은 Google 가격의 최대 36%에 불과합니다! 512px는 이미지당 \$0.025부터! 4K 출력, 14개 화면비, 이미지 검색 그라운딩, 그리고 더 많은 독점 기능을 지원합니다.
</Note>

<Note>
  **🆕 2026년 5월 29일 업데이트 (`-preview` 삭제됨)**: Google은 공식 문서를 업데이트하고 안정 버전 모델명 **`gemini-3.1-flash-image`**(`-preview` 없이)을 공개했습니다. APIYI는 이미 이를 지원합니다.

  * **기존 이름도 계속 작동합니다**: `gemini-3.1-flash-image-preview`는 평소처럼 계속 작동하며, **가격은 변동 없음**, 코드 변경이 필요하지 않습니다.
  * **두 이름 모두 사용할 수 있습니다**: 새 `gemini-3.1-flash-image` 또는 원래의 `-preview` 이름을 사용하면 됩니다.

  참고: Google은 안정 버전이 프리뷰와 출력 품질, 안전 필터링 또는 기타 동작에서 다른지 아직 명확히 밝히지 않았습니다. 직접 테스트하고 피드백을 공유해 주시면 환영합니다.
</Note>

<Info>
  모든 이미지 API는 **동기식**입니다 — 폴링할 작업 ID가 없으며, 클라이언트가 연결을 끊으면 요청이 아직 과금되는 동안 결과가 손실됩니다. 이 모델에는 넉넉한 타임아웃을 설정하십시오. [Image API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

<CardGroup cols={2}>
  <Card title="텍스트-이미지 API" icon="wand-sparkles" href="/ko/api-capabilities/nano-banana-2-image/text-to-image">
    텍스트 prompt로 이미지를 생성합니다. 온라인 테스트를 위한 대화형 플레이그라운드가 포함됩니다.
  </Card>

  <Card title="이미지 편집 API" icon="image" href="/ko/api-capabilities/nano-banana-2-image/image-edit">
    이미지를 업로드하고 편집 지침을 추가하여 새 이미지를 생성합니다. 대화형 플레이그라운드가 포함됩니다.
  </Card>
</CardGroup>

## AI 에이전트가 통합을 수행하게 하십시오

<Note>
  Codex / Claude Code / Cursor로 빌드하는 경우 아래 프롬프트를 복사하여 에이전트에게 전달하십시오. 에이전트는 먼저 이 페이지의 일반 텍스트 버전을 가져오고(아무 docs URL에나 `.md`를 덧붙이십시오), 그다음 프로젝트의 자체 스택으로 코드를 작성합니다. 즉, timeout, 방어적 `parts` 파싱, 업로드 압축, 해상도 파라미터는 이미 요구사항에 반영되어 있습니다.
</Note>

<Prompt description="코딩 에이전트가 Nano Banana 2 텍스트-투-이미지 및 이미지 편집을 통합하거나 문제를 해결하도록 하십시오. Codex, Claude Code, Cursor 및 유사한 도구에 복사하여 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에서 Nano Banana 2 (`gemini-3.1-flash-image`) 텍스트-투-이미지 및 이미지 편집을 통합하거나 문제를 해결하십시오.

  코드를 건드리기 전에 문서를 읽으십시오: 이 페이지의 일반 텍스트 버전을 가져오려면 [https://docs.apiyi.com/en/api-capabilities/nano-banana-2-image/overview.md를](https://docs.apiyi.com/en/api-capabilities/nano-banana-2-image/overview.md를) 가져오십시오. 더 세부적인 파라미터 정보가 필요하면 같은 방식으로 텍스트-투-이미지 및 이미지 편집 페이지 끝에 `.md`를 덧붙이십시오.

  요구사항:

  1. Timeout: `POST https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image:generateContent`에서 Gemini 네이티브 형식을 호출하고 클라이언트 timeout을 360초로 늘리십시오. 이미지 API는 동기식입니다 — task ID가 없으므로, 클라이언트가 끊기면 요청은 여전히 과금되는 동안 결과가 사라집니다. reverse proxy, gateway, serverless 실행 제한도 모두 더 넉넉하게 잡아야 합니다: 생성 시간보다 짧은 모든 계층은 요청을 끊어버립니다. Node에서는 undici에 SDK `timeout` 옵션이 다루지 않는 3개의 독립적인 timeout 설정이 있다는 점에 유의하십시오.

  2. 응답 파싱(**가장 쉽게 잘못하기 쉬운 부분**): 이미지는 base64이며 `candidates[0].content.parts[]` 안의 `inlineData.data` 아래에 있습니다. 하지만 `parts`는 길이와 순서가 보장되지 않는 **이종 배열**입니다 — 텍스트 part가 먼저 올 수 있어 이미지가 0이 아니라 1번 인덱스에 들어갈 수 있습니다. 이 모델은 추론 텍스트를 반환할 수 있어서 특히 그럴 가능성이 큽니다. 따라서 **절대 `parts[0]`나 `parts[1]`를 하드코딩하지 마십시오**; 둘 사이를 바꿔 끼우는 것으로는 해결되지 않습니다. 올바른 방법은 `parts`하면서 `inlineData`가 있는 모든 항목을 필터링한 뒤 **마지막** 항목을 사용하는 것입니다(복잡한 작업은 여러 중간 초안을 반환하며, 마지막 것만 최종본입니다). `image/png`라고 가정하지 말고 응답에서 `mimeType`도 읽으십시오. 그런 다음 이미지를 렌더링하고 디스크 저장 동작을 제공하십시오.

  3. 업로드 전에 압축하십시오: 편집의 경우 참조 이미지를 `inlineData` 내부의 base64로 전달합니다. 먼저 압축하십시오 — 1.5MB를 초과하는 파일만 처리하고, 종횡비를 유지한 채 긴 변을 2048px로 줄이십시오(작은 이미지는 절대 확대하지 마십시오). 그런 다음 quality 0.9로 다시 인코딩하고 원본 형식을 유지하십시오. 다중 이미지 요청에서는 전체 크기를 6MB 미만으로 유지하십시오. 하드 한도는 이미지당 7MB이고 요청당 최대 14개 이미지입니다. base64 인코딩은 이를 대략 3분의 1 정도 부풀리므로, 여유분을 위해 각 이미지를 5MB 미만으로 유지하는 것이 좋습니다. 이미지 하나의 압축에 실패하면 원본으로 되돌리고 계속 진행하십시오. 또한 다음 사항을 유의하십시오: **하나의 part에는 `text` 또는 `inlineData` 중 하나만 포함될 수 있으며, 둘 다는 불가능합니다** — 올바른 구조는 텍스트 part 1개와 이미지 part N개입니다.

  4. 해상도 파라미터: **항상 전송하십시오** `generationConfig.imageConfig.imageSize`(`512` / `1K` / `2K` / `4K`, 기본값 `1K`)과 `aspectRatio`(이 페이지에는 허용되는 14개의 종횡비가 나열되어 있습니다). 사용량 기반 billing에서는 **해상도가 단가를 직접 결정하므로**, 기본값에 의존하면 비용을 예측할 수 없습니다. UI에서는 둘 다 드롭다운으로 노출하십시오. 또한 코드에서는 항상 모델 이름 `gemini-3.1-flash-image`을 사용하고 **`-4k` 접미사가 붙은 변형은 사용하지 마십시오**(그 버전은 chat 클라이언트를 위해 존재합니다). 4K를 사용하려면 `imageSize`만 그에 맞게 설정하면 됩니다. 이 모델은 `tools`를 통한 Google Search grounding을 지원하지 않으므로 보내지 마십시오.

  5. 오류 처리: 콘텐츠 모더레이션이 요청을 차단해도 HTTP 상태는 여전히 200이지만, `candidates[0].content.parts`는 비어 있습니다. 먼저 `candidatesTokenCount`가 0인지 확인한 다음, `finishReason`가 `STOP` 이외의 값인지 확인하십시오. `IMAGE_SAFETY` 같은 차단은 **과금되지 않으며**, 동일한 입력을 한두 번 다시 시도하면 종종 성공합니다 — 그 자동 재시도를 구현하십시오.

  6. 키는 `APIYI_API_KEY` 환경 변수에서 읽고 `Bearer` 접두사와 함께 `Authorization` 헤더에 보내십시오. 절대 하드코딩하지 말고, git에 커밋하지 마십시오.

  7. 작업이 끝나면 실제로 텍스트-투-이미지 호출 1회와 이미지 편집 호출 1회를 실행한 뒤, 결과와 그 두 호출의 비용을 보여주십시오.
</Prompt>

<Accordion title="이 프롬프트가 막아주는 문제">
  | Requirement               | Pitfall it prevents                                                                                                                                         |
  | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `parts` 인덱스를 절대 하드코딩하지 않기 | 길이와 순서가 보장되지 않으므로 고정 인덱스는 간헐적으로 실패합니다. 이 모델은 추론 텍스트를 반환하므로 이미지가 쉽게 1번 인덱스로 밀려납니다. [Nano Banana 개발자 가이드](/ko/api-capabilities/nano-banana-dev-guide)를 참조하십시오 |
  | 마지막 이미지 part를 사용하기        | 복잡한 편집 작업은 여러 중간 초안을 반환하며, 마지막 것만 최종본입니다                                                                                                                    |
  | 항상 `imageSize` 전송하기       | 사용량 기반 billing에서는 해상도가 단가를 정하므로, 기본값에 의존하면 비용을 예측할 수 없습니다                                                                                                   |
  | `-4k` 접미사가 없는 모델 이름       | 접미사가 붙은 이름은 chat 클라이언트를 위한 것이며, API 호출에서는 순수한 이름이 더 안정적입니다                                                                                                  |
  | 업로드 전에 압축하기               | 하드 한도는 이미지당 7MB이며 base64는 이를 대략 3분의 1 정도 부풀립니다. [이미지 압축 및 출력 해상도](/ko/api-capabilities/image-compression-resolution)를 참조하십시오                                |
  | `IMAGE_SAFETY`에서 자동 재시도하기 | 모더레이션 차단은 이미지 없이 200을 반환하며 과금되지 않습니다. 동일한 재시도는 종종 통과합니다. [Gemini 이미지 오류 처리](/ko/api-capabilities/gemini-image-error-handling)를 참조하십시오                       |
</Accordion>

## APIYI의 Nano Banana 2를 선택해야 하는 이유?

**Nano Banana Pro / 2는 APIYI에서 사용량 기준 #1 모델입니다** — 안정적이고, 신뢰할 수 있으며, 빠릅니다. 전문 팀과 함께 일하고 싶으시다면 APIYI가 올바른 선택입니다.

막 출시된 Google 플래그십도 원천에서 용량 제약이 여전하지만 — APIYI는 **신뢰성**, **비용**, **통합** 전반의 경험을 깊이 최적화합니다:

<CardGroup cols={2}>
  <Card title="공식 채널 · Gemini와 동일" icon="shield-check">
    Google의 네이티브 Gemini API (`/v1beta/models/.../generateContent`) 및 OpenAI SDK 패턴과 100% 호환됩니다 — 요청 본문, 응답 필드, 오류 코드가 동일합니다. 코드 변경 없이 마이그레이션할 수 있습니다.
  </Card>

  <Card title="동시 실행 수 제한 없음" icon="infinity">
    Google AI Studio의 RPM/RPD 상한에 구애받지 않습니다. 엔터프라이즈 규모의 배치 생성과 피크 트래픽이 쿼터 중단 없이 선형적으로 확장됩니다.
  </Card>

  <Card title="Google 정가의 28-36%" icon="percent">
    \$0.055/image 호출당 (대비 Google \$0.151), 512px는 token 기반으로 \$0.025/image부터(대비 \$0.045). [충전 보너스](/ko/faq/recharge-promotions)와 함께 적용하면 정가의 30.3% 수준까지 내려갑니다.
  </Card>

  <Card title="글로벌 무장벽 접근" icon="globe">
    **해외 서버나 프록시가 필요하지 않습니다** — 중국 본토 데이터 센터, 주거용 네트워크 또는 해외 노드에서 `api.apiyi.com`에 직접 연결할 수 있습니다. 안정적인 지연 시간, 국경 간 재설계가 필요하지 않습니다.
  </Card>

  <Card title="전체 모델 라인업" icon="layers">
    동일한 시리즈는 [Nano Banana Pro](/ko/api-capabilities/nano-banana-image/overview)(최고 품질), Nano Banana 2(최고 가성비), 그리고 레거시 Nano Banana를 모두 포함합니다 — 시나리오에 따라 조합해 사용할 수 있습니다.
  </Card>

  <Card title="전문 엔터프라이즈 지원" icon="handshake">
    저희 팀은 프로덕션 이미지 생성 배포에 특화되어 있으며, 모델 선택, 튜닝, 통합에 대한 깊은 경험을 보유하고 있습니다 — PoC부터 프로덕션까지 엔드투엔드 지원을 제공합니다.
  </Card>
</CardGroup>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="프로 수준 품질" icon="sparkles">
    생생한 조명, 풍부한 질감, 선명한 디테일 - 훨씬 더 빠른 속도로 Nano Banana Pro에 견줄 만한 품질
  </Card>

  <Card title="4K 울트라 HD 출력" icon="expand">
    512px, 1K, 2K, 4K 해상도를 지원하며, 최대 4096×4096까지 가능합니다
  </Card>

  <Card title="14개 화면 비율" icon="maximize">
    새로 추가된 항목: 1:4, 4:1, 1:8, 8:1 - 총 14개 화면 비율로 더 많은 사용 사례를 포괄합니다
  </Card>

  <Card title="이미지 검색 그라운딩" icon="search">
    Nano Banana 2 전용 - Google Image Search에서 시각적 컨텍스트를 가져옵니다
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="정확한 텍스트 렌더링" icon="type">
    다국어 지원이 포함된 이미지 내 선명하고 읽기 쉬운 텍스트 - 포스터와 마케팅 자료에 적합합니다
  </Card>

  <Card title="멀티턴 편집" icon="message-circle">
    채팅을 통해 반복적으로 다듬는 대화형 이미지 편집
  </Card>

  <Card title="추론 모드" icon="brain">
    최소 또는 높은 추론 수준을 설정할 수 있어 더 정밀하게 복잡한 prompt를 처리합니다
  </Card>

  <Card title="주제 일관성" icon="users">
    최대 5개 캐릭터와 14개 참조 객체에 걸쳐 유사성을 유지합니다
  </Card>
</CardGroup>

## 버전 비교

| 기능          | **Nano Banana 2**                | Nano Banana Pro              | Nano Banana              |
| ----------- | -------------------------------- | ---------------------------- | ------------------------ |
| 모델 ID       | `gemini-3.1-flash-image-preview` | `gemini-3-pro-image-preview` | `gemini-2.5-flash-image` |
| 품질          | ⭐⭐⭐⭐⭐ Pro급                       | ⭐⭐⭐⭐⭐ 최고                     | ⭐⭐⭐⭐ 우수                  |
| 속도          | 🚀 가장 빠름                         | 🐢 더 느림                      | ⚡ 빠름                     |
| 최대 해상도      | 4K                               | 4K                           | 1K                       |
| 화면 비율       | 14                               | 10                           | 10                       |
| 이미지 검색 그라운딩 | ✅ 독점                             | ❌                            | ❌                        |
| APIYI 요금    | **\$0.055/image (호출당)**          | \$0.09/image                 | \$0.02/image             |
| 상태          | 미리보기                             | 미리보기                         | GA                       |

<Tip>
  **선택 가이드**:

  * 🔥 **최고의 가성비** → Nano Banana 2 (\$0.025/image부터, Pro급 품질 + Flash급 속도)
  * 🎨 **궁극의 품질** → Nano Banana Pro (\$0.09/image, 최고 수준의 충실도)
  * ⚡ **최저 비용** → Nano Banana (\$0.025/image, 빠르고 안정적)
</Tip>

## 요금

<Info>
  **과금 모드 선택**: Nano Banana 2는 두 가지 과금 모드를 지원하며, API 토큰을 만들 때 “Billing model” 설정에서 선택합니다:

  * **종량제** 또는 **종량제 Priority** 선택 → 토큰 기반 과금
  * **요청당 과금** 또는 **요청당 과금 Priority** 선택 → 호출별 과금 (Nano Banana Pro와 동일합니다)
  * ⚠️ **하이브리드 과금을 선택하지 마세요**
</Info>

### 호출별 과금

| 모델                                                 | APIYI 요금        | Google 공식 4K         | 할인              |
| -------------------------------------------------- | --------------- | -------------------- | --------------- |
| **Nano Banana 2** `gemini-3.1-flash-image-preview` | **\$0.055/이미지** | \$0.151/이미지          | **🔥 약 64% 할인** |
| Nano Banana Pro `gemini-3-pro-image-preview`       | \$0.09/이미지      | \$0.24/이미지           | **약 63% 할인**    |
| Nano Banana `gemini-2.5-flash-image`               | \$0.02/이미지      | \$0.039/이미지 (1K만 해당) | 약 50% 할인        |

<Tip>
  **엔터프라이즈 HA 채널**: NanoBananaEnterprise는 표준 Nano Banana Pro 요금의 1.4배(\$0.126/이미지)로 제공되며, 엔터프라이즈 워크로드를 위한 전용 고가용성 폴백을 제공합니다.
</Tip>

### 토큰 기반 과금 (Nano Banana 2 전용)

| 과금 항목           | Google 공식               | APIYI           | 할인      |
| --------------- | ----------------------- | --------------- | ------- |
| 입력              | \$0.50/M tokens         | \$0.18/M tokens | **36%** |
| 출력(이미지와 텍스트 통합) | 이미지 \$60/M, 텍스트 \$1.5/M | \$21.6/M tokens | **36%** |

### 토큰 기반 과금 가격 추정치

| 해상도   | Google 공식 | APIYI         | Fal AI |
| ----- | --------- | ------------- | ------ |
| 512px | \$0.045   | **\~\$0.025** | \$0.06 |
| 1K    | \$0.067   | **\~\$0.035** | \$0.08 |
| 2K    | \$0.101   | **\~\$0.045** | \$0.12 |
| 4K    | \$0.151   | **\~\$0.07**  | \$0.16 |

<Tip>
  **💰 토큰 기반 과금이 더 많이 절약됩니다!** 토큰 기반 과금을 사용하면 512px 이미지를 단 \$0.025에 생성할 수 있으며, 이는 Google 요금의 36%에 불과합니다! 저해상도 사용 사례에서는 호출별 과금(\$0.055/이미지)보다 훨씬 저렴합니다. 4K의 경우 토큰 기반 요금(\~\$0.07)도 호출별 과금보다 더 저렴하며, 둘 다 Google의 공식 \$0.151/이미지보다 훨씬 낮습니다. 충전 보너스까지 더하면 실제 비용은 더 낮아집니다.
</Tip>

## 과금에 영향을 주는 세 가지 파라미터

아래 수치는 2026-08-27에 운영 게이트웨이를 대상으로 한 실측 테스트에서 나온 것입니다(조건당 12–20회 실행, 모두 추정치가 아니라 콘솔에 기록된 실제 과금을 기준으로 함). 귀하의 과금액에 미치는 영향은 두 자릿수 규모로 다르므로, 표시된 순서대로 최적화하십시오.

| Parameter                      | 호출당 영향                                 | 조정할 가치가 있습니까? |
| ------------------------------ | -------------------------------------- | ------------- |
| `imageConfig.imageSize`        | 1K \$0.033 → 4K \$0.064, **+90%**      | ✅ 가장 큰 레버     |
| `thinkingConfig.thinkingLevel` | 기본값 \$0.033 → `high` \$0.052, **+54%** | ✅ 필요할 때만 활성화  |
| `responseModalities`           | −2.8%, 통계적으로 유의하지 않음                   | ❌ 절감 효과 없음    |

### thinkingLevel: 기본값도 이미 최소이며, 높음은 비용이 절반 더 듭니다

`gemini-3.1-flash-image`는 thinking-level 제어를 지원합니다(Pro는 지원하지 않습니다). 동일한 prompt, 각 20회 실행:

| 설정        | 평균 output tokens | `thoughtsTokenCount` | 호출당 과금       | 지연 시간 중앙값 |
| --------- | ---------------- | -------------------- | ------------ | --------- |
| 생략됨(기본값)  | 1548.7           | 필드 없음                | \$0.0335     | 13.3s     |
| `minimal` | 1546.0           | 필드 없음                | \$0.0334     | 13.6s     |
| `high`    | 1557.5           | 중앙값 784.5            | **\$0.0516** | 20.7s     |

* **기본값은 `minimal`와 동일합니다** — 통계적으로 구분되지 않으므로(p=0.64), `minimal`를 명시적으로 전달해도 얻는 것이 없습니다.
* `high`에서만 `thoughtsTokenCount`가 별도 필드로 나타나며, 이는 **`completion_tokens`에 통합되어 이미지 요율로 과금됩니다**.
* **복잡한 prompt는 `high`가 켜졌을 때만 더 비싸집니다**: 기본 수준에서는 3-token prompt와 98-token 추론 prompt 사이에 output tokens 차이가 유의미하지 않았으며(p=0.37), `high`를 사용하면 추론 prompt가 **126% 더 많은** 생각 tokens를 사용했고 호출당 비용도 **38% 더 높았습니다**.

<Tip>
  일상적인 생성에서는 이 파라미터를 그대로 두십시오. 구도 로직, 이미지 내 텍스트 배치, 또는 차트 비율 정확도에 대한 엄격한 요구가 있을 때만 `high`을 활성화하십시오. 그 대가로 지출이 +54%, 지연 시간이 +55% 증가합니다.
</Tip>

### Google Search 그라운딩: 작동하지만 검색 쿼리마다 과금됩니다

실시간 정보가 정확해야 하는 이미지(날씨 카드, 시장 차트, 이벤트 포스터)에는 `googleSearch` 도구를 추가하십시오. 그라운딩은 12/12회 실행에서 발생했습니다.

```json theme={null}
{
  "contents": [{ "parts": [{ "text": "A weather card poster for Tokyo today" }] }],
  "tools": [{ "googleSearch": {} }]
}
```

**출력 tokens는 거의 영향을 받지 않습니다**(검색 수수료를 제외하면 도구 없는 대조군 대비 −2.1%, 유의하지 않음). 전체 비용은 검색 호출 자체에서 발생하며, 각 호출당 **\$0.014**입니다.

| 조건                 | 그라운딩 발생 | 검색 쿼리 중앙값 | 호출당 과금             |
| ------------------ | ------- | --------- | ------------------ |
| 도구 없음              | 0/12    | 0         | \$0.036            |
| `googleSearch: {}` | 12/12   | 2         | **\$0.062 (+73%)** |

<Warning>
  **모델이 몇 번 검색할지 결정하며, 미리 설정할 수 없습니다.** 테스트에서는 단일 이미지 요청이 스스로 1–3개의 쿼리를 발생시켰으므로, 이 도구를 켠 상태의 호출당 비용은 고정값이 아니라 **\$0.050–\$0.078** 범위입니다. 상한을 기준으로 예산을 잡으십시오.
</Warning>

### Image Search 그라운딩: Nano Banana 2 전용이며, 현재는 무료입니다

`searchTypes.imageSearch`는 모델이 Google Image Search에서 시각적 참조를 가져오게 해 주며, “실제 사진으로 콜라주를 만들어라” 또는 “실제 물체를 그대로 그려라” 같은 작업에 유용합니다.

```json theme={null}
{
  "tools": [{ "googleSearch": { "searchTypes": { "imageSearch": {} } } }]
}
```

| 조건             | 그라운딩 발생 | 부과된 검색 수수료 | 호출당 과금      |
| -------------- | ------- | ---------- | ----------- |
| 도구 없음          | 0/12    | 0/12       | \$0.036     |
| `imageSearch`만 | 7/12    | **0/12**   | **\$0.032** |

* `imageSearchQueries`가 `groundingMetadata`에 나타나며 `["current weather in Tokyo"]` 같은 값이 확인되었습니다.
* **현재는 추가 과금이 없습니다** — 호출당 비용이 오히려 도구 없는 대조군보다 약간 낮게 나오기도 했습니다.
* 12회 중 7회에서 발생했습니다. **검색 여부는 모델이 결정하며, 매번 쿼리하지는 않습니다.**
* 웹 검색과 이미지 검색은 **함께 활성화할 수 있지만**, 무엇을 사용할지는 모델이 선택하므로 비용은 예측하기 어려워집니다.

<Warning>
  **`searchTypes`는 배열이 아니라 객체여야 합니다.**

  ✅ `{"searchTypes": {"imageSearch": {}}}` — 작동함

  ❌ `{"searchTypes": ["imageSearch"]}` — **오류는 없고, 200을 반환하며, 이미지도 나오지만, 이미지 검색은 한 번도 발생하지 않습니다.** 응답 본문 어디에도 그 사실이 드러나지 않습니다. 배열 형식에 대한 상위 오류는 `Proto field is not repeating, cannot start list`입니다.
</Warning>

### responseModalities: 아무것도 절약하지 못하지만 원치 않는 텍스트를 제거합니다

`responseModalities: ["IMAGE"]`는 이미지뿐 원한다고 선언합니다. 각 20회 실행:

| 설정                 | 평균 output tokens | 호출당 과금   |
| ------------------ | ---------------- | -------- |
| 생략됨(기본값)           | 1548.7           | \$0.0335 |
| `["IMAGE"]`        | 1535.0           | \$0.0332 |
| `["TEXT","IMAGE"]` | 1542.8           | \$0.0333 |

* **세 값은 모두 서로 1% 이내**이며, `["TEXT","IMAGE"]`는 필드를 생략한 것과 정확히 동일합니다(p=0.90).
* 일반적인 생성 prompt에서는 **60/60개의 응답이 이미 단일 이미지 파트만 포함하고 텍스트는 전혀 없었으므로**, 모달리티 전환이 작동할 대상이 없습니다. 추론 prompt(인포그래픽, 데이터 차트)만 약 3분의 1 정도의 경우 요약 문단을 붙이는데, 그 경우 `["IMAGE"]`가 이를 억제하고 약 \*\*2.8%\*\*를 절감합니다(p=0.09, 유의하지 않음).

<Info>
  **절감할 것이 없는 이유**: output tokens는 “image + text”가 아니라 **이미지용 1120개와 약 400개의 보이지 않는 오버헤드 tokens**입니다. 그 오버헤드는 `candidatesTokensDetails`의 어떤 필드에도 나타나지 않지만, **전체 요율로 과금되며 호출당 과금의 28%를 차지하고**, prompt 길이와도 무관합니다. 텍스트 비용은 이에 비하면 미미합니다.

  따라서 1120 tokens만으로 이미지당 비용을 추정하면 **약 28% 과소평가**하게 됩니다. 대신 `candidatesTokenCount` 또는 `totalTokenCount`와 대조하여 확인하십시오.
</Info>

## 그룹 설정

Nano Banana 2는 APIYI에서 두 개의 그룹과 함께 제공됩니다. 대시보드에서 전환 → **Token 설정**:

| 그룹                     | 요율   | 사용 시점                                              |
| ---------------------- | ---- | -------------------------------------------------- |
| `Default`              | 1.0x | 기본 레인, 가격표와 일치합니다; 권장 기본값                          |
| `NanoBananaEnterprise` | 1.4x | 대체 레인 — 기본 경로가 빡빡하거나 타임아웃이 급증할 때 수동으로 전환합니다, 용량 우선 |

**왜 1.4x입니까?** 1.4x여도 가격은 여전히 Google의 정가의 약 50% 수준이며 — 공식 가격보다 훨씬 낮습니다. 이는 더 높은 동시 실행 수 워크로드와 예상치 못한 상위 공급자 위험 제어 이벤트를 위한 대체 레인으로, 엔터프라이즈 고객에게 고가용성 보장을 제공합니다. 기본 그룹이 빡빡할 때는 Token을 `NanoBananaEnterprise`로 전환하여 급증을 넘기십시오.

**권장 과금 모델**: `Pay-as-you-go Priority`을 선택하십시오 — Nano Banana 2의 token 기반 과금과 Nano Banana Pro의 호출당 과금을 모두 지원하며, **시리즈 전체에 Token 하나**입니다.

<Frame caption="Token settings: Billing model = Pay-as-you-go Priority, primary group = Default, fallback group = NanoBananaEnterprise (1.4x)">
  <img src="https://mintcdn.com/apiyillc/EyWjOyg5fLaMGReJ/images/nano-banana-enterprise-token-setup-20260506.png?fit=max&auto=format&n=EyWjOyg5fLaMGReJ&q=85&s=cf85cd8ddaaa541ebbd970a52a98c68f" alt="Token 생성 UI: 과금 모델 '종량제 우선'은 NB2 token 기반 + NB Pro 호출당 과금을 지원하며; 기본 그룹 Default + 대체 그룹 NanoBananaEnterprise (1.4x 레인)" width="1270" height="1052" data-path="images/nano-banana-enterprise-token-setup-20260506.png" />
</Frame>

<Tip>
  **더 나아가서**: Token이 다른 이미지 모델(예: GPT-image-2)도 포괄한다면, 더 안정적인 `Default`을 기본 그룹으로 유지하고 `NanoBananaEnterprise`을 대체 슬롯에 넣으십시오 — 기본 그룹의 429는 token 교체 없이 자동으로 엔터프라이즈 그룹으로 장애 조치됩니다.
</Tip>

## 지원되는 해상도 및 종횡비

### 출력 해상도

| 해상도   | 설명   | 권장 사용처          |
| ----- | ---- | --------------- |
| 512px | 저해상도 | 썸네일, 빠른 미리보기    |
| 1K    | 기본   | 소셜 미디어, 웹 표시    |
| 2K    | 고화질  | HD 디스플레이, 인쇄물   |
| 4K    | 초고화질 | 전문 디자인, 상업용 포스터 |

### 지원되는 종횡비(총 14개)

`1:1`, `1:4`, `4:1`, `1:8`, `8:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`

### 종횡비별 출력 크기(픽셀)

아래 표는 Google 공식 문서 기준으로, 512px / 1K / 2K / 4K 해상도 티어 전반에 걸친 모든 14개 종횡비에 대한 Nano Banana 2의 실제 출력 크기를 나열합니다. 요청에서 비율은 `aspect_ratio`로, 티어는 `image_size`(또는 `resolution`)로 설정하십시오.

| 종횡비      | 512px    | 1K        | 2K        | 4K         |
| -------- | -------- | --------- | --------- | ---------- |
| **1:1**  | 512×512  | 1024×1024 | 2048×2048 | 4096×4096  |
| **1:4**  | 256×1024 | 512×2048  | 1024×4096 | 2048×8192  |
| **1:8**  | 192×1536 | 384×3072  | 768×6144  | 1536×12288 |
| **2:3**  | 424×632  | 848×1264  | 1696×2528 | 3392×5056  |
| **3:2**  | 632×424  | 1264×848  | 2528×1696 | 5056×3392  |
| **3:4**  | 448×600  | 896×1200  | 1792×2400 | 3584×4800  |
| **4:1**  | 1024×256 | 2048×512  | 4096×1024 | 8192×2048  |
| **4:3**  | 600×448  | 1200×896  | 2400×1792 | 4800×3584  |
| **4:5**  | 464×576  | 928×1152  | 1856×2304 | 3712×4608  |
| **5:4**  | 576×464  | 1152×928  | 2304×1856 | 4608×3712  |
| **8:1**  | 1536×192 | 3072×384  | 6144×768  | 12288×1536 |
| **9:16** | 384×688  | 768×1376  | 1536×2752 | 3072×5504  |
| **16:9** | 688×384  | 1376×768  | 2752×1536 | 5504×3072  |
| **21:9** | 792×168  | 1584×672  | 3168×1344 | 6336×2688  |

<Info>
  Nano Banana Pro의 10개 종횡비와 비교하면, Nano Banana 2는 `1:4`, `4:1`, `1:8`, `8:1`를 추가합니다. 이는 장형 이미지와 인포그래픽에 이상적인 초세로/초가로 비율입니다. 또한 512px 저해상도 티어를 제공하는 유일한 모델로, 썸네일과 빠른 미리보기에 매우 적합합니다.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Nano Banana 2와 Nano Banana Pro의 차이점은 무엇입니까?">
    **Nano Banana 2** (`gemini-3.1-flash-image-preview`)는 Gemini 3.1 Flash 기반이고, **Nano Banana Pro** (`gemini-3-pro-image-preview`)는 Gemini 3 Pro 기반입니다. 주요 차이점은 다음과 같습니다.

    * ✅ **속도**: Nano Banana 2가 더 빠릅니다(Flash 수준의 속도)
    * ✅ **가격**: Nano Banana 2의 token 기반 과금이 더 저렴합니다(\$0.025부터 vs \$0.09)
    * ✅ **가로세로 비율**: Nano Banana 2는 14개를 지원합니다(4개 더 많음)
    * ✅ **Image Search Grounding**: Nano Banana 2 전용입니다
    * ⚠️ **최종 품질**: Nano Banana Pro가 여전히 약간 더 우수합니다
  </Accordion>

  <Accordion title="Nano Banana Pro에서 Nano Banana 2로 전환해야 합니까?">
    **권장합니다!** Nano Banana 2는 더 낮은 가격과 더 빠른 속도로 Pro 수준에 가까운 품질을 제공합니다. 극단적인 품질 요구 사항이 없다면 Nano Banana 2가 더 나은 선택입니다.

    모델 이름을 `gemini-3-pro-image-preview`에서 `gemini-3.1-flash-image-preview`로만 변경하시면 됩니다.
  </Accordion>

  <Accordion title="gemini-3.1-flash-image-preview를 사용해야 합니까, 아니면 -4k 접미사 버전을 사용해야 합니까?">
    **코드 / API 호출에서는 항상 일반 모델 이름 `gemini-3.1-flash-image-preview`(`-4k` 접미사 없음)을 사용하고, `gemini-3.1-flash-image-preview-4k`은 사용하지 않는 것을 권장합니다.**

    * **공식 이름에는 `-4k`가 없습니다**: Google의 공식 모델 이름은 `gemini-3.1-flash-image-preview`입니다. 또한 이것은 저희가 유지 관리에 가장 많은 리소스를 투입하는 일반 채널이므로, 안정성과 호환성이 가장 좋습니다.
    * **`-4k`가 나온 배경**: `gemini-3.1-flash-image-preview-4k`는 원래 Chatbox 같은 대화형 클라이언트의 “chat-to-image” 시나리오를 위해 준비된 구성으로, 메시징 UI에서 채팅을 통해 직접 이미지를 생성하는 용도였습니다.
    * **코드 + Gemini 네이티브 형식에서는 일반 이름이 더 유리합니다**: 코드로 Gemini 네이티브 형식(`/v1beta/models/.../generateContent`)을 호출하는 경우, 일반 모델 이름 `gemini-3.1-flash-image-preview`가 더 안정적입니다.

    4K 출력을 원하신다면 `-4k` 모델 이름에 의존할 필요가 없습니다. 요청 파라미터에서 4K 해상도만 지정하시면 됩니다(위의 "지원되는 해상도 및 가로세로 비율" 참조).
  </Accordion>

  <Accordion title="Image Search Grounding이란 무엇입니까?">
    Image Search Grounding은 Nano Banana 2 전용 기능입니다. Google 이미지 검색에서 시각적 컨텍스트를 가져와 실제 대상과 더 잘 맞는 이미지를 생성합니다. 예를 들어 실제 랜드마크 이미지를 생성할 때 검색 결과를 참고하여 정확도를 높일 수 있습니다.
  </Accordion>

  <Accordion title="Thinking Mode는 무엇을 합니까?">
    Thinking Mode를 사용하면 모델이 이미지를 생성하기 전에 추론하고 분석할 수 있어, 복잡한 prompt의 정확도가 향상됩니다. 이를 `high`로 설정하면 가장 좋은 결과를 얻을 수 있지만 생성 시간은 약간 늘어납니다. 정밀한 구도, 텍스트 렌더링 또는 복잡한 장면이 필요한 작업에 가장 적합합니다.
  </Accordion>

  <Accordion title="이미지 생성에는 얼마나 걸립니까?">
    생성 시간은 해상도와 Thinking Mode에 따라 달라집니다.

    * **1K 해상도**: 약 5\~10초
    * **2K 해상도**: 약 10\~15초
    * **4K 해상도**: 약 15\~25초
    * 높은 Thinking Mode를 활성화하면 몇 초가 추가로 더 걸립니다

    간헐적인 지연과 피크 혼잡에 대비해 더 긴 타임아웃(최소 360초)을 설정하는 것을 권장합니다.
  </Accordion>

  <Accordion title="동시 실행 수 제한이 있습니까? API가 직렬 처리입니까? 동시에 20명의 사용자가 호출해야 한다면 어떻게 합니까?">
    **API에는 동시 실행 수 제한이 없고 직렬 처리도 하지 않습니다.** 동시 요청을 직접 안전하게 보낼 수 있습니다 — 요청은 서로 대기열에 들어가거나 서로를 차단하지 않습니다. 20명의 사용자가 동시에 호출하더라도 20개의 동시 요청을 보내기만 하면 되며, 추가 쿼터 요청이나 스로틀링은 필요하지 않습니다.

    Google AI Studio와 달리 APIYI 채널에는 엄격한 RPM/RPD 제한이 없으므로, 엔터프라이즈 배치 생성과 피크 트래픽이 선형적으로 확장됩니다.

    **실제로 중요한 것은 `timeout`입니다**: 이미지 생성(특히 4K이거나 피크 혼잡 시)은 요청당 시간이 꽤 걸릴 수 있으므로, **아직 정상적으로 처리 중인 요청이 끊기지 않도록 클라이언트 타임아웃을 360초로 설정하십시오.**

    <Tip>
      429(높은 동시 실행 수로 인한 스로틀링)가 가끔 발생하면, token의 대체 그룹으로 `NanoBananaEnterprise`를 추가하십시오(위의 "그룹 설정" 참조). 기본 그룹이 포화되면 자동으로 대체 그룹으로 전환되어 높은 동시 실행 수에서 성공률이 더욱 향상됩니다.
    </Tip>
  </Accordion>

  <Accordion title="어떤 입력 이미지 형식이 지원됩니까?">
    `image/png` 및 `image/jpeg` 형식을 지원합니다. base64 인코딩 또는 Files API를 통해 업로드할 수 있습니다.
  </Accordion>

  <Accordion title="출력 이미지에 워터마크가 있습니까?">
    모든 출력 이미지에는 SynthID 보이지 않는 디지털 워터마크(Google의 AI 생성 콘텐츠 식별 기술)가 포함됩니다. 육안으로는 보이지 않으며 사용에 영향을 주지 않습니다.
  </Accordion>

  <Accordion title="connection reset by peer / write_response_body_failed (500)가 왜 발생합니까?">
    전체 오류는 다음과 같습니다.

    ```text theme={null}
    [&{{write tcp ip:port->ip:port: write: connection reset by peer Unknown error shell_api_error  write_response_body_failed} 500 }]
    ```

    이는 **대개 이미지 업로드 크기가 너무 커서 발생합니다 — 요청 본문이 너무 커지고 연결이 끊어집니다**. 다음 모범 사례를 따르십시오.

    * **이미지 수를 제한하십시오**: 공식 규칙(프롬프트당 최대 14장) 이내로 유지하고, 참조 이미지를 과도하게 쌓지 마십시오.
    * **이미지당 크기를 제한하십시오**: 각 이미지를 5MB 미만으로 유지하십시오 — 공식 이미지당 상한은 7MB이며, base64 인코딩은 크기를 대략 1/3 정도 늘리므로 여유를 두어야 합니다.
    * **업로드 전에 프런트엔드에서 압축하십시오**: API로 보내기 전에 프런트엔드(또는 서버 측 릴레이)에서 이미지를 압축하십시오 — 일반적인 방법은 긴 변을 제한하고, JPEG/WebP로 변환하며, 품질 파라미터를 조정하는 것입니다.
    * **URL 입력으로 전환하십시오**: Gemini 네이티브 형식은 `fileData.fileUri`를 통해 이미지 URL 전달을 지원하므로, 지나치게 큰 base64 요청 본문을 완전히 피할 수 있습니다 — [Nano Banana 개발자 가이드](/ko/api-capabilities/nano-banana-dev-guide)를 참조하십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [Nano Banana Pro 이미지 생성](/en/api-capabilities/nano-banana-image) - 이전 플래그십 버전
* [Nano Banana 이미지 편집](/en/api-capabilities/nano-banana-image-edit) - 이미지 편집 기능
* [이미지 생성 비교 테스트](https://imagen.apiyi.com/)
* [API 사용 매뉴얼](/ko/api-manual)

<Info>
  Nano Banana 2는 현재 프리뷰 상태입니다. 기능과 가격은 조정될 수 있습니다. 최신 정보는 문서 업데이트를 확인하시기 바랍니다.
</Info>
