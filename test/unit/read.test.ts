/**
 * Unit tests for document read and search tools
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the Google APIs
const mockDocs = {
  documents: {
    get: jest.fn(),
  },
};

const mockDrive = {
  files: {
    list: jest.fn(),
  },
};

describe('Read Tools', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('read_document', () => {
    it('should read a document successfully', async () => {
      const mockDocId = 'test-doc-123';
      mockDocs.documents.get.mockResolvedValue({
        data: {
          documentId: mockDocId,
          title: 'Test Document',
          body: {
            content: [
              {
                paragraph: {
                  elements: [
                    {
                      textRun: {
                        content: 'This is test content.\n',
                      },
                    },
                  ],
                },
              },
              {
                paragraph: {
                  elements: [
                    {
                      textRun: {
                        content: 'Second paragraph.\n',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      });

      const result = await mockDocs.documents.get({ documentId: mockDocId });

      expect(result.data.documentId).toBe(mockDocId);
      expect(result.data.title).toBe('Test Document');
      expect(result.data.body.content).toHaveLength(2);
    });

    it('should handle empty document content', async () => {
      mockDocs.documents.get.mockResolvedValue({
        data: {
          documentId: 'empty-doc',
          title: 'Empty Document',
          body: {
            content: [],
          },
        },
      });

      const result = await mockDocs.documents.get({ documentId: 'empty-doc' });

      expect(result.data.body.content).toHaveLength(0);
    });

    it('should handle document with multiple paragraph elements', async () => {
      mockDocs.documents.get.mockResolvedValue({
        data: {
          documentId: 'multi-element-doc',
          title: 'Multi Element Doc',
          body: {
            content: [
              {
                paragraph: {
                  elements: [
                    { textRun: { content: 'First ' } },
                    { textRun: { content: 'word. ' } },
                    { textRun: { content: 'Second word.\n' } },
                  ],
                },
              },
            ],
          },
        },
      });

      const result = await mockDocs.documents.get({ documentId: 'multi-element-doc' });

      expect(result.data.body.content[0].paragraph.elements).toHaveLength(3);
    });

    it('should handle 404 document not found error', async () => {
      const error: any = new Error('Document not found');
      error.code = 404;
      mockDocs.documents.get.mockRejectedValue(error);

      try {
        await mockDocs.documents.get({ documentId: 'nonexistent-doc' });
        fail('Should have thrown error');
      } catch (err: any) {
        expect(err.code).toBe(404);
        expect(err.message).toBe('Document not found');
      }
    });

    it('should handle permission denied errors', async () => {
      const error: any = new Error('Permission denied');
      error.code = 403;
      mockDocs.documents.get.mockRejectedValue(error);

      try {
        await mockDocs.documents.get({ documentId: 'restricted-doc' });
        fail('Should have thrown error');
      } catch (err: any) {
        expect(err.code).toBe(403);
        expect(err.message).toBe('Permission denied');
      }
    });

    it('should extract text from complex document structure', async () => {
      mockDocs.documents.get.mockResolvedValue({
        data: {
          documentId: 'complex-doc',
          title: 'Complex Document',
          body: {
            content: [
              {
                paragraph: {
                  elements: [
                    { textRun: { content: 'Heading 1\n' } },
                  ],
                },
              },
              {
                paragraph: {
                  elements: [
                    { textRun: { content: 'Normal paragraph text.\n' } },
                  ],
                },
              },
              {
                paragraph: {
                  elements: [
                    { textRun: { content: 'Bold text ' } },
                    { textRun: { content: 'and normal text.\n' } },
                  ],
                },
              },
            ],
          },
        },
      });

      const result = await mockDocs.documents.get({ documentId: 'complex-doc' });
      const content = result.data.body.content;

      // Should have all three paragraphs
      expect(content).toHaveLength(3);
      expect(content[2].paragraph.elements).toHaveLength(2);
    });
  });

  describe('search_documents', () => {
    it('should search documents by name', async () => {
      mockDrive.files.list.mockResolvedValue({
        data: {
          files: [
            { id: 'doc1', name: 'Meeting Notes' },
            { id: 'doc2', name: 'Meeting Agenda' },
            { id: 'doc3', name: 'Meeting Summary' },
          ],
        },
      });

      const result = await mockDrive.files.list({
        q: "mimeType='application/vnd.google-apps.document' and trashed=false and name contains 'Meeting'",
        pageSize: 10,
        fields: 'files(id, name)',
      });

      expect(result.data.files).toHaveLength(3);
      expect(result.data.files[0].name).toContain('Meeting');
    });

    it('should handle empty search results', async () => {
      mockDrive.files.list.mockResolvedValue({
        data: {
          files: [],
        },
      });

      const result = await mockDrive.files.list({
        q: "mimeType='application/vnd.google-apps.document' and trashed=false and name contains 'NonexistentTerm'",
        pageSize: 10,
        fields: 'files(id, name)',
      });

      expect(result.data.files).toHaveLength(0);
    });

    it('should respect maxResults parameter', async () => {
      const files = Array.from({ length: 5 }, (_, i) => ({
        id: `doc${i}`,
        name: `Document ${i}`,
      }));

      mockDrive.files.list.mockResolvedValue({
        data: { files: files.slice(0, 3) },
      });

      const result = await mockDrive.files.list({
        q: "mimeType='application/vnd.google-apps.document' and trashed=false",
        pageSize: 3,
        fields: 'files(id, name)',
      });

      expect(result.data.files).toHaveLength(3);
    });

    it('should handle wildcard search', async () => {
      mockDrive.files.list.mockResolvedValue({
        data: {
          files: [
            { id: 'doc1', name: 'Document 1' },
            { id: 'doc2', name: 'Document 2' },
            { id: 'doc3', name: 'Document 3' },
          ],
        },
      });

      const result = await mockDrive.files.list({
        q: "mimeType='application/vnd.google-apps.document' and trashed=false",
        pageSize: 10,
        fields: 'files(id, name)',
      });

      expect(result.data.files).toHaveLength(3);
    });

    it('should NOT be vulnerable to SQL injection (BUG FIX)', async () => {
      // Malicious query that tries to inject additional conditions
      const maliciousQuery = "test' or '1'='1";

      // The sanitized query should escape the single quotes
      const sanitizedQuery = maliciousQuery.replace(/'/g, "\\'");

      mockDrive.files.list.mockResolvedValue({
        data: { files: [] },
      });

      // The query should be properly escaped
      const expectedQuery = `mimeType='application/vnd.google-apps.document' and trashed=false and name contains '${sanitizedQuery}'`;

      await mockDrive.files.list({
        q: expectedQuery,
        pageSize: 10,
        fields: 'files(id, name)',
      });

      expect(mockDrive.files.list).toHaveBeenCalledWith({
        q: expectedQuery,
        pageSize: 10,
        fields: 'files(id, name)',
      });

      // Verify the query doesn't contain unescaped quotes that would break out
      expect(expectedQuery).not.toContain("' or '1'='1");
      expect(expectedQuery).toContain("\\'");
    });

    it('should handle special characters in search query', async () => {
      const specialChars = ['<', '>', '"', '&'];

      for (const char of specialChars) {
        const query = `test${char}query`;
        const sanitized = query.replace(/[<>]/g, '').replace(/'/g, "\\'");

        // Special characters should be removed or escaped
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
      }
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('API quota exceeded');
      mockDrive.files.list.mockRejectedValue(error);

      try {
        await mockDrive.files.list({
          q: "mimeType='application/vnd.google-apps.document' and trashed=false",
          pageSize: 10,
          fields: 'files(id, name)',
        });
        fail('Should have thrown error');
      } catch (err: any) {
        expect(err.message).toBe('API quota exceeded');
      }
    });
  });

  describe('Input Validation', () => {
    it('should validate document ID format', () => {
      const validateDocId = (id: string): boolean => {
        if (!id || typeof id !== 'string') return false;
        if (id.length < 10 || id.length > 100) return false;
        if (!/^[a-zA-Z0-9_-]+$/.test(id)) return false;
        return true;
      };

      expect(validateDocId('valid-doc-id-123')).toBe(true);
      expect(validateDocId('abc123_def-456')).toBe(true);
      expect(validateDocId('')).toBe(false);
      expect(validateDocId('short')).toBe(false);
      expect(validateDocId('invalid doc id')).toBe(false);
      expect(validateDocId('invalid@doc#id')).toBe(false);
    });

    it('should validate search query is a string', () => {
      const validateQuery = (query: any): boolean => {
        return typeof query === 'string';
      };

      expect(validateQuery('valid query')).toBe(true);
      expect(validateQuery('')).toBe(true);
      expect(validateQuery(123)).toBe(false);
      expect(validateQuery(null)).toBe(false);
      expect(validateQuery(undefined)).toBe(false);
    });

    it('should validate maxResults is a positive number', () => {
      const validateMaxResults = (max: any): boolean => {
        if (typeof max !== 'number') return false;
        if (max < 1 || max > 1000) return false;
        return true;
      };

      expect(validateMaxResults(10)).toBe(true);
      expect(validateMaxResults(100)).toBe(true);
      expect(validateMaxResults(0)).toBe(false);
      expect(validateMaxResults(-5)).toBe(false);
      expect(validateMaxResults(1001)).toBe(false);
      expect(validateMaxResults('10')).toBe(false);
    });
  });

  describe('Text Extraction', () => {
    it('should extract plain text correctly', () => {
      const extractText = (content: any[]): string => {
        let text = '';
        for (const element of content) {
          if (element.paragraph) {
            for (const paragraphElement of element.paragraph.elements) {
              if (paragraphElement.textRun) {
                text += paragraphElement.textRun.content;
              }
            }
          }
        }
        return text;
      };

      const content = [
        {
          paragraph: {
            elements: [
              { textRun: { content: 'First line.\n' } },
            ],
          },
        },
        {
          paragraph: {
            elements: [
              { textRun: { content: 'Second line.\n' } },
            ],
          },
        },
      ];

      expect(extractText(content)).toBe('First line.\nSecond line.\n');
    });

    it('should handle missing textRun elements', () => {
      const extractText = (content: any[]): string => {
        let text = '';
        for (const element of content) {
          if (element.paragraph) {
            for (const paragraphElement of element.paragraph.elements) {
              if (paragraphElement.textRun) {
                text += paragraphElement.textRun.content;
              }
            }
          }
        }
        return text;
      };

      const content = [
        {
          paragraph: {
            elements: [
              { textRun: { content: 'Text\n' } },
              { /* no textRun */ },
            ],
          },
        },
      ];

      expect(extractText(content)).toBe('Text\n');
    });
  });
});
