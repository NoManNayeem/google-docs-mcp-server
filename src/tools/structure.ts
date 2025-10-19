import { z } from 'zod';
import { ToolResult } from '../types.js';

export function registerStructureTools(server: any, docs: any) {
  // Insert table of contents tool
  server.registerTool(
    'insert_table_of_contents',
    {
      title: 'Insert Table of Contents',
      description: 'Insert an auto-generated table of contents',
      inputSchema: {
        documentId: z.string(),
        index: z.number(),
        title: z.string().optional().default('Table of Contents').describe('Title for the table of contents'),
        maxDepth: z.number().optional().default(3).describe('Maximum heading depth to include (1-6)')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, index, title, maxDepth }: {
      documentId: string;
      index: number;
      title?: string;
      maxDepth?: number;
    }): Promise<ToolResult> => {
      try {
        const requests = [{
          insertText: {
            location: { index: index },
            text: `${title}\n\n`
          }
        }, {
          updateParagraphStyle: {
            range: {
              startIndex: index,
              endIndex: index + (title || 'Table of Contents').length
            },
            paragraphStyle: {
              namedStyleType: 'HEADING_1'
            },
            fields: 'namedStyleType'
          }
        }, {
          insertTableOfContents: {
            location: { index: index + (title || 'Table of Contents').length + 2 }
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Inserted table of contents with title "${title}"`
          }],
          structuredContent: {
            success: true,
            message: 'Table of contents inserted successfully'
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error inserting table of contents: ${error.message}`
          }],
          structuredContent: {
            success: false,
            message: `Error: ${error.message}`
          },
          isError: true
        };
      }
    }
  );

  // Insert section break tool
  server.registerTool(
    'insert_section_break',
    {
      title: 'Insert Section Break',
      description: 'Insert a section break in the document',
      inputSchema: {
        documentId: z.string(),
        index: z.number(),
        breakType: z.enum(['NEXT_PAGE', 'CONTINUOUS', 'EVEN_PAGE', 'ODD_PAGE']).optional().default('NEXT_PAGE').describe('Type of section break')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, index, breakType }: {
      documentId: string;
      index: number;
      breakType?: string;
    }): Promise<ToolResult> => {
      try {
        const requests = [{
          insertSectionBreak: {
            location: { index: index },
            sectionType: breakType
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Inserted ${(breakType || 'NEXT_PAGE').toLowerCase().replace('_', ' ')} section break`
          }],
          structuredContent: {
            success: true,
            message: 'Section break inserted successfully'
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error inserting section break: ${error.message}`
          }],
          structuredContent: {
            success: false,
            message: `Error: ${error.message}`
          },
          isError: true
        };
      }
    }
  );

  // Insert bookmark tool
  server.registerTool(
    'insert_bookmark',
    {
      title: 'Insert Bookmark',
      description: 'Insert a bookmark (named anchor) in the document',
      inputSchema: {
        documentId: z.string(),
        index: z.number(),
        bookmarkName: z.string().describe('Name of the bookmark')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, index, bookmarkName }: {
      documentId: string;
      index: number;
      bookmarkName: string;
    }): Promise<ToolResult> => {
      try {
        const requests = [{
          createNamedRange: {
            name: bookmarkName,
            range: {
              startIndex: index,
              endIndex: index
            }
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Inserted bookmark "${bookmarkName}"`
          }],
          structuredContent: {
            success: true,
            message: 'Bookmark inserted successfully'
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error inserting bookmark: ${error.message}`
          }],
          structuredContent: {
            success: false,
            message: `Error: ${error.message}`
          },
          isError: true
        };
      }
    }
  );

  // Add cross-reference tool
  server.registerTool(
    'add_cross_reference',
    {
      title: 'Add Cross-Reference',
      description: 'Add a cross-reference link to a bookmark or heading',
      inputSchema: {
        documentId: z.string(),
        startIndex: z.number(),
        endIndex: z.number(),
        referenceText: z.string().describe('Text to display for the reference'),
        targetBookmark: z.string().describe('Name of the bookmark to link to')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, startIndex, endIndex, referenceText, targetBookmark }: {
      documentId: string;
      startIndex: number;
      endIndex: number;
      referenceText: string;
      targetBookmark: string;
    }): Promise<ToolResult> => {
      try {
        const requests = [{
          updateTextStyle: {
            range: {
              startIndex: startIndex,
              endIndex: endIndex
            },
            textStyle: {
              link: {
                bookmarkId: targetBookmark
              }
            },
            fields: 'link'
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Added cross-reference to "${targetBookmark}"`
          }],
          structuredContent: {
            success: true,
            message: 'Cross-reference added successfully'
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error adding cross-reference: ${error.message}`
          }],
          structuredContent: {
            success: false,
            message: `Error: ${error.message}`
          },
          isError: true
        };
      }
    }
  );

  // Insert header tool
  server.registerTool(
    'insert_header',
    {
      title: 'Insert Header',
      description: 'Insert a header in the document',
      inputSchema: {
        documentId: z.string(),
        headerText: z.string().describe('Text for the header'),
        pageNumber: z.boolean().optional().default(false).describe('Include page number in header')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, headerText, pageNumber }: {
      documentId: string;
      headerText: string;
      pageNumber?: boolean;
    }): Promise<ToolResult> => {
      try {
        const requests = [{
          createHeader: {
            type: 'DEFAULT'
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Inserted header: "${headerText}"${pageNumber ? ' with page numbers' : ''}`
          }],
          structuredContent: {
            success: true,
            message: 'Header inserted successfully'
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error inserting header: ${error.message}`
          }],
          structuredContent: {
            success: false,
            message: `Error: ${error.message}`
          },
          isError: true
        };
      }
    }
  );

  // Insert footer tool
  server.registerTool(
    'insert_footer',
    {
      title: 'Insert Footer',
      description: 'Insert a footer in the document',
      inputSchema: {
        documentId: z.string(),
        footerText: z.string().describe('Text for the footer'),
        pageNumber: z.boolean().optional().default(true).describe('Include page number in footer')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, footerText, pageNumber }: {
      documentId: string;
      footerText: string;
      pageNumber?: boolean;
    }): Promise<ToolResult> => {
      try {
        const requests = [{
          createFooter: {
            type: 'DEFAULT'
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Inserted footer: "${footerText}"${pageNumber ? ' with page numbers' : ''}`
          }],
          structuredContent: {
            success: true,
            message: 'Footer inserted successfully'
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error inserting footer: ${error.message}`
          }],
          structuredContent: {
            success: false,
            message: `Error: ${error.message}`
          },
          isError: true
        };
      }
    }
  );

  // Insert footnote tool
  server.registerTool(
    'insert_footnote',
    {
      title: 'Insert Footnote',
      description: 'Insert a footnote in the document',
      inputSchema: {
        documentId: z.string(),
        index: z.number(),
        footnoteText: z.string().describe('Text for the footnote')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, index, footnoteText }: {
      documentId: string;
      index: number;
      footnoteText: string;
    }): Promise<ToolResult> => {
      try {
        const requests = [{
          insertText: {
            location: { index: index },
            text: ' '
          }
        }, {
          insertFootnote: {
            location: { index: index + 1 },
            footnoteText: footnoteText
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Inserted footnote: "${footnoteText}"`
          }],
          structuredContent: {
            success: true,
            message: 'Footnote inserted successfully'
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error inserting footnote: ${error.message}`
          }],
          structuredContent: {
            success: false,
            message: `Error: ${error.message}`
          },
          isError: true
        };
      }
    }
  );
}
