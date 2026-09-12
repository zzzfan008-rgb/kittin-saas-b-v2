> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 日志的时区设置和数据导出要注意什么？

> 账户时区请保持默认的 UTC+0，控制台弹出的时区切换建议选「暂时忽略」。所有导出文件（导出、汇总账单）固定按 UTC+0 输出，而日志明细列表和「调用数据一览」统计图跟随账户所选时区显示——两者口径不一致就会出现 8 小时的对账偏差。

## 简短回答

<CardGroup cols={3}>
  <Card title="账户时区保持 UTC+0" icon="globe">
    默认的 `London (UTC+0/+1)` 就是正确设置，**不要改**。日志库本身按 UTC 记录，UTC+0 与数据源一致
  </Card>

  <Card title="弹窗选「暂时忽略」" icon="bell-off">
    控制台检测到设备时区不同会弹「本地设置建议」，**点左边的「暂时忽略」**，不要点「切换到 Asia/Shanghai」
  </Card>

  <Card title="导出文件一律 UTC+0" icon="download">
    **导出**和**汇总账单**两个按钮产出的文件都固定按 UTC+0，不受账户时区影响；页面上看到的时间则跟随账户时区
  </Card>
</CardGroup>

<Warning>
  **已经切换过时区的用户，改回 `London (UTC+0/+1)` 即可。** 切换时区只影响页面展示，**不会改动、也不会丢失任何已产生的调用数据**，也不会改变导出文件的内容——导出始终按 UTC+0。改回来之后，页面显示与导出文件的口径重新一致。
</Warning>

<Info>
  **一句话记住**：**导出来的**（导出文件、汇总账单、[日志查询 API](/api-capabilities/log-query) 的 `created_at`）都是 **UTC+0**；**在页面上看的**（明细列表、统计图）跟随**账户所选时区**。
</Info>

## 账户时区在哪里看

在控制台的**用户信息**一栏可以看到当前账户时区，正常应显示为 `London (UTC+0/+1)`，也就是 UTC+0。

<Frame caption="控制台「用户信息」一栏的时区设置，正常为 London (UTC+0/+1)">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-user-info-timezone.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=94b725d2393ee1ff84eda7b4c1360743" alt="控制台用户信息栏，时区一项显示 London (UTC+0/+1)" width="892" height="332" data-path="images/console-user-info-timezone.png" />
</Frame>

## 弹出「本地设置建议」时请选「暂时忽略」

当账户时区（UTC）与你当前设备的时区（例如 `Asia/Shanghai`）不一致时，控制台会弹出一个「本地设置建议」窗口，并给出「切换到 Asia/Shanghai」的按钮。

<Frame caption="控制台弹出的「本地设置建议」窗口，请点左侧的「暂时忽略」">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-timezone-local-settings-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=974f0da20864d287c8e2cb82e75f45b6" alt="本地设置建议弹窗：账户时区 UTC、当前设备时区 Asia/Shanghai，底部有暂时忽略与切换到 Asia/Shanghai 两个按钮" width="1054" height="546" data-path="images/console-timezone-local-settings-dialog.png" />
</Frame>

<Warning>
  **请点「暂时忽略」，不要点「切换到 Asia/Shanghai」。** 切换后，日志页顶部的\*\*「调用数据一览」统计图\*\*展示会错位——时间分桶与图表区间对不上，看起来像数据缺失或整体平移。
</Warning>

受影响的就是日志页顶部这一栏：

<Frame caption="日志页顶部的「调用数据一览」，账户时区被切换后此处统计图会错位">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-call-data-overview.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=246553c9d4025e4bf5aaae4598f39866" alt="控制台日志页顶部的调用数据一览入口，被红框标出" width="1002" height="374" data-path="images/console-log-call-data-overview.png" />
</Frame>

日志明细列表里的时间同样跟随账户时区显示。**但导出文件始终是 UTC+0，不跟随这个设置**——所以把账户时区保持在 UTC+0，明细、统计图、导出文件三者口径才一致，换算时统一加一个固定时差即可。

## 两种导出方式怎么选

