> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.6 텍스트 모델 시리즈 (레거시)

> APIYI의 Alibaba Qwen3.6 패밀리: Max-Preview 코딩 플래그십 + Flash 속도 우선 멀티모달 + Plus 균형형 워크호스 + 27B / 35B-A3B 오픈 웨이트 변형(APIYI 호스팅 — GPU 대여 불필요). 모두 Aliyun의 공식 릴레이를 통해 라우팅되며, OpenAI Chat 호환입니다. 정가는 Alibaba의 공식 요율과 동일하며, APIYI의 충전 보너스로 실질 단가는 정가의 약 85% 수준입니다.

<Warning>
  **이 페이지는 레거시 아카이브입니다.** Alibaba Qwen의 현재 주력은 [Qwen3.8-Max](/ko/api-capabilities/qwen-3-8/overview)로, 2026년 8월에 공개되었습니다 — 2.4T 파라미터, 1M 컨텍스트, 기본 이미지 및 비디오 입력, Alibaba의 공식 가격보다 17.5％ 낮게 책정되었습니다. 아래의 다섯 Qwen3.6 모델은 동일한 가격과 통합 방식으로 계속 호출할 수 있지만, 새 프로젝트는 Qwen3.8-Max로 시작해야 합니다.
</Warning>

Qwen3.6은 Alibaba Tongyi Qianwen의 차세대 모델 패밀리로, 2026년 2분기에 세 가지 폐쇄형 생산 티어 — **Max** (주력), **Plus** (균형형), **Flash** (속도 우선) — 와 두 가지 오픈 가중치 변형인 **27B** 및 **35B-A3B**로 공개되었습니다. APIYI는 다섯 모델 모두를 **Aliyun official relay / APIYI hosted relay**를 통해 라우팅하며, OpenAI Chat Completions와 호환됩니다. 폐쇄형 티어는 공식 포털의 인증 및 요청 제한 정책을 따르며, **오픈 가중치 티어는 APIYI의 공식 릴레이에서 호스팅되므로 고객이 GPU를 임대하거나 로컬 추론을 직접 구축할 필요가 없습니다**.

<Note>
  **🚀 하이라이트**: Max-Preview는 SWE-bench Pro와 Terminal-Bench 2.0을 포함한 **6개 코딩 벤치마크에서 #1**을 차지한다고 주장합니다; Flash는 기본 256K(1M까지 확장 가능) 멀티모달 컨텍스트를 갖춘 35B-A3B MoE입니다; Plus는 1M 컨텍스트 윈도우를 갖춘 72B/18B 활성 작업용 모델입니다. 오픈 가중치 **`qwen3.6-27b`**(27B dense)와 **`qwen3.6-35b-a3b`**(35B MoE / 3B active)는 APIYI의 공식 릴레이에서 호스팅되므로 GPU 임대가 필요 없으며, 토큰당 과금됩니다. **코딩 에이전트, 장문 컨텍스트 RAG, 멀티모달 디스패치, 그리고 감사 가능한 가중치가 필요한 규정 준수 민감 워크로드를 위해 설계되었습니다**.
</Note>

### 폐쇄형 생산 티어 (Aliyun official relay)

<CardGroup cols={3}>
  <Card title="qwen3.6-max-preview" icon="trophy">
    **코딩 주력**

    6개 코딩 벤치마크에서 #1; AIME 2025 93%, GPQA 86%, LiveCodeBench 79%.
  </Card>

  <Card title="qwen3.6-flash" icon="bolt">
    **속도 우선 멀티모달**

    35B-A3B MoE, 기본 텍스트 / 이미지 / 비디오 입력, 256K 기본 컨텍스트에서 1M까지 확장 가능.
  </Card>

  <Card title="qwen3.6-plus" icon="scale">
    **균형형 작업용 모델**

    총 72B / 활성 18B, 1M 컨텍스트, Terminal-Bench 61.6으로 Claude Opus 4.5를 능가합니다.
  </Card>
</CardGroup>

### 오픈 가중치 티어 (APIYI에서 호스팅 · GPU 임대 불필요)

