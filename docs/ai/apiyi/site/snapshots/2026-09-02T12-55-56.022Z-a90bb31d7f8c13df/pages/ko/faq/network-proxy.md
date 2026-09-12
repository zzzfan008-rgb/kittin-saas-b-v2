> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API를 사용하려면 프록시가 필요합니까?

> APIYI의 네트워크 접근 방식과 프록시 또는 VPN이 필요한지 알아봅니다

## 짧은 답변

**프록시가 필요 없습니다. 직접 연결이 가능합니다.**

APIYI는 프록시나 VPN 없이 중국 본토에서 직접 접속할 수 있습니다.

## 네트워크 접속 안내

### 중국 본토 사용자

<Info>
  **프록시 없는 직접 연결**

  * ✅ 프록시나 VPN 설정이 필요하지 않습니다
  * ✅ `api.apiyi.com`에 직접 접속할 수 있습니다
  * ✅ 중국 연결을 위한 엔터프라이즈급 전용 회선
  * ✅ 낮은 지연 시간, 높은 안정성
</Info>

### 해외 사용자

중국 밖에서 APIYI를 사용하는 경우:

* 🚀 더 빠른 접속 속도
* 🌐 직접 국제 라우팅
* ⚡ 추가 설정이 필요하지 않습니다

## 네트워크 문제 해결 방안

드물게 일부 사용자는 다음과 같은 문제를 겪을 수 있습니다:

<CardGroup cols={2}>
  <Card title="HTTPS 인증서 문제" icon="shield-alert">
    SSL/TLS 인증서 검증 실패

    가능한 원인: 잘못된 로컬 시간, 불완전한 인증서 체인
  </Card>

  <Card title="연결 오류" icon="wifi-off">
    연결 시간 초과 또는 연결을 설정할 수 없음

    가능한 원인: 로컬 네트워크 제한, DNS 확인 문제
  </Card>
</CardGroup>

### 대안: HTTP 주소

위 문제를 해결할 수 없는 경우, 대안으로 HTTP 접속을 제공합니다:

<Warning>
  **HTTP 주소 발급 받기**

  HTTP 프로토콜은 데이터를 암호화 없이 전송하므로 임시 해결책으로만 사용해야 합니다. HTTP 접속 주소를 받으려면 기술 지원팀에 문의해 주십시오:

  [Enterprise WeChat에서 문의하기](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
</Warning>

## 자주 묻는 질문

### 왜 중국에서 직접 연결할 수 있습니까?

저희는 중국 연결을 위해 규정을 준수하는 엔터프라이즈급 전용 회선을 사용하여, 중국 본토 사용자가 안정적이고 빠르게 접속할 수 있도록 보장합니다.

### HTTPS와 HTTP의 차이점은 무엇입니까?

* **HTTPS** (권장): 암호화 전송, 높은 데이터 보안
* **HTTP** (대안): 평문 전송, HTTPS에 문제가 발생할 때만 임시로 사용하십시오

### 네트워크 연결이 정상인지 확인하는 방법은 무엇입니까?

다음 명령으로 테스트할 수 있습니다:

```bash theme={null}
# Test API connection
curl -I https://api.apiyi.com

# Test DNS resolution
ping api.apiyi.com
```

정상 응답을 받으면 네트워크 연결은 정상입니다.

## 네트워크 최적화 팁

<Tip>
  **액세스 속도 향상 팁**

  * 🕐 로컬 시스템 시간이 정확한지 확인하십시오(인증서 검증 실패를 방지합니다)
  * 🌐 안정적인 DNS 서비스를 사용하십시오(예: 114.114.114.114 또는 8.8.8.8)
  * 📡 Wi-Fi보다 유선 네트워크를 우선 사용하십시오
  * 🔄 시스템 루트 인증서를 정기적으로 업데이트하십시오
</Tip>

## 기술 지원

네트워크 접속 문제가 발생하면 기술 지원팀에 문의해 주십시오:

<Card title="기업용 WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="기업용 WeChat QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

  QR 코드를 스캔하거나 [지원팀에 문의하기](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

  기술 지원, 빠른 응답
</Card>
