# FreeScout MCP Server

> **Note:** This project is a work in progress.

A TypeScript MCP (Model Context Protocol) server for [FreeScout](https://freescout.net/) helpdesk integration. Enables AI assistants like Claude to interact with your FreeScout instance.

## Features

- **Conversation Management** - List, filter, create, update, and delete conversations with threads
- **User Management** - List and get user details
- **Thread Creation** - Add replies and notes to conversations
- **Tag Management** - List and set tags on conversations
- **Full-Text Search** - Search tickets via Meilisearch integration

## Installation

```bash
npm install -g freescout-mcp
```

## Configuration

Create `~/.config/freescout-mcp/config.json`:

```json
{
  "baseUrl": "https://your-freescout.com",
  "apiKey": "your-api-key",
  "meilisearch": {
    "host": "http://localhost:7700",
    "apiKey": "your-meilisearch-key"
  }
}
```

The `meilisearch` section is optional - only needed if you want full-text search.

## Usage with Claude Desktop

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "freescout": {
      "command": "freescout-mcp"
    }
  }
}
```

## Local Development / Testing with Claude Code

Create a `.mcp.json` in the project root (this file is gitignored — do not commit it):

```json
{
  "mcpServers": {
    "freescout-dev": {
      "command": "node",
      "args": ["/absolute/path/to/FreescoutMCP/dist/bundle.js"],
      "env": {
        "FREESCOUT_BASE_URL": "https://your-freescout.com",
        "FREESCOUT_API_KEY": "your-api-key",
        "FREESCOUT_ALLOW_DELETE": "true"
      }
    }
  }
}
```

Then build the bundle and connect via `/mcp` in Claude Code:

```bash
npx tsc && node node_modules/esbuild/bin/esbuild dist/index.js --bundle --platform=node --format=esm --outfile=dist/bundle.js --banner:js="import{createRequire}from'module';const require=createRequire(import.meta.url);"
```

## Available Tools

| Tool | Description |
|------|-------------|
| `list_conversations` | List conversations with filters (status, mailbox, tag, assignee, dates) |
| `get_conversation` | Get a conversation with threads and tags |
| `create_conversation` | Create a new conversation |
| `update_conversation` | Update status, assignee, mailbox, subject, or custom fields |
| `delete_conversation` | Permanently delete a conversation (requires `FREESCOUT_ALLOW_DELETE=true`) |
| `list_users` | List users with optional email filter |
| `get_user` | Get a user by ID |
| `create_thread` | Add a reply or note to a conversation |
| `search` | Full-text search via Meilisearch |
| `list_tags` | List available tags |
| `set_tags` | Set tags on a conversation |

## License

MIT
