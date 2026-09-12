> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Codex, ClaudeCode 및 기본 그룹은 어떻게 다릅니까?

> CodexReverse, ClaudeCode 및 기본 token 그룹의 업스트림 출처, 프로토콜, 그리고 권장 개발 활용 사례를 설명합니다.

## 짧은 답변

세 그룹은 주로 **상위 소스, 요청 프로토콜, 대상 도구**에서 차이가 있습니다.

* **CodexReverse**: 일상적인 Codex 개발을 위한 리버스 엔지니어링된 Codex 리소스 채널로, 일반적인 사용성과 높은 캐시 적중률을 갖습니다
* **ClaudeCode**: Claude Code 및 Anthropic의 네이티브 `/v1/messages` 프로토콜을 사용하는 환경을 위한 전용 그룹입니다
* **Default**: GPT, Claude, Gemini, DeepSeek 및 기타 모델에 대한 혼합 접근을 위한 범용 공식 릴레이 그룹입니다

## 어떤 그룹을 사용해야 합니까?

| 그룹             | 주요 특징                                                  | 권장 사용처                                                                |
| -------------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| `CodexReverse` | 공식 API 릴레이 리소스와는 다른 출처를 사용하는 경제적인 역공학 Codex 채널입니다      | Codex CLI, Codex 코딩 작업, 비용에 민감한 개발                                    |
| `ClaudeCode`   | Anthropic의 네이티브 `/v1/messages` 프로토콜과 호환되는 모델을 모아 제공합니다 | Claude Code, Anthropic 네이티브 클라이언트, 그리고 Claude Code 내부에서 사용되는 호환 코딩 모델 |
| `Default`      | 폭넓은 모델 범위를 갖춘 일반적인 공식 릴레이 리소스입니다                       | 혼합 개발, 안정성을 우선하는 프로덕션 워크로드, 그리고 하나의 token으로 여러 모델 패밀리 사용              |

<Info>
  **“공식 릴레이”와 “역공학”은 서로 다른 상류 리소스 출처를 설명합니다.** `Default`는 공식 API 릴레이 리소스를 사용하고, `CodexReverse`는 역공학된 Codex 리소스를 사용합니다. 둘 다 정상적으로 동작할 수 있지만, 프로덕션 안정성, 요금, 캐시 동작, 그리고 모델 가용성은 다를 수 있습니다.
</Info>

## 일상 개발을 위한 권장 설정

Codex와 Claude Code를 함께 사용하는 경우, 토큰을 두 개로 분리해 두는 구성이 합리적입니다:

* Codex에서는 `CodexReverse` token을 사용합니다
* Claude Code에서는 `ClaudeCode` token을 사용합니다
* 다른 애플리케이션에서 여러 모델 제공자에 대한 혼합 접근이 필요하다면 추가로 `Default` token을 유지합니다

이렇게 하면 프로토콜과 라우트를 섞지 않으면서, 사용 로그와 비용을 더 쉽게 검토할 수 있습니다.

<Warning>
  그룹은 모델 사용 가능 여부, 라우팅, 그리고 과금 요율 배수에 영향을 미칩니다. `CodexReverse`은 공식 API 릴레이 리소스와 동일하지 않습니다. 안정성이나 소스 준수 요구사항이 엄격한 프로덕션 워크로드의 경우, `Default` 공식 릴레이 그룹을 우선 사용하고 실제 워크로드로 검증하십시오.
</Warning>

## 관련 문서

* [그룹이란 무엇입니까?](/ko/faq/groups-explained)
* [Tokens와 그룹](/ko/faq/token-and-groups)
* [Codex CLI 통합 가이드](/ko/scenarios/programming/codex-cli)
* [Claude Code 통합 가이드](/ko/scenarios/programming/claude-code)
