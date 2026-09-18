> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek 하니스

> Web UI, 헤드리스 CLI 및 Python SDK를 지원하는 DeepSeek AI의 오픈 소스 플러그인 기반 AI 에이전트 하니스

## 개요

DeepSeek Harness(`dsh`)는 DeepSeek AI에서 개발한 오픈 소스 AI 에이전트 하네스입니다. “모든 것이 플러그인”인 아키텍처를 따르며, 모델, 도구, 파일 시스템, 터미널, 세션, 워크플로를 확장 가능한 에이전트 런타임으로 구성할 수 있습니다.

APIYI를 사용하면 DeepSeek Harness를 로컬에서 실행하고 APIYI의 OpenAI 호환 엔드포인트를 사용하여 모델을 구성하고, 개발 작업을 실행하며, 영구 세션을 유지할 수 있습니다.

<CardGroup cols={2}>
  <Card title="🧩 플러그인 기반 아키텍처" icon="puzzle">
    플러그인을 통해 모델, 도구, 세션, 워크플로를 구성하고 필요에 따라 에이전트를 확장합니다.
  </Card>

  <Card title="🌐 웹 UI" icon="globe">
    한 번의 명령으로 로컬 웹 UI를 시작하고 브라우저에서 모델, 작업 영역, 세션을 구성합니다.
  </Card>

  <Card title="⌨️ 헤드리스 CLI" icon="terminal">
    자동화 스크립트, 일괄 작업, 개발 워크플로를 위해 명령줄에서 일회성 작업을 제출합니다.
  </Card>

  <Card title="💾 영구 세션" icon="database">
    세션, 도구 호출, 작업 영역 상태를 유지하여 작업을 계속하고 실행 문제를 해결합니다.
  </Card>
</CardGroup>

<Info>
  **프로젝트 정보**: DeepSeek Harness는 MIT 라이선스에 따라 공개된 오픈 소스입니다. 프로젝트 저장소는 `github.com/deepseek-ai/deepseek-harness`입니다. 현재 개발자 프리뷰 단계이므로 향후 릴리스에는 호환성을 깨뜨리는 변경 사항이 포함될 수 있습니다.
</Info>

## 설치 및 시작

### npm으로 웹 UI 시작

Node.js를 설치한 후 다음을 실행합니다.

```bash theme={null}
npx @deepseek-ai/dsh web
```

서버가 시작되면 `http://127.0.0.1:3080`을 엽니다. 처음 실행할 때는 웹 UI의 모델 설정에서 APIYI를 구성합니다.

### 소스에서 실행

저장소 소스를 실행하거나 프로젝트에 기여하려면 다음을 실행합니다.

```bash theme={null}
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

### 헤드리스 CLI 사용

소스에서 빌드한 후 다음 명령으로 일회성 작업을 제출합니다.

```bash theme={null}
pnpm dsh --profile headless "Inspect the repository and explain the failing tests."
```

## APIYI 연결

DeepSeek 하네스는 네이티브 DeepSeek 경로와 `llm-pi-ai`을 기반으로 하는 멀티 프로바이더 경로를 지원합니다. 현재 구성에서는 `apiyi` 프로바이더, `openai-responses` 프로토콜 및 `https://api.apiyi.com/v1` 엔드포인트를 사용합니다. 기본 모델은 `deepseek-v4-pro-0813`입니다.

구성 파일은 `$DSH_HOME/settings.yaml`입니다. `DSH_HOME`이 설정되지 않은 경우 기본 Windows 위치는 일반적으로 `C:\Users\Administrator\.dsh\settings.yaml`입니다.

### 옵션 1: Web UI에서 구성(권장)