日志页右上角有**导出**和**汇总账单**两个按钮。

<Frame caption="日志页右上角的「导出」与「汇总账单」两个按钮">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-export-buttons.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=d8f2d7b0359ddcf6aebdd66399bfcffe" alt="日志页工具栏，左侧为导出按钮，右侧为汇总账单按钮" width="650" height="212" data-path="images/console-log-export-buttons.png" />
</Frame>

|      | 导出           | 汇总账单         |
| ---- | ------------ | ------------ |
| 时区口径 | **固定 UTC+0** | **固定 UTC+0** |
| 数据粒度 | 逐笔调用记录（可选字段） | 按日期汇总的账单     |
| 数据量  | 支持大批量，可后台异步跑 | 小，直接下载       |
| 适用场景 | 对账、审计、自建分析   | 快速看某段时间的总花费  |

两个按钮的**时区口径相同，都是 UTC+0**，与账户时区设置无关；差别只在数据粒度和数据量。选哪个只看你要逐笔记录还是要按天的总额。

### 页面上的时间和导出文件对不上，是预期行为

这是对账时最容易踩的坑：**页面按账户所选时区显示，导出文件按 UTC+0**。

如果账户时区被改成了 UTC+8，一笔发生在北京时间 **2026-08-14 00:30 (UTC+8)** 的调用：

* 在**页面明细列表**里显示为 `2026-08-14 00:30`，属于 8 月 14 日
* 在**导出文件**里是 `2026-08-13 16:30`（UTC+0），落在 8 月 13 日

于是「凌晨 0–8 点 (UTC+8) 的调用不在当天汇总」——看起来像数据丢了，实际只是两边差了 8 小时。

<Tip>
  **把账户时区改回 `London (UTC+0/+1)`，两边口径就一致了**，这是最省事的做法。
  如果因为其它原因必须保留本地时区，那就以导出文件为准，在自己的表格或脚本里统一换算（见下）。
</Tip>

### 导出 → 后台异步导出（更推荐）

需要逐笔消费日志时，用**导出**按钮，并在弹窗里选择**后台异步导出**。

<Frame caption="「选择导出方式」弹窗：导出字段可选，导出方式建议选「后台异步导出」">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-async-export-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=09865097dc2f80581a82e2d7feb06f3c" alt="选择导出方式弹窗，包含导出字段、当前页面导出与后台异步导出、Excel 与 CSV 格式、最大导出记录数等选项" width="974" height="1312" data-path="images/console-log-async-export-dialog.png" />
</Frame>

要点：

* **时区固定 UTC+0**，不受账户时区设置影响。因为导出的就是数据库日志本身，需要自己换算成本地时间（UTC+8 用户加 8 小时）
* **导出字段可选**：使用时间、请求 ID、令牌名称、模型名称等，按对账需要勾选
* **导出方式**：数据量大时选**后台异步导出**，任务在后台跑、不阻塞页面操作，官方建议**超过 1 万条记录时使用**
* **导出格式**：Excel（`.xlsx`，超大数据自动拆分并打包 zip）或 CSV（`.csv`，适合小数据量）
* **最大导出记录数**：填 `0` 表示不限制（服务端自动拆分多个 Excel 并打包 zip），上限 5000 万条
* **进度查看**：任务创建后在「任务管理」页面查看导出进度与状态，完成后直接下载

完整的导出操作步骤和归档建议见[调用日志保存多久？多久清理一次？](/faq/log-retention-policy)。

## 对账实务

<Steps>
  <Step title="统一换算成北京时间">
    * **可读时间**：导出文件里的时间**加 8 小时**就是北京时间。`2026-08-14 00:30:00 UTC+0` → `2026-08-14 08:30:00 (UTC+8)`
    * **Unix 秒**（[日志查询 API](/api-capabilities/log-query) 的 `created_at`）：数值上**加 28800**（8 × 3600）
  </Step>

  <Step title="要严格按「自然日」分桶时，先换算再分桶">
    在 Excel 或自家脚本里把所有时间统一加 8 小时，**再**按 `YYYY-MM-DD` 分桶。
    **不要直接拿导出表里的日期列做对账**——这是页面与导出文件对不上的最常见原因。
  </Step>

  <Step title="报障时同时给出 UTC+0 和 UTC+8 两个时间">
    客服按 UTC+0 检索日志，给北京时间便于你的业务同事理解。两个时间都写，省去一次来回。
  </Step>
