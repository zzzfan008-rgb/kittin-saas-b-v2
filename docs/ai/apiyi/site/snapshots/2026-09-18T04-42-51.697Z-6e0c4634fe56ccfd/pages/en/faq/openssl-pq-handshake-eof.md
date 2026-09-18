> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Python Raises SSLEOFError but curl Works?

> OpenSSL 3.5 and later enable post-quantum key exchange by default; the larger handshake gets cut off by some network middleboxes, causing UNEXPECTED_EOF_WHILE_READING

## Symptom

On the same machine, `curl` against `api.apiyi.com` works fine, but a Python program (especially in a Conda environment) fails with:

```text theme={null}
ssl.SSLEOFError: [SSL: UNEXPECTED_EOF_WHILE_READING] EOF occurred in violation of protocol (_ssl.c:1016)
urllib3.exceptions.MaxRetryError: HTTPSConnectionPool(host='api.apiyi.com', port=443): Max retries exceeded
```

Sometimes it shows up as a connection timeout on port 443 or a drop during the handshake. No VPN is involved, and switching networks (for example to a phone hotspot) makes it work again.

## Short Answer

**This is not an APIYI server-side issue and not a certificate issue. Your OpenSSL version is incompatible with a middlebox on your network.**

Compare the OpenSSL versions on both sides:

```bash theme={null}
curl --version | head -1          # e.g. OpenSSL/3.0.2
python -c "import ssl; print(ssl.OPENSSL_VERSION)"   # e.g. OpenSSL 3.6.2
```

If the failing side is on **OpenSSL 3.5 or newer** and the working side is older than 3.5, this is almost certainly the cause.

## Why It Happens

Starting with OpenSSL 3.5, the TLS handshake includes a post-quantum key exchange (X25519MLKEM768) by default. That grows the first handshake message (ClientHello) from about 300 bytes to about 1500 bytes, larger than a single TCP segment, so it has to be split into two segments.

Some corporate firewalls, TLS inspection appliances, and ISP-side deep packet inspection devices cannot handle a split ClientHello, or do not recognize the new key exchange algorithm, and simply close the connection. The client sees "EOF occurred in violation of protocol".

Every APIYI edge node supports this post-quantum handshake. On 2026-09-11 (UTC+8) we verified each node with OpenSSL 3.6.4 and all of them passed. The handshake packet is being dropped inside your network before it reaches us, so nothing on the server side can fix it for you.

## Three Commands to Confirm

Run these with the `openssl` binary from the **failing environment** (activate the Conda environment first):

```bash theme={null}
# 1. Default settings, with post-quantum key exchange
openssl s_client -connect api.apiyi.com:443 -servername api.apiyi.com </dev/null | grep -E "Negotiated|Verify"

# 2. X25519 only, no post-quantum key exchange
openssl s_client -connect api.apiyi.com:443 -servername api.apiyi.com -groups X25519 </dev/null | grep Verify

# 3. Default handshake against any other HTTPS site
openssl s_client -connect www.google.com:443 -servername www.google.com </dev/null | grep Verify
```

| Result                 | Diagnosis                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| 1 fails, 2 succeeds    | Confirmed: the large handshake is being cut off by your network. Fix it on the client side as shown below |
| 1 and 3 both fail      | Your network blocks every post-quantum handshake. Same client-side fix                                    |
| 1, 2 and 3 all succeed | Different problem. Send the full error and the output of `pip show urllib3 requests` to support           |

## Fixes (pick one)

<Steps>
  <Step title="Option 1: Disable post-quantum key exchange via a config file (recommended)">
    Create a file, for example `~/no-pq.cnf`:

    ```ini theme={null}
    openssl_conf = openssl_init
    [openssl_init]
    ssl_conf = ssl_sect
    [ssl_sect]
    system_default = system_default_sect
    [system_default_sect]
    Groups = X25519:P-256:P-384
    ```

    Set the environment variable before running your program:

    ```bash theme={null}
    export OPENSSL_CONF=~/no-pq.cnf
    python your_script.py
    ```

    Every OpenSSL-based program in that environment (Python, curl, pip and so on) stops sending the post-quantum key share, and the ClientHello shrinks back to about 300 bytes. Encryption strength is unchanged. This simply restores the pre-3.5 default behavior.
  </Step>

  <Step title="Option 2: Downgrade OpenSSL in Conda">
    ```bash theme={null}
    conda install "openssl<3.5"
    ```

    Versions before 3.5 do not enable post-quantum key exchange by default. This may also adjust packages that depend on OpenSSL, so test it in a staging environment first.
  </Step>

  <Step title="Option 3: Ask your network team to update the middlebox">
    Mainstream firewalls and TLS inspection appliances support hybrid post-quantum handshakes in firmware released after 2025. This is the permanent fix and prevents the same failure against other sites.
  </Step>
</Steps>

## Follow-up Questions

<AccordionGroup>
  <Accordion title="Why does the browser open api.apiyi.com while my program cannot?">
    The browser and your program may not share the same network path (the browser may use a system proxy), and browsers automatically retry the handshake without the post-quantum share when it fails. Programs do not.
  </Accordion>

  <Accordion title="Can Node.js, Go or Java hit this too?">
    Any client whose TLS library is OpenSSL 3.5 or newer can, including curl 8.x built against a recent OpenSSL. Go and Java use their own TLS stacks, and whether post-quantum exchange is on by default depends on their versions. The diagnosis is the same: use the three commands above to see whether only the default handshake fails.
  </Accordion>

  <Accordion title="Does connecting by IP or setting verify=False help?">
    No. The connection is closed during the handshake, before certificate verification even starts. Disabling verification does not fix it and adds security risk.
  </Accordion>

  <Accordion title="Can APIYI turn off post-quantum handshakes on the server?">
    The first handshake message is sent by the client. When it is dropped inside your network, the server never receives it, so no server configuration can help. If the three commands show that the default handshake succeeds against other sites but fails only against api.apiyi.com, send us the results and we will investigate further.
  </Accordion>
</AccordionGroup>

## Related

<CardGroup cols={2}>
  <Card title="Do I Need a Proxy to Use the API?" icon="wifi" href="/en/faq/network-proxy">
    APIYI supports direct connections without a proxy or VPN
  </Card>

  <Card title="Timeout Configuration" icon="clock" href="/en/faq/timeout-configuration">
    How to set connect and read timeouts
  </Card>
</CardGroup>
