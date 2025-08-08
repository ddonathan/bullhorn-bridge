# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6] - 2025-08-08

### Added
- Comprehensive test suite with Jest
  - 41 unit tests covering all major functionality
  - 73% code coverage
  - Test scripts for watch mode, coverage, and CI
- GitHub Actions CI/CD workflows
  - `auto-publish.yml` - Automatic npm publishing on version changes
  - `ci.yml` - Comprehensive CI pipeline with security audits and bundle analysis
  - Enhanced `release-publish.yml` with dry-run support
- CONTRIBUTING.md with development guidelines
- Jest configuration with TypeScript support

### Changed
- Enhanced XSS protection with comprehensive HTML entity encoding
  - Added `htmlEncode()` method for consistent sanitization
  - Improved sanitization for nested objects and arrays
  - Unified XSS prevention across all user inputs

### Fixed
- Consistent XSS sanitization across credential extraction and event handling
- Input validation for all URL parameters and tokens

### Security
- Comprehensive HTML entity encoding for XSS prevention
- Enhanced input validation for URLs and tokens
- Improved sanitization for event data

## [1.0.5] - 2025-08-08

### Changed
- Version bump for npm publishing

## [1.0.4] - 2025-08-08

### Changed
- CI/CD improvements and version management

## [1.0.3] - 2025-08-08

### Changed
- CI/CD pipeline enhancements

## [1.0.2] - 2025-08-08

### Fixed
- Package.json description improvements

## [1.0.1] - 2024-01-06

### Fixed
- Corrected repository URL format in package.json to include `git+` prefix per npm requirements

## [1.0.0] - 2024-01-06

### Added
- Initial release of bullhorn-bridge
- Universal JavaScript client for Bullhorn ATS iframe integrations
- Framework-agnostic support (React, Vue, Angular, Next.js, vanilla JS)
- TypeScript support with full type definitions
- Secure cross-origin communication via post-robot
- Built-in XSS protection and input validation
- Automatic retry logic with exponential backoff
- Promise-based API with helper methods
- CommonJS and ESM module support
- Comprehensive documentation with framework-specific examples

[1.0.6]: https://github.com/ddonathan/bullhorn-bridge/releases/tag/v1.0.6
[1.0.5]: https://github.com/ddonathan/bullhorn-bridge/releases/tag/v1.0.5
[1.0.4]: https://github.com/ddonathan/bullhorn-bridge/releases/tag/v1.0.4
[1.0.3]: https://github.com/ddonathan/bullhorn-bridge/releases/tag/v1.0.3
[1.0.2]: https://github.com/ddonathan/bullhorn-bridge/releases/tag/v1.0.2
[1.0.1]: https://github.com/ddonathan/bullhorn-bridge/releases/tag/v1.0.1
[1.0.0]: https://github.com/ddonathan/bullhorn-bridge/releases/tag/v1.0.0