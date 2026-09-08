> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Make.com + Gemini 이미지 이해

> Make.com의 HTTP 요청 노드를 사용하여 APIYI의 Gemini 이미지 이해 API를 호출하고, 코드 없이 자동화된 이미지 분석, OCR, 멀티모달 워크플로를 구현합니다.

## 개요

Make.com(이전의 Integromat)은 강력한 노코드 자동화 플랫폼입니다. 기본 제공되는 \*\*HTTP request node (Make a request)\*\*를 사용하면 APIYI의 Gemini 네이티브 형식 API를 이미지 이해, 콘텐츠 분석 및 기타 멀티모달 자동화 워크플로에 직접 호출할 수 있으며, 코딩은 필요하지 않습니다.

<Info>
  **연동 정보**

  * 🔧 도구: Make.com (`make.com`)
  * 🔌 연동: HTTP request node (Make a request)
  * 🤖 모델: Gemini 시리즈 (APIYI Gemini 네이티브 형식 경유)
  * 📡 API 엔드포인트: `https://api.apiyi.com/v1beta/models/{model}:generateContent`
</Info>

## Make.com + APIYI를 선택해야 하는 이유

<CardGroup cols={2}>
  <Card title="코드 없는 통합" icon="wand-sparkles">
    시각적 드래그 앤 드롭 방식으로 HTTP 요청 노드를 구성하여 코딩 없이 AI 모델을 호출할 수 있습니다
  </Card>

  <Card title="자동화된 워크플로" icon="refresh-cw">
    Make.com 트리거와 조건 논리를 결합하여 완전한 이미지 처리 자동화를 구축할 수 있습니다
  </Card>

  <Card title="다중 모델 지원" icon="layers">
    APIYI는 400개 이상의 모델을 지원합니다 — 하나의 API 키로 Make.com에서 다양한 AI 기능을 전환할 수 있습니다
  </Card>

  <Card title="유연한 확장" icon="puzzle">
    Google Sheets, Slack, Email 등을 포함한 1000개 이상의 앱과 원활하게 연결할 수 있습니다
  </Card>
</CardGroup>

## 지원되는 APIYI 모델

| 모델명                    | 모델 ID                    | 사용 사례          | API 문서                                      |
| ---------------------- | ------------------------ | -------------- | ------------------------------------------- |
| Gemini 3.1 Pro Preview | `gemini-3.1-pro-preview` | 이미지 이해, 텍스트 생성 | [문서 보기](/ko/api-capabilities/gemini/native) |
| Gemini 3 Pro Preview   | `gemini-3-pro-preview`   | 이미지 이해, 이미지 생성 | [문서 보기](/ko/api-capabilities/gemini/native) |
| Gemini 3 Flash Preview | `gemini-3-flash-preview` | 이미지 이해(빠름)     | [문서 보기](/ko/api-capabilities/gemini/native) |

<Tip>
  권장: 가장 강력한 이미지 이해 기능에는 `gemini-3.1-pro-preview`를 사용하십시오. 더 빠른 속도가 필요하면 Flash 시리즈를 선택하십시오.
</Tip>

## 설정 단계

