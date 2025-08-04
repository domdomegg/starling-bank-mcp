import {type z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {createPaymentSchema, getInputSchema} from '../utils/schemas.js';
import {makeSignedStarlingApiCall} from '../utils/starling-api.js';
import {randomUUID} from 'node:crypto';

export const schema = createPaymentSchema;

export const tool: Tool = {
	name: 'payment_create',
	description: 'Create a payment to an existing payee',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'Create payment',
		readOnlyHint: false,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	const result = await makeSignedStarlingApiCall(
		`/api/v2/payments/local/account/${args.accountUid}/category/${args.categoryUid}`,
		accessToken,
		'PUT',
		{
			destinationPayeeAccountUid: args.destinationPayeeAccountUid,
			reference: args.reference,
			amount: args.amount,
			externalIdentifier: randomUUID(),
		},
	);
	return {
		content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
	};
}
