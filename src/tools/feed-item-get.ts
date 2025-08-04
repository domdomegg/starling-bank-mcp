import {type z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {feedItemSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = feedItemSchema;

export const tool: Tool = {
	name: 'feed_item_get',
	description: 'Get details of a specific feed item (transaction) including any attachments',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'Get transaction details',
		readOnlyHint: true,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	// Get the feed item details
	const feedItem = await makeStarlingApiCall(
		`/api/v2/feed/account/${args.accountUid}/category/${args.categoryUid}/${args.feedItemUid}`,
		accessToken,
	);

	// Get the attachments for this feed item
	let attachments: {feedItemAttachments?: unknown[]} = {feedItemAttachments: []};
	try {
		attachments = await makeStarlingApiCall(
			`/api/v2/feed/account/${args.accountUid}/category/${args.categoryUid}/${args.feedItemUid}/attachments`,
			accessToken,
		) as {feedItemAttachments?: unknown[]};
	} catch {
		// If attachments endpoint fails, continue without attachments
		attachments = {feedItemAttachments: []};
	}

	// Combine the results
	const result = {
		...(feedItem as Record<string, unknown>),
		attachments: attachments.feedItemAttachments || [],
	};

	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
