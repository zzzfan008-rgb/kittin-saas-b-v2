> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude의 Invalid Thinking Signature 오류는 어떻게 해결합니까?

> Claude Code 또는 Claude Agent 클라이언트에서 429 오류와 함께 Invalid signature in thinking block이 보고되는 경우, 이는 요청 제한 문제가 아닙니다. 대화 기록의 thinking 블록에서 서명이 유실되었기 때문이므로, 새 대화를 시작하여 해결하십시오.

## 간단한 답변

오류는 다음과 같습니다:

```text theme={null}
API Error: Request rejected (429) · messages.1.content.0: Invalid `signature` in `thinking` block
```

429라고 표시되지만, **이는 요청 제한이 아닙니다**. 생각 블록이 **대화 기록에서 제공업체의 서명 검증에 실패했습니다**. 재시도할 때마다 동일한 기록이 전송되므로 클라이언트 측 자동 재시도는 항상 실패합니다.

**해결 방법: 새 대화를 시작하십시오.** 에이전트, 모델 또는 키 설정을 변경할 필요는 없습니다.

## 전형적인 증상

Claude Code, Claude Agent SDK, 또는 Cherry Studio와 같은 클라이언트의 Claude Agent 모드에서 thinking이 활성화되어 있을 때:

* 메인 대화에서 응답이 전혀 생성되지 않습니다. 클라이언트에 "too many requests" 또는 "retrying in 9 seconds (5/10)"와 같은 메시지가 표시되며 10회 재시도 후 중단됩니다.
* 해당 키의 콘솔 로그에는 **성공하여 과금된 요청이 실제로 표시되지만**, 모두 적은 수의 tokens를 사용하는 소규모 요청입니다. 이는 클라이언트가 Small 모델을 통해 전송하는 보조 요청(제목, 의도 확인 등)입니다. 이전 기록이 포함되지 않으므로 정상적으로 성공합니다.
* 동일한 대화에서 "continue"를 클릭하거나 다시 질문해도 동일한 오류가 발생합니다. 새 대화는 즉시 정상 작동합니다.

## 발생 원인

thinking이 활성화되면 각 Claude 응답은 `thinking` 블록으로 시작되며, 이 블록에는 `signature`가 포함됩니다. 다음 턴에서 클라이언트는 이전 `thinking` 블록을 **서명을 포함하여 수신된 그대로** 대화 기록에 다시 전송해야 합니다. 제공자는 thinking 내용이 변경되지 않았음을 확인하기 위해 해당 서명을 검증합니다.

다음 중 하나라도 해당하면 서명 검증에 실패합니다:

<CardGroup cols={2}>
  <Card title="서명 누락 또는 빈 서명" icon="file-x">
    클라이언트가 대화를 저장할 때 서명을 저장하지 않아 빈 `signature` 문자열을 다시 보내거나 필드를 누락하는 경우입니다. 여러 클라이언트에서 이러한 버그가 발생한 적이 있으며, thinking이 파일 읽기 등의 도구 호출과 결합될 때 가장 자주 발생합니다.
  </Card>

  <Card title="변경된 thinking 내용" icon="pencil">
    대화 기록을 직접 편집하거나, 클라이언트 측에서 기록을 압축 또는 잘라내거나, 프록시가 요청 본문의 형식을 다시 지정하면 thinking 내용과 서명이 일치하지 않게 됩니다.
  </Card>

  <Card title="대화 도중 모델 변경" icon="shuffle">
    모델 A가 thinking 블록을 생성한 상태에서 모델 B로 동일한 대화를 이어가면, 모델 B는 모델 A가 남긴 서명을 수락하지 않을 수 있습니다.
  </Card>

  <Card title="대화 도중 키 또는 그룹 변경" icon="key">
    대화 도중에 키 또는 token 그룹을 변경하면 이후 요청이 다른 경로를 통해 처리될 수 있으며, 이전 서명이 해당 경로에서 검증을 통과하지 못할 수 있습니다.
  </Card>
</CardGroup>

오류에 표시된 `messages.1.content.0`은(는) 대화 기록에서 **첫 번째 assistant 응답의 첫 번째 콘텐츠 블록**을 가리키며, 이는 첫 턴의 thinking 블록에 해당합니다. 이 블록이 한 번 손상되면 해당 대화의 이후 모든 턴이 실패합니다.

## 해결 방법

