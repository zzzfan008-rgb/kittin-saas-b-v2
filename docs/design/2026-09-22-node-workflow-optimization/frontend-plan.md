# R-xx 前端交互与编排优化方案（A 节点交互 + B 画布编排）

- 状态：只出方案，不实施代码。
- 基线：main @ 0584cd7。
- 来源：以卡评论中四份只读审计 findings 为基线，合并、去重、定优先级并补充改法与验收断言。

## 已审 P0/P1/P2 分级与批次（小改动快赢 / 大改动需评审）

### A. 小改动快赢（可立即派卡，无需用户确认交互形态）

| 编号 | 严重程度 | 文件/行 | 问题 | 改法 | 验收断言（1024/1280/1440） |
|---|---|---|---|---|---|
| SMIL-01 | P1 | `src/components/edges/PulseEdge.tsx:71-100` / `src/index.css:277-299` | 光珠使用 SMIL `animateMotion`，`prefers-reduced-motion` CSS 无法兜底控制。 | 用 `matchMedia('(prefers-reduced-motion: reduce)')` 条件渲染：reduced-motion 下不渲染三颗追尾光珠，仅保留静态连线；动态模式下保留现有 SMIL。 | 开启系统减少动态效果后，连线无运动元素；关闭后恢复三颗光珠。 |
| CANVAS-01 | P1 | `src/components/CanvasFlow.tsx:389,418-425` | R80DBG 调试 `console.log` 与 100ms `setInterval` 探针残留于生产代码。 | 删除 `console.log` 与 `setInterval` 探针；CI 加 `ast-grep` 规则 `no-console-canvasflow` 守门。 | `grep -n "R80DBG\|setInterval" src/components/CanvasFlow.tsx` 无命中；本地/CI `npm run check` 通过。 |
| IMG-01 | P1 | `src/components/nodes/ImageNode.tsx:80-85,319-324` / `src/store/flowStore.ts:4433-4442` | 「已被 N 处引用」统计的是 target===本节点的入边，输入节点入边恒为 0，引用计数永远不出现。 | 改为统计 source===本节点的出边数；新增选择器 `selectNodeOutgoingEdges(document, nodeId)` 并在 ImageNode 替换现有 `selectNodeInputImages` 调用。 | 当图片节点被 1+ 生成节点连入 reference 时，节点正文显示「已被 N 处引用」；0 引用时不显示。 |
| IMGGEN-01 | P1 | `src/components/nodes/ImageGeneratorNode.tsx:57` / `src/lib/documentSnapshot.ts:525` | 生图节点渲染了 source handle，但规则禁止生成节点作为连线来源，永远连不出线，纯误导。 | 移除 `ImageGeneratorNode.tsx` 右侧 `<Handle type="source" ... />`。 | 生图节点右侧无连线手柄；尝试从此位置拖线无反应；结果节点仍可被下游引用。 |
| VIDGEN-01 | P1 | `src/components/nodes/VideoGeneratorNode.tsx:61` | 与生图节点相同问题：渲染了规则不允许的 source handle。 | 移除 `VideoGeneratorNode.tsx` 右侧 `<Handle type="source" ... />`。 | 生视频节点右侧无连线手柄。 |
| TOOLBAR-01 | P1 | `src/components/nodes/NodeToolbar.tsx:94-96` / `CanvasFlow.tsx:557` | 工具栏无删除动作，删除只能靠 Delete/Backspace，无界面提示。 | 在 `NODE_TOOLBAR_ACTIONS` 各 kind 的末尾追加 `delete` 动作；节点组件绑定 `onSelect` 调用 `setSelectedNodeIds([id])` 后触发 `deleteKeyCode` 等价的删除逻辑（或复用 store 的删除 action）。工具栏仅在主选节点渲染，避免多选时多个工具栏。 | 选中节点后工具栏出现 × 图标；点击后节点与所属结果节点一并删除（与 Delete 键行为一致）；1024 下不溢出。 |
| HANDLE-01 | P1 | `src/index.css:144-163,168-171` / `CanvasFlow.tsx:492-513` | 拖线中连接受拒只通过松手后 toast 反馈，无实时视觉。 | 在 `CanvasFlow` 的 `onConnectStart`/`onConnectEnd` 或 React Flow `connectionLineStyle` 中读取 `isValidConnection`：invalid 目标手柄变红、cursor 变 `not-allowed`；valid 目标手柄保持金色。需在 CSS 新增 `.react-flow__handle-connecting-valid` / `-invalid` 类。 | 拖线靠近可连手柄时手柄放大并保持金色；靠近不可连手柄时变红并禁用光标；松手前即可判断。 |
| PARAM-01 | P1 | `src/components/nodes/GeneratorParamsPanel.tsx:470-575` | 模型参数/自由 key-value/添加参数全部平铺，常用与高级混杂。 | 面板按「常用 / 高级」折叠分组：常用 = 功能、模型、画幅、数量、运行按钮；高级 = 模型其它参数 + 自由 key-value，默认折叠并带 badge 显示已设项数。 | 1280 下生成节点默认高度降低约 30%；高级区可展开/收起；收起时显示「已设 N 项」。 |
| PARAM-04 | P1 | `src/components/nodes/ReferenceImageList.tsx` 全文 | 参考图列表组件已实现排序/移除，但无调用方，生成节点无法调整参考图顺序。 | 在 `GeneratorParamsPanel` 接线回显区接入 `ReferenceImageList`：读取当前 reference 入边，构造 `ReferenceImageListItem`，绑定 `onMove`/`onRemove` 调用 store 的边更新 action（如删除后按数组顺序重建边，以 order 字段写入 edge data）。 | 多参考图时面板显示参考图列表；可上下移动顺序、移除；移除后画布边同步消失。 |
| B-04 | P1 | `src/lib/templateLaunch.ts:154-175 vs 186-195` | `mergeTemplateIntoActiveCanvas` 先改名后去重，去重判定永不生效，重复加同一模板全部重复。 | 交换顺序：先按 idMap 构造 movedNodes/movedEdges，再去重（按新 id / source+target+targetHandle），最后改名仅用于避免 id 撞车。 | 连续两次加载同一模板到已有画布，第二次无新增节点/边；第一次正常追加。 |
| B-03 | P1 | 全仓无 clipboard；`nodeDuplicate.ts` 仅输入层 | 无 Cmd+C/V、无跨画布/批量复制、框选无批量动作。 | store 新增 `copySelectedNodes` / `pasteClipboard` / `cutSelectedNodes` 三 action；剪贴板数据结构含 `{ kind: "node-clipboard", nodes: SerializedFlowNode[], sourceTabId }`。同一 tab 内粘贴为副本；跨 tab 粘贴保留输入层三 kind。CanvasFlow 监听 `Cmd/Ctrl+C/V/X`。框选时仅主选节点显示工具栏并追加「复制 / 删除」批量动作。 | 框选 3 个输入节点后 Cmd+C → Cmd+V 在右下 40px 处生成 3 个副本并保留边；只读项目禁用。 |

