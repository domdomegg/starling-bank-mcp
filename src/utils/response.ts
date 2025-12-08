import type {CallToolResult} from '@modelcontextprotocol/sdk/types.js';

/**
 * Wraps a JSON result for MCP tool responses.
 * Returns both text content (for backwards compat) and structuredContent.
 */
export function jsonResult<T extends Record<string, unknown>>(data: T): CallToolResult & {structuredContent: T} {
	return {
		content: [{type: 'text', text: JSON.stringify(data, null, 2)}],
		structuredContent: data,
	};
}
