import {type z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {accountUidSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = accountUidSchema;

export const tool: Tool = {
	name: 'account_balance_get',
	description: 'Get the balance for a specific account. Shows both cleared balance (settled transactions) and effective balance (including pending transactions).',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'Get account balance',
		readOnlyHint: true,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	const result = await makeStarlingApiCall(`/api/v2/accounts/${args.accountUid}/balance`, accessToken);
	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