### B. 大改动需评审（涉及交互形态变更，需用户/设计师确认后再派卡）

| 编号 | 严重程度 | 文件/行 | 问题 | 改法（含方案选项） | 验收断言（1024/1280/1440） |
|---|---|---|---|---|---|
| VID-01 | P1 | `src/components/nodes/VideoNode.tsx:18,85-90,49-52` | 视频上传接口未接入，空槽位纯静态不可点，但节点仍可创建、source handle 仍可拖线。 | **方案 A（推荐）**：视频输入节点保持可见但槽位明确标注「即将支持」，并从节点库新建按钮禁用（`userCreatable: false` 直到后端接口就绪）。**方案 B**：保留创建，点击槽位弹「视频上传即将支持」轻提示。需用户确认排期。 | 方案 A：节点库无 video 节点；已有 video 节点仍可查看/运行。方案 B：点击空槽位出现非阻塞提示。 |
| VID-02 | P2 | `src/components/nodes/VideoNode.tsx:57-90` | 视频空槽无点击/拖拽/素材库替换入口，与图片节点不一致，无键盘上传路径。 | 接口就绪后复用图片节点的上传槽组件（file input + 拖放 + 粘贴 + 素材库替换），将 `ImageNode` 的上传槽抽象为 `MediaUploadSlot`（支持 image/video 两种 MIME）。 | 视频节点空槽与图片节点行为一致；键盘 Tab 可达文件选择器。 |
| VID-03 | P2 | `src/components/nodes/VideoNode.tsx:59-83` / `ResultVideoNode.tsx:79-103` | 视频初始无 controls、交互隐晦，不显示时长/尺寸元信息；播放逻辑两份重复实现。 | 抽取共享 `VideoPlayer` 组件：默认显示封面/时长徽章；点击播放后显示 controls；元信息（尺寸、时长）在视频加载 `onLoadedMetadata` 后显示。 | 视频节点与结果视频节点使用同一组件；未播放时显示「▶ 时长 0:05」；播放中显示 controls。 |
| RESIMG-01 | P1 | `src/components/nodes/ResultImageNode.tsx:33-39,59-63` / `ImageGrid.tsx:34-47` | 工具栏预览/下载只作用于 `images[0]`，`ImageGrid.renderAction` 未接线，逐图下载缺失。 | **方案 A**：工具栏「预览」跟随当前焦点图/翻页，网格每格接入「下载 / 存素材」动作。**方案 B**：结果节点改为轮播大图 + 缩略图条，工具栏操作作用于当前索引。需用户确认。 | 方案 A：点击网格第 3 张后按工具栏预览，查看器打开第 3 张；每张图悬停显示下载按钮。 |
| IMGGEN-02 / VIDGEN-02 | P1 | `src/types/workflow.ts:74-75` / `NodeFrame.tsx:190-212` | 状态机有 `cancel_requested` / `cancelled`，但运行中无任何「取消」按钮。 | 在运行中的生成节点工具栏追加「取消运行」动作（或运行按钮变体）；调用服务端 cancel 并展示 `cancel_requested → cancelled` 状态过渡。 | 运行中工具栏显示 ⏹ 取消运行；点击后状态变为 cancel_requested，最终 cancelled。 |
| IMGGEN-03 | P2 | `src/components/nodes/ImageGeneratorNode.tsx:55` | `outcome_unknown` / `cancelled` 只有状态点文案，无解释或后续动作。 | `outcome_unknown` 提供「确认/重试」；`cancelled` 提供「再次运行」。动作需二次确认。 | 状态为 outcome_unknown 时面板显示「结果未知」+「重试」按钮；cancelled 显示「已取消」+「再次运行」。 |
| IMG-05 | P2 | `src/components/nodes/ImageNode.tsx:309-318` | 节点无下载动作；裁剪/抠图长期 disabled 占位。 | 在图片节点工具栏追加「下载」动作（下载 `outputImages[0]`）；裁剪/抠图从工具栏移除或移入 disabled 菜单并明确排期。 | 已上传图片节点工具栏出现下载图标；点击下载原图。 |
| RESIMG-02 | P2 | `src/components/nodes/ResultImageNode.tsx:64-67` | 「作为输入」永久禁用并提示用连线，占位增加认知噪音。 | 删除工具栏「作为输入」按钮；空出边时（结果节点 source handle 未连出）显示一次性 hint：「从输出柄拖线到生成节点 reference」。 | 结果节点工具栏只剩预览/下载/复制（复制待实现）；hint 只在首次出现且可关闭。 |
| RESVID-01 | P2 | `src/components/nodes/ResultVideoNode.tsx:65-68` | 两结果节点「作为输入」禁用原因不一致，`isImageSourceKind` 又不接受视频来源，语义矛盾。 | 统一策略：视频结果节点暂不支持作为下游输入时，删除「作为输入」按钮，与 RESIMG-02 一致；或扩展 sourceKind 接受视频并允许连入 video-generator first-frame（需后端/契约支持）。需用户确认。 | 方案 A：结果视频节点工具栏无「作为输入」按钮。 |
| RESIMG-03 | P2 | `src/types/workflow.ts:194` | `outputSizes` 产物尺寸契约数据完全不展示。 | 在大图查看器底部叠加「WxH」元信息；结果节点网格每张图 hover 显示尺寸 tooltip。 | 查看器打开图片时底部显示尺寸；网格 hover 显示尺寸。 |
| PARAM-02 | P2 | `GeneratorParamsPanel.tsx:339-362` | 切换模型静默清空功能绑定，无预告。 | 换模型前弹确认：「切换模型将清空当前功能绑定，是否继续？」确认后才切换。 | 已选功能后切换模型，出现确认弹窗；取消则保持原模型。 |
| PARAM-03 | P2 | `GeneratorParamsPanel.tsx:518-562` | 自由参数值恒字符串、不解析类型、无 key 合法性提示。 | 按输入解析类型：数字/布尔/字符串；未知 key 标 warning 但不阻断；入口标注「高级：未知参数可能影响运行」。 | 输入 `true` 保存为布尔；输入 `123` 保存为数字；未知 key 显示 ⚠️。 |
| PARAM-05 | P2 | `GeneratorParamsPanel.tsx:577-581` | 接线回显仅一行计数，不可查看来源/跳转/断开。 | 与 PARAM-04 合并：参考图列表每项显示来源节点名+缩略图，点击来源节点名定位并选中该节点，点击 × 断开该边。 | 参考图列表显示「图 1 · 上传图 A」；点击节点名画布滚动到该节点并选中；点击 × 删除边。 |
| PARAM-06 | P2 | `GeneratorParamsPanel.tsx:305-313` | 功能下拉列表平铺长列，无分组/常用项。 | 按 family 分组并置顶常用（如「写实穿搭」「电商主图」「高清放大」）；是否加独立「预设」选择器需用户确认。 | 下拉分组显示；常用项置顶；分组标题清晰。 |
| PARAM-07 | P2 | `GeneratorParamsPanel.tsx:250-254,364-373` | `focusGeneratorFunctionControl` 靠 `querySelector`；画幅切换重算参数无提示。 | 改为 ref 注册；画幅联动修改参数时面板顶部显示临时 warning「画幅已切换，部分模型参数已重置」。 | 点击工具栏「功能选项」后功能下拉获得焦点；切换画幅后出现黄色提示条，3 秒消失。 |
| HANDLE-02 | P2 | `src/components/nodes/*.tsx` / `index.css:564-589` | 手柄不区分空/已接/已满，无法预判为何连不上。 | 在手柄 CSS 加状态类：空 = 默认；已接 = 内点填充；已满 = 外环红色；hover 时显示 tooltip「prompt 输入（0/1）」。需要 React Flow 连接状态或 store 派生计数。 | 空 prompt 手柄显示「0/1」；已连一条后边为金色实心；再连时目标手柄变红并显示「已满」。 |
| HANDLE-03 | P1 | `flowStore.ts:3407-3439 addConnectedNode` | 手柄不可键盘操作，唯一替代的快键建图未接界面，键盘用户无连线手段。 | 选中节点后提供键盘/上下文菜单入口：「添加下游节点并连线」（如 `]` 键）与「添加上游节点并连线」（`[` 键）。菜单列出合法下游 kind。 | Tab 到节点后按 `]` 弹出可选下游类型；选择后在右侧 380px 创建并连线。 |
| FRAME-01 | P2 | `src/components/nodes/NodeFrame.tsx:163-167` | 底部错误条无 `role=alert`/`aria-live`，与参数区中部 `role=alert` 位置不统一。 | 将底部错误条统一为 `role="alert" aria-live="polite"`；运行错误与节点级错误均收敛到底部错误条。 | 出现错误时屏幕阅读器朗读错误文案；错误条位置固定在节点底部。 |
| FRAME-02 | P2 | `src/components/nodes/NodeFrame.tsx:109-113` | 选中态仅金色边框单通道，多选无主选/次选区分。 | 主选节点加金色角标（左上角）与加粗描边；次选节点仅金色边框。需要 store 区分 `primarySelectedId` 与 `selectedNodeIds`。 | 多选时最后一个选中的节点有角标；其余节点只有边框。 |
| FRAME-03 | P2 | `src/components/nodes/NodeFrame.tsx:163-167` | 长错误无折叠、不可复制，撑高节点。 | 错误条超过两行折叠为「显示详情」+ 可复制按钮；默认显示前两行。 | 长错误节点高度不异常；展开后显示全文；点击复制到剪贴板。 |
| TXT-01 | P2 | `src/components/nodes/TextNode.tsx:74-82` / `server/lib/workflowSchema.ts:33` | textarea 无 maxlength 与字数统计，20000 字上限只在服务端校验。 | 在 textarea 下方显示「当前字数/20000」；接近上限时黄色警告，超限时标红并禁止运行（不阻断输入）。 | 输入 19500 字时显示黄色；20000 后变红；运行按钮禁用。 |
| TXT-02 | P2 | `src/components/nodes/NodeFrame.tsx:143-158` | 改名只能鼠标双击标题 span，无 tabIndex/role/键盘事件。 | 给标题 span 加 `tabIndex=0`、`role=button`、`aria-label="改名"`；Enter/F2 进入编辑；编辑 input 已存在，只需加键盘入口。 | Tab 到标题后按 Enter 进入编辑；Esc 取消；Enter 确认。 |
| IMG-02 | P2 | `src/components/nodes/ImageNode.tsx:247-253` | 工具栏「替换」靠 `document.querySelector` 拼 `CSS.escape(id)` 找隐藏 file input 再 click。 | 用 ref/Context 暴露 file input 的 click 方法：在 `ImageNode` 内建 `fileInputRef`，通过 Toolbar action 的 `onSelect` 直接调用。 | 工具栏替换按钮点击后文件选择器打开；DOM 结构变化不再导致失败。 |
| IMG-03 | P2 | `src/components/nodes/ImageNode.tsx:136-149` | 每个选中的图片节点都在 document 上注册 paste 监听，多选时一次粘贴会在每个节点各上传一份。 | 仅主选节点注册 paste；或在处理函数内判断 `document.activeElement` 是否在当前节点内。与 FRAME-02 的主选/次选联动。 | 多选 3 个图片节点后粘贴，只在上传一次。 |
| IMG-04 | P2 | `src/components/nodes/ImageNode.tsx:234-241,69-72` | 上传中只有「素材处理中…」文案，无进度、无取消、无骨架。 | 上传中显示 shadcn Skeleton 或 spinner；用 `AbortController` 包装 fetch，工具栏/槽位显示取消按钮；上传取消后恢复空槽。 | 大文件上传时出现 skeleton；点击取消后槽位恢复；无并发上传竞态。 |
| TOOLBAR-02 | P2 | `src/components/nodes/NodeToolbar.tsx:118-137` | disabled 按钮不可聚焦，禁用原因键盘用户读不到；未选中时完全无法键盘发现动作。 | disabled 按钮改用 `aria-disabled` + 可聚焦包装（TooltipTrigger 包裹 span 或 Button 不设置 HTML disabled），Tooltip 显示禁用原因。 | Tab 遍历工具栏时禁用按钮可聚焦；屏幕阅读器读出禁用原因。 |
| CANVAS-02 | P2 | `NodeToolbar.tsx:105` / `CanvasFlow.tsx:218,560-561` | 多选时每个节点各浮工具栏无批量动作；贴顶时可能被裁切。 | 仅主选节点显示工具栏；多选时工具栏追加批量动作（复制/删除/对齐）。贴顶翻转在 TOOLBAR-01 中一并处理。 | 多选 3 节点只看到一个工具栏；工具栏出现「复制 3 项」「删除 3 项」。 |
| EDGE-02 | P2 | `src/components/edges/PulseEdge.tsx:30-37` | 运行加速只看 source 节点 status，v8 边 source 是输入/结果节点不 running，加速永远不触发。 | 改为依据 target 生成节点状态判断：target 节点 running 时连线加速。 | 生图节点运行时，其入边光珠加速；输入节点 running 不可能，故不加速。 |
| EDGE-03 | P2 | `src/components/edges/PulseEdge.tsx:60-69,43-58` | 三类边外观相同无 label，空心箭头可见性弱。 | 按 targetHandle 加类型色/小标签：prompt = 青、reference = 金、first-frame = 紫；箭头 marker 实心加粗。 | prompt 边偏青、reference 边偏金、first-frame 边偏紫；箭头末端实心。 |
| B-05 | P2 | `src/lib/templateLaunch.ts:211-217` | 并入后 `fitView` 把已有画布整体缩小到 0.35。 | 模板并入时保持当前 zoom，仅平移到新节点区域；空画布时才 `fitView`。 | 非空画布加载模板后 zoom 不变；新节点群进入视口。 |
| B-06 | P2 | `src/components/CanvasFlow.tsx:570-581` | MiniMap 鼠标专用无键盘、无 aria-label。 | 加 `aria-label="画布缩略图"`、`role="img"`；提供键盘等价入口（如 `M` 键聚焦并可通过方向键移动视口，或工具栏「定位到全部」按钮）。 | 屏幕阅读器朗读「画布缩略图」；按 M 后可用方向键移动视口。 |
| B-07 | P2 | `src/components/CanvasFlow.tsx:562-563,570` | `autoPanOnNodeDrag=false`、边选中箭头不跟随。 | 评估开启 `autoPanOnNodeDrag`；选中边时 marker 跟随。需测试长距离拖拽体验。 | 拖拽节点到边缘时画布自动平移；选中边时箭头高亮。 |
| B-08 | P2 | `src/components/EmptyCanvasCTA.tsx` | 空画布入口单一，无「从模板开始」。 | CTA 增加次级入口「从模板开始」：打开模板选择面板（复用 WorkbenchShell 的二级菜单）。 | 空画布中央出现「上传图片开始」主按钮 + 「从模板开始」次按钮。 |

