import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {accountUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';
import {jsonResult} from '../utils/response.js';

const currencyAndAmount = z.object({
	currency: z.string(),
	minorUnits: z.number(),
});

const directDebitMandate = z.object({
	uid: z.string().optional(),
	reference: z.string().optional(),
	status: z.string().optional(),
	source: z.string().optional(),
	created: z.string().optional(),
	cancelled: z.string().optional(),
	nextDate: z.string().optional(),
	lastDate: z.string().optional(),
	originatorName: z.string().optional(),
	originatorUid: z.string().optional(),
	merchantUid: z.string().optional(),
	lastPayment: z.object({
		lastDate: z.string().optional(),
		lastAmount: currencyAndAmount.optional(),
	}).optional(),
	accountUid: z.string().optional(),
	categoryUid: z.string().optional(),
});

const outputSchema = z.object({
	mandates: z.array(directDebitMandate),
});

export function registerDirectDebitsList(server: McpServer, config: Config): void {
	server.registerTool(
		'direct_debits_list',
		{
			title: 'List direct debits',
			description: 'Get all direct debit mandates for an account',
			inputSchema: {
				...accountUid,
			},
			outputSchema,
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({accountUid}) => {
			const result = await makeStarlingApiCall(`/api/v2/direct-debit/mandates/account/${accountUid}`, config.accessToken);
			return jsonResult(outputSchema.parse(result));
		},
	);
}
