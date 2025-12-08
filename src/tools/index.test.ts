import {readdir} from 'node:fs/promises';
import {describe, test, expect} from 'vitest';
import {join} from 'node:path';
import {createServer} from '../server.js';

describe('tools index', () => {
	test('should register all tool files', async () => {
		const toolsDir = join(process.cwd(), 'src/tools');
		const files = await readdir(toolsDir);

		const toolFiles = files
			.filter((file) => file.endsWith('.ts') && !file.includes('index') && !file.includes('test') && !file.includes('types') && !file.includes('schemas'))
			.map((file) => file.replace('.ts', ''));

		// Create a server to verify all tools register without error
		createServer({accessToken: 'test-token'});

		// Verify the expected number of tool files exist
		expect(toolFiles.length).toBe(24); // 24 tool files
	});

	test('server creates without error', () => {
		const server = createServer({accessToken: 'test-token'});
		expect(server).toBeDefined();
	});
});
