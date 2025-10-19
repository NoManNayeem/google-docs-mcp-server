#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { google } from 'googleapis';
import { getAuthClient } from './auth.js';
import { registerCreateTools } from './tools/create.js';
import { registerReadTools } from './tools/read.js';
import { registerUpdateTools } from './tools/update.js';
import { registerFormatTools } from './tools/format.js';
import { registerTableTools } from './tools/tables.js';
import { registerMediaTools } from './tools/media.js';
import { registerStructureTools } from './tools/structure.js';
import { registerSearchTools } from './tools/search.js';

// Critical: Only use stderr for logging in stdio servers
console.error('Starting LLM2Docs MCP Server...');

const server = new McpServer({
  name: 'google-docs-mcp-server',
  version: '1.0.0'
});

// Initialize Google Docs client
let docs: any;
let drive: any;

// Initialize authentication and register tools
(async () => {
  try {
    const auth = await getAuthClient();
    docs = google.docs({ version: 'v1', auth });
    drive = google.drive({ version: 'v3', auth });
    
    console.error('Authentication successful');
    console.error('Drive object created:', !!drive);
    
            // Register all tools after authentication is complete
            registerCreateTools(server, docs);
            registerReadTools(server, docs, drive);
            registerUpdateTools(server, docs);
            registerFormatTools(server, docs);
            registerTableTools(server, docs);
            registerMediaTools(server, docs);
            registerStructureTools(server, docs);
            registerSearchTools(server, docs);
    
    console.error('All tools registered successfully');
  } catch (error) {
    console.error('Authentication failed:', error);
    // Do not exit, allow the authentication flow to proceed
  }
})();

// Add authentication status tool
server.registerTool(
  'check_auth_status',
  {
    title: 'Check Authentication Status',
    description: 'Check if the Google Docs MCP server is properly authenticated',
    inputSchema: {},
    outputSchema: {
      authenticated: z.boolean(),
      message: z.string()
    }
  },
  async () => {
    try {
      // Test authentication by making a simple API call
      const response = await drive.about.get({ fields: 'user' });
      return {
        content: [{
          type: 'text',
          text: `✅ Authentication successful! Connected as: ${response.data.user?.displayName || 'Google User'}`
        }],
        structuredContent: {
          authenticated: true,
          message: 'Google Docs MCP server is properly authenticated and ready to use!'
        }
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `❌ Authentication failed: ${error.message}\n\nPlease complete the OAuth flow by visiting the authentication URL shown in the server logs.`
        }],
        structuredContent: {
          authenticated: false,
          message: 'Authentication required. Please complete the OAuth flow.'
        },
        isError: true
      };
    }
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Google Docs MCP Server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
