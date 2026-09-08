> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Code 400 오류 해결

> Claude Code가 APIYI의 AWS Claude(Bedrock) 공식 채널에서 400 / ValidationException을 반환하는 이유와 이를 해결하는 방법

## 📌 문제

일부 사용자는 Claude Code를 실행하는 동안 다음과 같은 오류를 겪습니다:

* `400 ValidationException`
* `Extra inputs are not permitted`
* `cache_control.scope`를 언급하는 오류

이러한 문제는 거의 항상 **Claude Code의 실험적 베타 매개변수** 때문에 발생하며, 이는 APIYI가 제공하는 공식 Amazon Claude API(AWS Claude / Bedrock) 채널에서 **지원되지 않습니다**.

<Info>
  이 가이드는 **AWS Claude (Bedrock) 공식 채널**을 통해 전달되는 요청에만 적용됩니다. 기본 Anthropic API 채널은 이러한 베타 매개변수를 지원하므로, 아래 변경 사항은 필요하지 않습니다.
</Info>

## ✅ 해결 방법 (권장)

Claude Code의 실험적 베타 기능을 비활성화합니다.

### 옵션 1: settings.json 편집 (권장)

환경 변수를 Claude Code `settings.json`에 추가합니다:

```json theme={null}
"env": {
  "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS": "1"
}
```

### 옵션 2: 임시 적용 (현재 터미널 세션)

터미널에서 다음을 실행합니다:

```bash theme={null}
export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1
```

그다음 Claude Code를 다시 시작합니다.

<Tip>
  옵션 2는 현재 터미널 창에만 적용되며 닫으면 사라집니다. 영구적으로 적용하려면 옵션 1 또는 옵션 3을 사용합니다.
</Tip>

### 옵션 3: 영구 적용 (권장)

사용 환경에 따라 셸 설정 파일에 변수를 기록합니다.

#### Mac / Linux (bash)

```bash theme={null}
echo 'export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1' >> ~/.bashrc
source ~/.bashrc
```

#### Mac (zsh, 기본값)

```bash theme={null}
echo 'export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1' >> ~/.zshrc
source ~/.zshrc
```

#### Windows (PowerShell)

```powershell theme={null}
[System.Environment]::SetEnvironmentVariable("CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS", "1", "User")
```

그다음 터미널을 다시 시작합니다.

## 🔍 이 현상이 발생하는 이유(기술적으로 살펴보면)

Claude Code는 기본적으로 다음과 같은 여러 beta 기능을 활성화합니다.

* `cache_control`
* 확장된 `tool` 필드
* `scope` 같은 추가 매개변수

이러한 매개변수는 다음과 같습니다.

* 👉 네이티브 Anthropic API에서 지원됩니다
* 👉 하지만 AWS Bedrock Claude에서는 유효하지 않은 필드로 거부되어 HTTP 400이 반환됩니다

이 스위치를 끄면 다음과 같습니다.

* ✔ 요청이 표준 구조로 되돌아갑니다
* ✔ AWS Claude와의 완전한 호환성 확보

## 🚨 이 변수가 필요한 경우

다음 중 하나라도 해당된다면, **이 변수를 설정하는 것을 강력히 권장합니다**:

* AWS Bedrock Claude와 함께 Claude Code를 사용하는 경우
* 서드파티 프록시(API 게이트웨이 또는 포워딩 서비스)를 거치는 경우
* 400 / ValidationException 오류가 보이는 경우

참고 자료:

* Claude 공식 문서 — 환경 변수: `code.claude.com/docs/en/env-vars`
* 관련 이슈: `github.com/anthropics/claude-code/issues/21676`

## 🔎 모델이 속한 그룹 확인하기

주어진 모델을 어떤 그룹에서 사용할 수 있는지 잘 모르시겠습니까? 모델 과금 페이지에서 확인할 수 있습니다:

[APIYI 모델 과금 페이지](https://api.apiyi.com/modelPricing)를 열고 모델 이름을 검색하여 사용할 수 있는 그룹을 확인하십시오.

예를 들어, **ClaudeCode 그룹**은 최신 Claude 모델 시리즈와 별도로 구성된 `glm-5.1` 및 `qwen3.7-max`를 지원합니다.

## 💡 아직도 작동하지 않습니까?

수정 사항을 적용한 후에도 오류가 지속되면 다음을 확인하십시오.

* 환경 변수가 실제로 적용되었는지 확인하십시오(`echo $CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS`를 실행하고 `1`가 출력되는지 확인하십시오)
* 실제로 AWS Claude (Bedrock) 채널을 사용하고 있는지 확인하십시오
* 설정을 변경한 후 터미널 또는 IDE를 다시 시작했는지 확인하십시오

## 📞 지원

여전히 해결되지 않는다면, 더 자세히 살펴볼 수 있도록 다음 정보를 보내주십시오.

* 오류 스크린샷
* 요청 로그(Request ID)
* 사용 중인 모델 이름

문제를 함께 추적해 드리겠습니다.
