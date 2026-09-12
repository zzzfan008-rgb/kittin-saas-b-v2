> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# WorkBuddy

> Tencent의 전 시나리오 AI 오피스 워크스페이스 — 요구사항을 전달하면 자율적으로 계획하고 실행한 뒤, 완성된 결과물을 전달합니다. 하나의 APIYI 키로 모든 대형 모델을 연결합니다

<Tip>
  Tencent의 전 시나리오 AI 오피스 워크스페이스 — 요구사항을 말하면 스스로 계획하고 실행한 뒤 완성된 결과물을 전달합니다. 하나의 APIYI 키로 어떤 대형 모델이든 연결할 수 있습니다.
</Tip>

## 개요

WorkBuddy는 텐센트의 AI Agent 오피스 제품으로, **요구사항을 말하면 작업을 실행하고, 완료된 결과물을 받는** 새로운 패러다임을 기반으로 합니다. 조언과 텍스트 답변만 제공하는 대화형 AI와 달리, WorkBuddy는 자연어 지시를 이해하고, 작업을 스스로 분해하며, 단계를 계획한 뒤, 작업을 수행합니다. 문서, 스프레드시트, 슬라이드 덱, 데이터 분석 등 멀티모달 작업을 처리할 수 있으며, 권한이 부여된 로컬 폴더를 읽어 일괄 처리를 수행하고, 실제로 승인할 수 있는 결과물(주간 보고서, 회의록, 덱, 데이터 대시보드)을 제공합니다.

WorkBuddy에는 Hunyuan, GLM, MiniMax, Kimi, DeepSeek(텐센트 클라우드의 Token Plan을 통해 제공됨) 같은 주류 모델이 기본 탑재되어 있으며, **모델 설정**을 통해 서드파티 대형 모델을 기반 엔진으로 연결할 수도 있습니다. APIYI를 연결하면 다음과 같은 이점을 얻을 수 있습니다.

| 기능                     | 상세                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| 🧩 하나의 키로 모든 모델 사용     | 각 공급업체에 따로 등록할 필요가 없습니다. 하나의 APIYI 키로 WorkBuddy 안에서 GPT / Claude / Gemini / DeepSeek와 그 외 전체 매트릭스를 사용할 수 있습니다 |
| 🔐 키를 로컬에 저장           | API 키를 포함한 구성은 사용자 기기의 `workbuddy/models.json`에만 저장되며, 클라우드로 업로드되지 않습니다                                       |
| ⚡ 그래픽 기반 원스텝 설정        | 설정 → 모델 → 사용자 지정: 엔드포인트, 키, 모델 이름을 입력한 뒤 저장하면 됩니다. 수정할 설정 파일이 없습니다                                            |
| 💰 사용량 기반 과금, 본인 계정 사용 | 사용자 지정 모델의 비용은 APIYI와 직접 정산되며, WorkBuddy 자체 크레딧이나 플랜 쿼터를 소모하지 않습니다                                            |

> ℹ️ **제품 정보**: WorkBuddy는 텐센트가 만듭니다. 웹사이트 `www.workbuddy.cn`, 공식 문서 `www.workbuddy.cn/docs/workbuddy/Overview`.

## 설치

WorkBuddy는 현재 **Windows / macOS** 데스크톱 클라이언트를 제공합니다. 웹사이트에서 설치 프로그램을 다운로드한 다음 더블클릭하여 설치하면 됩니다. 명령줄은 필요하지 않습니다:

| 플랫폼     | 받는 방법                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------- |
| 웹사이트 홈  | `www.workbuddy.cn` — 다운로드 버튼을 클릭하여 사용자의 플랫폼에 맞는 설치 프로그램을 받으십시오                                    |
| Windows | 공식 Windows 설치 가이드를 참조하십시오: `/docs/workbuddy/From-Beginner-to-Expert-Guide/Installation-Win-Guide` |
| macOS   | 공식 Mac 설치 가이드를 참조하십시오: `/docs/workbuddy/From-Beginner-to-Expert-Guide/Installation-Mac-Guide`     |
| 이전 버전   | 공식 문서의 “다운로드 기록”: `/docs/workbuddy/Download-History`                                              |