<Steps>
  <Step title="APIYI token 준비">
    APIYI 콘솔에서 token을 생성합니다. 실제 token을 프로젝트 파일, 셸 기록 또는 공개 로그에 커밋하지 마십시오.
  </Step>

  <Step title="모델 설정 열기">
    Web UI를 시작하고 **설정 → 모델**을 연 다음 **사용자 지정 프로바이더 추가**를 선택합니다.
  </Step>

  <Step title="프로바이더 세부 정보 입력">
    다음 값을 시작점으로 사용합니다.

    | 필드       | 권장 값                       |
    | -------- | -------------------------- |
    | 프로바이더 ID | `apiyi`                    |
    | 표시 이름    | `apiyi`                    |
    | 기본 URL   | `https://api.apiyi.com/v1` |
    | API 프로토콜 | `openai-responses`         |
    | 자격 증명 참조 | `APIYI_API_KEY`            |
    | 모델       | `deepseek-v4-pro-0813`     |

    현재 구성에서는 `deepseek-v4-pro-0813`을 기본 모델로 사용합니다. 또한 구성 파일에 다른 APIYI 모델도 유지하므로 모델을 전환할 때는 현재 APIYI 모델 목록을 사용합니다.
  </Step>

  <Step title="모델 저장 및 선택">
    프로바이더를 저장하고 모델 선택기에서 새로 추가한 모델을 선택한 다음 새 세션을 시작하여 연결을 테스트합니다.
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/UCR13itF_84Ifj9v/images/deepseek-harness-model-config.png?fit=max&auto=format&n=UCR13itF_84Ifj9v&q=85&s=283844b8bb9f276b3236661422af5be3" alt="DeepSeek 하네스 APIYI 사용자 지정 프로바이더 구성" width="655" height="526" data-path="images/deepseek-harness-model-config.png" />

<Tip>
  Web UI를 통해 키를 저장하면 DeepSeek 하네스는 해당 키를 로컬 자격 증명 저장소에 저장하고 페이지에는 마스킹된 설명자만 반환합니다. 구성 변경 사항은 다음 요청부터 적용되며 일반적으로 Web UI를 다시 시작할 필요가 없습니다.
</Tip>

### 옵션 2: settings.yaml 구성

파일 기반 구성을 사용하려면 `$DSH_HOME/settings.yaml`에 APIYI 프로바이더를 선언하고 환경 변수를 통해 token을 참조합니다.

```yaml theme={null}
llm-pi-ai:
  providers:
    apiyi:
      displayName: apiyi
      apiKeyEnv: APIYI_API_KEY
      api: openai-responses
      baseURL: https://api.apiyi.com/v1
      models:
        - id: deepseek-v4-pro-0813
```

macOS 또는 Linux:

```bash theme={null}
export APIYI_API_KEY=YOUR_API_KEY
```

Windows PowerShell:

```powershell theme={null}
$env:APIYI_API_KEY = "YOUR_API_KEY"
```

`apiKeyEnv`은 자격 증명 참조일 뿐입니다. 실제 token을 `settings.yaml`에 입력하지 마십시오. 다른 모델을 추가하려면 `models` 목록에 해당 모델 ID를 추가합니다.

## 일반적인 사용 패턴

### 로컬 웹 에이전트

브라우저 기반 웹 UI를 사용하여 코드 분석, 파일 정리, 테스트 디버깅 및 프로젝트 유지 관리를 수행합니다. 세션에 사용할 워크스페이스를 선택한 다음, 목표와 제약 조건을 자연어로 설명합니다.

<img src="https://mintcdn.com/apiyillc/UCR13itF_84Ifj9v/images/deepseek-harness-model-chat.png?fit=max&auto=format&n=UCR13itF_84Ifj9v&q=85&s=8e9ed8c8428b7a3fd8618db5c6ec5bbb" alt="DeepSeek 하네스 로컬 웹 에이전트 채팅 인터페이스" width="934" height="758" data-path="images/deepseek-harness-model-chat.png" />

### 자동화된 작업

헤드리스 프로필은 하나의 작업을 실행하고 최종 응답을 출력하므로 로컬 스크립트 및 자동화 워크플로에 적합합니다.

