> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Updream Desktop과 APIYI 연동

> hellojint/updream-openai-compatible-plugin 플러그인을 사용하여 Updream Desktop v0.2.0의 이미지 생성 작업을 APIYI의 OpenAI 호환 이미지 엔드포인트로 전달합니다. 로컬 실행 또는 로컬 자격 증명 저장이 필요한 시나리오에 적합합니다.

## 개요

플러그인 `hellojint/updream-openai-compatible-plugin` (GitHub)은 **범용 OpenAI 호환 Image** 프로토콜을 지원하는 **Updream Desktop v0.2.0**용 오픈소스 이미지 생성 플러그인입니다. 설치 후 데스크톱 클라이언트는 OpenAI Images 인터페이스를 준수하는 모든 서드파티 업스트림 API로 이미지 생성 요청을 전달합니다. **APIYI는 API 경로에서 이 요구사항을 충족합니다**.

<Info>
  **프로젝트 정보**

  * 소스: `github.com/hellojint/updream-openai-compatible-plugin` (GitHub)
  * 라이선스: MIT
  * 작성자: hellojint
  * 플러그인 패키지 이름: `updream-openai-compatible-v1.updplugin`
  * 기반: 공식 Updream 플러그인 작성 가이드의 OpenAI 이미지 제공자 예제
</Info>

<Tip>
  **두 가지 연동 경로**

  "로컬 작업 실행 / 로컬 인증 정보 저장"이 필요하지 않다면 **Updream 웹 클라이언트를 사용하는 것을 권장합니다**:
  [Updream과 APIYI 연동 (웹)](/ko/scenarios/agent/updream). 웹 클라이언트는 **"외부 모델 커넥터" 스킬 + OpenAI 호환** 프로토콜을 통해 APIYI에 연결되므로 **플러그인 설치가 필요하지 않습니다**. 대부분의 사용자에게 권장되는 경로입니다.

  여기에서 설명하는 데스크톱 + 플러그인 경로는 API 키를 로컬에 보관해야 하거나, 배치 이미지 생성 작업을 실행해야 하거나, 웹 클라이언트에서 OpenAI Images 프로토콜 제한에 도달한 사용자를 위한 것입니다.
</Tip>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="범용 OpenAI 호환 프로토콜" icon="workflow">
    `/v1/images/generations`을 제공하고 `Bearer` 방식으로 인증하는 모든 업스트림과 호환됩니다. APIYI는 이를 충족합니다.
  </Card>

  <Card title="데스크톱 로컬 실행" icon="monitor">
    작업은 Updream Desktop v0.2.0에서 로컬로 실행되며 웹 캔버스로 결과를 반환합니다.
  </Card>

  <Card title="로컬에 저장되는 API 키" icon="key">
    키는 Updream 시스템 키체인에 보관되며 런타임에 읽어옵니다. 플러그인 자체에는 자격 증명이 포함되어 있지 않습니다.
  </Card>

  <Card title="여러 프로바이더 병행 사용" icon="layers">
    데스크톱 클라이언트는 여러 프로바이더(예: `openai`, `apiyi-compatible`)를 등록하고 이들 간에 전환할 수 있습니다.
  </Card>

  <Card title="자동 크기 매핑" icon="ratio">
    데스크톱 선명도 및 화면비가 업스트림 `size` 파라미터로 자동 매핑됩니다. 하드코딩된 `extra.size`은(는) 이 매핑보다 우선 적용됩니다.
  </Card>

  <Card title="다양한 응답 형식" icon="image">
    `data[].url`, `data[].b64_json`, 최상위 `url` 등과 호환됩니다. MIME은 Base64에서 자동으로 감지됩니다.
  </Card>
</CardGroup>

## APIYI 모델 예시

다음 ID를 **엔드포인트 ID** 필드에 입력할 수 있습니다. 이는 예시일 뿐입니다:

| 모델명 | 모델 ID | 사용 사례 |
| - | - | - |
| GPT Image(예시) | `gpt-image-1` | 고품질 이미지 생성 |
| GPT Image v2(예시) | `gpt-image-2` | 최신 세대(지원 여부는 APIYI의 현재 모델 목록에 따릅니다) |
| Nano Banana(예시) | `nano-banana` | Google의 이미지 모델 제품군 |
| Gemini Flash Image(작성자 스크린샷 예시) | `gemini-3.1-flash-image` | 더 빠르고 저렴한 비용 |

> 실제 지원되는 모델은 [APIYI 모델 추천](/ko/api-capabilities/model-info) 페이지에 안내되어 있습니다. 이 표는 플러그인에서 허용하는 필드 형식만을 보여줍니다.

## 플러그인 설정 필드

플러그인이 데스크톱 클라이언트에 로드되면 **API 키 추가** 양식에 다음 항목이 표시됩니다:

| 필드 | 필수 여부 | 설명 |
| - | - | - |
| **설정 이름** | 필수 | 목록에서 제공자를 구분하는 데 사용되는 사용자 정의 레이블(예: `apiyi-compatible`)입니다 |
| **프로토콜 유형** | 필수 | **범용 OpenAI 호환 이미지**를 선택합니다 |
| **생성 유형** | 필수 | `image`을(를) 선택합니다 |
| **API 키** | 필수 | APIYI 플랫폼 키입니다. Updream 키체인에 저장되며 런타임에 읽어옵니다 |
| **API 기본 URL** | 필수 | 업스트림 기본 URL입니다. APIYI의 경우 `https://api.apiyi.com/v1`을(를) 사용합니다 |
| **모델** | 필수 | 기본값(엔드포인트 ID와 동일)을 사용하거나 명시적으로 선택합니다 |
| **엔드포인트 ID** | 선택 | 설정 시 모델 필드를 **재정의**하여 최종 `model` 값으로 적용됩니다. 일반적으로 모델 ID 문자열입니다 |
| **프록시 사용** | 선택 | 필요한 경우 이 제공자를 글로벌 프록시를 통해 라우팅합니다 |