<CardGroup cols={2}>
  <Card title="qwen3.6-27b" icon="box">
    **27B 밀집형 · 코딩 강자**

    Qwen 팀의 오픈 가중치 릴리스(Hugging Face `Qwen/Qwen3.6-27B`). 코딩 능력은 397B급 모델에 필적합니다. APIYI의 공식 릴레이에서 호스팅되므로 로컬 GPU가 필요하지 않습니다.
  </Card>

  <Card title="qwen3.6-35b-a3b" icon="boxes">
    **35B-A3B 오픈 가중치 MoE**

    Qwen 팀의 오픈 가중치 릴리스(Hugging Face `Qwen/Qwen3.6-35B-A3B`); 폐쇄형 Flash와 같은 계보이지만 배포 티어는 다릅니다. 활성 파라미터는 3B뿐이어서 계산 비용이 매우 낮습니다.
  </Card>
</CardGroup>

## 왜 APIYI의 Qwen3.6은 Aliyun 공식 릴레이를 통해 제공됩니까?

Alibaba Cloud Bailian의 공식 채널을 기준으로 조정했으며, **안정성**, **비용**, **통합 편의성** 전반에서 엔터프라이즈 운영에 맞게 깊이 최적화했습니다:

<CardGroup cols={2}>
  <Card title="Aliyun 공식 릴레이" icon="server">
    Alibaba Cloud Bailian의 공식 채널을 통해 라우팅됩니다. 인증 및 요청 제한 정책은 공식 포털과 동일하며 — 국내 지연 시간이 낮고 엔터프라이즈급 SLA를 제공합니다.
  </Card>

  <Card title="동시 실행 수 제한 없음 · 자유롭게 확장" icon="infinity">
    RPM / TPM에 대한 엄격한 상한이 없습니다(상위 공급 상황에 따름). 엔터프라이즈 고객은 필요에 따라 확장할 수 있으며, 고동시 실행 수 조율을 위한 티켓 및 전용 채널도 제공합니다.
  </Card>

  <Card title="정가 일치 + 충전으로 약 15% 할인" icon="percent">
    정가는 Alibaba Cloud의 공식 요율과 동일합니다. [충전 보너스](/ko/faq/recharge-promotions)와 함께 적용하면 실질 단가는 **정가의 약 85%** 수준입니다.
  </Card>

  <Card title="전 세계 무마찰 액세스" icon="globe">
    **해외 서버나 프록시가 필요 없습니다**. 국내 데이터 센터, 가정용 브로드밴드, 해외 노드 모두 `api.apiyi.com`에 직접 연결할 수 있으며 — 해외 이전이 필요 없습니다.
  </Card>

  <Card title="완전한 OpenAI 호환 생태계" icon="layers">
    OpenAI Chat Completions와 호환됩니다. APIYI의 [통합 모델 카탈로그](/ko/api-capabilities/model-info)를 통해 GPT / Claude / DeepSeek / GLM 등으로 매끄럽게 전환할 수 있습니다.
  </Card>

  <Card title="전문 서비스 · 엔터프라이즈 지원" icon="handshake">
    모델 선정과 Agent 워크플로에 대한 깊은 전문성을 바탕으로, 엔터프라이즈 고객에게 PoC → 카나리 → 프로덕션까지 전 과정을 지원합니다.
  </Card>
</CardGroup>

## 다섯 가지 중에서 선택하는 방법

