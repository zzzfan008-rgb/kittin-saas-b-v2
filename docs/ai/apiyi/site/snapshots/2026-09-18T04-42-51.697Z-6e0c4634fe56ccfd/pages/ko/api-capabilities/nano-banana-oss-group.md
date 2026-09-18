> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana OSS 그룹

> Nano Banana OSS(NB-OSS) 베타 그룹: 이미지 출력이 Base64 대신 URL이므로 전송 오버헤드를 줄이고 사용 경험을 향상합니다. URL을 직접 사용하는 시나리오에 가장 적합합니다.

## 배경 (먼저 읽기)

<Info>
  **무엇인지**: 이는 이미지 출력이 Base64가 아닌 **URL**인 베타 그룹으로, Base64 전송 오버헤드를 줄이고 고객 경험을 개선합니다. **URL을 직접 사용하는 시나리오에 가장 적합합니다.** 특별한 요구 사항이 없고 Base64로 인코딩된 이미지 출력을 처리할 수 있다면, 여전히 "일반 기본 그룹" 또는 "NanoBanana 엔터프라이즈 그룹" 사용을 권장합니다.
</Info>

**지원 모델** (Nano Banana Pro 및 Gen 1):

* `gemini-3-pro-image-preview`
* `gemini-3.1-flash-image-preview`
* `gemini-2.5-flash-image`

## 시작하기

<Steps>
  <Step title="이 표시 그룹을 활성화하도록 관리자에게 요청하십시오">
    계정에서 NB-OSS 표시 그룹을 활성화하도록 관리자에게 문의하십시오(“Edit User Info → 추가 표시 그룹” 아래에 NB-OSS를 추가합니다).

    <Frame caption="Edit User Info: add NB-OSS under Extra Visible Groups">
      <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-contact-admin.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=d4975f7e75786ca3452e99659297f9dc" alt="사용자 정보 수정 화면에서 추가 표시 그룹 아래에 NB-OSS 그룹을 추가합니다" width="736" height="310" data-path="images/nano-banana-oss-contact-admin.png" />
    </Frame>
  </Step>

  <Step title="토큰 만들기: NB-OSS 그룹을 선택하십시오">
    토큰을 만들 때 과금 모델을 “호출당 과금”으로 설정하고 **NB-OSS** 그룹(Nano Banana PRO, 이미지는 Base64 대신 URL로 출력됨)을 선택하십시오. 토큰만 교체하면 되며, 요청 형식은 동일합니다.

    <Frame caption="Create token: set billing model to per-call billing, select the NB-OSS group (1x) — image output as URL instead of Base64">
      <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-create-token.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=6ccac2359d775f8c0f9a185884bb6e4a" alt="토큰 만들기 화면: 과금 모델을 호출당 과금으로 설정하고, NB-OSS 그룹을 선택하며, 이미지는 Base64 대신 URL로 출력됨" width="1284" height="886" data-path="images/nano-banana-oss-create-token.png" />
    </Frame>
  </Step>

  <Step title="토큰을 교체하고 테스트하십시오">
    토큰을 적용하고 테스트를 실행하십시오. **코드는 URL 출력 파싱을 처리할 수 있어야 합니다** — 단순히 Base64를 대체하지 마십시오. 둘 다 지원하는 것이 가장 좋습니다.
  </Step>
</Steps>

## 예제 코드

```bash theme={null}
curl --location 'https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent' \
  --header 'Authorization: Bearer sk-' \
  --header 'Content-Type: application/json' \
  --data '{
      "contents": [
          {
              "parts": [
                  {
                      "fileData": {
                          "fileUri": "https://raw.githubusercontent.com/apiyi-api/ai-api-code-samples/refs/heads/main/Vision-API-OpenAI/otter.png",
                          "mimeType": "image/png"
                      }
                  },
                  {
                      "text": "add five dogs"
                  }
              ],
              "role": "user"
          }
      ],
      "generationConfig": {"responseModalities": ["IMAGE"],
      "imageConfig": {
        "aspectRatio": "16:9",
        "imageSize": "2K"
      }},
      "safetySettings": []
  }'   > output.json
```

