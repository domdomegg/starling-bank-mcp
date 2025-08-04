import {readdir} from 'node:fs/promises';
import {describe, test, expect} from 'vitest';
import {join} from 'node:path';
import {tools} from './index.js';

describe('tools index', () => {
	test('should export all tool files in the tools object', async () => {
		const toolsDir = join(__dirname, '.');
		const files = await readdir(toolsDir);

		const toolFiles = files
			.filter((file) => file.endsWith('.ts') && !file.includes('index') && !file.includes('test'))
			.map((file) => file.replace('.ts', ''));

		const exportedTools = Object.keys(tools);

		const expectedToolNames = toolFiles.map((file) => file.replace(/-/g, '_'));

		expectedToolNames.forEach((toolName) => {
			expect(exportedTools).toContain(toolName);
		});

		expect(exportedTools).toHaveLength(expectedToolNames.length);
	});

	test('all tools have a name, title, description and readOnlyHint', () => {
		Object.values(tools).forEach((toolModule) => {
			const {tool} = toolModule;

			expect(tool.name.length).toBeGreaterThan(5);
			expect(tool.description?.length).toBeGreaterThan(5);
			expect(tool.annotations?.title?.length).toBeGreaterThan(5);
			expect(tool.annotations?.readOnlyHint).toBeOneOf([true, false]);
		});
	});
});
