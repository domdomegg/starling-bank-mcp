#!/usr/bin/env node
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import {createServer} from './index.js';

function setupSignalHandlers(cleanup: () => Promise<void>): void {
	process.on('SIGINT', async () => {
		await cleanup();
		process.exit(0);
	});
	process.on('SIGTERM', async () => {
		await cleanup();
		process.exit(0);
	});
}

function getAccessToken(): string {
	const accessToken = process.env.STARLING_BANK_ACCESS_TOKEN;
	if (!accessToken) {
		throw new Error('starling-bank-mcp: No access token provided. Set it in the `STARLING_BANK_ACCESS_TOKEN` environment variable');
	}

	return accessToken;
}

const transport = process.env.MCP_TRANSPORT || 'stdio';

(async () => {
	if (transport === 'stdio') {
		const server = createServer({accessToken: getAccessToken()});
		setupSignalHandlers(async () => server.close());

		const stdioTransport = new StdioServerTransport();
		await server.connect(stdioTransport);
		console.error('Starling Bank MCP server running on stdio');
	} else if (transport === 'http') {
		const app = express();
		app.use(express.json());

		const httpTransport = new StreamableHTTPServerTransport({
			sessionIdGenerator: undefined,
			enableJsonResponse: true,
		});

		app.post('/mcp', async (req, res) => {
			await httpTransport.handleRequest(req, res, req.body);
		});

		const server = createServer({accessToken: getAccessToken()});
		await server.connect(httpTransport);

		const port = parseInt(process.env.PORT || '3000', 10);
		const httpServer = app.listen(port, () => {
			console.error(`Starling Bank MCP server running on http://localhost:${port}/mcp`);
			console.error('WARNING: HTTP transport has no authentication. Only use behind a reverse proxy or in a secured setup.');
		});

		setupSignalHandlers(async () => {
			await server.close();
			httpServer.close();
		});
	} else {
		console.error(`Unknown transport: ${transport}. Use MCP_TRANSPORT=stdio or MCP_TRANSPORT=http`);
		process.exit(1);
	}
})();