### 출력 예시

이미지 URL은 `text` 필드에 있으며, 그 아래의 `thoughtSignature`은 추론 과정의 base64입니다.

<Frame caption="Response JSON: candidates → content → parts, the image URL is in the text field; thoughtSignature is the base64 of the reasoning">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-output-example.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=7c466c969fc59d03a889f31c8b192bcb" alt="예시 API 응답 JSON, text 필드에는 이미지 URL이 포함되며, thoughtSignature 필드는 추론의 base64입니다" width="1200" height="637" data-path="images/nano-banana-oss-output-example.png" />
</Frame>

## OSS 저장 위치 및 다운로드 속도

### 이미지는 어디에 저장됩니까?

출력 이미지 URL들은 **로스앤젤레스(미국 서부, `us-west-1`, 북미 리전)의 Alibaba Cloud OSS에 호스팅됩니다**. URL은 다음과 같습니다:

```
https://<bucket-name>.oss-us-west-1.aliyuncs.com/xxxx.png
```

<Warning>
  URL의 서브도메인 부분(즉, `<bucket-name>`, 예: `mycdn-gg`)은 **시간이 지나면 변경될 수 있으므로 — 코드나 방화벽 규칙에 전체 도메인을 하드코딩하지 마십시오**. 도메인을 일치시키거나 허용 목록에 추가해야 한다면, 접미사 `oss-us-west-1.aliyuncs.com`(Alibaba Cloud의 공식 OSS 도메인)와 일치시키거나, 더 느슨하게는 `*.aliyuncs.com`를 허용하십시오.
</Warning>

### 다운로드가 느립니까?

저장 노드가 북미에 있으므로 일부 지역(예: 중국 본토)에서는 직접 다운로드가 느릴 수 있습니다. 일반적인 원인과 제안은 다음과 같습니다.

* **기업 네트워크의 트래픽 제한 / 해외 트래픽 허용 목록 차단**: 네트워크 관리자에게 `*.oss-us-west-1.aliyuncs.com`(또는 `*.aliyuncs.com`)에 대한 요청 제한을 해제하고 허용 목록에 추가해 달라고 요청합니다.
* **즉시 재호스팅**: URL을 받자마자 이미지를 다운로드하고, 최종 사용자에게 제공하기 전에 자신의 저장소 / CDN에 다시 업로드하십시오. OSS URL을 최종 사용자에게 장기적으로 노출하지 마십시오.
* **서버를 통해 다운로드**: 로컬 네트워크가 느리다면, 먼저 해외 서버(또는 네트워크 경로가 좋은 서버)를 통해 다운로드한 다음 전달하십시오.

DNS, 라우팅, 국경 간 대역폭 등 추가적인 네트워크 문제 해결 아이디어는 FAQ: [CDN 이미지/동영상 다운로드가 느릴 때는 어떻게 해야 합니까?](/ko/faq/cdn-download-slow)를 참조하십시오.

### URL이 열리지 않습니까?

핵심은 출력 JSON에서 이스케이프된 시퀀스 `\u0026`를 일반적인 `&`로 복원하면서, `thoughtSignature` 이후의 base64 내용은 무시하는 것입니다.

<Frame caption="The image link is in the text field; restore the JSON-escaped & back to the & in the URL, and ignore the base64 after thoughtSignature">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-url-unescape.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=5998b89a3f6b0cf6448041e47db2d9dd" alt="다이어그램: 이미지 링크는 텍스트 필드에 있으므로, JSON 이스케이프 백슬래시 u0026를 & 기호로 복원하고 thoughtSignature 이후의 base64 내용은 무시합니다" width="1200" height="723" data-path="images/nano-banana-oss-url-unescape.png" />
</Frame>
