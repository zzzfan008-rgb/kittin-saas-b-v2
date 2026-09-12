> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API 키를 안전하게 관리하려면 어떻게 해야 합니까?

> IP 화이트리스트, 모델 화이트리스트, 지출 한도, 유출된 키를 확인하는 방법까지 다루는 API 키 보안의 체계적인 안내서입니다

## 간단한 답변

키의 최대 지출 가능 금액은 **계정 잔액**입니다. 즉, 어떤 단일 키라도 유출되면 최악의 경우 손실은 계정에 남아 있는 전부입니다.

키를 보호하는 일은 네 가지로 정리됩니다. **용도별로 별도의 키를 발급하고, 각 키에 권한 경계를 부여하며, 단일 키가 지출할 수 있는 금액을 제한하고, 다른 사람이 볼 수 있는 곳에 키를 두지 않는 것입니다.**

<Warning>
  **가장 흔히 간과되는 항목**: 키에서 "무제한 쿼터"를 켜 둔 채로 두면 그 하나의 키를 통해 전체 계정 잔액이 노출됩니다. 특히 테스트 키에는 항상 지출 한도를 설정해야 합니다.
</Warning>

## 1. 토큰에 권한 경계 설정하기

토큰을 만들 때 \*\*“고급 옵션 활성화”\*\*를 선택하면 IP 허용 목록과 사용 가능한 모델 설정이 표시됩니다.

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/FBHa7JBOo1YFoQia/images/token-security-advanced-options.png?fit=max&auto=format&n=FBHa7JBOo1YFoQia&q=85&s=7c84c17523049b5806fea2ebcff96ea8" alt="고급 token 옵션: 사용 가능한 모델과 IP 허용 목록" width="1246" height="1192" data-path="images/token-security-advanced-options.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/FBHa7JBOo1YFoQia/images/token-security-advanced-options.png?fit=max&auto=format&n=FBHa7JBOo1YFoQia&q=85&s=7c84c17523049b5806fea2ebcff96ea8" alt="고급 token 옵션: 사용 가능한 모델과 IP 허용 목록" width="1246" height="1192" data-path="images/token-security-advanced-options.png" />

### IP 허용 목록(프로덕션 환경에서 권장)

이는 **사용 가능한 가장 강력한 보호 수단**입니다. 한 번 설정하면 지정된 IP에서만 이 token을 사용할 수 있으며, key가 유출되더라도 다른 어떤 머신에서도 사용할 수 없습니다.

| 형식      | 예시                   |
| ------- | -------------------- |
| 단일 IP   | `192.168.1.1`        |
| CIDR 범위 | `192.168.1.0/24`     |
| 여러 주소   | 여러 항목을 함께 나열할 수 있습니다 |

<Tip>
  프로덕션 서버는 보통 고정 IP를 사용하므로 IP 허용 목록에 매우 적합합니다. 서버의 **공인 송출 IP**를 입력하고 내부 주소는 입력하지 마십시오.
</Tip>

<Warning>
  **동적 IP 연결에서는 이 기능을 사용하지 마십시오.** 가정용 광대역과 사무실 네트워크는 송출 IP가 바뀌며, 바뀌는 순간 모든 호출이 실패합니다. 그런 환경에서는 대신 지출 한도를 사용하십시오.
</Warning>

### 사용 가능한 모델 허용 목록(전용 token용)

“사용 가능한 모델”을 **비워 두면 제한이 없습니다** — token은 플랫폼의 어떤 모델이든 호출할 수 있습니다. 한 번 값을 채우면 token은 나열한 모델만 **사용할 수 있습니다**.

이는 양날의 검입니다:

<CardGroup cols={2}>
  <Card title="적합한 경우" icon="circle-check">
    단일 목적 token: 이미지 생성만 하는 서비스, 외부 협업자와 공유하는 token, 또는 모델별 예산 분리.
  </Card>

  <Card title="부적합한 경우" icon="circle-x">
    일상적인 개인 사용과 탐색적 테스트. 모델을 바꿀 때마다 콘솔로 돌아가야 하며, 모델 별칭이 맞지 않으면 호출이 실패할 수 있습니다.
  </Card>
</CardGroup>

