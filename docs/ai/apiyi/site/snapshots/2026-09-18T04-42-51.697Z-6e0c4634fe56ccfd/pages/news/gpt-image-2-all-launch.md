> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-all 上线：$0.03/张 GPT 官逆图像模型

> API易上线 GPT 图像生成官逆模型 gpt-image-2-all！$0.03/张按次计费，约30秒出图，支持文生图、多图融合编辑、自然语言改图，文字还原度高、中文提示词原生友好。

## 核心要点

* **官逆通道稳定**：GPT 图像生成官方逆向模型，行为对齐官方能力
* **极具竞争力定价**：统一 \$0.03/张，无分辨率阶梯，成本完全可预测
* **三大能力覆盖**：文生图 / 单图编辑 / 多图融合 / 自然语言改图，一站到位
* **文字还原度高**：招牌、海报、信息图中的中英文字渲染稳定
* **中文提示词原生**：无需翻译即可获得高质量输出
* **30 秒出图**：约 30 秒返回，R2 CDN 加速下载

## 背景介绍

2026 年 4 月，API易 正式上线 **gpt-image-2-all** —— 一款 GPT 图像生成的\*\*官方逆向（官逆）\*\*模型。在官方 GPT-Image-1.5 走阶梯计费、单张高质量图成本可达 \$0.20 的背景下，gpt-image-2-all 以 **统一 \$0.03/张** 的按次计费方式，为需要"成本可控 + 文字强 + 中文友好"的场景提供了更经济的选择。

对于大量面向中文用户的信息图、营销海报、社交媒体内容生产场景，这是一个在保留 GPT 图像生成风格基础上，把单张成本拉到一个全新水位的选择。

## 详细解析

### 新增模型

<Card title="gpt-image-2-all" icon="wand-sparkles">
  **GPT 图像生成官逆模型**

  统一 \$0.03/张，约 30 秒出图，支持文生图、单图编辑、多图融合、自然语言改图。无需关心 size/n/quality 等参数，尺寸与风格全部写进 prompt 即可。
</Card>

### 模型对比

| 特性    | **gpt-image-2-all** | GPT-Image-1.5（官转）       | Nano Banana 2    |
| ----- | ------------------- | ----------------------- | ---------------- |
| 通道性质  | 官方逆向                | 官方直连                    | 官方直连             |
| 计费方式  | 统一按次                | 按分辨率阶梯 + Token          | 按次 / 按量          |
| 典型价格  | **\$0.03/张**        | 低 \$0.009 \~ 高 \$0.20/张 | \$0.055/次        |
| 出图速度  | 约 30 秒              | 约 10 秒                  | 约 5-15 秒         |
| 尺寸控制  | 通过 prompt 描述        | `size` 参数               | `aspectRatio` 参数 |
| 中文提示词 | ✅ 原生友好              | ✅ 支持                    | ✅ 支持             |
| 文字渲染  | ✅ 高还原度              | ⭐⭐⭐⭐⭐ 最强                | ⭐⭐⭐⭐ 优秀          |
| 多图融合  | ✅ `image[]` 数组      | ✅ 编辑接口                  | ✅ inlineData     |
| 内容限制  | 较少                  | 较严格                     | 中等               |

<Tip>
  **选择建议**：

  * 💰 **成本敏感、中文场景** → gpt-image-2-all（\$0.03/张统一价）
  * 🎨 **极致文字渲染、官方直连** → GPT-Image-1.5
  * 🍌 **4K 大图、14 种比例** → Nano Banana 2
</Tip>

### 三端点兼容

gpt-image-2-all 同时兼容三个标准 OpenAI 风格端点：

1. **文生图**：`POST /v1/images/generations`（JSON）
2. **图片编辑**：`POST /v1/images/edits`（multipart/form-data）
3. **对话式**：`POST /v1/chat/completions`（适合多轮 + 参考图）

可以无缝复用已有的 OpenAI SDK 和工作流，只需切换 `base_url` 和 `model` 即可。

### 重要注意事项

