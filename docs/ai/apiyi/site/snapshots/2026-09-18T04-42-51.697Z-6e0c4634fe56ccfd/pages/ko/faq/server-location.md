> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI의 서버는 어디에 있습니까? 어떤 서버를 선택해야 합니까?

> APIYI의 서버 위치, 데이터 센터 분포, 네트워크 지연 테스트 방법, 서버 구매 권장 사항을 알아봅니다

## 서버 위치

APIYI의 서버는 \*\*미국 로스앤젤레스(US West)\*\*에 위치하며, **BandwagonHost의 중국 최적화 프리미엄 네트워크**를 사용합니다.

<Info>
  **프리미엄 네트워크 최적화**: 당사의 서버는 중국 최적화 프리미엄 네트워크를 갖추고 있으며, 중국 본토 사용자를 위해 특별히 최적화되어 있습니다. 대용량 이미지 전송(Base64 인코딩)도 정상 속도를 유지합니다.
</Info>

## 지역별 네트워크 성능

<CardGroup cols={2}>
  <Card title="중국 본토 사용자" icon="map-pin">
    **네트워크 성능**: 매우 우수합니다 ✅

    * 프리미엄 네트워크 최적화로 지연 시간이 낮습니다
    * 대용량 이미지 전송(Base64)은 속도가 보통입니다
    * 고빈도 API 호출에 적합합니다
    * 추가 프록시 설정이 필요하지 않습니다
  </Card>

  <Card title="해외 사용자" icon="globe">
    **네트워크 성능**: 지리적 위치에 따라 달라집니다 🌍

    * 미국 서부 지역에서 지연 시간이 가장 낮습니다
    * 유럽/아시아 태평양에서는 지연 시간이 약간 더 높습니다
    * 미국 서부 서버를 선택하는 것을 권장합니다
    * CDN 가속을 사용할 수 있습니다
  </Card>
</CardGroup>

## 서버 구매 권장사항

### 해외 서버 권장사항

APIYI 서비스를 호출할 때 해외 서버를 사용하시는 경우, 다음을 권장합니다:

<Tip>
  **권장 선택**: 미국 서부(로스앤젤레스, 산호세, 시애틀 등) 데이터센터 서버

  * **지리적 근접성**: 저희 서버와 같은 지역으로 지연 시간이 가장 짧습니다
  * **최적화된 네트워크 라우팅**: 같은 지역 간 최적의 라우팅을 제공합니다
  * **비용 효율적**: 미국 서부 데이터센터는 합리적인 가격을 제공합니다
</Tip>

신뢰할 수 있는 VPS 제공업체를 찾고 계시다면, 저희가 사용하는 동일한 제공업체를 고려해 보십시오:

<Card title="BandwagonHost VPS" icon="server" href="https://bandwagonhost.com/aff.php?aff=80627">
  **BandwagonHost** - 평판 좋은 VPS 제공업체

  * ✅ 중국 최적화 프리미엄 네트워크(CN2 GIA, CN2 등)
  * ✅ 여러 미국 서부 데이터센터(로스앤젤레스, 산호세 등)
  * ✅ 안정적이고 신뢰할 수 있으며 비용 효율적
  * ✅ 국내 사용자와 해외 사용자 모두에게 적합

  BandwagonHost VPS 요금제를 보려면 클릭하세요
</Card>

### 중국 본토 서버

<Info>
  **중국 본토 서버도 매우 잘 작동합니다!**

  중국 최적화 프리미엄 네트워크 덕분에, 서버가 중국 본토에 위치해 있더라도 APIYI에 접근할 때 네트워크 걱정 없이 정상적인 지연 시간과 속도를 제공합니다.
</Info>

**적합한 시나리오**:

* 국내 클라우드 제공업체에 배포된 애플리케이션(Alibaba Cloud, Tencent Cloud, Huawei Cloud 등)
* 주 사용자가 주로 중국 본토에 있는 경우
* 국내 규정 준수 요구사항을 충족해야 하는 경우

## 네트워크 지연 시간을 테스트하는 방법은?

서버를 선택하기 전에 서버에서 APIYI까지의 네트워크 지연 시간을 테스트하는 것을 권장합니다.

### 방법 1: Ping 테스트

```bash theme={null}
# Test latency (ICMP)
ping api.apiyi.com
```