<Note>
  대부분의 경우 사용 가능한 모델을 설정하는 것을 **권장하지 않습니다**. 전체 절충점 분석은 [token에 사용 가능한 모델을 설정해야 합니까?](/ko/faq/token-model-whitelist)를 참조하십시오.
</Note>

## 2. 토큰에 지출 상한 설정하기

이 항목은 **모든 사람**에게 적용되며, 테스트 키에는 더욱 그렇습니다.

토큰을 만들 때는 “Unlimited Quota”를 끄고 “Authorized Quota”에 금액을 입력하십시오. 또는 필드 아래에 있는 사전 설정값(\$5 / \$20 / \$50 / \$100 / \$200 / \$500) 중 하나를 사용하십시오.

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/FBHa7JBOo1YFoQia/images/token-security-quota.png?fit=max&auto=format&n=FBHa7JBOo1YFoQia&q=85&s=2b37947ea48dc8503723b6fef3e67171" alt="Token quota settings: disable unlimited quota and set an amount" width="1256" height="1024" data-path="images/token-security-quota.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/FBHa7JBOo1YFoQia/images/token-security-quota.png?fit=max&auto=format&n=FBHa7JBOo1YFoQia&q=85&s=2b37947ea48dc8503723b6fef3e67171" alt="Token quota settings: disable unlimited quota and set an amount" width="1256" height="1024" data-path="images/token-security-quota.png" />

쿼터의 목적은 **감당할 수 있는 금액으로 손실을 제한하는 것**입니다.

* 유출된 키의 쿼터가 \$20이면 최대 손실은 \$20입니다.
* “Unlimited Quota”가 켜진 유출된 키는 **계정 잔액 전체**를 소진할 수 있습니다.

<Info>
  토큰의 최대 지출 가능 금액은 **계정 잔액에 의해 제한됩니다**. \$500 쿼터를 설정해도 그 금액이 따로 예약되거나 동결되지는 않습니다. 이는 해당 토큰의 소비 상한일 뿐입니다. 실제로 사용할 수 있는 금액은 여전히 사용 가능한 잔액에 따라 달라집니다.
</Info>

## 3. 운영 키와 테스트 키를 분리해서 유지하기

실제 트래픽과 로컬 테스트에 같은 키를 절대 사용하지 마십시오. 분리해 두면 문제가 있는 테스트 token을 프로덕션에 손대지 않고 바로 비활성화할 수 있습니다.

|               | 프로덕션 키                   | 테스트 키                     |
| ------------- | ------------------------ | ------------------------- |
| **IP 화이트리스트** | 권장됨(서버 IP가 고정됨)          | 보통 끔(IP가 변경됨)             |
| **승인된 쿼터**    | 트래픽을 기준으로 추정하고 여유를 두십시오  | **항상 하나 설정**, \$5–\$50 권장 |
| **사용 가능한 모델** | 선택 사항; 안정적인 워크로드라면 잠그십시오 | 손쉽게 모델을 전환할 수 있도록 비워 두십시오 |
| **만료**        | 만료되지 않도록 설정할 수 있음        | 만료일을 설정하십시오               |
| **개수**        | 프로젝트 또는 서비스당 하나          | 테스트 작업당 하나, 완료되면 비활성화     |

<Tip>
  콘솔에서 token에 **알아보기 쉬운 이름**을 지정하십시오(예: `prod-image-service`, `test-model-compare-0729`). 기본값보다 이렇게 해 두면 문제가 생겼을 때 올바른 token을 찾고 비활성화하는 일이 훨씬 빨라집니다. [Tokens and Groups](/ko/faq/token-and-groups)를 참조하십시오.
</Tip>

## 4. 이러한 위치에서 키를 지키십시오

### 코드 저장소

이것이 압도적으로 가장 흔한 유출 경로입니다. 키가 Git에 커밋되면 **파일을 삭제한 뒤에도 커밋 기록에 그대로 남아 있으며**, 저장소 접근 권한이 있는 사람이라면 누구나 찾아낼 수 있습니다.

대신 환경 변수에서 읽으십시오:

```python theme={null}
import os

api_key = os.environ["APIYI_API_KEY"]   # Correct
api_key = "sk-your-api-key"             # Wrong: a real key hardcoded in source
```

`.env`를 `.gitignore`에 추가하고, **커밋하기 전에 스캔하십시오**. 이 명령은 자체 점검용으로 사용할 수 있습니다:

