> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 몰입형 번역

> 브라우저 이중 언어 읽기 확장 프로그램 통합 가이드

Immersive Translate는 웹 페이지의 이중언어 읽기를 지원하는 उत्कृष्ट한 브라우저 번역 확장 프로그램입니다. APIYI를 통합하면 강력한 AI 모델을 사용하여 더 정확하고 자연스러운 번역 결과를 얻을 수 있습니다.

## 빠른 설치

### 지원되는 브라우저

* Chrome / Edge / Brave
* Firefox
* Safari

### 설치 단계

1. 브라우저의 확장 스토어를 방문합니다
2. "Immersive Translate"를 검색합니다
3. 설치를 클릭하여 브라우저에 추가합니다

또는 [공식 웹사이트](https://immersive-translate.owenyoung.com/)를 방문하여 설치 링크를 확인할 수 있습니다.

## APIYI 구성

### 1. 설정 열기

브라우저 도구 모음에서 확장 프로그램 아이콘을 클릭한 뒤 "설정"을 선택합니다.

### 2. 번역 서비스 구성

1. 왼쪽 메뉴에서 "번역 서비스"를 선택합니다
2. "OpenAI" 서비스를 찾습니다
3. "Manage" 또는 "설정"을 클릭합니다
4. "Custom API Key"를 선택합니다

### 3. 구성 입력

* **APIKEY**: APIYI 키를 입력합니다
* **사용자 정의 API 인터페이스 주소**: `https://api.apiyi.com/v1/chat/completions`
* **사용자 정의 모델**: `gpt-3.5-turbo` (선택 사항)

## 핵심 기능

### 웹 페이지 번역

#### 자동 번역

1. 외국어 웹 페이지를 방문합니다
2. 확장 프로그램이 언어를 자동 감지합니다
3. 번역 버튼을 클릭하여 시작합니다

#### 수동 번역

1. 도구 모음에서 확장 프로그램 아이콘을 클릭합니다
2. “이 페이지 번역”을 선택합니다
3. 번역이 완료될 때까지 기다립니다

### 번역 모드

#### 이중 언어 읽기(권장)

* 원래 형식을 유지합니다
* 번역이 원문 아래에 표시됩니다
* 비교 학습에 편리합니다

#### 번역만

* 원문 텍스트를 완전히 대체합니다
* 빠르게 읽기에 적합합니다
* 언제든지 이중 언어로 다시 전환할 수 있습니다

### 단어 선택 번역

1. 번역할 텍스트를 선택합니다
2. 나타나는 번역 버튼을 클릭합니다
3. 팝업에서 번역을 확인합니다

## 고급 설정

### 사용자 지정 프롬프트

콘텐츠 유형별 프롬프트입니다:

#### 기술 문서

```text theme={null}
As a technical documentation translation expert, please:
1. Preserve all technical terms in original language
2. Provide Chinese explanations in parentheses
3. Maintain original format for code and commands
```

#### 학술 논문

```text theme={null}
As an academic translation expert, please:
1. Use academically standard expressions
2. Preserve citation formats
3. Accurately translate professional terminology
```

#### 문학 작품

```text theme={null}
As a literary translation expert, please:
1. Maintain literary beauty of original text
2. Be mindful of cultural background conversion
3. Preserve effect of rhetorical devices
```

### 번역 규칙

특정 웹사이트에 대한 번역 동작을 설정합니다:

1. “번역 규칙” 설정으로 들어갑니다
2. 웹사이트 도메인을 추가합니다
3. 동작을 선택합니다:
   * 항상 번역
   * 절대 번역하지 않음
   * 스마트 판단

### 스타일 사용자 지정

번역 표시 스타일을 사용자 지정합니다:

```css theme={null}
/* Translation font */
.immersive-translate-target {
    font-family: "Microsoft YaHei", sans-serif;
    font-size: 14px;
    color: #333;
}

/* Translation background */
.immersive-translate-target-wrapper {
    background-color: #f5f5f5;
    padding: 5px;
    margin: 5px 0;
    border-radius: 3px;
}
```

## 특별 기능

### PDF 번역

온라인 PDF 문서 번역을 지원합니다:

* PDF 형식 유지
* 이중 언어 읽기 지원
* 번역본 복사 가능

### 동영상 자막 번역

주요 동영상 웹사이트를 지원합니다:

* YouTube
* Netflix
* Bilibili

설정 방법:

1. “동영상 자막 번역”을 활성화합니다
2. 자막 표시 방식을 선택합니다
3. 자막 스타일을 조정합니다

### 전자책 번역

EPUB 전자책을 지원합니다:

1. EPUB 파일을 업로드합니다
2. 번역 설정을 선택합니다
3. 이중 언어 버전을 다운로드합니다

### 입력창 번역

웹 입력창에서 실시간 번역을 지원합니다:

1. 입력창에 텍스트를 입력합니다
2. 단축키를 눌러 번역을 실행합니다
3. 번역 제안을 확인합니다

## 키보드 단축키

일반 단축키(사용자 지정 가능):

| 기능         | 기본 단축키    |
| ---------- | --------- |
| 번역/원문 표시   | `Alt + T` |
| 번역 모드 전환   | `Alt + M` |
| 선택한 텍스트 번역 | `Alt + S` |
| 설정 열기      | `Alt + O` |

## 모델 선택 권장 사항

### 콘텐츠 유형별 선택

| 콘텐츠 유형  | 권장 모델           | 이유          |
| ------- | --------------- | ----------- |
| 뉴스 기사   | gpt-3.5-turbo   | 빠르고 정확함     |
| 기술 문서   | gpt-4           | 정확한 용어      |
| 학술 논문   | claude-3-opus   | 뛰어난 이해력     |
| 문학 작품   | claude-3-sonnet | 문학적 문체가 우수함 |
| 일상 웹페이지 | gpt-3.5-turbo   | 높은 비용 효율    |

### 성능과 품질의 균형

```javascript theme={null}
// Smart model selection example
const selectModel = (textLength, contentType) => {
  if (textLength < 500) {
    return 'gpt-3.5-turbo'; // Use fast model for short text
  } else if (contentType === 'technical') {
    return 'gpt-4'; // Use accurate model for technical content
  } else if (contentType === 'creative') {
    return 'claude-3-sonnet'; // Use literary model for creative content
  } else {
    return 'gpt-3.5-turbo'; // Default to economical model
  }
};
```

## 성능 최적화

### 캐시 설정

* 번역 캐시를 활성화합니다
* 캐시 지속 시간 설정: 24시간
* 캐시를 정기적으로 정리합니다

### 일괄 번역

* 배치 크기 조정: 5\~10개 문단
* 적절한 동시 실행 수 설정: 2\~3
* 긴 텍스트 처리 최적화

### 트리거 조건

* 최소 번역 길이: 10자
* 특정 요소 무시: 탐색 메뉴, 광고
* 지연 번역: 200ms

## 일반적인 문제

### 번역 실패

**가능한 원인:**

* 잘못된 API key
* 네트워크 연결 문제
* 특수한 페이지 구조

**해결 방법:**

1. API key를 확인합니다
2. 네트워크 연결을 확인합니다
3. 페이지를 새로고침해 봅니다
4. 브라우저 콘솔 오류를 확인합니다

### 번역 속도가 느림

**최적화 방법:**

1. 더 빠른 모델을 사용합니다
2. 번역당 텍스트 양을 줄입니다
3. 캐시 기능을 활성화합니다
4. 네트워크 지연 시간을 확인합니다

### 형식 혼동

**처리 방법:**

1. 다른 번역 모드를 시도합니다
2. 번역 표시 설정을 조정합니다
3. 특정 웹사이트에 대한 규칙을 사용자 지정합니다
4. 개발자에게 문제를 보고합니다

## 모범 사례

### 1. 읽기 경험 최적화

* 적절한 글꼴과 크기를 선택합니다
* 번역 색상 대비를 조정합니다
* 편안한 줄 간격을 설정합니다
* 눈 보호 모드를 사용합니다

### 2. 학습 보조

* 이중 언어 읽기 모드를 활성화합니다
* 어휘 조회를 위해 단어 선택 번역을 사용합니다
* 검토를 위해 번역 내용을 내보냅니다
* 메모와 주석을 추가합니다

### 3. 업무 효율성

* 자주 방문하는 웹사이트에 대한 규칙을 설정합니다
* 도메인별 prompt를 사용자 지정합니다
* 바로가기를 사용해 속도를 높입니다
* 문서를 일괄 처리합니다

### 4. 비용 관리

* 번역 모델을 합리적으로 선택합니다
* 번역 길이 제한을 설정합니다
* 캐시를 사용해 반복 번역을 줄입니다
* API 사용량을 모니터링합니다

## 고급 팁

### 사용자 지정 번역 스크립트

기능을 향상하기 위해 자바스크립트를 사용합니다:

```javascript theme={null}
// Auto-detect and translate specific content
if (document.querySelector('.article-content')) {
    window.immersiveTranslate.translate({
        selector: '.article-content',
        fromLang: 'auto',
        toLang: 'zh-CN'
    });
}
```

### 다른 도구와의 통합

다른 도구와 함께 사용합니다:

* **Readwise**: 번역한 하이라이트를 저장합니다
* **Notion**: 번역 노트를 내보냅니다
* **Anki**: 어휘 플래시카드를 만듭니다

### 개발자 모드

번역 개선에 참여합니다:

1. 디버그 모드를 활성화합니다
2. 번역 피드백을 제공합니다
3. 번역 코퍼스에 기여합니다
4. 오픈 소스 개발에 참여합니다

## 문제 해결 가이드

### 확장 프로그램이 로드되지 않음

1. 브라우저 버전 호환성을 확인합니다
2. 충돌하는 확장 프로그램을 비활성화합니다
3. 브라우저 캐시를 지웁니다
4. 확장 프로그램을 다시 설치합니다

### 번역 결과가 표시되지 않음

1. 웹페이지가 번역을 지원하는지 확인합니다
2. 번역 서비스가 올바르게 구성되었는지 확인합니다
3. 광고 차단기에 의해 차단되었는지 확인합니다
4. 다른 번역 서비스를 사용해 봅니다

### 메모리 사용량이 높음

1. 번역 캐시를 정기적으로 정리합니다
2. 동시에 번역하는 페이지 수를 줄입니다
3. 일괄 번역 설정을 조정합니다
4. 불필요한 탭을 닫습니다

더 많은 도움이 필요하신가요? [상세 통합 문서](/ko/scenarios/translation/immersive)를 확인해 주십시오.
