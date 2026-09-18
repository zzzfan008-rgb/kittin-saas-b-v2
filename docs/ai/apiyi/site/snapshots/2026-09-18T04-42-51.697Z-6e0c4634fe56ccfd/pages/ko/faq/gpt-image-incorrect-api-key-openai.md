> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 잘못된 API 키로 인해 GPT-Image용 Codex 통합 실패

> Codex가 OpenAI를 호출하는 gpt-image-2.5 코드를 작성하므로 APIYI 키가 거부됩니다. Skills, 모델 페이지의 prompt 또는 웹 이미지 도구를 사용하여 해결할 수 있습니다.

## 오류

```text theme={null}
Authentication failed
Incorrect API key provided: sk-xxxx****************************A6Af.
You can find your API key at https://platform.openai.com/account/api-keys.
(Request ID: req_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
```

<Info>
  **한 문장으로 요약하면**: 이 오류는 APIYI가 아니라 **OpenAI 자체 서버에서** 반환됩니다. 현재 코드가 `api.openai.com`을(를) 호출하고 있으므로 OpenAI가 APIYI 키를 거부합니다. **키는 정상입니다. 요청 주소가 잘못되었습니다.**
</Info>

## 요청이 APIYI에 도달하지 않았음을 확인하는 방법

다음 두 가지 징후 중 하나만 확인되어도 확실합니다.

| 징후                                                       | 의미                                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 오류에서 `platform.openai.com/account/api-keys`로 이동하라고 안내합니다 | 이는 OpenAI의 표준 `invalid_api_key` 텍스트입니다. APIYI 오류에서는 OpenAI 웹사이트로 이동하라는 안내가 표시되지 않습니다 |
| 요청 ID가 `req_`로 시작하는 32자 문자열입니다                           | OpenAI의 요청 ID 형식입니다. 요청이 도착하지 않았으므로 APIYI 로그에서는 이 ID를 찾을 수 없습니다                      |

<Note>
  특히 AI 코딩 어시스턴트에게 통합 코드를 작성해 달라고 요청할 때 흔히 발생합니다. Codex, Cursor, Claude Code 및 이와 유사한 도구는 모델 이름 `gpt-image-2.5`를 확인하고 공식 OpenAI SDK 패턴을 기본값으로 사용하며, `base_url`을 SDK 기본값인 `https://api.openai.com/v1`로 둡니다. 붙여 넣는 키는 APIYI의 키입니다. 두 값은 일치하지 않습니다.
</Note>

## 세 가지 해결 방법, 상황에 맞게 선택

