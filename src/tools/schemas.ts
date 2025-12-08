import {z} from 'zod';

// Common field schemas - spread into inputSchema objects
export const accountUid = {
	accountUid: z.string().describe('The account UID'),
};

export const categoryUid = {
	...accountUid,
	categoryUid: z.string().describe('The category UID (use default category for main account)'),
};

export const feedItemUid = {
	...categoryUid,
	feedItemUid: z.string().describe('The feed item UID'),
};

export const savingsGoalUid = {
	...accountUid,
	savingsGoalUid: z.string().describe('The savings goal UID'),
};

export const cardUid = {
	cardUid: z.string().describe('The card UID'),
};

export const payeeUid = {
	payeeUid: z.string().describe('The payee UID'),
};

export const amount = z.object({
	currency: z.string().describe('Currency code (e.g., GBP)'),
	minorUnits: z.number().describe('Amount in minor units (e.g., pence)'),
});
