import {type z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {baseSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = baseSchema;

export const tool: Tool = {
	name: 'account_holder_get',
	description: 'Get detailed information about the logged in account holder including name, address, and other personal details.',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'Get account holder details',
		readOnlyHint: true,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	try {
		const [basicInfo, nameInfo, individualInfo] = await Promise.all([
			makeStarlingApiCall('/api/v2/account-holder', accessToken),
			makeStarlingApiCall('/api/v2/account-holder/name', accessToken),
			makeStarlingApiCall('/api/v2/account-holder/individual', accessToken),
		]);

		const combined = {
			basicInfo,
			accountHolderName: nameInfo,
			individualDetails: individualInfo,
		};

		return {
			content: [{type: 'text', text: JSON.stringify(combined, null, 2)}],
		};
	} catch (error) {
		return {
			content: [{type: 'text', text: `Error fetching account holder details: ${String(error)}`}],
		};
	}
}
