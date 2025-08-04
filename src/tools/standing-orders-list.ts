import {type z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {categoryUidSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = categoryUidSchema;

export const tool: Tool = {
	name: 'standing_orders_list',
	description: 'Get all standing orders for an account category',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'List standing orders',
		readOnlyHint: true,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	const result = await makeStarlingApiCall(`/api/v2/payments/local/account/${args.accountUid}/category/${args.categoryUid}/standing-orders`, accessToken);
	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
