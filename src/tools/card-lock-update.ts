import {type z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {cardControlSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = cardControlSchema;

export const tool: Tool = {
	name: 'card_lock_update',
	description: 'Enable or disable (lock/unlock) a card',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'Lock or unlock card',
		readOnlyHint: false,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	const result = await makeStarlingApiCall(
		`/api/v2/cards/${args.cardUid}/controls/enabled`,
		accessToken,
		'PUT',
		{enabled: args.enabled},
	);
	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
