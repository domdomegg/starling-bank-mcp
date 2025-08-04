import {z} from 'zod';
import {readFileSync} from 'fs';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {feedItemSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCallWithBinary} from '../utils/starling-api.js';

export const schema = feedItemSchema.extend({
	contentType: z.string().optional().describe('Content type of the attachment (e.g., image/jpeg, application/pdf)'),
	filePath: z.string().optional().describe('Option 1: Path to file on disk (recommended)'),
	attachmentData: z.string().optional().describe('Option 2: Base64 encoded attachment data'),
});

export const tool: Tool = {
	name: 'feed_item_attachment_upload',
	description: 'Upload an attachment to a feed item (transaction). Provide either base64 encoded attachment data or a file path (recommended).',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'Upload transaction attachment',
		readOnlyHint: false,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	let binaryData: Buffer;
	let source: string;

	if (args.filePath) {
		// Read file from disk
		try {
			binaryData = readFileSync(args.filePath);
			source = `file: ${args.filePath}`;
		} catch (error) {
			throw new Error(`Failed to read file from path "${args.filePath}": ${error instanceof Error ? error.message : String(error)}`);
		}
	} else if (args.attachmentData) {
		// Convert base64 to buffer
		try {
			binaryData = Buffer.from(args.attachmentData, 'base64');
			source = 'base64 data';
		} catch (error) {
			throw new Error(`Failed to decode base64 attachment data: ${error instanceof Error ? error.message : String(error)}`);
		}
	} else {
		throw new Error('Either filePath or attachmentData must be provided');
	}

	const result = await makeStarlingApiCallWithBinary(
		`/api/v2/feed/account/${args.accountUid}/category/${args.categoryUid}/${args.feedItemUid}/attachments`,
		accessToken,
		binaryData,
		args.contentType,
	);

	return {
		content: [{type: 'text', text: `Attachment uploaded successfully from ${source}. Attachment UID: ${JSON.stringify(result)}`}],
	};
}
