import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {savingsGoalUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export function registerSavingsGoalDelete(server: McpServer, config: Config): void {
	server.registerTool(
		'savings_goal_delete',
		{
			title: 'Delete savings goal',
			description: 'Delete a savings goal',
			inputSchema: {
				...savingsGoalUid,
			},
			annotations: {
				readOnlyHint: false,
			},
		},
		async ({accountUid, savingsGoalUid}) => {
			const result = await makeStarlingApiCall(
				`/api/v2/account/${accountUid}/savings-goals/${savingsGoalUid}`,
				config.accessToken,
				'DELETE',
			);
			return {
				content: [{type: 'text' as const, text: JSON.stringify(result, null, 2)}],
			};
		},
	);
}
