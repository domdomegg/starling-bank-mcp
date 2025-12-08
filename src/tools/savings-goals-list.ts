import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {accountUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export function registerSavingsGoalsList(server: McpServer, config: Config): void {
	server.registerTool(
		'savings_goals_list',
		{
			title: 'List savings goals',
			description: 'Get all savings goals for an account',
			inputSchema: {
				...accountUid,
			},
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({accountUid}) => {
			const result = await makeStarlingApiCall(`/api/v2/account/${accountUid}/savings-goals`, config.accessToken);
			return {
				content: [{type: 'text' as const, text: JSON.stringify(result, null, 2)}],
			};
		},
	);
}
