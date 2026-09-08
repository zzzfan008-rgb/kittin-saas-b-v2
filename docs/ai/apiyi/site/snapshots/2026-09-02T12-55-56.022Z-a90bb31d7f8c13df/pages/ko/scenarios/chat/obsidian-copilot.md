> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Obsidian Copilot

> Obsidian의 Copilot 플러그인을 APIYI에 연결하여 개인 지식 베이스와 대화합니다

Obsidian Copilot은 깔끔하고 개인정보 보호 우선 설계를 갖춘 Obsidian용 오픈소스 AI 어시스턴트 플러그인입니다. 자체 API 키로 OpenAI 호환 모델 서비스를 연결하고, 맞춤형 prompt를 만들며, 전체 vault와 채팅하여 개인 지식 기반에서 답변과 인사이트를 얻을 수 있습니다.

APIYI를 통해 GPT, Claude, Gemini, DeepSeek 등 400개 이상의 주요 모델에 하나의 계정으로 Obsidian 안에서 접근할 수 있으며, 여러 플랫폼에 따로 가입할 필요가 없습니다.

## 핵심 기능

<CardGroup cols={2}>
  <Card title="Vault와 채팅" icon="messages-square">
    Vault QA 모드는 벡터 인덱싱을 통해 전체 Vault를 검색하여 개인 지식 베이스의 질문에 답변합니다
  </Card>

  <Card title="사용자 지정 프롬프트" icon="wand-sparkles">
    요약, 번역, 재작성을 위한 내장 명령어와 선택한 텍스트를 한 번의 클릭으로 처리하는 사용자 지정 프롬프트를 제공합니다
  </Card>

  <Card title="프라이버시 우선" icon="shield-check">
    오픈 소스 플러그인, 로컬 데이터 저장, API 키는 로컬 설정에만 보관됩니다
  </Card>

  <Card title="유연한 모델 접근" icon="plug">
    모든 OpenAI 호환 엔드포인트와 함께 작동하며 — APIYI를 통해 400개 이상의 모델 사이를 자유롭게 전환할 수 있습니다
  </Card>
</CardGroup>

## 빠른 시작

### 1단계: APIYI 키 받기

