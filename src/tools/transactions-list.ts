import {z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {categoryUidSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = categoryUidSchema.extend({
	minTransactionTimestamp: z.string().describe('Start date for transactions (ISO 8601 format, e.g., 2024-01-01T00:00:00.000Z)'),
	maxTransactionTimestamp: z.string().describe('End date for transactions (ISO 8601 format, e.g., 2024-12-31T23:59:59.999Z)'),
});

export const tool: Tool = {
	name: 'transactions_list',
	description: 'Get transaction feed items for an account category. Use the default category UID for main account transactions.',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'List transactions',
		readOnlyHint: true,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	let endpoint = `/api/v2/feed/account/${args.accountUid}/category/${args.categoryUid}`;

	if (args.minTransactionTimestamp || args.maxTransactionTimestamp) {
		endpoint += '/transactions-between';
		const params = new URLSearchParams();

		if (args.minTransactionTimestamp) {
			params.append('minTransactionTimestamp', args.minTransactionTimestamp);
		}

		if (args.maxTransactionTimestamp) {
			params.append('maxTransactionTimestamp', args.maxTransactionTimestamp);
		}

		endpoint += `?${params.toString()}`;
	}

	const result = await makeStarlingApiCall(endpoint, accessToken);
	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
