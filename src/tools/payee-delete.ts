import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {payeeUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export function registerPayeeDelete(server: McpServer, config: Config): void {
	server.registerTool(
		'payee_delete',
		{
			title: 'Delete payee',
			description: 'Delete a payee',
			inputSchema: {
				...payeeUid,
			},
			annotations: {
				readOnlyHint: false,
			},
		},
		async ({payeeUid}) => {
			const result = await makeStarlingApiCall(`/api/v2/payees/${payeeUid}`, config.accessToken, 'DELETE');
			return {
				content: [{type: 'text' as const, text: JSON.stringify(result, null, 2)}],
			};
		},
	);
}
