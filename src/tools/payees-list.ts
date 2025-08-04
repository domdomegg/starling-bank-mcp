import {type z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {baseSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = baseSchema;

export const tool: Tool = {
	name: 'payees_list',
	description: 'Get all payees (people/companies you can send payments to) for the account holder.',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'List all payees',
		readOnlyHint: true,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	const result = await makeStarlingApiCall('/api/v2/payees', accessToken);
	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
