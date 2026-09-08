> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.5 与 2.0 系统一走 SeeDance2 分组，一把令牌通吃四个模型

> Seedance 2.5 与 2.0 系四个模型统一收在 SeeDance2 分组（0.18x）下管理，一把令牌即可全调，不必为 2.5 单独建令牌。实测单价分两档：输入不含视频 $12.60 每百万 tokens，输入含视频走更低的 $7.56。

**2026/8/31 11:20 (UTC+8)** · 价格变动 · ByteDance

🗂️ **Seedance 2.5 与 2.0 系统一走 `SeeDance2` 分组（0.18x），一把令牌通吃四个模型**

四个模型收在同一个分组下**统一管理**，用起来更简单：**一把勾了 `SeeDance2` 的令牌就能调全部四个模型**（`doubao-seedance-2-5-260628` 与 2.0 的标准版 / `fast` / `mini`），不必为 2.5 单独建一把令牌，**模型名、端点、请求结构、代码都不用改**。

实测单价（按实际扣费日志反算，非按倍率估算）分两档：

* **输入不含视频**（文生 / 图生 / 参考图）：\$12.60 / 百万 tokens，480p、720p、1080p 同价
* **输入包含视频**（多模态参考带 `video_url`、视频编辑、视频延长）：\$7.56 / 百万 tokens，单独一档更低的单价

典型规格：480p/4 秒 \$0.4893、720p/5 秒 \$1.3721、1080p/5 秒 \$3.0873、720p/30 秒 \$8.1761。

完整分组说明与定价表见 [Seedance 概览](/api-capabilities/seedance2/overview)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
