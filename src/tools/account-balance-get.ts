import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {accountUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';
import {jsonResult} from '../utils/response.js';

const signedCurrencyAndAmount = z.object({
	currency: z.string(),
	minorUnits: z.number(),
});

const outputSchema = z.object({
	clearedBalance: signedCurrencyAndAmount.optional(),
	effectiveBalance: signedCurrencyAndAmount.optional(),
	pendingTransactions: signedCurrencyAndAmount.optional(),
	acceptedOverdraft: signedCurrencyAndAmount.optional(),
	amount: signedCurrencyAndAmount.optional(),
	totalClearedBalance: signedCurrencyAndAmount.optional(),
	totalEffectiveBalance: signedCurrencyAndAmount.optional(),
});

export function registerAccountBalanceGet(server: McpServer, config: Config): void {
	server.registerTool(
		'account_balance_get',
		{
			title: 'Get account balance',
			description: 'Get the balance for a specific account. Shows both cleared balance (settled transactions) and effective balance (including pending transactions).',
			inputSchema: {
				...accountUid,
			},
			outputSchema,
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({accountUid}) => {
			const result = await makeStarlingApiCall(`/api/v2/accounts/${accountUid}/balance`, config.accessToken);
			return jsonResult(outputSchema.parse(result));
		},
	);
}
