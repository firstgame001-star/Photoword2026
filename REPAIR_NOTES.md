# PhotoWord repair — 20260926-r1

The bot URL remains `/Photoword2026/clean/`.

Fixed missing stylesheet and missing home script, removed the obsolete embedded game, restored home/settings/profile/ranking behavior, and captured the Telegram launch data before navigating to the separate game page. Native haptic failures and blocked storage no longer interrupt the controls. UI errors are visible instead of silent failures. No bot token or service-role key is included in the frontend.

`node scripts/check-clean.mjs` checks both entrypoints, local links, exact Telegram SDK URL and JavaScript syntax. Isolated Chromium DOM tests passed 10 scenarios with mocked Telegram, storage and API responses. These are not live iPhone or live Telegram authorization tests. The runner blocked direct HTTP/file navigation, so no live website status is inferred from these tests.

`Verify PhotoWord Pages` checks the actual public Pages URL and asset URLs after a successful Pages deployment. Do not equate a repository commit with completed publication. Server balance/XP transaction checks were executed with temporary test data inside BEGIN/ROLLBACK, leaving real player balances unchanged.

This remains a one-level development version; content images, music, friends, purchases, daily tasks/rewards and legal pages are not completed. The user interface does not present these as working features.