```bash theme={null}
grep -rnE '(^|[^A-Za-z0-9])sk-[A-Za-z0-9]{10,}' .
```

<Note>
  이 패턴에서 `(^|[^A-Za-z0-9])` 접두사는 중요합니다. 이것이 없으면 `sk-`가 `task-`, `risk-`, `disk-` 같은 일반적인 단어 안에서 등장할 때 엄청난 양의 오탐이 발생하여 실제 결과를 묻어버립니다.
</Note>

### 공개 문서, 스크린샷, 로그

문서나 기술 글을 게시하기 전에 본문, 코드 예제, **스크린샷**을 검토하십시오. 콘솔 스크린샷, 터미널 녹화, 오류 로그에는 실제 키가 그대로 들어 있는 경우가 흔합니다. 모든 예제에서 `sk-your-api-key` 같은 자리표시자를 사용하십시오.

<Warning>
  **공개 GitHub 저장소는 특히 위험합니다.** 자동화 봇이 지속적으로 스캔하며, 유출된 키는 종종 몇 분 안에 악용됩니다. 프로젝트를 오픈소싱하기 전에 코드와 커밋 기록 어느 쪽에도 실제 키가 없는지 확인하십시오.
</Warning>

### AI 및 AI 에이전트와의 대화

이 위험 경로는 불과 몇 년밖에 되지 않았고, 가장 과소평가되는 경로이기도 합니다.

채팅창에 키를 붙여 넣으면 일시적으로 느껴지지만, 실제로는 다음과 같습니다:

<CardGroup cols={2}>
  <Card title="전사본이 디스크에 기록됩니다" icon="hard-drive">
    AI 코딩 도구는 보통 전체 대화를 평문 파일로 사용자의 기기에 저장하며, 이는 무기한 보관되고 자동으로 정리되지 않습니다.
  </Card>

  <Card title="다시 이어서 하면 재전송됩니다" icon="repeat">
    오래된 세션을 다시 이어서 하면 전체 전사본이 컨텍스트로 다시 전송되므로, 키는 가만히 있지 않습니다.
  </Card>

  <Card title="파일 스냅샷이 복제합니다" icon="copy">
    이러한 도구는 편집 전후로 파일을 스냅샷하는 경우가 많아서, 키가 들어 있는 스크립트가 여러 번 복사된 상태가 됩니다.
  </Card>

  <Card title="로컬 프로세스라면 누구나 읽을 수 있습니다" icon="folder-open">
    이러한 파일은 **사용자 권한으로 실행 중인 어떤 프로그램이든** 읽을 수 있으며, 이는 코드 저장소보다 경계가 더 약합니다.
  </Card>
</CardGroup>

<Tip>
  **AI 도구와 에이전트에는 항상 일회용 키를 사용하십시오**: 별도로 생성하고, 소액의 쿼터(예: \$5)와 짧은 만료 기간을 부여한 다음, 작업이 끝나는 즉시 콘솔에서 삭제하십시오. 절대로 운영용 키를 AI 도구에 넘기지 마십시오.
</Tip>

## 키가 이미 유출된 경우 해야 할 일

