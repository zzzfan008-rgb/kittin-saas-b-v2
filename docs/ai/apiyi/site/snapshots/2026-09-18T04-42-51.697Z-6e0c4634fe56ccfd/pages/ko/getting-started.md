> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 빠른 시작

> APIYI를 통합하는 두 가지 방법이 있습니다. 문서를 AI 코딩 에이전트에 넘겨 작업을 맡기거나, 직접 세 단계로 연결할 수 있습니다.

<Note>
  새 계정에는 체험 크레딧 **\$0.05**가 제공되므로, 충전하지 않고도 아래의 첫 호출을 할 수 있습니다. `gpt-5.4-mini`와 같은 경량 모델이면 통합이 제대로 작동하는지 확인하기에 충분합니다.
</Note>

## 두 가지 경로, 하나를 선택하십시오

<CardGroup cols={2}>
  <Card title="AI에게 맡기기" icon="bot" href="#let-an-ai-do-it">
    하나의 prompt를 Codex, Claude Code 또는 Cursor에 복사합니다. 문서를 읽고, 코드를 작성하고, 실행합니다. 이미 코딩 에이전트와 함께 작업하고 있다면 가장 적합합니다.
  </Card>

  <Card title="직접 해보기" icon="wrench" href="#do-it-yourself">
    등록하고, key를 만들고, 첫 API 호출을 수행합니다. 세 단계, 5분입니다. 각 부분을 이해하고 싶다면 가장 적합합니다.
  </Card>
</CardGroup>

<Info>
  **두 경로는 모두 같은 방식으로 시작합니다**: 계정을 등록하고 key를 직접 생성합니다. AI가 대신할 수 있는 것은 그 이후의 모든 것입니다 — 모델을 선택하고, base URL을 올바르게 설정하고, 예제를 작성하고, 디버깅하는 일입니다.
</Info>

## AI에게 맡기기

### 에이전트에 이 프롬프트 보내기