1. [APIYI 웹사이트](https://api.apiyi.com)를 열고 가입합니다(이미 계정이 있으면 로그인합니다)
2. 콘솔의 “Tokens” 페이지로 이동하여 새 API 키를 생성합니다
3. 나중에 사용할 수 있도록 키(`sk-...`로 시작합니다)를 복사합니다

### 2단계: Obsidian Copilot 플러그인 설치

<Steps>
  <Step title="Obsidian 설치">
    공식 사이트에서 Obsidian을 다운로드하여 설치합니다: `obsidian.md`
  </Step>

  <Step title="커뮤니티 플러그인 마켓 열기">
    Obsidian **설정 → 커뮤니티 플러그인**으로 이동한 뒤 “제한 모드”를 끄고 “탐색”을 클릭합니다
  </Step>

  <Step title="Copilot 설치 및 활성화">
    **Copilot**(Logan Yang 제작)을 검색한 다음 설치하고 활성화합니다
  </Step>
</Steps>

### 3단계: APIYI LLM 모델 설정

<Steps>
  <Step title="Copilot 설정 열기">
    **설정 → Copilot**으로 이동한 뒤 **Model** 탭으로 전환합니다
  </Step>

  <Step title="사용자 지정 모델 추가">
    채팅 모델 섹션에서 **사용자 지정 모델 추가**를 클릭하고 다음을 입력합니다:

    | 필드         | 값                                        |
    | ---------- | ---------------------------------------- |
    | **모델 이름**  | 모델 이름, 예: `gpt-5.2` 또는 `claude-sonnet-5` |
    | **제공자**    | \*\*서드파티 (openai-format)\*\*를 선택합니다      |
    | **기본 URL** | `https://api.apiyi.com/v1`               |
    | **API 키**  | APIYI 키(`sk-...`)                        |
  </Step>

  <Step title="검증 및 추가">
    **검증**을 클릭하여 연결을 테스트한 다음 **모델 추가**를 클릭하여 완료합니다
  </Step>
</Steps>

<Info>
  **설정 참고 사항**

  * Base URL에는 `/v1` 접미사가 포함되어야 합니다: `https://api.apiyi.com/v1`
  * 모델 이름은 APIYI가 지원하는 모델과 정확히 일치해야 합니다 — [모델 목록](https://api.apiyi.com/account/models)을 확인하십시오
  * 여러 모델을 추가한 뒤 채팅 패널에서 언제든지 전환할 수 있습니다
</Info>

### 4단계: 임베딩 모델 설정(Vault QA에 필요)

Vault QA(지식 베이스 Q\&A) 모드를 사용하려면 임베딩 모델도 필요합니다:

1. Copilot 설정의 **임베딩 모델** 섹션에서 **사용자 지정 모델 추가**를 클릭합니다
2. 임베딩 모델 이름을 입력합니다: `text-embedding-3-small`(비용 효율적) 또는 `text-embedding-3-large`(더 높은 정확도) 권장
3. 제공자로 \*\*서드파티 (openai-format)\*\*를 선택합니다
4. Base URL을 `https://api.apiyi.com/v1`로 설정하고 APIYI 키를 입력합니다
5. **모델 추가**를 클릭하여 완료합니다

### 5단계: 저장하고 시작하기

새로 추가한 모델을 기본값으로 선택한 다음 **저장하고 다시 불러오기**를 클릭합니다. 이제 다음을 할 수 있습니다:

* 왼쪽 사이드바에서 Copilot 아이콘을 클릭하여 채팅 패널을 엽니다
* **Chat** 모드에서 모델과 직접 대화합니다
* **Vault QA** 모드에서 전체 금고를 대상으로 질문합니다(첫 사용 시 인덱스 생성이 완료될 때까지 기다려야 합니다)

## 지원 모델

Obsidian Copilot은 APIYI를 통해 400개 이상의 주류 AI 모델을 지원하며, OpenAI, Claude, Gemini, DeepSeek 및 중국산 모델을 포함합니다.

<Card title="최신 모델 추천 보기" icon="star" href="/ko/api-capabilities/model-info">
  최신 모델 추천, 성능 비교, 사용 조언을 확인할 수 있습니다. 모델 목록은 지속적으로 업데이트되므로 항상 가장 최신이면서 가장 강력한 AI 모델을 사용할 수 있습니다.
</Card>

<Info>
  **여기에서는 왜 특정 모델을 나열하지 않습니까?**

  AI 모델은 매우 빠르게 발전합니다. 가장 정확한 추천을 제공하기 위해, 최신 모델 목록, 성능 데이터, 사용 조언을 [모델 추천 페이지](/ko/api-capabilities/model-info)에 유지합니다.
</Info>

<Tip>
  **상황별 추천**

  * **일상적인 노트 Q\&A**: 빠르고 비용이 낮은 경량 모델을 선택합니다
  * **장문 요약 / 심층 글쓰기**: 긴 컨텍스트 윈도우를 가진 플래그십 모델을 선택합니다
  * **Vault QA 임베딩**: `text-embedding-3-small`는 대부분의 지식베이스 시나리오를 포괄합니다
</Tip>

## 고급 기능

### 사용자 지정 명령 및 프롬프트

Copilot에서는 자주 사용하는 작업을 사용자 지정 명령으로 저장할 수 있습니다.

1. Copilot 설정에서 **Commands** 섹션을 엽니다
2. 사용자 지정 프롬프트를 만듭니다. 예: "선택한 내용을 주간 보고서로 다시 작성"
3. 편집기에서 텍스트를 선택한 다음 명령 팔레트(`Ctrl/Cmd + P`)를 통해 호출합니다

### 선택한 텍스트 작업

노트의 원하는 문단을 선택한 다음 기본 제공 명령을 직접 호출할 수 있습니다.

* **Summarize**: 선택한 내용을 한 번의 클릭으로 요약합니다
* **Translate**: 지정한 언어로 번역합니다
* **Simplify / Fix grammar**: 표현을 더 간단하게 하거나 문법을 수정합니다
* **Generate table of contents**: 목차를 만듭니다

### CORS 호환 모드

구성 후 채팅 요청이 실패하면 모델을 추가할 때 **CORS** 옵션을 활성화하십시오.

<Warning>
  CORS 모드를 활성화하면 Obsidian은 스트리밍 출력을 지원하지 않습니다 — 생성이 완료된 뒤에야 답변이 한 번에 표시됩니다. APIYI의 표준 엔드포인트는 일반적으로 이 옵션이 필요하지 않습니다. 요청이 실패할 때만 사용해 보십시오.
</Warning>

## 문제 해결

<AccordionGroup>
  <Accordion title="검증에 실패하거나 채팅에 응답이 없습니다">
    * 기본 URL이 `https://api.apiyi.com/v1`인지 확인합니다(`/v1` 포함)
    * API key가 추가 공백 없이 올바르게 복사되었는지 확인합니다
    * 계정 잔액이 충분한지 확인합니다
    * 그래도 실패하면 모델 설정에서 CORS 옵션을 활성화해 보십시오
  </Accordion>

  <Accordion title="모델을 찾을 수 없음 오류">
    * 모델 이름은 APIYI에서 지원하는 이름과 정확히 일치해야 합니다(대소문자 구분)
    * [모델 목록](https://api.apiyi.com/account/models)에서 정확한 모델 이름을 확인합니다
  </Accordion>

  <Accordion title="Vault QA가 작동하지 않거나 인덱싱이 실패합니다">
    * 별도의 임베딩 모델이 구성되어 있는지 확인합니다(LLM 모델은 임베딩 모델을 겸할 수 없습니다)
    * 큰 vault를 처음 인덱싱하는 데는 시간이 걸립니다. 잠시 기다려 주십시오
    * 임베딩 모델을 변경한 후 인덱스를 다시 생성합니다(강제 재인덱싱)
  </Accordion>

  <Accordion title="응답이 느립니다">
    * 더 빠른 경량 모델로 전환합니다
    * 대화 컨텍스트 길이를 줄입니다
    * Vault QA 모드에서는 검색된 청크 수를 줄입니다
  </Accordion>
</AccordionGroup>

## 팁

1. **작업을 모델 간에 나누기**: 여러 모델을 추가하고, 일상적인 Q\&A에는 경량 모델을 사용하며 심층 작성에는 플래그십 모델로 전환하여 비용을 절감합니다
2. **인덱스 범위 제한하기**: Copilot 설정에서 첨부 파일과 템플릿 폴더를 제외하여 임베딩 비용을 줄이고 검색 품질을 높입니다
3. **사용자 지정 prompt 활용하기**: 빈번한 작업(예: “회의 메모 정리”)을 명령으로 만들어 한 번만 설정하고 계속 재사용합니다
4. **인덱스를 정기적으로 다시 빌드하기**: 대규모 vault 변경 후 Force Re-index를 실행하여 Vault QA 검색이 정확하게 유지되도록 합니다

## 관련 자료

<CardGroup cols={2}>
  <Card title="모델 추천" icon="star" href="/ko/api-capabilities/model-info">
    최신 모델 목록과 시나리오별 추천을 확인하세요
  </Card>

  <Card title="시작하기" icon="rocket" href="/ko/getting-started">
    3분 만에 APIYI 계정을 등록하고 키를 생성하세요
  </Card>

  <Card title="기본 URL 설정" icon="circle-question-mark" href="/ko/faq/base-url-config">
    다양한 도구에서 API 엔드포인트를 올바르게 입력하는 방법을 알아보세요
  </Card>

  <Card title="Cherry Studio" icon="cherry" href="/ko/scenarios/chat/cherry-studio">
    또 하나의 강력한 데스크톱 AI 채팅 클라이언트입니다
  </Card>
</CardGroup>

<Info>
  Obsidian Copilot 오픈소스 저장소: `github.com/logancyang/obsidian-copilot`
</Info>
