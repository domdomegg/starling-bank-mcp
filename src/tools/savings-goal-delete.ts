import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {savingsGoalUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';
import {jsonResult} from '../utils/response.js';

const outputSchema = z.object({
	success: z.boolean().optional(),
});

export function registerSavingsGoalDelete(server: McpServer, config: Config): void {
	server.registerTool(
		'savings_goal_delete',
		{
			title: 'Delete savings goal',
			description: 'Delete a savings goal',
			inputSchema: {
				...savingsGoalUid,
			},
			outputSchema,
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
			return jsonResult(outputSchema.parse(result));
		},
	);
}
