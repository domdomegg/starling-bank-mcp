// Shared Zod schemas for Starling Bank API tools
import {z} from 'zod';
import {zodToJsonSchema} from 'zod-to-json-schema';
import {type ListToolsResult} from '@modelcontextprotocol/sdk/types.js';

export const baseSchema = z.object({});

export const accountUidSchema = baseSchema.extend({
	accountUid: z.string().describe('The account UID'),
});

export const categoryUidSchema = accountUidSchema.extend({
	categoryUid: z.string().describe('The category UID (use default category for main account). Also known as spaceUid or savingsGoalUid in parts of the API.'),
});

export const cardUidSchema = baseSchema.extend({
	cardUid: z.string().describe('The card UID'),
});

export const cardControlSchema = cardUidSchema.extend({
	enabled: z.boolean().describe('Whether the control should be enabled (true) or disabled (false)'),
});

export const feedItemSchema = categoryUidSchema.extend({
	feedItemUid: z.string().describe('The feed item UID'),
});

export const updateSpendingCategorySchema = feedItemSchema.extend({
	spendingCategory: z.string().describe('The spending category to set'),
});

export const updateUserNoteSchema = feedItemSchema.extend({
	userNote: z.string().describe('The user note to set for this transaction'),
});

export const payeeSchema = baseSchema.extend({
	payeeUid: z.string().describe('The payee UID'),
});

export const createPaymentSchema = categoryUidSchema.extend({
	destinationPayeeAccountUid: z.string().describe('The UID of the payee account to pay'),
	reference: z.string().describe('Payment reference'),
	amount: z.object({
		currency: z.string().describe('Currency code (e.g., GBP)'),
		minorUnits: z.number().describe('Amount in minor units (e.g., pence)'),
	}),
});

export const savingsGoalSchema = accountUidSchema.extend({
	savingsGoalUid: z.string().describe('The savings goal UID'),
});

export const createSavingsGoalSchema = accountUidSchema.extend({
	name: z.string().describe('Name of the savings goal'),
	currency: z.string().describe('Currency code (e.g., GBP)'),
	target: z.object({
		currency: z.string().describe('Currency code (e.g., GBP)'),
		minorUnits: z.number().describe('Target amount in minor units (e.g., pence)'),
	}).optional().describe('Target amount for the savings goal'),
});

export const savingsGoalTransferSchema = savingsGoalSchema.extend({
	amount: z.object({
		currency: z.string().describe('Currency code (e.g., GBP)'),
		minorUnits: z.number().describe('Amount in minor units (e.g., pence)'),
	}),
});

// Helper function to convert Zod schema to MCP input schema
export const getInputSchema = (zodSchema: z.ZodType<object>): ListToolsResult['tools'][0]['inputSchema'] => {
	const jsonSchema = zodToJsonSchema(zodSchema);
	if (!('type' in jsonSchema) || jsonSchema.type !== 'object') {
		throw new Error(`Invalid input schema: expected an object but got ${'type' in jsonSchema ? String(jsonSchema.type) : 'no type'}`);
	}

	return {...jsonSchema, type: 'object'};
};
