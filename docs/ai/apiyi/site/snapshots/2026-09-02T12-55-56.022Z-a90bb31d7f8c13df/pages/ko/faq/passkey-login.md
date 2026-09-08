> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Passkey로 어떻게 로그인하나요?

> APIYI는 이제 패스키 로그인을 지원합니다. 프로필 페이지에서 하나를 연결한 뒤 지문, 얼굴 인식, 또는 기기 화면 잠금으로 로그인할 수 있습니다. 기억해야 할 비밀번호가 없고, 피싱과 자격 증명 스터핑에도 영향을 받지 않습니다.

## 간단한 답변

APIYI는 이제 **패스키** 로그인을 지원합니다. 한 번 바인딩하면, 평소 자주 사용하는 기기에서 로그인할 때는 **지문, 얼굴 인식, 또는 기기의 화면 잠금**만 있으면 됩니다. 계정 비밀번호는 필요하지 않습니다.

바인딩 위치: 로그인한 뒤 **Profile → 맨 아래로 스크롤 → Account Options → Bind Passkey**로 이동하면, `https://api.apiyi.com/account/profile`에서 가능합니다.

<Info>
  **왜 해둘 만한가**: 기억해야 할 비밀번호가 없으며(비밀번호 분실은 로그인 지원 요청 중 압도적으로 가장 흔합니다), 패스키는 본질적으로 피싱과 크리덴셜 스터핑에 강합니다. 개인 키는 기기나 비밀번호 관리자 밖으로 절대 나가지 않고, 서버에 탈취할 수 있는 비밀번호도 저장되지 않습니다.
</Info>

## 패스키란 무엇입니까

패스키는 WebAuthn / FIDO2 표준을 기반으로 한 비밀번호 없는 로그인입니다. 하나를 연결하면 기기에서 키 쌍이 생성됩니다.

* **개인 키**는 기기의 보안 요소 또는 비밀번호 관리자에 유지되며 **절대 업로드되지 않습니다**;
* **공개 키**는 APIYI에 저장되며 서명 검증만 할 수 있습니다 — 개인 키를 도출하는 데는 사용할 수 없습니다.

로그인할 때 기기가 개인 키로 챌린지에 서명하고, 사용자는 **지문, 얼굴 인식 또는 화면 잠금**으로 해당 서명을 승인하기만 하면 됩니다.

<CardGroup cols={3}>
  <Card title="비밀번호를 잊어버릴 일이 없습니다" icon="face-slightly-smiling">
    생체 인식 기능이 있는 기기에서는 바로 로그인됩니다 — 이메일 재설정 절차가 없습니다
  </Card>

  <Card title="설계상 피싱에 강합니다" icon="shield">
    패스키는 도메인에 바인딩되므로 유사한 사이트는 아예 인증을 유도할 수 없습니다
  </Card>

  <Card title="크리덴셜 스터핑에 면역입니다" icon="database">
    서버에 유출될 비밀번호가 없으므로, 다른 곳의 침해가 여기서의 계정에까지 영향을 미치지 않습니다
  </Card>
</CardGroup>

## 패스키를 바인딩하는 방법

<Warning>
  **전제 조건**: 패스키를 바인딩하려면 이미 **로그인한 상태**여야 합니다. 이는 기존 계정에 로그인 방법을 추가하는 것이며, 새 계정을 등록하는 데는 사용할 수 없습니다.
</Warning>

