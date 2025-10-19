// Type definitions for Google Docs MCP Server

export interface DocumentInfo {
  documentId: string;
  title: string;
  documentUrl: string;
}

export interface DocumentContent {
  title: string;
  content: string;
  documentId: string;
}

export interface SearchResult {
  id: string;
  name: string;
  url: string;
}

export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: {
    magnitude: number;
    unit: string;
  };
  foregroundColor?: {
    color: {
      rgbColor: {
        red: number;
        green: number;
        blue: number;
      };
    };
  };
  backgroundColor?: {
    color: {
      rgbColor: {
        red: number;
        green: number;
        blue: number;
      };
    };
  };
  link?: {
    url: string;
  };
  baselineOffset?: 'SUPERSCRIPT' | 'SUBSCRIPT' | 'NONE';
}

export interface ParagraphStyle {
  namedStyleType?: 'NORMAL_TEXT' | 'HEADING_1' | 'HEADING_2' | 'HEADING_3' | 'HEADING_4' | 'HEADING_5' | 'HEADING_6' | 'TITLE' | 'SUBTITLE';
  alignment?: 'START' | 'CENTER' | 'END' | 'JUSTIFIED';
  lineSpacing?: number;
  indentStart?: {
    magnitude: number;
    unit: string;
  };
  indentEnd?: {
    magnitude: number;
    unit: string;
  };
  indentFirstLine?: {
    magnitude: number;
    unit: string;
  };
}

export interface ToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  structuredContent?: any;
  isError?: boolean;
}

export interface BatchUpdateRequest {
  insertText?: {
    location: { index: number } | { endOfSegmentLocation: { segmentId: string } };
    text: string;
  };
  deleteContentRange?: {
    range: {
      startIndex: number;
      endIndex: number;
    };
  };
  updateTextStyle?: {
    range: {
      startIndex: number;
      endIndex: number;
    };
    textStyle: TextStyle;
    fields: string;
  };
  updateParagraphStyle?: {
    range: {
      startIndex: number;
      endIndex: number;
    };
    paragraphStyle: ParagraphStyle;
    fields: string;
  };
  insertTable?: {
    location: { index: number };
    rows: number;
    columns: number;
  };
  insertPageBreak?: {
    location: { index: number };
  };
}
