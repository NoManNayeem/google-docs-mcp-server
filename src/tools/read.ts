import { z } from 'zod';
import { ToolResult, DocumentContent, SearchResult } from '../types.js';
import { validateDocumentId, sanitizeSearchQuery, ValidationError } from '../utils/validation.js';

export function registerReadTools(server: any, docs: any, drive: any) {
  // Store drive reference for use in tool functions
  const driveClient = drive;
  
  // Read document tool
  server.registerTool(
    'read_document',
    {
      title: 'Read Google Doc',
      description: 'Read the complete content of a Google Document',
      inputSchema: {
        documentId: z.string().describe('Document ID from URL')
      },
      outputSchema: {
        title: z.string(),
        content: z.string(),
        documentId: z.string()
      }
    },
    async ({ documentId }: { documentId: string }): Promise<ToolResult> => {
      console.error('[read_document] start', { documentId });
      try {
        // Validate document ID
        validateDocumentId(documentId);

        const doc = await docs.documents.get({ documentId });

        // Extract text from document structure
        let textContent = '';
        const content = doc.data.body.content || [];

        for (const element of content) {
          if (element.paragraph) {
            for (const paragraphElement of element.paragraph.elements) {
              if (paragraphElement.textRun) {
                textContent += paragraphElement.textRun.content;
              }
            }
          }
        }

        const output: DocumentContent = {
          title: doc.data.title,
          content: textContent,
          documentId
        };

        console.error('[read_document] success', { title: doc?.data?.title });
        return {
          content: [{
            type: 'text',
            text: `Document: ${doc.data.title}\n\n${textContent}`
          }],
          structuredContent: output
        };
      } catch (error: any) {
        if (error instanceof ValidationError) {
          console.error('[read_document] validation_error', { message: error?.message });
          return {
            content: [{
              type: 'text',
              text: `Validation error: ${error.message}`
            }],
            isError: true
          };
        }
        if (error.code === 404) {
          console.error('[read_document] not_found');
          return {
            content: [{
              type: 'text',
              text: 'Document not found. Check the document ID and permissions.'
            }],
            isError: true
          };
        }
        console.error('[read_document] error', { message: error?.message });
        return {
          content: [{
            type: 'text',
            text: `Error reading document: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Search documents tool
  server.registerTool(
    'search_documents',
    {
      title: 'Search Google Docs',
      description: 'Search for documents by name',
      inputSchema: {
        query: z.string().describe('Search query'),
        maxResults: z.number().optional().default(10)
      },
      outputSchema: {
        documents: z.array(z.object({
          id: z.string(),
          name: z.string(),
          url: z.string()
        }))
      }
    },
    async ({ query, maxResults }: { query: string; maxResults?: number }): Promise<ToolResult> => {
      console.error('[search_documents] start', { query, maxResults });
      try {
        // Handle empty or wildcard queries
        let searchQuery = "mimeType='application/vnd.google-apps.document' and trashed=false";

        if (query && query.trim() && query !== '*') {
          // Sanitize the search query to prevent injection attacks
          const sanitizedQuery = sanitizeSearchQuery(query);
          searchQuery += ` and name contains '${sanitizedQuery}'`;
        }

        const response = await driveClient.files.list({
          q: searchQuery,
          pageSize: maxResults,
          fields: 'files(id, name)'
        });

        // Safely access files array
        const files = (response.data && response.data.files) ? response.data.files : [];

        const documents: SearchResult[] = files.map((file: any) => ({
          id: file.id,
          name: file.name,
          url: `https://docs.google.com/document/d/${file.id}/edit`
        }));

        console.error('[search_documents] success', { count: documents.length });
        return {
          content: [{
            type: 'text',
            text: `Found ${documents.length} documents${query && query !== '*' ? ` matching "${query}"` : ''}`
          }],
          structuredContent: { documents }
        };
      } catch (error: any) {
        if (error instanceof ValidationError) {
          console.error('[search_documents] validation_error', { message: error?.message });
          return {
            content: [{
              type: 'text',
              text: `Validation error: ${error.message}`
            }],
            isError: true
          };
        }
        console.error('[search_documents] error', { message: error?.message });
        return {
          content: [{
            type: 'text',
            text: `Search error: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}