<Tabs>
  <Tab title="① Codex / 코딩 에이전트를 사용하는 경우: 스킬 설치">
    가장 수고가 적은 방법은 에이전트가 코드를 작성하기 전에 APIYI를 “학습”하도록 하는 것입니다. 두 가지 수준의 스킬 팩을 사용할 수 있습니다.

    <Steps>
      <Step title="사이트 전체 스킬 팩(먼저 설치)">
        에이전트가 아래 명령을 실행하여 APIYI 스킬 팩을 설치하도록 하십시오. 실패하면 `https://docs.apiyi.com/skill.md`을 직접 읽도록 지시하십시오.

        ```bash theme={null}
        npx skills add https://docs.apiyi.com
        ```

        이 파일은 AI를 위해 작성되었으며, 베이스 URL, 인증, 모델 명명 규칙 및 일반적인 문제를 설명합니다. 설치가 완료되면 에이전트가 작성하는 코드는 자동으로 `base_url`을 `https://api.apiyi.com/v1`로 지정합니다.
      </Step>

      <Step title="전용 GPT-Image 스킬">
        [GPT-Image-2.5 / 2 시리즈 에이전트 스킬](/ko/api-capabilities/gpt-image-2/skills) 페이지에는 `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2`을 포함한 6개 모델을 지원하는 즉시 사용 가능한 스킬이 제공됩니다. 두 개의 파일과 하나의 스크립트로 구성되며, `--model`을 사용하여 모델을 전환합니다. 텍스트-이미지 변환, 다중 이미지 융합 및 인페인팅이 모두 포함되어 있습니다.

        이를 Codex, OpenClaw, Claude Code 또는 셸 명령을 실행할 수 있는 코딩 에이전트에 넣은 다음 “이미지 생성: …”이라고 말하기만 하면 됩니다. 직접 베이스 URL을 수정할 필요가 없습니다.
      </Step>
    </Steps>

    <Tip>
      다른 이미지 및 동영상 모델에도 각각 “에이전트 스킬” 페이지가 있으며, 해당 모델의 문서 폴더 아래에 정리되어 있습니다. 왼쪽 탐색 메뉴에서 모델을 찾고 “에이전트 스킬”이라는 이름의 하위 페이지를 확인하십시오.
    </Tip>
  </Tab>

  <Tab title="② 코더가 아닌 경우: AI에 프롬프트 전달">
    스킬이 무엇인지 배우고 싶지 않다면, 바로 사용할 수 있도록 작성된 **통합 프롬프트**를 Codex, Claude Code, Cursor 또는 모든 AI 어시스턴트에 복사하십시오.

    1. [GPT-Image-2.5 / 2 개요](/ko/api-capabilities/gpt-image-2/overview)를 엽니다.
    2. “AI 에이전트에게 통합을 맡기기” 섹션을 찾아 프롬프트의 복사 버튼을 클릭합니다.
    3. 그대로 AI 코딩 어시스턴트에 붙여 넣습니다.

    이 프롬프트에는 이미 `base_url`이 `https://api.apiyi.com/v1`으로 하드코딩되어 있고, `APIYI_API_KEY` 환경 변수에서 키를 읽으며, 시간 초과, base64 렌더링, 업로드 압축 및 품질 매개변수와 관련된 일반적인 문제를 미리 처리합니다. AI는 먼저 문서 페이지의 일반 텍스트 버전을 가져온 다음(모든 문서 URL 뒤에 `.md`를 추가), 프로젝트의 기술 스택에 맞는 코드를 작성합니다.

    <Note>
      GPT-Image뿐만 아니라 모든 이미지 및 동영상 모델 개요 페이지에 이와 같은 프롬프트가 포함되어 있습니다. 보다 일반적인 세 가지 경로(채팅 에이전트, CLI, 코딩 에이전트)는 [AI 개발자 키트](/ko/developer-kit)를 참조하십시오.
    </Note>
  </Tab>

  <Tab title="③ 통합이 필요 없는 경우: 웹에서 생성">
    이미지가 필요할 뿐 아직 자체 프로그램에서 사용할 필요가 없다면 코드를 모두 건너뛰십시오.

    1. APIYI 콘솔의 “Tokens” 페이지에서 키를 복사합니다.
    2. `imagen.apiyi.com`을 열고 키를 붙여 넣습니다.
    3. `gpt-image-2.5-flare`(텍스트-이미지 변환) 또는 `gpt-image-2.5-sunburst`(편집)을 선택하고 생성합니다.

    웹 도구는 동일한 키와 동일한 API를 사용하며, 동일한 계정 잔액에 과금됩니다. 나중에 앱에서 사용해야 할 때는 앞의 두 경로로 돌아오십시오.
  </Tab>
</Tabs>

## 직접 해결하기: 한 줄

Codex로 생성된 코드가 이미 있다면, 최소한으로 변경할 부분은 클라이언트에 `base_url`을 추가하는 것입니다. 나머지는 모두 그대로 두십시오.

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="sk-your-apiyi-key",
      base_url="https://api.apiyi.com/v1",  # ← add this line
  )

  result = client.images.generate(
      model="gpt-image-2.5-flare",
      prompt="A shiba inu wearing an astronaut helmet, cyberpunk style",
      size="1024x1024",
      quality="medium",
  )
  ```

  ```javascript Node.js theme={null}
  import OpenAI from "openai";

  const client = new OpenAI({
    apiKey: "sk-your-apiyi-key",
    baseURL: "https://api.apiyi.com/v1", // ← add this line
  });

  const result = await client.images.generate({
    model: "gpt-image-2.5-flare",
    prompt: "A shiba inu wearing an astronaut helmet, cyberpunk style",
    size: "1024x1024",
    quality: "medium",
  });
  ```

  ```bash 환경 변수 theme={null}
  # Override the SDK default without touching code
  export OPENAI_API_KEY="sk-your-apiyi-key"
  export OPENAI_BASE_URL="https://api.apiyi.com/v1"
  ```
</CodeGroup>

그런 다음 요청이 실제로 APIYI에 도달하는지 확인하십시오. 응답에 모델 목록이 표시되면 완료된 것입니다.

```bash theme={null}
curl https://api.apiyi.com/v1/models \
  -H "Authorization: Bearer sk-your-apiyi-key"
