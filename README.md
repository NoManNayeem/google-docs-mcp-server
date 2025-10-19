# LLM2Docs (Unofficial)
### google-docs-mcp-server

<div align="center">

![LLM2Docs Logo](https://img.shields.io/badge/LLM2Docs-Unofficial-blue?style=for-the-badge&logo=google-docs)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)

**Unofficial MCP bridge between LLMs and Google Docs**

[Quick Start](#quick-start) • [Documentation](#documentation) • [Features](#features) • [Contributing](#contributing)

</div>

---

## Overview

LLM2Docs is an unofficial Model Context Protocol (MCP) server for Google Docs. It lets large language models securely access, read, and interact with your documents — enabling smarter workflows and AI-assisted editing.

### Key Benefits

- **AI-Powered**: Seamless integration with Claude Desktop and other LLMs
- **Comprehensive**: 40+ tools for complete document management
- **Professional**: Advanced formatting for technical documentation
- **Efficient**: Batch operations and smart automation
- **Secure**: OAuth 2.0 authentication with Google APIs
- **Unofficial**: Built by the community, for the community

---

## Quick Start

### Prerequisites

- **Node.js 18+** installed
- **Google Cloud Project** with APIs enabled
- **Claude Desktop** for AI integration

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NoManNayeem/google-docs-mcp-server.git
   cd google-docs-mcp-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Google Cloud credentials**
   - Create a Google Cloud Project
   - Enable Google Docs API and Google Drive API
   - Download `credentials.json` to the project root

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Configure Claude Desktop**
   Add to your `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "llm2docs": {
         "command": "node",
         "args": ["/path/to/google-docs-mcp-server/build/index.js"],
         "env": {
           "NODE_ENV": "production"
         }
       }
     }
   }
   ```

6. **Start using with Claude Desktop**
   - Restart Claude Desktop
   - Begin with: *"Create a new Google Doc with a title and some content"*

---

## Features

### Document Management
- **Create Documents**: New Google Docs with optional initial content
- **Read Documents**: Complete document content retrieval
- **Search Documents**: Find documents by name across your Drive
- **Document Metadata**: Access creation dates, owners, and properties

### Text Operations
- **Append Text**: Add content to document ends
- **Insert Text**: Place content at specific positions
- **Delete Text**: Remove content from specified ranges
- **Replace Text**: Find and replace text with precision

### Font Management
- **Font Family**: Change fonts (Arial, Times New Roman, Calibri, etc.)
- **Font Size**: Precise point-based sizing
- **Font Weight**: Bold/normal control
- **Font Style**: Italic/normal formatting
- **Comprehensive Formatting**: Apply multiple font changes simultaneously

### Lists & Spacing
- **Bulleted Lists**: Create with different bullet styles
- **Numbered Lists**: Various numbering formats (decimal, roman, alpha)
- **Line Spacing**: Single, 1.5x, double, or custom spacing
- **Paragraph Spacing**: Control before/after paragraph spacing

### Text Formatting
- **Case Transformation**: Uppercase, lowercase, title case
- **Subscript/Superscript**: Scientific notation support
- **Text Styling**: Bold, italic, underline, strikethrough
- **Colors**: Foreground and background color control
- **Headings**: H1-H6, title, and subtitle styles

### Advanced Tables
- **Table Formatting**: Borders, colors, and professional styling
- **Cell Management**: Merge cells horizontally or vertically
- **Row/Column Operations**: Insert, delete, and manage table structure
- **Column Widths**: Precise control over table dimensions
- **Header Rows**: Professional table headers with formatting

### Media & Images
- **Image Insertion**: From URLs with automatic sizing
- **Image Resizing**: Precise dimension control
- **Image Alignment**: Left, center, right positioning
- **Image Captions**: Accessibility-focused captions
- **Drawings**: Insert shapes, arrows, and diagrams

### Document Structure
- **Table of Contents**: Auto-generated navigation
- **Section Breaks**: Next page, continuous, even/odd page breaks
- **Bookmarks**: Named anchors for navigation
- **Cross-References**: Link to bookmarks and headings
- **Headers & Footers**: Professional document headers with page numbers
- **Footnotes**: Academic-style citations and notes

### Search & Content Management
- **Find & Replace**: Case-sensitive text replacement
- **Document Search**: Find text with context and positions
- **Word Count**: Comprehensive document statistics
- **Spell Check**: Automated spelling suggestions
- **Content Analysis**: Character counts, paragraph analysis

---

## Documentation

### Use Cases

#### Technical Documentation
```bash
# Create a technical manual
"Create a new document titled 'API Documentation' with a table of contents"

# Format code blocks
"Format the code examples with monospace font and syntax highlighting"

# Add cross-references
"Create a bookmark called 'authentication' and link to it from the overview"
```

#### Content Creation
```bash
# Professional formatting
"Make the title bold, 24pt, and center-aligned"

# Create structured content
"Create a bulleted list of features and a numbered list of steps"

# Add media
"Insert an image from this URL and add a caption"
```

#### Document Management
```bash
# Search and organize
"Find all documents containing 'project' in the title"

# Batch operations
"Replace all instances of 'old-version' with 'new-version'"

# Quality control
"Check spelling in this document and get word count statistics"
```

### Advanced Configuration

#### Environment Variables
```bash
NODE_ENV=production
LOG_LEVEL=info
GOOGLE_CREDENTIALS_PATH=./credentials.json
```

#### Custom Authentication
```javascript
// Custom OAuth configuration
const authConfig = {
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'http://localhost:3000/callback'
};
```

---

## Architecture

### Core Components

```
google-docs-mcp-server/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── auth.ts               # OAuth 2.0 authentication
│   ├── types.ts              # TypeScript definitions
│   └── tools/
│       ├── create.ts         # Document creation tools
│       ├── read.ts           # Reading and search tools
│       ├── update.ts         # Text modification tools
│       ├── format.ts         # Formatting and styling tools
│       ├── tables.ts         # Advanced table management
│       ├── media.ts          # Image and media handling
│       ├── structure.ts      # Document structure tools
│       └── search.ts         # Search and content management
├── build/                    # Compiled JavaScript
├── docs/                     # Documentation website
└── package.json              # Project configuration
```

### Tool Categories

| Category | Tools | Purpose |
|----------|-------|---------|
| **Document** | 4 tools | Create, read, search documents |
| **Text** | 4 tools | Modify and manipulate text |
| **Font** | 5 tools | Complete font management |
| **Lists** | 2 tools | Bulleted and numbered lists |
| **Formatting** | 8 tools | Text styling and alignment |
| **Tables** | 7 tools | Advanced table operations |
| **Media** | 5 tools | Images and drawings |
| **Structure** | 6 tools | Document organization |
| **Search** | 4 tools | Content discovery and management |

---

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Write comprehensive tests
- Document new features

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Anthropic** for the Model Context Protocol specification
- **Google** for the comprehensive Docs and Drive APIs
- **Claude AI** for seamless integration capabilities
- **Open Source Community** for inspiration and support

---

## Support

- **Documentation**: [https://nomanayeem.github.io/google-docs-mcp-server](https://nomanayeem.github.io/google-docs-mcp-server)
- **Issues**: [GitHub Issues](https://github.com/NoManNayeem/google-docs-mcp-server/issues)
- **Discussions**: [GitHub Discussions](https://github.com/NoManNayeem/google-docs-mcp-server/discussions)

---

<div align="center">

**Made with ❤️ for the AI and documentation community**

[⭐ Star this repo](https://github.com/NoManNayeem/google-docs-mcp-server) • [🐛 Report Bug](https://github.com/NoManNayeem/google-docs-mcp-server/issues) • [💡 Request Feature](https://github.com/NoManNayeem/google-docs-mcp-server/issues)

</div>