## 批次建议（供排期参考）

1. **快赢批次 1（状态、连线反馈、调试清理）**：SMIL-01、CANVAS-01、IMG-01、IMGGEN-01、VIDGEN-01、EDGE-02、TOOLBAR-01、HANDLE-01。
2. **快赢批次 2（参数面板与参考图）**：PARAM-01、PARAM-04、PARAM-05、PARAM-07、B-04、B-03。
3. **需确认批次（交互形态变更）**：VID-01/VID-02/VID-03、RESIMG-01、IMGGEN-02/VIDGEN-02、RESIMG-02/RESVID-01、B-08。
4. **体验打磨批次**：FRAME-*、TXT-*、IMG-*、TOOLBAR-02、CANVAS-02、EDGE-03、HANDLE-02/03、B-05/B-06/B-07、PARAM-02/03/06。

## 需要用户确认的产品决策点

1. **视频上传接口排期**：VID-01 推荐方案 A（禁用新建 video 节点直到后端接口就绪）是否可接受？若需保留创建，选择方案 B。
2. **结果节点交互形态**：RESIMG-01 方案 A（网格每图操作）还是方案 B（轮播大图+缩略图条）？
3. **取消运行动作**：IMGGEN-02 是否将「取消运行」作为工具栏独立按钮，还是运行按钮右键菜单？
4. **视频作为下游输入**：RESVID-01 是否规划支持视频结果连入 video-generator first-frame？
5. **功能预设选择器**：PARAM-06 是否需要独立的「常用预设」快速选择器（如顶部 chips）？

## 验收总口径

- 三个目标宽度 1024/1280/1440 下，所有改动均需通过 Playwright 桌面回归（已有 `e2e/workbench.spec.ts`）。
- 任何新增 UI 控件必须使用 `src/components/ui/` 内的 shadcn 组件，不得手搓等价实现。
- 涉及交互形态变更的项必须在实施前输出线框或 ASCII/HTML 示意，并经用户/设计师确认。
