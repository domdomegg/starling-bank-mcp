import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {categoryUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';
import {jsonResult} from '../utils/response.js';

const currencyAndAmount = z.object({
	currency: z.string(),
	minorUnits: z.number(),
});

const standingOrder = z.object({
	paymentOrderUid: z.string().optional(),
	amount: currencyAndAmount.optional(),
	reference: z.string().optional(),
	payeeUid: z.string().optional(),
	payeeAccountUid: z.string().optional(),
	standingOrderRecurrence: z.object({
		startDate: z.string().optional(),
		frequency: z.string().optional(),
		interval: z.number().optional(),
		count: z.number().optional(),
		untilDate: z.string().optional(),
	}).optional(),
	nextDate: z.string().optional(),
	cancelledAt: z.string().optional(),
	updatedAt: z.string().optional(),
	spendingCategory: z.string().optional(),
});

const outputSchema = z.object({
	standingOrders: z.array(standingOrder),
});

export function registerStandingOrdersList(server: McpServer, config: Config): void {
	server.registerTool(
		'standing_orders_list',
		{
			title: 'List standing orders',
			description: 'Get all standing orders for an account category',
			inputSchema: {
				...categoryUid,
			},
			outputSchema,
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({accountUid, categoryUid}) => {
			const result = await makeStarlingApiCall(`/api/v2/payments/local/account/${accountUid}/category/${categoryUid}/standing-orders`, config.accessToken);
			return jsonResult(outputSchema.parse(result));
		},
	);
}
