> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 실시간 음성(웹소켓)

> 4개의 실시간 음성 모델, 하나의 wss 엔드포인트, 하나의 APIYI 키로 양방향 오디오 스트리밍, 끼어들기, 2가지 발화 감지 모드, 함수 호출 및 이미지 입력을 사용할 수 있습니다. 4개 모델 모두 기본 그룹에서 제공됩니다. 2가지 프로토콜을 필드별로 완전히 비교하고, 비용 없이 텍스트만으로 자체 테스트를 수행하는 경로도 포함합니다.

## 개요

실시간 모델은 **장시간 유지되는 WebSocket 연결**을 통해 실행됩니다. 오디오가 스트리밍으로 입력되고 오디오가 스트리밍으로 출력되며, 모델은 문장 중간에도 중단될 수 있습니다. 즉, “녹음하고, 업로드하고, 기다리고, 재생하는” 순환 과정이 필요하지 않습니다. ASR + 텍스트 모델 + TTS를 이어 붙이는 방식과 다른 점은 엔드투엔드로 처리된다는 것입니다. 모델이 음색, 멈춤, 감정을 직접 듣고 직접 말합니다. 지연 시간은 1초 미만 수준입니다.

APIYI는 현재 **2개 프로토콜에 걸쳐 4개 모델**을 제공하며, 하나의 엔드포인트와 하나의 키를 공유합니다.

* `gpt-realtime-2.1` / `gpt-realtime-2.1-mini` — OpenAI 실시간 GA 프로토콜
* `qwen3.5-omni-plus-realtime` / `qwen3.5-omni-flash-realtime` — 알리바바 클라우드 모델 스튜디오 프로토콜

<Warning>
  **상태(2026-09-14 업데이트, UTC+8)**: 네 모델 모두 **라이브 상태입니다. 키에서 기본 그룹을 선택한 후 요청 없이 바로 호출하면 됩니다**. VIP 및 SVIP 그룹에도 포함되어 있습니다. 자유롭게 테스트하고 탐색하고 통합해 보시기 바랍니다. 이 페이지에 누락된 내용이 있거나 직접 측정한 결과와 다르다면 알려주시기 바랍니다. 업스트림 프로토콜과 동작은 여전히 변경될 수 있습니다. 아래의 “알려진 제한 사항” 섹션의 내용은 모두 측정된 결과이며, 업스트림 변경에 따라 업데이트됩니다. 프로덕션에 배포하기 전에 재연결과 정상적인 성능 저하 처리를 구현하시기 바랍니다. 더 높은 동시 실행 수가 필요하면 [WeCom 지원](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec) 또는 [hi@apiyi.com](mailto:hi@apiyi.com) / [feedback@apiyi.com](mailto:feedback@apiyi.com)으로 문의하시기 바랍니다.
</Warning>

<Note>
  **🎤 주요 기능**: 하나의 연결을 통한 양방향 오디오 스트리밍, **언제든지 끼어들기 가능**, `server_vad` 및 `semantic_vad` 턴 감지, 결과 주입을 포함한 완전한 함수 호출 왕복 처리, 이미지 입력, 그리고 모달리티별로 분리된 `usage`. 위의 모든 기능은 네 모델에서 검증되었습니다(최초 검증 2026-08-24, 재검증 2026-09-14, UTC+8).
</Note>

<Info>
  **먼저 기억해야 할 한 가지**: 4개 모델은 **서로 다른 두 가지 요청 프로토콜**을 사용하며, 필드 이름과 이벤트 이름도 서로 다릅니다. **`model` 매개변수만 변경하고 요청 본문을 변경하지 않으면 작동하지 않습니다** — 이는 통합 과정에서 가장 흔하게 발생하는 실패 원인입니다. 차이점은 필드 6개와 이벤트 이름 3개이며, 모두 아래의 “프로토콜 비교”에 나열되어 있습니다.
</Info>

<CardGroup cols={2}>
  <Card title="WeCom 지원" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    통합 관련 질문, 동시 실행 수 증가 및 문서 누락 사항에 대해 담당자에게 직접 문의할 수 있습니다.
  </Card>

  <Card title="API 매뉴얼" icon="book-open" href="/ko/api-manual">
    키 생성, 기본 URL, 과금 모드 및 기타 일반적인 규칙을 확인할 수 있습니다.
  </Card>

  <Card title="키 및 그룹" icon="key-round" href="/ko/api-capabilities/token-management">
    키를 생성하고, 그룹을 선택하고, 쿼터를 설정할 수 있습니다.
  </Card>

  <Card title="호출 로그" icon="receipt-text" href="https://api.apiyi.com/log">
    콘솔에서 호출별 token 사용량과 실제 과금액을 확인할 수 있습니다.
  </Card>
</CardGroup>

이 페이지는 분량이 많습니다. 다음 세 섹션은 반드시 읽어야 합니다: **프로토콜 비교**(모델을 전환하기 전에 읽으십시오), **텍스트로 시작하기**(마이크 없이 전체 체인을 확인하십시오), **알려진 제한 사항**(클라이언트 코드에 영향을 미치는 네 가지 측정된 차이점).

## AI 에이전트가 통합을 수행하게 하십시오

<Note>
  Codex / Claude Code / Cursor로 개발하신다면 아래 프롬프트를 복사해 넣으십시오. 먼저 이 페이지의 일반 텍스트 버전을 가져온 다음(아무 docs URL 뒤에 `.md`를 덧붙이십시오), 귀하의 스택에 맞는 코드를 작성합니다 — **두 가지 필드 패밀리**, 샘플 레이트 기준선, 취소 시맨틱, 유휴 연결 끊김이 모두 요구사항에 반영되어 있습니다.
</Note>

