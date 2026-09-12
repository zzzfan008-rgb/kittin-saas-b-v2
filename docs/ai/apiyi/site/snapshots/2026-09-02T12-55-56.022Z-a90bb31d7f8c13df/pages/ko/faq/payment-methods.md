> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI는 어떤 결제 수단을 지원합니까?

> APIYI는 셀프 서비스 온라인 충전(WeChat / Alipay / USDT / Stripe 해외 신용카드)과 수동 충전(PayPal / Wise / Mercury Bank / 은행 송금)을 지원합니다. 중국 또는 미국 법인 명의로 인보이스를 발행할 수 있습니다.

## 빠른 답변

APIYI는 현재 **7가지 주요 결제 수단**을 두 가지 범주로 지원합니다.

* **🟢 셀프서비스 온라인 충전**(실시간 반영): **WeChat, Alipay, USDT, Stripe(해외 신용카드)**
* **🛠️ 수동 충전**(이체 후 지원팀이 반영): **PayPal, Wise, Mercury Bank, 법인 은행 송금**

청구서는 **중국 법인(VAT 증치세 계산서)** 또는 \*\*미국 법인(PDF 송장)\*\*을 통해 발행할 수 있으며, 국내외 재무 업무 흐름을 모두 지원합니다.

## 결제 수단 개요

| 수단               | 작동 방식                                                                                                | 충전 방식                         | 적합 대상            |
| ---------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------- |
| **WeChat Pay**   | 사이트 내 온라인, **중국 사용자만**                                                                               | 셀프 서비스                        | 중국 본토 개인         |
| **Alipay**       | 사이트 내 온라인, **Alipay International** 및 해외 계정을 지원합니다                                                   | 셀프 서비스                        | 중국 + 해외 화교 사용자   |
| **USDT**         | 사이트 내 온라인, 암호화폐, **전 세계 사용자**, 수수료 ≈ **이체당 2 USDT**(자체 TRON 에너지를 사용하면 더 저렴하며, 고액도 동일한 고정 수수료가 적용됩니다) | 셀프 서비스                        | 전 세계 / 암호화폐 사용자  |
| **Stripe**       | 사이트 내 온라인, **외화 신용카드**(실시간, 3D Secure); **거래당 최소 \$50**                                              | 셀프 서비스                        | 해외 개인 / 기업       |
| **PayPal**       | 지정 계정으로 이체, **수수료 ≈ 6%**, 사용자 부담                                                                     | PayPal 핸들을 위해 지원팀에 문의, 수동 충전  | 해외 개인            |
| **Wise**         | 지정된 Wise 계정으로 이체                                                                                     | Wise 상세 정보를 위해 지원팀에 문의, 수동 충전 | 국경 간 개인 / 기업     |
| **Mercury Bank** | 지정 은행 계정으로 이체, **일반적으로 수수료 없음**, **청구서가 자동으로 발행됩니다**                                                 | 결제 링크를 위해 지원팀에 문의, 수동 충전      | 해외 기업에 가장 적합한 선택 |

## 🟢 셀프 서비스 온라인 충전 (실시간)

<CardGroup cols={2}>
  <Card title="위챗 페이" icon="wechat" iconType="brands">
    콘솔에서 원클릭 QR 코드 결제를 지원합니다. **중국 본토 사용자만 가능합니다.** 국내 개인 사용자에게 가장 빠른 선택입니다.
  </Card>

  <Card title="알리페이" icon="alipay" iconType="brands">
    사이트 내 온라인 결제입니다. **Alipay International** 및 해외 계정 모두 지원하여 전 세계 중국인 사용자에게 편리합니다.
  </Card>

  <Card title="USDT (가상자산)" icon="bitcoin">
    사이트 내 온라인 결제이며, **전 세계에서 24시간 365일 이용 가능합니다.** 수수료는 **전송당 약 2 USDT**이며, 금액과 무관하게 동일한 정액 수수료입니다. TRON 에너지를 직접 준비하면 수수료를 더 줄일 수 있습니다.

    지원 네트워크: **TRC20**(권장), **Solana**, 기타 주요 체인.
  </Card>

  <Card title="Stripe (해외 신용카드)" icon="credit-card">
    사이트 내 온라인 결제이며, **외화 신용카드**를 지원하고, **실시간 충전**됩니다. 3D Secure를 기반으로 하며, 귀하의 **회사 / 본인 / 학교** 명의로 발급된 실명 카드를 사용하십시오.

    ⚠️ **거래당 최소 \$50**: 충전 금액이 \$50 미만이면 Stripe를 사용할 수 없습니다.

    📖 [최소 금액 변경 안내](/en/live/2026-07/stripe-minimum-topup-50) · [출시 공지](/en/live/2026-05/stripe-payment-launch)
  </Card>
