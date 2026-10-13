> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 日志的时区设置和数据导出要注意什么？

> 账户时区请直接选你所在的时区（中国用户选 Asia/Shanghai），控制台弹出时区切换建议时可以放心切换。日志明细、「调用数据一览」统计图、「导出」和「汇总账单」四处都跟随账户时区，口径一致；只有日志查询 API 返回的是 Unix 时间戳。

## 简短回答

<CardGroup cols={3}>
  <Card title="账户时区选你所在地" icon="globe">
    中国用户选 `Asia/Shanghai`（UTC+8），其它地区选本地时区。选对之后，看到的时间就是你的本地时间
  </Card>

  <Card title="弹窗可以直接切换" icon="bell">
    控制台检测到设备时区不同会弹「本地设置建议」，**点「切换到 Asia/Shanghai」即可**
  </Card>

  <Card title="四处口径一致" icon="check">
    明细列表、统计图、**导出**、**汇总账单**都按账户时区输出，彼此之间不需要再换算
  </Card>
</CardGroup>

<Info>
  **2026/9/20 00:55 (UTC+8) 已修复统计图错位问题。** 此前账户时区不是 UTC 时，日志页顶部「调用数据一览」统计图会出现日期错位（例如北京时间下午就出现了次日的柱子），所以我们曾建议保持 UTC+0、在弹窗里选「暂时忽略」。该问题已修复，**旧建议作废**，现在请直接选择你所在的时区。
</Info>

### 历史数据偏差说明

在此之前，数据库默认时区是 UTC+8，与用户选择的上海时区（UTC+8）叠加产生了偏移，导致统计图数据偏差。现已调整数据库默认时区为 UTC+0，统计图 = 用户所选时区，不再偏移。

受影响的是 **2026/9/20 00:55 (UTC+8) 之前**的按日 / 按小时分组的统计图和汇总账单：这些分组可能有 8 小时的日期偏移，总金额不受影响。逐笔明细不受影响。如需按日精确对账，建议重新导出一次。

如果你需要对账历史数据，也可以通过[日志查询 API](/api-capabilities/log-query) 拉取逐笔记录自行汇总，比依赖修复前的汇总文件更可靠。

<Tip>
  **一句话记住**：**控制台里看到的和导出的**（明细列表、统计图、导出文件、汇总账单）都跟随**账户所选时区**；**程序拉取的**（[日志查询 API](/api-capabilities/log-query) 的 `created_at`）是 **Unix 秒级时间戳**，与时区无关。
</Tip>

## 账户时区在哪里看、怎么改

在控制台的**用户信息**一栏可以查看和修改当前账户时区。新注册账户默认是 `UTC`，中国用户建议改成 `Asia/Shanghai`。

<Frame caption="控制台「用户信息」一栏的时区设置，可直接下拉修改">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-user-info-timezone.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=94b725d2393ee1ff84eda7b4c1360743" alt="控制台用户信息栏中的时区设置项" width="892" height="332" data-path="images/console-user-info-timezone.png" />
</Frame>

切换时区**只改变时间的显示与分组方式**，不会改动、也不会丢失任何已产生的调用记录和扣费数据，可以随时改、随时改回。

## 弹出「本地设置建议」时可以直接切换

当账户时区（例如 `UTC`）与你当前设备的时区（例如 `Asia/Shanghai`）不一致时，控制台会弹出一个「本地设置建议」窗口。**直接点「切换到 Asia/Shanghai」即可**，切换后日志明细和统计图都按北京时间显示。

<Frame caption="控制台弹出的「本地设置建议」窗口，可以直接点「切换到 Asia/Shanghai」">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-timezone-local-settings-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=974f0da20864d287c8e2cb82e75f45b6" alt="本地设置建议弹窗：账户时区 UTC、当前设备时区 Asia/Shanghai，底部有暂时忽略与切换到 Asia/Shanghai 两个按钮" width="1054" height="546" data-path="images/console-timezone-local-settings-dialog.png" />
</Frame>

如果你的业务或财务固定按 UTC 对账，也可以点「暂时忽略」保持 UTC——两种选择现在都能正常显示，按自己的对账习惯选即可。

日志页顶部的「调用数据一览」统计图按账户时区的自然日分桶：

<Frame caption="日志页顶部的「调用数据一览」，按账户时区的自然日统计">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-call-data-overview.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=246553c9d4025e4bf5aaae4598f39866" alt="控制台日志页顶部的调用数据一览入口，被红框标出" width="1002" height="374" data-path="images/console-log-call-data-overview.png" />
</Frame>

## 两种导出方式怎么选

日志页右上角有**导出**和**汇总账单**两个按钮。

<Frame caption="日志页右上角的「导出」与「汇总账单」两个按钮">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-export-buttons.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=d8f2d7b0359ddcf6aebdd66399bfcffe" alt="日志页工具栏，左侧为导出按钮，右侧为汇总账单按钮" width="650" height="212" data-path="images/console-log-export-buttons.png" />
</Frame>

| | 导出 | 汇总账单 |
| - | - | - |
| 时区口径 | **跟随账户时区** | **跟随账户时区** |
| 数据粒度 | 逐笔调用记录（可选字段） | 按小时 / 天 / 月汇总的账单 |
| 数据量 | 支持大批量，可后台异步跑 | 小，直接下载 |
| 适用场景 | 对账、审计、自建分析 | 快速看某段时间的总花费、税务备查 |

两个按钮的时区口径相同，差别只在数据粒度和数据量。选哪个只看你要逐笔记录还是要汇总金额。

例如账户时区为 `Asia/Shanghai` 时，一笔发生在北京时间 **2026-09-20 01:08 (UTC+8)** 的调用：