<CardGroup cols={2}>
  <Card title="Max-Preview · 코딩 및 복잡한 추론" icon="trophy">
    **적용 시나리오**: Coding Agent 드라이버, 실제 소프트웨어 엔지니어링 작업(SWE-Verified 급), Cursor / Claude Code 워크플로의 기본 모델입니다.

    **벤치마크**: SWE-bench Pro 58.4로 GLM-5.1의 56.6을 앞섭니다, AIME 2025 93%, GPQA 86%, LiveCodeBench 79%, Terminal-Bench 2.0 #1입니다.

    **참고**: Preview로 표시되어 있으며, 가중치가 아직 계속 조정 중입니다. 본 트래픽으로 전환하기 전에 소규모 카나리를 먼저 실행하십시오.
  </Card>

  <Card title="Flash · 대규모 멀티모달 장문 컨텍스트" icon="bolt">
    **적용 시나리오**: 이미지 / 동영상 이해, 긴 문서 요약, 대량 번역, RAG 이후 전체 문서 종합입니다.

    **아키텍처**: 총 35B / 활성 3B MoE(35B-A3B), 기본 256K 컨텍스트이며 1M tokens까지 확장 가능합니다.

    **멀티모달**: 텍스트 / 이미지 / 동영상 입력을 기본으로 지원합니다. 단가가 Max의 약 1/8입니다.
  </Card>

  <Card title="Plus · 균형 잡힌 주력 모델" icon="scale">
    **적용 시나리오**: 일상 대화, 고객 지원, 콘텐츠 생성, 엔터프라이즈 지식베이스 Q\&A, 중간 난도의 추론입니다.

    **아키텍처**: 총 72B / 활성 18B MoE — 추론 속도는 대략 Claude Opus 4.6의 3배입니다.

    **벤치마크**: Terminal-Bench 2.0에서 61.6으로 Claude Opus 4.5(59.3)를 앞섭니다. SWE-bench Verified 78.8입니다.
  </Card>

  <Card title="qwen3.6-27b · 오픈웨이트 코딩 강자" icon="box">
    **적용 시나리오**: 비용에 민감한 코딩 지원, 로컬 배포를 커밋하기 전의 API 검증 단계, 감사 가능한 오픈소스 라이선스가 필요한 고객입니다.

    **참고**: 27B dense, 오픈 웨이트이며 코딩 능력은 397B급 모델에 필적합니다. APIYI에서 호스팅하므로 로컬 GPU가 필요 없습니다.
  </Card>

  <Card title="qwen3.6-35b-a3b · 오픈웨이트 고속 MoE" icon="boxes">
    **적용 시나리오**: 고빈도 저비용 워크플로, 셀프 호스티드 추론으로 옮기기 전의 전환 단계, 규정 준수를 위해 다운로드 가능한 가중치가 필요한 프로젝트입니다.

    **참고**: 폐쇄형 Flash와 같은 계열입니다(총 35B / 활성 3B). 오픈웨이트 버전은 APIYI에서 호스팅하므로 GPU 대여, 배포, 운영을 건너뛸 수 있습니다.
  </Card>

  <Card title="권장 라우팅" icon="route">
    **전략**: 기본은 Flash, 승격 시 Plus, 상한은 Max-Preview로 두며, 극도로 비용에 민감한 워크로드에는 오픈웨이트 27b / 35b-a3b로 낮추십시오.

    일상적인 대화와 멀티모달 배치는 Flash로 보내고, 더 강한 추론이 필요하면 Plus로 승격하며, 코딩 에이전트, 복잡한 추론, 다단계 계획에는 Max-Preview를 남겨 두십시오. 비용이 가장 중요하거나 감사 가능한 가중치가 필요할 때는 오픈웨이트 계층으로 전환하십시오.
  </Card>
</CardGroup>

## 과금

다섯 모델 모두 **종량제 - Chat** 기준으로 과금됩니다. 비공개 소스 계층( Max-Preview / Flash / Plus )은 단일 요청의 총 입력 token 수를 기준으로 하는 **계단식 과금**을 사용합니다. 오픈 웨이트 계층(27b / 35b-a3b)은 **단일 정액 요율 — 계층 없음**으로 과금됩니다. 목록 가격은 Alibaba Cloud의 공식 요율과 일치하며, APIYI의 충전 보너스로 실효 단가는 대략 **목록 가격의 85%** 수준이 됩니다.

### qwen3.6-max-preview

| 단일 요청 입력 token 수 | 입력 가격                | 출력 가격                 |
| ---------------- | -------------------- | --------------------- |
| **0 – 128K**     | \$1.2800 / 1M tokens | \$7.6800 / 1M tokens  |
| **128K – 256K**  | \$2.1200 / 1M tokens | \$12.7200 / 1M tokens |

### qwen3.6-flash

