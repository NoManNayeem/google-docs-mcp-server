/**
 * Validation utilities for Google Docs MCP Server
 * Provides input validation and sanitization for all tools
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates a Google Docs document ID format
 */
export function validateDocumentId(documentId: string): void {
  if (!documentId || typeof documentId !== 'string') {
    throw new ValidationError('Document ID must be a non-empty string', 'documentId');
  }

  // Google Docs IDs are typically 44 characters long (base64url encoded)
  if (documentId.length < 10 || documentId.length > 100) {
    throw new ValidationError('Document ID has invalid length', 'documentId');
  }

  // Should only contain alphanumeric characters, hyphens, and underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(documentId)) {
    throw new ValidationError('Document ID contains invalid characters', 'documentId');
  }
}

/**
 * Validates an index position in a document
 */
export function validateIndex(index: number, fieldName: string = 'index'): void {
  if (typeof index !== 'number') {
    throw new ValidationError('Index must be a number', fieldName);
  }

  if (!Number.isInteger(index)) {
    throw new ValidationError('Index must be an integer', fieldName);
  }

  if (index < 0) {
    throw new ValidationError('Index must be non-negative', fieldName);
  }

  // Google Docs has a practical limit of ~1,000,000 characters
  if (index > 1000000) {
    throw new ValidationError('Index exceeds maximum document size', fieldName);
  }
}

/**
 * Validates a range (startIndex, endIndex)
 */
export function validateRange(startIndex: number, endIndex: number): void {
  validateIndex(startIndex, 'startIndex');
  validateIndex(endIndex, 'endIndex');

  if (startIndex >= endIndex) {
    throw new ValidationError('startIndex must be less than endIndex');
  }

  const rangeSize = endIndex - startIndex;
  if (rangeSize > 100000) {
    throw new ValidationError('Range size exceeds maximum (100,000 characters)');
  }
}

/**
 * Validates text content
 */
export function validateText(text: string, maxLength: number = 100000): void {
  if (typeof text !== 'string') {
    throw new ValidationError('Text must be a string', 'text');
  }

  if (text.length > maxLength) {
    throw new ValidationError(`Text exceeds maximum length of ${maxLength} characters`, 'text');
  }
}

/**
 * Validates a title
 */
export function validateTitle(title: string): void {
  if (typeof title !== 'string') {
    throw new ValidationError('Title must be a string', 'title');
  }

  if (title.length === 0) {
    throw new ValidationError('Title cannot be empty', 'title');
  }

  if (title.length > 255) {
    throw new ValidationError('Title cannot exceed 255 characters', 'title');
  }
}

/**
 * Validates a color value (0-1 range for RGB)
 */
export function validateColor(value: number, componentName: string): void {
  if (typeof value !== 'number') {
    throw new ValidationError(`${componentName} must be a number`, componentName);
  }

  if (value < 0 || value > 1) {
    throw new ValidationError(`${componentName} must be between 0 and 1`, componentName);
  }
}

/**
 * Validates RGB color object
 */
export function validateRGBColor(color: { red: number; green: number; blue: number }): void {
  if (!color || typeof color !== 'object') {
    throw new ValidationError('Color must be an object with red, green, blue properties');
  }

  validateColor(color.red, 'red');
  validateColor(color.green, 'green');
  validateColor(color.blue, 'blue');
}

/**
 * Validates font size
 */
export function validateFontSize(size: number): void {
  if (typeof size !== 'number') {
    throw new ValidationError('Font size must be a number', 'fontSize');
  }

  if (!Number.isFinite(size)) {
    throw new ValidationError('Font size must be a finite number', 'fontSize');
  }

  if (size < 6 || size > 400) {
    throw new ValidationError('Font size must be between 6 and 400 points', 'fontSize');
  }
}

/**
 * Validates a URL
 */
export function validateURL(url: string): void {
  if (typeof url !== 'string') {
    throw new ValidationError('URL must be a string', 'url');
  }

  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new ValidationError('URL must use HTTP or HTTPS protocol', 'url');
    }
  } catch {
    throw new ValidationError('Invalid URL format', 'url');
  }
}

/**
 * Validates table dimensions
 */
export function validateTableDimensions(rows: number, columns: number): void {
  if (typeof rows !== 'number' || typeof columns !== 'number') {
    throw new ValidationError('Rows and columns must be numbers');
  }

  if (!Number.isInteger(rows) || !Number.isInteger(columns)) {
    throw new ValidationError('Rows and columns must be integers');
  }

  if (rows < 1 || rows > 20) {
    throw new ValidationError('Rows must be between 1 and 20', 'rows');
  }

  if (columns < 1 || columns > 20) {
    throw new ValidationError('Columns must be between 1 and 20', 'columns');
  }
}

