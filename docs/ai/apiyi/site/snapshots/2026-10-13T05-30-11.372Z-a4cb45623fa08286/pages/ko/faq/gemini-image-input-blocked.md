> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 이미지에서 blockReason: OTHER가 반환되는 이유는 무엇입니까?

> Gemini 이미지 모델이 몇 초 만에 candidates 없이 promptFeedback.blockReason을 반환할 때, 수동 및 코드 워크플로 모두에서 차단된 참조 이미지를 찾고 참조 이미지를 전처리합니다.

## 요약 답변

Gemini 이미지 API가 HTTP 200을 반환하지만 응답에 **`candidates`가 없고** `promptFeedback.blockReason`(대부분 `OTHER`)만 있는 경우, 해당 요청은 **생성이 시작되기 전** 공급자의 입력 검사에 의해 차단된 것입니다.

* 이러한 유형의 차단은 대개 몇 초 이내에 반환되며, 일반적인 이미지 생성보다 훨씬 빠릅니다
* `OTHER`에는 이유가 명시되지 않으며, `safetyRatings`는 비어 있는 경우가 많습니다
* 이는 **반드시 prompt 작성 방식과 관련된 것은 아니며**, 단일 참조 이미지가 원인이 되어 발생하는 경우가 많습니다
* gemini-3-pro-image(Nano Banana Pro)는 gemini-3.1-flash-image보다 입력을 더 엄격하게 검사하므로, 동일한 요청이 Pro에서는 차단되고 flash에서는 성공할 수 있습니다

대응 방법은 다음과 같습니다: **먼저 차단을 유발하는 이미지를 찾은 다음, 모든 참조 이미지를 일관되게 전처리하는 것입니다**.

## 확인 방법

일반적인 응답은 다음과 같습니다:

```json theme={null}
{
  "promptFeedback": {
    "blockReason": "OTHER",
    "safetyRatings": []
  },
  "usageMetadata": {
    "promptTokenCount": 1919,
    "candidatesTokenCount": 0
  },
  "modelVersion": "gemini-3-pro-image",
  "responseId": "..."
}
```

| 특징 | blockReason 블록 | NO\_IMAGE |
| - | - | - |
| 실패 정보가 포함된 필드 | `promptFeedback.blockReason` | `candidates[0].finishReason` |
| `candidates` | 없음 | 존재하지만 `parts`은(는) `null`입니다 |
| 응답 시간 | 몇 초 이내 | 일반적인 생성과 유사합니다 |
| 일반적인 원인 | 입력(주로 참조 이미지)이 차단되었습니다 | prompt의 이미지 생성 의도가 불명확합니다 |
| 조치 방법 | 참조 이미지를 찾아 전처리합니다 | prompt를 수정합니다. [NO\_IMAGE 문제 해결](/ko/faq/gemini-no-image)을 참고하십시오. |

## 테스트 사례

2026년 9월 (UTC+8)에 패션 카탈로그 요청을 다시 실행했습니다: 1개의 prompt와 6장의 참조 이미지(포즈, 인물, 배경, 의상, 신발 및 양말 콜라주, 모자), 2:3, 2K, `responseModalities: ["IMAGE"]`.

* gemini-3-pro-image는 3회 연속으로 `blockReason: OTHER`을 반환했습니다. 반면 동일한 요청이 gemini-3.1-flash-image에서는 성공했습니다
* 이미지를 절반씩 반복해서 분할해 테스트한 결과, **유일한 유발 요인은 인물 참조 이미지**였습니다. 이는 전면, 후면, 측면 및 얼굴 클로즈업 패널로 구성된 AI 생성 캐릭터 시트였습니다
* 해당 이미지는 “배경을 연한 회색으로 변경”과 같은 무관한 지시를 포함하여 어떤 prompt와 함께 사용해도 차단되었습니다
* 가장 의심스러웠던 두 이미지인 워터마크가 있는 실제 인물 포즈 사진과 로고가 있는 모자 사진은 모두 단독으로 통과했습니다

주요 발견 사항:

| 인물 참조 이미지 전송 방식 | 결과 |
| - | - |
| 원본 이미지 | 차단됨 13/13 |
| 다른 파일 형식의 동일한 픽셀(예: PNG로 저장) | 차단됨 2/2 |
| JPEG로 다시 내보냄(품질 95, 육안상 차이 없음) | 통과 6/6 |
| 다시 내보낸 이미지로 교체한 전체 6장 이미지 요청 | 생성 완료 2/2, 정확한 인물, 포즈 및 의상 반영 |

즉, 이 검사는 특정 이미지의 정확한 픽셀에 매우 민감할 수 있으며, 이미지를 한 번 다시 내보내는 것만으로도 요청이 통과됩니다. 제공업체는 `OTHER`의 기준을 공개하지 않으므로 더 이상의 원인을 파악하기는 어렵습니다.

