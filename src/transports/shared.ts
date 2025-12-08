import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {createServer, type Config} from '../server.js';

export function getConfig(): Config {
	const accessToken = process.env.STARLING_BANK_ACCESS_TOKEN;
	if (!accessToken) {
		throw new Error('starling-bank-mcp: No access token provided. Set it in the `STARLING_BANK_ACCESS_TOKEN` environment variable');
	}

	return {accessToken};
}

export function initServer(): McpServer {
	return createServer(getConfig());
}

export function setupSignalHandlers(cleanup: () => Promise<void>): void {
	process.on('SIGINT', async () => {
		await cleanup();
		process.exit(0);
	});

	process.on('SIGTERM', async () => {
		await cleanup();
		process.exit(0);
	});
}

export function handleStartupError(error: unknown): never {
	console.error('Server startup failed:', error);
	process.exit(1);
}
