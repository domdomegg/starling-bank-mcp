import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {feedItemUid} from './schemas.js';
import {makeStarlingApiCall} from '../utils/starling-api.js';
import {jsonResult} from '../utils/response.js';

const currencyAndAmount = z.object({
	currency: z.string(),
	minorUnits: z.number(),
});

const feedItemAttachment = z.object({
	feedItemUid: z.string().optional(),
	feedItemAttachmentUid: z.string().optional(),
	attachmentType: z.string().optional(),
	feedItemAttachmentType: z.string().optional(),
});

const outputSchema = z.object({
	feedItemUid: z.string().optional(),
	categoryUid: z.string().optional(),
	amount: currencyAndAmount.optional(),
	sourceAmount: currencyAndAmount.optional(),
	direction: z.string().optional(),
	updatedAt: z.string().optional(),
	transactionTime: z.string().optional(),
	settlementTime: z.string().optional(),
	source: z.string().optional(),
	sourceSubType: z.string().optional(),
	status: z.string().optional(),
	transactingApplicationUserUid: z.string().optional(),
	counterPartyType: z.string().optional(),
	counterPartyUid: z.string().optional(),
	counterPartyName: z.string().optional(),
	counterPartySubEntityUid: z.string().optional(),
	counterPartySubEntityName: z.string().optional(),
	counterPartySubEntityIdentifier: z.string().optional(),
	counterPartySubEntitySubIdentifier: z.string().optional(),
	exchangeRate: z.number().optional(),
	totalFees: z.number().optional(),
	totalFeeAmount: currencyAndAmount.optional(),
	reference: z.string().optional(),
	country: z.string().optional(),
	spendingCategory: z.string().optional(),
	userNote: z.string().optional(),
	hasAttachment: z.boolean().optional(),
	hasReceipt: z.boolean().optional(),
	attachments: z.array(feedItemAttachment),
});

export function registerFeedItemGet(server: McpServer, config: Config): void {
	server.registerTool(
		'feed_item_get',
		{
			title: 'Get transaction details',
			description: 'Get details of a specific feed item (transaction) including any attachments',
			inputSchema: {
				...feedItemUid,
			},
			outputSchema,
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({accountUid, categoryUid, feedItemUid}) => {
			// Get the feed item details
			const feedItem = await makeStarlingApiCall(
				`/api/v2/feed/account/${accountUid}/category/${categoryUid}/${feedItemUid}`,
				config.accessToken,
			);

			// Get the attachments for this feed item
			let attachments: {feedItemAttachments?: unknown[]} = {feedItemAttachments: []};
			try {
				attachments = await makeStarlingApiCall(
					`/api/v2/feed/account/${accountUid}/category/${categoryUid}/${feedItemUid}/attachments`,
					config.accessToken,
				) as {feedItemAttachments?: unknown[]};
			} catch {
				// If attachments endpoint fails, continue without attachments
				attachments = {feedItemAttachments: []};
			}

			// Combine the results
			const result = {
				...(feedItem as Record<string, unknown>),
				attachments: attachments.feedItemAttachments || [],
			};

			return jsonResult(outputSchema.parse(result));
		},
	);
}