**참고 지연 시간**:

* **중국 본토**: 보통 50-150ms (프리미엄 네트워크 최적화)
* **미국 서부 지역**: 보통 5-30ms (동일 지역)
* **유럽/아시아 태평양**: 보통 150-300ms (크로스 리전)

### 방법 2: cURL 지연 시간 테스트

```bash theme={null}
# Single HTTP latency test
curl -o /dev/null -s -w "Connect time: %{time_connect}s\nTotal time: %{time_total}s\n" https://api.apiyi.com

# Multiple tests for average (more accurate)
for i in {1..10}; do
  curl -o /dev/null -s -w "Test $i - Total time: %{time_total}s\n" https://api.apiyi.com
done
```

### 방법 3: 실제 API 호출 테스트

```bash theme={null}
# Test actual API call latency
time curl -X POST https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

<Tip>
  **최적화 제안**: 지연 시간이 높다면(500ms 초과) 다음을 고려하십시오:

  * 미국 서부 데이터 센터 서버로 전환
  * CDN 또는 프록시 가속 사용
  * 네트워크 최적화 솔루션에 대해 고객 서비스에 문의
</Tip>

## 네트워크 최적화 권장사항

### 고지연 시나리오용

서버의 지연 시간이 높다면 다음 최적화 방법을 시도해 보십시오:

<Steps>
  <Step title="연결 풀링 사용">
    HTTP 연결을 재사용하여 빈번한 새 연결 오버헤드를 방지합니다
  </Step>

  <Step title="HTTP/2 또는 HTTP/3 사용">
    멀티플렉싱 기능을 활용하여 동시 요청 효율을 높입니다
  </Step>

  <Step title="요청 일괄 처리">
    여러 개의 작은 요청을 배치 요청으로 결합하여 네트워크 왕복 횟수를 줄입니다
  </Step>

  <Step title="비동기 호출">
    차단 대기를 피하기 위해 비동기 API 호출을 사용합니다
  </Step>

  <Step title="로컬 캐싱">
    반복되는 요청 결과를 캐시하여 API 호출 빈도를 줄입니다
  </Step>
</Steps>

### 대용량 이미지 전송용

대용량 이미지를 자주 전송하는 경우(예: 이미지 생성, 이미지 인식), 다음을 권장합니다:

<CardGroup cols={2}>
  <Card title="URL 매개변수 사용" icon="link">
    이미지 URL을 Base64 인코딩보다 우선 사용합니다

    요청 본문 크기를 줄이고 전송 효율을 높입니다
  </Card>

  <Card title="이미지 압축" icon="file-archive">
    업로드 전에 이미지 품질을 적절히 압축합니다

    품질을 유지하면서 파일 크기를 줄입니다
  </Card>
</CardGroup>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="왜 다른 지역 대신 미국 서부를 선택해야 합니까?">
    **주요 이유**:

    1. **프리미엄 네트워크 최적화**: 미국 서부는 중국행 프리미엄 네트워크의 주요 출구 지점으로, 중국 본토 사용자에게 최적의 라우팅을 제공합니다
    2. **국제 허브**: 로스앤젤레스는 아시아-태평양, 유럽, 북미 등을 연결하는 주요 국제 네트워크 허브입니다
    3. **비용 우위**: 미국 서부 데이터 센터는 대역폭 비용이 비교적 낮고 비용 대비 효율이 높습니다
    4. **서비스 안정성**: BandwagonHost 같은 제공업체는 미국 서부 운영 경험이 풍부하고 안정성이 좋습니다
  </Accordion>

  <Accordion title="중국 본토에서 APIYI에 접속하면 느릴까요?">
    **아닙니다!**

    저희는 BandwagonHost의 **중국 최적화 프리미엄 네트워크**(CN2 GIA 등)를 사용하며, 중국 본토 사용자를 위해 특별히 최적화되어 있습니다.

    **실제 성능**:

    * 중국 본토 사용자 접속 지연 시간은 보통 50-150ms입니다
    * Base64 대용량 이미지 전송도 정상 속도를 유지합니다
    * 프록시나 VPN 설정이 필요하지 않습니다

    위의 방법으로 실제 네트워크 지연 시간을 테스트할 수 있습니다.
  </Accordion>

  <Accordion title="애플리케이션의 네트워크 지연 시간을 어떻게 최적화할 수 있습니까?">
    **최적화 권장 사항**:

    1. **서버 선택**: 미국 서부 데이터 센터 서버를 선택하십시오(저희와 같은 지역)
    2. **연결 재사용**: HTTP 연결 풀링을 사용하여 잦은 새 연결 생성을 피하십시오
    3. **배치 요청**: 여러 개의 작은 요청을 배치로 합치십시오
    4. **비동기 호출**: 비동기 API 호출을 사용하고 메인 스레드를 차단하지 마십시오
    5. **로컬 캐싱**: 반복 요청 결과를 캐시하십시오
    6. **CDN 가속**: 정적 리소스에 CDN을 사용하십시오

    자세한 내용은 위의 "네트워크 최적화 권장 사항" 섹션을 참조하십시오.
  </Accordion>

  <Accordion title="APIYI는 다른 지역에 서버를 배포할 계획이 있습니까?">
    현재 저희는 **고품질의 안정적인** 미국 서부 서버 서비스를 제공하는 데 집중하고 있으며, 프리미엄 네트워크를 사용해 전 세계 사용자(특히 중국 본토 사용자)에게 좋은 네트워크 경험을 제공합니다.

    향후에는 사용자 수요와 사업 발전에 따라 다른 지역(예: 유럽, 아시아-태평양)에 서버를 배포할 가능성을 검토할 예정입니다.

    특별한 지리적 위치 요구 사항이 있으시면 비즈니스 팀에 연락하여 맞춤형 솔루션을 논의해 주십시오.
  </Accordion>

  <Accordion title="제 서버는 미국 서부가 아니고 지연 시간이 높습니다. 어떻게 해야 합니까?">
    서버의 지연 시간이 높다면(500ms 초과), 다음을 고려하십시오:

    **단기 해결책**:

    * 프록시 또는 CDN 가속을 사용하십시오
    * 애플리케이션 코드 최적화(연결 풀링, 비동기 호출 등)를 수행하십시오
    * 네트워크 왕복을 줄이기 위해 요청을 배치로 처리하십시오

    **장기 해결책**:

    * 서버를 미국 서부 데이터 센터로 이전하십시오
    * 다중 지역 배포를 사용하고, APIYI 호출 전용으로 미국 서부 서버를 두십시오
    * 맞춤형 네트워크 최적화 솔루션을 논의하려면 저희에게 연락하십시오
  </Accordion>

  <Accordion title="BandwagonHost VPS는 개인 개발자에게 적합합니까?">
    **물론입니다!**

    BandwagonHost는 다양한 가격대의 VPS 요금제를 제공합니다:

    * **입문형**: 개인 개발자의 테스트 및 저트래픽 애플리케이션에 적합합니다
    * **중간형**: 소규모에서 중간 규모의 운영 환경에 적합합니다
    * **고급형**: 고트래픽, 고동시 실행 수 시나리오에 적합합니다

    장점:

    * 합리적인 가격, 높은 비용 대비 효율
    * 중국 최적화 프리미엄 네트워크(중국 본토에서 빠른 접속)
    * 유연한 결제 옵션 지원(월간, 연간 등)
    * 스냅샷 백업, 원클릭 재설치 등 편리한 기능 제공
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="네트워크 연결 문제 해결" icon="network" href="/ko/faq/network-proxy">
    네트워크 연결 문제를 해결하고 프록시 등을 구성하는 방법을 알아봅니다.
  </Card>

  <Card title="API 동시 실행 수 제한" icon="gauge" href="/ko/faq/api-concurrency">
    API 동시 실행 수 제한 및 성능 최적화 권장 사항을 알아봅니다.
  </Card>
</CardGroup>

## 문의하기

서버 선택, 네트워크 최적화 및 기타 관련 문의는 다음으로 연락해 주시기 바랍니다:

<CardGroup cols={2}>
  <Card title="기업 위챗" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="기업 위챗 QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QR 코드를 스캔하거나 [지원팀에 문의하기](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    네트워크 최적화, 기술 지원
  </Card>

  <Card title="이메일 문의" icon="mail">
    **고객 서비스**: [support@apiyi.com](mailto:support@apiyi.com)

    **비즈니스 협력**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
