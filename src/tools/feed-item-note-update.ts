import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {feedItemUid} from './schemas.js';
import {feedItemUpdateOutput} from './output-schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';
import {jsonResult} from '../utils/response.js';

export function registerFeedItemNoteUpdate(server: McpServer, config: Config): void {
	server.registerTool(
		'feed_item_note_update',
		{
			title: 'Update transaction note',
			description: 'Update the user note for a transaction',
			inputSchema: {
				...feedItemUid,
				userNote: z.string().describe('The user note to set for this transaction'),
			},
			outputSchema: feedItemUpdateOutput,
			annotations: {
				readOnlyHint: false,
			},
		},
		async ({accountUid, categoryUid, feedItemUid, userNote}) => {
			const result = await makeStarlingApiCall(
				`/api/v2/feed/account/${accountUid}/category/${categoryUid}/${feedItemUid}/user-note`,
				config.accessToken,
				'PUT',
				{userNote},
			);
			return jsonResult(feedItemUpdateOutput.parse(result));
		},
	);
}
