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

## Usage

Add to your MCP client config (Claude Desktop, Claude Code, or any MCP-compatible client):

```json
{
  "mcpServers": {
    "freescout": {
      "command": "freescout-mcp",
      "env": {
        "FREESCOUT_BASE_URL": "https://your-freescout.com",
        "FREESCOUT_API_KEY": "your-api-key"
      }
    }
  }
}
```

To enable conversation deletion, add `FREESCOUT_ALLOW_DELETE=true` to the `env` block.

### Full-Text Search (Optional)

The `search` tool requires two things:

1. The [FreeScout Faster Search module](https://freescout.net/module/faster-search/) installed on your FreeScout instance
2. A running [Meilisearch](https://www.meilisearch.com/) server configured with that module

If both are in place, add the Meilisearch connection to your env:

```json
"env": {
  "FREESCOUT_BASE_URL": "https://your-freescout.com",
  "FREESCOUT_API_KEY": "your-api-key",
  "MEILISEARCH_HOST": "http://your-meilisearch-host:7700",
  "MEILISEARCH_API_KEY": "your-meilisearch-key"
}
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