| 단일 요청 입력 token 수 | 입력 가격                | 출력 가격                |
| ---------------- | -------------------- | -------------------- |
| **0 – 256K**     | \$0.1700 / 1M tokens | \$1.0200 / 1M tokens |
| **256K – 1000K** | \$0.6800 / 1M tokens | \$4.0800 / 1M tokens |

### qwen3.6-plus

| 단일 요청 입력 token 수 | 입력 가격                | 출력 가격                |
| ---------------- | -------------------- | -------------------- |
| **0 – 256K**     | \$0.3000 / 1M tokens | \$1.8000 / 1M tokens |
| **256K – 1000K** | \$1.2000 / 1M tokens | \$7.2000 / 1M tokens |

### qwen3.6-27b (open-weight · APIYI hosted)

| 과금            | 입력 가격                | 출력 가격                |
| ------------- | -------------------- | -------------------- |
| **정액(계층 없음)** | \$0.4200 / 1M tokens | \$2.5200 / 1M tokens |

### qwen3.6-35b-a3b (open-weight · APIYI hosted)

| 과금            | 입력 가격                | 출력 가격                |
| ------------- | -------------------- | -------------------- |
| **정액(계층 없음)** | \$0.2600 / 1M tokens | \$1.5600 / 1M tokens |

<Info>
  **과금 참고**:

  * **비공개 소스 계층(계단식 과금)**: 계층은 **단일 요청의 총 입력 token 수**로 정해집니다. 해당 요청의 모든 token(입력 + 출력)은 그 계층의 요율로 과금됩니다. **계층 간 일할 계산은 없습니다** — 예를 들어 입력 token이 300K인 Flash 요청은 `256K – 1000K`에 해당하며, 전체 요청이 \$0.68 / \$4.08 요율로 과금되고, “처음 256K는 저렴하고 나머지 44K는 더 높은 계층”으로 나뉘지 않습니다.
  * **오픈 웨이트 계층(정액 과금)**: `qwen3.6-27b` 및 `qwen3.6-35b-a3b`는 APIYI의 공식 릴레이에서 호스팅됩니다 — 계층이 없습니다. 고객은 GPU를 임대하거나 로컬 추론을 실행할 필요가 없으며, 실제 token 사용량에 따라 직접 정산하면 됩니다.
  * 목록 가격은 Alibaba Cloud Bailian과 일치합니다. [충전 보너스](/ko/faq/recharge-promotions)를 적용하면 실효 단가는 대략 **목록 가격의 85%** 수준입니다.
  * 캐시 적중 과금은 현재 별도로 공개되지 않으며, 기본 계층으로 적용됩니다.
</Info>

## 사양

### 비공개 소스 프로덕션 티어

| 항목                | qwen3.6-max-preview   | qwen3.6-flash     | qwen3.6-plus      |
| ----------------- | --------------------- | ----------------- | ----------------- |
| **모델 ID**         | `qwen3.6-max-preview` | `qwen3.6-flash`   | `qwen3.6-plus`    |
| **아키텍처**          | Dense 대형 모델           | MoE 35B-A3B       | MoE 72B / 18B 활성  |
| **컨텍스트**          | 262K tokens           | 256K (1M까지 확장 가능) | 1M tokens         |
| **입력 모달리티**       | 텍스트                   | 텍스트 / 이미지 / 동영상   | 텍스트               |
| **출력 형식**         | 텍스트                   | 텍스트               | 텍스트               |
| **스트리밍**          | ✅ 지원                  | ✅ 지원              | ✅ 지원              |
| **함수 호출 / 도구 사용** | ✅ 지원                  | ✅ 지원              | ✅ 지원              |
| **사고의 연쇄**        | ✅ 추론 작업에서 자동 활성화      | —                 | ✅ 항상 활성화          |
| **과금**            | 사용량 기반 Chat (단계형)     | 사용량 기반 Chat (단계형) | 사용량 기반 Chat (단계형) |
| **채널**            | Aliyun 공식 릴레이         | Aliyun 공식 릴레이     | Aliyun 공식 릴레이     |

### 오픈 웨이트 티어(APIYI가 호스팅)

