> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 素材优先：更快更稳的带图带视频生成

> 带图或带视频调用 Seedance 时，创建任务接口可能几十秒才返回 task ID，甚至客户端读超时。先把素材入库拿 asset:// 素材 ID 再引用，请求体从数 MB 降到几十字节，提交即刻返回，合规校验也提前到入库阶段。含耗时拆解、超时后的判断方法与迁移步骤。

<Note>
  **一句话结论**：纯文生视频不受影响，秒回任务 ID；**一旦带图或带视频，就先把素材入库拿 `asset://` 素材 ID，再在生成请求里引用它**。请求体从数 MB 降到几十字节，创建任务接口立刻返回，素材的合规校验也提前到入库那一步完成。

  这一页讲的是**提交阶段**的提速与稳定性。素材库各接口的逐个说明见 [素材库](/api-capabilities/seedance2/asset-library)，端到端可运行代码见 [素材引用实战](/api-capabilities/seedance2/asset-reference)。
</Note>

## 先分清：提交慢，还是生成慢

Seedance 是**异步任务式**接口，一次出片分成两段，两段的耗时来源完全不同：

| 阶段                                             | 你拿到的                      | 正常耗时                       | 慢下来的原因                                                 |
| ---------------------------------------------- | ------------------------- | -------------------------- | ------------------------------------------------------ |
| **① 提交**：`POST .../generations/tasks`          | 任务 ID `{"id": "cgt-..."}` | 纯文生视频**秒级**；带素材时随素材体积增长    | 素材要先从你的机器上行到 API易，再由我们转发到火山引擎并完成解码校验——这一整段走完，才会返回任务 ID |
| **② 生成**：轮询 `GET .../tasks/{id}` 到 `succeeded` | 成片 `content.video_url`    | 通常 **2–5 分钟**（1080p、长时长更久） | 原厂算力排队，属于正常速度                                          |

**两段是分开的**。「提交花了 60 秒」和「生成花了 5 分钟」是两个独立问题，先看清是哪一段慢再动手——控制台日志里那一列是**首字节耗时**，对应的正是第 ① 段，不是整单出片时间（详见 [控制台用时与客户端等待时间为什么对不上](/faq/log-duration-vs-client-wait)）。

<Warning>
  **典型误判**：把带图请求的读超时设成 60 秒，超时后判定「服务不可用」并立刻重发。实际是素材还在上行途中——重发只会让同一批素材再传一遍，把上行带宽抢得更紧，还可能重复创建任务、重复计费。
</Warning>

## 提交阶段的三种素材传法

同一张图，三种传法在提交阶段的表现差别很大：

| 传法                       | 请求体体积                         | 拿到任务 ID 的耗时              | 主要风险                          |
| ------------------------ | ----------------------------- | ------------------------ | ----------------------------- |
| **Base64 / Data URL 内联** | 与素材同量级，编码后还要再涨约三分之一，常在数 MB 以上 | 随体积与**你的上行带宽**线性增长，多张图叠加 | 客户端读超时；每次重试都要把整份素材重传一遍        |
| **公网 URL**               | 很小，但上游要现场下载素材                 | 取决于**图源的下行速度**与素材体积      | 图源慢 / 限速 / 需鉴权 / 跨境时会显著拖长甚至失败 |
| **`asset://` 素材 ID**     | 几十字节                          | 与纯文生视频同一量级               | 需要提前完成一次入库                    |

前两种传法的耗时都不由模型决定，也不在推理侧：**它们由链路两端的带宽和素材体积决定，所以既慢又不稳定**——同一份代码，今天 8 秒、明天 90 秒都可能发生。`asset://` 把这段耗时**一次性前置**到入库阶段，之后每次生成都只传一个短字符串。

## 为什么素材优先不只是更快

<CardGroup cols={2}>
  <Card title="提交耗时与素材体积脱钩" icon="gauge">
    请求体只剩提示词和一个素材 ID，创建任务接口的耗时回到纯文生视频的量级，客户端超时按 30–60 秒设置就够。
  </Card>

  <Card title="重试代价极低" icon="rotate-ccw">
    换提示词、换比例、换时长重跑时，重发的只是几十字节，而不是重传几 MB 的素材。
  </Card>

  <Card title="合规校验前置" icon="shield-check">
    素材在**入库**时就完成校验并轮询到 `Active`，不合规当场暴露，不必等生成任务跑到一半才 `failed`。
  </Card>

  <Card title="素材可反复引用" icon="repeat">
    入库一次即可长期复用，同一角色跨镜头、跨集引用同一个素材 ID，人物一致性也更好。
  </Card>