<Steps>
  <Step title="프로필 페이지를 여세요">
    로그인한 후 `https://api.apiyi.com/account/profile`로 이동하거나, 왼쪽 내비게이션에서 **프로필**을 클릭합니다.
  </Step>

  <Step title="아래로 스크롤하여 계정 옵션을 찾으세요">
    페이지 맨 아래에 있는 **계정 옵션** 카드에서 **패스키 바인딩**을 클릭합니다.

    <img className="block dark:hidden" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-bind-entry.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=da1fed1a77375353d8c18757f1c97bb6" alt="프로필 페이지 하단의 계정 옵션 및 패스키 바인딩 버튼" width="1100" height="818" data-path="images/passkey-bind-entry.png" />

    <img className="hidden dark:block" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-bind-entry.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=da1fed1a77375353d8c18757f1c97bb6" alt="프로필 페이지 하단의 계정 옵션 및 패스키 바인딩 버튼" width="1100" height="818" data-path="images/passkey-bind-entry.png" />
  </Step>

  <Step title="저장할 위치를 선택하세요">
    브라우저가 apiyi.com의 패스키를 어디에 저장할지 묻는 시스템 대화상자를 엽니다. 설정에 맞는 항목을 선택하세요.

    <img className="block dark:hidden" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-save-location.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=e072625a14951e7bd893eac489745d79" alt="패스키를 저장할 위치를 묻는 대화상자" width="896" height="1010" data-path="images/passkey-save-location.png" />

    <img className="hidden dark:block" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-save-location.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=e072625a14951e7bd893eac489745d79" alt="패스키를 저장할 위치를 묻는 대화상자" width="896" height="1010" data-path="images/passkey-save-location.png" />

    | 저장 위치                   | 적합한 대상                  | 동작                          |
    | ----------------------- | ----------------------- | --------------------------- |
    | iCloud Keychain         | Mac / iPhone / iPad 사용자 | Apple 기기 간에 자동으로 동기화됩니다     |
    | Google Password Manager | Chrome / Android 사용자    | 기기 간에 동기화되며, 기기를 바꿔도 유지됩니다  |
    | 휴대폰, 태블릿 또는 보안 키        | 다른 사람의 컴퓨터에서 임시로 로그인할 때 | QR 코드를 스캔하고 자신의 휴대폰에서 인증합니다 |
    | 이 브라우저 프로필              | 항상 사용하는 한 대의 컴퓨터        | 이 기기에만 유지되며, 동기화되지 않습니다     |
  </Step>

  <Step title="인증하면 완료됩니다">
    안내에 따라 **지문, 얼굴 인식 또는 화면 잠금**으로 확인합니다. 이후에는 로그인 페이지에서 패스키 로그인을 선택하면 한 번의 인증으로 로그인됩니다.
  </Step>
</Steps>

## 상태 확인 및 연결 해제

연결이 완료되면 **프로필 → 계정 옵션**으로 돌아가며 버튼이 **Unbind Passkey**로 바뀌고, 옆에 **마지막 사용 날짜**가 표시됩니다. 이를 통해 패스키가 사용되었는지, 언제 사용되었는지 빠르게 확인할 수 있습니다.

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-unbind-status.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=8837d8cccc7975fc3cf6c1443975753a" alt="연결 후 마지막 사용 날짜가 표시된 Unbind Passkey 버튼" width="1642" height="300" data-path="images/passkey-unbind-status.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-unbind-status.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=8837d8cccc7975fc3cf6c1443975753a" alt="연결 후 마지막 사용 날짜가 표시된 Unbind Passkey 버튼" width="1642" height="300" data-path="images/passkey-unbind-status.png" />

제거하려면 언제든지 **Unbind Passkey**를 클릭하면 됩니다. 연결을 해제해도 계정은 기존 로그인 방식으로 돌아갈 뿐이며, 잔액, token 또는 사용 기록에는 영향을 주지 않습니다.

<Tip>
  **기기를 바꾸기 전에 연결 해제하거나 다시 연결하십시오**: 패스키가 하나의 브라우저 프로필에만 저장되어 있고 동기화가 없다면, 컴퓨터를 바꾸거나 OS를 재설치할 때 사라집니다. iCloud Keychain 또는 Google Password Manager에 저장된 패스키는 영향을 받지 않습니다.
</Tip>

## 주의할 점

<Warning>
  **항상 백업 로그인 방법을 유지하십시오.** 패스키는 대체 수단이 아니라 추가 수단입니다. 비밀번호가 여전히 작동하는지, 등록된 이메일이 계속 메일을 받을 수 있는지, 또는 GitHub 로그인이 연결되어 있는지 확인하십시오. 대체 수단 없이 분실한 기기를 복구하는 일은 훨씬 더 번거롭습니다.
</Warning>