| 항목                | qwen3.6-27b                                        | qwen3.6-35b-a3b                                        |
| ----------------- | -------------------------------------------------- | ------------------------------------------------------ |
| **모델 ID**         | `qwen3.6-27b`                                      | `qwen3.6-35b-a3b`                                      |
| **아키텍처**          | 27B dense                                          | MoE 총 35B / 3B 활성                                      |
| **라이선스**          | Qwen team 오픈 웨이트 (Hugging Face `Qwen/Qwen3.6-27B`) | Qwen team 오픈 웨이트 (Hugging Face `Qwen/Qwen3.6-35B-A3B`) |
| **컨텍스트**          | 공식 weight 카드와 동일                                   | 공식 weight 카드와 동일                                       |
| **입력 모달리티**       | 텍스트                                                | 텍스트                                                    |
| **스트리밍**          | ✅ 지원                                               | ✅ 지원                                                   |
| **함수 호출 / 도구 사용** | ✅ 지원                                               | ✅ 지원                                                   |
| **과금**            | 사용량 기반 Chat (고정, 단계 없음)                            | 사용량 기반 Chat (고정, 단계 없음)                                |
| **채널**            | APIYI 호스팅 릴레이                                      | APIYI 호스팅 릴레이                                          |

<Tip>
  **호스팅된 오픈 웨이트를 사용하는 이유**: 오픈 웨이트 체크포인트는 공개적으로 다운로드할 수 있지만, 실행하려면 GPU, VRAM, 운영이 필요합니다. **APIYI는 이러한 오픈 웨이트를 공식 릴레이에 호스팅합니다**, 따라서 API를 직접 호출할 수 있습니다 — 임대, 배포, 운영 비용을 들이지 않으면서 "감사 가능한 가중치, 통제 가능한 라이선스"라는 장점을 유지합니다.
</Tip>

## 엔드포인트

| 엔드포인트                  | 메서드    | Content-Type       | 용도                                                      |
| ---------------------- | ------ | ------------------ | ------------------------------------------------------- |
| `/v1/chat/completions` | `POST` | `application/json` | 대화 / 추론 / 도구 사용 (**다섯 모델 모두에서 공유되며**, `model` 필드만 다릅니다) |

<Tip>
  **도메인**: `api.apiyi.com`은 주요 게이트웨이입니다. `b.apiyi.com` / `vip.apiyi.com` 같은 대체 게이트웨이도 동일한 응답을 생성합니다. OpenAI / OpenAI 호환 SDK를 직접 사용하려면 `base_url`를 `https://api.apiyi.com/v1`로 설정합니다.
</Tip>

## 코드 예제

### Python (OpenAI SDK 호환)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Max-Preview: coding Agent driver
resp = client.chat.completions.create(
    model="qwen3.6-max-preview",
    messages=[
        {"role": "system", "content": "You are a senior Python engineer. Return changes as a unified diff."},
        {"role": "user", "content": "Add type hints and fix any latent bugs in this snippet ..."}
    ]
)
print(resp.choices[0].message.content)

# Flash: image + text multimodal input
resp = client.chat.completions.create(
    model="qwen3.6-flash",
    messages=[
        {"role": "user", "content": [
            {"type": "text", "text": "Describe the key information in this image."},
            {"type": "image_url", "image_url": {"url": "https://your-image-url.png"}}
        ]}
    ]
)
print(resp.choices[0].message.content)

# Plus: daily dialog and mid-complexity reasoning
resp = client.chat.completions.create(
    model="qwen3.6-plus",
    messages=[{"role": "user", "content": "Introduce yourself in one sentence."}]
)
print(resp.choices[0].message.content)
```

### Node.js

```javascript theme={null}
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-your-api-key',
  baseURL: 'https://api.apiyi.com/v1',
});

const resp = await client.chat.completions.create({
  model: 'qwen3.6-plus',
  messages: [{ role: 'user', content: 'Introduce yourself in one sentence.' }],
});

console.log(resp.choices[0].message.content);
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.6-max-preview",
    "messages": [
      {"role": "user", "content": "Explain what an MoE architecture is."}
    ]
  }'
