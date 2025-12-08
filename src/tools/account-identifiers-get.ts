import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {accountUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';
import {jsonResult} from '../utils/response.js';

const outputSchema = z.object({
	accountIdentifier: z.string().optional(),
	bankIdentifier: z.string().optional(),
	iban: z.string().optional(),
	bic: z.string().optional(),
	accountIdentifiers: z.array(z.object({
		identifierType: z.string().optional(),
		bankIdentifier: z.string().optional(),
		accountIdentifier: z.string().optional(),
	})).optional(),
});

export function registerAccountIdentifiersGet(server: McpServer, config: Config): void {
	server.registerTool(
		'account_identifiers_get',
		{
			title: 'Get account identifiers',
			description: 'Get an account\'s bank identifiers (sort code, account number, BIC, IBAN, etc.)',
			inputSchema: {
				...accountUid,
			},
			outputSchema,
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({accountUid}) => {
			const result = await makeStarlingApiCall(`/api/v2/accounts/${accountUid}/identifiers`, config.accessToken);
			return jsonResult(outputSchema.parse(result));
		},
	);
}