<Steps>
  <Step title="토큰을 즉시 삭제하거나 비활성화합니다">
    [token 페이지](https://api.apiyi.com/token)로 이동하여 영향을 받은 토큰을 삭제하거나 비활성화합니다. 이것이 즉시 피해 확산을 막는 유일한 조치이며, **조사보다 먼저** 수행해야 합니다.
  </Step>

  <Step title="대체 토큰을 만듭니다">
    이번에는 지출 한도와 적용되는 모든 권한 경계를 설정한 새 토큰을 발급한 다음 애플리케이션 구성을 업데이트합니다.
  </Step>

  <Step title="로그에서 영향 여부를 확인합니다">
    노출 기간 동안 [호출 로그](/ko/faq/call-logs)를 검토하여 이상 징후가 있는지 확인합니다. 익숙하지 않은 모델, 비정상적으로 많은 사용량, 또는 근무하지 않던 시간대의 요청을 살펴보십시오.
  </Step>

  <Step title="유출 원인을 정리합니다">
    키가 실제로 어디에서 유출되었는지 추적합니다. 코드, 문서, 스크린샷, 채팅 기록 등을 모두 찾아서 정리해야 합니다. 그렇지 않으면 대체 키도 같은 방식으로 유출됩니다.
  </Step>
</Steps>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="IP 화이트리스트를 설정했는데 이제 모든 호출이 실패합니다. 무엇이 잘못되었습니까?">
    가장 가능성이 높은 원인은 잘못된 IP입니다. 내부 주소인 `192.168.x.x`가 아니라 서버의 **공개 egress IP**가 필요합니다.

    집 회선이나 사무실 네트워크에서 호출하는 경우, egress IP는 ISP에 따라 바뀌며 이런 환경은 IP 화이트리스트와 잘 맞지 않습니다. 대신 지출 한도를 사용하십시오.

    문제를 해결하려면 먼저 IP 화이트리스트를 지운 다음 호출이 복구되는지 확인하고, 그 후 올바른 IP를 하나씩 다시 추가하십시오.
  </Accordion>

  <Accordion title="쿼터를 설정하면 미리 돈이 차감되거나 묶입니까?">
    아닙니다. 승인된 쿼터는 해당 token의 **지출 상한**일 뿐이며, 선결제나 보류가 아닙니다.

    계정에 \$50만 보유한 상태에서도 token 5개에 각각 \$100의 쿼터를 줄 수 있습니다. 이들은 그 \$50을 함께 사용하며, 한 번 소진되면 모두 동작하지 않습니다. token의 최대 지출 가능액은 항상 계정 잔액으로 제한됩니다.
  </Accordion>

  <Accordion title="하나의 계정은 token을 몇 개까지 만들 수 있습니까?">
    제한은 없습니다. 필요한 만큼 만드십시오.

    프로젝트와 환경 기준으로 나누는 것을 권장합니다. 예: `prod-support-bot`, `prod-image-service`, `test-model-eval`. 더 세분화된 token은 다른 것에 영향을 주지 않고 정확히 하나만 비활성화할 수 있으며, 각 token의 지출과 로그를 개별적으로 검토할 수 있습니다.
  </Accordion>

  <Accordion title="token의 쿼터를 다 쓰면 끝인가요?">
    아닙니다. 쿼터가 소진되면 호출은 거부되지만 token 자체는 그대로 남습니다. 콘솔에서 token을 편집하고 승인된 쿼터를 올리기만 하면 다시 사용할 수 있습니다 — 새로 만들거나 설정을 업데이트할 필요가 없습니다.

    그래서 지출 한도를 설정할 가치가 있습니다. 되돌릴 수 있는 제동장치일 뿐, 일방적인 파괴가 아닙니다.
  </Accordion>

  <Accordion title="다른 사람이 내 key를 사용하고 있는지 어떻게 알 수 있습니까?">
    호출 로그를 확인하십시오. 가장 중요한 신호는 세 가지입니다: 전혀 사용하지 않는 모델, 근무 시간 외의 호출, 그리고 업무량과 맞지 않는 요청량입니다.

    전체 절차는 [예상치 못한 키 사용을 어떻게 조사합니까?](/ko/faq/troubleshoot-key-usage)를 참조하십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="토큰 및 그룹" icon="key" href="/ko/faq/token-and-groups">
    token 생성, 편집 및 그룹화에 대한 전체 레퍼런스입니다.
  </Card>

  <Card title="Token Model Whitelist" icon="list" href="/ko/faq/token-model-whitelist">
    사용 가능한 모델을 설정할지 여부와 주의해야 할 사항입니다.
  </Card>

  <Card title="키 사용 조사" icon="search" href="/ko/faq/troubleshoot-key-usage">
    로그를 사용해 예상치 못한 사용 뒤에 있는 실제 호출자를 특정합니다.
  </Card>

  <Card title="플랫폼 데이터 보안" icon="shield" href="/ko/faq/data-security">
    APIYI가 트래픽을 암호화하고 플랫폼 측에서 데이터를 보호하는 방법입니다.
  </Card>
</CardGroup>

<Info>
  보안은 결코 사소한 문제가 아닙니다. 위의 모든 설정은 [token 관리 페이지](https://api.apiyi.com/token)에 있으며 — 몇 분만 설정하면 대부분의 위험을 차단할 수 있습니다.
</Info>
