> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 出图进阶两页上线：工作流编排与提示词诊断技能

> 文档中心新增两页出图进阶内容：一页拆解 C 端出图产品在模型外面套的工程层，给出改写、锚定、并发采样、择优、精修的五步流水线与去 AI 味可复制词表；一页把出图前的提示词审阅做成开箱即用的 Agent Skill，支持出图后传图复诊，默认用 gpt-5.6-luna。

**2026/8/13 23:17 (UTC+8)** · 文档更新

📚 **出图进阶两页上线：工作流编排与提示词诊断技能**

同一个模型，C 端出图产品比裸调 API 效果好，差别不在模型权重，在模型外面那一层。新增两页把这一层拆开讲，并给出可以直接装的技能：

* [出图进阶：工作流编排与去 AI 味](/api-capabilities/image-advanced-workflow)：改写层、参考图锚定、客户端并发采样、视觉模型择优、分步精修的五步流水线，附去 AI 味的可复制词表、三个场景的完整提示词与成本三档表。
* [出图提示词诊断技能](/api-capabilities/image-prompt-doctor)：两个文件的 Agent Skill，出图前按六要素体检并给出优化提示词，出图后可传图复诊指出哪一句没被执行；默认用 `gpt-5.6-luna`，纯 Python 标准库、无需装依赖。

实测一条口语提示词经诊断重写后原样重出，模型编造的品牌名与多余道具全部消失。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
