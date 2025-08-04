import {type z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {baseSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = baseSchema;

export const tool: Tool = {
	name: 'accounts_list',
	description: 'Get all accounts associated with the logged in account holder. This is typically the first call to make to get account information. An account holder (e.g. a person or business) can have multiple accounts (e.g. a GBP and EUR account).',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'Get all accounts',
		readOnlyHint: true,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	const result = await makeStarlingApiCall('/api/v2/accounts', accessToken);
	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