```

## 모범 사례

<Steps>
  <Step title="작업별로 적절한 티어를 선택합니다">
    일상적인 대화 / 분류 / 멀티모달 배칭에는 Flash를 기본으로 사용합니다. 중간 수준의 추론과 기업용 지식 베이스 Q\&A에는 Plus를 사용합니다. 코딩 에이전트, 복잡한 계획, 또는 경쟁 수준의 수학 추론에는 Max-Preview로만 올립니다. 가능할 때마다 더 낮은 티어를 사용합니다.
  </Step>

  <Step title="티어 경계를 추정합니다">
    출시 전에 P95 입력 token 수를 프로파일링합니다. Max-Preview는 128K를 넘기거나 Flash / Plus는 256K를 넘기면 가격이 급격히 올라갑니다. 매우 긴 컨텍스트는 요약 / 청크로 나누어 P95를 더 낮은 티어 안에 유지합니다.
  </Step>

  <Step title="멀티모달 배칭">
    Flash는 1M 컨텍스트와 비디오 입력을 지원하지만, 하나의 매우 긴 요청은 더 높은 티어를 유발합니다. 긴 비디오는 구간별로 나눈 뒤 256K 이내의 청크로 입력해 호출당 비용을 관리합니다.
  </Step>

  <Step title="Preview 카나리">
    `qwen3.6-max-preview`는 Preview 빌드입니다 — 가중치가 아직 반복 조정 중입니다. 중요한 경로에서는 메인 트래픽을 전환하기 전에 A/B 비교를 포함한 작은 카나리 테스트를 먼저 실행합니다.
  </Step>

  <Step title="도구 및 스트리밍">
    세 모델 모두 OpenAI 스타일의 `tools`와 `stream: true`를 지원합니다. 도구 호출 로직을 다시 작성하지 않고도 기존 OpenAI 호환 Agent 프레임워크(OpenClaw, LangChain, LlamaIndex 등)에 그대로 넣을 수 있습니다.
  </Step>

  <Step title="충전 보너스를 더해 활용합니다">
    정가는 이미 Alibaba의 공식 요율과 일치합니다. [충전 보너스](/ko/faq/recharge-promotions)를 더하면 실효 단가는 **정가의 85%** 정도입니다. 더 큰 충전(\$1,000+)일수록 더 높은 보너스 비율을 받으므로, 더 적고 큰 금액으로 충전하는 편이 마진에 가장 유리합니다.
  </Step>
</Steps>

## 오류 및 재시도

| 상태    | 의미                  | 조치                                                           |
| ----- | ------------------- | ------------------------------------------------------------ |
| `400` | 매개변수 오류 / 알 수 없는 모델 | `model` 철자, `messages` 형식, 그리고 입력이 최대 컨텍스트를 초과하는지 확인하십시오     |
| `401` | 유효하지 않은 token       | Bearer Token을 확인하십시오                                         |
| `403` | 콘텐츠 검열 차단           | 정책 위반을 피하도록 prompt / 참조 입력을 조정하십시오                           |
| `429` | 요청 제한 / 잔액 부족       | 지수 백오프 재시도; 계정 잔액을 확인하십시오                                    |
| `5xx` | 게이트웨이 / 백엔드 오류      | 1–2회 재시도하십시오; 그래도 실패하면 티켓을 등록하십시오                            |
| 타임아웃  | 롱테일 지연              | 클라이언트 타임아웃을 **≥ 120초**로 설정하십시오 (CoT 또는 긴 컨텍스트 호출은 더 오래 걸립니다) |

<Info>
  **클라이언트 권장 사항**:

  * 요청 타임아웃을 **≥ 120초**로 설정하십시오 (Max-Preview 추론과 Plus 긴 컨텍스트 CoT는 더 오래 걸립니다)
  * 5xx 및 타임아웃에 대해 **지수 백오프 재시도**를 적용하십시오(2회 시도 권장)
  * 문제 해결을 위해 `x-request-id` 응답 헤더를 기록하십시오
</Info>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="이 다섯 모델은 모두 같은 API 엔드포인트를 공유합니까?">
    네. 다섯 모델 모두 `/v1/chat/completions`를 공유합니다(OpenAI Chat Completions 호환). 차이는 `model` 필드만 다르며(`qwen3.6-max-preview` / `qwen3.6-flash` / `qwen3.6-plus` / `qwen3.6-27b` / `qwen3.6-35b-a3b`), 필요에 따라 같은 코드베이스에서 전환하시면 됩니다.
  </Accordion>

  <Accordion title="오픈 웨이트(27b / 35b-a3b)와 클로즈드 소스 계층의 차이는 무엇입니까?">
    주요 차이는 세 가지입니다: **(1) 다운로드 가능한 가중치** — 오픈 웨이트 체크포인트는 내부 감사, 컴플라이언스 제출, 또는 향후 로컬 추론으로의 마이그레이션을 위해 Hugging Face에 있습니다; **(2) 호스팅된 컴퓨트** — APIYI가 공식 릴레이에서 오픈 웨이트를 호스팅하므로 사용자는 API만 호출하면 되고, GPU 대여 / 배포 / 운영이 필요 없습니다; **(3) 더 단순한 과금** — 오픈 웨이트 계층은 정액 요금제를 사용하며, 단계가 없어 예산 편성이 더 쉽습니다. 성능 측면에서는 35B-A3B가 클로즈드 소스 Flash와 계보를 공유하지만(배포 계층은 다름), 27B는 독립적인 dense 모델로 코딩 능력이 훨씬 더 높은 파라미터 수를 가진 모델들과 견줄 만합니다.
  </Accordion>

  <Accordion title="가중치가 공개되어 있는데 왜 APIYI의 호스팅된 API를 사용해야 합니까?">
    오픈 대형 모델을 자체 호스팅하려면 최소한 다음이 필요합니다: 성능이 충분한 GPU(27B는 최소 A100 40G 1개가 필요하며, 35B-A3B는 더 많은 VRAM이 필요함), 추론 프레임워크(vLLM / TensorRT-LLM), 모니터링, 장애 조치, 업그레이드 파이프라인. **APIYI의 호스팅된 공식 릴레이가 이 모든 것을 처리합니다** — token 기준으로 과금되고, 필요에 따라 확장되며, 클로즈드 소스 계층과 동일한 OpenAI 호환 SDK를 공유합니다. API로 먼저 구축하고, 나중에 자체 호스팅으로 전환할지 결정하시면 됩니다. 전환 경로는 계속 매끄럽게 유지됩니다.
  </Accordion>

  <Accordion title="단계별 과금은 정확히 어떻게 작동합니까?">
    단계는 **단일 요청의 총 입력 token 수**로 결정됩니다. 해당 요청의 모든 token(입력 + 출력)은 해당 단계의 요율로 과금됩니다. 예시: 입력 token이 300K인 Flash 요청은 `256K – 1000K`에 해당하며, 요청 전체가 \$0.68 / \$4.08로 과금됩니다 — “처음 256K는 저렴하고, 나머지 44K는 더 비싸게”로 나뉘지 않습니다.
  </Accordion>

  <Accordion title="Max-Preview는 Preview입니다 — 프로덕션에 사용해도 됩니까?">
    네, 하지만 먼저 카나리로 운영하셔야 합니다. Qwen 팀은 이후 개정판에서 가중치를 계속 다듬을 것이라고 밝혔습니다. 중요한 경로에서는 벤치마크 작업으로 A/B 테스트를 수행하고, 안정적인 버전이 나올 때만 메인 트래픽을 전환하시면 됩니다.
  </Accordion>

  <Accordion title="Flash에 멀티모달 입력은 어떻게 보내야 합니까?">
    OpenAI의 Vision 호환 형식을 사용하십시오: `messages`에서 `content`를 각 요소가 `{type: "text", text: ...}` 또는 `{type: "image_url", image_url: {url: ...}}`인 배열로 보내십시오. 동영상의 경우 공식 문서의 `video_url` / 프레임 샘플링 필드를 따르십시오.
  </Accordion>

  <Accordion title="APIYI의 가격은 Alibaba Cloud Bailian의 공식 사이트와 같습니까?">
    목록 가격은 공식 요율과 같습니다. 차이점은 APIYI가 [충전 보너스](/ko/faq/recharge-promotions)를 더해 실질 단가를 정가의 약 **85%** 수준으로 낮추며, OpenAI 호환 전체 생태계(GPT / Claude / Gemini / DeepSeek / GLM 등)를 지원하는 통합 계정을 제공한다는 점입니다 — 여러 공급업체 계정을 따로 유지할 필요가 없습니다.
  </Accordion>

  <Accordion title="function calling / tool use를 지원합니까?">
    네. 세 모델 모두 OpenAI 표준 `tools` / `tool_choice`를 수용합니다. 기존 Agent 프레임워크의 tool-calling 로직을 재사용할 수 있습니다. Max-Preview는 다단계 tool call과 장기 계획에서 강점을 보입니다.
  </Accordion>

  <Accordion title="chain-of-thought 출력을 지원합니까?">
    Max-Preview는 추론 작업에서 CoT를 자동으로 활성화하며, Plus는 CoT가 항상 켜져 있고, Flash는 속도 우선이라 기본적으로 CoT를 출력하지 않습니다. 필드 이름은 Alibaba Cloud의 응답 형식(`reasoning_content` 등)을 따릅니다.
  </Accordion>

  <Accordion title="요청이 1M 컨텍스트를 초과하면 어떻게 됩니까?">
    Flash와 Plus는 1M token까지, Max-Preview는 262K까지 지원합니다. 한도를 초과하면 `400`가 반환됩니다. 전송 전에 요약 / 청킹 / RAG 검색을 적용하십시오 — 모든 것을 한 번의 호출에 억지로 넣지 마십시오.
  </Accordion>

  <Accordion title="공식 OpenAI SDK를 직접 사용할 수 있습니까?">
    네. `base_url`를 `https://api.apiyi.com/v1`로 설정하고 위 모델 ID 중 하나를 `model`로 전달하시면 됩니다 — 코드 변경 없이 마이그레이션할 수 있습니다.
  </Accordion>

  <Accordion title="실패한 요청도 과금됩니까?">
    클라이언트 측 `4xx` 오류(파라미터 오류 / 인증 실패 / 콘텐츠 모더레이션 차단)는 과금되지 않습니다. 추론에 도달하지 못한 서버 측 `5xx` 오류도 과금되지 않습니다. token을 성공적으로 반환한 요청은 클라이언트가 스트리밍 중간에 취소하더라도 실제 token 수 기준으로 과금됩니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [심층 분석: Qwen3.6 Max-Preview & Flash 출시](/en/news/qwen-3-6-max-flash-launch)
