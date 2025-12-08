# starling-bank-mcp

MCP server for Starling Bank API integration, providing tools to interact with Starling Bank's developer API for account management and transactions.

https://github.com/user-attachments/assets/c2b23c22-bd23-487e-a4f5-c62e02280052

This is a 3rd party integration, and is not affiliated with Starling Bank.

> [!WARNING]
> At time of writing, models make frequent mistakes and are vulnerable to prompt injections. As this MCP server gives the model some control of your bank account, mistakes could be costly. Use with caution and at your own risk.

## Installation

**Step 1**: Create a Starling Bank personal access token. To do this:
- [Sign up for a Starling Developers account](https://developer.starlingbank.com/signup)
- [Link your Starling Bank account to your Starling Developer account](https://developer.starlingbank.com/settings/account)
- [Create the access token](https://developer.starlingbank.com/personal/token)
  - The token name can be anything, e.g. 'Starling Bank MCP Server Token'
  - Select the scopes based on what you want the AI system to be able to access

Keep the token handy, you'll need it in the next step. It'll probably begin something like `eyJhbGciOiJQUzI1NiIsInppcCI6IkdaSVAifQ.`, and be moderately long.

**Step 2**: Follow the instructions below for your preferred client:

- [Claude Desktop](#claude-desktop)
- [Cursor](#cursor)
- [Cline](#cline)

**(Optional, Advanced) Step 3**: See [PAYMENT_SIGNING_SETUP.md](./PAYMENT_SIGNING_SETUP.md) if you want to be able to send payments.

### Claude Desktop

#### (Recommended) Alternative: Via manual .mcpb installation

1. Find the latest mcpb build in [the GitHub Actions history](https://github.com/domdomegg/starling-bank-mcp/actions/workflows/ci.yaml?query=branch%3Amaster) (the top one)
2. In the 'Artifacts' section, download the `starling-bank-mcp-mcpb` file
3. Rename the `.zip` file to `.mcpb`
4. Double-click the `.mcpb` file to open with Claude Desktop
5. Click "Install" and configure with your API key

#### (Advanced) Alternative: Via JSON configuration

1. Install [Node.js](https://nodejs.org/en/download)
2. Open Claude Desktop and go to Settings → Developer
3. Click "Edit Config" to open your `claude_desktop_config.json` file
4. Add the following configuration to the "mcpServers" section, replacing `eyJhb...` with your API key:

```json
{
  "mcpServers": {
    "starling-bank": {
      "command": "npx",
      "args": [
        "-y",
        "starling-bank-mcp"
      ],
      "env": {
        "STARLING_BANK_ACCESS_TOKEN": "eyJhb...",
      }
    }
  }
}
```

5. Save the file and restart Claude Desktop

### Cursor

#### (Recommended) Via one-click install

1. Click [![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=starling-bank-mcp&config=JTdCJTIyY29tbWFuZCUyMiUzQSUyMm5weCUyMC15JTIwc3RhcmxpbmctYmFuay1tY3AlMjIlMkMlMjJlbnYlMjIlM0ElN0IlMjJTVEFSTElOR19CQU5LX0FDQ0VTU19UT0tFTiUyMiUzQSUyMmV5SmhiJTIyJTdEJTdE)
2. Edit your `mcp.json` file to insert your API key

#### (Advanced) Alternative: Via JSON configuration

Create either a global (`~/.cursor/mcp.json`) or project-specific (`.cursor/mcp.json`) configuration file, replacing `eyJhb...` with your API key:

```json
{
  "mcpServers": {
    "starling-bank": {
      "command": "npx",
      "args": ["-y", "starling-bank-mcp"],
      "env": {
        "STARLING_BANK_ACCESS_TOKEN": "eyJhb..."
      }
    }
  }
}
```

### Cline

#### Via JSON configuration

1. Click the "MCP Servers" icon in the Cline extension
2. Click on the "Installed" tab, then the "Configure MCP Servers" button at the bottom
3. Add the following configuration to the "mcpServers" section, replacing `eyJhb...` with your API key:

```json
{
  "mcpServers": {
    "starling-bank": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "starling-bank-mcp"],
      "env": {
        "STARLING_BANK_ACCESS_TOKEN": "eyJhb..."
      }
    }
  }
}
```

## Advanced: HTTP Transport

By default, the server uses stdio transport (for Claude Desktop, Cursor, etc.). You can also run it as an HTTP server:

```bash
STARLING_BANK_ACCESS_TOKEN=eyJhb... MCP_TRANSPORT=http PORT=3000 npx starling-bank-mcp
```

The MCP endpoint will be available at `http://localhost:3000/mcp`.

> [!WARNING]
> The HTTP transport has no authentication. Other processes on your machine—including websites in your browser—could potentially access the endpoint and control your bank account. Only use HTTP transport behind a reverse proxy or in another secured setup.

## Contributing

Pull requests are welcomed on GitHub! To get started:

1. Install Git and Node.js
2. Clone the repository
3. Install dependencies with `npm install`
4. Run `npm run test` to run tests
5. Build with `npm run build`

## Releases

Versions follow the [semantic versioning spec](https://semver.org/).

To release:

1. Use `npm version <major | minor | patch>` to bump the version
2. Run `git push --follow-tags` to push with tags
3. Wait for GitHub Actions to publish to the NPM registry.
