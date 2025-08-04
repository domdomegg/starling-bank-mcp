import {type z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {payeeSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = payeeSchema;

export const tool: Tool = {
	name: 'payee_delete',
	description: 'Delete a payee',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'Delete payee',
		readOnlyHint: false,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	const result = await makeStarlingApiCall(`/api/v2/payees/${args.payeeUid}`, accessToken, 'DELETE');
	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
