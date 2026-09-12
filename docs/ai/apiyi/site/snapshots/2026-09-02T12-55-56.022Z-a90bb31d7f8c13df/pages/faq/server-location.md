> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API易的服务器在哪里？应该选择什么服务器？

> 了解 API易 的服务器地理位置、数据中心分布、网络延迟测试方法以及服务器选购建议

## 服务器位置

API易 的服务器位于**美国洛杉矶（美西）**，采用知名 VPS 服务商**搬瓦工（BandwagonHost）的回国优化专线**。

<Info>
  **专线优化**：我们的服务器配备回国优化专线，专门针对中国大陆用户进行了网络优化，即使是大图片传输（Base64 编码）也能保持正常速度。
</Info>

## 不同地区的网络表现

<CardGroup cols={2}>
  <Card title="中国大陆用户" icon="map-pin">
    **网络表现**：优秀 ✅

    * 回国专线优化，延迟低
    * 大图片传输（Base64）速度正常
    * 适合高频 API 调用场景
    * 无需额外配置代理
  </Card>

  <Card title="海外用户" icon="globe">
    **网络表现**：取决于地理位置 🌍

    * 美西地区延迟最低
    * 欧洲、亚太地区稍有延迟
    * 建议选择美西机房服务器
    * 可使用 CDN 加速
  </Card>
</CardGroup>

## 服务器选购建议

### 海外服务器推荐

如果您使用海外服务器调用 API易 的服务，建议选择：

<Tip>
  **推荐选择**：美西（洛杉矶、圣何塞、西雅图等）机房的服务器

  * **地理位置接近**：与我们的服务器在同一地区，延迟最低
  * **网络路由优化**：同区域之间的网络路由通常最优
  * **性价比高**：美西机房价格相对合理
</Tip>

如果您正在寻找稳定的 VPS 服务商，可以考虑与我们使用相同的服务商：

<Card title="搬瓦工 VPS" icon="server" href="https://bandwagonhost.com/aff.php?aff=80627">
  **BandwagonHost（搬瓦工）** - 知名 VPS 服务商

  * ✅ 回国优化专线（CN2 GIA、CN2 等）
  * ✅ 美西多个机房可选（洛杉矶、圣何塞等）
  * ✅ 稳定可靠，性价比高
  * ✅ 适合国内外用户访问

  点击查看搬瓦工 VPS 套餐
</Card>

### 中国大陆服务器

<Info>
  **中国大陆服务器也没问题**！

  由于我们配备了回国优化专线，即使您的服务器位于中国大陆境内，访问 API易 的延迟和速度也是正常的，无需担心网络问题。
</Info>

**适用场景**：

* 应用部署在国内云服务商（阿里云、腾讯云、华为云等）
* 用户主要在中国大陆地区
* 需要符合国内合规要求

## 如何测试网络延迟？

在选择服务器之前，建议先测试您的服务器到 API易 的网络延迟。

### 方法 1：Ping 测试

```bash theme={null}
# 测试延迟（ICMP）
ping api.apiyi.com
```

**参考延迟**：

* **中国大陆**：通常 50-150ms（回国专线优化）
* **美西地区**：通常 5-30ms（同区域）
* **欧洲/亚太**：通常 150-300ms（跨区域）

### 方法 2：cURL 延迟测试

```bash theme={null}
# 单次 HTTP 延迟测试
curl -o /dev/null -s -w "连接时间: %{time_connect}s\n总时间: %{time_total}s\n" https://api.apiyi.com

# 多次测试取平均值（更准确）
for i in {1..10}; do
  curl -o /dev/null -s -w "第 $i 次 - 总时间: %{time_total}s\n" https://api.apiyi.com
done
```

### 方法 3：实际 API 调用测试

