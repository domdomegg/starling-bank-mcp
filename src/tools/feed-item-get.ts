import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {feedItemUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export function registerFeedItemGet(server: McpServer, config: Config): void {
	server.registerTool(
		'feed_item_get',
		{
			title: 'Get transaction details',
			description: 'Get details of a specific feed item (transaction) including any attachments',
			inputSchema: {
				...feedItemUid,
			},
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({accountUid, categoryUid, feedItemUid}) => {
			// Get the feed item details
			const feedItem = await makeStarlingApiCall(
				`/api/v2/feed/account/${accountUid}/category/${categoryUid}/${feedItemUid}`,
				config.accessToken,
			);

			// Get the attachments for this feed item
			let attachments: {feedItemAttachments?: unknown[]} = {feedItemAttachments: []};
			try {
				attachments = await makeStarlingApiCall(
					`/api/v2/feed/account/${accountUid}/category/${categoryUid}/${feedItemUid}/attachments`,
					config.accessToken,
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
				content: [{type: 'text' as const, text: JSON.stringify(result, null, 2)}],
			};
		},
	);
}
