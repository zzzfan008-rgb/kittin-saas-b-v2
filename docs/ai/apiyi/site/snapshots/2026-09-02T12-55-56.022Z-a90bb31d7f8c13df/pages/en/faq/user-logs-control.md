> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Can I View Detailed Logs in the Backend for Troubleshooting?

> Learn how administrators can enable detailed logging to assist with troubleshooting

## Default Privacy Protection Policy

For privacy and security reasons, APIYI **does not store** customer input and output content by default - we only act as a transparent proxy for forwarding requests.

This means:

* ✅ Your data privacy is maximally protected
* ✅ Reduced data storage costs
* ✅ Compliant with data security best practices
* ❌ Admin backend cannot view specific conversation content

## Challenges in Batch Processing Scenarios

Many customers encounter this frustration when running batch processes:

<Warning>
  **Typical Problem Scenario**

  "Can the backend include user input? Otherwise, during batch processing, there's no way to distinguish which call corresponds to which task!"

  In batch processing, without detailed input/output records, it's indeed difficult to track which specific task encountered issues.
</Warning>

## Administrator-Assisted Troubleshooting

If you encounter issues requiring technical support assistance, we can **temporarily enable** detailed logging for administrators to help diagnose problems.

<Info>
  **Important Notice**

  * This feature is only enabled in the **administrator backend** and cannot be controlled by customers
  * Detailed log content is **only visible to administrators**, not exposed to customers
  * This is an assistance feature for troubleshooting, not for regular use
</Info>

### How to Request Enablement

<Steps>
  <Step title="Contact Support with Issue Details">
    Reach out via customer service channels (Telegram, email, etc.) to describe the problem in detail and request troubleshooting assistance
  </Step>

  <Step title="Administrator Evaluation">
    Technical support staff will evaluate whether detailed logging is needed to diagnose the issue
  </Step>

  <Step title="Temporary Activation">
    Administrator will temporarily enable log detail recording for your account in the backend
  </Step>

  <Step title="Assisted Troubleshooting">
    Administrator will review detailed logs to help locate and resolve the issue
  </Step>

  <Step title="Feature Deactivation">
    After resolving the issue, administrator will promptly disable detailed logging
  </Step>
</Steps>

### Administrator Backend Interface

This is the administrator backend log detail control interface (not accessible to customers):

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/yl72wP6yNQxQvIte/images/user-logs-control.png?fit=max&auto=format&n=yl72wP6yNQxQvIte&q=85&s=77b33464164d5bb3ea193e19f82cd402" alt="Administrator Backend Log Detail Control" width="1572" height="740" data-path="images/user-logs-control.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/yl72wP6yNQxQvIte/images/user-logs-control.png?fit=max&auto=format&n=yl72wP6yNQxQvIte&q=85&s=77b33464164d5bb3ea193e19f82cd402" alt="Administrator Backend Log Detail Control" width="1572" height="740" data-path="images/user-logs-control.png" />

## Content Included in Detailed Logs

When administrators enable detailed logging, the system additionally records:

<CardGroup cols={2}>
  <Card title="Input Content" icon="log-in">
    * Complete user prompts
    * System messages
    * Conversation history context
    * Function call parameters
  </Card>

  <Card title="Output Content" icon="log-out">
    * Complete AI model responses
    * Function call results
    * Full streaming output content
    * Returned metadata
  </Card>
</CardGroup>

<Warning>
  **Privacy Notice**

  These detailed logs are **only visible to administrators** for assisting with technical troubleshooting. We commit to:

  * Only enable this feature when necessary
  * Use only for technical support purposes
  * Disable promptly after issue resolution
  * Strictly protect your data privacy
</Warning>

## Applicable Scenarios

### Recommended Request Scenarios

Contact support to request administrator assistance in these situations:

* 🔍 **API Errors**: Frequent errors occurring without clear cause
* 📊 **Batch Task Anomalies**: Some batch tasks failing, need to track specific problematic requests
* 🧪 **Output Quality Issues**: Abnormal model outputs, need to analyze specific input/output content
* 📈 **Performance Issues**: Unusual call latency, need detailed logs to analyze bottlenecks
* 🐛 **Suspected Bugs**: Suspecting system issues, need to provide detailed information to tech team

### When Enablement Not Needed

Detailed logging typically not required in these scenarios:

* ✅ **Normal Usage**: API calls functioning normally without anomalies
* ✅ **Common Issues**: Basic logs (token stats, error types) sufficient for diagnosis
* ✅ **Privacy Sensitive**: Processing extremely sensitive data, prefer no viewing by anyone

## Data Security Notice

<Info>
  **Important Notice**

  Even with temporarily enabled detailed logging, we will:

  * ✅ Use encrypted storage to protect your data
  * ✅ Strictly limit log access permissions (authorized administrators only)
  * ✅ Disable feature immediately after issue resolution
  * ✅ Regularly auto-clean expired log data
  * ✅ Comply with relevant data protection regulations
  * ✅ Detailed logs will not be disclosed to any third parties
</Info>

## FAQ

### Can I enable this feature myself in the backend?

No. This feature is only enabled in the administrator backend and cannot be operated by customers. Please contact support if you need assistance troubleshooting.

### Can I view detailed logs after enablement?

No. Detailed log content is only visible to administrators for technical support purposes. Customers can only view basic call records (token stats, error types, etc.).

### Does enabling detailed logging affect performance?

Minimal impact - mainly adds a small amount of log writing time (typically \< 10ms), won't affect normal usage.

### How long are logs retained?

Detailed logs are retained for 7-30 days by default. Administrators will promptly disable recording after issue resolution.

### Will administrators see all my request content?

Only requests during the detailed logging period will be recorded. Administrators only view relevant logs when assisting with troubleshooting, strictly following confidentiality agreements.

### Can logs be recorded only for specific time periods?

Yes. You can coordinate with support for specific enablement time periods, such as temporarily enabling only when reproducing issues.

## Contact Us

If you encounter technical issues requiring administrator assistance, please contact us via:

<CardGroup cols={3}>
  <Card title="Email Support" icon="mail">
    [feedback@apiyi.com](mailto:feedback@apiyi.com)

    Describe issues and reproduction steps in detail
  </Card>

  <Card title="Enterprise WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="Enterprise WeChat QR Code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Scan QR code or [Click to contact support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    Quick response, real-time communication
  </Card>

  <Card title="Telegram" icon="send">
    @apiyi001

    Instant messaging, efficient resolution
  </Card>
</CardGroup>

<Tip>
  **Tips for Efficient Troubleshooting**

  When contacting support, please provide:

  * Time period when issue occurred
  * Number of affected API calls
  * Error messages or anomaly descriptions
  * Whether reproducible and reproduction steps

  This information helps administrators locate and resolve issues faster.
</Tip>