```bash theme={null}
pnpm dsh --profile headless "Review the changed files and summarize possible regressions."
```

### Python SDK

DeepSeek 하네스는 `deepseek-harness-sdk`를 제공하며, 이를 사용하면 런타임을 시작하고 Python에서 에이전트를 호출할 수 있습니다. 번들로 제공되는 Python 런타임은 기본적으로 `deepseek-official`를 사용하며, 현재 웹/헤드리스 구성에서 사용하는 `apiyi` 경로를 자동으로 상속하지 않는다는 점에 유의하십시오.

```bash theme={null}
python -m pip install deepseek-harness-sdk
```

```python theme={null}
from deepseek_harness import DeepSeekHarness

with DeepSeekHarness(
    provider="apiyi",
    model="deepseek-v4-pro-0813",
    cwd="/absolute/path/to/workspace",
    session_root="/absolute/path/to/sessions",
    cordis="/absolute/path/to/apiyi.cordis.yml",
) as harness:
    result = harness.run(
        "Inspect the repository and summarize the failing tests.",
        session_id="example-001",
    )

print(result.final_response)
```

위의 `apiyi` 경로를 사용하려면 사용자 지정 Cordis 컴포지션에서 `@deepseek-ai/dsh-llm-pi-ai`을 마운트하고, `apiKeyEnv: APIYI_API_KEY`, `api: openai-responses` 및 APIYI 모델 목록을 `settings.yaml` 또는 컴포지션 구성에서 제공해야 합니다.

Python SDK 가이드에는 번들로 제공되는 영속 터미널 컴포지션에 Linux x64, Linux arm64 및 arm64 기반 macOS 14 이상이 지원된다고 나와 있습니다. 해당 컴포지션은 Windows 에이전트를 지원하지 않습니다. Windows 사용자는 웹 UI 또는 CLI를 우선적으로 사용해야 합니다.

## 모델 선택

APIYI 모델은 지속적으로 업데이트됩니다. 운영 환경에 사용할 모델을 선택하기 전에 최신 모델 목록, 기능 및 사용 권장 사항을 확인하십시오.

<Card title="최신 모델 권장 사항 보기" icon="star" href="/ko/api-capabilities/model-info">
  현재 모델 권장 사항, 기능 비교 및 사용 지침을 검토하십시오. APIYI 모델 목록에서 현재 제공되는 모델 ID를 사용하십시오.
</Card>

## 모범 사례

