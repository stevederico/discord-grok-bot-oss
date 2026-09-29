# Discord Grok Bot

### discord connector for grok build cli and grok bot

> **Status:** unit tests pass (13). It has not been run against a live Discord server yet, so expect rough edges. Issues and PRs welcome.

Read your Discord servers from Grok. Same plugin works in Grok Build CLI (`grok plugin install`) and as a Grok Bot plugin. Optional mention bot replies with Grok in Discord.

## Quick Start

1. Create a Discord application and bot (steps below). Copy the bot token.
2. Invite the bot to your server.
3. Install the plugin:

```bash
export DISCORD_BOT_TOKEN="your-bot-token"
grok plugin install . --trust
```

4. In Grok: "list my Discord servers, then read #general".

Standalone MCP (no plugin):

```bash
bun install
export DISCORD_BOT_TOKEN="your-bot-token"
grok mcp add discord -- ./server/run.sh
```

## Discord App

One-time setup at [discord.com/developers/applications](https://discord.com/developers/applications).

1. **New Application**. Name it what people will @mention.
2. **Bot** > **Reset Token**. That is `DISCORD_BOT_TOKEN`. Never commit it.
3. **Bot** > Privileged Gateway Intents: turn **Message Content Intent** on. Save.
4. **OAuth2** > **URL Generator**: scope `bot`. Permissions: View Channels, Send Messages, Read Message History.
5. Open the generated URL, pick your server, authorize.
6. In Discord: Settings > Advanced > Developer Mode. Right-click the server and channels you want and copy IDs if you use allowlists.

Without Message Content Intent, REST still returns messages but `content` is empty.

## Grok Build CLI

```bash
grok plugin install /path/to/discord-grok-bot --trust
```

Or drop the folder in `~/.grok/plugins/` (auto-trusted) and enable it. Token comes from `DISCORD_BOT_TOKEN` in the environment. Grok expands `${DISCORD_BOT_TOKEN}` in the plugin MCP config.

Ask:

- What servers can you see?
- Summarize the last 30 messages in #general
- Search #ops for "deploy"

## Grok Bot

Grok Bot loads the same plugin format (skills + MCP). On the Grok Bot computer:

```bash
git clone https://github.com/stevederico/discord-grok-bot-oss.git
cd discord-grok-bot
export DISCORD_BOT_TOKEN="your-bot-token"
grok plugin install . --trust
```

Then: **Settings > Plugins**, enable **discord-grok-bot**, and `@` the connector in chat.

There is no official Discord inbound channel. To have Grok reply when someone @mentions the Discord bot, run the Gateway process on that computer:

```bash
export XAI_API_KEY="xai-..."
bun run bot
```

It only answers mentions. Set `DISCORD_GUILD_IDS` and `DISCORD_CHANNEL_IDS` so it stays in the channels you chose.

## Tools

| Tool | What it does |
| --- | --- |
| `discord_status` | Bot identity, guild count, allowlists, invite URL |
| `discord_list_guilds` | Servers the bot is in |
| `discord_list_channels` | Text channels in a server |
| `discord_read_messages` | Recent history (id or `#name`) |
| `discord_get_message` | One message |
| `discord_search_messages` | Substring over the last 100 messages |
| `discord_send_message` | Post (confirm first) |

Bots do not get Discord's search API. Search filters recent history in that channel.

## Env

| Variable | Required | Purpose |
| --- | --- | --- |
| `DISCORD_BOT_TOKEN` | yes | Bot token (`DISCORD_TOKEN` also accepted) |
| `DISCORD_GUILD_IDS` | no | Comma-separated server allowlist |
| `DISCORD_CHANNEL_IDS` | no | Comma-separated channel allowlist |
| `XAI_API_KEY` | mention bot only | xAI key for `bun run bot` |

Copy `.env.example` to `.env`. `server/run.sh` sources it. Do not commit `.env`.

## Dev

```bash
bun install
bun run test
bun start          # MCP stdio
bun run bot        # Gateway mention bot
```

- Grok: `plugin.json` + `.mcp.json`
- Cursor: `mcp.json`
- Skill: `skills/discord/SKILL.md`

## License

MIT
