> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Updream을 APIYI에 연결하기

> Updream의 외부 모델 커넥터를 사용하여 AI 창작 작업에 APIYI 이미지 모델을 호출합니다

<Tip>
  Updream은 Bilibili 크리에이터, 전문 크리에이터 및 콘텐츠 팀을 위한 AI 동영상 제작 플랫폼입니다. 커넥터를 통해 외부 모델을 연결하면 Updream의 크리에이티브 워크플로에서 APIYI 이미지 모델을 호출할 수 있습니다.
</Tip>

## Updream이란 무엇입니까?

Updream은 에이전트 대화, 노드 기반 무한 캔버스, 스킬 라이브러리 및 멀티 모델 생성을 결합하여 아이디어와 스크립트부터 스토리보드, 에셋 및 동영상 제작까지의 워크플로를 지원합니다.

한 줄짜리 아이디어, 스토리 개요, 기존 스크립트 또는 참고 자료로 시작하여 에이전트를 사용해 창작 방향을 구체화할 수 있습니다. 계획을 확인한 후에는 스크립트, 스토리보드, 캐릭터, 장면, 소품 및 기타 창작 에셋을 계속 제작할 수 있습니다. 자주 사용하는 창작 방식은 스킬로 저장하여 프로젝트 전반에서 재사용할 수도 있습니다.

공식 사이트에서는 다음과 같은 핵심 기능을 설명합니다.

* **에이전트 지원 아이디어 구상**: 자연어 대화를 통해 창작 방향과 콘텐츠 계획을 구체화합니다.
* **스크립트 및 스토리보드 생성**: 아이디어를 스크립트, 스토리보드 표 및 샷 단위 에셋으로 변환합니다.
* **무한 캔버스 워크플로**: 노드를 사용하여 텍스트, 이미지, 동영상 및 기타 창작 에셋을 구성합니다.
* **스킬 라이브러리**: 프롬프트 최적화, 캐릭터 디자인 및 스타일 일관성 유지 방식을 재사용 가능한 스킬로 저장합니다.
* **멀티 모델 제작**: 각 작업에 적합한 이미지, 동영상 또는 기타 모델 기능을 선택합니다.

이 가이드에서는 Updream의 **외부 모델 커넥터**를 사용하여 APIYI의 OpenAI 호환 구성을 통해 이미지를 생성하는 방법을 보여줍니다. 스크린샷 예시에서는 `gpt-image-2`을 사용합니다. 정확한 모델 ID와 매개변수는 현재 APIYI 모델 문서를 확인하십시오.

## Updream을 APIYI에 연결하는 이유는 무엇입니까?

Updream을 APIYI에 연결하면 다음 작업을 수행할 수 있습니다.

* 하나의 API 키로 외부 모델을 구성할 수 있습니다.
* Updream에서 기본 URL, API 키 및 모델 ID를 직접 입력할 수 있습니다.
* 창작 작업에 따라 APIYI 모델 간에 전환할 수 있습니다.
* 생성된 이미지를 스토리보드, 캐릭터, 장면 또는 기타 창작 자산으로 재사용할 수 있습니다.
* Updream의 에이전트, 스킬 및 캔버스 워크플로를 유지할 수 있습니다.

## 시작하기 전에

다음을 준비합니다.

* Updream이 설치되어 있고 로그인되어 있어야 합니다.
* 유효한 APIYI API 키가 있어야 합니다.
* APIYI 계정에 사용 가능한 잔액이 있어야 합니다.
* 사용하려는 모델 ID가 있어야 합니다(예: `gpt-image-2`).

<Warning>
  API 키는 민감한 자격 증명입니다. 스크린샷, 문서 또는 공개 채팅에 실제 키를 게시하지 마십시오. 임시 키 또는 제한된 키를 사용하고 작업이 완료된 후 폐기하는 것이 좋습니다.
</Warning>

## 1단계: 외부 모델 커넥터 열기

