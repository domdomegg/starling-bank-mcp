import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {categoryUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export function registerTransactionsList(server: McpServer, config: Config): void {
	server.registerTool(
		'transactions_list',
		{
			title: 'List transactions',
			description: 'Get transaction feed items for an account category. Use the default category UID for main account transactions.',
			inputSchema: {
				...categoryUid,
				minTransactionTimestamp: z.string().describe('Start date for transactions (ISO 8601 format, e.g., 2024-01-01T00:00:00.000Z)'),
				maxTransactionTimestamp: z.string().describe('End date for transactions (ISO 8601 format, e.g., 2024-12-31T23:59:59.999Z)'),
			},
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({accountUid, categoryUid, minTransactionTimestamp, maxTransactionTimestamp}) => {
			let endpoint = `/api/v2/feed/account/${accountUid}/category/${categoryUid}`;

			if (minTransactionTimestamp || maxTransactionTimestamp) {
				endpoint += '/transactions-between';
				const params = new URLSearchParams();

				if (minTransactionTimestamp) {
					params.append('minTransactionTimestamp', minTransactionTimestamp);
				}

				if (maxTransactionTimestamp) {
					params.append('maxTransactionTimestamp', maxTransactionTimestamp);
				}

				endpoint += `?${params.toString()}`;
			}

			const result = await makeStarlingApiCall(endpoint, config.accessToken);
			return {
				content: [{type: 'text' as const, text: JSON.stringify(result, null, 2)}],
			};
		},
	);
}
