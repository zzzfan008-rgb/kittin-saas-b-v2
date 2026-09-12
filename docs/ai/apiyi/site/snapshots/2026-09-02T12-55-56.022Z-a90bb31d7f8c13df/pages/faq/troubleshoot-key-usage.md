> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何排查莫名的 KEY 调用？

> 发现 API Key 有不明调用时的排查思路：定位 KEY 去向、及时停用、加固账号，并通过日志中的真实 IP 锁定实际调用方。

## 简短回答

发现令牌（API Key）有不明用量时，按三步走最稳妥：

1. **先查去向**：复制这个 KEY，在聊天记录、代码仓库、配置文件里全局搜索，确认给过谁、用在了哪里。
2. **查不到就停用**：如果确实排查不到使用者，直接**停用该令牌**即可，影响面通常很小。
3. **加固账号**：修改账号密码、收紧后台权限，非必要人员不登录后台。

下面给出详细排查步骤，以及如何通过日志里的**真实调用 IP** 锁定实际调用方。

## 排查步骤

<Steps>
  <Step title="第一步：定位 KEY 的去向">
    复制这条令牌的 KEY，在以下范围做全局搜索，确认它曾经发给过谁、被配置到了哪里：

    * 与同事 / 外包 / 客户的**聊天记录**（微信、飞书、邮件等）
    * **代码仓库**与提交历史（包括已删除分支、`.env`、配置文件）
    * 部署平台、CI/CD、第三方工具里保存的**环境变量 / 密钥**

    多数"莫名调用"其实是某处遗留的旧配置仍在跑，搜一遍 KEY 就能对上号。
  </Step>

  <Step title="第二步：排查不到就直接停用该令牌">
    如果第一步查完仍不知道是谁在用，**直接停用这条令牌**是最快的止损方式。

    令牌是相互独立的——停用其中一条，**不影响账号下的其他令牌**，影响面通常很小。确认无人合法使用后即可停用，必要时再新建一条令牌替换。
  </Step>

  <Step title="第三步：加固账号与权限">
    在止损的同时，把账号安全收紧：

    * **修改账号密码**，使用高强度密码
    * **收紧后台管理权限**，非必要人员不要登录后台
    * 员工日常只通过**查询栏目**自助查询 KEY 用量，无需进入后台
  </Step>
</Steps>

## 如何通过日志锁定真实调用方

进入后台的**日志栏目**，可以看到每次调用使用的**令牌、模型、IP** 等信息。把鼠标滑到某条日志的 IP 上，会弹出该次调用的 IP 详情：

```text theme={null}
📍 主要 IP:
   IP: 104.194.93.159          ← APIYI 平台的流量分发 IP（非调用方）

🔁 代理 IP:
   X-Forwarded-For: 18.163.84.xx
   X-Real-IP:       18.163.84.xx   ← 你们真正的调用 IP（实际使用方）
```

<Info>
  **两个 IP 怎么读？**

  * **主要 IP**：是 APIYI 平台的**流量分发 IP**，对所有客户都一样，不代表调用来源。
  * **代理 IP 里的 `X-Real-IP`（及 `X-Forwarded-For`）**：才是**你们真正发起调用的 IP**，也就是实际使用方的 IP。

  排查时请以 `X-Real-IP` 为准，比对它属于哪台机器 / 哪个网络，即可锁定到底是谁在调用。
</Info>

<Tip>
  **结合令牌一起看更快**：日志同时显示了使用的**令牌**和**模型**。先按可疑令牌过滤日志，再看其 `X-Real-IP` 集中在哪些地址，往往就能定位到具体的人或服务。
</Tip>

## 常见问题

<AccordionGroup>
  <Accordion title="停用令牌会影响我的其他业务吗？">
    不会。每条令牌相互独立，停用一条不影响账号下的其他令牌和正常业务。只要确认该令牌没有合法用途，就可以放心停用，必要时再新建一条替换。
  </Accordion>

  <Accordion title="日志里显示的主要 IP 是固定的，是不是被攻击了？">
    不是。**主要 IP**（如 `104.194.93.159`）是 APIYI 平台的流量分发 IP，对所有调用都相同，属于正常现象。判断调用来源请看代理 IP 里的 `X-Real-IP`。
  </Accordion>

  <Accordion title="员工要查 KEY 用量，一定要登录后台吗？">
    不需要。建议只开放**查询栏目**给员工自助查询用量，后台管理权限保留给必要人员，从源头降低账号与密钥被滥用的风险。
  </Accordion>

  <Accordion title="怎样从根本上避免 KEY 被滥用？">
    几个习惯：不要在代码里硬编码 KEY、用环境变量存储；按用途分多条令牌、便于单独停用；定期轮换 KEY；离职 / 项目结束及时回收对应令牌。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="令牌管理" icon="key" href="/faq/token-management">
    创建、停用、分配令牌的完整说明
  </Card>

  <Card title="调用日志" icon="file-text" href="/faq/call-logs">
    如何查看每次调用的令牌、模型与 IP
  </Card>

  <Card title="日志与隐私控制" icon="eye-off" href="/faq/user-logs-control">
    日志记录范围与隐私设置
  </Card>

  <Card title="数据安全" icon="shield" href="/faq/data-security">
    API易的数据安全与访问控制机制
  </Card>
</CardGroup>

## 联系我们

如排查后仍有疑问，欢迎联系我们的技术支持：

<Card title="技术支持" icon="headphones">
  * [联系企业微信客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * 邮箱：[hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
