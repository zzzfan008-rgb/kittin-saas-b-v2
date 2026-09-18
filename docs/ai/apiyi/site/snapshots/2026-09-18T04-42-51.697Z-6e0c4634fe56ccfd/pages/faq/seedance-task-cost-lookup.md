> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何按 task_id 查一条 Seedance 视频的真实消费？

> 一条视频在日志里有两条扣费记录、任务详情里又有一个 quota，三者是什么关系；程序化对账时怎样凭 task_id 拿到这条视频的最终花费。

## 简短回答

**用任务接口按 `task_id` 查，返回的 `quota` 就是这条视频的总消费。** 日志里的两条记录（预扣 + 结算）相加等于它，「异步任务」页详情里的 `quota` 也是它。

```bash theme={null}
curl --compressed -s "https://api.apiyi.com/api/task/self?p=1&page_size=1&task_id=<你的 task_id>" \
  -H "Authorization: $APIYI_SYS_TOKEN" | jq '.data.items[0] | {task_id, status, quota, submit_time, finish_time}'
```

`quota ÷ 500,000 = 美元`。认证用**系统令牌**（不是 `sk-` 开头的 API Key），获取方式见[日志查询 API](/api-capabilities/log-query)。

不要试图用日志查询 API 逐单配对：两条日志记录里都没有 `task_id`，结算那条连 `request_id` 都是空的。

## 三个数字是什么关系

Seedance 视频按「提交时预扣、完成后多退少补」计费，所以一条视频会在日志里留下两条记录，而任务接口 / 任务详情页只有一个 `quota`：

| 位置                  | 数值        | 含义                                                                                |
| ------------------- | --------- | --------------------------------------------------------------------------------- |
| 日志第一条（预扣）           | 例 224,999 | 提交时按请求参数预估先扣。`completion_tokens` 为 0，`request_id` 有值                              |
| 日志第二条（结算）           | 例 702,613 | 完成后按实际 tokens 算出总额，**只记差额**（补扣为正、退回为负）。`completion_tokens` = 实际用量，`request_id` 为空 |
| 任务接口 / 任务详情 `quota` | 例 927,612 | **两条之和 = 最终总消费** = 实际 tokens × 模型倍率 × 分组倍率                                        |

结算也可能是退回：一条 fast 480p 4 秒文生视频预扣 144,000，实际 40,594 tokens × 18.5 × 0.18 = 135,179，结算行记 −8,821（退回 \$0.02），任务接口 `quota` = 135,179。

上面第一组数字来自一条真实的 2.0 图生视频（含参考视频）：368,100 tokens × 14（含视频输入档倍率）× 0.18（分组倍率）= 927,612，即 \$1.86。结算行 `other` 里的 `final_quota` 就是 927,612，`original_quota` 是 224,999，`adjustment_quota` 是 702,613，三者在一条记录里都能看到。

## 按 status 判断真实消费

| `status`                    | `quota` 的含义      | 这条视频的真实消费                                                   |
| --------------------------- | ---------------- | ----------------------------------------------------------- |
| `completed`                 | 最终结算总额           | = `quota`                                                   |
| `submitted` / `in_progress` | 只是提交时的预扣额        | 等完成后再取                                                      |
| `failed`                    | **仍显示预扣额，不会被清零** | **0**。预扣已全额退回，日志里对应一条 `type=11` 的负数记录，`content` 里带 task\_id |

注意两套词表不同：视频查询接口 `/seedance/api/v3/.../tasks/{id}` 的成功状态是 `succeeded`，任务接口 `/api/task/self` 的成功状态是 `completed`，别把轮询代码里的判断条件直接搬过来。

<Warning>
  对失败任务直接拿 `quota` 求和会把预扣额算成消费。程序化对账要按 `status` 过滤；用日志 API 对账则要**同时拉 `type=2` 和 `type=11`**，后者是退款行，`quota` 为负数。
</Warning>

## 参数写法（与日志 API 相反）

任务接口的分页参数是**下划线 `page_size`**、页码 **`p` 从 1 开始**；日志 API 是驼峰 `pageSize`、`p` 从 0 开始。写错不报错，只会退回默认分页。

已验证可用的过滤参数：

