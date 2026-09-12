> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 白底图出现黑点 / 脏块 / 模糊色块怎么办？

> Google Aistudio API 出纯白背景图时容易出现脏块、黑点或模糊色块，可改提示词换浅色背景，或切 Vertex 线路解决。

## 简短回答

这是 Google Aistudio API 出图的已知问题，纯白背景在算力紧张时容易出现黑点、脏块或模糊色块，自 2026 年 4 月起多次出现。有两种解决办法：

* **方案一（推荐先试）**：把提示词里的「白色背景」改成别的浅色背景（如浅灰、米色、淡蓝），无需任何配置变更
* **方案二**：联系运营开通 `VertexGemini` 分组，创建令牌时选该分组，走 Google Vertex 平台出图，能根治纯白背景模糊问题

## 详细说明

Google Aistudio 通道在算力紧张时段（高峰 / 资源调度紧张）对**大面积纯色像素区域**（尤其是白色）压缩处理不够稳定，容易产生三类瑕疵：

* **黑点 / 脏块**：图像局部出现深色斑点或不规则脏块
* **模糊色块**：原本纯白的区域出现灰白、浅黄的雾化区域
* **整体偏色**：白色背景偏暖（米黄）或偏冷（灰蓝），与提示词不一致

这个问题**不是模型能力问题**，而是 Aistudio 出图链路在纯色背景上的渲染缺陷。Nano Banana Pro / Nano Banana 2 等 Gemini 图像模型在 Aistudio 通道都会出现。

## 解决步骤

### 方案一：提示词规避（首选）

把提示词中的「白色背景 / pure white background / #FFFFFF」改成其他浅色背景描述：

* **浅灰**：`浅灰色背景` / `light gray background, #F5F5F5`
* **米色**：`米色背景` / `beige background, #F5F0E5`
* **淡蓝**：`淡蓝色背景` / `light blue background, #E8F0F8`
* **透明**：`透明背景`（若模型支持 alpha 输出）

<Info>
  实测把白色改成浅灰或米色后，黑点、脏块问题几乎完全消失；这不会影响主体物的色彩还原，只改背景色。
</Info>

### 方案二：切到 Vertex 线路

如果你的场景必须用纯白背景（例如电商主图、产品白底图），切到 Vertex 通道可以根治此问题。

#### VertexGemini 分组说明

| 项目       | 说明                                                                     |
| -------- | ---------------------------------------------------------------------- |
| **标识**   | `VertexGemini`                                                         |
| **描述**   | Vertex Gemini Models: Nano Banana Pro / 2 Series，提供 Vertex 渠道专门的生成图片资源 |
| **支持模型** | Nano Banana Pro、Nano Banana 2                                          |
| **优势**   | 能解决纯白背景修图时的模糊背景问题                                                      |
| **劣势**   | 整体并发不高（约 100 RPM），仅开放给特邀客户；图片生成用时比 Aistudio 略慢                         |

#### 使用方式

<Steps>
  <Step title="联系运营开通">
    联系 API易 客服或运营同事，申请开通 `VertexGemini` 分组权限。该分组目前仅对特邀客户开放。
  </Step>

  <Step title="创建专用令牌">
    登录 API易 后台 → 「令牌管理」 → 「创建令牌」 → **选择分组 `VertexGemini`** → 保存密钥。
  </Step>

  <Step title="切换调用">
    用该新令牌调用 Nano Banana Pro / Nano Banana 2 模型即可，调用地址不变（仍是 `https://api.apiyi.com/v1`）。
  </Step>
</Steps>

<Warning>
  **Vertex 分组并发较低（约 100 RPM）**，不建议用于线上高并发场景。主力出图仍建议使用默认分组（Aistudio），仅在遇到纯白背景问题时切到 Vertex 测试对比。
</Warning>

## 常见问题

<AccordionGroup>
  <Accordion title="为什么提示词改色之后就不出问题了？">
    Aistudio 通道的渲染问题主要发生在**大面积纯色像素区域**的压缩与重建环节。把白色改成浅灰 / 米色，相当于让背景变成有细节的浅色填充，规避了「纯色大面积压缩」这个触发条件，问题就消失了。
  </Accordion>

  <Accordion title="Vertex 通道的图片质量一定比 Aistudio 好吗？">
    不一定。Vertex 通道在「纯白 / 纯色背景」场景下渲染更稳，但在其它场景（如复杂构图、人物特写）两者差异不大，且 Vertex 用时更长。**只有当你确认是纯白背景触发问题时才切 Vertex**。
  </Accordion>

  <Accordion title="VertexGemini 分组如何申请？">
    目前仅对特邀客户开放，请联系 API易 客服 / 运营同事申请。普通用户先用方案一（提示词换浅色）通常就够用了。
  </Accordion>

  <Accordion title="切到 Vertex 后请求地址需要改吗？">
    **不需要**。Base URL 仍是 `https://api.apiyi.com/v1`，只是令牌所属分组变了，API易 后端会自动路由到 Vertex 平台。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="Nano Banana 图片失败" icon="banana" href="/faq/nano-banana-image-failure">
    Nano Banana 系列模型的常见出图问题与排查方法。
  </Card>

  <Card title="Google Aistudio vs Vertex 线路" icon="network" href="/faq/google-upstream-aistudio-vertex">
    Aistudio 与 Vertex 两条 Gemini 出图线路的差异与选择建议。
  </Card>

  <Card title="企业分组 Vertex 兜底" icon="building" href="/faq/enterprise-group-vertex-fallback">
    企业用户如何用 Vertex 分组做兜底出图。
  </Card>

  <Card title="图片异步 API" icon="loader" href="/faq/image-async-api">
    图片生成异步任务接口的使用方式。
  </Card>
</CardGroup>