<Info>
  이 사례는 한 번의 요청에 많은 참조 이미지를 전송하거나 여러 단계를 단일 생성으로 병합하는 것 자체가 문제는 아님을 보여줍니다. `OTHER`이(가) 발생하면 prompt를 다시 작성하거나 워크플로를 나누기 전에 먼저 문제의 이미지를 찾으십시오.
</Info>

## 해당 이미지를 찾는 방법

<Steps>
  <Step title="1단계: 재현 여부 확인">
    요청을 변경하지 않고 2\~3회 다시 전송합니다. `blockReason` 차단은 대개 일관되게 재현됩니다. 간헐적으로만 실패한다면 문제가 [NO\_IMAGE](/ko/faq/gemini-no-image) 유형일 가능성이 더 높습니다.
  </Step>

  <Step title="2단계: prompt 배제">
    모든 이미지를 유지하고 prompt를 “배경을 밝은 회색으로 변경해 줘”와 같은 단순하고 관련 없는 지시사항으로 교체합니다. 여전히 차단된다면 원인은 이미지에 있습니다.
  </Step>

  <Step title="3단계: 이미지를 절반으로 나누기">
    각 절반을 별도로 전송한 다음, 단일 이미지가 남을 때까지 여전히 차단되는 절반만 계속해서 나눕니다. 6장의 이미지는 최대 3회만 거치면 됩니다.
  </Step>

  <Step title="4단계: 해당 이미지 수정">
    아래의 “권장사항”에 설명된 대로 이미지를 다시 내보낸 다음, 전체 요청을 다시 전송하여 확인합니다.
  </Step>
</Steps>

<Tip>
  범위를 좁히는 과정에서는 이미지가 1장만 생성되어도 해당 그룹을 “통과”로 표시하기에 충분하므로 반복할 필요가 없습니다. 2회 연속 차단되면 “차단됨”으로 표시하기에 충분합니다. 전체 탐색에는 대개 10여 회의 호출만 소요됩니다.
</Tip>

## 권장 사항

### 시나리오 1: 수동 작업 (캔버스 또는 툴에서 생성)

1. **업로드 전 참조 이미지 다시 내보내기**: 이미지 편집기(기본 미리보기 앱 또는 Photoshop 등)를 사용하여 품질 90–95, 긴 변 2048px 이하의 JPEG로 내보냅니다.
2. **대형 이미지 크기 축소**: 긴 변이 3000–4000px인 원본 이미지는 결과에 영향을 주지 않고 2048px로 축소할 수 있으며, 업로드 속도도 빨라집니다.
3. **수초 내에 요청이 실패하면 참조 이미지를 먼저 의심하십시오**: 가장 최근에 추가한 이미지를 다시 내보낸 후 재시도하십시오. 그래도 해결되지 않으면 위에서 설명한 대로 이미지를 하나씩 확인하십시오.
4. **인물 참조용으로 전신 이미지 우선 사용**: 위의 사례에서는 캐릭터 시트를 분할하자 전면 전신 컷만으로 단독 통과되었습니다. 캐릭터 시트가 계속 차단되는 경우 전신 모습만 사용해 보십시오.
5. **임시 대안**: Pro에서 이미지가 통과되지 않는 경우 해당 단계에 gemini-3.1-flash-image를 사용하십시오.

### 시나리오 2: 코드 (자동화 처리)

**1. 개별 이미지를 처리하는 대신 전송 전 모든 참조 이미지를 전처리합니다**: sRGB로 변환 → EXIF 방향 적용 → 긴 변을 2048px로 제한 → JPEG(품질 90–95)로 재인코딩 → 메타데이터 제거.

주요 장점은 요청 본문 크기가 훨씬 작아지고 업로드 속도가 빨라진다는 점입니다(위 사례의 원본 요청은 약 4.6MB였습니다). 또한 이러한 유형의 `OTHER` 차단도 줄어듭니다. Node.js 예시:

```javascript theme={null}
import sharp from "sharp";

async function normalizeReference(buffer) {
  return sharp(buffer, { failOn: "none" })
    .rotate()                       // apply the EXIF orientation
    .toColorspace("srgb")
    .resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();                    // metadata is dropped by default
}

// parts.push({ inlineData: { mimeType: "image/jpeg", data: (await normalizeReference(buf)).toString("base64") } });
```

Pillow를 사용한 Python의 동일한 파이프라인:

```python theme={null}
from io import BytesIO
from PIL import Image, ImageOps

def normalize_reference(raw: bytes) -> bytes:
    im = ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert("RGB")
    im.thumbnail((2048, 2048))
    out = BytesIO()
    im.save(out, "JPEG", quality=92)
    return out.getvalue()
```

**2. 실패 유형별로 다르게 처리합니다**:

