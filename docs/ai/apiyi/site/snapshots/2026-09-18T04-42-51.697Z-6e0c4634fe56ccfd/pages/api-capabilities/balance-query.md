> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 余额查询 API

> 获取账户余额、已使用额度和请求次数等信息，实现主动余额告警控制

## 接口概述

余额查询接口用于获取当前账户的额度使用情况，包括总配额、已使用额度、剩余额度和请求次数等信息。

这个接口可帮助客户以简单的方式获取账号余额，以便更主动、自由地控制余额告警。

## 如何获取 Authorization

<Steps>
  <Step title="访问控制台">
    访问 `api.apiyi.com/account/profile` 个人中心页面
  </Step>

  <Step title="获取系统令牌">
    在页面最下方找到"账号选项 - 系统令牌"部分
  </Step>

  <Step title="生成 AccessToken">
    输入当前的账户密码后，会得到一个 AccessToken，该密钥可用于后续接口的查询数据
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/PXVoab-l7wSQlQVE/images/apiyi-system-accesstoken.png?fit=max&auto=format&n=PXVoab-l7wSQlQVE&q=85&s=eb4f48476a795dfa5bfd7cb053081bdc" alt="获取系统令牌" width="1020" height="460" data-path="images/apiyi-system-accesstoken.png" />

## 接口信息

| 项目        | 说明                                    |
| --------- | ------------------------------------- |
| **接口URL** | `https://api.apiyi.com/api/user/self` |
| **请求方法**  | `GET`                                 |
| **认证方式**  | Authorization Header                  |
| **响应格式**  | JSON                                  |

## 请求说明

### 请求 Headers

| Header名称        | 必填 | 说明                       |
| --------------- | -- | ------------------------ |
| `Authorization` | 是  | API访问令牌，格式：直接填写token字符串  |
| `Accept`        | 否  | 建议设置为 `application/json` |
| `Content-Type`  | 否  | 建议设置为 `application/json` |

### 请求参数

<Info>
  该接口为 GET 请求，**不需要**传递任何请求体（body）参数。
</Info>

## 响应说明

### 成功响应示例

```json theme={null}
{
  "success": true,
  "message": null,
  "data": {
    "id": 19489,
    "username": "testnano",
    "display_name": "testnano",
    "role": 1,
    "status": 1,
    "email": "",
    "quota": 24997909,
    "used_quota": 10027091,
    "request_count": 339,
    "group": "ceshi",
    "aff_code": "ZM0H",
    "inviter_id": 0,
    "access_token": "...",
    "ModelFixedPrice": [...]
  }
}
```

### 核心响应字段说明

| 字段名                    | 类型      | 说明                     |
| ---------------------- | ------- | ---------------------- |
| `success`              | Boolean | 请求是否成功                 |
| `message`              | String  | 错误信息（成功时为null）         |
| `data.username`        | String  | 用户名                    |
| `data.display_name`    | String  | 显示名称                   |
| `data.quota`           | Integer | **剩余额度**（当前可用余额，单位：额度） |
| `data.used_quota`      | Integer | **已使用额度**（单位：额度）       |
| `data.request_count`   | Integer | **总请求次数**              |
| `data.group`           | String  | 用户所属组                  |
| `data.ModelFixedPrice` | Array   | 模型价格列表（可忽略）            |

### 额度换算说明

<Card title="换算规则" icon="calculator">
  500,000 额度 = \$1.00 美金 (USD)
</Card>

**计算公式：**

* 美金金额 = 额度 ÷ 500,000
* 剩余额度 = quota（quota 本身就是当前剩余余额）
* 剩余美金 = quota ÷ 500,000

**示例：**

* `quota: 24997909` → \$49.99 USD（当前剩余余额）
* `used_quota: 10027091` → \$20.05 USD（已使用）

## 错误响应

### HTTP 401 - 认证失败

```json theme={null}
{
  "success": false,
  "message": "Unauthorized"
}
```

**原因：** Authorization令牌无效或已过期

**解决方法：** 检查并更新API令牌