* 각각의 독립적인 작업에는 별도의 세션 ID를 사용합니다. 동일한 대화와 영구 셸 상태를 계속 유지해야 하는 경우에만 기존 ID를 재사용합니다.
* Python SDK 예제는 쓰기 가능한 작업 공간과 `danger-full-access` 컴포지션을 사용합니다. 삭제 가능한 체크아웃 또는 컨테이너에서 실행합니다.
* `cordis.yml`, `settings.yaml`, 소스 코드 또는 커밋 로그에 API 키를 넣지 않습니다. 웹 UI 자격 증명 저장소 또는 환경 변수 참조를 우선 사용합니다.
* DeepSeek Harness는 개발자 프리뷰 단계입니다. 업그레이드하기 전에 플러그인 구성과 모델 라우팅이 계속 호환되는지 확인합니다.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="현재 구성에서는 어떤 프로바이더와 모델을 사용합니까?">
    현재 구성에서는 `apiyi` 프로바이더, `openai-responses` 프로토콜, `https://api.apiyi.com/v1` Base URL 및 기본 모델로 `deepseek-v4-pro-0813`을 사용합니다.
  </Accordion>

  <Accordion title="APIYI에는 어떤 Base URL과 프로토콜을 사용해야 합니까?">
    현재 구성에 맞게 `https://api.apiyi.com/v1`을 Base URL로, `openai-responses`을 프로토콜로 사용합니다. 엔드포인트 호환성을 확인하지 않은 상태에서는 프로토콜을 변경하지 마십시오.
  </Accordion>

  <Accordion title="모델 선택기에 내 모델이 표시되지 않는 이유는 무엇입니까?">
    프로바이더 ID가 비어 있지 않은 소문자 값인지, 모델 ID가 올바른지, 저장된 구성이 `llm-pi-ai` 프로바이더에 속하는지 확인합니다. 현재 기본값은 `deepseek-v4-pro-0813`이며, 사용자 지정 모델을 선택하려면 먼저 `models` 목록에 포함해야 합니다.
  </Accordion>

  <Accordion title="MISSING_CREDENTIAL을 해결하려면 어떻게 해야 합니까?">
    웹 UI에서 **설정 → 모델**로 돌아가 프로바이더의 자격 증명을 저장합니다. `settings.yaml`를 사용하는 경우 `APIYI_API_KEY`이 설정되어 있고 `apiKeyEnv`가 해당 환경 변수를 가리키는지 확인합니다.
  </Accordion>

  <Accordion title="모델 검색에서 401이 반환되면 어떻게 해야 합니까?">
    먼저 APIYI token과 Base URL을 확인합니다. DeepSeek 하네스는 OpenAI 호환 사용자 지정 프로바이더에서 모델 검색에 `GET /models`을 사용합니다. 엔드포인트에서 해당 경로를 제공하지 않는 경우 모델 ID를 수동으로 입력합니다.
  </Accordion>

  <Accordion title="Windows에서 Python SDK를 실행할 수 있습니까?">
    번들로 제공되는 영구 터미널 구성은 Windows 에이전트를 지원하지 않습니다. Windows 사용자는 웹 UI 또는 CLI를 사용할 수 있으며, Python SDK의 경우 프로젝트 문서에서 플랫폼 요구 사항을 따릅니다.
  </Accordion>

  <Accordion title="업그레이드로 구성이 손상되면 어떻게 해야 합니까?">
    프로젝트는 개발자 프리뷰 단계이므로 업그레이드에 호환성을 깨뜨리는 변경 사항이 포함될 수 있습니다. 최신 프로젝트 문서를 기준으로 프로바이더 구성, 모델 ID 및 플러그인 구성을 다시 확인합니다.
  </Accordion>
</AccordionGroup>

## 관련 리소스

<CardGroup cols={2}>
  <Card title="APIYI 빠른 시작" icon="book" href="/ko/getting-started">
    API 키를 발급하고 기본 URL 및 기본 API 사용법을 알아봅니다.
  </Card>

  <Card title="APIYI 모델 추천" icon="star" href="/ko/api-capabilities/model-info">
    현재 모델, 기능 및 사용 지침을 검토합니다.
  </Card>

  <Card title="DeepSeek Harness 리포지토리" icon="github">
    `github.com/deepseek-ai/deepseek-harness`
  </Card>

  <Card title="DeepSeek Harness 프로바이더 설정" icon="settings">
    프로바이더, 자격 증명 및 모델 구성에 대한 프로젝트 문서를 검토합니다.
  </Card>
</CardGroup>

## 도움말 받기

<CardGroup cols={2}>
  <Card title="기업용 WeChat 지원" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="기업용 WeChat 지원 QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    스캔하여 지원팀을 추가하거나 [지원팀에 직접 문의합니다](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    APIYI 구성, DeepSeek Harness 통합 및 사용 안내
  </Card>

  <Card title="이메일 지원" icon="mail">
    **지원**: [support@apiyi.com](mailto:support@apiyi.com)

    **비즈니스 문의**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>

<Tip>
  지원팀에 문의할 때는 제공업체, 모델 ID, 기본 URL, API 프로토콜, 오류 메시지, Node.js 버전, 사용 방식 및 관련 스크린샷을 포함해야 문제를 더 빠르게 진단할 수 있습니다.
</Tip>
