> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 为什么有些模型我用不了？

> API易模型权限说明，了解如何解锁全部模型和模型不可用的原因

## 用户分组和模型权限

### 充值用户自动升级

充值后，平台会定期把充值用户调整为 **VIP** 或 **SVIP** 分组，即可解锁全部模型。

<Info>
  **自动分组调整**

  * 充值用户会被自动分配到VIP/SVIP分组
  * VIP/SVIP用户可以使用平台所有可用模型
  * 分组调整通常在充值后自动完成
</Info>

### 手动调整分组

如果您已经充值但分组没有自动调整，可以联系客服进行手动调整：

<Card title="联系企业微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

  扫码添加 或 [点击联系客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

  请提供您的账号信息，客服会帮助您调整到正确的用户分组。
</Card>

## 模型不可用的具体原因

### 1. 高价格模型限制

大部分情况下模型都可以正常使用，但少数高价格模型对 `default` 分组有限制：

* **示例**：`claude-opus-4-20250514` 等新发布的高端模型
* **原因**：因为价格高昂，暂未对默认分组开放
* **解决方案**：充值升级到VIP/SVIP分组即可使用

<Warning>
  **高价格模型**

  某些最新或高端模型由于成本较高，仅对付费用户开放。充值后即可获得完整的模型访问权限。
</Warning>

### 2. 平台方下线模型

部分模型因为官方平台下线而无法使用：

* **示例**：`gpt-4.5-preview`
* **原因**：OpenAI 平台方已下线该模型
* **结果**：我们也相应下线，无法继续提供服务

<Info>
  **模型下线说明**

  当原始AI服务商（如OpenAI、Anthropic等）下线某个模型时，我们也会同步下线该模型。这是为了确保服务的稳定性和一致性。
</Info>

## 用户分组说明

### Default 分组

* **权限**：基础模型访问
* **限制**：部分高价格模型不可用
* **适用**：免费用户和新注册用户

### VIP/SVIP 分组

* **权限**：全部可用模型访问
* **优势**：包括最新和高端模型
* **获得方式**：充值后自动或手动调整

## 检查模型可用性

### 确认当前分组

1. 登录控制台查看账户信息
2. 确认当前用户分组级别
3. 查看可用模型列表

### 测试模型调用

1. 使用API文档中的测试功能
2. 尝试调用特定模型
3. 查看返回的错误信息

## 常见解决方案

1. **充值升级**：最直接的解决方案，解锁所有模型
2. **联系客服**：充值后分组未调整时的处理方式
3. **选择替代模型**：使用功能类似但可用的其他模型
4. **等待更新**：关注平台公告，了解新模型上线信息