### HTTP 403 - 权限不足

```json theme={null}
{
  "success": false,
  "message": "Forbidden"
}
```

**原因：** 当前令牌无权访问该接口

**解决方法：** 联系管理员确认权限配置

## 代码示例

### cURL 示例

```bash theme={null}
curl --compressed 'https://api.apiyi.com/api/user/self' \
  -H 'Accept: application/json' \
  -H 'Authorization: YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json'
```

<Warning>
  **重要提示：** 必须添加 `--compressed` 选项，因为API返回的是gzip压缩内容，否则会得到乱码。
</Warning>

**快速测试（替换YOUR\_TOKEN\_HERE）：**

```bash theme={null}
export APIYI_TOKEN='YOUR_TOKEN_HERE'

curl --compressed -s 'https://api.apiyi.com/api/user/self' \
  -H 'Accept: application/json' \
  -H "Authorization: $APIYI_TOKEN" \
  -H 'Content-Type: application/json' | \
  jq '.data | {quota, used_quota, request_count}'
```

<Info>
  说明：`-s` 选项隐藏进度条，`--compressed` 自动解压gzip响应
</Info>

### Python 示例（基础版）

```python theme={null}
import requests

# 配置
url = "https://api.apiyi.com/api/user/self"
authorization = "YOUR_TOKEN_HERE"  # 替换为你的令牌

# 请求头
headers = {
    'Accept': 'application/json',
    'Authorization': authorization,
    'Content-Type': 'application/json'
}

# 发送请求
response = requests.get(url, headers=headers, timeout=10)

# 检查响应
if response.status_code == 200:
    data = response.json()
    user_data = data['data']

    # 提取核心信息
    quota = user_data['quota']
    used_quota = user_data['used_quota']
    request_count = user_data['request_count']

    # 计算美金金额（注意：quota 就是当前剩余余额）
    remaining_usd = quota / 500000
    used_usd = used_quota / 500000

    # 打印结果
    print(f"剩余额度：${remaining_usd:.2f} USD ({quota:,} 额度)")
    print(f"已使用：${used_usd:.2f} USD ({used_quota:,} 额度)")
    print(f"请求次数：{request_count:,} 次")
else:
    print(f"请求失败：HTTP {response.status_code}")
    print(response.text)
```

### Python 示例（完整优化版）

在基础版之上增加了以下特性：

<CardGroup cols={2}>
  <Card title="错误处理" icon="shield-check">
    完整的异常处理和错误捕获
  </Card>

  <Card title="环境变量支持" icon="lock">
    安全管理令牌，避免硬编码
  </Card>

  <Card title="格式化输出" icon="table">
    美观的表格展示和数字格式化
  </Card>

  <Card title="自动换算" icon="calculator">
    自动计算美金金额
  </Card>
</CardGroup>

把下面的代码保存为 `quota.py` 即可直接运行：

```python theme={null}
import os
import sys

import requests

URL = "https://api.apiyi.com/api/user/self"
QUOTA_PER_USD = 500_000


def fetch_quota(token):
    """查询账户余额，返回 data 字段。"""
    headers = {
        "Accept": "application/json",
        "Authorization": token,
        "Content-Type": "application/json",
    }
    try:
        resp = requests.get(URL, headers=headers, timeout=10)
    except requests.exceptions.Timeout:
        sys.exit("请求超时，请检查网络后重试")
    except requests.exceptions.RequestException as exc:
        sys.exit(f"请求失败：{exc}")

    if resp.status_code == 401:
        sys.exit("认证失败：令牌无效或已过期，请回控制台重新生成")
    if resp.status_code != 200:
        sys.exit(f"请求失败：HTTP {resp.status_code}\n{resp.text[:200]}")

    body = resp.json()
    if not body.get("success"):
        sys.exit(f"接口报错：{body.get('message')}")
    return body["data"]


def report(data):
    quota = data.get("quota", 0)
    used = data.get("used_quota", 0)
    count = data.get("request_count", 0)

    print("=" * 60)
    print("📊 APIYI 账户余额信息")
    print("=" * 60)
    print(f"用户名称：{data.get('username')} ({data.get('display_name')})")
    print("-" * 60)
    print(f"剩余额度：{quota:,} 额度 (${quota / QUOTA_PER_USD:.2f} USD)")
    print(f"已使用：  {used:,} 额度 (${used / QUOTA_PER_USD:.2f} USD)")
    print(f"请求次数：{count:,} 次")
    print("=" * 60)
    print(f"💡 换算说明：{QUOTA_PER_USD:,} 额度 = $1.00 USD")
    print("=" * 60)


if __name__ == "__main__":
    # 优先读命令行参数，其次读环境变量，避免把令牌硬编码进代码
    token = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("APIYI_TOKEN")
    if not token:
        sys.exit("请提供令牌：设置环境变量 APIYI_TOKEN，或作为第一个命令行参数传入")
    report(fetch_quota(token))
```

