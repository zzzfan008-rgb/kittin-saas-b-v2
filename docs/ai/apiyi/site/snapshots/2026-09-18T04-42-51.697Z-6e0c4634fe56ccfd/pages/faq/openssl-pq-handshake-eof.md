> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Python 报 SSLEOFError、curl 却正常？

> OpenSSL 3.5 及以上版本默认启用后量子密钥交换，握手包变大后会被部分网络设备掐断，导致 UNEXPECTED_EOF_WHILE_READING

## 症状

同一台机器上，`curl` 调用 `api.apiyi.com` 一切正常，但 Python 程序（尤其是 Conda 环境）报错：

```text theme={null}
ssl.SSLEOFError: [SSL: UNEXPECTED_EOF_WHILE_READING] EOF occurred in violation of protocol (_ssl.c:1016)
urllib3.exceptions.MaxRetryError: HTTPSConnectionPool(host='api.apiyi.com', port=443): Max retries exceeded
```

有时表现为 443 端口连接超时、握手阶段就断开。没有连 VPN，换个网络环境（比如手机热点）又能通。

## 简短回答

**这不是 API易 服务端的问题，也不是证书问题，而是你的 OpenSSL 版本与所在网络的中间设备不兼容。**

先对比两边的 OpenSSL 版本：

```bash theme={null}
curl --version | head -1          # 例如 OpenSSL/3.0.2
python -c "import ssl; print(ssl.OPENSSL_VERSION)"   # 例如 OpenSSL 3.6.2
```

如果报错的那一边是 **OpenSSL 3.5 或更新版本**，而正常的那一边低于 3.5，基本就是这个原因。

## 原因

OpenSSL 从 3.5 开始，TLS 握手默认带上后量子密钥交换（X25519MLKEM768）。这会让握手的第一个包（ClientHello）从约 300 字节涨到约 1500 字节，超过一个 TCP 报文段的大小，必须拆成两段发送。

部分企业防火墙、TLS 检测设备和运营商侧的深度包检测设备处理不了被拆开的握手包，或者不认识这个新的密钥交换算法，会直接把连接断开。客户端看到的就是「EOF occurred in violation of protocol」。

API易 的所有边缘节点都支持这种后量子握手，2026-09-11 (UTC+8) 我们用 OpenSSL 3.6.4 逐台验证过，全部通过。握手包是在你的网络里被丢弃的，服务端收不到，所以服务端无法替你修复。

## 三条命令自证

用**报错的那个环境**里的 `openssl`（Conda 环境请先激活）依次执行：

```bash theme={null}
# 1. 默认参数，带后量子密钥交换
openssl s_client -connect api.apiyi.com:443 -servername api.apiyi.com </dev/null | grep -E "Negotiated|Verify"

# 2. 只用 X25519，不带后量子密钥交换
openssl s_client -connect api.apiyi.com:443 -servername api.apiyi.com -groups X25519 </dev/null | grep Verify

# 3. 对任意其他 HTTPS 站点做默认握手
openssl s_client -connect www.baidu.com:443 -servername www.baidu.com </dev/null | grep Verify
```

| 结果        | 判断                                                 |
| --------- | -------------------------------------------------- |
| 1 失败、2 成功 | 确认是大握手包被你的网络掐断，按下面的方法在客户端修复                        |
| 1、3 都失败   | 你的网络对所有后量子握手都不通，同样在客户端修复                           |
| 1、2、3 都成功 | 不是这个问题，请把完整报错和 `pip show urllib3 requests` 的输出发给客服 |

## 修复方法（任选其一）

<Steps>
  <Step title="方法一：用配置文件关闭后量子密钥交换（推荐）">
    新建一个文件，例如 `~/no-pq.cnf`：

    ```ini theme={null}
    openssl_conf = openssl_init
    [openssl_init]
    ssl_conf = ssl_sect
    [ssl_sect]
    system_default = system_default_sect
    [system_default_sect]
    Groups = X25519:P-256:P-384
    ```

    运行程序前设置环境变量：

    ```bash theme={null}
    export OPENSSL_CONF=~/no-pq.cnf
    python your_script.py
    ```

    这会让该环境里所有基于 OpenSSL 的程序（Python、curl、pip 等）都不再发送后量子密钥份额，握手包缩回约 300 字节。不影响加密强度，只是回到 3.5 之前的默认行为。
  </Step>

  <Step title="方法二：降级 Conda 里的 OpenSSL">
    ```bash theme={null}
    conda install "openssl<3.5"
    ```

    3.5 之前的版本默认不带后量子密钥交换。注意这会连带调整依赖它的包，生产环境请先在测试环境验证。
  </Step>

  <Step title="方法三：让网络部门升级中间设备">
    主流防火墙和 TLS 检测设备在 2025 年之后的固件版本都已支持混合后量子握手。这是根治办法，也能避免以后访问其他站点时出现同样的问题。
  </Step>
</Steps>

## 常见追问

<AccordionGroup>
  <Accordion title="为什么浏览器能打开 api.apiyi.com，程序却不行？">
    浏览器和你的程序走的可能不是同一条网络路径（比如浏览器配置了系统代理），而且浏览器在握手失败时会自动重试不带后量子份额的握手，程序不会。
  </Accordion>

  <Accordion title="Node.js、Go、Java 会遇到这个问题吗？">
    只要 TLS 库是 OpenSSL 3.5 或更新版本就可能遇到，包括用新版 OpenSSL 编译的 curl 8.x。Go 和 Java 使用自己的 TLS 实现，是否默认启用后量子交换取决于各自的版本，判断方法相同：用上面三条命令看是否只有默认握手失败。
  </Accordion>

  <Accordion title="换成 IP 直连或加 verify=False 有用吗？">
    没用。连接在握手阶段就被断开，还没到证书验证这一步。关闭证书验证既不能解决问题，还会带来安全风险。
  </Accordion>

  <Accordion title="API易 能不能在服务端关掉后量子握手？">
    握手的第一个包是客户端发出的，被丢在你的网络里时服务端根本收不到，服务端配置对此无能为力。如果你按上面的三条命令测出「对其他站点默认握手成功、只对 api.apiyi.com 失败」，请把结果发给客服，我们会进一步排查。
  </Accordion>
</AccordionGroup>

## 相关问题

<CardGroup cols={2}>
  <Card title="使用 API 接口需要代理网络吗？" icon="wifi" href="/faq/network-proxy">
    API易 支持直连，无需代理或 VPN
  </Card>

  <Card title="超时配置建议" icon="clock" href="/faq/timeout-configuration">
    连接超时与读取超时应该怎么设
  </Card>
</CardGroup>
