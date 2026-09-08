> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Paper2Any - 논문 멀티모달 워크플로

> 커뮤니티 오픈소스 논문 변환 도구로, 학술 논문을 아키텍처 다이어그램, 기술 로드맵, PPT 프레젠테이션, 반박 자료 등으로 변환하며, APIYI를 통해 GPT, Claude 및 기타 LLMs로 구동됩니다.

## 개요

Paper2Any는 학술 논문을 위한 오픈 소스 멀티모달 워크플로 플랫폼입니다. 논문 PDF, 스크린샷 또는 텍스트를 모델 아키텍처 다이어그램, 기술 로드맵, 실험 그래프, PPT 프레젠테이션 등으로 한 번의 클릭으로 변환합니다.

<Info>
  **프로젝트 정보**

  * 🔗 소스 코드: `github.com/OpenDCAI/Paper2Any`
  * 📜 라이선스: 오픈 소스
  * 👤 조직: OpenDCAI
  * ⭐ 커뮤니티 기여, APIYI를 통해 여러 대규모 언어 모델을 지원합니다
</Info>

## Paper2Any를 사용하는 이유

<CardGroup cols={2}>
  <Card title="다양한 출력 형식" icon="layers">
    논문을 아키텍처 다이어그램, 로드맵, PPT, 반박문 등으로 변환합니다. 연구 워크플로 전체를 아우르는 하나의 도구입니다.
  </Card>

  <Card title="유연한 모델 선택" icon="sliders-horizontal">
    API 파라미터를 통해 GPT-4o, Claude Sonnet, Qwen-VL 등 사이를 동적으로 전환합니다. 하드코딩이 필요하지 않습니다.
  </Card>

  <Card title="CLI + 웹 이중 모드" icon="terminal">
    서로 다른 워크플로에 맞게 명령줄 스크립트와 웹 인터페이스를 모두 사용할 수 있습니다.
  </Card>

  <Card title="OpenAI 호환 API" icon="plug">
    OpenAI 호환 API 형식을 기본 지원합니다. APIYI의 Base URL만 설정하면 400개 이상의 모델에 접근할 수 있습니다.
  </Card>
</CardGroup>

## 핵심 모듈

| Module             | Description                        | Output Formats                  |
| ------------------ | ---------------------------------- | ------------------------------- |
| **Paper2Figure**   | 논문에서 과학적 시각화를 생성합니다                | 아키텍처 다이어그램, 로드맵(PPTX + SVG), 플롯 |
| **Paper2Diagram**  | 논문/텍스트/이미지로부터 흐름도를 생성합니다           | draw\.io / PNG / SVG            |
| **Paper2PPT**      | 논문을 프레젠테이션으로 변환합니다                 | PPTX(40장 이상의 슬라이드를 지원합니다)       |
| **Paper2Rebuttal** | 구조화된 반박 응답을 생성합니다                  | 증거 기반의 반박 문서                    |
| **PDF2PPT**        | 레이아웃을 보존하면서 PDF를 편집 가능한 PPT로 변환합니다 | PPTX                            |
| **Image2PPT**      | 이미지/스크린샷을 슬라이드로 변환합니다              | PPTX                            |
| **PPTPolish**      | AI 기반 레이아웃 최적화                     | PPTX                            |
| **Knowledge Base** | 파일 수집, 시맨틱 검색, KB 기반 생성            | 여러 형식                           |

## APIYI를 통해 LLM에 연결

Paper2Any는 OpenAI 호환 API 형식을 지원합니다. APIYI를 LLM 엔드포인트로 구성하면 GPT, Claude, Gemini, DeepSeek 및 400개 이상의 다른 모델을 사용할 수 있습니다.

### Docker 배포

