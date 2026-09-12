> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wall of Love

> Real feedback, screenshots, and stories from APIYI users and partners

The voices of our users are what we treasure most. This wall collects feedback and stories from WeChat groups, X / Twitter, emails, and customer interviews — unedited, with only privacy redactions.

<Info>
  This wall is a work in progress. If APIYI has helped you, send us a screenshot or a one-liner (DM or email) and we'll feature it here, anonymized as needed.
</Info>

<div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid mt-8">
  <Frame caption="**Chatbox customer · WeChat · 2026-08-02** — They asked whether we sell a monthly plan. We told them straight: 'We're a pay-as-you-go API service, so no monthly plans.' Then gave two ways to spend less anyway — switch to the newer `claude-sonnet-5` (cheaper per token than the 4-5 they were on), and in Chatbox start a fresh chat for each new task instead of letting one thread grow its context forever. They confirmed the model name and went off to update their config.">
    <img src="https://mintcdn.com/apiyillc/8HtBg2qYh52dQApg/images/wall-of-love/wechat-claude-sonnet5-cost-tuning.png?fit=max&auto=format&n=8HtBg2qYh52dQApg&q=85&s=9d0640e913e0deb685f91afca2d4bec0" alt="WeChat exchange: customer asks about monthly plans; APIYI explains pay-as-you-go billing and suggests switching to claude-sonnet-5 and starting new Chatbox sessions to control context growth" width="1226" height="1110" data-path="images/wall-of-love/wechat-claude-sonnet5-cost-tuning.png" />
  </Frame>

  <Frame caption="**Chatbox customer · WeChat · 2026-08-02** — We tuned their Claude usage and costs in the morning; by the afternoon they were back to top up ￥700, with a note: 'Quick replies whenever something comes up, and the issues actually get fixed — really great 👍'. Bonus credit is granted by the system around 00:00 (UTC+8) each day and shows up in the console the next day.">
    <img src="https://mintcdn.com/apiyillc/8HtBg2qYh52dQApg/images/wall-of-love/wechat-topup-700-quick-response.png?fit=max&auto=format&n=8HtBg2qYh52dQApg&q=85&s=09555095e9ddf42299057a326cc8918c" alt="WeChat exchange: customer tops up 700 RMB and praises the fast replies and quick problem resolution" width="871" height="900" data-path="images/wall-of-love/wechat-topup-700-quick-response.png" />
  </Frame>

  <Frame caption="**Research-lab customer · WeChat · 2026-07-18** — Their image-understanding task kept returning 400. One look at the logs and we called it: 'Your code is fine — the problem is the image-to-base64 step,' plus a link to our vision-understanding docs. Minutes later: 'okkk, found it.' 'Your service is seriously reliable — next time our lab does procurement, I'll be pitching you.'">
    <img src="https://mintcdn.com/apiyillc/sSkaXjFBM_GrixgI/images/wall-of-love/wechat-lab-vision-base64-fix.png?fit=max&auto=format&n=sSkaXjFBM_GrixgI&q=85&s=4e77b23d714ee0c0f15397e062ea6475" alt="WeChat exchange: a research lab hit 400 errors on an image-understanding task; APIYI pinpointed the base64 encoding step, and the customer praised the reliable service and promised to recommend APIYI for lab procurement" width="1304" height="1102" data-path="images/wall-of-love/wechat-lab-vision-base64-fix.png" />
  </Frame>

  <Frame caption="**Codex customer · WeChat · 2026-07-13** — Their Codex desktop app kept failing with a missing environment variable. We traced it to the `env_key` gotcha together and switched to putting the key straight into `config.toml` (`experimental_bearer_token`) — it worked on the first try: 'Works now, seems pretty good.' 'Thanks!' We folded the sturdier setup into our docs the same night — a genuine win-win.">
    <img src="https://mintcdn.com/apiyillc/npZmxWGnZzcutAvI/images/wall-of-love/wechat-codex-config-success.png?fit=max&auto=format&n=npZmxWGnZzcutAvI&q=85&s=fea7269441c30ccf397bbd8ad23a239e" alt="WeChat exchange: after putting the key directly into config.toml the new way, the customer got Codex working on the first try and thanked the team" width="1452" height="918" data-path="images/wall-of-love/wechat-codex-config-success.png" />
  </Frame>

  <Frame caption="**Claude customer · WeChat · 2026-07-12** — At 00:30 (UTC+8) we proactively alerted a customer to a Claude cache-billing anomaly and helped troubleshoot it. Once the `claude-opus-4-8` logs were back to normal, they wrote: 'An alert this late at night — that's service above and beyond.' 'Five stars.'">
    <img src="https://mintcdn.com/apiyillc/gNAFjmVcYCoposSu/images/wall-of-love/wechat-midnight-cache-billing-alert.png?fit=max&auto=format&n=gNAFjmVcYCoposSu&q=85&s=8a348df658466b84e17c3f6bdb7cd178" alt="WeChat exchange: APIYI proactively alerted a customer to a Claude cache-billing anomaly after midnight and helped resolve it; customer praises the service" width="1502" height="1342" data-path="images/wall-of-love/wechat-midnight-cache-billing-alert.png" />
  </Frame>

  <Frame caption="**Claude customer · WeChat · 2026-06-16** — After topping up \$100 with a 10% bonus, they left one line: 'Looked everywhere — yours is the only one that just works.' Our reply: we're stable because enterprise customers all run on us, and high cache-hit rates save money too — though Claude models themselves aren't cheap.">
    <img src="https://mintcdn.com/apiyillc/mHzkhiIrp1ouSzN5/images/wall-of-love/wechat-claude-only-yours-works.png?fit=max&auto=format&n=mHzkhiIrp1ouSzN5&q=85&s=f2ef53e7f69582fa0567c3634a96ba80" alt="WeChat exchange: customer says they searched everywhere and only APIYI works well — stable and money-saving thanks to high cache hits" width="847" height="1000" data-path="images/wall-of-love/wechat-claude-only-yours-works.png" />
  </Frame>

  <Frame caption="**aki · WeChat · 2026-06-02** — A competitor got caught secretly injecting 12 lines of junk into users' prompts, then blacklisting the blogger who flagged it. The customer asked if we do the same — 'No. We never add prompts. We provide an API forwarding service.' **APIYI never tampers with or logs user inputs and outputs — a pure transparent proxy, forwarding directly to the official API.**">
    <img src="https://mintcdn.com/apiyillc/iCWo95dJsVDQESWQ/images/wall-of-love/wechat-aki-no-prompt-tampering.jpg?fit=max&auto=format&n=iCWo95dJsVDQESWQ&q=85&s=311af2a0575a8ed537fd86c08f873593" alt="WeChat exchange with aki: concerned about prompt tampering; APIYI confirms it never injects prompts or logs traffic" width="756" height="1000" data-path="images/wall-of-love/wechat-aki-no-prompt-tampering.jpg" />
  </Frame>

  <Frame caption="**Pro user · DoujianGle · WeChat · 2026-06-02** — 'The high tier really nails prompt-following — high fidelity to my prompts, no scattering into a pile of junk images.' Done right inside APIYI's built-in image tool — no standalone `.py` to wrangle.">
    <img src="https://mintcdn.com/apiyillc/iCWo95dJsVDQESWQ/images/wall-of-love/wechat-doujiang-high-quality.jpg?fit=max&auto=format&n=iCWo95dJsVDQESWQ&q=85&s=783f654973b5cb43c948cfa8d8d6cc14" alt="WeChat feedback from DoujianGle: high quality tier follows prompts well with high fidelity" width="987" height="1000" data-path="images/wall-of-love/wechat-doujiang-high-quality.jpg" />
  </Frame>

  <Frame caption="**Long-time user Archer · WeChat · 2026-06-02** — While reporting a pricing config bug on `claude-opus-4-8`, Archer casually mentioned recommending us to 4 friends. We sent a \$30 thank-you credit.">
    <img src="https://mintcdn.com/apiyillc/iCWo95dJsVDQESWQ/images/wall-of-love/wechat-archer-recommend-friends.png?fit=max&auto=format&n=iCWo95dJsVDQESWQ&q=85&s=2cdea925e5f8850d8c6fd7620c5bfc3a" alt="WeChat feedback from long-time user Archer: 'Your service has always been great, I've recommended it to 4 friends'" width="1364" height="892" data-path="images/wall-of-love/wechat-archer-recommend-friends.png" />
  </Frame>

  <Card title="Zhang · CTO of an AI startup" icon="quote">
    "The 1:7 fixed exchange rate is more stable than the official one. We integrated Gemini 3 Pro in half an hour, and our team no longer gets paged at 3am about Claude rate limits."
  </Card>

  <Card title="Indie developer · @sarah_codes" icon="quote">
    "Finally a Claude proxy that doesn't throttle me at 3am. The 5% off on the ClaudeCode tier plus the top-up bonus easily beats the official price by 20%."
  </Card>

  <Card title="A SaaS team · 200M tokens / month" icon="building">
    We started in November 2025, mainly on Claude Opus and the GPT-5 family. Three things matter to us:

    * The 1:7 fixed rate spares our CFO from monthly FX explanations
    * 5% off on ClaudeCode + 15% top-up bonus pushes real cost 20%+ below official
    * Console logs filterable by model and user make accounting painless
  </Card>

  <Card title="Cross-border e-commerce · localization team" icon="quote">
    "GPT-5 translation quality is consistently good. The console shows per-key spend in real time, so ops and finance don't need to chase me for reports anymore."
  </Card>

  <Card title="University lab · multimodal research" icon="flask-conical">
    We use Nano Banana Pro and Sora2 for student projects. University procurement is slow, but APIYI takes RMB top-ups and issues invoices — students can run experiments with study cards.
  </Card>

  <Card title="Freelance photographer · post-production" icon="camera">
    "gemini-3-pro-image-preview output files are larger but the quality is genuinely strong. Pay-per-image gives me clear cost visibility — way better than subscriptions for ad-hoc work."
  </Card>

  <Card title="A game studio · NPC dialogue system" icon="gamepad-2">
    During peak player hours we're very sensitive to Claude rate limits. After switching to the APIYI ClaudeCode tier, peak-hour fluctuations dropped noticeably vs. hitting Anthropic directly — near-zero complaints in our staged rollout.
  </Card>

  <Card title="Solo developer · automation scripts" icon="quote">
    "The docs are even more detailed than the official ones — every model's endpoint, pricing, rate limits and best practices are there, and the AI Radar keeps me up to date on releases."
  </Card>
</div>

## Want to join the wall?

If APIYI has earned a place in your workflow, we'd love to hear from you:

* 📧 Email — send screenshots, a one-liner, or a story to our support address
* 💬 WeChat group — @admin in the user group and we'll redact and post it
* 🌐 Public posts — share the link to your X / Twitter / Xiaohongshu review

We'll feature every contribution here with privacy in mind.