</CardGroup>

<Warning>
  **Stripe 보안 안내**: Stripe는 엄격한 리스크 통제를 적용합니다 — **안전하지 않거나 실명 인증되지 않은 카드는 즉시 거절됩니다.** **악의적인 결제**(도난 카드, 차지백, 사기 테스트)를 시도하는 계정은 **차단됩니다.** 타인의 카드나 테스트 카드를 사용해 재시도하지 마십시오.
</Warning>

## 🛠️ 수동 충전(지원팀이 적립)

<CardGroup cols={2}>
  <Card title="PayPal" icon="paypal" iconType="brands">
    지원팀이 제공한 PayPal 핸들로 이체합니다. **수수료는 약 6%이며, 사용자가 부담합니다**(즉, 이체 금액에 수수료가 포함되어야 합니다). 소규모 해외 개인 충전에 적합합니다.
  </Card>

  <Card title="Wise (구 TransferWise)" icon="globe">
    지원팀이 제공한 Wise 계좌로 이체합니다. 투명한 외환, 빠른 국경 간 정산 — **프리랜서와 해외 기업**에 적합합니다.
  </Card>

  <Card title="Mercury Bank(해외 기업에 권장)" icon="landmark">
    지원팀이 제공한 은행 계좌 / 결제 링크로 이체합니다. **일반적으로 수수료가 없으며**, 입금 시 **인보이스가 자동으로 발행**됩니다 — 해외 기업의 재무 처리에 가장 유리합니다.
  </Card>

  <Card title="법인 송금(은행 이체)" icon="building">
    **중국 법인 고객** 또는 **중국 무역 파트너를 통해 결제하는 해외 사업자**를 위한 방식입니다(아래 국경 간 워크플로 참고).
  </Card>
</CardGroup>

<Tip>
  **수동 충전 워크플로**: 1️⃣ 수취 계좌를 위해 지원팀에 문의합니다 → 2️⃣ 이체를 완료합니다 → 3️⃣ 증빙 / 해시 / 결제 링크 스크린샷을 보냅니다 → 4️⃣ 지원팀이 확인 후 APIYI 잔액에 적립합니다.
</Tip>

## 🌏 국경 간 / 해외 고객 워크플로

해외 고객(예: **러시아, 중앙아시아, 동남아시아**)이 중국 거래 파트너를 통해 결제해야 하는 경우, 저희는 완전한 규정 준수 워크플로를 제공합니다:

<Steps>
  <Step title="중국 법인과 계약 체결">
    해외 고객은 APIYI의 **중국 법인**과 구매 / 서비스 계약을 체결하며, 금액, 통화, 결제 조건을 명시합니다.
  </Step>

  <Step title="법인 계좌로 은행 송금">
    서비스 요금을 지정된 법인 계좌로 기업 간 은행 송금(**SWIFT / 국경 간 CNY / RUB 정산**)으로 결제합니다.
  </Step>

  <Step title="APIYI 잔액에 수동 충전">
    재무팀이 결제를 확인하면, 저희가 **APIYI 콘솔 잔액을 수동으로 충전**하며, 이 잔액은 즉시 API 호출에 사용할 수 있습니다.
  </Step>

  <Step title="인보이스 발행 / 인보이스">
    **중국 VAT 인보이스**(중국 법인) 또는 **US 인보이스**(US 법인)를 발행할 수 있으며, 현지 회계 및 비용 정산 워크플로에 맞는 방식을 선택하시면 됩니다.
  </Step>
