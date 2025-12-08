import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export function registerPayeeCreate(server: McpServer, config: Config): void {
	server.registerTool(
		'payee_create',
		{
			title: 'Create new payee',
			description: 'Create a new payee (person/company you can send payments to)',
			inputSchema: {
				payeeName: z.string().describe('Name of the payee'),
				phoneNumber: z.string().optional().describe('Phone number of the payee'),
				payeeType: z.enum(['INDIVIDUAL', 'BUSINESS']).describe('Type of payee'),
				accountIdentifier: z.string().describe('Account number or identifier'),
				bankIdentifier: z.string().describe('Sort code or bank identifier'),
				bankIdentifierType: z.enum(['SORT_CODE', 'SWIFT_BIC']).describe('Type of bank identifier'),
				countryCode: z.string().describe('Country code (e.g., GB)'),
			},
			annotations: {
				readOnlyHint: false,
			},
		},
		async ({payeeName, phoneNumber, payeeType, accountIdentifier, bankIdentifier, bankIdentifierType, countryCode}) => {
			const result = await makeStarlingApiCall('/api/v2/payees', config.accessToken, 'PUT', {
				payeeName,
				phoneNumber,
				payeeType,
				accounts: [{
					accountIdentifier,
					bankIdentifier,
					bankIdentifierType,
					countryCode,
				}],
			});
			return {
				content: [{type: 'text' as const, text: JSON.stringify(result, null, 2)}],
			};
		},
	);
}