API 키는 민감한 정보입니다. **스크린샷, 문서, 이슈, README 또는 채팅에 실제 키를 붙여넣지 마십시오.** [APIYI 콘솔](https://www.apiyi.com)에서 데스크톱 클라이언트용 사용 한도가 설정된 전용 키를 생성하고, 작업이 끝나면 폐기하십시오.

## 설치 및 구성 (단계별 안내)

### 단계 0: 데스크톱 클라이언트 개요

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-task-overview.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=b2431a85db7a53efd727fad1b51cf896" alt="Updream 데스크톱 작업 개요 (v0.2.0)" width="1200" height="811" data-path="images/updream-desktop-task-overview.png" />

v0.2.0 기본 레이아웃: 왼쪽에는 “로컬 실행” 작업 목록, 상단 바에는 **동기화 / 키 추가 / 플러그인 가져오기 / 플러그인 관리**, 오른쪽 하단에는 버전 라벨 `v0.2.0`가 표시됩니다.

### 단계 1: 플러그인 가져오기

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-import-plugin.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=8f63d49aa37892c70145edcf2bb03300" alt="데스크톱 상단 바 “플러그인 가져오기” 항목" width="1194" height="70" data-path="images/updream-desktop-import-plugin.png" />

상단의 **플러그인 가져오기** 버튼을 클릭합니다. 파일 선택 창에서 다운로드한 `updream-openai-compatible-v1.updplugin`을(를) 선택하고 확인 메시지가 나타나면 **설치를 확인**합니다. 확인하기 전에 `plugin.py`을(를) 검토하는 것을 권장합니다.

### 단계 2: 설치 확인

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-plugin-installed.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=d0a9cd5d819da625a4cb95a13fb1309e" alt="플러그인 설치 완료 상태" width="609" height="169" data-path="images/updream-desktop-plugin-installed.png" />

**플러그인 관리** 페이지에 **범용 OpenAI 호환 이미지**(universal-openai-compatible-image · v1.0.0 · image)가 표시됩니다. 이제 데스크톱 클라이언트에서 모든 OpenAI 이미지 호환 업스트림을 호출할 준비가 완료되었습니다.

### 단계 3: 키 추가

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-add-key.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=720b99501217ca1651ba3676211c0b94" alt="데스크톱 상단 바 “키 추가” 항목" width="1193" height="144" data-path="images/updream-desktop-add-key.png" />

**키 추가** 버튼을 클릭하여 구성 양식을 엽니다.

### 단계 4: APIYI 구성

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-config-apiyi.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=3c52f8755f39c1d6330ec97772e4484a" alt="APIYI 구성 예시" width="514" height="668" data-path="images/updream-desktop-config-apiyi.png" />

스크린샷의 예시를 참고하여 양식을 작성합니다:

| 필드 | 예시 |
| - | - |
| 구성 이름 | `apiyi-compatible` |
| 프로토콜 유형 | 범용 OpenAI 호환 이미지 |
| 생성 유형 | `image` |
| API-Key | 사용자의 APIYI 플랫폼 키(런타임에 읽히며 코드에 기록되지 않음) |
| API 기본 URL | `https://api.apiyi.com/v1` |
| 모델 | 기본값(엔드포인트 ID와 동일) |
| 엔드포인트 ID | `gemini-3.1-flash-image` (APIYI 모델 문서 참조) |

**연결 테스트** 및 **생성 테스트**를 클릭합니다. **연결 성공! API 사용 가능** 메시지가 표시되면 구성을 저장합니다.

### 단계 5: 프로바이더 활성화 확인

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-provider-list.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=1357b08d7da971ce18923f71e62e1d80" alt="프로바이더 목록" width="807" height="407" data-path="images/updream-desktop-provider-list.png" />

**구성** 페이지의 프로바이더 목록에 이제 새로운 `apiyi-compatible` 항목이 표시됩니다. 해당 프로바이더 식별자는 `plugin:universal-openai-compatible-image`이며 상태는 **활성화됨**입니다. 언제든지 프로바이더를 전환하거나 비활성화할 수 있습니다.

<Tip>
  데스크톱 구성을 완료한 후 Updream **웹 클라이언트**를 다시 엽니다. 캔버스 노드의 이미지 생성 프로바이더 드롭다운에서 `apiyi-compatible`을(를) 선택하면 웹 클라이언트에서 작업을 발행하여 데스크톱 클라이언트에서 실행하도록 할 수 있습니다.
</Tip>

## 사용법: Web → Desktop → Web 루프

위의 5단계를 거친 후, **Updream 웹 클라이언트**에서 이미지 생성을 실행하면 데스크톱 측의 `apiyi-compatible` Provider를 사용하여 `https://api.apiyi.com/v1/images/generations`(으)로 전달합니다. 결과는 다시 웹 캔버스 노드로 반환됩니다.

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-web-recv-from-desktop.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=383de779592d3d3a270db2ca330bd158" alt="데스크톱 클라이언트로부터 생성 결과를 수신하는 웹 클라이언트" width="891" height="611" data-path="images/updream-web-recv-from-desktop.png" />

스크린샷에서 캔버스 아래 패널에는 이미지 생성 + `apiyi-compatible`(화살표 위치) + `16:9 / 2K / ×1`이 표시됩니다. 이는 Updream 웹 클라이언트에서 시작하여 데스크톱 클라이언트에서 실행된 후 웹 캔버스로 다시 돌아온 작업의 시각적 결과입니다.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="데스크톱 클라이언트에 '플러그인 가져오기' 버튼이 표시되지 않습니까?">
    데스크톱 클라이언트 버전이 **≥ v0.2.0**인지 확인하십시오. 이전 버전은 플러그인을 지원하지 않으므로 먼저 Updream Desktop을 업그레이드해야 합니다.
  </Accordion>

  <Accordion title="플러그인을 가져온 후 프로토콜 드롭다운에 '범용 OpenAI 호환 이미지'가 표시되지 않습니까?">
    1. `.updplugin` 아카이브 루트에 `plugin.py`이(가) 직접 포함되어 있고 `manifest.entry`과(와) 일치하는지 확인하십시오
    2. 데스크톱 클라이언트를 재시작하십시오
    3. **플러그인 관리** 페이지에서 플러그인 상태가 **비활성화**가 아닌지 확인하십시오
  </Accordion>

  <Accordion title="연결 테스트는 성공하지만 생성이 실패합니까?">
    1. **엔드포인트 ID**의 철자가 올바르고 APIYI의 현재 모델 목록에 있는지 확인하십시오
    2. 계정 잔액이 충분한지 확인하십시오([계정 잔액이 남아 있는데도 실패하는 이유는 무엇입니까?](/ko/faq/balance-insufficient) 참조)
    3. 데스크톱 클라이언트의 **로컬 실행** 페이지에서 정확한 오류 코드를 확인하십시오
  </Accordion>

  <Accordion title="데스크톱 클라이언트는 작동하는데 웹 클라이언트에서는 동일한 제공자를 사용할 수 없는 이유는 무엇입니까?">
    웹 클라이언트는 이 플러그인을 거치지 않습니다. OpenAI 호환 프로토콜 구성과 함께 웹 클라이언트의 **외부 모델 커넥터** 스킬을 사용하거나 [Updream과 APIYI 연동(웹)](/ko/scenarios/agent/updream)을 참조하십시오.
  </Accordion>

  <Accordion title="플러그인을 어떻게 다시 패키징합니까?">
    `manifest.json.version` 버전을 올린 후 다시 패키징하십시오:

    ```bash theme={null}
    zip -r updream-openai-compatible-v1.updplugin plugin.py manifest.json README.md
    ```

    ZIP 아카이브 루트에 `plugin.py`이(가) 직접 포함되어 있어야 합니다.
  </Accordion>

  <Accordion title="API 키가 플러그인 코드나 로그에 포함됩니까?">
    아닙니다. 플러그인은 **어떠한 자격 증명도 포함하지 않고 제공됩니다**. 키는 Updream 키체인에 저장되며 런타임에 `cfg.get('api_key')`을(를) 통해 읽어옵니다. `plugin.py`, README, 이슈 또는 채팅에 실제 키를 붙여넣지 마십시오.
  </Accordion>
</AccordionGroup>

## 관련 리소스

<CardGroup cols={2}>
  <Card title="Updream과 APIYI 연동 (웹, 권장)" icon="globe" href="/ko/scenarios/agent/updream">
    웹 클라이언트는 **External Model Connector** 스킬을 통해 APIYI에 연결됩니다 — 플러그인이 필요하지 않습니다
  </Card>

  <Card title="hellojint/updream-openai-compatible-plugin" icon="github">
    본 문서의 기반이 된 오픈소스 저장소(MIT 라이선스): `github.com/hellojint/updream-openai-compatible-plugin`
  </Card>

  <Card title="APIYI 모델 추천" icon="star" href="/ko/api-capabilities/model-info">
    현재 APIYI에서 지원하는 이미지 모델 및 가격을 확인하실 수 있습니다
  </Card>

  <Card title="APIYI API 키 관리" icon="key" href="/ko/faq/token-management">
    API 키 생성 및 관리를 위한 모범 사례입니다
  </Card>

  <Card title="APIYI 콘솔" icon="settings" href="https://www.apiyi.com">
    전용 키를 생성하고 사용량을 확인하며 잔액 한도를 설정할 수 있습니다
  </Card>

  <Card title="APIYI 연동 및 사용법" icon="book" href="/ko/getting-started">
    API 연동 및 OpenAI 호환 프로토콜 개요입니다
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.