</CardGroup>

还有一条是**硬性要求**而不是优化：含写实人脸的素材**不能**直接作参考图（防深伪拦截），必须先入库拿 `asset://` 再引用，详见 [素材库](/api-capabilities/seedance2/asset-library)。

## 怎么改：三步

<Steps>
  <Step title="把素材入库，拿到素材 ID">
    网页零代码上传或走 API 批量入库都行，两条路数据互通，见 [素材库](/api-capabilities/seedance2/asset-library)。入库后轮询到状态 `Active` 即可使用，单张图片约 13 秒。

    素材库随 Seedance 接口**免费使用、不另收年费**。
  </Step>

  <Step title="生成请求里把内联数据换成 asset://">
    `content` 结构、`role`、其余参数全都不用动，只把 `image_url.url` 的值从 Data URL 换成 `asset://<Id>`。提示词里用「图片1」「图片2」按传入顺序指代素材，**不要在提示词里直接写素材 ID**。
  </Step>

  <Step title="把素材 ID 存进你自己的库">
    素材 ID 可长期复用，入库一次就别再重复上传同一张图。建议在业务表里记下「本地素材 → 素材 ID」的映射，后续出片直接取用。
  </Step>
</Steps>

改动前后只差一个字段的值：

```json 改前：整张图内联在请求体里，请求体数 MB 起 theme={null}
{
  "model": "doubao-seedance-2-0-260128",
  "content": [
    { "type": "text", "text": "图片1中的人物正面微笑，镜头缓慢推近" },
    { "type": "image_url",
      "image_url": { "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg……（数百万字符）" },
      "role": "reference_image" }
  ],
  "ratio": "adaptive", "duration": 5, "resolution": "720p"
}
```

```json 改后：请求体几百字节，提交即刻返回任务 ID theme={null}
{
  "model": "doubao-seedance-2-0-260128",
  "content": [
    { "type": "text", "text": "图片1中的人物正面微笑，镜头缓慢推近" },
    { "type": "image_url",
      "image_url": { "url": "asset://asset-2026090200000000-abcde" },
      "role": "reference_image" }
  ],
  "ratio": "adaptive", "duration": 5, "resolution": "720p"
}
```

完整可运行脚本（上传 → 入库 → 引用出片 → 下载）见 [素材引用实战](/api-capabilities/seedance2/asset-reference)。

## 首尾帧场景怎么办

首尾帧（`role: "first_frame"` / `"last_frame"`）与多模态参考（`role: "reference_image"`）是**两种互斥的输入模式**，语义不同，别混着改：

* **确实需要精确的起止画面**（比如要与上一段视频严丝合缝衔接）：保持首尾帧模式，把内联的 Data URL 换成**公网 URL**——请求体立刻从数 MB 降到几百字节，剩下的下载耗时移到上游侧。图片放在直连快、无鉴权、带宽足的对象存储上。
* **本质诉求是「人物 / 场景保持一致」**，起止画面不必逐像素对齐：改用**多模态参考生视频** + `asset://` 素材 ID，这是最稳的一条路，也是本页推荐的做法。

<Tip>
  想连续拼长视频的话不必自己截尾帧：生成时传 `return_last_frame: true`，可以拿到无水印的尾帧 png，直接作为下一段任务的首帧。
</Tip>

## 参考视频与音频

参考视频（`role: "reference_video"`）体积比图片大一个量级，**内联 Base64 是最容易触发提交超时的用法**，务必避免：

* **优先用公网 URL**，放在直连快、无鉴权、带宽足的对象存储上；
* 真人素材组支持视频 / 音频入库（视频 mp4 / mov、2–15 秒、少于 50MB；音频 mp3 / wav、2–15 秒、少于 15MB），走 [素材库](/api-capabilities/seedance2/asset-library) 的真人认证流程；
* 顺带一提，带参考视频的任务会命中**更低的一档单价**：输入含视频 \$7.56 / 百万 tokens，不含视频 \$12.60，见 [概览的模型定价](/api-capabilities/seedance2/overview)。