설치가 완료되면 WorkBuddy를 열고 로그인하십시오. 그런 다음 **New task** 표시줄에서 한 문장으로 작업을 요청할 수 있습니다. 또는 공식 “빠른 시작” / “첫 작업” 안내서를 따라 기본 기능을 익히십시오.

## APIYI 연결

WorkBuddy의 모델 설정 대화상자는 **OpenAI 호환 프로토콜 API만** 지원합니다(대화상자 상단에 그렇게 표시됩니다). APIYI는 표준 **OpenAI 호환 API**를 제공하므로, **사용자 지정** 공급자를 선택하기만 하면 됩니다. 그러면 전체 모델 매트릭스(GPT / Claude / Gemini / DeepSeek / Zhipu / Kimi 등)를 한 번에 사용할 수 있습니다.

### 그래픽 설정(유일한 방법, 권장)

WorkBuddy에서 **설정 → 모델**을 열고 **모델 추가**를 클릭한 다음, 아래와 같이 입력하십시오.

| 항목      | 입력할 내용                                                                                                                                             |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 공급자     | `Custom`를 선택하십시오                                                                                                                                   |
| 엔드포인트   | `https://api.apiyi.com/v1/chat/completions` — `/chat/completions`까지의 전체 경로를 입력하십시오. `https://api.apiyi.com`나 `https://api.apiyi.com/v1`만 입력하지 마십시오 |
| API Key | APIYI 키(`sk-...`)                                                                                                                                  |
| 모델 이름   | 원하는 모델 ID를 입력하십시오. 예: `claude-sonnet-5`, `gpt-5.4`, `deepseek-v3.2`, `kimi-k2.6`                                                                   |
| 고급 옵션   | 선택한 모델이 실제로 지원하는 항목만 수동으로 체크하십시오 — 아래 참고를 보십시오                                                                                                     |

<img src="https://mintcdn.com/apiyillc/hVgOxBLyKM6-uzFJ/images/workbuddy-model-config-zh.png?fit=max&auto=format&n=hVgOxBLyKM6-uzFJ&q=85&s=d52fe72d995e805cc4a587d6aada814b" alt="WorkBuddy 사용자 지정 모델 설정 대화상자 (OpenAI 호환 프로토콜 API만)" width="660" height="639" data-path="images/workbuddy-model-config-zh.png" />

> ℹ️ **"고급 옵션" 아래의 기능 플래그에 대하여**: Tencent Cloud의 Token Plan 같은 표준 공급자를 선택하면 도구 호출이나 이미지 입력 같은 플래그가 자동으로 채워집니다. APIYI 연결을 위해 **사용자 지정**을 선택하면 이러한 항목은 **자동 감지되지 않으므로**, 모델이 실제로 지원하는 기능에 따라 직접 체크해야 합니다:
>
> * 입력한 모델 ID의 **실제 기능**을 기준으로 판단하십시오. 확실하지 않다면 **많이보다 적게 체크하는 편이 낫습니다** — 위 스크린샷의 `claude-sonnet-5` 예시에서는 도구 호출만 활성화되어 있습니다
> * 모델이 실제로 비전 또는 향상된 추론을 지원함을 확인한 뒤에만 **이미지 입력** / **추론 모드**를 추가하십시오
> * 모델에 없는 기능을 체크하면(예: 해당 기능을 지원하지 않는 모델에서 도구 호출을 활성화하면) 요청 오류가 발생할 수 있으므로, 필요한 항목만 체크하십시오

**입력** 및 **출력** 섹션은 컨텍스트 윈도우 길이와 최대 출력 token 수를 설정합니다. 비워 두면 공급자 기본값을 사용하고, 또는 사전 설정을 선택하십시오 — 입력은 32K/64K/128K/256K, 출력은 8K/16K/32K/64K입니다. **저장**을 클릭하고 채팅 화면으로 돌아가면, 모델이 모델 선택기의 사용자 지정 그룹 아래에 나타나 바로 사용할 수 있습니다.

