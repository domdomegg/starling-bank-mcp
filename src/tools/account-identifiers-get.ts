import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {accountUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export function registerAccountIdentifiersGet(server: McpServer, config: Config): void {
	server.registerTool(
		'account_identifiers_get',
		{
			title: 'Get account identifiers',
			description: 'Get an account\'s bank identifiers (sort code, account number, BIC, IBAN, etc.)',
			inputSchema: {
				...accountUid,
			},
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({accountUid}) => {
			const result = await makeStarlingApiCall(`/api/v2/accounts/${accountUid}/identifiers`, config.accessToken);
			return {
				content: [{type: 'text' as const, text: JSON.stringify(result, null, 2)}],
			};
		},
	);
}