## 已经超时了怎么办

创建任务的 POST 请求超时时，**客户端无法判断服务端是否已经创建任务**——连响应头都没收到，也就拿不到任务 ID 去查询。按下面的顺序处理：

<Steps>
  <Step title="先查有没有产生记录，别急着重发">
    到 API易 控制台的日志 / 账单里按那个时刻查：**有对应记录就说明任务已经创建并计费**，任务 ID 也在记录里，直接拿去轮询即可；查不到记录才说明请求没走到底。盲目重发会重复创建、重复计费。
  </Step>

  <Step title="把读超时和素材传法一起调">
    只调大读超时是治标。改成 `asset://` 之后，创建请求的超时按 **30–60 秒**设置就足够（异步接口本身很快，耗时在任务侧）。仍需内联大素材时，把连接超时与读超时**分开设置**，读超时按素材体积和你的上行带宽估算。
  </Step>

  <Step title="降并发再排查">
    同时发多个带大素材的创建请求，会互相抢占同一条上行带宽，表现成「几个请求全都卡在超时值上整点超时」。先降到单发验证通过，再逐步加并发。
  </Step>

  <Step title="核对 Base URL">
    不同 Base URL 的网络路径不同，大体积上行的表现可能有差异。可以在你的服务器上对几个可用节点各测一次提交耗时，选最快的那个。节点清单与选择方法见 [Base URL 怎么配](/faq/base-url-config)。
  </Step>
</Steps>

超时排查的通用方法（客户端 timeout 该设多少、逐层排查顺序）见 [如何避免接口超时](/faq/timeout-configuration)。

## 常见问题

<AccordionGroup>
  <Accordion title="纯文生视频也要先走素材库吗？">
    不需要。没有素材输入时请求体就是一段提示词，创建任务接口秒回任务 ID，本页讲的问题完全不存在。
  </Accordion>

  <Accordion title="入库那一步本身要多久？会不会只是把耗时挪了个位置？">
    单张图片约 13 秒完成预处理并轮询到 `Active`，全自动、无人工审核。

    关键在于**这一步只做一次**：同一份素材后续可以无限次引用，而内联上传是**每次生成都要重来一遍**。出片量越大，差距越明显。
  </Accordion>

  <Accordion title="素材 ID 会过期吗？">
    不会。素材 ID 入库后可长期复用，不像成片链接那样有有效期。素材按 icover.ai 账号隔离，你只能看到和使用自己的素材。
  </Accordion>

  <Accordion title="用素材库要额外收费吗？">
    不需要。素材库随 Seedance 接口**免费使用、不另收年费**。官方侧的私域素材库对非框架签约客户是十万元量级的年费单独采购。
  </Accordion>

  <Accordion title="生成好的视频链接能存多久？">
    `content.video_url` 是**24 小时有效**的签名直链，任务成功后请立即转存到自己的存储，不要把它当作长期地址对外分发。
  </Accordion>

  <Accordion title="素材库 KEY 和 Seedance 令牌是同一把吗？">
    不是，两把钥匙不要混用：**素材库 KEY** 在 icover.ai 创建，只用于上传 / 入库 / 查询素材；**APIYI Seedance 视频令牌** 在 api.apiyi.com 创建、须勾选 `SeeDance2` 分组，只用于视频生成接口。
  </Accordion>
</AccordionGroup>

## 相关页面

<CardGroup cols={3}>
  <Card title="素材库" icon="images" href="/api-capabilities/seedance2/asset-library">
    素材库全部接口、网页零代码操作与真人认证
  </Card>

  <Card title="素材引用实战" icon="clapperboard" href="/api-capabilities/seedance2/asset-reference">
    上传入库到出片下载的端到端可运行脚本
  </Card>

  <Card title="Seedance 2.0 / 2.5 概览" icon="sparkles" href="/api-capabilities/seedance2/overview">
    模型选型、定价、分辨率像素表与常见问题
  </Card>
</CardGroup>
