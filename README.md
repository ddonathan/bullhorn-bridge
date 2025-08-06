<div align="center">
  <h1>🌉 Bullhorn Bridge</h1>
  <p><strong>Secure, framework-agnostic JavaScript client for Bullhorn ATS iframe integrations</strong></p>
  
  [![npm version](https://img.shields.io/npm/v/bullhorn-bridge.svg)](https://www.npmjs.com/package/bullhorn-bridge)
  [![npm downloads](https://img.shields.io/npm/dm/bullhorn-bridge.svg)](https://www.npmjs.com/package/bullhorn-bridge)
  [![Bundle Size](https://img.shields.io/bundlephobia/minzip/bullhorn-bridge)](https://bundlephobia.com/package/bullhorn-bridge)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  
  <p>Build powerful Bullhorn ATS integrations with any JavaScript framework - React, Vue, Angular, Next.js, or vanilla JS</p>
</div>

---

## ✨ Features

- 🚀 **Framework Agnostic** - Works seamlessly with React, Vue, Angular, Next.js, or vanilla JavaScript
- 🔒 **Enterprise Security** - Built-in XSS protection, origin validation, and secure credential handling
- 📦 **TypeScript First** - Full TypeScript support with comprehensive type definitions
- 🔄 **Resilient Connection** - Automatic retry logic with exponential backoff
- 🎯 **Developer Friendly** - Clean, promise-based API with intuitive method names
- ⚡ **Lightweight** - Minimal bundle size with tree-shaking support
- 🏗️ **Production Ready** - Battle-tested patterns based on Bullhorn's official integration guidelines
- 🛡️ **Secure by Default** - HTTPS-only, input validation, and sanitization built-in

## 📦 Installation

```bash
npm install bullhorn-bridge
# or
yarn add bullhorn-bridge
# or
pnpm add bullhorn-bridge
```

## 🚀 Quick Start

### Basic Usage (Vanilla JavaScript)

```javascript
import { BullhornBridge } from 'bullhorn-bridge';

// Initialize the bridge
const bridge = new BullhornBridge({
  debug: true, // Enable debug logging
  onReady: () => {
    console.log('Connected to Bullhorn!');
  },
  onError: (error) => {
    console.error('Connection failed:', error);
  }
});

// Register with Bullhorn parent frame
await bridge.register({
  title: 'My Integration',
  color: '#0070c0'
});

// Make API calls
const candidate = await bridge.getCandidate(123);
console.log(candidate);
```

### React Integration

```jsx
import React, { useEffect, useState } from 'react';
import { BullhornBridge } from 'bullhorn-bridge';

function BullhornIntegration() {
  const [bridge, setBridge] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    // Initialize bridge
    const bullhornBridge = new BullhornBridge({
      debug: true,
      onReady: () => setIsConnected(true),
      onError: (error) => console.error('Failed to connect:', error)
    });

    // Register with Bullhorn
    bullhornBridge.register({
      title: 'React Integration',
      color: '#61dafb'
    });

    setBridge(bullhornBridge);

    // Cleanup
    return () => {
      // Bridge will auto-cleanup
    };
  }, []);

  const loadCandidate = async () => {
    if (bridge && isConnected) {
      try {
        const data = await bridge.getCandidate(123, [
          'id', 'firstName', 'lastName', 'email'
        ]);
        setCandidate(data);
      } catch (error) {
        console.error('Failed to load candidate:', error);
      }
    }
  };

  return (
    <div>
      <h1>Bullhorn Integration</h1>
      <p>Status: {isConnected ? 'Connected' : 'Connecting...'}</p>
      {isConnected && (
        <button onClick={loadCandidate}>Load Candidate</button>
      )}
      {candidate && (
        <pre>{JSON.stringify(candidate, null, 2)}</pre>
      )}
    </div>
  );
}

export default BullhornIntegration;
```

### Vue 3 Integration

```vue
<template>
  <div>
    <h1>Bullhorn Integration</h1>
    <p>Status: {{ isConnected ? 'Connected' : 'Connecting...' }}</p>
    <button v-if="isConnected" @click="loadCandidate">
      Load Candidate
    </button>
    <pre v-if="candidate">{{ candidate }}</pre>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { BullhornBridge } from 'bullhorn-bridge';

const bridge = ref(null);
const isConnected = ref(false);
const candidate = ref(null);

onMounted(async () => {
  // Initialize bridge
  bridge.value = new BullhornBridge({
    debug: true,
    onReady: () => {
      isConnected.value = true;
    },
    onError: (error) => {
      console.error('Failed to connect:', error);
    }
  });

  // Register with Bullhorn
  await bridge.value.register({
    title: 'Vue Integration',
    color: '#4fc08d'
  });
});

const loadCandidate = async () => {
  try {
    const data = await bridge.value.getCandidate(123, [
      'id', 'firstName', 'lastName', 'email'
    ]);
    candidate.value = data;
  } catch (error) {
    console.error('Failed to load candidate:', error);
  }
};
</script>
```

### Angular Integration

```typescript
import { Component, OnInit } from '@angular/core';
import { BullhornBridge } from 'bullhorn-bridge';

@Component({
  selector: 'app-bullhorn-integration',
  template: `
    <div>
      <h1>Bullhorn Integration</h1>
      <p>Status: {{ isConnected ? 'Connected' : 'Connecting...' }}</p>
      <button *ngIf="isConnected" (click)="loadCandidate()">
        Load Candidate
      </button>
      <pre *ngIf="candidate">{{ candidate | json }}</pre>
    </div>
  `
})
export class BullhornIntegrationComponent implements OnInit {
  bridge: BullhornBridge | null = null;
  isConnected = false;
  candidate: any = null;

  ngOnInit() {
    this.initializeBridge();
  }

  async initializeBridge() {
    // Initialize bridge
    this.bridge = new BullhornBridge({
      debug: true,
      onReady: () => {
        this.isConnected = true;
      },
      onError: (error) => {
        console.error('Failed to connect:', error);
      }
    });

    // Register with Bullhorn
    await this.bridge.register({
      title: 'Angular Integration',
      color: '#dd0031'
    });
  }

  async loadCandidate() {
    if (this.bridge && this.isConnected) {
      try {
        this.candidate = await this.bridge.getCandidate(123, [
          'id', 'firstName', 'lastName', 'email'
        ]);
      } catch (error) {
        console.error('Failed to load candidate:', error);
      }
    }
  }
}
```

### Next.js Integration

```jsx
// pages/bullhorn-integration.js or app/bullhorn-integration/page.js
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const BullhornBridgeComponent = dynamic(
  () => import('../components/BullhornBridge'),
  { ssr: false }
);

export default function BullhornIntegrationPage() {
  return <BullhornBridgeComponent />;
}

// components/BullhornBridge.js
import { useEffect, useState } from 'react';
import { BullhornBridge } from 'bullhorn-bridge';

export default function BullhornBridgeComponent() {
  const [bridge, setBridge] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initBridge = async () => {
      const bullhornBridge = new BullhornBridge({
        debug: true,
        onReady: () => setIsConnected(true)
      });

      await bullhornBridge.register({
        title: 'Next.js Integration'
      });

      setBridge(bullhornBridge);
    };

    initBridge();
  }, []);

  // Rest of component...
}
```

## 📚 API Reference

### Constructor Options

```typescript
new BullhornBridge({
  debug?: boolean;        // Enable debug logging (default: false)
  onReady?: () => void;   // Callback when connected to Bullhorn
  onError?: (error: Error) => void; // Callback on connection error
})
```

### Methods

#### `register(config?: BullhornConfig): Promise<boolean>`

Register with the Bullhorn parent frame. Must be called before making API requests.

```typescript
await bridge.register({
  title: 'My App',      // Display title in Bullhorn
  color: '#0070c0',     // Theme color
  url: window.location.href // Optional custom URL
});
```

#### `httpGET<T>(relativeURL: string): Promise<HttpResponse<T>>`

Make a GET request through Bullhorn's parent frame.

```typescript
const response = await bridge.httpGET('/entity/Candidate/123');
console.log(response.data);
```

#### `httpPOST<T>(relativeURL: string, data: any): Promise<HttpResponse<T>>`

Make a POST request through Bullhorn's parent frame.

```typescript
const response = await bridge.httpPOST('/entity/Candidate/123', {
  firstName: 'John',
  lastName: 'Doe'
});
```

#### `httpPUT<T>(relativeURL: string, data: any): Promise<HttpResponse<T>>`

Make a PUT request through Bullhorn's parent frame.

```typescript
const response = await bridge.httpPUT('/entity/Note', {
  comments: 'Updated via API'
});
```

#### `httpDELETE<T>(relativeURL: string): Promise<HttpResponse<T>>`

Make a DELETE request through Bullhorn's parent frame.

```typescript
const response = await bridge.httpDELETE('/entity/Note/456');
```

#### `open(params: any): Promise<any>`

Open a Bullhorn window or modal.

```typescript
await bridge.open({
  type: 'fast-add',
  entityType: 'Candidate',
  data: { firstName: 'John' }
});
```

#### `openList(params: any): Promise<any>`

Open a Bullhorn list view.

```typescript
await bridge.openList({
  type: 'Candidate',
  criteria: { status: 'Active' }
});
```

#### `refresh(): Promise<any>`

Refresh the parent Bullhorn view.

```typescript
await bridge.refresh();
```

### Helper Methods

#### `getCandidate(id: number, fields?: string[]): Promise<any>`

Get a candidate by ID.

```typescript
const candidate = await bridge.getCandidate(123, [
  'id', 'firstName', 'lastName', 'email', 'phone'
]);
```

#### `searchCandidates(query: string, fields?: string[]): Promise<any>`

Search for candidates.

```typescript
const results = await bridge.searchCandidates('john', [
  'id', 'firstName', 'lastName'
]);
```

#### `getJobOrders(fields?: string[]): Promise<any>`

Get job orders.

```typescript
const jobs = await bridge.getJobOrders([
  'id', 'title', 'status', 'clientCorporation'
]);
```

#### `updateCandidate(id: number, data: any): Promise<any>`

Update a candidate.

```typescript
const result = await bridge.updateCandidate(123, {
  email: 'newemail@example.com'
});
```

#### `createNote(entityType: string, entityId: number, comments: string, action?: string): Promise<any>`

Create a note.

```typescript
const note = await bridge.createNote(
  'Candidate',
  123,
  'Called candidate',
  'Phone Call'
);
```

### Properties

#### `isReady(): boolean`

Check if the bridge is connected and ready.

```typescript
if (bridge.isReady()) {
  // Make API calls
}
```

#### `isInIframe(): boolean`

Check if running inside an iframe.

```typescript
if (bridge.isInIframe()) {
  // Running inside Bullhorn
}
```

#### `getCredentials(): BullhornCredentials`

Get extracted Bullhorn credentials from URL.

```typescript
const creds = bridge.getCredentials();
console.log(creds.corporationId);
console.log(creds.userId);
```

### Events

```typescript
// Listen for events
bridge.on('ready', () => {
  console.log('Bridge is ready');
});

bridge.on('error', (error) => {
  console.error('Bridge error:', error);
});

bridge.on('customEvent', (data) => {
  console.log('Custom event from Bullhorn:', data);
});

// Remove listener
bridge.off('ready', myHandler);
```

## 🧪 Testing in Bullhorn

1. Configure your application URL in Bullhorn's Custom Menu or Custom Tab settings
2. Your application must be served over HTTPS (use localhost with self-signed cert for development)
3. The bridge will automatically detect when running in Bullhorn's iframe
4. Check the browser console for debug messages if `debug: true` is set

## 🔗 URL Parameters

The bridge automatically extracts these parameters from the URL when running in Bullhorn:

- `corporationId` or `corp` - Corporation ID
- `privateLabelId` or `plid` - Private Label ID
- `userId` or `uid` - User ID
- `restUrl` - REST API URL
- `BhRestToken` or `restToken` - REST Token

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/ddonathan/bullhorn-bridge.git
cd bullhorn-bridge

# Install dependencies
npm install

# Build the library
npm run build

# Run tests (when available)
npm test
```

## 📄 License

MIT © [Dan Donathan](https://github.com/ddonathan)

See [LICENSE](LICENSE) file for details.

## 💬 Support

- 📧 **Email**: dan@donathan.com
- 🐛 **Issues**: [GitHub Issue Tracker](https://github.com/ddonathan/bullhorn-bridge/issues)
- 💡 **Discussions**: [GitHub Discussions](https://github.com/ddonathan/bullhorn-bridge/discussions)
- 📖 **Wiki**: [Documentation Wiki](https://github.com/ddonathan/bullhorn-bridge/wiki)

## 🙏 Acknowledgments

- Built on Bullhorn's official AppBridge patterns
- Powered by [post-robot](https://github.com/krakenjs/post-robot) for secure cross-origin communication
- Inspired by the Bullhorn developer community

## 🔒 Security

Security is a top priority. This library includes:

- **Input Validation**: All URL parameters and inputs are validated and sanitized
- **Origin Validation**: Restricts communication to trusted Bullhorn domains
- **XSS Protection**: Built-in sanitization for all data exchanges
- **HTTPS Enforcement**: Requires secure connections for all API calls
- **Token Security**: Secure handling of authentication tokens

For security issues, please email dan@donathan.com instead of using the issue tracker.

---

<div align="center">
  <p>Made with ❤️ for the Bullhorn developer community</p>
  <p>
    <a href="https://www.npmjs.com/package/bullhorn-bridge">NPM</a> •
    <a href="https://github.com/ddonathan/bullhorn-bridge">GitHub</a> •
    <a href="https://bullhorn.com">Bullhorn</a>
  </p>
</div>