| 응답 | 의미 | 권장 처리 방식 |
| - | - | - |
| `promptFeedback.blockReason`이(가) `OTHER`이며 수초 내에 반환됨 | 제공업체의 검사로 인해 입력이 차단됨(사유 미공개) | 다른 인코딩 설정(예: 품질 88, 긴 변 1% 축소)으로 1회 자동 재전송합니다. 그래도 계속 실패하면 flash로 전환하거나 사용자에게 다른 참조 이미지를 요청하십시오. |
| `blockReason`이(가) `SAFETY` / `PROHIBITED_CONTENT`이거나 `finishReason`이(가) `IMAGE_SAFETY` 또는 이와 유사함 | 명시적인 콘텐츠 안전 차단 | **재시도하지 마십시오**. 사용자에게 소재나 설명을 변경하도록 요청하십시오. |
| `finishReason`이(가) `NO_IMAGE`이며 출력 tokens가 0임 | prompt 내 이미지 생성 의도가 불명확함 | prompt에 "output the final image only, no text"를 추가하고 재전송하십시오. 자세한 내용은 [NO\_IMAGE 문제 해결](/ko/faq/gemini-no-image)을 참조하십시오. |

<Warning>
  자동 재시도는 원인을 알 수 없는 `OTHER`에만 적용됩니다. 명시적인 안전 사유의 경우 이미지를 재인코딩해도 결과를 바꿀 수 없으며 그렇게 해서도 안 됩니다. 대신 사용자에게 콘텐츠를 조정하도록 요청하십시오.
</Warning>

**3. 문제 해결 상세 정보 기록**: 실패가 발생할 때마다 `responseId` 및 각 참조 이미지의 해시와 크기를 기록하십시오. 이렇게 하면 이미지를 빠르게 찾을 수 있으며, 지원팀에 문의할 때 필요한 정보를 제공할 수 있습니다.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="flash에서는 이미지가 생성되는데 Pro에서는 왜 차단됩니까?">
    두 모델은 서로 다른 입력 검사를 사용하며, Pro가 더 엄격합니다. flash에서는 통과하고 Pro에서는 차단되는 참조 이미지는 정상적인 동작이며, 요청 자체가 잘못되었음을 의미하지는 않습니다.
  </Accordion>

  <Accordion title="AI가 생성한 참조 이미지도 차단될 수 있습니까?">
    그렇습니다. 위의 사례에서 차단된 이미지는 고객 본인의 사진으로 다시 생성된 캐릭터 시트였습니다. 이미지가 차단되는지 여부는 단순히 출처에만 직결되지 않으므로, 이 페이지의 설명에 따라 해당 이미지를 찾아 전처리하십시오.
  </Accordion>

  <Accordion title="한 번의 요청에 참조 이미지 6장은 너무 많습니까?">
    위의 사례에서 6장의 이미지는 문제가 되지 않았습니다. 인물 이미지 1장을 교체한 후 6장의 이미지가 포함된 전체 요청이 정상적으로 생성되었습니다.
  </Accordion>

  <Accordion title="차단된 요청도 과금됩니까?">
    APIYI 호출 로그를 확인하여 해당 요청에 대한 과금 기록이 생성되었는지 확인하십시오.
  </Accordion>
</AccordionGroup>

## 여전히 문제가 해결되지 않았습니까? 고객지원 문의

도움을 드릴 수 있도록 다음 정보를 포함해 주십시오:

* 모델명 및 token 그룹;
* 전체 응답(최소 `promptFeedback` 및 `responseId`)과 `request ID`;
* 발생 시간(시간대 포함);
* 공유 가능한 경우, 확인하신 참조 이미지.

<Warning>
  전체 API 키를 절대 전송하지 마십시오. 스크린샷이나 로그를 공유하기 전에 키를 가려 주십시오.
</Warning>

<CardGroup cols={2}>
  <Card title="WeCom 지원" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom 지원 QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QR 코드를 스캔하거나 이 카드를 클릭하여 지원팀에 직접 문의하십시오.
  </Card>

  <Card title="이메일 지원" icon="mail">
    **고객지원**: [support@apiyi.com](mailto:support@apiyi.com)

    제목에 “blockReason”과 모델명을 포함하는 것을 권장합니다.
  </Card>
</CardGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Gemini 이미지 API가 NO_IMAGE를 반환하는 이유는 무엇입니까?" icon="image-off" href="/ko/faq/gemini-no-image">
    불명확한 prompt 의도로 인한 이미지 누락 및 해결 방법
  </Card>

  <Card title="Nano Banana 이미지 생성 실패" icon="image-off" href="/ko/faq/nano-banana-image-failure">
    안전, 워터마크 제거, 유명 IP, 미성년자 등을 포함한 일반적인 원인
  </Card>

  <Card title="Gemini 이미지 API 오류 처리" icon="triangle-alert" href="/ko/api-capabilities/gemini-image-error-handling">
    전체 응답 확인 순서 및 사용자 친화적인 오류 메시지
  </Card>

  <Card title="로그에서 과금 금액은 어떻게 확인합니까?" icon="file-text" href="/ko/faq/log-billing-explained">
    호출 로그를 사용하여 요청 성공 및 과금 여부를 확인합니다
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.