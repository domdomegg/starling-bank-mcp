import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export function registerPayeesList(server: McpServer, config: Config): void {
	server.registerTool(
		'payees_list',
		{
			title: 'List all payees',
			description: 'Get all payees (people/companies you can send payments to) for the account holder.',
			inputSchema: {},
			annotations: {
				readOnlyHint: true,
			},
		},
		async () => {
			const result = await makeStarlingApiCall('/api/v2/payees', config.accessToken);
			return {
				content: [{type: 'text' as const, text: JSON.stringify(result, null, 2)}],
			};
		},
	);
}
