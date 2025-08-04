import {type z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {updateSpendingCategorySchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = updateSpendingCategorySchema;

export const tool: Tool = {
	name: 'feed_item_spending_category_update',
	description: 'Update the spending category for a transaction',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'Update transaction spending category',
		readOnlyHint: false,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	const result = await makeStarlingApiCall(
		`/api/v2/feed/account/${args.accountUid}/category/${args.categoryUid}/${args.feedItemUid}/spending-category`,
		accessToken,
		'PUT',
		{spendingCategory: args.spendingCategory},
	);
	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