**使用方法：**

```bash theme={null}
# 方式1：使用环境变量（推荐）
export APIYI_TOKEN='YOUR_TOKEN_HERE'
python quota.py

# 方式2：命令行参数
python quota.py 'YOUR_TOKEN_HERE'
```

**输出示例：**

```
============================================================
📊 APIYI 账户余额信息
============================================================
用户名称：testnano (testnano)
------------------------------------------------------------
剩余额度：24,997,909 额度 ($49.99 USD)
已使用：  10,027,091 额度 ($20.05 USD)
请求次数：339 次
============================================================
💡 换算说明：500,000 额度 = $1.00 USD
============================================================
```

## 常见问题

<AccordionGroup>
  <Accordion title="如何获取 Authorization 令牌？">
    请参考上方"如何获取 Authorization"部分的步骤说明，或访问控制台的个人中心页面获取系统令牌。
  </Accordion>

  <Accordion title="查询余额是否会消耗配额？">
    否，查询账户余额接口不会消耗您的配额额度。
  </Accordion>

  <Accordion title="多久可以查询一次余额？">
    建议查询间隔不少于1秒，避免频繁请求触发限流。
  </Accordion>

  <Accordion title="ModelFixedPrice 字段有什么用？">
    该字段返回各个AI模型的定价信息。如果您只关心余额信息，可以忽略该字段。
  </Accordion>

  <Accordion title="quota 字段代表什么？">
    `quota` 字段就是当前的剩余额度。如果 `quota` 为 0 或接近 0，说明账户余额不足，需要及时充值。
  </Accordion>

  <Accordion title="curl 命令返回乱码或 jq 报错怎么办？">
    **问题：** 执行curl命令时得到乱码，或者jq报错 "Invalid numeric literal"

    **原因：** API返回的是gzip压缩内容（`Content-Encoding: gzip`），curl没有自动解压。

    **解决方案：** 添加 `--compressed` 选项让curl自动解压：

    ```bash theme={null}
    # ✅ 正确（带 --compressed）
    curl --compressed 'https://api.apiyi.com/api/user/self' \
      -H 'Authorization: YOUR_TOKEN' | jq

    # ❌ 错误（缺少 --compressed）
    curl 'https://api.apiyi.com/api/user/self' \
      -H 'Authorization: YOUR_TOKEN' | jq
    ```
  </Accordion>
</AccordionGroup>

## 注意事项

<Warning>
  **安全性提醒**

  * 切勿在代码中硬编码 Authorization 令牌
  * 建议使用环境变量或配置文件管理敏感信息
  * 不要将包含令牌的代码提交到公开仓库
</Warning>

<Info>
  **请求限制**

  * 建议设置合理的请求超时时间（推荐10秒）
  * 避免过于频繁的查询请求
</Info>

<Card title="异常处理建议" icon="bug">
  * 务必处理网络异常、超时、认证失败等错误情况
  * 建议记录错误日志便于排查问题
</Card>

<Card title="响应格式说明" icon="file-code">
  * API返回gzip压缩内容，使用curl时必须添加 `--compressed` 选项
  * Python的requests库会自动处理gzip解压，无需额外配置
</Card>
