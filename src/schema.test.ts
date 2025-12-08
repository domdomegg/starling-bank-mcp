/**
 * Tests against Prism mock server to validate output schemas match OpenAPI spec.
 */
import {spawn, type ChildProcess} from 'node:child_process';
import {writeFileSync, existsSync} from 'node:fs';
import {
	describe, test, expect, beforeAll, afterAll,
} from 'vitest';
import {z} from 'zod';
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js';
import type {JSONRPCMessage, JSONRPCRequest, JSONRPCResponse} from '@modelcontextprotocol/sdk/types.js';
import {createServer} from './index.js';

const OPENAPI_URL = 'https://api.starlingbank.com/api/openapi.json';
const OPENAPI_PATH = 'openapi.json';
const TOKEN = process.env.STARLING_BANK_ACCESS_TOKEN || 'test-token';

// Test UUIDs from OpenAPI examples
const accountUid = 'bbccbbcc-bbcc-bbcc-bbcc-bbccbbccbbcc';
const categoryUid = 'ccddccdd-ccdd-ccdd-ccdd-ccddccddccdd';

let prism: ChildProcess | null = null;
let callTool: (name: string, args?: Record<string, unknown>) => Promise<unknown>;
let closeServer: () => Promise<void>;

describe('Output schema validation', () => {
	beforeAll(async () => {
		// Download OpenAPI spec if not cached
		if (!existsSync(OPENAPI_PATH)) {
			const response = await fetch(OPENAPI_URL);
			const spec = await response.text();
			writeFileSync(OPENAPI_PATH, spec);
		}

		// Start Prism mock server
		prism = spawn('npx', ['prism', 'mock', OPENAPI_PATH, '-p', '4010'], {
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

		// Set up MCP server with InMemoryTransport
		const server = createServer({accessToken: TOKEN});
		const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
		await server.connect(serverTransport);

		callTool = async (name: string, args: Record<string, unknown> = {}) => {
			const request: JSONRPCRequest = {
				jsonrpc: '2.0',
				id: Math.random().toString(),
				method: 'tools/call',
				params: {name, arguments: args},
			};

			return new Promise((resolve, reject) => {
				clientTransport.onmessage = (response: JSONRPCMessage) => {
					const typed = response as JSONRPCResponse;
					if ('result' in typed) {
						resolve(typed.result);
					} else {
						reject(new Error('No result in response'));
					}
				};

				clientTransport.send(request).catch(reject);
			});
		};

		closeServer = async () => {
			await server.close();
		};
	});

	afterAll(async () => {
		prism?.kill();
		await closeServer?.();
	});

	test('accounts_list', async () => {
		const result = await callTool('accounts_list') as {structuredContent?: unknown};
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
		expect(result.structuredContent).toBeDefined();
		expect(() => schema.parse(result.structuredContent)).not.toThrow();
	});

	test('account_balance_get', async () => {
		const result = await callTool('account_balance_get', {accountUid}) as {structuredContent?: unknown};
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
		expect(result.structuredContent).toBeDefined();
		expect(() => schema.parse(result.structuredContent)).not.toThrow();
	});

	test('account_identifiers_get', async () => {
		const result = await callTool('account_identifiers_get', {accountUid}) as {structuredContent?: unknown};
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
		expect(result.structuredContent).toBeDefined();
		expect(() => schema.parse(result.structuredContent)).not.toThrow();
	});

	test('payees_list', async () => {
		const result = await callTool('payees_list') as {structuredContent?: unknown};
		const schema = z.object({
			payees: z.array(z.object({
				payeeUid: z.string(),
				payeeName: z.string(),
				payeeType: z.string(),
			}).loose()),
		});
		expect(result.structuredContent).toBeDefined();
		expect(() => schema.parse(result.structuredContent)).not.toThrow();
	});

	test('cards_list', async () => {
		const result = await callTool('cards_list') as {structuredContent?: unknown};
		const schema = z.object({
			cards: z.array(z.object({
				cardUid: z.string(),
				enabled: z.boolean(),
			}).loose()),
		});
		expect(result.structuredContent).toBeDefined();
		expect(() => schema.parse(result.structuredContent)).not.toThrow();
	});

	test('direct_debits_list', async () => {
		const result = await callTool('direct_debits_list', {accountUid}) as {structuredContent?: unknown};
		const schema = z.object({
			mandates: z.array(z.object({}).loose()),
		});
		expect(result.structuredContent).toBeDefined();
		expect(() => schema.parse(result.structuredContent)).not.toThrow();
	});

	test('standing_orders_list', async () => {
		const result = await callTool('standing_orders_list', {accountUid, categoryUid}) as {structuredContent?: unknown};
		const schema = z.object({
			standingOrders: z.array(z.object({}).loose()),
		});
		expect(result.structuredContent).toBeDefined();
		expect(() => schema.parse(result.structuredContent)).not.toThrow();
	});

	test('savings_goals_list', async () => {
		const result = await callTool('savings_goals_list', {accountUid}) as {structuredContent?: unknown};
		const schema = z.object({
			savingsGoalList: z.array(z.object({
				state: z.string(),
			}).loose()),
		});
		expect(result.structuredContent).toBeDefined();
		expect(() => schema.parse(result.structuredContent)).not.toThrow();
	});

	test('transactions_list', async () => {
		const result = await callTool('transactions_list', {
			accountUid,
			categoryUid,
			minTransactionTimestamp: '2024-01-01T00:00:00.000Z',
			maxTransactionTimestamp: '2024-12-31T23:59:59.999Z',
		}) as {structuredContent?: unknown};
		const schema = z.object({
			feedItems: z.array(z.object({}).loose()),
		});
		expect(result.structuredContent).toBeDefined();
		expect(() => schema.parse(result.structuredContent)).not.toThrow();
	});
});
