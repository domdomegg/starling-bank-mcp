import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export function registerCardsList(server: McpServer, config: Config): void {
	server.registerTool(
		'cards_list',
		{
			title: 'List all cards',
			description: 'Get all the cards for an account holder',
			inputSchema: {},
			annotations: {
				readOnlyHint: true,
			},
		},
		async () => {
			const result = await makeStarlingApiCall('/api/v2/cards', config.accessToken);
			return {
				content: [{type: 'text' as const, text: JSON.stringify(result, null, 2)}],
			};
		},
	);
}
