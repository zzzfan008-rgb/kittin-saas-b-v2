> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何创建 KEY？

> API易令牌管理指南，包括获取默认令牌和创建新KEY的完整说明

# 如何创建KEY？

## 获取现有的默认令牌

1. 进入顶部导航的"令牌"页面：[https://api.apiyi.com/token](https://api.apiyi.com/token)

2. 在页面中找到默认令牌，点击最右侧的管理菜单

3. 在管理菜单中找到复制图标，点击复制

4. 复制出完整的 KEY，KEY 的格式是以 `sk-` 开头

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=6ca82bbb014b12b285048e6b50a00461" alt="复制API Key" width="1466" height="1006" data-path="images/key-manage.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=6ca82bbb014b12b285048e6b50a00461" alt="复制API Key" width="1466" height="1006" data-path="images/key-manage.png" />

## 新增KEY

除了使用默认令牌，您也可以创建新的 KEY 来精准控制使用权限：

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="新增API Key" width="1284" height="1158" data-path="images/key-add-new.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="新增API Key" width="1284" height="1158" data-path="images/key-add-new.png" />

### 新增KEY的优势

* **余额控制**：可以为每个 KEY 设置专门的余额限制
* **有效期管理**：可以设置 KEY 的过期时间
* **灵活分配**：适合团队使用或项目隔离

<Warning>
  **重要提示**：创建新 KEY 时，**不需要设定可用模型**。

  这里采用白名单机制：

  * **如果设置了可用模型**：该 KEY 只能使用指定的模型
  * **如果不设置可用模型**：该 KEY 可以使用整个网站里的 400+ 模型

  推荐不设置可用模型，这样可以享受所有模型的访问权限。
</Warning>

## KEY格式说明

* 所有 API KEY 都以 `sk-` 开头
* KEY 长度通常为 48-64 位字符
* 请妥善保管您的 KEY，不要在公开场所分享

## 使用建议

1. **开发测试**：使用默认令牌进行快速开发和测试
2. **生产环境**：为生产项目创建专门的 KEY，便于管理和监控
3. **团队协作**：为不同团队成员创建独立的 KEY，方便权限管理