1. Updream을 열고 왼쪽 사이드바에서 **스킬**을 선택합니다.
2. **스킬 마켓플레이스**를 엽니다.
3. **외부 모델 커넥터**를 검색합니다.
4. **외부 모델 커넥터** 결과를 선택합니다.
5. **지금 사용**을 클릭합니다.

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-skill-market.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=355bcaabca93495564c10abc477d82a4" alt="Updream 스킬 마켓플레이스의 외부 모델 커넥터" width="1579" height="766" data-path="images/updream-skill-market.png" />

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-skill-detail.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=ed70b83ecbc1d7f043adcc459aaeb546" alt="Updream 외부 모델 커넥터 세부 정보" width="1456" height="804" data-path="images/updream-skill-detail.png" />

세부 정보 페이지에는 텍스트 및 이미지 입력과 이미지, 동영상 및 텍스트 출력 옵션에 대한 지원이 표시됩니다. 이 가이드에서는 스크린샷으로 확인된 이미지 생성 흐름만 설명합니다.

## 2단계: 연결 프로토콜 선택

**연결** 단계에서 다음을 선택합니다.

> **OpenAI 호환 (권장)**

사용자 지정 응답에 APIYI 기본 URL과 API 키를 입력합니다. 스크린샷에 표시된 APIYI 기본 URL은 다음과 같습니다.

```text theme={null}
https://api.apiyi.com/v1
```

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-connection.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=066b622f4017d306ec63443122e7cbb5" alt="OpenAI 호환 프로토콜 선택" width="805" height="466" data-path="images/updream-connection.png" />

<Info>
  이 가이드에서는 스크린샷에 표시된 OpenAI 호환 구성을 사용합니다. Google GenAI, Gemini REST, Seedance 및 일반 JSON은 이 검증된 구성의 범위에 포함되지 않습니다. 요구 사항을 확인하지 않고 해당 프로토콜에 이 페이지의 매개변수를 재사용하지 마십시오.
</Info>

## 3단계: 작업 유형 선택

**작업** 단계에서 다음을 선택합니다.

> **이미지 생성(권장)**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-task.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=c3d9b5efe007777b45306d8a8da30479" alt="이미지 생성 작업 선택" width="806" height="462" data-path="images/updream-task.png" />

이 옵션은 프롬프트에서 직접 이미지를 생성합니다. 외부 모델 커넥터에는 이미지 편집, 텍스트 생성, 동영상 제출 및 작업 폴링 옵션도 표시됩니다. 이러한 작업에는 실제 모델, 프로토콜 및 엔드포인트에 따른 별도의 구성이 필요하며, 이 가이드에서는 동영상 작업에 이미지 설정을 재사용하지 않습니다.

## 4단계: 모델 제공 방법 선택

**모델** 단계에서 다음을 선택합니다.

> **인터페이스 ID로서의 모델 이름**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-model.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=8d0a577cd0eb88c74b283a691580fd9c" alt="모델 ID 옵션 선택" width="839" height="462" data-path="images/updream-model.png" />

이 옵션에는 모델의 실제 인터페이스 ID가 필요합니다. 스크린샷 예시에서는 다음을 사용합니다.

```text theme={null}
gpt-image-2
```

APIYI 모델 문서에서 정확한 모델 ID를 사용합니다. 표시 이름, 사용자 지정 별칭 또는 다른 플랫폼의 모델 이름을 입력하지 마십시오.

## 5단계: 매개변수 제공 방법 선택

**Parameters** 단계에서 다음을 선택합니다.

> **완전한 매개변수를 제공합니다(권장)**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-parameters.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=403ba71983675aa653c9a5f708d98044" alt="완전한 매개변수 옵션 선택" width="817" height="447" data-path="images/updream-parameters.png" />

이 옵션을 사용하면 다음 응답에서 이미지 prompt, 종횡비, 크기, 품질 및 이미지 개수를 제공합니다. Updream은 **저를 위해 prompt 최적화** 및 **일반적인 기본값 사용** 옵션도 제공하지만, 이러한 옵션은 이 가이드에서 스크린샷으로 확인된 경로에 포함되지 않습니다.

## 6단계: API 인증 정보 제공

**인증 정보** 단계에서 다음을 선택합니다.

> **지금 입력(권장)**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-credentials.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=9843e1ab900d327b7c7feace9dd5bc12" alt="지금 API 인증 정보를 제공하도록 선택" width="842" height="525" data-path="images/updream-credentials.png" />

