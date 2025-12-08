import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {accountUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export function registerDirectDebitsList(server: McpServer, config: Config): void {
	server.registerTool(
		'direct_debits_list',
		{
			title: 'List direct debits',
			description: 'Get all direct debit mandates for an account',
			inputSchema: {
				...accountUid,
			},
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({accountUid}) => {
			const result = await makeStarlingApiCall(`/api/v2/direct-debit/mandates/account/${accountUid}`, config.accessToken);
			return {
				content: [{type: 'text' as const, text: JSON.stringify(result, null, 2)}],
			};
		},
	);
}