/**
 * Validates image dimensions
 */
export function validateImageDimensions(width: number, height: number): void {
  if (typeof width !== 'number' || typeof height !== 'number') {
    throw new ValidationError('Width and height must be numbers');
  }

  if (width <= 0 || height <= 0) {
    throw new ValidationError('Width and height must be positive');
  }

  if (width > 3000 || height > 3000) {
    throw new ValidationError('Image dimensions cannot exceed 3000 pixels');
  }
}

/**
 * Sanitizes text input to prevent injection attacks
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  // Remove null bytes
  text = text.replace(/\0/g, '');

  // Normalize Unicode
  text = text.normalize('NFC');

  return text;
}

/**
 * Sanitizes search query to prevent injection
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') {
    return '';
  }

  // Escape single quotes for Google Drive API queries
  query = query.replace(/'/g, "\\'");

  // Remove potentially dangerous characters
  query = query.replace(/[<>]/g, '');

  return sanitizeText(query);
}

/**
 * Validates alignment value
 */
export function validateAlignment(alignment: string): void {
  const validAlignments = ['START', 'CENTER', 'END', 'JUSTIFIED'];

  if (!validAlignments.includes(alignment)) {
    throw new ValidationError(
      `Alignment must be one of: ${validAlignments.join(', ')}`,
      'alignment'
    );
  }
}

/**
 * Validates heading style
 */
export function validateHeadingStyle(style: string): void {
  const validStyles = [
    'NORMAL_TEXT',
    'HEADING_1',
    'HEADING_2',
    'HEADING_3',
    'HEADING_4',
    'HEADING_5',
    'HEADING_6',
    'TITLE',
    'SUBTITLE'
  ];

  if (!validStyles.includes(style)) {
    throw new ValidationError(
      `Heading style must be one of: ${validStyles.join(', ')}`,
      'headingStyle'
    );
  }
}

/**
 * Validates line spacing
 */
export function validateLineSpacing(spacing: number): void {
  if (typeof spacing !== 'number') {
    throw new ValidationError('Line spacing must be a number', 'lineSpacing');
  }

  if (spacing < 0.5 || spacing > 10) {
    throw new ValidationError('Line spacing must be between 0.5 and 10', 'lineSpacing');
  }
}

/**
 * Validates list nesting level
 */
export function validateNestingLevel(level: number): void {
  if (typeof level !== 'number' || !Number.isInteger(level)) {
    throw new ValidationError('Nesting level must be an integer', 'nestingLevel');
  }

  if (level < 0 || level > 8) {
    throw new ValidationError('Nesting level must be between 0 and 8', 'nestingLevel');
  }
}

/**
 * Comprehensive input validator for batch operations
 */
export function validateBatchRequests(requests: any[]): void {
  if (!Array.isArray(requests)) {
    throw new ValidationError('Requests must be an array');
  }

  if (requests.length === 0) {
    throw new ValidationError('Requests array cannot be empty');
  }

  if (requests.length > 500) {
    throw new ValidationError('Cannot process more than 500 requests in a single batch');
  }
}

/**
 * Error code mapping for better error messages
 */
export enum ErrorCode {
  INVALID_DOCUMENT_ID = 'INVALID_DOCUMENT_ID',
  INVALID_INDEX = 'INVALID_INDEX',
  INVALID_RANGE = 'INVALID_RANGE',
  INVALID_TEXT = 'INVALID_TEXT',
  INVALID_URL = 'INVALID_URL',
  INVALID_COLOR = 'INVALID_COLOR',
  INVALID_DIMENSIONS = 'INVALID_DIMENSIONS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

/**
 * Maps Google API errors to friendly error codes
 */
export function mapApiError(error: any): { code: ErrorCode; message: string } {
  const statusCode = error.code || error.status;

  switch (statusCode) {
    case 400:
      return {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid request parameters'
      };
    case 403:
      return {
        code: ErrorCode.PERMISSION_DENIED,
        message: 'Permission denied. Please check document sharing settings.'
      };
    case 404:
      return {
        code: ErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Document not found or has been deleted.'
      };
    case 429:
      return {
        code: ErrorCode.QUOTA_EXCEEDED,
        message: 'API quota exceeded. Please try again later.'
      };
    case 500:
    case 502:
    case 503:
      return {
        code: ErrorCode.API_ERROR,
        message: 'Google API is temporarily unavailable. Please try again.'
      };
    default:
      return {
        code: ErrorCode.API_ERROR,
        message: error.message || 'An unexpected error occurred'
      };
  }
}
