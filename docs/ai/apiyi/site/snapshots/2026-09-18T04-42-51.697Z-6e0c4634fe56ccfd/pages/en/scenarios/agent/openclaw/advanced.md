> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Advanced Features & Troubleshooting

> OpenClaw troubleshooting, custom skills, memory feature, multi-device sync, and security tips

## Troubleshooting

<AccordionGroup>
  <Accordion title="Can't connect to Telegram">
    Telegram may require a proxy in some regions. Set up terminal proxy and restart Gateway:

    ```bash theme={null}
    export https_proxy=http://127.0.0.1:proxy-port
    export http_proxy=http://127.0.0.1:proxy-port
    openclaw gateway restart
    ```

    Or use Web UI directly (no proxy needed).
  </Accordion>

  <Accordion title="Configuration file format error">
    Run diagnostic command to auto-fix:

    ```bash theme={null}
    openclaw doctor --fix
    ```
  </Accordion>

  <Accordion title="API connection failed">
    1. Check if API key is correct
    2. Confirm `baseUrl` is set to `https://api.apiyi.com/v1`
    3. Test connectivity:

    ```bash theme={null}
    curl -H "Authorization: Bearer your-key" \
         https://api.apiyi.com/v1/models
    ```
  </Accordion>

  <Accordion title="How to view runtime logs">
    ```bash theme={null}
    openclaw logs --follow
    ```
  </Accordion>

  <Accordion title="How to update OpenClaw">
    ```bash theme={null}
    openclaw update
    ```
  </Accordion>

  <Accordion title="How to add new chat channels">
    ```bash theme={null}
    openclaw channels add --channel telegram
    ```
  </Accordion>
</AccordionGroup>

## Custom Skills

OpenClaw supports custom skills. Create them in the `~/.openclaw/workspace/skills/` directory.

## Memory Feature

OpenClaw remembers your conversations and preferences. Use `/memory` to view and manage memory.

## Multi-Device Sync

Run OpenClaw on multiple devices and use tools like Tailscale for remote access.

## Security Tips

<Warning>
  * **API Key Security**: Never share your configuration file with others
  * **Permission Control**: OpenClaw can execute terminal commands - avoid dangerous operations
  * **Network Security**: By default, it only listens on localhost. Configure proper security measures for remote access
</Warning>

## Related Resources

<CardGroup cols={2}>
  <Card title="APIYI Console" icon="settings" href="https://api.apiyi.com">
    Manage API keys and view usage
  </Card>

  <Card title="Model Recommendations" icon="chart-bar" href="/en/api-capabilities/model-info">
    View scenario-based model recommendations
  </Card>
</CardGroup>
