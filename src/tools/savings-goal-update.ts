import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {savingsGoalUid, amount} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export function registerSavingsGoalUpdate(server: McpServer, config: Config): void {
	server.registerTool(
		'savings_goal_update',
		{
			title: 'Update savings goal',
			description: 'Update an existing savings goal',
			inputSchema: {
				...savingsGoalUid,
				name: z.string().describe('Name of the savings goal'),
				currency: z.string().describe('Currency code (e.g., GBP)'),
				target: amount.optional().describe('Target amount for the savings goal'),
			},
			annotations: {
				readOnlyHint: false,
			},
		},
		async ({accountUid, savingsGoalUid, name, currency, target}) => {
			const result = await makeStarlingApiCall(
				`/api/v2/account/${accountUid}/savings-goals/${savingsGoalUid}`,
				config.accessToken,
				'PUT',
				{
					name,
					currency,
					target,
				},
			);
			return {
				content: [{type: 'text' as const, text: JSON.stringify(result, null, 2)}],
			};
		},
	);
}