<Steps>
  <Step title="1단계: APIYI API 키 받기">
    1. [APIYI 콘솔](https://api.apiyi.com)에 방문하여 등록/로그인합니다
    2. **토큰** 섹션으로 이동하여 새 API 키를 생성합니다
    3. 키를 복사합니다(`sk-`로 시작합니다). 구성에 필요합니다
  </Step>

  <Step title="2단계: Make.com 시나리오 만들기">
    1. Make.com에 로그인하고 **새 시나리오 만들기**를 클릭합니다
    2. \*\*+\*\*를 클릭하여 모듈을 추가합니다
    3. 검색하여 **HTTP** 모듈을 선택합니다
    4. 작업에서 **요청 만들기**를 선택합니다
  </Step>

  <Step title="3단계: HTTP 요청 노드 구성">
    HTTP 요청 노드에 다음 구성을 입력합니다:

    **URL**:

    ```
    https://api.apiyi.com/v1beta/models/gemini-3.1-pro-preview:generateContent
    ```

    **메서드**: `POST`

    **헤더**:

    | 헤더 이름           | 값                          |
    | --------------- | -------------------------- |
    | `Content-Type`  | `application/json`         |
    | `Authorization` | `Bearer sk-your-APIYI-key` |

    **본문 유형**: `Raw`

    **콘텐츠 유형**: `JSON (application/json)`

    **요청 내용(본문)**:

    ```json theme={null}
    {
      "contents": [
        {
          "parts": [
            {
              "text": "What is in this image?"
            },
            {
              "fileData": {
                "mimeType": "image/png",
                "fileUri": "https://your-image-url-here"
              }
            }
          ]
        }
      ]
    }
    ```
  </Step>

  <Step title="4단계: 테스트 실행">
    **한 번 실행**을 클릭하여 요청을 테스트하고 올바른 이미지 이해 결과가 반환되는지 확인합니다
  </Step>
</Steps>

## 전체 요청 예시

수달 이미지를 분석하는 전체 이미지 이해 요청 예시입니다:

```json theme={null}
{
  "contents": [
    {
      "parts": [
        {
          "text": "What is in this image?"
        },
        {
          "fileData": {
            "mimeType": "image/png",
            "fileUri": "https://raw.githubusercontent.com/apiyi-api/ai-api-code-samples/refs/heads/main/Vision-API-OpenAI/otter.png"
          }
        }
      ]
    }
  ]
}
```

### 요청 매개변수

| 필드                          | 유형     | 필수 여부 | 설명                                                 |
| --------------------------- | ------ | ----- | -------------------------------------------------- |
| `contents`                  | array  | 예     | 대화 내용 배열                                           |
| `contents[].parts`          | array  | 예     | 메시지 부분(텍스트 + 이미지)                                  |
| `parts[].text`              | string | 예     | 사용자의 텍스트 prompt                                    |
| `parts[].fileData.mimeType` | string | 예     | 이미지 형식: `image/png`, `image/jpeg`, `image/webp`, 등 |
| `parts[].fileData.fileUri`  | string | 예     | 공개적으로 접근 가능한 이미지 URL                               |

<Warning>
  `fileUri`은 공개적으로 접근 가능한 이미지 URL이어야 합니다. 이미지에 인증이 필요하면 먼저 공개 저장소 서비스에 업로드하십시오.
</Warning>

## 실용적 시나리오

### 시나리오 1: 이메일 첨부 이미지 자동 분석

1. **트리거**: Gmail - Watch emails(새 이메일을 모니터링합니다)
2. **프로세스**: HTTP node가 Gemini 이미지 이해를 호출합니다
3. **출력**: 분석 결과를 Google Sheets에 기록하거나 Slack으로 전송합니다

### 시나리오 2: 이커머스 제품 이미지 자동 태깅

1. **트리거**: Google Drive - Watch files(새로 업로드된 이미지를 모니터링합니다)
2. **프로세스**: HTTP node가 제품 이미지 콘텐츠를 분석합니다
3. **출력**: 제품 이미지에 카테고리 태그를 자동으로 추가합니다

### 시나리오 3: 소셜 미디어 콘텐츠 모더레이션

1. **트리거**: 사용자 제출 이미지를 주기적으로 가져옵니다
2. **프로세스**: HTTP node가 준수 여부를 위해 이미지 콘텐츠를 분석합니다
3. **출력**: 준수하지 않는 콘텐츠를 자동으로 표시하여 검토합니다

## 고급 팁

### 동적 이미지 URL 대체

Make.com에서는 상위 모듈의 출력 변수를 사용하여 배치 이미지 분석을 위해 `fileUri`를 동적으로 대체할 수 있습니다:

```json theme={null}
{
  "contents": [
    {
      "parts": [
        {
          "text": "Please describe this image and extract any text in it"
        },
        {
          "fileData": {
            "mimeType": "image/png",
            "fileUri": "{{upstream module's image URL variable}}"
          }
        }
      ]
    }
  ]
}
```

### 모델 전환

URL에서 모델 이름만 변경하면 모델을 전환할 수 있습니다:

| 필요        | URL                                                                          |
| --------- | ---------------------------------------------------------------------------- |
| 가장 강력한 이해 | `https://api.apiyi.com/v1beta/models/gemini-3.1-pro-preview:generateContent` |
| 고속 분석     | `https://api.apiyi.com/v1beta/models/gemini-3-flash-preview:generateContent` |

## FAQ

<AccordionGroup>
  <Accordion title="HTTP 요청이 401 오류를 반환합니까?">
    다음을 확인하십시오:

    1. Authorization 헤더 형식: `Bearer sk-your-key` (Bearer 뒤에 공백이 있어야 합니다)
    2. API key가 유효한지(APIYI 콘솔에서 확인)
    3. 계정 잔액이 충분한지
  </Accordion>

  <Accordion title="이미지가 인식되지 않거나 오류를 반환합니까?">
    다음을 확인하십시오:

    1. `fileUri`이 공개적으로 접근 가능한 URL인지(브라우저에서 직접 열 수 있어야 함)
    2. `mimeType`이 실제 이미지 형식과 일치하는지
    3. 이미지 크기가 모델 제한 내인지
  </Accordion>

  <Accordion title="Make.com에서 응답을 어떻게 처리합니까?">
    Gemini API는 JSON 형식으로 반환합니다. 다음과 같이 할 수 있습니다:

    1. Make.com의 **JSON** 모듈을 사용해 응답을 파싱합니다
    2. 분석 결과를 위해 `candidates[0].content.parts[0].text` 필드를 추출합니다
    3. 결과를 하위 모듈로 전달합니다(예: 데이터베이스에 기록, 알림 전송)
  </Accordion>

  <Accordion title="APIYI API key는 어떻게 얻습니까?">
    [APIYI 콘솔](https://api.apiyi.com/token)을 방문하여 계정을 등록하고 Tokens 섹션에서 새 key를 생성하십시오. 새 사용자는 무료 테스트 크레딧을 받습니다.
  </Accordion>

  <Accordion title="Base64로 인코딩된 이미지를 지원합니까?">
    예. `fileData`을 `inlineData`로 바꾸십시오:

    ```json theme={null}
    {
      "inlineData": {
        "mimeType": "image/png",
        "data": "Base64-encoded-image-data"
      }
    }
    ```
  </Accordion>
</AccordionGroup>

## 관련 자료

<CardGroup cols={2}>
  <Card title="Gemini 네이티브 형식 문서" icon="book" href="/ko/api-capabilities/gemini/native">
    Gemini 네이티브 API 형식 문서 전체 보기
  </Card>

  <Card title="이미지 이해 API" icon="eye" href="/ko/api-capabilities/vision-understanding">
    APIYI 이미지 이해 기능 개요 보기
  </Card>

  <Card title="자주 묻는 질문" icon="circle-question-mark" href="/ko/faq/model-selection-guide">
    FAQ 섹션에서 추가 도움 받기
  </Card>

  <Card title="APIYI token 관리" icon="settings" href="https://api.apiyi.com/token">
    API 키를 관리하고 사용량과 잔액을 확인합니다
  </Card>
</CardGroup>
