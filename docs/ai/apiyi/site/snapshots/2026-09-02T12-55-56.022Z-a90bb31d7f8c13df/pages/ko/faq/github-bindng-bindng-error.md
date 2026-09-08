> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GitHub 로그인 시 '계정이 이미 연결됨'이 표시되나요?

> GitHub로 APIYI에 로그인할 때 '이 GitHub 계정은 이미 연결되어 있습니다' 오류를 수정합니다

## 빠른 답변

먼저 **같은 브라우저**에서 `github.com`에 로그인한 다음, APIYI 웹사이트에서 GitHub 원클릭 로그인을 사용해야 합니다. **반드시 Chrome 브라우저를 사용하십시오**.

## 증상

GitHub 계정으로 APIYI에 로그인하려고 하면 다음 오류 메시지가 표시됩니다:

> 이 GitHub 계정은 이미 연결되어 있습니다

이로 인해 정상적으로 로그인할 수 없습니다.

## 해결 단계

<Steps>
  <Step title="Chrome 브라우저 열기">
    이 과정에서는 반드시 **Chrome 브라우저**를 사용하십시오. 로그인 흐름이 올바르게 작동하도록 Safari, Firefox 등 다른 브라우저는 사용하지 마십시오.
  </Step>

  <Step title="GitHub에 로그인">
    Chrome에서 `github.com`를 열고 올바른 GitHub 계정으로 로그인되어 있는지 확인하십시오.

    이전에 다른 GitHub 계정으로 로그인한 적이 있다면 먼저 로그아웃한 다음 APIYI에 연결된 계정으로 로그인하십시오.
  </Step>

  <Step title="APIYI에 로그인">
    **같은 Chrome 브라우저**에서 APIYI 웹사이트를 열고 "GitHub 원클릭 로그인" 버튼을 클릭하여 로그인을 완료하십시오.

    <Warning>
      두 단계를 반드시 같은 브라우저에서 완료해야 합니다. 각 단계마다 다른 브라우저를 사용하지 마십시오.
    </Warning>
  </Step>
</Steps>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="왜 Chrome 브라우저를 사용해야 합니까?">
    Chrome은 GitHub OAuth 로그인 흐름과의 호환성이 가장 좋습니다. 다른 브라우저에서는 Cookie 또는 세션 동기화 문제로 인해 로그인에 실패할 수 있습니다.
  </Accordion>

  <Accordion title="Chrome을 사용 중인데도 여전히 작동하지 않습니다. 어떻게 해야 합니까?">
    다음을 시도해 보십시오:

    * Chrome의 캐시와 쿠키를 삭제합니다
    * Chrome이 시크릿 모드가 아닌지 확인합니다
    * 브라우저 확장 프로그램이 타사 쿠키를 차단하고 있는지 확인합니다
    * GitHub에서 로그아웃한 다음 다시 로그인하고, APIYI 원클릭 로그인을 다시 시도합니다
  </Accordion>

  <Accordion title="연결된 GitHub 계정을 어떻게 변경합니까?">
    연결된 GitHub 계정을 변경해야 하는 경우 고객 지원에 문의하여 도움을 받으십시오.
  </Accordion>
</AccordionGroup>

## 문의하기

<Card title="지원팀에 문의" icon="message-circle">
  위의 단계를 따라도 문제가 지속되면, 도움을 받기 위해 지원팀에 문의해 주십시오.
</Card>
