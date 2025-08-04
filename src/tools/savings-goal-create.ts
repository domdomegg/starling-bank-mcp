import {type z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {createSavingsGoalSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = createSavingsGoalSchema;

export const tool: Tool = {
	name: 'savings_goal_create',
	description: 'Create a new savings goal',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'Create savings goal',
		readOnlyHint: false,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	const result = await makeStarlingApiCall(
		`/api/v2/account/${args.accountUid}/savings-goals`,
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