* [심층 분석: Qwen3.6-Plus 출시 — Alibaba의 가장 강력한 코딩 에이전트](/en/news/qwen-3-6-plus-launch)
* [충전 프로모션](/ko/faq/recharge-promotions) — 단가를 목록가의 약 85%까지 낮춥니다
* [모델 카탈로그](/ko/api-capabilities/model-info) — 사용 가능한 모든 모델과 그룹
* [API 매뉴얼](/ko/api-manual) — 일반적인 사용 규칙

<Info>
  **정리**: Qwen3.6 시리즈는 고부하 코딩 에이전트부터 대량 멀티모달 처리까지의 전체 수요 곡선을 포괄합니다. Max-Preview는 국내 코딩을 새로운 수준으로 끌어올리고, Flash는 멀티모달 장문 컨텍스트 워크로드의 단가를 크게 낮추며, Plus는 믿을 수 있는 균형형 주력 모델입니다. APIYI의 공식 릴레이가 호스팅하는 오픈 웨이트 27B 및 35B-A3B 변형은 “GPU를 빌리지 않고도 제어 가능한 오픈 웨이트”의 고리를 완성합니다. 이들 다섯 모델은 모두 OpenAI Chat 호환 엔드포인트를 공유하며, 공식 요율과 맞춘 목록가에 제공되고, 충전 보너스와 함께하면 대략 목록가의 85% 수준까지 내려가므로, 현재 Aliyun 공식 릴레이 채널에서 이용할 수 있는 최고의 가격/성능 조합입니다.
</Info>
