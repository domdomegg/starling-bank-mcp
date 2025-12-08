import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export function registerAccountsList(server: McpServer, config: Config): void {
	server.registerTool(
		'accounts_list',
		{
			title: 'Get all accounts',
			description: 'Get all accounts associated with the logged in account holder. This is typically the first call to make to get account information. An account holder (e.g. a person or business) can have multiple accounts (e.g. a GBP and EUR account).',
			inputSchema: {},
			annotations: {
				readOnlyHint: true,
			},
		},
		async () => {
			const result = await makeStarlingApiCall('/api/v2/accounts', config.accessToken);
			return {
				content: [{type: 'text' as const, text: JSON.stringify(result, null, 2)}],
			};
		},
	);
}