</Steps>

<Tip>
  对账、审计这类需要按「业务日」切分的场景，建议优先用[日志查询 API](/api-capabilities/log-query) 自己跑脚本，
  比依赖导出 CSV 更可控——脚本里加 28800 秒比改 Excel 公式靠谱。
</Tip>

## 常见问题

<AccordionGroup>
  <Accordion title="为什么默认是 UTC+0，而不是我所在的时区？">
    因为后台的调用日志本身就是按 UTC 记录的数据库日志。账户时区保持 UTC+0，页面展示、统计图和导出文件三者口径一致，换算时统一加一个固定时差即可；改成本地时区后，各处的换算规则不再一致，反而更容易看错。
  </Accordion>

  <Accordion title="我已经切换过时区，数据会丢吗？">
    不会。时区只影响页面展示，不会改动任何已产生的调用记录和扣费数据，也不影响导出文件的内容。把账户时区改回 `London (UTC+0/+1)`，页面显示与导出文件的口径即重新一致。
  </Accordion>

  <Accordion title="UTC+8 用户怎么换算导出文件里的时间？">
    在导出文件的时间上**加 8 小时**就是北京时间。例如导出文件里的 `2026-08-09 08:00` 对应北京时间 **2026/8/9 16:00 (UTC+8)**。跨天对账时留意这个 8 小时的位移。
  </Accordion>

  <Accordion title="为什么页面明细和导出文件的时间不一样？">
    因为两者时区口径不同：页面明细列表跟随**账户所选时区**，导出文件固定 **UTC+0**。如果账户时区是 UTC+8，凌晨 0–8 点 (UTC+8) 的调用在页面上属于「今天」，在导出文件里落在「昨天」。这是预期行为，不是数据错误。把账户时区改回 UTC+0 即可消除这个差异。
  </Accordion>

  <Accordion title="能不能让导出直接按 UTC+8 输出？">
    不能。导出固定按 UTC+0，因为导出的就是数据库日志本身。如果你的业务时区不是 UTC+8，也同样需要自行换算。
  </Accordion>

  <Accordion title="日志查询 API 能不能传「时区」参数？">
    不能。接口只收发 Unix 秒级时间戳（天然为 UTC），不接收时区参数，客户端按需自行转换。
  </Accordion>

  <Accordion title="导出的文件里有我的输入输出内容吗？">
    没有。导出的字段与后台日志展示一致——时间、请求 ID、令牌名称、模型、token 数、金额、状态等，不含任何 prompt 或模型输出内容。详见[调用日志保存多久？多久清理一次？](/faq/log-retention-policy)。
  </Accordion>

  <Accordion title="能不能用程序拉取日志，不走页面导出？">
    可以，见[日志查询 API](/api-capabilities/log-query)。该接口的 `start_timestamp` / `end_timestamp` / `created_at` 都是 **Unix 秒级时间戳**，与控制台的时区设置无关，程序侧自行按需转换即可，适合自动对账场景。
  </Accordion>

  <Accordion title="导出任务一直没完成怎么办？">
    先在「任务管理」页面确认任务状态。数据量特别大时（例如几百万条）后台拆分和打包需要时间，建议缩小时间范围或设置合理的**最大导出记录数**，分批导出。
  </Accordion>
</AccordionGroup>

## 相关文档

* [如何查看我的调用记录？](/faq/call-logs)
* [怎么看懂日志里的计费金额？](/faq/log-billing-explained)
* [调用日志保存多久？多久清理一次？](/faq/log-retention-policy)
* [日志查询 API](/api-capabilities/log-query)
* [实时动态：控制台弹出时区切换建议时，请选择「暂时忽略」](/live/2026-08/timezone-switch-prompt-ignore)