그런 다음 Updream에서 요청하는 APIYI 기본 URL과 API 키를 제공합니다. 본인의 APIYI 키를 사용하고, 스크린샷에 표시된 샘플 값은 사용하지 마십시오.

## 7단계: 모델 이름 입력

**모델 이름** 단계에서 다음을 선택합니다:

> **지금 입력(권장)**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-model-name.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=c3fb10101ce86c1a8998a2d2e8330098" alt="모델 이름 입력" width="872" height="534" data-path="images/updream-model-name.png" />

사용하려는 모델 ID를 입력합니다:

```text theme={null}
gpt-image-2
```

모델을 전환하려면 이 값을 현재 APIYI에서 지원되는 다른 이미지 모델 ID로 바꾸고, 선택한 작업과 호환되는지 확인합니다.

## 8단계: 이미지 프롬프트 입력

**프롬프트** 단계에서 다음을 선택합니다.

> **원문 사용(권장)**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-prompt.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=32769dbb70cc23e32466328c6f136142" alt="원본 프롬프트 사용 선택" width="860" height="535" data-path="images/updream-prompt.png" />

그런 다음 다음과 같이 이미지 프롬프트를 입력합니다.

```text theme={null}
Wind blowing through a wheat field
```

Updream에서 피사체, 구도, 카메라, 조명, 시각적 제약 조건 등의 세부 정보를 추가하도록 하려면 대신 **최적화 허용**을 선택합니다. **원문 사용**을 선택하면 입력한 그대로 프롬프트가 제출됩니다.

## 9단계: 출력 매개변수 선택

**출력** 단계에서 다음을 선택합니다.

> **1:1 · 1K · 단일 (권장)**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-output.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=cc4352948846b67a69431fe804aed3f2" alt="이미지 출력 매개변수 선택" width="850" height="534" data-path="images/updream-output.png" />

스크린샷에는 다음 구성이 표시됩니다.

| 매개변수    | 설정     |
| ------- | ------ |
| 가로세로 비율 | 1:1    |
| 해상도     | 1K     |
| 이미지 수   | 이미지 1개 |
| 품질      | 중간 품질  |

Updream에는 `16:9 · 2K · Single`, `9:16 · 2K · Single` 및 **사용자 지정 전체 매개변수**도 표시됩니다. 사용 가능한 크기, 품질 및 개수는 선택한 모델에 따라 달라집니다. 모델 문서와 현재 인터페이스에서 사용할 수 있는 옵션을 따릅니다.

## 10단계: APIYI 구성 제출

이전 선택을 완료하면 Updream에서 지정된 형식으로 구성을 제출하라는 메시지가 표시됩니다. 스크린샷에는 다음 예시 형식이 표시되어 있습니다.

```text theme={null}
Base URL: https://api.apiyi.com/v1
API Key: YOUR_API_KEY
Model: gpt-image-2
Prompt: Wind blowing through a wheat field
```

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-submit-reference.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=be4bba305fc22f776216498ff601a2f3" alt="외부 모델 구성의 제출 형식 예시" width="865" height="630" data-path="images/updream-submit-reference.png" />

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-submit-example.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=ff8094bb573b32a8021091244755a5b5" alt="완성된 외부 모델 구성 예시" width="575" height="125" data-path="images/updream-submit-example.png" />

제출하기 전에 다음 사항을 확인합니다.

* 기본 URL이 `https://api.apiyi.com/v1`인지 확인합니다.
* API 키를 본인의 APIYI 키로 교체했는지 확인합니다.
* 모델 ID가 올바른지 확인합니다.
* prompt에 이미지 요구 사항이 모두 포함되어 있는지 확인합니다.
* 출력 크기, 품질 및 수량이 선택한 모델의 기능 범위 내에 있는지 확인합니다.

## 11단계: 생성된 결과 보기

제출 후 Updream에 생성된 결과가 표시됩니다. 스크린샷 예시는 다음과 같습니다.

* 모델: `gpt-image-2`
* 프롬프트: `Wind blowing through a wheat field`
* 형식: 1:1
* 해상도: 1024 × 1024
* 수량: 단일 이미지

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-task-complete.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=3a5996a5b0c90c1225194834c23a534a" alt="Updream에서 생성된 이미지 결과" width="514" height="489" data-path="images/updream-task-complete.png" />