```

## 후속 질문

<AccordionGroup>
  <Accordion title="base_url을 변경했지만 여전히 같은 오류가 발생합니다. 이유가 무엇입니까?">
    다음 순서로 확인합니다.

    1. **여러 구성 위치**: Codex가 생성한 프로젝트는 `.env`, 구성 파일 및 클라이언트 생성자에서 URL을 설정하는 경우가 많습니다. 한 곳만 변경하면 나머지는 기본값으로 남습니다.
    2. **환경 변수 우선순위**: 시스템에 `OPENAI_BASE_URL`가 이미 다른 값으로 설정되어 있으면 코드에서 생략한 설정을 재정의합니다. 확인하려면 `echo $OPENAI_BASE_URL`을 실행합니다.
    3. **재시작하지 않음**: 실행 중인 프로세스가 여전히 이전 구성을 사용하고 있습니다.
    4. **철자**: `apiyi`이며, `apiyii` 또는 `apiyl`가 아닙니다.

    가장 간단한 증명은 오류 메시지 자체입니다. `platform.openai.com`가 계속 표시되는 한 요청은 여전히 OpenAI로 전송되고 있습니다.
  </Accordion>

  <Accordion title="Codex에서는 이미 APIYI로 전환했다고 하는데 오류가 바뀌지 않습니다.">
    정확한 오류와 이 페이지를 함께 전달합니다. 모든 문서 페이지의 오른쪽 상단에는 “페이지 복사” 버튼이 있습니다. 페이지 내용과 오류를 AI에 붙여 넣으면 적용되지 않은 구성이 무엇인지 정확히 파악할 수 있습니다. 이것이 가장 빠른 문제 해결 방법입니다.
  </Accordion>

  <Accordion title="요청이 APIYI에 도달한 후에도 키가 계속 거부되면 어떻게 합니까?">
    그때 키 자체를 확인하면 됩니다. 콘솔에서 “토큰” 페이지를 열고 키가 활성화되어 있는지, 잔액이 충분한지, 모델 허용 목록으로 인해 차단되지 않는지 확인합니다. 전체 확인 목록은 [내 API 키가 유효하지 않은 이유는 무엇입니까?](/ko/faq/invalid-api-key)에서 확인할 수 있습니다.
  </Accordion>

  <Accordion title="gpt-image-2.5에는 어떤 모델 이름을 사용해야 합니까?">
    텍스트-이미지 변환에는 `gpt-image-2.5-flare`, 편집 및 인페인팅에는 `gpt-image-2.5-sunburst`를 기본값으로 사용합니다. 두 모델은 가격과 매개변수가 동일합니다. 대량의 작업을 저렴한 비용으로 처리하려면 역방향 채널인 `gpt-image-2.5-all`을 사용합니다. [GPT-Image 시리즈 에이전트 스킬](/ko/api-capabilities/gpt-image-2/skills) 페이지의 비교 표에서 6개 모델을 모두 확인할 수 있습니다.
  </Accordion>
</AccordionGroup>

## 관련 항목

<CardGroup cols={2}>
  <Card title="API 키가 유효하지 않은 이유는 무엇입니까?" icon="key" href="/ko/faq/invalid-api-key">
    모든 언어의 예시와 함께 기본 URL과 키가 일치해야 하는 이유를 설명합니다.
  </Card>

  <Card title="기본 URL은 어떻게 구성합니까?" icon="link" href="/ko/faq/base-url-config">
    OpenAI는 /v1, Claude는 루트 도메인, Gemini는 /v1beta를 사용합니다.
  </Card>

  <Card title="원클릭 통합이 있습니까?" icon="plug" href="/ko/faq/one-click-integration">
    문서를 AI 코딩 어시스턴트에 전달하면 통합을 수행하도록 할 수 있습니다.
  </Card>

  <Card title="GPT-Image-2.5 / 2 개요" icon="sparkles" href="/ko/api-capabilities/gpt-image-2/overview">
    매개변수, 과금, 통합 prompt 및 일반적인 오류를 설명합니다.
  </Card>
</CardGroup>
