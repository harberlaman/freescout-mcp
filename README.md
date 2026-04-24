# FreeScout MCP Server

> **Note:** This project is a work in progress.

A TypeScript MCP (Model Context Protocol) server for [FreeScout](https://freescout.net/) helpdesk integration. Enables AI assistants like Claude to interact with your FreeScout instance.

## Features

- **Conversation Management** - List, filter, and retrieve conversations with threads
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

## Available Tools

| Tool | Description |
|------|-------------|
| `list_conversations` | List conversations with filters (status, mailbox, tag, assignee, dates) |
| `get_conversation` | Get a conversation with threads and tags |
| `list_users` | List users with optional email filter |
| `get_user` | Get a user by ID |
| `create_thread` | Add a reply or note to a conversation |
| `search` | Full-text search via Meilisearch |
| `list_tags` | List available tags |
| `set_tags` | Set tags on a conversation |

## License

MIT
