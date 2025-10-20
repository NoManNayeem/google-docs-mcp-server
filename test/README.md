# Test Suite for Google Docs MCP Server

This directory contains comprehensive tests for the LLM2Docs MCP server.

## Structure

```
test/
├── unit/                 # Unit tests for individual modules
│   ├── create.test.ts    # Tests for document creation
│   ├── read.test.ts      # Tests for document reading
│   ├── update.test.ts    # Tests for document updates
│   ├── format.test.ts    # Tests for formatting operations
│   ├── tables.test.ts    # Tests for table operations
│   ├── media.test.ts     # Tests for media operations
│   ├── structure.test.ts # Tests for document structure
│   └── search.test.ts    # Tests for search operations
├── integration/          # Integration tests
│   ├── auth.test.ts      # Authentication flow tests
│   └── e2e.test.ts       # End-to-end workflow tests
├── fixtures/             # Test data and fixtures
│   ├── sample-docs.json  # Sample document structures
│   └── mock-responses.json # Mock API responses
└── README.md            # This file
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run only integration tests
```bash
npm run test:integration
```

### Run specific test file
```bash
npx jest test/unit/create.test.ts
```

## Test Coverage Goals

- **Overall Coverage**: > 80%
- **Critical Paths**: 100%
- **Error Handling**: 100%
- **Input Validation**: 100%

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('ToolName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle valid input', async () => {
    // Arrange
    const input = { ... };

    // Act
    const result = await toolFunction(input);

    // Assert
    expect(result).toBeDefined();
  });

  it('should handle invalid input', async () => {
    // Arrange
    const invalidInput = { ... };

    // Act & Assert
    await expect(toolFunction(invalidInput)).rejects.toThrow();
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect } from '@jest/globals';

describe('E2E: Document Creation Workflow', () => {
  it('should create, format, and share document', async () => {
    // Create document
    const doc = await createDocument('Test Doc');

    // Format content
    await formatText(doc.id, 1, 10, { bold: true });

    // Share document
    await shareDocument(doc.id, 'user@example.com');

    // Verify
    const content = await readDocument(doc.id);
    expect(content).toBeDefined();
  });
});
```

## Mock Data

Test mocks are provided for:
- Google Docs API responses
- Google Drive API responses
- OAuth2 authentication
- Document structures
- Error responses

## Continuous Integration

Tests run automatically on:
- Every pull request
- Every push to main branch
- Scheduled daily runs

## Known Issues / Limitations

1. **Integration tests require credentials** - Set up test credentials in CI/CD
2. **Rate limiting** - Integration tests may hit API quotas
3. **Async timing** - Some tests may be timing-sensitive

## Critical Bugs Fixed

### Bug #1: Empty Body Crash (create.ts)
**Status**: ✅ FIXED
**Description**: `body.split(' ')[0]` crashed when body was empty or had no spaces
**Test**: `test/unit/create.test.ts` - "should NOT crash on empty body"

### Bug #2: Hardcoded Object ID (media.ts)
**Status**: ⚠️ REQUIRES MANUAL FIX
**Description**: `objectId: 'image'` hardcoded, needs dynamic retrieval
**Test**: `test/unit/media.test.ts` - "should resize with valid object ID"

### Bug #3: Case-Insensitive Search Index Bug (search.ts)
**Status**: ⚠️ REQUIRES MANUAL FIX
**Description**: indexOf on lowercased text but deletes from original indexes
**Test**: `test/unit/search.test.ts` - "should find and replace case-insensitively"

### Bug #4: SQL Injection in Query (read.ts)
**Status**: ⚠️ REQUIRES MANUAL FIX
**Description**: Query concatenation vulnerable to injection
**Test**: `test/unit/read.test.ts` - "should sanitize search queries"

### Bug #5: Headers/Footers Text Not Inserted (structure.ts)
**Status**: ⚠️ REQUIRES MANUAL FIX
**Description**: Header/footer created but text parameter ignored
**Test**: `test/unit/structure.test.ts` - "should insert header with text"

### Bug #6: Unused Parameters (format.ts, structure.ts)
**Status**: 📝 DOCUMENTED
**Description**: bulletStyle, numberingFormat, maxDepth parameters defined but unused
**Test**: `test/unit/format.test.ts` - "should apply bullet style parameter"

### Bug #7: Mock Spell Check (search.ts)
**Status**: 📝 DOCUMENTED
**Description**: Spell check is mock implementation, not functional
**Test**: `test/unit/search.test.ts` - "should return mock spell check results"

## Adding New Tests

When adding new features, always:

1. **Write tests first** (TDD approach)
2. **Cover happy path** (valid input, expected output)
3. **Cover edge cases** (empty strings, null, undefined, max values)
4. **Cover error cases** (invalid input, API errors, permissions)
5. **Test async behavior** (promises, error handling)
6. **Test integration** (multiple tools working together)

## Test Best Practices

✅ **DO:**
- Use descriptive test names
- Test one thing per test
- Use arrange-act-assert pattern
- Mock external dependencies
- Clean up after tests
- Use TypeScript for type safety

❌ **DON'T:**
- Write tests that depend on other tests
- Use real credentials in tests
- Make actual API calls in unit tests
- Test implementation details
- Ignore failing tests
- Skip error cases

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)
- [Google Docs API Reference](https://developers.google.com/docs/api/reference/rest)
- [MCP SDK Documentation](https://modelcontextprotocol.io/)

## Contributing

When contributing tests:

1. Follow existing test patterns
2. Ensure all tests pass before submitting PR
3. Maintain or improve coverage percentage
4. Document any new test utilities
5. Update this README if adding new test categories

## Questions?

For questions about testing, please:
- Open an issue on GitHub
- Check existing test examples
- Review Jest documentation
- Ask in discussions forum

---

**Last Updated**: 2024
**Test Framework**: Jest 29.7.0
**Coverage Tool**: Istanbul (via Jest)
