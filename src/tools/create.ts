import { z } from 'zod';
import { ToolResult, DocumentInfo } from '../types.js';

export function registerCreateTools(server: any, docs: any) {
  // Create document tool
  server.registerTool(
    'create_document',
    {
      title: 'Create Google Doc',
      description: 'Create a new Google Document with optional initial content',
      inputSchema: {
        title: z.string().describe('Document title'),
        initialContent: z.string().optional().describe('Initial text content')
      },
      outputSchema: {
        documentId: z.string(),
        documentUrl: z.string(),
        title: z.string()
      }
    },
    async ({ title, initialContent }: { title: string; initialContent?: string }): Promise<ToolResult> => {
      console.error('[create_document] start', { title, hasInitialContent: Boolean(initialContent && initialContent.length) });
      try {
        // Step 1: Create document
        const createResponse = await docs.documents.create({
          requestBody: { title }
        });

        const documentId = createResponse.data.documentId;

        // Step 2: Add initial content if provided
        if (initialContent) {
          const requests = [{
            insertText: {
              location: { index: 1 },
              text: initialContent
            }
          }];

          await docs.documents.batchUpdate({
            documentId,
            requestBody: { requests }
          });
        }

        const output: DocumentInfo = {
          documentId,
          documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
          title
        };

        console.error('[create_document] success', { documentId });
        return {
          content: [{
            type: 'text',
            text: `Created document "${title}"\nURL: ${output.documentUrl}`
          }],
          structuredContent: output
        };
      } catch (error: any) {
        console.error('[create_document] error', { message: error?.message });
        return {
          content: [{
            type: 'text',
            text: `Error creating document: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Create formatted document tool
  server.registerTool(
    'create_formatted_document',
    {
      title: 'Create Formatted Document',
      description: 'Create document with title, heading, and formatted body text',
      inputSchema: {
        title: z.string(),
        heading: z.string(),
        body: z.string()
      },
      outputSchema: {
        documentId: z.string(),
        documentUrl: z.string()
      }
    },
    async ({ title, heading, body }: { title: string; heading: string; body: string }): Promise<ToolResult> => {
      console.error('[create_formatted_document] start', { title, headingLength: heading?.length, bodyLength: body?.length });
      try {
        // Create document
        const createResponse = await docs.documents.create({
          requestBody: { title }
        });
        const documentId = createResponse.data.documentId;

        // Build batch requests
        const requests = [
          // Insert heading
          {
            insertText: {
              location: { index: 1 },
              text: heading + '\n'
            }
          },
          // Format heading as H1
          {
            updateParagraphStyle: {
              range: {
                startIndex: 1,
                endIndex: heading.length + 2
              },
              paragraphStyle: {
                namedStyleType: 'HEADING_1'
              },
              fields: 'namedStyleType'
            }
          },
          // Insert body
          {
            insertText: {
              location: { index: heading.length + 2 },
              text: body + '\n'
            }
          },
          // Make first word of body bold (only if body has content)
          ...(body.trim() && body.includes(' ') ? [{
            updateTextStyle: {
              range: {
                startIndex: heading.length + 2,
                endIndex: heading.length + 2 + body.split(' ')[0].length
              },
              textStyle: { bold: true },
              fields: 'bold'
            }
          }] : [])
        ];

        // Execute all updates atomically
        await docs.documents.batchUpdate({
          documentId,
          requestBody: { requests }
        });

        const output = {
          documentId,
          documentUrl: `https://docs.google.com/document/d/${documentId}/edit`
        };

        console.error('[create_formatted_document] success', { documentId });
        return {
          content: [{
            type: 'text',
            text: `Created and formatted document: ${output.documentUrl}`
          }],
          structuredContent: output
        };
      } catch (error: any) {
        console.error('[create_formatted_document] error', { message: error?.message });
        return {
          content: [{
            type: 'text',
            text: `Error: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}
