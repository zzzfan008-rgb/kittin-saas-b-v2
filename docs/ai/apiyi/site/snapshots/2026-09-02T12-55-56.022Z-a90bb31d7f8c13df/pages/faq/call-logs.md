> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何查看我的调用记录？

> API易调用日志查看指南，了解如何查看API调用记录和计费详情

## 访问调用日志

进入顶部导航的"日志"页面：[https://api.apiyi.com/log](https://api.apiyi.com/log)

在日志栏目中，您可以查看：

* **每一次调用的成功记录**
* **API 调用的报错日志**
* **详细的计费说明**

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/log-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=ce6f1444d3f138ff5cd6927843595a61" alt="调用日志管理" width="1242" height="1128" data-path="images/log-manage.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/log-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=ce6f1444d3f138ff5cd6927843595a61" alt="调用日志管理" width="1242" height="1128" data-path="images/log-manage.png" />

## 日志记录内容

### 成功调用记录

每次成功的 API 请求都会记录以下信息：

* **请求时间**：精确到秒的调用时间戳
* **使用模型**：本次调用使用的AI模型
* **Token 计数**：输入和输出的 Token 数量统计
* **计费金额**：本次调用的具体费用
* **调用状态**：请求的执行状态

### 报错日志

失败的 API 调用会记录：

* **错误类型**：具体的错误分类
* **错误信息**：详细的错误描述
* **发生时间**：错误发生的时间戳
* **相关参数**：导致错误的请求参数信息

## 隐私和数据政策

<Info>
  **数据隐私保护**

  出于隐私保护和数据存储成本考虑，我们的日志系统：

  * **不记录详细的输入和输出内容**
  * **只保留基础的 Token 计数信息**
  * **仅存储计费所需的必要日志数据**
  * **确保用户数据隐私安全**
</Info>

## 日志查看技巧

### 筛选功能

* **按时间范围筛选**：可以查看特定时间段的调用记录
* **按模型筛选**：可以查看特定AI模型的使用情况
* **按状态筛选**：区分成功和失败的调用记录

### 计费分析

* **单次调用成本**：每次API调用的具体费用
* **Token 使用效率**：输入输出Token的比例分析
* **模型成本对比**：不同模型的使用成本统计

## 常见问题

### 为什么看不到具体的对话内容？

为了保护用户隐私和降低存储成本，我们只记录计费相关的基础信息，不保存具体的输入输出内容。

### 日志保存多长时间？

保留**当月加此前两个自然月**，每月 5 日清理更早的整月数据。完整规则与导出建议见[日志保留与清理政策](/faq/log-retention-policy)。

### 如何导出调用记录？

在日志页面按需筛选后使用**异步导出**，导出任务在后台执行，完成后下载文件即可自行归档，适合对账和审计留存。

注意「导出」与「汇总账单」两个按钮的时区口径不同，账户时区也建议保持默认的 UTC+0，详见[日志的时区设置和数据导出要注意什么？](/faq/log-timezone-and-export)。
