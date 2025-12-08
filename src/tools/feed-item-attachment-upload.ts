import {z} from 'zod';
import {readFileSync} from 'fs';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {feedItemUid} from './schemas.js';
import {makeStarlingApiCallWithBinary} from '../utils/starling-api.js';
import {jsonResult} from '../utils/response.js';

const outputSchema = z.object({
	feedItemAttachmentUid: z.string().optional(),
});

export function registerFeedItemAttachmentUpload(server: McpServer, config: Config): void {
	server.registerTool(
		'feed_item_attachment_upload',
		{
			title: 'Upload transaction attachment',
			description: 'Upload an attachment to a feed item (transaction). Provide either base64 encoded attachment data or a file path (recommended).',
			inputSchema: {
				...feedItemUid,
				contentType: z.string().optional().describe('Content type of the attachment (e.g., image/jpeg, application/pdf)'),
				filePath: z.string().optional().describe('Option 1: Path to file on disk (recommended)'),
				attachmentData: z.string().optional().describe('Option 2: Base64 encoded attachment data'),
			},
			outputSchema,
			annotations: {
				readOnlyHint: false,
			},
		},
		async ({accountUid, categoryUid, feedItemUid, contentType, filePath, attachmentData}) => {
			let binaryData: Buffer;

			if (filePath) {
				// Read file from disk
				try {
					binaryData = readFileSync(filePath);
				} catch (error) {
					throw new Error(`Failed to read file from path "${filePath}": ${error instanceof Error ? error.message : String(error)}`);
				}
			} else if (attachmentData) {
				// Convert base64 to buffer
				try {
					binaryData = Buffer.from(attachmentData, 'base64');
				} catch (error) {
					throw new Error(`Failed to decode base64 attachment data: ${error instanceof Error ? error.message : String(error)}`);
				}
			} else {
				throw new Error('Either filePath or attachmentData must be provided');
			}

			const result = await makeStarlingApiCallWithBinary(
				`/api/v2/feed/account/${accountUid}/category/${categoryUid}/${feedItemUid}/attachments`,
				config.accessToken,
				binaryData,
				contentType,
			);

			return jsonResult(outputSchema.parse(result));
		},
	);
}