* 在**页面明细列表**里显示为 `2026-09-20 01:08`
* 在**导出文件**里同样是 `2026/9/20 1:08`
* 在**汇总账单**（按天）里归入 `2026-09-20`，统计图里也落在 9 月 20 日

<Tip>
  **请求 ID 前 14 位是 UTC 时间**。例如 `20260919170811…` 表示 `2026-09-19 17:08:11` UTC，也就是北京时间 `2026-09-20 01:08:11 (UTC+8)`。需要和客服核对某一笔调用时，直接提供请求 ID 最准确。
</Tip>

### 导出 → 后台异步导出（更推荐）

需要逐笔消费日志时，用**导出**按钮，并在弹窗里选择**后台异步导出**。

<Frame caption="「选择导出方式」弹窗：导出字段可选，导出方式建议选「后台异步导出」">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-async-export-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=09865097dc2f80581a82e2d7feb06f3c" alt="选择导出方式弹窗，包含导出字段、当前页面导出与后台异步导出、Excel 与 CSV 格式、最大导出记录数等选项" width="974" height="1312" data-path="images/console-log-async-export-dialog.png" />
</Frame>

要点：

* **时间按账户时区输出**，与页面明细列表一致
* **导出字段可选**：使用时间、请求 ID、令牌名称、模型名称等，按对账需要勾选
* **导出方式**：数据量大时选**后台异步导出**，任务在后台跑、不阻塞页面操作，官方建议**超过 1 万条记录时使用**
* **导出格式**：Excel（`.xlsx`，超大数据自动拆分并打包 zip）或 CSV（`.csv`，适合小数据量）
* **最大导出记录数**：填 `0` 表示不限制（服务端自动拆分多个 Excel 并打包 zip），上限 5000 万条
* **进度查看**：任务创建后在「任务管理」页面查看导出进度与状态，完成后直接下载

完整的导出操作步骤和归档建议见[调用日志保存多久？多久清理一次？](/faq/log-retention-policy)。

## 对账实务

<Steps>
  <Step title="先确认对账双方的时区一致">
    导出文件的日期按**导出人账户的时区**分组。团队里多人对账、或和财务系统对账时，先确认各方用的是同一个时区（例如都用 `Asia/Shanghai`），否则凌晨时段的调用会被分到不同的日期。
  </Step>

  <Step title="程序拉取的时间戳自行换算">
    [日志查询 API](/api-capabilities/log-query) 的 `created_at` 是 Unix 秒级时间戳，按你需要的时区转换即可。例如转北京时间：数值加 **28800**（8 × 3600）后按 UTC 格式化，或直接用编程语言的时区库转换。
  </Step>

  <Step title="报障时附上请求 ID 和时区">
    请求 ID 本身带 UTC 时间，最不容易出错；报时间点时请同时注明时区，如 `01:08 (UTC+8)`。
  </Step>
</Steps>

<Tip>
  对账、审计这类需要按「业务日」切分的场景，也可以用[日志查询 API](/api-capabilities/log-query) 自己跑脚本，比依赖导出文件更可控。
</Tip>

## 常见问题

<AccordionGroup>
  <Accordion title="之前文档让我保持 UTC+0、选「暂时忽略」，现在还需要吗？">
    不需要了。那条建议是因为账户时区不是 UTC 时统计图会日期错位，该问题已于 2026/9/20 00:55 (UTC+8) 修复。现在请直接选择你所在的时区。
  </Accordion>

  <Accordion title="我之前按建议保持了 UTC，要改成北京时间吗？">
    建议改成 `Asia/Shanghai`，这样控制台里所有时间都是北京时间，不用再手动加 8 小时。如果你的对账流程已经固定按 UTC 进行，也可以继续保持 UTC，两者现在都能正确显示。
  </Accordion>

  <Accordion title="切换时区会丢数据吗？">
    不会。时区只影响时间的显示和按日期分组的方式，不会改动任何已产生的调用记录和扣费数据，可以随时改、随时改回。
  </Accordion>

  <Accordion title="修复前导出的旧文件还准吗？">
    逐笔明细（「导出」按钮）的每一笔记录、金额都是准确的，时间按当时的账户时区显示。**2026/9/20 00:55 (UTC+8) 之前**导出的「汇总账单」及统计图的**按日 / 按小时分组**可能有 8 小时的日期偏移，总金额不受影响；如需按日精确对账，建议重新导出一次。
  </Accordion>

  <Accordion title="为什么页面上的时间和同事导出的文件对不上？">
    很可能你们两人的账户时区不同。导出文件按导出人的账户时区输出，请先在「用户信息」里确认双方时区一致。
  </Accordion>

  <Accordion title="日志查询 API 能不能传「时区」参数？">
    不能。接口只收发 Unix 秒级时间戳（天然为 UTC），不接收时区参数，客户端按需自行转换。
  </Accordion>

  <Accordion title="导出的文件里有我的输入输出内容吗？">
    没有。导出的字段与后台日志展示一致——时间、请求 ID、令牌名称、模型、token 数、金额、状态等，不含任何 prompt 或模型输出内容。详见[调用日志保存多久？多久清理一次？](/faq/log-retention-policy)。
  </Accordion>

  <Accordion title="能不能用程序拉取日志，不走页面导出？">
    可以，见[日志查询 API](/api-capabilities/log-query)。该接口的 `start_timestamp` / `end_timestamp` / `created_at` 都是 **Unix 秒级时间戳**，与控制台的时区设置无关，适合自动对账场景。
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
* [实时动态：控制台时区显示问题已修复，可放心切换本地时区](/live/2026-09/console-timezone-fixed)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.