import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {categoryUid, amount} from './schemas.js';
import {makeSignedStarlingApiCall} from '../utils/starling-api.js';
import {randomUUID} from 'node:crypto';

export function registerPaymentCreate(server: McpServer, config: Config): void {
	server.registerTool(
		'payment_create',
		{
			title: 'Create payment',
			description: 'Create a payment to an existing payee',
			inputSchema: {
				...categoryUid,
				destinationPayeeAccountUid: z.string().describe('The UID of the payee account to pay'),
				reference: z.string().describe('Payment reference'),
				amount,
			},
			annotations: {
				readOnlyHint: false,
			},
		},
		async ({accountUid, categoryUid, destinationPayeeAccountUid, reference, amount}) => {
			const result = await makeSignedStarlingApiCall(
				`/api/v2/payments/local/account/${accountUid}/category/${categoryUid}`,
				config.accessToken,
				'PUT',
				{
					destinationPayeeAccountUid,
					reference,
					amount,
					externalIdentifier: randomUUID(),
				},
			);
			return {
				content: [{type: 'text' as const, text: JSON.stringify(result, null, 2)}],
			};
		},
	);
}
