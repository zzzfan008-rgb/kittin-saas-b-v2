> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Account Center Adds a Login Devices Feature; Already-Signed-In Users May See a 403, Just Sign In Again

> After the 12 September system upgrade, the Account Center gained a Login Devices feature. Users who were already signed in before the upgrade may see an AxiosError: Request failed with status code 403 message when opening the Account Center. It comes from the old login session failing validation under the new feature and does not affect API calls or balances. Sign out in the current browser and sign in again to clear it.

**2026/9/12 14:32 (UTC+8)** · Service Notice

⚠️ **The Account Center now has a Login Devices feature; users signed in before the upgrade may see a 403 message, and signing out and back in clears it**

After the 12 September system upgrade, the Account Center gained a Login Devices feature for viewing and managing the sessions signed in to your account. Browsers that were already signed in before the upgrade still hold the old login session, so when they open the Account Center the new feature's request fails validation and the page shows `Error: AxiosError: Request failed with status code 403`.

This message **only affects the Account Center page and does not affect API calls**: your Keys, balance, groups and every API request keep working as usual. To clear it, sign out of your account in the current browser and sign in again.

Thank you for your understanding; we keep the service running.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
