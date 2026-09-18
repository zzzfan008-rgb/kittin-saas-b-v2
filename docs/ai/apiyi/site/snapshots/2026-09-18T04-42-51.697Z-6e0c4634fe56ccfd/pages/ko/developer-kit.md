> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# AI 개발자 키트

> AI에 APIYI 통합을 전달합니다. 채팅 에이전트는 스킬을 설치하고, 터미널은 CLI를 사용하며, 코딩 에이전트는 코드를 작성하기 전에 계약과 모델 레지스트리를 읽습니다. 각 경로에는 복사할 수 있는 prompt가 포함되어 있습니다.

<Note>
  계정과 키는 여전히 [콘솔](https://api.apiyi.com/token)에서 직접 생성해야 합니다. "키가 있습니다"부터 "코드가 작동합니다"까지의 모든 과정은 아래 세 가지 경로 중 하나를 통해 AI에 위임할 수 있습니다.
</Note>

## 경로 선택

<CardGroup cols={3}>
  <Card title="스킬 · 채팅 에이전트" icon="sparkles" href="#skills">
    OpenClaw, Claude Code 및 스킬 시스템을 사용하는 기타 에이전트입니다. 스킬을 한 번 설치한 후 자연어로 APIYI를 호출합니다.
  </Card>

  <Card title="CLI · 터미널" icon="terminal" href="#cli">
    코드가 필요 없습니다. 터미널에서 키를 확인하고, 모델을 나열하고, 메시지를 전송하고, 이미지를 생성합니다. `npx apiyi@latest check` 설치가 필요 없습니다.
  </Card>

  <Card title="개발자 키트 · 코딩 에이전트" icon="code" href="#rules-for-coding-agents">
    Cursor, Claude Code 및 Codex는 통합 코드를 작성하기 전에 계약과 모델 레지스트리를 읽습니다. 존재하지 않는 엔드포인트를 임의로 만들지 않습니다.
  </Card>
</CardGroup>

## 키트에는 무엇이 포함되어 있습니까

모든 파일은 공개되어 있습니다. 로그인이 필요하지 않으며, 모든 에이전트가 직접 가져올 수 있습니다.

| 파일             | URL                                          | 역할                                                                                    |
| -------------- | -------------------------------------------- | ------------------------------------------------------------------------------------- |
| **통합 계약**      | `https://docs.apiyi.com/skill.md`            | 엔드포인트 표, 인증, 모델 이름 지정 규칙, 알려진 문제점, 자체 점검 상태, 검증 체크리스트입니다. 코딩 에이전트를 위한 규칙집이자 스킬의 본문입니다 |
| **모델 레지스트리**   | `https://docs.apiyi.com/model-registry.json` | 모델 ID, 엔드포인트, 그룹, 과금 유형 및 정가의 기계 판독 가능한 단일 정보 소스입니다. 가격 표와 함께 다시 생성됩니다                |
| **페이지 색인**     | `https://docs.apiyi.com/llms.txt`            | 에이전트가 어떤 페이지를 읽을지 결정할 수 있도록 제공되는 사이트 전체 색인입니다                                         |
| **전체 텍스트**     | `https://docs.apiyi.com/llms-full.txt`       | 모든 페이지를 연결한 내용입니다. 크기가 크므로 필요할 때 가져옵니다                                                |
| **단일 페이지 텍스트** | 모든 페이지 URL 뒤에 `.md` 추가                       | 페이지 하나만 필요할 때 사용합니다. HTML보다 저렴합니다                                                     |
| **MCP 서버**     | `https://docs.apiyi.com/mcp`                 | 이 사이트를 MCP 서버로 연결하여 에이전트가 최신 콘텐츠를 검색할 수 있도록 합니다                                       |

<Tip>
  이 페이지의 일반 텍스트 버전은 `https://docs.apiyi.com/en/developer-kit.md`입니다.
</Tip>

## 코딩 에이전트를 위한 규칙

코딩 에이전트에서 가장 흔한 실패는 잘못된 코드가 아닙니다. **기억에 의존해 작성하는 것**입니다. 존재하지 않는 엔드포인트를 만들어 내거나, `gpt-5-4-mini` 대신 `gpt-5.4-mini`을 입력하거나, Anthropic SDK 기본 URL에 불필요한 `/v1`을 추가하는 경우입니다. 다음 5가지 규칙으로 이를 방지할 수 있습니다.

1. **엔드포인트, 매개변수 이름, 열거형 값 또는 응답 형태를 만들어 내지 마십시오.** `skill.md` 엔드포인트 표에 있는 경로만 사용하십시오. 매개변수는 사용 중인 프로토콜(OpenAI, Anthropic 또는 Gemini)의 공식 정의를 따릅니다.
2. **`model-registry.json`은 모델 ID의 단일 기준입니다.** ID는 점으로 버전이 구분되며 대소문자를 구분합니다. 문서 URL의 하이픈은 URL에서 안전하게 사용하기 위한 대체 표기일 뿐 모델 ID가 아닙니다.
3. **모델이 아니라 SDK에 따라 기본 URL을 선택하십시오.** OpenAI SDK는 `https://api.apiyi.com/v1`을 사용하고, Anthropic SDK는 루트 `https://api.apiyi.com`를 사용하며, Google GenAI SDK는 `api_version`을 `v1beta`로 설정한 루트를 사용합니다.
4. **키는 `APIYI_API_KEY` 환경 변수에서만 읽으십시오.** 키를 코드에 직접 입력하거나, 커밋하거나, 채팅에 붙여 넣지 마십시오.
5. **먼저 설명한 다음 편집하십시오.** 에이전트가 사용할 엔드포인트, 모델 및 타임아웃을 명시하도록 하십시오. 확인한 후에만 코드를 편집합니다.

<Prompt description="Cursor, Claude Code, Codex 및 기타 코딩 에이전트를 위한 전체 프롬프트입니다. 있는 그대로 복사하여 붙여 넣으십시오." icon="code" actions={["copy"]}>
  코드를 작성하기 전에 [https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) 및
  [https://docs.apiyi.com/llms.txt를](https://docs.apiyi.com/llms.txt를) 처음부터 끝까지 읽으십시오. 다음 규칙을 반드시 따르십시오.

  * 엔드포인트, 매개변수 이름, 열거형 값 또는 응답 형태를 만들어 내지 마십시오.
    skill.md 엔드포인트 표에 나열된 경로만 사용하십시오.
  * [https://docs.apiyi.com/model-registry.json을](https://docs.apiyi.com/model-registry.json을) 모델 ID의 단일 기준으로 간주하십시오. ID는 점으로 버전이 구분되며 대소문자를 구분합니다(gpt-5.4-mini이며, gpt-5-4-mini가 아닙니다).
    기억에 의존해 입력하지 마십시오.
  * SDK에 따라 기본 URL을 선택하십시오. OpenAI SDK는 [https://api.apiyi.com/v1을](https://api.apiyi.com/v1을) 사용하고, Anthropic SDK는
    /v1이 없는 [https://api.apiyi.com을](https://api.apiyi.com을) 사용하며, Google GenAI SDK는
    api\_version을 v1beta로 설정한 [https://api.apiyi.com을](https://api.apiyi.com을) 사용합니다.
  * 키는 APIYI\_API\_KEY 환경 변수에서만 읽으십시오. 키를 코드에 직접 입력하거나 커밋하지 마십시오.
  * 페이지 수준의 세부 정보가 필요하면 llms.txt에서 해당 페이지를 찾고 뒤에 .md를 추가하여 일반 텍스트로 읽으십시오.

  읽기를 모두 마치면 먼저 따르려는 통합 흐름을 자신의 말로 설명하십시오(사용할 엔드포인트, 모델 및 타임아웃). 아직 코드를 편집하지 마십시오.
  제 확인을 기다리십시오.
</Prompt>

<Accordion title="이 프롬프트가 방지하는 문제">
  | 요구 사항              | 방지하는 문제                                                                                   |
  | ------------------ | ----------------------------------------------------------------------------------------- |
  | 엔드포인트를 만들어 내지 않음   | 에이전트가 학습 데이터의 기억에서 `/v1/complete` 또는 `/v1/generate`을 조합하고 404 오류를 반복합니다                   |
  | 레지스트리에서 모델 ID를 가져옴 | `gpt-5-4-mini` 또는 `minimax-m3`가 404를 반환하지만 오류 메시지에 무엇이 잘못되었는지 표시되지 않습니다                   |
  | SDK에 따른 기본 URL     | Anthropic SDK의 `/v1`이 추가되면 `/v1/v1/messages`이 되고, OpenAI SDK에서 `/v1`이 누락되어도 404 오류가 발생합니다 |
  | 환경 변수에서만 키를 가져옴    | 하드코딩된 키가 저장소와 함께 유출되며, 이 사이트의 사전 커밋 훅도 이를 차단합니다                                           |
  | 편집 전에 설명함          | 에이전트가 잘못된 프로토콜을 선택했다는 사실을 발견하기 전에 파일 10개를 수정하는 일을 방지합니다                                   |
</Accordion>

## 스킬

스킬은 `skill.md` 그 자체입니다. 이는 머신을 위해 작성된 통합 레퍼런스입니다. 설치하면 에이전트는 APIYI를 호출해야 할 때마다 이 규칙을 기억합니다. 설치 방법은 세 가지입니다.

<Tabs>
  <Tab title="npx 스킬(일반)" icon="package">
    Claude Code, Cursor, Codex 및 Agent Skills 사양을 지원하는 기타 모든 도구에서 사용할 수 있습니다.

    ```bash theme={null}
    npx skills add https://docs.apiyi.com
    ```

    검색은 이 사이트의 `/.well-known/agent-skills/index.json`를 통해 수행됩니다. 이 작업은 스크립트 없이 `skill.md` 자체를 설치합니다. 자체 점검에는 `npx apiyi@latest check`을 사용합니다.
  </Tab>

  <Tab title="OpenClaw" icon="bot">
    OpenClaw의 스킬 설치 프로그램은 git 소스를 허용하며 저장소 루트에 `SKILL.md`이 있어야 합니다. 스킬 저장소 `github.com/apiyi-com/skills`는 이 구조로 구성되어 있으며 자체 점검 스크립트도 포함합니다.

    ```bash theme={null}
    openclaw skills install git:apiyi-com/skills
    ```

    또는 다음과 같이 직접 워크스페이스에 클론할 수 있습니다.

    ```bash theme={null}
    git clone https://github.com/apiyi-com/skills ~/.openclaw/workspace/skills/apiyi
    ```

    설치가 완료되면 에이전트가 `scripts/apiyi.py --check`을 실행하고 그 결과에 따라 주요 설정을 안내합니다.
  </Tab>

  <Tab title="수동 복사" icon="clipboard">
    파일을 읽을 수 있는 모든 에이전트에서 사용할 수 있습니다. `https://docs.apiyi.com/skill.md`의 내용을 해당 에이전트의 스킬 디렉터리에 넣습니다.

    | 에이전트        | 위치                              |
    | ----------- | ------------------------------- |
    | Claude Code | `.claude/skills/apiyi/SKILL.md` |
    | Codex CLI   | `.agents/skills/apiyi/SKILL.md` |
    | Cursor      | 프로젝트 규칙 파일에 넣거나 컨텍스트로 붙여 넣습니다   |
    | 기타          | 전체 텍스트를 시스템 프롬프트에 포함합니다         |
  </Tab>
</Tabs>

<Prompt description="OpenClaw, Claude Code, Cursor 및 스킬을 지원하는 기타 에이전트용입니다. 있는 그대로 복사하여 붙여 넣습니다." icon="bot" actions={["copy"]}>
  먼저 자신에게 APIYI 스킬을 설치한 다음, 이를 사용하여 APIYI를 통합합니다.

  1. `npx skills add https://docs.apiyi.com`을 실행합니다(스킬 이름: apiyi).
     OpenClaw인 경우 스킬 설치 프로그램으로 `git:apiyi-com/skills`을 설치하거나,
     저장소를 \~/.openclaw/workspace/skills/apiyi/에 클론합니다.
     둘 다 작동하지 않으면 [https://docs.apiyi.com/skill.md를](https://docs.apiyi.com/skill.md를) 전체 가져와서 읽습니다. 내용은 동일합니다.
  2. 다른 작업을 수행하기 전에 자체 점검을 실행합니다. 스킬의 `scripts/apiyi.py --check`을 실행합니다.
     (스크립트가 없으면 `npx apiyi@latest check`을 실행합니다.)
     no\_key인 경우 키를 요청합니다([https://api.apiyi.com/token에서](https://api.apiyi.com/token에서) 복사할 수 있음). 그런 다음
     해당 키를 APIYI\_API\_KEY 환경 변수에 넣습니다. 키를 하드코딩하거나 커밋해서는 안 됩니다.
  3. 점검 결과가 ready로 표시되면 gpt-5.4-mini로 “Hello”를 한 번 전송하고, 응답을 보여 준 다음,
     이후 이 스킬로 무엇을 할 수 있는지 설명합니다.
</Prompt>

### 키가 에이전트에 전달되는 방식

* **환경 변수 `APIYI_API_KEY`이 먼저 사용됩니다.** 스킬, CLI 및 이 문서의 모든 예시는 여기에서 해당 값을 읽습니다.
* **OpenClaw**은 `~/.openclaw/openclaw.json`의 `skills.entries.apiyi.apiKey`에 키를 저장하고 런타임에 `APIYI_API_KEY`로 주입합니다. 이것이 스킬 frontmatter의 `primaryEnv` 필드에서 선언하는 내용입니다. 파일 구조는 [OpenClaw 구성 파일](/ko/scenarios/agent/openclaw/config-json)을 참조하십시오.
* **CLI**은 `npx apiyi@latest auth set-key`을 사용하여 해당 키를 `~/.config/apiyi/config.json`에 모드 0600으로 저장합니다.

### 자체 점검 상태

스킬 스크립트, CLI 및 수동 curl은 모두 동일한 상태 집합을 반환합니다.

| 상태              | 의미                     | 에이전트가 수행하는 작업                                                 |
| --------------- | ---------------------- | ------------------------------------------------------------- |
| `ready`         | `/v1/models`이 200을 반환함 | 사용 가능한 모델 수를 알려 주고 무엇을 만들지 묻습니다                               |
| `no_key`        | 어디에서도 키를 찾지 못함         | 콘솔에서 키를 복사하도록 안내한 다음 다시 점검합니다                                 |
| `invalid_key`   | 401 또는 403             | 키가 잘못되었거나 비활성화되었거나 소진되었습니다. 다시 복사하도록 요청합니다                    |
| `network_error` | 타임아웃, DNS 오류 또는 5xx    | 한 번 재시도한 다음 `vip.apiyi.com`(중국 본토 외부) 또는 `b.apiyi.com`을 제안합니다 |

<Warning>
  일반 `sk-` 키로는 **잔액을 읽을 수 없으므로** `no_balance` 상태가 없습니다. 잔액과 로그에는 별도의 시스템 토큰이 사용됩니다. [호출 로그를 확인하는 방법](/ko/faq/call-logs)을 참조하십시오. 429는 요청 제한 또는 잔액 부족을 의미할 수 있습니다. 에이전트는 추측하지 말고 [콘솔](https://api.apiyi.com/account/profile)을 안내해야 합니다.
</Warning>

## CLI

코드를 작성하지 않고 터미널에서 첫 번째 호출을 실행할 수 있습니다. Node 18 이상이면 설치할 항목이 없습니다.

```bash theme={null}
npx apiyi@latest check
```

<Prompt description="터미널 명령을 실행할 수 있는 에이전트에서 실행하거나, 직접 해당 줄을 실행하십시오." icon="terminal" actions={["copy"]}>
  APIYI CLI를 설치하고 실행할 수 있도록 도와주십시오: [https://github.com/apiyi-com/cli](https://github.com/apiyi-com/cli)
  요구 사항: Node 18 이상; 설치할 항목 없이 `npx apiyi@latest check`을(를) 실행하십시오.
  API 키(`npx apiyi@latest auth set-key` 또는 [https://api.apiyi.com/token에서](https://api.apiyi.com/token에서) 복사한 APIYI\_API\_KEY 환경 변수)를 구성하는 방법을 안내하십시오.
  마지막으로 `npx apiyi@latest models --grep gpt-5` 및 `npx apiyi@latest chat "Hello" -m gpt-5.4-mini`을(를) 실행하고 출력을 붙여 넣으십시오.
</Prompt>

### 명령어

| 명령어                                                 | 필요 항목     | 기능                                                                                                   |
| --------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| `apiyi check`                                       | 키 선택 사항   | 키의 출처, 노드 접근 가능 여부, `/v1/models`이(가) 200을 반환하는지 여부, 지연 시간 및 상태를 보고합니다. 시스템 token이 구성되어 있으면 잔액을 표시합니다 |
| `apiyi models [--grep text]`                        | 키 선택 사항   | 키가 있으면 `/v1/models`을(를) 통해 해당 키로 접근할 수 있는 모델을 나열하고, 키가 없으면 공개 레지스트리를 읽습니다                            |
| `apiyi chat "prompt" [-m model] [--stream]`         | 키 필요      | Chat Completions 요청을 한 번 보내고 응답과 token 사용량을 출력합니다. 기본 모델은 `gpt-5.4-mini`입니다                          |
| `apiyi responses "input" [-m model] [--effort low]` | 키 필요      | Responses 엔드포인트를 사용하고 `output_text`을(를) 출력합니다                                                        |
| `apiyi image "prompt" -m gpt-image-2 [-o file]`     | 키 필요      | 이미지를 생성하여 로컬 파일에 기록합니다. 제한 시간은 360초입니다                                                               |
| `apiyi balance`                                     | 시스템 token | 잔액을 표시합니다(쿼터 단위 500000개 = 1 USD)                                                                     |
| `apiyi auth set-key` / `show` / `clear`             | 필요 없음     | 숨겨진 입력으로 키를 저장합니다. `show`은(는) 키를 마스킹하고, `clear`은(는) 키를 삭제합니다                                         |

전역 플래그: `--api-key`, `--node api|vip|b|cf`(노드 선택), `--base-url`, `--timeout`, `--json`(기계 판독 가능한 출력).

### 키 조회 순서

`--api-key` 플래그, `APIYI_API_KEY` 환경 변수, `~/.config/apiyi/config.json`, OpenClaw의 `~/.openclaw/openclaw.json` 순서로 조회합니다. OpenClaw 스킬을 이미 설치했다면 CLI가 해당 키를 재사용합니다.

### 종료 코드

스크립트와 에이전트는 텍스트를 파싱하는 대신 종료 코드를 기준으로 분기합니다.

| 코드 | 의미                                         |
| -- | ------------------------------------------ |
| 0  | 성공                                         |
| 2  | `no_key`                                   |
| 3  | `invalid_key`(401 / 403)                   |
| 4  | `network_error`(DNS, 시간 초과 또는 재시도 후 5xx)   |
| 5  | 모델을 찾을 수 없음(404, 일반적으로 ID 오타)              |
| 6  | 요청 제한 초과 또는 잔액 부족(429)                     |
| 7  | 잘못된 요청(400, `error.message`을(를) 있는 그대로 출력) |
| 8  | 잘못된 명령줄 인수                                 |

소스는 `github.com/apiyi-com/cli`에 있으며 npm 패키지는 `apiyi`입니다. 문서에서는 항상 `npx apiyi@latest`을(를) 작성합니다. `npx`이(가) 이전 버전을 캐시하기 때문입니다.

## model-registry.json 필드

[model pricing](/en/models) 페이지와 동일한 데이터에서 가격표가 새로 고쳐질 때마다 재생성됩니다. 최상위 필드:

| 필드               | 의미                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| `schema_version` | 스키마 버전이며, 현재 1입니다. 하나의 버전 내에서는 필드가 추가되기만 하며 이름이 변경되지 않습니다                                                            |
| `generated_at`   | 생성 시간(UTC)                                                                                                           |
| `base_urls`      | 세 SDK 각각의 기본 URL과 Gemini `api_version`                                                                               |
| `nodes`          | 사용 가능한 노드 호스트 이름                                                                                                     |
| `endpoints`      | 엔드포인트 이름과 경로 및 메서드의 매핑: `chat` / `responses` / `messages` / `gemini` / `images` / `embeddings` / `rerank` / `models` |
| `groups`         | 그룹 이름과 표시 라벨 및 비율의 매핑                                                                                                |
| `models[]`       | 아래를 참조하십시오                                                                                                           |

각 모델 항목:

| 필드                                                                      | 의미                                               |
| ----------------------------------------------------------------------- | ------------------------------------------------ |
| `id`                                                                    | 요청에 그대로 사용되는 모델 ID이며, 대소문자를 구분합니다                |
| `vendor_en`                                                             | 영어 공급업체 이름                                       |
| `category`                                                              | `text`, `image`, `video`, `embedding`와 같은 기능 유형  |
| `endpoints`                                                             | 이 모델이 허용하는 엔드포인트 이름으로, 최상위 `endpoints`의 키와 일치합니다 |
| `groups`                                                                | 이 모델을 호출할 수 있는 token 그룹                          |
| `billing.type`                                                          | `per_token`(token 백만 개당) 또는 `per_call`           |
| `billing.input_usd_per_m` / `output_usd_per_m` / `cache_read_usd_per_m` | token당 과금 모델의 USD 정가                             |
| `billing.per_call_usd`                                                  | 호출당 과금 모델의 호출당 USD 정가                            |
| `billing.tiered`                                                        | 단계별 과금 적용 여부입니다(참인 경우 모델 페이지를 참조하십시오)            |
| `docs_url`                                                              | 존재하는 경우 상세 페이지 URL                               |

<Info>
  레지스트리의 가격은 **정가**입니다. 충전 보너스와 그룹 할인이 포함되지 않으며, 실제 과금은 콘솔을 따릅니다. 그룹에 대한 설명은 [그룹 설명](/ko/faq/groups-explained)을 참조하십시오.
</Info>

## 관련 페이지

<CardGroup cols={2}>
  <Card title="시작하기" icon="rocket" href="/ko/getting-started">
    두 가지 방법이 있습니다. AI에 통합을 맡기거나 직접 수행할 수 있습니다.
  </Card>

  <Card title="원클릭 통합이 지원됩니까?" icon="plug" href="/ko/faq/one-click-integration">
    버튼을 제공하는 대신 문서를 AI에 전달하는 방식으로 지원됩니다.
  </Card>

  <Card title="OpenClaw" icon="bot" href="/ko/scenarios/agent/openclaw/overview">
    오픈 소스 로컬 AI 어시스턴트입니다. 스킬을 설치하면 자연어로 APIYI를 호출합니다.
  </Card>

  <Card title="모델 가격" icon="circle-dollar-sign" href="/en/models">
    공급업체별로 그룹화하고 등급별 가격을 적용한 레지스트리의 사람이 읽기 쉬운 버전입니다.
  </Card>
</CardGroup>
