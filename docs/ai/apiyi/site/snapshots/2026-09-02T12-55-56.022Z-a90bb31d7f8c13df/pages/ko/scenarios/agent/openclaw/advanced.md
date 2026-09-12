> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 고급 기능 및 문제 해결

> OpenClaw 문제 해결, 사용자 정의 스킬, 메모리 기능, 다중 장치 동기화 및 보안 팁

## Troubleshooting

<AccordionGroup>
  <Accordion title="Telegram에 연결할 수 없습니다">
    일부 지역에서는 Telegram에 프록시가 필요할 수 있습니다. 터미널 프록시를 설정한 다음 Gateway를 다시 시작하십시오:

    ```bash theme={null}
    export https_proxy=http://127.0.0.1:proxy-port
    export http_proxy=http://127.0.0.1:proxy-port
    openclaw gateway restart
    ```

    아니면 Web UI를 직접 사용하십시오(프록시가 필요하지 않습니다).
  </Accordion>

  <Accordion title="구성 파일 형식 오류">
    자동으로 수정하려면 진단 명령을 실행하십시오:

    ```bash theme={null}
    openclaw doctor --fix
    ```
  </Accordion>

  <Accordion title="API 연결에 실패했습니다">
    1. API key가 올바른지 확인하십시오
    2. `baseUrl`이/가 `https://api.apiyi.com/v1`로 설정되어 있는지 확인하십시오
    3. 연결 상태를 테스트하십시오:

    ```bash theme={null}
    curl -H "Authorization: Bearer your-key" \
         https://api.apiyi.com/v1/models
    ```
  </Accordion>

  <Accordion title="런타임 로그를 확인하는 방법">
    ```bash theme={null}
    openclaw logs --follow
    ```
  </Accordion>

  <Accordion title="OpenClaw를 업데이트하는 방법">
    ```bash theme={null}
    openclaw update
    ```
  </Accordion>

  <Accordion title="새 채팅 채널을 추가하는 방법">
    ```bash theme={null}
    openclaw channels add --channel telegram
    ```
  </Accordion>
</AccordionGroup>

## 사용자 지정 스킬

OpenClaw는 사용자 지정 스킬을 지원합니다. `~/.openclaw/workspace/skills/` 디렉터리에서 만드십시오.

## 메모리 기능

OpenClaw는 대화와 선호도를 기억합니다. `/memory`를 사용하여 메모리를 확인하고 관리합니다.

## 멀티 디바이스 동기화

여러 기기에서 OpenClaw를 실행하고 Tailscale 같은 도구를 사용해 원격으로 액세스합니다.

## 보안 팁

<Warning>
  * **API Key 보안**: 설정 파일을 다른 사람과 절대 공유하지 마십시오
  * **권한 제어**: OpenClaw는 터미널 명령을 실행할 수 있으므로 위험한 작업은 피하십시오
  * **네트워크 보안**: 기본적으로 localhost에서만 수신합니다. 원격 접근을 위해 적절한 보안 조치를 구성하십시오
</Warning>

## 관련 리소스

<CardGroup cols={2}>
  <Card title="APIYI 콘솔" icon="settings" href="https://api.apiyi.com">
    API 키를 관리하고 사용량을 확인합니다
  </Card>

  <Card title="모델 추천" icon="chart-bar" href="/ko/api-capabilities/model-info">
    시나리오 기반 모델 추천을 확인합니다
  </Card>
</CardGroup>
