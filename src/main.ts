#!/usr/bin/env node
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import {initServer, setupSignalHandlers, handleStartupError} from './transports/shared.js';

async function main(): Promise<void> {
	const transport = process.env.MCP_TRANSPORT || 'stdio';
	const server = initServer();

	if (transport === 'stdio') {
		const stdioTransport = new StdioServerTransport();
		setupSignalHandlers(async () => server.close());
		await server.connect(stdioTransport);
		console.error('MCP server running on stdio');
	} else if (transport === 'http') {
		const port = parseInt(process.env.PORT || '3000', 10);
		const app = express();
		app.use(express.json());

		const httpTransport = new StreamableHTTPServerTransport({
			sessionIdGenerator: undefined,
			enableJsonResponse: true,
		});

		await server.connect(httpTransport);

		app.post('/mcp', async (req, res) => {
			await httpTransport.handleRequest(req, res, req.body);
		});

		const httpServer = app.listen(port, () => {
			console.error(`MCP server running on http://localhost:${port}/mcp`);
		});

		httpServer.on('error', (err: NodeJS.ErrnoException) => {
			if (err.code === 'EADDRINUSE') {
				console.error(`Error: Port ${port} is already in use.`);
			} else {
				console.error('Server error:', err);
			}

			process.exit(1);
		});

		setupSignalHandlers(async () => {
			await server.close();
			httpServer.close();
		});
	} else {
		throw new Error(`Unknown transport: ${transport}. Use 'stdio' or 'http'.`);
	}
}

main().catch(handleStartupError);