<Warning>
  **不接受 size/n/quality/aspect\_ratio 字段**

  本模型为自适应模型，传入这些字段可能触发参数校验错误。**尺寸和比例请直接写进 `prompt`**，并把尺寸词放在提示词最前面，模型遵循度更高。

  推荐写法示例：

  * `横版 16:9 电影画幅，黄昏时的海边老灯塔`
  * `1024×1024 方形 LOGO，极简猫咪线条`
  * `竖版 9:16 手机海报，赛博朋克雨夜`
</Warning>

<Warning>
  **b64\_json 前缀行为有过变化，务必做检测**

  发布初期本模型返回的 `b64_json` 字段带 `data:image/png;base64,` 前缀；**2026 年 7 月实测已改为纯 base64（无前缀）**，需解码或自行拼接前缀后使用。

  请在代码里先用 `startsWith('data:')` 做兼容性检测，兼容两种形态。
</Warning>

## 实际应用

### 快速开始（Python）

```python theme={null}
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": "Bearer sk-your-api-key"},
    json={
        "model": "gpt-image-2-all",
        "prompt": "横版 16:9 电影画幅，黄昏时的海边老灯塔",
        "response_format": "url"
    },
    timeout=300  # 保守值，吸收长尾 + 图片上传/下载耗时
).json()

print(response["data"][0]["url"])
```

### 多图融合（cURL）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2-all" \
  -F "prompt=把图1的人物放进图2的场景，参考图3的画风" \
  -F "response_format=url" \
  -F "image[]=@./ref1.png" \
  -F "image[]=@./ref2.png" \
  -F "image[]=@./ref3.png"
```

### 适用场景

<CardGroup cols={2}>
  <Card title="中文营销物料" icon="megaphone">
    海报、直播封面、社交媒体图文，中文文字渲染稳定
  </Card>

  <Card title="电商商品图" icon="shopping-bag">
    多图融合生成产品场景图，比合成软件更灵活
  </Card>

  <Card title="信息图/图解" icon="chart-bar">
    带文字标注的信息图，成本远低于官方 high 质量
  </Card>

  <Card title="自然语言改图" icon="message-circle">
    无需蒙版，通过自然语言描述迭代修改画面
  </Card>
</CardGroup>

## 价格与可用性

| 项目        | 详情                   |
| --------- | -------------------- |
| **模型名**   | `gpt-image-2-all`    |
| **定价**    | \$0.03 / 张，按次计费      |
| **计费规则**  | 统一定价，不区分分辨率/质量/提示词长度 |
| **失败请求**  | 不计费（鉴权失败、参数校验失败）     |
| **N 张生成** | 单次 1 张，N 张请客户端并行调用   |
| **充值优惠**  | 可叠加充值加赠活动            |

<Info>
  **接入即可使用**：已有 API易 令牌可直接调用，无需特殊开通。
</Info>

## 总结与建议

gpt-image-2-all 的核心价值是 **"GPT 风格 + 中文友好 + 成本可预测"**：

* ✅ 如果你的业务大量产出中文内容营销物料 → 推荐作为**主力生图通道**
* ✅ 如果对文字渲染有极致要求 → 可作为 **GPT-Image-1.5 的补充**（成本敏感任务走 gpt-image-2-all，极致文字任务走 1.5）
* ⚠️ 如果对分辨率/宽高比有严格参数化控制需求 → 更推荐 **Nano Banana 2**（支持 14 种宽高比、4K 输出）

立即开始使用：

<CardGroup cols={2}>
  <Card title="模型介绍" icon="book" href="/api-capabilities/gpt-image-2-all/overview">
    查看完整能力说明与最佳实践
  </Card>

  <Card title="文生图 Playground" icon="wand-sparkles" href="/api-capabilities/gpt-image-2-all/text-to-image">
    在线调试文生图接口
  </Card>

  <Card title="图片编辑 Playground" icon="image" href="/api-capabilities/gpt-image-2-all/image-edit">
    上传图片实测改图/融合
  </Card>

  <Card title="充值优惠" icon="gift" href="/faq/recharge-promotions">
    查看最新充值加赠活动
  </Card>
</CardGroup>
