import { z } from 'zod';
import { ToolResult } from '../types.js';
import { validateDocumentId, validateIndex, ValidationError } from '../utils/validation.js';

export function registerMediaTools(server: any, docs: any) {
  // Insert image from URL tool
  server.registerTool(
    'insert_image_from_url',
    {
      title: 'Insert Image from URL',
      description: 'Insert an image into the document from a URL',
      inputSchema: {
        documentId: z.string(),
        index: z.number(),
        imageUrl: z.string().url().describe('URL of the image to insert'),
        width: z.number().optional().describe('Width in points'),
        height: z.number().optional().describe('Height in points'),
        altText: z.string().optional().describe('Alternative text for accessibility')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, index, imageUrl, width, height, altText }: {
      documentId: string;
      index: number;
      imageUrl: string;
      width?: number;
      height?: number;
      altText?: string;
    }): Promise<ToolResult> => {
      try {
        const requests = [{
          insertInlineImage: {
            location: { index: index },
            uri: imageUrl,
            objectSize: width && height ? {
              height: { magnitude: height, unit: 'PT' },
              width: { magnitude: width, unit: 'PT' }
            } : undefined
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Inserted image from ${imageUrl}${width && height ? ` (${width}x${height}pt)` : ''}`
          }],
          structuredContent: {
            success: true,
            message: 'Image inserted successfully'
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error inserting image: ${error.message}`
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

  // Resize image tool
  server.registerTool(
    'resize_image',
    {
      title: 'Resize Image',
      description: 'Resize an image in the document',
      inputSchema: {
        documentId: z.string(),
        imageStartIndex: z.number(),
        imageEndIndex: z.number(),
        width: z.number().describe('New width in points'),
        height: z.number().describe('New height in points')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, imageStartIndex, imageEndIndex, width, height }: {
      documentId: string;
      imageStartIndex: number;
      imageEndIndex: number;
      width: number;
      height: number;
    }): Promise<ToolResult> => {
      try {
        // Validate inputs
        validateDocumentId(documentId);
        validateIndex(imageStartIndex, 'imageStartIndex');
        validateIndex(imageEndIndex, 'imageEndIndex');

        // First, get the document to find the actual image object ID
        const doc = await docs.documents.get({ documentId });
        const content = doc.data.body?.content || [];

        // Find the inline image object ID within the specified range
        let imageObjectId: string | null = null;

        for (const element of content) {
          if (element.paragraph) {
            for (const paragraphElement of element.paragraph.elements) {
              const startIdx = paragraphElement.startIndex || 0;
              const endIdx = paragraphElement.endIndex || 0;

              // Check if this element is within our target range and contains an inline image
              if (startIdx >= imageStartIndex && endIdx <= imageEndIndex) {
                if (paragraphElement.inlineObjectElement) {
                  imageObjectId = paragraphElement.inlineObjectElement.inlineObjectId;
                  break;
                }
              }
            }
            if (imageObjectId) break;
          }
        }

        if (!imageObjectId) {
          return {
            content: [{
              type: 'text',
              text: `No image found at the specified range (${imageStartIndex}-${imageEndIndex})`
            }],
            structuredContent: {
              success: false,
              message: 'No image found at specified range'
            },
            isError: true
          };
        }

        // Now update the image with the actual object ID
        const requests = [{
          updateInlineImageProperties: {
            objectId: imageObjectId,
            inlineImageProperties: {
              embeddedObject: {
                size: {
                  height: { magnitude: height, unit: 'PT' },
                  width: { magnitude: width, unit: 'PT' }
                }
              }
            },
            fields: 'embeddedObject.size'
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Resized image to ${width}x${height}pt`
          }],
          structuredContent: {
            success: true,
            message: `Image resized to ${width}x${height}pt`
          }
        };
      } catch (error: any) {
        if (error instanceof ValidationError) {
          return {
            content: [{
              type: 'text',
              text: `Validation error: ${error.message}`
            }],
            structuredContent: {
              success: false,
              message: `Validation error: ${error.message}`
            },
            isError: true
          };
        }
        return {
          content: [{
            type: 'text',
            text: `Error resizing image: ${error.message}`
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

  // Set image alignment tool
  server.registerTool(
    'set_image_alignment',
    {
      title: 'Set Image Alignment',
      description: 'Set the alignment of an image in the document',
      inputSchema: {
        documentId: z.string(),
        imageStartIndex: z.number(),
        imageEndIndex: z.number(),
        alignment: z.enum(['LEFT', 'CENTER', 'RIGHT']).describe('Image alignment')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, imageStartIndex, imageEndIndex, alignment }: {
      documentId: string;
      imageStartIndex: number;
      imageEndIndex: number;
      alignment: string;
    }): Promise<ToolResult> => {
      try {
        const requests = [{
          updateParagraphStyle: {
            range: {
              startIndex: imageStartIndex,
              endIndex: imageEndIndex
            },
            paragraphStyle: {
              alignment: alignment
            },
            fields: 'alignment'
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Set image alignment to ${alignment.toLowerCase()}`
          }],
          structuredContent: {
            success: true,
            message: `Image aligned ${alignment.toLowerCase()}`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error setting image alignment: ${error.message}`
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

  // Add image caption tool
  server.registerTool(
    'add_image_caption',
    {
      title: 'Add Image Caption',
      description: 'Add a caption to an image',
      inputSchema: {
        documentId: z.string(),
        imageIndex: z.number(),
        caption: z.string().describe('Caption text for the image')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, imageIndex, caption }: {
      documentId: string;
      imageIndex: number;
      caption: string;
    }): Promise<ToolResult> => {
      try {
        const requests = [{
          insertText: {
            location: { index: imageIndex + 1 },
            text: `\n${caption}\n`
          }
        }, {
          updateParagraphStyle: {
            range: {
              startIndex: imageIndex + 1,
              endIndex: imageIndex + 1 + caption.length
            },
            paragraphStyle: {
              namedStyleType: 'CAPTION'
            },
            fields: 'namedStyleType'
          }
        }];

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Added caption: "${caption}"`
          }],
          structuredContent: {
            success: true,
            message: 'Caption added successfully'
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error adding caption: ${error.message}`
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

  // Insert drawing tool
  server.registerTool(
    'insert_drawing',
    {
      title: 'Insert Drawing',
      description: 'Insert a drawing or shape into the document',
      inputSchema: {
        documentId: z.string(),
        index: z.number(),
        drawingType: z.enum(['RECTANGLE', 'CIRCLE', 'TRIANGLE', 'ARROW', 'LINE']).describe('Type of drawing to insert'),
        width: z.number().optional().default(100).describe('Width in points'),
        height: z.number().optional().default(100).describe('Height in points'),
        fillColor: z.object({
          red: z.number().min(0).max(1),
          green: z.number().min(0).max(1),
          blue: z.number().min(0).max(1)
        }).optional().describe('Fill color for the shape')
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string()
      }
    },
    async ({ documentId, index, drawingType, width, height, fillColor }: {
      documentId: string;
      index: number;
      drawingType: string;
      width?: number;
      height?: number;
      fillColor?: { red: number; green: number; blue: number };
    }): Promise<ToolResult> => {
      try {
        const requests = [{
          insertInlineImage: {
            location: { index: index },
            uri: 'data:image/svg+xml;base64,' + Buffer.from(`
              <svg width="${width || 100}" height="${height || 100}" xmlns="http://www.w3.org/2000/svg">
                ${drawingType === 'RECTANGLE' ? 
                  `<rect width="${width || 100}" height="${height || 100}" fill="rgb(${fillColor ? Math.round(fillColor.red * 255) : 200},${fillColor ? Math.round(fillColor.green * 255) : 200},${fillColor ? Math.round(fillColor.blue * 255) : 200})" stroke="black" stroke-width="2"/>` :
                  drawingType === 'CIRCLE' ?
                  `<circle cx="${(width || 100) / 2}" cy="${(height || 100) / 2}" r="${Math.min(width || 100, height || 100) / 2}" fill="rgb(${fillColor ? Math.round(fillColor.red * 255) : 200},${fillColor ? Math.round(fillColor.green * 255) : 200},${fillColor ? Math.round(fillColor.blue * 255) : 200})" stroke="black" stroke-width="2"/>` :
                  drawingType === 'TRIANGLE' ?
                  `<polygon points="${(width || 100) / 2},0 0,${height || 100} ${width || 100},${height || 100}" fill="rgb(${fillColor ? Math.round(fillColor.red * 255) : 200},${fillColor ? Math.round(fillColor.green * 255) : 200},${fillColor ? Math.round(fillColor.blue * 255) : 200})" stroke="black" stroke-width="2"/>` :
                  drawingType === 'ARROW' ?
                  `<path d="M0,${(height || 100) / 2} L${(width || 100) - 20},${(height || 100) / 2} M${(width || 100) - 30},${(height || 100) / 2 - 10} L${(width || 100) - 20},${(height || 100) / 2} L${(width || 100) - 30},${(height || 100) / 2 + 10}" stroke="black" stroke-width="3" fill="none"/>` :
                  `<line x1="0" y1="0" x2="${width || 100}" y2="${height || 100}" stroke="black" stroke-width="3"/>`
                }
              </svg>
            `).toString('base64'),
            objectSize: {
              height: { magnitude: height || 100, unit: 'PT' },
              width: { magnitude: width || 100, unit: 'PT' }
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
            text: `Inserted ${drawingType.toLowerCase()} drawing (${width || 100}x${height || 100}pt)`
          }],
          structuredContent: {
            success: true,
            message: `${drawingType} drawing inserted successfully`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error inserting drawing: ${error.message}`
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
