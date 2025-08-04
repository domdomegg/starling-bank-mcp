import {type z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {updateUserNoteSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = updateUserNoteSchema;

export const tool: Tool = {
	name: 'feed_item_note_update',
	description: 'Update the user note for a transaction',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'Update transaction note',
		readOnlyHint: false,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	const result = await makeStarlingApiCall(
		`/api/v2/feed/account/${args.accountUid}/category/${args.categoryUid}/${args.feedItemUid}/user-note`,
		accessToken,
		'PUT',
		{userNote: args.userNote},
	);
	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
