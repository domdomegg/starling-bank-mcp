import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {savingsGoalUid, amount} from './schemas.js';
import {savingsGoalTransferOutput} from './output-schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';
import {jsonResult} from '../utils/response.js';
import {randomUUID} from 'node:crypto';

export function registerSavingsGoalWithdraw(server: McpServer, config: Config): void {
	server.registerTool(
		'savings_goal_withdraw',
		{
			title: 'Withdraw from savings goal',
			description: 'Withdraw money from a savings goal',
			inputSchema: {
				...savingsGoalUid,
				amount,
			},
			outputSchema: savingsGoalTransferOutput,
			annotations: {
				readOnlyHint: false,
			},
		},
		async ({accountUid, savingsGoalUid, amount}) => {
			const result = await makeStarlingApiCall(
				`/api/v2/account/${accountUid}/savings-goals/${savingsGoalUid}/withdraw-money/${randomUUID()}`,
				config.accessToken,
				'PUT',
				{
					amount,
				},
			);
			return jsonResult(savingsGoalTransferOutput.parse(result));
		},
	);
}