<Prompt description="코딩 에이전트가 APIYI를 직접 통합하도록 합니다. Codex, Claude Code, Cursor 및 유사한 도구에 복사하여 붙여 넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에 APIYI를 통합하십시오.

  1. 먼저 통합 지식을 로드합니다. `npx skills add https://docs.apiyi.com`를 실행하여 APIYI 스킬을 설치하십시오. 해당 명령이 작동하지 않으면 [https://docs.apiyi.com/skill.md를](https://docs.apiyi.com/skill.md를) 전체적으로 가져와 읽으십시오. 동일한 내용입니다.
  2. 더 구체적인 내용이 필요하면 [https://docs.apiyi.com/llms.txt에서](https://docs.apiyi.com/llms.txt에서) 페이지를 찾으십시오. 모든 문서 URL에 `.md`를 추가하면 일반 Markdown 버전을 가져올 수 있으며, HTML을 스크래핑하는 것보다 훨씬 적은 tokens를 사용합니다.
  3. API 키를 요청하십시오. (제가 [https://api.apiyi.com/token에서](https://api.apiyi.com/token에서) 복사하겠습니다.) 그리고 해당 키를 `APIYI_API_KEY` 환경 변수에 넣으십시오. **하드코딩하지 말고 git에 커밋하지 마십시오.**
  4. 이 프로젝트에서 기존에 사용하는 스택으로 최소한의 실행 가능한 예제를 작성하고, 모델 `gpt-5.4-mini`부터 시작하십시오. 기본 URL은 SDK에 따라 다릅니다. OpenAI SDK는 `https://api.apiyi.com/v1`를 사용하고, Anthropic SDK는 /v1이 없는 루트 도메인 `https://api.apiyi.com`를 사용하며, Google GenAI SDK는 루트 도메인을 사용하고 api\_version을 v1beta로 설정합니다.
  5. 실제로 실행하고 응답을 보여 주십시오. 작동하면 호출 비용과 실제 사용 시 어떤 모델로 전환할지 알려 주십시오.
</Prompt>

### 수행할 작업

<Steps>
  <Step title="스킬을 설치하거나 skill.md를 직접 읽습니다">
    `https://docs.apiyi.com/skill.md`는 기계를 위해 작성된 통합 참조 문서로, 엔드포인트, 인증, 모델 명명 규칙, 알려진 문제 및 검증 체크리스트를 담고 있습니다. 이를 읽으면 에이전트가 APIYI를 통합하는 데 필요한 모든 정보를 얻을 수 있습니다.
  </Step>

  <Step title="필요한 페이지를 찾아봅니다">
    `llms.txt`는 이 사이트의 모든 페이지에 대한 색인입니다. 에이전트는 관련 페이지를 선택하고 `.md`를 추가하여 일반 텍스트로 읽습니다.
  </Step>

  <Step title="코드를 작성하고 실제로 실행합니다">
    문서의 Python 코드를 그대로 복사하는 대신, 프로젝트에서 기존에 사용하는 언어와 종속성으로 예제를 작성합니다. 호출이 성공하기 전에는 작업이 완료된 것으로 간주하지 않습니다.
  </Step>
</Steps>

### AI에 제공할 수 있는 다섯 가지 진입점

| 진입점            | URL                                          | 사용 시점                                                             |
| -------------- | -------------------------------------------- | ----------------------------------------------------------------- |
| **스킬**         | `https://docs.apiyi.com/skill.md`            | 완전한 통합 참조 문서를 한 번에 에이전트에 제공할 때 사용합니다. 여기서 시작하십시오.                 |
| **페이지 색인**     | `https://docs.apiyi.com/llms.txt`            | 에이전트가 필요한 페이지를 직접 선택하도록 할 때 사용합니다.                                |
| **단일 페이지 텍스트** | 모든 문서 URL에 `.md` 추가                          | 한 페이지만 필요할 때 사용합니다. HTML보다 저렴합니다.                                 |
| **MCP 서버**     | `https://docs.apiyi.com/mcp`                 | 에이전트가 이 문서 사이트를 실시간으로 검색할 수 있도록 MCP 서버로 연결합니다.                    |
| **모델 레지스트리**   | `https://docs.apiyi.com/model-registry.json` | 기계가 읽을 수 있는 모델 ID, 엔드포인트, 그룹 및 목록 가격을 제공하므로 에이전트가 더 이상 추측하지 않습니다. |

코딩 에이전트를 위한 스킬, CLI 및 계약+레지스트리 경로는 모두 [AI 개발자 키트](/ko/developer-kit)에 설명되어 있습니다.

<Tip>
  예를 들어 이 페이지의 일반 텍스트 버전은 `https://docs.apiyi.com/en/getting-started.md`입니다. 사이트의 모든 페이지에서 이 접미사를 지원합니다.
</Tip>

### 모든 페이지를 AI에 바로 보내기

모든 문서 페이지의 오른쪽 상단에는 **페이지 복사** 버튼이 있습니다. 버튼 옆의 화살표를 열면 더 많은 옵션이 표시됩니다.

<img src="https://mintcdn.com/apiyillc/pSJvB-WdRHZF62ww/images/contextual-menu-copy-page.png?fit=max&auto=format&n=pSJvB-WdRHZF62ww&q=85&s=34ae33d4f4555c0b9436364f12bab88b" alt="문서 페이지 오른쪽 상단의 페이지 복사 메뉴입니다. 페이지 복사, Markdown으로 보기, ChatGPT, Claude, Perplexity 또는 Google AI Studio에서 열기 옵션이 표시됩니다" width="648" height="694" data-path="images/contextual-menu-copy-page.png" />

| 옵션                        | 기능                                                       |
| ------------------------- | -------------------------------------------------------- |
| **페이지 복사**                | 현재 페이지를 Markdown으로 클립보드에 복사하여 모든 AI에 바로 붙여 넣을 수 있도록 합니다. |
| **Markdown으로 보기**         | 브라우저에서 일반 텍스트 버전을 엽니다. 링크를 확인하거나 공유할 때 편리합니다.            |
| **ChatGPT에서 열기**          | 이 페이지를 컨텍스트로 전달하면서 ChatGPT로 이동합니다.                       |
| **Claude에서 열기**           | Claude에서도 동일하게 작동합니다.                                    |
| **Perplexity에서 열기**       | Perplexity에서도 동일하게 작동합니다.                                |
| **Google AI Studio에서 열기** | Google AI Studio에서도 동일하게 작동합니다.                          |

특정 모델에서 문제가 발생하면 가장 빠른 방법은 해당 모델의 페이지를 열고 **페이지 복사**를 누른 다음, 오류와 함께 AI에 보내는 것입니다.

## 직접 해보십시오

### 1단계: 가입하고 키를 받기

<Steps>
  <Step title="계정을 만드십시오">
    [APIYI 웹사이트](https://api.apiyi.com)로 이동하여 이메일로 가입하고 인증한 뒤(대학교 또는 회사 이메일 주소를 권장합니다), 콘솔에 로그인합니다.
  </Step>

  <Step title="API 키를 만드십시오">
    [token 페이지](https://api.apiyi.com/token)를 엽니다.

    1. **기본 token**을 복사하여 바로 사용할 수 있습니다(오른쪽의 복사 아이콘)
    2. 또는 오른쪽 상단의 **새로 만들기**를 클릭하여 새로 만들고, 이름을 지정한 뒤(예: `test-key`), 확인합니다

    키는 `sk-`로 시작합니다. 자세한 내용은 [키를 만드는 방법](/ko/faq/token-management)을 참조하십시오.
  </Step>

  <Step title="잔액이 더 필요할 때 충전하기">
    \$0.05 체험 크레딧이 소진되면 콘솔에서 충전하십시오. 최소 금액과 정산 규칙은 결제 채널에 따라 다릅니다. 자세한 내용은 [결제 방법](/ko/faq/payment-methods)을 참조하시고, 보너스 정책은 [충전 프로모션](/ko/faq/recharge-promotions)에서 확인하십시오.
  </Step>
</Steps>

### 2단계: 연결 정보를 올바르게 설정하기

**SDK에 따라 base URL을 선택하고, 모델에 따라 선택하지 마십시오.** 이것이 가장 흔한 통합 실수입니다:

| 사용 중인 SDK                    | Base URL                   | 이유                                                                                  |
| ---------------------------- | -------------------------- | ----------------------------------------------------------------------------------- |
| OpenAI SDK (및 대부분의 클라이언트)    | `https://api.apiyi.com/v1` | SDK가 `/chat/completions`를 자체적으로 추가하므로 `/v1`가 있어야 합니다                                |
| Anthropic SDK (Claude 기본)    | `https://api.apiyi.com`    | SDK가 `/v1/messages`를 자체적으로 추가합니다 — **`/v1`를 추가하면 `/v1/v1/messages`가 되어 404가 발생합니다** |
| Google GenAI SDK (Gemini 기본) | `https://api.apiyi.com`    | 또한 `api_version: "v1beta"`도 설정하십시오                                                  |

<Warning>
  `base_url` 끝에 슬래시를 두지 마십시오 — 그러면 슬래시가 중복되어 404가 발생합니다. 자세한 내용과 노드 선택은 [base URL 설정](/ko/faq/base-url-config)에서 확인하실 수 있습니다.
</Warning>

### 3단계: 첫 호출을 수행하기

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.4-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import os
    from openai import OpenAI

    client = OpenAI(
        api_key=os.environ["APIYI_API_KEY"],
        base_url="https://api.apiyi.com/v1"
    )

    response = client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[
            {"role": "user", "content": "Hello!"}
        ]
    )

    print(response.choices[0].message.content)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    import OpenAI from 'openai';

    const openai = new OpenAI({
      apiKey: process.env.APIYI_API_KEY,
      baseURL: 'https://api.apiyi.com/v1'
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [{ role: 'user', content: 'Hello!' }]
    });

    console.log(response.choices[0].message.content);
    ```
  </Tab>

  <Tab title="Java">
    ```java theme={null}
    // Using the official OpenAI Java library
    OpenAiService service = new OpenAiService(
        System.getenv("APIYI_API_KEY"),
        Duration.ofSeconds(60),
        "https://api.apiyi.com/v1"
    );

    ChatCompletionRequest request = ChatCompletionRequest.builder()
        .model("gpt-5.4-mini")
        .messages(List.of(
            new ChatMessage(ChatMessageRole.USER, "Hello!")
        ))
        .build();

    ChatCompletionResult result = service.createChatCompletion(request);
    System.out.println(result.getChoices().get(0).getMessage().getContent());
    ```
  </Tab>
</Tabs>

<Warning>
  `gpt-5` 시리즈 이상에는 세 가지 매개변수 제한이 있습니다. `temperature`는 1이어야 하며, `max_tokens` 대신 `max_completion_tokens`를 사용하고, `top_p`는 전송하지 마십시오.
</Warning>

## 다음 단계

<CardGroup cols={2}>
  <Card title="Claude Code 연결" icon="terminal" href="/ko/scenarios/programming/claude-code">
    APIYI를 통해 `ANTHROPIC_BASE_URL`를 설정하고 Claude Code를 구동합니다
  </Card>

  <Card title="Codex 연결" icon="square-terminal" href="/ko/scenarios/programming/codex-cli">
    하나의 `config.toml`가 데스크톱 앱, IDE 플러그인 및 CLI를 모두 지원합니다
  </Card>

  <Card title="모델 목록 살펴보기" icon="bot" href="/ko/api-capabilities/model-info">
    지원되는 모든 모델과 기능 요약표입니다
  </Card>

  <Card title="API 매뉴얼 읽기" icon="book" href="/ko/api-manual">
    전체 엔드포인트 레퍼런스, 오류 코드 및 디버깅입니다
  </Card>
</CardGroup>

## FAQ

### 모델을 어떻게 전환합니까?

요청에서 `model` 매개변수만 변경하면 됩니다:

```json theme={null}
{
  "model": "gpt-5.6-sol",         // Use GPT-5.6 Sol
  "model": "claude-opus-5",       // Use Claude Opus 5
  "model": "gemini-3.6-flash"     // Use Gemini 3.6 Flash
}
```

<Warning>
  **모델 ID는 하이픈이 아니라 점을 사용합니다.** 문서 URL의 하이픈은 URL 안전성을 위한 대체 표기이며, 실제 모델 ID에는 점이 그대로 유지됩니다. 페이지 `/models/qwen3-7-max`는 모델 ID `qwen3.7-max`에 해당합니다. `gpt-5-4-mini`로 작성하면 404가 반환되며, 올바른 형식은 `gpt-5.4-mini`입니다.

  잘 모르겠으면 다음과 같이 나열하십시오: `GET https://api.apiyi.com/v1/models`.
</Warning>

### 지원되는 프로그래밍 언어는 무엇입니까?

APIYI는 OpenAI API 표준과 호환되며 OpenAI SDK가 지원하는 모든 언어를 지원합니다:

* Python
* JavaScript/TypeScript
* Java
* C#/.NET
* Go
* Ruby
* PHP
* 그 외 더 많습니다...

### 잔액은 어떻게 확인합니까?

[콘솔](https://api.apiyi.com/account/profile)에 로그인하여 다음을 확인하십시오:

* 계정 잔액
* 사용 내역
* 사용 통계

또한 API를 통해 프로그램으로 조회할 수도 있습니다:

* [잔액 조회 API](/ko/api-capabilities/balance-query): API를 통해 계정 잔액, 만료일 등 더 많은 정보를 가져옵니다
* [잔액 알림 설정](/ko/faq/balance-alerts): 잔액이 부족할 때 자동으로 알림을 받아 서비스 중단을 방지합니다

### 문제가 발생하면 어떻게 합니까?

1. 문제가 발생한 페이지를 열고, 오른쪽 상단의 **페이지 복사**를 눌러 오류와 함께 AI에 보내십시오
2. [API 설명서](/ko/api-manual)를 확인하십시오
3. [일반적인 오류](/ko/faq/invalid-api-key)를 검토하십시오
4. 지원팀에 문의하십시오: [support@apiyi.com](mailto:support@apiyi.com)

<Info>
  팁: API key를 안전하게 보관하고 콘솔에서 사용 로그를 정기적으로 확인하십시오. 모든 요청에는 비용 최적화를 위한 메시지 내역이 포함됩니다.
  잘 사용하시기 바랍니다!
</Info>
