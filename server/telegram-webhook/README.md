# PhotoWord support

The deployed webhook verifies Telegram’s secret header and preserves the existing Stars payment handlers. Support entry accepts text and Telegram photos in private chats, confirms saved tickets by number, and offers `/cancel`, `/paysupport`, `/terms`, `/privacy` and `/myid`.

Staff access is disabled until `app_config.support_admin_telegram_ids` is configured as a JSON array of verified numeric Telegram IDs, for example `[123456789]`. This key is read by the server only and is excluded from the public configuration response. Never accept a claimed username as authorization.

Authorized staff commands:
- `/support_queue`: latest ten unanswered tickets.
- `/ticket ID`: full text and attached screenshot.
- `/reply ID text`: send a reply and mark answered only after Telegram confirms delivery.

Run `node scripts/test-support-webhook.mjs` with Node 24. Mobile UI checks use Playwright 1.62.1: `node scripts/test-settings-support.cjs`. `scripts/test-account-deletion.sql` creates synthetic players inside a rolled-back transaction and verifies deletion and the opponent’s stake refund.
