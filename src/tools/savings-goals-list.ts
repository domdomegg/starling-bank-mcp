import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {accountUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';
import {jsonResult} from '../utils/response.js';

const currencyAndAmount = z.object({
	currency: z.string(),
	minorUnits: z.number(),
});

const savingsGoal = z.object({
	savingsGoalUid: z.string().optional(),
	name: z.string().optional(),
	target: currencyAndAmount.optional(),
	totalSaved: currencyAndAmount.optional(),
	savedPercentage: z.number().optional(),
	state: z.string(),
});

const outputSchema = z.object({
	savingsGoalList: z.array(savingsGoal),
});

export function registerSavingsGoalsList(server: McpServer, config: Config): void {
	server.registerTool(
		'savings_goals_list',
		{
			title: 'List savings goals',
			description: 'Get all savings goals for an account',
			inputSchema: {
				...accountUid,
			},
			outputSchema,
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({accountUid}) => {
			const result = await makeStarlingApiCall(`/api/v2/account/${accountUid}/savings-goals`, config.accessToken);
			return jsonResult(outputSchema.parse(result));
		},
	);
}
