import {type z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {savingsGoalTransferSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';
import {randomUUID} from 'node:crypto';

export const schema = savingsGoalTransferSchema;

export const tool: Tool = {
	name: 'savings_goal_deposit',
	description: 'Add money to a savings goal',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'Deposit to savings goal',
		readOnlyHint: false,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	const result = await makeStarlingApiCall(
		`/api/v2/account/${args.accountUid}/savings-goals/${args.savingsGoalUid}/add-money/${randomUUID()}`,
		accessToken,
		'PUT',
		{
			amount: args.amount,
		},
	);
	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
