import {z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {baseSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export const schema = baseSchema.extend({
	payeeName: z.string().describe('Name of the payee'),
	phoneNumber: z.string().optional().describe('Phone number of the payee'),
	payeeType: z.enum(['INDIVIDUAL', 'BUSINESS']).describe('Type of payee'),
	accountIdentifier: z.string().describe('Account number or identifier'),
	bankIdentifier: z.string().describe('Sort code or bank identifier'),
	bankIdentifierType: z.enum(['SORT_CODE', 'SWIFT_BIC']).describe('Type of bank identifier'),
	countryCode: z.string().describe('Country code (e.g., GB)'),
});

export const tool: Tool = {
	name: 'payee_create',
	description: 'Create a new payee (person/company you can send payments to)',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'Create new payee',
		readOnlyHint: false,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	const result = await makeStarlingApiCall('/api/v2/payees', accessToken, 'PUT', {
		payeeName: args.payeeName,
		phoneNumber: args.phoneNumber,
		payeeType: args.payeeType,
		accounts: [{
			accountIdentifier: args.accountIdentifier,
			bankIdentifier: args.bankIdentifier,
			bankIdentifierType: args.bankIdentifierType,
			countryCode: args.countryCode,
		}],
	});
	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
