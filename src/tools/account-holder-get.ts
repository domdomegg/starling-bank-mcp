import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export function registerAccountHolderGet(server: McpServer, config: Config): void {
	server.registerTool(
		'account_holder_get',
		{
			title: 'Get account holder details',
			description: 'Get detailed information about the logged in account holder including name, address, and other personal details.',
			inputSchema: {},
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
				basicInfo,
				accountHolderName: nameInfo,
				individualDetails: individualInfo,
			};

			return {
				content: [{type: 'text' as const, text: JSON.stringify(combined, null, 2)}],
			};
		},
	);
}
