#!/usr/bin/env node
/** Discord MCP stdio server for Grok Build CLI and Grok Bot. */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { handleTool, TOOLS } from './tools.js';

const log = (...a) => console.error('[discord]', ...a);

const server = new Server(
  { name: 'discord', version: '0.1.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;
  const args = request.params.arguments || {};
  try {
    return await handleTool(name, args);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log('tool error', name, message);
    return { isError: true, content: [{ type: 'text', text: message }] };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log('ready');
}

main().catch((err) => {
  log('fatal', err);
  process.exit(1);
});
