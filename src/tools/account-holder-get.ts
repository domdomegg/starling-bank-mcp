import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';
import {jsonResult} from '../utils/response.js';

const individual = z.object({
	title: z.string().optional(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	dateOfBirth: z.string().optional(),
	email: z.string().optional(),
	phone: z.string().optional(),
});

const outputSchema = z.object({
	accountHolder: z.object({
		accountHolderUid: z.string().optional(),
		accountHolderType: z.string().optional(),
	}).optional(),
	individual: individual.optional(),
	business: z.object({
		companyName: z.string().optional(),
		companyType: z.string().optional(),
		companyCategory: z.string().optional(),
		companySubCategory: z.string().optional(),
		companyRegistrationNumber: z.string().optional(),
		email: z.string().optional(),
		phone: z.string().optional(),
	}).optional(),
	jointAccount: z.object({
		accountHolderUid: z.string().optional(),
		personOne: individual.optional(),
		personTwo: individual.optional(),
	}).optional(),
	accountHolderName: z.object({
		accountHolderName: z.string().optional(),
	}).optional(),
});

export function registerAccountHolderGet(server: McpServer, config: Config): void {
	server.registerTool(
		'account_holder_get',
		{
			title: 'Get account holder details',
			description: 'Get detailed information about the logged in account holder including name, address, and other personal details.',
			inputSchema: {},
			outputSchema,
			annotations: {
				readOnlyHint: true,
			},
		},
		async () => {
			const [basicInfo, nameInfo, individualInfo] = await Promise.all([
				makeStarlingApiCall('/api/v2/account-holder', config.accessToken),
				makeStarlingApiCall('/api/v2/account-holder/name', config.accessToken),
				makeStarlingApiCall('/api/v2/account-holder/individual', config.accessToken),
			]);

			const combined = {
				accountHolder: basicInfo,
				individual: individualInfo,
				accountHolderName: nameInfo,
			};

			return jsonResult(outputSchema.loose().parse(combined));
		},
	);
}
