import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';
import {jsonResult} from '../utils/response.js';

const outputSchema = z.object({
	accounts: z.array(z.object({
		accountUid: z.string(),
		accountType: z.string(),
		defaultCategory: z.string(),
		currency: z.string(),
		createdAt: z.string(),
		name: z.string(),
	})),
});

export function registerAccountsList(server: McpServer, config: Config): void {
	server.registerTool(
		'accounts_list',
		{
			title: 'Get all accounts',
			description: 'Get all accounts associated with the logged in account holder. This is typically the first call to make to get account information. An account holder (e.g. a person or business) can have multiple accounts (e.g. a GBP and EUR account).',
			inputSchema: {},
			outputSchema,
			annotations: {
				readOnlyHint: true,
			},
		},
		async () => {
			const result = await makeStarlingApiCall('/api/v2/accounts', config.accessToken);
			return jsonResult(outputSchema.parse(result));
		},
	);
}
