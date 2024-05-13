# ADR 003: Migrating to Firebase Modular SDK (v9+)

**Date**: September 4, 2026  
**Status**: Accepted  
**Author**: Mohammad Hossein Alikhani

## Context
The legacy codebase utilized the Firebase v8 (Namespaced) SDK. This older version is no longer the recommended approach, as it bundles large amounts of unused code and is incompatible with modern tree-shaking algorithms, leading to bloated production builds.

## Decision
We will fully migrate to the **Firebase v9+ Modular SDK**.

## Rationale
1. **Tree-Shaking**: The modular architecture allows bundlers to include only the exact functions and services that are imported, potentially reducing the Firebase bundle size by up to 80%.
2. **Enhanced TypeScript Support**: The modular SDK was built with TypeScript in mind, offering superior type inference and a more robust developer experience.
3. **Future-Proofing**: This is the current, actively maintained standard endorsed by Google, ensuring long-term support and access to new features.

## Consequences
- **Positive**: Significantly reduced application bundle size, improved load times, and a more modular, testable codebase.
- **Negative**: Requires a one-time, comprehensive refactoring of all existing Firebase service calls, which is accounted for in the migration phase.