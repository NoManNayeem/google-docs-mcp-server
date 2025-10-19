import { z } from 'zod';
import { ToolResult, DocumentContent, SearchResult } from '../types.js';

export function registerReadTools(server: any, docs: any, drive: any) {
  console.error('🔧 Registering read tools with drive object:', !!drive);
  
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
      try {
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

        return {
          content: [{
            type: 'text',
            text: `Document: ${doc.data.title}\n\n${textContent}`
          }],
          structuredContent: output
        };
      } catch (error: any) {
        if (error.code === 404) {
          return {
            content: [{
              type: 'text',
              text: 'Document not found. Check the document ID and permissions.'
            }],
            isError: true
          };
        }
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
      try {
        console.error('🔍 Search function called, drive object:', !!driveClient);
        
        // Handle empty or wildcard queries
        let searchQuery = "mimeType='application/vnd.google-apps.document' and trashed=false";
        
        if (query && query.trim() && query !== '*') {
          searchQuery += ` and name contains '${query}'`;
        }

        console.error('Searching with query:', searchQuery);

        const response = await driveClient.files.list({
          q: searchQuery,
          pageSize: maxResults,
          fields: 'files(id, name)'
        });

        console.error('Drive API response structure:', {
          hasData: !!response.data,
          hasFiles: !!response.data?.files,
          filesLength: response.data?.files?.length || 0
        });

        // Safely access files array
        const files = (response.data && response.data.files) ? response.data.files : [];
        console.error('Files found:', files.length);

        const documents: SearchResult[] = files.map((file: any) => ({
          id: file.id,
          name: file.name,
          url: `https://docs.google.com/document/d/${file.id}/edit`
        }));

        return {
          content: [{
            type: 'text',
            text: `Found ${documents.length} documents${query && query !== '*' ? ` matching "${query}"` : ''}`
          }],
          structuredContent: { documents }
        };
      } catch (error: any) {
        console.error('Search error details:', error);
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