> ⚠️ **엔드포인트는 `https://api.apiyi.com/v1/chat/completions`처럼 전체를 입력하십시오** — 스크린샷에 보이는 것처럼 `/chat/completions`로 끝나는 전체 경로여야 합니다. `https://api.apiyi.com` 또는 `https://api.apiyi.com/v1`처럼 불완전한 주소는 요청 실패를 일으킵니다.

**추가 팁**: `api.apiyi.com/token`에서 token을 생성할 때, **일부 그룹에는 할인**이 적용됩니다(예를 들어 ClaudeCode 그룹). 이는 충전 보너스와 중복 적용됩니다. 현재 요율은 콘솔이 기준입니다.

> 💡 **왜 APIYI인가요?**
>
> * **하나의 키, 여러 공급자**: OpenAI / Anthropic / Google / DeepSeek / Zhipu / Kimi 등 나머지 전체 모델 매트릭스를 WorkBuddy에서 한 번만 설정하면 됩니다
> * **가격 우위**: 일반적으로 공식 가격보다 5%–20% 저렴하며, 일부 모델에는 충전 보너스가 있습니다
> * **중국 본토에서 직접 액세스**: 프록시 없이 해외 모델에 접근할 수 있으므로 WorkBuddy 데스크톱 클라이언트에 추가 네트워크 설정이 필요 없습니다
> * **표준 OpenAI 호환 프로토콜**: WorkBuddy의 **사용자 지정** 공급자 요구사항에 정확히 맞아떨어지며, 사용자 지정 프로토콜 스위치를 켤 필요가 없습니다

> ℹ️ **비용 및 개인정보**: 사용자 지정 모델로 발생한 모든 비용(token 소모 등)은 APIYI와 직접 정산되므로, APIYI 잔액과 사용량을 수시로 확인하십시오. API 키는 사용자의 기기에서 `workbuddy/models.json`에만 저장되며 — WorkBuddy는 이를 클라우드로 업로드하지 않습니다. 안전하게 보관하고, 사용을 중단하면 설정에서 구성을 삭제하거나 지우십시오.

## 기능 빠른 참조

| 기능                | 상세                                                                |
| ----------------- | ----------------------------------------------------------------- |
| ✨ 자연어 작업          | 새 작업 표시줄에 요구 사항을 한 문장으로 입력하면 됩니다. 복잡한 단계를 직접 나눌 필요는 없습니다          |
| 📋 자율 계획 및 실행     | 작업을 분해하고, 단계를 계획하며, 작업을 실행하고, 검토 가능한 결과를 제공합니다                    |
| 🗂️ 멀티모달 작업 처리    | 문서 / 스프레드시트 / 슬라이드 덱 / 데이터 분석 등                                   |
| 📁 로컬 파일 작업       | 승인된 로컬 폴더를 읽어 대량 정리, 이름 바꾸기, 형식 변환을 수행합니다                         |
| 📨 멀티플랫폼 어시스턴트    | WeChat, WeCom, Feishu, DingTalk, QQ 및 Yuanbao 봇을 포함한 7가지 연동 경로    |
| 🧩 스킬 마켓플레이스와 커넥터 | 선별된 무료 스킬(Agent Browser, Web Search 등)과 Tencent Docs / 지식 베이스 커넥터 |

## FAQ

### APIYI에 연결한 후 제 API 키가 WorkBuddy의 클라우드에 업로드됩니까?

아닙니다. 공식 문서에는 모델 구성 매개변수(API 키 포함)가 `workbuddy/models.json`에 로컬로 저장되며 클라우드로 업로드되지 않는다고 명시되어 있습니다. 실행 시 WorkBuddy는 전송 링크 역할만 하며, 사용자의 입력을 구성한 APIYI 엔드포인트로 전달할 뿐이고 출력은 해당 모델에서 그대로 돌아옵니다. 전송, 보안 감사, 문제 해결, 법적으로 요구되는 보존에 필요한 범위를 제외하면 WorkBuddy는 대화 내용을 읽거나 저장하지 않습니다.

