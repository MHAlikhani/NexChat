# ADR 001: Adopting Vite over Create React App

**Date**: September 4, 2026  
**Status**: Accepted  
**Author**: Mohammad Hossein Alikhani

## Context
The previous iteration of the project relied on `create-react-app` (CRA) and `react-scripts`. CRA has effectively been abandoned by the community, suffers from slow development server startup times, and offers very limited flexibility for customizing the underlying Webpack configuration.

## Decision
We will use **Vite** as the primary build tool and development server for the project.

## Rationale
1. **Development Speed**: Vite leverages native ES Modules in the browser, delivering near-instantaneous Hot Module Replacement (HMR), regardless of project size.
2. **First-Class TypeScript Support**: Vite handles TypeScript natively without requiring Babel transpilation, streamlining the development workflow.
3. **Optimized Production Builds**: Vite uses Rollup under the hood for production builds, providing superior tree-shaking and smaller bundle sizes compared to traditional Webpack setups.
4. **Simplicity**: The `vite.config.ts` file is highly readable, intuitive, and easily extensible via a rich plugin ecosystem.

## Consequences
- **Positive**: Dramatically improved developer experience (DX), faster CI/CD pipelines, and reduced production bundle sizes.
- **Negative**: Minor initial learning curve for Vite-specific configurations, and the need to replace a few legacy CRA-specific plugins with their Vite equivalents.