> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT Image 2 Coze 플러그인

> APIYI를 통해 GPT Image 2 호출, 오류 분류, OSS 업로드 파이프라인을 감싸는 Coze 플랫폼용 커뮤니티 제공 Python 플러그인으로, Coze 워크플로우가 텍스트-투-이미지, 이미지-투-이미지, 직접 결과 전달을 수행할 수 있습니다.

## 개요

이는 Coze 플랫폼(`coze.cn`)용 커스텀 Python 플러그인으로, OpenAI의 GPT Image 2 모델(`gpt-image-2`)을 **APIYI** 게이트웨이를 통해 Coze 워크플로에서 직접 호출할 수 있는 노드로 감싸는 플러그인입니다. 이 플러그인에는 완전한 요청 구성, 오류 코드 분류, 콘텐츠 안전 필터링 감지, 그리고 Alibaba Cloud OSS 업로드 파이프라인이 포함되어 있습니다. **표시할 준비가 된 공개 접근 가능 URL을 반환하므로**, Coze 워크플로에 또 다른 결과 전달 단계를 만들 필요가 없습니다.

<Info>
  **프로젝트 정보**

  * 📦 배포 방식: 코드 패키지로 공유됩니다(**GitHub에는 게시되지 않음**)
  * 👤 작성자: 커뮤니티 기여
  * 🎯 대상 플랫폼: Coze(중국 / 글로벌) 커스텀 플러그인
  * 🔌 호출되는 모델: `gpt-image-2` (APIYI, 2026년 4월 21일 출시)
  * 🌐 게이트웨이: [APIYI](https://api.apiyi.com) — 중국 본토에서 직접 접근 가능하며 VPN이 필요하지 않습니다
  * 📝 전체 소스 코드는 아래의 ‘전체 플러그인 소스 코드’ 섹션에 제공되며, 바로 복사해서 사용할 수 있습니다
</Info>

## APIYI 게이트웨이 소개

[APIYI](https://api.apiyi.com)는 중국 본토에서 직접 연결되는 GPT Image 2용 게이트웨이로, 하나의 API Key를 공유하는 세 가지 경로를 제공합니다:

| 도메인             | 설명     |
| --------------- | ------ |
| `api.apiyi.com` | 기본 경로  |
| `vip.apiyi.com` | VIP 경로 |
| `b.apiyi.com`   | 백업 경로  |

APIYI는 GPT Image 2에 접근하는 세 가지 방법을 제공합니다:

| 모델 ID             | 채널           | 과금           | 생성 속도   | 특징                                                   |
| ----------------- | ------------ | ------------ | ------- | ---------------------------------------------------- |
| `gpt-image-2`     | 공식 릴레이       | 토큰별 과금       | \~120s  | 공식 OpenAI API와 완전히 호환되며 품질/크기/4K를 지원합니다              |
| `gpt-image-2-all` | 역방향(ChatGPT) | \$0.03/image | 30-60s  | 중국어 사용자 친화적이며, Chat 엔드포인트를 통해 호출되고 이미지 URL을 바로 반환합니다 |
| `gpt-image-2-vip` | 역방향(Codex)   | \$0.03/image | 90-150s | 4K를 포함한 30개의 고정 크기 프리셋을 제공합니다                        |

> 이 플러그인은 기본적으로 \*\*`gpt-image-2` (공식 릴레이)\*\*를 사용하며, 공식 OpenAI API와 완전히 호환되고 전체 파라미터 제어를 지원합니다. 더 빠른 생성이 필요하면 `gpt-image-2-all` 모드로 전환하십시오(아래 참조).

<Tip>
  [APIYI 콘솔](https://api.apiyi.com/token)에서 `sk-`로 시작하는 API 키를 발급받으십시오. 비용을 통제하기 위해 일일 쿼터 한도(예: ¥20-50)를 설정하는 것을 권장합니다.
</Tip>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="통합 텍스트-투-이미지 / 이미지-투-이미지 진입점" icon="wand-sparkles">
    fileurls가 비어 있는지 여부에 따라 텍스트-투-이미지 (/v1/images/generations)와 편집 (/v1/images/edits) 모드를 자동으로 전환합니다 — Coze 워크플로에 두 개의 별도 노드를 만들 필요가 없습니다
  </Card>

  <Card title="중국 본토에서 직접 접속 가능, VPN 불필요" icon="bolt">
    모든 요청은 APIYI 게이트웨이(api.apiyi.com)를 거칩니다 — 중국 네트워크에서 직접 접근 가능하며, 낮은 지연 시간과 안정적인 동작을 제공합니다
  </Card>

  <Card title="다중 참조 이미지 편집" icon="images">
    이미지 URL 목록을 전달하면 플러그인이 이를 다운로드하여 multipart/form-data 파일 업로드로 요청에 주입합니다 — 최대 16장의 참조 이미지(각각 ≤ 50MB)까지 지원하며, 원본 이미지의 세부 정보를 보존합니다
  </Card>

  <Card title="세분화된 오류 분류" icon="shield-check">
    MODERATION\_BLOCKED, INVALID\_API\_KEY, RATE\_LIMIT, SERVER\_ERROR, TIMEOUT, NO\_DATA 및 기타 실패 원인을 구분하여 워크플로 분기를 쉽게 만듭니다
  </Card>

  <Card title="2단계 콘텐츠 안전 감지" icon="ban">
    입력 단계의 moderation\_blocked (400)와 출력 단계의 content\_filter (200)를 구분하며, 발생 시 명확한 거부 메시지를 반환하여 불필요한 재시도를 피합니다
  </Card>

  <Card title="직접 OSS 업로드" icon="cloud-upload">
    생성된 base64 이미지가 Alibaba Cloud OSS에 바로 업로드되며 — 워크플로는 외부 공유나 저장에 바로 사용할 수 있는 URL을 받습니다
  </Card>

  <Card title="정밀한 매개변수 제어" icon="sliders-horizontal">
    quality (low/medium/high/auto), moderation (auto/low), output\_format (png/jpeg/webp) 및 기타 매개변수를 지원하므로 필요에 따라 생성 전략을 조정할 수 있습니다
  </Card>
</CardGroup>

## 지원되는 모델

| 모델                  | 모델 ID             | 용도                                              | API 문서                                                         |
| ------------------- | ----------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| GPT 이미지 2 (공식 릴레이)  | `gpt-image-2`     | 텍스트-투-이미지, 이미지-투-이미지(편집), 공식 OpenAI API와 완전히 호환 | [문서 보기](/ko/api-capabilities/gpt-image-2/overview)             |
| GPT 이미지 2-All (역방향) | `gpt-image-2-all` | Chat 엔드포인트를 통한 텍스트-투-이미지, 이미지-투-이미지, 중국어 친화적    | [문서 보기](/en/api-capabilities/gpt-image-2-all/chat-completions) |
| GPT 이미지 2-VIP (역방향) | `gpt-image-2-vip` | 4K를 포함한 30개의 크기 프리셋으로 고정 크기 생성                  | [문서 보기](/ko/api-capabilities/gpt-image-2-vip/overview)         |

<Tip>
  플러그인은 기본적으로 `gpt-image-2`(공식 릴레이)를 사용하며, 엔드포인트는 `https://api.apiyi.com/v1/images/generations`(텍스트-투-이미지)와 `https://api.apiyi.com/v1/images/edits`(이미지-투-이미지)입니다. 또한 유효한 APIYI API Key(`sk-`로 시작)가 필요합니다. 경로를 전환하려면 코드에서 `API_BASE`를 `https://vip.apiyi.com/v1` 또는 `https://b.apiyi.com/v1`로 변경합니다.
</Tip>

## GPT Image 2 핵심 사양

| 기능                  | 설명                                                                              |
| ------------------- | ------------------------------------------------------------------------------- |
| **출시일**             | 2026년 4월 21일                                                                    |
| **최대 해상도**          | 3840×2160 (4K), 총 픽셀 수 ≤ 8,294,400                                              |
| **종횡비**             | 1:1 / 16:9 / 9:16 / 4:3 / 3:2 / 3:1 / 1:3                                       |
| **품질 수준**           | low / medium / high / auto (기본값)                                                |
| **출력 형식**           | png (기본값) / jpeg / webp                                                         |
| **출력 압축**           | 0-100 (jpeg / webp만 해당)                                                         |
| **배경 모드**           | auto / opaque / transparent (모델은 투명도를 지원합니다; **이 플러그인은 아직 해당 매개변수를 노출하지 않습니다**) |
| **검토 수준**           | auto (기본값) / low                                                                |
| **텍스트 렌더링**         | 정확도 > 99%                                                                       |
| **요청당 이미지 수**       | 1 (`n`은 1만 지원합니다)                                                               |
| **응답 형식**           | b64\_json (원시 base64, data:image 접두사 없음)                                        |
| **input\_fidelity** | high로 고정되어 있으며, **전달하면 안 됩니다** (전달 시 400 오류가 반환됩니다)                             |

## API 엔드포인트

| 엔드포인트                                         | 메서드  | Content-Type          | 용도                                                   |
| --------------------------------------------- | ---- | --------------------- | ---------------------------------------------------- |
| `https://api.apiyi.com/v1/images/generations` | POST | `application/json`    | 텍스트-투-이미지(텍스트 prompt에서 생성)                           |
| `https://api.apiyi.com/v1/images/edits`       | POST | `multipart/form-data` | 이미지-투-이미지(참조 이미지를 `-F "image[]=@file"`로 업로드, 최대 16개) |

> 경로를 전환하려면: `https://vip.apiyi.com/v1/...` 또는 `https://b.apiyi.com/v1/...`. 모든 경로는 기능적으로 동일합니다.

## 플러그인 아키텍처

<img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-architecture.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=50eb8b0eafa03c71cb5a6863af7b872a" alt="GPT 이미지 2 Coze 플러그인 아키텍처 다이어그램" width="1840" height="2100" data-path="images/coze-gptimage2-architecture.png" />

플러그인의 핵심 호출 체인:

```text theme={null}
Coze workflow inputs (cleantext / fileurls / aspect_ratio / resolution / quality / apikey)
        ↓
    handler() entry point
        ↓
    Check whether reference images exist (fileurls)
        ↓            ↓
  Text-to-image   Image-to-image
    ↓            ↓
 POST api.apiyi.com/v1/images/generations   POST api.apiyi.com/v1/images/edits
   (application/json)                         (multipart/form-data)
    ↓            ↓
   Parse response / classify error codes
        ↓
upload_base64_to_oss()  — upload to Alibaba Cloud OSS
        ↓
Return { analysis, url, error }
```

## 해상도 및 크기 참고

플러그인은 `aspect_ratio` 및 `resolution`에서 크기를 자동으로 선택합니다(APIYI의 공식 프리셋 기준).

| 종횡비  | 1K (크기 / 픽셀)     | 2K (크기 / 픽셀)     | 4K (크기 / 픽셀)     |
| ---- | ---------------- | ---------------- | ---------------- |
| 1:1  | 1024×1024 ≈ 1.0M | 2048×2048 ≈ 4.2M | 3840×2160 ≈ 8.3M |
| 16:9 | 1536×1024 ≈ 1.6M | 2048×1152 ≈ 2.4M | 3840×2160 ≈ 8.3M |
| 9:16 | 1024×1536 ≈ 1.6M | 1152×2048 ≈ 2.4M | 2160×3840 ≈ 8.3M |
| 4:3  | 1024×768 ≈ 0.8M  | 2048×1536 ≈ 3.1M | 3264×2448 ≈ 8.0M |
| 3:2  | 1536×1024 ≈ 1.6M | 2048×1360 ≈ 2.8M | 3456×2304 ≈ 8.0M |
| 3:1  | 1536×512 ≈ 0.8M  | 3072×1024 ≈ 3.1M | 3840×1280 ≈ 4.9M |
| 1:3  | 512×1536 ≈ 0.8M  | 1024×3072 ≈ 3.1M | 1280×3840 ≈ 4.9M |

> **제약**: 모든 차원은 16으로 나누어떨어져야 하며, 종횡비는 ≤ 3:1, 총 픽셀 수는 ≤ 8,294,400이어야 합니다.
>
> **참고**: 4K에서 1:1은 3840×2160(가로형 16:9)으로 출력되며, 정사각형이 아닙니다 — 이는 API 제한이며, 실제 종횡비는 16:9가 됩니다. `2560×1440`를 초과하는 출력은 여전히 실험적입니다. 프로덕션에서는 프리셋 크기를 사용하는 것이 좋습니다.

## 입력 및 출력 매개변수

### 입력 (`Input`)

| 매개변수            | 유형        | 필수  | 기본값    | 설명                                                                         |
| --------------- | --------- | --- | ------ | -------------------------------------------------------------------------- |
| `cleantext`     | string    | 예   | —      | 사용자 텍스트 prompt 또는 편집 지시문(최대 32,000자)                                       |
| `fileurls`      | string\[] | 아니요 | —      | 참조 이미지 URL 목록입니다. 텍스트-이미지 생성인 경우 비워 두십시오                                   |
| `aspect_ratio`  | string    | 예   | —      | 가로세로 비율, 예: `1:1`, `16:9`, `9:16`                                          |
| `resolution`    | string    | 예   | —      | 해상도이며 대문자여야 합니다: `1K` / `2K` / `4K`                                        |
| `quality`       | string    | 아니요 | `auto` | 품질 수준: `low` / `medium` / `high` / `auto`                                  |
| `moderation`    | string    | 아니요 | `auto` | 모더레이션 수준: `auto` / `low` (완화된 모더레이션)                                       |
| `output_format` | string    | 아니요 | `png`  | 출력 형식: `png` / `jpeg` / `webp`                                             |
| `apikey`        | string    | 예   | —      | APIYI API 키(`sk-`로 시작하며, [APIYI 콘솔](https://api.apiyi.com/token)에서 요청하십시오) |

### 출력 (`Output`)

| 필드         | 유형             | 설명                                    |
| ---------- | -------------- | ------------------------------------- |
| `analysis` | string         | 상태 텍스트: `图片生成成功` (성공) / `图片生成失败` (실패) |
| `url`      | string \| null | 성공 시 공개 OSS URL                       |
| `error`    | string \| null | 실패 시 친절한 오류 설명                        |

## 배포 단계

<Steps>
  <Step title="1단계: APIYI API Key 및 OSS 자격 증명 준비">
    * [APIYI 콘솔](https://api.apiyi.com/token)에서 API Key(`sk-`로 시작)를 요청합니다. 일일 쿼터 제한을 설정하는 것을 권장합니다(예: ¥20-50)
    * 알리바바 클라우드에서 OSS 버킷을 만들고, 해당 버킷에 `oss:PutObject` 권한이 있는 RAM 하위 계정을 생성합니다
    * `AccessKey ID`, `AccessKey Secret`, `Bucket name` 및 `Endpoint`(예: `oss-cn-beijing.aliyuncs.com`)를 기록합니다
  </Step>

  <Step title="2단계: Coze 플러그인 마켓플레이스에서 플러그인 검색 및 설치">
    1. Coze 워크스페이스 → 플러그인 → 플러그인 마켓플레이스로 이동합니다
    2. 이 플러그인을 찾으려면 'GPT Image 2' 또는 'APIYI'를 검색합니다
    3. 플러그인 카드의 세부 정보를 확인한 다음 '추가'를 클릭하여 워크스페이스에 설치합니다

           <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-plugin-market.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=58d8111524c893c61aae7c52f4fb68db" alt="Coze 플러그인 마켓플레이스 검색" width="1450" height="738" data-path="images/coze-gptimage2-plugin-market.png" />
  </Step>

  <Step title="3단계: 플러그인 코드 복사">
    아래의 '전체 플러그인 소스 코드' 섹션에 있는 전체 Python 코드를 Coze IDE에 붙여넣고, 상단의 알리바바 클라우드 OSS 설정을 본인 설정으로 바꾸십시오:

    ```python theme={null}
    # API易 线路配置（可选）
    API_BASE = "https://api.apiyi.com/v1"
    # 也可切换为: "https://vip.apiyi.com/v1" 或 "https://b.apiyi.com/v1"

    # 阿里云 OSS 配置
    ACCESS_KEY_ID = "你的 AK"
    ACCESS_KEY_SECRET = "你的 SK"
    BUCKET_NAME = "你的 Bucket 名称"
    ENDPOINT = "oss-cn-beijing.aliyuncs.com"
    ```
  </Step>

  <Step title="4단계: 메타데이터 및 입력/출력 파라미터 구성">
    아래와 같이 입력 / 출력 필드 유형과 필수 플래그를 구성하고, 코드의 `args.input` 필드와 일치시키십시오:

    입력 파라미터 구성:

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-basic-info.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=f06e617314b795c936cb5605a28746d0" alt="Coze 플러그인 기본 정보" width="1611" height="458" data-path="images/coze-gptimage2-basic-info.png" />

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-input-params.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=410d34cca5c9aa191df0add21a51a848" alt="Coze 플러그인 입력 파라미터 구성" width="1617" height="505" data-path="images/coze-gptimage2-input-params.png" />

    출력 파라미터 구성:

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-output-params-1.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=c590fca7d3196326aebddb3a7dbdefda" alt="Coze 플러그인 출력 파라미터 구성(1부)" width="1606" height="695" data-path="images/coze-gptimage2-output-params-1.png" />

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-output-params-2.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=5546f08b19320ba2f6332555eef8f3c2" alt="Coze 플러그인 출력 파라미터 구성(2부)" width="1577" height="373" data-path="images/coze-gptimage2-output-params-2.png" />
  </Step>

  <Step title="5단계: 테스트 및 게시">
    * Coze IDE에서 테스트 파라미터를 입력합니다(`quality=low` + `resolution=1K` + 간단한 prompt로 시작하여 APIYI 파이프라인을 검증합니다)
    * 테스트가 통과하면 '게시'를 클릭하고 플러그인을 아무 워크플로에나 끌어다 놓습니다
  </Step>
</Steps>

## 오류 분류 전략

플러그인은 단순히 `success=True/False`만 보고하는 것이 아니라, 다음 우선순위 순서에 따라 실패 원인을 분류하므로 Coze 워크플로가 이에 따라 분기할 수 있습니다:

| 우선순위 | 오류 유형                   | 트리거 조건                    | 권장 처리                                                                   |
| ---- | ----------------------- | ------------------------- | ----------------------------------------------------------------------- |
| 1    | `MODERATION_BLOCKED`    | HTTP 400 / 403, 콘텐츠 안전 차단 | prompt 또는 이미지가 모더레이션을 유발했습니다; 다시 작성하여 재시도하십시오 — **원본 입력으로는 재시도하지 마십시오** |
| 2    | `INVALID_API_KEY`       | HTTP 401                  | APIYI API Key가 올바른지 또는 만료되었는지 확인하십시오                                    |
| 3    | `RATE_LIMIT`            | HTTP 429                  | 요청 속도 한도를 초과했습니다; 경로를 바꾸거나 동시 실행 수를 낮춰 보십시오                             |
| 4    | `SERVER_ERROR`          | HTTP 500 / 502 / 503      | APIYI / OpenAI 서버 측 실패입니다; 잠시 기다렸다가 2-3회 재시도하십시오                        |
| 5    | `BAD_REQUEST`           | HTTP 400 (non-moderation) | 매개변수를 확인하십시오: size 유효성 또는 input\_fidelity를 실수로 전달했는지 여부                 |
| 6    | `TIMEOUT`               | 요청이 품질 기반 시간 제한을 초과했습니다   | 품질 또는 해상도를 낮춰 재시도하십시오                                                   |
| 7    | `NO_DATA`               | 응답의 `data`가 비어 있음         | 재시도                                                                     |
| 8    | `NO_IMAGE_DATA`         | `b64_json` 필드가 비어 있음      | 재시도                                                                     |
| 9    | `IMAGE_DOWNLOAD_FAILED` | 참조 이미지 URL을 다운로드할 수 없습니다  | URL 접근 가능 여부를 확인하십시오                                                    |
| 10   | `EDIT_FAILED`           | 편집 엔드포인트가 non-200을 반환했습니다 | 참조 이미지 형식, 개수(≤16), 이미지별 크기(≤50MB)를 확인하십시오                              |

### 2단계 콘텐츠 필터링

GPT Image 2는 Nano Banana Pro와 달리 **2단계 콘텐츠 안전 필터링**을 사용합니다:

```text theme={null}
User request
    ↓
[Stage 1: Input Filter]
    ├── Blocked → HTTP 400 / 403 (moderation_blocked)
    │          ↑ Rewriting the prompt fixes it (free, not billed)
    ├── Passed ↓
[Model inference generates the image] (billed at this point)
    ↓
[Stage 2: Output Filter]
    ├── Blocked → HTTP 200 but empty b64_json (content_filter, already billed)
    ├── Passed ↓
Image returned (HTTP 200)
```

| 구분      | moderation\_blocked | content\_filter        |
| ------- | ------------------- | ---------------------- |
| 트리거 단계  | 입력 단계               | 출력 단계                  |
| HTTP 상태 | 400                 | 200                    |
| 과금 여부   | 아니요                 | **예** (추론이 이미 완료되었습니다) |
| 해결 방법   | prompt 문구를 다시 작성합니다 | 전체 장면을 다시 설계합니다        |

### 일반적인 moderation\_blocked 트리거

| # | 시나리오              | 참고                                   |
| - | ----------------- | ------------------------------------ |
| 1 | 실존 인물 초상 / 유명인 이름 | Elon Musk, Taylor Swift 등            |
| 2 | 생존 예술가 이름         | Hayao Miyazaki = 차단됨, Van Gogh = 허용됨 |
| 3 | 저작권 캐릭터 / IP      | Spider-Man, Pikachu, Mickey Mouse 등  |
| 4 | 폭력 / 유혈 / 무기 세부사항 | 자동으로 차단됨                             |
| 5 | 성적 암시 / 노출 의상     | bikini, tight-fitting, sexy 같은 표현    |
| 6 | 아동의 사실적인 이미지      | 거의 허용되지 않습니다                         |
| 7 | 혐오 상징 / 정치적 극단주의  | 자동으로 차단됨                             |

### APIYI 관련 오류

| 오류                      | 원인                          | 해결 방법                               |
| ----------------------- | --------------------------- | ----------------------------------- |
| 401 + `invalid_api_key` | Key에 `sk-` 접두사가 없거나 만료되었습니다 | APIYI 콘솔에서 전체 Key를 복사하십시오           |
| 404 Not Found           | base\_url에 `/v1` 접미사가 없습니다  | `https://api.apiyi.com/v1`인지 확인하십시오 |
| 429 + frequent triggers | APIYI 요청 제한에 도달했습니다         | 경로를 바꾸고 재시도하십시오                     |
| Connection timeout      | DNS / 네트워크 변동               | 다른 경로를 시도한 뒤 재시도하십시오                |

## 해상도/품질별 예상 지연 시간

| 해상도            | 품질 | 예상 지연 시간  | 플러그인 타임아웃 |
| -------------- | -- | --------- | --------- |
| 1K (1024×1024) | 낮음 | 3-8 s     | 180 s     |
| 1K (1024×1024) | 보통 | 20-40 s   | 360 s     |
| 1K (1024×1024) | 높음 | 145-280 s | 900 s     |
| 2K (2048×2048) | 보통 | 80-120 s  | 360 s     |
| 2K (2048×2048) | 높음 | 200-250 s | 900 s     |
| 4K (3840×2160) | 보통 | 150-200 s | 360 s     |
| 4K (3840×2160) | 높음 | 300-600 s | 900 s     |

> 권장 사항: 일상 작업에는 `resolution=1K + quality=medium`를 사용하고(이미지당 20-40 s), 최종 산출물에는 `resolution=4K + quality=high`를 사용하십시오.
>
> `quality=auto`를 사용하면(생략하거나 auto로 설정), 플러그인은 일괄적으로 360초 타임아웃을 적용하고 API가 실제 품질 수준을 결정합니다.

## 플러그인 전체 소스 코드

아래는 `coze-gptimage2.py`의 전체 코드로, Coze IDE에 바로 붙여넣을 수 있습니다. 사용 전에 **맨 위의 OSS 구성만** 변경하면 됩니다.

<Note>
  플러그인 소스는 제공된 그대로 유지되며, 주석과 사용자에게 표시되는 오류 문자열은 중국어로 되어 있어 작업 흐름에 맞게 자유롭게 현지화할 수 있습니다.
</Note>

```python coze-gptimage2.py theme={null}
from runtime import Args
from typings.gptimage2.gptimage2 import Input, Output
import requests
import base64
import io
import oss2
import uuid
import re


# ╔══════════════════════════════════════════════════════════╗
# ║           API易 线路配置（按需切换）                      ║
# ╚══════════════════════════════════════════════════════════╝
API_BASE = "https://api.apiyi.com/v1"
# 也可切换为: "https://vip.apiyi.com/v1" 或 "https://b.apiyi.com/v1"

# ╔══════════════════════════════════════════════════════════╗
# ║              阿里云 OSS 配置（请修改为你的值）            ║
# ╚══════════════════════════════════════════════════════════╝
ACCESS_KEY_ID = ""          # 填入你的阿里云 Access Key ID
ACCESS_KEY_SECRET = ""      # 填入你的阿里云 Access Key Secret
BUCKET_NAME = ""            # 填入你的阿里云 OSS Bucket 名称
ENDPOINT = "oss-cn-beijing.aliyuncs.com"  # 填入你的 OSS Endpoint

# ╔══════════════════════════════════════════════════════════╗
# ║       质量超时配置（GPT Image 2 基于 quality 分级）       ║
# ╚══════════════════════════════════════════════════════════╝
TIMEOUT = {
    "low": 180,     # 低质量快速出图（3-8 秒实际耗时）
    "medium": 360,  # 中等质量（20-40 秒实际耗时，推荐）
    "high": 900,    # 高质量精细渲染（145-280 秒实际耗时）
}

# ╔══════════════════════════════════════════════════════════╗
# ║     分辨率 → 尺寸映射表（宽高比 × 分辨率 → W×H）          ║
# ╚══════════════════════════════════════════════════════════╝
RESOLUTION_SIZES = {
    "1:1":  {"1K": "1024x1024", "2K": "2048x2048", "4K": "3840x2160"},
    "16:9": {"1K": "1536x1024", "2K": "2048x1152", "4K": "3840x2160"},
    "9:16": {"1K": "1024x1536", "2K": "1152x2048", "4K": "2160x3840"},
    "4:3":  {"1K": "1024x768",  "2K": "2048x1536", "4K": "3264x2448"},
    "3:2":  {"1K": "1536x1024", "2K": "2048x1360", "4K": "3456x2304"},
    "3:1":  {"1K": "1536x512",  "2K": "3072x1024", "4K": "3840x1280"},
    "1:3":  {"1K": "512x1536",  "2K": "1024x3072", "4K": "1280x3840"},
}


# ==============================
# OSS 上传工具
# ==============================

def upload_base64_to_oss(image_base64: str) -> str:
    """
    将 base64 图片上传到阿里云 OSS 并返回公网 URL
    支持带 data:image/...;base64, 前缀和纯 base64 两种情况
    """
    base64_str = re.sub(r"^data:image/[^;]+;base64,", "", image_base64)
    image_data = base64.b64decode(base64_str)
    image_io = io.BytesIO(image_data)

    auth = oss2.Auth(ACCESS_KEY_ID, ACCESS_KEY_SECRET)
    bucket = oss2.Bucket(auth, ENDPOINT, BUCKET_NAME)
    object_name = f"coze/gptimage2_{uuid.uuid4().hex}.png"
    bucket.put_object(object_name, image_io)

    return f"https://{BUCKET_NAME}.{ENDPOINT}/{object_name}"


# ==============================
# 工具函数
# ==============================

def get_size(aspect_ratio: str, resolution: str) -> str:
    """根据宽高比和分辨率获取推荐尺寸"""
    ratio_map = RESOLUTION_SIZES.get(aspect_ratio, RESOLUTION_SIZES["1:1"])
    return ratio_map.get(resolution, ratio_map.get("1K", "1024x1024"))


def guess_mime_from_url(url: str) -> str:
    """根据 URL 后缀猜测 MIME 类型"""
    url_lower = url.lower()
    if url_lower.endswith(".png"):
        return "image/png"
    if url_lower.endswith(".jpg") or url_lower.endswith(".jpeg"):
        return "image/jpeg"
    if url_lower.endswith(".webp"):
        return "image/webp"
    if url_lower.endswith(".gif"):
        return "image/gif"
    return "image/png"


# ==============================
# 核心：GPT Image 2 生图 / 编辑
# ==============================

def generate_image(prompt: str, aspect_ratio: str, resolution: str,
                   quality: str, apikey: str, output_format: str = "png",
                   moderation: str = "auto", image_urls=None):
    """
    GPT Image 2 文生图 / 图生图核心函数

    - image_urls 为空：纯文生图 → API易 /v1/images/generations（JSON）
    - image_urls 不为空：参考图编辑 → API易 /v1/images/edits（multipart/form-data）
    """

    size = get_size(aspect_ratio, resolution)
    headers = {
        "Authorization": f"Bearer {apikey}",
        "Content-Type": "application/json"
    }

    # ── 分支 1：有参考图 → 图生图（编辑） ──
    if image_urls:
        return _generate_edit(prompt, size, quality, apikey,
                              output_format, moderation, image_urls, headers)

    # ── 分支 2：无参考图 → 文生图（/v1/images/generations，JSON）──
    payload = {
        "model": "gpt-image-2",
        "prompt": prompt,
        "size": size,
    }
    if quality and quality != "auto":
        payload["quality"] = quality
    if output_format and output_format != "png":
        payload["output_format"] = output_format
    if moderation and moderation != "auto":
        payload["moderation"] = moderation

    timeout_seconds = TIMEOUT.get(quality, 360)
    api_url = f"{API_BASE}/images/generations"

    try:
        response = requests.post(
            api_url,
            headers=headers,
            json=payload,
            timeout=timeout_seconds
        )

        # ── HTTP 错误分发 ──
        if response.status_code in (400, 403):
            try:
                err_body = response.json()
                err = err_body.get("error", {})
                err_msg = err.get("message", "")
            except Exception:
                err_msg = response.text

            if "moderation" in err_msg.lower() or response.status_code == 403:
                return {
                    "success": False,
                    "errorType": "MODERATION_BLOCKED",
                    "error": "❌ 内容安全审核不通过\n"
                             "您的提示词触发了内容安全策略，"
                             "请修改提示词后重试（不要用原提示词重试）",
                }
            return {
                "success": False,
                "errorType": "BAD_REQUEST",
                "error": f"❌ 请求参数错误: {err_msg[:500]}\n"
                         "常见原因：误传了 input_fidelity，或 background:transparent 配了 output_format:jpeg",
            }

        if response.status_code == 401:
            return {
                "success": False,
                "errorType": "INVALID_API_KEY",
                "error": "❌ API Key 无效\n请检查您的 API易 API 密钥是否正确，"
                        "或是否已过期。可在 https://api.apiyi.com/token 查看",
            }

        if response.status_code == 429:
            return {
                "success": False,
                "errorType": "RATE_LIMIT",
                "error": "❌ 请求频率超限\nAPI 调用过于频繁，"
                        "可尝试切换线路或降低并发",
            }

        if response.status_code in (500, 502, 503):
            return {
                "success": False,
                "errorType": "SERVER_ERROR",
                "error": f"❌ 服务端故障（HTTP {response.status_code}），"
                        "请稍后重试或尝试切换线路",
            }

        if response.status_code != 200:
            return {
                "success": False,
                "errorType": "HTTP_ERROR",
                "error": f"HTTP {response.status_code}: "
                        f"{(response.text or '')[:500]}",
            }

        # ── JSON 解析 ──
        try:
            data = response.json()
        except ValueError:
            return {
                "success": False,
                "errorType": "INVALID_JSON",
                "error": "响应不是有效 JSON",
            }

        images = data.get("data", [])
        if not isinstance(images, list) or len(images) == 0:
            return {
                "success": False,
                "errorType": "NO_DATA",
                "error": "生成失败：未返回图片数据（可能触发了 output filter）",
                "response": data,
            }

        # ── 提取 b64_json（API易 返回纯 base64，无 data:image 前缀）──
        image_b64 = images[0].get("b64_json", "")
        if not image_b64:
            return {
                "success": False,
                "errorType": "NO_IMAGE_DATA",
                "error": "生成失败：b64_json 为空（可能被 content_filter 过滤）",
                "response": data,
            }

        return {"success": True, "image_data": image_b64}

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "errorType": "TIMEOUT",
            "error": f"图片生成请求超时"
                     f"（超过 {timeout_seconds} 秒，"
                     f"当前 quality={quality}）\n"
                     f"建议降低 quality 或 resolution 重试",
        }
    except Exception as e:
        return {
            "success": False,
            "errorType": "EXCEPTION",
            "error": f"图片生成请求失败: {str(e)}",
        }


def _generate_edit(prompt: str, size: str, quality: str,
                   apikey: str, output_format: str, moderation: str,
                   image_urls: list, headers: dict):
    """
    GPT Image 2 图生图（编辑）子函数
    调用 API易 /v1/images/edits 端点（multipart/form-data 方式上传参考图）

    注意：API易 的 /v1/images/edits 要求 Content-Type: multipart/form-data，
    通过 -F "image[]=@file" 方式传图，不支持 JSON base64 data URI。
    参考图数量最多 16 张，单张 ≤ 50MB（建议压到 1.5MB 以内）。
    """

    # ── 下载参考图到内存 ──
    image_files = []
    for i, url in enumerate(image_urls):
        try:
            resp = requests.get(url, timeout=180)
            if resp.status_code != 200:
                return {
                    "success": False,
                    "errorType": "IMAGE_DOWNLOAD_FAILED",
                    "error": f"图片获取失败（{url}）HTTP {resp.status_code}",
                }
            mime = guess_mime_from_url(url)
            ext = mime.split("/")[-1]  # png / jpeg / webp
            if ext == "jpeg":
                ext = "jpg"
            image_files.append(
                ("image[]", (f"image{i}.{ext}", io.BytesIO(resp.content), mime))
            )
        except Exception as e:
            return {
                "success": False,
                "errorType": "IMAGE_DOWNLOAD_FAILED",
                "error": f"图片获取失败（{url}）: {e}",
            }

    # ── 构造 multipart/form-data 请求（-F 方式）──
    form_data = {
        "model": "gpt-image-2",
        "prompt": prompt,
    }
    if size:
        form_data["size"] = size
    if quality and quality != "auto":
        form_data["quality"] = quality
    if output_format and output_format != "png":
        form_data["output_format"] = output_format
    if moderation and moderation != "auto":
        form_data["moderation"] = moderation

    # multipart/form-data 不传 Content-Type（让 requests 自动生成 boundary）
    auth_headers = {
        "Authorization": headers["Authorization"],
    }

    timeout_seconds = TIMEOUT.get(quality, 360)
    api_url = f"{API_BASE}/images/edits"

    try:
        response = requests.post(
            api_url,
            headers=auth_headers,
            data=form_data,
            files=image_files,
            timeout=timeout_seconds
        )

        # ── 错误处理 ──
        if response.status_code in (400, 403):
            try:
                err = response.json().get("error", {})
                err_msg = err.get("message", "")
            except Exception:
                err_msg = response.text[:500]
            if "moderation" in err_msg.lower() or response.status_code == 403:
                return {
                    "success": False,
                    "errorType": "MODERATION_BLOCKED",
                    "error": "❌ 内容安全审核不通过",
                }
            return {
                "success": False,
                "errorType": "EDIT_FAILED",
                "error": f"图片编辑请求参数错误: {err_msg[:500]}\n"
                         "常见原因：误传了 input_fidelity、"
                         "超过 16 张参考图或单张超过 50MB",
            }

        if response.status_code == 401:
            return {
                "success": False,
                "errorType": "INVALID_API_KEY",
                "error": "❌ API Key 无效",
            }

        if response.status_code == 429:
            return {
                "success": False,
                "errorType": "RATE_LIMIT",
                "error": "❌ 请求频率超限，可尝试切换线路重试",
            }

        if response.status_code in (500, 502, 503):
            return {
                "success": False,
                "errorType": "SERVER_ERROR",
                "error": f"❌ 服务端故障（HTTP {response.status_code}）",
            }

        if response.status_code != 200:
            try:
                err = response.json().get("error", {}).get("message", "")
            except Exception:
                err = response.text[:500]
            return {
                "success": False,
                "errorType": "EDIT_FAILED",
                "error": f"图片编辑失败（HTTP {response.status_code}）: {err}",
            }

        # ── 提取图片（b64_json 是纯 base64，无前缀）──
        data = response.json()
        images = data.get("data", [])
        if not images:
            return {
                "success": False,
                "errorType": "NO_DATA",
                "error": "编辑结果为空",
            }

        image_b64 = images[0].get("b64_json", "")
        if not image_b64:
            return {
                "success": False,
                "errorType": "NO_IMAGE_DATA",
                "error": "编辑结果图片数据为空",
            }

        return {"success": True, "image_data": image_b64}

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "errorType": "TIMEOUT",
            "error": f"图片编辑请求超时（超过 {timeout_seconds} 秒）",
        }
    except Exception as e:
        return {
            "success": False,
            "errorType": "EXCEPTION",
            "error": f"图片编辑请求失败: {str(e)}",
        }


# ==============================
# Coze Node 入口
# ==============================

def handler(args: Args[Input]) -> Output:
    """
    Coze / GPT Image 2（API易 代理）节点入口

    - args.input.cleantext:    用户文字提示词
    - args.input.fileurls:     参考图 URL 列表（用于图生图）
    - args.input.aspect_ratio: 宽高比，如 "1:1" / "16:9" / "9:16"
    - args.input.resolution:   分辨率，如 "1K" / "2K" / "4K"
    - args.input.quality:      质量等级，如 "low" / "medium" / "high"（默认 auto）
    - args.input.moderation:   审核强度，如 "auto" / "low"（默认 auto）
    - args.input.output_format: 输出格式，如 "png" / "jpeg" / "webp"（默认 png）
    - args.input.apikey:       API易 API Key（sk-开头）
    """
    API_KEY = args.input.apikey
    cleantext = args.input.cleantext or ""
    fileurls = args.input.fileurls or []
    aspect_ratio = args.input.aspect_ratio or "1:1"
    resolution = args.input.resolution or "1K"
    quality = getattr(args.input, 'quality', None) or "auto"
    output_format = getattr(args.input, 'output_format', None) or "png"
    moderation = getattr(args.input, 'moderation', None) or "auto"

    prompt = cleantext.strip()
    if not prompt:
        prompt = "根据参考图片进行合理的编辑与优化。"

    # 调用 GPT Image 2 生图 / 编辑
    result = generate_image(
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        resolution=resolution,
        quality=quality,
        apikey=API_KEY,
        output_format=output_format,
        moderation=moderation,
        image_urls=fileurls if fileurls else None
    )

    if result["success"]:
        image_base64 = result["image_data"]
        oss_url = upload_base64_to_oss(image_base64)
        return {
            "analysis": "图片生成成功",
            "url": oss_url,
            "error": None,
        }
    else:
        return {
            "analysis": "图片生成失败",
            "url": None,
            "error": result.get("error", "未知错误"),
        }
```

## Optional: gpt-image-2-all 빠른 모드

더 빠른 생성(30\~60초)이 필요하고 크기 파라미터 제어는 중요하지 않다면, 플러그인을 APIYI의 `gpt-image-2-all`(역방향 버전)으로 전환할 수 있으며, Chat Completions 엔드포인트를 통해 호출합니다. 이 모드는 이미지당 \$0.03이며 이미지 URL을 직접 반환하므로 base64 파싱이 필요하지 않습니다.

핵심 변경 사항(`generate_image` 함수만 바꾸면 됩니다):

```python theme={null}
def generate_image_chat(prompt: str, apikey: str, image_urls=None):
    """
    gpt-image-2-all 快速模式（通过 API易 Chat Completions 端点）
    价格 $0.03/张，出图 30-60s，尺寸由 prompt 描述驱动
    """
    api_url = f"{API_BASE}/chat/completions"
    headers = {
        "Authorization": f"Bearer {apikey}",
        "Content-Type": "application/json"
    }

    # 构造消息
    if image_urls:
        # 图生图：多模态 message
        content = [{"type": "text", "text": prompt}]
        for url in image_urls:
            content.append({
                "type": "image_url",
                "image_url": {"url": url}
            })
    else:
        # 文生图：纯文本 message
        content = prompt

    payload = {
        "model": "gpt-image-2-all",
        "messages": [{"role": "user", "content": content}],
    }

    try:
        response = requests.post(api_url, headers=headers, json=payload, timeout=300)
        if response.status_code != 200:
            err = response.json().get("error", {}).get("message", response.text)
            return {"success": False, "errorType": "API_ERROR", "error": str(err)[:500]}

        data = response.json()
        content_text = data["choices"][0]["message"]["content"]

        # 从 Markdown ![image](url) 中提取图片 URL
        match = re.search(r'!\[[^\]]*\]\((.*?)\)', content_text)
        if not match:
            return {"success": False, "errorType": "NO_URL", "error": "未从响应中提取到图片 URL"}

        image_url = match.group(1)

        # 如果是 base64 data URL，直接使用
        if image_url.startswith("data:image/"):
            return {"success": True, "image_data": image_url.split(",", 1)[1]}

        # 如果是 HTTP URL，下载图片 → 转 base64
        img_resp = requests.get(image_url, timeout=60)
        if img_resp.status_code != 200:
            return {"success": False, "errorType": "DOWNLOAD_FAILED", "error": f"下载图片失败: HTTP {img_resp.status_code}"}

        image_b64 = base64.b64encode(img_resp.content).decode("utf-8")
        return {"success": True, "image_data": image_b64}

    except requests.exceptions.Timeout:
        return {"success": False, "errorType": "TIMEOUT", "error": "请求超时"}
    except Exception as e:
        return {"success": False, "errorType": "EXCEPTION", "error": str(e)}
```

> 전환 방법: `generate_image(...)`를 `handler()`에서 `generate_image_chat(...)`으로 바꾸면 됩니다. 필요한 입력은 `prompt`, `apikey`이며, 선택적으로 `fileurls`도 사용할 수 있습니다.

## Coze 워크플로에서 사용하기

플러그인을 게시한 후, 플러그인 노드를 Coze 워크플로 편집기에 드래그한 다음 아래와 같이 연결합니다.

```text theme={null}
Start node (user enters prompt + images)
    ↓
Prompt/image splitter (code node that splits the user message into cleantext and fileurls)
    ↓
Per-user apikey dispatch (dictionary lookup that maps each user to their APIYI API Key)
    ↓
gptimage2 plugin node (this plugin)
    ↓
Success / failure branches
    ↓
End node (outputs url or error)
```

<Tip>
  [Feishu Base AI 이미지 생성 솔루션](/ko/scenarios/ecosystem/feishu-bitable-image-shortcut)과 함께 사용하는 것을 권장합니다. 이 조합을 사용하면 운영/디자인 팀원이 **Feishu 표에 prompt만 입력하여 이미지를 일괄 생성**할 수 있으며, 어떤 코드도 열어볼 필요가 없습니다. 해당 솔루션의 Nano Banana Pro 플러그인을 이 플러그인으로 바꾸기만 하면 됩니다.
</Tip>

## Nano Banana Pro와의 비교

| 항목              | Nano Banana Pro (APIYI)                          | GPT Image 2 (APIYI)                          |
| --------------- | ------------------------------------------------ | -------------------------------------------- |
| 모델              | `gemini-3-pro-image-preview`                     | `gpt-image-2`                                |
| 게이트웨이           | APIYI (같은 플랫폼, 같은 Key)                           | APIYI (같은 플랫폼, 같은 Key)                       |
| 텍스트-투-이미지 엔드포인트 | Gemini `generateContent` (JSON)                  | `/v1/images/generations` (JSON)              |
| 이미지-투-이미지 엔드포인트 | 동일한 엔드포인트 + inline\_data (JSON)                  | `/v1/images/edits` (**multipart/form-data**) |
| 해상도 방식          | 1K / 2K / 4K (고정)                                | 유연한 해상도 (최대 3840×2160)                       |
| 타임아웃 전략         | 해상도 기준 (360s / 600s / 1200s)                     | 품질 기준 (180s / 360s / 900s)                   |
| 콘텐츠 필터링         | 단일 단계 (ZERO\_CANDIDATES\_TOKEN + TEXT\_RESPONSE) | 2단계 (HTTP 400/403 + content\_filter)         |
| 참조 이미지 수        | 제한 없음 (inline\_data)                             | 최대 16                                        |
| 투명 배경           | ✅ 지원됨                                            | ✅ 모델은 지원하지만 (플러그인은 해당 매개변수를 노출하지 않음)         |
| 텍스트 렌더링         | 좋음                                               | 매우 우수함 (>99%)                                |
| 출력 압축           | 지원하지 않음                                          | ✅ jpeg/webp 압축                               |
| 모더레이션 제어        | 지원하지 않음                                          | ✅ moderation 매개변수 (auto/low)                 |

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="전체 소스 코드는 어디에 있습니까? 그냥 복사해도 됩니까?">
    예. 이 페이지의 '전체 플러그인 소스 코드' 섹션에는 완전한 `coze-gptimage2.py`가 포함되어 있습니다. **상단의 OSS 설정과 API\_BASE만 바꾸고** 바로 Coze IDE에 붙여넣으면 됩니다 — 추가로 요청할 것은 없습니다.

    또한 다음이 필요하시면:

    * Feishu 필드 바로가기 코드 → [Feishu Base AI 이미지 생성 솔루션](/ko/scenarios/ecosystem/feishu-bitable-image-shortcut)의 '전체 Feishu 필드 바로가기 소스 코드' 섹션을 참조하십시오
    * Nano Banana Pro 플러그인 → [Nano Banana Pro Coze 플러그인](/ko/scenarios/ecosystem/coze-nanobanana-plugin)을 참조하십시오
  </Accordion>

  <Accordion title="apikey가 왜 하드코딩되지 않고 입력값으로 전달됩니까?">
    각 사용자에게 서로 다른 APIYI API 키를 할당할 수 있기 때문입니다. Coze 워크플로에서 앞단에 '사용자별 apikey 분배' 딕셔너리 노드를 두고, 호출자의 이름을 해당 API 키에 매핑하면 사용량 정산과 접근 제어에 편리합니다.
  </Accordion>

  <Accordion title="APIYI API 키는 공식 OpenAI 키와 어떻게 다릅니까?">
    APIYI는 중국 본토에서 직접 접속 가능한 게이트웨이입니다. API Key도 `sk-`로 시작하지만:

    * 중국 본토에서 직접 접속 가능하며 VPN이 필요 없습니다
    * [APIYI 콘솔](https://api.apiyi.com/token)에서 신청하고 관리합니다
    * 일별/월별 쿼터 제한을 지원하여 비용 통제가 쉽습니다
    * 하나의 Key로 Nano Banana Pro와 GPT Image 2를 모두 사용할 수 있습니다
  </Accordion>

  <Accordion title="세 경로의 차이점은 무엇입니까?">
    세 경로는 기능적으로 동일합니다 — 같은 API Key로 아무 경로나 사용하셔도 됩니다:

    | 도메인             | 설명     |
    | --------------- | ------ |
    | `api.apiyi.com` | 기본 경로  |
    | `vip.apiyi.com` | VIP 경로 |
    | `b.apiyi.com`   | 백업 경로  |

    전환하려면 코드의 `API_BASE` 변수만 바꾸면 됩니다.
  </Accordion>

  <Accordion title="왜 base64를 직접 반환하지 않고 OSS를 거칩니까?">
    하위 Coze 워크플로 노드(특히 Feishu 필드 바로가기)는 결과를 이미지 첨부로 변환하려면 대부분 접근 가능한 URL이 필요합니다. base64를 직접 반환하면 데이터가 워크플로를 통해 앞뒤로 오가게 되어 성능이 좋지 않고, Feishu 측에서도 직접 렌더링할 수 없습니다. OSS 링크는 장기 보관과 외부 공유에도 편리합니다.
  </Accordion>

  <Accordion title="MODERATION_BLOCKED 오류는 어떻게 처리합니까?">
    입력 prompt 또는 참고 이미지가 콘텐츠 안전 필터링을 유발했음을 의미합니다. 이 오류는 **재시도가 필요하지 않습니다** — 다시 시도해도 같은 결과가 나옵니다. 제안 사항:

    1. prompt 문구를 다시 작성합니다
    2. 실존 인물 이름, 저작권이 있는 캐릭터 이름, 생존 작가 이름을 피합니다
    3. 성적 암시, 폭력, 고어 및 기타 민감한 설명을 피합니다
  </Accordion>

  <Accordion title="NO_IMAGE_DATA 또는 NO_DATA는 어떻게 해결합니까?">
    이는 보통 모델이 추론을 완료했지만(이미 과금됨) 출력이 콘텐츠 안전 필터(`content_filter`)에 의해 차단되었음을 의미합니다. 제안 사항:

    1. 문구를 조금 수정하는 대신 전체 시각 장면을 다시 설계합니다
    2. 완전히 다른 prompt 방향을 시도합니다
    3. 품질을 낮추면 더 엄격한 출력 필터를 통과하는 데 도움이 될 수 있습니다
  </Accordion>

  <Accordion title="고품질이 계속 시간 초과됩니까?">
    GPT Image 2의 고품질은 1K에서도 145-280초가 걸리며, 4K는 600초를 초과할 수 있습니다. 플러그인은 이미 고품질에 대해 900초 타임아웃을 설정해 두었습니다. 그래도 시간 초과가 발생하면:

    1. 먼저 `quality=medium`로 prompt를 디버깅합니다
    2. APIYI 콘솔에서 요청 제한 여부를 확인합니다
    3. 경로를 바꿔 다시 시도합니다
    4. 동시 실행 수를 줄입니다
    5. `gpt-image-2-all` 모드(이미지당 30-60초)를 고려합니다
  </Accordion>

  <Accordion title="투명 배경을 지원합니까?">
    **모델은 이를 지원하지만, 이 플러그인에서는 아직 해당 파라미터를 노출하지 않습니다.** 2026-08-21부터 `gpt-image-2`는 `background: "transparent"`를 지원하며, API를 직접 호출하면 실제 알파 채널 이미지가 반환됩니다 — [투명 배경으로 이미지를 생성하는 방법](/ko/faq/image-transparent-background)을 참조하십시오.

    플러그인 내부에서 투명도를 얻으려면 두 가지 방법이 있습니다: 플러그인 소스에서 요청 본문에 `"background": "transparent"`를 추가하고(그리고 `output_format`가 `png` 또는 `webp`인지 확인한 뒤), 또는 [Nano Banana Pro 플러그인](/ko/scenarios/ecosystem/coze-nanobanana-plugin)으로 전환하십시오.
  </Accordion>

  <Accordion title="thinking 추론 깊이 파라미터를 지원합니까?">
    **아니요.** APIYI의 공식 릴레이 gpt-image-2 파라미터 목록은 OpenAI의 것과 완전히 같지 않으며; `thinking`는 APIYI가 지원하는 파라미터에 포함되어 있지 않습니다. 출력 품질을 세밀하게 제어하려면 대신 `quality` 파라미터(low / medium / high / auto)를 사용하십시오.

    지원되지 않는 다른 파라미터는 다음과 같습니다:

    * `response_format` — 응답은 항상 `b64_json`를 반환합니다
    * `n` — 1로 고정됩니다
    * `background: "transparent"` — **모델은 이를 지원하지만**, 이 플러그인은 해당 파라미터를 노출하지 않습니다. 소스를 수정해 전달하십시오
    * `input_fidelity` — high로 고정되어 있습니다; **전달하면 400 오류가 반환됩니다**
  </Accordion>

  <Accordion title="GPT Image 2와 Nano Banana Pro 중 무엇을 선택해야 합니까?">
    두 플러그인은 **동일한 APIYI 플랫폼**을 사용하며, 하나의 API Key로 둘 다 사용할 수 있습니다. 권장 사항:

    | 시나리오                       | 권장 사항                                               |
    | -------------------------- | --------------------------------------------------- |
    | 높은 텍스트 렌더링 요구(포스터, 표지, UI) | GPT Image 2(텍스트 정확도 > 99%)                          |
    | 4K 초고해상도                   | GPT Image 2(최대 3840×2160)                           |
    | 여러 참고 이미지로 편집              | GPT Image 2(최대 16개)                                 |
    | 출력 압축(더 작은 파일 크기)          | GPT Image 2(jpeg / webp 압축)                         |
    | 투명 배경                      | 둘 다 가능(GPT Image 2는 `background`를 통과하도록 소스 수정이 필요함) |
    | 예산에 민감한 경우                 | GPT Image 2-All(\$0.03/image)                       |
    | 중국어 친화적인 prompt            | GPT Image 2-All(리버스 버전)                             |
  </Accordion>
</AccordionGroup>

## 관련 자료

<CardGroup cols={2}>
  <Card title="Feishu Base AI 이미지 생성 솔루션" icon="table" href="/ko/scenarios/ecosystem/feishu-bitable-image-shortcut">
    이 플러그인의 완벽한 동반자입니다. 전체 Coze 워크플로를 Feishu Base에 연결하여 운영 팀원이 표를 채우는 것만으로 이미지를 일괄 생성할 수 있습니다
  </Card>

  <Card title="Nano Banana Pro Coze 플러그인" icon="banana" href="/ko/scenarios/ecosystem/coze-nanobanana-plugin">
    Gemini 3 Pro Image를 기반으로 구축된 또 다른 Coze 이미지 생성 솔루션으로, GPT Image 2와 동일한 APIYI 키를 사용합니다
  </Card>

  <Card title="APIYI GPT Image 2 문서" icon="book" href="/ko/api-capabilities/gpt-image-2/overview">
    APIYI의 공식 릴레이 GPT Image 2에 대한 전체 문서, 파라미터 참조 및 코드 예제입니다
  </Card>

  <Card title="APIYI GPT Image 2-All 문서" icon="code" href="/en/api-capabilities/gpt-image-2-all/chat-completions">
    APIYI의 리버스 버전 Chat Completions 엔드포인트 문서 (\$0.03/image, 이미지당 30-60초)
  </Card>

  <Card title="APIYI 콘솔" icon="settings" href="https://api.apiyi.com/token">
    API 키를 관리하고, 사용량과 잔액을 확인하며, 쿼터 한도를 설정합니다
  </Card>

  <Card title="GPT Image 2 공통 오류 수정" icon="circle-question-mark" href="https://help.apiyi.com/fix-gpt-image-2-moderation-blocked-400-error.html">
    moderation\_blocked 400 오류 진단 및 완화 전략
  </Card>
</CardGroup>
