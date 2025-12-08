import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {feedItemUid} from './schemas.js';
import {feedItemUpdateOutput} from './output-schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';
import {jsonResult} from '../utils/response.js';

export function registerFeedItemSpendingCategoryUpdate(server: McpServer, config: Config): void {
	server.registerTool(
		'feed_item_spending_category_update',
		{
			title: 'Update transaction spending category',
			description: 'Update the spending category for a transaction',
			inputSchema: {
				...feedItemUid,
				spendingCategory: z.string().describe('The spending category to set'),
			},
			outputSchema: feedItemUpdateOutput,
			annotations: {
				readOnlyHint: false,
			},
		},
		async ({accountUid, categoryUid, feedItemUid, spendingCategory}) => {
			const result = await makeStarlingApiCall(
				`/api/v2/feed/account/${accountUid}/category/${categoryUid}/${feedItemUid}/spending-category`,
				config.accessToken,
				'PUT',
				{spendingCategory},
			);
			return jsonResult(feedItemUpdateOutput.parse(result));
		},
	);
}
