> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How does APIYI ensure data security?

> Detailed explanation of APIYI data security protection measures, including encrypted transmission, minimized storage, and access control mechanisms

## Data Security Commitment

APIYI places high importance on user data security and has adopted multiple measures to protect your information. We are committed to providing users with safe and reliable AI relay services.

## Core Security Measures

### End-to-End Encryption

<Info>
  **TLS 1.3 Encrypted Transmission**

  All data transmission uses **TLS 1.3 protocol encryption**, ensuring data security during transmission:

  * Latest encryption standard providing strongest security protection
  * Prevents data from being stolen or tampered with during transmission
  * End-to-end encryption protection, fully encrypted from user to server
</Info>

### Minimized Data Storage

**Relay Platform Positioning**

Core advantages of APIYI as a relay platform:

* **Does not store request content**: Does not save your API request content (input and output)
* **Does not view user data**: Technical team cannot view specific conversation content
* **Immediate transfer and deletion**: Content data cleared immediately after request processing
* **Privacy first**: Maximum protection of user privacy

<Tip>
  **Why choose minimized storage?**

  As a relay platform, our responsibility is to safely and efficiently forward requests, not to store user data. This design fundamentally protects your privacy and security.
</Tip>

### Limited Log Recording

**Basic Log Scope**

We only record basic information necessary for billing and troubleshooting:

* **Model name used**: For billing and service statistics
* **Token length statistics**: Input and output Token counts
* **Request timestamp**: For log analysis and troubleshooting
* **Response status**: Success or error status recording

<Warning>
  **Content explicitly not recorded**

  * ❌ Specific conversation content
  * ❌ User input text
  * ❌ AI output specific replies
  * ❌ Image or file content
  * ❌ Personal identification information
</Warning>

### Short-term Log Retention

**Current month plus the two preceding calendar months**

<Card title="Log Retention Time" icon="clock">
  **Retention period: the current month plus the two preceding calendar months, with older whole months cleared on the 5th of each month**

  For the following considerations:

  * **Data Security**: Reduce data leakage risk
  * **Resource Optimization**: Disk space costs money too\~\~ 😊
  * **Privacy Protection**: Minimize data retention time
  * **Compliance Requirements**: Comply with data protection regulations
</Card>

Cleanup is a physical delete and cannot be undone. If you need longer-term records, use **async export** in the **Logs** section of the console — full rules in [log retention and cleanup policy](/en/faq/log-retention-policy).

## Access Control Mechanism

### Strict Permission Management

**Authorized Access System**

* **Least Privilege Principle**: Only authorized technical personnel can access logs
* **Anonymization Processing**: Accessed log data has been anonymized
* **Necessity Review**: Access only in necessary situations such as troubleshooting
* **Operation Recording**: Complete audit logs for all access operations

### Technical Team Management

* **Background Check**: Technical personnel undergo strict background investigation
* **Confidentiality Agreement**: Sign strict data confidentiality agreements
* **Regular Training**: Receive data security and privacy protection training
* **Permission Rotation**: Regularly rotate and review access permissions

## Security Assurance System

### Regular Security Audits

**Continuous Security Improvement**

<Info>
  **Security Assessment Content**

  APIYI team regularly conducts comprehensive security assessments:

  * **System Vulnerability Scanning**: Regularly check system security vulnerabilities
  * **Code Security Review**: Review potential security risks in code
  * **Infrastructure Inspection**: Evaluate server and network security
  * **Process Optimization**: Continuously improve security management processes
</Info>

### Compliance Assurance

**Regulatory Compliance Commitment**

* **Data Protection Regulations**: Strictly comply with GDPR, Personal Information Protection Law, etc.
* **Industry Standards**: Meet AI service industry security standards
* **Regulatory Requirements**: Cooperate with supervision and audit by relevant authorities
* **International Standards**: Reference ISO 27001 and other international security standards

## Security Best Practices

### User-Side Recommendations

<Tip>
  **Recommendations to Enhance Security**

  1. **API Key Management**
     * Regularly rotate API Keys
     * Don't hardcode Keys in code
     * Use environment variables to store sensitive information

  2. **Sensitive Information Handling**
     * Avoid including sensitive personal information in requests
     * Use desensitized data for testing
     * Handle business confidential content carefully

  3. **Network Security**
     * Use HTTPS protocol to access API
     * Use service in secure network environment
     * Update client software timely
</Tip>

### Platform-Side Assurance

* **Multi-layer Protection**: Deploy multi-layer security protection measures
* **Real-time Monitoring**: 24/7 security monitoring and threat detection
* **Emergency Response**: Establish complete security incident response mechanism
* **Backup Recovery**: Regular backup and disaster recovery drills

## Transparency Commitment

### Security Event Notification

If an event occurs that may affect user data security, we commit to:

* **Timely Notification**: Notify users within 24 hours of discovering security event
* **Detailed Explanation**: Provide event details and scope of impact
* **Solutions**: Explain remedial measures taken
* **Prevention Measures**: Share subsequent prevention and improvement measures

## Technical Support

If you have any questions about data security, welcome to contact our technical support team:

<Card title="Enterprise WeChat" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="Enterprise WeChat QR Code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

  Scan QR code or [Click to contact support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

  **Technical Customer Service**

  * Email: [hi@apiyi.com](mailto:hi@apiyi.com)

  **Inquiry Scope**

  * Data security policy explanation
  * Privacy protection measures description
  * Security best practice guidance
  * Security incident reporting and handling
</Card>

We will continuously improve security measures to provide you with safer and more reliable AI services.