### APIYI를 통해 모델을 호출할 때 비용은 어떻게 계산됩니까? WorkBuddy 크레딧이나 플랜 쿼터를 사용합니까?

아닙니다. WorkBuddy 자체의 크레딧이나 플랜 쿼터는 전혀 사용하지 않습니다. 커스텀 모델에서 발생하는 모든 비용(token 소비, 구독료 등)은 사용자가 APIYI에 직접 지불하고 정산하므로, 예기치 않은 지출을 피하려면 APIYI 잔액과 사용량을 잘 확인하십시오.

### Anthropic 네이티브 프로토콜(`anthropic_messages`)을 지원합니까?

현재는 지원하지 않습니다. WorkBuddy의 커스텀 모델 대화상자는 **OpenAI 호환 프로토콜 API만** 지원하며(대화상자 상단에 명확히 표시됨), 따라서 APIYI에 연결할 때는 OpenAI 호환 엔드포인트 `https://api.apiyi.com/v1/chat/completions`를 사용하십시오. Anthropic 네이티브 엔드포인트는 아직 지원되지 않습니다.

### “커스텀 프로토콜” 스위치는 언제 필요하며, 엔드포인트는 어느 정도까지 완전해야 합니까?

“커스텀 프로토콜” 스위치는 연결하는 모델 서비스가 비표준 URL 경로를 사용하는 게이트웨이 또는 프록시 계층 뒤에 있을 때만 필요합니다. 이 스위치를 켜면 WorkBuddy가 경로 검증을 건너뛰고 입력한 주소로 정확히 요청을 보냅니다. APIYI는 표준 `/chat/completions` 경로를 제공하므로 스위치는 기본값인 **꺼짐**으로 두십시오. 어떤 경우든 엔드포인트를 `https://api.apiyi.com/v1/chat/completions` 형식으로 전체 입력하십시오(`/chat/completions`로 끝나야 합니다). 기본 주소만(`https://api.apiyi.com` 또는 `https://api.apiyi.com/v1`) 입력하지 말고, `/v1`를 중복하지 마십시오. 그렇지 않으면 `.../v1/v1/chat/completions`는 404를 반환합니다.

### tool 호출 / 이미지 입력 / 추론 모드는 어떻게 선택해야 합니까?

Tencent Cloud의 Token Plan 같은 표준 공급자에서는 이러한 플래그가 자동으로 입력됩니다. 하지만 APIYI에 연결하는 Custom에서는 자동 감지되지 않으므로, 입력한 모델 ID가 실제로 지원하는 항목에 맞춰 수동으로 선택하십시오. 확실하지 않으면 더 많이 선택하기보다 적게 선택하십시오. 위 스크린샷에서 `claude-sonnet-5`는 tool 호출만 활성화되어 있습니다. 모델이 이를 지원함을 확인한 뒤에 이미지 입력이나 추론 모드를 추가하십시오. 모델에 없는 기능을 선택하면 요청 오류가 발생할 수 있습니다.

### “모델 이름” 필드에는 무엇을 넣어야 합니까?

APIYI 문서에 있는 모델 ID입니다. 예를 들어 `claude-sonnet-5`, `gpt-5.4`, `deepseek-v3.2`, `gemini-3.1-pro-preview` 또는 `kimi-k2.6`입니다. 모델을 바꾸려면 설정에서 해당 필드만 수정하고 저장하면 됩니다. 엔드포인트나 API 키를 다시 설정할 필요는 없습니다.

## 관련 자료

| 리소스                     | 링크                                                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 🌐 WorkBuddy 웹사이트       | `www.workbuddy.cn`                                                                                                                     |
| 📖 공식 문서 홈              | `www.workbuddy.cn/docs/workbuddy/Overview`                                                                                             |
| ⚙️ 모델 설정 문서             | `www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model`                                             |
| ⬇️ Windows / Mac 설치 가이드 | `www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Installation-Win-Guide` (Mac 가이드는 같은 디렉터리의 `Installation-Mac-Guide`입니다) |
