#!/usr/bin/env node

/**
 * Simple build script for creating both CommonJS and ESM builds
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Building Bullhorn Bridge Client...\n');

// Clean dist directory
console.log('Cleaning dist directory...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.mkdirSync('dist');

// Build CommonJS
console.log('Building CommonJS...');
execSync('npx tsc --module commonjs --outDir dist', { stdio: 'inherit' });

// Build ESM
console.log('Building ESM...');
execSync('npx tsc --module esnext --outDir dist/esm', { stdio: 'inherit' });

// Create package.json for ESM subdirectory
const esmPackageJson = {
  type: 'module'
};
fs.writeFileSync('dist/esm/package.json', JSON.stringify(esmPackageJson, null, 2));

// Copy ESM index to root as .mjs
fs.copyFileSync('dist/esm/index.js', 'dist/index.mjs');

// Copy README to dist
if (fs.existsSync('README.md')) {
  fs.copyFileSync('README.md', 'dist/README.md');
}

console.log('\n✨ Build complete!');
console.log('📦 Output: dist/');
console.log('   - index.js (CommonJS)');
console.log('   - index.mjs (ESM)');
console.log('   - index.d.ts (TypeScript definitions)');
console.log('   - esm/ (ESM modules)');