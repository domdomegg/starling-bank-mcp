/**
 * Shared output schemas used by multiple tools.
 */
import {z} from 'zod';

// savings_goal_create / savings_goal_update
export const createOrUpdateSavingsGoalOutput = z.object({
	savingsGoalUid: z.string().optional(),
	success: z.boolean().optional(),
});

// savings_goal_deposit / savings_goal_withdraw
export const savingsGoalTransferOutput = z.object({
	transferUid: z.string(),
	success: z.boolean().optional(),
});

// feed_item_spending_category_update / feed_item_note_update
export const feedItemUpdateOutput = z.object({
	success: z.boolean().optional(),
});
