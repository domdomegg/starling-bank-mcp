import {type z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {accountUidSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = accountUidSchema;

export const tool: Tool = {
	name: 'savings_goals_list',
	description: 'Get all savings goals for an account',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'List savings goals',
		readOnlyHint: true,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	const result = await makeStarlingApiCall(`/api/v2/account/${args.accountUid}/savings-goals`, accessToken);
	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