</Steps>

<Info>
  **법인 안내**: APIYI는 **중국 회사 + US 회사**의 이중 법인 구조로 운영됩니다. 고객 위치와 재무 요구에 따라 인보이스 발행을 유연하게 조정할 수 있습니다. 정확한 청구명과 세금 ID는 지원팀에 문의해 주십시오.
</Info>

## 🧾 인보이스 발급

| 인보이스 유형                   | 발급 주체 | 적합 대상                       |
| ------------------------- | ----- | --------------------------- |
| **중국 VAT 인보이스 (普通 / 专用)** | 중국 회사 | 중국 내 기업 환급                  |
| **미국 인보이스 (PDF)**         | 미국 회사 | 해외 사업체 / 국경 간 무역 / 외환 통제 시장 |

<Tip>
  **인보이스 안내**: 지원팀에 **결제 시점(또는 그 이전)** 에 인보이스 필요 사항을 알려 주십시오. 과과금명 / 세금 ID / 이메일을 공유해 주시면 한 번에 발급해 드릴 수 있습니다. 늦은 요청은 기간 간 처리로 진행해야 할 수 있습니다.
</Tip>

## 충전 프로모션

다양한 채널과 금액은 우리의 **첫 충전 보너스 / 단계별 충전 프로모션**과 함께 적용되어 실질 할인율이 최대 약 80%에 달합니다.

📖 참고: [충전 프로모션](/ko/faq/recharge-promotions)

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="Stripe 결제 / 신용카드가 거절되었습니다 — 이제 어떻게 해야 합니까?">
    Stripe의 리스크 통제는 엄격합니다. 가능한 원인은 다음과 같습니다.

    * **충전 금액이 \$50 미만입니다** (Stripe는 거래당 \$50 이상일 때만 선택할 수 있습니다)
    * **CNY 표시 카드**를 사용했습니다 (Stripe는 이 채널에서 CNY 카드를 받지 않습니다)
    * 카드가 **실명 인증**이 아니거나 본인 / 회사 / 학교 명의가 아닙니다
    * **3D Secure 인증에 실패했습니다**
    * 카드 또는 계정이 업스트림 리스크 통제에 의해 표시되었습니다

    다른 채널(Alipay International / Wise / Mercury Bank)로 전환하거나 규정을 준수하는 실명 외국 신용카드를 사용하십시오. **다른 사람의 카드나 테스트 카드를 다시 시도하지 마십시오 — 반복 시도는 계정 수준의 리스크 통제를 유발합니다.**
  </Accordion>

  <Accordion title="법인 송금은 얼마 만에 정산됩니까?">
    일반적으로 수동 충전 기준으로 **같은 영업일**에 처리됩니다(은행 정산에 따르며 — 일부 국경 간 SWIFT 송금은 T+1에서 T+3까지 걸릴 수 있습니다). **송금 후 증빙을 지원팀에 미리 보내 주시면 충전이 더 빨라집니다.**
  </Accordion>

  <Accordion title="USDT에는 어떤 네트워크를 사용해야 합니까?">
    **TRC20**(TRON)을 권장합니다 — 수수료가 낮고 도착이 빠릅니다. **Solana 및 기타 주요 체인도 지원합니다.** **항상 지원팀이나 사이트 내 충전 페이지에서 최신 수신 주소를 확인하십시오** — 제3자 출처는 절대 신뢰하지 마십시오.
  </Accordion>

  <Accordion title="중국 VAT 특별 인보이스(전용 송장)를 발행할 수 있습니까?">
    예. 당사의 중국 법인은 \*\*일반 VAT 인보이스(보통 송장)\*\*와 \*\*특별 VAT 인보이스(전용 송장)\*\*를 모두 지원합니다. 결제 시 지원팀에 **회사명, 세금 ID, 은행명 + 계좌, 등록 주소 / 전화번호**를 보내 주십시오.
  </Accordion>

  <Accordion title="신용카드나 Alipay가 없는 러시아 / 중앙아시아 고객입니까?">
    **법인 송금 절차**를 사용하십시오. 당사의 **중국 법인**과 계약을 체결한 뒤, SWIFT(또는 현지 거래 파트너)를 통해 CNY / USD / RUB로 법인 계좌에 송금하면, 입금 확인 후 **APIYI 콘솔 잔액에 수동으로 충전해 드리고** 중국 VAT 인보이스 또는 미국 인보이스를 발행해 드립니다. 전체 절차는 지원팀에 문의해 주십시오.
  </Accordion>

  <Accordion title="다른 암호화폐도 지원합니까? BTC / ETH?">
    기본적으로 **USDT**(TRC20 / Solana)를 지원합니다. USDC, BTC, ETH 또는 다른 token의 경우, 건별 검토를 위해 지원팀에 문의해 주십시오.
  </Accordion>

  <Accordion title="최소 / 최대 충전 금액은 얼마입니까?">
    **최소 충전:**

    * **Stripe**: 거래당 **\$50**(Stripe의 수수료 및 정산 구조로 인해 2026/7/28에 변경되었으며, 해당 금액 미만에서는 이 채널을 이용할 수 없습니다)
    * **다른 모든 결제 수단**: 거래당 **\$5**, 변경 없음

    **최대**: 채널 간 공통되는 절대 한도는 없지만, PayPal / Stripe에는 업스트림의 거래당 리스크 임계값이 있습니다. \*\*큰 금액(≥ ¥10,000 / \$1,500)\*\*의 경우 법인 송금 또는 Mercury Bank를 이용하시는 것을 권장합니다 — 수수료가 더 적고 인보이스 발행이 더 쉽습니다.
  </Accordion>
