import * as accountsList from './accounts-list.js';
import * as accountBalanceGet from './account-balance-get.js';
import * as transactionsList from './transactions-list.js';
import * as accountHolderGet from './account-holder-get.js';
import * as payeesList from './payees-list.js';
import * as accountIdentifiersGet from './account-identifiers-get.js';
import * as cardsList from './cards-list.js';
import * as cardLockUpdate from './card-lock-update.js';
import * as directDebitsList from './direct-debits-list.js';
import * as standingOrdersList from './standing-orders-list.js';
import * as feedItemGet from './feed-item-get.js';
import * as feedItemSpendingCategoryUpdate from './feed-item-spending-category-update.js';
import * as feedItemNoteUpdate from './feed-item-note-update.js';
import * as feedItemAttachmentUpload from './feed-item-attachment-upload.js';
import * as feedItemAttachmentDownload from './feed-item-attachment-download.js';
import * as paymentCreate from './payment-create.js';
import * as payeeCreate from './payee-create.js';
import * as payeeDelete from './payee-delete.js';
import * as savingsGoalsList from './savings-goals-list.js';
import * as savingsGoalCreate from './savings-goal-create.js';
import * as savingsGoalUpdate from './savings-goal-update.js';
import * as savingsGoalDelete from './savings-goal-delete.js';
import * as savingsGoalDeposit from './savings-goal-deposit.js';
import * as savingsGoalWithdraw from './savings-goal-withdraw.js';
import {type Result, type Tool} from '@modelcontextprotocol/sdk/types.js';
import type z from 'zod';

export type ToolModule<S extends z.ZodType = z.ZodType> = {
	tool: Tool;
	handler: (args: z.infer<S>, accessToken: string) => Promise<Result>;
	schema: S;
};

const toolModules = [
	accountsList,
	accountBalanceGet,
	transactionsList,
	accountHolderGet,
	payeesList,
	accountIdentifiersGet,
	cardsList,
	cardLockUpdate,
	directDebitsList,
	standingOrdersList,
	feedItemGet,
	feedItemSpendingCategoryUpdate,
	feedItemNoteUpdate,
	feedItemAttachmentUpload,
	feedItemAttachmentDownload,
	paymentCreate,
	payeeCreate,
	payeeDelete,
	savingsGoalsList,
	savingsGoalCreate,
	savingsGoalUpdate,
	savingsGoalDelete,
	savingsGoalDeposit,
	savingsGoalWithdraw,
];

export const tools: Record<string, ToolModule> = Object.fromEntries(toolModules.map((module) => [module.tool.name, module]));
