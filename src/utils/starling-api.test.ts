/**
 * Tests for response parsing, in particular the 204 No Content responses
 * returned by mutating endpoints.
 */
import {createServer, type Server} from 'node:http';
import type {AddressInfo} from 'node:net';
import {
	describe, test, expect, beforeAll, afterAll,
} from 'vitest';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
	server = createServer((req, res) => {
		switch (req.url ?? '') {
			// Mutating endpoints (spending-category / note updates, deletes)
			// respond 204 with no body and no content-type.
			case '/no-content': {
				res.writeHead(204);
				res.end();
				break;
			}

			// Some endpoints return 200 with an empty JSON body.
			case '/empty-json': {
				res.writeHead(200, {'content-type': 'application/json'});
				res.end('');
				break;
			}

			case '/json': {
				res.writeHead(200, {'content-type': 'application/json'});
				res.end(JSON.stringify({savingsGoalUid: 'abc', success: true}));
				break;
			}

			case '/text': {
				res.writeHead(200, {'content-type': 'text/plain'});
				res.end('some plain text');
				break;
			}

			default: {
				res.writeHead(404, {'content-type': 'application/json'});
				res.end(JSON.stringify({error: 'not found'}));
			}
		}
	});

	await new Promise<void>((resolve) => {
		server.listen(0, '127.0.0.1', resolve);
	});

	const {port} = server.address() as AddressInfo;
	baseUrl = `http://127.0.0.1:${port}`;
	process.env.STARLING_BANK_BASE_URL = baseUrl;
});

afterAll(async () => {
	await new Promise<void>((resolve, reject) => {
		server.close((error) => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
});

describe('makeStarlingApiCall response parsing', () => {
	test('returns a success object for 204 No Content', async () => {
		const {makeStarlingApiCall} = await import('./starling-api.js');

		const result = await makeStarlingApiCall('/no-content', 'test-token', 'PUT', {spendingCategory: 'EXPENSES'});

		// Must be an object: callers validate this against object output
		// schemas. Returning a bare string here made successful updates fail
		// validation and be reported as errors, despite having been applied.
		expect(result).toBeTypeOf('object');
		expect(result).toEqual({success: true, message: 'Operation completed successfully'});
	});

	test('returns a success object for an empty JSON body', async () => {
		const {makeStarlingApiCall} = await import('./starling-api.js');

		const result = await makeStarlingApiCall('/empty-json', 'test-token');

		expect(result).toEqual({success: true, message: 'Operation completed successfully'});
	});

	test('parses a JSON body', async () => {
		const {makeStarlingApiCall} = await import('./starling-api.js');

		const result = await makeStarlingApiCall('/json', 'test-token');

		expect(result).toEqual({savingsGoalUid: 'abc', success: true});
	});

	test('returns non-empty non-JSON bodies as text', async () => {
		const {makeStarlingApiCall} = await import('./starling-api.js');

		const result = await makeStarlingApiCall('/text', 'test-token');

		expect(result).toBe('some plain text');
	});

	test('throws on error responses', async () => {
		const {makeStarlingApiCall} = await import('./starling-api.js');

		await expect(makeStarlingApiCall('/missing', 'test-token')).rejects.toThrow('Starling API error: 404');
	});
});
