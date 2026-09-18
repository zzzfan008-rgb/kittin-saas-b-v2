> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.5 参考生视频和视频编辑怎么区分？

> 说明 Seedance 2.5 如何根据参考素材和提示词判定参考生视频、视频编辑与视频延长，以及被误判为编辑时的报错原因和稳妥写法。

## 简短回答

Seedance 2.5 **没有单独的「参考生视频」开关**。只要 `content` 里带了参考视频，模型就会根据**提示词意图**判断这是参考生视频、视频编辑还是视频延长：

* 提示词是在**改原视频**（增加、删除、修改、替换、保持某些东西不变）→ 判为**视频编辑**
* 提示词是在**接着原视频往前或往后拍**（延长、续写、延续）→ 判为**视频延长**
* 提示词只是**借用素材的人物、动作、风格去拍一段新视频** → 判为**参考生视频**

被判成编辑后，`ratio` 必须是 `adaptive`、`duration` 必须是 `-1`，传了具体画幅或时长就会返回 400，报错信息里通常带 `TaskTypeConstraint`。

<Info>
  本页只适用于 **Seedance 2.5**（`doubao-seedance-2-5-260628`）。Seedance 2.0 系列没有视频编辑和视频延长这两类任务，不存在这个问题。
</Info>

## 两者的根本区别：素材会不会成为成片的一部分

|         | 参考生视频                        | 视频编辑                                |
| ------- | ---------------------------- | ----------------------------------- |
| 素材的作用   | 只做**语义参考**：借人物长相、动作、运镜、风格、音色 | 原视频**就是成片的底子**，模型在它上面增删改            |
| 输出画幅    | 可自己指定（`ratio` 七档任选）          | **锁定**为原视频画幅，`ratio` 只能是 `adaptive` |
| 输出时长    | 可自己指定（`duration` 取 4–30）     | **锁定**为原视频时长，`duration` 只能是 `-1`    |
| 对原视频的要求 | 无特殊要求                        | 时长必须在 **4–30 秒**之间，20 秒以内效果较好       |
| 典型提示词   | 「参考视频1的舞蹈动作，让图片1的角色在海边跳」     | 「把视频1里的人物换成图片1」「删掉视频1的背景音乐」         |

一句话判断：**成片里还能不能看到原视频本身？** 能看到就是编辑（或延长），看不到、只保留了某种「感觉」就是参考生视频。

视频延长与编辑类似，画幅同样锁定为原视频的画幅，但时长可以自己指定。

## 模型是怎么判定的

判定分两步：先看素材的 `role`，再看提示词。

| 任务类型     | 素材条件                                                           | 提示词触发词（原厂文档）                      | `ratio`           | `duration`  |
| -------- | -------------------------------------------------------------- | --------------------------------- | ----------------- | ----------- |
| 参考生视频    | 至少一个 `reference_image` / `reference_video` / `reference_audio` | 无编辑、延长意图                          | 不限                | 不限          |
| 视频编辑     | 至少一个 `reference_video`                                         | 编辑视频、增加 / 加上、删除 / 去掉、修改 / 替换 / 改成 | **必须 `adaptive`** | **必须 `-1`** |
| 视频延长     | 至少一个 `reference_video`                                         | 向前 / 向后延长、延续、续写                   | **必须 `adaptive`** | 不限          |
| 首帧 / 首尾帧 | `role` 为 `first_frame` / `last_frame`                          | 与提示词无关                            | **必须 `adaptive`** | 不限          |

<Warning>
  触发词列表**不是穷举**。模型判断的是语义，不是逐字匹配。「保持视频中的元素不变」「把视频1高清化」「人物服装不变」这类说法虽然不在上表里，但表达的都是「在原片基础上处理」，同样可能被判成视频编辑。
</Warning>

只传参考图、不传参考视频时，不会被判成编辑或延长；只有带了 `reference_video` 才需要留意这个问题。

## 一个真实案例

下面这个请求想做「视频高清化」，同时指定了 4:3 和 15 秒：

```json theme={null}
{
  "model": "doubao-seedance-2-5-260628",
  "ratio": "4:3",
  "duration": 15,
  "resolution": "1080p",
  "content": [
    { "type": "text", "text": "参考视频1高清化视频，保持视频中的元素不变，人物服装不变" },
    { "type": "video_url", "role": "reference_video", "video_url": { "url": "asset://asset-xxxx" } }
  ]
}
```

提交后立即返回 400：

```text theme={null}
The parameters `ratio` and `duration` specified in the request are not valid.
Seedance identified your task as video editing based on your prompt. ...
Issues: [0] `ratio` must be `adaptive`. [1] `duration` must be -1.
```

原因是「高清化 + 保持不变」就是在原片上做处理，模型判为视频编辑，而编辑任务不允许指定画幅和时长。这个需求本身就是编辑，正确改法是：

```json theme={null}
"ratio": "adaptive",
"duration": -1
```

改完后，输出的画幅和时长都跟随原视频。

## 能不能用参数固定成参考生视频？

**不能。** 2.5 的 `omni_reference_task_type` 只有三个取值：