| 参数                                  | 说明                                        |
| ----------------------------------- | ----------------------------------------- |
| `task_id`                           | 精确查一条任务                                   |
| `model_name`                        | 按模型过滤，如 `doubao-seedance-2-0-fast-260128` |
| `start_timestamp` / `end_timestamp` | Unix 秒，按提交时间过滤                            |
| `p` / `page_size`                   | 分页，`p` 从 1 开始                             |

批量对账时按时间窗拉取即可，每条都带 `task_id`、`status`、`quota`、`submit_time`、`finish_time`、`model_name`：

```python theme={null}
import os, time, requests

BASE = "https://api.apiyi.com"
HEADERS = {"Authorization": os.environ["APIYI_SYS_TOKEN"], "Accept": "application/json"}

def video_cost(task_id: str):
    """返回 (status, 美元消费)。失败任务消费为 0，进行中返回 None。"""
    r = requests.get(f"{BASE}/api/task/self", headers=HEADERS, timeout=60,
                     params={"p": 1, "page_size": 1, "task_id": task_id})
    r.raise_for_status()
    items = r.json()["data"]["items"]
    if not items:
        return None, None
    task = items[0]
    status = task["status"]
    if status == "completed":
        return status, task["quota"] / 500_000
    if status == "failed":
        return status, 0.0
    return status, None          # submitted / in_progress：quota 只是预扣，先别记账

def list_tasks(start: int, end: int, page_size: int = 100):
    """按提交时间窗分页拉取，p 从 1 开始，翻到空页为止。"""
    p = 1
    while True:
        r = requests.get(f"{BASE}/api/task/self", headers=HEADERS, timeout=60,
                         params={"p": p, "page_size": page_size,
                                 "start_timestamp": start, "end_timestamp": end})
        r.raise_for_status()
        items = r.json()["data"]["items"]
        if not items:
            return
        yield from items
        p += 1
        time.sleep(1)
```

## 如果一定要在日志里人工核对

结算行有三个字段能对上任务接口：

* 「时间」（`created_at`）等于任务的 `finish_time`，相差不超过 1 秒
* `completion_tokens` 等于任务的 `usage.completion_tokens`
* `other.final_quota` 等于任务的 `quota`

预扣行的 `request_id` 等于提交响应头里的 **`X-Shellapi-Request-Id`**，可以用它反查（`/api/log/self?request_id=…`）。注意响应头里另有一个 `X-Request-Id`，那是原厂的请求 ID，在 API易 日志里搜不到。但**同一秒批量提交多条任务时预扣行会撞在一起**，而且结算行没有 `request_id`，所以日志只适合人工核对个别任务，程序化对账请走任务接口。

## 常见问题

<AccordionGroup>
  <Accordion title="任务详情页的 quota 和日志两条相加不一样？">
    先看任务状态。`submitted` / `in_progress` 时 `quota` 只是预扣，还没有第二条日志；`failed` 时 `quota` 仍是预扣额，而日志里多了一条负数退款行，两条相加为 0。`completed` 状态下两者一定相等，若不等请把 `task_id` 发给客服核查。
  </Accordion>

  <Accordion title="结算那条日志为什么没有令牌、没有 request_id？">
    结算是任务完成时由系统补记的，不经过网关请求链路，所以不带令牌、分组和 `request_id`，控制台上还会标成「流式」。这是正常现象，不代表异常。
  </Accordion>

  <Accordion title="通用视频端点提交的任务，日志里有 task_id 吗？">
    走 `/v1/videos` 等通用端点时，预扣行的 `content` 里会带 `任务ID: cgt-…`，但结算行仍然没有。而且这些端点目前对 Seedance 的分辨率参数透传不完整，请一律走文档路径 `/seedance/api/v3/contents/generations/tasks`，见[视频生成 API](/api-capabilities/seedance2/video-generation)。
  </Accordion>

  <Accordion title="系统令牌能看到别人的任务吗？">
    `/api/task/self` 只返回本账号的任务。系统令牌等价于账号凭证，请像保管密码一样保管，不要写进代码仓库。
  </Accordion>
</AccordionGroup>

## 相关文档

* [Seedance 2.0 / 2.5 计费如何看日志](/api-capabilities/seedance2/overview)
* [日志查询 API](/api-capabilities/log-query)
* [Seedance 视频任务提交后可以取消吗？](/faq/seedance-video-task-cancel)
* [API 调用的预扣费机制是什么？](/faq/pre-deduction-quota)
