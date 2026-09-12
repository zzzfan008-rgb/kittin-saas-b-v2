> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How to view my call records?

> APIYI call log viewing guide, learn how to view API call records and billing details

## Access Call Logs

Go to the "Logs" page in top navigation: [https://api.apiyi.com/log](https://api.apiyi.com/log)

In the logs section, you can view:

* **Success record of each call**
* **Error logs of API calls**
* **Detailed billing explanations**

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/log-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=ce6f1444d3f138ff5cd6927843595a61" alt="Call Log Management" width="1242" height="1128" data-path="images/log-manage.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/log-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=ce6f1444d3f138ff5cd6927843595a61" alt="Call Log Management" width="1242" height="1128" data-path="images/log-manage.png" />

## Log Record Content

### Success Call Records

Each successful API request records the following information:

* **Request Time**: Call timestamp accurate to the second
* **Model Used**: AI model used for this call
* **Token Count**: Input and output Token quantity statistics
* **Billing Amount**: Specific cost of this call
* **Call Status**: Request execution status

### Error Logs

Failed API calls record:

* **Error Type**: Specific error classification
* **Error Message**: Detailed error description
* **Occurrence Time**: Error occurrence timestamp
* **Related Parameters**: Request parameter information that caused the error

## Privacy and Data Policy

<Info>
  **Data Privacy Protection**

  For privacy protection and data storage cost considerations, our logging system:

  * **Does not record detailed input and output content**
  * **Only retains basic Token count information**
  * **Stores only necessary log data required for billing**
  * **Ensures user data privacy security**
</Info>

## Log Viewing Tips

### Filtering Features

* **Filter by time range**: View call records for a specific time period
* **Filter by model**: View usage of specific AI models
* **Filter by status**: Distinguish between successful and failed call records

### Billing Analysis

* **Single call cost**: Specific cost of each API call
* **Token usage efficiency**: Input-output Token ratio analysis
* **Model cost comparison**: Usage cost statistics for different models

## Common Questions

### Why can't I see specific conversation content?

To protect user privacy and reduce storage costs, we only record basic information related to billing, not specific input-output content.

### How long are logs retained?

The **current month plus the two preceding calendar months**, with older whole months cleared on the 5th of each month. Full rules and export guidance: [log retention and cleanup policy](/en/faq/log-retention-policy).

### How to export call records?

Filter as needed on the Logs page, then use **async export**. The job runs in the background and you download the file when it finishes — suitable for reconciliation and audit archives.

Note that the Export and Billing Summary buttons use different timezone bases, and the account timezone should stay at the default UTC+0 — see [What should I know about log timezone settings and data export?](/en/faq/log-timezone-and-export).
