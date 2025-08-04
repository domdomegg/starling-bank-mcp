import {type z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {savingsGoalSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = savingsGoalSchema;

export const tool: Tool = {
	name: 'savings_goal_delete',
	description: 'Delete a savings goal',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'Delete savings goal',
		readOnlyHint: false,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	const result = await makeStarlingApiCall(
		`/api/v2/account/${args.accountUid}/savings-goals/${args.savingsGoalUid}`,
		accessToken,
		'DELETE',
	);
	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
