import {type z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {accountUidSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = accountUidSchema;

export const tool: Tool = {
	name: 'account_identifiers_get',
	description: 'Get an account\'s bank identifiers (sort code, account number, BIC, IBAN, etc.)',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'Get account identifiers',
		readOnlyHint: true,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	const result = await makeStarlingApiCall(`/api/v2/accounts/${args.accountUid}/identifiers`, accessToken);
	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
