import { z } from 'zod';
import { ToolResult } from '../types.js';

export function registerFormatTools(server: any, docs: any) {
  // Change font family tool
  server.registerTool(
    'change_font',
    {
      title: 'Change Font Family',
      description: 'Change the font family of text in a document',
      inputSchema: {
        documentId: z.string(),
        startIndex: z.number(),
        endIndex: z.number(),
        fontFamily: z.string().describe('Font family name (e.g., Arial, Times New Roman, Calibri)')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, startIndex, endIndex, fontFamily }: { documentId: string; startIndex: number; endIndex: number; fontFamily: string }): Promise<ToolResult> => {
      try {
        const requests = [{
          updateTextStyle: {
            range: {
              startIndex: startIndex,
              endIndex: endIndex
            },
            textStyle: {
              weightedFontFamily: {
                fontFamily: fontFamily
              }
            },
            fields: 'weightedFontFamily'
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Font changed to ${fontFamily} successfully`
          }],
          structuredContent: {
            success: true,
            message: `Font changed to ${fontFamily}`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error changing font: ${error.message}`
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

  // Change font size tool
  server.registerTool(
    'change_font_size',
    {
      title: 'Change Font Size',
      description: 'Change the font size of text in a document',
      inputSchema: {
        documentId: z.string(),
        startIndex: z.number(),
        endIndex: z.number(),
        fontSize: z.number().describe('Font size in points (e.g., 12, 14, 16)')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, startIndex, endIndex, fontSize }: { documentId: string; startIndex: number; endIndex: number; fontSize: number }): Promise<ToolResult> => {
      try {
        const requests = [{
          updateTextStyle: {
            range: {
              startIndex: startIndex,
              endIndex: endIndex
            },
            textStyle: {
              fontSize: {
                magnitude: fontSize,
                unit: 'PT'
              }
            },
            fields: 'fontSize'
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Font size changed to ${fontSize}pt successfully`
          }],
          structuredContent: {
            success: true,
            message: `Font size changed to ${fontSize}pt`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error changing font size: ${error.message}`
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

  // Change font weight tool
  server.registerTool(
    'change_font_weight',
    {
      title: 'Change Font Weight',
      description: 'Change the font weight (bold/normal) of text in a document',
      inputSchema: {
        documentId: z.string(),
        startIndex: z.number(),
        endIndex: z.number(),
        bold: z.boolean().describe('Whether to make text bold')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, startIndex, endIndex, bold }: { documentId: string; startIndex: number; endIndex: number; bold: boolean }): Promise<ToolResult> => {
      try {
        const requests = [{
          updateTextStyle: {
            range: {
              startIndex: startIndex,
              endIndex: endIndex
            },
            textStyle: {
              bold: bold
            },
            fields: 'bold'
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Font weight changed to ${bold ? 'bold' : 'normal'} successfully`
          }],
          structuredContent: {
            success: true,
            message: `Font weight changed to ${bold ? 'bold' : 'normal'}`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error changing font weight: ${error.message}`
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

  // Change font style tool
  server.registerTool(
    'change_font_style',
    {
      title: 'Change Font Style',
      description: 'Change the font style (italic/normal) of text in a document',
      inputSchema: {
        documentId: z.string(),
        startIndex: z.number(),
        endIndex: z.number(),
        italic: z.boolean().describe('Whether to make text italic')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, startIndex, endIndex, italic }: { documentId: string; startIndex: number; endIndex: number; italic: boolean }): Promise<ToolResult> => {
      try {
        const requests = [{
          updateTextStyle: {
            range: {
              startIndex: startIndex,
              endIndex: endIndex
            },
            textStyle: {
              italic: italic
            },
            fields: 'italic'
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Font style changed to ${italic ? 'italic' : 'normal'} successfully`
          }],
          structuredContent: {
            success: true,
            message: `Font style changed to ${italic ? 'italic' : 'normal'}`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error changing font style: ${error.message}`
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

  // Apply comprehensive font formatting tool
  server.registerTool(
    'apply_font_formatting',
    {
      title: 'Apply Comprehensive Font Formatting',
      description: 'Apply multiple font formatting options at once',
      inputSchema: {
        documentId: z.string(),
        startIndex: z.number(),
        endIndex: z.number(),
        fontFamily: z.string().optional().describe('Font family name'),
        fontSize: z.number().optional().describe('Font size in points'),
        bold: z.boolean().optional().describe('Whether to make text bold'),
        italic: z.boolean().optional().describe('Whether to make text italic'),
        underline: z.boolean().optional().describe('Whether to underline text'),
        strikethrough: z.boolean().optional().describe('Whether to strikethrough text')
      },
      outputSchema: {
        success: z.boolean(),
        appliedFormats: z.array(z.string()),
        message: z.string()
      }
    },
    async ({ documentId, startIndex, endIndex, fontFamily, fontSize, bold, italic, underline, strikethrough }: { 
      documentId: string; 
      startIndex: number; 
      endIndex: number; 
      fontFamily?: string; 
      fontSize?: number; 
      bold?: boolean; 
      italic?: boolean; 
      underline?: boolean; 
      strikethrough?: boolean; 
    }): Promise<ToolResult> => {
      try {
        const textStyle: any = {};
        const fields: string[] = [];
        const appliedFormats: string[] = [];

        if (fontFamily) {
          textStyle.weightedFontFamily = { fontFamily };
          fields.push('weightedFontFamily');
          appliedFormats.push(`Font: ${fontFamily}`);
        }

        if (fontSize) {
          textStyle.fontSize = { magnitude: fontSize, unit: 'PT' };
          fields.push('fontSize');
          appliedFormats.push(`Size: ${fontSize}pt`);
        }

        if (bold !== undefined) {
          textStyle.bold = bold;
          fields.push('bold');
          appliedFormats.push(`Bold: ${bold ? 'Yes' : 'No'}`);
        }

        if (italic !== undefined) {
          textStyle.italic = italic;
          fields.push('italic');
          appliedFormats.push(`Italic: ${italic ? 'Yes' : 'No'}`);
        }

        if (underline !== undefined) {
          textStyle.underline = underline;
          fields.push('underline');
          appliedFormats.push(`Underline: ${underline ? 'Yes' : 'No'}`);
        }

        if (strikethrough !== undefined) {
          textStyle.strikethrough = strikethrough;
          fields.push('strikethrough');
          appliedFormats.push(`Strikethrough: ${strikethrough ? 'Yes' : 'No'}`);
        }

        if (fields.length === 0) {
          return {
            content: [{
              type: 'text',
              text: 'No formatting options provided'
            }],
            structuredContent: {
              success: false,
              appliedFormats: [],
              message: 'No formatting options provided'
            },
            isError: true
          };
        }

        const requests = [{
          updateTextStyle: {
            range: {
              startIndex: startIndex,
              endIndex: endIndex
            },
            textStyle: textStyle,
            fields: fields.join(',')
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Font formatting applied successfully: ${appliedFormats.join(', ')}`
          }],
          structuredContent: {
            success: true,
            appliedFormats: appliedFormats,
            message: `Applied: ${appliedFormats.join(', ')}`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error applying font formatting: ${error.message}`
          }],
          structuredContent: {
            success: false,
            appliedFormats: [],
            message: `Error: ${error.message}`
          },
          isError: true
        };
      }
    }
  );

  // Format text tool
  server.registerTool(
    'format_text',
    {
      title: 'Apply Text Formatting',
      description: 'Apply bold, italic, or other formatting to text range',
      inputSchema: {
        documentId: z.string(),
        startIndex: z.number(),
        endIndex: z.number(),
        bold: z.boolean().optional(),
        italic: z.boolean().optional(),
        underline: z.boolean().optional(),
        strikethrough: z.boolean().optional(),
        fontSize: z.number().optional().describe('Font size in points'),
        foregroundColor: z.object({
          red: z.number().min(0).max(1),
          green: z.number().min(0).max(1),
          blue: z.number().min(0).max(1)
        }).optional(),
        backgroundColor: z.object({
          red: z.number().min(0).max(1),
          green: z.number().min(0).max(1),
          blue: z.number().min(0).max(1)
        }).optional()
      },
      outputSchema: {
        success: z.boolean(),
        appliedFormats: z.array(z.string())
      }
    },
    async ({ documentId, startIndex, endIndex, bold, italic, underline, strikethrough, fontSize, foregroundColor, backgroundColor }: any): Promise<ToolResult> => {
      try {
        // Build text style object
        const textStyle: any = {};
        const fields: string[] = [];
        const appliedFormats: string[] = [];

        if (bold !== undefined) {
          textStyle.bold = bold;
          fields.push('bold');
          appliedFormats.push('bold');
        }
        if (italic !== undefined) {
          textStyle.italic = italic;
          fields.push('italic');
          appliedFormats.push('italic');
        }
        if (underline !== undefined) {
          textStyle.underline = underline;
          fields.push('underline');
          appliedFormats.push('underline');
        }
        if (strikethrough !== undefined) {
          textStyle.strikethrough = strikethrough;
          fields.push('strikethrough');
          appliedFormats.push('strikethrough');
        }
        if (fontSize) {
          textStyle.fontSize = {
            magnitude: fontSize,
            unit: 'PT'
          };
          fields.push('fontSize');
          appliedFormats.push('fontSize');
        }
        if (foregroundColor) {
          textStyle.foregroundColor = {
            color: {
              rgbColor: {
                red: foregroundColor.red,
                green: foregroundColor.green,
                blue: foregroundColor.blue
              }
            }
          };
          fields.push('foregroundColor');
          appliedFormats.push('foregroundColor');
        }
        if (backgroundColor) {
          textStyle.backgroundColor = {
            color: {
              rgbColor: {
                red: backgroundColor.red,
                green: backgroundColor.green,
                blue: backgroundColor.blue
              }
            }
          };
          fields.push('backgroundColor');
          appliedFormats.push('backgroundColor');
        }

        const requests = [{
          updateTextStyle: {
            range: { startIndex, endIndex },
            textStyle,
            fields: fields.join(',')  // Critical: must specify fields
          }
        }];

        await docs.documents.batchUpdate({
          documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Applied formatting: ${appliedFormats.join(', ')}`
          }],
          structuredContent: {
            success: true,
            appliedFormats
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error formatting text: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Apply heading tool
  server.registerTool(
    'apply_heading',
    {
      title: 'Apply Heading Style',
      description: 'Format text as heading (H1-H6) or title',
      inputSchema: {
        documentId: z.string(),
        startIndex: z.number(),
        endIndex: z.number(),
        headingLevel: z.enum(['TITLE', 'HEADING_1', 'HEADING_2', 'HEADING_3', 'HEADING_4', 'HEADING_5', 'HEADING_6', 'NORMAL_TEXT'])
      },
      outputSchema: {
        success: z.boolean()
      }
    },
    async ({ documentId, startIndex, endIndex, headingLevel }: { documentId: string; startIndex: number; endIndex: number; headingLevel: string }): Promise<ToolResult> => {
      try {
        const requests = [{
          updateParagraphStyle: {
            range: { startIndex, endIndex },
            paragraphStyle: {
              namedStyleType: headingLevel
            },
            fields: 'namedStyleType'
          }
        }];

        await docs.documents.batchUpdate({
          documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Applied ${headingLevel} style`
          }],
          structuredContent: { success: true }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error applying heading: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Set alignment tool
  server.registerTool(
    'set_alignment',
    {
      title: 'Set Paragraph Alignment',
      description: 'Set text alignment for a paragraph',
      inputSchema: {
        documentId: z.string(),
        startIndex: z.number(),
        endIndex: z.number(),
        alignment: z.enum(['START', 'CENTER', 'END', 'JUSTIFIED'])
      },
      outputSchema: {
        success: z.boolean()
      }
    },
    async ({ documentId, startIndex, endIndex, alignment }: { documentId: string; startIndex: number; endIndex: number; alignment: string }): Promise<ToolResult> => {
      try {
        const requests = [{
          updateParagraphStyle: {
            range: { startIndex, endIndex },
            paragraphStyle: {
              alignment
            },
            fields: 'alignment'
          }
        }];

        await docs.documents.batchUpdate({
          documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Applied ${alignment} alignment`
          }],
          structuredContent: { success: true }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error setting alignment: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Insert table tool
  server.registerTool(
    'insert_table',
    {
      title: 'Insert Table',
      description: 'Insert a table into the document',
      inputSchema: {
        documentId: z.string(),
        index: z.number(),
        rows: z.number(),
        columns: z.number()
      },
      outputSchema: {
        success: z.boolean()
      }
    },
    async ({ documentId, index, rows, columns }: { documentId: string; index: number; rows: number; columns: number }): Promise<ToolResult> => {
      try {
        const requests = [{
          insertTable: {
            location: { index },
            rows,
            columns
          }
        }];

        await docs.documents.batchUpdate({
          documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Inserted ${rows}x${columns} table at position ${index}`
          }],
          structuredContent: { success: true }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error inserting table: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Insert page break tool
  server.registerTool(
    'insert_page_break',
    {
      title: 'Insert Page Break',
      description: 'Insert a page break at the specified position',
      inputSchema: {
        documentId: z.string(),
        index: z.number()
      },
      outputSchema: {
        success: z.boolean()
      }
    },
    async ({ documentId, index }: { documentId: string; index: number }): Promise<ToolResult> => {
      try {
        const requests = [{
          insertPageBreak: {
            location: { index }
          }
        }];

        await docs.documents.batchUpdate({
          documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Inserted page break at position ${index}`
          }],
          structuredContent: { success: true }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error inserting page break: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Add hyperlink tool
  server.registerTool(
    'add_hyperlink',
    {
      title: 'Add Hyperlink',
      description: 'Add a hyperlink to text in the document',
      inputSchema: {
        documentId: z.string(),
        startIndex: z.number(),
        endIndex: z.number(),
        url: z.string().url()
      },
      outputSchema: {
        success: z.boolean()
      }
    },
    async ({ documentId, startIndex, endIndex, url }: { documentId: string; startIndex: number; endIndex: number; url: string }): Promise<ToolResult> => {
      try {
        const requests = [{
          updateTextStyle: {
            range: { startIndex, endIndex },
            textStyle: {
              link: { url }
            },
            fields: 'link'
          }
        }];

        await docs.documents.batchUpdate({
          documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Added hyperlink to ${url}`
          }],
          structuredContent: { success: true }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error adding hyperlink: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Create bulleted list tool
  server.registerTool(
    'create_bulleted_list',
    {
      title: 'Create Bulleted List',
      description: 'Create a bulleted list with specified items',
      inputSchema: {
        documentId: z.string(),
        index: z.number(),
        items: z.array(z.string()).describe('List items to add'),
        bulletStyle: z.enum(['BULLET_DISC_CIRCLE_SQUARE', 'BULLET_DIAMONDX_ARROW3D_SQUARE', 'BULLET_CHECKBOX']).optional().default('BULLET_DISC_CIRCLE_SQUARE')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, index, items, bulletStyle }: { documentId: string; index: number; items: string[]; bulletStyle?: string }): Promise<ToolResult> => {
      try {
        const requests = [];
        
        // Insert each list item
        for (let i = 0; i < items.length; i++) {
          const itemText = items[i];
          const insertIndex = index + (i * (itemText.length + 1));
          
          requests.push({
            insertText: {
              location: { index: insertIndex },
              text: itemText + '\n'
            }
          });
        }

        // Apply bullet list formatting to all items
        for (let i = 0; i < items.length; i++) {
          const startIndex = index + (i * (items[i].length + 1));
          const endIndex = startIndex + items[i].length;
          
          requests.push({
            updateParagraphStyle: {
              range: {
                startIndex: startIndex,
                endIndex: endIndex
              },
              paragraphStyle: {
                bullet: {
                  listId: 'bulleted-list',
                  nestingLevel: 0
                }
              },
              fields: 'bullet'
            }
          });
        }

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Created bulleted list with ${items.length} items`
          }],
          structuredContent: {
            success: true,
            message: `Created bulleted list with ${items.length} items`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error creating bulleted list: ${error.message}`
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

  // Create numbered list tool
  server.registerTool(
    'create_numbered_list',
    {
      title: 'Create Numbered List',
      description: 'Create a numbered list with specified items',
      inputSchema: {
        documentId: z.string(),
        index: z.number(),
        items: z.array(z.string()).describe('List items to add'),
        numberingFormat: z.enum(['DECIMAL_DECIMAL', 'UPPER_ROMAN', 'LOWER_ROMAN', 'UPPER_ALPHA', 'LOWER_ALPHA']).optional().default('DECIMAL_DECIMAL')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, index, items, numberingFormat }: { documentId: string; index: number; items: string[]; numberingFormat?: string }): Promise<ToolResult> => {
      try {
        const requests = [];
        
        // Insert each list item
        for (let i = 0; i < items.length; i++) {
          const itemText = items[i];
          const insertIndex = index + (i * (itemText.length + 1));
          
          requests.push({
            insertText: {
              location: { index: insertIndex },
              text: itemText + '\n'
            }
          });
        }

        // Apply numbered list formatting to all items
        for (let i = 0; i < items.length; i++) {
          const startIndex = index + (i * (items[i].length + 1));
          const endIndex = startIndex + items[i].length;
          
          requests.push({
            updateParagraphStyle: {
              range: {
                startIndex: startIndex,
                endIndex: endIndex
              },
              paragraphStyle: {
                bullet: {
                  listId: 'numbered-list',
                  nestingLevel: 0
                }
              },
              fields: 'bullet'
            }
          });
        }

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Created numbered list with ${items.length} items`
          }],
          structuredContent: {
            success: true,
            message: `Created numbered list with ${items.length} items`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error creating numbered list: ${error.message}`
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

  // Set line spacing tool
  server.registerTool(
    'set_line_spacing',
    {
      title: 'Set Line Spacing',
      description: 'Set line spacing for paragraphs',
      inputSchema: {
        documentId: z.string(),
        startIndex: z.number(),
        endIndex: z.number(),
        lineSpacing: z.enum(['SINGLE', 'ONE_POINT_FIVE', 'DOUBLE', 'CUSTOM']).describe('Line spacing type'),
        customSpacing: z.number().optional().describe('Custom spacing multiplier (e.g., 1.2 for 120%)')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, startIndex, endIndex, lineSpacing, customSpacing }: { documentId: string; startIndex: number; endIndex: number; lineSpacing: string; customSpacing?: number }): Promise<ToolResult> => {
      try {
        const paragraphStyle: any = {};
        
        if (lineSpacing === 'CUSTOM' && customSpacing) {
          paragraphStyle.lineSpacing = {
            spacingMode: 'CUSTOM',
            spacingUnit: 'MULTIPLE',
            spacingValue: customSpacing
          };
        } else {
          paragraphStyle.lineSpacing = {
            spacingMode: lineSpacing
          };
        }

        const requests = [{
          updateParagraphStyle: {
            range: {
              startIndex: startIndex,
              endIndex: endIndex
            },
            paragraphStyle: paragraphStyle,
            fields: 'lineSpacing'
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Set line spacing to ${lineSpacing}${customSpacing ? ` (${customSpacing}x)` : ''}`
          }],
          structuredContent: {
            success: true,
            message: `Line spacing set to ${lineSpacing}`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error setting line spacing: ${error.message}`
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

  // Set paragraph spacing tool
  server.registerTool(
    'set_paragraph_spacing',
    {
      title: 'Set Paragraph Spacing',
      description: 'Set spacing before and after paragraphs',
      inputSchema: {
        documentId: z.string(),
        startIndex: z.number(),
        endIndex: z.number(),
        spaceBefore: z.number().optional().describe('Space before paragraph in points'),
        spaceAfter: z.number().optional().describe('Space after paragraph in points')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, startIndex, endIndex, spaceBefore, spaceAfter }: { documentId: string; startIndex: number; endIndex: number; spaceBefore?: number; spaceAfter?: number }): Promise<ToolResult> => {
      try {
        const paragraphStyle: any = {};
        
        if (spaceBefore !== undefined) {
          paragraphStyle.spaceAbove = {
            magnitude: spaceBefore,
            unit: 'PT'
          };
        }
        
        if (spaceAfter !== undefined) {
          paragraphStyle.spaceBelow = {
            magnitude: spaceAfter,
            unit: 'PT'
          };
        }

        const fields = [];
        if (spaceBefore !== undefined) fields.push('spaceAbove');
        if (spaceAfter !== undefined) fields.push('spaceBelow');

        const requests = [{
          updateParagraphStyle: {
            range: {
              startIndex: startIndex,
              endIndex: endIndex
            },
            paragraphStyle: paragraphStyle,
            fields: fields.join(',')
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Set paragraph spacing${spaceBefore ? ` - before: ${spaceBefore}pt` : ''}${spaceAfter ? ` - after: ${spaceAfter}pt` : ''}`
          }],
          structuredContent: {
            success: true,
            message: `Paragraph spacing updated`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error setting paragraph spacing: ${error.message}`
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

  // Text case transformation tool
  server.registerTool(
    'transform_text_case',
    {
      title: 'Transform Text Case',
      description: 'Transform text to uppercase, lowercase, or title case',
      inputSchema: {
        documentId: z.string(),
        startIndex: z.number(),
        endIndex: z.number(),
        caseType: z.enum(['UPPERCASE', 'LOWERCASE', 'TITLE_CASE']).describe('Case transformation type')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, startIndex, endIndex, caseType }: { documentId: string; startIndex: number; endIndex: number; caseType: string }): Promise<ToolResult> => {
      try {
        // First, get the current text to transform it
        const doc = await docs.documents.get({ documentId });
        const content = doc.data.body?.content || [];
        
        let textToTransform = '';
        for (const element of content) {
          if (element.paragraph) {
            for (const elem of element.paragraph.elements) {
              if (elem.textRun) {
                const textStart = elem.startIndex || 0;
                const textEnd = (elem.endIndex || 0) - 1;
                
                if (textStart <= endIndex && textEnd >= startIndex) {
                  const overlapStart = Math.max(textStart, startIndex);
                  const overlapEnd = Math.min(textEnd, endIndex);
                  const overlapText = elem.textRun.content.substring(
                    overlapStart - textStart,
                    overlapEnd - textStart + 1
                  );
                  textToTransform += overlapText;
                }
              }
            }
          }
        }

        // Transform the text
        let transformedText = '';
        switch (caseType) {
          case 'UPPERCASE':
            transformedText = textToTransform.toUpperCase();
            break;
          case 'LOWERCASE':
            transformedText = textToTransform.toLowerCase();
            break;
          case 'TITLE_CASE':
            transformedText = textToTransform.replace(/\w\S*/g, (txt) => 
              txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
            break;
        }

        // Replace the text
        const requests = [{
          deleteContentRange: {
            range: {
              startIndex: startIndex,
              endIndex: endIndex
            }
          }
        }, {
          insertText: {
            location: { index: startIndex },
            text: transformedText
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Transformed text to ${caseType.toLowerCase()}`
          }],
          structuredContent: {
            success: true,
            message: `Text transformed to ${caseType.toLowerCase()}`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error transforming text case: ${error.message}`
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

  // Subscript tool
  server.registerTool(
    'apply_subscript',
    {
      title: 'Apply Subscript',
      description: 'Make text subscript',
      inputSchema: {
        documentId: z.string(),
        startIndex: z.number(),
        endIndex: z.number()
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, startIndex, endIndex }: { documentId: string; startIndex: number; endIndex: number }): Promise<ToolResult> => {
      try {
        const requests = [{
          updateTextStyle: {
            range: {
              startIndex: startIndex,
              endIndex: endIndex
            },
            textStyle: {
              baselineOffset: 'SUBSCRIPT'
            },
            fields: 'baselineOffset'
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Applied subscript formatting`
          }],
          structuredContent: {
            success: true,
            message: `Subscript applied`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error applying subscript: ${error.message}`
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

  // Superscript tool
  server.registerTool(
    'apply_superscript',
    {
      title: 'Apply Superscript',
      description: 'Make text superscript',
      inputSchema: {
        documentId: z.string(),
        startIndex: z.number(),
        endIndex: z.number()
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, startIndex, endIndex }: { documentId: string; startIndex: number; endIndex: number }): Promise<ToolResult> => {
      try {
        const requests = [{
          updateTextStyle: {
            range: {
              startIndex: startIndex,
              endIndex: endIndex
            },
            textStyle: {
              baselineOffset: 'SUPERSCRIPT'
            },
            fields: 'baselineOffset'
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Applied superscript formatting`
          }],
          structuredContent: {
            success: true,
            message: `Superscript applied`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error applying superscript: ${error.message}`
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