</AccordionGroup>

## 지원 문의 / 수금 계정 받기

<CardGroup cols={2}>
  <Card title="기업 WeChat(권장)" icon="phone" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="기업 WeChat 지원 QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    스캔하거나 클릭하여 채팅하세요 — **모든 수동 충전 채널의 수금 계정을 받으십시오**.
  </Card>

  <Card title="공식 이메일" icon="mail" href="mailto:hi@apiyi.com">
    **[hi@apiyi.com](mailto:hi@apiyi.com)**

    공식 비즈니스 커뮤니케이션, 인보이스 요청, 대규모 기업 송금 계약, 파트너십 문의용입니다.
  </Card>
</CardGroup>

<Warning>
  **자금 안전 안내**: 모든 기업 계정, USDT 주소, 그리고 PayPal / Wise / Mercury Bank 수금 계정은 **오직 공식 지원 채널을 통해서만** 받을 수 있습니다. 제3자의 “지원”이나 주소를 절대 신뢰하지 마십시오. 자금 손실을 막기 위해 채널 내에서 반드시 확인하십시오.
</Warning>

## 관련 문서

<CardGroup cols={2}>
  <Card title="충전 프로모션" icon="gift" href="/ko/faq/recharge-promotions">
    첫 충전 보너스, 단계별 리베이트, 교육 할인
  </Card>

  <Card title="내 잔액이 작동하지 않는 이유는 무엇입니까?" icon="circle-question-mark" href="/ko/faq/balance-insufficient">
    잔액 문제 해결 및 과금 모델 참고 사항
  </Card>

  <Card title="추천 리베이트 5% 정책" icon="users" href="/ko/faq/referral-program">
    지속적인 5% 크레딧 리베이트 및 보상 이전 워크플로
  </Card>

  <Card title="환불 정책" icon="rotate-ccw" href="/ko/faq/refund-policy">
    잔액 환불 규칙 및 신청 워크플로
  </Card>
</CardGroup>
