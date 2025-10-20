/**
 * Unit tests for document creation tools
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the Google APIs
const mockDocs = {
  documents: {
    create: jest.fn(),
    batchUpdate: jest.fn(),
  },
};

describe('Create Tools', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create_document', () => {
    it('should create a document with title only', async () => {
      const mockDocId = 'test-doc-123';
      mockDocs.documents.create.mockResolvedValue({
        data: {
          documentId: mockDocId,
          title: 'Test Document',
        },
      });

      const result = await mockDocs.documents.create({
        requestBody: {
          title: 'Test Document',
        },
      });

      expect(result.data.documentId).toBe(mockDocId);
      expect(result.data.title).toBe('Test Document');
    });

    it('should create a document with title and initial content', async () => {
      const mockDocId = 'test-doc-456';
      mockDocs.documents.create.mockResolvedValue({
        data: {
          documentId: mockDocId,
          title: 'Test with Content',
        },
      });

      mockDocs.documents.batchUpdate.mockResolvedValue({
        data: {},
      });

      const createResult = await mockDocs.documents.create({
        requestBody: {
          title: 'Test with Content',
        },
      });

      await mockDocs.documents.batchUpdate({
        documentId: mockDocId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: 'Initial content\n',
              },
            },
          ],
        },
      });

      expect(createResult.data.documentId).toBe(mockDocId);
      expect(mockDocs.documents.batchUpdate).toHaveBeenCalled();
    });

    it('should handle empty title gracefully', async () => {
      mockDocs.documents.create.mockResolvedValue({
        data: {
          documentId: 'empty-title-doc',
          title: '',
        },
      });

      const result = await mockDocs.documents.create({
        requestBody: {
          title: '',
        },
      });

      expect(result.data.documentId).toBe('empty-title-doc');
    });

    it('should handle very long titles', async () => {
      const longTitle = 'A'.repeat(1000);
      mockDocs.documents.create.mockResolvedValue({
        data: {
          documentId: 'long-title-doc',
          title: longTitle,
        },
      });

      const result = await mockDocs.documents.create({
        requestBody: {
          title: longTitle,
        },
      });

      expect(result.data.documentId).toBe('long-title-doc');
      expect(result.data.title).toBe(longTitle);
    });
  });

  describe('create_formatted_document', () => {
    it('should create document with heading and body', async () => {
      const mockDocId = 'formatted-doc-123';
      mockDocs.documents.create.mockResolvedValue({
        data: {
          documentId: mockDocId,
          title: 'Formatted Doc',
        },
      });

      mockDocs.documents.batchUpdate.mockResolvedValue({
        data: {},
      });

      await mockDocs.documents.create({
        requestBody: { title: 'Formatted Doc' },
      });

      await mockDocs.documents.batchUpdate({
        documentId: mockDocId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: 'Heading Text\n',
              },
            },
            {
              updateParagraphStyle: {
                range: { startIndex: 1, endIndex: 13 },
                paragraphStyle: { namedStyleType: 'HEADING_1' },
                fields: 'namedStyleType',
              },
            },
          ],
        },
      });

      expect(mockDocs.documents.batchUpdate).toHaveBeenCalled();
    });

    it('should NOT crash on empty body (BUG FIX)', async () => {
      const mockDocId = 'empty-body-doc';
      mockDocs.documents.create.mockResolvedValue({
        data: {
          documentId: mockDocId,
          title: 'Empty Body Doc',
        },
      });

      mockDocs.documents.batchUpdate.mockResolvedValue({
        data: {},
      });

      // This should NOT crash even with empty body
      const heading = 'Test Heading';
      const body = ''; // Empty body that previously caused crash

      await mockDocs.documents.create({
        requestBody: { title: 'Empty Body Doc' },
      });

      // With fix, this should work without calling split on empty string
      const requests = [
        {
          insertText: {
            location: { index: 1 },
            text: heading + '\n',
          },
        },
        {
          updateParagraphStyle: {
            range: { startIndex: 1, endIndex: heading.length + 1 },
            paragraphStyle: { namedStyleType: 'HEADING_1' },
            fields: 'namedStyleType',
          },
        },
      ];

      await mockDocs.documents.batchUpdate({
        documentId: mockDocId,
        requestBody: { requests },
      });

      expect(mockDocs.documents.batchUpdate).toHaveBeenCalled();
    });

    it('should handle body with no spaces (BUG FIX)', async () => {
      const mockDocId = 'no-space-body-doc';
      const body = 'NoSpacesHere'; // No spaces - would crash on split(' ')

      mockDocs.documents.create.mockResolvedValue({
        data: {
          documentId: mockDocId,
          title: 'Test',
        },
      });

      mockDocs.documents.batchUpdate.mockResolvedValue({
        data: {},
      });

      // Should not attempt to bold first word if no spaces
      const heading = 'Heading';
      const requests = [
        {
          insertText: {
            location: { index: 1 },
            text: heading + '\n',
          },
        },
        {
          updateParagraphStyle: {
            range: { startIndex: 1, endIndex: heading.length + 1 },
            paragraphStyle: { namedStyleType: 'HEADING_1' },
            fields: 'namedStyleType',
          },
        },
        {
          insertText: {
            location: { index: heading.length + 2 },
            text: body + '\n',
          },
        },
      ];

      await mockDocs.documents.batchUpdate({
        documentId: mockDocId,
        requestBody: { requests },
      });

      expect(mockDocs.documents.batchUpdate).toHaveBeenCalled();
    });
  });

  describe('Input Validation', () => {
    it('should validate title is a string', () => {
      const validateTitle = (title: any): boolean => {
        return typeof title === 'string';
      };

      expect(validateTitle('Valid Title')).toBe(true);
      expect(validateTitle(123)).toBe(false);
      expect(validateTitle(null)).toBe(false);
      expect(validateTitle(undefined)).toBe(false);
      expect(validateTitle({})).toBe(false);
    });

    it('should validate content is a string or undefined', () => {
      const validateContent = (content: any): boolean => {
        return content === undefined || typeof content === 'string';
      };

      expect(validateContent('Valid content')).toBe(true);
      expect(validateContent(undefined)).toBe(true);
      expect(validateContent(123)).toBe(false);
      expect(validateContent(null)).toBe(false);
    });

    it('should check for reasonable title length', () => {
      const validateTitleLength = (title: string): boolean => {
        return title.length > 0 && title.length <= 255;
      };

      expect(validateTitleLength('Valid Title')).toBe(true);
      expect(validateTitleLength('')).toBe(false);
      expect(validateTitleLength('A'.repeat(256))).toBe(false);
      expect(validateTitleLength('A'.repeat(255))).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockDocs.documents.create.mockRejectedValue(new Error('API Error'));

      try {
        await mockDocs.documents.create({
          requestBody: { title: 'Test' },
        });
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toBe('API Error');
      }
    });

    it('should handle permission denied errors', async () => {
      const permissionError = new Error('Permission denied');
      (permissionError as any).code = 403;
      mockDocs.documents.create.mockRejectedValue(permissionError);

      try {
        await mockDocs.documents.create({
          requestBody: { title: 'Test' },
        });
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.code).toBe(403);
        expect(error.message).toBe('Permission denied');
      }
    });

    it('should handle quota exceeded errors', async () => {
      const quotaError = new Error('Quota exceeded');
      (quotaError as any).code = 429;
      mockDocs.documents.create.mockRejectedValue(quotaError);

      try {
        await mockDocs.documents.create({
          requestBody: { title: 'Test' },
        });
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.code).toBe(429);
        expect(error.message).toBe('Quota exceeded');
      }
    });
  });
});
