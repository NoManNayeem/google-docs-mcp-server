import { z } from 'zod';
import { ToolResult } from '../types.js';

export function registerUpdateTools(server: any, docs: any) {
  // Append text tool
  server.registerTool(
    'append_text',
    {
      title: 'Append Text to Document',
      description: 'Add text to the end of a Google Document',
      inputSchema: {
        documentId: z.string(),
        text: z.string().describe('Text to append')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, text }: { documentId: string; text: string }): Promise<ToolResult> => {
      try {
        // Use endOfSegmentLocation to append without calculating indexes
        const requests = [{
          insertText: {
            text: text + '\n',
            endOfSegmentLocation: {
              segmentId: ''  // Empty string for main body
            }
          }
        }];

        await docs.documents.batchUpdate({
          documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: 'Text appended successfully'
          }],
          structuredContent: {
            success: true,
            message: 'Text appended'
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error appending text: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Insert text tool
  server.registerTool(
    'insert_text',
    {
      title: 'Insert Text at Position',
      description: 'Insert text at a specific position in the document',
      inputSchema: {
        documentId: z.string(),
        text: z.string(),
        index: z.number().describe('Index position (1 = start of document)')
      },
      outputSchema: {
        success: z.boolean()
      }
    },
    async ({ documentId, text, index }: { documentId: string; text: string; index: number }): Promise<ToolResult> => {
      try {
        const requests = [{
          insertText: {
            location: { index },
            text
          }
        }];

        await docs.documents.batchUpdate({
          documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Inserted text at position ${index}`
          }],
          structuredContent: { success: true }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error inserting text: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Delete text tool
  server.registerTool(
    'delete_text',
    {
      title: 'Delete Text Range',
      description: 'Delete text from a specific range in the document',
      inputSchema: {
        documentId: z.string(),
        startIndex: z.number(),
        endIndex: z.number()
      },
      outputSchema: {
        success: z.boolean()
      }
    },
    async ({ documentId, startIndex, endIndex }: { documentId: string; startIndex: number; endIndex: number }): Promise<ToolResult> => {
      try {
        const requests = [{
          deleteContentRange: {
            range: {
              startIndex,
              endIndex
            }
          }
        }];

        await docs.documents.batchUpdate({
          documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Deleted text from position ${startIndex} to ${endIndex}`
          }],
          structuredContent: { success: true }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error deleting text: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Replace text tool
  server.registerTool(
    'replace_text',
    {
      title: 'Replace Text Range',
      description: 'Replace text in a specific range with new text',
      inputSchema: {
        documentId: z.string(),
        startIndex: z.number(),
        endIndex: z.number(),
        newText: z.string()
      },
      outputSchema: {
        success: z.boolean()
      }
    },
    async ({ documentId, startIndex, endIndex, newText }: { documentId: string; startIndex: number; endIndex: number; newText: string }): Promise<ToolResult> => {
      try {
        const requests = [
          {
            deleteContentRange: {
              range: {
                startIndex,
                endIndex
              }
            }
          },
          {
            insertText: {
              location: { index: startIndex },
              text: newText
            }
          }
        ];

        await docs.documents.batchUpdate({
          documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Replaced text from position ${startIndex} to ${endIndex} with "${newText}"`
          }],
          structuredContent: { success: true }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error replacing text: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}
