> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro Coze 플러그인

> 커뮤니티가 기여한 Coze 플랫폼용 Python 플러그인으로, Nano Banana Pro (Gemini 3 Pro Image) 호출, 오류 분류, OSS 업로드를 감싸 Coze 워크플로가 하나의 노드에서 텍스트-투-이미지, 이미지-투-이미지, 결과 직접 전달을 수행할 수 있게 합니다.

## 개요

이것은 [Coze platform](https://www.coze.cn)용 맞춤형 Python 플러그인으로, APIYI의 Nano Banana Pro 모델(`gemini-3-pro-image-preview`)을 Coze 워크플로우가 직접 호출할 수 있는 노드로 감쌉니다. 이 플러그인에는 완전한 요청 빌더, 세분화된 오류 분류, 콘텐츠 위반 감지, Aliyun OSS 업로드가 포함되어 있으며, **반환되는 것은 바로 표시할 수 있는 공개 URL입니다**, 따라서 다운스트림에 추가 전달 노드가 필요하지 않습니다.

<Info>
  **프로젝트 정보**

  * 📦 형식: 코드 패키지로 공유됨(**GitHub에 게시되지 않음**)
  * 👤 작성자: Shuaila1996
  * 🎯 플랫폼: Coze CN / 글로벌 맞춤형 플러그인
  * 🔌 모델: `gemini-3-pro-image-preview` (APIYI를 통해)
  * 📝 전체 소스 코드는 아래 "플러그인 전체 소스" 섹션에 포함되어 있습니다 — 복사하여 붙여넣기만 하면 되며, 별도의 다운로드는 필요하지 않습니다
</Info>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="텍스트-이미지 / 이미지-이미지 통합" icon="wand-sparkles">
    `fileurls`가 비어 있는지에 따라 txt2img와 img2img 모드를 자동으로 전환하므로 워크플로에 두 개의 병렬 분기가 필요하지 않습니다
  </Card>

  <Card title="다중 참조 편집" icon="images">
    이미지 URL 배열을 전달하면 다운로드되어 `inline_data`로 주입되며 원본 디테일을 유지합니다
  </Card>

  <Card title="세분화된 오류 분류" icon="shield-check">
    `ZERO_CANDIDATES_TOKEN`, `FINISH_REASON`, `INLINE_DATA_EMPTY`, `TEXT_RESPONSE` 등을 구분하므로 워크플로 분기가 정확하게 반응할 수 있습니다
  </Card>

  <Card title="자동 위반 라벨링" icon="ban">
    워터마크 제거 / 얼굴 합성 / NSFW / 지식 컷오프 이후 프롬프트에 대해서는 사용자가 추측하게 두지 않고 명확한 거부 유형을 반환합니다
  </Card>

  <Card title="직접 OSS 업로드" icon="cloud-upload">
    base64 결과를 Aliyun OSS로 바로 업로드하므로 워크플로는 공유하거나 저장할 준비가 된 URL을 돌려받습니다
  </Card>

  <Card title="해상도 인식 타임아웃" icon="hourglass">
    1K / 2K / 4K(360초 / 600초 / 1200초)에 대해 독립적인 타임아웃을 적용하므로 4K HD 작업이 중간에 끊기지 않습니다
  </Card>
</CardGroup>

## 지원되는 APIYI 모델

| 모델              | 식별자                          | 용도                   | API 문서                                          |
| --------------- | ---------------------------- | -------------------- | ----------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview` | 텍스트-투-이미지, 이미지-투-이미지 | [문서 보기](/en/api-capabilities/nano-banana-image) |

<Tip>
  플러그인은 APIYI의 `https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent` 엔드포인트(Gemini 네이티브 프로토콜)를 호출하며, Google AI Studio와 동일하므로 기존 prompt를 손쉽게 이식할 수 있습니다.
</Tip>

## 플러그인 아키텍처

<img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/coze-plugin-config.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=7052279e4466fdab5319e94e6a2592fc" alt="Coze 플러그인 구성" width="2550" height="1244" data-path="images/community/coze-feishu/coze-plugin-config.png" />

핵심 흐름:

```text theme={null}
Coze workflow input (cleantext / fileurls / aspect_ratio / resolution / apikey)
        ↓
    handler() entry
        ↓
generate_image()  — build parts + call APIYI endpoint
        ↓
   parse candidates / fallback errors
        ↓
upload_base64_to_oss()  — upload to Aliyun OSS
        ↓
return { analysis, url, error }
```

## 입력 및 출력

### 입력

| Field          | Type      | Required | Description                              |
| -------------- | --------- | -------- | ---------------------------------------- |
| `cleantext`    | string    | 예        | 사용자 프롬프트 또는 편집 지시사항                      |
| `fileurls`     | string\[] | 아니요      | 참조 이미지 URL; 비어 있으면 text-to-image가 트리거됩니다 |
| `aspect_ratio` | string    | 예        | 종횡비, 예: `1:1`, `16:9`, `9:16`            |
| `resolution`   | string    | 예        | 해상도, 대문자여야 합니다: `1K` / `2K` / `4K`       |
| `apikey`       | string    | 예        | APIYI 키(권장: 상위 노드를 통해 사용자별로 배포)          |

### 출력

| Field      | Type           | Description                 |
| ---------- | -------------- | --------------------------- |
| `analysis` | string         | 상태 레이블: `图片生成成功` / `图片生成失败` |
| `url`      | string \| null | 성공 시 OSS 공개 URL             |
| `error`    | string \| null | 실패 시 친절한 오류 메시지             |

## 배포

<Steps>
  <Step title="1단계: APIYI 및 OSS 자격 증명 준비">
    * [APIYI 콘솔](https://api.apiyi.com/token)에서 APIYI 키를 생성합니다(`sk-`로 시작)
    * 해당 버킷에 `oss:PutObject` 권한이 있는 Aliyun OSS 버킷과 RAM 하위 계정을 생성합니다
    * `AccessKey ID`, `AccessKey Secret`, `Bucket name`, `Endpoint`를 기록해 두십시오(예: `oss-cn-beijing.aliyuncs.com`)
  </Step>

  <Step title="2단계: Coze에서 사용자 지정 플러그인 생성">
    1. Coze Workspace → Library → 사용자 지정 플러그인 만들기로 이동합니다
    2. “Cloud-side plugin — create in Coze IDE”를 선택합니다
    3. 런타임: **Python**
    4. 종속 항목 추가: `requests`, `oss2`
  </Step>

  <Step title="3단계: 플러그인 코드 붙여넣기">
    아래의 “Plugin Full Source” 섹션에서 전체 Python 코드를 Coze IDE에 복사한 다음, 파일 상단의 4개 OSS 구성 줄을 자신의 값으로 업데이트하십시오:

    ```python theme={null}
    # Aliyun OSS configuration
    ACCESS_KEY_ID = "your-AK"
    ACCESS_KEY_SECRET = "your-SK"
    BUCKET_NAME = "your-bucket"
    ENDPOINT = "oss-cn-beijing.aliyuncs.com"
    ```
  </Step>

  <Step title="4단계: 메타데이터, 입력, 출력 구성">
    아래와 같이 Input / Output 필드와 필수 플래그를 구성하며, 코드의 `args.input` 필드와 일치시킵니다:

    <img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/coze-plugin-metadata.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=991fd5bb9fba689f2629b122b274f088" alt="Coze 플러그인 메타데이터 구성" width="2478" height="1114" data-path="images/community/coze-feishu/coze-plugin-metadata.png" />
  </Step>

  <Step title="5단계: 테스트 및 게시">
    * Coze IDE에서 테스트 매개변수를 입력합니다(권장: 먼저 1K + simple prompt로 OSS 경로를 검증합니다)
    * 초록색으로 표시되면 “Publish”를 클릭합니다. 그러면 노드를 이제 어떤 workflow에서도 드래그할 수 있습니다
  </Step>
</Steps>

## 오류 분류 전략

플러그인은 단순히 불리언만 반환하는 것이 아니라, 실패 원인을 다음 우선순위 순서로 식별하므로 워크플로 분기가 서로 다르게 반응할 수 있습니다:

| 우선순위 | 오류 유형                   | 트리거                                       | 권장 작업                                    |
| ---- | ----------------------- | ----------------------------------------- | ---------------------------------------- |
| 1    | `ZERO_CANDIDATES_TOKEN` | `usageMetadata.candidatesTokenCount == 0` | prompt 또는 이미지가 모더레이션에서 플래그됨; 다시 작성       |
| 2    | `NO_CANDIDATES`         | `candidates` is empty                     | 시스템 오류; 재시도                              |
| 3    | `FINISH_REASON`         | `finishReason` not `STOP`                 | 매핑됨: `PROHIBITED_CONTENT` / `SAFETY` / 등 |
| 4    | `NO_PARTS`              | `content.parts` is empty                  | 재시도                                      |
| 5    | `INLINE_DATA_EMPTY`     | `inlineData` present but `data` empty     | 재시도하거나 재표현                               |
| 6    | `TEXT_RESPONSE`         | 텍스트만 반환됨                                  | 워터마크 / 페이스스왑 / NSFW / 연도 기준으로 자동 분류      |

## 플러그인 전체 소스

아래는 완전한 `coze-nanobanana-pro.py`입니다. 그대로 Coze IDE에 복사할 수 있습니다 — **맨 위의 4개 OSS 구성 라인만 업데이트하면** 게시할 준비가 완료됩니다.

```python coze-nanobanana-pro.py theme={null}
from runtime import Args
from typings.nanobanana_apiyi.nanobanana_apiyi import Input, Output
import requests
import base64
import io
import oss2
import uuid
import re
from datetime import datetime



# 阿里云 OSS 配置
ACCESS_KEY_ID = ""  #填入自己的阿里云 Access Key ID
ACCESS_KEY_SECRET = "" #填入自己的阿里云 Access Key Secret
BUCKET_NAME = "" #填入自己的阿里云 OSS Bucket 名称
ENDPOINT = "oss-cn-beijing.aliyuncs.com" #填入自己的阿里云 OSS Endpoint，例如 "oss-cn-beijing.aliyuncs.com"

# 分辨率超时时间
TIMEOUT = {
    "1K": 360,  # 快速预览
    "2K": 600,  # 推荐使用
    "4K": 1200,  # 超高清
}

def upload_base64_to_oss(image_base64: str) -> str:
    """
    将 base64 图片上传到阿里云 OSS 并返回链接
    支持带 data:image/...;base64, 前缀 和 纯 base64 两种情况
    """
    # 去掉 data:image/...;base64, 前缀
    base64_str = re.sub(r"^data:image/[^;]+;base64,", "", image_base64)
    image_data = base64.b64decode(base64_str)
    image_io = io.BytesIO(image_data)

    auth = oss2.Auth(ACCESS_KEY_ID, ACCESS_KEY_SECRET)
    bucket = oss2.Bucket(auth, ENDPOINT, BUCKET_NAME)
    object_name = f"coze/generated_{uuid.uuid4().hex}.png"
    bucket.put_object(object_name, image_io)

    return f"https://{BUCKET_NAME}.{ENDPOINT}/{object_name}"

# ==============================
# 工具函数：根据 URL 猜测 MIME 类型
# ==============================

def guess_mime_from_url(url: str) -> str:
    url_lower = url.lower()
    if url_lower.endswith(".png"):
        return "image/png"
    if url_lower.endswith(".jpg") or url_lower.endswith(".jpeg"):
        return "image/jpeg"
    if url_lower.endswith(".webp"):
        return "image/webp"
    if url_lower.endswith(".gif"):
        return "image/gif"
    # 默认
    return "image/png"

# ==============================
# 核心：生成 / 编辑图片
# ==============================

def generate_image(prompt: str, aspect_ratio: str, resolution: str, apikey:str,apiurl:str,image_urls=None):
    """
    生成 / 编辑图片的核心函数

    - 如果 image_urls 为空：纯文生图
    - 如果 image_urls 不为空：把 URL 指向的图片下载下来，按 inline_data 方式传给 API，实现改图
    """

    # 组装 parts
    parts = []

    # 1. 如果有图片 URL，则按 apiyi 改图 demo 的方式构造 inline_data
    if image_urls:
        for url in image_urls:
            try:
                resp = requests.get(url, timeout=180)
                if resp.status_code != 200:
                    return {
                        "success": False,
                        "error": f"图片上传阶段，获取图片失败（{url}）HTTP {resp.status_code}"
                    }

                image_bytes = resp.content
                image_base64 = base64.b64encode(image_bytes).decode("utf-8")
                mime_type = guess_mime_from_url(url)

                parts.append({
                    "inline_data": {
                        "mime_type": mime_type,
                        "data": image_base64
                    }
                })
            except Exception as e:
                return {
                    "success": False,
                    "error": f"图片上传阶段，获取图片失败（{url}）: {e}"
                }

    # 2. 文字部分（编辑指令或文生图提示词）
    #    注意：这里不再把图片 URL 塞进 prompt 里，仅用纯文字描述
    if prompt:
        parts.append({"text": prompt})
    else:
        # 没有文字时给一个默认提示（可按需要修改）
        parts.append({"text": "根据图片进行合理的编辑生成。"})

    # 3. 构造请求 payload（和官方改图 demo 一致的结构）
    payload = {
        "contents": [
            {
                "parts": parts
            }
        ],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {
                "aspectRatio": aspect_ratio,
                "image_size": resolution
            }
        }
    }

    headers = {
        "Authorization": f"Bearer {apikey}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(apiurl, headers=headers, json=payload, timeout=TIMEOUT[resolution])

        # HTTP 非200
        if response.status_code != 200:
            return {"success": False, "error": f"HTTP {response.status_code}: {response.text}"}

        # JSON 解析
        try:
            data = response.json()
        except ValueError:
            return {"success": False, "error": "响应不是有效JSON", "response": (response.text or "")[:500]}

        # 1️⃣ 最高优先级：candidatesTokenCount
        usage = data.get("usageMetadata") or {}
        if usage.get("candidatesTokenCount") == 0:
            return {
                "success": False,
                "errorType": "ZERO_CANDIDATES_TOKEN",
                "error": "❌ 内容审核失败\n您的请求在内容审核阶段被拒绝，请修改提示词或图片",
                "response": data
            }

        # 2️⃣ candidates 检查
        candidates = data.get("candidates")
        if not isinstance(candidates, list) or len(candidates) == 0:
            return {
                "success": False,
                "errorType": "NO_CANDIDATES",
                "error": "系统出错，请稍后重试",
                "response": data
            }

        candidate = candidates[0] if isinstance(candidates[0], dict) else None
        if candidate is None:
            return {
                "success": False,
                "errorType": "NO_CANDIDATES",
                "error": "系统出错，请稍后重试（candidates[0]结构异常）",
                "response": data
            }

        # 3️⃣ finishReason
        finish_reason = candidate.get("finishReason")
        if isinstance(finish_reason, str) and finish_reason != "STOP":
            reason_map = {
                "PROHIBITED_CONTENT": "内容违反安全策略，已被拒绝处理",
                "SAFETY": "内容触发了安全过滤器",
                "RECITATION": "内容可能涉及版权问题",
                "MAX_TOKENS": "内容长度超出限制",
            }
            return {
                "success": False,
                "errorType": "FINISH_REASON",
                "finishReason": finish_reason,
                "error": reason_map.get(finish_reason, f"请求被拒绝：{finish_reason}"),
                "response": data
            }

        # 4️⃣ content.parts
        content = candidate.get("content") or {}
        parts = content.get("parts")
        if not isinstance(parts, list) or len(parts) == 0:
            return {
                "success": False,
                "errorType": "NO_PARTS",
                "error": "生成失败，请重试（content.parts为空）",
                "response": data
            }

        # 5️⃣ 提取图片和文本（更精准：识别 inlineData 存在但 data 为空）
        images = []
        texts = []
        saw_inline_but_empty = False

        for i, part in enumerate(parts):
            if not isinstance(part, dict):
                continue

            # 收集 text（即使有 thoughtSignature，也照收）
            t = part.get("text")
            if isinstance(t, str) and t.strip() and not t.startswith("data:image/"):
                texts.append(t.strip())

            # 兼容 inlineData / inline_data
            inline = None
            if isinstance(part.get("inlineData"), dict):
                inline = part["inlineData"]
            elif isinstance(part.get("inline_data"), dict):
                inline = part["inline_data"]

            if inline is not None:
                b64 = inline.get("data")
                if not isinstance(b64, str) or not b64.strip():
                    saw_inline_but_empty = True
                    continue
                images.append(b64.strip())

        # ✅ 更精准：inlineData 存在但全都没 data
        if not images and saw_inline_but_empty:
            return {
                "success": False,
                "errorType": "INLINE_DATA_EMPTY",
                "error": "生成失败：检测到 inlineData 但图片数据为空（inlineData.data为空）",
                "response": data
            }

        # 6️⃣ 有图片：成功（保持你原来的返回结构）
        if images:
            return {"success": True, "image_data": images[0]}

        # 7️⃣ 无图片：有文本 -> TEXT_RESPONSE
        if texts:
            text_content = "\n".join(texts)

            # —— 可选：不做函数，直接就地识别类型（想更简单可删掉这段 detectedType）——
            low = text_content.lower()
            detected = "general"
            if any(k in low for k in ["watermark", "remove watermark", "去水印", "移除水印", "删除水印"]):
                detected = "拒绝处理水印任务"
            elif any(k in low for k in ["faceswap", "face swap", "换脸", "deepfake"]):
                detected = "拒绝处理换脸任务"
            elif any(k in low for k in ["sexually", "explicit", "porn", "nude", "nsfw", "色情", "不雅", "裸"]):
                detected = "拒绝色情任务"
            elif any(str(y) in low for y in range(2026, 2101)):
                detected = "拒绝超过知识库范围任务"

            return {
                "success": False,
                "errorType": "TEXT_RESPONSE",
                "error": detected,   # 你文档要求：直接展示 API text
                "response": data
            }

        # ✅ 更精准：parts 有结构但既无图也无文本
        return {
            "success": False,
            "error": "生成失败：parts存在但未找到图片数据或文本说明",
            "response": data
        }

    except requests.exceptions.Timeout:
        return {"success": False, "error": f"图片生成请求超时（超过 {TIMEOUT[resolution]} 秒）"}
    except Exception as e:
        return {"success": False, "error": f"图片生成请求失败: {str(e)}"}


# ==============================
# Coze Node 入口
# ==============================

def handler(args: Args[Input]) -> Output:
    """
    Coze / NanobananaPro 节点入口

    - args.input.cleantext: 用户文字提示词
    - args.input.fileurls:  用户上传图片的 URL 列表（用于改图）
    - args.input.aspect_ratio: 宽高比，如 "1:1" / "9:16"
    - args.input.resolution: 分辨率，如 "1K" / "2K" / "4K"
    """
    API_URL = "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent"
    API_KEY = args.input.apikey
    cleanttext = args.input.cleantext or ""
    fileurls = args.input.fileurls or []
    aspectratio = args.input.aspect_ratio
    resolution = args.input.resolution
    # - 图片通过 image_urls 传入 generate_image，走 inline_data 改图逻辑
    prompt = cleanttext.strip()

    # 调用 Gemini 3 Pro 生成 / 编辑图片
    # 如果 fileurls 不为空，会按"改图"模式调用

    result = generate_image(prompt, aspectratio, resolution, API_KEY,API_URL,image_urls=fileurls if fileurls else None)

    if result["success"]:
        image_base64 = result["image_data"]
        oss_url = upload_base64_to_oss(image_base64)
        return {"analysis": "图片生成成功", "url": oss_url, "error": None}
    else:
        return {"analysis": "图片生成失败", "url": None, "error": result["error"]}
```

## Coze 워크플로에서 사용하기

게시한 후 플러그인 노드를 Coze 워크플로로 끌어다 놓고 다음과 같이 연결합니다:

```text theme={null}
Start node (user prompt + images)
    ↓
Prompt / image splitter (code node)
    ↓
Per-user API key dictionary (route by caller name)
    ↓
nanobanana_apiyi plugin node (this plugin)
    ↓
Success / failure branch
    ↓
End node (output url or error)
```

<Tip>
  [Feishu Bitable AI 이미지 생성 워크플로](/ko/scenarios/ecosystem/feishu-bitable-image-shortcut)와 함께 사용하면 노코드 생산 라인을 구축할 수 있습니다 — 운영자는 Feishu Bitable에서 행만 채워 이미지를 일괄 생성하면 됩니다.
</Tip>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="왜 base64를 반환하지 않고 OSS에 업로드합니까?">
    하위 Coze 워크플로 노드(특히 Feishu 필드 바로가기)는 결과를 이미지 첨부로 변환하려면 일반적으로 **접근 가능한 URL**이 필요합니다. base64를 반환하면 데이터가 워크플로를 비효율적으로 거치게 되고, Feishu는 이를 직접 렌더링할 수 없습니다. OSS 링크는 장기 보관과 외부 공유도 매우 간단하게 만듭니다.
  </Accordion>

  <Accordion title="OSS 설정에 환경 변수를 사용할 수 있습니까?">
    Coze 커스텀 플러그인은 현재 시스템 환경 변수를 노출하지 않습니다. 권장 방식은 OSS 자격 증명을 파일 상단의 상수로 유지하고 Coze의 플러그인 암호화 기능으로 보호하는 것입니다. 멀티테넌트 워크플로에서는 테넌트별 접두사도 OSS 경로에 기록하십시오.
  </Accordion>

  <Accordion title="왜 apikey를 하드코딩하지 않고 전달합니까?">
    호출자마다 다른 키를 배포하기 위해서입니다. 상류에 호출자 이름을 해당 APIYI 키에 매핑하는 "사용자별 API 키" 딕셔너리 노드를 추가하십시오 — 사용량 정산과 접근 제어가 깔끔해집니다.
  </Accordion>

  <Accordion title="4K 생성이 계속 시간 초과됩니까?">
    Nano Banana Pro의 4K 이미지 생성은 실제로 매우 느립니다(보통 5\~15분). 플러그인은 이미 4K에 대해 1200초 타임아웃을 설정해 두었습니다. 그래도 시간 초과가 계속되면:

    1. prompt를 디버깅하려면 2K로 낮추십시오
    2. APIYI 콘솔에서 요청 제한을 확인하십시오
    3. 동시 호출 수를 줄이십시오
  </Accordion>

  <Accordion title="TEXT_RESPONSE 오류는 어떻게 처리합니까?">
    이는 보통 모델이 거부했음을 의미합니다(위반, 연도 차단 등). 플러그인은 유형을 자동 분류합니다: 워터마크 제거 / 페이스 스왑 / NSFW / 연도 > 2025. `error` 필드를 사용자에게 표시하십시오 — **재시도하지 마십시오**, 결과는 동일합니다.
  </Accordion>

  <Accordion title="전체 소스 코드는 어디에 있습니까? 바로 복사할 수 있습니까?">
    예. 위의 "플러그인 전체 소스" 섹션에는 완전한 `coze-nanobanana-pro.py`가 포함되어 있습니다(Shuaila1996이 기여했습니다). **상단의 OSS 설정 4개 줄만 업데이트하십시오** 그리고 Coze IDE에 붙여넣으십시오 — 별도의 다운로드는 필요하지 않습니다.

    추가로 필요하시면:

    * Feishu 필드 바로가기 → [Feishu Bitable AI 이미지 생성 워크플로](/ko/scenarios/ecosystem/feishu-bitable-image-shortcut)의 "Feishu 필드 바로가기 전체 소스"를 참조하십시오
    * Aliyun FC 코드는 → 같은 문서의 "Aliyun Function Compute 전체 소스"를 참조하십시오
  </Accordion>
</AccordionGroup>

## 관련 리소스

<CardGroup cols={2}>
  <Card title="Feishu Bitable AI 이미지 생성" icon="table" href="/ko/scenarios/ecosystem/feishu-bitable-image-shortcut">
    완벽한 동반자: 이 Coze 워크플로를 Feishu Bitable에 연결하면 운영자는 행만 채워 일괄 생성할 수 있습니다
  </Card>

  <Card title="Nano Banana Pro 문서" icon="banana" href="/en/api-capabilities/nano-banana-image">
    Nano Banana Pro의 전체 API 문서, 과금, 생성 예시
  </Card>

  <Card title="이미지 생성 실패 FAQ" icon="circle-question-mark" href="/ko/faq/nano-banana-image-failure">
    이 플러그인의 오류 코드에 맞춘 Nano Banana 실패 해결 가이드
  </Card>

  <Card title="APIYI 콘솔" icon="settings" href="https://api.apiyi.com/token">
    API 키를 관리하고 사용량과 잔액을 확인합니다
  </Card>
</CardGroup>
