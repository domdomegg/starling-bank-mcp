import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {tools} from './tools/index.js';

// Validate API token
const accessToken = process.env.STARLING_BANK_ACCESS_TOKEN;
if (!accessToken) {
	throw new Error('starling-bank-mcp: No access token provided. Set it in the `STARLING_BANK_ACCESS_TOKEN` environment variable');
}

// Create the server
export const server = new Server({
	name: 'starling-bank-mcp',
	version: '1.0.0',
}, {
	capabilities: {
		tools: {},
	},
});

// Handle tool list requests
server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: Object.values(tools).map((module) => module.tool),
	};
});

// Handle tool execution requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const {name, arguments: args} = request.params;

	try {
		const toolModule = tools[name];
		if (!toolModule) {
			throw new Error(`Unknown tool: ${name}`);
		}

		// Validate arguments using the tool's schema
		const validatedArgs = toolModule.schema.parse(args);

		// Call the tool's handler
		return await toolModule.handler(validatedArgs, accessToken);
	} catch (error) {
		return {
			content: [{
				type: 'text',
				text: `Error: ${error instanceof Error ? error.message : String(error)}`,
			}],
			isError: true,
		};
	}
});

// Error handling
process.on('SIGINT', async () => {
	await server.close();
	process.exit(0);
});

process.on('SIGTERM', async () => {
	await server.close();
	process.exit(0);
});
