import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {cardUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';

export function registerCardLockUpdate(server: McpServer, config: Config): void {
	server.registerTool(
		'card_lock_update',
		{
			title: 'Lock or unlock card',
			description: 'Enable or disable (lock/unlock) a card',
			inputSchema: {
				...cardUid,
				enabled: z.boolean().describe('Whether the card should be enabled (true) or disabled (false)'),
			},
			annotations: {
				readOnlyHint: false,
			},
		},
		async ({cardUid, enabled}) => {
			const result = await makeStarlingApiCall(
				`/api/v2/cards/${cardUid}/controls/enabled`,
				config.accessToken,
				'PUT',
				{enabled},
			);
			return {
				content: [{type: 'text' as const, text: JSON.stringify(result, null, 2)}],
			};
		},
	);
}
