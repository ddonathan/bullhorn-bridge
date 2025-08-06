# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bullhorn Bridge is a universal JavaScript/TypeScript client library for building Bullhorn ATS iframe integrations. It provides a framework-agnostic interface that works with React, Vue, Angular, Next.js, and vanilla JavaScript applications.

## Key Architecture

### Core Communication Layer
The library uses `post-robot` for secure cross-origin messaging between the iframe application and the Bullhorn parent frame. All API calls are proxied through the parent frame using post-robot's message passing system.

### Registration Flow
1. Applications must call `register()` before making API calls
2. Registration includes automatic retry logic (4 attempts with exponential backoff)
3. The bridge automatically detects iframe context and extracts credentials from URL parameters
4. Registration establishes the post-robot communication channel with the parent frame

### Event System
- Uses an internal event emitter pattern for lifecycle events (`ready`, `error`, `customEvent`, `update`)
- Supports both callback-style (`onReady`, `onError`) and event-listener patterns
- Events are bridged from Bullhorn parent frame through post-robot

## Development Commands

```bash
# Install dependencies
npm install

# Build the library (creates CommonJS, ESM, and TypeScript definitions)
npm run build:simple

# Build individual targets
npm run build:cjs    # CommonJS build
npm run build:esm    # ES Module build  
npm run build:types  # TypeScript definitions only

# Prepare for publishing (runs build:simple)
npm run prepublishOnly
```

## Build System

The project uses a custom Node.js build script (`build.js`) that:
1. Compiles TypeScript to both CommonJS and ESM formats
2. Generates TypeScript declaration files
3. Creates appropriate package.json for ESM subdirectory
4. Copies the ESM build as `.mjs` file for dual package support

Output structure:
- `dist/index.js` - CommonJS entry point
- `dist/index.mjs` - ESM entry point
- `dist/index.d.ts` - TypeScript definitions
- `dist/esm/` - Full ESM build directory

## API Design Patterns

### Method Categories

1. **Core Methods**: `register()`, `isReady()`, `isInIframe()`, `getCredentials()`
2. **HTTP Methods**: `httpGET()`, `httpPOST()`, `httpPUT()`, `httpDELETE()` - All proxied through parent frame
3. **UI Methods**: `open()`, `openList()`, `refresh()` - Control Bullhorn UI elements
4. **Helper Methods**: High-level wrappers like `getCandidate()`, `searchCandidates()`, `updateCandidate()`

### Error Handling

- All async methods throw errors that should be caught by the consuming application
- Registration failures trigger both the `onError` callback and throw after max retries
- Debug mode (`debug: true`) enables detailed console logging for troubleshooting

## Testing Considerations

When testing integrations:
1. Must run in HTTPS context (use self-signed certificates for localhost development)
2. Application must be configured in Bullhorn's Custom Menu or Custom Tab settings
3. The bridge automatically detects iframe context - will skip registration if not in iframe
4. URL parameters are automatically extracted for credentials (corporationId, userId, restToken, etc.)

## TypeScript Support

The library is written in TypeScript with strict mode enabled. Key interfaces:
- `BullhornConfig` - Registration configuration
- `BullhornCredentials` - Extracted URL credentials
- `HttpResponse<T>` - Generic response wrapper for API calls

## Browser Compatibility

Minimum browser versions:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

The library uses modern JavaScript features (ES2020) and requires browsers that support dynamic imports for the post-robot dependency.