<Steps>
  <Step title="새 대화를 시작하십시오">
    클라이언트에서 새 대화를 생성하고, 파일을 다시 업로드한 후 다시 질문하십시오. 동일한 에이전트, 모델, 키를 유지하십시오. 이것이 가장 빠르고 확실한 해결 방법입니다.
  </Step>

  <Step title="대화당 하나의 모델과 하나의 키를 사용하십시오">
    다른 모델이나 키가 필요한 경우 새 대화에서 전환하십시오. 이미 사고 이력이 포함된 대화 내에서는 전환하지 마십시오.
  </Step>

  <Step title="이력을 직접 수정하지 마십시오">
    이전 어시스턴트 메시지의 사고 내용을 수정하거나 삭제하지 마십시오. 컨텍스트를 줄이려면 클라이언트의 내장 압축 기능을 사용하거나 새 대화를 시작하십시오.
  </Step>

  <Step title="클라이언트를 업데이트하십시오">
    새 대화에서 몇 턴 진행한 후에도 오류가 다시 발생한다면, 클라이언트가 이력을 저장할 때 서명을 누락하고 있을 가능성이 높습니다. 최신 버전으로 업데이트하고 재현 단계를 클라이언트 개발자에게 제보하십시오.
  </Step>
</Steps>

<Tip>
  **자체 코드에서 API를 호출하는 경우**: 이력을 다시 전송할 때는 각 `thinking` 블록을 (`signature` 필드 포함) **있는 그대로 유지**하거나 **블록 전체를 제거**하십시오. 사고 텍스트만 남겨두고 서명을 누락해서는 절대 안 됩니다. 공식 SDK를 사용할 때는 이전 응답의 `content` 배열을 변경하지 않고 그대로 `messages`에 다시 넣으십시오.
</Tip>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="오류 메시지에 429가 표시됩니다. 요청 속도를 낮춰야 합니까?">
    아닙니다. 요청 내용이 유효하지 않은 것이며, 요청 속도와는 무관합니다. 요청 간격을 늘리거나 나중에 다시 시도해도 해결되지 않습니다. `Invalid signature in thinking block`가 표시되면 새 대화를 시작하십시오.
  </Accordion>

  <Accordion title="실패한 요청에 대해서도 과금됩니까?">
    아닙니다. 모델이 생성을 시작하기 전에 서명 검증에 실패하므로, 이러한 요청에는 비용이 발생하지 않으며 콘솔 로그에도 나타나지 않습니다. 확인되는 과금 내역은 성공한 요청에서 발생한 것이며, 대개 클라이언트의 작은 보조 요청들입니다.
  </Accordion>

  <Accordion title="추론 기능을 꺼서 문제를 우회할 수 있습니까?">
    동일한 대화 내에서 추론 기능을 꺼도 도움이 되지 않을 수 있습니다. 이미 대화 기록에 포함된 추론 블록이 계속 전송되기 때문입니다. 새 대화를 시작하는 것이 더 안정적입니다. 해당 작업에 추론이 필요하지 않다면 새 대화를 시작하여 `-thinking` 접미사가 없는 모델로 전환할 수도 있습니다.
  </Accordion>

  <Accordion title="새 대화에서도 계속 발생합니다. 어떻게 해야 합니까?">
    오류가 발생한 대략적인 시간(시간대 포함, 예: `17:00 (UTC+8)`), 클라이언트 및 버전, 모델명을 기재하여 지원팀에 문의해 주십시오. 시간을 기준으로 해당 대화의 요청을 찾아 조사를 도와드릴 수 있습니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Claude Effort 및 Thinking 가이드" icon="brain" href="/ko/api-capabilities/claude-effort-thinking">
    thinking 켜기 및 끄기, 스트리밍 이벤트, 시그니처 다시 전달하기
  </Card>

  <Card title="Claude 네이티브 포맷: 스트리밍 및 비스트리밍 응답" icon="sparkles" href="/ko/api-capabilities/claude-response-handling">
    `thinking` 블록과 `signature_delta`의 구조
  </Card>

  <Card title="Claude Code" icon="terminal" href="/ko/scenarios/programming/claude-code">
    Claude Code에서 APIYI 설정하기
  </Card>

  <Card title="API 동시 실행 수 제한은 어떻게 됩니까?" icon="gauge" href="/ko/faq/api-concurrency">
    동시 실행 수 및 요청 제한 설명
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.