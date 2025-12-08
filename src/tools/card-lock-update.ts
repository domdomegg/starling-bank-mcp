import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {cardUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';
import {jsonResult} from '../utils/response.js';

const outputSchema = z.object({
	enabled: z.boolean().optional(),
});

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
			outputSchema,
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
			return jsonResult(outputSchema.parse(result));
		},
	);
}
