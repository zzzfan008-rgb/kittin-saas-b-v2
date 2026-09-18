> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse 视频 Agent 技能

> 在 Agent 里用 HappyHorse-1.1（画质取向的阿里系视频模型）出片——与 Wan2.7 共用同一个 wan 技能，只需把 --model 设为 happyhorse。

<Note>
  **HappyHorse 不需要单独的技能**。它和 Wan2.7 共用同一个 **wan 视频技能**——两个系列走同一个端点、同一套请求结构、同一个 `Wan&HappyHorse` 令牌分组，只是模型 ID 不同。完整的安装、`SKILL.md` 与脚本，见 [**Wan2.7 / HappyHorse 视频 Agent 技能**](/api-capabilities/wan/skills)。
</Note>

## 这个模型适合什么

<CardGroup cols={3}>
  <Card title="画质取向" icon="sparkles">
    与 Wan2.7 同端点同用法，出片质感更强，适合对画面要求高的场景。
  </Card>

  <Card title="参考图最多 9 张" icon="images">
    参考图生视频一次可挂 9 张参考图（Wan2.7 参考素材合计 5 个）。
  </Card>

  <Card title="同一把令牌" icon="key-round">
    `Wan&HappyHorse` 分组令牌两个系列通用，切换零成本。
  </Card>
</CardGroup>

## 在技能里怎么用

装好 [wan 视频技能](/api-capabilities/wan/skills) 后，把 `--model` 设为 `happyhorse` 即可：

```bash theme={null}
python3 wan/scripts/wan_video.py "无人机航拍秋天山谷，金黄色森林，电影感" --model happyhorse -o valley.mp4
```

脚本会按你传的素材自动选对模型 ID（`happyhorse-1.1-t2v` / `-i2v` / `-r2v` / `happyhorse-1.0-video-edit`），不用记这些名字。

<Warning>
  **红线**：HappyHorse **不支持参考视频与音频驱动**——

  * `--ref-video` 仅 Wan2.7 可用，对 happyhorse 传会被脚本直接拦下；
  * 图生视频只认首帧图，没有 Wan2.7 的 `driving_audio` 音频驱动；
  * 价格约为 Wan2.7 的 1.5 倍（720P \$0.126/秒、1080P \$0.224/秒，5 秒 720P 约 \$0.63），走量场景优先默认的 `wan`。

  技能脚本已对这些差异自动门控，正常用 `--model happyhorse` 不会踩坑。
</Warning>

## 相关文档

* [Wan2.7 / HappyHorse 视频 Agent 技能（主页 · 完整脚本）](/api-capabilities/wan/skills)
* [HappyHorse 视频生成总览](/api-capabilities/happyhorse/overview)
* [Seedance 2.0 视频 Agent 技能](/api-capabilities/seedance2/skills)
