import {z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {createSavingsGoalSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = createSavingsGoalSchema.extend({
	savingsGoalUid: z.string().describe('The savings goal UID'),
});

export const tool: Tool = {
	name: 'savings_goal_update',
	description: 'Update an existing savings goal',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'Update savings goal',
		readOnlyHint: false,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	const result = await makeStarlingApiCall(
		`/api/v2/account/${args.accountUid}/savings-goals/${args.savingsGoalUid}`,
		accessToken,
		'PUT',
		{
			name: args.name,
			currency: args.currency,
			target: args.target,
		},
	);
	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
