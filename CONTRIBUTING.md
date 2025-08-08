# Contributing to Bullhorn Bridge

Thank you for your interest in contributing to Bullhorn Bridge! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- TypeScript knowledge
- Familiarity with Bullhorn ATS (helpful but not required)

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/bullhorn-bridge.git
   cd bullhorn-bridge
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Building

```bash
# Build all formats (CommonJS, ESM, TypeScript definitions)
npm run build:simple

# Build individual targets
npm run build:cjs    # CommonJS only
npm run build:esm    # ES Modules only
npm run build:types  # TypeScript definitions only
```

### Testing

```bash
# Run type checking (current test suite)
npm test

# Future: Unit tests (coming soon)
npm run test:unit

# Future: Integration tests
npm run test:integration
```

### Code Style

We use TypeScript with strict mode enabled. Please ensure your code:

- Follows TypeScript best practices
- Uses meaningful variable and function names
- Includes JSDoc comments for public methods
- Handles errors appropriately
- Validates inputs for security

#### Naming Conventions

- **Files**: camelCase (e.g., `bullhornBridge.ts`)
- **Classes**: PascalCase (e.g., `BullhornBridge`)
- **Methods/Functions**: camelCase (e.g., `performRegistration()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
- **Interfaces**: PascalCase with 'I' prefix optional (e.g., `BullhornConfig`)

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependency changes
- `ci`: CI/CD configuration changes
- `chore`: Other changes that don't modify src or test files

#### Examples

```bash
feat(api): add candidate search method
fix(auth): handle token expiration correctly
docs(readme): update installation instructions
perf(http): implement response caching
```

## Pull Request Process

1. **Ensure your code builds**: Run `npm run build:simple`
2. **Test your changes**: Run `npm test`
3. **Update documentation**: If you've added functionality, update the README
4. **Update CHANGELOG.md**: Add your changes under "Unreleased"
5. **Submit PR**: Create a pull request against the `main` branch

### PR Guidelines

Your pull request should:

- Have a clear title and description
- Reference any related issues
- Include tests for new functionality (when test suite is available)
- Pass all CI checks
- Be reviewed by at least one maintainer

### PR Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests (if applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed my code
- [ ] Updated documentation
- [ ] No console.logs or debugging code
```

## Testing Guidelines

### Local Testing with Bullhorn

To test your changes with a real Bullhorn instance:

1. Build the package: `npm run build:simple`
2. Use npm link for local testing:
   ```bash
   npm link
   # In your test project
   npm link bullhorn-bridge
   ```
3. Configure your app in Bullhorn's Custom Menu/Tab settings
4. Use HTTPS (self-signed certificates work for localhost)
5. Ensure your app runs in an iframe context

### Security Testing

Before submitting, ensure:

- No credentials or tokens are logged
- Input validation prevents XSS attacks
- Origin validation is properly configured
- No sensitive data in error messages

## Reporting Issues

### Bug Reports

Please include:

- Bullhorn Bridge version
- Node.js version
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Error messages or console output
- Code samples (if applicable)

### Feature Requests

Please describe:

- The problem you're trying to solve
- Your proposed solution
- Alternative solutions you've considered
- Any breaking changes required

## Release Process

Releases are automated when the version in `package.json` is updated:

1. Update version: `npm version patch|minor|major`
2. Update CHANGELOG.md with release notes
3. Commit: `git commit -am "chore: release v1.0.0"`
4. Push to main: `git push origin main`
5. GitHub Actions automatically publishes to npm

### Version Guidelines

- **Patch** (1.0.x): Bug fixes, documentation updates
- **Minor** (1.x.0): New features, non-breaking changes
- **Major** (x.0.0): Breaking changes

## Architecture Decisions

### Key Principles

1. **Framework Agnostic**: Must work with any JavaScript framework
2. **Type Safety**: Full TypeScript support with strict mode
3. **Security First**: Validate all inputs, sanitize outputs
4. **Developer Experience**: Clear errors, intuitive API
5. **Performance**: Lazy loading, efficient messaging

### Future Improvements

Areas we're looking to improve:

- Comprehensive test suite
- Response caching layer
- Better error recovery
- Performance monitoring
- Plugin system for extensions

## Questions?

Feel free to:

- Open an issue for questions
- Start a discussion in GitHub Discussions
- Contact the maintainers

Thank you for contributing to Bullhorn Bridge!