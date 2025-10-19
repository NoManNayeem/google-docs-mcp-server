import { z } from 'zod';
import { ToolResult } from '../types.js';

export function registerTableTools(server: any, docs: any) {
  // Advanced table formatting tool
  server.registerTool(
    'format_table',
    {
      title: 'Format Table',
      description: 'Apply advanced formatting to tables (borders, colors, alignment)',
      inputSchema: {
        documentId: z.string(),
        tableStartIndex: z.number(),
        tableEndIndex: z.number(),
        borderStyle: z.enum(['SOLID', 'DASHED', 'DOTTED', 'NONE']).optional(),
        borderColor: z.object({
          red: z.number().min(0).max(1),
          green: z.number().min(0).max(1),
          blue: z.number().min(0).max(1)
        }).optional(),
        cellBackgroundColor: z.object({
          red: z.number().min(0).max(1),
          green: z.number().min(0).max(1),
          blue: z.number().min(0).max(1)
        }).optional(),
        headerRow: z.boolean().optional().describe('Make first row a header row')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, tableStartIndex, tableEndIndex, borderStyle, borderColor, cellBackgroundColor, headerRow }: {
      documentId: string;
      tableStartIndex: number;
      tableEndIndex: number;
      borderStyle?: string;
      borderColor?: { red: number; green: number; blue: number };
      cellBackgroundColor?: { red: number; green: number; blue: number };
      headerRow?: boolean;
    }): Promise<ToolResult> => {
      try {
        const requests = [];

        // Apply border formatting
        if (borderStyle && borderStyle !== 'NONE') {
          requests.push({
            updateTableRowStyle: {
              tableStartLocation: { index: tableStartIndex },
              tableEndLocation: { index: tableEndIndex },
              tableRowStyle: {
                borderBottom: {
                  color: borderColor ? { rgbColor: borderColor } : { rgbColor: { red: 0, green: 0, blue: 0 } },
                  width: { magnitude: 1, unit: 'PT' },
                  dashStyle: borderStyle === 'DASHED' ? 'DASH' : borderStyle === 'DOTTED' ? 'DOT' : 'SOLID'
                }
              },
              fields: 'borderBottom'
            }
          });
        }

        // Apply cell background color
        if (cellBackgroundColor) {
          requests.push({
            updateTableCellStyle: {
              tableStartLocation: { index: tableStartIndex },
              tableEndLocation: { index: tableEndIndex },
              tableCellStyle: {
                backgroundColor: { color: { rgbColor: cellBackgroundColor } }
              },
              fields: 'backgroundColor'
            }
          });
        }

        // Make header row bold if requested
        if (headerRow) {
          requests.push({
            updateTextStyle: {
              range: {
                startIndex: tableStartIndex,
                endIndex: tableStartIndex + 100 // Approximate for first row
              },
              textStyle: {
                bold: true
              },
              fields: 'bold'
            }
          });
        }

        if (requests.length === 0) {
          return {
            content: [{
              type: 'text',
              text: 'No formatting options provided'
            }],
            structuredContent: {
              success: false,
              message: 'No formatting options provided'
            },
            isError: true
          };
        }

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Applied table formatting successfully`
          }],
          structuredContent: {
            success: true,
            message: 'Table formatting applied'
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error formatting table: ${error.message}`
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

  // Merge table cells tool
  server.registerTool(
    'merge_table_cells',
    {
      title: 'Merge Table Cells',
      description: 'Merge cells in a table (horizontal or vertical)',
      inputSchema: {
        documentId: z.string(),
        tableStartIndex: z.number(),
        tableEndIndex: z.number(),
        mergeType: z.enum(['HORIZONTAL', 'VERTICAL']).describe('Direction of merge'),
        startRow: z.number().describe('Starting row index'),
        startColumn: z.number().describe('Starting column index'),
        endRow: z.number().describe('Ending row index'),
        endColumn: z.number().describe('Ending column index')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, tableStartIndex, tableEndIndex, mergeType, startRow, startColumn, endRow, endColumn }: {
      documentId: string;
      tableStartIndex: number;
      tableEndIndex: number;
      mergeType: string;
      startRow: number;
      startColumn: number;
      endRow: number;
      endColumn: number;
    }): Promise<ToolResult> => {
      try {
        const requests = [{
          mergeTableCells: {
            tableStartLocation: { index: tableStartIndex },
            tableEndLocation: { index: tableEndIndex },
            rowSpan: endRow - startRow + 1,
            columnSpan: endColumn - startColumn + 1
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Merged cells ${mergeType.toLowerCase()} from row ${startRow}, col ${startColumn} to row ${endRow}, col ${endColumn}`
          }],
          structuredContent: {
            success: true,
            message: 'Cells merged successfully'
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error merging cells: ${error.message}`
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

  // Insert table row tool
  server.registerTool(
    'insert_table_row',
    {
      title: 'Insert Table Row',
      description: 'Insert a new row into a table',
      inputSchema: {
        documentId: z.string(),
        tableStartIndex: z.number(),
        rowIndex: z.number().describe('Index where to insert the row'),
        insertBelow: z.boolean().optional().default(true).describe('Insert below the specified row')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, tableStartIndex, rowIndex, insertBelow }: {
      documentId: string;
      tableStartIndex: number;
      rowIndex: number;
      insertBelow?: boolean;
    }): Promise<ToolResult> => {
      try {
        const requests = [{
          insertTableRow: {
            tableCellLocation: {
              tableStartLocation: { index: tableStartIndex },
              rowIndex: rowIndex,
              columnIndex: 0
            },
            insertBelow: insertBelow
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Inserted new row ${insertBelow ? 'below' : 'above'} row ${rowIndex}`
          }],
          structuredContent: {
            success: true,
            message: 'Row inserted successfully'
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error inserting row: ${error.message}`
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

  // Insert table column tool
  server.registerTool(
    'insert_table_column',
    {
      title: 'Insert Table Column',
      description: 'Insert a new column into a table',
      inputSchema: {
        documentId: z.string(),
        tableStartIndex: z.number(),
        columnIndex: z.number().describe('Index where to insert the column'),
        insertRight: z.boolean().optional().default(true).describe('Insert to the right of the specified column')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, tableStartIndex, columnIndex, insertRight }: {
      documentId: string;
      tableStartIndex: number;
      columnIndex: number;
      insertRight?: boolean;
    }): Promise<ToolResult> => {
      try {
        const requests = [{
          insertTableColumn: {
            tableCellLocation: {
              tableStartLocation: { index: tableStartIndex },
              rowIndex: 0,
              columnIndex: columnIndex
            },
            insertRight: insertRight
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Inserted new column ${insertRight ? 'to the right of' : 'to the left of'} column ${columnIndex}`
          }],
          structuredContent: {
            success: true,
            message: 'Column inserted successfully'
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error inserting column: ${error.message}`
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

  // Delete table row tool
  server.registerTool(
    'delete_table_row',
    {
      title: 'Delete Table Row',
      description: 'Delete a row from a table',
      inputSchema: {
        documentId: z.string(),
        tableStartIndex: z.number(),
        rowIndex: z.number().describe('Index of the row to delete')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, tableStartIndex, rowIndex }: {
      documentId: string;
      tableStartIndex: number;
      rowIndex: number;
    }): Promise<ToolResult> => {
      try {
        const requests = [{
          deleteTableRow: {
            tableCellLocation: {
              tableStartLocation: { index: tableStartIndex },
              rowIndex: rowIndex,
              columnIndex: 0
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
            text: `Deleted row ${rowIndex}`
          }],
          structuredContent: {
            success: true,
            message: 'Row deleted successfully'
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error deleting row: ${error.message}`
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

  // Delete table column tool
  server.registerTool(
    'delete_table_column',
    {
      title: 'Delete Table Column',
      description: 'Delete a column from a table',
      inputSchema: {
        documentId: z.string(),
        tableStartIndex: z.number(),
        columnIndex: z.number().describe('Index of the column to delete')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, tableStartIndex, columnIndex }: {
      documentId: string;
      tableStartIndex: number;
      columnIndex: number;
    }): Promise<ToolResult> => {
      try {
        const requests = [{
          deleteTableColumn: {
            tableCellLocation: {
              tableStartLocation: { index: tableStartIndex },
              rowIndex: 0,
              columnIndex: columnIndex
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
            text: `Deleted column ${columnIndex}`
          }],
          structuredContent: {
            success: true,
            message: 'Column deleted successfully'
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error deleting column: ${error.message}`
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

  // Set table column width tool
  server.registerTool(
    'set_table_column_width',
    {
      title: 'Set Table Column Width',
      description: 'Set the width of table columns',
      inputSchema: {
        documentId: z.string(),
        tableStartIndex: z.number(),
        columnIndex: z.number().describe('Index of the column to resize'),
        width: z.number().describe('Width in points')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, tableStartIndex, columnIndex, width }: {
      documentId: string;
      tableStartIndex: number;
      columnIndex: number;
      width: number;
    }): Promise<ToolResult> => {
      try {
        const requests = [{
          updateTableColumnProperties: {
            tableStartLocation: { index: tableStartIndex },
            columnIndices: [columnIndex],
            tableColumnProperties: {
              width: {
                magnitude: width,
                unit: 'PT'
              }
            },
            fields: 'width'
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Set column ${columnIndex} width to ${width}pt`
          }],
          structuredContent: {
            success: true,
            message: `Column width set to ${width}pt`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error setting column width: ${error.message}`
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
