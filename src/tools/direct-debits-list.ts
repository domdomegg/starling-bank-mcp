import {type z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {accountUidSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = accountUidSchema;

export const tool: Tool = {
	name: 'direct_debits_list',
	description: 'Get all direct debit mandates for an account',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'List direct debits',
		readOnlyHint: true,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	const result = await makeStarlingApiCall(`/api/v2/direct-debit/mandates/account/${args.accountUid}`, accessToken);
	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
