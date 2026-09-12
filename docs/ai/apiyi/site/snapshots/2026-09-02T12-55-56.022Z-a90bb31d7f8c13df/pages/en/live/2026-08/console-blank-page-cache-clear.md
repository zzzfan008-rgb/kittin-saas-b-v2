> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Brief console blank page fixed — clear site data if it persists

> The APIYI console showed a brief blank page around midday (UTC+8) today. The server-side issue was fixed immediately, API calls were unaffected throughout, and account and balance data are intact. Anyone who opened the console during the incident may still see a blank page because the browser kept the old page data; clearing site data once restores it.

**2026/8/13 13:51 (UTC+8)** · Service Notice

⚠️ **The console showed a brief blank page around midday today — fixed server-side; clear site data if it persists**

The server-side issue was fixed immediately. **API calls were unaffected throughout, and account and balance data are entirely intact.** Browsers do keep a local copy of the old page data, however, so anyone who opened the console during the incident may still see a blank page afterwards, and an ordinary refresh will not help. Clearing this site's data once restores it, with nothing further to do afterwards (you will need to sign in again after clearing).

A quick way to confirm: open `api.apiyi.com` in an incognito / private window. If it renders normally, the problem is only stale local data — clear it once using the steps below.

**Desktop Chrome / Edge** (fastest, about 10 seconds)

1. Open `api.apiyi.com` (a blank page is fine)
2. Click the icon at the left end of the address bar (🔒 or the tune / settings icon)
3. Choose "Site settings" → click "Delete data" (some versions show "Cookies and site data" → "Manage site data" → delete)
4. Return to the page, refresh, and sign in again

**Desktop Safari (Mac)**

1. Menu bar Safari → "Settings" → "Privacy" → "Manage Website Data"
2. Search for apiyi, select the entries and click "Remove"
3. Refresh the page and sign in again

**Mobile browsers**

Browser settings → Privacy / Clear browsing data → tick "Cookies and site data" (a time range of the last hour is enough) → clear, then reopen the page. If you opened it inside WeChat, close that web page and reopen it; if it is still blank, go to WeChat "Me" → Settings → General → Storage → Clear Cache.

Apologies for the disruption. If the steps above do not restore the page, contact us anytime.

***

← [Back to Live Updates](/en/live) · 📚 [Archive by month](/en/live/archive)
