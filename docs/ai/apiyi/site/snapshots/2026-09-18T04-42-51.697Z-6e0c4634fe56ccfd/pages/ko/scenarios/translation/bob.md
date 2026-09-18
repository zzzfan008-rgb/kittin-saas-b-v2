> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Bob 번역기

> macOS 통합 가이드용 전문 번역 도구

Bob은 macOS용 उत्कृष्ट한 번역 소프트웨어로, 단어 선택 번역, 스크린샷 번역 등의 기능을 지원합니다. APIYI를 연동하면 AI 모델을 사용해 더 정확하고 자연스러운 번역 결과를 제공할 수 있습니다.

## 빠른 설정

### 1. Bob 설치

[Bob 공식 웹사이트](https://bobtranslate.com)에서 최신 버전을 다운로드하여 설치합니다.

### 2. APIYI 설정

1. Bob 설정을 엽니다(메뉴 바 아이콘 > 기본 설정)
2. “Services” 탭으로 전환합니다
3. OpenAI 번역 서비스를 추가합니다
4. 매개변수를 설정합니다:
   * **API 키**: APIYI 키
   * **API URL**: `https://api.apiyi.com`
   * **모델**: `gpt-3.5-turbo`

### 3. 설정 테스트

“Test” 버튼을 클릭하여 설정을 확인하고, 성공 메시지가 표시되면 저장합니다.

## 사용 방법

### 단어 선택 번역

1. 번역할 텍스트를 선택합니다
2. 단축키를 누릅니다(기본값 `⌥ + D`)
3. Bob이 번역 결과를 띄웁니다

### 스크린샷 번역

1. 스크린샷 단축키를 누릅니다(기본값 `⌥ + S`)
2. 번역할 영역을 선택합니다
3. Bob이 이미지 속 텍스트를 인식하고 번역합니다

### 입력 번역

1. Bob 창을 엽니다(기본값 `⌥ + Space`)
2. 번역할 텍스트를 입력하거나 붙여넣습니다
3. 대상 언어를 선택합니다
4. 번역 결과를 확인합니다

## 모델 선택

### 다양한 시나리오에 대한 권장 사항

| 사용 사례 | 권장 모델          | 기능         |
| ----- | -------------- | ---------- |
| 일상 번역 | gpt-3.5-turbo  | 빠르고 정확함    |
| 전문 문서 | gpt-4          | 용어가 더 정확함  |
| 긴 텍스트 | claude-3-haiku | 문맥 이해가 뛰어남 |
| 문학 작품 | claude-3-opus  | 문체가 더 우수함  |

### 다중 모델 구성

서로 다른 모델을 사용하여 여러 개의 번역 서비스를 구성할 수 있습니다:

1. 여러 OpenAI 번역 서비스를 추가합니다
2. 각 서비스에 대해 서로 다른 모델을 구성합니다
3. 번역할 때 사용할 서비스를 선택합니다

## 고급 설정

### 사용자 지정 프롬프트

번역 품질을 최적화하기 위한 프롬프트 템플릿입니다:

```text theme={null}
You are a professional translation expert proficient in multiple languages. Please translate the following {source_lang} text to {target_lang}.

Requirements:
1. Maintain original tone and style
2. Use idiomatic expressions
3. For technical terms, mark original text in parentheses after translation
4. Be mindful of cultural differences, adjust expressions appropriately

Original text: {text}
```

### 바로 가기 사용자 지정

설정 > 일반에서 사용자 지정합니다:

* **단어 선택 번역**: `⌥ + D`
* **스크린샷 번역**: `⌥ + S`
* **입력 번역**: `⌥ + Space`
* **표시/숨기기**: `⌥ + B`

### 번역 동작 설정

권장 구성입니다:

* **언어 자동 감지**: 활성화됨
* **번역 후 자동 복사**: 필요에 따라
* **원본 형식 유지**: 활성화됨
* **기록**: 활성화됨

## 사용 팁

### 1. 전문 분야 번역

특정 분야의 경우 프롬프트에서 다음과 같이 지정할 수 있습니다:

```text theme={null}
Please translate as a computer professional translator.
Preserve all technical terms in English, with Chinese explanations in parentheses.
```

### 2. 일괄 번역

대량의 텍스트를 번역할 때:

1. 입력 번역 모드를 사용합니다
2. 텍스트를 구간별로 붙여넣습니다
3. 기록을 사용하여 모든 번역을 확인합니다

### 3. 비교 읽기

외국어 자료를 읽을 때:

1. “원문 표시” 옵션을 활성화합니다
2. 단어 선택 번역을 사용하여 실시간으로 확인합니다
3. 학습을 위해 원문과 번역문을 비교합니다

### 4. 용어 관리

개인 용어 데이터베이스를 구축합니다:

1. 자주 쓰는 용어 번역을 북마크합니다
2. 특정 단어 번역을 사용자 지정합니다
3. 용어 데이터베이스 백업을 내보냅니다

## 일반적인 문제

### 번역 속도가 느림

**분석:**

* 네트워크 연결 문제
* 선택한 모델이 큼
* API 서비스가 혼잡함

**해결 방법:**

1. 네트워크 연결을 확인합니다
2. gpt-3.5-turbo 같은 빠른 모델을 사용합니다
3. 피크 시간대를 피합니다

### 번역이 부정확함

**개선 방법:**

1. 더 고급 모델(GPT-4 등)을 사용합니다
2. prompt를 최적화하고 더 많은 맥락을 제공합니다
3. 전문 콘텐츠의 경우 도메인을 지정합니다

### API 쿼터 소진

**대처 방법:**

1. APIYI 계정 잔액을 확인합니다
2. 비용을 통제하기 위해 다른 모델을 적절히 사용합니다
3. 일일 사용 한도를 설정합니다

## 모범 사례

### 1. 비용 관리

* 일상 번역에는 gpt-3.5-turbo를 사용합니다
* 중요한 문서에만 gpt-4를 사용합니다
* 사용 통계를 정기적으로 확인합니다

### 2. 번역 품질

* 충분한 맥락을 제공합니다
* 기술 용어를 사용할 때는 도메인을 지정합니다
* 중요한 내용은 교정합니다

### 3. 워크플로 최적화

* 자주 쓰는 언어 쌍을 설정합니다
* 도메인별 prompt를 사용자 지정합니다
* 기록과 즐겨찾기를 잘 활용합니다

### 4. 데이터 보안

* 민감한 정보가 포함된 텍스트는 번역하지 않습니다
* 번역 기록을 정기적으로 정리합니다
* API key를 안전하게 보관합니다

## 고급 기능

### URL Scheme 통합

Bob은 URL Scheme을 통해 다른 앱에 통합할 수 있습니다:

```bash theme={null}
# Translate text directly
bob://translate?text=Hello&from=en&to=zh

# Open Bob window
bob://open
```

### AppleScript 자동화

```applescript theme={null}
tell application "Bob"
    translate "Hello World" from "en" to "zh"
end tell
```

### 내보내기 기능

번역 기록을 정기적으로 내보내려면:

1. 기록으로 이동합니다
2. 시간 범위를 선택합니다
3. CSV 또는 JSON 형식으로 내보냅니다

## 다른 도구와의 통합

### Raycast 통합

Raycast 확장을 통해 Bob을 빠르게 호출합니다:

```javascript theme={null}
// Raycast script example
import { showToast, Toast } from "@raycast/api";
import { exec } from "child_process";

export default async function Command() {
  exec("open bob://translate", (error) => {
    if (error) {
      showToast(Toast.Style.Failure, "Failed to launch Bob");
    }
  });
}
```

### Alfred 워크플로

빠른 번역을 위한 Alfred 워크플로를 생성합니다:

1. 새 워크플로를 생성합니다
2. Keyword 트리거를 추가합니다
3. Run Script 액션을 연결합니다
4. Bob의 URL Scheme을 호출합니다

### PopClip 확장

텍스트를 선택한 뒤 바로 번역할 수 있도록 PopClip의 Bob 확장을 설치합니다.

## 문제 해결

### 서비스 사용 불가

확인 항목:

1. API key가 올바른지 확인합니다
2. 네트워크 연결이 정상인지 확인합니다
3. APIYI 서비스 상태를 확인합니다

### 단축키 충돌

해결 방법:

1. 시스템 환경설정에서 단축키 충돌을 확인합니다
2. Bob에 고유한 단축키 조합을 설정합니다
3. 충돌하는 앱 단축키를 비활성화합니다

### 권한 문제

Bob에 필요한 권한이 있는지 확인합니다:

* 손쉬운 사용 권한
* 화면 기록 권한(스크린샷 번역용)
* 키보드 입력 권한

## 성능 최적화

### 지연 시간 줄이기

1. 더 빠른 모델을 사용합니다
2. 로컬 캐싱을 사용합니다
3. 네트워크 설정을 최적화합니다

### 리소스 절약

1. 번역 기록 보관 기간을 적절히 설정합니다
2. 캐시를 정기적으로 정리합니다
3. 번역 서비스를 동시에 여러 개 실행하지 않습니다

### 사용 경험 개선

1. 팝업 표시 시간을 조정합니다
2. 인터페이스 테마를 사용자 지정합니다
3. 글꼴 크기와 스타일을 최적화합니다

추가 도움이 필요하십니까? [상세 통합 문서](/ko/scenarios/translation/bob)를 확인해 주십시오.
