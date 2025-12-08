import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {registerAll, type Config} from './tools/index.js';

// Library exports
export type {Config} from './tools/index.js';

export function createServer(config: Config): McpServer {
	const server = new McpServer({
		name: 'starling-bank-mcp',
		version: '1.1.0',
	});

	registerAll(server, config);

	return server;
}