생성된 이미지를 Updream의 창작 워크플로에서 참조 자료로 계속 사용할 수 있습니다. 특정 노드 또는 작업에 연결할 수 있는지는 해당 작업의 입력 유형과 선택한 모델의 기능에 따라 달라집니다.

## 최신 모델 추천 보기

<Card title="최신 모델 추천 보기" icon="star" href="/ko/api-capabilities/model-info">
  현재 모델 추천, 기능 비교 및 사용 안내를 확인할 수 있습니다. 목록은 지속적으로 업데이트됩니다.
</Card>

<Info>
  모델 ID와 인터페이스 매개변수는 시간이 지남에 따라 변경됩니다. 최신 ID, 이미지 크기, 품질 옵션 및 작업 제한은 APIYI 모델 추천과 선택한 모델의 문서를 확인하시기 바랍니다.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="어떤 기본 URL을 사용해야 합니까?">
    이 가이드에서 검증한 OpenAI 호환 흐름에는 `https://api.apiyi.com/v1`을 사용합니다. 다른 프로토콜은 서로 다른 주소와 매개변수를 사용하므로 이 구성과 함께 사용해서는 안 됩니다.
  </Accordion>

  <Accordion title="모델 이름에는 무엇을 입력해야 합니까?">
    APIYI 문서에 있는 정확한 모델 ID를 입력합니다. 예를 들어 스크린샷에 표시된 `gpt-image-2`을 사용할 수 있습니다. 모델 ID를 잘못 입력하면 모델을 찾을 수 없거나 요청 오류가 발생할 수 있습니다.
  </Accordion>

  <Accordion title="API 키를 영구적으로 구성해 둘 수 있습니까?">
    권장하지 않습니다. 가능한 경우 임시 키 또는 제한된 키를 사용하고, 작업이 완료된 후 사용하지 않는 자격 증명을 폐기하거나 삭제합니다.
  </Accordion>

  <Accordion title="이 정확한 구성으로 동영상을 생성할 수 있습니까?">
    가능하다고 가정해서는 안 됩니다. 외부 모델 커넥터 인터페이스에는 동영상 제출 및 작업 폴링 기능이 표시되지만, 동영상 작업에는 실제 모델, 프로토콜 및 매개변수에 따른 별도의 설정이 필요합니다. 이 가이드에서는 이미지 생성만 검증합니다.
  </Accordion>

  <Accordion title="작업에서 결과가 반환되지 않은 이유는 무엇입니까?">
    API 키가 유효한지, 기본 URL이 `https://api.apiyi.com/v1`인지, 모델 ID가 올바른지, 모델이 선택한 이미지 작업을 지원하는지, APIYI 계정의 잔액이 충분한지 확인합니다. 문제가 계속되면 Updream의 작업 메시지와 APIYI에서 반환한 오류를 모두 확인합니다.
  </Accordion>

  <Accordion title="결과가 prompt와 정확히 일치하지 않는 이유는 무엇입니까?">
    이미지 모델은 prompt를 해석하고 이를 바탕으로 생성합니다. 관련 없는 세부 정보를 제거하거나, 주제와 구도를 명확하게 지정하거나, prompt 앞부분에 중요한 요구 사항을 배치하거나, **최적화 허용**을 끄고 원본 prompt를 제출해 보십시오.
  </Accordion>
</AccordionGroup>

## 관련 리소스

<CardGroup cols={2}>
  <Card title="Updream 공식 웹사이트" icon="globe">
    `www.updream.cn`
  </Card>

  <Card title="APIYI 모델 권장 사항" icon="star" href="/ko/api-capabilities/model-info">
    현재 모델, 기능 및 사용 지침을 확인합니다.
  </Card>

  <Card title="APIYI API 키 관리" icon="key" href="/ko/faq/token-management">
    API 키를 확인하고 관리합니다.
  </Card>

  <Card title="APIYI API 문서" icon="book" href="/ko/getting-started">
    API 통합 및 API 호출에 대해 알아봅니다.
  </Card>
</CardGroup>
