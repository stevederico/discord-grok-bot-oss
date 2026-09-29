# discord-grok-bot

Grok plugin + stdio MCP so Grok Build CLI and Grok Bot can read Discord with a bot token.

## Layout

- `server/` MCP stdio (`index.js`) and Discord REST (`rest.js`)
- `bot/` optional Gateway mention bot (`npm run bot`)
- `skills/discord/SKILL.md` and `commands/discord.md` for Grok
- `plugin.json` + `.mcp.json` (Grok) and `mcp.json` (Cursor)

## Rules

- Node ESM. Native `fetch`. No `discord.js`, no dotenv.
- Token from `DISCORD_BOT_TOKEN` (alias `DISCORD_TOKEN`).
- Tests: `bun run test` (node:test next to source).
- Pin deps exact. After `bun add`/`remove`, run `npm install --package-lock-only --ignore-scripts`.