| 取值         | 作用                      |
| ---------- | ----------------------- |
| `auto`（默认） | 由模型根据素材和提示词自行判定         |
| `edit`     | 声明为视频编辑，提交时就校验编辑任务的参数限制 |
| `extend`   | 声明为视频延长，提交时就校验延长任务的参数限制 |

没有「参考生视频」这个取值。而且 `edit` / `extend` 只是**提前校验**，并不能强制任务类型：如果声明的类型与模型按提示词判定的不一致，任务仍会失败，错误码为 `InvalidParameter.TaskTypeMismatch`。

所以，任务类型最终由**提示词**决定，参数只能配合它。

## 三种稳妥写法

<Tabs>
  <Tab title="不在乎画幅和时长">
    原厂文档推荐的通用配置：只要带了参考素材，就一律这样传，无论模型判成哪个子任务都不会因参数限制报错。

    ```json theme={null}
    "omni_reference_task_type": "auto",
    "ratio": "adaptive",
    "duration": -1
    ```

    代价是：判为参考生视频时，**时长由模型自己决定**（实测会选到 10 秒以上），费用会随时长变化。对成本敏感的业务不建议用这套。
  </Tab>

  <Tab title="要固定画幅和时长">
    想指定 `ratio` 和 `duration`，就必须让模型判为参考生视频，关键在提示词：

    * 用「参考」「借鉴」「模仿」来描述素材的作用，并说清楚**参考的是什么**（动作、运镜、风格、人物形象）
    * 着重描述**要拍的新画面**，而不是对原视频做什么
    * 避免「增加 / 删除 / 修改 / 替换 / 改成 / 去掉」「保持……不变」「高清化 / 修复」「延长 / 续写」这类说法

    | 容易被判成编辑         | 改写成参考生视频                 |
    | --------------- | ------------------------ |
    | 把视频1里的人换成图片1的女孩 | 图片1的女孩在海边奔跑，动作和运镜参考视频1   |
    | 保持视频1的场景不变，加一只猫 | 参考视频1的街景风格，拍一只猫走过街角      |
    | 视频1高清化，人物服装不变   | 参考视频1的人物造型与服装，生成一段新的走秀镜头 |
  </Tab>

  <Tab title="代码里兜底重试">
    提示词来自终端用户、无法控制时，在代码里接住这类 400 再重提一次。这个错误在提交时就返回，不会创建任务，400 参数错误也不扣费。

    ```python theme={null}
    import os
    import requests

    URL = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
    HEADERS = {
        "Authorization": f"Bearer {os.environ['APIYI_API_KEY']}",
        "Content-Type": "application/json",
        "Accept-Encoding": "identity",
    }

    def submit(payload: dict) -> str:
        resp = requests.post(URL, headers=HEADERS, json=payload, timeout=300)
        if resp.status_code == 400 and "TaskTypeConstraint" in resp.text:
            # 被判为编辑 / 延长 / 首帧任务：放开画幅和时长后重提
            payload = {**payload, "ratio": "adaptive", "duration": -1}
            resp = requests.post(URL, headers=HEADERS, json=payload, timeout=300)
        resp.raise_for_status()
        return resp.json()["id"]
    ```

    重试后画幅和时长就不再由你控制了。如果业务必须保证输出规格，建议把报错返回给用户、提示改写提示词，而不是静默重试。
  </Tab>
</Tabs>

## 报错时机

| 场景                             | 何时报错                                        | 错误码                                   |
| ------------------------------ | ------------------------------------------- | ------------------------------------- |
| 显式传 `edit` / `extend`，但参数不符合限制 | 提交时立即返回 400                                 | `InvalidParameter.TaskTypeConstraint` |
| 未传或传 `auto`，模型判为编辑，参数不符合限制     | 原厂文档写的是任务异步失败；但**实际也会在提交时就返回 400**（上面的案例即是） | `InvalidParameter.TaskTypeConstraint` |
| 显式声明的类型与模型判定不一致                | 任务运行后失败                                     | `InvalidParameter.TaskTypeMismatch`   |

两类错误的处理方式不同：`TaskTypeConstraint` 改参数，`TaskTypeMismatch` 改提示词（或把 `omni_reference_task_type` 改回 `auto`）。

## 费用提醒

* **视频编辑的输出时长等于原视频时长**，不是你想要的时长。原视频 25 秒，就按 25 秒左右计费。
* **带参考视频的任务，输入视频的帧数也会折算成 tokens 一起计费**，原视频越长、分辨率越高，费用越高。
* `duration: -1` 用在参考生视频上时，时长由模型决定，可能比预期长。

提交前先确认原视频时长，能明显减少意外开销。按任务核对实际扣费见 [如何按 task\_id 查一条 Seedance 视频的真实消费？](/faq/seedance-task-cost-lookup)。

## 相关文档

<CardGroup cols={2}>
  <Card title="视频生成接口" icon="video" href="/api-capabilities/seedance2/video-generation">
    任务类型与参数约束对照表、全部请求参数
  </Card>

  <Card title="Seedance 2.0 / 2.5 概览" icon="film" href="/api-capabilities/seedance2/overview">
    2.5 与 2.0 的差异、编辑和延长的完整用法
  </Card>
</CardGroup>