<Steps>
  <Step title="1단계: APIYI API 키 받기">
    1. [APIYI 콘솔](https://api.apiyi.com)을 방문하여 등록/로그인합니다
    2. **Tokens** 섹션으로 이동합니다
    3. 새 API 키를 생성합니다
    4. 키를 복사합니다(`sk-`로 시작합니다)
  </Step>

  <Step title="2단계: 백엔드 복제 및 구성">
    저장소를 복제한 후, `fastapi_app/.env`를 편집하여 APIYI를 LLM 엔드포인트로 설정합니다:

    ```bash theme={null}
    # fastapi_app/.env
    DEFAULT_LLM_API_URL=https://api.apiyi.com/v1
    BACKEND_API_KEY=sk-your-apiyi-key
    ```

    선택적으로, 각 워크플로에 대한 기본 모델을 지정할 수 있습니다:

    ```bash theme={null}
    PAPER2PPT_DEFAULT_MODEL=gpt-4o
    PDF2PPT_DEFAULT_MODEL=gpt-4o
    ```
  </Step>

  <Step title="3단계: 프론트엔드 구성">
    웹 UI의 기본값을 APIYI로 설정하려면 `frontend-workflow/.env`를 편집합니다:

    ```bash theme={null}
    # frontend-workflow/.env
    VITE_DEFAULT_LLM_API_URL=https://api.apiyi.com/v1
    VITE_LLM_API_URLS=https://api.apiyi.com/v1
    ```
  </Step>

  <Step title="4단계: 실행">
    Docker Compose로 모든 것을 시작합니다:

    ```bash theme={null}
    docker compose up -d --build
    ```

    시작되면 프론트엔드를 열어 Paper2Any를 사용하기 시작합니다.
  </Step>
</Steps>

### CLI 사용

Paper2Any는 APIYI와 직접 연동할 수 있도록 `--api-url` 및 `--api-key` 매개변수를 사용하는 독립 실행형 CLI 스크립트를 제공합니다:

```bash theme={null}
# Paper to PPT
python script/run_paper2ppt_cli.py \
  --input paper.pdf \
  --api-url https://api.apiyi.com/v1 \
  --api-key sk-your-apiyi-key \
  --model gpt-4o

# Paper to Figure
python script/run_paper2figure_cli.py \
  --input paper.pdf \
  --api-url https://api.apiyi.com/v1 \
  --api-key sk-your-apiyi-key \
  --graph-type model_arch
```

<Tip>
  **모델 추천**: 논문을 PPT로 변환할 때는 긴 문서를 잘 이해하고 구조화된 출력을 잘 생성하는 GPT-4o 또는 Claude Sonnet 4.5를 권장합니다. 다이어그램 생성에는 Qwen-VL 같은 비전 모델도 시도해 볼 만합니다.
</Tip>

## 배포 옵션

| Method          | Requirements                               | Best For    |
| --------------- | ------------------------------------------ | ----------- |
| **Docker (권장)** | 프론트엔드와 백엔드를 한 번에 시작                        | 빠른 시작, 프로덕션 |
| **리눅스 네이티브**    | Python 3.11+, LaTeX, Inkscape, LibreOffice | 개발, 사용자 지정  |
| **Windows**     | Python 3.12, Inkscape                      | 로컬 사용       |

<Warning>
  GPU에 의존하는 PDF2PPT 및 Image2PPT 같은 기능은 별도의 SAM3 모델 서버가 필요합니다. GPU 배포 지침은 프로젝트 README를 참조하십시오.
</Warning>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="Paper2Any를 APIYI 모델에 어떻게 연결합니까?">
    환경 변수에서 `DEFAULT_LLM_API_URL`을 `https://api.apiyi.com/v1`로 설정하고 `BACKEND_API_KEY`을 APIYI 키로 설정하십시오. CLI 모드에서는 `--api-url` 및 `--api-key` 매개변수를 사용하십시오.
  </Accordion>

  <Accordion title="어떤 모델이 지원됩니까?">
    APIYI를 통해 GPT-4o, Claude Sonnet 4.5, Gemini, DeepSeek, Qwen 등을 포함한 400개 이상의 모델에 접근할 수 있습니다. 모델은 코드 변경 없이 웹 인터페이스에서 동적으로 전환할 수 있습니다.
  </Accordion>

  <Accordion title="Docker 시작에 실패합니까 — 무엇을 확인해야 합니까?">
    다음을 확인하십시오:

    1. Docker와 Docker Compose가 올바르게 설치되었는지
    2. `.env` 파일이 올바르게 구성되었는지
    3. 필요한 포트가 사용 중이 아닌지
    4. 자세한 오류 메시지는 `docker compose logs`를 확인하십시오
  </Accordion>

  <Accordion title="PPT 생성 오류 또는 내용이 불완전합니까?">
    * APIYI 계정에 충분한 잔액이 있는지 확인하십시오
    * 긴 논문인 경우 더 큰 컨텍스트 윈도우를 지원하는 모델을 사용하십시오(예: GPT-4o 128K)
    * 논문 PDF가 검색 가능한 텍스트인지 확인하십시오(스캔한 PDF는 결과가 좋지 않을 수 있습니다)
  </Accordion>

  <Accordion title="APIYI API key는 어떻게 받습니까?">
    [APIYI 콘솔](https://api.apiyi.com/token)을 방문하여 계정을 생성하고 Tokens 섹션에서 새 key를 생성하십시오. 신규 사용자는 무료 체험 크레딧을 받습니다.
  </Accordion>
</AccordionGroup>

## 관련 자료

<CardGroup cols={2}>
  <Card title="APIYI 모델 목록" icon="list" href="/ko/api-capabilities/model-info">
    APIYI에서 지원하는 400개 이상의 모델 전체 목록을 확인합니다
  </Card>

  <Card title="Base URL 설정" icon="settings" href="/ko/faq/base-url-config">
    다양한 도구에서 APIYI Base URL을 설정하는 방법을 알아봅니다
  </Card>

  <Card title="APIYI Token 관리" icon="key" href="https://api.apiyi.com/token">
    API 키를 관리하고 사용량과 잔액을 확인합니다
  </Card>

  <Card title="APIYI 과금" icon="banknote" href="https://api.apiyi.com/account/pricing">
    모델 과금과 충전 혜택을 확인합니다
  </Card>
</CardGroup>
