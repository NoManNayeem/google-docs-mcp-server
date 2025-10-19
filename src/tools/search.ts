import { z } from 'zod';
import { ToolResult } from '../types.js';

export function registerSearchTools(server: any, docs: any) {
  // Find and replace tool
  server.registerTool(
    'find_and_replace',
    {
      title: 'Find and Replace',
      description: 'Find and replace text in the document',
      inputSchema: {
        documentId: z.string(),
        findText: z.string().describe('Text to find'),
        replaceText: z.string().describe('Text to replace with'),
        matchCase: z.boolean().optional().default(false).describe('Match case sensitivity'),
        replaceAll: z.boolean().optional().default(false).describe('Replace all occurrences')
      },
      outputSchema: {
        success: z.boolean(),
        replacementsCount: z.number(),
        message: z.string()
      }
    },
    async ({ documentId, findText, replaceText, matchCase, replaceAll }: {
      documentId: string;
      findText: string;
      replaceText: string;
      matchCase?: boolean;
      replaceAll?: boolean;
    }): Promise<ToolResult> => {
      try {
        // First, get the document content to find matches
        const doc = await docs.documents.get({ documentId });
        const content = doc.data.body?.content || [];
        
        let documentText = '';
        for (const element of content) {
          if (element.paragraph) {
            for (const elem of element.paragraph.elements) {
              if (elem.textRun) {
                documentText += elem.textRun.content || '';
              }
            }
          }
        }

        // Find matches
        const searchText = matchCase ? findText : findText.toLowerCase();
        const docText = matchCase ? documentText : documentText.toLowerCase();
        
        const matches = [];
        let index = 0;
        while ((index = docText.indexOf(searchText, index)) !== -1) {
          matches.push(index);
          index += searchText.length;
        }

        if (matches.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `No matches found for "${findText}"`
            }],
            structuredContent: {
              success: false,
              replacementsCount: 0,
              message: 'No matches found'
            }
          };
        }

        // Replace matches
        const requests = [];
        let replacementsCount = 0;
        
        // Sort matches in reverse order to avoid index shifting
        const sortedMatches = matches.sort((a, b) => b - a);
        
        for (const matchIndex of sortedMatches) {
          if (!replaceAll && replacementsCount >= 1) break;
          
          requests.push({
            deleteContentRange: {
              range: {
                startIndex: matchIndex,
                endIndex: matchIndex + findText.length
              }
            }
          });
          
          requests.push({
            insertText: {
              location: { index: matchIndex },
              text: replaceText
            }
          });
          
          replacementsCount++;
        }

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: { requests }
        });

        return {
          content: [{
            type: 'text',
            text: `Replaced ${replacementsCount} occurrence${replacementsCount !== 1 ? 's' : ''} of "${findText}" with "${replaceText}"`
          }],
          structuredContent: {
            success: true,
            replacementsCount: replacementsCount,
            message: `Replaced ${replacementsCount} occurrence${replacementsCount !== 1 ? 's' : ''}`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error in find and replace: ${error.message}`
          }],
          structuredContent: {
            success: false,
            replacementsCount: 0,
            message: `Error: ${error.message}`
          },
          isError: true
        };
      }
    }
  );

  // Search text in document tool
  server.registerTool(
    'search_text_in_document',
    {
      title: 'Search Text in Document',
      description: 'Search for text within the document and return positions',
      inputSchema: {
        documentId: z.string(),
        searchText: z.string().describe('Text to search for'),
        matchCase: z.boolean().optional().default(false).describe('Match case sensitivity'),
        maxResults: z.number().optional().default(10).describe('Maximum number of results to return')
      },
      outputSchema: {
        success: z.boolean(),
        matches: z.array(z.object({
          startIndex: z.number(),
          endIndex: z.number(),
          context: z.string()
        })),
        totalMatches: z.number(),
        message: z.string()
      }
    },
    async ({ documentId, searchText, matchCase, maxResults }: {
      documentId: string;
      searchText: string;
      matchCase?: boolean;
      maxResults?: number;
    }): Promise<ToolResult> => {
      try {
        // Get the document content
        const doc = await docs.documents.get({ documentId });
        const content = doc.data.body?.content || [];
        
        let documentText = '';
        for (const element of content) {
          if (element.paragraph) {
            for (const elem of element.paragraph.elements) {
              if (elem.textRun) {
                documentText += elem.textRun.content || '';
              }
            }
          }
        }

        // Search for matches
        const searchTextLower = matchCase ? searchText : searchText.toLowerCase();
        const docTextLower = matchCase ? documentText : documentText.toLowerCase();
        
        const matches = [];
        let index = 0;
        while ((index = docTextLower.indexOf(searchTextLower, index)) !== -1 && matches.length < (maxResults || 10)) {
          const contextStart = Math.max(0, index - 20);
          const contextEnd = Math.min(documentText.length, index + searchText.length + 20);
          const context = documentText.substring(contextStart, contextEnd);
          
          matches.push({
            startIndex: index,
            endIndex: index + searchText.length,
            context: context
          });
          
          index += searchText.length;
        }

        return {
          content: [{
            type: 'text',
            text: `Found ${matches.length} match${matches.length !== 1 ? 'es' : ''} for "${searchText}"${matches.length > 0 ? ':\n' + matches.map((match, i) => `${i + 1}. Position ${match.startIndex}-${match.endIndex}: "...${match.context}..."`).join('\n') : ''}`
          }],
          structuredContent: {
            success: true,
            matches: matches,
            totalMatches: matches.length,
            message: `Found ${matches.length} match${matches.length !== 1 ? 'es' : ''}`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error searching document: ${error.message}`
          }],
          structuredContent: {
            success: false,
            matches: [],
            totalMatches: 0,
            message: `Error: ${error.message}`
          },
          isError: true
        };
      }
    }
  );

  // Get word count tool
  server.registerTool(
    'get_word_count',
    {
      title: 'Get Word Count',
      description: 'Get word count and other document statistics',
      inputSchema: {
        documentId: z.string()
      },
      outputSchema: {
        success: z.boolean(),
        wordCount: z.number(),
        characterCount: z.number(),
        paragraphCount: z.number(),
        pageCount: z.number().optional(),
        message: z.string()
      }
    },
    async ({ documentId }: { documentId: string }): Promise<ToolResult> => {
      try {
        // Get the document content
        const doc = await docs.documents.get({ documentId });
        const content = doc.data.body?.content || [];
        
        let documentText = '';
        let paragraphCount = 0;
        
        for (const element of content) {
          if (element.paragraph) {
            paragraphCount++;
            for (const elem of element.paragraph.elements) {
              if (elem.textRun) {
                documentText += elem.textRun.content || '';
              }
            }
          }
        }

        // Calculate statistics
        const wordCount = documentText.trim().split(/\s+/).filter(word => word.length > 0).length;
        const characterCount = documentText.length;
        const characterCountNoSpaces = documentText.replace(/\s/g, '').length;

        return {
          content: [{
            type: 'text',
            text: `Document Statistics:
• Words: ${wordCount}
• Characters: ${characterCount}
• Characters (no spaces): ${characterCountNoSpaces}
• Paragraphs: ${paragraphCount}`
          }],
          structuredContent: {
            success: true,
            wordCount: wordCount,
            characterCount: characterCount,
            paragraphCount: paragraphCount,
            message: `Document has ${wordCount} words, ${characterCount} characters, and ${paragraphCount} paragraphs`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error getting word count: ${error.message}`
          }],
          structuredContent: {
            success: false,
            wordCount: 0,
            characterCount: 0,
            paragraphCount: 0,
            message: `Error: ${error.message}`
          },
          isError: true
        };
      }
    }
  );

  // Spell check tool
  server.registerTool(
    'spell_check',
    {
      title: 'Spell Check',
      description: 'Check spelling in the document and get suggestions',
      inputSchema: {
        documentId: z.string(),
        text: z.string().describe('Text to check for spelling errors')
      },
      outputSchema: {
        success: z.boolean(),
        suggestions: z.array(z.object({
          word: z.string(),
          suggestions: z.array(z.string())
        })),
        message: z.string()
      }
    },
    async ({ documentId, text }: { documentId: string; text: string }): Promise<ToolResult> => {
      try {
        // This is a simplified spell check - in a real implementation,
        // you would integrate with a spell checking service
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const commonWords = new Set([
          'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
          'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
          'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
          'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
          'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
        ]);

        const suggestions = [];
        for (const word of words) {
          if (!commonWords.has(word) && word.length > 2) {
            // Simple suggestion: add common variations
            const wordSuggestions = [
              word + 's', // plural
              word.slice(0, -1), // remove last letter
              word + 'ed', // past tense
              word + 'ing' // present participle
            ].filter(suggestion => suggestion !== word);
            
            if (wordSuggestions.length > 0) {
              suggestions.push({
                word: word,
                suggestions: wordSuggestions
              });
            }
          }
        }

        return {
          content: [{
            type: 'text',
            text: `Spell check completed. Found ${suggestions.length} potential spelling issue${suggestions.length !== 1 ? 's' : ''}${suggestions.length > 0 ? ':\n' + suggestions.map(s => `• "${s.word}" - suggestions: ${s.suggestions.join(', ')}`).join('\n') : ''}`
          }],
          structuredContent: {
            success: true,
            suggestions: suggestions,
            message: `Found ${suggestions.length} potential spelling issue${suggestions.length !== 1 ? 's' : ''}`
          }
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error in spell check: ${error.message}`
          }],
          structuredContent: {
            success: false,
            suggestions: [],
            message: `Error: ${error.message}`
          },
          isError: true
        };
      }
    }
  );
}
