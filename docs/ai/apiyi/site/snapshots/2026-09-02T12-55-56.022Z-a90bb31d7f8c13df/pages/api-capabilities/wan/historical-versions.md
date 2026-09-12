> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan 历史版本（Wan2.6）

> Wan2.6 系列（含 wan2.6-r2v-flash）历史版本说明与迁移指南：与 Wan2.7 共用同一端点和 schema，只改 model 名即可调用。

本页面向**正在用 Wan2.6 的用户**，说明各版本差异与迁移到 Wan2.7 的路径。新用户请直接从 [Wan 概览](/api-capabilities/wan/overview) 起步。

## 版本一览

| 版本         | 状态     | 端点 / 协议                          | 推荐场景                             |
| ---------- | ------ | -------------------------------- | -------------------------------- |
| **Wan2.7** | ✅ 当前推荐 | `/wan/api/v1/...video-synthesis` | 新接入首选，能力最全（音频驱动、多主体参考）           |
| **Wan2.6** | 🟡 维护中 | 同 Wan2.7（只改 model 名）             | 已有 Wan2.6 代码、需要 `r2v-flash` 低延迟档 |

<Info>
  Wan2.6 与 Wan2.7 **共用同一个 DashScope 透传端点和同一套请求结构**，迁移时**只需把 `model` 字段从 `wan2.6-*` 改成 `wan2.7-*`**，body 其余部分一字不改。具体上线日期与最新可用性以 [API易控制台](https://api.apiyi.com/token) 模型列表为准。
</Info>

## Wan2.6 各型号

| 模型 ID              | 能力           | 说明                                  |
| ------------------ | ------------ | ----------------------------------- |
| `wan2.6-t2v`       | 文生视频         | 对应 `wan2.7-t2v`                     |
| `wan2.6-i2v`       | 图生视频         | 对应 `wan2.7-i2v`                     |
| `wan2.6-r2v`       | 参考图生视频       | 对应 `wan2.7-r2v`                     |
| `wan2.6-r2v-flash` | 参考图生视频（低延迟档） | Wan2.6 专属的快速档，生成更快、单价更低，适合联调试错与批量预览 |

<Tip>
  `wan2.6-r2v-flash` 是 Wan2.6 系列里的轻量快速档，没有对应的 2.7 版本。开发期用它快速验证 prompt 与参考图效果，定型后再切到 `wan2.7-r2v` 出正式片。
</Tip>

## 迁移建议

<Steps>
  <Step title="评估差异">
    Wan2.7 在多主体参考、音色参考（`reference_voice`）、音频驱动等能力上更强。若你只用基础的 t2v / i2v / r2v，迁移成本几乎为零。
  </Step>

  <Step title="并行对照">
    用同一组 prompt 和媒体素材，分别提交 `wan2.6-*` 与 `wan2.7-*` 任务，对比画质与一致性后再决定切换。
  </Step>

  <Step title="渐进切换">
    只改 `model` 字段即可。端点、请求头、`input` / `parameters` 结构、轮询与下载流程完全一致，无 Breaking Change。
  </Step>
</Steps>

## 旧版调用示例

```python theme={null}
import requests

# 调用 Wan2.6：与 Wan2.7 唯一的区别就是 model 名
body = {
    "model": "wan2.6-r2v-flash",   # 改成 wan2.7-r2v 即升级到 2.7
    "input": {
        "prompt": "参考图片，一位女孩在花园里缓步行走，电影级光影",
        "media": [{"type": "reference_image", "url": "https://your-cdn.com/girl.png"}],
    },
    "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
}
resp = requests.post(
    "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis",
    json=body,
    headers={"Authorization": "Bearer sk-your-api-key", "Content-Type": "application/json",
             "X-DashScope-Async": "enable"},
    timeout=30,
)
print(resp.json()["output"]["task_id"])
```

## 计费差异

<Note>
  Wan2.6 与 Wan2.7 的价格、分组配置即将上线，本页稍后补充。一般规律：`r2v-flash` 等快速档单价更低，高分辨率 / 长时长单价更高。最新价格以 [API易控制台](https://api.apiyi.com/token) 账单页为准。
</Note>

## 相关文档

<CardGroup cols={2}>
  <Card title="Wan 概览" icon="video" href="/api-capabilities/wan/overview">
    异步流程、参数详解、最佳实践
  </Card>

  <Card title="参考图生视频" icon="users" href="/api-capabilities/wan/reference-to-video">
    `wan2.7-r2v` 在线调试
  </Card>
</CardGroup>
