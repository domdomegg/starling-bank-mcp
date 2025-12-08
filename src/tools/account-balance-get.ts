import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {accountUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export function registerAccountBalanceGet(server: McpServer, config: Config): void {
	server.registerTool(
		'account_balance_get',
		{
			title: 'Get account balance',
			description: 'Get the balance for a specific account. Shows both cleared balance (settled transactions) and effective balance (including pending transactions).',
			inputSchema: {
				...accountUid,
			},
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({accountUid}) => {
			const result = await makeStarlingApiCall(`/api/v2/accounts/${accountUid}/balance`, config.accessToken);
			return {
				content: [{type: 'text' as const, text: JSON.stringify(result, null, 2)}],
			};
		},
	);
}
