import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';
import {jsonResult} from '../utils/response.js';

const payeeAccount = z.object({
	payeeAccountUid: z.string().optional(),
	payeeChannelType: z.string().optional(),
	description: z.string().optional(),
	defaultAccount: z.boolean().optional(),
	countryCode: z.string().optional(),
	accountIdentifier: z.string().optional(),
	bankIdentifier: z.string().optional(),
	bankIdentifierType: z.string().optional(),
	secondaryIdentifier: z.string().optional(),
	lastReferences: z.array(z.string()).optional(),
});

const payee = z.object({
	payeeUid: z.string(),
	payeeName: z.string(),
	phoneNumber: z.string().optional(),
	payeeType: z.string(),
	firstName: z.string().optional(),
	middleName: z.string().optional(),
	lastName: z.string().optional(),
	businessName: z.string().optional(),
	dateOfBirth: z.string().optional(),
	accounts: z.array(payeeAccount).optional(),
});

const outputSchema = z.object({
	payees: z.array(payee),
});

export function registerPayeesList(server: McpServer, config: Config): void {
	server.registerTool(
		'payees_list',
		{
			title: 'List all payees',
			description: 'Get all payees (people/companies you can send payments to) for the account holder.',
			inputSchema: {},
			outputSchema,
			annotations: {
				readOnlyHint: true,
			},
		},
		async () => {
			const result = await makeStarlingApiCall('/api/v2/payees', config.accessToken);
			return jsonResult(outputSchema.parse(result));
		},
	);
}