```bash theme={null}
# 测试实际 API 调用延迟
time curl -X POST https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

<Tip>
  **优化建议**：如果测试延迟较高（大于 500ms），可以考虑：

  * 更换到美西机房的服务器
  * 使用 CDN 或代理加速
  * 联系客服咨询网络优化方案
</Tip>

## 网络优化建议

### 针对高延迟场景

如果您的服务器延迟较高，可以尝试以下优化方案：

<Steps>
  <Step title="使用连接池">
    复用 HTTP 连接，避免频繁建立新连接的开销
  </Step>

  <Step title="启用 HTTP/2 或 HTTP/3">
    利用多路复用特性，提升并发请求效率
  </Step>

  <Step title="批量请求">
    将多个小请求合并为批量请求，减少网络往返次数
  </Step>

  <Step title="异步调用">
    使用异步方式调用 API，避免阻塞等待
  </Step>

  <Step title="本地缓存">
    对于重复的请求结果，使用本地缓存减少 API 调用次数
  </Step>
</Steps>

### 针对大图片传输

如果您需要频繁传输大图片（如图像生成、图像识别），建议：

<CardGroup cols={2}>
  <Card title="使用 URL 传参" icon="link">
    优先使用图片 URL 而不是 Base64 编码

    减少请求体大小，提升传输效率
  </Card>

  <Card title="压缩图片" icon="file-archive">
    在上传前适当压缩图片质量

    在保证效果的前提下减小文件体积
  </Card>
</CardGroup>

## 常见问题

<AccordionGroup>
  <Accordion title="为什么选择美西而不是其他地区？">
    **主要原因**：

    1. **回国专线优化**：美西是回国专线的主要出口点，能为中国大陆用户提供最佳网络路由
    2. **国际枢纽**：洛杉矶是重要的国际网络枢纽，连接亚太、欧洲、北美等地区
    3. **成本优势**：美西机房的带宽成本相对较低，性价比高
    4. **服务稳定**：搬瓦工等服务商在美西运营经验丰富，稳定性好
  </Accordion>

  <Accordion title="中国大陆访问 API易 会慢吗？">
    **不会！**

    我们使用的是搬瓦工的**回国优化专线**（CN2 GIA 等），专门针对中国大陆用户进行了网络优化。

    **实际表现**：

    * 中国大陆用户访问延迟通常在 50-150ms
    * 即使是大图片的 Base64 传输也速度正常
    * 无需配置代理或 VPN

    您可以通过上述的测试方法实际测试一下您的网络延迟。
  </Accordion>

  <Accordion title="如何优化我的应用的网络延迟？">
    **优化建议**：

    1. **服务器选择**：选择美西机房的服务器（与我们在同一地区）
    2. **连接复用**：使用 HTTP 连接池，避免频繁建立新连接
    3. **批量请求**：将多个小请求合并为批量请求
    4. **异步调用**：使用异步方式调用 API，不阻塞主线程
    5. **本地缓存**：缓存重复的请求结果
    6. **CDN 加速**：对于静态资源使用 CDN

    详见上方的"网络优化建议"章节。
  </Accordion>

  <Accordion title="API易 是否计划在其他地区部署服务器？">
    我们目前专注于提供**高质量、稳定**的美西服务器服务，并通过回国专线优化为全球用户（尤其是中国大陆用户）提供良好的网络体验。

    未来我们会根据用户需求和业务发展情况，评估在其他地区（如欧洲、亚太）部署服务器的可能性。

    如果您有特殊的地理位置需求，欢迎联系我们的商务团队讨论定制方案。
  </Accordion>

  <Accordion title="我的服务器不在美西，延迟很高怎么办？">
    如果您的服务器延迟较高（大于 500ms），可以考虑：

    **短期方案**：

    * 使用代理或 CDN 加速
    * 优化应用代码（连接池、异步调用等）
    * 批量请求减少网络往返次数

    **长期方案**：

    * 迁移服务器到美西机房
    * 使用多地域部署，美西服务器专门用于调用 API易
    * 联系我们讨论定制化网络优化方案
  </Accordion>

  <Accordion title="搬瓦工 VPS 适合个人开发者吗？">
    **非常适合！**

    搬瓦工提供多种价格档位的 VPS 套餐：

    * **入门级**：适合个人开发者测试和小流量应用
    * **中端**：适合中小型生产环境
    * **高端**：适合大流量、高并发场景

    优势：

    * 价格相对合理，性价比高
    * 回国专线优化（中国大陆访问速度快）
    * 支持月付、年付等灵活付款方式
    * 提供快照备份、一键重装等便捷功能
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="网络连接问题排查" icon="network" href="/faq/network-proxy">
    了解如何解决网络连接问题、配置代理等
  </Card>

  <Card title="API 并发限制" icon="gauge" href="/faq/api-concurrency">
    了解 API 的并发限制和性能优化建议
  </Card>
</CardGroup>

## 联系我们

如有服务器选择、网络优化等相关问题，欢迎联系我们：

<CardGroup cols={2}>
  <Card title="企业微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    扫码添加 或 [点击联系客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    网络优化、技术支持
  </Card>

  <Card title="邮件咨询" icon="mail">
    **客服邮箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商务合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
