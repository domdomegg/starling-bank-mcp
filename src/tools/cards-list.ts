import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';
import {jsonResult} from '../utils/response.js';

const card = z.object({
	cardUid: z.string(),
	publicToken: z.string(),
	enabled: z.boolean(),
	walletNotificationEnabled: z.boolean(),
	posEnabled: z.boolean(),
	atmEnabled: z.boolean(),
	onlineEnabled: z.boolean(),
	mobileWalletEnabled: z.boolean(),
	gamblingEnabled: z.boolean(),
	magStripeEnabled: z.boolean(),
	cancelled: z.boolean(),
	activationRequested: z.boolean(),
	activated: z.boolean(),
	endOfCardNumber: z.string(),
	currencyFlags: z.array(z.object({
		currency: z.string().optional(),
		enabled: z.boolean().optional(),
	})),
	cardAssociationUid: z.string(),
	gamblingToBeEnabledAt: z.string().optional(),
});

const outputSchema = z.object({
	cards: z.array(card),
});

export function registerCardsList(server: McpServer, config: Config): void {
	server.registerTool(
		'cards_list',
		{
			title: 'List all cards',
			description: 'Get all the cards for an account holder',
			inputSchema: {},
			outputSchema,
			annotations: {
				readOnlyHint: true,
			},
		},
		async () => {
			const result = await makeStarlingApiCall('/api/v2/cards', config.accessToken);
			return jsonResult(outputSchema.parse(result));
		},
	);
}
