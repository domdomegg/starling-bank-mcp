import {z} from 'zod';
import {type Tool} from '@modelcontextprotocol/sdk/types.js';
import {feedItemSchema, getInputSchema} from '../utils/schemas.js';
import {makeStarlingApiCall, makeStarlingApiCallForBinary} from '../utils/starling-api.js';

// Function to detect image format from file headers
function detectImageFormat(buffer: Buffer): string {
	// Check for common image format signatures
	if (buffer.length >= 4) {
		// JPEG
		if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
			return 'image/jpeg';
		}

		// PNG
		if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
			return 'image/png';
		}

		// GIF
		if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
			return 'image/gif';
		}

		// WebP
		if (buffer.length >= 12
			&& buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46
			&& buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
			return 'image/webp';
		}

		// BMP
		if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
			return 'image/bmp';
		}

		// TIFF (little endian)
		if (buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2A && buffer[3] === 0x00) {
			return 'image/tiff';
		}

		// TIFF (big endian)
		if (buffer[0] === 0x4D && buffer[1] === 0x4D && buffer[2] === 0x00 && buffer[3] === 0x2A) {
			return 'image/tiff';
		}
	}

	// Default to JPEG if format cannot be determined
	return 'image/jpeg';
}

export const schema = feedItemSchema.extend({
	feedItemAttachmentUid: z.string().describe('The feed item attachment UID'),
});

export const tool: Tool = {
	name: 'feed_item_attachment_download',
	description: 'Download a specific attachment from a feed item (transaction). Returns the attachment as base64 encoded data.',
	inputSchema: getInputSchema(schema),
	annotations: {
		title: 'Download transaction attachment',
		readOnlyHint: true,
	},
};

export async function handler(args: z.infer<typeof schema>, accessToken: string) {
	// First, get the attachment metadata to determine the type
	const attachmentsList = await makeStarlingApiCall(
		`/api/v2/feed/account/${args.accountUid}/category/${args.categoryUid}/${args.feedItemUid}/attachments`,
		accessToken,
	) as {feedItemAttachments?: {feedItemAttachmentUid: string; attachmentType?: string; feedItemAttachmentType?: string}[]};

	// Find the specific attachment to get its type
	const attachment = attachmentsList.feedItemAttachments?.find((att) => att.feedItemAttachmentUid === args.feedItemAttachmentUid);

	// Download the attachment
	const arrayBuffer = await makeStarlingApiCallForBinary(
		`/api/v2/feed/account/${args.accountUid}/category/${args.categoryUid}/${args.feedItemUid}/attachments/${args.feedItemAttachmentUid}`,
		accessToken,
	);

	// Convert ArrayBuffer to Buffer and then to base64
	const buffer = Buffer.from(arrayBuffer);
	const base64Data = buffer.toString('base64');

	// Check if it's an image based on the attachment type
	const isImage = attachment?.attachmentType === 'image'
		|| attachment?.feedItemAttachmentType === 'IMAGE'
		|| attachment?.feedItemAttachmentType === 'IMAGE, PDF'; // Handle mixed types

	if (isImage) {
		// Detect image format from file headers
		const mimeType = detectImageFormat(buffer);

		// Return as image content
		return {
			content: [{
				type: 'image',
				data: base64Data,
				mimeType,
			}],
		};
	}

	// Return as text for PDFs and other file types
	return {
		content: [{
			type: 'text',
			text: `Attachment downloaded successfully (${attachment?.attachmentType || 'unknown type'}). Base64 data:\n${base64Data}`,
		}],
	};
}