* **공용 컴퓨터에서는 등록하지 마십시오**: 패스키는 기기에 저장되므로, 공용 또는 빌린 컴퓨터에서 하나를 등록하면 로그인 기능이 그 기기에 남게 됩니다. 임시로 접근해야 한다면 “휴대폰, 태블릿 또는 보안 키” 옵션을 선택하고 자신의 휴대폰에서 QR 코드로 확인하십시오.
* **확인하기 전에 도메인을 확인하십시오**: 정상적인 등록 또는 로그인 중에는 대화상자에 `apiyi.com`가 표시됩니다. 도메인이 잘못되었다면 중단하십시오. 바로 그 확인 절차가 패스키가 피싱을 막는 방식입니다.
* **동기화는 저장 위치에 따라 달라집니다**: iCloud 키체인은 Apple 기기 간에 동기화되고, Google Password Manager는 기기 간에 동기화되지만, 로컬 브라우저 프로필은 전혀 동기화되지 않습니다. 여러 기기에서 로그인해야 하는지에 따라 선택하십시오.
* **패스키는 API 키가 아닙니다**: 패스키는 콘솔 로그인에만 적용되며 API 호출에는 영향을 주지 않습니다. API 자격 증명 관리 방법은 [API 키를 안전하게 관리하는 방법](/ko/faq/key-security-management)을 참고하십시오.
* **브라우저 요구 사항**: 지문 / 얼굴 / 화면 잠금 확인을 지원하는 기기에서 최신 버전의 Chrome, Edge, Safari 또는 Firefox를 사용해야 합니다. 오래된 브라우저에서는 등록 옵션이 아예 표시되지 않을 수 있습니다.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="패스키를 연결한 뒤에도 비밀번호로 계속 로그인할 수 있습니까?">
    예. 패스키는 로그인 수단을 **추가**할 뿐이며, 비밀번호 로그인과 GitHub 로그인은 이전과 같이 계속 작동합니다. 최소한 하나의 대체 수단은 유지하시는 것을 권장합니다.
  </Accordion>

  <Accordion title="컴퓨터를 바꾸었는데 제 패스키가 아직도 작동합니까?">
    저장한 위치에 따라 다릅니다. **iCloud Keychain** 또는 **Google Password Manager**의 패스키는 기기 간에 동기화되며, 새 기기에서 해당 계정으로 로그인하는 즉시 사용할 수 있습니다. **로컬 브라우저 프로필**에만 저장된 경우에는 동기화되지 않으므로, 새 기기에서 다시 연결해야 합니다.
  </Accordion>

  <Accordion title="휴대폰을 잃어버리거나 기기가 고장 나면 어떻게 합니까?">
    대체 수단(비밀번호 또는 GitHub)으로 로그인한 뒤, 프로필 페이지에서 기존 패스키의 연결을 해제하고 새 기기에서 새 패스키를 연결하십시오. 바로 이것이 저희가 백업 로그인 수단을 반드시 유지하라고 권장하는 이유입니다.
  </Accordion>

  <Accordion title="한 개 이상의 기기를 연결할 수 있습니까?">
    패스키가 iCloud Keychain 또는 Google Password Manager에 저장되어 있으면 다른 기기에도 자동으로 동기화되며, 보통 다시 연결할 필요가 없습니다. 서로 동기화하지 않는 생태계 간(예: Mac과 Android 휴대폰)에는 다른 생태계에서 연결을 해제한 뒤 다시 연결하거나, 가끔 접근할 때는 “휴대폰, 태블릿 또는 보안 키” QR 흐름을 사용하십시오.
  </Accordion>

  <Accordion title="패스키가 제 지문 데이터를 노출합니까?">
    아닙니다. 지문 및 얼굴 데이터는 **기기에서 로컬로** 검증되며 사이트로 전송되지 않습니다. APIYI가 저장하는 것은 공개키뿐이며, 이로부터 개인키를 유도할 수는 없습니다.
  </Accordion>

  <Accordion title="연결을 클릭했는데 대화상자가 나타나지 않았습니다.">
    흔한 원인은 다음과 같습니다. 오래된 브라우저, 기기에 화면 잠금 또는 생체 인식이 설정되어 있지 않음, 브라우저 권한이 프롬프트를 차단함, 또는 WebAuthn을 지원하지 않는 임베디드 브라우저(모바일 앱 내부에서 흔함)입니다. 최신 Chrome / Edge / Safari로 전환하고, OS에서 화면 잠금 검증을 활성화한 다음 다시 시도하십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [비밀번호를 잊어버렸다면?](/ko/faq/forgot-password)
* [GitHub 로그인에서 '계정이 이미 연결됨'이 표시되나요?](/ko/faq/github-bindng-bindng-error)
* [API 키를 안전하게 관리하려면?](/ko/faq/key-security-management)
* [APIYI는 회원가입에 어떤 이메일 제공업체를 지원하나요?](/ko/faq/email-registration)
* [APIYI는 어떻게 데이터 보안을 보장하나요?](/ko/faq/data-security)