<Prompt description="코딩 에이전트에게 Realtime 음성 통합 또는 문제 해결을 맡기십시오. Codex, Claude Code, Cursor 및 유사 도구에 복사해 붙여 넣으십시오." icon="bot" actions={["copy"]}>
  APIYI Realtime 음성(WebSocket을 통한 양방향 스트리밍)을 이 프로젝트에 통합하거나 문제를 해결하는 데 도움을 주십시오.

  코드를 작성하기 전에 문서를 읽으십시오: 이 페이지의 일반 텍스트 버전을 가져오려면 [https://docs.apiyi.com/en/api-capabilities/realtime/overview.md를](https://docs.apiyi.com/en/api-capabilities/realtime/overview.md를) 읽고, 특히 “프로토콜 비교”와 “알려진 제한 사항” 섹션에 집중하십시오.

  요구사항:

  1. 이것은 HTTP 요청이 아니라 **WebSocket 장기 연결**입니다. 엔드포인트는 `wss://api.apiyi.com/v1/realtime?model=<model-name>`이고 인증은 `Authorization: Bearer <key>` 헤더입니다. **HTTP POST로 작성하지 말고, `/v1/audio/speech` 또는 `/v1/audio/transcriptions` URL을 만들려고도 하지 마십시오** — 그것들은 다른 API입니다.

  2. **어떤 필드를 작성하기 전에, 모델이 어느 프로토콜 패밀리에 속하는지 먼저 결정하십시오.** `gpt-realtime-2.1`과 `gpt-realtime-2.1-mini`는 Realtime GA 프로토콜을 사용하고, `qwen3.5-omni-plus-realtime`과 `qwen3.5-omni-flash-realtime`는 Alibaba Cloud Model Studio 프로토콜을 사용합니다. 엔드포인트와 인증만 공유되며, 요청 본문과 이벤트 이름은 전반적으로 다릅니다: 출력 모달리티 `modalities` 대 `output_modalities`; 최상위 voice `voice` 대 `audio.output.voice`; `input_audio_format` 대 `audio.input.format`; 최상위 `turn_detection` 대 `audio.input.turn_detection`; `input_audio_transcription` 대 `audio.input.transcription`. 이벤트 이름: `response.text.delta` 대 `response.output_text.delta`, `response.audio.delta` 대 `response.output_audio.delta`. **이것들은 두 개의 구성 템플릿으로 작성하고, 코드 곳곳에 if 분기를 흩뿌리지 마십시오.**

  3. 오디오 형식의 기준선: 항상 PCM signed 16-bit, mono이며 Base64로 인코딩된 `input_audio_buffer.append`를 사용하십시오. **두 프로토콜의 샘플 레이트는 다릅니다** — Model Studio는 16000을 사용하고, Realtime GA는 최소 24000이 필요하며 16000을 `integer_below_min_value`로 거부합니다. 클라이언트에서 리샘플링하십시오. 서버가 알아서 고쳐 주리라 기대하지 마십시오.

  4. 바지-인을 종료하기 위해 `response.done`에 의존하지 마십시오. `response.cancel`를 보낸 뒤, **현재 두 Model Studio 모델은 `response.done`를 전달하지 않습니다**(테스트에서 일관되게 재현되었습니다). `response.output_item.done`를 턴 종료 신호로 사용하고, 보조 안전장치로 5초 타임아웃을 추가하십시오. 두 Realtime GA 모델은 정상적으로 동작하지만, 같은 로직이 둘 다에 통합니다.

  5. 장기 연결에는 keepalive와 재연결이 필요합니다. **Model Studio는 300초 후 유휴 연결을 끊고, WebSocket 수준의 ping/pong은 활동으로 간주되지 않습니다** — 이 타이머를 연장하지 못합니다. 유휴 상태에서는 주기적으로 애플리케이션 수준 이벤트를 보내거나, 연결 끊김을 받아들이고 자동으로 재연결하십시오. Realtime GA 세션에는 `expires_at`이 적용됩니다(연결 후 대략 30분으로 측정됨) 그리고 재연결도 필요합니다. **재연결한 뒤에는 `session.update`와 필요한 컨텍스트를 다시 전송해야 합니다**, 그렇지 않으면 새 세션이 기본값으로 실행됩니다.

  6. 음성을 \*\*첫 번째 `session.update`\*\*에 고정하십시오. 세션이 오디오 출력을 한 번이라도 생성한 뒤에는 음성을 변경하면 `cannot_update_voice`로 실패합니다. 음성을 바꾸려면 새 세션을 여십시오.

  7. 키는 `APIYI_API_KEY` 환경 변수에서 읽으십시오. 절대 하드코딩하지 말고 절대 커밋하지 마십시오. **프론트엔드에서 직접 연결하지 마십시오** — 키를 보관하고 오디오 프레임을 전달하는 백엔드 릴레이를 작성하십시오.

  8. 마이크를 건드리기 전에 텍스트 전용 스모크 테스트를 실행하십시오: `output_modalities`를 텍스트 전용으로 설정하고, `input_text` 하나를 보내며, 텍스트 델타와 `response.done` 안의 `usage` 객체를 받는지 확인하십시오. 그런 다음 오디오로 넘어가십시오. 끝나면 각 프로토콜 패밀리에 대해 실제로 한 번씩 호출하고, 두 `usage` 객체를 저에게 붙여 넣으십시오.
</Prompt>

<Accordion title="이 프롬프트가 막아 주는 문제">
  | 요구사항                         | 방지하는 함정                                                    |
  | ---------------------------- | ---------------------------------------------------------- |
  | 먼저 프로토콜 패밀리 식별               | `model`만 바꾸면 핸드셰이크는 통과하지만 이후 `session.update`가 거부됩니다       |
  | 패밀리별 샘플 레이트 고정               | Realtime GA에 16 kHz를 보내면 `integer_below_min_value`로 실패합니다  |
  | 출력 모달리티 필드가 이름이 바뀜           | GA 프로토콜에 `modalities`를 쓰면 단순히 알 수 없는 필드가 됩니다               |
  | 이벤트 이름도 변경됨                  | GA 프로토콜에서 `response.text.delta`를 기다려도 절대 트리거되지 않습니다        |
  | `output_item.done`로 종료       | Model Studio는 취소 후 `response.done`를 생략하므로, 이를 기다리면 턴이 멈춥니다 |
  | keepalive 필요, ping은 카운트되지 않음 | 하트비트가 300초 유휴 연결 끊김을 막아 준다고 가정함                            |
  | 첫 프레임에서 음성 고정                | 오디오가 생성된 뒤 바꾸면 `cannot_update_voice`로 실패합니다                |
  | 백엔드 릴레이, 브라우저 직접 연결 금지       | 브라우저에서 연결하면 키가 모든 방문자에게 노출됩니다                              |
</Accordion>

## 실시간 음성에 APIYI를 사용하는 이유

<CardGroup cols={2}>
  <Card title="키 하나로 네 가지 모델" icon="key-round">
    동일한 `wss` 엔드포인트와 동일한 인증을 사용합니다. 모델을 전환하려면 `model` 매개변수와 이에 맞는 필드 템플릿만 변경하면 되므로, 관리해야 할 두 번째 공급업체 계정이 필요하지 않습니다.
  </Card>

  <Card title="직접 액세스, 해외 설정 불필요" icon="globe">
    중국 본토의 데이터 센터, 가정용 광대역 또는 해외 노드에서 `api.apiyi.com`에 액세스할 수 있습니다. 업스트림 공급업체 계정, 신원 확인 또는 선결제가 필요하지 않습니다.
  </Card>

  <Card title="프로토콜 차이를 이미 매핑" icon="git-compare">
    필드 비교, 이벤트 이름 비교, 샘플 레이트 제한 및 측정된 네 가지 제한 사항을 모두 이 문서에 정리했으므로 직접 다시 확인할 필요가 없습니다.
  </Card>

  <Card title="텍스트를 통한 무료 자체 테스트" icon="terminal">
    마이크 없이 핸드셰이크, 인증, 필드, 도구 연결 및 동시 실행 수를 검증할 수 있습니다. 오디오 등급은 텍스트보다 한 자릿수 더 많은 비용이 들기 때문에 통합 과정에서 실제 비용을 절감할 수 있습니다.
  </Card>

  <Card title="측정된 지연 시간과 동시 실행 수" icon="gauge">
    동시 세션 40개에서 핸드셰이크 p50은 약 1초, 첫 텍스트 델타 p50은 약 1초였으며, 120개 세션 중 120개가 성공했습니다. 테스트 조건과 날짜는 기술 사양 아래에 명시되어 있습니다.
  </Card>

  <Card title="직접 엔지니어링 지원" icon="handshake">
    통합 관련 질문, 동시 실행 수 증대 및 업스트림 동작 변경에 대응하는 WeCom 직접 채널을 제공합니다.
  </Card>
</CardGroup>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="양방향 streaming, 중단 가능" icon="radio">
    오디오는 생성되는 즉시 streaming됩니다; 클라이언트는 언제든지 `response.cancel`를 보낼 수 있습니다. 세션은 유지되고 컨텍스트는 보존됩니다. 네 가지 모델 모두에서 검증되었습니다.
  </Card>

  <Card title="두 가지 턴 감지 모드" icon="scissors">
    `server_vad`는 무음 지속 시간에 따라 분할하고, `semantic_vad`는 의도에 따라 분할합니다(“uh-huh” 같은 군더더기 단어를 더 잘 무시합니다). 두 모드 모두 네 가지 모델에서 검증되었습니다.
  </Card>

  <Card title="전체 함수 호출 루프" icon="wrench">
    모델이 도구를 트리거하면 클라이언트가 이를 실행하고, `function_call_output`가 결과를 주입하며, 모델이 계속 말합니다. 네 가지 모델 모두에서 엔드투엔드로 검증되었습니다.
  </Card>

  <Card title="이미지 입력, 모달리티별 사용량" icon="image">
    세션 중간에 이미지를 보내 모델이 읽도록 하며; `usage`는 텍스트 / 오디오 / 이미지 tokens를 각각 반환하므로 비용을 귀속할 수 있습니다. 네 가지 모델 모두에서 검증되었습니다.
  </Card>
</CardGroup>

## 지원 모델

| 모델                            | 프로토콜 계열 | 사용 가능 여부 | 기본 음성   | 입력 샘플링 레이트 | 프롬프트 캐싱   | 포지셔닝                                                        |
| ----------------------------- | ------- | -------- | ------- | ---------- | --------- | ----------------------------------------------------------- |
| `gpt-realtime-2.1`            | 실시간 GA  | ✅ 기본 그룹  | `marin` | ≥ 24 kHz   | ✅ 지원됨     | 플래그십 모델. 가장 뛰어난 다국어 및 추론 성능을 제공하며 `reasoning.effort`을 지원합니다 |
| `gpt-realtime-2.1-mini`       | 실시간 GA  | ✅ 기본 그룹  | `marin` | ≥ 24 kHz   | ✅ 지원됨     | 비용 효율적이며 일상적인 대화에 충분합니다                                     |
| `qwen3.5-omni-plus-realtime`  | 모델 스튜디오 | ✅ 기본 그룹  | `Tina`  | 16 kHz     | ⏸ 관찰되지 않음 | 중국어 시나리오를 위한 플래그십 모델입니다                                     |
| `qwen3.5-omni-flash-realtime` | 모델 스튜디오 | ✅ 기본 그룹  | `Tina`  | 16 kHz     | ⏸ 관찰되지 않음 | 중국어 시나리오에 비용 효율적입니다                                         |

네 모델 모두에서 출력 오디오는 **PCM 부호 있는 16비트 / 모노 / 24 kHz**입니다.

<Warning>
  두 프로토콜 계열은 **엔드포인트와 인증 체계만 공유합니다**. 요청 필드와 서버 이벤트 이름은 모두 다릅니다. 모델을 전환할 때는 필드 템플릿도 전환해야 합니다. 아래의 “프로토콜 비교”를 참조하십시오.
</Warning>

## 가격

<Info>
  **가격 한 문장 요약**: token당 과금되며, **오디오 비용은 텍스트보다 한 자릿수 더 높습니다**(`gpt-realtime-2.1`의 경우 오디오 입력 \$32 대 텍스트 입력 \$4, 오디오 출력 \$64 대 텍스트 출력 \$24). 통합 중에는 텍스트 전용으로 실행하고 체인이 검증되면 오디오로 전환하십시오 — 아래의 “텍스트로 시작”을 참조하십시오.
</Info>

아래 표는 **벤더의 공식 정가**이며, 1M token당 USD로 표시됩니다. APIYI는 동일한 요율로 token당 과금합니다(2026-09-14, (UTC+8)에 모달리티별로 조정됨). **APIYI의 실제 과금액은 [호출 로그](https://api.apiyi.com/log)에 표시된 값입니다**. [충전 보너스](/ko/faq/recharge-promotions)를 적용하면 실질 비용이 더 낮아집니다.

### Realtime GA 프로토콜

| 모델                      | 텍스트 입력 | 텍스트 출력 | 캐시 읽기                           | 이미지 입력 | 오디오 입력 | 오디오 출력 |
| ----------------------- | ------ | ------ | ------------------------------- | ------ | ------ | ------ |
| `gpt-realtime-2.1`      | \$4    | \$24   | \$0.4 (현재 APIYI에서는 \$4로 과금)     | \$5    | \$32   | \$64   |
| `gpt-realtime-2.1-mini` | \$0.6  | \$2.4  | \$0.06 (현재 APIYI에서는 \$0.6으로 과금) | \$0.8  | \$10   | \$20   |

### Model Studio 프로토콜

과금 차원이 다릅니다. 이미지 입력은 텍스트 등급에 포함되며, 출력은 “텍스트 전용”과 “텍스트 + 오디오”로 나뉩니다(후자의 요율에서는 오디오 부분에만 과금됩니다).

| 모델                            | 텍스트 / 이미지 입력 | 오디오 입력 | 텍스트 출력 | 텍스트 + 오디오 출력 |
| ----------------------------- | ------------ | ------ | ------ | ------------ |
| `qwen3.5-omni-plus-realtime`  | \$1.38       | \$11   | \$8.25 | \$41.26      |
| `qwen3.5-omni-flash-realtime` | \$0.45       | \$3.71 | \$2.75 | \$14.71      |

<Note>
  **과금 참고 사항**: 텍스트, 오디오 및 이미지 token은 위 정가에 따라 token당 과금됩니다. 중단된 턴(`response.cancel`)은 실제로 생성된 항목에 대해서만 과금되며, 빈 세션에는 과금되지 않습니다. **캐시된 입력은 아직 할인되지 않습니다**. 캐시 적중은 `usage.cached_tokens`에 정확하게 보고되지만, APIYI에서는 현재 해당 텍스트 입력 요율로 과금합니다. 과금 경로가 수정되면 공식 캐시 요율이 자동으로 적용되며, [변경 로그](/en/changelog)를 통해 안내하겠습니다. 가격은 벤더 정책과 공급 상황에 따라 변경될 수 있습니다. 이 기능은 수익 중심의 상품 목록이 아니라 **공급을 확보하고 고객에게 서비스를 제공하기 위해** 제공됩니다.
</Note>

## 액세스 그룹

| 그룹         | 모델      | 참고                                                                |
| ---------- | ------- | ----------------------------------------------------------------- |
| **기본값**    | 네 가지 모두 | 키에서 기본 그룹을 선택합니다 — 요청이 필요하지 않으며, 그룹 요율 배수는 1이고 공급업체 목록과 가격이 동일합니다 |
| VIP / SVIP | 네 가지 모두 | 사용할 수 있으며, 과금은 키가 속한 그룹의 요율 배수를 따릅니다                              |

<Note>
  네 가지 모델 모두 하나의 엔드포인트와 하나의 키를 공유합니다. 그룹 전환은 [키 관리](/ko/api-capabilities/token-management) 아래에서 체크박스만 변경하면 되며, 코드를 변경할 필요가 없습니다.
</Note>

## 기술 사양

| 차원          | 값                                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **전송**      | WebSocket (`wss://`), 하나의 연결을 통한 양방향 스트리밍                                                                                                                    |
| **인증**      | `Authorization: Bearer <key>` 헤더                                                                                                                             |
| **이벤트 형식**  | OpenAI Realtime 이벤트 모델(클라이언트 이벤트 / 서버 이벤트)과 호환                                                                                                               |
| **입력 오디오**  | PCM 부호 있는 16비트, 모노, Base64. **Model Studio 16 kHz, Realtime GA ≥ 24 kHz**                                                                                    |
| **출력 오디오**  | PCM 부호 있는 16비트, 모노, 24 kHz                                                                                                                                   |
| **출력 모달리티** | 텍스트 / 오디오(텍스트만 사용 가능)                                                                                                                                        |
| **턴 감지**    | `server_vad`, `semantic_vad` 또는 수동 `commit`을 위한 비활성화                                                                                                         |
| **함수 호출**   | `function_call_output` 결과 주입을 포함하여 지원                                                                                                                        |
| **이미지 입력**  | 지원(제품군별 구문이 다르며, 아래 참조)                                                                                                                                      |
| **세션 수명**   | Realtime GA: 세션이 `expires_at`을 전달합니다. 두 차례의 테스트 통과 결과 연결 시점부터 약 30분 및 60분으로 측정되었으므로 `session.created` 에코를 기준으로 삼으십시오. Model Studio: 유휴 연결 해제는 300초로 측정되었습니다. |

### 측정된 지연 시간 및 동시 실행 수

공개 `api.apiyi.com` 경로에서 `gpt-realtime-2.1` 및 `-mini`을 각각 20개 및 40개의 동시 세션으로 실행하여 2026-09-14 (UTC+8)에 측정한 결과입니다. 단일 턴 텍스트 전용 교환 기준입니다.

| 측정 항목           | 측정값(세션 40개 × 모델 2개)                          |
| --------------- | -------------------------------------------- |
| WebSocket 핸드셰이크 | p50 0.96–1.03초, 최대 1.40초                     |
| 첫 번째 텍스트 델타     | p50 0.99–1.08초, 최대 1.67초                     |
| 전체 단일 턴         | p50 1.30–1.44초, 최대 2.11초                     |
| 세션 성공률          | 100%(20개 및 40개 세션 계층에서 총 120개 세션, 429 응답 0건) |
| 유휴 연결 유지        | 5분간 침묵 후에도 대화 가능 상태 유지, ping/pong 약 200ms    |

<Warning>
  이 값은 특정 동시 실행 수 수준에서 특정 시점에 측정한 결과이며 성능을 보장하는 약정이 아닙니다. **가용성 SLA는 제공되지 않습니다** — 클라이언트에서 재연결 및 정상적인 성능 저하 처리를 구현하십시오.
</Warning>

## 엔드포인트

| 엔드포인트                                                | 용도             | 인증                            |
| ---------------------------------------------------- | -------------- | ----------------------------- |
| `wss://api.apiyi.com/v1/realtime?model=<model-name>` | 실시간 음성 세션을 엽니다 | `Authorization: Bearer <key>` |

네 가지 모델은 모두 이 엔드포인트를 공유하며, `model` 쿼리 파라미터로 어떤 모델에 연결할지 선택합니다.

<Warning>
  **브라우저에서 연결하는 경우**: 이 엔드포인트는 `Sec-WebSocket-Protocol` 서브프로토콜(`realtime, openai-insecure-api-key.<key>, openai-beta.realtime-v1`)을 통한 인증도 허용하므로, 브라우저 `WebSocket`가 직접 연결할 수 있습니다 — 하지만 이렇게 하면 **키가 브라우저에 전달되며**, 누구나 네트워크 패널에서 확인할 수 있습니다. **로컬 검증에만 사용하십시오.** 운영 환경에서는 백엔드 릴레이를 작성해야 합니다. 백엔드가 키를 보관하고 APIYI에 연결을 열며, 프론트엔드는 오직 자체 서비스와만 통신해야 합니다.
</Warning>

## ⚠️ 프로토콜 비교 (모델을 전환하기 전에 읽으십시오)

두 계열은 엔드포인트, 인증 방식, 전체 이벤트 흐름을 공유합니다. 차이점은 `session.update` 필드 구조와 일부 서버 이벤트 이름에 집중되어 있습니다.

### 요청 필드 비교

| 용도        | Model Studio 프로토콜                   | Realtime GA 프로토콜                                         |
| --------- | ----------------------------------- | -------------------------------------------------------- |
| 출력 모달리티   | `modalities: ["text","audio"]`      | `output_modalities: ["audio"]`                           |
| 음성        | `voice` (최상위)                       | `audio.output.voice`                                     |
| 속도        | 지원되지 않습니다                           | `audio.output.speed` (0.7 / 1.0 / 1.5는 선형으로 측정됩니다)       |
| 입력 오디오 형식 | `input_audio_format: "pcm"`, 16 kHz | `audio.input.format: {"type":"audio/pcm","rate":24000}`  |
| 출력 오디오 형식 | `output_audio_format: "pcm"`        | `audio.output.format: {"type":"audio/pcm","rate":24000}` |
| 턴 감지      | `turn_detection` (최상위)              | `audio.input.turn_detection`                             |
| 입력 전사     | `input_audio_transcription`         | `audio.input.transcription`                              |

### 서버 이벤트 비교

| 내용        | Model Studio 프로토콜                 | Realtime GA 프로토콜                         |
| --------- | --------------------------------- | ---------------------------------------- |
| 텍스트 델타    | `response.text.delta`             | `response.output_text.delta`             |
| 오디오 델타    | `response.audio.delta`            | `response.output_audio.delta`            |
| 오디오 전사 델타 | `response.audio_transcript.delta` | `response.output_audio_transcript.delta` |

나머지 모든 이벤트 — `session.created`, `session.updated`, `conversation.item.create`, `input_audio_buffer.append`, `input_audio_buffer.commit`, `response.create`, `response.cancel`, `response.done` — 는 양쪽에서 이름이 동일합니다.

### 두 개의 최소 session.update 페이로드

같은 내용을 두 번 쓴 것입니다. 그대로 복사하십시오. **Model Studio 프로토콜**:

```json theme={null}
{
  "type": "session.update",
  "session": {
    "modalities": ["text", "audio"],
    "voice": "Ethan",
    "input_audio_format": "pcm",
    "output_audio_format": "pcm",
    "input_audio_transcription": { "model": "qwen3-asr-flash-realtime" },
    "turn_detection": { "type": "semantic_vad" }
  }
}
```

**Realtime GA 프로토콜**:

```json theme={null}
{
  "type": "session.update",
  "session": {
    "type": "realtime",
    "output_modalities": ["audio"],
    "audio": {
      "input": {
        "format": { "type": "audio/pcm", "rate": 24000 },
        "transcription": { "model": "whisper-1" },
        "turn_detection": { "type": "semantic_vad" }
      },
      "output": {
        "format": { "type": "audio/pcm", "rate": 24000 },
        "voice": "alloy",
        "speed": 1.0
      }
    }
  }
}
```

<Warning>
  **샘플 레이트는 엄격한 제약입니다**: `audio.input.format.rate`는 Realtime GA 프로토콜에서 **≥ 24000**이어야 합니다; 16000을 보내면 `integer_below_min_value: Expected a value >= 24000`로 즉시 실패합니다. Model Studio 프로토콜은 16 kHz 입력을 요구합니다. 클라이언트에서 리샘플링하십시오.
</Warning>

## 텍스트로 시작하기: 텍스트 채널의 용도와 세 단계 자가 테스트

오디오 파이프라인에는 마이크 캡처, 리샘플링, 청킹, 턴 감지가 포함됩니다. 어떤 연결이라도 끊어지면 “아무 일도 일어나지 않음”으로 나타나며, 이는 진단하기 어렵습니다. 그러므로 **마이크부터 시작하지 마십시오**.

### 텍스트는 폴백 입력이 아니라 컨트롤 플레인입니다

실시간 음성 모델에서 텍스트는 “입력을 보내는 또 다른 방식”이 아니라, **오디오 스트림을 제외한 전체 제어 채널**입니다:

| 조합            | 일반적인 용도                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------ |
| 텍스트 → 컨트롤 플레인 | `instructions` 시스템 prompt, `function_call_output` 도구 결과, 검색된 컨텍스트 — 모두 텍스트이며 마이크로폰으로는 접근할 수 없습니다 |
| 텍스트 → 오디오     | 사실상 **대화 전체 맥락을 포함한 TTS**입니다. 일반 모델이 먼저 충분히 생각하게 한 다음, 실시간 모델이 그것을 말하게 하십시오. 공지와 prompt에 적합합니다   |
| 텍스트 → 텍스트     | **가장 저렴한 디버깅 채널입니다.** 일반 텍스트 채팅은 일반 채팅 모델이 더 잘 처리합니다. 여기서의 가치는 비용 없이 체인을 검증하는 것입니다               |

### 세 단계 자가 테스트

<Steps>
  <Step title="1단계: 텍스트만 사용하고 마이크는 사용하지 않음">
    `output_modalities`를 텍스트 전용으로 설정하고, 턴 감지를 비활성화한 다음, `input_text` 하나를 보내십시오. 그것만으로도 핸드셰이크, 키와 그룹, **올바른 필드 템플릿을 선택했는지**, `session.update`가 적용되었는지, 도구가 올바르게 주입되는지, 멀티턴 컨텍스트가 유지되는지, 그리고 동시 실행 수가 어떻게 동작하는지를 검증합니다. **오디오 tokens는 전혀 생성되지 않습니다.**
  </Step>

  <Step title="2단계: 로컬 wav 파일 다시 재생">
    마이크 대신 고정된 로컬 오디오 파일을 사용하여, 100 ms 청크 단위로 `input_audio_buffer.append`에 입력하십시오. 이렇게 하면 **오디오 파이프라인**(형식, 샘플 레이트, 청킹, `commit`, VAD 트리거링)을 비즈니스 로직과 분리할 수 있으며 재현 가능해집니다 — 같은 파일은 두 번 실행해도 같은 결과를 만들어야 합니다.
  </Step>

  <Step title="3단계: 라이브 마이크 연결">
    처음 두 단계가 통과되면 캡처와 재생만 남습니다. 이제 문제가 생기더라도 탐색 범위는 이미 작습니다.
  </Step>
</Steps>

<Tip>
  **테스트용 오디오가 없으십니까?** macOS에서는 내장 도구로 한 줄만에 규격에 맞는 파일을 생성할 수 있습니다:

  ```bash theme={null}
  say -v Samantha -o /tmp/ask.aiff "What is the weather in Beijing today? Answer in one sentence."

  # Realtime GA protocol uses 24000
  afconvert -f WAVE -d LEI16@24000 -c 1 /tmp/ask.aiff ask_24k.wav
  # Model Studio protocol uses 16000
  afconvert -f WAVE -d LEI16@16000 -c 1 /tmp/ask.aiff ask_16k.wav
  ```

  잘못된 샘플 레이트를 선택하는 것이 2단계에서 가장 흔한 실패 원인입니다 — 두 프로토콜은 다르므로 혼동하지 마십시오.
</Tip>

### 실행 가능한 텍스트 스모크 테스트

`websockets`만 있으면 됩니다 (`pip install websockets`). 프로토콜을 전환하려면 변수 하나만 바꾸십시오:

```python theme={null}
import asyncio, json, os, websockets

FAMILY = "ga"           # ga = gpt-realtime-2.1 series; omni = qwen3.5-omni series
MODEL = "gpt-realtime-2.1" if FAMILY == "ga" else "qwen3.5-omni-plus-realtime"
URL = f"wss://api.apiyi.com/v1/realtime?model={MODEL}"
HEADERS = {"Authorization": "Bearer " + os.environ["APIYI_API_KEY"]}

# The two protocols diverge only here: session structure and the text-delta event name.
SESSION = ({"type": "realtime", "output_modalities": ["text"],
            "audio": {"input": {"turn_detection": None}}}
           if FAMILY == "ga" else
           {"modalities": ["text"], "turn_detection": None})
TEXT_DELTA = "response.output_text.delta" if FAMILY == "ga" else "response.text.delta"

async def main():
    async with websockets.connect(URL, additional_headers=HEADERS) as ws:
        while json.loads(await ws.recv())["type"] != "session.created":
            pass
        await ws.send(json.dumps({"type": "session.update", "session": SESSION}))
        await ws.send(json.dumps({"type": "conversation.item.create", "item": {
            "type": "message", "role": "user",
            "content": [{"type": "input_text", "text": "Explain WebSocket in one sentence."}]}}))
        await ws.send(json.dumps({"type": "response.create"}))
        while True:
            e = json.loads(await ws.recv())
            if e["type"] == TEXT_DELTA:
                print(e["delta"], end="", flush=True)
            elif e["type"] == "response.done":
                print("\n\nusage =", json.dumps(e["response"]["usage"]))
                return
            elif e["type"] == "error":
                print("\nERROR:", json.dumps(e))
                return

asyncio.run(main())
```

이것이 실행되면 엔드포인트, key, group, 그리고 필드 템플릿이 모두 올바른 것입니다 — 이제 2단계로 진행하십시오.

## 세션 기능: 음성, 턴 감지, 도구, 이미지

### 음성

| 항목         | 모델 스튜디오 프로토콜                    | 실시간 GA 프로토콜                                                  |
| ---------- | ------------------------------- | ------------------------------------------------------------ |
| 기본 음성      | `Tina`                          | `marin`                                                      |
| 작동 확인됨     | `Tina`, `Ethan` 및 기타            | `alloy`, `marin`, `cedar`, `shimmer`, `verse`                |
| 속도 제어      | 지원되지 않음                         | `audio.output.speed`; 지속 시간은 0.7 / 1.0 / 1.5에 따라 선형적으로 조정됩니다 |
| 유효하지 않은 음성 | `Voice 'xxx' is not supported.` | `invalid_value`                                              |

<Warning>
  **첫 `session.update`에서 음성을 고정하십시오.** 한 세션이 오디오 출력을 생성한 뒤에는 음성을 변경하면 `cannot_update_voice` 오류가 발생합니다 — 이는 두 프로토콜 모두에 적용됩니다. 음성을 전환하려면 새 세션을 여십시오. 또한 모델 스튜디오 프로토콜에서는 빈 문자열을 음성으로 보내지 마십시오. 지원되지 않는 음성으로 되돌아가며 400을 반환합니다. 설정할 필요가 없다면 해당 필드를 생략하면 됩니다.
</Warning>

### 턴 감지: server\_vad 및 semantic\_vad

* `server_vad` — 무음 지속 시간 기준으로 분할하며, 매개변수가 직관적입니다(`threshold`, `silence_duration_ms`, `prefix_padding_ms`).
* `semantic_vad` — 대화 의도 기준으로 분할하며, 군더더기 말과 의미 없는 배경 소음을 무시합니다. 여러 화자가 있는 환경에서 더 견고합니다.
* 턴 감지를 비활성화할 수도 있으며(`null` 또는 `none`), **수동 모드**로 실행할 수 있습니다: `input_audio_buffer.commit`를 직접 전송한 다음 `response.create`를 전송합니다. 이는 UI가 턴을 제어하는 푸시-투-토크 인터페이스에 적합합니다.

<Tip>
  VAD 모드에서는 **스트리밍을 계속 유지해야 합니다**. 발화가 끝난 뒤에는 짧은 무음 구간을 계속 밀어 넣으십시오(테스트에서는 2초면 충분했습니다) 그래야 서버가 발화 종료를 감지할 수 있습니다. 발화된 부분만 밀어 넣고 그다음 중지하면 `speech_stopped`가 절대 동작하지 않으며 응답도 생성되지 않습니다.
</Tip>

### 함수 호출

이벤트 순서: 모델이 `response.output_item.done` 유형의 `function_call`를 내보냅니다(`call_id` 및 `arguments` 포함) → 클라이언트가 이를 실행합니다 → 결과가 주입됩니다 → 다른 `response.create`가 모델이 계속 진행하도록 합니다.

```json theme={null}
{
  "type": "conversation.item.create",
  "item": {
    "type": "function_call_output",
    "call_id": "call_xxx",
    "output": "{\"city\":\"Beijing\",\"weather\":\"light rain\",\"temp_c\":21}"
  }
}
```

전체 루프는 네 가지 모델 모두에서 검증되었습니다 — 주입 후 모델이 도구가 반환한 내용을 올바르게 다시 말합니다.

### 이미지 입력

**실시간 GA 프로토콜**: `input_image`를 메시지에 직접 넣으십시오; 값은 데이터 URI일 수 있습니다.

```json theme={null}
{
  "type": "conversation.item.create",
  "item": {
    "type": "message",
    "role": "user",
    "content": [
      { "type": "input_image", "image_url": "data:image/jpeg;base64,..." },
      { "type": "input_text", "text": "What does the image say?" }
    ]
  }
}
```

**모델 스튜디오 프로토콜**: 이미지는 **동영상 프레임**으로 처리되므로 오디오를 먼저 추가해야 하며, 그렇지 않으면 `Error append image before append audio.` 오류가 발생합니다. 테스트에서는 `input_image_buffer.append`를 `input_audio_buffer.append` stream에 대략 초당 한 프레임으로 교차 삽입하는 방식이 동작했습니다.

## 알려진 제한 사항

아래의 모든 항목은 측정된 결과이며, 모두 클라이언트 코드에 영향을 미칩니다. 통합하기 전에 확인하시기 바랍니다.

| 동작                                                                                     | 영향을 받는 계열                    | 클라이언트 해결 방법                                                                                                               |
| -------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `response.done`가 `response.cancel` 이후 전달되지 않아 턴이 종료되지 않음                               | 모델 스튜디오(6회의 테스트 실행 모두에서 재현됨) | `response.output_item.done`를 턴 종료 신호로 사용하고 5초 타임아웃을 추가합니다. 세션 자체에는 영향이 없으며 중단 후에도 대화가 정상적으로 계속됩니다                         |
| 유휴 연결이 300초 후 끊어짐. WebSocket ping/pong은 **활동으로 간주되지 않음**                               | 모델 스튜디오                      | 유휴 상태에서 주기적으로 애플리케이션 수준 이벤트를 전송하거나, 연결 해제를 허용하고 자동으로 다시 연결합니다. 다시 연결한 후 `session.update`를 재전송합니다                          |
| 세션에서 오디오가 생성된 후에는 음성을 변경할 수 없으며 `cannot_update_voice`이 발생함                             | 두 계열 모두                      | 첫 번째 `session.update`에서 `voice`을 고정합니다. 음성을 변경하려면 새 세션을 엽니다                                                               |
| 수동 `commit` 모드에서 입력 전사 완료 이벤트가 전달되지 않음                                                 | 모델 스튜디오의 `flash` 모델          | 전사가 정상적으로 작동하는 `server_vad` / `semantic_vad`로 전환합니다. 대화 자체에는 영향이 없으며 모델은 오디오를 올바르게 이해하고 응답합니다                             |
| `POST /v1/realtime/client_secrets`(임시 키) 및 `POST /v1/realtime/calls`(WebRTC)가 404를 반환함 | 전체                           | APIYI에서는 직접 WebSocket만 지원하며 WebRTC, SIP 및 임시 token은 사용할 수 없습니다. 브라우저 및 모바일 클라이언트의 경우 키를 보관하고 WebSocket을 여는 백엔드 릴레이를 실행합니다 |
| 사용자 지정 음성 객체(`audio.output.voice: {id: …}`)가 업스트림 500 오류를 반환함                          | Realtime GA                  | 내장 음성 이름만 사용합니다(`marin` / `cedar` / `alloy` 등 문자열 형식)                                                                     |

<Warning>
  이러한 동작은 업스트림 변경에 따라 달라질 수 있으며, 이 페이지는 최신 상태로 유지됩니다. 여기에 나열되지 않은 문제가 발생하면 타임스탬프와 `session.id`를 포함하여 [WeCom 지원팀](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec) 또는 [feedback@apiyi.com](mailto:feedback@apiyi.com)을 통해 알려 주시기 바랍니다. 문제를 추적하는 데 도움이 됩니다.
</Warning>

## 모범 사례

<Steps>
  <Step title="프로토콜 계열별로 먼저 필드 템플릿을 선택합니다">
    두 개의 `session.update` 페이로드를 모델 이름으로 선택되는 두 개의 설정 상수로 작성하고, if 분기로 흩어 두지 마십시오. 이 부분은 6개월 후 유지보수 시 가장 깨지기 쉽습니다.
  </Step>

  <Step title="세션 매개변수는 첫 프레임에 고정합니다">
    `output_modalities`, `voice`, `speed`, `turn_detection` 및 `transcription`를 맨 처음 `session.update`에서 설정합니다. 특히 음성은 — 오디오가 생성된 뒤에는 이미 늦습니다.
  </Step>

  <Step title="오디오를 추가하기 전에 텍스트 스모크 테스트를 통과합니다">
    이 페이지에서 텍스트 스모크 테스트를 실행하여 엔드포인트, 키, 그룹, 필드 템플릿이 모두 올바른지 확인한 다음 오디오로 넘어가십시오. 오디오 티어는 텍스트보다 한 자릿수 더 비싸므로, 이렇게 하면 통합 예산의 대부분을 아낄 수 있습니다.
  </Step>

  <Step title="샘플 레이트와 채널은 클라이언트에서 변환합니다">
    PCM 부호 있는 16비트, 모노; Model Studio는 16 kHz, Realtime GA는 ≥ 24 kHz입니다. 서버 측 보정을 기대하지 마십시오 — 잘못된 형식은 보통 명시적인 오류보다 무음으로 나타납니다.
  </Step>

  <Step title="타임아웃을 두고 output_item.done에서 마무리합니다">
    `response.done`만 기다리지 마십시오. 이 방식은 두 계열 모두에서 올바르며, 사용자가 중단해도 턴이 멈춰 버리는 일을 방지합니다.
  </Step>

  <Step title="장시간 세션에는 유지 신호와 재연결을 추가합니다">
    Model Studio의 300초 유휴 제한과 Realtime GA의 `expires_at`을 주의하십시오. **재연결한 뒤에는 `session.update`와 필요한 컨텍스트를 다시 전송하십시오**, 그렇지 않으면 새 세션이 기본값으로 실행됩니다.
  </Step>

  <Step title="프로덕션에서는 백엔드 릴레이를 사용합니다">
    키는 백엔드에 보관하고 프론트엔드는 자체 서비스와만 통신하게 하십시오. 브라우저에서 직접 연결해도 기술적으로는 동작하지만 키가 노출됩니다.
  </Step>
</Steps>

## 오류 및 재시도

| 증상                                        | 의미                                                    | 조치                                                            |
| ----------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------- |
| 핸드셰이크가 401을 반환함                           | 잘못된 키이거나 `Authorization` 헤더가 전송되지 않음                  | 키 자체, 실수로 `https://`를 사용했는지 여부, 헤더가 존재하는지 확인합니다               |
| 사용 가능한 채널이 없고 핸드셰이크가 503을 반환함             | 키의 그룹에 모델이 포함되어 있지 않거나(네 가지 모두 기본 그룹에 있음), 모델 이름이 잘못됨 | 키의 그룹과 `model` 매개변수를 확인합니다                                    |
| 핸드셰이크가 400을 반환함                           | `model` 쿼리 매개변수가 누락됨                                  | 엔드포인트에 `?model=<model-name>`가 포함되어야 합니다                       |
| 알 수 없는 필드의 `invalid_request_error`        | **잘못된 프로토콜 제품군**                                      | 위의 비교 표를 사용하여 해당 모델의 필드 템플릿으로 전환합니다                           |
| `integer_below_min_value`                 | Realtime GA에서 입력 샘플링 레이트가 24000 미만임                   | 클라이언트에서 24kHz 이상으로 리샘플링합니다                                    |
| `cannot_update_voice`                     | 세션에서 오디오가 생성된 후 음성이 변경됨                               | 첫 번째 프레임에서 음성을 고정하고, 전환하려면 새 세션을 엽니다                          |
| `Error append image before append audio.` | Model Studio에서 오디오보다 먼저 이미지가 추가됨                      | 먼저 `input_audio_buffer.append`를 통해 오디오를 추가한 다음 이미지 프레임을 추가합니다 |
| WebSocket 1006 / 1011                     | 네트워크 불안정 또는 업스트림 연결 끊김                                | 지수 백오프(1초 / 4초 / 16초)로 다시 연결하고 `session.update`를 재생합니다        |
| 약 5분 동안 무음 상태가 지속된 후 연결이 끊김               | Model Studio의 유휴 제한                                   | 알려진 제한 사항의 연결 유지 방식을 참고합니다                                    |

<Info>
  문제 해결 팁: 각 이벤트의 `event_id`와 세션의 `session.id`를 기록하고, 문제를 보고할 때 함께 제공합니다. 그러면 진단 시간을 크게 단축할 수 있습니다. 또한 **Realtime GA 오류 객체에는 `code`와 `param`가 포함됩니다**(정확한 필드와 허용되는 값을 지정함). 반면 Model Studio 오류 메시지는 더 포괄적입니다. 디버깅할 때는 먼저 전자의 필드 구문을 검증합니다.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Why is there no interactive playground on this page?">
    Interactive playgrounds are driven by OpenAPI specs, which describe a single request and a single response over HTTP. Realtime is dozens of event types flowing in both directions over one long-lived connection, which does not map onto that model. The alternative is the text smoke test in the "Start With Text" section — a few dozen lines, no microphone, and it confirms the chain works.
  </Accordion>

  <Accordion title="Can I swap between the four models by changing only the model name?">
    **No.** The endpoint and auth are the same, but request fields and event names belong to two protocols. At minimum you must change: `modalities` ↔ `output_modalities`, `voice` ↔ `audio.output.voice`, `input_audio_format` ↔ `audio.input.format`, `turn_detection` ↔ `audio.input.turn_detection`, `input_audio_transcription` ↔ `audio.input.transcription`, plus the event names `response.text.delta` ↔ `response.output_text.delta` and `response.audio.delta` ↔ `response.output_audio.delta`. See the Protocol Comparison section for the full mapping.
  </Accordion>

  <Accordion title="The handshake fails outright. How do I debug it?">
    Check five things in order: 1. the scheme is `wss://`, not `https://`; 2. the endpoint includes `?model=<model-name>`; 3. the `Authorization: Bearer <key>` header is present; 4. the key's group includes the model (all four are in the default group; a mismatch returns 503 with "no available channel"); 5. no reverse proxy in between is stripping the `Upgrade` header — this is a common issue when relaying through your own gateway.
  </Accordion>

  <Accordion title="Can I connect from the browser? Will my key leak?">
    Technically yes — the endpoint accepts auth via the `Sec-WebSocket-Protocol` subprotocol, so a browser `WebSocket` can connect directly. But that **hands your key to the browser**, where any visitor can read it from the network panel, so it is **only suitable for local verification**. In production write a backend relay: the backend holds the key and opens the connection to APIYI, and the frontend talks only to your own service.
  </Accordion>

  <Accordion title="Sending 16 kHz audio to gpt-realtime-2.1 fails. Why?">
    The Realtime GA protocol requires an input sample rate of **at least 24000**; 16000 returns `integer_below_min_value`. The correct form is `"audio": {"input": {"format": {"type": "audio/pcm", "rate": 24000}}}`. The two Model Studio models require 16 kHz instead — the two are not interchangeable.
  </Accordion>

  <Accordion title="I have no microphone / audio is hard to test. What now?">
    Follow the three-step self-test in the "Start With Text" section: verify the chain over text first (no audio tokens produced), then replay a local wav file to verify the audio pipeline, and only then connect a live microphone. Test audio can be generated in one line with the macOS built-ins `say` and `afconvert` — the commands are in that section.
  </Accordion>

  <Accordion title="After sending response.cancel I never receive response.done.">
    This is a known behavior of the two Model Studio models (reproduced in all 6 test runs): after an interruption you receive `response.text.done`, `response.content_part.done` and `response.output_item.done`, but `response.done` is not delivered. **Use `response.output_item.done` as the end-of-turn signal and add a timeout as a backstop.** The session itself is unaffected and the conversation continues normally. The two Realtime GA models behave correctly here.
  </Accordion>

  <Accordion title="My connection drops after about 5 minutes.">
    The Model Studio protocol drops connections after **300 seconds of inactivity**, and **WebSocket-level ping/pong does not count as activity** — a heartbeat will not extend that timer. Either send an application-level event periodically while idle (a `session.update`, for instance), or accept the disconnect and reconnect automatically. Remember to replay `session.update` and any required context after reconnecting.
  </Accordion>

  <Accordion title="How long can a single session stay open?">
    On the Realtime GA protocol the `session.created` event carries `expires_at`, measured at roughly 30 minutes from connect, after which you need to reconnect. On the Model Studio protocol the constraint we mainly observed is the 300-second idle disconnect. Design long conversations on the assumption that sessions expire, and plan how context carries across sessions.
  </Accordion>

  <Accordion title="How do I set the voice, and why does changing it return cannot_update_voice?">
    Set the voice in `session.update`: top-level `voice` on Model Studio, `audio.output.voice` on Realtime GA. **Once the session has produced audio output the voice can no longer be changed** — this applies to both protocols and returns `cannot_update_voice`. Pin it in the first frame and open a new session to switch. Also, do not send an empty string as the voice on Model Studio; it returns 400.
  </Accordion>

  <Accordion title="I get no input transcription in manual commit mode.">
    The `flash` model on Model Studio does not deliver the transcription completion event in manual `commit` mode (reproduced consistently across runs); the `plus` model does, and both work in VAD mode. **Switch to `server_vad` or `semantic_vad`.** Testing shows the transcript text lands in an undocumented field on the delta events in this case, but that field may change at any time and **should not be relied upon**. Note this only affects displaying what the user said in your UI — the conversation is unaffected, and the model understands and answers the audio correctly.
  </Accordion>

  <Accordion title="Is image input supported? Why do I get Error append image before append audio.?">
    All four models support image input, but the syntax differs. On Realtime GA you place `input_image` directly in the message. On Model Studio images are treated as **video frames**, so audio must be appended before any image, which is what triggers that error. In testing the working approach is to interleave image frames into the audio stream at roughly one frame per second.
  </Accordion>

  <Accordion title="Is there prompt caching? How do I confirm a hit?">
    The two Realtime GA models support it and it applies automatically — in testing the second turn within a session already hit, with a value in `usage.input_token_details.cached_tokens` (prefix of at least 1024 tokens, in 128-token increments). **Note that APIYI currently bills cached tokens at the full text-input rate**; the discount will be announced in the changelog once it is live. No cache hits were observed on the two Model Studio models.
  </Accordion>

  <Accordion title="Are WebRTC, SIP or ephemeral keys (client_secrets) supported?">
    **No.** `POST /v1/realtime/client_secrets` and `POST /v1/realtime/calls` both return 404 on APIYI, and SIP is unavailable too; the single `wss://api.apiyi.com/v1/realtime` WebSocket endpoint is the only entry point. For browser or mobile clients, write a backend relay: the backend holds the key and opens the WebSocket, and the frontend talks only to your own service.
  </Accordion>

  <Accordion title="Do the GA session fields such as reasoning.effort and noise_reduction work on gpt-realtime-2.1?">
    Yes. In testing every one of them passed through unchanged and was echoed back in `session.updated`: `reasoning.effort` (`minimal` / `low` / `medium` / `high` / `xhigh`, accepted by both models), `audio.input.noise_reduction`, `audio.input.turn_detection.idle_timeout_ms`, `audio.input.transcription.model` (including `gpt-realtime-whisper`), `truncation`, `tracing`, `max_output_tokens` and `parallel_tool_calls`. Field semantics follow the OpenAI reference; the gateway does not rewrite them.
  </Accordion>

  <Accordion title="How do I estimate cost? Are text and audio billed separately?">
    The `usage` object on `response.done` reports tokens per modality (text / audio / image, separately for input and output), so cost can be attributed; the call-log detail view carries the same per-modality `usage`, one record per completed `response.done`. Audio tiers are substantially higher than text, which is why text-only is recommended during integration. **For actual charges, refer to the [call logs](https://api.apiyi.com/log).**
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="API 매뉴얼" icon="book-open" href="/ko/api-manual">
    키 생성, 기본 URL, 과금 방식 및 기타 일반 규칙입니다.
  </Card>

  <Card title="키 및 그룹" icon="key-round" href="/ko/api-capabilities/token-management">
    키를 생성하고, 그룹을 선택하며, 쿼터를 설정합니다.
  </Card>

  <Card title="텍스트 생성" icon="file-text" href="/ko/api-capabilities/text-generation">
    일반 채팅 모델 — 텍스트 전용 대화에 더 적합합니다.
  </Card>

  <Card title="모델 가격" icon="table" href="/en/models">
    플랫폼의 모든 모델에 대한 실시간 가격 정보, 엔드포인트 및 그룹입니다.
  </Card>

  <Card title="충전 보너스" icon="percent" href="/ko/faq/recharge-promotions">
    실질 비용을 더 낮춥니다.
  </Card>

  <Card title="WeCom 지원" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    통합 관련 질문, 동시 실행 수 증가 및 문서 누락 사항을 지원합니다.
  </Card>
</CardGroup>

<Info>
  네 가지 실시간 모델 모두 기본 그룹에서 사용할 수 있습니다. 이 페이지의 측정 결과는 2026-08-24의 첫 번째 측정과 2026-09-14의 재테스트(UTC+8)에서 얻은 것이며, 업스트림 변경에 따라 업데이트됩니다. 통합할 계획이 있거나, 이 페이지에서 다루지 않은 문제를 발견했거나, 더 높은 동시 실행 수가 필요한 경우 [hi@apiyi.com](mailto:hi@apiyi.com) / [feedback@apiyi.com](mailto:feedback@apiyi.com)으로 문의해 주십시오.
</Info>
