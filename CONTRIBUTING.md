# Contributing to LLM2Docs (google-docs-mcp-server)

Thank you for your interest in contributing to LLM2Docs! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

- **Bug Reports**: Use the [GitHub Issues](https://github.com/NoManNayeem/google-docs-mcp-server/issues) to report bugs
- **Feature Requests**: Submit feature requests with detailed descriptions
- **Documentation**: Help improve our documentation

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/NoManNayeem/google-docs-mcp-server.git
   cd google-docs-mcp-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Follow the coding standards
   - Add tests for new features
   - Update documentation

5. **Test your changes**
   ```bash
   npm run build
   npm test
   ```

6. **Commit your changes**
   ```bash
   git commit -m 'Add: your feature description'
   ```

7. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📋 Development Guidelines

### Code Style

- Use **TypeScript** for type safety
- Follow **ESLint** configuration
- Use **Prettier** for code formatting
- Write **comprehensive comments**

### Commit Messages

Use conventional commit format:
```
type(scope): description

Examples:
feat(tools): add new table formatting tool
fix(auth): resolve OAuth token refresh issue
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create a descriptive title**
2. **Provide detailed description**
3. **Link related issues**
4. **Include screenshots** (if applicable)
5. **Ensure all checks pass**

## 🛠️ Project Structure

```
google-docs-mcp-server/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── auth.ts               # OAuth 2.0 authentication
│   ├── types.ts              # TypeScript definitions
│   └── tools/                # Tool implementations
│       ├── create.ts         # Document creation
│       ├── read.ts           # Reading and search
│       ├── update.ts         # Text modification
│       ├── format.ts         # Formatting tools
│       ├── tables.ts         # Table management
│       ├── media.ts          # Media handling
│       ├── structure.ts      # Document structure
│       └── search.ts         # Search functionality
├── docs/                     # Documentation website
├── build/                    # Compiled output
└── package.json              # Project configuration
```

## 🧪 Testing

### Manual Testing

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Test with Claude Desktop**
   - Configure the MCP server
   - Test various tool functions
   - Verify error handling

3. **Test authentication**
   - OAuth flow
   - Token refresh
   - Error scenarios

### Automated Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 📚 Documentation

### Code Documentation

- **JSDoc comments** for all functions
- **Type definitions** for all interfaces
- **README updates** for new features

### API Documentation

- **Tool descriptions** in tool registration
- **Parameter documentation** with Zod schemas
- **Example usage** in comments

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment details**
   - Node.js version
   - Operating system
   - Claude Desktop version

2. **Steps to reproduce**
   - Clear, numbered steps
   - Expected vs actual behavior

3. **Error messages**
   - Full error logs
   - Stack traces

4. **Additional context**
   - Screenshots
   - Configuration files (sanitized)

## 💡 Feature Requests

When requesting features:

1. **Clear description** of the feature
2. **Use case examples** and scenarios
3. **Proposed implementation** (if you have ideas)
4. **Alternative solutions** considered

## 🏷️ Labels

We use the following labels:

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `question`: Further information is requested

## 📞 Getting Help

- **GitHub Discussions**: For questions and general discussion
- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: Check the [docs website](https://nomanayeem.github.io/google-docs-mcp-server)

## 🎯 Roadmap

### Short Term
- [ ] Add comprehensive test suite
- [ ] Implement export functionality
- [ ] Add collaboration features
- [ ] Performance optimizations

### Long Term
- [ ] Multi-language support
- [ ] Advanced AI features
- [ ] Plugin system
- [ ] Enterprise features

## 📄 License

By contributing to LLM2Docs, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page

## 📋 Checklist

Before submitting a PR:

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Commit messages are clear
- [ ] PR description is comprehensive

Thank you for contributing to LLM2Docs! 🚀
