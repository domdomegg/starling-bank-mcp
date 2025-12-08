import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {categoryUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export function registerStandingOrdersList(server: McpServer, config: Config): void {
	server.registerTool(
		'standing_orders_list',
		{
			title: 'List standing orders',
			description: 'Get all standing orders for an account category',
			inputSchema: {
				...categoryUid,
			},
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({accountUid, categoryUid}) => {
			const result = await makeStarlingApiCall(`/api/v2/payments/local/account/${accountUid}/category/${categoryUid}/standing-orders`, config.accessToken);
			return {
				content: [{type: 'text' as const, text: JSON.stringify(result, null, 2)}],
			};
		},
	);
}
