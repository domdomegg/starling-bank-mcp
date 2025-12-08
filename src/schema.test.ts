/**
 * Tests against Prism mock server to validate output schemas match OpenAPI spec.
 */
import {spawn, type ChildProcess} from 'node:child_process';
import {
	describe, test, expect, beforeAll, afterAll,
} from 'vitest';
import {z} from 'zod';
import {makeStarlingApiCall} from './utils/starling-api.js';

const TOKEN = process.env.STARLING_BANK_ACCESS_TOKEN || 'test-token';

// Test UUIDs from OpenAPI examples
const accountUid = 'bbccbbcc-bbcc-bbcc-bbcc-bbccbbccbbcc';
const categoryUid = 'ccddccdd-ccdd-ccdd-ccdd-ccddccddccdd';

let prism: ChildProcess | null = null;

describe('Output schema validation', () => {
	beforeAll(async () => {
		prism = spawn('npx', ['prism', 'mock', 'openapi.json', '-p', '4010'], {
			stdio: 'pipe',
		});

		await new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error('Prism startup timeout'));
			}, 10000);

			prism!.stdout?.on('data', (data: Buffer) => {
				if (data.toString().includes('Prism is listening')) {
					clearTimeout(timeout);
					resolve();
				}
			});

			prism!.on('error', reject);
		});
	});

	afterAll(() => {
		prism?.kill();
	});
	test('accounts_list schema', async () => {
		const result = await makeStarlingApiCall('/api/v2/accounts', TOKEN);
		const schema = z.object({
			accounts: z.array(z.object({
				accountUid: z.string(),
				accountType: z.string(),
				defaultCategory: z.string(),
				currency: z.string(),
				createdAt: z.string(),
				name: z.string(),
			})),
		});
		expect(() => schema.parse(result)).not.toThrow();
	});

	test('account_balance_get schema', async () => {
		const result = await makeStarlingApiCall(`/api/v2/accounts/${accountUid}/balance`, TOKEN);
		const amount = z.object({currency: z.string(), minorUnits: z.number()});
		const schema = z.object({
			clearedBalance: amount.optional(),
			effectiveBalance: amount.optional(),
			pendingTransactions: amount.optional(),
			acceptedOverdraft: amount.optional(),
			amount: amount.optional(),
			totalClearedBalance: amount.optional(),
			totalEffectiveBalance: amount.optional(),
		});
		expect(() => schema.parse(result)).not.toThrow();
	});

	test('account_identifiers_get schema', async () => {
		const result = await makeStarlingApiCall(`/api/v2/accounts/${accountUid}/identifiers`, TOKEN);
		const schema = z.object({
			accountIdentifier: z.string().optional(),
			bankIdentifier: z.string().optional(),
			iban: z.string().optional(),
			bic: z.string().optional(),
			accountIdentifiers: z.array(z.object({
				identifierType: z.string().optional(),
				bankIdentifier: z.string().optional(),
				accountIdentifier: z.string().optional(),
			})).optional(),
		});
		expect(() => schema.parse(result)).not.toThrow();
	});

	test('payees_list schema', async () => {
		const result = await makeStarlingApiCall('/api/v2/payees', TOKEN);
		const schema = z.object({
			payees: z.array(z.object({
				payeeUid: z.string(),
				payeeName: z.string(),
				payeeType: z.string(),
			}).loose()),
		});
		expect(() => schema.parse(result)).not.toThrow();
	});

	test('cards_list schema', async () => {
		const result = await makeStarlingApiCall('/api/v2/cards', TOKEN);
		const schema = z.object({
			cards: z.array(z.object({
				cardUid: z.string(),
				enabled: z.boolean(),
			}).loose()),
		});
		expect(() => schema.parse(result)).not.toThrow();
	});

	test('direct_debits_list schema', async () => {
		const result = await makeStarlingApiCall(`/api/v2/direct-debit/mandates/account/${accountUid}`, TOKEN);
		const schema = z.object({
			mandates: z.array(z.object({}).loose()),
		});
		expect(() => schema.parse(result)).not.toThrow();
	});

	test('standing_orders_list schema', async () => {
		const result = await makeStarlingApiCall(`/api/v2/payments/local/account/${accountUid}/category/${categoryUid}/standing-orders`, TOKEN);
		const schema = z.object({
			standingOrders: z.array(z.object({}).loose()),
		});
		expect(() => schema.parse(result)).not.toThrow();
	});

	test('savings_goals_list schema', async () => {
		const result = await makeStarlingApiCall(`/api/v2/account/${accountUid}/savings-goals`, TOKEN);
		const schema = z.object({
			savingsGoalList: z.array(z.object({
				state: z.string(),
			}).loose()),
		});
		expect(() => schema.parse(result)).not.toThrow();
	});

	test('transactions_list schema', async () => {
		const result = await makeStarlingApiCall(
			`/api/v2/feed/account/${accountUid}/category/${categoryUid}/transactions-between?minTransactionTimestamp=2024-01-01T00:00:00.000Z&maxTransactionTimestamp=2024-12-31T23:59:59.999Z`,
			TOKEN,
		);
		const schema = z.object({
			feedItems: z.array(z.object({}).loose()),
		});
		expect(() => schema.parse(result)).not.toThrow();
	});
});
